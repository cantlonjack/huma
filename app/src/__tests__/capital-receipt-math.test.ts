import { describe, it, expect } from "vitest";
import { buildCapitalReceipt } from "@/lib/capital-receipt";
import { computeCapitalScores, type DimensionActivity } from "@/lib/capital-computation";

/**
 * REGEN-04 reproducibility invariant — Plan 02-03 fills Wave 0 stubs.
 *
 * The receipt MUST show the same numbers the radar uses. This suite asserts
 * parity against the internal `computeCapitalScores()` math for identical
 * input — if either helper ever drifts, this test fails first.
 *
 * Coverage:
 *   - score parity (receipt.score === computeCapitalScores score per form)
 *   - confidence parity (identical 0-1 value)
 *   - avgRate / weightSum / weightedSum internal math
 *   - threshold table has exactly one active row matching score
 *   - zero-contribution capital returns empty contributions + score 1
 *   - confidence-label band map (<33% / 33-80% / 80%+)
 */
describe("REGEN-04: receipt math parity (reproducibility invariant)", () => {
  // living = body:primary (1.0×) + home:secondary (0.5×)
  const activity: DimensionActivity[] = [
    { dimension: "body", completionRate: 24 / 28, totalCompletions: 24 },
    { dimension: "home", completionRate: 10 / 28, totalCompletions: 10 },
  ];

  it("receipt score equals computeCapitalScores score for same inputs", () => {
    const livingReceipt = buildCapitalReceipt(
      "living",
      activity,
      28,
      14,
      new Date().toISOString(),
    );
    const scores = computeCapitalScores(activity, 14, 28, 14);
    const livingScore = scores.find((s) => s.form === "living")!;

    expect(livingReceipt.score).toBe(livingScore.score);
  });

  it("receipt confidence equals computeCapitalScores confidence", () => {
    const livingReceipt = buildCapitalReceipt(
      "living",
      activity,
      28,
      14,
      new Date().toISOString(),
    );
    const scores = computeCapitalScores(activity, 14, 28, 14);
    const livingScore = scores.find((s) => s.form === "living")!;

    expect(livingReceipt.confidence).toBeCloseTo(livingScore.confidence, 6);
  });

  it("receipt avgRate matches internal weighted-sum math", () => {
    // living: body(primary 1.0 × 24/28) + home(secondary 0.5 × 10/28)
    // weightSum = 1.0 + 0.5 = 1.5
    // weightedSum = 24/28 + 0.5 × 10/28 ≈ 0.857 + 0.179 = 1.036
    // avgRate = 1.036 / 1.5 ≈ 0.691 → bucket 4 (0.55-0.75)
    const receipt = buildCapitalReceipt(
      "living",
      activity,
      28,
      14,
      new Date().toISOString(),
    );
    expect(receipt.weightSum).toBeCloseTo(1.5, 3);
    expect(receipt.weightedSum).toBeCloseTo(24 / 28 + 0.5 * (10 / 28), 3);
    expect(receipt.avgRate).toBeCloseTo((24 / 28 + 0.5 * (10 / 28)) / 1.5, 3);
    expect(receipt.score).toBe(4);
  });

  it("threshold table has exactly one active row matching the score", () => {
    const receipt = buildCapitalReceipt(
      "living",
      activity,
      28,
      14,
      new Date().toISOString(),
    );
    const active = receipt.thresholdTable.filter((r) => r.active);
    expect(active).toHaveLength(1);
    expect(active[0].score).toBe(receipt.score);
  });

  it("zero-contribution capital returns score:1 + weightSum:0 + empty contributions", () => {
    // spiritual is secondary for joy, primary for purpose — neither in activity
    const receipt = buildCapitalReceipt(
      "spiritual",
      activity,
      28,
      14,
      new Date().toISOString(),
    );
    expect(receipt.contributions).toHaveLength(0);
    expect(receipt.score).toBe(1);
    expect(receipt.weightSum).toBe(0);
    // No threshold row should light up when there's no contribution
    expect(receipt.thresholdTable.filter((r) => r.active)).toHaveLength(0);
  });

  it("confidenceLabel map — <33% still learning / 33-80% getting clearer / 80%+ well-known", () => {
    const low = buildCapitalReceipt("living", activity, 28, 4, new Date().toISOString());
    const mid = buildCapitalReceipt("living", activity, 28, 7, new Date().toISOString());
    const high = buildCapitalReceipt("living", activity, 28, 13, new Date().toISOString());

    expect(low.confidenceLabel).toBe("still learning"); // 4/14 ≈ 0.286
    expect(mid.confidenceLabel).toBe("getting clearer"); // 7/14 = 0.5
    expect(high.confidenceLabel).toBe("well-known"); // 13/14 ≈ 0.928
  });

  it("contributions record primary (1.0×) and secondary (0.5×) weights with fraction", () => {
    const receipt = buildCapitalReceipt(
      "living",
      activity,
      28,
      14,
      new Date().toISOString(),
    );
    // Body → primary for living
    const body = receipt.contributions.find((c) => c.dimension === "body")!;
    expect(body.weight).toBe(1.0);
    expect(body.label).toBe("primary");
    expect(body.completionsOutOfWindow.numerator).toBe(24);
    expect(body.completionsOutOfWindow.denominator).toBe(28);
    // Home → secondary for living
    const home = receipt.contributions.find((c) => c.dimension === "home")!;
    expect(home.weight).toBe(0.5);
    expect(home.label).toBe("secondary");
    expect(home.completionsOutOfWindow.numerator).toBe(10);
    expect(home.completionsOutOfWindow.denominator).toBe(28);
  });

  it("computedAt is surfaced verbatim on the receipt", () => {
    const iso = "2026-04-20T10:00:00.000Z";
    const receipt = buildCapitalReceipt("living", activity, 28, 14, iso);
    expect(receipt.computedAt).toBe(iso);
  });
});
