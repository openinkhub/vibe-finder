# CHANGELOG — Rekha Krishnamurthy Portfolio

## 2026-06 (Sessions a–f) — MVP + Core Features
- Cream/blush palette, logo, 3D motion cards, Virtual Try-On (MediaPipe + AI look gen)
- Enquiry backend, Admin dashboard (JWT), WhatsApp share, Before/After compare
- Legal pages (/privacy /terms /refund /disclaimer), footer with locations bar
- 53-page directory from Excel → `pages.json`; `useSeo` hook; OG image `/public/og-image.webp`
- Full header/footer navigation matching the SEO sheet

## 2026-06 (Sessions g–k) — Look Lab + Portfolio + CMS Foundations
- MediaPipe 3D face mesh in Look Lab (468-point, photo-textured)
- Dedicated routes `/look-lab`, `/try-on`; Corporate Makeup + Bridal Packages pages
- Admin: editable Services, Availability calendar, Page Heroes (Mongo `page_images`)
- Single-source hero images: changing in Admin auto-updates Home page

## 2026-06 (Sessions l–o) — Rich Content Pages
- About Us + Booking page content from docx → `pageBodies.js` + `RichBody.jsx`
- Academy Launchpad page (18 sections, ₹1,50,000 fee, 16 FAQs)
- 3 more Academy pages + Batch dates admin tab + `BatchBanner` with countdown
- Course enquiry preset in contact form (`COURSE_SERVICES` optgroup)

## 2026-09 (Sessions p–r) — Portfolio, Brochures, Admin Upgrade
- 7 Portfolio pages rich body (Bridal/Engagement/Non-Bridal/Party/Editorial/Fashion/Photo Shoot)
- Batch banner: countdown, seat availability chip, auto-hide past date
- Course & Service brochures: PDF auto-generation (reportlab), Resend email attachment
- BookingPanel on 12 pages; Admin split into "Service Enquiries" / "Course Enquiries" tabs
- Accept/Reject buttons with Resend confirmation/decline emails to leads
- 11 Location/Service-Area pages with card-table layout and FAQ sidebar
- All 8 Services pages with rich content, rates, Do's/Don'ts, before/after care
- Contact Us page full rich content (13 sections)
- Home pricing cards finalized: 6 cards, Party from ₹7,999 → Bridal from ₹29,999

## 2026-09 (Sessions s–z) — UX Polish + SEO
- CTA-chain fix: PageHero "Jump to Enquiry Form" scrolls to pre-filled form
- 5 Experience pages (Bridal Experience, Makeup Trial, Skin Consultation, HD, Airbrush)
- Address updated everywhere to full Kumaraswamy Layout address
- Google reviews widget (Featurable) replaces static testimonials
- "Locate us on Google" link in Footer
- Testimonials page fleshed out with 5 content sections
- Social media icons (react-icons fa6): Footer + AuthorBio + FloatingButtons
- Stale review stats removed; Google rating corrected to 4.9; hero chip "from ₹4,999"
- GTM-WL72CXFB installed site-wide in index.html
- Openink Hub AI-SEO tracking snippet + RouteTracker SPA virtual pageview

## 2026-09 (Sessions aa–ag) — Technical SEO + Build
- Blog CMS: full admin panel, Markdown body, FAQ editor, featured image auto-WebP, third-party POST API
- JSON-LD schema site-wide (WebPage, BreadcrumbList, Service, Course, Person, FAQPage)
- robots.txt, dynamic sitemap.xml (backend `/api/sitemap.xml`), llms.txt + llms-full.txt
- Real favicon cropped from brand logo
- Build prerender: replaced Puppeteer (ARM64 incompatible) with Cheerio-based `inject-seo.js`
- `inject-seo.js` now always uses `localhost:8001` for blog API at build time (external URL unreachable during build)
- NotFoundPage with `noindex,nofollow` meta replacing silent 404 redirect
- camera-controls pinned to 3.1.0 (Node 20 compat)

## 2026-09 (Sessions ah–ak) — Mobile Hero + CTA
- Mobile CTA: short labels (Book/Enquiry/Consult/Ask Me), no duplicates per page
- Hero video removed → static frame extracted from user's video (58KB, vivid)
- Mobile Hero: lighter overlay, CSS contrast/saturate filter on static image
- Mobile Book button: `text-xs py-2 px-5 self-start`

## 2026-11 — Image Pipeline + Email + Deployment
- Admin image uploads (heroes + portfolio): auto-WebP, max dimensions, LANCZOS, EXIF-transpose
- `alt_text` field on heroes and portfolio; PATCH /content/page-images/{slug} for alt-only saves
- Email rebrand: `contact@rekhakrishnamurthy.com` in mock.js, legal.json (4 occurrences), backend .env `SENDER_EMAIL`
- `/health` endpoint added to FastAPI app level (port 8001) → fixes K8s deployment health check 404
