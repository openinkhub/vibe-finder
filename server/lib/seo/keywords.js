// Keyword tracker: on-page targeting checks for each tracked search term against its
// target page, plus a manual position log (positions come from Search Console or a
// rank-tracking tool; nothing here queries Google).
const T = require("./text");

// Search terms from the site's rank report (Nov 2026). Seeded once into an empty tracker.
const STARTER = [
  { keyword: "makeup artist in bangalore", page: "/", volume: 1900, pos: 3 },
  { keyword: "bridal makeup", page: "/bridal-makeup-artist-bangalore", volume: 49500 },
  { keyword: "makeup artist", page: "/", volume: 27100 },
  { keyword: "makeup artist near me", page: "/", volume: 27100 },
  { keyword: "best makeup artist near me", page: "/", volume: 2400 },
  { keyword: "makeup artist bangalore", page: "/", volume: 1900 },
  { keyword: "best makeup artist", page: "/", volume: 1000 },
  { keyword: "bridal makeup artist in bangalore", page: "/bridal-makeup-artist-bangalore", volume: 590 },
  { keyword: "best makeup artist in bangalore", page: "/", volume: 480 },
  { keyword: "self grooming classes", page: "/self-grooming-classes", volume: 0 },
];

// Lower-case word list with Bengaluru folded into Bangalore, so either spelling counts.
// Hyphens count as spaces ("self-grooming" = "self grooming") and simple plurals match
// the singular ("classes" = "class"), as search engines treat them.
const stem = (w) => (w.length > 4 && /(ss|sh|ch|x)es$/.test(w) ? w.slice(0, -2) : w.length > 3 && /[^su]s$/.test(w) ? w.slice(0, -1) : w);
const toks = (s) => T.words(String(s || "").toLowerCase().replace(/bengaluru/g, "bangalore").replace(/-/g, " ")).map(stem);
// "near me" is location intent: Google answers it from the searcher's location and the
// Google Business Profile, so on the page we look for the rest of the phrase.
const core = (kw) => toks(kw).join(" ").replace(/\bnear me\b/g, "").replace(/\s+/g, " ").trim();
// "exact" = the phrase as typed; "words" = every meaningful word of it appears (Google
// matches word sets too, so "Makeup Artist & Academy, Bangalore" covers "makeup artist in bangalore").
const match = (text, kw) => {
  const k = core(kw).split(" ").filter(Boolean);
  const w = toks(text);
  if (!k.length || !w.length) return null;
  for (let i = 0; i + k.length <= w.length; i++) if (k.every((x, j) => w[i + j] === x)) return "exact";
  const need = k.filter((x) => !["a", "an", "the", "in", "for", "of", "near", "me"].includes(x));
  const set = new Set(w);
  return need.length && need.every((x) => set.has(x)) ? "words" : null;
};
const has = (text, kw) => match(text, kw);
const any = (list, kw) => { const m = list.map((t) => match(t, kw)); return m.includes("exact") ? "exact" : m.find(Boolean) || null; };
// Counting ignores "in", as Google does: "makeup artist bangalore" = "makeup artist in bangalore".
const noIn = (t) => t.split(" ").filter((x) => x && x !== "in").join(" ");
const count = (text, kw) => T.keyphraseStats(noIn(toks(text).join(" ")), noIn(core(kw))).count;

// Short URLs are fine: the address counts when it holds the keyword's topic words.
// Place names and filler words ("bangalore", "artist", "services", "best") are optional there.
const URL_OPTIONAL = new Set(["a", "an", "the", "in", "for", "of", "and", "near", "me", "best", "artist", "services", "service", "bangalore", "karnataka", "india", "rekha", "krishnamurthy", "professional", "premium", "how", "to", "choose", "find", "makeup", "bridal"]);
const urlTopic = (path, kw) => {
  const need = core(kw).split(" ").filter((x) => x && !URL_OPTIONAL.has(x));
  const slug = new Set(toks(path.replace(/[/]+/g, " ")));
  return need.every((x) => slug.has(x)) ? "words" : null;
};

function onPage(item, kw) {
  if (!item) return null;
  const slug = item.path.replace(/[-/]+/g, " ");
  const signals = [
    ["title", "Title tag", has(item.meta.title, kw)],
    ["h1", "Main heading (H1)", any(item.h1s, kw)],
    ["description", "Meta description", has(item.meta.description, kw)],
    ["url", "Page address", item.path === "/" ? "exact" : has(slug, kw) || urlTopic(item.path, kw)],
    ["subheading", "A subheading (H2/H3)", any(item.subheadings, kw)],
    ["intro", "First paragraph", has(item.firstParagraph, kw)],
    ["alt", "An image description (alt)", any(item.images.map((im) => im.alt), kw)],
    ["focus", "Set as the page's focus or related keyphrase", T.normKp(item.keyphrase) === T.normKp(kw) || (item.related || []).some((r) => T.normKp(r) === T.normKp(kw))],
  ].filter(([, label]) => label).map(([id, label, m]) => ({ id, label, ok: !!m, detail: m === "words" ? "words, not the exact phrase" : undefined }));
  const mentions = count(item.text, kw);
  signals.push({ id: "body", label: "Used in the text (3+ times)", ok: mentions >= 3, detail: `${mentions}×` });
  const passed = signals.filter((s) => s.ok).length;
  return { signals, mentions, score: Math.round((passed / signals.length) * 100) };
}

// Which page on the site targets the term best, by the same checks.
function bestPage(items, kw) {
  let best = null;
  for (const it of items) {
    if (it.noindex) continue;
    const r = onPage(it, kw);
    if (!best || r.score > best.score || (r.score === best.score && r.mentions > best.mentions)) best = { path: it.path, score: r.score, mentions: r.mentions };
  }
  return best;
}

module.exports = { STARTER, onPage, bestPage, core };
