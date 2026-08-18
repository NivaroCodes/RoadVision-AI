from fastapi import APIRouter, UploadFile, File
from app.schemas.ml_schemas import DetectionResult
from app.services.detection_service import DetectionService

router = APIRouter()
service = DetectionService()

@router.post("", response_model=DetectionResult)
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    return service.analyze(contents)
