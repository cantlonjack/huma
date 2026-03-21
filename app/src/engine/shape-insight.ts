/**
 * Shape Insight Engine
 *
 * Takes a set of dimension scores and calls the Claude API to generate
 * a structural insight about the operator's shape pattern.
 */

import type { DimensionKey } from "@/types/shape";

export interface ShapeInsight {
  headline: string;
  detail: string;
  oneThing: string;
  dimensions: {
    highlighted: DimensionKey[];
    lever: DimensionKey;
  };
}

/**
 * Parse the raw Claude response into a ShapeInsight.
 * Handles potential JSON wrapped in markdown fences.
 */
export function parseInsightResponse(raw: string): ShapeInsight {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (
    !parsed.headline ||
    !parsed.detail ||
    !parsed.oneThing ||
    !parsed.dimensions?.highlighted ||
    !parsed.dimensions?.lever
  ) {
    throw new Error("Missing required fields in insight response");
  }

  return {
    headline: String(parsed.headline),
    detail: String(parsed.detail),
    oneThing: String(parsed.oneThing),
    dimensions: {
      highlighted: parsed.dimensions.highlighted.map(String) as DimensionKey[],
      lever: String(parsed.dimensions.lever) as DimensionKey,
    },
  };
}
