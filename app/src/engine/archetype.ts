// ─── Archetype Engine ────────────────────────────────────────────────────────
// Pure, deterministic heuristics. No API calls. No async.
// Computes archetype from 8-capital profile + life stage.

import type { CapitalKey } from "@/types/lotus";

export interface ArchetypeResult {
  archetype: string;
  description: string;
  strengths: CapitalKey[];
  growthAreas: CapitalKey[];
}

interface ArchetypeCandidate {
  name: string;
  description: string;
  score: number;
}

/** Sort capitals by value descending, breaking ties by array order. */
function rankedCapitals(capitals: Record<CapitalKey, number>): CapitalKey[] {
  return (Object.keys(capitals) as CapitalKey[]).sort(
    (a, b) => capitals[b] - capitals[a]
  );
}

function mean(vals: number[]): number {
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function stdDev(vals: number[]): number {
  const m = mean(vals);
  const variance = vals.reduce((a, v) => a + (v - m) ** 2, 0) / vals.length;
  return Math.sqrt(variance);
}

/**
 * Compute the archetype that best matches a capital profile.
 *
 * Each archetype has a scoring function — the highest score wins.
 * If nothing matches cleanly, falls back to Pioneer (high variance)
 * or Seeker (default).
 */
export function computeArchetype(
  capitals: Record<CapitalKey, number>,
  _stage: string
): ArchetypeResult {
  const ranked = rankedCapitals(capitals);
  const values = Object.values(capitals);
  const avg = mean(values);
  const sd = stdDev(values);
  const top2 = new Set(ranked.slice(0, 2));
  const bottom3 = new Set(ranked.slice(-3));

  const candidates: ArchetypeCandidate[] = [];

  // Earth Tender: living + spiritual top 2, financial in bottom 3
  if (
    top2.has("living") &&
    top2.has("spiritual") &&
    bottom3.has("financial")
  ) {
    candidates.push({
      name: "Earth Tender",
      description:
        "Connected to land and meaning, building material foundation.",
      score: capitals.living + capitals.spiritual - capitals.financial * 0.3,
    });
  }

  // Maker: material + intellectual top 2
  if (top2.has("material") && top2.has("intellectual")) {
    candidates.push({
      name: "Maker",
      description: "Builds things. Skilled with hands or mind.",
      score: capitals.material + capitals.intellectual,
    });
  }

  // Healer: social + experiential + spiritual all >= 6
  if (
    capitals.social >= 6 &&
    capitals.experiential >= 6 &&
    capitals.spiritual >= 6
  ) {
    candidates.push({
      name: "Healer",
      description: "Care-oriented. People come to them.",
      score: capitals.social + capitals.experiential + capitals.spiritual,
    });
  }

  // Builder: financial + material + intellectual all >= 6
  if (
    capitals.financial >= 6 &&
    capitals.material >= 6 &&
    capitals.intellectual >= 6
  ) {
    candidates.push({
      name: "Builder",
      description: "Enterprise-minded. Creates systems.",
      score: capitals.financial + capitals.material + capitals.intellectual,
    });
  }

  // Seeker: intellectual + spiritual top 2, material in bottom 3
  if (
    top2.has("intellectual") &&
    top2.has("spiritual") &&
    bottom3.has("material")
  ) {
    candidates.push({
      name: "Seeker",
      description: "Learning-driven. Knowledge-rich, not yet applied.",
      score: capitals.intellectual + capitals.spiritual - capitals.material * 0.3,
    });
  }

  // Connector: social is #1, at least 2 points above average
  if (ranked[0] === "social" && capitals.social >= avg + 2) {
    candidates.push({
      name: "Connector",
      description: "Community-oriented. Network is their capital.",
      score: capitals.social + (capitals.social - avg),
    });
  }

  // Pioneer: std dev > 2.5
  if (sd > 2.5) {
    candidates.push({
      name: "Pioneer",
      description:
        "High asymmetry. Strong in one area, starting from scratch in others.",
      score: sd * 3,
    });
  }

  // Steward: std dev < 1.5, no capital below 4
  if (sd < 1.5 && Math.min(...values) >= 4) {
    candidates.push({
      name: "Steward",
      description: "Balanced. Managing complexity. Needs optimization.",
      score: avg + (1.5 - sd) * 3,
    });
  }

  // Pick highest score
  candidates.sort((a, b) => b.score - a.score);

  const winner = candidates[0] ?? {
    name: sd > 2 ? "Pioneer" : "Seeker",
    description:
      sd > 2
        ? "High asymmetry. Strong in one area, starting from scratch in others."
        : "Learning-driven. Knowledge-rich, not yet applied.",
    score: 0,
  };

  // Top 3 by value = strengths. On ties, prefer less common capitals for the archetype.
  const strengths = ranked.slice(0, 3);

  // Bottom 2 = growth areas (opportunities, not deficits)
  const growthAreas = ranked.slice(-2).reverse();

  return {
    archetype: winner.name,
    description: winner.description,
    strengths,
    growthAreas,
  };
}
