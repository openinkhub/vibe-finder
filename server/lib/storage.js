// Image storage on local disk (replaces Emergent object storage).
// Files live in UPLOAD_DIR, which must sit OUTSIDE the deployed build so uploads survive redeploys.
// Public URLs keep the old shape: /api/files/rekha-makeup/<folder>/<uuid>.<ext>
const fs = require("fs");
const path = require("path");
const os = require("os");
const sharp = require("sharp");
const { HttpError, getDb, uuid, nowIso } = require("./core");

const APP_NAME = "rekha-makeup";
const MAX_UPLOAD = 8 * 1024 * 1024;
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

const uploadDir = () => path.resolve(process.env.UPLOAD_DIR || path.join(os.homedir(), "rekha-uploads"));

// Resolve a storage path safely inside UPLOAD_DIR (blocks ../ traversal).
function resolveSafe(rel) {
  const root = uploadDir();
  const full = path.resolve(root, rel);
  if (full !== root && !full.startsWith(root + path.sep)) throw new HttpError(400, "Invalid path");
  return full;
}

async function writeObject(rel, data, contentType) {
  const full = resolveSafe(rel);
  await fs.promises.mkdir(path.dirname(full), { recursive: true });
  await fs.promises.writeFile(full, data);
  await getDb().collection("files").insertOne({ id: uuid(), storage_path: rel, content_type: contentType, size: data.length, is_deleted: false, created_at: nowIso() });
  return `/api/files/${rel}`;
}

// Store an image as uploaded (jpg/png/webp/gif) — used for services, showcase, saved looks.
async function storeImage(data, ext, folder) {
  ext = String(ext || "").toLowerCase();
  if (!MIME[ext]) throw new HttpError(400, "Only jpg, png, webp or gif images are allowed");
  if (data.length > MAX_UPLOAD) throw new HttpError(413, "Image must be under 8 MB");
  return writeObject(`${APP_NAME}/${folder}/${uuid()}.${ext}`, data, MIME[ext]);
}

// Resize + re-encode as WEBP under a target size (mirrors images.py to_webp).
async function toWebp(data, maxDim = 1920, targetBytes = 200 * 1024, minDim = 1000) {
  const base = sharp(data, { failOn: "none" }).rotate().flatten({ background: "#ffffff" });
  const meta = await sharp(data, { failOn: "none" }).rotate().metadata();
  let w = meta.width, h = meta.height;
  if (meta.orientation && meta.orientation >= 5) [w, h] = [h, w];
  const fit = (dim) => base.clone().resize({ width: dim, height: dim, fit: "inside", withoutEnlargement: true });
  let dim = Math.min(maxDim, Math.max(w || maxDim, h || maxDim));
  let out;
  for (let q = 85; q >= 20; q -= 10) {
    out = await fit(dim).webp({ quality: q }).toBuffer();
    if (out.length <= targetBytes) return out;
  }
  while (out.length > targetBytes && dim > minDim) {
    dim = Math.floor(dim * 0.85);
    out = await fit(dim).webp({ quality: 45 }).toBuffer();
  }
  return out;
}

async function storeProcessedImage(data, folder, maxDim = 1920, targetBytes = 200 * 1024, minDim = 1000) {
  if (data.length > MAX_UPLOAD) throw new HttpError(413, "Image must be under 8 MB");
  let webp;
  try {
    webp = await toWebp(data, maxDim, targetBytes, minDim);
  } catch (e) {
    console.error("image processing failed:", e.message);
    throw new HttpError(400, "Could not process this image — please try a different file");
  }
  return writeObject(`${APP_NAME}/${folder}/${uuid()}.webp`, webp, "image/webp");
}

// ── Migration helper: copy images from the old site ──
// When FILES_FALLBACK_ORIGIN is set (e.g. https://rekhakrishnamurthy.com while it still runs on
// Emergent), a missing /api/files/... image is downloaded from that origin once and saved locally.
const fallbackOrigin = () => (process.env.FILES_FALLBACK_ORIGIN || "").replace(/\/+$/, "");
const inflight = new Map();

async function fetchFromFallback(rel) {
  const origin = fallbackOrigin();
  if (!origin) return false;
  if (inflight.has(rel)) return inflight.get(rel);
  const job = (async () => {
    try {
      const r = await fetch(`${origin}/api/files/${rel.split("/").map(encodeURIComponent).join("/")}`, { headers: { "X-Rekha-Fallback": "1" }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) return false;
      const buf = Buffer.from(await r.arrayBuffer());
      const full = resolveSafe(rel);
      await fs.promises.mkdir(path.dirname(full), { recursive: true });
      await fs.promises.writeFile(full + ".part", buf);
      await fs.promises.rename(full + ".part", full);
      return true;
    } catch (e) {
      console.warn(`fallback fetch failed for ${rel}: ${e.message}`);
      return false;
    } finally {
      inflight.delete(rel);
    }
  })();
  inflight.set(rel, job);
  return job;
}

// On startup: find every /api/files/... path referenced in the content and copy the missing ones.
async function syncReferencedFiles() {
  if (!fallbackOrigin()) return;
  const db = getDb();
  const paths = new Set();
  for (const name of ["blog_posts", "portfolio", "page_images", "services", "reels", "instagram_feed", "showcase"]) {
    for (const doc of await db.collection(name).find({}).toArray()) {
      for (const m of JSON.stringify(doc).matchAll(/\/api\/files\/([^"\\\s)]+)/g)) paths.add(m[1]);
    }
  }
  let copied = 0, present = 0, failed = 0;
  for (const rel of paths) {
    try {
      await fs.promises.access(resolveSafe(rel));
      present++;
    } catch {
      (await fetchFromFallback(rel)) ? copied++ : failed++;
    }
  }
  console.log(`Image sync from ${fallbackOrigin()}: ${paths.size} referenced, ${present} already here, ${copied} copied, ${failed} failed`);
}

module.exports = { APP_NAME, MIME, MAX_UPLOAD, uploadDir, resolveSafe, storeImage, storeProcessedImage, fetchFromFallback, syncReferencedFiles };
