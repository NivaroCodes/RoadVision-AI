from fastapi import APIRouter
from app.schemas.ml_schemas import PredictionRequest, PredictionResult
from app.services.prediction_service import RiskModel

router = APIRouter()
model = RiskModel()

@router.post("", response_model=PredictionResult)
def predict_risks(req: PredictionRequest):
    return model.predict(req.defects)
