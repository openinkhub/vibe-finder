// Lab speed tests through Google PageSpeed Insights (mobile), used for the Speed column
// until enough real-visitor data exists for a page. Runs one page at a time in the
// background; results are kept in the seo_psi collection.
//
// Optional: PSI_API_KEY (Google Cloud API key with the PageSpeed Insights API enabled)
// raises Google's rate limit. Without it, tests still run but more slowly.

const { getDb } = require("../core");

const SITE = process.env.PUBLIC_SITE_URL || "https://rekhakrishnamurthy.com";
const state = { running: false, total: 0, done: 0, failed: 0, current: null, started_at: null, finished_at: null, last_error: null };
const col = () => getDb().collection("seo_psi");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function testOne(path) {
  const q = new URLSearchParams({ url: SITE + (path === "/" ? "/" : path), strategy: "mobile", category: "performance" });
  if (process.env.PSI_API_KEY) q.set("key", process.env.PSI_API_KEY);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 120000);
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: ctrl.signal });
    if (r.status === 429) { const e = new Error("Google rate limit reached"); e.retry = true; throw e; }
    if (!r.ok) throw new Error(`PageSpeed ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = await r.json();
    const a = j.lighthouseResult.audits;
    const num = (id) => (a[id] && typeof a[id].numericValue === "number" ? a[id].numericValue : null);
    return {
      path,
      score: Math.round((j.lighthouseResult.categories.performance.score || 0) * 100),
      lcp: num("largest-contentful-paint"),
      fcp: num("first-contentful-paint"),
      cls: num("cumulative-layout-shift"),
      tbt: num("total-blocking-time"),
      si: num("speed-index"),
      ttfb: num("server-response-time"),
      at: new Date(),
    };
  } finally {
    clearTimeout(t);
  }
}

async function run(paths) {
  if (state.running) return state;
  Object.assign(state, { running: true, total: paths.length, done: 0, failed: 0, current: null, started_at: new Date(), finished_at: null, last_error: null });
  (async () => {
    for (const p of paths) {
      state.current = p;
      let tries = 0;
      for (;;) {
        try {
          const res = await testOne(p);
          await col().updateOne({ path: p }, { $set: res }, { upsert: true });
          break;
        } catch (e) {
          state.last_error = e.message;
          if (e.retry && tries < 3) { tries += 1; await sleep(30000 * tries); continue; }
          state.failed += 1;
          break;
        }
      }
      state.done += 1;
      await sleep(process.env.PSI_API_KEY ? 1500 : 6000);
    }
    Object.assign(state, { running: false, current: null, finished_at: new Date() });
  })().catch((e) => Object.assign(state, { running: false, last_error: e.message }));
  return state;
}

async function labByPath() {
  const rows = await col().find({}, { projection: { _id: 0 } }).toArray();
  return Object.fromEntries(rows.map((r) => [r.path, r]));
}

module.exports = { run, status: () => ({ ...state }), labByPath };
