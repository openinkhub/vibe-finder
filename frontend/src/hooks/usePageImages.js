import { useEffect, useState } from "react";
import { api, imgUrl } from "../lib/api";

let cache = null;
let pending = null;
const listeners = new Set();

const fetchMap = () => {
  if (!pending) pending = api.get("/content/page-images").then((r) => { cache = Object.fromEntries(r.data.map((x) => [x.path, { image: x.image, alt_text: x.alt_text }])); listeners.forEach((fn) => fn(cache)); return cache; }).catch(() => (cache = cache || {})).finally(() => { pending = null; });
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
export const heroImage = (page, map) => (page ? imgUrl(map?.[mapKey(page)]?.image) || page.image : null);
export const heroImageAlt = (page, map) => (page ? map?.[mapKey(page)]?.alt_text || page.h1 || page.name : "");

export const usePageImage = (page) => heroImage(page, usePageImages());
