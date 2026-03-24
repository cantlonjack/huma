/**
 * POST /api/workspace-recommendation
 *
 * Generates a compiled recommendation based on context depth.
 * Tier 1 (Lotus Flow only): directional, archetype-based.
 * Tier 2 (Lotus Flow + Ikigai): specific, Ikigai-aligned.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  getRecommendationTier,
  buildRecommendationSystemPrompt,
  buildRecommendationMessage,
} from "@/engine/prompts/workspace-recommendation-prompt";
import { isRateLimited } from "@/lib/rate-limit";
import type { OperatorContext } from "@/types/lotus";

interface RecommendationResponse {
  recommendation: string;
  pattern: string | null;
  tier: 1 | 2;
}

const FALLBACK_T1: RecommendationResponse = {
  recommendation:
    "Your shape tells a story. Let's see it more clearly as we go deeper.",
  pattern: null,
  tier: 1,
};

const FALLBACK_T2: RecommendationResponse = {
  recommendation:
    "Something is coming into focus — where what you love meets what the world needs. We'll sharpen it together.",
  pattern: null,
  tier: 2,
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) {
    return Response.json(FALLBACK_T1, { status: 429 });
  }

  let body: { context: OperatorContext };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ctx = body.context;
  if (!ctx || !ctx.name || !ctx.capitals) {
    return Response.json({ error: "Context required" }, { status: 400 });
  }

  const tier = getRecommendationTier(ctx);
  const fallback = tier === 2 ? FALLBACK_T2 : FALLBACK_T1;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(fallback);
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 300,
      temperature: 0.7,
      system: buildRecommendationSystemPrompt(tier),
      messages: [
        { role: "user", content: buildRecommendationMessage(ctx, tier) },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json\n?|```/g, "").trim();

    try {
      const json = JSON.parse(cleaned);
      if (typeof json.recommendation === "string" && json.recommendation) {
        return Response.json({
          recommendation: json.recommendation,
          pattern: json.pattern || null,
          tier,
        });
      }
    } catch {
      // JSON parse failed — use cleaned text if reasonable
      if (cleaned.length > 10 && cleaned.length < 500) {
        return Response.json({
          recommendation: cleaned,
          pattern: null,
          tier,
        });
      }
    }

    return Response.json(fallback);
  } catch (err) {
    console.error("Workspace recommendation error:", err);
    return Response.json(fallback);
  }
}
