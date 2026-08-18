from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime, timezone

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_priority_calculation():
    response = client.post("/api/v1/priority", json={
        "severity": "high",
        "confidence": 0.9,
        "confirmation_count": 5,
        "status": "detected"
    })
    assert response.status_code == 200
    data = response.json()
    assert "priority_score" in data
    assert data["priority_level"] in ["low", "medium", "high", "critical"]

def test_prediction_baseline():
    response = client.post("/api/v1/prediction", json={
        "defects": [
            {
                "id": 1,
                "latitude": 42.1001,
                "longitude": 69.1001,
                "defect_type": "pothole",
                "severity": "high",
                "confirmation_count": 5,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": 2,
                "latitude": 42.1002,
                "longitude": 69.1002,
                "defect_type": "crack",
                "severity": "medium",
                "confirmation_count": 2,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "high_risk_segments" in data
    # since they are close (42.1001 vs 42.1002), they should cluster.
    segments = data["high_risk_segments"]
    # depending on risk formula it might be filtered out if risk < 0.3,
    # but with 2 recent defects, score is 2*0.1 + 2*0.2 = 0.6 > 0.3
    assert len(segments) > 0
    assert segments[0]["defect_count"] == 2

def test_detection_invalid_file():
    # Pass a dummy file
    response = client.post("/api/v1/detection", files={"file": ("test.jpg", b"fakeimage")})
    # PIL will fail, detection should gracefully return detected=False
    assert response.status_code == 200
    data = response.json()
    assert data["detected"] is False
