from fastapi import FastAPI
from app.api import detection, priority, prediction

app = FastAPI(title="Qala Vision ML Service")

app.include_router(detection.router, prefix="/api/v1/detection", tags=["Detection"])
app.include_router(priority.router, prefix="/api/v1/priority", tags=["Priority"])
app.include_router(prediction.router, prefix="/api/v1/prediction", tags=["Prediction"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "qala_vision_ml"}
