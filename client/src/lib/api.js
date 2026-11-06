import axios from "axios";

// Single source of truth for the backend base URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Shared axios instance. Use this everywhere instead of importing axios directly
// so base URL, credentials, auth token and error handling stay consistent.
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const FAILOVER_URL_KEY = "orbit.activeApiUrl";
const normalizeUrl = (url) => (typeof url === "string" ? url.replace(/\/+$/, "") : "");
const rememberActiveUrl = (url) => {
  const normalized = normalizeUrl(url);
  if (normalized) {
    localStorage.setItem(FAILOVER_URL_KEY, normalized);
    api.defaults.baseURL = normalized;
  }
  return normalized;
};

const savedFailoverUrl = normalizeUrl(localStorage.getItem(FAILOVER_URL_KEY));
if (savedFailoverUrl) api.defaults.baseURL = savedFailoverUrl;

// Attach the auth token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Routes where a 401 is expected and should NOT trigger a forced logout/redirect.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/oauth/callback",
];

// On an unauthenticated response for a protected page, clear the session and
// send the user back to login. Keeps auth handling in one place.
api.interceptors.response.use(
  (response) => {
    const activeUrl = normalizeUrl(response.headers?.["x-orbit-active-url"]);
    rememberActiveUrl(activeUrl);
    return response;
  },
  (error) => {
    const active = error.response?.data?.active;
    const activeUrl = normalizeUrl(active?.url || error.response?.headers?.["x-orbit-active-url"]);
    const request = error.config;
    if (error.response?.status === 503 && error.response?.data?.code === "SERVER_FULL"
      && activeUrl && !request?._failoverAttempt) {
      rememberActiveUrl(activeUrl);
      return api({ ...request, baseURL: activeUrl, _failoverAttempt: true });
    }
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
