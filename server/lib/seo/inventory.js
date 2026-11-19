// Builds the analysis input for every page and blog post: the served HTML parsed into
// meta tags, schema, headings, links, images and text, plus site-wide context for
// cross-page checks (duplicates, crawl depth, similarity, broken links).
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { getDb } = require("../core");
const { RETIRED_SLUGS, extractFaqs } = require("../blogSeo");
const R = require("../render");
const T = require("./text");
const site = require("./site");
const { getSettings } = require("./settings");
const { runChecks } = require("./checks");

const STATIC_OK = /^\/(robots\.txt|llms(-full)?\.txt|sitemap\.xml|favicon.*|logo.*|og-image\.webp|sample-face\.jpg|api\/files\/.*|static\/.*)$/;

// Visible question-and-answer pairs inside a "Frequently asked questions" section:
// a heading ending in "?" followed by its answer text.
function extractFaq($) {
  const out = [];
  const seen = new Set();
  $("#root").find("h2, h3").filter((_, h) => /frequently asked|\bfaqs?\b|common questions/i.test($(h).text())).each((_, h) => {
    const isQ = (_, q) => q !== h && !$(q).children().length && /\?\s*$/.test($(q).text()) && $(q).text().trim().length > 8;
    let box = $(h).parent();
    for (let n = 0; n < 3 && !box.find("*").filter(isQ).length; n += 1) box = box.parent();
    box.find("*").filter(isQ).each((_, el) => {
      const q = $(el).text().replace(/\s+/g, " ").trim();
      if (q.length > 200 || seen.has(q)) return;
      const next = $(el).next().length && !/^Q$/.test($(el).next().text().trim()) ? $(el).next() : $(el).parent().next();
      const a = (next.find("p").length ? next.find("p").map((_, x) => $(x).text()).get().join(" ") : next.text().replace(/^\s*A(?=\s|[A-Z])/, "")).replace(/\s+/g, " ").trim();
      if (a.length >= 20 && !/\?$/.test(a)) { seen.add(q); out.push({ q, a: a.slice(0, 1000) }); }
    });
  });
  return out;
}

function parse(html) {
  const $ = cheerio.load(html);
  const meta = {
    title: $("title").first().text().trim(),
    description: ($('meta[name="description"]').attr("content") || "").trim(),
    canonical: $('link[rel="canonical"]').attr("href") || "",
    robots: ($('meta[name="robots"]').attr("content") || "").toLowerCase(),
    author: $('meta[name="author"]').attr("content") || "",
    og: { title: $('meta[property="og:title"]').attr("content"), description: $('meta[property="og:description"]').attr("content"), image: $('meta[property="og:image"]').attr("content"), url: $('meta[property="og:url"]').attr("content") },
    tw: { card: $('meta[name="twitter:card"]').attr("content"), title: $('meta[name="twitter:title"]').attr("content"), description: $('meta[name="twitter:description"]').attr("content"), image: $('meta[name="twitter:image"]').attr("content") },
  };
  const jsonld = [];
  let jsonldErrors = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    try { jsonld.push(JSON.parse($(el).html())); } catch { jsonldErrors += 1; }
  });
  const types = new Set();
  const faqQ = [];
  let hasAuthorSchema = false;
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    const t = [].concat(o["@type"] || []);
    t.forEach((x) => types.add(x));
    if (t.includes("FAQPage")) [].concat(o.mainEntity || []).forEach((q) => faqQ.push({ name: q && q.name, answer: q && q.acceptedAnswer && q.acceptedAnswer.text }));
    if (o.author && [].concat(o.author).some((a) => a && a["@type"] === "Person")) hasAuthorSchema = true;
    if (t.includes("Person") && o.name) hasAuthorSchema = hasAuthorSchema || true;
    Object.values(o).forEach(walk);
  };
  jsonld.forEach(walk);

  const root = $("#root").clone();
  const all = root.find("a[href]").map((_, a) => ({ href: $(a).attr("href"), text: $(a).text().replace(/\s+/g, " ").trim() })).get();
  // Main content: drop the site navigation, header, footer and floating widgets.
  root.find("nav, header, footer, [class*='fixed']").remove();
  const content = root;
  const contentLinks = content.find("a[href]").map((_, a) => ({ href: $(a).attr("href"), text: $(a).text().replace(/\s+/g, " ").trim() })).get();
  const split = (links) => ({
    internal: links.filter((l) => l.href.startsWith("/") && !l.href.startsWith("//")),
    external: links.filter((l) => /^https?:\/\//.test(l.href) && !l.href.includes("rekhakrishnamurthy.com") && !/wa\.me|whatsapp|instagram|facebook|x\.com|linkedin|tel:|mailto:/.test(l.href)),
  });
  const images = content.find("img").map((_, im) => ({ src: $(im).attr("src") || "", alt: ($(im).attr("alt") || "").trim(), width: $(im).attr("width"), height: $(im).attr("height"), loading: $(im).attr("loading") })).get();
  const h1s = root.find("h1").map((_, h) => $(h).text().replace(/\s+/g, " ").trim()).get();
  const subheadings = content.find("h2, h3").map((_, h) => $(h).text().replace(/\s+/g, " ").trim()).get();
  const paragraphs = content.find("p").map((_, p) => $(p).text().replace(/\s+/g, " ").trim()).get().filter((x) => T.words(x).length >= 3);
  // Sections: words between consecutive H2/H3 headings.
  const sections = [];
  let curWords = 0;
  content.find("h2, h3, p, li").each((_, el) => {
    if (/^h[23]$/i.test(el.tagName)) { sections.push({ words: curWords }); curWords = 0; } else curWords += T.words($(el).text()).length;
  });
  sections.push({ words: curWords });
  content.find("script, style").remove();
  const text = content.text().replace(/\s+/g, " ").trim();
  const faqHeadings = content.find("h3, h4, summary, button, dt").filter((_, el) => /\?\s*$/.test($(el).text().trim())).length;
  return { metaAuthor: meta.author, faqPairs: extractFaq($), meta, jsonld, jsonldErrors, schemaTypes: [...types], faqSchemaQuestions: faqQ, hasAuthorSchema, allLinks: split(all), allInternalHrefs: all.filter((l) => l.href.startsWith("/")).map((l) => l.href), contentLinks: split(contentLinks), images, h1s, subheadings, h2s: subheadings.length, paragraphs, sections, text, faqHeadings, firstParagraph: paragraphs[0] || "", rootTextLen: $("#root").text().trim().length };
}

let cache = null;
const invalidateInventory = () => { cache = null; };

// Build (or reuse, 10 minutes) the full report for the site.
async function buildReport({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.t < 10 * 60 * 1000) return cache.v;
  const db = getDb();
  const settings = await getSettings();
  const ov = await R.getOverrides();
  const blog = require("../../routes/blog");
  const posts = await db.collection("blog_posts").find({ slug: { $nin: RETIRED_SLUGS } }, { projection: { _id: 0 } }).toArray();
  const redirects = await site.getRedirects();
  const robots = await site.robotsTxt();
  const robotsAllows = site.robotsAllowsFn(robots);
  const llms = await site.llmsTxt();
  const indexable = new Set((await site.indexableUrls()).map((u) => u.path));
  const notFoundTotal = await db.collection("not_found").countDocuments({}).catch(() => 0);
  const vitals = await site.vitalsByPath().catch(() => ({}));
  const jsErr = await db.collection("js_errors").find({}).toArray().catch(() => []);
  const jsByPath = {};
  for (const e of jsErr) jsByPath[e.path] = (jsByPath[e.path] || 0) + (e.hits || 1);
  const pageImages = Object.fromEntries((await db.collection("page_images").find({}).toArray()).map((x) => [x.path, x]));

  const items = [];
  for (const p of R.PAGES) {
    const html = /^\/(blog|archive)$/.test(p.path) ? await R.blogIndexHtml(p.path) : await R.pageHtml(p.path);
    if (!html) continue;
    const file = p.path === "/" ? path.join(R.BUILD_DIR, "index.html") : path.join(R.BUILD_DIR, p.path.slice(1), "index.html");
    let mtime = null;
    try { mtime = fs.statSync(file).mtime.toISOString().slice(0, 10); } catch { /* none */ }
    items.push({ kind: "page", path: p.path, url: p.canonical || R.SITE_URL + p.path, name: p.name + (p.group ? ` (${p.group})` : ""), group: p.group, date: null, updated: mtime, data: p, html, override: ov[p.path] || {}, heroImage: pageImages[p.path] });
  }
  for (const post of posts) {
    const pth = `/blog/${post.slug}`;
    const html = await R.blogHtml(post.slug, { buildSchema: blog.buildSchema });
    if (!html) continue;
    items.push({ kind: "post", path: pth, url: `${R.SITE_URL}${pth}`, name: post.title, group: "Blog", date: post.publish_date, updated: String(post.updated_at || post.publish_date || "").slice(0, 10), data: post, html, override: ov[pth] || {} });
  }

  const known = new Set([...items.map((i) => i.path), "/blog", "/archive", ...Object.keys(redirects)]);
  for (const it of items) {
    Object.assign(it, parse(it.html));
    delete it.html;
    const o = it.override;
    it.keyphrase = (o.keyphrase || (it.kind === "post" ? it.data.focus_keyword : "") || "").trim();
    it.related = o.related_keywords || [];
    it.author = it.metaAuthor || (/Rekha Krishnamurthy|By Rekha/i.test(it.text) || it.kind === "post" ? "Rekha Krishnamurthy" : "");
    it.noindex = /noindex/.test(it.meta.robots) || !!o.noindex;
    it.nofollow = /nofollow/.test(it.meta.robots) || !!o.nofollow;
    it.inSitemap = indexable.has(it.path);
    it.excerpt = it.kind === "post" ? it.data.excerpt : o.excerpt || it.data.metaDescription || "";
    it.status = 200;
    it.prerendered = it.rootTextLen > 200;
    it.sentences = T.sentences(it.paragraphs.join(". "));
    it.wordCount = T.words(it.text).length;
    it.faqCount = it.kind === "post" ? (it.data.faqs && it.data.faqs.length) || extractFaqs(it.data.body).length : it.faqHeadings;
    it.redirectsIn = Object.values(redirects).filter((r) => r.to === it.path).map((r) => r.from);
    it.brokenLinks = [...new Set(it.contentLinks.internal.map((l) => site.normPath(l.href.split(/[?#]/)[0])).filter((h) => h && !known.has(h) && !STATIC_OK.test(h)))];
    it.vitals = vitals[it.path];
    it.jsErrors = jsByPath[it.path] || 0;
  }

  // Site-wide context
  const count = (arr) => arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {});
  const ctx = {
    dupTitles: count(items.map((i) => i.meta.title)),
    dupDescs: count(items.map((i) => i.meta.description)),
    dupAlts: count(items.filter((i) => i.images[0] && i.images[0].alt).map((i) => i.images[0].alt.toLowerCase())),
    byKeyphrase: items.reduce((m, i) => { const k = T.normKp(i.keyphrase); if (k) (m[k] = m[k] || []).push(i.path); return m; }, {}),
    robots, robotsAllows, llms, llmsHas: (p) => llms.includes(`${R.SITE_URL}${p === "/" ? "" : p})`) || llms.includes(`${R.SITE_URL}${p})`),
    notFoundTotal,
    entities: settings.entities,
    hasOrgSchema: items.some((i) => i.schemaTypes.includes("Organization")),
    hasContact: true,
    hasPolicies: items.some((i) => i.path === "/privacy"),
    cssOk: fs.existsSync(path.join(R.BUILD_DIR, "static", "css")),
    ctaRe: new RegExp(settings.cta_pattern, "i"),
    entityConsistent: true,
  };
  // Crawl depth: breadth-first from the home page over every internal link (menus included).
  const linksOf = Object.fromEntries(items.map((i) => [i.path, [...new Set(i.allInternalHrefs.map((h) => site.normPath(h.split(/[?#]/)[0])))]]));
  linksOf["/blog"] = linksOf["/blog"] || [];
  for (const i of items) if (i.kind === "post") linksOf["/blog"].push(i.path);
  const depth = { "/": 0 };
  const queue = ["/"];
  while (queue.length) {
    const cur = queue.shift();
    for (const nx of linksOf[cur] || []) {
      const target = redirects[nx] ? redirects[nx].to : nx;
      if (depth[target] === undefined) { depth[target] = depth[cur] + 1; queue.push(target); }
    }
  }
  ctx.depth = depth;
  // Content similarity, ignoring passages shared by many pages (menus, contact form, testimonials).
  const sh = items.map((i) => T.shingles(i.text));
  const df = {};
  sh.forEach((s) => s.forEach((x) => { df[x] = (df[x] || 0) + 1; }));
  const limit = Math.max(3, Math.round(items.length * 0.1));
  const own = sh.map((s) => new Set([...s].filter((x) => df[x] <= limit)));
  items.forEach((it, a) => {
    let best = null;
    items.forEach((other, b) => {
      if (a === b) return;
      const sim = T.jaccard(own[a], own[b]);
      if (!best || sim > best.sim) best = { sim, path: other.path };
    });
    it.mostSimilar = best;
  });

  const report = items.map((it) => {
    it.ctx = ctx;
    const { results, scores } = runChecks(it);
    delete it.ctx;
    return {
      kind: it.kind, path: it.path, url: it.url, name: it.name, group: it.group, date: it.date, updated: it.updated,
      title: it.meta.title, description: it.meta.description, keyphrase: it.keyphrase, canonical: it.meta.canonical,
      noindex: it.noindex, nofollow: it.nofollow, inSitemap: it.inSitemap, focus: (settings.focus_pages || []).includes(it.path),
      internalLinks: it.contentLinks.internal.length, outboundLinks: it.contentLinks.external.length, wordCount: it.wordCount,
      image: it.images[0] || null, excerpt: it.excerpt, override: it.override,
      scores, results, issues: results.filter((r) => r.status === "fail").length, warnings: results.filter((r) => r.status === "warn").length,
    };
  });
  const avg = (k) => {
    const v = report.map((r) => r.scores[k]).filter((x) => x !== null);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
  };
  const v = { generated_at: new Date().toISOString(), totals: { pages: report.filter((r) => r.kind === "page").length, posts: report.filter((r) => r.kind === "post").length, seo: avg("seo"), content: avg("content"), readability: avg("readability"), performance: avg("performance") }, site: { vitals: vitals.__site || null, notFound: notFoundTotal }, items: report };
  cache = { t: Date.now(), v, raw: items };
  return v;
}

// Parsed page data from the last report (used by the auto-configure rules).
const rawItems = () => (cache ? cache.raw : []);

module.exports = { rawItems, buildReport, invalidateInventory, parse, extractFaq };
