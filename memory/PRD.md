# PRD — Rekha Krishnamurthy · Bridal Makeup Artist Portfolio

## Original Problem Statement
Bridal makeup artist portfolio + CMS for Rekha Krishnamurthy (Bangalore). React/Tailwind frontend, FastAPI/MongoDB backend. Requirements: SEO landing pages, CMS-driven content, automated image optimization (WebP/EXIF), blog publishing, mobile optimizations, static pre-rendering.

## Core User Requests
- Cream/blush palette, pink `#E62E6B` accents, logo in header+footer
- 54+ SEO pages (service, location, academy, blog) with unique meta/schema per page
- Admin CMS: page heroes, portfolio, pricing, blog, availability, brochures, batches
- Mobile-first: sticky MobileBookBar, compact CTAs, static hero image on mobile
- Email notifications via Resend; contact email `contact@rekhakrishnamurthy.com`

## Architecture

### Stack
- **Frontend**: React 19, Tailwind CSS, framer-motion, react-router, Shadcn UI, axios
- **Backend**: FastAPI + Motor (MongoDB), Pydantic v2, Resend, Pillow (image processing)
- **SEO build**: `scripts/inject-seo.js` (Cheerio, no headless browser) — runs as `postbuild` hook

### Key Directories
- `frontend/src/components/` — all UI sections
- `frontend/src/content/` — `pages.json` (54 routes + SEO meta), `site.js` (service/location/blog data), `legal.json`, `pageBodies.js` (rich CMS content)
- `frontend/src/mock/mock.js` — brand constants (phone, email, socials, pricing)
- `frontend/src/pages/` — route-level page components
- `frontend/scripts/inject-seo.js` — build-time static SEO tag injection
- `backend/server.py` — FastAPI app + routers
- `backend/alerts.py` — Resend email alerts
- `backend/blog.py` — Blog CMS + sitemap generation
- `backend/images.py` — WebP conversion + EXIF fix

### MongoDB Collections
`users`, `enquiries`, `login_attempts`, `page_images`, `portfolio`, `blogs`, `services`, `pricing`, `availability`, `course_batches`, `brochure_leads`, `showcase`

### Key API Endpoints
- `GET /health` — K8s health check (port 8001, NOT under /api)
- `GET /api/blog` — public blog listing
- `GET /api/sitemap.xml` — dynamic sitemap
- `GET /api/content/page-images` — hero images
- `POST /api/enquiries` — public contact form
- `POST /api/brochure/request` — PDF brochure generation

### Environment Variables
- `frontend/.env`: `REACT_APP_BACKEND_URL`
- `backend/.env`: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `EMERGENT_LLM_KEY`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `ALERT_TO_EMAIL`, `SENDER_EMAIL`

### Credentials
See `/app/memory/test_credentials.md`

## Important Technical Notes
- **No headless browsers** (Puppeteer/Playwright) — Alpine/ARM64 incompatible. Use Cheerio only.
- `inject-seo.js` always fetches blog posts from `http://localhost:8001/api/blog` (not external URL) at build time.
- `SENDER_EMAIL=contact@rekhakrishnamurthy.com` — requires Resend DNS domain verification to deliver.
- Hero images processed: max 1920px, WebP ≤220KB, LANCZOS resampling, EXIF-transpose applied.
- Portfolio images: max 1800px, WebP ≤200KB.
- `camera-controls` pinned to `3.1.0` in `package.json` resolutions (Node 20 compat).
