from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DetectionResult(BaseModel):
    detected: bool
    defect_type: Optional[str] = None
    severity: Optional[str] = None
    confidence: float

class PriorityInput(BaseModel):
    severity: Optional[str] = None
    confidence: float
    confirmation_count: int
    status: str

class PriorityResult(BaseModel):
    priority_score: int
    priority_level: str

class HistoricalDefect(BaseModel):
    id: int
    latitude: float
    longitude: float
    defect_type: Optional[str] = None
    severity: Optional[str] = None
    confirmation_count: int
    created_at: datetime

class PredictionRequest(BaseModel):
    defects: List[HistoricalDefect]

class RiskPoint(BaseModel):
    latitude: float
    longitude: float
    risk_score: float
    risk_level: str
    prediction_horizon_days: int
    defect_count: int

class PredictionResult(BaseModel):
    high_risk_segments: List[RiskPoint]
