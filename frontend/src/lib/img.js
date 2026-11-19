// Unsplash serves the full-size original (often 3–5 MB) unless the URL asks for a size.
// Any Unsplash photo URL without its own parameters gets a 1000px, auto-format version.
const UNSPLASH = /^https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9-]+$/;
export const sizeImage = (u) => (typeof u === "string" && UNSPLASH.test(u) ? `${u}?auto=format&fit=crop&w=1000&q=70` : u);

// Applies sizeImage to every string in API data (images may sit at any depth).
export const sizeImagesDeep = (v) => {
  if (typeof v === "string") return sizeImage(v);
  if (Array.isArray(v)) return v.map(sizeImagesDeep);
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = sizeImagesDeep(v[k]); return o; }
  return v;
};
