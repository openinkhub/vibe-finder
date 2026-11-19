const express = require("express");
const PDFDocument = require("pdfkit");
const { getDb, HttpError, ah, uuid, nowIso } = require("../lib/core");
const { sendBrochureAlert, sendBrochureEmail } = require("../lib/mail");
const { BROCHURE, CONTACT } = require("../lib/defaults.json");

const router = express.Router();
const PINK = "#E62E6B", PLUM = "#4A2530", GREY = "#5C4E52", LINE = "#F1DCE3";
const MM = 2.8346;

// A4 one-pager matching the old ReportLab brochure layout.
function buildPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 28 * MM, bottom: 22 * MM, left: 22 * MM, right: 22 * MM }, info: { Title: data.title } });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;

    doc.font("Helvetica-Bold").fontSize(9).fillColor(PINK).text("REKHA KRISHNAMURTHY · MAKEUP ARTIST & EDUCATOR", { width });
    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(21).fillColor(PLUM).text(data.title, { width, lineGap: 3 });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11.5).fillColor(GREY).text(data.tagline, { width, lineGap: 3 });
    doc.moveDown(1.4);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(PLUM).text("What's Included", { width });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10.5).fillColor(GREY);
    for (const h of data.highlights) {
      doc.text(`•  ${h}`, left + 10, doc.y, { width: width - 10, lineGap: 3 });
      doc.moveDown(0.35);
    }
    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(PLUM).text("Details", left, doc.y, { width });
    doc.moveDown(0.5);
    for (const [k, v] of data.details) {
      const y = doc.y + 9;
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(PINK).text(k, left, y, { width: 130 });
      const yk = doc.y;
      doc.font("Helvetica").fontSize(10.5).fillColor(PLUM).text(v, left + 130, y, { width: width - 130 });
      const bottom = Math.max(yk, doc.y) + 9;
      doc.moveTo(left, bottom).lineTo(left + width, bottom).lineWidth(0.6).strokeColor(LINE).stroke();
      doc.y = bottom;
    }
    doc.moveDown(2);
    doc.font("Helvetica").fontSize(9.5).fillColor(GREY).text(`Get in touch — ${CONTACT.phone} · ${CONTACT.whatsapp} · ${CONTACT.email} · ${CONTACT.website}`, left, doc.y, { width, lineGap: 3 });
    doc.end();
  });
}

router.post("/brochure/request", ah(async (req, res) => {
  const b = req.body || {};
  const p = String(b.path || "");
  if (!p || p.length > 120) throw new HttpError(422, "path is required");
  const email = String(b.email || "");
  if (email.length < 3 || email.length > 160) throw new HttpError(422, "email is required");
  const phone = String(b.phone || "").trim().slice(0, 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) throw new HttpError(422, "Enter a valid mobile number");
  const mode = String(b.mode || "download");
  const slug = p.startsWith("/") ? p : `/${p}`;
  const data = BROCHURE[slug];
  if (!data) throw new HttpError(404, "Brochure not available for this page");
  if (!["download", "email"].includes(mode)) throw new HttpError(400, "mode must be 'download' or 'email'");
  if (!email.includes("@")) throw new HttpError(400, "Enter a valid email address");

  const pdf = await buildPdf(data);
  const lead = { id: uuid(), path: slug, title: data.title, name: b.name ? String(b.name).slice(0, 120) : null, phone, email, mode, created_at: nowIso() };
  await getDb().collection("brochure_leads").insertOne({ ...lead });
  sendBrochureAlert(lead);

  if (mode === "download") {
    const filename = data.title.replace(/[ /]/g, "-").slice(0, 60) + ".pdf";
    res.set("Content-Disposition", `attachment; filename="${filename}"`);
    return res.type("application/pdf").send(pdf);
  }
  if (!(await sendBrochureEmail(email, data, pdf))) throw new HttpError(502, "Couldn't email the brochure right now — please try Download instead.");
  res.json({ success: true });
}));

module.exports = router;
