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
const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, CI: "false", GENERATE_SOURCEMAP: "false" } });
console.log("Building frontend…");
run("npm --prefix frontend install --legacy-peer-deps --no-audit --no-fund");
run("npm --prefix frontend run build");
console.log("Frontend build complete");

// The build tools (~70,000 files) aren't needed once the site is built; removing them keeps the
// hosting plan's file (inode) count low. They're reinstalled on the next deploy.
// Set KEEP_FRONTEND_DEPS=1 to keep them (e.g. for local frontend work).
if (!process.env.KEEP_FRONTEND_DEPS) {
  for (const dir of ["frontend/node_modules", "frontend/src/content/bodies"]) {
    fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  }
  console.log("Removed frontend build tools (frontend/node_modules) to save hosting files");
}
