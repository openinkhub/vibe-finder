// Plain-English text analysis used by the SEO checklist (readability, keyword use, similarity).
// Heuristics in the style of Yoast/Squirrly: good enough to point at problems, not linguistics.

const TRANSITIONS = [
  "also", "additionally", "furthermore", "moreover", "besides", "however", "but", "although", "though", "yet",
  "still", "instead", "otherwise", "therefore", "thus", "hence", "consequently", "so", "because", "since",
  "for example", "for instance", "such as", "in fact", "indeed", "in particular", "especially", "first", "firstly",
  "second", "secondly", "third", "finally", "lastly", "next", "then", "meanwhile", "afterwards", "before",
  "after", "while", "similarly", "likewise", "in addition", "as a result", "in short", "in summary", "to sum up",
  "overall", "in conclusion", "on the other hand", "in contrast", "unlike", "for this reason", "as well as",
  "at the same time", "above all", "most importantly", "of course", "that is", "in other words", "even so",
];

// Terms flagged for inclusive-language review (shown as suggestions, never auto-changed).
const NON_INCLUSIVE = {
  "mankind": "humankind", "manpower": "workforce", "chairman": "chair", "salesman": "salesperson",
  "housewife": "homemaker", "crazy": "wild / unexpected", "insane": "remarkable", "lame": "weak",
  "blind spot": "gap", "whitelist": "allowlist", "blacklist": "blocklist", "master bedroom": "main bedroom",
  "fair skin": "light skin", "fairness": "even tone", "fair and lovely": "radiant", "flawless skin": "smooth skin",
  "normal skin": "balanced skin", "dusky": "deep / dark", "spinster": "unmarried woman", "old maid": "unmarried woman",
};

const IRREGULAR_PARTICIPLES = new Set("been born brought built bought caught chosen done drawn driven eaten fallen felt found forgotten given gone grown heard held hidden hit hurt kept known laid led left lent lost made meant met paid put read ridden rung risen run said seen sold sent set shown shut sung sat slept spoken spent spread stood stolen struck sworn taken taught torn told thought thrown understood woken worn won written".split(" "));
const BE = /^(am|is|are|was|were|be|been|being|get|gets|got|gotten|getting)$/i;

const stripMarkdown = (md) => String(md || "")
  .replace(/\r\n/g, "\n")
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/^#{1,6}\s+/gm, "")
  .replace(/[*_`>~|]/g, "")
  .replace(/^\s*[-+]\s+/gm, "")
  .replace(/^\s*\d+\.\s+/gm, "");

const words = (t) => (String(t || "").toLowerCase().match(/[a-z0-9ऀ-෿][a-z0-9'ऀ-෿-]*/g) || []);

const sentences = (t) => String(t || "")
  .replace(/\n+/g, ". ")
  .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
  .map((s) => s.trim())
  .filter((s) => words(s).length >= 2);

const syllables = (w) => {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
};

// Flesch reading ease (0–100, higher = easier). 60+ is plain English.
function fleschReadingEase(text) {
  const s = sentences(text), w = words(text);
  if (!s.length || !w.length) return null;
  const syl = w.reduce((a, x) => a + syllables(x), 0);
  return Math.round((206.835 - 1.015 * (w.length / s.length) - 84.6 * (syl / w.length)) * 10) / 10;
}

const complexWordShare = (text) => {
  const w = words(text).filter((x) => /[a-z]/.test(x));
  if (!w.length) return 0;
  return w.filter((x) => syllables(x) >= 3 && !/(ing|ed|es)$/.test(x)).length / w.length;
};

const isPassive = (sentence) => {
  const w = sentence.toLowerCase().split(/\s+/).map((x) => x.replace(/[^a-z']/g, ""));
  for (let i = 0; i < w.length - 1; i++) {
    if (!BE.test(w[i])) continue;
    for (let j = i + 1; j <= Math.min(i + 3, w.length - 1); j++) {
      const v = w[j];
      if (/^(very|not|also|often|always|never|being|been|really|usually|then|just)$/.test(v)) continue;
      if ((/ed$/.test(v) && v.length > 4) || IRREGULAR_PARTICIPLES.has(v)) return true;
      break;
    }
  }
  return false;
};

const hasTransition = (sentence) => {
  const s = " " + sentence.toLowerCase().replace(/[^a-z\s]/g, " ") + " ";
  return TRANSITIONS.some((t) => s.includes(" " + t + " "));
};

// Runs of 3+ sentences starting with the same word.
function consecutiveStarts(sents) {
  const runs = [];
  let run = 1;
  for (let i = 1; i <= sents.length; i++) {
    const a = (words(sents[i - 1])[0] || ""), b = i < sents.length ? (words(sents[i])[0] || "") : null;
    if (b !== null && a && a === b) run += 1;
    else { if (run >= 3) runs.push({ word: a, count: run }); run = 1; }
  }
  return runs;
}

const inclusiveIssues = (text) => {
  const t = " " + String(text || "").toLowerCase() + " ";
  return Object.entries(NON_INCLUSIVE).filter(([k]) => new RegExp(`[^a-z]${k.replace(/ /g, "\\s+")}[^a-z]`).test(t)).map(([k, v]) => ({ term: k, suggest: v }));
};

// Keyphrase occurrences (whole-phrase, case-insensitive) and density in %.
function keyphraseStats(text, keyphrase) {
  const kp = String(keyphrase || "").toLowerCase().trim();
  const w = words(text);
  if (!kp || !w.length) return { count: 0, density: 0, total: w.length };
  const kw = words(kp);
  let count = 0;
  for (let i = 0; i + kw.length <= w.length; i++) if (kw.every((x, j) => w[i + j] === x)) count += 1;
  return { count, density: Math.round(((count * kw.length) / w.length) * 10000) / 100, total: w.length };
}

// Share of keyphrase words (ignoring stop words) found in a piece of text.
const STOP = new Set("a an and are as at be by for from in is it of on or the to with your you our we in near me best top".split(" "));
function termCoverage(text, terms) {
  const set = new Set(words(text));
  const t = [...new Set(terms.flatMap((x) => words(x)).filter((x) => !STOP.has(x)))];
  if (!t.length) return { covered: [], missing: [], share: 1 };
  const covered = t.filter((x) => set.has(x) || set.has(x + "s") || set.has(x.replace(/s$/, "")));
  return { covered, missing: t.filter((x) => !covered.includes(x)), share: covered.length / t.length };
}

// Word 5-gram shingles + Jaccard similarity for duplicate-content checks.
function shingles(text, n = 5) {
  const w = words(text);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const x of small) if (big.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

// Comparable form of a keyphrase: spelling variants unified, filler words dropped, word order ignored.
function normKp(kp) {
  return String(kp || "").toLowerCase().replace(/bengaluru/g, "bangalore").replace(/makup/g, "makeup").replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/).filter((w) => w && !STOP.has(w)).sort().join(" ");
}

module.exports = { normKp, stripMarkdown, words, sentences, syllables, fleschReadingEase, complexWordShare, isPassive, hasTransition, consecutiveStarts, inclusiveIssues, keyphraseStats, termCoverage, shingles, jaccard, STOP };
