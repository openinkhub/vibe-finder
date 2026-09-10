import os
import re
import json
import uuid
import base64
import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
from emergentintegrations.llm.openai import OpenAISpeechToText

router = APIRouter(prefix="/studio")
logger = logging.getLogger(__name__)
MODEL = "gemini-3.1-flash-image-preview"
MAX_BYTES = 6 * 1024 * 1024


class Look(BaseModel):
    name: str = "Custom"
    lips: str | None = None
    blush: str | None = None
    eyes: str | None = None
    intensity: float = 0.8
    liner: bool = True
    gloss: bool = True


class GenerateIn(BaseModel):
    image: str = Field(description="data URL or raw base64 of the face photo")
    look: Look


def _strength(i: float) -> str:
    return "soft, natural" if i < 0.5 else "medium, polished" if i < 0.8 else "bold, full-glam"


def _prompt(look: Look) -> str:
    parts = [f"Apply professional {look.name} bridal-grade makeup to the person in this photo — {_strength(look.intensity)} intensity."]
    if look.lips:
        parts.append(f"Lipstick in exactly this shade: {look.lips}" + (" with a glossy finish." if look.gloss else " with a matte finish."))
    if look.blush:
        parts.append(f"Blush on the cheeks in shade {look.blush}, softly blended.")
    if look.eyes:
        parts.append(f"Eyeshadow in shade {look.eyes}, blended across the lid and crease.")
    if look.liner:
        parts.append("Add defined eyeliner, fuller lashes and groomed brows.")
    parts.append("Flawless HD skin base with natural texture. Keep the person's identity, face shape, hair, clothing, background, pose, framing and lighting exactly the same. Makeup only — no jewellery, bindi, accessories or clothing changes. Photorealistic result.")
    return " ".join(parts)


@router.post("/generate")
async def generate(body: GenerateIn):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Image engine not configured")
    raw = re.sub(r"^data:image/[a-zA-Z+]+;base64,", "", body.image.strip())
    if len(raw) * 3 / 4 > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large")
    try:
        base64.b64decode(raw, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    chat = LlmChat(api_key=api_key, session_id=f"studio-{uuid.uuid4()}", system_message="You are a professional makeup artist retouching photos.")
    chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
    msg = UserMessage(text=_prompt(body.look), file_contents=[ImageContent(raw)])
    try:
        text, images = await asyncio.wait_for(chat.send_message_multimodal_response(msg), timeout=90)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="The AI took too long — please try again")
    except Exception as e:
        logger.error("studio generate failed: %s", str(e)[:300])
        raise HTTPException(status_code=502, detail="AI generation failed — please try again")
    if not images:
        raise HTTPException(status_code=502, detail="No image was generated — try a clearer, front-facing photo")
    img = images[0]
    return {"image": f"data:{img.get('mime_type', 'image/png')};base64,{img['data']}", "note": (text or "")[:200]}


SHOWCASE_LOOKS = [
    {"key": "natural", "name": "Natural", "lips": "#C98A7A", "blush": "#EFC0B4", "eyes": "#B89078", "intensity": 0.45, "liner": False, "gloss": True},
    {"key": "bridal", "name": "Bridal", "lips": "#B3122E", "blush": "#E8788A", "eyes": "#8A4B2E", "intensity": 0.9, "liner": True, "gloss": True},
    {"key": "editorial", "name": "Editorial", "lips": "#7A1F3D", "blush": "#D98A9C", "eyes": "#4A2530", "intensity": 0.95, "liner": True, "gloss": False},
    {"key": "glam", "name": "Glam", "lips": "#E62E6B", "blush": "#F28FB0", "eyes": "#6E2C3C", "intensity": 1.0, "liner": True, "gloss": True},
]
_db = None
_showcase_lock = asyncio.Lock()


def init(db):
    global _db
    _db = db


async def _generate_bytes(img_b64: str, look: Look) -> tuple[bytes, str]:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id=f"showcase-{uuid.uuid4()}", system_message="You are a professional makeup artist retouching photos.")
    chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
    _, images = await asyncio.wait_for(chat.send_message_multimodal_response(UserMessage(text=_prompt(look), file_contents=[ImageContent(img_b64)])), timeout=120)
    if not images:
        raise RuntimeError("no image")
    mime = images[0].get("mime_type", "image/png")
    return base64.b64decode(images[0]["data"]), ("jpg" if "jpeg" in mime else "png")


@router.get("/showcase")
async def showcase(regenerate: bool = False):
    from content import store_image
    async with _showcase_lock:
        docs = {d["key"]: d for d in await _db.showcase.find({}, {"_id": 0}).to_list(20)}
        if regenerate:
            docs = {}
        missing = [l for l in SHOWCASE_LOOKS if l["key"] not in docs]
        if missing:
            src = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "sample-face.jpg")
            with open(src, "rb") as f:
                img_b64 = base64.b64encode(f.read()).decode()
            for l in missing:
                try:
                    data, ext = await _generate_bytes(img_b64, Look(**{k: v for k, v in l.items() if k not in ("key",)}))
                    url = await store_image(data, ext, "showcase")
                except Exception as e:
                    logger.error("showcase %s failed: %s", l["key"], str(e)[:200])
                    continue
                doc = {"key": l["key"], "name": l["name"], "url": url, "lips": l["lips"], "blush": l["blush"], "eyes": l["eyes"], "created_at": datetime.now(timezone.utc).isoformat()}
                await _db.showcase.replace_one({"key": l["key"]}, doc, upsert=True)
                docs[l["key"]] = doc
    order = {l["key"]: i for i, l in enumerate(SHOWCASE_LOOKS)}
    return {"before": "/sample-face.jpg", "looks": sorted([{k: v for k, v in d.items() if k != "_id"} for d in docs.values()], key=lambda d: order.get(d["key"], 99))}


class LookUploadIn(BaseModel):
    image: str
    look: str = "Custom"


@router.post("/looks")
async def save_look(body: LookUploadIn):
    from content import store_image
    m = re.match(r"^data:image/(png|jpeg|jpg|webp);base64,(.+)$", body.image.strip(), re.S)
    if not m:
        raise HTTPException(status_code=400, detail="Invalid image data")
    try:
        data = base64.b64decode(m.group(2), validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")
    url = await store_image(data, "jpg" if m.group(1) == "jpeg" else m.group(1), "looks")
    return {"url": url, "look": body.look}


EXTRACT_SYSTEM = (
    "You extract booking details from a spoken enquiry to a bridal makeup artist in Bangalore. "
    "Return ONLY compact JSON with keys: name, phone, email, service, date, message. "
    "service must be one of: Bridal, Engagement, Non-Bridal, Party, Editorial, Fashion, Courses (pick the closest, default Bridal). "
    "date must be ISO YYYY-MM-DD if a date is mentioned (resolve relative dates using today's date given), else null. "
    "phone: digits with country code if said, else null. name/email null if not said. "
    "message: a clean 1–3 sentence summary of what they want, in first person. No markdown."
)


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Voice engine not configured")
    data = await file.read()
    if len(data) < 1000:
        raise HTTPException(status_code=400, detail="Recording too short — hold the mic and speak for a few seconds")
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Recording too long")
    ext = "webm"
    ct = (file.content_type or "").lower()
    for k in ("mp4", "m4a", "wav", "mpeg", "mp3", "ogg", "webm"):
        if k in ct:
            ext = "mp3" if k == "mpeg" else ("webm" if k == "ogg" else k)
            break
    tmp = f"/tmp/voice-{uuid.uuid4()}.{ext}"
    with open(tmp, "wb") as f:
        f.write(data)
    try:
        stt = OpenAISpeechToText(api_key=api_key)
        with open(tmp, "rb") as af:
            res = await asyncio.wait_for(stt.transcribe(file=af, model="whisper-1", response_format="json", prompt="Bridal makeup booking enquiry in Bangalore: name, phone number, wedding date, service."), timeout=90)
        transcript = (getattr(res, "text", None) or "").strip()
    except Exception as e:
        logger.error("transcribe failed: %s", str(e)[:200])
        raise HTTPException(status_code=502, detail="Couldn't transcribe the audio — please try again")
    finally:
        try:
            os.remove(tmp)
        except OSError:
            pass
    if not transcript:
        raise HTTPException(status_code=422, detail="We couldn't hear anything — please try again closer to the mic")

    fields = {}
    try:
        chat = LlmChat(api_key=api_key, session_id=f"extract-{uuid.uuid4()}", system_message=EXTRACT_SYSTEM).with_model("openai", "gpt-5.4")
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d (%A)")
        out = await asyncio.wait_for(chat.send_message(UserMessage(text=f"Today is {today}. Transcript: \"{transcript}\"")), timeout=60)
        m = re.search(r"\{.*\}", out or "", re.S)
        fields = json.loads(m.group(0)) if m else {}
    except Exception as e:
        logger.warning("extraction failed: %s", str(e)[:200])
    allowed = {"Bridal", "Engagement", "Non-Bridal", "Party", "Editorial", "Fashion", "Courses"}
    clean = {k: (fields.get(k) if isinstance(fields.get(k), str) and fields.get(k).strip() else None) for k in ("name", "phone", "email", "service", "date", "message")}
    if clean["service"] not in allowed:
        clean["service"] = "Bridal"
    if not clean["message"]:
        clean["message"] = transcript
    return {"transcript": transcript, "fields": clean}
