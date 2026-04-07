import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, serviceUnavailable, internalError } from "@/lib/api-error";
import { v2ChatSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import type { HumaContext } from "@/types/context";
import { buildSystemPrompt } from "@/lib/services/prompt-builder";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return rateLimited();
  }

  const parsed = await parseBody(request, v2ChatSchema);
  if (parsed.error) return parsed.error;
  const { messages, knownContext, aspirations, sourceTab, tabContext, dayCount, chatMode, humaContext } = parsed.data;

  try {
    const anthropic = new Anthropic();
    const userTexts = messages.filter(m => m.role === "user").map(m => m.content);
    const userMessageCount = userTexts.length;

    // Parse humaContext if it came as JSON
    let parsedHumaContext: HumaContext | undefined;
    if (humaContext && typeof humaContext === "object") {
      parsedHumaContext = humaContext as unknown as HumaContext;
    }

    const systemPrompt = buildSystemPrompt(
      knownContext, aspirations, userTexts, userMessageCount,
      sourceTab, tabContext, dayCount, chatMode, parsedHumaContext,
    );

    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
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
