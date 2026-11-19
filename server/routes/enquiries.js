const express = require("express");
const { getDb, HttpError, ah, uuid, nowIso, clean, str } = require("../lib/core");
const { requireAdmin } = require("../lib/auth");
const { alertsStatus, sendEnquiryAlert, sendStatusEmail } = require("../lib/mail");

const router = express.Router();
const STATUSES = ["new", "replied", "booked", "closed"];
const col = () => getDb().collection("enquiries");

router.post("/enquiries", ah(async (req, res) => {
  const b = req.body || {};
  const now = nowIso();
  const doc = {
    name: str(b, "name", { min: 1, max: 120, required: true }),
    phone: str(b, "phone", { min: 5, max: 40, required: true }),
    email: str(b, "email", { max: 160 }),
    service: str(b, "service", { max: 60, def: "Bridal" }),
    date: str(b, "date", { max: 40 }),
    message: str(b, "message", { max: 2000 }),
    look: str(b, "look", { max: 80 }),
    look_image: str(b, "look_image", { max: 600 }),
    source: str(b, "source", { max: 20, def: "form" }),
    terms_accepted: typeof b.terms_accepted === "boolean" ? b.terms_accepted : null,
    id: uuid(), status: "new", seen: false, created_at: now, updated_at: now,
  };
  const digits = doc.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) throw new HttpError(422, "Enter a valid mobile number (10 digits, with country code if outside India)");
  await col().insertOne({ ...doc });
  sendEnquiryAlert(doc, "new");
  res.status(201).json(doc);
}));

router.get("/enquiries", requireAdmin, ah(async (req, res) => {
  const s = req.query.status;
  const q = s && s !== "all" ? { status: s } : {};
  res.json(clean(await col().find(q).sort({ created_at: -1 }).limit(500).toArray()));
}));

router.get("/enquiries/stats", requireAdmin, ah(async (_req, res) => {
  const out = {};
  for (const s of STATUSES) out[s] = await col().countDocuments({ status: s });
  out.total = STATUSES.reduce((a, s) => a + out[s], 0);
  out.unseen = await col().countDocuments({ seen: { $ne: true } });
  out.alerts = alertsStatus();
  res.json(out);
}));

router.post("/enquiries/mark-seen", requireAdmin, ah(async (_req, res) => {
  const r = await col().updateMany({ seen: { $ne: true } }, { $set: { seen: true } });
  res.json({ marked: r.modifiedCount });
}));

router.patch("/enquiries/:id", requireAdmin, ah(async (req, res) => {
  const status = req.body && req.body.status;
  if (!STATUSES.includes(status)) throw new HttpError(400, `status must be one of ${JSON.stringify(STATUSES)}`);
  const doc = await col().findOneAndUpdate({ id: req.params.id }, { $set: { status, seen: true, updated_at: nowIso() } }, { returnDocument: "after" });
  if (!doc) throw new HttpError(404, "Enquiry not found");
  if (status === "booked") sendEnquiryAlert(doc, "booked");
  res.json(clean(doc));
}));

router.delete("/enquiries/:id", requireAdmin, ah(async (req, res) => {
  const r = await col().deleteOne({ id: req.params.id });
  if (!r.deletedCount) throw new HttpError(404, "Enquiry not found");
  res.status(204).end();
}));

async function decide(req, res, status, decision) {
  const existing = await col().findOne({ id: req.params.id }, { projection: { _id: 0 } });
  if (!existing) throw new HttpError(404, "Enquiry not found");
  if (existing.status === status) return res.json(existing);
  const doc = await col().findOneAndUpdate({ id: req.params.id }, { $set: { status, seen: true, updated_at: nowIso() } }, { returnDocument: "after" });
  if (status === "booked") sendEnquiryAlert(doc, "booked");
  sendStatusEmail(doc, decision);
  res.json(clean(doc));
}

router.post("/enquiries/:id/accept", requireAdmin, ah((req, res) => decide(req, res, "booked", "accepted")));
router.post("/enquiries/:id/reject", requireAdmin, ah((req, res) => decide(req, res, "closed", "rejected")));

module.exports = router;
