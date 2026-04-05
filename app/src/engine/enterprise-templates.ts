// ═══════════════════════════════════════════════════════════════
// HUMA — Enterprise Template Functions
//
// Data lives in @/data/enterprise-templates/ (split by category).
// This file re-exports the data and provides functions that
// format it for injection into system prompts.
// ═══════════════════════════════════════════════════════════════

export type { EnterpriseTemplate } from "@/data/enterprise-templates";
export { ENTERPRISE_TEMPLATES } from "@/data/enterprise-templates";

import { ENTERPRISE_TEMPLATES } from "@/data/enterprise-templates";

// ─── Enterprise Injection into System Prompt ───
// This formats the template data for inclusion in the
// Enterprise phase prompt. The AI uses it as reference
// material — real numbers to draw from, adjusted to the
// operator's specific context.

const CAPITALS_ORDER = ["financial", "material", "living", "social", "intellectual", "experiential", "spiritual", "cultural"] as const;

/**
 * Compute aggregate capital scores across selected enterprises.
 * Returns 8 scores (one per capital form) averaging matched template profiles.
 */
export function computeAggregateCapitalScores(selectedNames: string[]): number[] {
  const matched = selectedNames
    .map((name) =>
      ENTERPRISE_TEMPLATES.find(
        (e) => e.name.toLowerCase() === name.toLowerCase()
      )
    )
    .filter(Boolean);

  if (matched.length === 0) return CAPITALS_ORDER.map(() => 0);

  return CAPITALS_ORDER.map((cap) => {
    const sum = matched.reduce(
      (acc, e) => acc + (e!.capitalProfile[cap]?.score ?? 0),
      0
    );
    return Math.round((sum / matched.length) * 10) / 10;
  });
}

const UNIVERSAL_TEMPLATE_IDS = new Set([
  "primary-employment",
  "freelance-practice",
  "creative-practice",
  "health-practice",
  "financial-restructuring",
  "learning-program",
]);

function isUniversalTemplate(e: { id: string }): boolean {
  return UNIVERSAL_TEMPLATE_IDS.has(e.id);
}

export function buildEnterpriseReferenceBlock(
  fieldType?: "land" | "universal" | "hybrid"
): string {
  const templates = ENTERPRISE_TEMPLATES.filter((e) => {
    if (fieldType === "universal") return isUniversalTemplate(e);
    if (fieldType === "land") return !isUniversalTemplate(e);
    // "hybrid" or undefined — include all
    return true;
  });

  const contextLabel =
    fieldType === "universal"
      ? "life design"
      : fieldType === "land"
        ? "land-based"
        : "land-based and life design";

  let block = `\n\n## Enterprise Reference Data

The following are baseline ${contextLabel} enterprise templates with real numbers from published sources. Use these as STARTING POINTS when recommending enterprises. ALWAYS adjust for the operator's specific:
- Existing capitals, skills, and infrastructure
- Market access, geographic context, and local pricing
- Labor availability and physical capacity
- Regulatory environment and professional requirements

Do NOT copy these templates verbatim. Synthesize them with the operator's Ikigai, Holistic Context, and Situation Reading to produce recommendations that are genuinely specific to their situation.

When presenting numbers, give ranges and be honest about uncertainty.\n\n`;

  for (const e of templates) {
    const universal = isUniversalTemplate(e);
    block += `### ${e.name} (${e.category})\n`;
    block += `${e.description}\n`;
    block += `Scale: ${e.scaleAssumption}\n`;
    block += `Startup: $${e.financials.startupCapital.low.toLocaleString()}-${e.financials.startupCapital.high.toLocaleString()} (${e.financials.startupCapital.notes})\n`;
    block += `Time: ${e.financials.laborHoursPerWeek.inSeason}${universal ? "" : ` in-season, ${e.financials.laborHoursPerWeek.offSeason} off-season`}\n`;
    block += `First Revenue: ${e.financials.timeToFirstRevenue}\n`;
    block += `Year 1: $${e.financials.year1Revenue.low.toLocaleString()}-${e.financials.year1Revenue.high.toLocaleString()} | Year 3: $${e.financials.year3Revenue.low.toLocaleString()}-${e.financials.year3Revenue.high.toLocaleString()}\n`;
    block += `Margin: ${e.financials.grossMargin}\n`;
    if (!universal) {
      block += `Min acreage: ${e.landscapeRequirements.minAcreage}\n`;
    }
    block += `Key synergies: ${e.synergies.slice(0, 3).join("; ")}\n`;
    block += `Fit signals: loves ${e.fitSignals.loves.slice(0, 4).join(", ")}; skills ${e.fitSignals.skills.slice(0, 3).join(", ")}\n`;
    block += `Top capitals: ${Object.entries(e.capitalProfile).filter(([_, v]) => v.score >= 4).map(([k, v]) => `${k} (${v.score}/5)`).join(", ")}\n`;
    block += `Common failures: ${e.commonFailureModes.slice(0, 2).join("; ")}\n\n`;
  }

  return block;
}
