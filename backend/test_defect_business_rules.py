import unittest
from unittest.mock import Mock

from fastapi import HTTPException

from app.models.defect import Defect, DefectSeverity, DefectStatus, DefectType, PriorityLevel
from app.services.deduplication import DeduplicationPolicy
from app.services.defect import DefectService
from app.services.priority import RuleBasedPriorityEngine


def build_defect(
    status: DefectStatus = DefectStatus.DETECTED,
    severity: DefectSeverity | None = None,
    confirmations: int = 1,
    latitude: float = 42.3,
    longitude: float = 69.6,
    defect_type: DefectType | None = DefectType.POTHOLE,
) -> Defect:
    return Defect(
        id=1,
        type=defect_type,
        status=status,
        severity=severity,
        latitude=latitude,
        longitude=longitude,
        image_url="/uploads/before.jpg",
        confirmation_count=confirmations,
    )


class LifecycleTests(unittest.TestCase):
    def setUp(self) -> None:
        self.service = DefectService(repository=Mock())

    def test_valid_transition(self) -> None:
        defect = build_defect()
        self.service.transition(defect, DefectStatus.IN_PROGRESS)
        self.assertEqual(defect.status, DefectStatus.IN_PROGRESS)

    def test_invalid_transition_returns_conflict(self) -> None:
        defect = build_defect()
        with self.assertRaises(HTTPException) as context:
            self.service.transition(defect, DefectStatus.VERIFIED)
        self.assertEqual(context.exception.status_code, 409)


class DeduplicationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.policy = DeduplicationPolicy(radius_meters=25, time_window_days=7)

    def test_nearby_same_type_matches(self) -> None:
        candidate = build_defect(latitude=42.30005, longitude=69.60005)
        self.assertTrue(self.policy.matches(42.3, 69.6, DefectType.POTHOLE, candidate))

    def test_distant_or_different_type_does_not_match(self) -> None:
        distant = build_defect(latitude=42.31, longitude=69.61)
        different = build_defect(latitude=42.30005, longitude=69.60005, defect_type=DefectType.CRACK)
        self.assertFalse(self.policy.matches(42.3, 69.6, DefectType.POTHOLE, distant))
        self.assertFalse(self.policy.matches(42.3, 69.6, DefectType.POTHOLE, different))


class PriorityTests(unittest.TestCase):
    def test_priority_is_explainable(self) -> None:
        defect = build_defect(severity=DefectSeverity.HIGH, confirmations=12)
        level, reasons = RuleBasedPriorityEngine().evaluate(defect)
        self.assertEqual(level, PriorityLevel.CRITICAL)
        self.assertIn("Severity is high", reasons)
        self.assertIn("12 resident confirmations", reasons)


if __name__ == "__main__":
    unittest.main()
