import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Response
from pydantic import BaseModel, Field

from auth import require_admin
from storage import put_object, get_object, APP_NAME, MIME

router = APIRouter()
logger = logging.getLogger(__name__)
_db = None
MAX_UPLOAD = 8 * 1024 * 1024

DEFAULT_PRICING = [
    {"price": "₹999", "title": "Self Makeup Class", "desc": "A hands-on session to master your own everyday look.", "featured": False},
    {"price": "₹1,499", "title": "Party Makeup", "desc": "Event-ready glam, no visit charge.", "featured": False},
    {"price": "₹1,999", "title": "Non-Bridal Makeup", "desc": "For the wedding party, family & guests.", "featured": False},
    {"price": "₹2,999", "title": "Engagement Makeup", "desc": "Soft-glam for rings & pre-wedding shoots.", "featured": False},
    {"price": "On Quote", "title": "Editorial / Fashion", "desc": "Scoped to the brief, shoot, and usage.", "featured": False},
    {"price": "From ₹4,999", "title": "Bridal Makeup", "desc": "HD/airbrush, trial included, no visit charge.", "featured": True},
]
DEFAULT_PORTFOLIO = [
    {"cat": "Bridal", "caption": "Bridal · f/2.8 · Golden Hour", "image": "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9"},
    {"cat": "Reels", "caption": "Reel · Look Trial", "image": "https://images.unsplash.com/photo-1594647210801-5124307f3d51"},
    {"cat": "Editorial", "caption": "Editorial · Studio Flash", "image": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2"},
    {"cat": "Fashion", "caption": "Fashion · Backstage", "image": "https://images.unsplash.com/photo-1747847471528-7b95ea7a4c39"},
    {"cat": "Bridal", "caption": "Bridal · Airbrush Base", "image": "https://images.unsplash.com/photo-1684868268327-7e5590bcfbd6"},
    {"cat": "Reels", "caption": "Reel · GRWM", "image": "https://images.unsplash.com/photo-1551184451-76b762941ad6"},
    {"cat": "Editorial", "caption": "Editorial · Cover Story", "image": "https://images.unsplash.com/photo-1677691257363-eebd2abeafec"},
    {"cat": "Bridal", "caption": "Bridal · Reception", "image": "https://images.unsplash.com/photo-1587271315307-eaebc181c749"},
    {"cat": "Fashion", "caption": "Fashion · Runway", "image": "https://images.unsplash.com/photo-1708735808460-2b131ddefb27"},
]


def init(db):
    global _db
    _db = db


async def seed_content():
    now = datetime.now(timezone.utc).isoformat()
    if await _db.pricing.count_documents({}) == 0:
        await _db.pricing.insert_many([{**p, "id": str(uuid.uuid4()), "order": i, "created_at": now} for i, p in enumerate(DEFAULT_PRICING)])
    if await _db.portfolio.count_documents({}) == 0:
        await _db.portfolio.insert_many([{**p, "id": str(uuid.uuid4()), "order": i, "is_deleted": False, "created_at": now} for i, p in enumerate(DEFAULT_PORTFOLIO)])


class PricingIn(BaseModel):
    price: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=1, max_length=80)
    desc: str = Field(default="", max_length=300)
    featured: bool = False


class Pricing(PricingIn):
    id: str
    order: int = 0


class PortfolioItem(BaseModel):
    id: str
    cat: str
    caption: str
    image: str
    order: int = 0


class PortfolioPatch(BaseModel):
    cat: Optional[str] = Field(default=None, max_length=40)
    caption: Optional[str] = Field(default=None, max_length=120)


@router.get("/content/pricing", response_model=List[Pricing])
async def list_pricing():
    return await _db.pricing.find({}, {"_id": 0}).sort("order", 1).to_list(100)


@router.post("/content/pricing", response_model=Pricing, status_code=201)
async def create_pricing(body: PricingIn, _: dict = Depends(require_admin)):
    count = await _db.pricing.count_documents({})
    doc = {**body.model_dump(), "id": str(uuid.uuid4()), "order": count, "created_at": datetime.now(timezone.utc).isoformat()}
    await _db.pricing.insert_one(dict(doc))
    return doc


@router.put("/content/pricing/{item_id}", response_model=Pricing)
async def update_pricing(item_id: str, body: PricingIn, _: dict = Depends(require_admin)):
    res = await _db.pricing.find_one_and_update({"id": item_id}, {"$set": body.model_dump()}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    return res


@router.delete("/content/pricing/{item_id}", status_code=204)
async def delete_pricing(item_id: str, _: dict = Depends(require_admin)):
    if (await _db.pricing.delete_one({"id": item_id})).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/content/portfolio", response_model=List[PortfolioItem])
async def list_portfolio():
    return await _db.portfolio.find({"is_deleted": False}, {"_id": 0}).sort("order", 1).to_list(200)


async def store_image(data: bytes, ext: str, folder: str) -> str:
    ext = ext.lower()
    if ext not in MIME:
        raise HTTPException(status_code=400, detail="Only jpg, png, webp or gif images are allowed")
    if len(data) > MAX_UPLOAD:
        raise HTTPException(status_code=413, detail="Image must be under 8 MB")
    path = f"{APP_NAME}/{folder}/{uuid.uuid4()}.{ext}"
    try:
        result = await asyncio.to_thread(put_object, path, data, MIME[ext])
    except Exception as e:
        logger.error("storage upload failed: %s", str(e)[:200])
        raise HTTPException(status_code=502, detail="Image storage unavailable — please try again")
    await _db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": result["path"], "content_type": MIME[ext], "size": result.get("size"), "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()})
    return f"/api/files/{result['path']}"


@router.post("/content/portfolio", response_model=PortfolioItem, status_code=201)
async def create_portfolio(file: UploadFile = File(...), cat: str = Form("Bridal"), caption: str = Form(""), _: dict = Depends(require_admin)):
    ext = (file.filename or "x.jpg").rsplit(".", 1)[-1]
    url = await store_image(await file.read(), ext, "portfolio")
    count = await _db.portfolio.count_documents({})
    doc = {"id": str(uuid.uuid4()), "cat": cat[:40], "caption": caption[:120] or f"{cat} · Studio", "image": url, "order": count, "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()}
    await _db.portfolio.insert_one(dict(doc))
    return doc


@router.patch("/content/portfolio/{item_id}", response_model=PortfolioItem)
async def patch_portfolio(item_id: str, body: PortfolioPatch, _: dict = Depends(require_admin)):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await _db.portfolio.find_one_and_update({"id": item_id, "is_deleted": False}, {"$set": patch}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    return res


@router.delete("/content/portfolio/{item_id}", status_code=204)
async def delete_portfolio(item_id: str, _: dict = Depends(require_admin)):
    res = await _db.portfolio.update_one({"id": item_id, "is_deleted": False}, {"$set": {"is_deleted": True}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found")


class PageImage(BaseModel):
    path: str
    image: str


@router.get("/content/page-images", response_model=List[PageImage])
async def list_page_images():
    return await _db.page_images.find({}, {"_id": 0}).to_list(200)


@router.put("/content/page-images/{slug}", response_model=PageImage)
async def set_page_image(slug: str, file: UploadFile = File(...), _: dict = Depends(require_admin)):
    ext = (file.filename or "x.jpg").rsplit(".", 1)[-1]
    url = await store_image(await file.read(), ext, "heroes")
    doc = {"path": f"/{slug}", "image": url, "updated_at": datetime.now(timezone.utc).isoformat()}
    await _db.page_images.update_one({"path": doc["path"]}, {"$set": doc}, upsert=True)
    return doc


@router.delete("/content/page-images/{slug}", status_code=204)
async def reset_page_image(slug: str, _: dict = Depends(require_admin)):
    await _db.page_images.delete_one({"path": f"/{slug}"})



DEFAULT_SERVICES = [
    {"no": "01", "title": "Bridal Makeup", "desc": "HD & airbrush bridal looks that last from the muhurtham to the last dance — trial included.", "cta": "Book bridal", "image": "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9"},
    {"no": "02", "title": "Engagement Makeup", "desc": "Soft-glam for rings, rokas and pre-wedding shoots that photograph beautifully.", "cta": "Book engagement", "image": "https://images.unsplash.com/photo-1594647210801-5124307f3d51"},
    {"no": "03", "title": "Non-Bridal Makeup", "desc": "Sisters, mothers, bridesmaids — polished looks for everyone in the wedding party.", "cta": "Book non-bridal", "image": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2"},
    {"no": "04", "title": "Party Makeup", "desc": "Event-ready glam for receptions, galas and celebrations — no visit charge.", "cta": "Book party", "image": "https://images.unsplash.com/photo-1684868268327-7e5590bcfbd6"},
    {"no": "05", "title": "Editorial & Fashion", "desc": "Runway, campaign and cover-story makeup scoped to your brief and shoot.", "cta": "Enquire", "image": "https://images.unsplash.com/photo-1747847471528-7b95ea7a4c39"},
    {"no": "06", "title": "Self-Grooming Courses", "desc": "Hands-on classes to master your own everyday and occasion looks.", "cta": "View courses", "image": "https://images.unsplash.com/photo-1551184451-76b762941ad6"},
]


async def seed_services():
    if await _db.services.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        await _db.services.insert_many([{**s, "id": str(uuid.uuid4()), "order": i, "created_at": now} for i, s in enumerate(DEFAULT_SERVICES)])


class Service(BaseModel):
    id: str
    no: str
    title: str
    desc: str
    cta: str
    image: str
    order: int = 0


@router.get("/content/services", response_model=List[Service])
async def list_services():
    return await _db.services.find({}, {"_id": 0}).sort("order", 1).to_list(50)


@router.post("/content/services", response_model=Service, status_code=201)
async def create_service(title: str = Form(...), desc: str = Form(""), cta: str = Form("Enquire"), file: UploadFile = File(None), _: dict = Depends(require_admin)):
    count = await _db.services.count_documents({})
    image = DEFAULT_SERVICES[count % len(DEFAULT_SERVICES)]["image"]
    if file and file.filename:
        image = await store_image(await file.read(), file.filename.rsplit(".", 1)[-1], "services")
    doc = {"id": str(uuid.uuid4()), "no": str(count + 1).zfill(2), "title": title[:80], "desc": desc[:300], "cta": cta[:40], "image": image, "order": count, "created_at": datetime.now(timezone.utc).isoformat()}
    await _db.services.insert_one(dict(doc))
    return doc


@router.put("/content/services/{item_id}", response_model=Service)
async def update_service(item_id: str, title: str = Form(...), desc: str = Form(""), cta: str = Form("Enquire"), file: UploadFile = File(None), _: dict = Depends(require_admin)):
    patch = {"title": title[:80], "desc": desc[:300], "cta": cta[:40]}
    if file and file.filename:
        patch["image"] = await store_image(await file.read(), file.filename.rsplit(".", 1)[-1], "services")
    res = await _db.services.find_one_and_update({"id": item_id}, {"$set": patch}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    return res


@router.delete("/content/services/{item_id}", status_code=204)
async def delete_service(item_id: str, _: dict = Depends(require_admin)):
    if (await _db.services.delete_one({"id": item_id})).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await _db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, ct = await asyncio.to_thread(get_object, path)
    except Exception:
        raise HTTPException(status_code=502, detail="Storage unavailable")
    return Response(content=data, media_type=record.get("content_type") or ct, headers={"Cache-Control": "public, max-age=31536000, immutable"})
