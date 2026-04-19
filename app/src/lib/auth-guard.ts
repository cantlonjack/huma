import { createServerSupabase } from "@/lib/supabase-server";
import { unauthorized } from "@/lib/api-error";

/**
 * Tag indicating where the request originated for observability/logging.
 * - "user": authenticated Supabase session (anon or permanent)
 * - "cron": CRON_SECRET bearer token bypass (scheduled jobs)
 * - "system": pre-flag-flip shim — no session but gate disabled
 */
export type LogSource = "user" | "cron" | "system";

export interface AuthContext {
  user: {
    id: string;
    is_anonymous: boolean;
    email?: string | null;
  } | null;
  isCron: boolean;
  source: LogSource;
}

/**
 * Gate a route behind Supabase auth with CRON_SECRET bypass.
 *
 * Behavior by case:
 * 1. `Authorization: Bearer ${CRON_SECRET}` → ctx with isCron:true, source:"cron"
 * 2. Valid Supabase session → ctx with user, source:"user"
 * 3. No session + PHASE_1_GATE_ENABLED=true → 401 Response
 * 4. No session + PHASE_1_GATE_ENABLED≠"true" → ctx with user:null, source:"system"
 *    (pre-enablement shim — lets Plan 07 flip the flag later without breaking
 *    callers. source:"system" keeps observability dashboards clean.)
 *
 * @returns `{ ctx }` for success (call continues) or `{ error }` for 401 (return it).
 */
export async function requireUser(
  request: Request,
): Promise<{ ctx: AuthContext; error?: never } | { ctx?: never; error: Response }> {
  // 1. CRON_SECRET short-circuit — always allowed when matching.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { ctx: { user: null, isCron: true, source: "cron" } };
  }

  // 2. Feature flag escape hatch. While PHASE_1_GATE_ENABLED is not "true"
  //    (pre-rollout window), we let traffic through tagged source:"system".
  //    This branch becomes unreachable in production after Plan 07 flips the
  //    flag. Observability logs (Plan 05a) filter source:"user" so these
  //    system-tagged entries don't pollute per-operator analytics.
  const gateEnabled = process.env.PHASE_1_GATE_ENABLED === "true";

  // 3. Supabase session check.
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!gateEnabled) {
      // Pre-enablement shim — tag as "system" not "user" for clean dashboards.
      return { ctx: { user: null, isCron: false, source: "system" } };
    }
    return { error: unauthorized("Sign in required.") };
  }

  return {
    ctx: {
      user: {
        id: user.id,
        is_anonymous: Boolean((user as { is_anonymous?: boolean }).is_anonymous),
        email: user.email ?? null,
      },
      isCron: false,
      source: "user",
    },
  };
}
