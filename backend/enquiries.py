import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, Field

from auth import require_admin
from alerts import send_enquiry_alert, alerts_status, send_status_email

router = APIRouter(prefix="/enquiries")
_db = None
STATUSES = ["new", "replied", "booked", "closed"]


def init(db):
    global _db
    _db = db


class EnquiryIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=5, max_length=40)
    email: Optional[str] = Field(default=None, max_length=160)
    service: str = Field(default="Bridal", max_length=60)
    date: Optional[str] = Field(default=None, max_length=40)
    message: Optional[str] = Field(default=None, max_length=2000)
    look: Optional[str] = Field(default=None, max_length=80)
    look_image: Optional[str] = Field(default=None, max_length=600)
    source: Optional[str] = Field(default="form", max_length=20)
    terms_accepted: Optional[bool] = None


class Enquiry(EnquiryIn):
    id: str
    status: str
    seen: bool = False
    created_at: str
    updated_at: str


class StatusIn(BaseModel):
    status: str


@router.post("", response_model=Enquiry, status_code=201)
async def create_enquiry(body: EnquiryIn, bg: BackgroundTasks):
    now = datetime.now(timezone.utc).isoformat()
    doc = {**body.model_dump(), "id": str(uuid.uuid4()), "status": "new", "seen": False, "created_at": now, "updated_at": now}
    await _db.enquiries.insert_one(dict(doc))
    bg.add_task(send_enquiry_alert, doc, "new")
    return doc


@router.get("", response_model=List[Enquiry])
async def list_enquiries(status: Optional[str] = Query(default=None), _: dict = Depends(require_admin)):
    q = {"status": status} if status and status != "all" else {}
    return await _db.enquiries.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.get("/stats")
async def stats(_: dict = Depends(require_admin)):
    out = {s: await _db.enquiries.count_documents({"status": s}) for s in STATUSES}
    out["total"] = sum(out.values())
    out["unseen"] = await _db.enquiries.count_documents({"seen": {"$ne": True}})
    out["alerts"] = alerts_status()
    return out


@router.post("/mark-seen")
async def mark_seen(_: dict = Depends(require_admin)):
    res = await _db.enquiries.update_many({"seen": {"$ne": True}}, {"$set": {"seen": True}})
    return {"marked": res.modified_count}


@router.patch("/{enquiry_id}", response_model=Enquiry)
async def update_status(enquiry_id: str, body: StatusIn, bg: BackgroundTasks, _: dict = Depends(require_admin)):
    if body.status not in STATUSES:
        raise HTTPException(status_code=400, detail=f"status must be one of {STATUSES}")
    now = datetime.now(timezone.utc).isoformat()
    res = await _db.enquiries.find_one_and_update({"id": enquiry_id}, {"$set": {"status": body.status, "seen": True, "updated_at": now}}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    if body.status == "booked":
        bg.add_task(send_enquiry_alert, res, "booked")
    return res


@router.delete("/{enquiry_id}", status_code=204)
async def delete_enquiry(enquiry_id: str, _: dict = Depends(require_admin)):
    res = await _db.enquiries.delete_one({"id": enquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")


@router.post("/{enquiry_id}/accept", response_model=Enquiry)
async def accept_enquiry(enquiry_id: str, bg: BackgroundTasks, _: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    res = await _db.enquiries.find_one_and_update({"id": enquiry_id}, {"$set": {"status": "booked", "seen": True, "updated_at": now}}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    bg.add_task(send_enquiry_alert, res, "booked")
    bg.add_task(send_status_email, res, "accepted")
    return res


@router.post("/{enquiry_id}/reject", response_model=Enquiry)
async def reject_enquiry(enquiry_id: str, bg: BackgroundTasks, _: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    res = await _db.enquiries.find_one_and_update({"id": enquiry_id}, {"$set": {"status": "closed", "seen": True, "updated_at": now}}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    bg.add_task(send_status_email, res, "rejected")
    return res
