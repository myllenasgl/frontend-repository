import type { ApiError } from "./types";

export class ApiRequestError extends Error {
  apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.apiError = apiError;
  }
}

export function makeApiError(
  status: number,
  error: string,
  message: string,
  details: string[] = []
): ApiError {
  return {
    timestamp: new Date().toISOString(),
    status,
    error,
    message,
    details,
  };
}
