from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.repositories.defect import DefectRepository
from app.services.defect import DefectService
from app.schemas.analytics import TrendPoint
from app.auth.dependencies import require_admin
from app.models.user import User

router = APIRouter()

defect_repo = DefectRepository()
defect_service = DefectService(defect_repo)

from fastapi import status as http_status
from sqlalchemy.exc import SQLAlchemyError

@router.get(
    "/summary",
    summary="Get analytics summary",
    description="Returns aggregate statistics about all defects in the system."
)
def get_analytics_summary(
    start_date: datetime | None = Query(None, description="Filter by start date"),
    end_date: datetime | None = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        return defect_repo.get_analytics_summary(db, start_date=start_date, end_date=end_date)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")

@router.get(
    "/trends",
    response_model=list[TrendPoint],
    summary="Get defect trends",
    description="Returns the number of defects detected per day for the last 7 days."
)
def get_analytics_trends(
    start_date: datetime | None = Query(None, description="Filter by start date"),
    end_date: datetime | None = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        return defect_repo.get_daily_statistics(db, days=7, start_date=start_date, end_date=end_date)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")

from app.schemas.analytics import RiskPoint, DashboardStats
import httpx
from app.models.defect import Defect

ML_SERVICE_URL = "http://localhost:8001"

@router.get("/predictive-map", response_model=list[RiskPoint])
def get_predictive_map(db: Session = Depends(get_db)):
    # Fetch historical defects
    defects = db.query(Defect).all()
    payload_defects = []
    for d in defects:
        payload_defects.append({
            "id": d.id,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "defect_type": d.type.value if d.type else None,
            "severity": d.severity.value if d.severity else None,
            "confirmation_count": d.confirmation_count,
            "created_at": d.created_at.isoformat()
        })

    try:
        response = httpx.post(f"{ML_SERVICE_URL}/api/v1/prediction", json={"defects": payload_defects}, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            return data.get("high_risk_segments", [])
    except Exception as e:
        print(f"ML service error: {e}")

    return []

@router.get("/ml-stats", response_model=DashboardStats)
def get_ml_stats(db: Session = Depends(get_db)):
    # Gather local stats for Detection and Priority
    defects = db.query(Defect).all()

    total_detected = len([d for d in defects if d.type is not None])
    by_type = {}
    by_severity = {}
    total_confidence = 0

    high_critical_priority = 0

    for d in defects:
        if d.type:
            t = d.type.value
            by_type[t] = by_type.get(t, 0) + 1
        if d.severity:
            s = d.severity.value
            by_severity[s] = by_severity.get(s, 0) + 1
        if d.confidence:
            total_confidence += d.confidence

        if d.priority and d.priority.value in ["high", "critical"]:
            high_critical_priority += 1

    avg_conf = (total_confidence / total_detected) if total_detected > 0 else 0

    # Fetch Prediction stats from the map endpoint logic
    high_risk_locations = 0
    prediction_horizon = 30
    try:
        payload_defects = []
        for d in defects:
            payload_defects.append({
                "id": d.id,
                "latitude": d.latitude,
                "longitude": d.longitude,
                "defect_type": d.type.value if d.type else None,
                "severity": d.severity.value if d.severity else None,
                "confirmation_count": d.confirmation_count,
                "created_at": d.created_at.isoformat()
            })
        response = httpx.post(f"{ML_SERVICE_URL}/api/v1/prediction", json={"defects": payload_defects}, timeout=30.0)
        if response.status_code == 200:
            segments = response.json().get("high_risk_segments", [])
            high_risk_locations = len(segments)
    except Exception:
        pass

    return DashboardStats(
        detection={
            "total_detected": total_detected,
            "by_type": by_type,
            "by_severity": by_severity,
            "average_confidence": round(avg_conf, 2)
        },
        priority={
            "high_critical_priority_defects": high_critical_priority,
            "average_priority_score": 0 # Would require saving score to DB or recalculating
        },
        prediction={
            "high_risk_locations": high_risk_locations,
            "prediction_horizon_days": prediction_horizon
        }
    )
