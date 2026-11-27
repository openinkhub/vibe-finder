const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const { getDb, HttpError, ah, uuid, nowIso, cut, clean } = require("../lib/core");
const { requireAdmin, currentUser } = require("../lib/auth");
const { storeProcessedImage } = require("../lib/storage");
const D = require("../lib/defaults.json");
const { BLOG_REDIRECTS, RETIRED_SLUGS, extractFaqs, isLive, LIVE } = require("../lib/blogSeo");
const indexNow = require("../lib/seo/indexnow");
// Admins see scheduled (future-dated) posts; everyone else only sees posts whose date has arrived.
const isAdmin = async (req) => { try { return !!(await currentUser(req)); } catch (e) { return false; } };

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const posts = () => getDb().collection("blog_posts");
const settings = () => getDb().collection("settings");
const SITE_URL = process.env.SITE_URL || "https://rekhakrishnamurthy.com";

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
  // FAQ markup: the post's FAQ field, or else the "Frequently Asked Questions" section in its body.
  const faqList = post.faqs && post.faqs.length ? post.faqs : extractFaqs(post.body);
  const faq = faqList.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqList.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
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



// Same sitemap as /sitemap.xml (honours the SEO settings saved in the admin).
router.get("/sitemap.xml", ah(async (_q, res) => res.type("application/xml").send(await require("../lib/seo/site").sitemapXml())));

router.get("/blog/api-key", requireAdmin, ah(async (_q, res) => res.json({ api_key: await getOrCreateApiKey() })));

router.post("/blog/api-key/regenerate", requireAdmin, ah(async (_q, res) => {
  const value = crypto.randomBytes(32).toString("base64url");
  await settings().updateOne({ key: "blog_api_key" }, { $set: { value } }, { upsert: true });
  res.json({ api_key: value });
}));

router.get("/blog", ah(async (req, res) => res.json(clean(await posts().find((await isAdmin(req)) ? { slug: { $nin: RETIRED_SLUGS } } : LIVE()).sort({ publish_date: -1 }).limit(500).toArray()))));

router.get("/blog/:slug", ah(async (req, res) => {
  // A retired post's API call returns the post it was merged into (browsers get a 301 from the page route).
  const target = BLOG_REDIRECTS[req.params.slug];
  const slug = target && target.startsWith("/blog/") ? target.slice(6) : req.params.slug;
  if (target && slug === req.params.slug) throw new HttpError(404, "Post not found");
  const post = await posts().findOne({ slug: target && !target.startsWith("/blog/") ? "__none__" : slug }, { projection: { _id: 0 } });
  if (!post || (!isLive(post) && !(await isAdmin(req)))) throw new HttpError(404, "Post not found");
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
  // Live now → tell IndexNow engines; scheduled posts are pinged on their publish date.
  if (isLive(doc)) indexNow.notify([`/blog/${slug}`, "/blog"], "new post");
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
  const updated = clean(await posts().findOneAndUpdate({ id: req.params.id }, { $set: patch }, { returnDocument: "after" }));
  const pings = [];
  if (isLive(updated)) pings.push(`/blog/${updated.slug}`, "/blog");
  if (isLive(existing) && (existing.slug !== updated.slug || !isLive(updated))) pings.push(`/blog/${existing.slug}`, "/blog"); // old URL moved or unpublished
  if (pings.length) indexNow.notify(pings, "post updated");
  res.json(updated);
}));

router.delete("/blog/:id", requireAdmin, ah(async (req, res) => {
  const existing = await posts().findOne({ id: req.params.id });
  if (!(await posts().deleteOne({ id: req.params.id })).deletedCount) throw new HttpError(404, "Not found");
  if (existing && isLive(existing)) indexNow.notify([`/blog/${existing.slug}`, "/blog"], "post deleted");
  res.status(204).end();
}));

module.exports = { router, seedBlog, getOrCreateApiKey, buildSchema };
