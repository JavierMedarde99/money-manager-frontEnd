import axios from "axios";
import { emitUnauthorized } from "@/lib/authEvents";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Distinguish "my session expired" from "wrong credentials": only the
      // requests that were made with an active token (and aren't login/register)
      // should trigger the "session expired" notice.
      const config = error.config ?? {};
      const url = String(config.url ?? "");
      const method = String(config.method ?? "").toLowerCase();
      const isCredentialAttempt =
        url.endsWith("/user/login") ||
        (method === "post" && url.endsWith("/user"));
      const hadSession = !!localStorage.getItem("token");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (hadSession && !isCredentialAttempt) {
        // Expired/invalid bearer token: notify the app so the auth store can
        // log out (ProtectedRoute navigates to /login) and Login can show a
        // "session expired" message instead of a silent reload.
        emitUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
