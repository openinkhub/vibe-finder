import uuid
import re
import io
import json
import secrets
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from pydantic import BaseModel, Field
from PIL import Image

from auth import require_admin, get_current_user
from storage import put_object, APP_NAME

router = APIRouter(prefix="/blog")
logger = logging.getLogger(__name__)
_db = None
MAX_UPLOAD = 8 * 1024 * 1024
TARGET_BYTES = 100 * 1024
SITE_URL = "https://rekhakrishnamurthy.com"

AUTHOR_SCHEMA = {
    "@type": "Person",
    "name": "Rekha Krishnamurthy",
    "jobTitle": "Bridal & Celebrity Makeup Artist",
    "url": f"{SITE_URL}/about-us",
    "sameAs": [
        "https://www.instagram.com/makeupbyrekhakrishnamurthy/",
        "https://www.facebook.com/makeupbyrekhakrishnamurthy/",
        "https://x.com/MakeupbyRekha",
        "https://www.linkedin.com/in/rekha-krishnamurthy-6b998839",
    ],
}

DEFAULT_POSTS = [
    {"slug": "how-far-in-advance-to-book-bridal-makeup", "title": "How far in advance should you book your bridal makeup artist?", "meta_title": "How Far in Advance to Book Bridal Makeup | Rekha Krishnamurthy", "meta_description": "Wedding-season Bangalore fills 3–6 months out. Here's how to lock your muhurtham morning without stress.", "focus_keyword": "book bridal makeup artist in advance", "category": "Bridal Tips", "publish_date": "2026-05-01", "excerpt": "Wedding-season Bangalore fills 3–6 months out. Here's how to lock your muhurtham morning without stress.", "body": "Wedding-season Bangalore fills 3–6 months out. Here's how to lock your muhurtham morning without stress.\n\nPopular dates during peak wedding season get booked quickly, especially auspicious muhurtham mornings. Reaching out as soon as you have a confirmed date — even before the venue is finalised — gives you the best chance of securing your preferred artist and trial slot.", "faqs": [], "interlink_url": "/bridal-experience", "featured_image": "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9", "alt_text": "Bridal makeup artist preparing a bride"},
    {"slug": "hd-vs-airbrush-makeup", "title": "HD vs Airbrush makeup: which one is right for your wedding?", "meta_title": "HD vs Airbrush Makeup for Weddings | Rekha Krishnamurthy", "meta_description": "Both photograph beautifully — the choice depends on skin type, weather and how long your functions run.", "focus_keyword": "HD vs airbrush makeup for wedding", "category": "Bridal Tips", "publish_date": "2026-04-01", "excerpt": "Both photograph beautifully — the choice depends on skin type, weather and how long your functions run.", "body": "Both photograph beautifully — the choice depends on skin type, weather and how long your functions run.\n\nHD makeup uses cream and powder formulas and tends to suit most skin types across long functions. Airbrush makeup uses a fine mist application for an ultra-lightweight, breathable finish that many brides love in humid weather.", "faqs": [], "interlink_url": "/hd-makeup", "featured_image": "https://images.unsplash.com/photo-1594647210801-5124307f3d51", "alt_text": "HD and airbrush makeup comparison"},
    {"slug": "south-indian-bridal-look-checklist", "title": "The South Indian bridal look checklist", "meta_title": "South Indian Bridal Look Checklist | Rekha Krishnamurthy", "meta_description": "Kanjeevaram colour matching, temple-jewellery hair and kohl that lasts twelve hours.", "focus_keyword": "south indian bridal look checklist", "category": "Bridal Tips", "publish_date": "2026-03-01", "excerpt": "Kanjeevaram colour matching, temple-jewellery hair and kohl that lasts twelve hours.", "body": "Kanjeevaram colour matching, temple-jewellery hair and kohl that lasts twelve hours.\n\nFrom matching your base to the undertones of your Kanjeevaram silk, to styling hair that carries the weight of temple jewellery through hours of rituals, a South Indian bridal look has its own set of planning details worth getting right.", "faqs": [], "interlink_url": "/south-indian-bridal-makeup-artist-in-karnataka", "featured_image": "https://images.unsplash.com/photo-1587271315307-eaebc181c749", "alt_text": "South Indian bridal look with temple jewellery"},
]


def init(db):
    global _db
    _db = db


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or str(uuid.uuid4())[:8]


def to_webp_under_100kb(data: bytes) -> bytes:
    img = Image.open(io.BytesIO(data)).convert("RGB")
    max_dim = 1600
    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        img = img.resize((max(1, int(img.width * ratio)), max(1, int(img.height * ratio))))
    quality = 85
    out = b""
    while quality >= 20:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=quality)
        out = buf.getvalue()
        if len(out) <= TARGET_BYTES:
            return out
        quality -= 10
    while len(out) > TARGET_BYTES and max(img.size) > 300:
        img = img.resize((max(1, int(img.width * 0.8)), max(1, int(img.height * 0.8))))
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=40)
        out = buf.getvalue()
    return out


async def store_featured_image(data: bytes) -> str:
    if len(data) > MAX_UPLOAD:
        raise HTTPException(status_code=413, detail="Image must be under 8 MB")
    try:
        webp_bytes = await asyncio.to_thread(to_webp_under_100kb, data)
    except Exception as e:
        logger.error("image conversion failed: %s", str(e)[:200])
        raise HTTPException(status_code=400, detail="Could not process this image — please try a different file")
    path = f"{APP_NAME}/blog/{uuid.uuid4()}.webp"
    try:
        result = await asyncio.to_thread(put_object, path, webp_bytes, "image/webp")
    except Exception as e:
        logger.error("storage upload failed: %s", str(e)[:200])
        raise HTTPException(status_code=502, detail="Image storage unavailable — please try again")
    await _db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": result["path"], "content_type": "image/webp", "size": result.get("size"), "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()})
    return f"/api/files/{result['path']}"


async def get_or_create_api_key() -> str:
    doc = await _db.settings.find_one({"key": "blog_api_key"})
    if doc:
        return doc["value"]
    value = secrets.token_urlsafe(32)
    await _db.settings.update_one({"key": "blog_api_key"}, {"$set": {"value": value}}, upsert=True)
    return value


async def require_admin_or_api_key(request: Request) -> dict:
    api_key = request.headers.get("X-API-Key")
    if api_key:
        stored = await get_or_create_api_key()
        if api_key == stored:
            return {"role": "api_key"}
        raise HTTPException(status_code=401, detail="Invalid API key")
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


async def seed_blog():
    if await _db.blog_posts.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = [{**p, "id": str(uuid.uuid4()), "author": "Rekha Krishnamurthy", "order": i, "created_at": now, "updated_at": now} for i, p in enumerate(DEFAULT_POSTS)]
        await _db.blog_posts.insert_many(docs)
    await get_or_create_api_key()


class FAQItem(BaseModel):
    q: str = Field(min_length=1, max_length=200)
    a: str = Field(min_length=1, max_length=1000)


class BlogOut(BaseModel):
    id: str
    slug: str
    title: str
    meta_title: str
    meta_description: str
    focus_keyword: Optional[str] = ""
    category: str = "General"
    author: str = "Rekha Krishnamurthy"
    publish_date: str
    excerpt: str
    body: str
    faqs: List[FAQItem] = []
    interlink_url: Optional[str] = ""
    featured_image: str
    alt_text: str = ""


@router.get("/api-key")
async def get_api_key(_: dict = Depends(require_admin)):
    return {"api_key": await get_or_create_api_key()}


@router.post("/api-key/regenerate")
async def regen_api_key(_: dict = Depends(require_admin)):
    value = secrets.token_urlsafe(32)
    await _db.settings.update_one({"key": "blog_api_key"}, {"$set": {"value": value}}, upsert=True)
    return {"api_key": value}


@router.get("", response_model=List[BlogOut])
async def list_posts():
    return await _db.blog_posts.find({}, {"_id": 0}).sort("publish_date", -1).to_list(500)


def build_schema(post: dict) -> dict:
    article = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": f"{SITE_URL}/blog/{post['slug']}",
        "headline": post["title"],
        "description": post.get("meta_description") or post.get("excerpt"),
        "image": post.get("featured_image"),
        "author": AUTHOR_SCHEMA,
        "datePublished": post.get("publish_date"),
        "publisher": {"@type": "Organization", "name": "Rekha Krishnamurthy Makeup & Academy", "logo": {"@type": "ImageObject", "url": f"{SITE_URL}/logo.png"}},
    }
    faq_schema = None
    if post.get("faqs"):
        faq_schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": f["a"]}} for f in post["faqs"]],
        }
    return {"article": article, "faq": faq_schema, "author": {"@context": "https://schema.org", **AUTHOR_SCHEMA}}


@router.get("/{slug}")
async def get_post(slug: str):
    post = await _db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {**post, "schema": build_schema(post)}


def _parse_faqs(faqs: str) -> list:
    try:
        parsed = json.loads(faqs) if faqs else []
    except Exception:
        raise HTTPException(status_code=400, detail="faqs must be valid JSON")
    if not isinstance(parsed, list):
        raise HTTPException(status_code=400, detail="faqs must be a list")
    return [{"q": str(f.get("q", ""))[:200], "a": str(f.get("a", ""))[:1000]} for f in parsed if f.get("q") and f.get("a")]


@router.post("", response_model=BlogOut, status_code=201)
async def create_post(
    title: str = Form(...),
    slug: str = Form(""),
    meta_title: str = Form(""),
    meta_description: str = Form(""),
    focus_keyword: str = Form(""),
    category: str = Form("General"),
    publish_date: str = Form(""),
    excerpt: str = Form(""),
    body: str = Form(""),
    faqs: str = Form("[]"),
    interlink_url: str = Form(""),
    alt_text: str = Form(""),
    file: UploadFile = File(None),
    _: dict = Depends(require_admin_or_api_key),
):
    faq_list = _parse_faqs(faqs)
    final_slug = slugify(slug or title)
    if await _db.blog_posts.find_one({"slug": final_slug}):
        final_slug = f"{final_slug}-{str(uuid.uuid4())[:6]}"
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Featured image is required")
    image_url = await store_featured_image(await file.read())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "slug": final_slug,
        "title": title[:150],
        "meta_title": (meta_title or title)[:70],
        "meta_description": (meta_description or excerpt)[:160],
        "focus_keyword": focus_keyword[:80],
        "category": category[:40] or "General",
        "author": "Rekha Krishnamurthy",
        "publish_date": publish_date or now[:10],
        "excerpt": excerpt[:300],
        "body": body,
        "faqs": faq_list,
        "interlink_url": interlink_url[:200],
        "featured_image": image_url,
        "alt_text": alt_text[:150] or title,
        "order": 0,
        "created_at": now,
        "updated_at": now,
    }
    await _db.blog_posts.insert_one(dict(doc))
    await regenerate_sitemap()
    return doc


@router.put("/{post_id}", response_model=BlogOut)
async def update_post(
    post_id: str,
    title: str = Form(...),
    slug: str = Form(""),
    meta_title: str = Form(""),
    meta_description: str = Form(""),
    focus_keyword: str = Form(""),
    category: str = Form("General"),
    publish_date: str = Form(""),
    excerpt: str = Form(""),
    body: str = Form(""),
    faqs: str = Form("[]"),
    interlink_url: str = Form(""),
    alt_text: str = Form(""),
    file: UploadFile = File(None),
    _: dict = Depends(require_admin),
):
    existing = await _db.blog_posts.find_one({"id": post_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    faq_list = _parse_faqs(faqs)
    final_slug = slugify(slug or title)
    if final_slug != existing["slug"] and await _db.blog_posts.find_one({"slug": final_slug, "id": {"$ne": post_id}}):
        final_slug = f"{final_slug}-{str(uuid.uuid4())[:6]}"
    patch = {
        "slug": final_slug,
        "title": title[:150],
        "meta_title": (meta_title or title)[:70],
        "meta_description": (meta_description or excerpt)[:160],
        "focus_keyword": focus_keyword[:80],
        "category": category[:40] or "General",
        "publish_date": publish_date or existing["publish_date"],
        "excerpt": excerpt[:300],
        "body": body,
        "faqs": faq_list,
        "interlink_url": interlink_url[:200],
        "alt_text": alt_text[:150] or title,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if file and file.filename:
        patch["featured_image"] = await store_featured_image(await file.read())
    res = await _db.blog_posts.find_one_and_update({"id": post_id}, {"$set": patch}, projection={"_id": 0}, return_document=True)
    await regenerate_sitemap()
    return res


@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: str, _: dict = Depends(require_admin)):
    if (await _db.blog_posts.delete_one({"id": post_id})).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    await regenerate_sitemap()


async def regenerate_sitemap():
    try:
        import pathlib
        pages_path = pathlib.Path(__file__).parent.parent / "frontend" / "src" / "content" / "pages.json"
        sitemap_path = pathlib.Path(__file__).parent.parent / "frontend" / "public" / "sitemap.xml"
        pages = json.loads(pages_path.read_text())
        urls = [p["canonical"] for p in pages if p.get("canonical")]
        posts = await _db.blog_posts.find({}, {"_id": 0, "slug": 1}).to_list(1000)
        urls += [f"{SITE_URL}/blog/{p['slug']}" for p in posts]
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        body = "\n".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
        xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n'
        sitemap_path.write_text(xml)
    except Exception as e:
        logger.error("sitemap regeneration failed: %s", str(e)[:200])
