const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getDb, HttpError, ah, uuid, nowIso, cut, clean } = require("../lib/core");
const { requireAdmin, currentUser } = require("../lib/auth");
const { storeProcessedImage } = require("../lib/storage");
const D = require("../lib/defaults.json");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const posts = () => getDb().collection("blog_posts");
const settings = () => getDb().collection("settings");
const SITE_URL = process.env.SITE_URL || "https://rekhakrishnamurthy.com";
const PAGES_JSON = path.join(__dirname, "..", "..", "frontend", "src", "content", "pages.json");

const AUTHOR_SCHEMA = {
  "@type": "Person",
  name: "Rekha Krishnamurthy",
  jobTitle: "Bridal & Celebrity Makeup Artist",
  url: `${SITE_URL}/about-us`,
  sameAs: [
    "https://www.instagram.com/makeupbyrekhakrishnamurthy/",
    "https://www.facebook.com/makeupbyrekhakrishnamurthy/",
    "https://x.com/MakeupbyRekha",
    "https://www.linkedin.com/in/rekha-krishnamurthy-6b998839",
  ],
};

const slugify = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || uuid().slice(0, 8);
const short = () => uuid().slice(0, 6);

async function getOrCreateApiKey() {
  const doc = await settings().findOne({ key: "blog_api_key" });
  if (doc) return doc.value;
  const value = crypto.randomBytes(32).toString("base64url");
  await settings().updateOne({ key: "blog_api_key" }, { $set: { value } }, { upsert: true });
  return value;
}

const requireAdminOrApiKey = ah(async (req, _res, next) => {
  const key = req.get("X-API-Key");
  if (key) {
    if (key === (await getOrCreateApiKey())) return next();
    throw new HttpError(401, "Invalid API key");
  }
  const user = await currentUser(req);
  if (user.role !== "admin") throw new HttpError(403, "Admin only");
  next();
});

async function seedBlog() {
  if ((await posts().countDocuments({})) === 0) {
    const now = nowIso();
    await posts().insertMany(D.DEFAULT_POSTS.map((p, i) => ({ ...p, id: uuid(), author: "Rekha Krishnamurthy", order: i, created_at: now, updated_at: now })));
  }
}

function buildSchema(post) {
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.featured_image,
    author: AUTHOR_SCHEMA,
    datePublished: post.publish_date,
    publisher: { "@type": "Organization", name: "Rekha Krishnamurthy Makeup & Academy", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
  };
  if (post.key_takeaway) article.abstract = post.key_takeaway;
  const faq = post.faqs && post.faqs.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
    : null;
  return { article, faq, author: { "@context": "https://schema.org", ...AUTHOR_SCHEMA } };
}

function parseFaqs(raw) {
  let parsed;
  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    throw new HttpError(400, "faqs must be valid JSON");
  }
  if (!Array.isArray(parsed)) throw new HttpError(400, "faqs must be a list");
  return parsed.filter((f) => f && f.q && f.a).map((f) => ({ q: String(f.q).slice(0, 200), a: String(f.a).slice(0, 1000) }));
}

const storeFeatured = (buf) => storeProcessedImage(buf, "blog", 1600, 100 * 1024, 300);

const PRIORITY = { "/": ["1.0", "weekly"], Services: ["0.8", "monthly"], Academy: ["0.8", "monthly"], Portfolio: ["0.7", "monthly"], Header: ["0.9", "monthly"], Experience: ["0.6", "monthly"], "Service area": ["0.6", "monthly"], "Service Location": ["0.6", "monthly"], Explore: ["0.6", "monthly"] };

async function sitemapXml() {
  const pages = JSON.parse(fs.readFileSync(PAGES_JSON, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc, lastmod, freq, prio) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`;
  const entries = [];
  for (const p of pages) {
    if (!p.canonical || p.path === "/admin") continue;
    const [prio, freq] = PRIORITY[p.path] || PRIORITY[p.group] || ["0.6", "monthly"];
    entries.push(url(p.canonical, today, freq, prio));
  }
  for (const post of await posts().find({}, { projection: { _id: 0, slug: 1, updated_at: 1, publish_date: 1 } }).limit(1000).toArray()) {
    const raw = post.updated_at || post.publish_date || today;
    entries.push(url(`${SITE_URL}/blog/${post.slug}`, String(raw).slice(0, 10), "weekly", "0.7"));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

router.get("/sitemap.xml", ah(async (_q, res) => res.type("application/xml").send(await sitemapXml())));

router.get("/blog/api-key", requireAdmin, ah(async (_q, res) => res.json({ api_key: await getOrCreateApiKey() })));

router.post("/blog/api-key/regenerate", requireAdmin, ah(async (_q, res) => {
  const value = crypto.randomBytes(32).toString("base64url");
  await settings().updateOne({ key: "blog_api_key" }, { $set: { value } }, { upsert: true });
  res.json({ api_key: value });
}));

router.get("/blog", ah(async (_q, res) => res.json(clean(await posts().find({}).sort({ publish_date: -1 }).limit(500).toArray()))));

router.get("/blog/:slug", ah(async (req, res) => {
  const post = await posts().findOne({ slug: req.params.slug }, { projection: { _id: 0 } });
  if (!post) throw new HttpError(404, "Post not found");
  res.json({ ...post, schema: buildSchema(post) });
}));

const fields = (b, title) => ({
  title: cut(title, 150),
  meta_title: cut(b.meta_title || title, 70),
  meta_description: cut(b.meta_description || b.excerpt, 160),
  focus_keyword: cut(b.focus_keyword, 80),
  category: cut(b.category, 40) || "General",
  excerpt: cut(b.excerpt, 300),
  key_takeaway: cut(b.key_takeaway, 400),
  body: String(b.body || ""),
  faqs: parseFaqs(b.faqs || "[]"),
  interlink_url: cut(b.interlink_url, 200),
  alt_text: cut(b.alt_text, 150) || title,
});

router.post("/blog", upload.single("file"), requireAdminOrApiKey, ah(async (req, res) => {
  const b = req.body || {};
  if (!b.title) throw new HttpError(422, "title is required");
  const f = fields(b, b.title);
  let slug = slugify(b.slug || b.title);
  if (await posts().findOne({ slug })) slug = `${slug}-${short()}`;
  if (!req.file || !req.file.originalname) throw new HttpError(400, "Featured image is required");
  const featured_image = await storeFeatured(req.file.buffer);
  const now = nowIso();
  const doc = { id: uuid(), slug, ...f, author: "Rekha Krishnamurthy", publish_date: b.publish_date || now.slice(0, 10), featured_image, order: 0, created_at: now, updated_at: now };
  await posts().insertOne({ ...doc });
  res.status(201).json(doc);
}));

router.put("/blog/:id", requireAdmin, upload.single("file"), ah(async (req, res) => {
  const b = req.body || {};
  if (!b.title) throw new HttpError(422, "title is required");
  const existing = await posts().findOne({ id: req.params.id });
  if (!existing) throw new HttpError(404, "Not found");
  let slug = slugify(b.slug || b.title);
  if (slug !== existing.slug && (await posts().findOne({ slug, id: { $ne: req.params.id } }))) slug = `${slug}-${short()}`;
  const patch = { slug, ...fields(b, b.title), publish_date: b.publish_date || existing.publish_date, updated_at: nowIso() };
  if (req.file && req.file.originalname) patch.featured_image = await storeFeatured(req.file.buffer);
  res.json(clean(await posts().findOneAndUpdate({ id: req.params.id }, { $set: patch }, { returnDocument: "after" })));
}));

router.delete("/blog/:id", requireAdmin, ah(async (req, res) => {
  if (!(await posts().deleteOne({ id: req.params.id })).deletedCount) throw new HttpError(404, "Not found");
  res.status(204).end();
}));

module.exports = { router, seedBlog, getOrCreateApiKey, sitemapXml };
