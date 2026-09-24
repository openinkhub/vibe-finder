import os
import asyncio
import logging
import html

logger = logging.getLogger(__name__)


def _configured():
    return bool(os.environ.get("RESEND_API_KEY")) and bool(os.environ.get("ALERT_TO_EMAIL"))


def alerts_status():
    return {"email": _configured(), "in_app": True}


def _row(k, v):
    return f"<tr><td style='padding:6px 12px;color:#8B7F82;font-size:12px;text-transform:uppercase;letter-spacing:.1em'>{k}</td><td style='padding:6px 12px;color:#4A2530;font-size:15px'>{html.escape(str(v or '—'))}</td></tr>"


async def send_enquiry_alert(enquiry: dict, kind: str = "new"):
    if not _configured():
        logger.info("Email alert skipped (RESEND_API_KEY/ALERT_TO_EMAIL not set)")
        return False
    import resend
    resend.api_key = os.environ["RESEND_API_KEY"]
    title = "New enquiry" if kind == "new" else f"Enquiry marked {kind}"
    look_img = f"<tr><td colspan='2' style='padding:12px'><img src='{html.escape(enquiry['look_image'])}' alt='look' style='max-width:320px;border-radius:12px'/></td></tr>" if (enquiry.get("look_image") or "").startswith("http") else ""
    body = f"""
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px">
      <tr><td colspan="2" style="padding:12px;font-size:22px;color:#E62E6B">{title} — {html.escape(enquiry.get('name',''))}</td></tr>
      {_row('Phone', enquiry.get('phone'))}{_row('Email', enquiry.get('email'))}{_row('Service', enquiry.get('service'))}
      {_row('Event date', enquiry.get('date'))}{_row('Look', enquiry.get('look'))}{_row('Message', enquiry.get('message'))}
      {look_img}
    </table>"""
    params = {"from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"), "to": [os.environ["ALERT_TO_EMAIL"]], "subject": f"{title}: {enquiry.get('name','')} · {enquiry.get('service','')}", "html": body}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error("Resend alert failed: %s", str(e)[:200])
        return False


async def send_status_email(enquiry: dict, decision: str):
    to = enquiry.get("email")
    if not to or not _configured():
        logger.info("Status email skipped (no lead email or Resend not configured)")
        return False
    import resend
    resend.api_key = os.environ["RESEND_API_KEY"]
    first_name = (enquiry.get("name") or "there").split(" ")[0]
    service = enquiry.get("service", "your enquiry")
    if decision == "accepted":
        title, accent = f"You're confirmed, {first_name}!", "#1c7a45"
        message = f"Wonderful news — your {service} booking with Rekha Krishnamurthy has been accepted. We'll be in touch shortly to finalise the details."
    else:
        title, accent = f"About your {service} enquiry", "#8B7F82"
        message = f"Thank you for reaching out, {first_name}. Unfortunately we're unable to accommodate this request right now. Please feel free to enquire again for another date or service."
    body = f"""
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px;max-width:480px">
      <tr><td style="padding:16px 20px 4px;font-size:20px;color:{accent}">{html.escape(title)}</td></tr>
      <tr><td style="padding:4px 20px 16px;font-size:15px;color:#4A2530;line-height:1.6">{html.escape(message)}</td></tr>
      <tr><td style="padding:0 20px 16px;font-size:13px;color:#8B7F82">— Rekha Krishnamurthy · Makeup Artist &amp; Educator</td></tr>
    </table>"""
    params = {"from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"), "to": [to], "subject": title, "html": body}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error("Status email failed: %s", str(e)[:200])
        return False


async def send_brochure_alert(lead: dict):
    if not _configured():
        logger.info("Brochure alert skipped (Resend not configured)")
        return False
    import resend
    resend.api_key = os.environ["RESEND_API_KEY"]
    body = f"""
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px">
      <tr><td colspan="2" style="padding:12px;font-size:20px;color:#E62E6B">Brochure request — {html.escape(lead.get('title',''))}</td></tr>
      {_row('Name', lead.get('name'))}{_row('Email', lead.get('email'))}{_row('Mode', lead.get('mode'))}
    </table>"""
    params = {"from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"), "to": [os.environ["ALERT_TO_EMAIL"]], "subject": f"Brochure request: {lead.get('title','')}", "html": body}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error("Brochure alert failed: %s", str(e)[:200])
        return False
