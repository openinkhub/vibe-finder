// Click-to-chat: after a visitor submits a form, WhatsApp opens with their details typed
// into a message to Rekha's number; they tap Send. No WhatsApp API account is needed.
export const WA_NUMBER = "919845480507";

export const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

export const enquiryMessage = (title, fields) =>
  [`Hi Rekha, ${title}`, "", ...fields.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");

// Must run inside the click/submit handler (before any await), or browsers block the new tab.
// Returns false when it was blocked, so the form can show a button instead.
export const openWhatsApp = (text) => {
  try { return !!window.open(waLink(text), "_blank"); } catch { return false; }
};

// Mobile number: 10–15 digits, optionally with +, spaces, brackets or dashes.
export const PHONE_PATTERN = "\\+?[0-9 ]{10,16}";
export const phoneOk = (v) => { const d = String(v || "").replace(/\D/g, ""); return d.length >= 10 && d.length <= 15; };
