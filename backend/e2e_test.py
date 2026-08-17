import io
import os
import time

from fastapi.testclient import TestClient

from app.auth.security import get_password_hash
from app.core.db import SessionLocal
from app.main import app
from app.models.defect import Defect, DefectReport, VerificationStatus
from app.models.user import User, UserRole
from app.api.v1.endpoints.defects import service as defect_service
from app.services.ai import VerificationResult

client = TestClient(app)
suffix = str(time.time_ns())
resident_email = f"resident-{suffix}@example.com"
other_resident_email = f"resident-other-{suffix}@example.com"
road_email = f"road-{suffix}@example.com"
admin_email = f"admin-{suffix}@example.com"
password = "JolScan123!"
created_defect_ids: set[int] = set()
image_paths: set[str] = set()


class LowConfidenceVerificationService:
    def verify(self, before_image_url: str, after_image: bytes) -> VerificationResult:
        return VerificationResult(status=VerificationStatus.VERIFIED, confidence=0.42)


class FailedVerificationService:
    def verify(self, before_image_url: str, after_image: bytes) -> VerificationResult:
        return VerificationResult(status=VerificationStatus.FAILED, confidence=0.93)


def expect(actual: int, expected: int, step: str) -> None:
    if actual != expected:
        raise AssertionError(f"{step}: expected {expected}, received {actual}")


def login(email: str) -> dict[str, str]:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    expect(response.status_code, 200, f"login {email}")
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def upload(headers: dict[str, str], latitude: float, longitude: float, name: str) -> dict:
    response = client.post(
        "/api/v1/defects/upload",
        headers=headers,
        data={"latitude": latitude, "longitude": longitude, "address": "Shymkent"},
        files={"image": (name, io.BytesIO(f"image-{name}".encode()), "image/jpeg")},
    )
    expect(response.status_code, 200, f"upload {name}")
    payload = response.json()
    created_defect_ids.add(payload["id"])
    image_paths.add(payload["image_url"].lstrip("/"))
    return payload


try:
    expect(client.get("/api/v1/defects/").status_code, 401, "anonymous registry")
    for email in (resident_email, other_resident_email):
        registration = client.post("/api/v1/auth/register", json={"email": email, "password": password})
        expect(registration.status_code, 201, f"register {email}")
        if registration.json()["role"] != "resident":
            raise AssertionError("public registration must create a resident")

    db = SessionLocal()
    try:
        road_user = User(email=road_email, hashed_password=get_password_hash(password), role=UserRole.road_service)
        admin_user = User(email=admin_email, hashed_password=get_password_hash(password), role=UserRole.admin)
        db.add_all([road_user, admin_user])
        db.commit()
        road_user_id = road_user.id
    finally:
        db.close()

    resident_headers = login(resident_email)
    other_resident_headers = login(other_resident_email)
    road_headers = login(road_email)
    admin_headers = login(admin_email)

    first = upload(resident_headers, 42.300000, 69.600000, "first.jpg")
    if first["status"] != "submitted" or first["analysis_status"] != "pending":
        raise AssertionError("reports without an ML provider must remain pending")
    duplicate = upload(other_resident_headers, 42.300050, 69.600050, "duplicate.jpg")
    if duplicate["id"] != first["id"] or duplicate["confirmation_count"] != 2:
        raise AssertionError("nearby reports must aggregate into one defect")
    separate = upload(resident_headers, 42.310000, 69.610000, "separate.jpg")
    if separate["id"] == first["id"]:
        raise AssertionError("distant reports must create separate defects")

    mine = client.get("/api/v1/defects/mine", headers=resident_headers)
    expect(mine.status_code, 200, "resident defect list")
    if first["id"] not in {item["id"] for item in mine.json()}:
        raise AssertionError("resident defect list must include submitted reports")

    created_date = first["created_at"][:10]
    date_filtered = client.get(
        "/api/v1/defects/",
        headers=admin_headers,
        params={"start_date": created_date, "end_date": created_date},
    )
    expect(date_filtered.status_code, 200, "inclusive end date registry")
    if first["id"] not in {item["id"] for item in date_filtered.json()}:
        raise AssertionError("date-only end_date must include the entire selected day")

    map_response = client.get("/api/v1/defects/map", headers=road_headers)
    expect(map_response.status_code, 200, "map defects")
    map_item = next(item for item in map_response.json() if item["id"] == first["id"])
    if map_item["address"] != "Shymkent" or not map_item["created_at"]:
        raise AssertionError("map defects must expose address and creation time")

    expect(client.get(f"/api/v1/defects/{first['id']}", headers=other_resident_headers).status_code, 200, "resident aggregated ownership")
    expect(client.get(f"/api/v1/defects/{separate['id']}", headers=other_resident_headers).status_code, 403, "resident foreign report")
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=resident_headers, json={"status": "in_progress"}).status_code, 403, "resident workflow update")
    expect(client.post(f"/api/v1/defects/{first['id']}/assign", headers=resident_headers, json={"road_service_user_id": road_user_id}).status_code, 403, "resident assignment")

    analysis = client.post(
        f"/api/v1/defects/{first['id']}/analysis",
        headers=admin_headers,
        json={"detected": True, "defect_type": "pothole", "confidence": 0.92, "severity": "high"},
    )
    expect(analysis.status_code, 200, "admin analysis")
    if analysis.json()["priority"] != "high" or not analysis.json()["priority_reasons"]:
        raise AssertionError("priority must be explainable")

    self_assignment = client.post(f"/api/v1/defects/{first['id']}/assign", headers=road_headers, json={"road_service_user_id": road_user_id})
    expect(self_assignment.status_code, 200, "road self assignment")
    assignment = client.post(f"/api/v1/defects/{first['id']}/assign", headers=admin_headers, json={"road_service_user_id": road_user_id})
    expect(assignment.status_code, 200, "admin assignment")
    expect(client.get("/api/v1/defects/priority", headers=road_headers).status_code, 200, "road priority list")
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=road_headers, json={"severity": "critical"}).status_code, 403, "road severity update")
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=road_headers, json={"status": "fixed"}).status_code, 409, "invalid lifecycle jump")
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=road_headers, json={"status": "in_progress"}).status_code, 200, "repair started")
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=road_headers, json={"status": "fixed"}).status_code, 409, "fixed requires after image")

    defect_service.verification_service = LowConfidenceVerificationService()
    after = client.post(
        f"/api/v1/defects/{first['id']}/after-image",
        headers=road_headers,
        files={"image": ("after.jpg", io.BytesIO(b"after-image"), "image/jpeg")},
    )
    expect(after.status_code, 200, "after image")
    if after.json()["status"] != "manual_review":
        raise AssertionError("low-confidence verification must require manual review")
    image_paths.add(after.json()["after_image_url"].lstrip("/"))
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=road_headers, json={"status": "verified"}).status_code, 403, "road verification")
    expect(client.patch(f"/api/v1/defects/{first['id']}", headers=admin_headers, json={"status": "verified"}).status_code, 200, "admin verification")
    events = client.get(f"/api/v1/defects/{first['id']}/events", headers=resident_headers)
    expect(events.status_code, 200, "resident status history")
    status_events = [event for event in events.json() if event["event_type"] == "status_changed"]
    if not status_events or any("from_status" not in event["details"] or "to_status" not in event["details"] for event in status_events):
        raise AssertionError("status history must expose previous and next states")

    expect(
        client.post(
            f"/api/v1/defects/{separate['id']}/analysis",
            headers=admin_headers,
            json={"detected": True, "defect_type": "crack", "confidence": 0.88, "severity": "medium"},
        ).status_code,
        200,
        "failed verification analysis",
    )
    expect(client.post(f"/api/v1/defects/{separate['id']}/assign", headers=admin_headers, json={"road_service_user_id": road_user_id}).status_code, 200, "failed verification assignment")
    expect(client.patch(f"/api/v1/defects/{separate['id']}", headers=road_headers, json={"status": "in_progress"}).status_code, 200, "failed verification repair start")
    defect_service.verification_service = FailedVerificationService()
    failed_after = client.post(
        f"/api/v1/defects/{separate['id']}/after-image",
        headers=road_headers,
        files={"image": ("failed-after.jpg", io.BytesIO(b"failed-after-image"), "image/jpeg")},
    )
    expect(failed_after.status_code, 200, "failed AI verification")
    if failed_after.json()["status"] != "failed":
        raise AssertionError("high-confidence failed verification must be preserved")
    image_paths.add(failed_after.json()["after_image_url"].lstrip("/"))
    failed_defect = client.get(f"/api/v1/defects/{separate['id']}", headers=resident_headers)
    expect(failed_defect.status_code, 200, "failed verification defect")
    if failed_defect.json()["status"] != "fixed":
        raise AssertionError("failed AI verification must not verify the lifecycle")
    expect(client.get("/api/v1/analytics/summary", headers=admin_headers).status_code, 200, "admin analytics")
    expect(client.get("/api/v1/users/", headers=road_headers).status_code, 403, "road admin access")
finally:
    db = SessionLocal()
    try:
        reports = db.query(DefectReport).filter(DefectReport.defect_id.in_(created_defect_ids)).all()
        image_paths.update(report.image_url.lstrip("/") for report in reports)
        for defect_id in created_defect_ids:
            defect = db.get(Defect, defect_id)
            if defect is not None:
                db.delete(defect)
        db.commit()
        for email in (resident_email, other_resident_email, road_email, admin_email):
            user = db.query(User).filter(User.email == email).first()
            if user is not None:
                db.delete(user)
        db.commit()
    finally:
        db.close()
    for image_path in image_paths:
        if os.path.exists(image_path):
            os.remove(image_path)
