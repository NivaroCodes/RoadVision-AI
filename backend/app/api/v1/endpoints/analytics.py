from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.repositories.defect import DefectRepository
from app.services.defect import DefectService
from app.schemas.analytics import TrendPoint

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
def get_analytics_summary(db: Session = Depends(get_db)):
    try:
        return defect_repo.get_analytics_summary(db)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")

@router.get(
    "/trends",
    response_model=list[TrendPoint],
    summary="Get defect trends",
    description="Returns the number of defects detected per day for the last 7 days."
)
def get_analytics_trends(db: Session = Depends(get_db)):
    try:
        return defect_repo.get_daily_statistics(db, days=7)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")
