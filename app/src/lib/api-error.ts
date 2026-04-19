/** Standardized API error response shape for all HUMA API routes */

export interface ApiErrorBody {
  error: string;
  code:
    | "RATE_LIMITED"
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "SERVICE_UNAVAILABLE"
    | "INTERNAL_ERROR"
    | "PAYLOAD_TOO_LARGE";
  /** Optional: current user tier — set by rate-limit/quota responses (Plan 02). */
  tier?: "anonymous" | "free" | "operate";
  /** Optional: ISO timestamp when the current limit window resets. */
  resetAt?: string;
  /** Optional: downstream UI hint for what action should be suggested. */
  suggest?: "sign_in" | "upgrade_operate" | "wait" | "shorten_thread";
}

export function apiError(
  message: string,
  code: ApiErrorBody["code"],
  status: number,
  extra?: Pick<ApiErrorBody, "tier" | "resetAt" | "suggest">,
): Response {
  const body: ApiErrorBody = { error: message, code, ...extra };
  return Response.json(body, { status });
}

export function rateLimited(): Response {
  return apiError("Too many requests. Try again in a minute.", "RATE_LIMITED", 429);
}

export function badRequest(message = "Invalid request."): Response {
  return apiError(message, "BAD_REQUEST", 400);
}

export function unauthorized(message = "Authentication required."): Response {
  return apiError(message, "UNAUTHORIZED", 401);
}

export function serviceUnavailable(message = "Service temporarily unavailable."): Response {
  return apiError(message, "SERVICE_UNAVAILABLE", 503);
}

export function internalError(message = "Something went wrong."): Response {
  return apiError(message, "INTERNAL_ERROR", 500);
}
