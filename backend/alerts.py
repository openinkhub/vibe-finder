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
    look_img = f"<tr><td colspan='2' style='padding:12px'><img src='{html.escape(enquiry['look_image'])}' alt='look' style='max-width:320px;border-radius:12px'/></td></tr>" if enquiry.get("look_image", "").startswith("http") else ""
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
