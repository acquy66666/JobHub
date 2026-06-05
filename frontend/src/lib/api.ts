import axios, { AxiosError } from "axios";
import { useAuthStore, AuthUser } from "@/store/authStore";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach accessToken from Zustand store on every request.
// Import lazily to avoid SSR issues (Zustand store is client-only).
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 402) {
      const data = error.response.data as { code?: string; requiredTier?: string } | undefined;
      if (data?.code === "INSUFFICIENT_CREDITS" && typeof window !== "undefined") {
        const tier = data.requiredTier ?? "";
        if (!window.location.pathname.startsWith("/employer/billing/shop")) {
          window.location.href = `/employer/billing/shop${tier ? `?required=${tier}` : ""}`;
        }
      }
      return Promise.reject(error);
    }
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers["Authorization"] = `Bearer ${token}`;
        return api(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const res = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const data = res.data as { accessToken: string; user?: AuthUser };
      if (typeof window !== "undefined") {
        const store = useAuthStore.getState();
        if (data.user) {
          store.setAuth(data.accessToken, data.user);
        } else {
          store.setAccessToken(data.accessToken);
        }
      }
      processQueue(null, data.accessToken);
      original.headers["Authorization"] = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (typeof window !== "undefined") {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
