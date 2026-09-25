/* Build-time static SEO tag injection (no headless browser — pure HTML string
 * parsing via cheerio, safe on any CPU architecture). For every route in
 * pages.json, clones build/index.html and rewrites title/meta/canonical/OG/
 * Twitter tags + injects WebPage/BreadcrumbList/Service|Course|Person JSON-LD
 * so crawlers that don't execute JS see correct, unique per-page SEO tags. */
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const BUILD_DIR = path.join(__dirname, "..", "build");
const SITE_URL = "https://rekhakrishnamurthy.com";
const OG_IMAGE_ALT = "Makeup By Rekha Krishnamurthy";
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "content", "pages.json"), "utf8"));

const template = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");

const buildJsonLd = (page) => {
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
  let entity = null;
  if (page.group === "Services") {
    entity = { "@context": "https://schema.org", "@type": "Service", serviceType: page.h1 || page.name, name: page.h1 || page.name, description: page.metaDescription, provider: { "@type": "Person", name: "Rekha Krishnamurthy" }, areaServed: "Bangalore, Karnataka, India" };
  } else if (page.group === "Academy") {
    entity = { "@context": "https://schema.org", "@type": "Course", name: page.h1 || page.name, description: page.metaDescription, provider: { "@type": "Organization", name: "Rekha Krishnamurthy Makeup & Academy", sameAs: SITE_URL } };
  } else if (page.path === "/about-us") {
    entity = { "@context": "https://schema.org", "@type": "Person", name: "Rekha Krishnamurthy", jobTitle: "Bridal & Celebrity Makeup Artist", url: `${SITE_URL}/about-us`, sameAs: ["https://www.instagram.com/makeupbyrekhakrishnamurthy/", "https://www.facebook.com/makeupbyrekhakrishnamurthy/", "https://x.com/MakeupbyRekha", "https://www.linkedin.com/in/rekha-krishnamurthy-6b998839"] };
  }
  return { webPage, breadcrumb, entity };
};

let written = 0;
for (const page of pages) {
  if (page.path === "/admin") continue;
  const $ = cheerio.load(template);
  const image = `${SITE_URL}/og-image.webp`;

  $("title").text(page.metaTitle);
  $('meta[name="description"]').attr("content", page.metaDescription);
  $('link[rel="canonical"]').attr("href", page.canonical);
  $('meta[property="og:title"]').attr("content", page.ogTitle);
  $('meta[property="og:description"]').attr("content", page.ogDescription);
  $('meta[property="og:url"]').attr("content", page.canonical);
  $('meta[property="og:image"]').attr("content", image);
  $('meta[property="og:image:alt"]').attr("content", OG_IMAGE_ALT);
  $('meta[name="twitter:title"]').attr("content", page.ogTitle);
  $('meta[name="twitter:description"]').attr("content", page.ogDescription);
  $('meta[name="twitter:image"]').attr("content", image);

  const { webPage, breadcrumb, entity } = buildJsonLd(page);
  $("head").append(`<script type="application/ld+json" id="ld-json-webpage">${JSON.stringify(webPage)}</script>`);
  $("head").append(`<script type="application/ld+json" id="ld-json-breadcrumb">${JSON.stringify(breadcrumb)}</script>`);
  if (entity) $("head").append(`<script type="application/ld+json" id="ld-json-entity">${JSON.stringify(entity)}</script>`);

  const outPath = page.path === "/" ? path.join(BUILD_DIR, "index.html") : path.join(BUILD_DIR, page.path.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, $.html());
  written += 1;
}
console.log(`SEO tag injection done. Wrote ${written}/${pages.length} static pages (no headless browser used).`);
