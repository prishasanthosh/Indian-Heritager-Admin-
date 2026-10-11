import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "https://heritager-backend.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Access tokens are short-lived (15 min). On a 401 we try one silent refresh
// (using the httpOnly refresh cookie) and replay the original request.
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true;
      try {
        refreshPromise ??= api.post("/auth/refresh").then(() => undefined).finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(original);
      } catch {
        // fall through to reject with the original error
      }
    }
    return Promise.reject(error);
  }
);

export type ApiErrorShape = { message: string };

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as ApiErrorShape | undefined)?.message ?? fallback;
  }
  return fallback;
}
