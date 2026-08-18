from app.schemas.ml_schemas import PriorityInput, PriorityResult

class PriorityEngine:
    def evaluate(self, req: PriorityInput) -> PriorityResult:
        # Deterministic scoring layer
        score = 0

        # 1. Severity weight
        severity_weights = {
            "low": 10,
            "medium": 30,
            "high": 60,
            "critical": 80
        }
        score += severity_weights.get(req.severity, 0)

        # 2. Confidence multiplier
        score = int(score * req.confidence)

        # 3. Confirmation count (social priority)
        score += min(req.confirmation_count * 5, 20)  # Max +20 from confirmations

        # Cap at 100
        score = min(score, 100)

        # Determine priority level based on final score
        if score >= 80:
            level = "critical"
        elif score >= 60:
            level = "high"
        elif score >= 30:
            level = "medium"
        else:
            level = "low"

        return PriorityResult(
            priority_score=score,
            priority_level=level
        )
