# Deploying to Hostinger (Node.js Web App)

The site is one Node.js app: `server.js` (Express) serves the API under `/api` and the
built React site from `frontend/build`. It replaces the old Python/FastAPI backend that ran on Emergent.

## 1. Database — MongoDB Atlas
1. Create a free M0 cluster in MongoDB Atlas and a database user.
2. Network Access → allow `0.0.0.0/0` (Hostinger's outgoing IP isn't fixed on shared plans).
3. Import the exported data (`db/*.json` from `rekha-db-export-2026-11-19.zip`) into database `rekha`,
   one collection per file, same name as the file (e.g. `blog_posts.json` → `blog_posts`).
   MongoDB Compass → connect → create database `rekha` → Add Data → Import JSON file.

## 2. Images
Set `FILES_FALLBACK_ORIGIN=https://rekhakrishnamurthy.com` while the old site is still live.
On start the app copies every image the database refers to into `~/rekha-uploads/rekha-makeup/...`
(and fetches any missing image on first request). Check the app log for
`Image sync ... copied`. After go-live, remove the variable.

Manual alternative: upload the zip's `images/rekha-makeup` folder to `~/rekha-uploads/`.
If you use a different folder, set `UPLOAD_DIR` to its full path.

## 3. Create the Web App
hPanel → Websites → Add Website → **Node.js Web App** → Connect GitHub → `openinkhub/vibe-finder`.

| Setting | Value |
|---|---|
| Branch | `hostinger` (switch to `main` after go-live) |
| Framework preset | Express (or Other) |
| Node.js version | 22 |
| Build command | `npm run build` |
| Entry file | `server.js` |
| Output directory | leave empty |

Add the environment variables from `.env.example`, then deploy.
Use the temporary domain Hostinger gives you for testing.

## 4. Trial checklist (on the temporary domain)
- Home, service, academy and blog pages load with images
- `/admin` login works; edit a price, upload a portfolio image, add a blog post
- Enquiry form submits and the alert email arrives (needs Resend vars)
- Brochure download works
- `/sitemap.xml` lists blog posts

## 5. Go live
1. Merge `hostinger` into `main` and switch the Web App branch to `main`.
2. Point `rekhakrishnamurthy.com` at Hostinger (DNS), keep the Resend DNS records.
3. Keep Emergent running a few days as a fallback, then cancel it.

## Notes
- Every push to the connected branch redeploys automatically.
- Face Studio (AI try-on) and voice enquiry need `GEMINI_API_KEY` / `OPENAI_API_KEY`;
  without them those two features show a friendly "not available" message.
- Local run: `npm install && npm run build && cp .env.example .env` (fill it in) `&& npm start`.
