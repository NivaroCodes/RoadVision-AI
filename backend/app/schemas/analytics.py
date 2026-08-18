from datetime import date
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TrendPoint(BaseModel):
    date: date | str
    count: int
    critical: int | None = 0
    label: str | None = None

class RiskPoint(BaseModel):
    latitude: float
    longitude: float
    risk_score: float
    risk_level: str
    prediction_horizon_days: int
    defect_count: int

class DashboardStats(BaseModel):
    detection: Dict[str, Any]
    priority: Dict[str, Any]
    prediction: Dict[str, Any]
