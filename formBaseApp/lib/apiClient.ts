/**
 * apiClient.ts
 * Robust fetch wrapper:
 * - Builds URL from ENV.API_BASE
 * - Adds Authorization (and optional apikey if present on ENV)
 * - Skips setting Content-Type for FormData (lets browser add multipart boundary)
 * - Parses response as text first; JSON-decodes only when content-type includes "json"
 * - Throws ApiError with status and a snippet of the body when unexpected content returned
 */

import { ENV } from "./env";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

function buildUrl(path: string, query?: Query) {
  const base = ENV.API_BASE.endsWith("/") ? ENV.API_BASE : ENV.API_BASE + "/";
  const rel = path.replace(/^\//, "");
  const url = new URL(rel, base);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  query?: Query
): Promise<T> {
  const url = buildUrl(path, query);

  // Optional API key support without requiring ENV.API_KEY to exist in env.ts
  const maybeApiKey = (ENV as unknown as { API_KEY?: string }).API_KEY;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${ENV.API_JWT}`,
    ...(maybeApiKey ? { apikey: maybeApiKey } : {}),
  };

  const usingFormData = isFormData(body);
  // Only set JSON Content-Type when NOT sending FormData
  if (body !== undefined && !usingFormData) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : usingFormData
          ? (body as FormData) // let browser set multipart boundary
          : JSON.stringify(body),
    });
  } catch (e) {
    throw new ApiError(`Network error: ${String(e)}`, 0);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  const raw = await res.text();
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  const parseJson = () => {
    try {
      return raw ? JSON.parse(raw) : undefined;
    } catch (e) {
      throw new ApiError(
        `Failed to parse JSON: ${String(e)}\nBody: ${raw.slice(0, 300)}`,
        res.status
      );
    }
  };

  if (!res.ok) {
    const data = ct.includes("json") ? parseJson() : undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyData = data as any;
    const msg =
      (anyData && (anyData.message || anyData.error || anyData.msg)) ||
      `${res.status} ${res.statusText} — ${raw.slice(0, 300)}`;
    throw new ApiError(String(msg), res.status, data ?? raw);
  }

  if (!raw) return undefined as unknown as T;

  if (ct.includes("json")) {
    return parseJson() as T;
  }

  if (ct.includes("text/plain")) {
    return raw as unknown as T;
  }

  // Likely HTML (SPA fallback) or unexpected content type
  throw new ApiError(
    `Expected JSON but got "${ct || "unknown"}". Body (truncated): ${raw.slice(0, 300)}`,
    res.status || 200,
    raw
  );
}

export const api = {
  get:  <T>(p: string, q?: Query)              => request<T>(p, "GET", undefined, q),
  post: <T>(p: string, b?: unknown)            => request<T>(p, "POST", b),
  patch:<T>(p: string, b?: unknown, q?: Query) => request<T>(p, "PATCH", b, q),
  del:  <T>(p: string, q?: Query)              => request<T>(p, "DELETE", undefined, q),
};

// (Optional) export for tests
export const _internals = { buildUrl, isFormData };
