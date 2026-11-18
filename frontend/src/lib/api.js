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
const request = async (method, url, data, config = {}) => {
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
    else if (type.includes("json")) out = await res.json().catch(() => null);
    else out = await res.text().catch(() => "");
  }
  const response = { data: out, status: res.status, headers: res.headers };
  if (!res.ok) throw new ApiError(`Request failed with status code ${res.status}`, response);
  return response;
};
export const api = {
  get: (url, config) => request("GET", url, undefined, config),
  delete: (url, config) => request("DELETE", url, undefined, config),
  post: (url, data, config) => request("POST", url, data, config),
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
