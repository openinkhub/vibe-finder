# PRD — Rekha Krishnamurthy · Bridal Makeup Artist Portfolio

## Original problem statement
Pixel-perfect clone of an editorial "contact-sheet" bridal makeup artist portfolio (14 sections, Playfair Display + IBM Plex Mono, user video as hero background). Frontend mock first, backend later.

## User requests (June 2026)
- Remove ALL black/dark colours → cream/blush sections, pink **#E62E6B** buttons/accents.
- Uploaded logo in header + footer → https://rekhakrishnamurthy.com/ (same tab).
- 3D motion: tilt/glare cards, 3D reveals, 3D lipstick product viewer. **Floating 3D objects removed on user request.**
- Virtual Try-On ("scan your face, select makeup view"): instant overlay + **Generate AI look** (photoreal, makeup only) + Before/After slider.
- Mobile-first, full 3D desktop / lighter mobile.
- Approved backlog: Enquiry backend, Share look on WhatsApp, Admin enquiries, Before/After compare — ALL DONE.

## Architecture
- Frontend: React 19, Tailwind, framer-motion, react-router (`/` landing, `/admin`), @react-three/fiber + drei (lipstick viewer only), @mediapipe/tasks-vision (wasm + model served from `/public/mediapipe/`), sonner toasts, axios (`src/lib/api.js`, Bearer token in localStorage `rk_admin_token`).
- Backend: FastAPI + Motor. `server.py` (routers), `auth.py` (JWT, bcrypt, seeded admin, brute-force lockout), `enquiries.py` (CRUD + stats, uuid ids), `studio.py` (Gemini `gemini-3.1-flash-image-preview` image edit via emergentintegrations + EMERGENT_LLM_KEY).
- Mongo collections: `users`, `enquiries`, `login_attempts`.
- Landing content (services/pricing/portfolio/testimonials/FAQ) still from `src/mock/mock.js` (MOCKED).

### Key files
- `src/components/*.jsx` sections; `src/components/fx/{TiltCard,Reveal}.jsx`
- `src/components/studio/` — FaceStudio (logic), StudioStage (canvas/compare/AI image), StudioControls, makeupPainter, useFaceLandmarker (GPU→CPU fallback, timeouts), LipstickViewer
- `src/pages/Admin.jsx`, `src/components/Contact.jsx` (POST /api/enquiries + look chip)
- `backend/.env`: MONGO_URL, DB_NAME, CORS_ORIGINS, EMERGENT_LLM_KEY, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
- Credentials: `/app/memory/test_credentials.md`

## Implemented log
- 2026-06 a: palette/logo/3D/try-on MVP (iteration_1 95%).
- 2026-06 b: try-on spinner fix, floating objects removed (iteration_2 100%).
- 2026-06 c: stronger overlay + Before/After slider, AI look generation (~10–25 s), Share (Web Share → download + WhatsApp), enquiries API + Contact wiring + "Book this look", Admin dashboard (/admin) with JWT (iteration_3: backend 15/16 → base64 400 fixed after; frontend all pass).

- 2026-06 d (iteration_3b, backend 14/14, frontend 100%): **Enquiry alerts** (in-app: seen flag, unseen badge, mark-seen, 20s polling, browser Notification opt-in; Resend email scaffolded in alerts.py — sends automatically once RESEND_API_KEY + ALERT_TO_EMAIL set in backend/.env), **Editable content** (pricing + portfolio CRUD in admin tabs; images in Emergent object storage via storage.py, served at /api/files/{path}; landing Pricing/Portfolio load from API with mock fallback), **Look gallery** (session strip of generated AI looks), **Look in enquiry** (POST /api/studio/looks uploads AI image → look_image on enquiry → thumbnail in Contact chip + admin card), **Speech-to-text booking** (VoiceEnquiry: MediaRecorder → POST /api/studio/transcribe → Whisper-1 + GPT-5.4 extraction auto-fills name/phone/email/service/date/message; source='voice' badge in admin).
- Mobile 5px overflow fixed (html/.App overflow-x clip).

- 2026-06 e (iteration_4: backend 14/14, frontend 100%): **Look Lab** section (3D porcelain head with live-painted makeup texture — Natural/Bridal/Editorial/Glam — + 3D tilt before/after portrait using 4 cached AI showcase looks via GET /api/studio/showcase), **/portfolio page** (scroll-based transformation Bare→Natural→Bridal→Editorial→Glam + mouse/tilt parallax gallery), **3D "Book Me" compact** in Contact (opens → call/WhatsApp/form), **Availability calendar** (admin marks booked date + hours or full day; public read-only calendar in Contact; enquiry date input stays normal), **WhatsApp reply** with prefilled message on admin cards, **Editable Services** admin tab (title/desc/cta/image upload), **Email alerts LIVE via Resend** → reks5555@gmail.com (sender onboarding@resend.dev). brand.whatsappUrl standardised to wa.me.

- 2026-06 f (iteration_5: frontend 100%): **Legal page** /legal (Privacy, Terms, Refund & Cancellation, Disclaimer from user's Legal_Policies.md; placeholders filled with assumptions — email reks5555@gmail.com, address "JP Nagar, Bengaluru 560078", 7-day/30-day windows; user should verify), footer Legal column + **Locations bar** (HSR Layout, JP Nagar, Jayanagar, Banashankari → location pages with the user's slugs). **New header menu** Home / About Us / Services dropdown (7 EEAT service pages from the user's E-E-A-T doc incl. author bio + FAQ) / Academy / Portfolio / Contact us (/personal-shopping) / Blog. Look Lab, Try-On, Pricing, Testimonials moved to footer Explore (hash links). Content data: `src/content/site.js`, `src/content/legal.json`; pages: `src/pages/ContentPages.jsx`, shell `src/components/PageShell.jsx`.

## Backlog
- P1: Verify legal placeholder assumptions (address, refund windows) and EEAT numbers (320+ brides, lead times) with Rekha.
- P2: Blog article pages (currently teaser cards).
- P2: Testimonials / FAQ / About copy still in mock.js — could be made editable.
- P1: Resend sender is onboarding@resend.dev (only delivers to the Resend account owner email) — add a verified domain sender for production. WhatsApp alerts (Twilio) not started.
- P2: shadcn DatePicker for event date (currently native input — fine on mobile).
