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

/**
 * 429 response for rate-limit / quota-exhaustion.
 *
 * Two shapes, both return `code: "RATE_LIMITED"`:
 *   • `rateLimited()` — legacy zero-arg form used by the IP-throttle path in
 *     `v2-chat/route.ts` and `sheet/route.ts`. Generic "try again in a minute"
 *     copy, no tier metadata. Kept for back-compat with existing call sites.
 *   • `rateLimited({ tier, resetAt, suggest, message })` — Plan 02 overload
 *     used by `checkAndIncrement` denials. Emits tier-aware body the client's
 *     `<QuotaCard>` overlay consumes (see useMessageStream 429 intercept).
 *
 * Both emit `Retry-After: 60` so any shared client can do exponential backoff.
 */
export function rateLimited(opts?: {
  tier?: "anonymous" | "free" | "operate";
  resetAt?: string;
  suggest?: "sign_in" | "upgrade_operate" | "wait";
  message?: string;
}): Response {
  const body: ApiErrorBody = {
    error: opts?.message ?? "Too many requests. Try again in a minute.",
    code: "RATE_LIMITED",
    ...(opts?.tier ? { tier: opts.tier } : {}),
    ...(opts?.resetAt ? { resetAt: opts.resetAt } : {}),
    ...(opts?.suggest ? { suggest: opts.suggest } : {}),
  };
  return Response.json(body, { status: 429, headers: { "Retry-After": "60" } });
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
