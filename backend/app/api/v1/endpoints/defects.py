from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from fastapi import status as http_status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional

from app.core.db import get_db
from app.models.defect import DefectStatus, DefectSeverity, DefectType
from app.repositories.defect import DefectRepository
from app.services.defect import DefectService
from app.schemas.defect import DefectRead, DefectMapRead, DefectUpdate

router = APIRouter()

defect_repo = DefectRepository()
defect_service = DefectService(defect_repo)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/jpg"]

@router.post(
    "/upload", 
    response_model=DefectRead,
    summary="Upload a new defect image",
    description="Accepts an image and coordinates. Validates the image type, size, and uses Mock AI to detect the defect."
)
async def upload_defect(
    latitude: float = Form(..., ge=-90, le=90, description="Latitude of the defect"),
    longitude: float = Form(..., ge=-180, le=180, description="Longitude of the defect"),
    address: Optional[str] = Form(None, description="Optional address of the defect"),
    image: UploadFile = File(..., description="Image file (JPG/PNG), max 10MB"),
    db: Session = Depends(get_db)
):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=http_status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, 
            detail="Unsupported file type. Only JPG, JPEG, and PNG are allowed."
        )
        
    content = await image.read()
    if not content:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, 
            detail="Empty file is not allowed."
        )
        
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=http_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
            detail="File too large. Maximum size is 10 MB."
        )

    try:
        return defect_service.process_image_detection(
            db=db,
            file_content=content,
            filename=image.filename or "unknown.jpg",
            latitude=latitude,
            longitude=longitude,
            address=address
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")


@router.get(
    "/", 
    response_model=List[DefectRead],
    summary="Get multiple defects",
    description="Fetch a paginated list of defects with optional filtering by type, status, and severity."
)
def get_defects(
    skip: int = Query(0, ge=0, description="Pagination skip"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    type: Optional[DefectType] = Query(None, description="Filter by defect type"),
    status: Optional[DefectStatus] = Query(None, description="Filter by defect status"),
    severity: Optional[DefectSeverity] = Query(None, description="Filter by defect severity"),
    db: Session = Depends(get_db)
):
    try:
        return defect_repo.get_multi(
            db=db,
            skip=skip,
            limit=limit,
            type=type,
            status=status,
            severity=severity
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")


@router.get(
    "/map", 
    response_model=List[DefectMapRead],
    summary="Get all defects for map visualization",
    description="Fetch a lightweight representation of all defects for mapping."
)
def get_map_defects(db: Session = Depends(get_db)):
    try:
        return defect_repo.get_all_for_map(db)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")


@router.get(
    "/{id}", 
    response_model=DefectRead,
    summary="Get a specific defect by ID",
    description="Fetch full details of a specific defect by its ID."
)
def get_defect(id: int, db: Session = Depends(get_db)):
    try:
        defect = defect_repo.get_by_id(db, id)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")
        
    if not defect:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Defect not found")
    return defect


@router.patch(
    "/{id}/status", 
    response_model=DefectRead,
    summary="Update defect status",
    description="Update the status of an existing defect."
)
def update_defect_status(
    id: int,
    status: DefectStatus,
    db: Session = Depends(get_db)
):
    try:
        defect = defect_repo.get_by_id(db, id)
        if not defect:
            raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Defect not found")
        return defect_repo.update_status(db, defect, status)
    except SQLAlchemyError:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")
