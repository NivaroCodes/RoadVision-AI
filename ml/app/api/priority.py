from fastapi import APIRouter
from app.schemas.ml_schemas import PriorityInput, PriorityResult
from app.services.priority_service import PriorityEngine

router = APIRouter()
engine = PriorityEngine()

@router.post("", response_model=PriorityResult)
def calculate_priority(req: PriorityInput):
    return engine.evaluate(req)
