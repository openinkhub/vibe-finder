// SEO admin API: page report, per-URL settings, auto-configure, site settings, redirects,
// 404 log, keyword briefcase and real-visitor speed data. Plus the public vitals beacon.
const express = require("express");
const { getDb, HttpError, ah, nowIso, cut, clean } = require("../lib/core");
const { requireAdmin } = require("../lib/auth");
const R = require("../lib/render");
const site = require("../lib/seo/site");
const { getSettings, saveSettings, defaultRobots, DEFAULTS } = require("../lib/seo/settings");
const inventory = require("../lib/seo/inventory");
const rules = require("../lib/seo/rules");
const { CHECKS, CAT_LABELS } = require("../lib/seo/checks");

const KW = require("../lib/seo/keywords");
const PSI = require("../lib/seo/psi");

const router = express.Router();
const rankLog = () => getDb().collection("seo_rank_log");
const cleanKeywords = (list) => list.map((k) => ({
  keyword: cut(String(k.keyword || k).trim().toLowerCase(), 80),
  page: k.page ? site.normPath(k.page) : "",
  note: cut(String(k.note || ""), 200),
  volume: Math.max(0, Math.round(Number(k.volume) || 0)),
  country: cut(String(k.country || "IN").toUpperCase().replace(/[^A-Z]/g, ""), 2) || "IN",
})).filter((k) => k.keyword).filter((k, i, a) => a.findIndex((x) => x.keyword === k.keyword) === i).slice(0, 200);
const meta = () => getDb().collection("seo_meta");

const refresh = () => {
  R.invalidate();
  site.clearRedirects();
  inventory.invalidateInventory();
};

// ── Keyword tracker ──
// Seeds the starter terms once, then returns each term with its on-page checks against
// the target page, the best-matching page on the site and its logged positions.
router.get("/seo/keywords", requireAdmin, ah(async (req, res) => {
  let s = await getSettings();
  if (!s.keywords_seeded && !(s.keywords || []).length) {
    const today = nowIso().slice(0, 10);
    s = await saveSettings({ keywords: cleanKeywords(KW.STARTER), keywords_seeded: true });
    const first = KW.STARTER.filter((k) => k.pos).map((k) => ({ id: require("crypto").randomUUID(), keyword: k.keyword, date: today, pos: k.pos, url: k.page, source: "Rank report", created_at: nowIso() }));
    if (first.length) await rankLog().insertMany(first);
  }
  await inventory.buildReport({ force: req.query.refresh === "1" });
  const items = inventory.rawItems();
  // Every page's focus keyphrase is tracked against that page (added once; edits are kept).
  // (Each keyphrase is added only once, so removing one from the tracker sticks.)
  const tracked = new Set([...(s.keywords || []).map((k) => k.keyword), ...(s.keywords_auto || [])]);
  const add = items
    .filter((i) => i.kind === "page" && !i.noindex && i.keyphrase && !/legal/i.test((i.data && i.data.group) || ""))
    .filter((i) => !tracked.has(String(i.keyphrase).toLowerCase().trim()))
    .map((i) => ({ keyword: i.keyphrase, page: i.path, note: "Page focus keyphrase", volume: 0, country: "IN" }));
  if (add.length) s = await saveSettings({ keywords: cleanKeywords([...(s.keywords || []), ...add]), keywords_auto: [...(s.keywords_auto || []), ...add.map((k) => String(k.keyword).toLowerCase().trim())] });
  const byPath = Object.fromEntries(items.map((i) => [i.path, i]));
  const logs = await rankLog().find({}, { projection: { _id: 0 } }).sort({ date: 1, created_at: 1 }).toArray();
  const out = (s.keywords || []).map((k) => {
    const hist = logs.filter((l) => l.keyword === k.keyword);
    const ranked = hist.filter((l) => l.pos);
    const last = hist[hist.length - 1] || null;
    const prev = hist[hist.length - 2] || null;
    return {
      ...k,
      onpage: KW.onPage(byPath[k.page], k.keyword),
      best: KW.bestPage(items, k.keyword),
      local: /\bnear me\b/.test(k.keyword),
      latest: last, previous: prev,
      change: last && prev && last.pos && prev.pos ? prev.pos - last.pos : null,
      bestPos: ranked.length ? Math.min(...ranked.map((l) => l.pos)) : null,
      history: hist,
    };
  });
  res.json({ keywords: out, pages: items.filter((i) => !i.noindex).map((i) => i.path).sort() });
}));

// Log a position for a term on a date (pos null = not in the top 100).
router.post("/seo/keywords/rank", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const keyword = String(b.keyword || "").trim().toLowerCase();
  if (!keyword) throw new HttpError(422, "Choose a keyword");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || "") ? b.date : nowIso().slice(0, 10);
  const pos = b.pos === null || b.pos === "" || b.pos === undefined ? null : Math.round(Number(b.pos));
  if (pos !== null && !(pos >= 1 && pos <= 100)) throw new HttpError(422, "Position must be 1–100, or blank for not ranking");
  const doc = { id: require("crypto").randomUUID(), keyword, date, pos, url: b.url ? site.normPath(String(b.url).replace(/^https?:\/\/[^/]+/, "")) : "", source: cut(String(b.source || ""), 60), created_at: nowIso() };
  await rankLog().deleteMany({ keyword, date });
  await rankLog().insertOne({ ...doc });
  res.json(doc);
}));

router.delete("/seo/keywords/rank", requireAdmin, ah(async (req, res) => {
  await rankLog().deleteOne({ id: String(req.query.id || "") });
  res.json({ ok: true });
}));

// ── Report ──
router.get("/seo/report", requireAdmin, ah(async (req, res) => {
  const r = await inventory.buildReport({ force: req.query.refresh === "1" });
  // The list view doesn't need every check's detail.
  const items = r.items.map(({ results, ...rest }) => ({ ...rest, failing: results.filter((x) => x.status === "fail").map((x) => x.id) }));
  res.json({ ...r, items, checks: CHECKS.map(({ id, label, cat, weight, auto }) => ({ id, label, cat, weight, auto })), categories: CAT_LABELS });
}));

router.get("/seo/report/item", requireAdmin, ah(async (req, res) => {
  const p = site.normPath(req.query.path);
  const r = await inventory.buildReport();
  const item = r.items.find((x) => x.path === p);
  if (!item) throw new HttpError(404, "Not in the report");
  const doc = (await meta().findOne({ path: p }, { projection: { _id: 0 } })) || {};
  res.json({ ...item, history: (doc.history || []).slice().reverse() });
}));

// Score a draft blog post without saving it (used by the post editor's live checklist).
router.post("/seo/analyze-post", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const { marked } = require("marked");
  const cheerio = require("cheerio");
  const T = require("../lib/seo/text");
  const { runChecks } = require("../lib/seo/checks");
  const r = await inventory.buildReport();
  const formFaqs = (Array.isArray(b.faqs) ? b.faqs : []).filter((x) => x && x.q && x.a);
  const html = marked.parse(String(b.body || "").replace(/^#\s+/m, "## ")) + formFaqs.map((x) => `<h3>${R.esc(x.q)}</h3><p>${R.esc(x.a)}</p>`).join("");
  const $ = cheerio.load(`<div id="root"><h1>${R.esc(b.title || "")}</h1><img src="${R.esc(b.featured_image || "")}" alt="${R.esc(b.alt_text || "")}" width="1200" height="630">${html}</div>`);
  const parsed = inventory.parse($.html());
  const path = `/blog/${b.slug || "draft"}`;
  const others = r.items.filter((x) => x.path !== path);
  const title = b.meta_title || b.title || "";
  const desc = b.meta_description || b.excerpt || "";
  const faqs = formFaqs.length ? formFaqs : require("../lib/blogSeo").extractFaqs(b.body || "");
  const kp = b.focus_keyword || "";
  const item = {
    ...parsed, kind: "post", path, url: `${R.SITE_URL}${path}`, name: b.title, group: "Blog", date: b.publish_date, updated: nowIso().slice(0, 10), author: "Rekha Krishnamurthy",
    meta: { ...parsed.meta, title, description: desc, canonical: `${R.SITE_URL}${path}`, og: { title, description: desc, image: b.featured_image || "/og-image.webp", url: path }, tw: { card: "summary_large_image", title, description: desc, image: b.featured_image || "/og-image.webp" } },
    keyphrase: kp, related: [], noindex: false, nofollow: false, inSitemap: true, excerpt: b.excerpt || "", status: 200, prerendered: true,
    sentences: T.sentences(parsed.paragraphs.join(". ")), wordCount: T.words(parsed.text).length, schemaTypes: ["BlogPosting", "BreadcrumbList", ...(faqs.length ? ["FAQPage"] : [])],
    jsonld: [{}], jsonldErrors: 0, override: {}, redirectsIn: [], brokenLinks: [], vitals: null, jsErrors: 0, faqCount: faqs.length, hasAuthorSchema: true,
    faqSchemaQuestions: faqs.map((x) => ({ name: x.q, answer: x.a })), mostSimilar: null,
  };
  const count = (arr) => arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {});
  const settings = await getSettings();
  item.ctx = {
    dupTitles: count([...others.map((x) => x.title), title]), dupDescs: count([...others.map((x) => x.description), desc]), dupAlts: {},
    byKeyphrase: [...others, { path, keyphrase: kp }].reduce((m, x) => { const k = T.normKp(x.keyphrase); if (k) (m[k] = m[k] || []).push(x.path); return m; }, {}),
    robotsAllows: () => true, llmsHas: () => true, robots: "x", llms: "x", notFoundTotal: 0, entities: settings.entities, hasOrgSchema: true, hasContact: true, hasPolicies: true,
    cssOk: true, ctaRe: new RegExp(settings.cta_pattern, "i"), entityConsistent: true, depth: { [path]: 2 },
  };
  const out = runChecks(item);
  res.json({ scores: out.scores, results: out.results.filter((x) => !["redirects", "not_found", "robots_txt", "llms_txt", "css_errors", "crawl_depth", "uniqueness", "page_speed", "lcp", "inp", "cls", "ttfb", "fcp", "js_errors"].includes(x.id)) });
}));

// ── Per-URL settings (SEO snippet) ──
const META_FIELDS = ["seo_title", "meta_description", "keyphrase", "related_keywords", "canonical", "og_title", "og_description", "og_image", "twitter_card", "noindex", "nofollow", "in_sitemap", "custom_schema", "excerpt"];
router.put("/seo/meta", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const p = site.normPath(b.path);
  const known = R.PAGE_BY_PATH[p] || (p.startsWith("/blog/") && (await getDb().collection("blog_posts").findOne({ slug: p.slice(6) })));
  if (!known) throw new HttpError(404, "Unknown page");
  const cur = (await meta().findOne({ path: p })) || {};
  const set = {}, unset = {}, prev = {};
  for (const k of META_FIELDS) {
    if (!(k in b)) continue;
    let v = b[k];
    if (typeof v === "string") v = v.trim();
    if (k === "related_keywords") v = (Array.isArray(v) ? v : String(v || "").split(",")).map((x) => cut(String(x).trim(), 60)).filter(Boolean).slice(0, 10);
    if (["seo_title", "og_title"].includes(k)) v = cut(v, 120);
    if (["meta_description", "og_description", "excerpt"].includes(k)) v = cut(String(v).replace(/\s*\n+\s*/g, " "), 320);
    if (k === "custom_schema" && v) { try { JSON.parse(v); } catch { throw new HttpError(422, "Custom schema must be valid JSON"); } }
    if (["noindex", "nofollow"].includes(k)) v = !!v;
    if (k === "in_sitemap") v = v !== false;
    const before = cur[k] === undefined ? null : cur[k];
    const empty = v === "" || v === null || (Array.isArray(v) && !v.length) || (k === "in_sitemap" && v === true) || (["noindex", "nofollow"].includes(k) && v === false);
    if (JSON.stringify(empty ? null : v) === JSON.stringify(before)) continue; // unchanged
    prev[k] = before;
    if (v === "" || v === null || (Array.isArray(v) && !v.length) || (k === "in_sitemap" && v === true) || (["noindex", "nofollow"].includes(k) && v === false)) unset[k] = "";
    else set[k] = v;
  }
  const changed = [...Object.keys(set), ...Object.keys(unset)];
  if (!changed.length) return res.json(clean(await meta().findOne({ path: p }, { projection: { history: 0 } })) || { path: p });
  const manual = [...new Set([...(cur.manual || []), ...changed])];
  const history = [...(cur.history || []), { at: nowIso(), by: req.user ? req.user.email : "admin", source: "manual", before: prev, after: Object.fromEntries(changed.map((k) => [k, k in set ? set[k] : null])) }].slice(-20);
  await meta().updateOne({ path: p }, { $set: { path: p, ...set, manual, history, updated_at: nowIso() }, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { upsert: true });
  refresh();
  res.json(clean(await meta().findOne({ path: p }, { projection: { history: 0 } })));
}));

// Public: SEO values the browser should apply on top of the built-in page data.
router.get("/seo/public-meta", ah(async (_req, res) => {
  const ov = await R.getOverrides();
  const out = {};
  for (const [p, o] of Object.entries(ov)) {
    const v = {};
    for (const k of ["seo_title", "meta_description", "canonical", "og_title", "og_description", "og_image", "noindex", "nofollow"]) if (o[k] !== undefined && o[k] !== "") v[k] = o[k];
    if (Object.keys(v).length) out[p] = v;
  }
  res.set("Cache-Control", "public, max-age=300").json(out);
}));

// ── Auto-configure ──
router.post("/seo/autoconfig", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const out = await rules.autoConfigure({ dryRun: b.apply !== true, paths: Array.isArray(b.paths) && b.paths.length ? b.paths.map(site.normPath) : null, by: req.user ? req.user.email : "admin" });
  if (!out.dryRun) refresh();
  res.json(out);
}));
router.post("/seo/rollback", requireAdmin, ah(async (req, res) => {
  const out = await rules.rollback(site.normPath((req.body || {}).path));
  if (!out.ok) throw new HttpError(404, out.detail);
  refresh();
  res.json(out);
}));

// ── Settings ──
router.get("/seo/settings", requireAdmin, ah(async (_req, res) => {
  const s = await getSettings();
  res.json({ ...s, robots_default: defaultRobots(), defaults: DEFAULTS });
}));
router.put("/seo/settings", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const patch = {};
  if (b.rules && typeof b.rules === "object") {
    patch.rules = {};
    for (const [k, v] of Object.entries(b.rules)) if (k in DEFAULTS.rules) patch.rules[k] = typeof DEFAULTS.rules[k] === "number" ? Math.max(20, Math.min(400, Number(v) || DEFAULTS.rules[k])) : typeof DEFAULTS.rules[k] === "boolean" ? !!v : cut(String(v), 120);
  }
  if (b.business && typeof b.business === "object") patch.business = Object.fromEntries(Object.entries(b.business).filter(([k]) => k in DEFAULTS.business).map(([k, v]) => [k, cut(String(v), 160)]));
  if ("brand" in b) patch.brand = cut(String(b.brand), 80) || DEFAULTS.brand;
  if ("robots_txt" in b) patch.robots_txt = b.robots_txt && String(b.robots_txt).trim() ? String(b.robots_txt).slice(0, 5000) : null;
  if ("llms_extra" in b) patch.llms_extra = String(b.llms_extra || "").slice(0, 5000);
  if ("cta_pattern" in b) { try { new RegExp(b.cta_pattern); patch.cta_pattern = cut(String(b.cta_pattern), 200); } catch { throw new HttpError(422, "Call-to-action pattern is not a valid pattern"); } }
  if (Array.isArray(b.entities)) patch.entities = b.entities.map((e) => (Array.isArray(e) ? e : String(e).split("/")).map((x) => cut(String(x).trim(), 60)).filter(Boolean)).filter((e) => e.length).slice(0, 15);
  if (Array.isArray(b.focus_pages)) patch.focus_pages = b.focus_pages.map(site.normPath).slice(0, 50);
  if (Array.isArray(b.keywords)) patch.keywords = cleanKeywords(b.keywords);
  const s = await saveSettings(patch);
  refresh();
  res.json(s);
}));

// ── Redirects ──
router.get("/seo/redirects", requireAdmin, ah(async (_req, res) => res.json(Object.values(await site.getRedirects()).sort((a, b) => a.from.localeCompare(b.from)))));
router.post("/seo/redirects", requireAdmin, ah(async (req, res) => {
  const b = req.body || {};
  const from = site.normPath(b.from);
  const to = /^https?:\/\//.test(String(b.to || "")) ? String(b.to).trim() : site.normPath(b.to);
  if (!b.from || !b.to || from === "/") throw new HttpError(422, "Enter both the old and the new address");
  if (from === to) throw new HttpError(422, "A page can't redirect to itself");
  if (/^\/(api|admin|static)(\/|$)/.test(from)) throw new HttpError(422, "That address is reserved");
  if (R.PAGE_BY_PATH[from]) throw new HttpError(422, "That address is a live page; redirecting it would hide the page");
  const all = await site.getRedirects();
  if (all[to] && all[to].to === from) throw new HttpError(422, "That would create a redirect loop");
  const doc = { from, to, code: Number(b.code) === 302 ? 302 : 301, note: cut(b.note, 200), created_at: nowIso() };
  await getDb().collection("redirects").updateOne({ from }, { $set: doc }, { upsert: true });
  await getDb().collection("not_found").deleteOne({ path: from });
  refresh();
  res.json(doc);
}));
router.delete("/seo/redirects", requireAdmin, ah(async (req, res) => {
  await getDb().collection("redirects").deleteOne({ from: site.normPath(req.query.from) });
  refresh();
  res.status(204).end();
}));

// ── 404 log ──
router.get("/seo/404", requireAdmin, ah(async (_req, res) => res.json(clean(await getDb().collection("not_found").find({}).sort({ hits: -1 }).limit(300).toArray()))));
router.delete("/seo/404", requireAdmin, ah(async (req, res) => {
  if (req.query.path) await getDb().collection("not_found").deleteOne({ path: req.query.path });
  else await getDb().collection("not_found").deleteMany({});
  inventory.invalidateInventory();
  res.status(204).end();
}));

// ── Speed (real visitors) ──
router.get("/seo/vitals", requireAdmin, ah(async (req, res) => {
  const days = Math.max(1, Math.min(90, Number(req.query.days) || 28));
  const byPath = await site.vitalsByPath(days);
  const errors = clean(await getDb().collection("js_errors").find({}).sort({ hits: -1 }).limit(100).toArray());
  const lab = await PSI.labByPath();
  res.json({ days, site: byPath.__site || null, pages: Object.entries(byPath).filter(([k]) => k !== "__site").map(([path, v]) => ({ path, ...v })).sort((a, b) => b.samples - a.samples), errors, lab: Object.values(lab).sort((a, b) => a.path.localeCompare(b.path)), test: PSI.status() });
}));

// PageSpeed lab tests (mobile) for every indexable page, or the paths given.
// All pages and blog posts that search engines may index.
const speedPaths = async () => { await inventory.buildReport(); return inventory.rawItems().filter((i) => !i.noindex).map((i) => i.path); };
router.post("/seo/speed/run", requireAdmin, ah(async (req, res) => {
  const all = await speedPaths();
  const want = Array.isArray(req.body && req.body.paths) ? req.body.paths.filter((p) => all.includes(p)) : all;
  await PSI.run(want, { force: !!(req.body && req.body.force) });
  res.json(await speedStatus());
}));
const speedStatus = async () => {
  const st = PSI.status();
  const all = await speedPaths();
  const left = await PSI.pending(all, false);
  return { ...st, has_key: !!(await PSI.getKey()), key_from_env: !!process.env.PSI_API_KEY, pages_total: all.length, pages_tested: all.length - left.length };
};
router.get("/seo/speed/status", requireAdmin, ah(async (_req, res) => {
  const st = PSI.status();
  if (!st.running && st.finished_at) inventory.invalidateInventory();
  res.json(await speedStatus());
}));
// Save (or clear, with an empty value) the PageSpeed API key. The key is never sent back.
router.put("/seo/speed/key", requireAdmin, ah(async (req, res) => {
  await PSI.setKey(req.body && req.body.key);
  res.json(await speedStatus());
}));
router.delete("/seo/js-errors", requireAdmin, ah(async (_req, res) => {
  await getDb().collection("js_errors").deleteMany({});
  inventory.invalidateInventory();
  res.status(204).end();
}));

// Public beacon from the site's own speed tracker (no cookies, no personal data).
const beaconHits = new Map();
router.post("/seo/vitals", express.text({ type: "*/*", limit: "8kb" }), ah(async (req, res) => {
  const ip = String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0];
  const n = (beaconHits.get(ip) || 0) + 1;
  beaconHits.set(ip, n);
  if (beaconHits.size > 5000) beaconHits.clear();
  if (n <= 60) {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
    if (body && typeof body === "object") await site.recordVitals(body, req.headers["user-agent"]);
  }
  res.status(204).end();
}));
setInterval(() => beaconHits.clear(), 10 * 60 * 1000).unref();

module.exports = { router, refresh };
