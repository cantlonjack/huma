/**
 * REGEN-02 (Plan 02-02): POST /api/operator/dormancy — Dormancy toggle.
 *
 * Single endpoint, single body field: { enable: boolean }.
 *  - enable:true  → huma_context.dormant = { active:true, since: new Date().toISOString() }
 *  - enable:false → huma_context.dormant.active = false; `since` preserved intact
 *    (analytics can still compute rest duration from the preserved ISO).
 *
 * The route only touches `contexts.huma_context`. It NEVER touches
 * `sheet_entries` or `behavior_log` — this preserves mid-day checkoffs
 * (truth-respecting design: declaring Dormancy now doesn't erase the work
 * already done today). The route-test asserts this invariant by mocking
 * .from() and verifying the only table touched is `contexts`.
 *
 * Conventions (Phase 1):
 *  - parseBody + Zod schema (operatorDormancySchema)
 *  - withObservability wrapper (structured log via the wrapper)
 *  - requireUser() — anonymous sessions ARE first-class operators
 *  - apiError helpers for all error paths
 *
 * Audit log: emits a supplementary structured console.log with
 * action:"enable"|"disable" so the Vercel stdout trail captures the toggle
 * in addition to withObservability's tokens/latency wrapper.
 */

import { withObservability } from "@/lib/observability";
import { requireUser } from "@/lib/auth-guard";
import { createServerSupabase } from "@/lib/supabase-server";
import { parseBody } from "@/lib/schemas/parse";
import { operatorDormancySchema } from "@/lib/schemas";
import { unauthorized, internalError, apiError } from "@/lib/api-error";

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/operator/dormancy",
    "user",
    () => null,
    async (obs) => {
      // Auth gate — requireUser returns { ctx } | { error: Response }.
      // Anonymous sessions pass through; they're first-class operators.
      const auth = await requireUser(request);
      if ("error" in auth && auth.error) return auth.error;
      const { ctx } = auth;
      const user = ctx.user;
      if (!user) return unauthorized("Sign in required.");
      obs.setUserId(user.id);

      // Parse + validate body.
      const parsed = await parseBody(request, operatorDormancySchema);
      if (parsed.error) return parsed.error;
      const { enable } = parsed.data;

      const supabase = await createServerSupabase();

      // Load the operator's most recent context row.
      const { data: ctxRow, error: loadErr } = await supabase
        .from("contexts")
        .select("id, huma_context")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (loadErr || !ctxRow) {
        return apiError("Context not found.", "BAD_REQUEST", 404);
      }

      const currentHC = (ctxRow.huma_context ?? {}) as Record<string, unknown>;
      const currentDormant = currentHC.dormant as
        | { active?: boolean; since?: string }
        | undefined;

      // Preserve `since` on disable (analytics can compute rest duration).
      // Set a new ISO on enable (fresh Dormancy window).
      const nextDormant = {
        active: enable,
        since: enable
          ? new Date().toISOString()
          : currentDormant?.since ?? new Date().toISOString(),
      };

      const nextHC = { ...currentHC, dormant: nextDormant };

      const { error: saveErr } = await supabase
        .from("contexts")
        .update({ huma_context: nextHC })
        .eq("id", (ctxRow as { id: string }).id);

      if (saveErr) {
        return internalError("Failed to persist dormancy state.");
      }

      // Audit log — supplementary to withObservability's wrapping emission.
      // Carries the action so per-operator "when did they toggle" queries
      // are answerable from stdout without a DB round-trip.
      console.log(
        JSON.stringify({
          req_id: obs.reqId,
          user_id: user.id,
          route: "/api/operator/dormancy",
          action: enable ? "enable" : "disable",
          source: "user",
          status: 200,
        }),
      );

      return Response.json({ ok: true, active: enable });
    },
  );
}
