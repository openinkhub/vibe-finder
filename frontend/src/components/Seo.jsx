import { useEffect } from "react";

export const OG_IMAGE_ALT = "Makeup By Rekha Krishnamurthy";
const SITE_URL = "https://rekhakrishnamurthy.com";

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
    } else if (page.path === "/about-us") {
      injectJsonLd("ld-json-entity", { "@context": "https://schema.org", ...AUTHOR_PERSON });
    } else {
      injectJsonLd("ld-json-entity", null);
    }

    injectJsonLd("ld-json-faq", faq && faq.length ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    } : null);

    return () => { ["ld-json-webpage", "ld-json-breadcrumb", "ld-json-entity", "ld-json-faq"].forEach((id) => injectJsonLd(id, null)); };
  }, [page, faq]);
};
