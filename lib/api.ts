import type { ApiError } from "./types";
import { ApiRequestError, makeApiError } from "./errors";
import { mockRequest } from "./mockApi";
import { setMockModeActive } from "./mockMode";

export { ApiRequestError };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    // Backend unreachable (network error) — fall back to local demo data so the
    // UI keeps working with data even without the Spring Boot API running.
    setMockModeActive();
    return mockRequest<T>(options?.method ?? "GET", path, options?.body);
  }

  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = await response.json();
    } catch {
      apiError = makeApiError(response.status, "Erro", `Erro inesperado (HTTP ${response.status}).`);
    }
    throw new ApiRequestError(apiError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const apiDelete = (path: string) => request<void>(path, { method: "DELETE" });

export function fileDownloadUrl(path: string): string {
  return `${API_URL}${path}`;
}

/**
 * Downloads a file from the API. Falls back to generating the same content from
 * local demo data (via `mockContent`) when the backend is unreachable, so exports
 * keep working in demo mode too.
 */
export async function downloadFile(path: string, filename: string, mockContent: () => string, mimeType: string) {
  let blob: Blob;

  try {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) throw new Error("download failed");
    blob = await response.blob();
  } catch {
    setMockModeActive();
    blob = new Blob([mockContent()], { type: mimeType });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
