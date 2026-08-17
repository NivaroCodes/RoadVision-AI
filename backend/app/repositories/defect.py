from datetime import datetime, timedelta, timezone

from sqlalchemy import Date, case, cast, func, select
from sqlalchemy.orm import Session

from app.models.defect import Defect, DefectEvent, DefectReport, DefectSeverity, DefectStatus, DefectType
from app.schemas.defect import DefectCreate, DefectUpdate


class DefectRepository:
    def create(self, db: Session, obj_in: DefectCreate) -> Defect:
        defect = Defect(**obj_in.model_dump())
        db.add(defect)
        db.flush()
        return defect

    def get_by_id(self, db: Session, defect_id: int) -> Defect | None:
        return db.execute(select(Defect).where(Defect.id == defect_id)).scalars().first()

    def get_by_owner(self, db: Session, owner_id: int) -> list[Defect]:
        statement = (
            select(Defect)
            .join(DefectReport, DefectReport.defect_id == Defect.id)
            .where(DefectReport.resident_id == owner_id)
            .distinct()
            .order_by(Defect.id.desc())
        )
        return list(db.execute(statement).scalars().all())

    def resident_has_report(self, db: Session, defect_id: int, resident_id: int) -> bool:
        statement = select(DefectReport.id).where(
            DefectReport.defect_id == defect_id,
            DefectReport.resident_id == resident_id,
        )
        return db.execute(statement).first() is not None

    def add_report(self, db: Session, defect_id: int, resident_id: int, image_url: str, latitude: float, longitude: float) -> DefectReport:
        report = DefectReport(defect_id=defect_id, resident_id=resident_id, image_url=image_url, latitude=latitude, longitude=longitude)
        db.add(report)
        db.flush()
        return report

    def add_event(self, db: Session, defect_id: int, actor_id: int | None, event_type: str, details: dict[str, str | int | float | bool | None] | None = None) -> DefectEvent:
        event = DefectEvent(defect_id=defect_id, actor_id=actor_id, event_type=event_type, details=details or {})
        db.add(event)
        db.flush()
        return event

    def get_events(self, db: Session, defect_id: int) -> list[DefectEvent]:
        statement = select(DefectEvent).where(DefectEvent.defect_id == defect_id).order_by(DefectEvent.created_at.asc())
        return list(db.execute(statement).scalars().all())

    def find_duplicate_candidates(self, db: Session, latitude: float, longitude: float, defect_type: DefectType | None, days: int = 7) -> list[Defect]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        latitude_delta = 0.0002
        longitude_delta = 0.0003
        statement = select(Defect).where(
            Defect.created_at >= cutoff,
            Defect.latitude.between(latitude - latitude_delta, latitude + latitude_delta),
            Defect.longitude.between(longitude - longitude_delta, longitude + longitude_delta),
            Defect.status.not_in([DefectStatus.FIXED, DefectStatus.VERIFIED, DefectStatus.REJECTED]),
        )
        if defect_type is not None:
            statement = statement.where((Defect.type == defect_type) | (Defect.type.is_(None)))
        return list(db.execute(statement.order_by(Defect.id.desc())).scalars().all())

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        type: DefectType | None = None,
        status: DefectStatus | None = None,
        severity: DefectSeverity | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[Defect]:
        statement = select(Defect)
        if type is not None:
            statement = statement.where(Defect.type == type)
        if status is not None:
            statement = statement.where(Defect.status == status)
        if severity is not None:
            statement = statement.where(Defect.severity == severity)
        if start_date is not None:
            statement = statement.where(Defect.created_at >= start_date)
        if end_date is not None:
            statement = statement.where(Defect.created_at <= end_date)
        statement = statement.order_by(Defect.id.desc()).offset(skip).limit(limit)
        return list(db.execute(statement).scalars().all())

    def get_priority_list(self, db: Session, limit: int) -> list[Defect]:
        priority_order = case(
            (Defect.priority == "critical", 4),
            (Defect.priority == "high", 3),
            (Defect.priority == "medium", 2),
            else_=1,
        )
        statement = select(Defect).where(Defect.status.not_in([DefectStatus.FIXED, DefectStatus.VERIFIED, DefectStatus.REJECTED])).order_by(priority_order.desc(), Defect.confirmation_count.desc(), Defect.created_at.asc()).limit(limit)
        return list(db.execute(statement).scalars().all())

    def get_all_for_map(self, db: Session) -> list[Defect]:
        return list(db.execute(select(Defect)).scalars().all())

    def update_defect(self, db: Session, defect: Defect, obj_in: DefectUpdate) -> Defect:
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(defect, field, value)
        db.add(defect)
        db.flush()
        return defect

    def get_analytics_summary(self, db: Session, start_date: datetime | None = None, end_date: datetime | None = None) -> dict[str, int]:
        statements = {
            "total_defects": select(func.count(Defect.id)),
            "critical_defects": select(func.count(Defect.id)).where(Defect.severity == DefectSeverity.CRITICAL),
            "fixed_defects": select(func.count(Defect.id)).where(Defect.status.in_([DefectStatus.FIXED, DefectStatus.VERIFIED])),
            "in_progress_defects": select(func.count(Defect.id)).where(Defect.status == DefectStatus.IN_PROGRESS),
        }
        result: dict[str, int] = {}
        for name, statement in statements.items():
            if start_date is not None:
                statement = statement.where(Defect.created_at >= start_date)
            if end_date is not None:
                statement = statement.where(Defect.created_at <= end_date)
            result[name] = db.execute(statement).scalar() or 0
        return result

    def get_daily_statistics(self, db: Session, days: int = 7, start_date: datetime | None = None, end_date: datetime | None = None) -> list[dict[str, object]]:
        cutoff_date = start_date.date() if start_date else (datetime.now(timezone.utc) - timedelta(days=days)).date()
        date_expression = cast(Defect.created_at, Date)
        statement = select(date_expression.label("date"), func.count(Defect.id).label("count")).where(date_expression >= cutoff_date)
        if end_date is not None:
            statement = statement.where(date_expression <= end_date.date())
        rows = db.execute(statement.group_by(date_expression).order_by(date_expression.asc())).all()
        return [{"date": row.date, "count": row.count} for row in rows]
