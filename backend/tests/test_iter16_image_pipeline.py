# Iteration 16: Portfolio + Page-hero upload pipeline (WEBP resize/compress) and alt_text
import io
import os
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN = {"email": "admin@rekhakrishnamurthy.com", "password": "Rekha@Admin2026"}
HERO_SLUG = "about-us"


def noisy_jpeg(w, h):
    # gradient + noise so it compresses like a real photo (not trivially tiny)
    img = Image.effect_noise((w // 4, h // 4), 60).convert("RGB").resize((w, h), Image.BICUBIC)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    assert len(buf.getvalue()) < 8 * 1024 * 1024
    return buf.getvalue()


def solid_png(w, h):
    buf = io.BytesIO()
    Image.new("RGB", (w, h), (230, 46, 107)).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    sess.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return sess


@pytest.fixture(scope="module")
def created():
    ids = []
    yield ids


@pytest.fixture(scope="module", autouse=True)
def cleanup(s, created):
    pre = {x["path"]: x for x in requests.get(f"{BASE_URL}/api/content/page-images").json()}
    assert f"/{HERO_SLUG}" not in pre, "about-us already has a custom hero; refusing to override real data"
    yield
    for i in created:
        s.delete(f"{BASE_URL}/api/content/portfolio/{i}")
    s.delete(f"{BASE_URL}/api/content/page-images/{HERO_SLUG}")


def fetch_img(url):
    r = requests.get(f"{BASE_URL}{url}")
    assert r.status_code == 200
    img = Image.open(io.BytesIO(r.content))
    return r, img


class TestPortfolioPipeline:
    def test_upload_large_noisy_resized_webp(self, s, created):
        data = noisy_jpeg(3000, 4000)
        assert len(data) > 150 * 1024
        r = s.post(f"{BASE_URL}/api/content/portfolio", files={"file": ("big.jpg", data, "image/jpeg")},
                   data={"cat": "Bridal", "caption": "TEST_cap", "alt_text": "TEST_alt bride"}, timeout=120)
        assert r.status_code == 201, r.text
        d = r.json()
        created.append(d["id"])
        assert d["alt_text"] == "TEST_alt bride" and d["caption"] == "TEST_cap"
        assert d["image"].endswith(".webp")
        resp, img = fetch_img(d["image"])
        print("portfolio noisy:", img.format, img.size, len(resp.content))
        assert img.format == "WEBP"
        assert max(img.size) <= 1800
        assert len(resp.content) <= 200 * 1024
        assert "webp" in resp.headers.get("content-type", "")

    def test_upload_solid_default_alt(self, s, created):
        r = s.post(f"{BASE_URL}/api/content/portfolio", files={"file": ("s.png", solid_png(4000, 3000), "image/png")},
                   data={"cat": "Bridal", "caption": "TEST_solid"}, timeout=120)
        assert r.status_code == 201
        d = r.json(); created.append(d["id"])
        assert d["alt_text"] and "None" not in d["alt_text"] and "undefined" not in d["alt_text"]
        resp, img = fetch_img(d["image"])
        assert img.format == "WEBP" and img.size == (1800, 1350)
        assert len(resp.content) < 300 * 1024

    def test_list_contains_and_patch_alt(self, s, created):
        pid = created[0]
        r = s.patch(f"{BASE_URL}/api/content/portfolio/{pid}", json={"cat": "Engagement", "caption": "TEST_cap2", "alt_text": "TEST_alt2"})
        assert r.status_code == 200
        items = {x["id"]: x for x in requests.get(f"{BASE_URL}/api/content/portfolio").json()}
        assert items[pid]["alt_text"] == "TEST_alt2" and items[pid]["caption"] == "TEST_cap2" and items[pid]["cat"] == "Engagement"

    def test_patch_alt_too_long(self, s, created):
        r = s.patch(f"{BASE_URL}/api/content/portfolio/{created[0]}", json={"alt_text": "x" * 200})
        assert r.status_code == 422

    def test_invalid_file_rejected(self, s):
        r = s.post(f"{BASE_URL}/api/content/portfolio", files={"file": ("x.jpg", b"notanimage", "image/jpeg")}, data={"cat": "Bridal"})
        assert r.status_code == 400

    def test_requires_admin(self):
        r = requests.post(f"{BASE_URL}/api/content/portfolio", files={"file": ("s.png", solid_png(10, 10), "image/png")})
        assert r.status_code in (401, 403)

    def test_legacy_items_alt_safe(self):
        for x in requests.get(f"{BASE_URL}/api/content/portfolio").json():
            assert x.get("alt_text") is not None
            assert x["caption"]


class TestHeroPipeline:
    def test_set_hero_resized_webp(self, s):
        r = s.put(f"{BASE_URL}/api/content/page-images/{HERO_SLUG}", files={"file": ("h.jpg", noisy_jpeg(4000, 3000), "image/jpeg")},
                  data={"alt_text": "TEST_hero alt"}, timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["path"] == f"/{HERO_SLUG}" and d["alt_text"] == "TEST_hero alt"
        resp, img = fetch_img(d["image"])
        print("hero noisy:", img.format, img.size, len(resp.content))
        assert img.format == "WEBP" and max(img.size) <= 1920 and len(resp.content) <= 220 * 1024
        lst = {x["path"]: x for x in requests.get(f"{BASE_URL}/api/content/page-images").json()}
        assert lst[f"/{HERO_SLUG}"]["alt_text"] == "TEST_hero alt"

    def test_reset_hero(self, s):
        r = s.delete(f"{BASE_URL}/api/content/page-images/{HERO_SLUG}")
        assert r.status_code == 204
        lst = {x["path"] for x in requests.get(f"{BASE_URL}/api/content/page-images").json()}
        assert f"/{HERO_SLUG}" not in lst

    def test_hero_requires_admin(self):
        r = requests.put(f"{BASE_URL}/api/content/page-images/{HERO_SLUG}", files={"file": ("s.png", solid_png(10, 10), "image/png")})
        assert r.status_code in (401, 403)
