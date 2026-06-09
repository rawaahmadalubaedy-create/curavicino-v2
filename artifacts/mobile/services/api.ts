import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/* ─── Base URL ─────────────────────────────────────────────────────────────── */
/* The backend is always reached over the public Replit domain (injected at bundle
   time by the Expo dev/build scripts as EXPO_PUBLIC_DOMAIN). We never fall back to
   localhost — a device or web client cannot resolve the server's localhost, which
   previously caused every request to fail silently into mock/demo mode. */
function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) {
    throw new Error(
      "EXPO_PUBLIC_DOMAIN is not set. The mobile app cannot determine the API URL. " +
        "Ensure the Expo workflow injects EXPO_PUBLIC_DOMAIN (it is wired by the dev/build scripts)."
    );
  }
  return `https://${domain}/api`;
}

export const API_BASE = getBaseUrl();

/* ─── Token Storage ─────────────────────────────────────────────────────────── */
const ACCESS_KEY = "cv_access_token";
const REFRESH_KEY = "cv_refresh_token";

export const TokenStore = {
  async getAccess(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_KEY);
  },
  async setAccess(t: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_KEY, t);
  },
  async getRefresh(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async setRefresh(t: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_KEY, t);
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },
};

/* ─── Core Fetch ─────────────────────────────────────────────────────────────── */
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface FetchOptions {
  method?: Method;
  body?: unknown;
  auth?: boolean;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await TokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    await TokenStore.setAccess(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true, retries = 1 } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (auth) {
    let token = await TokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  /* Token expired → refresh once and retry */
  if (res.status === 401 && retries > 0) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, retries: retries - 1 });
    }
    await TokenStore.clear();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = undefined;
    }
    const message =
      (errorBody as any)?.error ??
      (errorBody as any)?.message ??
      `HTTP ${res.status}`;
    throw new ApiError(res.status, message, errorBody);
  }

  /* 204 No Content */
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
export const api; }