import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, serviceUnavailable, internalError } from "@/lib/api-error";
import { requireUser } from "@/lib/auth-guard";
import { v2ChatSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import type { HumaContext } from "@/types/context";
import type { Aspiration, Pattern } from "@/types/v2";
import type { CapitalScore } from "@/engine/canvas-types";
import { buildStaticPrompt, buildDynamicPrompt, detectMode } from "@/lib/services/prompt-builder";
import { allSeeds } from "@/data/rppl-seeds";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  // ─── Auth gate (SEC-01) ──────────────────────────────────────────────────
  // requireUser returns 401 when PHASE_1_GATE_ENABLED=true and no session.
  // Pre-flag-flip path returns ctx.user=null, source:"system".
  // ctx is referenced downstream by Plans 02 (quota) and 05b (observability).
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const { ctx } = auth;

  // ─── IP rate-limit (Warning 1: anon/unauth only) ─────────────────────────
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

    const stream = anthropic.messages.stream({
      model,
      max_tokens: 2048,
      system: [
        {
          type: "text" as const,
          text: staticPrompt,
          cache_control: { type: "ephemeral" as const },
        },
        {
          type: "text" as const,
          text: dynamicPrompt,
        },
      ],
      messages: messages.map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("V2 chat API error:", err);
    return internalError("Something went wrong. Please try again.");
  }
}
