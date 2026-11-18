// Site-wide SEO settings (one document in `settings`, key "seo_settings"), with defaults.
const fs = require("fs");
const path = require("path");
const { getDb } = require("../core");

const PUBLIC_DIR = path.join(__dirname, "..", "..", "..", "frontend", "public");
const readPublic = (f) => {
  try { return fs.readFileSync(path.join(PUBLIC_DIR, f), "utf8"); } catch { return ""; }
};

const DEFAULTS = {
  brand: "Rekha Krishnamurthy",
  business: { name: "Rekha Krishnamurthy Makeup & Academy", phone: "+91 98454 80507", email: "contact@rekhakrishnamurthy.com", city: "Bengaluru" },
  // Auto-configure rules (Squirrly "Automation" style). Tokens: {h1} {title} {brand} {keyphrase}
  rules: {
    title_page: "{h1} | {brand}",
    title_post: "{title}",
    title_max: 60,
    description_min: 120,
    description_max: 158,
    excerpt_min: 120,
    canonical_self: true,
    index_all: true,
    follow_all: true,
    sitemap_all: true,
    og_from_seo: true,
    twitter_card: "summary_large_image",
    alt_from_title: true,
    keyphrase_from_h1: true,
    overwrite_manual: false, // never overwrite fields someone edited by hand
  },
  entities: [["Rekha Krishnamurthy", "Rekha"], ["Bangalore", "Bengaluru"], ["makeup"]],
  cta_pattern: "book|enquire|enquiry|whatsapp|call|consultation|contact",
  robots_txt: null, // null = use the file shipped with the site
  llms_extra: "", // appended to the generated llms.txt
  focus_pages: [],
  keywords: [], // Squirrly "Briefcase": target keywords you're tracking
};

let cache = null;
async function getSettings() {
  if (cache && Date.now() - cache.t < 60000) return cache.v;
  let doc = null;
  try { doc = await getDb().collection("settings").findOne({ key: "seo_settings" }); } catch { /* db not ready */ }
  const v = { ...DEFAULTS, ...(doc ? doc.value : {}) };
  v.rules = { ...DEFAULTS.rules, ...((doc && doc.value && doc.value.rules) || {}) };
  v.business = { ...DEFAULTS.business, ...((doc && doc.value && doc.value.business) || {}) };
  cache = { t: Date.now(), v };
  return v;
}

async function saveSettings(patch) {
  const cur = await getSettings();
  const next = { ...cur, ...patch, rules: { ...cur.rules, ...(patch.rules || {}) }, business: { ...cur.business, ...(patch.business || {}) } };
  await getDb().collection("settings").updateOne({ key: "seo_settings" }, { $set: { value: next } }, { upsert: true });
  cache = null;
  return next;
}

const defaultRobots = () => readPublic("robots.txt") || "User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://rekhakrishnamurthy.com/sitemap.xml\n";
const baseLlms = () => readPublic("llms.txt");

module.exports = { DEFAULTS, getSettings, saveSettings, defaultRobots, baseLlms };
