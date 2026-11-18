// SEO values saved in the admin (fetched once) and the site's own speed tracker.
import { API } from "./api";

let overrides = null;
let pending = null;
export const loadSeoOverrides = () => {
  if (overrides) return Promise.resolve(overrides);
  if (!pending) {
    pending = fetch(`${API}/seo/public-meta`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((d) => { overrides = d || {}; return overrides; });
  }
  return pending;
};
export const seoOverrideFor = (path) => (overrides ? overrides[path] : undefined);

// Schema that only the server adds (auto FAQ, custom schema) belongs to the page first loaded;
// remove it once the visitor moves to another page inside the app.
const firstPath = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") || "/" : "/";
export const dropServerOnlySchema = (path) => {
  if (path === firstPath) return;
  ["ld-json-autofaq", "ld-json-custom"].forEach((id) => { const el = document.getElementById(id); if (el) el.remove(); });
};

// ── Real-visitor Core Web Vitals + JavaScript errors, sent once when the page is hidden ──
export const startVitals = () => {
  if (typeof window === "undefined" || !("PerformanceObserver" in window) || window.location.pathname.startsWith("/admin")) return;
  const m = { path: window.location.pathname, errors: [] };
  const observe = (type, cb, opts = {}) => {
    try { new PerformanceObserver((list) => list.getEntries().forEach(cb)).observe({ type, buffered: true, ...opts }); } catch { /* unsupported */ }
  };
  observe("largest-contentful-paint", (e) => { m.lcp = e.startTime; });
  observe("paint", (e) => { if (e.name === "first-contentful-paint") m.fcp = e.startTime; });
  let cls = 0, sess = 0, last = 0, first = 0;
  observe("layout-shift", (e) => {
    if (e.hadRecentInput) return;
    if (sess && e.startTime - last < 1000 && e.startTime - first < 5000) sess += e.value; else { sess = e.value; first = e.startTime; }
    last = e.startTime;
    cls = Math.max(cls, sess);
    m.cls = cls;
  });
  observe("event", (e) => { if (e.interactionId) m.inp = Math.max(m.inp || 0, e.duration); }, { durationThreshold: 40 });
  try { const nav = performance.getEntriesByType("navigation")[0]; if (nav) m.ttfb = nav.responseStart; } catch { /* ignore */ }
  window.addEventListener("error", (e) => { if (m.errors.length < 5 && e.message) m.errors.push(`${e.message}${e.filename ? ` @ ${String(e.filename).split("/").pop()}:${e.lineno}` : ""}`); });
  window.addEventListener("unhandledrejection", (e) => { if (m.errors.length < 5) m.errors.push(`Unhandled: ${String((e.reason && e.reason.message) || e.reason).slice(0, 200)}`); });
  let sent = false;
  const send = (force) => {
    if (sent || (force !== true && document.visibilityState !== "hidden")) return;
    sent = true;
    const body = JSON.stringify(m);
    try { if (!navigator.sendBeacon || !navigator.sendBeacon(`${API}/seo/vitals`, body)) fetch(`${API}/seo/vitals`, { method: "POST", body, keepalive: true }); } catch { /* ignore */ }
  };
  document.addEventListener("visibilitychange", send);
  window.addEventListener("pagehide", () => send(true));
};
