import Anthropic from "@anthropic-ai/sdk";
import { buildFullPrompt, buildDocumentPrompt } from "@/engine/phases";
import { buildCanvasDataPrompt } from "@/engine/canvas-prompt";
import { type Phase, type ConversationContext } from "@/engine/types";
import { isRateLimited } from "@/lib/rate-limit";
import { legacyChatSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

// ─── Handler ───

export async function POST(request: Request) {
  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse and validate
  const parsed = await parseBody(request, legacyChatSchema);
  if (parsed.error) return parsed.error;
  const { messages, phase, context, generateDocument, generateCanvas, syntheses } = parsed.data;

  try {
    const anthropic = new Anthropic();

    let systemPrompt: string;
    let maxTokens: number;

    if (generateCanvas) {
      systemPrompt = buildCanvasDataPrompt(syntheses as Parameters<typeof buildCanvasDataPrompt>[0] || {
        operatorName: "", location: "",
        ikigaiSynthesis: "", holisticContextSynthesis: "",
        landscapeSynthesis: "", enterpriseSelections: "",
        nodalInterventions: "",
      });
      maxTokens = 8192;
    } else if (generateDocument) {
      systemPrompt = buildDocumentPrompt(syntheses as Parameters<typeof buildDocumentPrompt>[0] || {
        operatorName: "", location: "",
        ikigaiSynthesis: "", holisticContextSynthesis: "",
        landscapeSynthesis: "", enterpriseSelections: "",
        nodalInterventions: "",
      });
      maxTokens = 8192;
    } else {
      systemPrompt = buildFullPrompt(
        ((phase as Phase) || "ikigai"),
        ((context || {}) as Partial<ConversationContext>)
      );
      maxTokens = 4096;
    }

    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: (messages as Array<{ role: string; content: string }>).map((m) => ({
        role: m.role as "user" | "assistant",
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
    console.error("API error:", err);
    const status = (err as { status?: number })?.status || 500;
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}
