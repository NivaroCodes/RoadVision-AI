from fastapi import APIRouter
from app.api.v1.endpoints import defects, analytics

api_router = APIRouter()

api_router.include_router(defects.router, prefix="/defects", tags=["defects"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
