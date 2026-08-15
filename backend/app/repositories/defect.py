from datetime import datetime, timedelta
from sqlalchemy import select, func, cast, Date
from sqlalchemy.orm import Session
from app.models.defect import Defect, DefectStatus, DefectSeverity, DefectType
from app.schemas.defect import DefectCreate, DefectUpdate

class DefectRepository:
    def create(self, db: Session, obj_in: DefectCreate) -> Defect:
        db_obj = Defect(
            type=obj_in.type,
            status=obj_in.status,
            severity=obj_in.severity,
            latitude=obj_in.latitude,
            longitude=obj_in.longitude,
            address=obj_in.address,
            confidence=obj_in.confidence,
            image_url=obj_in.image_url
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_id(self, db: Session, id: int) -> Defect | None:
        stmt = select(Defect).where(Defect.id == id)
        return db.execute(stmt).scalars().first()

    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        type: DefectType | None = None,
        status: DefectStatus | None = None,
        severity: DefectSeverity | None = None
    ) -> list[Defect]:
        stmt = select(Defect)
        if type:
            stmt = stmt.where(Defect.type == type)
        if status:
            stmt = stmt.where(Defect.status == status)
        if severity:
            stmt = stmt.where(Defect.severity == severity)
            
        stmt = stmt.order_by(Defect.id.desc()).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())
    def get_all_for_map(self, db: Session) -> list[Defect]:
        stmt = select(Defect)
        return list(db.execute(stmt).scalars().all())
    def update_defect(self, db: Session, db_obj: Defect, obj_in: DefectUpdate) -> Defect:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_analytics_summary(self, db: Session) -> dict:
        total_stmt = select(func.count(Defect.id))
        total_defects = db.execute(total_stmt).scalar() or 0

        critical_stmt = select(func.count(Defect.id)).where(Defect.severity == DefectSeverity.CRITICAL)
        critical_defects = db.execute(critical_stmt).scalar() or 0

        fixed_stmt = select(func.count(Defect.id)).where(Defect.status == DefectStatus.FIXED)
        fixed_defects = db.execute(fixed_stmt).scalar() or 0

        in_progress_stmt = select(func.count(Defect.id)).where(Defect.status == DefectStatus.IN_PROGRESS)
        in_progress_defects = db.execute(in_progress_stmt).scalar() or 0

        return {
            "total_defects": total_defects,
            "critical_defects": critical_defects,
            "fixed_defects": fixed_defects,
            "in_progress_defects": in_progress_defects
        }

    def get_daily_statistics(self, db: Session, days: int = 7) -> list[dict]:
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).date()
        date_expr = cast(Defect.created_at, Date)
        
        stmt = (
            select(date_expr.label("date"), func.count(Defect.id).label("count"))
            .where(date_expr >= cutoff_date)
            .group_by(date_expr)
            .order_by(date_expr.asc())
        )
        
        results = db.execute(stmt).all()
        return [{"date": row.date, "count": row.count} for row in results]
