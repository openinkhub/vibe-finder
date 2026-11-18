// Face Studio + voice enquiry. The old site called Gemini / OpenAI through Emergent's
// proxy key; here they call the providers directly with GEMINI_API_KEY / OPENAI_API_KEY.
// Without those keys the features return a friendly 503 and the rest of the site works.
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getDb, HttpError, ah, nowIso } = require("../lib/core");
const { storeImage } = require("../lib/storage");
const { SHOWCASE_LOOKS } = require("../lib/defaults.json");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const MAX_BYTES = 6 * 1024 * 1024;
const GEMINI_MODEL = () => process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview";
const OPENAI_CHAT_MODEL = () => process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

const strength = (i) => (i < 0.5 ? "soft, natural" : i < 0.8 ? "medium, polished" : "bold, full-glam");

function prompt(look) {
  const l = { name: "Custom", intensity: 0.8, liner: true, gloss: true, ...look };
  const parts = [`Apply professional ${l.name} bridal-grade makeup to the person in this photo — ${strength(Number(l.intensity))} intensity.`];
  if (l.lips) parts.push(`Lipstick in exactly this shade: ${l.lips}` + (l.gloss ? " with a glossy finish." : " with a matte finish."));
  if (l.blush) parts.push(`Blush on the cheeks in shade ${l.blush}, softly blended.`);
  if (l.eyes) parts.push(`Eyeshadow in shade ${l.eyes}, blended across the lid and crease.`);
  if (l.liner) parts.push("Add defined eyeliner, fuller lashes and groomed brows.");
  parts.push("Flawless HD skin base with natural texture. Keep the person's identity, face shape, hair, clothing, background, pose, framing and lighting exactly the same. Makeup only — no jewellery, bindi, accessories or clothing changes. Photorealistic result.");
  return parts.join(" ");
}

const withTimeout = (ms) => AbortSignal.timeout(ms);

// Returns { data: base64, mime } of the first generated image.
async function geminiImage(b64, mime, look, timeoutMs) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(503, "The makeup studio isn't available right now — please try again later");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "You are a professional makeup artist retouching photos." }] },
      contents: [{ role: "user", parts: [{ text: prompt(look) }, { inlineData: { mimeType: mime, data: b64 } }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    }),
    signal: withTimeout(timeoutMs),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const json = await r.json();
  const parts = (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts) || [];
  const img = parts.find((p) => p.inlineData && p.inlineData.data);
  const text = parts.filter((p) => p.text).map((p) => p.text).join(" ");
  return img ? { data: img.inlineData.data, mime: img.inlineData.mimeType || "image/png", text } : { text };
}

router.post("/studio/generate", ah(async (req, res) => {
  const b = req.body || {};
  const m = /^data:(image\/[a-zA-Z+]+);base64,/.exec(String(b.image || "").trim());
  const raw = String(b.image || "").trim().replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  if ((raw.length * 3) / 4 > MAX_BYTES) throw new HttpError(413, "Image too large");
  if (!raw || !/^[A-Za-z0-9+/=\s]+$/.test(raw)) throw new HttpError(400, "Invalid image data");
  let out;
  try {
    out = await geminiImage(raw, m ? m[1] : "image/jpeg", b.look || {}, 90000);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    if (e.name === "TimeoutError") throw new HttpError(504, "The AI took too long — please try again");
    console.error("studio generate failed:", e.message);
    throw new HttpError(502, "AI generation failed — please try again");
  }
  if (!out.data) throw new HttpError(502, "No image was generated — try a clearer, front-facing photo");
  res.json({ image: `data:${out.mime};base64,${out.data}`, note: (out.text || "").slice(0, 200) });
}));

// Pre-generated "before/after" looks shown on the site. Stored looks are served as-is;
// missing ones are generated only when a Gemini key is configured.
let showcaseBusy = Promise.resolve();
router.get("/studio/showcase", ah(async (req, res) => {
  const regenerate = ["true", "1"].includes(String(req.query.regenerate || "").toLowerCase());
  const run = async () => {
    const col = getDb().collection("showcase");
    let docs = Object.fromEntries((await col.find({}, { projection: { _id: 0 } }).limit(20).toArray()).map((d) => [d.key, d]));
    if (regenerate) docs = {};
    const missing = SHOWCASE_LOOKS.filter((l) => !docs[l.key]);
    if (missing.length && process.env.GEMINI_API_KEY) {
      const face = fs.readFileSync(path.join(__dirname, "..", "..", "frontend", "public", "sample-face.jpg")).toString("base64");
      for (const l of missing) {
        try {
          const { key, ...look } = l;
          const out = await geminiImage(face, "image/jpeg", look, 120000);
          if (!out.data) throw new Error("no image");
          const url = await storeImage(Buffer.from(out.data, "base64"), out.mime.includes("jpeg") ? "jpg" : "png", "showcase");
          const doc = { key, name: l.name, url, lips: l.lips, blush: l.blush, eyes: l.eyes, created_at: nowIso() };
          await col.replaceOne({ key }, doc, { upsert: true });
          docs[key] = doc;
        } catch (e) {
          console.error(`showcase ${l.key} failed:`, e.message);
        }
      }
    }
    const order = Object.fromEntries(SHOWCASE_LOOKS.map((l, i) => [l.key, i]));
    return { before: "/sample-face.jpg", looks: Object.values(docs).sort((a, b) => (order[a.key] ?? 99) - (order[b.key] ?? 99)) };
  };
  const p = showcaseBusy.then(run, run);
  showcaseBusy = p.catch(() => {});
  res.json(await p);
}));

router.post("/studio/looks", ah(async (req, res) => {
  const b = req.body || {};
  const m = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/s.exec(String(b.image || "").trim());
  if (!m) throw new HttpError(400, "Invalid image data");
  const data = Buffer.from(m[2], "base64");
  if (!data.length) throw new HttpError(400, "Invalid image data");
  const url = await storeImage(data, m[1] === "jpeg" ? "jpg" : m[1], "looks");
  res.json({ url, look: b.look || "Custom" });
}));

const EXTRACT_SYSTEM =
  "You extract booking details from a spoken enquiry to a bridal makeup artist in Bangalore. " +
  "Return ONLY compact JSON with keys: name, phone, email, service, date, message. " +
  "service must be one of: Bridal, Engagement, Non-Bridal, Party, Editorial, Fashion, Courses (pick the closest, default Bridal). " +
  "date must be ISO YYYY-MM-DD if a date is mentioned (resolve relative dates using today's date given), else null. " +
  "phone: digits with country code if said, else null. name/email null if not said. " +
  "message: a clean 1–3 sentence summary of what they want, in first person. No markdown.";

router.post("/studio/transcribe", upload.single("file"), ah(async (req, res) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new HttpError(503, "Voice enquiries aren't available right now — please type your enquiry instead");
  if (!req.file) throw new HttpError(422, "file is required");
  const data = req.file.buffer;
  if (data.length < 1000) throw new HttpError(400, "Recording too short — hold the mic and speak for a few seconds");
  const ct = (req.file.mimetype || "").toLowerCase();
  let ext = "webm";
  for (const k of ["mp4", "m4a", "wav", "mpeg", "mp3", "ogg", "webm"]) {
    if (ct.includes(k)) {
      ext = k === "mpeg" ? "mp3" : k === "ogg" ? "webm" : k;
      break;
    }
  }
  let transcript = "";
  try {
    const form = new FormData();
    form.append("file", new Blob([data], { type: ct || "audio/webm" }), `voice.${ext}`);
    form.append("model", "whisper-1");
    form.append("response_format", "json");
    form.append("prompt", "Bridal makeup booking enquiry in Bangalore: name, phone number, wedding date, service.");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form, signal: withTimeout(90000) });
    if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 200)}`);
    transcript = String((await r.json()).text || "").trim();
  } catch (e) {
    console.error("transcribe failed:", e.message);
    throw new HttpError(502, "Couldn't transcribe the audio — please try again");
  }
  if (!transcript) throw new HttpError(422, "We couldn't hear anything — please try again closer to the mic");

  let fields = {};
  try {
    const d = new Date();
    const today = `${d.toISOString().slice(0, 10)} (${d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })})`;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: OPENAI_CHAT_MODEL(), messages: [{ role: "system", content: EXTRACT_SYSTEM }, { role: "user", content: `Today is ${today}. Transcript: "${transcript}"` }] }),
      signal: withTimeout(60000),
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}`);
    const out = (await r.json()).choices[0].message.content || "";
    const m = /\{[\s\S]*\}/.exec(out);
    fields = m ? JSON.parse(m[0]) : {};
  } catch (e) {
    console.warn("extraction failed:", e.message);
  }
  const allowed = new Set(["Bridal", "Engagement", "Non-Bridal", "Party", "Editorial", "Fashion", "Courses"]);
  const clean = {};
  for (const k of ["name", "phone", "email", "service", "date", "message"]) clean[k] = typeof fields[k] === "string" && fields[k].trim() ? fields[k] : null;
  if (!allowed.has(clean.service)) clean.service = "Bridal";
  if (!clean.message) clean.message = transcript;
  res.json({ transcript, fields: clean });
}));

module.exports = router;
