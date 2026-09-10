import os
import re
import uuid
import base64
import asyncio
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

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
