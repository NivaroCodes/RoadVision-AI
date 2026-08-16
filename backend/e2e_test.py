import io
import os
import time

from fastapi.testclient import TestClient

from app.auth.security import get_password_hash
from app.core.db import SessionLocal
from app.main import app
from app.models.defect import Defect
from app.models.user import User, UserRole

client = TestClient(app)
suffix = str(time.time_ns())
resident_email = f"resident-{suffix}@example.com"
road_email = f"road-{suffix}@example.com"
admin_email = f"admin-{suffix}@example.com"
password = "RoadVision123!"
created_defect_id: int | None = None
image_path: str | None = None


def expect(response_status: int, expected: int, step: str) -> None:
    if response_status != expected:
        raise AssertionError(f"{step}: expected {expected}, received {response_status}")


def login(email: str) -> dict[str, str]:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    expect(response.status_code, 200, f"login {email}")
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


try:
    expect(client.get("/api/v1/defects/").status_code, 401, "anonymous registry")

    registration = client.post(
        "/api/v1/auth/register",
        json={"email": resident_email, "password": password},
    )
    expect(registration.status_code, 201, "resident registration")
    if registration.json()["role"] != "resident":
        raise AssertionError("public registration must create a resident")

    db = SessionLocal()
    try:
        db.add_all(
            [
                User(email=road_email, hashed_password=get_password_hash(password), role=UserRole.road_service),
                User(email=admin_email, hashed_password=get_password_hash(password), role=UserRole.admin),
            ]
        )
        db.commit()
    finally:
        db.close()

    resident_headers = login(resident_email)
    road_headers = login(road_email)
    admin_headers = login(admin_email)

    expect(client.get("/api/v1/auth/me", headers=resident_headers).status_code, 200, "current user")
    upload = client.post(
        "/api/v1/defects/upload",
        headers=resident_headers,
        data={"latitude": 42.3, "longitude": 69.6, "address": "Shymkent"},
        files={"image": ("test.jpg", io.BytesIO(b"image-content"), "image/jpeg")},
    )
    expect(upload.status_code, 200, "resident upload")
    created_defect_id = upload.json()["id"]
    image_path = upload.json()["image_url"].lstrip("/")

    mine = client.get("/api/v1/defects/mine", headers=resident_headers)
    expect(mine.status_code, 200, "resident own requests")
    if created_defect_id not in [item["id"] for item in mine.json()]:
        raise AssertionError("created request is missing from resident history")

    expect(client.get("/api/v1/defects/", headers=resident_headers).status_code, 403, "resident registry")
    expect(client.get("/api/v1/analytics/summary", headers=resident_headers).status_code, 403, "resident analytics")
    expect(client.get("/api/v1/users/", headers=resident_headers).status_code, 403, "resident users")
    expect(client.patch(f"/api/v1/defects/{created_defect_id}", headers=resident_headers, json={"status": "fixed"}).status_code, 403, "resident update")
    expect(client.get("/api/v1/defects/", headers=road_headers).status_code, 200, "road registry")
    expect(client.get("/api/v1/defects/map", headers=road_headers).status_code, 200, "road map")
    expect(client.post("/api/v1/defects/upload", headers=road_headers, data={"latitude": 42.3, "longitude": 69.6}, files={"image": ("test.jpg", io.BytesIO(b"image-content"), "image/jpeg")}).status_code, 403, "road upload")
    expect(client.patch(f"/api/v1/defects/{created_defect_id}", headers=road_headers, json={"status": "in_progress"}).status_code, 200, "road update")
    expect(client.get("/api/v1/analytics/summary", headers=road_headers).status_code, 403, "road analytics")
    expect(client.get("/api/v1/analytics/summary", headers=admin_headers).status_code, 200, "admin analytics")
    expect(client.get("/api/v1/users/", headers=admin_headers).status_code, 200, "admin users")
    expect(client.post("/api/v1/auth/logout", headers=resident_headers).status_code, 204, "logout")
    print("Authentication and RBAC end-to-end checks passed")
finally:
    db = SessionLocal()
    try:
        if created_defect_id is not None:
            defect = db.get(Defect, created_defect_id)
            if defect is not None:
                db.delete(defect)
        for email in (resident_email, road_email, admin_email):
            user = db.query(User).filter(User.email == email).first()
            if user is not None:
                db.delete(user)
        db.commit()
    finally:
        db.close()
    if image_path and os.path.exists(image_path):
        os.remove(image_path)
