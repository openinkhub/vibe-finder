import { useEffect, useState } from "react";
import { api, imgUrl } from "../lib/api";

let cache = null;
let pending = null;
const listeners = new Set();

const fetchMap = () => {
  if (!pending) pending = api.get("/content/page-images").then((r) => { cache = Object.fromEntries(r.data.map((x) => [x.path, x.image])); listeners.forEach((fn) => fn(cache)); return cache; }).catch(() => (cache = cache || {})).finally(() => { pending = null; });
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

export const heroImage = (page, map) => (page ? imgUrl(map?.[page.path]) || page.image : null);

export const usePageImage = (page) => heroImage(page, usePageImages());
