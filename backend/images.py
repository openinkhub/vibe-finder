import io
from PIL import Image


def to_webp(data: bytes, max_dim: int = 1920, target_bytes: int = 200 * 1024) -> bytes:
    """Resize to a sensible max dimension and re-encode as WEBP under a target size,
    so every admin-uploaded image matches the site's existing performance/quality bar."""
    img = Image.open(io.BytesIO(data)).convert("RGB")
    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        img = img.resize((max(1, int(img.width * ratio)), max(1, int(img.height * ratio))))
    quality = 85
    out = b""
    while quality >= 20:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=quality)
        out = buf.getvalue()
        if len(out) <= target_bytes:
            return out
        quality -= 10
    while len(out) > target_bytes and max(img.size) > 300:
        img = img.resize((max(1, int(img.width * 0.8)), max(1, int(img.height * 0.8))))
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=40)
        out = buf.getvalue()
    return out
