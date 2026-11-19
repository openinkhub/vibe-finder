import { useEffect, useMemo, useState } from "react";
import { loadSeoOverrides, seoOverrideFor, dropServerOnlySchema } from "../lib/seoClient";

export const OG_IMAGE_ALT = "Makeup By Rekha Krishnamurthy";
const SITE_URL = "https://rekhakrishnamurthy.com";

const setTag = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement(selector.startsWith("link") ? "link" : "meta"); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

// Page data merged with any SEO settings saved in the admin.
export const useSeoPage = (page) => {
  const [ready, setReady] = useState(0);
  useEffect(() => { let on = true; loadSeoOverrides().then(() => on && setReady((n) => n + 1)); return () => { on = false; }; }, []);
  return useMemo(() => mergeOverride(page), [page, ready]); // eslint-disable-line react-hooks/exhaustive-deps
};

const mergeOverride = (page) => {
  if (!page) return page;
  const o = seoOverrideFor(page.path);
  if (!o) return page;
  const metaTitle = o.seo_title || page.metaTitle;
  const metaDescription = o.meta_description || page.metaDescription;
  return { ...page, metaTitle, metaDescription, canonical: o.canonical || page.canonical, ogTitle: o.og_title || (o.seo_title ? metaTitle : page.ogTitle), ogDescription: o.og_description || (o.meta_description ? metaDescription : page.ogDescription), ogImage: o.og_image, robots: o.noindex || o.nofollow ? `${o.noindex ? "noindex" : "index"},${o.nofollow ? "nofollow" : "follow"}` : null };
};

export const useSeo = (rawPage) => {
  const page = useSeoPage(rawPage);
  useEffect(() => {
    if (!page) return;
    dropServerOnlySchema(page.path);
    const image = page.ogImage ? new URL(page.ogImage, window.location.origin).href : `${window.location.origin}/og-image.webp`;
    document.title = page.metaTitle;
    setTag('meta[name="description"]', { name: "description", content: page.metaDescription });
    setTag('link[rel="canonical"]', { rel: "canonical", href: page.canonical });
    setTag('meta[name="robots"]', { name: "robots", content: page.robots || "index, follow, max-image-preview:large" });
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

const AUTHOR_PERSON = {
  "@type": "Person",
  name: "Rekha Krishnamurthy",
  jobTitle: "Bridal & Celebrity Makeup Artist",
  url: `${SITE_URL}/about-us`,
  sameAs: [
    "https://www.instagram.com/makeupbyrekhakrishnamurthy/",
    "https://www.facebook.com/makeupbyrekhakrishnamurthy/",
    "https://x.com/MakeupbyRekha",
    "https://www.linkedin.com/in/rekha-krishnamurthy-6b998839",
  ],
};

export const injectJsonLd = (id, data) => {
  let el = document.getElementById(id);
  if (!data) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement("script"); el.id = id; el.type = "application/ld+json"; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
};

export const useJsonLd = (page, faq) => {
  useEffect(() => {
    if (!page) return;
    const segments = (page.path || "/").split("/").filter(Boolean);
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ...segments.map((seg, i) => ({ "@type": "ListItem", position: i + 2, name: page.h1 || page.name, item: `${SITE_URL}/${segments.slice(0, i + 1).join("/")}` })),
      ],
    };
    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": page.canonical,
      name: page.metaTitle,
      description: page.metaDescription,
      url: page.canonical,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      author: { "@type": "Person", name: "Rekha Krishnamurthy", url: `${SITE_URL}/about-us` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    };
    injectJsonLd("ld-json-webpage", webPage);
    injectJsonLd("ld-json-breadcrumb", breadcrumb);

    if (page.group === "Services") {
      injectJsonLd("ld-json-entity", {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: page.h1 || page.name,
        name: page.h1 || page.name,
        description: page.metaDescription,
        provider: { "@type": "Person", name: "Rekha Krishnamurthy" },
        areaServed: "Bangalore, Karnataka, India",
      });
    } else if (page.group === "Academy") {
      injectJsonLd("ld-json-entity", {
        "@context": "https://schema.org",
        "@type": "Course",
        name: page.h1 || page.name,
        description: page.metaDescription,
        provider: { "@type": "Organization", name: "Rekha Krishnamurthy Makeup & Academy", sameAs: SITE_URL },
      });
    } else if (page.group === "Guides") {
      injectJsonLd("ld-json-entity", {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: page.h1 || page.name,
        description: page.metaDescription,
        url: page.canonical,
        mainEntityOfPage: page.canonical,
        image: page.image,
        datePublished: page.date,
        dateModified: page.date,
        author: AUTHOR_PERSON,
        publisher: { "@id": `${SITE_URL}/#organization` },
        keywords: [page.keyphrase, ...(page.relatedKeywords || [])].filter(Boolean).join(", "),
      });
    } else if (page.path === "/about-us") {
      injectJsonLd("ld-json-entity", { "@context": "https://schema.org", ...AUTHOR_PERSON });
    } else {
      injectJsonLd("ld-json-entity", null);
    }

    if (faq && faq.length) { const auto = document.getElementById("ld-json-autofaq"); if (auto) auto.remove(); }
    injectJsonLd("ld-json-faq", faq && faq.length ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    } : null);

    return () => { ["ld-json-webpage", "ld-json-breadcrumb", "ld-json-entity", "ld-json-faq"].forEach((id) => injectJsonLd(id, null)); };
  }, [page, faq]);
};
