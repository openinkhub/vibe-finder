#!/usr/bin/env node
// Captures the rendered content of every page into frontend/prerender/*.html.
// The build (frontend/scripts/inject-seo.js) puts each snapshot inside <div id="root"> of that
// page's HTML, so crawlers that don't run JavaScript (AI assistants, many SEO tools) can read it.
// React replaces the snapshot as soon as the page's JavaScript loads.
//
// Re-run after changing page text, prices, services or other admin content:
//   1. Start the site locally against the live database:   npm run build && npm start
//   2. In another terminal:  npx -y -p playwright-core node scripts/prerender-snapshots.js http://localhost:3000
//      (needs Google Chrome installed; set CHROME_PATH if it isn't at /usr/bin/google-chrome)
//   3. Commit frontend/prerender/ and push.
//
// /archive is not snapshotted. /blog is, and the server fills its post grid (#blog-posts) from the database.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const root = path.join(__dirname, "..");
const outDir = path.join(root, "frontend", "prerender");
const pages = JSON.parse(fs.readFileSync(path.join(root, "frontend", "src", "content", "pages.json"), "utf8"));
const SKIP = new Set(["/admin", "/archive"]);

const fileFor = (p) => (p === "/" ? "index" : p.replace(/^\//, "").replace(/\//g, "__")) + ".html";

// Keep readable content; drop what only matters once JavaScript runs.
function cleanup() {
  const rootEl = document.getElementById("root").cloneNode(true);
  rootEl.querySelectorAll("script, style, noscript, canvas, iframe, video, svg, [aria-hidden='true'], form button[type='submit'] svg, [data-sonner-toaster]").forEach((el) => el.remove());
  rootEl.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes]) {
      if (a.name === "style" || a.name.startsWith("data-") || a.name.startsWith("aria-") || a.name === "tabindex" || a.name === "role" || a.name.startsWith("on")) el.removeAttribute(a.name);
    }
  });
  rootEl.querySelectorAll("input, select, textarea").forEach((el) => el.removeAttribute("value"));
  return rootEl.innerHTML.replace(/\s{2,}/g, " ").replace(/<!--.*?-->/g, "");
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let n = 0;
  for (const p of pages) {
    if (SKIP.has(p.path)) continue;
    const page = await ctx.newPage();
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
    // Scroll through the page so scroll-triggered sections render their content.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const html = await page.evaluate(cleanup);
    fs.writeFileSync(path.join(outDir, fileFor(p.path)), html + "\n");
    n += 1;
    await page.close();
  }
  await browser.close();
  console.log(`Saved ${n} page snapshots to frontend/prerender/`);
})().catch((e) => { console.error(e); process.exit(1); });
