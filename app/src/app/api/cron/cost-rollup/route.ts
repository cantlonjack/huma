import { createAdminSupabase } from "@/lib/supabase-admin";
import { withObservability } from "@/lib/observability";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute — simple aggregation, bounded to 24h window

// ─── Auth ────────────────────────────────────────────────────────────────────

function verifyCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

// ─── Token-cost model ────────────────────────────────────────────────────────

/**
 * USD/MTok rates for SEC-05 cost attribution (Sonnet + Haiku baselines).
 * These are approximate — Phase 6 adds per-request model detection + accurate
 * per-call pricing. For Phase 1 we use Sonnet rates as the default since that
 * is where the bulk of v2-chat traffic runs; Haiku-only routes over-estimate
 * slightly which is the safer error direction for a cost ceiling.
 *
 * Input $3 / MTok, Output $15 / MTok → USD per token:
 *   in  = 3e-6 per token
 *   out = 15e-6 per token
 */
const USD_PER_INPUT_TOKEN = 3e-6;
const USD_PER_OUTPUT_TOKEN = 15e-6;

function computeCostUSD(promptTokens: number, outputTokens: number): number {
  return promptTokens * USD_PER_INPUT_TOKEN + outputTokens * USD_PER_OUTPUT_TOKEN;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawRow {
  req_id: string;
  user_id: string | null;
  route: string;
  prompt_tokens: number;
  output_tokens: number;
  status: number;
  created_at: string;
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Daily aggregation cron. Scheduled via vercel.json at 02:15 UTC.
 *
 * Steps:
 * 1. Scan cost_metrics_raw WHERE created_at >= now() - 24h.
 * 2. GROUP BY req_id and pick MAX(prompt_tokens, output_tokens) for each.
 *    Rationale: v2-chat emits TWO log rows per streaming request —
 *    the outer wrap fires with output_tokens=0 at Response-return time,
 *    then a reconciliation entry fires when stream.finalMessage() resolves
 *    with the real token counts. Grouping by req_id + MAX collapses the pair
 *    into the accurate numbers.
 * 3. Roll up by (day, user_id, route) and upsert cost_metrics.
 * 4. Prune cost_metrics_raw WHERE created_at < now() - 48h so the raw table
 *    doesn't grow unbounded. The 24h analysis window + 48h retention gives
 *    operators a one-day debugging buffer in case of cron delay.
 */
export async function GET(request: Request): Promise<Response> {
  // source:"system" — this route is service-level infra, not user-facing, not
  // a scheduled user job. Keeps dashboards clean (cron == morning-sheet-like
  // operator-facing work; system == ops infra).
  return withObservability(
    request,
    "/api/cron/cost-rollup",
    "system",
    () => null,
    async () => {
      if (!verifyCron(request)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const supabase = createAdminSupabase();
      const now = new Date();
      const dayCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const pruneCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // 1) Scan 24h of raw rows.
      const { data: rawRows, error: scanErr } = await supabase
        .from("cost_metrics_raw")
        .select("req_id, user_id, route, prompt_tokens, output_tokens, status, created_at")
        .gte("created_at", dayCutoff.toISOString());

      if (scanErr) {
        console.error("[cost-rollup] scan failed:", scanErr.message);
        return Response.json({ error: "scan_failed" }, { status: 500 });
      }

      const rows = (rawRows || []) as RawRow[];

      // 2) GROUP BY req_id → MAX token counts (collapses v2-chat
      //    outer+reconciliation log pair). We keep the most-informative row
      //    per req_id — the one with the largest combined token count.
      const byReqId = new Map<string, RawRow>();
      for (const row of rows) {
        const prev = byReqId.get(row.req_id);
        if (!prev) {
          byReqId.set(row.req_id, row);
          continue;
        }
        const prevTotal = prev.prompt_tokens + prev.output_tokens;
        const curTotal = row.prompt_tokens + row.output_tokens;
        if (curTotal > prevTotal) byReqId.set(row.req_id, row);
      }

      // 3) Roll up by (day, user_id, route).
      interface AggKey { day: string; userId: string | null; route: string; }
      interface AggValue { prompt: number; output: number; count: number; }
      const agg = new Map<string, AggKey & AggValue>();
      for (const row of byReqId.values()) {
        const day = row.created_at.slice(0, 10); // YYYY-MM-DD
        const userKey = row.user_id ?? "__system__";
        const key = `${day}|${userKey}|${row.route}`;
        const cur = agg.get(key);
        if (cur) {
          cur.prompt += row.prompt_tokens;
          cur.output += row.output_tokens;
          cur.count += 1;
        } else {
          agg.set(key, {
            day,
            userId: row.user_id,
            route: row.route,
            prompt: row.prompt_tokens,
            output: row.output_tokens,
            count: 1,
          });
        }
      }

      // 4) Upsert into cost_metrics.
      const upsertRows = [...agg.values()].map((v) => ({
        day: v.day,
        user_id: v.userId,
        route: v.route,
        prompt_tokens: v.prompt,
        output_tokens: v.output,
        request_count: v.count,
        cost_usd: computeCostUSD(v.prompt, v.output),
        updated_at: new Date().toISOString(),
      }));

      if (upsertRows.length > 0) {
        const { error: upsertErr } = await supabase
          .from("cost_metrics")
          .upsert(upsertRows, { onConflict: "day,user_id,route" });
        if (upsertErr) {
          console.error("[cost-rollup] upsert failed:", upsertErr.message);
          return Response.json({ error: "upsert_failed" }, { status: 500 });
        }
      }

      // 5) Prune raw rows older than the retention window.
      const { error: pruneErr } = await supabase
        .from("cost_metrics_raw")
        .delete()
        .lt("created_at", pruneCutoff.toISOString());
      if (pruneErr) {
        // Non-fatal: rollup succeeded; pruning can retry next run.
        console.error("[cost-rollup] prune failed:", pruneErr.message);
      }

      return Response.json({
        scanned: rows.length,
        grouped: byReqId.size,
        aggregated: upsertRows.length,
        pruned_before: pruneCutoff.toISOString(),
      });
    },
  );
}
