# PRD — Rekha Krishnamurthy · Bridal Makeup Artist Portfolio

## Original problem statement
Pixel-perfect clone of an editorial "contact-sheet" bridal makeup artist portfolio (14 sections, Playfair Display + IBM Plex Mono, user video as hero background). Frontend mock first, backend later.

## Latest user request (June 2026)
- Remove ALL black/dark colours from every section, block, card → sections cream/blush, buttons/accents pink **#E62E6B** (colour of the word "flawless").
- Uploaded logo in header + footer, linking to https://rekhakrishnamurthy.com/ (same tab).
- 3D motion everywhere: 3D hero objects (WebGL/Three.js), scroll-driven 3D objects, tilt/depth/glare hover on every card.
- 3D product viewer/configurator + AR-style preview → user chose **"Scan your face and select makeup view"** → new dedicated section after Services.
- Full 3D on desktop, lighter on mobile. Mobile-first, optimised.

## Architecture
- React 19 + Tailwind + framer-motion 11; `@react-three/fiber` 9, `@react-three/drei` 10, `three` 0.186; `@mediapipe/tasks-vision` (wasm + model served locally from `/public/mediapipe/`).
- FastAPI + MongoDB backend: template only (`/api/status`). Data still 100% MOCKED in `src/mock/mock.js`; contact form → localStorage.

### Key files
- `src/components/*.jsx` — 14 sections (all pink/cream palette, `Reveal` 3D entrance + `TiltCard` hover).
- `src/components/fx/` — `TiltCard`, `Reveal`, `HeroScene` (R3F hero), `ScrollObject` (scroll-driven R3F object: ring/brush/compact/gem).
- `src/components/studio/` — `FaceStudio` (section id=`studio`), `useFaceLandmarker`, `makeupPainter` (lips/blush/eyeshadow/liner/gloss on canvas), `StudioControls`, `LipstickViewer` (OrbitControls product viewer).
- `public/logo.png`, `public/sample-face.jpg`, `public/mediapipe/{wasm, face_landmarker.task}`, hero video assets.

## Implemented (2026-06)
- [x] Black removed everywhere; pink/cream/blush palette; logo in header/footer.
- [x] 3D hero scene, scroll-driven 3D objects (About/Process/Academy/Loyalty, desktop only), TiltCard on all cards, 3D entrance reveals.
- [x] Virtual Try-On face-scan studio (camera / upload / sample model), 5 signature looks, swatches, intensity, liner/gloss toggles, PNG download, 3D lipstick viewer.
- [x] Mobile-first pass (no horizontal overflow at 390px). Tested via testing agent (iteration_1, 95% pass; minor fixes applied).

## Backlog
- P0: Backend — enquiries API (MongoDB) + wire Contact form; portfolio/services from API.
- P1: Admin panel for enquiries.
- P2: Save/share try-on looks; WhatsApp share of look image.
