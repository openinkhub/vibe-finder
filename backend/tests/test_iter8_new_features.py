"""Iteration 8: Tests for new features - brochure PDF, batch seats, accept/reject enquiry."""
import os
import io
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://vibe-finder-76.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@rekhakrishnamurthy.com"
ADMIN_PASSWORD = "Rekha@Admin2026"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text[:200]}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Brochure PDF ----------
class TestBrochure:
    def test_brochure_download_returns_pdf(self):
        r = requests.post(f"{BASE_URL}/api/brochure/request",
                          json={"path": "/bridal-makeup-artist-bangalore", "email": "test@example.com", "mode": "download", "name": "Test"},
                          timeout=30)
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF", "Response is not a valid PDF file"
        assert len(r.content) > 1000

    def test_brochure_academy_download(self):
        r = requests.post(f"{BASE_URL}/api/brochure/request",
                          json={"path": "/makeup-educator-beauty-mentor-karnataka", "email": "test@example.com", "mode": "download"},
                          timeout=30)
        assert r.status_code == 200
        assert r.content[:4] == b"%PDF"

    def test_brochure_invalid_path_404(self):
        r = requests.post(f"{BASE_URL}/api/brochure/request",
                          json={"path": "/nonexistent-page", "email": "test@example.com", "mode": "download"},
                          timeout=15)
        assert r.status_code == 404

    def test_brochure_invalid_email_400(self):
        r = requests.post(f"{BASE_URL}/api/brochure/request",
                          json={"path": "/bridal-makeup-artist-bangalore", "email": "not-an-email", "mode": "download"},
                          timeout=15)
        assert r.status_code == 400

    def test_brochure_email_mode_returns_502_or_success(self):
        # Sandbox Resend will refuse non-owner addresses → 502 expected, not crash
        r = requests.post(f"{BASE_URL}/api/brochure/request",
                          json={"path": "/bridal-makeup-artist-bangalore", "email": "test@example.com", "mode": "email"},
                          timeout=30)
        assert r.status_code in (200, 502), f"Unexpected status: {r.status_code} {r.text[:200]}"


# ---------- Batch (seats field) ----------
class TestBatchSeats:
    slug = "makeup-educator-beauty-mentor-karnataka"

    def test_set_batch_with_seats(self, auth_headers):
        r = requests.put(f"{BASE_URL}/api/content/batches/{self.slug}",
                         json={"date": "2026-06-01", "note": "TEST_iter8", "seats": 3},
                         headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        assert data["seats"] == 3
        assert data["date"] == "2026-06-01"

    def test_set_batch_blank_seats_defaults_to_5(self, auth_headers):
        r = requests.put(f"{BASE_URL}/api/content/batches/{self.slug}",
                         json={"date": "2026-06-15", "note": "TEST_iter8"},
                         headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text[:300]
        assert r.json()["seats"] == 5

    def test_list_batches_public(self):
        r = requests.get(f"{BASE_URL}/api/content/batches", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        found = [b for b in arr if b["path"] == f"/{self.slug}"]
        assert len(found) == 1
        assert "seats" in found[0]

    def test_clear_batch(self, auth_headers):
        r = requests.delete(f"{BASE_URL}/api/content/batches/{self.slug}", headers=auth_headers, timeout=15)
        assert r.status_code == 204


# ---------- Accept / Reject Enquiry ----------
class TestEnquiryAcceptReject:
    def _create(self, service):
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_iter8_lead", "phone": "9999900000",
                                "email": "test@example.com", "service": service, "source": "form"},
                          timeout=15)
        assert r.status_code == 201, r.text[:300]
        return r.json()["id"]

    def test_accept_flips_to_booked(self, auth_headers):
        eid = self._create("Bridal")
        r = requests.post(f"{BASE_URL}/api/enquiries/{eid}/accept", headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text[:300]
        assert r.json()["status"] == "booked"
        # GET to verify persistence
        g = requests.get(f"{BASE_URL}/api/enquiries?status=booked", headers=auth_headers, timeout=15)
        assert g.status_code == 200
        assert any(e["id"] == eid for e in g.json())
        # cleanup
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)

    def test_reject_flips_to_closed(self, auth_headers):
        eid = self._create("Party Makeup")
        r = requests.post(f"{BASE_URL}/api/enquiries/{eid}/reject", headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text[:300]
        assert r.json()["status"] == "closed"
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)

    def test_accept_without_email_no_crash(self, auth_headers):
        # Regression: prior bug — background email task crashed when look_image=None
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_iter8_noemail", "phone": "9999900001", "service": "Bridal"},
                          timeout=15)
        assert r.status_code == 201
        eid = r.json()["id"]
        a = requests.post(f"{BASE_URL}/api/enquiries/{eid}/accept", headers=auth_headers, timeout=20)
        assert a.status_code == 200
        assert a.json()["status"] == "booked"
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)

    def test_accept_nonexistent_404(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/enquiries/{uuid.uuid4()}/accept", headers=auth_headers, timeout=15)
        assert r.status_code == 404

    def test_accept_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/enquiries/some-id/accept", timeout=15)
        assert r.status_code in (401, 403)


# ---------- Booking Panel enquiry (regression: POST /api/enquiries course preset) ----------
class TestBookingPanelEnquiry:
    def test_service_booking_creates_enquiry(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_iter8_svc", "phone": "9999900002",
                                "service": "Bridal Makeup", "source": "form"},
                          timeout=15)
        assert r.status_code == 201
        eid = r.json()["id"]
        assert r.json()["service"] == "Bridal Makeup"
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)

    def test_course_booking_creates_enquiry(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_iter8_course", "phone": "9999900003",
                                "service": "Launchpad", "source": "form"},
                          timeout=15)
        assert r.status_code == 201
        eid = r.json()["id"]
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)
