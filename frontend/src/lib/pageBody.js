import { useEffect, useState } from "react";
import loaders from "../content/bodies";

// Page body text, one small chunk per page (see scripts/split-page-bodies.js).
const cache = {};
export const hasPageBody = (path) => !!loaders[path];
export const loadPageBody = (path) => {
  if (!loaders[path]) return Promise.resolve(null);
  if (cache[path]) return Promise.resolve(cache[path]);
  return loaders[path]().then((m) => { cache[path] = m.default || m; return cache[path]; });
};
// Returns the body (undefined while it loads, null when the page has none).
export const usePageBody = (path) => {
  const [, rerender] = useState(0);
  useEffect(() => {
    let on = true;
    if (loaders[path] && !cache[path]) loadPageBody(path).then(() => on && rerender((n) => n + 1)).catch(() => {});
    return () => { on = false; };
  }, [path]);
  if (!loaders[path]) return null;
  return cache[path];
};
