"""Backend API tests: auth, enquiries CRUD, studio generate."""
import os
import base64
import pytest
import requests

BASE_URL = "http://localhost:8001"
ADMIN_EMAIL = "admin@rekhakrishnamurthy.com"
ADMIN_PASSWORD = "Rekha@Admin2026"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---- AUTH ----
class TestAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrongpass!"}, timeout=10)
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---- ENQUIRIES ----
class TestEnquiries:
    created_id = None

    def test_create_public(self):
        payload = {"name": "TEST_User", "phone": "+911234567890",
                   "service": "Bridal", "message": "Please contact",
                   "look": "Bridal Classic"}
        r = requests.post(f"{BASE_URL}/api/enquiries", json=payload, timeout=10)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["status"] == "new"
        assert "id" in data
        assert data["look"] == "Bridal Classic"
        assert data["name"] == "TEST_User"
        TestEnquiries.created_id = data["id"]

    def test_create_missing_name(self):
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"phone": "+911234567890"}, timeout=10)
        assert r.status_code == 422

    def test_create_missing_phone(self):
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_NoPhone"}, timeout=10)
        assert r.status_code == 422

    def test_list_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/enquiries", timeout=10)
        assert r.status_code == 401

    def test_list_with_status(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/enquiries?status=new",
                         headers=auth_headers, timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert any(e["id"] == TestEnquiries.created_id for e in items)

    def test_stats(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/enquiries/stats",
                         headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        for k in ["new", "replied", "booked", "closed", "total"]:
            assert k in data
        assert data["total"] >= 1

    def test_patch_invalid_status(self, auth_headers):
        r = requests.patch(f"{BASE_URL}/api/enquiries/{TestEnquiries.created_id}",
                           headers=auth_headers, json={"status": "bogus"}, timeout=10)
        assert r.status_code == 400

    def test_patch_unknown_id(self, auth_headers):
        r = requests.patch(f"{BASE_URL}/api/enquiries/non-existent-id",
                           headers=auth_headers, json={"status": "booked"}, timeout=10)
        assert r.status_code == 404

    def test_patch_booked(self, auth_headers):
        r = requests.patch(f"{BASE_URL}/api/enquiries/{TestEnquiries.created_id}",
                           headers=auth_headers, json={"status": "booked"}, timeout=10)
        assert r.status_code == 200
        assert r.json()["status"] == "booked"
        # Verify persistence via GET list
        r2 = requests.get(f"{BASE_URL}/api/enquiries?status=booked",
                          headers=auth_headers, timeout=10)
        assert any(e["id"] == TestEnquiries.created_id for e in r2.json())

    def test_delete_and_verify(self, auth_headers):
        r = requests.delete(f"{BASE_URL}/api/enquiries/{TestEnquiries.created_id}",
                            headers=auth_headers, timeout=10)
        assert r.status_code == 204
        r2 = requests.delete(f"{BASE_URL}/api/enquiries/{TestEnquiries.created_id}",
                             headers=auth_headers, timeout=10)
        assert r2.status_code == 404


# ---- STUDIO ----
class TestStudio:
    def test_invalid_base64(self):
        r = requests.post(f"{BASE_URL}/api/studio/generate",
                          json={"image": "data:image/jpeg;base64,!!!not-b64!!!",
                                "look": {"name": "Bridal Classic"}}, timeout=15)
        assert r.status_code == 400

    def test_oversized(self):
        # ~7MB of base64 payload → decoded ~5.25MB — need >6MB decoded. Use ~9MB.
        big = "A" * (9 * 1024 * 1024)
        r = requests.post(f"{BASE_URL}/api/studio/generate",
                          json={"image": f"data:image/jpeg;base64,{big}",
                                "look": {"name": "Big"}}, timeout=30)
        assert r.status_code == 413

    def test_generate_sample(self):
        path = "/app/frontend/public/sample-face.jpg"
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        payload = {
            "image": f"data:image/jpeg;base64,{b64}",
            "look": {"name": "Bridal Classic", "lips": "#B3122E",
                     "blush": "#E8788A", "eyes": "#8A4B2E",
                     "intensity": 0.9, "liner": True, "gloss": True}
        }
        r = requests.post(f"{BASE_URL}/api/studio/generate",
                          json=payload, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["image"].startswith("data:image/")
        assert "base64," in data["image"]
        # ensure non-trivial size
        assert len(data["image"]) > 5000
