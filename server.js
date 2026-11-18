// Entry file for Hostinger Node.js Web Apps (Express).
// Serves the API under /api and the built React site (frontend/build) from one process.
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cheerio = require("cheerio");

const { connect, getDb, HttpError, ah } = require("./server/lib/core");
const { seedAdmin } = require("./server/lib/auth");
const { syncReferencedFiles } = require("./server/lib/storage");
const content = require("./server/routes/content");
const blog = require("./server/routes/blog");

const app = express();
const BUILD_DIR = path.join(__dirname, "frontend", "build");
const SITE_URL = process.env.SITE_URL || "https://rekhakrishnamurthy.com";

app.set("trust proxy", true);
app.disable("x-powered-by");
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Optional CORS (only needed if the frontend is served from a different origin).
const origins = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
if (origins.length) {
  app.use("/api", (req, res, next) => {
    const o = req.get("origin");
    if (o && (origins.includes("*") || origins.includes(o))) {
      res.set({ "Access-Control-Allow-Origin": o, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": req.get("access-control-request-headers") || "*", Vary: "Origin" });
    }
    if (req.method === "OPTIONS") return res.status(204).end();
    next();
  });
}

// ── API ──
const api = express.Router();
api.get("/", (_q, res) => res.json({ message: "Rekha Krishnamurthy API", ok: true }));
api.use(require("./server/routes/auth"));
api.use(require("./server/routes/enquiries"));
api.use(require("./server/routes/studio"));
api.use(content.router);
api.use(require("./server/routes/availability"));
api.use(require("./server/routes/brochure"));
api.use(blog.router);
api.use((_q, _r, next) => next(new HttpError(404, "Not Found")));
app.use("/api", api);

app.get("/health", ah(async (_q, res) => {
  await getDb().command({ ping: 1 });
  res.json({ status: "ok" });
}));
app.get("/sitemap.xml", ah(async (_q, res) => res.type("application/xml").send(await blog.sitemapXml())));

// ── Frontend ──
app.use(express.static(BUILD_DIR, { index: false, redirect: false, maxAge: "1h", setHeaders: (res, p) => {
  if (/[\\/]static[\\/]/.test(p)) res.set("Cache-Control", "public, max-age=31536000, immutable");
} }));

const readHtml = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

// Blog posts: render per-post SEO tags at request time (replaces the build-time
// prerender, which needed the old backend running during the build).
async function blogHtml(slug) {
  const template = readHtml(path.join(BUILD_DIR, "index.html"));
  if (!template) return null;
  const post = await getDb().collection("blog_posts").findOne({ slug }, { projection: { _id: 0 } });
  if (!post) return null;
  const $ = cheerio.load(template);
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const img = post.featured_image ? (post.featured_image.startsWith("/") ? SITE_URL + post.featured_image : post.featured_image) : `${SITE_URL}/og-image.webp`;
  const title = post.meta_title || post.title;
  const desc = post.meta_description || post.excerpt || "";
  $("title").text(title);
  $('meta[name="description"]').attr("content", desc);
  $('link[rel="canonical"]').attr("href", canonical);
  $('meta[property="og:title"]').attr("content", title);
  $('meta[property="og:description"]').attr("content", desc);
  $('meta[property="og:url"]').attr("content", canonical);
  $('meta[property="og:image"]').attr("content", img);
  $('meta[property="og:image:alt"]').attr("content", post.title);
  $('meta[name="twitter:title"]').attr("content", title);
  $('meta[name="twitter:description"]').attr("content", desc);
  $('meta[name="twitter:image"]').attr("content", img);
  const article = { "@context": "https://schema.org", "@type": "BlogPosting", mainEntityOfPage: canonical, headline: post.title, description: desc, image: img, author: { "@type": "Person", name: "Rekha Krishnamurthy", url: `${SITE_URL}/about-us` }, publisher: { "@type": "Organization", name: "Rekha Krishnamurthy Makeup & Academy", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } }, datePublished: post.publish_date };
  if (post.key_takeaway) article.abstract = post.key_takeaway;
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: post.title, item: canonical }] };
  const safe = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
  $("head").append(`<script type="application/ld+json">${safe(article)}</script>`);
  $("head").append(`<script type="application/ld+json">${safe(crumbs)}</script>`);
  return $.html();
}

const blogCache = new Map();
app.get("/blog/:slug", ah(async (req, res, next) => {
  const key = req.params.slug;
  const hit = blogCache.get(key);
  if (hit && Date.now() - hit.t < 5 * 60 * 1000) return res.type("html").send(hit.html);
  const html = await blogHtml(key);
  if (!html) return next();
  blogCache.set(key, { html, t: Date.now() });
  res.type("html").send(html);
}));

// Prerendered pages live at build/<route>/index.html; anything else falls back to the SPA shell.
app.get("*", (req, res, next) => {
  if (req.method !== "GET") return next();
  const clean = decodeURIComponent(req.path).replace(/\/+$/, "") || "/";
  if (clean.includes("..")) return next();
  const candidate = clean === "/" ? path.join(BUILD_DIR, "index.html") : path.join(BUILD_DIR, clean, "index.html");
  const html = readHtml(candidate) || readHtml(path.join(BUILD_DIR, "index.html"));
  if (!html) return res.status(503).send("Site is building — please refresh in a minute.");
  res.set("Cache-Control", "no-cache").type("html").send(html);
});

// ── Errors: same shape as FastAPI ({ detail }) so the frontend's error toasts keep working ──
app.use((err, _req, res, _next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ detail: "File too large" });
  if (err && err.type === "entity.too.large") return res.status(413).json({ detail: "Request too large" });
  if (err instanceof HttpError) return res.status(err.status).json({ detail: err.detail });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ detail: "Invalid JSON" });
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

const PORT = Number(process.env.PORT || 3000);

async function start() {
  await connect();
  const db = getDb();
  await seedAdmin();
  await db.collection("enquiries").createIndex({ created_at: 1 });
  await db.collection("enquiries").createIndex({ status: 1 });
  await db.collection("bookings").createIndex({ date: 1 });
  await db.collection("files").createIndex({ storage_path: 1 });
  if (String(process.env.SEED_DEFAULTS).toLowerCase() === "true") {
    await content.seedContent();
    await blog.seedBlog();
  }
  await blog.getOrCreateApiKey();
  app.listen(PORT, () => console.log(`Rekha site listening on :${PORT}`));
  // Copy images from the old site in the background (only when FILES_FALLBACK_ORIGIN is set).
  syncReferencedFiles().catch((e) => console.error("Image sync failed:", e.message));
}

if (require.main === module) {
  start().catch((e) => {
    console.error("Startup failed:", e);
    process.exit(1);
  });
}

module.exports = { app, start };
