import math
import os
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.defect import AnalysisStatus, Defect, DefectSeverity, DefectStatus, PriorityLevel, VerificationStatus
from app.models.user import User, UserRole
from app.repositories.defect import DefectRepository
from app.schemas.defect import AnalysisRequest, DefectCreate, DefectUpdate
from app.services.ai import DetectionService, PendingDetectionService, PendingVerificationService, VerificationService


class DefectService:
    transitions = {
        DefectStatus.SUBMITTED: {DefectStatus.DETECTED, DefectStatus.REJECTED},
        DefectStatus.DETECTED: {DefectStatus.IN_PROGRESS, DefectStatus.REJECTED},
        DefectStatus.IN_PROGRESS: {DefectStatus.FIXED},
        DefectStatus.FIXED: {DefectStatus.VERIFIED, DefectStatus.IN_PROGRESS},
        DefectStatus.VERIFIED: set(),
        DefectStatus.REJECTED: set(),
    }

    def __init__(
        self,
        repository: DefectRepository,
        detection_service: DetectionService | None = None,
        verification_service: VerificationService | None = None,
    ) -> None:
        self.repository = repository
        self.detection_service = detection_service or PendingDetectionService()
        self.verification_service = verification_service or PendingVerificationService()
        self.upload_dir = "uploads"

    def save_image(self, file_content: bytes, filename: str) -> str:
        extension = os.path.splitext(filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{extension}"
        os.makedirs(self.upload_dir, exist_ok=True)
        file_path = os.path.join(self.upload_dir, unique_filename)
        with open(file_path, "wb") as image_file:
            image_file.write(file_content)
        return f"/uploads/{unique_filename}"

    def create_report(
        self,
        db: Session,
        file_content: bytes,
        filename: str,
        latitude: float,
        longitude: float,
        address: str | None,
        owner_id: int,
    ) -> Defect:
        image_url = self.save_image(file_content, filename)
        analysis = self.detection_service.analyze(file_content)
        candidates = self.repository.find_duplicate_candidates(
            db,
            latitude,
            longitude,
            analysis.defect_type if analysis else None,
        )
        duplicate = next((candidate for candidate in candidates if self.distance_meters(latitude, longitude, candidate.latitude, candidate.longitude) <= 25), None)
        if duplicate is not None:
            self.repository.add_report(db, duplicate.id, owner_id, image_url, latitude, longitude)
            duplicate.confirmation_count += 1
            self.apply_priority(duplicate)
            self.repository.add_event(db, duplicate.id, owner_id, "report_confirmed", {"confirmation_count": duplicate.confirmation_count})
            db.commit()
            db.refresh(duplicate)
            return duplicate

        defect = self.repository.create(
            db,
            DefectCreate(
                type=analysis.defect_type if analysis and analysis.detected else None,
                status=DefectStatus.DETECTED if analysis and analysis.detected else DefectStatus.SUBMITTED,
                severity=analysis.severity if analysis and analysis.detected else None,
                latitude=latitude,
                longitude=longitude,
                address=address,
                confidence=analysis.confidence if analysis else None,
                image_url=image_url,
                owner_id=owner_id,
            ),
        )
        defect.analysis_status = AnalysisStatus.COMPLETED if analysis else AnalysisStatus.PENDING
        self.apply_priority(defect)
        self.repository.add_report(db, defect.id, owner_id, image_url, latitude, longitude)
        self.repository.add_event(db, defect.id, owner_id, "submitted")
        if analysis and analysis.detected:
            self.repository.add_event(db, defect.id, None, "detected", {"confidence": analysis.confidence})
        db.commit()
        db.refresh(defect)
        return defect

    def apply_analysis(self, db: Session, defect: Defect, analysis: AnalysisRequest, actor_id: int) -> Defect:
        if analysis.detected and analysis.defect_type is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Detected defects require a defect type")
        defect.type = analysis.defect_type if analysis.detected else None
        defect.confidence = analysis.confidence
        defect.severity = analysis.severity if analysis.detected else None
        defect.analysis_status = AnalysisStatus.COMPLETED
        target_status = DefectStatus.DETECTED if analysis.detected else DefectStatus.REJECTED
        self.transition(defect, target_status)
        self.apply_priority(defect)
        self.repository.add_event(db, defect.id, actor_id, "analysis_completed", {"detected": analysis.detected, "confidence": analysis.confidence})
        db.commit()
        db.refresh(defect)
        return defect

    def update(self, db: Session, defect: Defect, update: DefectUpdate, actor: User) -> Defect:
        data = update.model_dump(exclude_unset=True)
        requested_status = data.pop("status", None)
        if actor.role == UserRole.road_service and any(field in data for field in ("type", "severity", "confidence", "latitude", "longitude")):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Road Service can only update workflow fields")
        if requested_status is not None:
            if requested_status == DefectStatus.VERIFIED and actor.role != UserRole.admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can verify repairs")
            self.transition(defect, requested_status)
            self.repository.add_event(db, defect.id, actor.id, requested_status.value)
        for field, value in data.items():
            setattr(defect, field, value)
        self.apply_priority(defect)
        db.commit()
        db.refresh(defect)
        return defect

    def assign(self, db: Session, defect: Defect, assignee: User, actor_id: int) -> Defect:
        if assignee.role != UserRole.road_service or not assignee.is_active:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Assignee must be an active Road Service user")
        defect.assigned_to_id = assignee.id
        defect.assigned_at = datetime.now(timezone.utc)
        self.repository.add_event(db, defect.id, actor_id, "assigned", {"road_service_user_id": assignee.id})
        db.commit()
        db.refresh(defect)
        return defect

    def upload_after_image(self, db: Session, defect: Defect, content: bytes, filename: str, actor_id: int) -> Defect:
        if defect.status != DefectStatus.FIXED:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="After image can only be uploaded for a fixed defect")
        defect.after_image_url = self.save_image(content, filename)
        result = self.verification_service.verify(defect.image_url, content)
        if result is None or result.confidence is None or result.confidence < 0.8:
            defect.verification_status = VerificationStatus.MANUAL_REVIEW
        else:
            defect.verification_status = result.status
        defect.verification_confidence = result.confidence if result else None
        self.repository.add_event(db, defect.id, actor_id, "verification_requested", {"status": defect.verification_status.value})
        db.commit()
        db.refresh(defect)
        return defect

    def transition(self, defect: Defect, target: DefectStatus) -> None:
        if target == defect.status:
            return
        if target not in self.transitions[defect.status]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Transition from {defect.status.value} to {target.value} is not allowed")
        defect.status = target

    def apply_priority(self, defect: Defect) -> None:
        reasons: list[str] = []
        level = PriorityLevel.LOW
        severity_levels = {
            DefectSeverity.LOW: PriorityLevel.LOW,
            DefectSeverity.MEDIUM: PriorityLevel.MEDIUM,
            DefectSeverity.HIGH: PriorityLevel.HIGH,
            DefectSeverity.CRITICAL: PriorityLevel.CRITICAL,
        }
        if defect.severity is not None:
            level = severity_levels[defect.severity]
            reasons.append(f"Severity is {defect.severity.value}")
        if defect.confirmation_count >= 10:
            level = PriorityLevel.CRITICAL if level == PriorityLevel.HIGH else max(level, PriorityLevel.HIGH, key=self.priority_rank)
            reasons.append(f"{defect.confirmation_count} resident confirmations")
        elif defect.confirmation_count >= 3:
            level = max(level, PriorityLevel.MEDIUM, key=self.priority_rank)
            reasons.append(f"{defect.confirmation_count} resident confirmations")
        if defect.status in (DefectStatus.FIXED, DefectStatus.VERIFIED, DefectStatus.REJECTED):
            reasons.append(f"Lifecycle status is {defect.status.value}")
        defect.priority = level
        defect.priority_reasons = reasons or ["Awaiting AI assessment"]

    @staticmethod
    def priority_rank(level: PriorityLevel) -> int:
        return {PriorityLevel.LOW: 1, PriorityLevel.MEDIUM: 2, PriorityLevel.HIGH: 3, PriorityLevel.CRITICAL: 4}[level]

    @staticmethod
    def distance_meters(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float) -> float:
        radius = 6_371_000
        latitude_delta = math.radians(latitude_b - latitude_a)
        longitude_delta = math.radians(longitude_b - longitude_a)
        value = math.sin(latitude_delta / 2) ** 2 + math.cos(math.radians(latitude_a)) * math.cos(math.radians(latitude_b)) * math.sin(longitude_delta / 2) ** 2
        return 2 * radius * math.atan2(math.sqrt(value), math.sqrt(1 - value))
