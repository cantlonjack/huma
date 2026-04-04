// ─── Capital Score Computation ────────────────────────────────────────────
// Computes the 8 Forms of Capital radar from behavioral data.
// Capital scores are DERIVED from what the operator actually does,
// not self-reported or guessed. Each dimension maps to one or more
// capital forms, and consistency of behavior determines the score.

import type { CapitalForm, CapitalScore } from "@/engine/canvas-types";
import type { DimensionKey } from "@/types/v2";

// ─── Dimension → Capital Mapping ─────────────────────────────────────────
// Each HUMA dimension contributes to one or more capital forms.
// Primary = full contribution, secondary = half contribution.

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

const ALL_CAPITALS: CapitalForm[] = [
  "financial", "material", "living", "social",
  "intellectual", "experiential", "spiritual", "cultural",
];

interface DimensionActivity {
  dimension: DimensionKey;
  completionRate: number; // 0–1 (completions / possible days over window)
  totalCompletions: number;
}

/**
 * Compute capital scores from dimensional behavioral activity.
 *
 * @param dimensionActivity — per-dimension completion rates from behavior_log
 * @param totalActiveDays  — total days with any activity (for baseline calibration)
 * @param windowDays       — observation window size (default 28)
 * @returns CapitalScore[] — 8 capital scores (1–5 scale)
 */
export function computeCapitalScores(
  dimensionActivity: DimensionActivity[],
  totalActiveDays: number,
  windowDays: number = 28,
): CapitalScore[] {
  // Accumulate weighted scores per capital form
  const capitalRaw = new Map<CapitalForm, number>();
  const capitalContributions = new Map<CapitalForm, number>();

  for (const capital of ALL_CAPITALS) {
    capitalRaw.set(capital, 0);
    capitalContributions.set(capital, 0);
  }

  for (const activity of dimensionActivity) {
    const mapping = DIMENSION_CAPITAL_MAP[activity.dimension];
    if (!mapping) continue;

    // Primary: full weight
    for (const cap of mapping.primary) {
      capitalRaw.set(cap, (capitalRaw.get(cap) || 0) + activity.completionRate);
      capitalContributions.set(cap, (capitalContributions.get(cap) || 0) + 1);
    }
    // Secondary: half weight
    for (const cap of mapping.secondary) {
      capitalRaw.set(cap, (capitalRaw.get(cap) || 0) + activity.completionRate * 0.5);
      capitalContributions.set(cap, (capitalContributions.get(cap) || 0) + 0.5);
    }
  }

  // Engagement factor: how active is the operator overall?
  // Scales from 0.4 (minimal use) to 1.0 (daily use)
  const engagementFactor = Math.min(1, 0.4 + (totalActiveDays / windowDays) * 0.6);

  // Convert to 1–5 scale
  const scores: CapitalScore[] = ALL_CAPITALS.map((form) => {
    const raw = capitalRaw.get(form) || 0;
    const contributions = capitalContributions.get(form) || 0;

    if (contributions === 0) {
      // No behavioral data touches this capital — baseline 1
      return { form, score: 1, note: "No activity yet" };
    }

    // Normalize: average contribution rate, scaled by engagement
    const avgRate = raw / contributions;
    const adjusted = avgRate * engagementFactor;

    // Map to 1–5:
    // 0.0–0.15 → 1 (minimal)
    // 0.15–0.35 → 2 (emerging)
    // 0.35–0.55 → 3 (developing)
    // 0.55–0.75 → 4 (strong)
    // 0.75–1.0  → 5 (thriving)
    let score: number;
    if (adjusted < 0.15) score = 1;
    else if (adjusted < 0.35) score = 2;
    else if (adjusted < 0.55) score = 3;
    else if (adjusted < 0.75) score = 4;
    else score = 5;

    const note = generateCapitalNote(form, score, avgRate);
    return { form, score, note };
  });

  return scores;
}

function generateCapitalNote(form: CapitalForm, score: number, rate: number): string {
  const labels: Record<CapitalForm, string> = {
    financial: "Financial stability",
    material: "Physical resources",
    living: "Health and vitality",
    social: "Relationships",
    intellectual: "Knowledge and skill",
    experiential: "Lived experience",
    spiritual: "Meaning and purpose",
    cultural: "Cultural engagement",
  };

  const level = score >= 4 ? "strong" : score >= 3 ? "developing" : score >= 2 ? "emerging" : "quiet";
  return `${labels[form]} — ${level}`;
}

/**
 * Build DimensionActivity[] from a behavioral summary's dimensionCounts.
 * This bridges getBehavioralSummary() output to computeCapitalScores() input.
 */
export function dimensionActivityFromCounts(
  dimensionCounts: Record<string, number>,
  totalActiveDays: number,
  windowDays: number = 28,
): DimensionActivity[] {
  const validDimensions: DimensionKey[] = [
    "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
  ];

  return validDimensions
    .filter((dim) => (dimensionCounts[dim] || 0) > 0)
    .map((dim) => ({
      dimension: dim,
      // completionRate: total completions for this dimension / (active days * rough avg behaviors per dim)
      // Normalize so that a dimension touched every active day ≈ 1.0
      completionRate: Math.min(1, (dimensionCounts[dim] || 0) / Math.max(totalActiveDays, 1)),
      totalCompletions: dimensionCounts[dim] || 0,
    }));
}
