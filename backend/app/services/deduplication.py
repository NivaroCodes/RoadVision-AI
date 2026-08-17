import math
from dataclasses import dataclass

from app.models.defect import Defect, DefectType


@dataclass(frozen=True)
class DeduplicationPolicy:
    radius_meters: float = 25
    time_window_days: int = 7

    def matches(self, latitude: float, longitude: float, defect_type: DefectType | None, candidate: Defect) -> bool:
        if defect_type is not None and candidate.type not in (None, defect_type):
            return False
        return self.distance_meters(latitude, longitude, candidate.latitude, candidate.longitude) <= self.radius_meters

    @staticmethod
    def distance_meters(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float) -> float:
        radius = 6_371_000
        latitude_delta = math.radians(latitude_b - latitude_a)
        longitude_delta = math.radians(longitude_b - longitude_a)
        value = math.sin(latitude_delta / 2) ** 2 + math.cos(math.radians(latitude_a)) * math.cos(math.radians(latitude_b)) * math.sin(longitude_delta / 2) ** 2
        return 2 * radius * math.atan2(math.sqrt(value), math.sqrt(1 - value))
