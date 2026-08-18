from datetime import datetime, time, timedelta, timezone

from sqlalchemy import Date, case, cast, exists, func, select
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
            .where(
                exists().where(
                    DefectReport.defect_id == Defect.id,
                    DefectReport.resident_id == owner_id,
                )
            )
            .order_by(Defect.id.desc())
        )
        return list(db.execute(statement).scalars().all())

    @staticmethod
    def _apply_created_at_range(statement, start_date: datetime | None, end_date: datetime | None):
        if start_date is not None:
            statement = statement.where(Defect.created_at >= start_date)
        if end_date is not None:
            if end_date.time() == time.min:
                statement = statement.where(Defect.created_at < end_date + timedelta(days=1))
            else:
                statement = statement.where(Defect.created_at <= end_date)
        return statement

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
        statement = (
            select(Defect)
            .where(
                Defect.created_at >= cutoff,
                Defect.latitude.between(latitude - latitude_delta, latitude + latitude_delta),
                Defect.longitude.between(longitude - longitude_delta, longitude + longitude_delta),
            )
            .order_by(Defect.created_at.desc())
        )
        candidates = list(db.execute(statement).scalars().all())
        if defect_type is None:
            return candidates
        return [candidate for candidate in candidates if candidate.type in (None, defect_type)]

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
        statement = self._apply_created_at_range(statement, start_date, end_date)
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

    def get_all_for_map(self, db: Session, start_date: datetime | None = None, end_date: datetime | None = None) -> list[Defect]:
        statement = select(Defect)
        statement = self._apply_created_at_range(statement, start_date, end_date)
        return list(db.execute(statement).scalars().all())

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
            statement = self._apply_created_at_range(statement, start_date, end_date)
            result[name] = db.execute(statement).scalar() or 0
        return result

    def get_daily_statistics(self, db: Session, days: int = 7, start_date: datetime | None = None, end_date: datetime | None = None) -> list[dict[str, object]]:
        # 1. Check if 1-day period
        is_single_day = False
        if start_date and end_date and start_date.date() == end_date.date():
            is_single_day = True

        if is_single_day:
            target_date = start_date.date()
            statement = select(Defect).where(
                Defect.created_at >= datetime.combine(target_date, time.min),
                Defect.created_at <= datetime.combine(target_date, time.max)
            )
            defects = list(db.execute(statement).scalars().all())

            # 6 intervals for 1 day: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
            intervals = [
                ("00:00", 0, 4),
                ("04:00", 4, 8),
                ("08:00", 8, 12),
                ("12:00", 12, 16),
                ("16:00", 16, 20),
                ("20:00", 20, 24),
            ]
            points = []
            for label, start_h, end_h in intervals:
                matching = [d for d in defects if d.created_at and start_h <= d.created_at.hour < end_h]
                crit = sum(1 for d in matching if d.severity == DefectSeverity.CRITICAL)
                points.append({
                    "date": f"{target_date.isoformat()}T{label}",
                    "count": len(matching),
                    "critical": crit,
                    "label": label,
                })
            return points

        # 2. Check if 7 days or 30 days
        now_date = datetime.now(timezone.utc).date()
        target_end = end_date.date() if end_date else now_date
        target_start = start_date.date() if start_date else (target_end - timedelta(days=days - 1))
        delta_days = max(1, (target_end - target_start).days + 1)

        if delta_days <= 31:
            statement = select(Defect).where(
                Defect.created_at >= datetime.combine(target_start, time.min),
                Defect.created_at <= datetime.combine(target_end, time.max)
            )
            defects = list(db.execute(statement).scalars().all())

            points = []
            weekday_ru = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
            for i in range(delta_days):
                d = target_start + timedelta(days=i)
                matching = [defect for defect in defects if defect.created_at and defect.created_at.date() == d]
                crit = sum(1 for defect in matching if defect.severity == DefectSeverity.CRITICAL)
                label = weekday_ru[d.weekday()] if delta_days <= 7 else f"{d.day}"
                points.append({
                    "date": d.isoformat(),
                    "count": len(matching),
                    "critical": crit,
                    "label": label,
                })
            return points

        # 3. 12 months or All time: Monthly aggregation
        defects = list(db.execute(select(Defect)).scalars().all())
        month_names = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        points = []
        for i in range(11, -1, -1):
            m_date = (datetime.now(timezone.utc).replace(day=1) - timedelta(days=i*30)).replace(day=1)
            matching = [d for d in defects if d.created_at and d.created_at.year == m_date.year and d.created_at.month == m_date.month]
            crit = sum(1 for d in matching if d.severity == DefectSeverity.CRITICAL)
            points.append({
                "date": m_date.date().isoformat(),
                "count": len(matching),
                "critical": crit,
                "label": month_names[m_date.month - 1],
            })
        return points
