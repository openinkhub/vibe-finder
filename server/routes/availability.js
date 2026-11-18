const express = require("express");
const { getDb, HttpError, ah, uuid, nowIso, clean } = require("../lib/core");
const { requireAdmin } = require("../lib/auth");

const router = express.Router();
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const col = () => getDb().collection("bookings");

router.get("/availability", ah(async (req, res) => {
  const { month, start, end } = req.query;
  const q = {};
  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) throw new HttpError(422, "month must be YYYY-MM");
    q.date = { $regex: `^${month}` };
  } else if (start || end) {
    q.date = {};
    if (start) q.date.$gte = String(start);
    if (end) q.date.$lte = String(end);
  }
  res.json(clean(await col().find(q).sort({ date: 1, start: 1 }).limit(1000).toArray()));
}));

router.post("/availability", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || "")) throw new HttpError(422, "date must be YYYY-MM-DD");
  const fullDay = Boolean(b.full_day);
  for (const k of ["start", "end"]) if (b[k] != null && !TIME_RE.test(b[k])) throw new HttpError(422, "time must be HH:MM");
  if (b.note != null && String(b.note).length > 120) throw new HttpError(422, "note must be at most 120 characters");
  if (!fullDay) {
    if (!b.start || !b.end) throw new HttpError(400, "Provide start and end time, or mark the full day");
    if (b.start >= b.end) throw new HttpError(400, "End time must be after start time");
  }
  const doc = { date: b.date, full_day: fullDay, start: fullDay ? null : b.start, end: fullDay ? null : b.end, note: b.note ?? null, id: uuid(), created_at: nowIso() };
  await col().insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.delete("/availability/:id", requireAdmin, ah(async (req, res) => {
  if (!(await col().deleteOne({ id: req.params.id })).deletedCount) throw new HttpError(404, "Slot not found");
  res.status(204).end();
}));

module.exports = router;
