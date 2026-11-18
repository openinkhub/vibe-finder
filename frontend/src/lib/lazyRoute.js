import React from "react";

// React.lazy with a preload(): once preloaded, the component renders synchronously (no Suspense
// fallback), so the pre-rendered HTML is replaced by the real page without a blank flash.
export function lazyRoute(loader, exportName = "default") {
  let Loaded = null;
  let promise = null;
  const load = () => {
    if (!promise) promise = loader().then((m) => { Loaded = m[exportName]; return Loaded; });
    return promise;
  };
  const Lazy = React.lazy(() => load().then((C) => ({ default: C })));
  const Component = (props) => (Loaded ? React.createElement(Loaded, props) : React.createElement(Lazy, props));
  Component.preload = load;
  return Component;
}
