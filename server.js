// Entry file for Hostinger Node.js Web Apps (Express).
// Serves the API under /api and the built React site (frontend/build) from one process.
require("dotenv").config();
const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const { connect, getDb, HttpError, ah } = require("./server/lib/core");
const { seedAdmin } = require("./server/lib/auth");
const { syncReferencedFiles } = require("./server/lib/storage");
const content = require("./server/routes/content");
const blog = require("./server/routes/blog");
const seo = require("./server/routes/seo");
const R = require("./server/lib/render");
const site = require("./server/lib/seo/site");
const agent = require("./server/lib/agent");

const app = express();
const BUILD_DIR = R.BUILD_DIR;

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
// Any successful change (posts, page images, settings) refreshes the server-rendered pages and SEO report.
api.use((req, res, next) => {
  if (req.method !== "GET") res.on("finish", () => { if (res.statusCode < 400 && !req.path.startsWith("/seo/vitals")) seo.refresh(); });
  next();
});
api.use(require("./server/routes/auth"));
api.use(require("./server/routes/enquiries"));
api.use(require("./server/routes/studio"));
api.use(content.router);
api.use(require("./server/routes/availability"));
api.use(require("./server/routes/brochure"));
api.use(blog.router);
api.use(seo.router);
api.use((_q, _r, next) => next(new HttpError(404, "Not Found")));
app.use("/api", api);

app.get("/health", ah(async (_q, res) => {
  await getDb().command({ ping: 1 });
  res.json({ status: "ok" });
}));
const textRoute = (type, fn) => ah(async (_q, res) => res.set("Cache-Control", "public, max-age=600").type(type).send(await fn()));
app.get("/sitemap.xml", textRoute("application/xml", site.sitemapXml));
app.get("/robots.txt", textRoute("text/plain", site.robotsTxt));
app.get("/llms.txt", textRoute("text/plain", site.llmsTxt));

// For AI agents: a read-only MCP server + its discovery card, and Markdown versions of pages.
agent.mcpRoutes(app, express, ah);
const renderPath = async (p) => {
  if (p.startsWith("/blog/")) return R.cached(`blog:${p.slice(6)}`, () => R.blogHtml(p.slice(6), { buildSchema: blog.buildSchema }));
  if (/^\/(blog|archive)$/.test(p)) return R.cached(`list:${p}`, () => R.blogIndexHtml(p));
  if (R.PAGE_BY_PATH[p]) return R.cached(`page:${p}`, () => R.pageHtml(p));
  return null;
};
const sendMarkdown = (res, html, p) => res.status(200).set({ "Cache-Control": "public, max-age=300", Vary: "Accept", Link: agent.linkHeader(p) }).type("text/markdown; charset=utf-8").send(agent.htmlToMarkdown(html, R.SITE_URL + (p === "/" ? "" : p)));
app.get(/\.md$/, ah(async (req, res, next) => {
  const p = site.normPath(agent.fromMdPath(req.path));
  const html = await renderPath(p);
  if (!html) return next();
  sendMarkdown(res, html, p);
}));

// Redirects (built-in + added in the admin) run before anything is served.
app.use(ah(async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api/") || req.path.startsWith("/static/")) return next();
  const r = (await site.getRedirects())[site.normPath(req.path)];
  if (!r) return next();
  const qs = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  res.redirect(r.code || 301, r.to + (r.to.includes("?") ? "" : qs));
}));

// ── Frontend ──
app.use(express.static(BUILD_DIR, { index: false, redirect: false, maxAge: "1h", setHeaders: (res, p) => {
  if (/[\\/]static[\\/]/.test(p)) res.set("Cache-Control", "public, max-age=31536000, immutable");
  // Images and icons in the site root (logo, hero poster, favicons) change rarely.
  else if (/\.(png|jpe?g|webp|avif|svg|ico|woff2?)$/i.test(p)) res.set("Cache-Control", "public, max-age=2592000");
} }));

const sendHtml = (res, html, status = 200) => res.status(status).set("Cache-Control", "no-cache").type("html").send(html);
// A page: Markdown when the client asks for it (Accept: text/markdown), else HTML with a Link
// header pointing at the Markdown version and llms.txt.
const sendPage = (req, res, html, p) => {
  if (agent.wantsMarkdown(req)) return sendMarkdown(res, html, p);
  res.set({ Vary: "Accept", Link: agent.linkHeader(p) });
  return sendHtml(res, html);
};

app.get("/blog/:slug", ah(async (req, res, next) => {
  const html = await renderPath(`/blog/${req.params.slug}`);
  if (!html) return next();
  sendPage(req, res, html, `/blog/${req.params.slug}`);
}));

app.get(["/blog", "/archive"], ah(async (req, res, next) => {
  const html = await renderPath(req.path);
  if (!html) return next();
  sendPage(req, res, html, req.path);
}));

// Pre-built pages (with any SEO settings saved in the admin); unknown addresses get a real 404
// (the app still shows its "page not found" screen) and are logged for the Redirects tool.
app.get("*", ah(async (req, res) => {
  let clean;
  try { clean = site.normPath(decodeURIComponent(req.path)); } catch { clean = "/"; }
  if (R.PAGE_BY_PATH[clean]) {
    const html = await renderPath(clean);
    if (html) return sendPage(req, res, html, clean);
  }
  const shell = R.spaShell();
  if (!shell) return res.status(503).send("Site is building — please refresh in a minute.");
  if (clean === "/admin") return sendHtml(res, shell);
  const near = site.closestPage(clean);
  if (near && near !== clean) return res.redirect(301, near);
  // Bot probes for other software (WordPress, .env files...) aren't worth logging.
  if (!/\.(php|env|asp|aspx|jsp|cgi|bak|sql|ini|git|map)$|^\/(wp-|xmlrpc|cgi-bin|\.)/i.test(clean)) site.logNotFound(clean, req.get("referer"));
  sendHtml(res, shell, 404);
}));

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

// Database setup runs after the server is already listening (Hostinger requires listen()
// within a few seconds). Until it finishes, API calls answer 503 "Database not connected".
async function initDatabase() {
  await connect();
  const db = getDb();
  // No JWT_SECRET configured? Generate one once and keep it in the database.
  if (!process.env.JWT_SECRET) {
    const doc = await db.collection("settings").findOne({ key: "jwt_secret" });
    let value = doc && doc.value;
    if (!value) {
      value = require("crypto").randomBytes(48).toString("base64url");
      await db.collection("settings").updateOne({ key: "jwt_secret" }, { $set: { value } }, { upsert: true });
    }
    process.env.JWT_SECRET = value;
  }
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
  await migrateMovedPages(db).catch((e) => console.error("Moved-page migration failed:", e.message));
  scheduleSpeedTests(db);
  console.log("Database ready");
  // Copy images from the old site in the background (only when FILES_FALLBACK_ORIGIN is set).
  syncReferencedFiles().catch((e) => console.error("Image sync failed:", e.message));
}

// Pages that moved to a new URL (pages.json "formerPath") take their SEO settings and hero
// image with them; the old URL is now a guide, so its page-specific SEO fields are cleared.
// Runs once per move set.
async function migrateMovedPages(db) {
  const moved = R.PAGES.filter((p) => p.formerPath);
  if (!moved.length) return;
  const key = "migrated_moves_" + require("crypto").createHash("md5").update(moved.map((p) => p.formerPath + ">" + p.path).join("|")).digest("hex").slice(0, 10);
  if (await db.collection("settings").findOne({ key })) return;
  const PAGE_FIELDS = ["seo_title", "meta_description", "keyphrase", "related_keywords", "og_title", "og_description", "og_image", "excerpt", "canonical", "custom_schema"];
  for (const p of moved) {
    for (const name of ["seo_meta", "page_images"]) {
      const c = db.collection(name);
      const old = await c.findOne({ path: p.formerPath });
      if (old && !(await c.findOne({ path: p.path }))) {
        const { _id, ...rest } = old;
        await c.insertOne({ ...rest, path: p.path });
      }
    }
    const unset = Object.fromEntries(PAGE_FIELDS.map((f) => [f, ""]));
    await db.collection("seo_meta").updateOne({ path: p.formerPath }, { $unset: unset });
  }
  await db.collection("settings").insertOne({ key, value: new Date().toISOString() });
  R.invalidate();
  console.log(`Moved-page migration done for ${moved.length} pages`);
}

// Weekly PageSpeed lab tests for every page (fills the Speed column). Live database only.
// Keeps lab speed results fresh: every 6 hours, test any page or post with no result in the
// last 7 days. Picks up after restarts. Needs a PageSpeed API key (Admin → SEO).
function scheduleSpeedTests(db) {
  if (/127\.0\.0\.1|localhost/.test(process.env.MONGO_URL || "")) return;
  const PSI = require("./server/lib/seo/psi");
  const inventory = require("./server/lib/seo/inventory");
  const tick = async () => {
    try {
      if (!(await PSI.getKey())) return;
      await inventory.buildReport();
      await PSI.run(inventory.rawItems().filter((i) => !i.noindex).map((i) => i.path));
    } catch (e) { console.error("Speed test schedule:", e.message); }
  };
  setTimeout(tick, 5 * 60 * 1000);
  setInterval(tick, 6 * 60 * 60 * 1000);
}

async function initWithRetry(attempt = 1) {
  try {
    await initDatabase();
  } catch (e) {
    const wait = Math.min(60, attempt * 5);
    console.error(`Database setup failed (attempt ${attempt}): ${e.message} — retrying in ${wait}s`);
    setTimeout(() => initWithRetry(attempt + 1), wait * 1000);
  }
}

// Listen unconditionally at load time (no require.main guard — Hostinger loads the entry file itself).
app.listen(PORT, () => console.log(`Rekha site listening on :${PORT}`));
initWithRetry();

module.exports = { app };
