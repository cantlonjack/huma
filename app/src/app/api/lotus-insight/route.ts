/**
 * POST /api/lotus-insight
 *
 * Generates the operator's first insight and pattern recommendation
 * from their completed Lotus Flow context. Mirrors shape-insight pattern.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  buildLotusInsightSystemPrompt,
  buildLotusInsightMessage,
} from "@/engine/prompts/lotus-insight-prompt";
import { isRateLimited } from "@/lib/rate-limit";

interface InsightResponse {
  insight: string;
  pattern: {
    name: string;
    description: string;
    whyYou: string;
    firstStep: string;
  } | null;
}

const FALLBACK: InsightResponse = {
  insight:
    "I need a bit more context to see the full picture. Want to keep going?",
  pattern: null,
};

function validateContext(
  body: unknown
): { valid: true; context: Record<string, unknown> } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const data = body as Record<string, unknown>;
  const ctx = data.context as Record<string, unknown> | undefined;

  if (!ctx || typeof ctx !== "object") {
    return { valid: false, error: "Context object required" };
  }

  if (!ctx.name || typeof ctx.name !== "string") {
    return { valid: false, error: "Operator name required" };
  }
  if (!ctx.entityType || typeof ctx.entityType !== "string") {
    return { valid: false, error: "Entity type required" };
  }
  if (!ctx.stage || typeof ctx.stage !== "string") {
    return { valid: false, error: "Life stage required" };
  }
  if (!ctx.capitals || typeof ctx.capitals !== "object") {
    return { valid: false, error: "Capital profile required" };
  }

  return { valid: true, context: ctx };
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

  const validation = validateContext(body);
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
      max_tokens: 1000,
      temperature: 0.7,
      system: buildLotusInsightSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildLotusInsightMessage(
            validation.context as Parameters<typeof buildLotusInsightMessage>[0]
          ),
        },
      ],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip any markdown backticks that might leak through
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();

    let parsed: InsightResponse;
    try {
      const json = JSON.parse(cleaned);

      // Validate structure
      if (
        typeof json.insight !== "string" ||
        !json.insight
      ) {
        parsed = FALLBACK;
      } else if (
        json.pattern &&
        typeof json.pattern.name === "string" &&
        typeof json.pattern.description === "string" &&
        typeof json.pattern.whyYou === "string" &&
        typeof json.pattern.firstStep === "string"
      ) {
        parsed = {
          insight: json.insight,
          pattern: {
            name: json.pattern.name,
            description: json.pattern.description,
            whyYou: json.pattern.whyYou,
            firstStep: json.pattern.firstStep,
          },
        };
      } else {
        parsed = { insight: json.insight, pattern: null };
      }
    } catch {
      parsed = FALLBACK;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Lotus insight error:", err);
    return new Response(
      JSON.stringify({ error: "Could not generate your insight right now." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
