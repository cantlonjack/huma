// ─── Structural Insight Engine ─────────────────────────────────────────────
// Pure computation from decomposition data. No behavioral history needed.
// No Claude API calls. This is what kills the activation cliff.
//
// Input: aspirations + behaviors (from conversation decomposition)
// Output: insights that show operators how their life connects — Day 1.

import type { Aspiration, Behavior, DimensionKey, DimensionEffect } from "@/types/v2";
import { getEffectiveDimensions, DIMENSION_LABELS } from "@/types/v2";

// ─── Types ─────────────────────────────────────────────────────────────────

export type StructuralInsightType =
  | "keystone"
  | "dimension-gap"
  | "cascade"
  | "single-point-of-failure"
  | "aspiration-overlap";

export interface StructuralInsight {
  id: string;
  type: StructuralInsightType;
  title: string;
  body: string;
  dimensions: DimensionKey[];
  strength: number; // 0–1, how surprising/non-obvious
  behaviors: string[]; // the evidence (behavior texts)
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const ALL_DIMS: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

function dimLabel(d: DimensionKey): string {
  return DIMENSION_LABELS[d] || d;
}

function getDimKeys(behavior: Behavior): DimensionKey[] {
  const effects = getEffectiveDimensions(behavior);
  return effects.map((e: DimensionEffect) => e.dimension);
}

function uniqueDims(dims: DimensionKey[]): DimensionKey[] {
  return [...new Set(dims)];
}

interface BehaviorWithSource extends Behavior {
  aspirationId: string;
  aspirationName: string;
}

function flattenBehaviors(aspirations: Aspiration[]): BehaviorWithSource[] {
  return aspirations.flatMap(a =>
    a.behaviors
      .filter(b => b.enabled !== false)
      .map(b => ({
        ...b,
        aspirationId: a.id,
        aspirationName: a.title || a.clarifiedText || a.rawText,
      }))
  );
}

// ─── Keystone Detection ────────────────────────────────────────────────────
// Find the behavior that touches the most dimensions.
// "Cook dinner touches 5 of your 8 dimensions. When this one happens,
// everything else gets easier."

function detectKeystone(behaviors: BehaviorWithSource[]): StructuralInsight | null {
  if (behaviors.length === 0) return null;

  let best: BehaviorWithSource | null = null;
  let bestCount = 0;

  for (const b of behaviors) {
    const dims = getDimKeys(b);
    if (dims.length > bestCount) {
      bestCount = dims.length;
      best = b;
    }
  }

  if (!best || bestCount < 3) return null;

  const dims = uniqueDims(getDimKeys(best));
  const dimNames = dims.map(dimLabel).join(", ");

  // Strength: 3 dims = 0.4, 4 = 0.6, 5+ = 0.8+
  const strength = Math.min(1, (bestCount - 2) * 0.2 + 0.2);

  return {
    id: crypto.randomUUID(),
    type: "keystone",
    title: `${best.text} touches ${bestCount} dimensions`,
    body: `${best.text} touches ${dimNames} — ${bestCount} of your 8 dimensions from one behavior. When this one happens, everything else gets easier.`,
    dimensions: dims,
    strength,
    behaviors: [best.text],
  };
}

// ─── Dimension Gap Detection ───────────────────────────────────────────────
// Find dimensions with zero behaviors assigned.
// "Nothing in your current plan touches Growth. That dimension is running
// on inertia."

function detectDimensionGaps(behaviors: BehaviorWithSource[]): StructuralInsight | null {
  const touchedDims = new Set<DimensionKey>();
  for (const b of behaviors) {
    for (const d of getDimKeys(b)) {
      touchedDims.add(d);
    }
  }

  const gaps = ALL_DIMS.filter(d => !touchedDims.has(d));
  if (gaps.length === 0 || gaps.length >= 6) return null; // all gaps or no gaps = not useful

  const gapNames = gaps.map(dimLabel);

  // Strength: 1 gap = 0.5, 2 = 0.7, 3+ = 0.9
  const strength = Math.min(1, 0.3 + gaps.length * 0.2);

  const body = gaps.length === 1
    ? `Nothing in your current plan touches ${gapNames[0]}. That dimension is running on inertia.`
    : `Nothing in your current plan touches ${gapNames.join(" or ")}. Those dimensions are running on inertia.`;

  return {
    id: crypto.randomUUID(),
    type: "dimension-gap",
    title: `${gapNames.join(", ")} ${gaps.length === 1 ? "has" : "have"} no behaviors`,
    body,
    dimensions: gaps,
    strength,
    behaviors: [],
  };
}

// ─── Cascade Mapping ───────────────────────────────────────────────────────
// Find dimension pairs that share 3+ behaviors.
// "Body and Money move together in your life — 4 of your behaviors touch both."

function detectCascades(behaviors: BehaviorWithSource[]): StructuralInsight | null {
  // Count behaviors per dimension pair
  const pairCounts = new Map<string, { dims: [DimensionKey, DimensionKey]; behaviorTexts: string[] }>();

  for (const b of behaviors) {
    const dims = uniqueDims(getDimKeys(b));
    for (let i = 0; i < dims.length; i++) {
      for (let j = i + 1; j < dims.length; j++) {
        const key = [dims[i], dims[j]].sort().join("|");
        if (!pairCounts.has(key)) {
          pairCounts.set(key, { dims: [dims[i], dims[j]], behaviorTexts: [] });
        }
        pairCounts.get(key)!.behaviorTexts.push(b.text);
      }
    }
  }

  // Find the pair with the most shared behaviors (minimum 3)
  let bestPair: { dims: [DimensionKey, DimensionKey]; behaviorTexts: string[] } | null = null;
  let bestCount = 0;

  for (const [, pair] of pairCounts) {
    if (pair.behaviorTexts.length > bestCount && pair.behaviorTexts.length >= 3) {
      bestCount = pair.behaviorTexts.length;
      bestPair = pair;
    }
  }

  if (!bestPair) return null;

  const [d1, d2] = bestPair.dims;
  // Strength: 3 shared = 0.5, 4 = 0.7, 5+ = 0.85
  const strength = Math.min(1, 0.3 + bestCount * 0.15);

  return {
    id: crypto.randomUUID(),
    type: "cascade",
    title: `${dimLabel(d1)} and ${dimLabel(d2)} move together`,
    body: `${dimLabel(d1)} and ${dimLabel(d2)} move together in your life — ${bestCount} of your behaviors touch both. When one moves, the other follows.`,
    dimensions: [d1, d2],
    strength,
    behaviors: [...new Set(bestPair.behaviorTexts)],
  };
}

// ─── Single Point of Failure ───────────────────────────────────────────────
// Find dimensions touched by only 1 behavior.
// "Joy depends entirely on 'play guitar.' If that drops, Joy has no backup."

function detectSinglePoints(behaviors: BehaviorWithSource[]): StructuralInsight | null {
  const dimBehaviors = new Map<DimensionKey, Set<string>>();

  for (const b of behaviors) {
    for (const d of getDimKeys(b)) {
      if (!dimBehaviors.has(d)) dimBehaviors.set(d, new Set());
      dimBehaviors.get(d)!.add(b.text);
    }
  }

  // Find dimensions with exactly 1 behavior (that also have at least SOME coverage, not gaps)
  const singlePoints: { dim: DimensionKey; behavior: string }[] = [];
  for (const [dim, behaviorSet] of dimBehaviors) {
    if (behaviorSet.size === 1) {
      singlePoints.push({ dim, behavior: [...behaviorSet][0] });
    }
  }

  if (singlePoints.length === 0) return null;

  // Pick the most surprising one — dimensions people care about (Joy, People, Purpose)
  const priorityOrder: DimensionKey[] = ["joy", "people", "purpose", "body", "money", "growth", "home", "identity"];
  singlePoints.sort((a, b) => priorityOrder.indexOf(a.dim) - priorityOrder.indexOf(b.dim));

  const sp = singlePoints[0];
  const strength = 0.7; // Single points are always moderately surprising

  return {
    id: crypto.randomUUID(),
    type: "single-point-of-failure",
    title: `${dimLabel(sp.dim)} depends on one behavior`,
    body: `${dimLabel(sp.dim)} depends entirely on "${sp.behavior}." If that drops, ${dimLabel(sp.dim)} has no backup.`,
    dimensions: [sp.dim],
    strength,
    behaviors: [sp.behavior],
  };
}

// ─── Aspiration Overlap ────────────────────────────────────────────────────
// When 2+ aspirations share behaviors or dimensions, surface it.
// "Your fitness goal and your cooking goal both depend on the same evening window."

function detectAspirationOverlap(aspirations: Aspiration[]): StructuralInsight | null {
  if (aspirations.length < 2) return null;

  // Check for shared dimension sets between aspirations
  const aspDims = aspirations.map(a => ({
    name: a.title || a.clarifiedText || a.rawText,
    dims: new Set(
      a.behaviors
        .filter(b => b.enabled !== false)
        .flatMap(b => getDimKeys(b))
    ),
    behaviors: a.behaviors.filter(b => b.enabled !== false),
  }));

  // Find pairs with highest dimension overlap
  let bestOverlap: { a1: string; a2: string; shared: DimensionKey[]; sharedBehaviors: string[] } | null = null;
  let bestScore = 0;

  for (let i = 0; i < aspDims.length; i++) {
    for (let j = i + 1; j < aspDims.length; j++) {
      const shared: DimensionKey[] = [];
      for (const d of aspDims[i].dims) {
        if (aspDims[j].dims.has(d)) shared.push(d);
      }

      // Also check for shared behavior texts
      const iBehaviors = new Set(aspDims[i].behaviors.map(b => b.text.toLowerCase().trim()));
      const jBehaviors = aspDims[j].behaviors.map(b => b.text.toLowerCase().trim());
      const sharedBehaviors = jBehaviors.filter(b => iBehaviors.has(b));

      const score = shared.length + sharedBehaviors.length * 2;
      if (score > bestScore && shared.length >= 2) {
        bestScore = score;
        bestOverlap = {
          a1: aspDims[i].name,
          a2: aspDims[j].name,
          shared,
          sharedBehaviors,
        };
      }
    }
  }

  if (!bestOverlap || bestOverlap.shared.length < 2) return null;

  const sharedNames = bestOverlap.shared.map(dimLabel).join(", ");
  const strength = Math.min(1, 0.3 + bestOverlap.shared.length * 0.15 + bestOverlap.sharedBehaviors.length * 0.1);

  const body = bestOverlap.sharedBehaviors.length > 0
    ? `"${bestOverlap.a1}" and "${bestOverlap.a2}" share behaviors and both touch ${sharedNames}. They're more connected than they look — progress on one feeds the other.`
    : `"${bestOverlap.a1}" and "${bestOverlap.a2}" both touch ${sharedNames}. They compete for the same dimensions — or they reinforce each other. Worth watching.`;

  return {
    id: crypto.randomUUID(),
    type: "aspiration-overlap",
    title: `Two aspirations share ${bestOverlap.shared.length} dimensions`,
    body,
    dimensions: bestOverlap.shared,
    strength,
    behaviors: bestOverlap.sharedBehaviors,
  };
}

// ─── Main Generator ────────────────────────────────────────────────────────

/**
 * Generate structural insights from aspirations alone — no behavioral history needed.
 * Returns insights sorted by strength (most surprising first).
 * Filters to insights that would actually surprise the user.
 */
export function generateStructuralInsights(aspirations: Aspiration[]): StructuralInsight[] {
  const active = aspirations.filter(a => a.status === "active" || !a.status);
  if (active.length === 0) return [];

  const behaviors = flattenBehaviors(active);
  if (behaviors.length === 0) return [];

  const insights: StructuralInsight[] = [];

  const keystone = detectKeystone(behaviors);
  if (keystone) insights.push(keystone);

  const gap = detectDimensionGaps(behaviors);
  if (gap) insights.push(gap);

  const cascade = detectCascades(behaviors);
  if (cascade) insights.push(cascade);

  const singlePoint = detectSinglePoints(behaviors);
  if (singlePoint) insights.push(singlePoint);

  const overlap = detectAspirationOverlap(active);
  if (overlap) insights.push(overlap);

  // Sort by strength (most surprising first), filter out weak insights
  return insights
    .filter(i => i.strength >= 0.3)
    .sort((a, b) => b.strength - a.strength);
}

/**
 * Get the single strongest structural insight — used for sheet throughLine
 * and as the primary Day-1 insight card.
 */
export function getTopStructuralInsight(aspirations: Aspiration[]): StructuralInsight | null {
  const all = generateStructuralInsights(aspirations);
  return all.length > 0 ? all[0] : null;
}
