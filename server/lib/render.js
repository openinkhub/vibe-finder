// Builds the HTML the server sends for each URL. Shared by the page routes and the SEO analyzer,
// so the checklist scores exactly what visitors and crawlers receive.
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");
const { getDb } = require("./core");
const { RETIRED_SLUGS } = require("./blogSeo");

const BUILD_DIR = path.join(__dirname, "..", "..", "frontend", "build");
const SITE_URL = (process.env.SITE_URL || "https://rekhakrishnamurthy.com").replace(/\/$/, "");
const PAGES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "frontend", "src", "content", "pages.json"), "utf8")).filter((p) => p.path !== "/admin");
const PAGE_BY_PATH = Object.fromEntries(PAGES.map((p) => [p.path, p]));

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const safeJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const absUrl = (u) => (!u ? "" : /^https?:\/\//.test(u) ? u : SITE_URL + (u.startsWith("/") ? u : "/" + u));

// Pre-rendered pages are complete HTML, so the app script can wait until the page has loaded
// (or the visitor interacts first). Loading it at once made mobile tests count its download in LCP.
const LOADER = (src) => `<script>(function(){var d=0;function go(){if(d)return;d=1;var s=document.createElement("script");s.src=${JSON.stringify(src)};document.head.appendChild(s)}function later(){setTimeout(go,50)}if(document.readyState==="complete")later();else addEventListener("load",later);["pointerdown","keydown","touchstart","scroll"].forEach(function(e){addEventListener(e,go,{once:true,passive:true})});setTimeout(go,3500)})()</script>`;
const { localize, srcSetFor } = require("../routes/img");
const lateMain = ($) => {
  // Stock hero photos come from this site (see routes/img.js), not a second host.
  // Only images with a srcset: the app renders those with the same local srcset, so nothing is fetched twice.
  $("#root img[srcset]").each((_, el) => {
    const $el = $(el);
    for (const a of ["src", "srcset"]) if ($el.attr(a)) $el.attr(a, localize($el.attr(a)));
  });
  const el = $('script[defer][src*="/static/js/main."]').first();
  if (el.length) el.replaceWith(LOADER(el.attr("src")));
};

const readHtml = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

// ── Per-URL SEO settings saved from the admin panel (collection seo_meta) ──
let ovCache = null;
async function getOverrides() {
  if (ovCache && Date.now() - ovCache.t < 60 * 1000) return ovCache.map;
  let docs = [];
  try {
    docs = await getDb().collection("seo_meta").find({}, { projection: { _id: 0, history: 0 } }).toArray();
  } catch {
    return ovCache ? ovCache.map : {};
  }
  ovCache = { t: Date.now(), map: Object.fromEntries(docs.map((d) => [d.path, d])) };
  return ovCache.map;
}

const htmlCache = new Map();
function invalidate() {
  try { require("./agent").clearAgentCache(); } catch { /* not loaded yet */ }
  ovCache = null;
  heroCache = null;
  htmlCache.clear();
}

// Apply saved SEO settings to a page's <head>.
function applyOverrides($, ov, defaults) {
  const title = (ov && ov.seo_title) || defaults.title;
  const desc = (ov && ov.meta_description) || defaults.description;
  const canonical = (ov && ov.canonical) || defaults.canonical;
  const ogTitle = (ov && ov.og_title) || title;
  const ogDesc = (ov && ov.og_description) || desc;
  const ogImage = absUrl((ov && ov.og_image) || defaults.image);
  if (title) $("title").text(title);
  if (desc) $('meta[name="description"]').attr("content", desc);
  if (canonical) $('link[rel="canonical"]').attr("href", canonical);
  $('meta[property="og:title"]').attr("content", ogTitle);
  $('meta[property="og:description"]').attr("content", ogDesc);
  if (canonical) $('meta[property="og:url"]').attr("content", canonical);
  if (ogImage) $('meta[property="og:image"]').attr("content", ogImage);
  $('meta[name="twitter:card"]').attr("content", (ov && ov.twitter_card) || "summary_large_image");
  if (!$('meta[name="twitter:card"]').length) $("head").append(`<meta name="twitter:card" content="${(ov && ov.twitter_card) || "summary_large_image"}">`);
  $('meta[name="twitter:title"]').attr("content", ogTitle);
  $('meta[name="twitter:description"]').attr("content", ogDesc);
  if (ogImage) $('meta[name="twitter:image"]').attr("content", ogImage);
  if (ov && (ov.noindex || ov.nofollow)) {
    $('meta[name="robots"]').remove();
    $("head").append(`<meta name="robots" content="${ov.noindex ? "noindex" : "index"},${ov.nofollow ? "nofollow" : "follow"}">`);
  }
  if (ov && ov.custom_schema) {
    try {
      const parsed = JSON.parse(ov.custom_schema);
      $("#ld-json-custom").remove();
      $("head").append(`<script type="application/ld+json" id="ld-json-custom">${safeJson(parsed)}</script>`);
    } catch { /* invalid JSON is reported by the checklist, never served */ }
  }
}

// Hero image records edited in the admin (alt text can change after the snapshot was taken).
let heroCache = null;
async function heroImages() {
  if (heroCache && Date.now() - heroCache.t < 60 * 1000) return heroCache.map;
  try {
    const docs = await getDb().collection("page_images").find({}, { projection: { _id: 0 } }).toArray();
    heroCache = { t: Date.now(), map: Object.fromEntries(docs.map((d) => [d.path, d])) };
  } catch { return heroCache ? heroCache.map : {}; }
  return heroCache.map;
}

// The hero map embedded in each page, so the app starts with the same hero image the HTML shows
// (no swap to a default image and back after the API call, which delayed the page's main paint).
const heroBoot = (heroes) => `<script type="application/json" id="rk-page-images">${safeJson(Object.values(heroes || {}).map((d) => ({ path: d.path, image: d.image || "", alt_text: d.alt_text || "" })))}</script>`;

const faqSchema = (pairs) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pairs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) });

// Pre-built page (build/<path>/index.html, with its pre-rendered content) + saved settings.
async function pageHtml(urlPath) {
  const page = PAGE_BY_PATH[urlPath];
  if (!page) return null;
  const file = urlPath === "/" ? path.join(BUILD_DIR, "index.html") : path.join(BUILD_DIR, urlPath.slice(1), "index.html");
  const raw = readHtml(file);
  if (!raw) return null;
  const ov = (await getOverrides())[urlPath] || {};
  const heroes = await heroImages();
  const hero = heroes[urlPath] || (PAGE_BY_PATH[urlPath] && PAGE_BY_PATH[urlPath].formerPath ? heroes[PAGE_BY_PATH[urlPath].formerPath] : undefined);
  const $ = cheerio.load(raw);
  applyOverrides($, ov, { title: page.metaTitle, description: page.metaDescription, canonical: page.canonical, image: "/og-image.webp" });
  if (!$('meta[name="author"]').length) $("head").append('<meta name="author" content="Rekha Krishnamurthy">');
  lateMain($);
  $("#rk-page-images").remove();
  $("body").append(heroBoot(heroes));
  if (hero && hero.alt_text) {
    const img = hero.image ? $(`#root img[src="${hero.image}"]`).first() : $();
    (img.length ? img : $("#root main img, #root section img").first()).attr("alt", hero.alt_text);
  }
  // FAQ schema generated by auto-configure from the questions shown on the page.
  if (Array.isArray(ov.faq) && ov.faq.length && !$("#ld-json-faq").length) {
    $("head").append(`<script type="application/ld+json" id="ld-json-autofaq">${safeJson(faqSchema(ov.faq))}</script>`);
  } else if (!$("#ld-json-faq, #ld-json-autofaq").length && !/"FAQPage"/.test($("head").html() || "")) {
    // Otherwise build the FAQ schema from the questions shown on the page itself.
    const pairs = require("./seo/inventory").extractFaq($);
    if (pairs.length >= 2) $("head").append(`<script type="application/ld+json" id="ld-json-autofaq">${safeJson(faqSchema(pairs))}</script>`);
  }
  // Prices as schema.org Offers on the home page (from the Pricing section's data).
  if (urlPath === "/") {
    const cat = await require("./agent").offerCatalog().catch(() => null);
    if (cat) $("head").append(`<script type="application/ld+json" id="ld-json-offers">${safeJson(cat)}</script>`);
  }
  return $.html();
}

const AUTHOR = { "@type": "Person", name: "Rekha Krishnamurthy", url: `${SITE_URL}/about-us` };

// Blog post page rendered from the database: meta tags, schema and readable article HTML.
async function blogHtml(slug, { buildSchema } = {}) {
  const template = readHtml(path.join(BUILD_DIR, "index.html"));
  if (!template) return null;
  const post = await getDb().collection("blog_posts").findOne({ slug }, { projection: { _id: 0 } });
  if (!post) return null;
  const ov = (await getOverrides())[`/blog/${slug}`] || {};
  const $ = cheerio.load(template);
  const canonical = ov.canonical || `${SITE_URL}/blog/${post.slug}`;
  const img = absUrl(post.featured_image) || `${SITE_URL}/og-image.webp`;
  const title = ov.seo_title || post.meta_title || post.title;
  const desc = ov.meta_description || post.meta_description || post.excerpt || "";
  applyOverrides($, ov, { title, description: desc, canonical, image: img });
  $('meta[property="og:type"]').attr("content", "article");
  if (!$('meta[name="author"]').length) $("head").append(`<meta name="author" content="${esc(post.author || "Rekha Krishnamurthy")}">`);
  $('meta[property="og:image:alt"]').attr("content", post.alt_text || post.title);
  const article = { "@context": "https://schema.org", "@type": "BlogPosting", mainEntityOfPage: canonical, headline: post.title, description: desc, image: img, author: AUTHOR, publisher: { "@type": "Organization", name: "Rekha Krishnamurthy Makeup & Academy", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } }, datePublished: post.publish_date, dateModified: (post.updated_at || post.publish_date || "").slice(0, 10) };
  if (post.key_takeaway) article.abstract = post.key_takeaway;
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: post.title, item: canonical }] };
  // The template is the home page's HTML: drop its page-specific schema, then add this post's.
  // Ids match the ones the browser code uses, so it updates these instead of adding duplicates.
  $("#ld-json-webpage, #ld-json-breadcrumb, #ld-json-entity, #ld-json-faq").remove();
  $("head").append(`<script type="application/ld+json" id="ld-json-blogposting">${safeJson(article)}</script>`);
  $("head").append(`<script type="application/ld+json" id="ld-json-breadcrumb">${safeJson(crumbs)}</script>`);
  const faq = buildSchema ? buildSchema(post).faq : null;
  if (faq) $("head").append(`<script type="application/ld+json" id="ld-json-blogfaq">${safeJson(faq)}</script>`);
  // Readable article for crawlers that don't run JavaScript; React replaces it on load.
  // The body's own "# Title" line becomes an h2 so the page has a single h1.
  const bodyHtml = sanitizeHtml(marked.parse(String(post.body || "").replace(/^#\s+/m, "## ")), { allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h2", "img"]), allowedAttributes: { a: ["href", "title", "rel"], img: ["src", "alt", "width", "height", "loading"] } });
  // Same layout and classes as BlogPostPage, so nothing moves when the app takes over
  // (it reads the post from #rk-post instead of fetching it, so it never renders blank first).
  const sec = "max-w-[880px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20";
  const takeaway = post.key_takeaway ? `<div class="mt-6 flex gap-3 rounded-2xl border border-[#F1DCE3] bg-[#FBE9F0] px-5 py-4"><span class="w-[18px] shrink-0"></span><div><div class="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B]">Key takeaway</div><p class="mt-1 text-sm sm:text-base text-[#4A2530] font-medium leading-relaxed">${esc(post.key_takeaway)}</p></div></div>` : "";
  $("#root").html(`<div><main class="pt-24 sm:pt-28"><div data-testid="blog-post-page"><section class="${sec} pb-0"><div><a href="/blog" class="inline-flex items-center gap-1.5 text-sm text-[#E62E6B] font-medium mb-6">Back to Blog</a><div class="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-[#E62E6B]"><span class="inline-flex items-center gap-1">${esc(post.category || "")}</span><span class="inline-flex items-center gap-1"><time datetime="${esc(post.publish_date)}">${esc(post.publish_date)}</time></span></div><h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-[#4A2530] mt-4 leading-tight">${esc(post.title)}</h1>${takeaway}<div class="mt-4 text-sm text-[#5C4E52]">By <a href="/about-us">${esc(post.author || "Rekha Krishnamurthy")}</a></div></div></section><section class="${sec} pb-0"><div><img width="1200" height="630" fetchpriority="high" decoding="async" src="${esc(post.featured_image)}"${srcSetFor(post.featured_image) ? ` srcset="${esc(srcSetFor(post.featured_image))}" sizes="(max-width: 1024px) 100vw, 1000px"` : ""} alt="${esc(post.alt_text || post.title)}" class="w-full h-64 sm:h-96 object-cover rounded-3xl"/></div></section><section class="${sec}"><div><article class="legal-md text-sm sm:text-base text-[#5C4E52] leading-relaxed mt-8">${bodyHtml}</article></div></section></div></main></div>`);
  const pick = ["slug", "title", "meta_title", "meta_description", "category", "author", "publish_date", "excerpt", "key_takeaway", "body", "faqs", "interlink_url", "featured_image", "alt_text"];
  const boot = Object.fromEntries(pick.map((k) => [k, post[k]]));
  if (buildSchema) boot.schema = buildSchema(post);
  $("body").append(`<script type="application/json" id="rk-post">${safeJson(boot)}</script>`);
  if (!$("#rk-page-images").length) $("body").append(heroBoot(await heroImages()));
  lateMain($);
  return $.html();
}

// The SPA shell with an empty #root (the built index.html carries the home page's snapshot and schema).
let shellCache = null;
function spaShell() {
  if (shellCache) return shellCache;
  const html = readHtml(path.join(BUILD_DIR, "index.html"));
  if (!html) return null;
  const $ = cheerio.load(html);
  $("#root").empty();
  $("#ld-json-webpage, #ld-json-breadcrumb, #ld-json-entity, #ld-json-faq").remove();
  $("head").append('<meta name="robots" content="noindex">');
  shellCache = $.html();
  return shellCache;
}

// Extra text/FAQ/links for a page (frontend/src/content/pageExtras.js), as HTML for server-rendered pages.
let extrasCache;
function extrasHtml(urlPath) {
  if (extrasCache === undefined) {
    try {
      const code = fs.readFileSync(path.join(__dirname, "..", "..", "frontend", "src", "content", "pageExtras.js"), "utf8").replace(/^export const /gm, "const ");
      // eslint-disable-next-line no-new-func
      extrasCache = new Function(`${code}\nreturn pageExtras;`)();
    } catch { extrasCache = {}; }
  }
  const x = extrasCache[urlPath];
  if (!x) return "";
  const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, l, h) => `<a href="${h}">${l}</a>`);
  let out = (x.sections || []).map((s) => `<h2>${esc(s.h)}</h2>${(s.p || []).map((p) => `<p>${inline(p)}</p>`).join("")}`).join("");
  if (x.faq && x.faq.length) out += `<h2>Common questions</h2>${x.faq.map(([q, a]) => `<div><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join("")}`;
  if (x.links && x.links.length) out += `<h2>Helpful resources</h2><ul>${x.links.map(([l, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a></li>`).join("")}</ul>`;
  return out;
}

// Blog index pages: the post list rendered from the database into the HTML, for crawlers.
async function blogIndexHtml(urlPath) {
  const base = await pageHtml(urlPath);
  if (!base) return null;
  const posts = await getDb().collection("blog_posts").find({ slug: { $nin: RETIRED_SLUGS } }, { projection: { _id: 0, slug: 1, title: 1, excerpt: 1, publish_date: 1, category: 1, featured_image: 1, alt_text: 1 } }).sort({ publish_date: -1 }).limit(500).toArray();
  const ov = await getOverrides();
  const listed = posts.filter((p) => !(ov[`/blog/${p.slug}`] || {}).noindex);
  const $ = cheerio.load(base);
  // A styled snapshot of the page (same layout the app shows): fill its post grid from the database.
  if ($("#blog-posts").length) {
    $("#blog-posts").html(listed.map((p) => `<a href="/blog/${esc(p.slug)}"><div class="bg-white rounded-3xl overflow-hidden border border-[#F1DCE3] h-full">${p.featured_image ? `<img width="600" height="400" loading="lazy" decoding="async" src="${esc(p.featured_image)}"${srcSetFor(p.featured_image) ? ` srcset="${esc(srcSetFor(p.featured_image))}" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"` : ""} alt="${esc(p.alt_text || p.title)}" class="w-full h-48 object-cover"/>` : ""}<div class="p-6"><div class="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">${esc(p.category || "")} · ${esc(p.publish_date || "")}</div><h3 class="font-display text-xl text-[#4A2530] mt-2">${esc(p.title)}</h3><p class="text-sm text-[#5C4E52] mt-2">${esc(p.excerpt || "")}</p><span class="mt-4 inline-flex items-center gap-1 text-sm text-[#E62E6B]">Read more</span></div></div></a>`).join(""));
    addFaqSchema($, urlPath);
    return $.html();
  }
  const h1 = (PAGE_BY_PATH[urlPath] && PAGE_BY_PATH[urlPath].h1) || (urlPath === "/archive" ? "Makeup Advice Archive" : "Makeup & Bridal Beauty Blog");
  const pg = PAGE_BY_PATH[urlPath];
  const hero = pg && pg.image ? `<img src="${esc(pg.image)}" alt="${esc(pg.h1 || pg.name)}" width="1000" height="920"/>` : "";
  $("#root").html(`<main class="prerender"><h1>${h1}</h1>${hero}${pg && pg.heroSub ? `<p>${esc(pg.heroSub.replace(/\*\*/g, ""))}</p>` : ""}${pg && pg.h1Heading ? `<h2>${esc(pg.h1Heading)}</h2>` : ""}<ul>${listed.map((p) => `<li><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a> <time datetime="${esc(p.publish_date)}">${esc(p.publish_date)}</time><p>${esc(p.excerpt)}</p></li>`).join("")}</ul>${urlPath === "/blog" ? `<h2>Bridal makeup &amp; self-grooming guides</h2><ul>${PAGES.filter((g) => g.group === "Guides").map((g) => `<li><a href="${esc(g.path)}">${esc(g.h1)}</a></li>`).join("")}</ul>` : ""}${extrasHtml(urlPath)}</main>`);
  addFaqSchema($, urlPath);
  return $.html();
}

function addFaqSchema($, urlPath) {
  const faq = (extrasCache && extrasCache[urlPath] && extrasCache[urlPath].faq) || [];
  if (faq.length && !$('script[type="application/ld+json"]').filter((_, el) => /FAQPage/.test($(el).html())).length) {
    $("head").append(`<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }).replace(/</g, "\\u003c")}</script>`);
  }
}

// Cached HTML for a URL (5 minutes, cleared whenever SEO settings or posts change).
async function cached(key, fn) {
  const hit = htmlCache.get(key);
  if (hit && Date.now() - hit.t < 5 * 60 * 1000) return hit.html;
  const html = await fn();
  if (html) htmlCache.set(key, { html, t: Date.now() });
  return html;
}

module.exports = { BUILD_DIR, SITE_URL, PAGES, PAGE_BY_PATH, readHtml, getOverrides, invalidate, applyOverrides, pageHtml, blogHtml, spaShell, blogIndexHtml, cached, absUrl, esc };
