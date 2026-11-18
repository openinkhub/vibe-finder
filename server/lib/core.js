// Shared helpers: MongoDB connection, async route wrapper, HTTP errors, small validators.
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

let client;
let db;

async function connect() {
  const url = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!url) throw new Error("MONGODB_URI (or MONGO_URL) is not set");
  const c = new MongoClient(url, { serverSelectionTimeoutMS: 15000 });
  await c.connect();
  client = c;
  db = c.db(process.env.DB_NAME || "rekha");
  return db;
}

const getDb = () => {
  if (!db) throw new HttpError(503, "Database not connected");
  return db;
};

class HttpError extends Error {
  constructor(status, detail) {
    super(typeof detail === "string" ? detail : "error");
    this.status = status;
    this.detail = detail;
  }
}

// Wrap async handlers so thrown errors reach the error middleware.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

// Trim a string field to a max length (mirrors the Python `[:n]` slicing).
const cut = (v, n) => (v === undefined || v === null ? "" : String(v)).slice(0, n);

// Strip Mongo's _id from a document (or array of documents).
const clean = (d) => {
  if (Array.isArray(d)) return d.map(clean);
  if (!d) return d;
  const { _id, ...rest } = d;
  return rest;
};

// Validate a required/optional string with length bounds.
function str(body, key, { min = 0, max = 10000, required = false, def } = {}) {
  let v = body[key];
  if (v === undefined || v === null || v === "") {
    if (required) throw new HttpError(422, `${key} is required`);
    return def === undefined ? (v === "" ? "" : null) : def;
  }
  if (typeof v !== "string") v = String(v);
  if (v.length < min) throw new HttpError(422, `${key} must be at least ${min} characters`);
  if (v.length > max) throw new HttpError(422, `${key} must be at most ${max} characters`);
  return v;
}

module.exports = { connect, getDb, HttpError, ah, uuid, nowIso, cut, clean, str };
