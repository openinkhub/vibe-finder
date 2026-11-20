// The 65-point SEO checklist. Each check returns { status, value, msg, fix } where status is
// pass | warn | fail | na. Checks belong to a category that feeds one score:
//   seo         – technical / on-page settings (auto-configure fixes these)
//   content     – keywords, links, uniqueness, FAQ, entities (suggestions)
//   readability – writing quality (suggestions)
//   performance – real-visitor Core Web Vitals (from the built-in tracker)
const T = require("./text");

const C = (id, label, cat, weight, auto, fn) => ({ id, label, cat, weight, auto, fn });
const pass = (value, msg) => ({ status: "pass", value, msg });
const warn = (value, msg, fix) => ({ status: "warn", value, msg, fix });
const fail = (value, msg, fix) => ({ status: "fail", value, msg, fix });
const na = (msg) => ({ status: "na", msg });
const pct = (x) => `${Math.round(x * 100)}%`;
const len = (s) => String(s || "").length;
const has = (s, kp) => !!kp && String(s || "").toLowerCase().includes(kp.toLowerCase());

const GENERIC_ANCHORS = /^(click here|here|read more|more|learn more|this|link|go|view|see more|know more)$/i;

const CHECKS = [
  // ── Basics ──
  C("page_name", "Page name", "seo", 1, false, (i) => (i.name ? pass(i.name) : fail("", "No page name"))),
  C("publish_date", "Publish date", "seo", 1, true, (i) => (i.kind === "post" ? (i.date ? pass(i.date) : fail("", "No publish date", "Set a publish date")) : pass(i.date || "Static page", "Static page — dated by its last update"))),
  C("author", "Author", "seo", 2, true, (i) => (i.author ? pass(i.author) : fail("", "No author shown", "Show the author byline"))),
  C("seo_title", "SEO title", "seo", 5, true, (i) => {
    const t = i.meta.title, n = len(t);
    if (!t) return fail("", "Missing title tag", "Add an SEO title");
    if (n > 60) return fail(`${n} chars`, `Too long (${n}); Google cuts titles after ~60 characters`, "Shorten to 60 characters or fewer");
    if (n < 30) return warn(`${n} chars`, `Short (${n}); 30–60 characters works best`, "Add the service and location");
    if (i.keyphrase && !has(t, i.keyphrase) && T.termCoverage(t, [i.keyphrase]).share < 0.75) return warn(t, "Keyphrase not in the title", "Start the title with the keyphrase");
    if (i.ctx.dupTitles[t] > 1) return fail(t, "Same title as another page", "Make the title unique");
    return pass(t, `${n} characters`);
  }),
  C("slug", "Slug", "seo", 3, false, (i) => {
    const s = i.path.split("/").filter(Boolean).pop() || "";
    if (i.path === "/") return pass("/", "Home page");
    const issues = [];
    if (/[A-Z]/.test(s)) issues.push("has capital letters");
    if (/_|\s|%/.test(s)) issues.push("use hyphens only");
    if (s.length > 75) issues.push(`long (${s.length} characters)`);
    if (/makup|bangaore|karnatka|celebrirt/.test(s)) issues.push("contains a spelling mistake");
    if (issues.length) return warn(s, `Slug ${issues.join(", ")}`, "Kept as-is to protect existing rankings; fix only with a 301 redirect");
    return pass(s);
  }),
  C("meta_description", "Meta description", "seo", 5, true, (i) => {
    const d = i.meta.description, n = len(d);
    if (!d) return fail("", "Missing meta description", "Write a 120–160 character summary");
    if (/\n/.test(d)) return fail(`${n} chars`, "Contains line breaks", "Remove line breaks");
    if (n > 160) return fail(`${n} chars`, `Too long (${n}); trimmed in results after ~160`, "Shorten to 160 characters or fewer");
    if (n < 70) return warn(`${n} chars`, `Short (${n})`, "Expand to 120–160 characters");
    if (i.ctx.dupDescs[d] > 1) return fail(d, "Same description as another page", "Make it unique");
    if (i.keyphrase && !has(d, i.keyphrase) && T.termCoverage(d, [i.keyphrase]).share < 0.6) return warn(`${n} chars`, "Keyphrase not in the description", "Mention the keyphrase once");
    return pass(`${n} chars`);
  }),
  C("keyphrase", "Keyphrase", "seo", 4, true, (i) => (i.keyphrase ? pass(i.keyphrase) : fail("", "No focus keyphrase set", "Set one keyphrase per page"))),
  C("canonical", "Canonical URL", "seo", 4, true, (i) => {
    const c = i.meta.canonical;
    if (!c) return fail("", "Missing canonical", "Add a self-referencing canonical");
    if (!/^https:\/\//.test(c)) return fail(c, "Canonical is not HTTPS");
    if (c.replace(/\/$/, "") !== i.url.replace(/\/$/, "")) return warn(c, "Canonical points to a different URL", "Point it at this page unless it's a duplicate");
    return pass(c);
  }),
  C("hero_image", "Hero image", "seo", 2, true, (i) => {
    const img = i.images[0];
    if (!img) return i.meta.og.image && (i.group === "Legal" || /^\/(blog|archive)$/.test(i.path)) ? pass("Not needed", "Text page; shares with the site image") : warn("", "No image on the page", "Add a relevant hero image");
    if (!img.alt) return fail(img.src, "Hero image has no alt text", "Describe the image in its alt text");
    if (i.ctx.dupAlts[img.alt.toLowerCase()] > 3) return warn(img.alt, `Alt text "${img.alt}" is reused on ${i.ctx.dupAlts[img.alt.toLowerCase()]} pages`, "Write alt text specific to this page's image");
    return pass(img.alt);
  }),
  C("h1", "H1 heading", "seo", 5, false, (i) => {
    const n = i.h1s.length;
    if (!n) return fail("", "No H1", "Add one H1 heading");
    if (n > 1) return fail(`${n} H1s`, "More than one H1", "Keep a single H1");
    if (i.keyphrase && T.termCoverage(i.h1s[0], [i.keyphrase]).share < 0.6) return warn(i.h1s[0], "H1 doesn't contain the keyphrase", "Work the keyphrase into the H1");
    return pass(i.h1s[0]);
  }),
  C("indexing", "Google indexing", "seo", 5, true, (i) => {
    if (i.noindex) return fail("noindex", "Page is set to noindex", "Allow indexing unless the page should stay out of Google");
    if (!i.ctx.robotsAllows(i.path)) return fail("blocked", "Blocked by robots.txt", "Remove the Disallow rule");
    return pass("index");
  }),
  C("authority", "Authority signal", "content", 2, false, (i) => {
    const s = i.links.external.filter((l) => /\.(gov|edu|org|ac)(\.|\/|$)|wikipedia|who\.int|nih\.gov|aad\.org|mayoclinic|healthline/i.test(l.href)).length;
    return s ? pass(`${s} authoritative source(s)`) : warn("0", "No links to authoritative sources", "Cite 1–2 trusted sources (e.g. dermatology bodies) where you make factual claims");
  }),
  C("trust", "Trust signal", "seo", 3, false, (i) => {
    const sig = [i.author && "author", i.ctx.hasOrgSchema && "organization schema", i.ctx.hasContact && "contact details", i.ctx.hasPolicies && "policy pages"].filter(Boolean);
    return sig.length >= 3 ? pass(sig.join(", ")) : warn(sig.join(", "), "Few trust signals", "Show author, contact details and policy links");
  }),
  C("sitemap", "Insert in sitemap.xml", "seo", 4, true, (i) => (i.inSitemap ? pass("Included") : i.noindex ? pass("Excluded (noindex)") : fail("Missing", "Not in sitemap.xml", "Include the page in the sitemap"))),
  C("follow", "Follow", "seo", 3, true, (i) => (i.nofollow ? warn("nofollow", "Links on this page are nofollow", "Use follow so link value flows through the site") : pass("follow"))),
  C("outbound_links", "Outbound links", "content", 2, false, (i) => (i.contentLinks.external.length ? pass(`${i.contentLinks.external.length}`) : warn("0", "No outbound links in the content", "Link to 1–2 relevant outside sources"))),
  C("internal_links", "Internal links", "content", 4, false, (i) => {
    const n = i.contentLinks.internal.length;
    if (n >= 3) return pass(`${n} in content`);
    return (n ? warn : fail)(`${n} in content`, `Only ${n} internal link(s) in the main content`, "Link to 3+ related pages (services, academy, posts)");
  }),
  C("crawling", "Crawling", "seo", 4, false, (i) => {
    if (i.status !== 200) return fail(String(i.status), `Returns HTTP ${i.status}`);
    if (!i.prerendered) return fail("JS only", "Content is only visible after JavaScript runs", "Pre-render this page");
    return pass("200, content in HTML");
  }),
  C("llms", "Submit to LLM (llms.txt)", "seo", 2, true, (i) => (i.ctx.llmsHas(i.path) ? pass("Listed in llms.txt") : fail("Missing", "Not listed in llms.txt", "List the page in llms.txt"))),
  C("serp_view", "SERP view", "seo", 1, false, (i) => (i.meta.title && i.meta.description ? pass("Preview available") : fail("", "Title or description missing"))),
  C("excerpt", "Edit excerpt", "seo", 2, true, (i) => {
    const n = len(i.excerpt);
    if (!n) return fail("", "No excerpt", "Add a 1–2 sentence excerpt");
    if (n < 50) return warn(`${n} chars`, "Very short excerpt", "Use 1–2 full sentences");
    return pass(`${n} chars`);
  }),

  // ── Readability ──
  C("word_complexity", "Word complexity", "readability", 3, false, (i) => {
    const share = T.complexWordShare(i.text);
    return share <= 0.1 ? pass(pct(share), "complex words") : warn(pct(share), "Many 3+ syllable words", "Swap long words for simpler ones");
  }),
  C("transition_words", "Transition words", "readability", 3, false, (i) => {
    if (i.sentences.length < 5) return na("Too little text");
    const share = i.sentences.filter(T.hasTransition).length / i.sentences.length;
    return share >= 0.3 ? pass(pct(share)) : warn(pct(share), "Under 30% of sentences use transition words", "Connect ideas with words like 'also', 'however', 'for example'");
  }),
  C("passive_voice", "Passive voice", "readability", 3, false, (i) => {
    if (i.sentences.length < 5) return na("Too little text");
    const share = i.sentences.filter(T.isPassive).length / i.sentences.length;
    return share <= 0.1 ? pass(pct(share)) : warn(pct(share), "Over 10% of sentences are passive", "Rewrite as 'Rekha applies…' rather than '…is applied'");
  }),
  C("consecutive_sentences", "Consecutive sentences", "readability", 2, false, (i) => {
    const runs = T.consecutiveStarts(i.sentences);
    return runs.length ? warn(runs.map((r) => `${r.count}× "${r.word}"`).join(", "), "Several sentences in a row start with the same word", "Vary sentence openings") : pass("Varied");
  }),
  C("inclusive_language", "Inclusive language", "readability", 2, false, (i) => {
    const issues = T.inclusiveIssues(i.text);
    return issues.length ? warn(issues.map((x) => x.term).join(", "), "Terms to review", issues.map((x) => `"${x.term}" → "${x.suggest}"`).join("; ")) : pass("No issues");
  }),
  C("subheading_distribution", "Subheading distribution", "readability", 3, false, (i) => {
    const long = i.sections.filter((s) => s.words > 300).length;
    return long ? warn(`${long} section(s)`, `${long} section(s) run over 300 words without a subheading`, "Break long sections with H2/H3 subheadings") : pass(`${i.h2s} subheadings`);
  }),
  C("paragraph_length", "Paragraph length", "readability", 2, false, (i) => {
    const long = i.paragraphs.filter((p) => T.words(p).length > 150).length;
    return long ? warn(`${long} long`, `${long} paragraph(s) over 150 words`, "Split long paragraphs") : pass("All under 150 words");
  }),
  C("sentence_length", "Sentence length", "readability", 3, false, (i) => {
    if (i.sentences.length < 5) return na("Too little text");
    const share = i.sentences.filter((s) => T.words(s).length > 20).length / i.sentences.length;
    return share <= 0.25 ? pass(`${pct(share)} over 20 words`) : warn(pct(share), "Over 25% of sentences exceed 20 words", "Shorten long sentences");
  }),
  C("flesch", "Readability score (Flesch)", "readability", 4, false, (i) => {
    // Score the running prose (paragraphs), as Yoast does. Whole-page text joins headings,
    // buttons and list labels that have no full stops into giant "sentences".
    const f = T.fleschReadingEase((i.paragraphs || []).join(". "));
    if (f === null) return na("Too little text");
    return f >= 60 ? pass(String(f), "Easy to read") : f >= 50 ? warn(String(f), "Fairly difficult", "Use shorter sentences and simpler words") : fail(String(f), "Difficult to read", "Use shorter sentences and simpler words");
  }),
  C("word_count", "Word count", "content", 4, false, (i) => {
    const min = i.kind === "post" ? 800 : i.group === "Legal" ? 300 : 400;
    return i.wordCount >= min ? pass(String(i.wordCount)) : (i.wordCount >= min * 0.6 ? warn : fail)(String(i.wordCount), `Under ${min} words`, `Add ${min - i.wordCount}+ words of useful, unique content`);
  }),
  C("text_image_ratio", "Text to image ratio", "content", 1, false, (i) => {
    if (!i.images.length) return warn("no images", "No images", "Add at least one relevant image");
    const r = Math.round(i.wordCount / i.images.length);
    return r >= 75 ? pass(`${r} words per image`) : warn(`${r} words per image`, "Image-heavy for the amount of text", "Add descriptive text around images");
  }),

  // ── Schema & social ──
  C("schema", "Schema", "seo", 4, true, (i) => (i.schemaTypes.length ? pass(i.schemaTypes.join(", ")) : fail("", "No structured data", "Add JSON-LD"))),
  C("jsonld_valid", "JSON-LD", "seo", 3, false, (i) => (i.jsonldErrors ? fail(`${i.jsonldErrors} invalid`, "A JSON-LD block doesn't parse", "Fix the JSON syntax") : pass(`${i.jsonld.length} valid block(s)`))),
  C("custom_schema", "Custom schema", "seo", 1, false, (i) => {
    if (!i.override.custom_schema) return pass("None (auto schema in use)");
    try {
      const j = JSON.parse(i.override.custom_schema);
      return j["@context"] ? pass("Valid") : warn("No @context", "Custom schema lacks @context", 'Add "@context": "https://schema.org"');
    } catch { return fail("Invalid JSON", "Custom schema isn't valid JSON", "Fix the JSON"); }
  }),
  C("open_graph", "Open Graph", "seo", 3, true, (i) => {
    const miss = ["title", "description", "image", "url"].filter((k) => !i.meta.og[k]);
    return miss.length ? fail(miss.join(", "), `Missing og:${miss.join(", og:")}`, "Fill Open Graph tags") : pass("Complete");
  }),
  C("twitter_card", "Twitter card", "seo", 2, true, (i) => {
    const miss = ["card", "title", "description", "image"].filter((k) => !i.meta.tw[k]);
    return miss.length ? fail(miss.join(", "), `Missing twitter:${miss.join(", twitter:")}`, "Fill Twitter card tags") : pass(i.meta.tw.card);
  }),
  C("viewport_images", "Viewport images", "content", 2, false, (i) => {
    const below = i.images.slice(1);
    const noDims = i.images.filter((m) => !m.width || !m.height).length;
    const notLazy = below.filter((m) => m.loading !== "lazy").length;
    if (!i.images.length) return na("No images");
    if (noDims || notLazy > 3) return warn(`${noDims} without size, ${notLazy} not lazy`, "Images without width/height can shift the layout; off-screen images should load lazily", "Set width/height and loading=lazy below the fold");
    return pass("Sized and lazy-loaded");
  }),

  // ── Technical ──
  C("redirects", "Redirects", "seo", 2, false, (i) => (i.redirectsIn.length ? pass(`${i.redirectsIn.length} old URL(s) redirect here`) : pass("No redirect chain"))),
  // Site-wide check: shown on the home page only, so it doesn't repeat on every page and post.
  C("not_found", "Not found (404)", "seo", 2, false, (i) => (i.path !== "/" ? pass("Site-wide check — see the home page") : i.ctx.notFoundTotal ? warn(`${i.ctx.notFoundTotal} site-wide`, `${i.ctx.notFoundTotal} 404 URL(s) logged across the site`, "Redirect them in SEO → Redirects") : pass("No 404s logged"))),
  C("broken_links", "Broken link", "seo", 4, false, (i) => (i.brokenLinks.length ? fail(i.brokenLinks.slice(0, 3).join(", "), `${i.brokenLinks.length} internal link(s) lead nowhere`, "Fix or redirect these links") : pass("None"))),
  C("robots_txt", "Robots.txt", "seo", 2, false, (i) => (i.ctx.robots ? (i.ctx.robotsAllows(i.path) ? pass("Allows this page") : fail("Blocked", "robots.txt blocks this page")) : fail("Missing", "No robots.txt"))),
  C("llms_txt", "Llms.txt", "seo", 1, false, (i) => (i.ctx.llms ? pass("Present") : fail("Missing", "No llms.txt"))),

  // ── Performance (real visitors, last 28 days) ──
  C("page_speed", "Page speed", "performance", 4, false, (i) => vital(i.vitals, "score", (v) => v >= 90, (v) => v >= 50, (v) => `${v}/100`, { item: i, key: "score" })),
  C("lcp", "Largest Contentful Paint", "performance", 3, false, (i) => vital(i.vitals, "lcp", (v) => v <= 2500, (v) => v <= 4000, (v) => `${(v / 1000).toFixed(1)} s`, { item: i, key: "lcp" })),
  C("inp", "Interaction to Next Paint", "performance", 3, false, (i) => vital(i.vitals, "inp", (v) => v <= 200, (v) => v <= 500, (v) => `${Math.round(v)} ms`, { item: i, key: "tbt", good: (x) => x <= 200, ok: (x) => x <= 600, fmt: (x) => `${Math.round(x)} ms TBT` })),
  C("cls", "Cumulative Layout Shift", "performance", 3, false, (i) => vital(i.vitals, "cls", (v) => v <= 0.1, (v) => v <= 0.25, (v) => v.toFixed(2), { item: i, key: "cls" })),
  C("ttfb", "Time to First Byte", "performance", 2, false, (i) => vital(i.vitals, "ttfb", (v) => v <= 800, (v) => v <= 1800, (v) => `${Math.round(v)} ms`, { item: i, key: "ttfb" })),
  C("fcp", "First Contentful Paint", "performance", 2, false, (i) => vital(i.vitals, "fcp", (v) => v <= 1800, (v) => v <= 3000, (v) => `${(v / 1000).toFixed(1)} s`, { item: i, key: "fcp" })),
  C("js_errors", "Frontend JavaScript issues", "performance", 2, false, (i) => (i.jsErrors ? warn(String(i.jsErrors), `${i.jsErrors} JavaScript error(s) reported by visitors`, "See SEO → Speed for details") : pass("None reported"))),
  C("css_errors", "CSS errors", "performance", 1, false, (i) => (i.ctx.cssOk ? pass("Stylesheet loads") : fail("Missing", "Main stylesheet missing from the build"))),
  C("crawl_depth", "Crawl depth", "seo", 3, false, (i) => {
    const d = i.ctx.depth[i.path];
    if (d === undefined) return fail("Orphan", "No internal link reaches this page from the home page", "Link to it from a menu or related page");
    return d <= 3 ? pass(`${d} click(s) from home`) : warn(`${d} clicks`, "Deep in the site", "Link to it from higher-level pages");
  }),

  // ── Content & AI ──
  C("keyword_density", "Keyword density", "content", 3, false, (i) => {
    if (!i.keyphrase) return na("No keyphrase");
    const s = T.keyphraseStats(i.text, i.keyphrase);
    if (s.density === 0) return fail("0%", "Keyphrase never appears in the content", "Use the keyphrase naturally 2–5 times");
    // Three mentions (title area, intro, body) are the minimum the keyword tracker asks for,
    // so a long keyphrase used 3 times on a short page is not counted as overuse.
    if (s.density > 2.5 && s.count > 3) return warn(`${s.density}%`, "Keyphrase may be overused", "Use synonyms in some places");
    if (s.density < 0.5) return warn(`${s.density}% (${s.count}×)`, "Keyphrase appears rarely", "Use the exact keyphrase a couple more times");
    return pass(`${s.density}% (${s.count}×)`);
  }),
  C("semantic_coverage", "Semantic keyword coverage", "content", 3, false, (i) => {
    const terms = [i.keyphrase, ...(i.related || [])].filter(Boolean);
    if (!terms.length) return na("No keyphrase");
    const cov = T.termCoverage(i.text, terms);
    return cov.share >= 0.8 ? pass(pct(cov.share)) : warn(pct(cov.share), `Missing related terms: ${cov.missing.slice(0, 6).join(", ")}`, "Cover these terms in the content");
  }),
  C("search_intent", "Search intent match", "content", 3, false, (i) => {
    if (!i.keyphrase) return na("No keyphrase");
    const k = i.keyphrase.toLowerCase();
    const intent = /\b(book|price|cost|hire|near me|package|booking|charges?)\b/.test(k) ? "transactional" : /\b(how|what|why|vs|guide|tips|ideas|checklist|which)\b/.test(k) ? "informational" : i.kind === "post" ? "informational" : "commercial";
    const hasCta = i.ctx.ctaRe.test(i.text);
    if (intent === "transactional" && !hasCta) return warn(intent, "Buying-intent keyphrase but no clear booking call to action", "Add a booking / enquiry button near the top");
    if (intent === "informational" && i.kind === "page" && i.wordCount < 600) return warn(intent, "Question-style keyphrase on a short page", "Answer the question directly in the first paragraph");
    return pass(intent);
  }),
  C("topical_relevance", "Topical relevance", "content", 3, false, (i) => {
    if (!i.keyphrase) return na("No keyphrase");
    const spots = [["title", i.meta.title], ["H1", i.h1s[0]], ["first paragraph", i.firstParagraph], ["a subheading", i.subheadings.join(" ")]].filter(([, t]) => T.termCoverage(t || "", [i.keyphrase]).share >= 0.6).map(([n]) => n);
    return spots.length >= 3 ? pass(spots.join(", ")) : warn(spots.join(", ") || "none", "Keyphrase missing from key places", "Use it in the title, H1, first paragraph and one subheading");
  }),
  C("freshness", "Content freshness", "content", 2, false, (i) => {
    const d = i.updated || i.date;
    if (!d) return na("No date");
    const days = Math.round((Date.now() - new Date(d).getTime()) / 86400000);
    return days <= 365 ? pass(`${days} days old`) : warn(`${days} days old`, "Not updated in over a year", "Review and refresh the content");
  }),
  C("uniqueness", "Content uniqueness", "content", 4, false, (i) => {
    const m = i.mostSimilar;
    if (!m) return pass("Unique");
    return m.sim >= 0.3 ? fail(`${pct(m.sim)} like ${m.path}`, `Overlaps heavily with ${m.path}`, "Rewrite to make each page distinct, or merge them") : m.sim >= 0.15 ? warn(`${pct(m.sim)} like ${m.path}`, `Some overlap with ${m.path}`, "Make the shared passages page-specific") : pass(`Max overlap ${pct(m.sim)}`);
  }),
  C("cannibalization", "Cannibalization", "content", 4, false, (i) => {
    const others = i.keyphrase ? (i.ctx.byKeyphrase[T.normKp(i.keyphrase)] || []).filter((p) => p !== i.path) : [];
    return others.length ? fail(others.slice(0, 3).join(", "), `Same keyphrase as ${others.length} other page(s)`, "Give each page its own keyphrase (e.g. add the area or service)") : pass("Unique keyphrase");
  }),
  C("faq_optimization", "FAQ optimization", "content", 3, false, (i) => {
    const n = i.faqCount;
    if (!n) return warn("0", "No FAQ section", "Add 3–5 real questions customers ask, with short answers");
    if (!i.schemaTypes.includes("FAQPage")) return warn(`${n} Q&A`, "FAQ shown but no FAQ schema", "Generate FAQPage schema");
    return n >= 3 ? pass(`${n} Q&A with schema`) : warn(`${n} Q&A`, "Fewer than 3 questions", "Add a few more questions");
  }),
  C("entity_coverage", "Entity coverage", "content", 2, false, (i) => {
    // Each entity is a list of accepted spellings, e.g. ["Bangalore", "Bengaluru"].
    const want = i.ctx.entities;
    const lower = i.text.toLowerCase();
    const missing = want.filter((alts) => !alts.some((a) => lower.includes(String(a).toLowerCase())));
    return missing.length === 0 ? pass(`${want.length}/${want.length}`) : warn(`${want.length - missing.length}/${want.length}`, `Not mentioned: ${missing.map((a) => a[0]).join(", ")}`, "Mention the brand, location and service names in the content");
  }),
  C("anchor_text", "Anchor text distribution", "content", 2, false, (i) => {
    const anchors = i.contentLinks.internal.map((l) => l.text.trim()).filter(Boolean);
    if (!anchors.length) return na("No internal links in content");
    const generic = anchors.filter((a) => GENERIC_ANCHORS.test(a)).length;
    return generic ? warn(`${generic} generic`, `${generic} link(s) use generic text like "click here"`, "Describe the target page in the link text") : pass(`${anchors.length} descriptive`);
  }),
  C("schema_consistency", "Schema entity consistency", "seo", 2, false, (i) => (i.ctx.entityConsistent ? pass("Name, phone and address match") : warn("Mismatch", "Business details differ between schema and page", "Use the same name, phone and address everywhere"))),
  C("breadcrumb_schema", "Breadcrumb schema", "seo", 2, true, (i) => (i.path === "/" ? pass("Home") : i.schemaTypes.includes("BreadcrumbList") ? pass("Present") : fail("Missing", "No BreadcrumbList schema"))),
  C("article_schema", "Article schema", "seo", 3, true, (i) => (i.kind !== "post" ? na("Not an article") : i.schemaTypes.some((t) => /Article|BlogPosting/.test(t)) ? pass("BlogPosting") : fail("Missing", "No Article schema"))),
  C("organization_schema", "Organization schema", "seo", 2, false, (i) => (i.schemaTypes.includes("Organization") ? pass("Present") : fail("Missing", "No Organization schema"))),
  C("author_schema", "Author schema", "seo", 2, true, (i) => (i.kind !== "post" && i.path !== "/about-us" ? na("Not authored content") : i.hasAuthorSchema ? pass("Person") : fail("Missing", "No author (Person) schema"))),
  C("faq_schema_validation", "FAQ schema validation", "seo", 2, false, (i) => {
    if (!i.schemaTypes.includes("FAQPage")) return na("No FAQ schema");
    const q = i.faqSchemaQuestions;
    const bad = q.filter((x) => !x.name || !x.answer).length;
    if (bad) return fail(`${bad} incomplete`, "Some FAQ entries lack a question or answer");
    const notVisible = q.filter((x) => !i.text.toLowerCase().includes(String(x.name).toLowerCase().slice(0, 40))).length;
    return notVisible ? warn(`${notVisible} not on page`, "FAQ schema questions must also appear on the page", "Show every FAQ question in the content") : pass(`${q.length} valid`);
  }),
];

// Real-visitor data (75th percentile) when at least 5 visits were measured; otherwise the latest
// PageSpeed lab test (mobile). INP has no lab equivalent, so Total Blocking Time stands in.
function vital(v, key, good, ok, fmt, lab) {
  const real = v && v.samples >= 5 && v[key] !== undefined && v[key] !== null;
  if (real) {
    const x = v[key];
    return good(x) ? pass(fmt(x), `75th percentile of ${v.samples} visits`) : ok(x) ? warn(fmt(x), "Needs improvement", "See SEO → Speed") : fail(fmt(x), "Poor", "See SEO → Speed");
  }
  const L = lab && lab.item && lab.item.lab;
  const lk = lab && lab.key;
  if (L && L[lk] !== undefined && L[lk] !== null) {
    const x = L[lk];
    const when = new Date(L.at).toLocaleDateString("en-IN");
    const g = lab.good || good, o = lab.ok || ok, f = lab.fmt || fmt;
    return g(x) ? pass(f(x), `PageSpeed lab test (mobile), ${when}`) : o(x) ? warn(f(x), `Needs improvement · PageSpeed lab test, ${when}`, "See SEO → Speed") : fail(f(x), `Poor · PageSpeed lab test, ${when}`, "See SEO → Speed");
  }
  return { status: "na", msg: v && v.samples ? `Only ${v.samples} visit(s) measured — run a speed test in SEO → Speed` : "No data yet — run a speed test in SEO → Speed" };
}

const CAT_LABELS = { seo: "SEO", content: "Content", readability: "Readability", performance: "Speed" };

// Run all checks for one item and compute the four scores (0–100, N/A checks excluded).
function runChecks(item) {
  const results = CHECKS.map((c) => {
    let r;
    try { r = c.fn(item) || na(); } catch (e) { r = { status: "na", msg: `Check failed: ${e.message}` }; }
    return { id: c.id, label: c.label, cat: c.cat, weight: c.weight, auto: c.auto, ...r };
  });
  const scores = {};
  for (const cat of Object.keys(CAT_LABELS)) {
    const rs = results.filter((r) => r.cat === cat && r.status !== "na");
    const total = rs.reduce((a, r) => a + r.weight, 0);
    const got = rs.reduce((a, r) => a + r.weight * (r.status === "pass" ? 1 : r.status === "warn" ? 0.5 : 0), 0);
    scores[cat] = total ? Math.round((got / total) * 100) : null;
  }
  // No real-visitor measurements yet: show no speed score rather than one based only on error counts.
  if (results.find((r) => r.id === "page_speed").status === "na") scores.performance = null;
  return { results, scores };
}

module.exports = { CHECKS, CAT_LABELS, runChecks };
