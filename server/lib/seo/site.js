// Site-level SEO tools: redirects, 404 log, robots.txt, llms.txt, sitemap and real-visitor vitals.
const { getDb } = require("../core");
const { BLOG_REDIRECTS, RETIRED_SLUGS } = require("../blogSeo");
const { PAGES, SITE_URL, getOverrides } = require("../render");
const { getSettings, defaultRobots, baseLlms } = require("./settings");

// ── Redirects ──
// Built-in redirects (merged duplicate posts, old client-side aliases) + ones added in the admin.
const BUILT_IN = {
  ...Object.fromEntries(Object.entries(BLOG_REDIRECTS).map(([slug, to]) => [`/blog/${slug}`, to])),
  "/look-lab": "/corporate-professional-makeup-services",
  "/try-on": "/book-bridal-makeup-package-karnataka",
  "/legal": "/privacy",
  "/party-and-non-bridal-makeup-karnatka": "/party-and-non-bridal-makeup-karnataka",
  "/hire-celebrirt-makeup-artist-for-wedding": "/hire-celebrity-makeup-artist-for-wedding",
  // Common addresses people (and old links) guess.
  "/home": "/", "/index.html": "/", "/index.php": "/",
  "/about": "/about-us", "/about-rekha": "/about-us",
  "/services": "/bridal-makeup-bangalore", "/makeup-services": "/bridal-makeup-bangalore",
  "/bridal-makeup": "/bridal-makeup-artist-bangalore", "/bridal": "/bridal-makeup-artist-bangalore",
  "/courses": "/makeup-course-training-bangalore", "/academy": "/makeup-course-training-bangalore", "/makeup-courses": "/makeup-course-training-bangalore",
  "/self-grooming": "/self-grooming-classes", "/self-grooming-workshop": "/self-grooming-classes",
  "/gallery": "/portfolio", "/reviews": "/testimonials", "/contact-us": "/contact", "/blogs": "/blog",
  "/privacy-policy": "/privacy", "/terms-and-conditions": "/terms", "/refund-policy": "/refund", "/cookie-policy": "/cookies",
  "/groom-makeup": "/groom-makeup-artist-bangalore", "/engagement": "/engagement-makeup", "/party-makeup": "/party-makeup-artist-bangalore",
  // Old-site addresses still requested (from the 404 log).
  "/updates.php/95881/bridal-makeup-course-in-banglore-": "/bridal-makeup-course-bangalore",
  "/updates.php/95421/Bridal-makeup-package-in-Banglore-": "/book-bridal-makeup-package-karnataka",
  "/terms-of-service": "/terms", "/terms-of-service.html": "/terms",
  "/en": "/", "/en/home": "/", "/en/index.html": "/", "/english": "/", "/main": "/", "/new": "/", "/old": "/",
  ...Object.fromEntries(Array.from({ length: 40 }, (_, n) => [`/blog${n + 1}`, "/blog"])),
};

// A wrong-case or slightly different address for a real page (e.g. /About-Us, /Contact/)
// is sent to the page instead of a 404. Exact addresses always win.
function closestPage(p) {
  const low = p.toLowerCase();
  const hits = PAGES.filter((x) => x.path.toLowerCase() === low);
  return hits.length === 1 ? hits[0].path : null;
}

let redirectCache = null;
async function getRedirects() {
  if (redirectCache && Date.now() - redirectCache.t < 60000) return redirectCache.map;
  const map = Object.fromEntries(Object.entries(BUILT_IN).map(([from, to]) => [from, { from, to, code: 301, builtIn: true }]));
  try {
    for (const r of await getDb().collection("redirects").find({}, { projection: { _id: 0 } }).toArray()) map[r.from] = r;
  } catch { /* db not ready */ }
  redirectCache = { t: Date.now(), map };
  return map;
}
const clearRedirects = () => { redirectCache = null; };

const normPath = (p) => {
  let x = String(p || "").trim();
  try { if (/^https?:\/\//.test(x)) x = new URL(x).pathname; } catch { /* keep */ }
  x = "/" + x.replace(/^\/+/, "");
  return x.length > 1 ? x.replace(/\/+$/, "") : x;
};

// ── 404 log ──
async function logNotFound(p, referrer) {
  try {
    await getDb().collection("not_found").updateOne({ path: p }, { $inc: { hits: 1 }, $set: { last_seen: new Date().toISOString(), referrer: (referrer || "").slice(0, 300) }, $setOnInsert: { first_seen: new Date().toISOString() } }, { upsert: true });
  } catch { /* best effort */ }
}

// ── robots.txt ──
async function robotsTxt() {
  const s = await getSettings();
  return s.robots_txt || defaultRobots();
}
// Does robots.txt (the `User-agent: *` group) allow this path?
function robotsAllowsFn(txt) {
  const groups = [];
  let cur = null;
  for (const raw of String(txt || "").split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!cur || cur.rules.length) groups.push((cur = { agents: [], rules: [] })); cur.agents.push(v.toLowerCase()); }
    else if ((k === "allow" || k === "disallow") && cur) cur.rules.push({ allow: k === "allow", path: v });
  }
  const g = groups.find((x) => x.agents.includes("*"));
  return (p) => {
    if (!g) return true;
    let best = null;
    for (const r of g.rules) if (r.path && p.startsWith(r.path) && (!best || r.path.length > best.path.length)) best = r;
    return !best || best.allow;
  };
}

// ── Pages/posts listed for search engines ──
async function indexableUrls() {
  const ov = await getOverrides();
  const listed = (p) => !(ov[p] && (ov[p].noindex || ov[p].in_sitemap === false));
  const out = [];
  for (const p of PAGES) if (p.canonical && listed(p.path)) out.push({ path: p.path, loc: p.canonical, title: (ov[p.path] && ov[p.path].seo_title) || p.metaTitle, desc: (ov[p.path] && ov[p.path].meta_description) || p.metaDescription, group: p.group });
  const posts = await getDb().collection("blog_posts").find({ slug: { $nin: RETIRED_SLUGS } }, { projection: { _id: 0, slug: 1, title: 1, meta_description: 1, excerpt: 1, updated_at: 1, publish_date: 1 } }).sort({ publish_date: -1 }).limit(1000).toArray();
  for (const post of posts) {
    const p = `/blog/${post.slug}`;
    if (listed(p)) out.push({ path: p, loc: `${SITE_URL}${p}`, title: (ov[p] && ov[p].seo_title) || post.title, desc: (ov[p] && ov[p].meta_description) || post.meta_description || post.excerpt, lastmod: String(post.updated_at || post.publish_date || "").slice(0, 10), group: "Blog" });
  }
  return out;
}

const PRIORITY = { "/": ["1.0", "weekly"], Services: ["0.8", "monthly"], Academy: ["0.8", "monthly"], Portfolio: ["0.7", "monthly"], Header: ["0.9", "monthly"], Blog: ["0.7", "weekly"], Legal: ["0.3", "yearly"] };
async function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = await indexableUrls();
  const body = urls.map((u) => {
    const [prio, freq] = PRIORITY[u.path] || PRIORITY[u.group] || ["0.6", "monthly"];
    return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ── llms.txt: the hand-written intro + every indexable page and article ──
async function llmsTxt() {
  const s = await getSettings();
  const urls = await indexableUrls();
  const line = (u) => `- [${u.title.replace(/\s*\|.*$/, "")}](${u.loc})${u.desc ? `: ${u.desc}` : ""}`;
  const pages = urls.filter((u) => u.group !== "Blog" && u.group !== "Legal");
  const posts = urls.filter((u) => u.group === "Blog");
  const legal = urls.filter((u) => u.group === "Legal");
  const base = baseLlms().split(/\n## /)[0].trim();
  return `${base}\n\n## Pages\n${pages.map(line).join("\n")}\n\n## Articles\n${posts.map(line).join("\n")}\n\n## Policies\n${legal.map(line).join("\n")}\n${s.llms_extra ? `\n${s.llms_extra.trim()}\n` : ""}`;
}

// ── Real-visitor Core Web Vitals + JavaScript errors (sent by the site's tracker) ──
const num = (x, max) => (typeof x === "number" && isFinite(x) && x >= 0 && x < max ? x : undefined);
async function recordVitals(b, ua) {
  const p = normPath(b.path).slice(0, 200);
  const doc = { path: p, lcp: num(b.lcp, 120000), cls: num(b.cls, 50), inp: num(b.inp, 60000), fcp: num(b.fcp, 120000), ttfb: num(b.ttfb, 120000), mobile: /Mobi|Android|iPhone/i.test(ua || ""), at: new Date() };
  if ([doc.lcp, doc.cls, doc.inp, doc.fcp, doc.ttfb].every((v) => v === undefined)) return;
  await getDb().collection("vitals").insertOne(doc);
  for (const e of (Array.isArray(b.errors) ? b.errors : []).slice(0, 5)) {
    const message = String(e || "").slice(0, 300);
    if (message) await getDb().collection("js_errors").updateOne({ path: p, message }, { $inc: { hits: 1 }, $set: { last_seen: new Date().toISOString() } }, { upsert: true });
  }
}

const p75 = (arr) => {
  const v = arr.filter((x) => x !== undefined && x !== null).sort((a, b) => a - b);
  return v.length ? v[Math.min(v.length - 1, Math.floor(v.length * 0.75))] : null;
};
const band = (x, good, poor) => (x === null ? null : x <= good ? 100 : x >= poor ? 0 : Math.round(100 - ((x - good) / (poor - good)) * 50 - 25));
// Speed score in the spirit of PageSpeed: weighted good/needs-work/poor bands of the 75th percentile.
function vitalsScore(m) {
  const parts = [[band(m.lcp, 2500, 4000), 30], [band(m.cls, 0.1, 0.25), 25], [band(m.inp, 200, 500), 25], [band(m.fcp, 1800, 3000), 10], [band(m.ttfb, 800, 1800), 10]].filter(([s]) => s !== null);
  const w = parts.reduce((a, [, x]) => a + x, 0);
  return w ? Math.round(parts.reduce((a, [s, x]) => a + s * x, 0) / w) : null;
}

async function vitalsByPath(days = 28) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await getDb().collection("vitals").find({ at: { $gte: since } }, { projection: { _id: 0 } }).limit(50000).toArray();
  const by = {};
  for (const r of rows) (by[r.path] = by[r.path] || []).push(r);
  const out = {};
  const summarize = (list) => {
    const m = { samples: list.length, lcp: p75(list.map((x) => x.lcp)), cls: p75(list.map((x) => x.cls)), inp: p75(list.map((x) => x.inp)), fcp: p75(list.map((x) => x.fcp)), ttfb: p75(list.map((x) => x.ttfb)) };
    m.score = vitalsScore(m);
    return m;
  };
  for (const [p, list] of Object.entries(by)) out[p] = summarize(list);
  out.__site = summarize(rows);
  return out;
}

module.exports = { BUILT_IN, closestPage, getRedirects, clearRedirects, normPath, logNotFound, robotsTxt, robotsAllowsFn, indexableUrls, sitemapXml, llmsTxt, recordVitals, vitalsByPath };
