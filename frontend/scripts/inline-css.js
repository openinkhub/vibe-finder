// Puts the main stylesheet inside every built HTML page, so the first paint doesn't wait for
// a separate CSS request. (Lazy-loaded route styles still load as files.)
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const cssDir = path.join(BUILD_DIR, "static", "css");
const main = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).find((f) => /^main\.[a-f0-9]+\.css$/.test(f)) : null;
if (!main) {
  console.log("Inline CSS: no main stylesheet found (skipped)");
  process.exit(0);
}
const css = fs.readFileSync(path.join(cssDir, main), "utf8").replace(/\/\*# sourceMappingURL=.*?\*\//g, "").replace(/<\/style/gi, "<\\/style");
const linkRe = new RegExp(`<link[^>]*href="/static/css/${main.replace(/\./g, "\\.")}"[^>]*>`);
let n = 0;
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== "static") walk(p); continue; }
    if (!f.name.endsWith(".html")) continue;
    const html = fs.readFileSync(p, "utf8");
    if (!linkRe.test(html)) continue;
    fs.writeFileSync(p, html.replace(linkRe, () => `<style id="main-css">${css}</style>`));
    n += 1;
  }
};
walk(BUILD_DIR);
console.log(`Inline CSS: ${main} (${Math.round(css.length / 1024)} KB) inlined into ${n} page(s)`);
