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
