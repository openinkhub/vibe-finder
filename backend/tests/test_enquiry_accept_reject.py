"""Tests for enquiry accept/reject idempotency and regression (iteration_13)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://vibe-finder-76.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@rekhakrishnamurthy.com"
ADMIN_PASSWORD = "Rekha@Admin2026"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


def _create_enquiry(name_suffix="accept"):
    payload = {
        "name": f"TEST_{name_suffix}",
        "phone": "+919999900001",
        "email": "test@example.com",
        "service": "Bridal",
        "date": "2026-03-01",
        "message": "automated test",
        "source": "form",
    }
    r = requests.post(f"{BASE_URL}/api/enquiries", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    return r.json()


# -------- Admin auth & dashboard smoke --------
def test_admin_login_and_me(token):
    r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    assert r.status_code == 200
    assert r.json().get("email") == ADMIN_EMAIL


def test_enquiries_list_and_stats(auth):
    r1 = requests.get(f"{BASE_URL}/api/enquiries", params={"status": "all"}, headers=auth, timeout=10)
    assert r1.status_code == 200
    assert isinstance(r1.json(), list)
    r2 = requests.get(f"{BASE_URL}/api/enquiries/stats", headers=auth, timeout=10)
    assert r2.status_code == 200
    data = r2.json()
    for k in ["new", "replied", "booked", "closed", "total"]:
        assert k in data


# -------- Accept idempotency --------
def test_accept_idempotent(auth):
    e = _create_enquiry("accept1")
    eid = e["id"]
    r1 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/accept", headers=auth, timeout=15)
    assert r1.status_code == 200
    assert r1.json()["status"] == "booked"
    updated_at_1 = r1.json()["updated_at"]

    # second call — should be no-op, updated_at unchanged
    r2 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/accept", headers=auth, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["status"] == "booked"
    assert r2.json()["updated_at"] == updated_at_1, "accept twice should not modify record (idempotent)"

    # cleanup
    requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth, timeout=10)


# -------- Reject idempotency --------
def test_reject_idempotent(auth):
    e = _create_enquiry("reject1")
    eid = e["id"]
    r1 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/reject", headers=auth, timeout=15)
    assert r1.status_code == 200
    assert r1.json()["status"] == "closed"
    updated_at_1 = r1.json()["updated_at"]

    r2 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/reject", headers=auth, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["status"] == "closed"
    assert r2.json()["updated_at"] == updated_at_1

    requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth, timeout=10)


# -------- Cross-action still allowed --------
def test_closed_can_still_be_accepted(auth):
    e = _create_enquiry("reject_then_accept")
    eid = e["id"]
    r1 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/reject", headers=auth, timeout=15)
    assert r1.json()["status"] == "closed"
    r2 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/accept", headers=auth, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["status"] == "booked", "closed->accept should transition"
    requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth, timeout=10)


def test_booked_can_still_be_rejected(auth):
    e = _create_enquiry("accept_then_reject")
    eid = e["id"]
    r1 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/accept", headers=auth, timeout=15)
    assert r1.json()["status"] == "booked"
    r2 = requests.post(f"{BASE_URL}/api/enquiries/{eid}/reject", headers=auth, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["status"] == "closed"
    requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth, timeout=10)


# -------- Regression PATCH & DELETE --------
def test_patch_mark_replied_and_booked(auth):
    e = _create_enquiry("patch")
    eid = e["id"]
    r1 = requests.patch(f"{BASE_URL}/api/enquiries/{eid}", json={"status": "replied"}, headers=auth, timeout=10)
    assert r1.status_code == 200 and r1.json()["status"] == "replied"
    r2 = requests.patch(f"{BASE_URL}/api/enquiries/{eid}", json={"status": "booked"}, headers=auth, timeout=10)
    assert r2.status_code == 200 and r2.json()["status"] == "booked"
    r3 = requests.patch(f"{BASE_URL}/api/enquiries/{eid}", json={"status": "closed"}, headers=auth, timeout=10)
    assert r3.status_code == 200 and r3.json()["status"] == "closed"
    requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth, timeout=10)


def test_accept_404(auth):
    r = requests.post(f"{BASE_URL}/api/enquiries/nonexistent-id-xyz/accept", headers=auth, timeout=10)
    assert r.status_code == 404


def test_reject_404(auth):
    r = requests.post(f"{BASE_URL}/api/enquiries/nonexistent-id-xyz/reject", headers=auth, timeout=10)
    assert r.status_code == 404


def test_accept_requires_auth():
    r = requests.post(f"{BASE_URL}/api/enquiries/anything/accept", timeout=10)
    assert r.status_code in (401, 403)
