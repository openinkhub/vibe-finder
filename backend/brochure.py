import io
import os
import asyncio
import base64
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks, Response
from pydantic import BaseModel, Field

from alerts import send_brochure_alert

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/brochure")
_db = None

CONTACT = {"phone": "+91 98454 80507", "whatsapp": "wa.me/919845480507", "email": "hello@rekhakrishnamurthy.in", "website": "rekhakrishnamurthy.com"}

BROCHURE = {
    "/bridal-makeup-artist-bangalore": {
        "title": "Bridal Makeup, Perfected Over 14 Years", "tagline": "HD & airbrush bridal looks planned around your skin, outfit and story — trial included, no visit charge.",
        "highlights": ["Pre-wedding shoot makeup coordinated to outfit, location & shoot theme", "Sangeet makeup built to survive a full night on the dance floor", "Full wedding-day consultation on skin, outfit & jewellery", "Only premium brands — MAC, Bobbi Brown, Estée Lauder, HUDA Beauty & more", "One bride, one date — we never double-book"],
        "details": [("Experience", "14 years · 320+ weddings"), ("Trial", "In-person or video consultation included"), ("Booking window", "3–6 months ahead for wedding season"), ("Visit charge", "None, across Bangalore")],
    },
    "/engagement-makeup": {
        "title": "Engagement Makeup That Photographs as Beautifully as It Feels", "tagline": "A personalised consultation, premium products, and fourteen years of reading skin tones under every kind of event lighting.",
        "highlights": ["Consultation covers your vision, skin, outfit, jewellery, venue & timing", "Approach adapts to garden daylight or an evening indoor reception", "From intimate family engagements to large staged ceremonies", "International hygiene standards on every booking", "Around 90 minutes makeup + 30–45 minutes hair"],
        "details": [("Duration", "~90 min makeup + 30–45 min hair"), ("Outfit match", "Discussed at consultation"), ("Visit charge", "None, across Bangalore")],
    },
    "/non-bridal-makeup": {
        "title": "Non-Bridal Makeup for Bridesmaids, Sisters & Family", "tagline": "Coordinated, camera-ready and comfortable looks for the wedding party — without anyone looking over-done next to the bride.",
        "highlights": ["Quick skin-tone matching across multiple faces", "A look that photographs consistently across the group", "Hairstyle-to-makeup pairing that holds through a full day", "Up to 6 faces in one sitting with an assistant; larger groups scheduled in waves", "Same premium products & hygiene standards as bridal bookings"],
        "details": [("Group size", "Up to 6 in one sitting"), ("Coordination", "Aligned to the bride's look & intensity"), ("Visit charge", "None, across Bangalore")],
    },
    "/party-makeup-artist-bangalore": {
        "title": "Party Makeup for Birthdays, Anniversaries & Every Night Out", "tagline": "HD and Airbrush techniques styled to the venue lighting and your outfit — not a one-look-fits-all party face.",
        "highlights": ["Built for dim restaurant lighting, camera flash & dance floors", "Hairstyle chosen to complement your outfit", "Birthdays, anniversaries or someone else's celebration — same premium standard", "No visit charge across Bangalore", "1–2 weeks booking lead time recommended"],
        "details": [("Best booked", "1–2 weeks ahead"), ("Technique", "HD & Airbrush"), ("Visit charge", "None, across Bangalore")],
    },
    "/pre-wedding-photoshoot-makeup-artist": {
        "title": "Groom & Pre-Wedding Looks With Natural Definition", "tagline": "Camera-ready grooming and makeup planning for grooms and pre-wedding shoots, matched to the event and photography style.",
        "highlights": ["Designed to look natural both on camera and in person", "Coordinated with photographer, location and outfit changes", "Suited to ceremonies, pre-wedding shoots & wedding-day photography", "Skin prep and long-wear techniques for full-day events", "Planned around your shoot schedule and lighting"],
        "details": [("Focus", "Grooms & couples"), ("Best booked", "2–4 weeks ahead"), ("Visit charge", "None, across Bangalore")],
    },
    "/editorial-makeup": {
        "title": "Editorial Makeup, Built Around the Mood Board", "tagline": "From glossy and nude to bold and unconventional — makeup that's briefed, referenced, and executed like a shoot.",
        "highlights": ["Starts with your mood board & creative direction", "Translated into an achievable, camera-accurate look", "Coordinated with photographer and stylist on set", "Suited to studio and natural light shoots", "Premium products chosen for how they photograph"],
        "details": [("Best for", "Photographers, models, brands & production teams"), ("Process", "Mood board → consultation → shoot-day execution"), ("Visit charge", "On enquiry, per brief")],
    },
    "/fashion-makeup": {
        "title": "Fashion Makeup for Shows, Shoots & Statement Looks", "tagline": "Avant-garde or barely-there — fashion makeup built around the narrative your shoot or show is telling.",
        "highlights": ["Range from a 'no-makeup' look to dramatic avant-garde looks", "Understands the narrative before choosing technique", "Executes for runway lighting or studio flash", "Backstage & runway experience across Bangalore fashion weeks", "Same premium products chosen for longevity on camera"],
        "details": [("Best for", "Designers, models, photographers & brands"), ("Experience", "Backstage & runway assignments"), ("Visit charge", "On enquiry, per brief")],
    },
    "/south-indian-bridal-makeup-karnataka": {
        "title": "Photo Shoot & Premium South Indian Bridal Makeup", "tagline": "Pre-wedding shoots, portfolio sessions and traditional South Indian bridal looks — built for how the lens sees skin.",
        "highlights": ["A base that reads like skin at f/2.8", "Colour that survives both flash and golden hour", "Traditional South Indian bridal detailing — kohl, temple jewellery-ready hair, Kanjeevaram-matched tones", "Planned with your photographer around location & outfit changes", "Multiple looks per shoot, scheduled into the timeline"],
        "details": [("Best for", "Couples, photographers & models"), ("Style", "Traditional South Indian bridal + shoot-ready"), ("Visit charge", "None, across Bangalore")],
    },
    "/makeup-educator-beauty-mentor-karnataka": {
        "title": "Professional Makeup Artist Launchpad", "tagline": "Learn the Craft. Build the Confidence. Launch Your Career.",
        "highlights": ["120 hours across 20 intensive six-hour sessions", "Skin, base, eyes, lips, bridal & occasion makeup", "Hairstyling, draping & jewellery/outfit coordination", "Kit-building, hygiene, pricing & client consultation", "Final assessment + certificate on successful completion"],
        "details": [("Duration", "20 Sessions · 120 Hours"), ("Timings", "11 AM – 5 PM"), ("Level", "Beginner to Emerging Professional"), ("Course Fee", "₹1,50,000/-")],
    },
    "/self-makeup-classes-karnataka": {
        "title": "Comprehensive Bridal Artistry Program", "tagline": "Master Bridal Makeup. Build the Confidence to Work With Brides.",
        "highlights": ["Bridal skin prep, complexion & long-wear techniques", "Bridal eye artistry — soft, traditional & modern glam", "Brows, lashes, lips & face sculpting", "Bridal consultation & expectation management", "Certificate on successful completion & final assessment"],
        "details": [("Duration", "60 Hours"), ("Format", "Demonstration + Theory + Hands-on"), ("Level", "Beginner to Emerging Professional"), ("Course Fee", "₹1,00,000/-")],
    },
    "/personal-shopping": {
        "title": "Personal Makeup Shopping Consultation", "tagline": "Shop Smarter. Choose Better. Build a Makeup Kit That Works for You.",
        "highlights": ["Review your existing makeup collection", "Identify what you actually need vs. unnecessary duplication", "Shade & undertone guidance for complexion products", "Prioritise purchases according to your budget", "Build a practical, versatile makeup collection"],
        "details": [("Format", "One-on-one consultation"), ("Focus", "Practical, budget-friendly shopping"), ("Fee", "Shared on enquiry")],
    },
    "/self-grooming-classes": {
        "title": "Self-Grooming Makeup Workshop", "tagline": "Learn Your Face. Understand Your Makeup. Build Your Confidence.",
        "highlights": ["Understand your face shape & key features", "Choose products that suit your own routine", "Everyday & occasion makeup techniques", "Hands-on guided practice with feedback", "Build lasting confidence, not just a look"],
        "details": [("Format", "Practical hands-on workshop"), ("Level", "Beginners welcome"), ("Fee", "Shared on enquiry")],
    },
}


def init(db):
    global _db
    _db = db


def _build_pdf(slug: str) -> bytes:
    data = BROCHURE[slug]
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=28 * mm, bottomMargin=22 * mm, leftMargin=22 * mm, rightMargin=22 * mm, title=data["title"])
    styles = getSampleStyleSheet()
    pink, plum, grey = HexColor("#E62E6B"), HexColor("#4A2530"), HexColor("#5C4E52")
    eyebrow = ParagraphStyle("eyebrow", parent=styles["Normal"], textColor=pink, fontName="Helvetica-Bold", fontSize=9, leading=12, spaceAfter=14)
    h1 = ParagraphStyle("h1", parent=styles["Title"], textColor=plum, fontName="Helvetica-Bold", fontSize=21, leading=25, spaceAfter=8, alignment=0)
    tagline = ParagraphStyle("tag", parent=styles["Normal"], textColor=grey, fontSize=11.5, leading=16, spaceAfter=20)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=plum, fontName="Helvetica-Bold", fontSize=13, spaceBefore=8, spaceAfter=8)
    bullet = ParagraphStyle("b", parent=styles["Normal"], textColor=grey, fontSize=10.5, leading=15, leftIndent=10, spaceAfter=6)
    foot = ParagraphStyle("f", parent=styles["Normal"], textColor=grey, fontSize=9.5, leading=14, spaceBefore=4)

    story = [
        Paragraph("REKHA KRISHNAMURTHY · MAKEUP ARTIST &amp; EDUCATOR", eyebrow),
        Paragraph(data["title"], h1),
        Paragraph(data["tagline"], tagline),
        Paragraph("What's Included", h2),
    ]
    for b in data["highlights"]:
        story.append(Paragraph(f"•&nbsp;&nbsp;{b}", bullet))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Details", h2))
    tbl = Table([[Paragraph(k, ParagraphStyle("dk", parent=styles["Normal"], textColor=pink, fontName="Helvetica-Bold", fontSize=9.5)), Paragraph(v, ParagraphStyle("dv", parent=styles["Normal"], textColor=plum, fontSize=10.5))] for k, v in data["details"]], colWidths=[130, 320])
    tbl.setStyle(TableStyle([("BOTTOMPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 9), ("LINEBELOW", (0, 0), (-1, -1), 0.6, HexColor("#F1DCE3")), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(tbl)
    story.append(Spacer(1, 24))
    story.append(Paragraph(f"Get in touch — {CONTACT['phone']} · {CONTACT['whatsapp']} · {CONTACT['email']} · {CONTACT['website']}", foot))
    doc.build(story)
    return buf.getvalue()


async def _send_brochure_email(to_email: str, data: dict, pdf_bytes: bytes) -> bool:
    if not os.environ.get("RESEND_API_KEY"):
        logger.info("Brochure email skipped (RESEND_API_KEY not set)")
        return False
    import resend
    resend.api_key = os.environ["RESEND_API_KEY"]
    filename = data["title"].replace(" ", "-").replace("/", "-")[:60] + ".pdf"
    body = f"""
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px;max-width:480px">
      <tr><td style="padding:16px 20px 4px;font-size:20px;color:#E62E6B">Your brochure is attached</td></tr>
      <tr><td style="padding:4px 20px 16px;font-size:15px;color:#4A2530;line-height:1.6">{data['title']} — {data['tagline']}</td></tr>
      <tr><td style="padding:0 20px 16px;font-size:13px;color:#8B7F82">— Rekha Krishnamurthy · Makeup Artist &amp; Educator</td></tr>
    </table>"""
    params = {
        "from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"),
        "to": [to_email],
        "subject": f"Your brochure: {data['title']}",
        "html": body,
        "attachments": [{"filename": filename, "content": base64.b64encode(pdf_bytes).decode()}],
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error("Brochure email failed: %s", str(e)[:200])
        return False


class BrochureRequest(BaseModel):
    path: str = Field(min_length=1, max_length=120)
    name: Optional[str] = Field(default=None, max_length=120)
    email: str = Field(min_length=3, max_length=160)
    mode: str = Field(default="download", max_length=10)


@router.post("/request")
async def request_brochure(body: BrochureRequest, bg: BackgroundTasks):
    slug = body.path if body.path.startswith("/") else f"/{body.path}"
    data = BROCHURE.get(slug)
    if not data:
        raise HTTPException(status_code=404, detail="Brochure not available for this page")
    if body.mode not in ("download", "email"):
        raise HTTPException(status_code=400, detail="mode must be 'download' or 'email'")
    if "@" not in body.email:
        raise HTTPException(status_code=400, detail="Enter a valid email address")

    pdf_bytes = _build_pdf(slug)
    now = datetime.now(timezone.utc).isoformat()
    lead = {"id": str(uuid.uuid4()), "path": slug, "title": data["title"], "name": body.name, "email": body.email, "mode": body.mode, "created_at": now}
    await _db.brochure_leads.insert_one(dict(lead))
    bg.add_task(send_brochure_alert, lead)

    if body.mode == "download":
        filename = data["title"].replace(" ", "-").replace("/", "-")[:60] + ".pdf"
        return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})

    sent = await _send_brochure_email(body.email, data, pdf_bytes)
    if not sent:
        raise HTTPException(status_code=502, detail="Couldn't email the brochure right now — please try Download instead.")
    return {"success": True}
