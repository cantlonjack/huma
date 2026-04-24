/**
 * REGEN-05 (Plan 02-04): POST /api/sheet/fallow — Fallow day toggle.
 *
 * Body: { mark: boolean, date: YYYY-MM-DD } — symmetric shape.
 *   - mark:true  → add `date` to huma_context.fallowDays (idempotent)
 *   - mark:false → remove `date` from fallowDays, but ONLY if date === today
 *     (same-day undo). Post-midnight unmark attempts return 409 FALLOW_FROZEN.
 *
 * The route only touches `contexts.huma_context`. It NEVER touches
 * `sheet_entries` or `behavior_log` — this preserves mid-day checkoffs
 * (truth-respecting design: declaring Fallow mid-day doesn't erase the work
 * already done today). The check-route guard (same plan) rejects NEW
 * checkoffs on fallow days via 409 FALLOW_DAY.
 *
 * Conventions (Phase 1 + Plan 02-02 dormancy template):
 *  - parseBody + Zod schema (sheetFallowSchema)
 *  - withObservability wrapper (structured log via the wrapper)
 *  - requireUser() — anonymous sessions are first-class operators
 *  - apiError helpers for all error paths
 *
 * Audit log: emits a supplementary structured console.log with
 * action:"mark_fallow"|"unmark_fallow" + date so Vercel stdout captures
 * the toggle alongside withObservability's tokens/latency wrapper.
 */

import { withObservability } from "@/lib/observability";
import { requireUser } from "@/lib/auth-guard";
import { createServerSupabase } from "@/lib/supabase-server";
import { parseBody } from "@/lib/schemas/parse";
import { sheetFallowSchema } from "@/lib/schemas";
import { unauthorized, internalError, apiError } from "@/lib/api-error";
import {
  addFallowDay,
  removeFallowDay,
  isFrozenAfterMidnight,
} from "@/lib/fallow";
import { getLocalDate } from "@/lib/date-utils";

/**
 * Plan-level error codes ("FALLOW_FROZEN", "FALLOW_DAY") live outside the
 * Phase 1 apiError code union — adding them to that union would expand the
 * app-wide error contract beyond this plan's scope. Return ad-hoc bodies via
 * Response.json with { error, code, status } so the route tests (which grep
 * `body.code === "FALLOW_FROZEN"`) pass without touching api-error.ts.
 */
function fallowErrorResponse(
  message: string,
  code: "FALLOW_FROZEN" | "FALLOW_DAY",
  status: 409,
): Response {
  return Response.json({ error: message, code }, { status });
}

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/sheet/fallow",
    "user",
    () => null,
    async (obs) => {
      // Auth gate — anonymous sessions are first-class operators.
      const auth = await requireUser(request);
      if ("error" in auth && auth.error) return auth.error;
      const { ctx } = auth;
      const user = ctx.user;
      if (!user) return unauthorized("Sign in required.");
      obs.setUserId(user.id);

      // Parse + validate body.
      const parsed = await parseBody(request, sheetFallowSchema);
      if (parsed.error) return parsed.error;
      const { mark, date } = parsed.data;

      // Same-day-only unmark: past fallow marks are frozen after midnight.
      // Marking is implicitly today-only at the UI layer (button only shown
      // for today), but the schema doesn't enforce it — the route ensures
      // unmark specifically cannot rewrite history.
      const today = getLocalDate();
      if (!mark && isFrozenAfterMidnight(date, today)) {
        return fallowErrorResponse(
          "Fallow marks are frozen after midnight.",
          "FALLOW_FROZEN",
          409,
        );
      }

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

      const currentHC = ((ctxRow as { huma_context?: Record<string, unknown> })
        .huma_context ?? {}) as Record<string, unknown>;

      // Pure helpers — no mutation of the loaded row; returns a new object.
      const nextHC = mark
        ? addFallowDay(currentHC, date)
        : removeFallowDay(currentHC, date);

      const { error: saveErr } = await supabase
        .from("contexts")
        .update({ huma_context: nextHC })
        .eq("id", (ctxRow as { id: string }).id);

      if (saveErr) {
        return internalError("Failed to persist fallow state.");
      }

      // Audit log — supplementary to withObservability's wrapping emission.
      // Carries the action so per-operator "when did they mark fallow" queries
      // are answerable from stdout without a DB round-trip. Mirrors the
      // dormancy route's pattern (Plan 02-02).
      console.log(
        JSON.stringify({
          req_id: obs.reqId,
          user_id: user.id,
          route: "/api/sheet/fallow",
          action: mark ? "mark_fallow" : "unmark_fallow",
          date,
          source: "user",
          status: 200,
        }),
      );

      return Response.json({
        ok: true,
        fallowDays:
          (nextHC as { fallowDays?: string[] }).fallowDays ?? [],
      });
    },
  );
}
