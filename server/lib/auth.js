// JWT auth — same contract as the old FastAPI backend: httpOnly cookie `access_token`
// or `Authorization: Bearer <token>`; admin role required for content edits.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb, HttpError, ah, nowIso } = require("./core");

const secret = () => {
  if (!process.env.JWT_SECRET) throw new HttpError(500, "JWT_SECRET is not configured");
  return process.env.JWT_SECRET;
};

const createAccessToken = (email) => jwt.sign({ sub: email, email, type: "access" }, secret(), { algorithm: "HS256", expiresIn: "12h" });

async function seedAdmin() {
  const db = getDb();
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — admin account not seeded");
    return;
  }
  const existing = await db.collection("users").findOne({ email });
  if (!existing) {
    await db.collection("users").insertOne({ email, password_hash: await bcrypt.hash(password, 12), name: "Rekha", role: "admin", created_at: nowIso() });
  } else if (!(await bcrypt.compare(password, existing.password_hash))) {
    await db.collection("users").updateOne({ email }, { $set: { password_hash: await bcrypt.hash(password, 12) } });
  }
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("login_attempts").createIndex({ identifier: 1 });
}

function tokenFrom(req) {
  let token = req.cookies && req.cookies.access_token;
  if (!token) {
    const h = req.headers.authorization || "";
    if (h.startsWith("Bearer ")) token = h.slice(7);
  }
  return token;
}

async function currentUser(req) {
  const token = tokenFrom(req);
  if (!token) throw new HttpError(401, "Not authenticated");
  let payload;
  try {
    payload = jwt.verify(token, secret(), { algorithms: ["HS256"] });
  } catch (e) {
    throw new HttpError(401, e.name === "TokenExpiredError" ? "Token expired" : "Invalid token");
  }
  if (payload.type !== "access") throw new HttpError(401, "Invalid token type");
  const user = await getDb().collection("users").findOne({ email: payload.email }, { projection: { _id: 0, password_hash: 0 } });
  if (!user) throw new HttpError(401, "User not found");
  return user;
}

const requireAdmin = ah(async (req, _res, next) => {
  const user = await currentUser(req);
  if (user.role !== "admin") throw new HttpError(403, "Admin only");
  req.user = user;
  next();
});

module.exports = { bcrypt, createAccessToken, seedAdmin, currentUser, requireAdmin };
