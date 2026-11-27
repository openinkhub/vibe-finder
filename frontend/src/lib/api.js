import { sizeImagesDeep } from "./img";

// Empty REACT_APP_BACKEND_URL = same origin (API served by the same Express app).
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;
export const TOKEN_KEY = "rk_admin_token";

// Small fetch-based client with the parts of axios' interface this site uses:
// api.get(url, { params, timeout }), api.post(url, data, { responseType: "blob" }), …
// Resolves to { data, status, headers }; errors carry err.response.data.detail like axios.
class ApiError extends Error {
  constructor(message, response) { super(message); this.response = response; }
}
// The server answers 503 "Database not connected" for a few seconds after a restart (deploy).
// Retry quietly a few times before showing an error.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const request = async (method, url, data, config = {}) => {
  for (let attempt = 0; ; attempt += 1) {
    try { return await requestOnce(method, url, data, config); }
    catch (e) {
      const st = e && e.response && e.response.status;
      // 503 means the server didn't handle the request, so any method is safe to repeat.
      // Gateway/network errors are only retried for reads, so a form is never sent twice.
      const busy = st === 503 || (method === "GET" && (st === 502 || st === 504 || (!e.response && /Network error/.test(e.message))));
      if (!busy || attempt >= 3) throw e;
      await sleep(2000 * (attempt + 1));
    }
  }
};
const requestOnce = async (method, url, data, config = {}) => {
  const params = config.params ? Object.entries(config.params).filter(([, v]) => v !== undefined && v !== null) : [];
  const qs = params.length ? `?${new URLSearchParams(params).toString()}` : "";
  const headers = { ...(config.headers || {}) };
  let token = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch { /* storage blocked */ }
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (data !== undefined && data !== null) {
    if (data instanceof FormData || data instanceof Blob || typeof data === "string") body = data;
    else { body = JSON.stringify(data); headers["Content-Type"] = "application/json"; }
  }
  const ctrl = new AbortController();
  const timer = config.timeout ? setTimeout(() => ctrl.abort(), config.timeout) : null;
  let res;
  try {
    res = await fetch(`${API}${url}${qs}`, { method, headers, body, signal: ctrl.signal });
  } catch (e) {
    throw new ApiError(e && e.name === "AbortError" ? "The request took too long. Please try again." : "Network error — please check your connection.");
  } finally {
    if (timer) clearTimeout(timer);
  }
  const type = res.headers.get("content-type") || "";
  let out = null;
  if (res.status !== 204) {
    if (config.responseType === "blob" && res.ok) out = await res.blob();
    else if (type.includes("json")) out = sizeImagesDeep(await res.json().catch(() => null));
    else out = await res.text().catch(() => "");
  }
  const response = { data: out, status: res.status, headers: res.headers };
  if (!res.ok) throw new ApiError(`Request failed with status code ${res.status}`, response);
  return response;
};
export const api = {
  get: (url, config) => request("GET", url, undefined, config),
  delete: (url, config) => request("DELETE", url, undefined, config),
  post: (url, data, config) => request("POST", url, data, config).then((r) => {
    // Booking enquiries are the site's main conversion: send GA4 "generate_lead" (and to Tag Manager).
    if (url === "/enquiries") { try { const lead = { lead_source: (data && data.source) || "form", service: (data && data.service) || "", page_path: window.location.pathname }; if (window.rkTrack) window.rkTrack("generate_lead", lead); else (window.dataLayer = window.dataLayer || []).push({ event: "generate_lead", ...lead }); } catch (e) { /* ignore */ } }
    return r;
  }),
  put: (url, data, config) => request("PUT", url, data, config),
  patch: (url, data, config) => request("PATCH", url, data, config),
};

export const imgUrl = (u) => (u && u.startsWith("/api") ? `${BACKEND_URL}${u}` : u);

export const errorText = (e, fallback = "Something went wrong. Please try again.") => {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || fallback;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(" ");
  return d?.msg || String(d);
};
