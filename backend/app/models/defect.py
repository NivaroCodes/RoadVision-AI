import enum
from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, Enum, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin


class DefectType(str, enum.Enum):
    POTHOLE = "pothole"
    CRACK = "crack"
    NET = "net"
    ROAD_COLLAPSE = "road_collapse"
    DAMAGED_MANHOLE = "damaged_manhole"
    OTHER = "other"


class DefectStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    DETECTED = "detected"
    IN_PROGRESS = "in_progress"
    FIXED = "fixed"
    VERIFIED = "verified"
    REJECTED = "rejected"


class DefectSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PriorityLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    NOT_VERIFIED = "not_verified"
    MANUAL_REVIEW = "manual_review"


def enum_values(enum_class: type[enum.Enum]) -> list[str]:
    return [str(item.value) for item in enum_class]


class Defect(Base, TimestampMixin):
    __tablename__ = "defects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    type: Mapped[DefectType | None] = mapped_column(Enum(DefectType, name="defecttype", values_callable=enum_values), index=True)
    status: Mapped[DefectStatus] = mapped_column(Enum(DefectStatus, name="defectstatus", values_callable=enum_values), default=DefectStatus.SUBMITTED, index=True)
    severity: Mapped[DefectSeverity | None] = mapped_column(Enum(DefectSeverity, name="defectseverity", values_callable=enum_values), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    address: Mapped[str | None] = mapped_column(String(255))
    confidence: Mapped[float | None] = mapped_column(Float)
    image_url: Mapped[str] = mapped_column(String(512))
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    confirmation_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    priority: Mapped[PriorityLevel] = mapped_column(Enum(PriorityLevel, name="prioritylevel", values_callable=enum_values), default=PriorityLevel.LOW, nullable=False, index=True)
    priority_reasons: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    analysis_status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus, name="analysisstatus", values_callable=enum_values), default=AnalysisStatus.PENDING, nullable=False)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    after_image_url: Mapped[str | None] = mapped_column(String(512))
    verification_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus, name="verificationstatus", values_callable=enum_values), default=VerificationStatus.PENDING, nullable=False)
    verification_confidence: Mapped[float | None] = mapped_column(Float)


class DefectReport(Base, TimestampMixin):
    __tablename__ = "defect_reports"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    defect_id: Mapped[int] = mapped_column(ForeignKey("defects.id", ondelete="CASCADE"), index=True)
    resident_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    image_url: Mapped[str] = mapped_column(String(512))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)


class DefectEvent(Base):
    __tablename__ = "defect_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    defect_id: Mapped[int] = mapped_column(ForeignKey("defects.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[dict[str, str | int | float | bool | None]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
