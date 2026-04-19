import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, serviceUnavailable, internalError, apiError } from "@/lib/api-error";
import { requireUser } from "@/lib/auth-guard";
import { checkAndIncrement } from "@/lib/quota";
import { v2ChatSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import { withObservability } from "@/lib/observability";
import { createAdminSupabase } from "@/lib/supabase-admin";
import type { HumaContext } from "@/types/context";
import type { Aspiration, Pattern } from "@/types/v2";
import type { CapitalScore } from "@/engine/canvas-types";
import { buildStaticPrompt, buildDynamicPrompt, detectMode, budgetCheck, pickBudget } from "@/lib/services/prompt-builder";
import { allSeeds } from "@/data/rppl-seeds";

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  // ─── Auth gate (SEC-01) ──────────────────────────────────────────────────
  // requireUser returns 401 when PHASE_1_GATE_ENABLED=true and no session.
  // Pre-flag-flip path returns ctx.user=null, source:"system".
  // ctx is referenced downstream by Plans 02 (quota) and 05c (observability).
  const auth = await requireUser(request);
  if (auth.error) {
    // Wrap the 401 short-circuit so observability is uniform across paths —
    // the log still carries a req_id + status=401. Source is "user" because
    // the gate enforces an authenticated path; unresolved user_id stays null.
    return withObservability(
      request,
      "/api/v2-chat",
      "user",
      () => null,
      async () => auth.error!,
    );
  }
  const { ctx } = auth;

  return withObservability(
    request,
    "/api/v2-chat",
    ctx.source,
    () => ctx.user?.id ?? null,
    async (obs) => {
      // ─── IP rate-limit (Warning 1: anon/unauth only) ─────────────────────
      // Permanent users are NOT penalized by the shared-IP cap — their per-user
      // Supabase ledger (Plan 02) covers them. This avoids hurting corporate /
      // family-WiFi operators who share an egress IP.
      if (!ctx.user || ctx.user.is_anonymous) {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          || request.headers.get("x-real-ip")
          || "unknown";
        if (await isRateLimited(ip)) {
          return rateLimited();
        }
      }

      const parsed = await parseBody(request, v2ChatSchema);
      if (parsed.error) return parsed.error;
      const {
        messages, knownContext, aspirations, sourceTab, tabContext, dayCount, chatMode,
        humaContext, isFirstConversation, exchangeCount,
        fullAspirations, patterns, capitalScores, behaviorCounts,
      } = parsed.data;

      try {
        const anthropic = new Anthropic();
        const userTexts = messages.filter(m => m.role === "user").map(m => m.content);
        const userMessageCount = userTexts.length;

        // Parse humaContext if it came as JSON
        let parsedHumaContext: HumaContext | undefined;
        if (humaContext && typeof humaContext === "object") {
          parsedHumaContext = humaContext as unknown as HumaContext;
        }

        // Cast compressed-encoding inputs back to their runtime types.
        const parsedFullAspirations = fullAspirations as unknown as Aspiration[] | undefined;
        const parsedPatterns = patterns as unknown as Pattern[] | undefined;
        const parsedCapitalScores = capitalScores as unknown as CapitalScore[] | undefined;

        const mode = detectMode(userTexts, chatMode, aspirations);

        const staticPrompt = buildStaticPrompt(mode, isFirstConversation);
        const dynamicPrompt = buildDynamicPrompt({
          mode,
          knownContext,
          aspirations,
          conversationTexts: userTexts,
          userMessageCount,
          sourceTab,
          tabContext,
          dayCount,
          chatMode,
          humaContext: parsedHumaContext,
          isFirstConversation,
          exchangeCount,
          fullAspirations: parsedFullAspirations,
          patterns: parsedPatterns,
          capitalScores: parsedCapitalScores,
          behaviorCounts,
          rpplSeeds: allSeeds,
        });

        // Progressive model selection: Haiku for first 2 exchanges (simple Q&A),
        // Sonnet for decomposition and complex reasoning
        const model = userMessageCount <= 2
          ? "claude-haiku-4-5-20251001"
          : (process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514");

        // Build the system-prompt blocks and messages[] payload once so both
        // budgetCheck and the stream call operate on the identical inputs.
        const systemBlocks = [
          {
            type: "text" as const,
            text: staticPrompt,
            cache_control: { type: "ephemeral" as const },
          },
          {
            type: "text" as const,
            text: dynamicPrompt,
          },
        ];
        let dispatchMessages = messages.map((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        }));

        // ─── SEC-03: token budget (runs BEFORE quota — Blocker 6) ────────
        // Tail-trim messages[] until the total input fits the per-model ceiling.
        // humaContext (system) is never modified. If system alone overflows
        // even after messages[] is empty, return 413.
        let trimmedCount = 0;
        let inputTokens = 0;
        if (!ctx.isCron) {
          const budget = await budgetCheck({
            anthropic,
            model,
            system: systemBlocks,
            messages: dispatchMessages,
            limit: pickBudget(model),
          });
          if ("tooLarge" in budget && budget.tooLarge) {
            return apiError(
              "This thread's gotten long. Start a new one — I'll catch you up from your shape.",
              "PAYLOAD_TOO_LARGE",
              413,
            );
          }
          dispatchMessages = budget.messages as typeof dispatchMessages;
          trimmedCount = budget.trimmedCount;
          inputTokens = budget.inputTokens;
        }

        // SEC-05: surface the accurate prompt-token count on the outer log
        // payload BEFORE the Response is returned. Output tokens land via the
        // reconciliation listener below (Warning 5: closure, no globalThis).
        obs.setPromptTokens(inputTokens);

        // ─── SEC-02: per-user quota (Blocker 6: accurate inputTokens) ────
        // Cron and the pre-flag-flip shim (ctx.user === null) both short-circuit
        // — cron has CRON_SECRET auth and must not deplete any operator's quota;
        // null-user means the auth gate is not yet enforced so there is no
        // stable id to key against. Plan 05c follow-through: pass obs.reqId as
        // the 4th arg so the ledger row is tagged and the finalMessage listener
        // can reconcile output_tokens via admin.update().eq("req_id", obs.reqId).
        if (!ctx.isCron && ctx.user) {
          const quota = await checkAndIncrement(ctx.user.id, "/api/v2-chat", inputTokens, obs.reqId);
          if (!quota.allowed) {
            return rateLimited({
              tier: quota.tier,
              resetAt: quota.resetAt,
              suggest: quota.suggest,
            });
          }
        }

        // SEC-06: pass request.signal so the SDK's underlying fetch aborts when
        // the client disconnects. Without this, we keep paying for tokens no one
        // will read.
        const stream = anthropic.messages.stream(
          {
            model,
            max_tokens: 2048,
            system: systemBlocks,
            messages: dispatchMessages,
          },
          { signal: request.signal },
        );

        // ─── SEC-05 reconciliation listener (Warning 5: closure scope) ────
        // stream.finalMessage() resolves AFTER the wrapper's finally-block
        // fires (the Response has already left). We register a listener whose
        // closure captures `obs` and `ctx` — it runs LATER when the stream
        // tears down and emits a SECOND log entry tagged {reconciles: reqId}
        // carrying the REAL input/output token counts. The cost-rollup cron
        // groups by req_id and picks MAX(output_tokens), so this reconciliation
        // entry wins over the initial output_tokens=0 emission.
        //
        // Also performs the Blocker 6 follow-through: a secondary
        // user_quota_ledger.update keyed on req_id brings the ledger's
        // token_count in line with actual stream output.
        stream.on("finalMessage", (msg) => {
          const usage = (msg as { usage?: { input_tokens?: number; output_tokens?: number } })?.usage;
          const outputTokens = typeof usage?.output_tokens === "number" ? usage.output_tokens : 0;
          const inputTokensFromStream = typeof usage?.input_tokens === "number" ? usage.input_tokens : inputTokens;

          obs.setOutputTokens(outputTokens);

          // Reconciliation log — cost-rollup cron will MAX-group by req_id.
          // eslint-disable-next-line no-console -- Vercel stdout JSON ingestion.
          console.log(JSON.stringify({
            req_id: obs.reqId,
            user_id: ctx.user?.id ?? null,
            route: "/api/v2-chat",
            prompt_tokens: inputTokensFromStream,
            output_tokens: outputTokens,
            latency_ms: 0,             // unused for reconciliation entries
            status: 200,
            source: ctx.source,
            reconciles: obs.reqId,     // marker: cost-rollup folds this in
          }));

          // Blocker 6 follow-through: reconcile user_quota_ledger.token_count.
          if (ctx.user && outputTokens > 0) {
            try {
              const admin = createAdminSupabase();
              void admin
                .from("user_quota_ledger")
                .update({ token_count: inputTokensFromStream + outputTokens })
                .eq("req_id", obs.reqId)
                .then((res: { error: { message: string } | null }) => {
                  if (res.error) {
                    console.error("[v2-chat] quota reconciliation failed:", res.error.message);
                  }
                });
            } catch (err) {
              console.error("[v2-chat] quota reconciliation threw:", (err as Error)?.message);
            }
          }
        });

        const readableStream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();

            // Belt-and-suspenders abort wiring. The SDK's signal option catches the
            // common case; this listener also calls stream.abort() explicitly so
            // Anthropic tears down immediately on browser nav / tab close.
            const onAbort = () => {
              try { stream.abort(); } catch { /* already aborted */ }
              try { controller.close(); } catch { /* already closed */ }
            };
            if (request.signal.aborted) { onAbort(); return; }
            request.signal.addEventListener("abort", onAbort);

            try {
              for await (const event of stream) {
                if (request.signal.aborted) break;
                if (
                  event.type === "content_block_delta" &&
                  event.delta.type === "text_delta"
                ) {
                  controller.enqueue(encoder.encode(event.delta.text));
                }
              }
              try { controller.close(); } catch { /* already closed by onAbort */ }
            } catch (err) {
              const name = (err as Error)?.name;
              if (name === "APIUserAbortError") {
                // Expected when the client bailed — not a real error.
                try { controller.close(); } catch { /* noop */ }
              } else {
                console.error("Stream error:", err);
                try { controller.error(err); } catch { /* noop */ }
              }
            } finally {
              request.signal.removeEventListener("abort", onAbort);
            }
          },
          cancel() {
            // Fires when the consumer (browser) cancels the stream. Mirror abort.
            try { stream.abort(); } catch { /* noop */ }
          },
        });

        // SEC-03: surface trim events to the client via X-Huma-Truncated.
        // Header is omitted when no trim happened (trimmedCount === 0).
        const responseHeaders: Record<string, string> = {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        };
        if (trimmedCount > 0) {
          responseHeaders["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
        }
        return new Response(readableStream, { headers: responseHeaders });
      } catch (err) {
        console.error("V2 chat API error:", err);
        return internalError("Something went wrong. Please try again.");
      }
    },
  );
}
