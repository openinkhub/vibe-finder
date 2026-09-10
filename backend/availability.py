import uuid
import re
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field, field_validator

from auth import require_admin

router = APIRouter(prefix="/availability")
_db = None
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def init(db):
    global _db
    _db = db


class SlotIn(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    full_day: bool = False
    start: Optional[str] = None
    end: Optional[str] = None
    note: Optional[str] = Field(default=None, max_length=120)

    @field_validator("start", "end")
    @classmethod
    def _time(cls, v):
        if v is not None and not TIME_RE.match(v):
            raise ValueError("time must be HH:MM")
        return v


class Slot(SlotIn):
    id: str
    created_at: str


@router.get("", response_model=List[Slot])
async def list_slots(month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"), start: Optional[str] = None, end: Optional[str] = None):
    q = {}
    if month:
        q["date"] = {"$regex": f"^{month}"}
    elif start or end:
        q["date"] = {k: v for k, v in (("$gte", start), ("$lte", end)) if v}
    return await _db.bookings.find(q, {"_id": 0}).sort([("date", 1), ("start", 1)]).to_list(1000)


@router.post("", response_model=Slot, status_code=201)
async def create_slot(body: SlotIn, _: dict = Depends(require_admin)):
    if not body.full_day:
        if not body.start or not body.end:
            raise HTTPException(status_code=400, detail="Provide start and end time, or mark the full day")
        if body.start >= body.end:
            raise HTTPException(status_code=400, detail="End time must be after start time")
    doc = {**body.model_dump(), "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
    if body.full_day:
        doc["start"], doc["end"] = None, None
    await _db.bookings.insert_one(dict(doc))
    return doc


@router.delete("/{slot_id}", status_code=204)
async def delete_slot(slot_id: str, _: dict = Depends(require_admin)):
    if (await _db.bookings.delete_one({"id": slot_id})).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slot not found")
