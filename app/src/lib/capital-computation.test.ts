import { describe, it, expect } from "vitest";
import { computeCapitalScores, type DimensionActivity } from "./capital-computation";

/**
 * REGEN-01 unit tests for capital-computation.ts.
 *
 * Replaces Wave 0 `.skip` stubs. Covers:
 *   - confidence formula = min(1, daysSinceFirstBehavior / 14)
 *   - no-multiplier math (confidence is a shader, not a penalty)
 *   - zero-data baseline (score:1, confidence:0, note)
 *   - threshold boundaries unchanged at 0.15/0.35/0.55/0.75
 *   - Fallow-week parity (calendar-day formula — rest does not decrement)
 */
describe("REGEN-01: capital-computation confidence math", () => {
  it("computes confidence = min(1, daysSinceFirstBehavior / 14)", () => {
    const activity: DimensionActivity[] = [
      { dimension: "body", completionRate: 0.5, totalCompletions: 14 },
    ];
    const scores = computeCapitalScores(activity, 14, 28, 7);
    const living = scores.find((s) => s.form === "living")!;
    expect(living.confidence).toBeCloseTo(0.5, 3);
  });

  it("does NOT multiply avgRate by engagement factor (confidence is a shader, not a penalty)", () => {
    // Old math: totalActiveDays=1, windowDays=28 -> engagementFactor = 0.4 + (1/28)*0.6 ~ 0.421
    //           completionRate=0.6 -> adjusted = 0.6 * 0.421 ~ 0.253 -> bucket 2 (0.15-0.35)
    // New math: avgRate = 0.6 directly -> bucket 4 (0.55-0.75)
    const activity: DimensionActivity[] = [
      { dimension: "body", completionRate: 0.6, totalCompletions: 1 },
    ];
    const scores = computeCapitalScores(activity, 1, 28, 14);
    const living = scores.find((s) => s.form === "living")!;
    expect(living.score).toBe(4);
  });

  it("returns confidence: 0 for zero daysSinceFirstBehavior", () => {
    const activity: DimensionActivity[] = [
      { dimension: "body", completionRate: 0.5, totalCompletions: 1 },
    ];
    const scores = computeCapitalScores(activity, 1, 28, 0);
    expect(scores.find((s) => s.form === "living")!.confidence).toBe(0);
  });

  it("returns confidence: 1 for 14+ daysSinceFirstBehavior (clamped)", () => {
    const activity: DimensionActivity[] = [
      { dimension: "body", completionRate: 0.5, totalCompletions: 1 },
    ];
    expect(
      computeCapitalScores(activity, 1, 28, 14).find((s) => s.form === "living")!.confidence,
    ).toBe(1);
    expect(
      computeCapitalScores(activity, 1, 28, 42).find((s) => s.form === "living")!.confidence,
    ).toBe(1);
  });

  it("zero-contribution capital returns { score: 1, confidence: 0, note: 'No activity yet' }", () => {
    const scores = computeCapitalScores([], 0, 28, 30);
    expect(scores).toHaveLength(8);
    for (const s of scores) {
      expect(s.score).toBe(1);
      expect(s.confidence).toBe(0);
      expect(s.note).toBe("No activity yet");
    }
  });

  it("threshold mapping is unchanged (0.15/0.35/0.55/0.75 boundaries)", () => {
    const cases = [
      { rate: 0.14, expected: 1 },
      { rate: 0.16, expected: 2 },
      { rate: 0.34, expected: 2 },
      { rate: 0.36, expected: 3 },
      { rate: 0.54, expected: 3 },
      { rate: 0.56, expected: 4 },
      { rate: 0.74, expected: 4 },
      { rate: 0.76, expected: 5 },
    ];
    for (const { rate, expected } of cases) {
      const activity: DimensionActivity[] = [
        { dimension: "body", completionRate: rate, totalCompletions: 1 },
      ];
      const scores = computeCapitalScores(activity, 14, 28, 14);
      expect(scores.find((s) => s.form === "living")!.score).toBe(expected);
    }
  });

  it("Fallow week does NOT decrement confidence (calendar-day formula)", () => {
    // daysSinceFirstBehavior is calendar days — Fallow days still count toward 14.
    // An operator with 14 calendar days since their first behavior but only 7 active days
    // still hits confidence: 1 because rest doesn't reset the shader.
    const activity: DimensionActivity[] = [
      { dimension: "body", completionRate: 0.5, totalCompletions: 7 },
    ];
    const scores = computeCapitalScores(activity, 7, 28, 14);
    expect(scores.find((s) => s.form === "living")!.confidence).toBe(1);
  });

  it("confidence defaults to 0 when daysSinceFirstBehavior arg omitted (backwards compat)", () => {
    const activity: DimensionActivity[] = [
      { dimension: "body", completionRate: 0.5, totalCompletions: 7 },
    ];
    const scores = computeCapitalScores(activity, 7, 28);
    // Every score object still includes confidence (0 by default)
    for (const s of scores) {
      expect(s.confidence).toBe(0);
    }
  });
});
