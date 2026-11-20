// Blog SEO helpers: retired-post redirects and FAQ extraction from post bodies.

// Posts merged into a stronger duplicate, or placeholder posts, permanently redirect here.
// The posts stay in the database (nothing deleted); they're hidden from lists and the sitemap.
const BLOG_REDIRECTS = {
  // near-duplicates → the longer, newer post
  "everyday-makeup-routine-polished-office-look": "/blog/everyday-makeup-routine-learn-a-polished-office-look-in-bangalore",
  "party-makeup-hsr-layout-jp-nagar-jayanagar-banashankari": "/blog/party-makeup-jayanagar-hsr-jp-nagar-banashankari",
  "engagement-makeup-for-daytime-vs-evening-functions-how-to-choose-the-right-look": "/blog/engagement-makeup-daytime-vs-evening-functions",
  "hd-vs-airbrush-bridal-makeup-finish-suitability-cost": "/blog/hd-vs-airbrush-bridal-makeup-bangalore",
  "south-indian-bridal-makeup-with-silk-saree-temple-jewellery-a-complete-styling-guide": "/blog/south-indian-bridal-makeup-with-silk-saree-temple-jewellery",
  // ~50-word placeholder posts → the closest full article or service page
  "how-far-in-advance-to-book-bridal-makeup": "/bridal-makeup-artist-bangalore",
  "hd-vs-airbrush-makeup": "/blog/hd-vs-airbrush-bridal-makeup-bangalore",
  "south-indian-bridal-look-checklist": "/blog/south-indian-bridal-makeup-with-silk-saree-temple-jewellery",
};

const RETIRED_SLUGS = Object.keys(BLOG_REDIRECTS);

// Reads "## Frequently Asked Questions" sections written in the post body:
//   ### Question?            or   **Question?**
//   Answer paragraph(s)…          Answer paragraph(s)…
function extractFaqs(body) {
  const text = String(body || "").replace(/\r\n/g, "\n");
  const m = /^#{2,3}\s*(?:FAQs?|Frequently Asked Questions|Common Questions)[^\n]*\n/im.exec(text);
  if (!m) return [];
  let section = text.slice(m.index + m[0].length);
  const end = section.search(/^##\s(?!#)/m); // next level-2 heading ends the FAQ section
  if (end >= 0) section = section.slice(0, end);
  const faqs = [];
  const re = /^(?:###\s*(.+?)\s*|\*\*(.+?\?)\*\*\s*)$/gm;
  const marks = [];
  let k;
  while ((k = re.exec(section))) marks.push({ q: (k[1] || k[2]).replace(/\*\*/g, "").trim(), start: k.index, after: re.lastIndex });
  marks.forEach((mk, i) => {
    const a = section.slice(mk.after, i + 1 < marks.length ? marks[i + 1].start : undefined).trim().replace(/\s+/g, " ");
    if (mk.q && a) faqs.push({ q: mk.q.slice(0, 200), a: a.replace(/[*_`#>]/g, "").slice(0, 1000) });
  });
  return faqs;
}

module.exports = { BLOG_REDIRECTS, RETIRED_SLUGS, extractFaqs };
