// IndexNow: tell Bing, Yandex, Seznam, Naver and other IndexNow engines straight away when a page
// or post is added, changed or removed, instead of waiting for them to re-crawl the sitemap.
// https://www.indexnow.org/documentation
//
// - The key is public by design: engines fetch /<key>.txt to confirm the ping came from this site.
// - Pings are batched for 20 s so a burst of edits becomes one request.
// - Scheduled blog posts are pinged on the day they go live (checked every hour, IST dates).
// - Every indexable URL is sent once after the first deploy (and again on request from the admin).
// - Only runs against the live database, so local and test copies never ping the engines.
const { getDb } = require("../core");

const KEY = process.env.INDEXNOW_KEY || "59b29bcc9ebef9db1d00f8f4dd17b760";
const SITE_URL = (process.env.SITE_URL || "https://rekhakrishnamurthy.com").replace(/\/$/, "");
const HOST = new URL(SITE_URL).host;
const KEY_PATH = `/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const STATE = "indexnow_state";

const enabled = () => !/127\.0\.0\.1|localhost/.test(process.env.MONGO_URL || "") && !/localhost|127\.0\.0\.1|hostingersite\.com/.test(HOST);
const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const settings = () => getDb().collection("settings");

async function getState() {
  try { return ((await settings().findOne({ key: STATE })) || {}).value || {}; } catch { return {}; }
}
async function setState(patch) {
  const cur = await getState();
  await settings().updateOne({ key: STATE }, { $set: { value: { ...cur, ...patch } } }, { upsert: true });
}

const toUrl = (p) => (/^https?:\/\//.test(p) ? p : SITE_URL + (p === "/" ? "/" : p.startsWith("/") ? p : `/${p}`));

// Send now. Returns { status, count }.
async function send(paths, reason) {
  const urlList = [...new Set(paths.map(toUrl))].filter((u) => new URL(u).host === HOST).slice(0, 10000);
  if (!urlList.length) return { status: 0, count: 0 };
  if (!enabled()) { console.log(`IndexNow (off here) would send ${urlList.length} URL(s): ${reason}`); return { status: 0, count: urlList.length, skipped: true }; }
  let status = 0, error = "";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: HOST, key: KEY, keyLocation: SITE_URL + KEY_PATH, urlList }), signal: ctrl.signal });
    clearTimeout(t);
    status = r.status;
    if (!r.ok) error = (await r.text().catch(() => "")).slice(0, 200);
  } catch (e) { error = e.message; }
  // 200 = accepted, 202 = accepted (key being checked). Anything else is logged for the admin.
  const entry = { at: new Date().toISOString(), reason, count: urlList.length, status, error, sample: urlList.slice(0, 5).map((u) => u.replace(SITE_URL, "") || "/") };
  console.log(`IndexNow ${status || "failed"}: ${urlList.length} URL(s) — ${reason}${error ? ` — ${error}` : ""}`);
  try { const s = await getState(); await setState({ log: [entry, ...(s.log || [])].slice(0, 30) }); } catch { /* ignore */ }
  return { status, count: urlList.length, error };
}

// Queue paths; they go out together after a short pause.
let queue = new Map(); // path -> reason
let timer = null;
function notify(paths, reason = "updated") {
  for (const p of [].concat(paths).filter(Boolean)) queue.set(p, reason);
  if (timer) return;
  timer = setTimeout(async () => {
    const batch = queue; queue = new Map(); timer = null;
    const reasons = [...new Set(batch.values())].join(", ");
    await send([...batch.keys()], reasons).catch((e) => console.error("IndexNow:", e.message));
  }, 20000);
  if (timer.unref) timer.unref();
}

async function submitAll(reason = "full submission") {
  const site = require("./site");
  const urls = await site.indexableUrls();
  const r = await send(urls.map((u) => u.path), reason);
  if (r.status >= 200 && r.status < 300) await setState({ fullAt: new Date().toISOString() });
  return r;
}

// Scheduled posts: ping each one on the day it goes live.
async function pingTodaysPosts() {
  const today = todayIST();
  const s = await getState();
  if (s.dailyFor === today) return;
  const { RETIRED_SLUGS } = require("../blogSeo");
  const due = await getDb().collection("blog_posts").find({ publish_date: { $regex: `^${today}` }, slug: { $nin: RETIRED_SLUGS } }, { projection: { _id: 0, slug: 1 } }).toArray();
  if (due.length) await send([...due.map((p) => `/blog/${p.slug}`), "/blog"], `scheduled post(s) live ${today}`);
  await setState({ dailyFor: today });
}

function schedule() {
  if (!enabled()) return;
  const tick = async () => {
    try {
      const s = await getState();
      if (!s.fullAt) await submitAll("first submission of every page and post");
      await pingTodaysPosts();
    } catch (e) { console.error("IndexNow schedule:", e.message); }
  };
  setTimeout(tick, 2 * 60 * 1000).unref();
  setInterval(tick, 60 * 60 * 1000).unref();
}

// GET /<key>.txt — the key file engines use to verify pings.
function keyRoute(app) {
  app.get(KEY_PATH, (_q, res) => res.set("Cache-Control", "public, max-age=86400").type("text/plain").send(KEY));
}

module.exports = { KEY, KEY_PATH, notify, submitAll, pingTodaysPosts, schedule, keyRoute, getState, enabled };
