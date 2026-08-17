from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.defect import AnalysisStatus, DefectSeverity, DefectStatus, DefectType, PriorityLevel, VerificationStatus


class DefectBase(BaseModel):
    type: DefectType | None = None
    status: DefectStatus = DefectStatus.SUBMITTED
    severity: DefectSeverity | None = None
    latitude: float
    longitude: float
    address: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    image_url: str


class DefectCreate(DefectBase):
    owner_id: int | None = None


class DefectUpdate(BaseModel):
    type: DefectType | None = None
    status: DefectStatus | None = None
    severity: DefectSeverity | None = None
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)


class DefectRead(DefectBase):
    id: int
    owner_id: int | None
    confirmation_count: int
    priority: PriorityLevel
    priority_reasons: list[str]
    analysis_status: AnalysisStatus
    assigned_to_id: int | None
    assigned_at: datetime | None
    after_image_url: str | None
    verification_status: VerificationStatus
    verification_confidence: float | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DefectMapRead(BaseModel):
    id: int
    type: DefectType | None
    status: DefectStatus
    severity: DefectSeverity | None
    latitude: float
    longitude: float
    confidence: float | None
    priority: PriorityLevel
    confirmation_count: int

    model_config = ConfigDict(from_attributes=True)


class AssignmentRequest(BaseModel):
    road_service_user_id: int


class AnalysisRequest(BaseModel):
    detected: bool
    defect_type: DefectType | None = None
    confidence: float = Field(ge=0, le=1)
    severity: DefectSeverity | None = None


class VerificationRead(BaseModel):
    defect_id: int
    status: VerificationStatus
    confidence: float | None
    after_image_url: str


class DefectEventRead(BaseModel):
    id: int
    defect_id: int
    actor_id: int | None
    event_type: str
    details: dict[str, str | int | float | bool | None]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
