// Email alerts via the Resend REST API (same templates as the old alerts.py).
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c]);

const configured = () => Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.ALERT_TO_EMAIL);
const alertsStatus = () => ({ email: configured(), in_app: true });
const sender = () => process.env.SENDER_EMAIL || "onboarding@resend.dev";

async function send(params) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return true;
}

const row = (k, v) => `<tr><td style='padding:6px 12px;color:#8B7F82;font-size:12px;text-transform:uppercase;letter-spacing:.1em'>${k}</td><td style='padding:6px 12px;color:#4A2530;font-size:15px'>${esc(v || "—")}</td></tr>`;

async function sendEnquiryAlert(enquiry, kind = "new") {
  if (!configured()) return console.info("Email alert skipped (RESEND_API_KEY/ALERT_TO_EMAIL not set)"), false;
  const title = kind === "new" ? "New enquiry" : `Enquiry marked ${kind}`;
  const lookImg = (enquiry.look_image || "").startsWith("http") ? `<tr><td colspan='2' style='padding:12px'><img src='${esc(enquiry.look_image)}' alt='look' style='max-width:320px;border-radius:12px'/></td></tr>` : "";
  const html = `
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px">
      <tr><td colspan="2" style="padding:12px;font-size:22px;color:#E62E6B">${title} — ${esc(enquiry.name || "")}</td></tr>
      ${row("Phone", enquiry.phone)}${row("Email", enquiry.email)}${row("Service", enquiry.service)}
      ${row("Event date", enquiry.date)}${row("Look", enquiry.look)}${row("Message", enquiry.message)}
      ${lookImg}
    </table>`;
  try {
    return await send({ from: sender(), to: [process.env.ALERT_TO_EMAIL], subject: `${title}: ${enquiry.name || ""} · ${enquiry.service || ""}`, html });
  } catch (e) {
    console.error("Resend alert failed:", e.message);
    return false;
  }
}

async function sendStatusEmail(enquiry, decision) {
  const to = enquiry.email;
  if (!to || !configured()) return console.info("Status email skipped"), false;
  const first = (enquiry.name || "there").split(" ")[0];
  const service = enquiry.service || "your enquiry";
  let title, accent, message;
  if (decision === "accepted") {
    title = `You're confirmed, ${first}!`;
    accent = "#1c7a45";
    message = `Wonderful news — your ${service} booking with Rekha Krishnamurthy has been accepted. We'll be in touch shortly to finalise the details.`;
  } else {
    title = `About your ${service} enquiry`;
    accent = "#8B7F82";
    message = `Thank you for reaching out, ${first}. Unfortunately we're unable to accommodate this request right now. Please feel free to enquire again for another date or service.`;
  }
  const html = `
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px;max-width:480px">
      <tr><td style="padding:16px 20px 4px;font-size:20px;color:${accent}">${esc(title)}</td></tr>
      <tr><td style="padding:4px 20px 16px;font-size:15px;color:#4A2530;line-height:1.6">${esc(message)}</td></tr>
      <tr><td style="padding:0 20px 16px;font-size:13px;color:#8B7F82">— Rekha Krishnamurthy · Makeup Artist &amp; Educator</td></tr>
    </table>`;
  try {
    return await send({ from: sender(), to: [to], subject: title, html });
  } catch (e) {
    console.error("Status email failed:", e.message);
    return false;
  }
}

async function sendBrochureAlert(lead) {
  if (!configured()) return false;
  const html = `
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px">
      <tr><td colspan="2" style="padding:12px;font-size:20px;color:#E62E6B">Brochure request — ${esc(lead.title || "")}</td></tr>
      ${row("Name", lead.name)}${row("Mobile", lead.phone)}${row("Email", lead.email)}${row("Mode", lead.mode)}
    </table>`;
  try {
    return await send({ from: sender(), to: [process.env.ALERT_TO_EMAIL], subject: `Brochure request: ${lead.title || ""}`, html });
  } catch (e) {
    console.error("Brochure alert failed:", e.message);
    return false;
  }
}

async function sendBrochureEmail(to, data, pdf) {
  if (!process.env.RESEND_API_KEY) return false;
  const filename = data.title.replace(/[ /]/g, "-").slice(0, 60) + ".pdf";
  const html = `
    <table style="font-family:Georgia,serif;border-collapse:collapse;background:#FBE9F0;border-radius:16px;padding:12px;max-width:480px">
      <tr><td style="padding:16px 20px 4px;font-size:20px;color:#E62E6B">Your brochure is attached</td></tr>
      <tr><td style="padding:4px 20px 16px;font-size:15px;color:#4A2530;line-height:1.6">${esc(data.title)} — ${esc(data.tagline)}</td></tr>
      <tr><td style="padding:0 20px 16px;font-size:13px;color:#8B7F82">— Rekha Krishnamurthy · Makeup Artist &amp; Educator</td></tr>
    </table>`;
  try {
    return await send({ from: sender(), to: [to], subject: `Your brochure: ${data.title}`, html, attachments: [{ filename, content: pdf.toString("base64") }] });
  } catch (e) {
    console.error("Brochure email failed:", e.message);
    return false;
  }
}

module.exports = { alertsStatus, sendEnquiryAlert, sendStatusEmail, sendBrochureAlert, sendBrochureEmail };
