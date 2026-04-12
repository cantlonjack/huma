// ─── Hypothesized Correlations ─────────────────────────────────────────────
// Context-seeded hypotheses that don't require behavioral data.
// Uses KnownContext + aspirations to generate plausible correlations
// that convert to validated insights once data confirms them.
//
// Clearly labeled as hypotheses: "HUMA suspects..." not "HUMA sees..."
// No Claude API calls — pure computation.

import type { Aspiration, DimensionKey, KnownContext } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { DIMENSION_LABELS } from "@/types/v2";
import { getEffectiveDimensions } from "@/types/v2";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface HypothesizedCorrelation {
  id: string;
  hypothesis: string;
  dimensions: DimensionKey[];
  confidence: "low" | "medium" | "high";
  dataNeeded: string; // what check-off data would confirm/deny
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function dimLabel(d: DimensionKey): string {
  return DIMENSION_LABELS[d] || d;
}

function getBehaviorDims(b: { dimensions: Array<{ dimension: DimensionKey }> }): DimensionKey[] {
  return (b.dimensions || []).map(d => d.dimension);
}

// ─── Hypothesis Generators ─────────────────────────────────────────────────

/**
 * Time constraint conflicts: when behaviors from different aspirations
 * compete for the same time block (e.g., evening).
 */
function detectTimeConflicts(
  aspirations: Aspiration[],
  context: Partial<HumaContext> | KnownContext | null
): HypothesizedCorrelation | null {
  if (aspirations.length < 2) return null;

  // Look for time-of-day cues in behavior details
  const eveningBehaviors: { text: string; aspirationName: string }[] = [];
  const morningBehaviors: { text: string; aspirationName: string }[] = [];

  const eveningKeywords = ["dinner", "evening", "night", "pm", "after work", "bedtime", "supper"];
  const morningKeywords = ["morning", "am", "breakfast", "wake", "sunrise", "early"];

  for (const a of aspirations) {
    const name = a.title || a.clarifiedText || a.rawText;
    for (const b of a.behaviors.filter(b => b.enabled !== false)) {
      const text = `${b.text} ${b.detail || ""}`.toLowerCase();
      if (eveningKeywords.some(k => text.includes(k))) {
        eveningBehaviors.push({ text: b.text, aspirationName: name });
      }
      if (morningKeywords.some(k => text.includes(k))) {
        morningBehaviors.push({ text: b.text, aspirationName: name });
      }
    }
  }

  // Check if multiple aspirations are competing for the same window
  const eveningAspirations = new Set(eveningBehaviors.map(b => b.aspirationName));
  const morningAspirations = new Set(morningBehaviors.map(b => b.aspirationName));

  if (eveningAspirations.size >= 2) {
    const names = [...eveningAspirations].slice(0, 2);
    return {
      id: crypto.randomUUID(),
      hypothesis: `"${names[0]}" and "${names[1]}" both need your evening. That window is carrying more than it looks — if one expands, the other gets squeezed.`,
      dimensions: ["people", "joy"],
      confidence: "medium",
      dataNeeded: "5+ days of check-off data for evening behaviors from both aspirations",
    };
  }

  if (morningAspirations.size >= 2) {
    const names = [...morningAspirations].slice(0, 2);
    return {
      id: crypto.randomUUID(),
      hypothesis: `"${names[0]}" and "${names[1]}" both compete for your morning. Mornings are finite — one of these will consistently win.`,
      dimensions: ["body", "growth"],
      confidence: "medium",
      dataNeeded: "5+ days of check-off data for morning behaviors from both aspirations",
    };
  }

  return null;
}

/**
 * Context-dimension coupling: when known context signals stress
 * in a dimension that behaviors also target.
 */
function detectContextCoupling(
  aspirations: Aspiration[],
  context: Partial<HumaContext> | KnownContext | null
): HypothesizedCorrelation | null {
  if (!context) return null;

  const humaCtx = context as Partial<HumaContext>;
  const knownCtx = context as KnownContext;

  // Check for financial stress signals
  const hasFinancialStress = Boolean(
    knownCtx.financial?.situation?.match(/tight|debt|stress|payoff|struggling/i) ||
    knownCtx.financial?.constraints?.length ||
    humaCtx.money?.constraints?.length ||
    humaCtx.money?.debt
  );

  // Check for sleep/health signals
  const hasHealthConcern = Boolean(
    knownCtx.health?.detail?.match(/sleep|insomnia|fatigue|chronic|pain/i) ||
    humaCtx.body?.sleep?.match(/poor|bad|insomnia|trouble|hours/i) ||
    humaCtx.body?.conditions?.some(c => /sleep|fatigue|chronic/i.test(c))
  );

  // Check if behaviors target both stressed dimensions
  const allDims = new Set<DimensionKey>();
  for (const a of aspirations) {
    for (const b of a.behaviors.filter(b => b.enabled !== false)) {
      for (const d of getEffectiveDimensions(b)) {
        allDims.add(d.dimension);
      }
    }
  }

  if (hasFinancialStress && hasHealthConcern && allDims.has("money") && allDims.has("body")) {
    return {
      id: crypto.randomUUID(),
      hypothesis: `You mentioned money pressure and health concerns in the same context. In most people, these are tightly coupled — ${dimLabel("money")} drops, ${dimLabel("body")} follows within days.`,
      dimensions: ["money", "body"],
      confidence: "high",
      dataNeeded: "7+ days of check-off data for Money and Body behaviors to confirm coupling",
    };
  }

  if (hasFinancialStress && allDims.has("money") && allDims.has("joy")) {
    return {
      id: crypto.randomUUID(),
      hypothesis: `Money stress tends to quietly erode ${dimLabel("joy")}. Not because joy costs money — because stress narrows your attention. Worth tracking whether your joy behaviors drop on financially stressful days.`,
      dimensions: ["money", "joy"],
      confidence: "medium",
      dataNeeded: "7+ days of Money and Joy behavior check-offs to detect coupling",
    };
  }

  if (hasHealthConcern && allDims.has("body") && allDims.has("growth")) {
    return {
      id: crypto.randomUUID(),
      hypothesis: `When ${dimLabel("body")} is strained, ${dimLabel("growth")} is usually the first thing to get cut. Not because it's unimportant — because it feels optional when energy is low.`,
      dimensions: ["body", "growth"],
      confidence: "medium",
      dataNeeded: "7+ days of Body and Growth behavior check-offs to confirm pattern",
    };
  }

  return null;
}

/**
 * People-dimension loading: when behaviors heavily involve household members,
 * People becomes a dependency rather than just a dimension.
 */
function detectPeopleDependency(
  aspirations: Aspiration[],
  context: Partial<HumaContext> | KnownContext | null
): HypothesizedCorrelation | null {
  if (!context) return null;

  const humaCtx = context as Partial<HumaContext>;
  const knownCtx = context as KnownContext;

  const hasPeople = Boolean(
    (knownCtx.people && knownCtx.people.length > 0) ||
    (humaCtx.people?.household && humaCtx.people.household.length > 0)
  );

  if (!hasPeople) return null;

  // Count behaviors that reference people keywords
  const peopleKeywords = ["family", "kid", "child", "partner", "wife", "husband", "together", "dinner with", "play with"];
  let peopleBehaviorCount = 0;
  let totalBehaviorCount = 0;

  for (const a of aspirations) {
    for (const b of a.behaviors.filter(b => b.enabled !== false)) {
      totalBehaviorCount++;
      const text = `${b.text} ${b.detail || ""}`.toLowerCase();
      if (peopleKeywords.some(k => text.includes(k))) {
        peopleBehaviorCount++;
      }
    }
  }

  if (peopleBehaviorCount >= 2 && peopleBehaviorCount / totalBehaviorCount >= 0.25) {
    return {
      id: crypto.randomUUID(),
      hypothesis: `${peopleBehaviorCount} of your ${totalBehaviorCount} behaviors involve other people. Your system depends on coordination — when someone else's schedule shifts, your whole day reshuffles.`,
      dimensions: ["people"],
      confidence: "medium",
      dataNeeded: "7+ days of check-off data to see if people-dependent behaviors have lower completion rates",
    };
  }

  return null;
}

/**
 * Energy bottleneck: when a single dimension carries too many behaviors,
 * suggesting it's a bottleneck for the whole system.
 */
function detectEnergyBottleneck(
  aspirations: Aspiration[]
): HypothesizedCorrelation | null {
  const dimCounts = new Map<DimensionKey, number>();
  let totalBehaviors = 0;

  for (const a of aspirations) {
    for (const b of a.behaviors.filter(b => b.enabled !== false)) {
      totalBehaviors++;
      for (const effect of getEffectiveDimensions(b)) {
        dimCounts.set(effect.dimension, (dimCounts.get(effect.dimension) || 0) + 1);
      }
    }
  }

  if (totalBehaviors < 4) return null;

  // Find overloaded dimensions (>50% of behaviors touch it)
  let maxDim: DimensionKey | null = null;
  let maxCount = 0;

  for (const [dim, count] of dimCounts) {
    if (count > maxCount) {
      maxCount = count;
      maxDim = dim;
    }
  }

  if (!maxDim || maxCount / totalBehaviors < 0.5) return null;

  return {
    id: crypto.randomUUID(),
    hypothesis: `${dimLabel(maxDim)} shows up in ${maxCount} of your ${totalBehaviors} behaviors. If ${dimLabel(maxDim)} has a bad day, most of your system feels it. That's not wrong — but it's worth knowing.`,
    dimensions: [maxDim],
    confidence: "medium",
    dataNeeded: `7+ days of check-off data to see if ${dimLabel(maxDim)} behavior completion predicts other dimensions`,
  };
}

// ─── Main Generator ────────────────────────────────────────────────────────

/**
 * Generate hypothesized correlations from context + aspirations.
 * These are clearly labeled as hypotheses — not validated insights.
 *
 * Accepts either HumaContext (new) or KnownContext (legacy).
 */
export function generateHypothesizedCorrelations(
  aspirations: Aspiration[],
  context: Partial<HumaContext> | KnownContext | null
): HypothesizedCorrelation[] {
  const active = aspirations.filter(a => a.status === "active" || !a.status);
  if (active.length === 0) return [];

  const hypotheses: HypothesizedCorrelation[] = [];

  const timeConflict = detectTimeConflicts(active, context);
  if (timeConflict) hypotheses.push(timeConflict);

  const contextCoupling = detectContextCoupling(active, context);
  if (contextCoupling) hypotheses.push(contextCoupling);

  const peopleDep = detectPeopleDependency(active, context);
  if (peopleDep) hypotheses.push(peopleDep);

  const bottleneck = detectEnergyBottleneck(active);
  if (bottleneck) hypotheses.push(bottleneck);

  // Sort: high confidence first
  const confOrder = { high: 0, medium: 1, low: 2 };
  hypotheses.sort((a, b) => confOrder[a.confidence] - confOrder[b.confidence]);

  return hypotheses;
}
