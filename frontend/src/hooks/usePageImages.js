import { useEffect, useState } from "react";
import { api, imgUrl } from "../lib/api";

const toMap = (list) => Object.fromEntries(list.map((x) => [x.path, { image: x.image, alt_text: x.alt_text }]));
// Start from the hero map the server embedded in the page, so the first render keeps the hero the HTML already shows.
const boot = () => { try { const el = document.getElementById("rk-page-images"); return el ? toMap(JSON.parse(el.textContent)) : null; } catch { return null; } };
let cache = typeof document !== "undefined" ? boot() : null;
let pending = null;
const listeners = new Set();

const fetchMap = () => {
  if (!pending) pending = api.get("/content/page-images").then((r) => { cache = toMap(r.data); listeners.forEach((fn) => fn(cache)); return cache; }).catch(() => (cache = cache || {})).finally(() => { pending = null; });
  return pending;
};

export const refreshPageImages = () => { cache = null; return fetchMap(); };

export const usePageImages = () => {
  const [map, setMap] = useState(cache || {});
  useEffect(() => {
    listeners.add(setMap);
    if (cache) setMap(cache); else fetchMap();
    return () => listeners.delete(setMap);
  }, []);
  return map;
};

const mapKey = (page) => (page.path === "/" ? "/home" : page.path);
// Pages moved to a new URL keep the hero image uploaded under their former URL until a new one is set.
const entry = (page, map) => map?.[mapKey(page)] || (page.formerPath ? map?.[page.formerPath] : null);
export const heroImage = (page, map) => (page ? imgUrl(entry(page, map)?.image) || page.image : null);
export const heroImageAlt = (page, map) => (page ? entry(page, map)?.alt_text || page.h1 || page.name : "");

export const usePageImage = (page) => heroImage(page, usePageImages());
