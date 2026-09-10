"""Backend tests for iteration 3 features: content CRUD, alerts, looks, transcribe."""
import base64
import io
import os
import time
import pytest
import requests

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


# ---- CONTENT: PRICING ----
class TestPricing:
    created_id = None

    def test_list_pricing_seeded(self):
        r = requests.get(f"{BASE_URL}/api/content/pricing", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6, f"expected >=6 seeded pricing rows, got {len(items)}"
        # No _id leaking
        for it in items:
            assert "_id" not in it
            assert "id" in it and "title" in it and "price" in it

    def test_create_pricing_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/content/pricing",
                          json={"price": "₹1", "title": "X", "desc": "y", "featured": False}, timeout=10)
        assert r.status_code == 401

    def test_create_update_delete_pricing(self, auth_headers):
        payload = {"price": "₹123", "title": "TEST_Package", "desc": "test desc", "featured": True}
        r = requests.post(f"{BASE_URL}/api/content/pricing", json=payload, headers=auth_headers, timeout=10)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["title"] == "TEST_Package"
        assert data["featured"] is True
        pid = data["id"]
        TestPricing.created_id = pid

        # verify via list
        listed = requests.get(f"{BASE_URL}/api/content/pricing", timeout=10).json()
        assert any(x["id"] == pid and x["title"] == "TEST_Package" for x in listed)

        # update
        upd = {"price": "₹456", "title": "TEST_Updated", "desc": "d2", "featured": False}
        r2 = requests.put(f"{BASE_URL}/api/content/pricing/{pid}", json=upd, headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_Updated"

        # verify
        listed2 = requests.get(f"{BASE_URL}/api/content/pricing", timeout=10).json()
        assert any(x["id"] == pid and x["title"] == "TEST_Updated" for x in listed2)

        # delete
        r3 = requests.delete(f"{BASE_URL}/api/content/pricing/{pid}", headers=auth_headers, timeout=10)
        assert r3.status_code == 204
        listed3 = requests.get(f"{BASE_URL}/api/content/pricing", timeout=10).json()
        assert not any(x["id"] == pid for x in listed3)


# ---- CONTENT: PORTFOLIO ----
class TestPortfolio:
    created_id = None
    created_url = None

    def test_list_portfolio_seeded(self):
        r = requests.get(f"{BASE_URL}/api/content/portfolio", timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 9, f"expected >=9 seeded portfolio items, got {len(items)}"
        for it in items:
            assert "_id" not in it

    def test_upload_portfolio_requires_auth(self):
        with open(SAMPLE_FACE, "rb") as f:
            files = {"file": ("sample.jpg", f, "image/jpeg")}
            r = requests.post(f"{BASE_URL}/api/content/portfolio",
                              files=files, data={"cat": "Bridal", "caption": "x"}, timeout=15)
        assert r.status_code == 401

    def test_upload_portfolio_bad_extension(self, auth_headers):
        files = {"file": ("bad.txt", io.BytesIO(b"hello world " * 100), "text/plain")}
        r = requests.post(f"{BASE_URL}/api/content/portfolio",
                          files=files, data={"cat": "Bridal", "caption": "x"},
                          headers=auth_headers, timeout=15)
        assert r.status_code == 400

    def test_upload_patch_delete_portfolio(self, auth_headers):
        with open(SAMPLE_FACE, "rb") as f:
            files = {"file": ("sample-face.jpg", f, "image/jpeg")}
            r = requests.post(f"{BASE_URL}/api/content/portfolio",
                              files=files,
                              data={"cat": "Bridal", "caption": "TEST_e2e_photo"},
                              headers=auth_headers, timeout=30)
        assert r.status_code == 201, r.text
        item = r.json()
        assert item["cat"] == "Bridal"
        assert item["caption"] == "TEST_e2e_photo"
        assert item["image"].startswith("/api/files/"), item["image"]
        TestPortfolio.created_id = item["id"]
        TestPortfolio.created_url = item["image"]

        # GET the file (public)
        r_img = requests.get(f"{BASE_URL}{item['image']}", timeout=15)
        assert r_img.status_code == 200
        assert r_img.headers.get("content-type", "").startswith("image/")
        assert len(r_img.content) > 500

        # PATCH cat
        r2 = requests.patch(f"{BASE_URL}/api/content/portfolio/{item['id']}",
                            json={"cat": "Editorial"}, headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["cat"] == "Editorial"

        # DELETE (soft)
        r3 = requests.delete(f"{BASE_URL}/api/content/portfolio/{item['id']}",
                             headers=auth_headers, timeout=10)
        assert r3.status_code == 204

        listed = requests.get(f"{BASE_URL}/api/content/portfolio", timeout=10).json()
        assert not any(x["id"] == item["id"] for x in listed)


# ---- ENQUIRY ALERTS + SEEN ----
class TestAlerts:
    created_id = None

    def test_alerts_status_shape(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/enquiries/stats", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "unseen" in data
        assert "alerts" in data
        assert data["alerts"] == {"email": False, "in_app": True}

    def test_create_increments_unseen_then_mark_seen(self, auth_headers):
        stats0 = requests.get(f"{BASE_URL}/api/enquiries/stats", headers=auth_headers, timeout=10).json()
        base_unseen = stats0["unseen"]

        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_Alert", "phone": "+911234567890",
                                "service": "Bridal", "message": "hi",
                                "look_image": "/api/files/foo.jpg", "source": "voice"},
                          timeout=10)
        assert r.status_code == 201
        data = r.json()
        assert data["seen"] is False
        assert data["look_image"] == "/api/files/foo.jpg"
        assert data["source"] == "voice"
        TestAlerts.created_id = data["id"]

        stats1 = requests.get(f"{BASE_URL}/api/enquiries/stats", headers=auth_headers, timeout=10).json()
        assert stats1["unseen"] == base_unseen + 1

        # Confirm admin list includes look_image + source
        lst = requests.get(f"{BASE_URL}/api/enquiries?status=new", headers=auth_headers, timeout=10).json()
        found = [e for e in lst if e["id"] == data["id"]]
        assert found and found[0]["look_image"] == "/api/files/foo.jpg"
        assert found[0]["source"] == "voice"

        # mark seen
        r2 = requests.post(f"{BASE_URL}/api/enquiries/mark-seen", headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["marked"] >= 1

        stats2 = requests.get(f"{BASE_URL}/api/enquiries/stats", headers=auth_headers, timeout=10).json()
        assert stats2["unseen"] == 0

    def test_patch_status_sets_seen(self, auth_headers):
        # create one, mark unseen implicitly
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_Patch", "phone": "+919999900000"}, timeout=10)
        eid = r.json()["id"]
        stats_a = requests.get(f"{BASE_URL}/api/enquiries/stats", headers=auth_headers, timeout=10).json()
        assert stats_a["unseen"] >= 1

        r2 = requests.patch(f"{BASE_URL}/api/enquiries/{eid}",
                            json={"status": "replied"}, headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["seen"] is True

        # cleanup
        requests.delete(f"{BASE_URL}/api/enquiries/{eid}", headers=auth_headers, timeout=10)
        # cleanup TestAlerts too
        if TestAlerts.created_id:
            requests.delete(f"{BASE_URL}/api/enquiries/{TestAlerts.created_id}",
                            headers=auth_headers, timeout=10)


# ---- STUDIO LOOKS ----
class TestLooks:
    def test_invalid_look_image(self):
        r = requests.post(f"{BASE_URL}/api/studio/looks",
                          json={"image": "not-a-data-url", "look": "Bridal Classic"}, timeout=10)
        assert r.status_code == 400

    def test_upload_look_and_fetch(self):
        with open(SAMPLE_FACE, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        r = requests.post(f"{BASE_URL}/api/studio/looks",
                          json={"image": f"data:image/jpeg;base64,{b64}",
                                "look": "Bridal Classic"}, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].startswith("/api/files/")
        assert data["look"] == "Bridal Classic"

        # fetch it
        img = requests.get(f"{BASE_URL}{data['url']}", timeout=15)
        assert img.status_code == 200
        assert img.headers.get("content-type", "").startswith("image/")


# ---- STUDIO TRANSCRIBE ----
class TestTranscribe:
    def test_tiny_file_rejected(self):
        files = {"file": ("tiny.webm", io.BytesIO(b"x" * 100), "audio/webm")}
        r = requests.post(f"{BASE_URL}/api/studio/transcribe", files=files, timeout=15)
        assert r.status_code == 400

    def test_transcribe_speech_sample(self):
        """Generate a real speech sample using espeak (if available) and verify extraction.
        Uses <=1 LLM call. Skips if espeak not available."""
        import subprocess
        wav = "/tmp/rk_test_speech.wav"
        text = ("Hi, my name is Priya Sharma, my number is 98765 43210, "
                "I need bridal makeup on the 14th of February 2027")
        # try espeak-ng first, then espeak
        cmd = None
        for bin_ in ("espeak-ng", "espeak"):
            if subprocess.run(["which", bin_], capture_output=True).returncode == 0:
                cmd = [bin_, "-s", "150", "-w", wav, text]
                break
        if not cmd:
            pytest.skip("espeak not installed - skipping real-speech transcribe test")
        subprocess.run(cmd, check=True, capture_output=True)
        assert os.path.getsize(wav) > 1000

        with open(wav, "rb") as f:
            files = {"file": ("speech.wav", f, "audio/wav")}
            r = requests.post(f"{BASE_URL}/api/studio/transcribe", files=files, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "transcript" in data
        assert "fields" in data
        f = data["fields"]
        # all expected keys present
        for k in ("name", "phone", "email", "service", "date", "message"):
            assert k in f
        # sanity: transcript non-empty
        assert data["transcript"].strip()
        # best-effort extraction assertions (log if not matched but don't fail hard)
        # We assert name/date match — required by review request
        print("TRANSCRIPT:", data["transcript"])
        print("FIELDS:", f)
        assert f.get("name") and "priya" in f["name"].lower(), f"name not extracted: {f.get('name')}"
        assert f.get("date") == "2027-02-14", f"date mismatch: {f.get('date')}"
