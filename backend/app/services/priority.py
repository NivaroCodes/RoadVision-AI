from typing import Protocol

from app.models.defect import Defect, DefectSeverity, DefectStatus, PriorityLevel


class PriorityEngine(Protocol):
    def evaluate(self, defect: Defect) -> tuple[PriorityLevel, list[str]]: ...


class RuleBasedPriorityEngine:
    severity_levels = {
        DefectSeverity.LOW: PriorityLevel.LOW,
        DefectSeverity.MEDIUM: PriorityLevel.MEDIUM,
        DefectSeverity.HIGH: PriorityLevel.HIGH,
        DefectSeverity.CRITICAL: PriorityLevel.CRITICAL,
    }
    ranks = {
        PriorityLevel.LOW: 1,
        PriorityLevel.MEDIUM: 2,
        PriorityLevel.HIGH: 3,
        PriorityLevel.CRITICAL: 4,
    }

    def evaluate(self, defect: Defect) -> tuple[PriorityLevel, list[str]]:
        reasons: list[str] = []
        level = PriorityLevel.LOW
        if defect.severity is not None:
            level = self.severity_levels[defect.severity]
            reasons.append(f"Severity is {defect.severity.value}")
        if defect.confirmation_count >= 10:
            level = PriorityLevel.CRITICAL if level == PriorityLevel.HIGH else max(level, PriorityLevel.HIGH, key=self.ranks.get)
            reasons.append(f"{defect.confirmation_count} resident confirmations")
        elif defect.confirmation_count >= 3:
            level = max(level, PriorityLevel.MEDIUM, key=self.ranks.get)
            reasons.append(f"{defect.confirmation_count} resident confirmations")
        if defect.status in (DefectStatus.FIXED, DefectStatus.VERIFIED, DefectStatus.REJECTED):
            reasons.append(f"Lifecycle status is {defect.status.value}")
        return level, reasons or ["Awaiting AI assessment"]


class RemotePriorityEngine:
    def __init__(self, ml_url: str = "http://localhost:8001"):
        self.ml_url = ml_url
        self.fallback_engine = RuleBasedPriorityEngine()

    def evaluate(self, defect: Defect) -> tuple[PriorityLevel, list[str]]:
        try:
            import httpx
            payload = {
                "severity": defect.severity.value if defect.severity else None,
                "confidence": defect.confidence if defect.confidence else 0.0,
                "confirmation_count": defect.confirmation_count,
                "status": defect.status.value
            }
            response = httpx.post(f"{self.ml_url}/api/v1/priority", json=payload, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                level_str = data.get("priority_level")
                try:
                    level = PriorityLevel(level_str)
                except ValueError:
                    level = PriorityLevel.LOW
                score = data.get("priority_score", 0)
                reasons = [f"ML Score: {score}/100", f"Level determined as {level_str}"]
                return level, reasons
        except Exception:
            pass
            
        return self.fallback_engine.evaluate(defect)
