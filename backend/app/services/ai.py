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


class PendingVerificationService:
    def verify(self, before_image_url: str, after_image: bytes) -> VerificationResult | None:
        return None
