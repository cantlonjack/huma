import type { Aspiration, Behavior, Pattern, PatternStep } from "@/types/v2";

/**
 * Extract a pattern from an aspiration's behaviors when a trigger exists.
 *
 * A pattern emerges when:
 * 1. At least one behavior is marked `is_trigger: true` (from decomposition)
 * 2. There are 2+ behaviors (a trigger alone isn't a pattern)
 *
 * The trigger becomes The Decision. The remaining behaviors form the
 * Golden Pathway in their original order.
 *
 * Behaviors without `is_trigger` are standalone (pre-pattern) and
 * don't get bundled into a pattern.
 */
export function extractPatternFromAspiration(
  aspiration: Aspiration
): Pattern | null {
  const behaviors = aspiration.behaviors as (Behavior & { is_trigger?: boolean })[];
  if (!behaviors || behaviors.length < 2) return null;

  const triggerBehavior = behaviors.find(b => b.is_trigger);
  if (!triggerBehavior) return null;

  // Build ordered steps: trigger first, then remaining in order
  const steps: PatternStep[] = [];

  steps.push({
    behaviorKey: triggerBehavior.key,
    text: triggerBehavior.text,
    order: 0,
    isTrigger: true,
  });

  let order = 1;
  for (const b of behaviors) {
    if (b.key === triggerBehavior.key) continue;
    if (b.enabled === false) continue;
    steps.push({
      behaviorKey: b.key,
      text: b.text,
      order,
      isTrigger: false,
    });
    order++;
  }

  // Need at least trigger + 1 step to form a pattern
  if (steps.length < 2) return null;

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    aspirationId: aspiration.id,
    name: aspiration.title || aspiration.clarifiedText || aspiration.rawText,
    trigger: triggerBehavior.text,
    steps,
    timeWindow: undefined,
    validationMetric: undefined,
    validationCount: 0,
    validationTarget: 30,
    status: "finding",
    provenance: { source: "conversation" },
    evidence: { confidence: "seed", contextTags: [] },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Extract patterns from multiple aspirations.
 * Returns only aspirations that have a trigger behavior.
 */
export function extractPatternsFromAspirations(
  aspirations: Aspiration[]
): Pattern[] {
  const patterns: Pattern[] = [];
  for (const asp of aspirations) {
    const pattern = extractPatternFromAspiration(asp);
    if (pattern) patterns.push(pattern);
  }
  return patterns;
}
