import json
import io
from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.core.db import SessionLocal

client = TestClient(app)

print("=== 1. POST /api/v1/defects/upload ===")
dummy_image = io.BytesIO(b"fake_image_content")
files = {"image": ("test.jpg", dummy_image, "image/jpeg")}
data = {"latitude": 42.3, "longitude": 69.6, "address": "Shymkent City"}

response = client.post("/api/v1/defects/upload", data=data, files=files)
print(f"Status Code: {response.status_code}")
created_defect = response.json()
print("Response:")
print(json.dumps(created_defect, indent=2, ensure_ascii=False))
print("\n")

defect_id = created_defect.get("id")

print("=== 2. Check Database using Raw SQL ===")
db = SessionLocal()
try:
    sql = text("SELECT id, type, status, severity, latitude, longitude, image_url FROM defects WHERE id = :id")
    result = db.execute(sql, {"id": defect_id}).fetchone()
    print("SQL Row:")
    if result:
        print({
            "id": result[0],
            "type": result[1],
            "status": result[2],
            "severity": result[3],
            "latitude": result[4],
            "longitude": result[5],
            "image_url": result[6]
        })
    else:
        print("Not found in DB!")
finally:
    db.close()
print("\n")

print("=== 3. GET /api/v1/defects ===")
response = client.get("/api/v1/defects/")
print(f"Status Code: {response.status_code}")
print("Response (first item):")
print(json.dumps(response.json()[0] if response.json() else [], indent=2, ensure_ascii=False))
print("\n")

print(f"=== 4. GET /api/v1/defects/{defect_id} ===")
response = client.get(f"/api/v1/defects/{defect_id}")
print(f"Status Code: {response.status_code}")
print("Response:")
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
print("\n")

print("=== 5. GET /api/v1/analytics/summary ===")
response = client.get("/api/v1/analytics/summary")
print(f"Status Code: {response.status_code}")
print("Response:")
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
print("\n")
