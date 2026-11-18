const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { getDb, HttpError, ah, uuid, nowIso, cut, clean } = require("../lib/core");
const { requireAdmin } = require("../lib/auth");
const { storeImage, storeProcessedImage, resolveSafe, MIME, fetchFromFallback } = require("../lib/storage");
const D = require("../lib/defaults.json");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const c = (name) => getDb().collection(name);
// Records imported from the old site may not carry `is_deleted`, so treat "missing" as live.
const LIVE = { is_deleted: { $ne: true } };
const requireFile = (req) => {
  if (!req.file) throw new HttpError(422, "file is required");
  return req.file.buffer;
};
const extOf = (name) => String(name || "").split(".").pop();
const pick = (body, spec) => {
  const patch = {};
  for (const [k, max] of Object.entries(spec)) {
    if (body[k] === undefined || body[k] === null) continue;
    if (String(body[k]).length > max) throw new HttpError(422, `${k} must be at most ${max} characters`);
    patch[k] = String(body[k]);
  }
  return patch;
};

// ── Seed defaults (only on an empty database, and only when SEED_DEFAULTS=true) ──
async function seedContent() {
  const now = nowIso();
  const seed = async (name, items, extra) => {
    if ((await c(name).countDocuments({})) === 0) await c(name).insertMany(items.map((x, i) => ({ ...x, id: uuid(), order: i, created_at: now, ...extra })));
  };
  await seed("pricing", D.DEFAULT_PRICING, {});
  await seed("portfolio", D.DEFAULT_PORTFOLIO, { is_deleted: false });
  await seed("services", D.DEFAULT_SERVICES, {});
  await seed("reels", D.DEFAULT_REELS, { is_deleted: false });
  await seed("instagram_feed", D.DEFAULT_FEED, { is_deleted: false });
}

// ── Pricing ──
const pricingIn = (b) => {
  const price = String(b.price ?? ""), title = String(b.title ?? ""), desc = String(b.desc ?? "");
  if (!price || price.length > 40) throw new HttpError(422, "price must be 1–40 characters");
  if (!title || title.length > 80) throw new HttpError(422, "title must be 1–80 characters");
  if (desc.length > 300) throw new HttpError(422, "desc must be at most 300 characters");
  return { price, title, desc, featured: Boolean(b.featured) };
};

router.get("/content/pricing", ah(async (_q, res) => res.json(clean(await c("pricing").find({}).sort({ order: 1 }).limit(100).toArray()))));

router.post("/content/pricing", requireAdmin, ah(async (req, res) => {
  const doc = { ...pricingIn(req.body || {}), id: uuid(), order: await c("pricing").countDocuments({}), created_at: nowIso() };
  await c("pricing").insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.put("/content/pricing/:id", requireAdmin, ah(async (req, res) => {
  const doc = await c("pricing").findOneAndUpdate({ id: req.params.id }, { $set: pricingIn(req.body || {}) }, { returnDocument: "after" });
  if (!doc) throw new HttpError(404, "Not found");
  res.json(clean(doc));
}));

router.delete("/content/pricing/:id", requireAdmin, ah(async (req, res) => {
  if (!(await c("pricing").deleteOne({ id: req.params.id })).deletedCount) throw new HttpError(404, "Not found");
  res.status(204).end();
}));

// ── Portfolio ──
router.get("/content/portfolio", ah(async (_q, res) => res.json(clean(await c("portfolio").find(LIVE).sort({ order: 1 }).limit(200).toArray()))));

router.post("/content/portfolio", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const url = await storeProcessedImage(requireFile(req), "portfolio", 1800, 200 * 1024);
  const cat = cut(req.body.cat || "Bridal", 40);
  const caption = cut(req.body.caption, 120) || `${cat} · Studio`;
  const doc = { id: uuid(), cat, caption, alt_text: cut(req.body.alt_text, 150) || `${caption} — makeup by Rekha Krishnamurthy`, image: url, order: await c("portfolio").countDocuments({}), is_deleted: false, created_at: nowIso() };
  await c("portfolio").insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.patch("/content/portfolio/:id", requireAdmin, ah(async (req, res) => {
  const patch = pick(req.body || {}, { cat: 40, caption: 120, alt_text: 150 });
  const doc = await c("portfolio").findOneAndUpdate({ id: req.params.id, ...LIVE }, { $set: patch }, { returnDocument: "after" });
  if (!doc) throw new HttpError(404, "Not found");
  res.json(clean(doc));
}));

router.delete("/content/portfolio/:id", requireAdmin, ah(async (req, res) => {
  if (!(await c("portfolio").updateOne({ id: req.params.id, ...LIVE }, { $set: { is_deleted: true } })).modifiedCount) throw new HttpError(404, "Not found");
  res.status(204).end();
}));

// ── Course batches ──
router.get("/content/batches", ah(async (_q, res) => res.json(clean(await c("course_batches").find({}).limit(50).toArray()))));

router.put("/content/batches/:slug", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  if (!b.date || String(b.date).length > 10) throw new HttpError(422, "date is required (YYYY-MM-DD)");
  if (b.note != null && String(b.note).length > 160) throw new HttpError(422, "note must be at most 160 characters");
  const seats = b.seats == null || b.seats === "" ? null : Number(b.seats);
  if (seats != null && (!Number.isInteger(seats) || seats < 1 || seats > 999)) throw new HttpError(422, "seats must be 1–999");
  const doc = { path: `/${req.params.slug}`, date: String(b.date), note: b.note ?? null, seats: seats || 5, updated_at: nowIso() };
  await c("course_batches").updateOne({ path: doc.path }, { $set: doc }, { upsert: true });
  res.json(clean(doc));
}));

router.delete("/content/batches/:slug", requireAdmin, ah(async (req, res) => {
  await c("course_batches").deleteOne({ path: `/${req.params.slug}` });
  res.status(204).end();
}));

// ── Page hero images ──
router.get("/content/page-images", ah(async (_q, res) => res.json(clean(await c("page_images").find({}).limit(200).toArray()))));

router.put("/content/page-images/:slug", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const url = await storeProcessedImage(requireFile(req), "heroes", 1920, 220 * 1024);
  const doc = { path: `/${req.params.slug}`, image: url, alt_text: cut(req.body.alt_text, 150), updated_at: nowIso() };
  await c("page_images").updateOne({ path: doc.path }, { $set: doc }, { upsert: true });
  res.json(clean(doc));
}));

router.patch("/content/page-images/:slug", requireAdmin, ah(async (req, res) => {
  const path = `/${req.params.slug}`;
  const alt = String((req.body && req.body.alt_text) || "");
  if (alt.length > 150) throw new HttpError(422, "alt_text must be at most 150 characters");
  const existing = (await c("page_images").findOne({ path })) || {};
  const doc = { path, image: existing.image || "", alt_text: alt, updated_at: nowIso() };
  await c("page_images").updateOne({ path }, { $set: doc }, { upsert: true });
  res.json(clean(doc));
}));

router.delete("/content/page-images/:slug", requireAdmin, ah(async (req, res) => {
  await c("page_images").deleteOne({ path: `/${req.params.slug}` });
  res.status(204).end();
}));

// ── Services ──
router.get("/content/services", ah(async (_q, res) => res.json(clean(await c("services").find({}).sort({ order: 1 }).limit(50).toArray()))));

router.post("/content/services", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const b = req.body || {};
  if (!b.title) throw new HttpError(422, "title is required");
  const count = await c("services").countDocuments({});
  let image = D.DEFAULT_SERVICES[count % D.DEFAULT_SERVICES.length].image;
  if (req.file && req.file.originalname) image = await storeImage(req.file.buffer, extOf(req.file.originalname), "services");
  const doc = { id: uuid(), no: String(count + 1).padStart(2, "0"), title: cut(b.title, 80), desc: cut(b.desc, 300), cta: cut(b.cta || "Enquire", 40), image, order: count, created_at: nowIso() };
  await c("services").insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.put("/content/services/:id", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const b = req.body || {};
  if (!b.title) throw new HttpError(422, "title is required");
  const patch = { title: cut(b.title, 80), desc: cut(b.desc, 300), cta: cut(b.cta || "Enquire", 40) };
  if (req.file && req.file.originalname) patch.image = await storeImage(req.file.buffer, extOf(req.file.originalname), "services");
  const doc = await c("services").findOneAndUpdate({ id: req.params.id }, { $set: patch }, { returnDocument: "after" });
  if (!doc) throw new HttpError(404, "Not found");
  res.json(clean(doc));
}));

router.delete("/content/services/:id", requireAdmin, ah(async (req, res) => {
  if (!(await c("services").deleteOne({ id: req.params.id })).deletedCount) throw new HttpError(404, "Not found");
  res.status(204).end();
}));

// ── Uploaded files (served from UPLOAD_DIR) ──
router.get(/^\/files\/(.+)$/, ah(async (req, res) => {
  const rel = decodeURIComponent(req.params[0]);
  const full = resolveSafe(rel);
  try {
    await fs.promises.access(full, fs.constants.R_OK);
  } catch {
    // Never fall back when this request itself came from a fallback fetch (prevents loops when
    // FILES_FALLBACK_ORIGIN points at this same site after the domain moves).
    if (req.get("x-rekha-fallback") || !(await fetchFromFallback(rel))) throw new HttpError(404, "File not found");
  }
  const ext = rel.split(".").pop().toLowerCase();
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  if (MIME[ext]) res.type(MIME[ext]);
  res.sendFile(full);
}));

// ── Reels ──
router.get("/content/reels", ah(async (_q, res) => res.json(clean(await c("reels").find(LIVE).sort({ order: 1 }).limit(20).toArray()))));

router.post("/content/reels", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const b = req.body || {};
  const image = await storeProcessedImage(requireFile(req), "reels", 900, 120 * 1024);
  const doc = { id: uuid(), title: cut(b.title, 120) || "Reel", time: cut(b.time, 10), url: cut(b.url, 300), image, order: await c("reels").countDocuments({}), is_deleted: false, created_at: nowIso() };
  await c("reels").insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.patch("/content/reels/:id", requireAdmin, ah(async (req, res) => {
  const doc = await c("reels").findOneAndUpdate({ id: req.params.id, ...LIVE }, { $set: pick(req.body || {}, { title: 120, time: 10, url: 300 }) }, { returnDocument: "after" });
  if (!doc) throw new HttpError(404, "Not found");
  res.json(clean(doc));
}));

router.delete("/content/reels/:id", requireAdmin, ah(async (req, res) => {
  if (!(await c("reels").updateOne({ id: req.params.id, ...LIVE }, { $set: { is_deleted: true } })).modifiedCount) throw new HttpError(404, "Not found");
  res.status(204).end();
}));

// ── Instagram feed ──
router.get("/content/feed", ah(async (_q, res) => res.json(clean(await c("instagram_feed").find(LIVE).sort({ order: 1 }).limit(20).toArray()))));

router.post("/content/feed", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const b = req.body || {};
  const image = await storeProcessedImage(requireFile(req), "feed", 800, 100 * 1024);
  const doc = { id: uuid(), caption: cut(b.caption, 200), likes: cut(b.likes, 20), comments: cut(b.comments, 20), url: cut(b.url, 300), image, order: await c("instagram_feed").countDocuments({}), is_deleted: false, created_at: nowIso() };
  await c("instagram_feed").insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.patch("/content/feed/:id", requireAdmin, ah(async (req, res) => {
  const doc = await c("instagram_feed").findOneAndUpdate({ id: req.params.id, ...LIVE }, { $set: pick(req.body || {}, { caption: 200, likes: 20, comments: 20, url: 300 }) }, { returnDocument: "after" });
  if (!doc) throw new HttpError(404, "Not found");
  res.json(clean(doc));
}));

router.delete("/content/feed/:id", requireAdmin, ah(async (req, res) => {
  if (!(await c("instagram_feed").updateOne({ id: req.params.id, ...LIVE }, { $set: { is_deleted: true } })).modifiedCount) throw new HttpError(404, "Not found");
  res.status(204).end();
}));

module.exports = { router, seedContent };
