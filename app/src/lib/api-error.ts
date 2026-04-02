/** Standardized API error response shape for all HUMA API routes */

export interface ApiErrorBody {
  error: string;
  code: "RATE_LIMITED" | "BAD_REQUEST" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR";
}

export function apiError(
  message: string,
  code: ApiErrorBody["code"],
  status: number,
): Response {
  const body: ApiErrorBody = { error: message, code };
  return Response.json(body, { status });
}

export function rateLimited(): Response {
  return apiError("Too many requests. Try again in a minute.", "RATE_LIMITED", 429);
}

export function badRequest(message = "Invalid request."): Response {
  return apiError(message, "BAD_REQUEST", 400);
}

export function serviceUnavailable(message = "Service temporarily unavailable."): Response {
  return apiError(message, "SERVICE_UNAVAILABLE", 503);
}

export function internalError(message = "Something went wrong."): Response {
  return apiError(message, "INTERNAL_ERROR", 500);
}
