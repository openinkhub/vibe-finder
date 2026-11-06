import io
from PIL import Image, ImageOps

MIN_DIM = 1000


def to_webp(data: bytes, max_dim: int = 1920, target_bytes: int = 200 * 1024) -> bytes:
    """Resize to a sensible max dimension and re-encode as WEBP under a target size,
    so every admin-uploaded image matches the site's existing performance/quality bar."""
    img = Image.open(io.BytesIO(data))
    img = ImageOps.exif_transpose(img)  # respect phone camera orientation before any resize/re-encode
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")

    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        img = img.resize((max(1, int(img.width * ratio)), max(1, int(img.height * ratio))), Image.Resampling.LANCZOS)

    quality = 85
    out = b""
    while quality >= 20:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=quality)
        out = buf.getvalue()
        if len(out) <= target_bytes:
            return out
        quality -= 10

    while len(out) > target_bytes and max(img.size) > MIN_DIM:
        img = img.resize((max(1, int(img.width * 0.85)), max(1, int(img.height * 0.85))), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=45)
        out = buf.getvalue()
    return out
