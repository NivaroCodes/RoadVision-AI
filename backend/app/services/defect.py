import os
import uuid
import random
from sqlalchemy.orm import Session
from app.models.defect import Defect, DefectStatus, DefectSeverity, DefectType
from app.repositories.defect import DefectRepository
from app.schemas.defect import DefectCreate

class DefectService:
    def __init__(self, repository: DefectRepository) -> None:
        self.repository = repository
        self.upload_dir = "uploads"

    def save_image(self, file_content: bytes, filename: str) -> str:
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        os.makedirs(self.upload_dir, exist_ok=True)
        file_path = os.path.join(self.upload_dir, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(file_content)
            
        return f"/uploads/{unique_filename}"

    def process_image_detection(
        self, 
        db: Session, 
        file_content: bytes, 
        filename: str, 
        latitude: float, 
        longitude: float, 
        address: str | None,
        owner_id: int
    ) -> Defect:
        image_url = self.save_image(file_content, filename)
        
        defect_type = random.choice([DefectType.POTHOLE, DefectType.CRACK, DefectType.NET])
        severity = random.choice([DefectSeverity.LOW, DefectSeverity.MEDIUM, DefectSeverity.HIGH, DefectSeverity.CRITICAL])
        confidence = round(random.uniform(0.65, 0.98), 2)
        
        defect_in = DefectCreate(
            type=defect_type,
            status=DefectStatus.DETECTED,
            severity=severity,
            latitude=latitude,
            longitude=longitude,
            address=address,
            confidence=confidence,
            image_url=image_url,
            owner_id=owner_id
        )
        return self.repository.create(db, defect_in)
