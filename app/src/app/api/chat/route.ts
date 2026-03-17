import Anthropic from "@anthropic-ai/sdk";
import { buildFullPrompt, buildDocumentPrompt } from "@/engine/phases";
import { buildCanvasDataPrompt } from "@/engine/canvas-prompt";
import { type Phase, type ConversationContext } from "@/engine/types";

// ─── Rate Limiting (in-memory, per-deployment) ───

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Periodic cleanup to prevent memory growth
if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  };
  setInterval(cleanup, 300_000);
}

// ─── Validation ───

const VALID_PHASES = new Set<string>([
  "ikigai", "holistic-context", "landscape",
  "enterprise-map", "nodal-interventions", "operational-design", "complete",
]);

function validateRequest(body: unknown): { valid: true; data: Record<string, unknown> } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }
  const data = body as Record<string, unknown>;

  if (!Array.isArray(data.messages) || data.messages.length === 0) {
    return { valid: false, error: "Messages array required" };
  }
  if (data.messages.length > 100) {
    return { valid: false, error: "Too many messages" };
  }
  for (const msg of data.messages) {
    if (!msg || typeof msg !== "object") return { valid: false, error: "Invalid message format" };
    const m = msg as Record<string, unknown>;
    if (m.role !== "user" && m.role !== "assistant") return { valid: false, error: "Invalid message role" };
    if (typeof m.content !== "string" || m.content.length > 50_000) return { valid: false, error: "Invalid message content" };
  }
  if (data.phase && !VALID_PHASES.has(data.phase as string)) {
    return { valid: false, error: "Invalid phase" };
  }
  return { valid: true, data };
}

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
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse and validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const validation = validateRequest(body);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, phase, context, generateDocument, generateCanvas, syntheses } = validation.data;

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
