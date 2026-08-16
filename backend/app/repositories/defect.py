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
        severity: DefectSeverity | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None
    ) -> list[Defect]:
        stmt = select(Defect)
        if type:
            stmt = stmt.where(Defect.type == type)
        if status:
            stmt = stmt.where(Defect.status == status)
        if severity:
            stmt = stmt.where(Defect.severity == severity)
        if start_date:
            stmt = stmt.where(Defect.created_at >= start_date)
        if end_date:
            stmt = stmt.where(Defect.created_at <= end_date)
            
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

    def get_analytics_summary(self, db: Session, start_date: datetime | None = None, end_date: datetime | None = None) -> dict:
        total_stmt = select(func.count(Defect.id))
        critical_stmt = select(func.count(Defect.id)).where(Defect.severity == DefectSeverity.CRITICAL)
        fixed_stmt = select(func.count(Defect.id)).where(Defect.status == DefectStatus.FIXED)
        in_progress_stmt = select(func.count(Defect.id)).where(Defect.status == DefectStatus.IN_PROGRESS)

        if start_date:
            total_stmt = total_stmt.where(Defect.created_at >= start_date)
            critical_stmt = critical_stmt.where(Defect.created_at >= start_date)
            fixed_stmt = fixed_stmt.where(Defect.created_at >= start_date)
            in_progress_stmt = in_progress_stmt.where(Defect.created_at >= start_date)
            
        if end_date:
            total_stmt = total_stmt.where(Defect.created_at <= end_date)
            critical_stmt = critical_stmt.where(Defect.created_at <= end_date)
            fixed_stmt = fixed_stmt.where(Defect.created_at <= end_date)
            in_progress_stmt = in_progress_stmt.where(Defect.created_at <= end_date)

        total_defects = db.execute(total_stmt).scalar() or 0
        critical_defects = db.execute(critical_stmt).scalar() or 0
        fixed_defects = db.execute(fixed_stmt).scalar() or 0
        in_progress_defects = db.execute(in_progress_stmt).scalar() or 0

        return {
            "total_defects": total_defects,
            "critical_defects": critical_defects,
            "fixed_defects": fixed_defects,
            "in_progress_defects": in_progress_defects
        }

    def get_daily_statistics(self, db: Session, days: int = 7, start_date: datetime | None = None, end_date: datetime | None = None) -> list[dict]:
        if start_date:
            cutoff_date = start_date.date()
        else:
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).date()
            
        date_expr = cast(Defect.created_at, Date)
        
        stmt = (
            select(date_expr.label("date"), func.count(Defect.id).label("count"))
            .where(date_expr >= cutoff_date)
        )
        if end_date:
            stmt = stmt.where(date_expr <= end_date.date())
            
        stmt = stmt.group_by(date_expr).order_by(date_expr.asc())
        
        results = db.execute(stmt).all()
        return [{"date": row.date, "count": row.count} for row in results]
