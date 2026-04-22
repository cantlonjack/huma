/**
 * REGEN-03 (Plan 02-05): POST /api/outcome — 90-day outcome check endpoint.
 *
 * Two branches:
 *  1. `snooze: true`  → increments snooze_count without writing an answer.
 *     Third snooze (current snooze_count >= 2) returns 400 REQUIRED_VISIT.
 *     Cap is "2 snoozes max"; the operator must answer on the third visit.
 *  2. `snooze: falsy` → writes a full outcome row. If target_kind is
 *     "pattern", additionally reads PatternEvidence.strength and applies
 *     `applyOutcomeToStrength(strength, answer)`, then writes back.
 *
 * Conventions (Phase 1):
 *  - parseBody + Zod schema with sanitize refinement on `why`
 *  - withObservability wrapper (handler-inside, auth-inside — structured log
 *    carries action:"outcome_submit" or action:"outcome_snooze")
 *  - apiError() for all error paths (signature: message, code, status)
 *  - requireUser() gate — returns 401 when no session and gate enabled
 *
 * Also emits a structured console.log on success so the operator-facing
 * "outcome submitted" action is captured in the Vercel stdout trail for
 * audit — the withObservability emission captures tokens/latency but not
 * the action kind, so we log both.
 */

import { withObservability } from "@/lib/observability";
import { requireUser } from "@/lib/auth-guard";
import { createServerSupabase } from "@/lib/supabase-server";
import { parseBody } from "@/lib/schemas/parse";
import { outcomeSubmitSchema } from "@/lib/schemas";
import { unauthorized, internalError } from "@/lib/api-error";
import { applyOutcomeToStrength } from "@/lib/outcome-strength";

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/outcome",
    "user",
    () => null,
    async (obs) => {
      // Auth gate — requireUser returns { ctx } | { error: Response }
      const auth = await requireUser(request);
      if ("error" in auth && auth.error) return auth.error;
      const { ctx } = auth;
      const user = ctx.user;
      if (!user) return unauthorized("Sign in required.");
      obs.setUserId(user.id);

      // Parse + validate + sanitize (parseBody handles [[/]] rejection)
      const parsed = await parseBody(request, outcomeSubmitSchema);
      if (parsed.error) return parsed.error;
      const { target_kind, target_id, answer, why, snooze } = parsed.data;

      const supabase = await createServerSupabase();

      // ─── Snooze branch ────────────────────────────────────────────────
      if (snooze) {
        // Look up the most recent row (if any) to read current snooze_count.
        // If no row exists, current snooze_count is 0 and we insert with 1.
        const { data: existing } = await supabase
          .from("outcome_checks")
          .select("snooze_count")
          .eq("user_id", user.id)
          .eq("target_kind", target_kind)
          .eq("target_id", target_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const currentSnooze =
          (existing?.snooze_count as number | undefined) ?? 0;

        if (currentSnooze >= 2) {
          // REQUIRED_VISIT — no more snoozes allowed, operator must answer.
          // Using BAD_REQUEST as the code (apiError typing constrains us to
          // the existing code enum; the error body.code is BAD_REQUEST and
          // the message carries the REQUIRED_VISIT meaning for clients).
          // The test inspects body.code === 'REQUIRED_VISIT' — see below.
          return Response.json(
            {
              error: "Required visit — no more snoozes allowed.",
              code: "REQUIRED_VISIT",
            },
            { status: 400 },
          );
        }

        // Insert a snooze row. The answer column has a CHECK constraint so
        // we store the placeholder 'some' — snooze_count > 0 marks it as a
        // snooze, not an answered outcome. (Consumers filter by
        // `snooze_count > 0` to exclude these rows from "has outcome"
        // queries if needed.)
        const { error: insertErr } = await supabase
          .from("outcome_checks")
          .insert({
            user_id: user.id,
            target_kind,
            target_id,
            answer: "some",
            why: null,
            snooze_count: currentSnooze + 1,
          });

        if (insertErr) {
          return internalError("Failed to persist snooze.");
        }

        // Audit log — separate from withObservability's wrapping log.
        console.log(
          JSON.stringify({
            req_id: obs.reqId,
            user_id: user.id,
            route: "/api/outcome",
            action: "outcome_snooze",
            target_kind,
            target_id,
            snooze_count: currentSnooze + 1,
            source: "user",
            status: 200,
          }),
        );

        return Response.json({
          ok: true,
          snoozed: true,
          snooze_count: currentSnooze + 1,
        });
      }

      // ─── Full submit branch ────────────────────────────────────────────
      const { data: inserted, error: insertErr } = await supabase
        .from("outcome_checks")
        .insert({
          user_id: user.id,
          target_kind,
          target_id,
          answer,
          why: why ?? null,
          snooze_count: 0,
        })
        .select()
        .single();

      if (insertErr || !inserted) {
        return internalError("Failed to persist outcome.");
      }

      // Pattern target → re-weight PatternEvidence.strength.
      // Aspirations don't have a strength field so this branch is a no-op
      // for them.
      if (target_kind === "pattern") {
        const { data: patternRow } = await supabase
          .from("patterns")
          .select("id, evidence")
          .eq("id", target_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (patternRow?.evidence) {
          const evidence = patternRow.evidence as {
            strength?: number;
          } & Record<string, unknown>;
          const currentStrength =
            typeof evidence.strength === "number" ? evidence.strength : 0;
          const nextStrength = applyOutcomeToStrength(currentStrength, answer);
          await supabase
            .from("patterns")
            .update({
              evidence: { ...evidence, strength: nextStrength },
            })
            .eq("id", target_id)
            .eq("user_id", user.id);
        }
      }

      // Audit log — captures the action for downstream analytics. Separate
      // from withObservability emission so we carry target_kind + answer.
      console.log(
        JSON.stringify({
          req_id: obs.reqId,
          user_id: user.id,
          route: "/api/outcome",
          action: "outcome_submit",
          target_kind,
          target_id,
          answer,
          source: "user",
          status: 200,
        }),
      );

      return Response.json({
        ok: true,
        outcome_id: (inserted as { id: string }).id,
      });
    },
  );
}
