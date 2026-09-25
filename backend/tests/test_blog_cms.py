"""Blog CMS + technical SEO tests (iteration 12)."""
import os
import io
import re
import json
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vibe-finder-76.preview.emergentagent.com').rstrip('/')
FRONTEND_ORIGIN = BASE_URL  # same origin routes / vs /api
ADMIN_EMAIL = "admin@rekhakrishnamurthy.com"
ADMIN_PW = "Rekha@Admin2026"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text[:200]}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def api_key(admin_headers):
    r = requests.get(f"{BASE_URL}/api/blog/api-key", headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["api_key"]


def _jpeg_bytes(size=(1200, 800)):
    img = Image.new("RGB", size, (200, 100, 120))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


# ---------- Blog CRUD ----------
class TestBlogCRUD:
    created_id = None
    created_slug = None

    def test_list_seeded_posts(self):
        r = requests.get(f"{BASE_URL}/api/blog", timeout=15)
        assert r.status_code == 200
        data = r.json()
        slugs = {p["slug"] for p in data}
        assert "how-far-in-advance-to-book-bridal-makeup" in slugs
        assert "hd-vs-airbrush-makeup" in slugs
        assert "south-indian-bridal-look-checklist" in slugs
        assert len(data) >= 3

    def test_get_post_by_slug_has_schema(self):
        r = requests.get(f"{BASE_URL}/api/blog/how-far-in-advance-to-book-bridal-makeup", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["author"] == "Rekha Krishnamurthy"
        assert d["schema"]["article"]["@type"] == "BlogPosting"
        assert d["schema"]["author"]["name"] == "Rekha Krishnamurthy"

    def test_create_post_via_api_key_converts_webp(self, api_key):
        files = {"file": ("bride.jpg", _jpeg_bytes(), "image/jpeg")}
        data = {
            "title": "TEST_ Blog Post For Iter12",
            "meta_title": "TEST meta title",
            "meta_description": "TEST meta desc",
            "focus_keyword": "test",
            "category": "TestCat",
            "publish_date": "2026-01-15",
            "excerpt": "TEST excerpt",
            "body": "TEST body content with **bold**.",
            "faqs": json.dumps([{"q": "Q1?", "a": "A1."}]),
            "alt_text": "Test image",
        }
        r = requests.post(f"{BASE_URL}/api/blog", data=data, files=files,
                          headers={"X-API-Key": api_key}, timeout=30)
        assert r.status_code == 201, f"{r.status_code} {r.text[:300]}"
        post = r.json()
        assert post["author"] == "Rekha Krishnamurthy"
        assert post["featured_image"].startswith("/api/files/")
        assert len(post["faqs"]) == 1
        TestBlogCRUD.created_id = post["id"]
        TestBlogCRUD.created_slug = post["slug"]

        # verify image is webp <100kb
        img_url = BASE_URL + post["featured_image"]
        ir = requests.get(img_url, timeout=15)
        assert ir.status_code == 200
        assert ir.headers.get("content-type", "").startswith("image/webp")
        assert len(ir.content) <= 100 * 1024
        assert ir.content[:4] == b"RIFF"

    def test_invalid_api_key_rejected(self):
        files = {"file": ("x.jpg", _jpeg_bytes((400, 300)), "image/jpeg")}
        r = requests.post(f"{BASE_URL}/api/blog",
                          data={"title": "TEST bad"}, files=files,
                          headers={"X-API-Key": "invalid-nonsense-123"}, timeout=15)
        assert r.status_code == 401

    def test_unauthenticated_rejected(self):
        files = {"file": ("x.jpg", _jpeg_bytes((400, 300)), "image/jpeg")}
        r = requests.post(f"{BASE_URL}/api/blog",
                          data={"title": "TEST noauth"}, files=files, timeout=15)
        assert r.status_code in (401, 403)

    def test_get_created_post_has_faq_schema(self):
        assert TestBlogCRUD.created_slug
        r = requests.get(f"{BASE_URL}/api/blog/{TestBlogCRUD.created_slug}", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["schema"]["faq"] is not None
        assert d["schema"]["faq"]["@type"] == "FAQPage"
        assert len(d["schema"]["faq"]["mainEntity"]) == 1

    def test_update_post_title(self, admin_headers):
        assert TestBlogCRUD.created_id
        r = requests.put(
            f"{BASE_URL}/api/blog/{TestBlogCRUD.created_id}",
            data={"title": "TEST_ Updated Title Iter12", "excerpt": "updated", "body": "updated body",
                  "faqs": "[]", "category": "TestCat", "publish_date": "2026-01-15"},
            headers=admin_headers, timeout=20,
        )
        assert r.status_code == 200, r.text[:200]
        assert r.json()["title"] == "TEST_ Updated Title Iter12"

    def test_delete_post(self, admin_headers):
        assert TestBlogCRUD.created_id
        r = requests.delete(f"{BASE_URL}/api/blog/{TestBlogCRUD.created_id}",
                            headers=admin_headers, timeout=15)
        assert r.status_code == 204
        # verify gone
        r2 = requests.get(f"{BASE_URL}/api/blog/{TestBlogCRUD.created_slug}", timeout=10)
        assert r2.status_code == 404


# ---------- API key regeneration ----------
class TestApiKey:
    def test_regenerate_invalidates_old(self, admin_headers):
        r1 = requests.get(f"{BASE_URL}/api/blog/api-key", headers=admin_headers, timeout=10)
        old_key = r1.json()["api_key"]
        r2 = requests.post(f"{BASE_URL}/api/blog/api-key/regenerate", headers=admin_headers, timeout=10)
        assert r2.status_code == 200
        new_key = r2.json()["api_key"]
        assert new_key != old_key
        # old key should now fail
        files = {"file": ("x.jpg", _jpeg_bytes((300, 200)), "image/jpeg")}
        r3 = requests.post(f"{BASE_URL}/api/blog",
                           data={"title": "TEST old key"}, files=files,
                           headers={"X-API-Key": old_key}, timeout=15)
        assert r3.status_code == 401

    def test_api_key_endpoint_requires_admin(self):
        r = requests.get(f"{BASE_URL}/api/blog/api-key", timeout=10)
        assert r.status_code in (401, 403)


# ---------- Static SEO files ----------
class TestStaticSeoFiles:
    def test_robots_txt(self):
        r = requests.get(f"{FRONTEND_ORIGIN}/robots.txt", timeout=10)
        assert r.status_code == 200
        assert "Disallow: /admin" in r.text
        assert "Sitemap:" in r.text and "sitemap.xml" in r.text.lower()

    def test_sitemap_xml(self):
        r = requests.get(f"{FRONTEND_ORIGIN}/sitemap.xml", timeout=10)
        assert r.status_code == 200
        assert "<urlset" in r.text
        urls = re.findall(r"<loc>([^<]+)</loc>", r.text)
        assert len(urls) >= 50
        assert any("/blog/how-far-in-advance-to-book-bridal-makeup" in u for u in urls)

    def test_llms_txt(self):
        r = requests.get(f"{FRONTEND_ORIGIN}/llms.txt", timeout=10)
        assert r.status_code == 200
        assert len(r.text) > 50

    def test_llms_full_txt(self):
        r = requests.get(f"{FRONTEND_ORIGIN}/llms-full.txt", timeout=10)
        assert r.status_code == 200
        assert len(r.text) > 100

    def test_favicons(self):
        for f in ["favicon.ico", "favicon-32x32.png", "favicon-16x16.png", "apple-touch-icon.png"]:
            r = requests.get(f"{FRONTEND_ORIGIN}/{f}", timeout=10)
            assert r.status_code == 200, f"{f} -> {r.status_code}"
            assert len(r.content) > 100


# ---------- Regression smoke ----------
class TestRegression:
    def test_content_endpoints(self):
        for path in ["/api/content/pricing", "/api/content/portfolio", "/api/content/services"]:
            r = requests.get(f"{BASE_URL}{path}", timeout=15)
            assert r.status_code == 200, path

    def test_enquiry_submit(self):
        r = requests.post(f"{BASE_URL}/api/enquiries",
                          json={"name": "TEST_ user", "phone": "+919999999999",
                                "email": "test@example.com", "event_date": "2026-06-01",
                                "message": "TEST enquiry"}, timeout=15)
        assert r.status_code in (200, 201)
