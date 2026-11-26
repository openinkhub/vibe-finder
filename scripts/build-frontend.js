// Builds the React site (frontend/build) after `npm install`.
// Hostinger's Express preset runs only `npm install` (no build command), so the build hooks in here.
// Set SKIP_FRONTEND_BUILD=1 to skip (e.g. local backend-only work).
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.env.SKIP_FRONTEND_BUILD) {
  console.log("SKIP_FRONTEND_BUILD set — skipping frontend build");
  process.exit(0);
}
const root = path.join(__dirname, "..");
// Last date the site's content changed (from git), used as dateModified in page schema.
let contentDate = "";
try { contentDate = execSync("git log -1 --format=%cs -- frontend/src/content", { cwd: root }).toString().trim(); } catch (e) { /* no git on this machine */ }
const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, CI: "false", GENERATE_SOURCEMAP: "false", ...(contentDate ? { REACT_APP_CONTENT_DATE: contentDate } : {}) } });
// Keep the previous build's script and style files for a few days. A visitor whose page was
// opened before a deploy still asks for those files; without them the page fails to load
// parts of itself ("ChunkLoadError").
const KEEP_DAYS = 3;
const staticDir = path.join(root, "frontend/build/static");
const keep = path.join(root, "frontend/.prev-static");
fs.rmSync(keep, { recursive: true, force: true });
for (const sub of ["js", "css"]) {
  const from = path.join(staticDir, sub);
  if (!fs.existsSync(from)) continue;
  fs.mkdirSync(path.join(keep, sub), { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const src = path.join(from, f);
    if (!/\.(js|css)$/.test(f) || Date.now() - fs.statSync(src).mtimeMs > KEEP_DAYS * 864e5) continue;
    fs.copyFileSync(src, path.join(keep, sub, f));
    fs.utimesSync(path.join(keep, sub, f), fs.statSync(src).atime, fs.statSync(src).mtime);
  }
}
console.log("Building frontend…");
run("npm --prefix frontend install --legacy-peer-deps --no-audit --no-fund");
run("npm --prefix frontend run build");
console.log("Frontend build complete");
let restored = 0;
for (const sub of ["js", "css"]) {
  const from = path.join(keep, sub);
  if (!fs.existsSync(from)) continue;
  for (const f of fs.readdirSync(from)) {
    const dest = path.join(staticDir, sub, f);
    if (fs.existsSync(dest)) continue;
    fs.copyFileSync(path.join(from, f), dest);
    fs.utimesSync(dest, fs.statSync(path.join(from, f)).atime, fs.statSync(path.join(from, f)).mtime);
    restored++;
  }
}
fs.rmSync(keep, { recursive: true, force: true });
if (restored) console.log(`Kept ${restored} script/style files from the previous build for open pages`);

// The build tools (~70,000 files) aren't needed once the site is built; removing them keeps the
// hosting plan's file (inode) count low. They're reinstalled on the next deploy.
// Set KEEP_FRONTEND_DEPS=1 to keep them (e.g. for local frontend work).
if (!process.env.KEEP_FRONTEND_DEPS) {
  for (const dir of ["frontend/node_modules", "frontend/src/content/bodies"]) {
    fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  }
  console.log("Removed frontend build tools (frontend/node_modules) to save hosting files");
}
