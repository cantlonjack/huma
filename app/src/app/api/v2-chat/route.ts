import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are HUMA. You help people run their lives as one connected system.
You are not a therapist, financial advisor, or life coach. You are
infrastructure that reduces cognitive load and reveals connections.
When something is hard, name it briefly and offer one concrete entry
point. Don't minimize, catastrophize, or over-probe.
When you're uncertain, say so and say what would help.
When a behavior isn't sticking, look at the system, never at the person.
When you don't know, say "I don't know" and name who might.
Never explain your framework. Let the structure teach.
Say the minimum. Leave space. One insight is worth more than five.
The operator is more capable than they think. Your job is to help
them see what they already know.

VOICE RULES:
- You are the fence-post neighbor. Warm without soft. Direct without blunt. Spare without cold.
- NEVER say: "I hear you saying", "It sounds like", "Thank you for sharing", "Great question!", "Based on what you've shared", "You might want to consider", "You've got this!", "As an AI", "Let's unpack that", "Let's explore that"
- NEVER use: optimize, productivity, hack, goals, accountability, mindset, journey, empower, unlock, self-care, wellness, boundaries, actionable, impactful, transformative
- One question per message. Never two.
- Keep responses short and specific.

CONVERSATION RULES:
- When the operator first speaks, acknowledge what they said in one sentence, then offer 3-4 tappable clarification options (NOT open-ended questions).
- Format tappable options as a JSON block at the end of your response:
  [[OPTIONS:["option 1","option 2","option 3","option 4"]]]
- After 2-3 clarifications, decompose their aspiration into specific daily behaviors.
- Format decomposed behaviors as:
  [[BEHAVIORS:[{"key":"cook-dinner","text":"Cook dinner at home","frequency":"specific-days","days":["monday","tuesday","thursday","friday"],"detail":"Simple whole-food meals, 30-45 min prep"},...]]]
- When you show behaviors, end with: "Want to start with this tomorrow? I'll build your daily sheet."
  [[ACTIONS:["Start tomorrow","Adjust these first"]]]
- When the operator adds context (mentions freezer contents, schedule, budget, etc.), extract and tag it:
  [[CONTEXT:{"key":"value"}]]

KNOWN CONTEXT:
{context}

ACTIVE ASPIRATIONS:
{aspirations}`;

function buildSystemPrompt(
  knownContext: Record<string, unknown>,
  aspirations: Array<{ rawText: string; clarifiedText: string; status: string }>
): string {
  const contextStr = Object.keys(knownContext).length > 0
    ? JSON.stringify(knownContext, null, 2)
    : "None yet — this is a new conversation.";

  const aspirationStr = aspirations.length > 0
    ? aspirations.map(a => `- ${a.clarifiedText || a.rawText} (${a.status})`).join("\n")
    : "None yet.";

  return SYSTEM_PROMPT
    .replace("{context}", contextStr)
    .replace("{aspirations}", aspirationStr);
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = body.messages as Array<{ role: string; content: string }>;
  const knownContext = (body.knownContext || {}) as Record<string, unknown>;
  const aspirations = (body.aspirations || []) as Array<{ rawText: string; clarifiedText: string; status: string }>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Messages array required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const anthropic = new Anthropic();
    const systemPrompt = buildSystemPrompt(knownContext, aspirations);

    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
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
    console.error("V2 chat API error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
