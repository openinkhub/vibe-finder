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

## Backlog
- P1: Replace landing mock content with backend-managed content (services/pricing/portfolio) + admin editing.
- P1: Email alerts need RESEND_API_KEY + ALERT_TO_EMAIL from user (code ready). WhatsApp alerts (Twilio) not started.
- P2: shadcn DatePicker for event date (currently native input — fine on mobile).
