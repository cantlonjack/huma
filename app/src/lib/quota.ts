/**
 * quota.ts — SEC-02 per-user token + request quota helpers.
 *
 * Two exports:
 *   • resolveTier(userId)       → 'anonymous' | 'free' | 'operate'
 *   • checkAndIncrement(...)    → atomic RPC that reserves one slot for this
 *                                  request and returns `{ allowed, tier, ... }`.
 *
 * Blocker 6 resolution: `checkAndIncrement` accepts `inputTokens` as an
 * argument. The caller (Plan 03's route ordering) passes the accurate count
 * from `client.messages.countTokens()`. This function does NOT perform any
 * internal heuristic estimation — the 3x undercount that a `estChars/4`
 * shortcut would create is precisely what we refuse to ship.
 *
 * Plan 05c reconciliation: when a ULID `reqId` is supplied, the ledger row
 * is tagged with it so the v2-chat finally-path can later `+= output_tokens`
 * via a second write keyed on that id.
 *
 * Availability > correctness when the RPC itself is down: if Supabase returns
 * an error, we fail OPEN (allowed=true). Cost control trades for uptime here
 * — a dead ledger must not black-hole user requests. The next successful call
 * resumes enforcement.
 */

import { createAdminSupabase } from "@/lib/supabase-admin";

export type QuotaTier = "anonymous" | "free" | "operate";

export interface QuotaCheckResult {
  allowed: boolean;
  tier: QuotaTier;
  resetAt: string;
  reqCount: number;
  tokenCount: number;
  suggest?: "sign_in" | "upgrade_operate" | "wait";
}

/** Per-tier UX hint surfaced on the 429 response body. */
function suggestFor(tier: QuotaTier): QuotaCheckResult["suggest"] {
  if (tier === "anonymous") return "sign_in";
  if (tier === "free") return "upgrade_operate";
  return "wait";
}

/**
 * Resolve tier from Supabase auth + subscriptions. Server-only.
 *
 * Priority:
 *   1. Anonymous user (auth.users.is_anonymous = true)  → 'anonymous'
 *   2. Active `tier='operate'` subscription              → 'operate'
 *   3. Default                                           → 'free'
 *
 * If the `subscriptions` table does not exist yet (Phase 6 ships pricing),
 * we silently fall through to 'free' — this lets Plan 02 land before PRICE-01.
 */
export async function resolveTier(userId: string): Promise<QuotaTier> {
  const admin = createAdminSupabase();
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const isAnon = Boolean(
    (userData?.user as { is_anonymous?: boolean } | undefined)?.is_anonymous,
  );
  if (isAnon) return "anonymous";

  try {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("tier, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("tier", "operate")
      .maybeSingle();
    if (sub) return "operate";
  } catch {
    /* subscriptions table may not exist yet — fall through to 'free' */
  }
  return "free";
}

/**
 * Atomically increments the ledger and checks against tier caps.
 *
 * @param userId       Supabase user id (anon or permanent)
 * @param route        API route path (e.g. '/api/v2-chat') — keyed per-route
 * @param inputTokens  Accurate prompt-token count (from Plan 03's countTokens).
 *                     No internal estimation — Blocker 6.
 * @param reqId        Optional ULID — stored on the ledger row so Plan 05c can
 *                     reconcile output_tokens post-stream.
 */
export async function checkAndIncrement(
  userId: string,
  route: string,
  inputTokens: number,
  reqId?: string,
): Promise<QuotaCheckResult> {
  const admin = createAdminSupabase();
  const { data, error } = await admin.rpc("increment_quota_and_check", {
    p_user_id: userId,
    p_route: route,
    p_input_tokens: inputTokens,
    p_req_id: reqId ?? null,
  });

  if (error) {
    console.error(
      "[quota] increment_quota_and_check failed, allowing request:",
      error.message,
    );
    // Fail open — availability beats cost correctness when the ledger is down.
    return {
      allowed: true,
      tier: "free",
      resetAt: new Date(Date.now() + 86_400_000).toISOString(),
      reqCount: 0,
      tokenCount: 0,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const tier = (row?.tier as QuotaTier) ?? "free";
  const resetRaw = row?.reset_at;
  const resetAt =
    typeof resetRaw === "string"
      ? resetRaw
      : resetRaw instanceof Date
        ? resetRaw.toISOString()
        : new Date(resetRaw ?? Date.now() + 86_400_000).toISOString();

  return {
    allowed: Boolean(row?.allowed),
    tier,
    resetAt,
    reqCount: Number(row?.req_count ?? 0),
    tokenCount: Number(row?.token_count ?? 0),
    suggest: suggestFor(tier),
  };
}
