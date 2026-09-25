/* Build-time prerender: crawls every route with Puppeteer and bakes the
 * post-JS DOM (title/meta/OG/JSON-LD + rendered content) into static HTML
 * so crawlers/audit tools that don't execute JS see correct per-page SEO tags. */
const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer");

const BUILD_DIR = path.join(__dirname, "..", "build");
const PORT = 5055;
const CONCURRENCY = 4;

const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "content", "pages.json"), "utf8"));
const routes = pages.map((p) => p.path).filter((p) => p !== "/admin");

const mime = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".mp4": "video/mp4" };

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  const filePath = path.join(BUILD_DIR, urlPath);
  const isAsset = path.extname(urlPath) !== "";
  if (isAsset && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  res.setHeader("Content-Type", "text/html");
  fs.createReadStream(path.join(BUILD_DIR, "index.html")).pipe(res);
});

const runBatch = async (browser, batch) => {
  return Promise.all(
    batch.map(async (route) => {
      const page = await browser.newPage();
      try {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle0", timeout: 30000 });
        await new Promise((r) => setTimeout(r, 400));
        const html = await page.content();
        return { route, html };
      } catch (e) {
        console.error(`  ! failed ${route}: ${e.message}`);
        return null;
      } finally {
        await page.close();
      }
    }),
  );
};

(async () => {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Prerender server listening on :${PORT}, crawling ${routes.length} routes...`);

  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const results = [];
  for (let i = 0; i < routes.length; i += CONCURRENCY) {
    const batch = routes.slice(i, i + CONCURRENCY);
    const out = await runBatch(browser, batch);
    results.push(...out.filter(Boolean));
    console.log(`  prerendered ${Math.min(i + CONCURRENCY, routes.length)}/${routes.length}`);
  }
  await browser.close();
  server.close();

  for (const { route, html } of results) {
    const outPath = route === "/" ? path.join(BUILD_DIR, "index.html") : path.join(BUILD_DIR, route.replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
  }
  console.log(`Done. Wrote ${results.length}/${routes.length} static pages.`);
  if (results.length < routes.length) {
    console.error(`WARNING: ${routes.length - results.length} routes failed to prerender.`);
  }
})();
