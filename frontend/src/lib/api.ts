import type { ApiItem, ApiList } from "../types";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http:///api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4010";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.message ?? "Request failed", response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const api = {
  raw: request,
  list<T>(path: string) {
    return request<ApiList<T>>(path);
  },
  get<T>(path: string) {
    return request<ApiItem<T>>(path);
  },
  create<T>(path: string, body: unknown) {
    return request<ApiItem<T>>(path, { method: "POST", body });
  },
  update<T>(path: string, body: unknown) {
    return request<ApiItem<T>>(path, { method: "PUT", body });
  },
  remove(path: string) {
    return request<null>(path, { method: "DELETE" });
  }
};

export function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === "" ? undefined : value])
  );
}
