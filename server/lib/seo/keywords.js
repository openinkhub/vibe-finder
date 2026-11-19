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
];

// Lower-case word list with Bengaluru folded into Bangalore, so either spelling counts.
const toks = (s) => T.words(String(s || "").toLowerCase().replace(/bengaluru/g, "bangalore"));
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
const count = (text, kw) => T.keyphraseStats(toks(text).join(" "), core(kw)).count;

function onPage(item, kw) {
  if (!item) return null;
  const slug = item.path.replace(/[-/]+/g, " ");
  const signals = [
    ["title", "Title tag", has(item.meta.title, kw)],
    ["h1", "Main heading (H1)", any(item.h1s, kw)],
    ["description", "Meta description", has(item.meta.description, kw)],
    ["url", "Page address", item.path === "/" ? "exact" : has(slug, kw)],
    ["subheading", "A subheading (H2/H3)", any(item.subheadings, kw)],
    ["intro", "First paragraph", has(item.firstParagraph, kw)],
    ["alt", "An image description (alt)", any(item.images.map((im) => im.alt), kw)],
    ["focus", "Set as the page's focus keyphrase", T.normKp(item.keyphrase) === T.normKp(kw)],
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
