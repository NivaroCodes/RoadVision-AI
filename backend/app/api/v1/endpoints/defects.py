from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_admin, require_staff, require_submitter
from app.core.db import get_db
from app.models.defect import Defect, DefectEvent, DefectSeverity, DefectStatus, DefectType
from app.models.user import User, UserRole
from app.repositories.defect import DefectRepository
from app.schemas.defect import AnalysisRequest, AssignmentRequest, DefectEventRead, DefectMapRead, DefectRead, DefectUpdate, VerificationRead
from app.services.defect import DefectService
from app.services.ai import RemoteDetectionService
from app.services.priority import RemotePriorityEngine
from app.services.websocket import manager

router = APIRouter()
repository = DefectRepository()
service = DefectService(
    repository, 
    detection_service=RemoteDetectionService(),
    priority_engine=RemotePriorityEngine()
)
max_file_size = 10 * 1024 * 1024
allowed_content_types = {"image/jpeg", "image/png", "image/jpg"}


def get_defect_or_404(db: Session, defect_id: int) -> Defect:
    defect = repository.get_by_id(db, defect_id)
    if defect is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defect not found")
    return defect


async def read_image(image: UploadFile) -> bytes:
    if image.content_type not in allowed_content_types:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only JPG, JPEG, and PNG images are allowed")
    content = await image.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty files are not allowed")
    if len(content) > max_file_size:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Maximum image size is 10 MB")
    return content


async def broadcast(event: str, defect_id: int) -> None:
    await manager.broadcast({"event": event, "entity": "defect", "id": defect_id, "timestamp": datetime.now(timezone.utc).isoformat()})


@router.post("/upload", response_model=DefectRead)
async def upload_defect(
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    address: str | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_submitter),
) -> Defect:
    content = await read_image(image)
    defect = service.create_report(db, content, image.filename or "report.jpg", latitude, longitude, address, current_user.id)
    await broadcast("DEFECT_CREATED", defect.id)
    return defect


@router.get("/", response_model=list[DefectRead])
def get_defects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    type: DefectType | None = None,
    status_filter: DefectStatus | None = Query(None, alias="status"),
    severity: DefectSeverity | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
) -> list[Defect]:
    return repository.get_multi(db, skip, limit, type, status_filter, severity, start_date, end_date)


@router.get("/map", response_model=list[DefectMapRead])
def get_map_defects(
    start_date: datetime | None = Query(None, description="Filter by start date"),
    end_date: datetime | None = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_staff)
) -> list[Defect]:
    return repository.get_all_for_map(db, start_date=start_date, end_date=end_date)


@router.get("/mine", response_model=list[DefectRead])
def get_my_defects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[Defect]:
    return repository.get_by_owner(db, current_user.id)


@router.get("/priority", response_model=list[DefectRead])
def get_priority_defects(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
) -> list[Defect]:
    return repository.get_priority_list(db, limit)


@router.get("/{defect_id}", response_model=DefectRead)
def get_defect(defect_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Defect:
    defect = get_defect_or_404(db, defect_id)
    if current_user.role == UserRole.resident and not repository.resident_has_report(db, defect.id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return defect


@router.get("/{defect_id}/events", response_model=list[DefectEventRead])
def get_defect_events(defect_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[DefectEvent]:
    get_defect(defect_id, db, current_user)
    return repository.get_events(db, defect_id)


@router.patch("/{defect_id}", response_model=DefectRead)
async def update_defect(
    defect_id: int,
    defect_in: DefectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
) -> Defect:
    defect = service.update(db, get_defect_or_404(db, defect_id), defect_in, current_user)
    await broadcast("DEFECT_UPDATED", defect.id)
    return defect


@router.post("/{defect_id}/analysis", response_model=DefectRead)
def submit_analysis(
    defect_id: int,
    analysis: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Defect:
    return service.apply_analysis(db, get_defect_or_404(db, defect_id), analysis, current_user.id)


@router.post("/{defect_id}/assign", response_model=DefectRead)
def assign_defect(
    defect_id: int,
    assignment: AssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
) -> Defect:
    assignee = db.get(User, assignment.road_service_user_id)
    if assignee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignee not found")
    if current_user.role == UserRole.road_service and assignee.id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Road Service users can only assign defects to themselves")
    return service.assign(db, get_defect_or_404(db, defect_id), assignee, current_user.id)


@router.post("/{defect_id}/after-image", response_model=VerificationRead)
async def upload_after_image(
    defect_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
) -> VerificationRead:
    content = await read_image(image)
    defect = get_defect_or_404(db, defect_id)
    if current_user.role == UserRole.road_service and defect.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Road Service can only repair assigned defects")
    updated = service.upload_after_image(db, defect, content, image.filename or "after.jpg", current_user.id)
    return VerificationRead(defect_id=updated.id, status=updated.verification_status, confidence=updated.verification_confidence, after_image_url=updated.after_image_url or "")
