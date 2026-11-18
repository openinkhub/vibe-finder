const express = require("express");
const { getDb, HttpError, ah, nowIso } = require("../lib/core");
const { bcrypt, createAccessToken, currentUser } = require("../lib/auth");

const router = express.Router();

router.post("/auth/login", ah(async (req, res) => {
  const db = getDb();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) throw new HttpError(422, "Email and password are required");
  const ident = `${req.ip || "x"}:${email}`;
  const now = new Date();
  const attempt = await db.collection("login_attempts").findOne({ identifier: ident });
  if (attempt && (attempt.count || 0) >= 5) {
    const lockedUntil = new Date(new Date(attempt.last).getTime() + 15 * 60 * 1000);
    if (now < lockedUntil) throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
  }
  const user = await db.collection("users").findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    await db.collection("login_attempts").updateOne({ identifier: ident }, { $inc: { count: 1 }, $set: { last: now.toISOString() } }, { upsert: true });
    throw new HttpError(401, "Invalid email or password");
  }
  await db.collection("login_attempts").deleteOne({ identifier: ident });
  const token = createAccessToken(email);
  res.cookie("access_token", token, { httpOnly: true, secure: req.secure || process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 43200 * 1000, path: "/" });
  res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
}));

router.get("/auth/me", ah(async (req, res) => res.json(await currentUser(req))));

router.post("/auth/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.json({ ok: true });
});

module.exports = router;
