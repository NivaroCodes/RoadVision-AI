from dataclasses import dataclass
from typing import Protocol

from app.models.defect import DefectSeverity, DefectType, VerificationStatus


@dataclass(frozen=True)
class DetectionResult:
    detected: bool
    defect_type: DefectType | None
    confidence: float
    severity: DefectSeverity | None


@dataclass(frozen=True)
class VerificationResult:
    status: VerificationStatus
    confidence: float | None


class DetectionService(Protocol):
    def analyze(self, image: bytes) -> DetectionResult | None: ...


class VerificationService(Protocol):
    def verify(self, before_image_url: str, after_image: bytes) -> VerificationResult | None: ...


class PendingDetectionService:
    def analyze(self, image: bytes) -> DetectionResult | None:
        return None

class RemoteDetectionService:
    def __init__(self, ml_url: str = "http://localhost:8001"):
        self.ml_url = ml_url

    def analyze(self, image: bytes) -> DetectionResult | None:
        import httpx
        try:
            # Send file to ML service
            files = {"file": ("image.jpg", image, "image/jpeg")}
            response = httpx.post(f"{self.ml_url}/api/v1/detection", files=files, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                # Parse to DetectionResult
                if data.get("detected"):
                    # Only parse defect type and severity if detected
                    # We have to map strings to Enums
                    defect_type_str = data.get("defect_type")
                    severity_str = data.get("severity")
                    
                    try:
                        defect_type = DefectType(defect_type_str) if defect_type_str else None
                    except ValueError:
                        defect_type = None
                        
                    try:
                        severity = DefectSeverity(severity_str) if severity_str else None
                    except ValueError:
                        severity = None
                        
                    return DetectionResult(
                        detected=True,
                        defect_type=defect_type,
                        confidence=data.get("confidence", 0.0),
                        severity=severity
                    )
                else:
                    return DetectionResult(
                        detected=False,
                        defect_type=None,
                        confidence=data.get("confidence", 0.0),
                        severity=None
                    )
        except Exception:
            return None
        return None

class PendingVerificationService:
    def verify(self, before_image_url: str, after_image: bytes) -> VerificationResult | None:
        return None
