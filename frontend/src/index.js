import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App, { preloadRoute } from "@/App";
import { startVitals, loadSeoOverrides } from "@/lib/seoClient";
import { registerWebMcpTools } from "@/lib/webmcp";

// After a deploy, a visitor who still has the old page open may ask for script files
// that no longer exist ("ChunkLoadError"). Reload once to pick up the new build.
const reloadOnStaleChunk = (msg) => {
  if (!/ChunkLoadError|Loading chunk \d+ failed|Loading CSS chunk/i.test(String(msg || ""))) return;
  try {
    const last = Number(sessionStorage.getItem("rk_chunk_reload") || 0);
    if (Date.now() - last < 30000) return;
    sessionStorage.setItem("rk_chunk_reload", String(Date.now()));
  } catch { /* storage blocked: still reload once */ }
  window.location.reload();
};
window.addEventListener("error", (e) => reloadOnStaleChunk((e.error && e.error.name) + " " + e.message));
window.addEventListener("unhandledrejection", (e) => reloadOnStaleChunk(e.reason && ((e.reason.name || "") + " " + (e.reason.message || ""))));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const rootEl = document.getElementById("root");
const hadSnapshot = rootEl.children.length > 0;
const render = () => {
  // Elements on screen when the app replaces the pre-rendered HTML keep their final state
  // (no second intro animation); pages opened later animate as usual.
  if (hadSnapshot) document.documentElement.classList.add("snap-takeover");
  ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
  );
  if (hadSnapshot) {
    setTimeout(() => {
      document.querySelectorAll("#root .fade-up").forEach((el) => { el.style.animation = "none"; });
      document.documentElement.classList.remove("snap-takeover");
    }, 1500);
  }
};

// Load the current route's code first, so React replaces the pre-rendered HTML in one step.
startVitals();
registerWebMcpTools();
loadSeoOverrides();
// When the page arrived pre-rendered, let the browser paint it before the app takes over.
const afterFirstPaint = (fn) => (hadSnapshot ? requestAnimationFrame(() => setTimeout(fn, 0)) : fn());
preloadRoute(window.location.pathname).catch(() => {}).finally(() => afterFirstPaint(render));
