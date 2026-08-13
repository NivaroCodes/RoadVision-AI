from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.defect import DefectType, DefectStatus, DefectSeverity

class DefectBase(BaseModel):
    type: DefectType
    status: DefectStatus = DefectStatus.DETECTED
    severity: DefectSeverity
    latitude: float
    longitude: float
    address: str | None = None
    confidence: float = 0.0
    image_url: str

class DefectCreate(DefectBase):
    pass

class DefectUpdate(BaseModel):
    type: DefectType | None = None
    status: DefectStatus | None = None
    severity: DefectSeverity | None = None
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None
    confidence: float | None = None

class DefectRead(DefectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DefectMapRead(BaseModel):
    id: int
    type: DefectType
    status: DefectStatus
    severity: DefectSeverity
    latitude: float
    longitude: float
    confidence: float

    model_config = ConfigDict(from_attributes=True)
