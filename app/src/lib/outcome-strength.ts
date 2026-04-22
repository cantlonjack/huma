/**
 * REGEN-03 (Plan 02-05): Pure strength-multiplier math for outcome → PatternEvidence.strength.
 *
 * When an operator submits an outcome on a pattern target, the route re-weights
 * the pattern's `evidence.strength` field (range [-1, 1]) according to their
 * answer. This captures ground-truth signal that pure correlation math can't
 * see: the operator's own assessment of whether the pattern actually worked.
 *
 * Multipliers (from 02-CONTEXT.md):
 *   - "yes"   → × 1.25 (capped at 1.0 — matches PatternEvidence.strength bound)
 *   - "some"  → × 1.0  (neutral — no update)
 *   - "no"    → × 0.5  (dampen)
 *   - "worse" → flip sign: strength becomes -Math.abs(strength)
 *
 * Applied in `/api/outcome` route.ts after a pattern-target insert, read-
 * modify-write on `patterns.evidence.strength`. See Plan 02-05 PLAN.md
 * <interfaces> block for the full integration sketch.
 */

export type OutcomeAnswer = "yes" | "some" | "no" | "worse";

export function applyOutcomeToStrength(
  strength: number,
  answer: OutcomeAnswer,
): number {
  switch (answer) {
    case "yes":
      return Math.min(1.0, strength * 1.25);
    case "some":
      return strength;
    case "no":
      return strength * 0.5;
    case "worse":
      return -Math.abs(strength);
    default: {
      // Exhaustiveness check — if the OutcomeAnswer union grows, TS fails here.
      const exhaustive: never = answer;
      throw new Error(`Unhandled outcome: ${String(exhaustive)}`);
    }
  }
}
