import enum
from sqlalchemy import String, Float, BigInteger, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base
from app.models.base import TimestampMixin

class DefectType(str, enum.Enum):
    POTHOLE = "pothole"
    CRACK = "crack"
    NET = "net"

class DefectStatus(str, enum.Enum):
    DETECTED = "detected"
    IN_PROGRESS = "in_progress"
    FIXED = "fixed"
    REJECTED = "rejected"

class DefectSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Defect(Base, TimestampMixin):
    __tablename__ = "defects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    type: Mapped[DefectType] = mapped_column(Enum(DefectType, name="defecttype", values_callable=lambda obj: [e.value for e in obj]), index=True)
    status: Mapped[DefectStatus] = mapped_column(Enum(DefectStatus, name="defectstatus", values_callable=lambda obj: [e.value for e in obj]), default=DefectStatus.DETECTED, index=True)
    severity: Mapped[DefectSeverity] = mapped_column(Enum(DefectSeverity, name="defectseverity", values_callable=lambda obj: [e.value for e in obj]), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    address: Mapped[str | None] = mapped_column(String(255))
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    image_url: Mapped[str] = mapped_column(String(512))
