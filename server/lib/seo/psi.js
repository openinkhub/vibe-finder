// Lab speed tests through Google PageSpeed Insights (mobile), used for the Speed column
// until enough real-visitor data exists for a page. Runs one page at a time in the
// background; results are kept in the seo_psi collection.
//
// Google needs an API key (free; Google Cloud → enable "PageSpeed Insights API" → create
// an API key). It can be set in Admin → SEO (saved in settings) or as PSI_API_KEY.
// Without a key, Google's shared free allowance is usually used up and tests are refused.
//
// Runs skip pages tested in the last 7 days, so a run that stops (deploy, restart, Google
// limit) carries on from where it left off the next time it starts.

const { getDb } = require("../core");

const SITE = process.env.PUBLIC_SITE_URL || "https://rekhakrishnamurthy.com";
const FRESH_MS = 7 * 86400000;
const state = { running: false, total: 0, done: 0, failed: 0, current: null, started_at: null, finished_at: null, last_error: null, stopped: null };
const col = () => getDb().collection("seo_psi");
const settings = () => getDb().collection("settings");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getKey() {
  if (process.env.PSI_API_KEY) return process.env.PSI_API_KEY;
  const s = await settings().findOne({ key: "psi_api_key" }).catch(() => null);
  return (s && s.value) || "";
}
async function setKey(value) {
  const v = String(value || "").trim().slice(0, 200);
  if (v) await settings().updateOne({ key: "psi_api_key" }, { $set: { value: v } }, { upsert: true });
  else await settings().deleteOne({ key: "psi_api_key" });
}

async function testOne(path, key) {
  const q = new URLSearchParams({ url: SITE + (path === "/" ? "/" : path), strategy: "mobile", category: "performance" });
  if (key) q.set("key", key);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 120000);
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: ctrl.signal });
    if (r.status === 429 || r.status === 403) {
      const body = await r.text();
      const e = new Error(
        /per day/i.test(body)
          ? key ? "Google's daily limit for this API key is used up. The test carries on tomorrow." : "Google refused the test: it needs a PageSpeed API key (the shared free allowance is used up)."
          : /API key not valid|API_KEY_INVALID/i.test(body) ? "The PageSpeed API key is not valid." : /has not been used|disabled/i.test(body) ? "Enable the PageSpeed Insights API for this key in Google Cloud." : "Google rate limit reached",
      );
      e.retry = !/per day|key|API/i.test(e.message);
      e.stop = !e.retry;
      throw e;
    }
    if (!r.ok) throw new Error(`PageSpeed ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = await r.json();
    const a = j.lighthouseResult.audits;
    const num = (id) => (a[id] && typeof a[id].numericValue === "number" ? a[id].numericValue : null);
    // Why LCP is slow: which element it is and how its time splits into phases.
    const lcpEl = a["largest-contentful-paint-element"];
    const parts = (lcpEl && lcpEl.details && lcpEl.details.items) || [];
    // Newer Lighthouse versions report these in the "lcp-breakdown-insight" audit instead.
    const brk = (a["lcp-breakdown-insight"] && a["lcp-breakdown-insight"].details && a["lcp-breakdown-insight"].details.items) || [];
    const node = (parts[0] && parts[0].items && parts[0].items[0] && parts[0].items[0].node) || brk.find((x) => x && x.type === "node") || null;
    const brkTable = brk.find((x) => x && x.type === "table");
    const phases = parts[1] && parts[1].items ? Object.fromEntries(parts[1].items.map((x) => [x.phase, Math.round(x.timing)]))
      : brkTable ? Object.fromEntries(brkTable.items.map((x) => [x.subpart || x.label, Math.round(x.duration)])) : null;
    const ls = a["layout-shifts"] && a["layout-shifts"].details && a["layout-shifts"].details.items;
    const rb = a["render-blocking-resources"];
    const diag = {
      lcp_element: node ? { selector: String(node.selector || "").slice(0, 160), snippet: String(node.snippet || "").slice(0, 240) } : null,
      lcp_phases: phases,
      render_blocking: rb && rb.details && rb.details.items ? rb.details.items.map((x) => String(x.url || "").replace(SITE, "").slice(0, 120)) : [],
      cls_items: Array.isArray(ls) ? ls.slice(0, 4).map((x) => ({ score: Math.round((x.score || 0) * 1000) / 1000, el: String((x.node && (x.node.selector || x.node.snippet)) || "").slice(0, 140), causes: ((x.subItems && x.subItems.items) || []).map((c) => c.cause).filter(Boolean).slice(0, 3) })) : [],
      images: (((a["network-requests"] || {}).details || {}).items || []).filter((x) => x.resourceType === "Image" || /\.(webp|jpe?g|png|avif)(\?|$)/i.test(x.url || "")).slice(0, 6)
        .map((x) => ({ u: String(x.url || "").replace(SITE, "").replace(/\?.*/, "").slice(-70), s: Math.round(x.networkRequestTime || x.startTime || 0), e: Math.round(x.networkEndTime || x.endTime || 0), st: x.statusCode, kb: Math.round((x.transferSize || 0) / 1024), p: x.priority })),
      lcp_ms_observed: (a["metrics"] && a["metrics"].details && a["metrics"].details.items && a["metrics"].details.items[0] && Math.round(a["metrics"].details.items[0].observedLargestContentfulPaint)) || null,
      opportunities: Object.values(a).filter((x) => x.details && x.details.type === "opportunity" && x.numericValue > 100).map((x) => `${x.id}:${Math.round(x.numericValue)}`).slice(0, 6),
    };
    return {
      path,
      diag,
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

// Paths still needing a test (none, or older than a week). force = test everything.
async function pending(paths, force) {
  if (force) return paths;
  const rows = await col().find({}, { projection: { _id: 0, path: 1, at: 1 } }).toArray();
  const fresh = new Set(rows.filter((r) => r.at && Date.now() - new Date(r.at).getTime() < FRESH_MS).map((r) => r.path));
  return paths.filter((p) => !fresh.has(p));
}

async function run(paths, { force = false } = {}) {
  if (state.running) return status();
  const todo = await pending(paths, force);
  const key = await getKey();
  Object.assign(state, { running: todo.length > 0, total: todo.length, done: 0, failed: 0, current: null, started_at: new Date(), finished_at: todo.length ? null : new Date(), last_error: null, stopped: null });
  if (!todo.length) return status();
  (async () => {
    for (const p of todo) {
      state.current = p;
      let tries = 0;
      let stop = false;
      for (;;) {
        try {
          const res = await testOne(p, key);
          await col().updateOne({ path: p }, { $set: res }, { upsert: true });
          break;
        } catch (e) {
          state.last_error = e.message;
          if (e.stop) { stop = true; break; }
          if (e.retry && tries < 3) { tries += 1; await sleep(30000 * tries); continue; }
          state.failed += 1;
          break;
        }
      }
      if (stop) { state.stopped = state.last_error; break; }
      state.done += 1;
      await sleep(key ? 1500 : 6000);
    }
    Object.assign(state, { running: false, current: null, finished_at: new Date() });
  })().catch((e) => Object.assign(state, { running: false, last_error: e.message }));
  return status();
}

async function labByPath() {
  const rows = await col().find({}, { projection: { _id: 0 } }).toArray();
  return Object.fromEntries(rows.map((r) => [r.path, r]));
}

const status = () => ({ ...state });

module.exports = { run, status, labByPath, getKey, setKey, pending };
