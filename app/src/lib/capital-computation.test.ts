import { describe, it } from "vitest";

/**
 * REGEN-01 unit-test surface for capital-computation.ts.
 *
 * Wave 0 placeholder — Plan 02-01 replaces each `.skip` with real
 * assertions. Covers:
 *   - confidence formula = min(1, daysSinceFirstBehavior / 14)
 *   - no-multiplier math (confidence is a shader, not a penalty)
 *   - zero-data dashed treatment (score:1, confidence:0, note)
 *   - threshold boundaries unchanged at 0.15/0.35/0.55/0.75
 */
describe("REGEN-01: capital-computation confidence math", () => {
  it.skip("computes confidence = min(1, daysSinceFirstBehavior / 14)", () => {
    // Plan 02-01 fills this
  });

  it.skip("does NOT multiply avgRate by engagement factor (confidence is a shader, not a penalty)", () => {
    // Plan 02-01 fills this — assert avgRate === adjusted math removed from line 90
  });

  it.skip("returns confidence: 0 for zero daysSinceFirstBehavior", () => {
    // Plan 02-01 fills this
  });

  it.skip("returns confidence: 1 for 14+ daysSinceFirstBehavior (clamped)", () => {
    // Plan 02-01 fills this
  });

  it.skip("zero-contribution capital returns { score: 1, confidence: 0, note: 'No activity yet' }", () => {
    // Plan 02-01 fills this
  });

  it.skip("threshold mapping is unchanged (0.15/0.35/0.55/0.75 boundaries)", () => {
    // Plan 02-01 fills this
  });
});
