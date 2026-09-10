# Auth testing notes
- Single admin seeded on startup from backend/.env (ADMIN_EMAIL / ADMIN_PASSWORD) into `users` collection with bcrypt hash ($2b$).
- Login: `curl -X POST $API/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@rekhakrishnamurthy.com","password":"Rekha@Admin2026"}'` → `{token,user}` + httpOnly cookie.
- Protected: `curl $API/api/auth/me -H "Authorization: Bearer $TOKEN"`; admin routes under /api/enquiries (GET/PATCH/DELETE) require the token.
- Brute force: 5 failed attempts per ip:email → 429 for 15 minutes (collection `login_attempts`).
- Frontend stores token in localStorage `rk_admin_token`; page `/admin`.
