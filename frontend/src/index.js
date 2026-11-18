import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App, { preloadRoute } from "@/App";
import { startVitals, loadSeoOverrides } from "@/lib/seoClient";

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
loadSeoOverrides();
// When the page arrived pre-rendered, let the browser paint it before the app takes over.
const afterFirstPaint = (fn) => (hadSnapshot ? requestAnimationFrame(() => setTimeout(fn, 0)) : fn());
preloadRoute(window.location.pathname).catch(() => {}).finally(() => afterFirstPaint(render));
