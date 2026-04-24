// ─── Capital Receipt Builder ──────────────────────────────────────────────
// REGEN-04 Plan 02-03: pure helper that computes a user-visible "receipt" for
// any capital form — contributions, weights, fractions, weighted sum, bucket,
// confidence, computed-at. Shares its math with capital-computation.ts so the
// numbers shown in the receipt byte-for-byte match the radar's internal
// scoring. Reproducibility is the whole point of this surface: sovereignty
// means a patient user with a calculator can verify the score themselves.
//
// Kept in sync with capital-computation.ts by a dedicated parity test
// (src/__tests__/capital-receipt-math.test.ts). If either diverges, that
// test fails first.

import type { CapitalForm } from "@/engine/canvas-types";
import type { DimensionKey } from "@/types/v2";

// Duplicated intentionally from capital-computation.ts — parity test guards drift.
const DIMENSION_CAPITAL_MAP: Record<DimensionKey, { primary: CapitalForm[]; secondary: CapitalForm[] }> = {
  body:     { primary: ["living"],        secondary: ["experiential"] },
  people:   { primary: ["social"],        secondary: ["cultural"] },
  money:    { primary: ["financial"],     secondary: ["material"] },
  home:     { primary: ["material"],      secondary: ["living"] },
  growth:   { primary: ["intellectual"],  secondary: ["experiential"] },
  joy:      { primary: ["experiential"],  secondary: ["spiritual", "cultural"] },
  purpose:  { primary: ["spiritual"],     secondary: ["intellectual"] },
  identity: { primary: ["cultural"],      secondary: ["spiritual", "social"] },
};

const CAPITAL_DISPLAY_LABELS: Record<CapitalForm, string> = {
  financial: "Financial",
  material: "Material",
  living: "Living",
  social: "Social",
  intellectual: "Intellectual",
  experiential: "Experiential",
  spiritual: "Spiritual",
  cultural: "Cultural",
};

// Threshold bands match computeCapitalScores() (avgRate < 0.15 → 1, etc.).
// Top band max is 1.01 so that avgRate === 1.0 lands in bucket 5 (strict-less-than).
const THRESHOLDS = [
  { min: 0.00, max: 0.15, score: 1 },
  { min: 0.15, max: 0.35, score: 2 },
  { min: 0.35, max: 0.55, score: 3 },
  { min: 0.55, max: 0.75, score: 4 },
  { min: 0.75, max: 1.01, score: 5 },
] as const;

export interface DimensionContribution {
  dimension: DimensionKey;
  weight: 1.0 | 0.5;
  label: "primary" | "secondary";
  completionRate: number;
  completionsOutOfWindow: { numerator: number; denominator: number };
  weightedContribution: number;
}

export interface CapitalReceiptData {
  form: CapitalForm;
  label: string;
  score: number;
  confidence: number;
  confidenceLabel: "still learning" | "getting clearer" | "well-known";
  contributions: DimensionContribution[];
  weightSum: number;
  weightedSum: number;
  avgRate: number;
  thresholdTable: Array<{ min: number; max: number; score: number; active: boolean }>;
  computedAt: string;
}

function bucketFor(avgRate: number): number {
  for (const t of THRESHOLDS) {
    if (avgRate >= t.min && avgRate < t.max) return t.score;
  }
  // Shouldn't reach here given avgRate ∈ [0, 1] and the 1.01 top-band max,
  // but be defensive — return 1 as the baseline score.
  return 1;
}

function confidenceLabelFor(c: number): "still learning" | "getting clearer" | "well-known" {
  if (c < 0.33) return "still learning";
  if (c < 0.80) return "getting clearer";
  return "well-known";
}

/**
 * Build a receipt for one capital form from the same dimension-activity inputs
 * `computeCapitalScores` receives. Output mirrors the internal math step by step
 * so the user can verify their score.
 *
 * @param form                   — the capital being inspected (e.g., "living")
 * @param dimensionActivity      — per-dimension completion rates from behavior_log
 * @param windowDays             — observation window size (e.g., 28)
 * @param daysSinceFirstBehavior — calendar days since first behavior (feeds confidence)
 * @param computedAt             — ISO timestamp to embed in the receipt
 */
export function buildCapitalReceipt(
  form: CapitalForm,
  dimensionActivity: Array<{ dimension: DimensionKey; completionRate: number; totalCompletions: number }>,
  windowDays: number,
  daysSinceFirstBehavior: number,
  computedAt: string,
): CapitalReceiptData {
  const contributions: DimensionContribution[] = [];

  for (const activity of dimensionActivity) {
    const mapping = DIMENSION_CAPITAL_MAP[activity.dimension];
    if (!mapping) continue;

    if (mapping.primary.includes(form)) {
      contributions.push({
        dimension: activity.dimension,
        weight: 1.0,
        label: "primary",
        completionRate: activity.completionRate,
        completionsOutOfWindow: { numerator: activity.totalCompletions, denominator: windowDays },
        weightedContribution: 1.0 * activity.completionRate,
      });
    } else if (mapping.secondary.includes(form)) {
      contributions.push({
        dimension: activity.dimension,
        weight: 0.5,
        label: "secondary",
        completionRate: activity.completionRate,
        completionsOutOfWindow: { numerator: activity.totalCompletions, denominator: windowDays },
        weightedContribution: 0.5 * activity.completionRate,
      });
    }
  }

  const weightSum = contributions.reduce((s, c) => s + c.weight, 0);
  const weightedSum = contributions.reduce((s, c) => s + c.weightedContribution, 0);
  const avgRate = weightSum > 0 ? weightedSum / weightSum : 0;

  // Zero-contribution capitals land at score 1 (mirror computeCapitalScores baseline).
  const score = contributions.length === 0 ? 1 : bucketFor(avgRate);
  const confidence = Math.min(1, Math.max(0, daysSinceFirstBehavior / 14));
  const confidenceLabel = confidenceLabelFor(confidence);

  const thresholdTable = THRESHOLDS.map((t) => ({
    min: t.min,
    max: t.max,
    score: t.score,
    active: contributions.length > 0 && avgRate >= t.min && avgRate < t.max,
  }));

  return {
    form,
    label: CAPITAL_DISPLAY_LABELS[form],
    score,
    confidence,
    confidenceLabel,
    contributions,
    weightSum,
    weightedSum,
    avgRate,
    thresholdTable,
    computedAt,
  };
}
