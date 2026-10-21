import axios from "axios";

// Single source of truth for the backend base URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Shared axios instance. Use this everywhere instead of importing axios directly
// so base URL, credentials, auth token and error handling stay consistent.
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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
  (response) => response,
  (error) => {
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
