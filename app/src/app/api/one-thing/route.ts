import Anthropic from "@anthropic-ai/sdk";
import {
  ONE_THING_SYSTEM_PROMPT,
  buildOneThingMessage,
} from "@/engine/prompts/one-thing-prompt";
import { isRateLimited } from "@/lib/rate-limit";
import { DIMENSION_ORDER } from "@/types/shape";
import type { DimensionKey } from "@/types/shape";

const VALID_DIMENSIONS = new Set(DIMENSION_ORDER);

interface OneThingResponse {
  action: string;
  connectsTo: DimensionKey[];
  leverDimension: DimensionKey;
}

function validateShape(
  shape: unknown
): { valid: true; scores: Record<string, number> } | { valid: false; error: string } {
  if (!shape || typeof shape !== "object") {
    return { valid: false, error: "Shape object required" };
  }

  const scores = shape as Record<string, unknown>;
  const validated: Record<string, number> = {};

  for (const [key, val] of Object.entries(scores)) {
    if (!VALID_DIMENSIONS.has(key as DimensionKey)) {
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const currentValidation = validateShape(body.currentShape);
  if (!currentValidation.valid) {
    return new Response(
      JSON.stringify({ error: `currentShape: ${currentValidation.error}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let previousScores: Record<string, number> | null = null;
  if (body.previousShape) {
    const prevValidation = validateShape(body.previousShape);
    if (prevValidation.valid) {
      previousScores = prevValidation.scores;
    }
    // Silently ignore invalid previous shape — it's optional
  }

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: ONE_THING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildOneThingMessage(currentValidation.scores, previousScores),
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse response
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleaned) as OneThingResponse;

    // Validate required fields
    if (!parsed.action || !parsed.connectsTo || !parsed.leverDimension) {
      throw new Error("Missing required fields in one-thing response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("One-thing generation error:", err);
    const status = (err as { status?: number })?.status || 500;
    return new Response(
      JSON.stringify({ error: "Could not generate your one thing right now." }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}
