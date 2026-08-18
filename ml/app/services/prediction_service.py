from typing import List
import math
from datetime import datetime, timezone
from app.schemas.ml_schemas import HistoricalDefect, RiskPoint, PredictionResult

class RiskModel:
    def predict(self, defects: List[HistoricalDefect]) -> PredictionResult:
        # Baseline geospatial risk prediction
        # Groups nearby historical defects to identify high-risk segments.

        if not defects:
            return PredictionResult(high_risk_segments=[])

        clusters = []
        cluster_radius_deg = 0.005 # ~500m

        now = datetime.now(timezone.utc)

        for defect in defects:
            added = False
            for cluster in clusters:
                # Simple euclidean distance for clustering baseline
                dist = math.sqrt(
                    (defect.latitude - cluster['lat'])**2 + 
                    (defect.longitude - cluster['lon'])**2
                )
                if dist < cluster_radius_deg:
                    cluster['defects'].append(defect)
                    added = True
                    break

            if not added:
                clusters.append({
                    'lat': defect.latitude,
                    'lon': defect.longitude,
                    'defects': [defect]
                })

        results = []
        for cluster in clusters:
            count = len(cluster['defects'])

            # Base risk on count and recency
            recent_count = sum(1 for d in cluster['defects'] if (now - d.created_at).days < 30)

            risk_score = min((count * 0.1) + (recent_count * 0.2), 1.0)

            if risk_score > 0.7:
                risk_level = "high"
            elif risk_score > 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"

            results.append(RiskPoint(
                latitude=cluster['lat'],
                longitude=cluster['lon'],
                risk_score=round(risk_score, 2),
                risk_level=risk_level,
                prediction_horizon_days=30,
                defect_count=count
            ))

        # Only return meaningful risk areas (e.g. at least 2 defects or medium/high risk)
        high_risk_segments = [r for r in results if r.risk_score > 0.3]

        return PredictionResult(high_risk_segments=high_risk_segments)
