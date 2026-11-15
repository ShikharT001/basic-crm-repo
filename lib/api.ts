import Cookies from "js-cookie";
import { PaginationMeta, ResponseEnvelope } from "@/types/crm";

export const TOKEN_COOKIE_KEY = "crm_access_token";
export const USER_COOKIE_KEY = "crm_user_profile";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1/crm";

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

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = Cookies.get(TOKEN_COOKIE_KEY);

  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    ...restOptions,
    headers: mergedHeaders,
  });

  // Handle Unauthorized (401)
  if (response.status === 401) {
    Cookies.remove(TOKEN_COOKIE_KEY);
    Cookies.remove(USER_COOKIE_KEY);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?expired=true`;
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text };
  }

  if (!response.ok) {
    // Check if error comes as FastAPI detail
    let errorMsg = "An error occurred with the request.";
    if (json?.detail) {
      if (typeof json.detail === "string") {
        errorMsg = json.detail;
      } else if (Array.isArray(json.detail)) {
        errorMsg = json.detail.map((err: any) => err.msg || JSON.stringify(err)).join("; ");
      }
    } else if (json?.message) {
      errorMsg = json.message;
    }
    throw new ApiError(errorMsg, response.status, json);
  }

  // Handle backend envelope unwrap
  if (json && typeof json === "object" && "success" in json) {
    const env = json as ResponseEnvelope<T>;
    return {
      data: env.data,
      message: env.message || "Operation successful",
      meta: env.meta,
    };
  }

  // Fallback for direct responses
  return {
    data: json as T,
    message: "Operation successful",
  };
}

export const api = {
  get: <T>(url: string, params?: RequestOptions["params"]) =>
    apiClient<T>(url, { method: "GET", params }),
  post: <T>(url: string, body?: unknown, params?: RequestOptions["params"]) =>
    apiClient<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  put: <T>(url: string, body?: unknown, params?: RequestOptions["params"]) =>
    apiClient<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  patch: <T>(url: string, body?: unknown, params?: RequestOptions["params"]) =>
    apiClient<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  delete: <T>(url: string, params?: RequestOptions["params"]) =>
    apiClient<T>(url, { method: "DELETE", params }),
};
