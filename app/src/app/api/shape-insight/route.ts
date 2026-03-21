import Anthropic from "@anthropic-ai/sdk";
import {
  SHAPE_INSIGHT_PROMPT,
  buildShapeInsightMessage,
} from "@/engine/prompts/shape-insight-prompt";
import { parseInsightResponse } from "@/engine/shape-insight";
import { isRateLimited } from "@/lib/rate-limit";
import { DIMENSION_ORDER } from "@/types/shape";

const VALID_DIMENSIONS = new Set(DIMENSION_ORDER);

function validateScores(
  body: unknown
): { valid: true; scores: Record<string, number> } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }
  const data = body as Record<string, unknown>;
  if (!data.scores || typeof data.scores !== "object") {
    return { valid: false, error: "Scores object required" };
  }

  const scores = data.scores as Record<string, unknown>;
  const validated: Record<string, number> = {};

  for (const [key, val] of Object.entries(scores)) {
    if (!VALID_DIMENSIONS.has(key as typeof DIMENSION_ORDER[number])) {
      return { valid: false, error: `Invalid dimension: ${key}` };
    }
    if (typeof val !== "number" || val < 1 || val > 5 || !Number.isInteger(val)) {
      return { valid: false, error: `Invalid score for ${key}: must be integer 1-5` };
    }
    validated[key] = val;
  }

  if (Object.keys(validated).length !== 8) {
    return { valid: false, error: "All 8 dimensions required" };
  }

  return { valid: true, scores: validated };
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (await isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const validation = validateScores(body);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SHAPE_INSIGHT_PROMPT,
      messages: [
        {
          role: "user",
          content: buildShapeInsightMessage(validation.scores),
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const insight = parseInsightResponse(text);

    return new Response(JSON.stringify(insight), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Shape insight error:", err);
    const status = (err as { status?: number })?.status || 500;
    return new Response(
      JSON.stringify({ error: "Could not read your shape right now." }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}
