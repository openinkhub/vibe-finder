// Auto-configure: applies the site's SEO rules to every page and post.
// Only values that fail a check are changed (good hand-written values are left alone), every
// change is recorded so it can be rolled back, and fields an admin edited by hand are skipped
// unless the "overwrite manual edits" rule is on. Writing-quality items are never rewritten.
const { getDb, nowIso } = require("../core");
const R = require("../render");
const T = require("./text");
const { getSettings } = require("./settings");
const inventory = require("./inventory");

const BRAND_RE = /\s*[|–—-]\s*(Rekha Krishnamurthy|Makeup By Rekha)[^|]*$/i;

const clip = (s, max, minSentence = 60) => {
  s = String(s || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  // End on a sentence if a long-enough one fits, else on a whole word.
  const cut = s.slice(0, max + 1);
  const sentence = cut.match(new RegExp(`^(.{${minSentence},}[.!?])\\s`));
  if (sentence) return sentence[1];
  return `${cut.slice(0, cut.lastIndexOf(" ", max - 1)).replace(/[,;:–—-]+$/, "").trim()}…`;
};
// Shorten a title: keep the part before a ":" / "|" / dash when that reads as a full title,
// otherwise cut on a word and drop dangling filler words.
const FILLER = /\s+(a|an|the|and|or|for|of|to|in|on|with|by|your|complete|ultimate)$/i;
const clipTitle = (t, max) => {
  t = String(t || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const head = t.split(/\s*[:|–—]\s*|\s+-\s+/)[0];
  if (head.length >= 30 && head.length <= max) return head;
  let c = clip(t, max).replace(/…$/, "").replace(/[:|–—-]+$/, "").trim();
  while (FILLER.test(c)) c = c.replace(FILLER, "");
  return c;
};
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] || "").replace(/\s*\|\s*$/, "").trim();
const titleCase = (s) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase());

// Keyphrase candidates for a page: its slug, its H1 and its title, scored by how well the page
// already covers each one (title, H1, opening paragraph, body). The best unused one wins.
const slugPhrase = (p) => (p.split("/").filter(Boolean).pop() || "").toLowerCase().replace(/makup/g, "makeup").replace(/-/g, " ");
function pickKeyphrase(it, used, brand, otherSlugs = new Set()) {
  const slug = slugPhrase(it.path);
  const strip = (t) => String(t || "").replace(BRAND_RE, "").replace(new RegExp(brand, "ig"), "").replace(/[|:,&()–—]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  const cands = [slug, strip(it.h1s[0]), strip(it.meta.title.split("|")[0]), strip(it.meta.title.split("|")[1])]
    .map((c) => c.split(" ").filter(Boolean).slice(0, 6).join(" "))
    .filter((c) => c && c.split(" ").length >= 2 && c.length <= 60);
  // Where the keyphrase should already appear, and how much each place counts.
  const spots = [[it.meta.title, 0.3], [it.h1s[0] || "", 0.25], [it.meta.description, 0.2], [it.firstParagraph, 0.1], [it.text, 0.15]];
  const scored = [...new Set(cands)].map((c) => ({ c, score: spots.reduce((a, [t, w]) => a + w * T.termCoverage(t, [c]).share, 0) - c.split(" ").length * 0.01 }))
    .sort((a, b) => b.score - a.score);
  // Skip phrases another page already targets, or that another page's URL is named after.
  const free = scored.find((x) => !used.has(T.normKp(x.c)) && !otherSlugs.has(T.normKp(x.c)));
  return free ? free.c : slug || (scored[0] && scored[0].c) || "";
}

function planFor(it, report, rules, settings, used) {
  const res = Object.fromEntries(report.results.map((r) => [r.id, r]));
  const bad = (id) => res[id] && (res[id].status === "fail" || res[id].status === "warn");
  const isPost = it.kind === "post";
  const post = isPost ? it.data : null;
  const changes = {}; // field -> value  (page fields go to seo_meta; post fields to the post)

  // Focus keyphrase
  if (!it.keyphrase && rules.keyphrase_from_h1) {
    const others = new Set(Object.keys(settings.__slugs || {}).filter((p) => p !== it.path).map((p) => settings.__slugs[p]));
    const kp = pickKeyphrase(it, used, settings.brand, others);
    changes[isPost ? "focus_keyword" : "keyphrase"] = kp;
    used.add(T.normKp(kp));
  }
  const kp = it.keyphrase || changes.focus_keyword || changes.keyphrase || "";

  // SEO title
  if (bad("seo_title")) {
    const cur = it.meta.title;
    let t = cur;
    const h1 = (it.h1s[0] || it.name).replace(/\s+/g, " ").trim();
    if (cur.length > rules.title_max) {
      t = clipTitle(cur.replace(BRAND_RE, ""), rules.title_max);
      if (t.length < 30) t = clipTitle(h1, rules.title_max);
    } else if (cur.length < 30 || report.results.find((r) => r.id === "seo_title").msg.startsWith("Same title")) {
      t = clipTitle(fill(isPost ? rules.title_post : rules.title_page, { h1, title: post ? post.title : h1, brand: settings.brand, keyphrase: titleCase(kp) }), rules.title_max);
      if (t.length < 30) t = clipTitle(`${h1} | ${settings.brand}`, rules.title_max);
    } else if (kp && !T.termCoverage(cur, [kp]).share) {
      t = cur; // keyphrase advice only: reported, not rewritten
    }
    if (t && t !== cur) changes[isPost ? "meta_title" : "seo_title"] = t;
  }

  // Meta description
  if (bad("meta_description")) {
    const cur = it.meta.description || "";
    let d = cur.replace(/\s*\n+\s*/g, " ").trim();
    const para = it.paragraphs.filter((p) => p.length > 60 && !/\?$/.test(p));
    if (d.length > 160) d = clip(d, rules.description_max, rules.description_min);
    if (d.length < rules.description_min || (/^Same description/.test(res.meta_description.msg || "") && d === cur)) {
      if (d.length < 40) d = ""; // a stub isn't worth keeping
      const extra = para.find((p) => !d.includes(p.slice(0, 40))) || (post && post.excerpt !== cur ? post.excerpt : "") || "";
      d = clip(`${d}${d && !/[.!?]$/.test(d) ? "." : ""} ${extra}`.trim(), rules.description_max, rules.description_min);
    }
    if (d && d.length >= 70 && d !== cur) changes.meta_description = d;
  }

  // Excerpt (posts)
  if (isPost && bad("excerpt")) {
    const para = it.paragraphs.find((p) => p.length > 80);
    const e = clip(para || post.meta_description || "", 300);
    if (e && e.length >= 50) changes.excerpt = e;
  }
  // Publish date (posts)
  if (isPost && !post.publish_date) changes.publish_date = String(post.created_at || nowIso()).slice(0, 10);

  // Hero image alt text
  if (bad("hero_image") && rules.alt_from_title && it.images[0]) {
    const subject = (it.h1s[0] || it.name).replace(/\s+/g, " ").trim();
    const alt = clip(subject.toLowerCase().includes(settings.brand.toLowerCase()) ? subject : `${subject} – ${settings.brand}`, 125);
    if (isPost) changes.alt_text = alt;
    else changes.hero_alt = { alt, image: it.images[0].src };
  }

  // FAQ schema from the questions already on the page
  if (!isPost && it.faqPairs.length && !it.schemaTypes.includes("FAQPage")) changes.faq = it.faqPairs;

  // Index / follow / sitemap: switch back on only where a rule says everything is indexed
  if (!isPost) {
    if (rules.index_all && it.override.noindex && !it.override.manual?.includes("noindex")) changes.noindex = false;
    if (rules.follow_all && it.override.nofollow && !it.override.manual?.includes("nofollow")) changes.nofollow = false;
    if (rules.canonical_self && it.override.canonical && it.override.canonical !== it.url && !it.override.manual?.includes("canonical")) changes.canonical = "";
  }
  return changes;
}

// Work out (and optionally apply) every change. Returns the list for the admin preview.
async function autoConfigure({ dryRun = true, paths = null, by = "admin" } = {}) {
  const settings = await getSettings();
  const rules = settings.rules;
  const report = await inventory.buildReport({ force: true });
  const raw = inventory.rawItems();
  const byPath = Object.fromEntries(report.items.map((r) => [r.path, r]));
  const used = new Set(raw.map((i) => T.normKp(i.keyphrase)).filter(Boolean));
  const ctxSettings = { ...settings, __slugs: Object.fromEntries(raw.filter((i) => i.kind === "page").map((i) => [i.path, T.normKp(slugPhrase(i.path))])) };
  const plan = [];
  for (const it of raw) {
    if (paths && !paths.includes(it.path)) continue;
    let changes = planFor(it, byPath[it.path], rules, ctxSettings, used);
    const manual = (it.override && it.override.manual) || [];
    if (!rules.overwrite_manual) changes = Object.fromEntries(Object.entries(changes).filter(([k]) => !manual.includes(k)));
    if (Object.keys(changes).length) plan.push({ path: it.path, kind: it.kind, name: it.name, changes, before: before(it, changes) });
  }
  if (dryRun) return { dryRun: true, count: plan.length, plan };

  const db = getDb();
  const at = nowIso();
  for (const p of plan) {
    const entry = { at, by, source: "auto", before: p.before, after: p.changes };
    if (p.kind === "post") {
      const slug = p.path.replace(/^\/blog\//, "");
      await db.collection("blog_posts").updateOne({ slug }, { $set: { ...p.changes, updated_at: at } });
    } else {
      const { hero_alt, ...meta } = p.changes;
      if (hero_alt) {
        const cur = (await db.collection("page_images").findOne({ path: p.path })) || {};
        await db.collection("page_images").updateOne({ path: p.path }, { $set: { path: p.path, image: cur.image || hero_alt.image, alt_text: hero_alt.alt, updated_at: at } }, { upsert: true });
      }
      if (Object.keys(meta).length) await db.collection("seo_meta").updateOne({ path: p.path }, { $set: { path: p.path, ...meta, updated_at: at } }, { upsert: true });
    }
    await db.collection("seo_meta").updateOne({ path: p.path }, { $setOnInsert: { path: p.path }, $push: { history: { $each: [entry], $slice: -20 } } }, { upsert: true });
  }
  R.invalidate();
  inventory.invalidateInventory();
  return { dryRun: false, count: plan.length, plan };
}

// Previous values, as stored (pages: the seo_meta override, absent = site default; posts: the post fields).
function before(it, changes) {
  const post = it.kind === "post" ? it.data : null;
  const o = it.override || {};
  const src = post || o;
  return Object.fromEntries(Object.keys(changes).map((k) => {
    if (k === "hero_alt") return [k, it.heroImage ? it.heroImage.alt_text || "" : null];
    return [k, src[k] === undefined ? null : src[k]];
  }));
}

// Undo the most recent automatic change for a URL.
async function rollback(urlPath) {
  const db = getDb();
  const doc = await db.collection("seo_meta").findOne({ path: urlPath });
  const history = (doc && doc.history) || [];
  const idx = history.map((h, n) => (h.source === "auto" && !h.undone ? n : -1)).filter((n) => n >= 0).pop();
  if (idx === undefined) return { ok: false, detail: "No automatic change to undo" };
  const last = history[idx];
  const at = nowIso();
  const set = {}, unset = {};
  for (const [k, v] of Object.entries(last.before)) if (k !== "hero_alt") (v === null ? (unset[k] = "") : (set[k] = v));
  const upd = (s, u) => ({ ...(Object.keys(s).length ? { $set: s } : {}), ...(Object.keys(u).length ? { $unset: u } : {}) });
  if (urlPath.startsWith("/blog/")) {
    await db.collection("blog_posts").updateOne({ slug: urlPath.slice(6) }, upd({ ...set, updated_at: at }, unset));
  } else {
    if ("hero_alt" in last.before) {
      if (last.before.hero_alt === null) await db.collection("page_images").deleteOne({ path: urlPath });
      else await db.collection("page_images").updateOne({ path: urlPath }, { $set: { alt_text: last.before.hero_alt, updated_at: at } });
    }
    const u = upd(set, unset);
    if (Object.keys(u).length) await db.collection("seo_meta").updateOne({ path: urlPath }, u);
  }
  history[idx] = { ...last, undone: at };
  await db.collection("seo_meta").updateOne({ path: urlPath }, { $set: { history } });
  R.invalidate();
  inventory.invalidateInventory();
  return { ok: true, restored: last.before };
}

module.exports = { autoConfigure, rollback, pickKeyphrase, clip };
