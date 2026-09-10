"""Iteration 4 backend tests: services CRUD, availability, showcase, resend alerts log."""
import os
import io
import time
import subprocess
import requests
import pytest

BASE_URL = "http://localhost:8001"
ADMIN_EMAIL = "admin@rekhakrishnamurthy.com"
ADMIN_PASSWORD = "Rekha@Admin2026"
SAMPLE_FACE = "/app/frontend/public/sample-face.jpg"


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---- SERVICES ----
class TestServices:
    def test_list_services_has_six(self):
        r = requests.get(f"{BASE_URL}/api/content/services", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 6, f"expected >=6 seeded services, got {len(items)}"
        for it in items:
            assert "_id" not in it
            for k in ("id", "no", "title", "desc", "cta", "image"):
                assert k in it, f"missing {k}"

    def test_create_service_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/content/services",
                          data={"title": "X", "desc": "d", "cta": "c"}, timeout=10)
        assert r.status_code == 401

    def test_service_create_no_file_then_put_with_file_then_delete(self, auth_headers):
        # POST without file -> default image
        r = requests.post(f"{BASE_URL}/api/content/services",
                          data={"title": "TEST_E2E Service", "desc": "d", "cta": "Book"},
                          headers=auth_headers, timeout=15)
        assert r.status_code == 201, r.text
        item = r.json()
        assert item["title"] == "TEST_E2E Service"
        assert item["cta"] == "Book"
        assert item["image"], "image should default to something"
        sid = item["id"]

        # PUT with file
        with open(SAMPLE_FACE, "rb") as f:
            files = {"file": ("sample-face.jpg", f, "image/jpeg")}
            r2 = requests.put(f"{BASE_URL}/api/content/services/{sid}",
                              data={"title": "TEST_E2E Updated", "desc": "d2", "cta": "Enquire"},
                              files=files, headers=auth_headers, timeout=30)
        assert r2.status_code == 200, r2.text
        upd = r2.json()
        assert upd["title"] == "TEST_E2E Updated"
        assert upd["image"].startswith("/api/files/"), upd["image"]

        # verify persisted via GET
        listed = requests.get(f"{BASE_URL}/api/content/services", timeout=10).json()
        found = [x for x in listed if x["id"] == sid]
        assert found and found[0]["title"] == "TEST_E2E Updated"
        assert found[0]["image"].startswith("/api/files/")

        # image is fetchable
        img = requests.get(f"{BASE_URL}{upd['image']}", timeout=30)
        assert img.status_code == 200
        assert img.headers.get("content-type", "").startswith("image/")

        # DELETE
        r3 = requests.delete(f"{BASE_URL}/api/content/services/{sid}",
                             headers=auth_headers, timeout=10)
        assert r3.status_code == 204

        listed2 = requests.get(f"{BASE_URL}/api/content/services", timeout=10).json()
        assert not any(x["id"] == sid for x in listed2)


# ---- AVAILABILITY ----
class TestAvailability:
    created_ids: list = []

    def test_create_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/availability",
                          json={"date": "2026-12-20", "full_day": True}, timeout=10)
        assert r.status_code == 401

    def test_create_partial_slot(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/availability",
                          json={"date": "2026-12-20", "full_day": False,
                                "start": "10:00", "end": "14:00", "note": "Wedding"},
                          headers=auth_headers, timeout=10)
        assert r.status_code == 201, r.text
        d = r.json()
        assert d["date"] == "2026-12-20"
        assert d["start"] == "10:00" and d["end"] == "14:00"
        assert d["note"] == "Wedding"
        assert d["full_day"] is False
        TestAvailability.created_ids.append(d["id"])

    def test_create_full_day_nulls_times(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/availability",
                          json={"date": "2026-12-22", "full_day": True,
                                "start": "10:00", "end": "16:00"},
                          headers=auth_headers, timeout=10)
        assert r.status_code == 201
        d = r.json()
        assert d["full_day"] is True
        assert d["start"] is None and d["end"] is None
        TestAvailability.created_ids.append(d["id"])

    def test_start_after_end_400(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/availability",
                          json={"date": "2026-12-21", "full_day": False,
                                "start": "14:00", "end": "10:00"},
                          headers=auth_headers, timeout=10)
        assert r.status_code == 400

    def test_missing_times_partial_400(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/availability",
                          json={"date": "2026-12-23", "full_day": False},
                          headers=auth_headers, timeout=10)
        assert r.status_code == 400

    def test_list_public_by_month(self):
        r = requests.get(f"{BASE_URL}/api/availability?month=2026-12", timeout=10)
        assert r.status_code == 200
        items = r.json()
        # both created should be present
        dates = [i["date"] for i in items]
        assert "2026-12-20" in dates and "2026-12-22" in dates

    def test_delete_requires_auth(self):
        if not TestAvailability.created_ids:
            pytest.skip("nothing to delete")
        r = requests.delete(f"{BASE_URL}/api/availability/{TestAvailability.created_ids[0]}", timeout=10)
        assert r.status_code == 401

    def test_delete_cleanup(self, auth_headers):
        for sid in TestAvailability.created_ids:
            r = requests.delete(f"{BASE_URL}/api/availability/{sid}",
                                headers=auth_headers, timeout=10)
            assert r.status_code == 204
        # verify gone
        items = requests.get(f"{BASE_URL}/api/availability?month=2026-12", timeout=10).json()
        for sid in TestAvailability.created_ids:
            assert not any(i["id"] == sid for i in items)


# ---- STUDIO SHOWCASE (cached, no regenerate) ----
class TestShowcase:
    def test_showcase_shape_and_speed(self):
        t0 = time.time()
        r = requests.get(f"{BASE_URL}/api/studio/showcase", timeout=30)
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["before"] == "/sample-face.jpg"
        looks = data["looks"]
        # should have 4 looks cached
        assert len(looks) == 4, f"expected 4 cached looks, got {len(looks)}: {[l.get('key') for l in looks]}"
        keys = {l["key"] for l in looks}
        assert keys == {"natural", "bridal", "editorial", "glam"}, keys
        for l in looks:
            assert l["url"].startswith("/api/files/"), l["url"]
        # cached => should be fast; allow up to 15s to be safe on slow CI
        assert elapsed < 15, f"showcase took {elapsed:.1f}s (should be cached)"

    def test_showcase_url_serves_image(self):
        r = requests.get(f"{BASE_URL}/api/studio/showcase", timeout=15)
        assert r.status_code == 200
        url = r.json()["looks"][0]["url"]
        img = requests.get(f"{BASE_URL}{url}", timeout=15)
        assert img.status_code == 200
        assert img.headers.get("content-type", "").startswith("image/")


# ---- RESEND ALERT LOG CHECK ----
class TestResendAlert:
    def test_create_enquiry_and_check_log_for_resend_errors(self, auth_headers):
        # snapshot current log size
        log_path = "/var/log/supervisor/backend.err.log"
        pre_size = os.path.getsize(log_path) if os.path.exists(log_path) else 0

        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_ResendAlert", "phone": "+911111111111",
                                "service": "Bridal", "message": "resend log check"},
                          timeout=10)
        assert r.status_code == 201
        eid = r.json()["id"]

        # Background task fires — wait for delivery attempt
        time.sleep(8)

        # Read newly appended log content
        new_bytes = ""
        if os.path.exists(log_path):
            with open(log_path, "rb") as f:
                f.seek(pre_size)
                new_bytes = f.read().decode(errors="ignore")

        print("=== new backend.err.log excerpt ===")
        print(new_bytes[-4000:])

        # cleanup
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)

        # We ONLY flag *unexpected* Resend errors. A 403 "testing emails" is acceptable.
        if "Resend alert failed" in new_bytes:
            # extract lines with the failure for reporting
            lines = [ln for ln in new_bytes.splitlines() if "Resend alert failed" in ln]
            excerpt = "\n".join(lines)
            # Resend sandbox restriction (testing emails only) is acceptable
            acceptable = ("testing emails" in excerpt.lower()
                          or "you can only send" in excerpt.lower()
                          or "403" in excerpt)
            if not acceptable:
                pytest.fail(f"Unexpected Resend alert failure in backend log:\n{excerpt}")
            else:
                print(f"NOTE: acceptable Resend sandbox restriction: {excerpt}")
