from fastapi import APIRouter
from app.api.v1.endpoints import defects, analytics, ws

api_router = APIRouter()

api_router.include_router(defects.router, prefix="/defects", tags=["defects"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(ws.router, prefix="/ws", tags=["websockets"])
