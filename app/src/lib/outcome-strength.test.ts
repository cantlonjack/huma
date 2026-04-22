import { describe, it, expect } from "vitest";
import { applyOutcomeToStrength } from "./outcome-strength";

/**
 * REGEN-03 Plan 02-05: Strength multiplier math tests.
 *
 * Replaces Wave 0 .skip stubs with real assertions. Validates the four-answer
 * switch matches the 02-CONTEXT.md spec: Yes × 1.25 cap / Some × 1.0 neutral /
 * No × 0.5 / Worse flips sign.
 */

describe("REGEN-03: outcome -> PatternEvidence.strength multiplier", () => {
  it("answer:'yes' multiplies strength by 1.25 and caps at 1.0", () => {
    expect(applyOutcomeToStrength(0.5, "yes")).toBeCloseTo(0.625, 5);
    expect(applyOutcomeToStrength(0.8, "yes")).toBe(1.0); // 1.0 cap
    expect(applyOutcomeToStrength(0.9, "yes")).toBe(1.0); // 1.0 cap
  });

  it("answer:'some' is neutral (x1.0)", () => {
    expect(applyOutcomeToStrength(0.5, "some")).toBe(0.5);
    expect(applyOutcomeToStrength(-0.3, "some")).toBe(-0.3);
    expect(applyOutcomeToStrength(0, "some")).toBe(0);
  });

  it("answer:'no' dampens strength by 0.5", () => {
    expect(applyOutcomeToStrength(0.8, "no")).toBe(0.4);
    expect(applyOutcomeToStrength(-0.6, "no")).toBe(-0.3);
    expect(applyOutcomeToStrength(0, "no")).toBe(0);
  });

  it("answer:'worse' flips sign: strength becomes -abs(strength)", () => {
    expect(applyOutcomeToStrength(0.5, "worse")).toBe(-0.5);
    expect(applyOutcomeToStrength(-0.3, "worse")).toBe(-0.3); // already neg, stays neg
  });

  it("applying on strength already at 1.0 + 'yes' stays at 1.0 (cap)", () => {
    expect(applyOutcomeToStrength(1.0, "yes")).toBe(1.0);
  });

  it("applying on negative strength + 'worse' stays negative (double-flip floor)", () => {
    // -abs(-0.5) = -0.5 (unchanged, NOT positive 0.5)
    expect(applyOutcomeToStrength(-0.5, "worse")).toBe(-0.5);
    // -abs(-1.0) = -1.0
    expect(applyOutcomeToStrength(-1.0, "worse")).toBe(-1.0);
  });
});
