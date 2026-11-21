// Stock photos served from this site instead of images.unsplash.com.
// A phone on a slow network had to open a second connection to Unsplash before the
// hero photo could load, which pushed the mobile LCP past 4 s on most pages.
// GET /img/u/<photo-id>/<width>.webp → fetched from Unsplash once, saved as WebP, then served from disk.
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(process.env.IMG_CACHE_DIR || os.tmpdir(), "rk-img-cache");
const WIDTHS = new Set([480, 800, 1000, 1200]);
const ID = /^photo-[A-Za-z0-9-]{5,80}$/;
const inflight = new Map();

async function build(id, w, file) {
  const r = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw Object.assign(new Error(`upstream ${r.status}`), { status: r.status === 404 ? 404 : 502 });
  const buf = Buffer.from(await r.arrayBuffer());
  const out = await sharp(buf, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 58, effort: 5 }).toBuffer();
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, out);
  fs.renameSync(tmp, file);
  return out;
}

function handler(req, res) {
  const { id } = req.params;
  const w = Number(req.params.w);
  if (!ID.test(id) || !WIDTHS.has(w)) return res.status(404).end();
  const file = path.join(DIR, `${id}-${w}-q58.webp`);
  const send = (buf) => res.set({ "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" }).send(buf);
  fs.readFile(file, (err, buf) => {
    if (!err) return send(buf);
    const key = `${id}-${w}`;
    if (!inflight.has(key)) inflight.set(key, build(id, w, file).finally(() => inflight.delete(key)));
    inflight.get(key).then(send, (e) => {
      // Fall back to the original address so the photo still shows.
      if (e.status === 404) return res.status(404).end();
      res.redirect(302, `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`);
    });
  });
}

// Rewrites a sized Unsplash URL (…photo-ID?…&w=800…) to the local address. Other URLs are returned as-is.
const UNSPLASH = /https:\/\/images\.unsplash\.com\/(photo-[A-Za-z0-9-]+)\?[^\s"',]*/g;
const localize = (u) => String(u).replace(UNSPLASH, (m, id) => {
  const w = Number((m.match(/[?&](?:amp;)?w=(\d+)/) || [])[1]);
  return WIDTHS.has(w) ? `/img/u/${id}/${w}.webp` : m;
});

// Same output as frontend/src/lib/img.js srcSetFor, so server HTML and the app ask for the same files.
const OWN = /^(https?:\/\/[^/]+)?\/api\/files\/[^?]+\.(jpe?g|png|webp)$/i;
const UNSPLASH_SIZED = /^https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9-]+\?/;
const SET = [480, 800, 1200];
const srcSetFor = (u) => {
  if (typeof u !== "string") return undefined;
  if (OWN.test(u)) return SET.map((w) => `${u}?w=${w} ${w}w`).join(", ");
  if (UNSPLASH_SIZED.test(u) && /[?&]w=\d+/.test(u)) { const id = u.match(/photo-[A-Za-z0-9-]+/)[0]; return SET.map((w) => `/img/u/${id}/${w}.webp ${w}w`).join(", "); }
  return undefined;
};

module.exports = { handler, localize, srcSetFor };
