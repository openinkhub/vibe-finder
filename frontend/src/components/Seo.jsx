import { useEffect } from "react";

export const OG_IMAGE_ALT = "Makeup By Rekha Krishnamurthy";

const setTag = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement(selector.startsWith("link") ? "link" : "meta"); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

export const useSeo = (page) => {
  useEffect(() => {
    if (!page) return;
    const image = `${window.location.origin}/og-image.webp`;
    document.title = page.metaTitle;
    setTag('meta[name="description"]', { name: "description", content: page.metaDescription });
    setTag('link[rel="canonical"]', { rel: "canonical", href: page.canonical });
    setTag('meta[property="og:type"]', { property: "og:type", content: "website" });
    setTag('meta[property="og:site_name"]', { property: "og:site_name", content: "Rekha Krishnamurthy Makeup & Academy" });
    setTag('meta[property="og:title"]', { property: "og:title", content: page.ogTitle });
    setTag('meta[property="og:description"]', { property: "og:description", content: page.ogDescription });
    setTag('meta[property="og:url"]', { property: "og:url", content: page.canonical });
    setTag('meta[property="og:image"]', { property: "og:image", content: image });
    setTag('meta[property="og:image:alt"]', { property: "og:image:alt", content: OG_IMAGE_ALT });
    setTag('meta[property="og:image:type"]', { property: "og:image:type", content: "image/webp" });
    setTag('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setTag('meta[name="twitter:title"]', { name: "twitter:title", content: page.ogTitle });
    setTag('meta[name="twitter:description"]', { name: "twitter:description", content: page.ogDescription });
    setTag('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    setTag('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: OG_IMAGE_ALT });
  }, [page]);
};
