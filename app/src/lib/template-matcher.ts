import { decompositionTemplates, type DecompositionTemplate, type AspirationVariant } from "@/engine/decomposition-templates";

/**
 * Match operator aspiration text to the closest decomposition template.
 * Uses keyword overlap scoring — no AI call needed for matching.
 */

interface TemplateMatch {
  template: DecompositionTemplate;
  score: number;
}

const KEYWORD_MAP: Record<string, string[]> = {
  "tmpl-eat-real-food": ["eat", "food", "cook", "cooking", "meal", "dinner", "nutrition", "diet", "healthy", "takeout", "processed", "animal", "keto", "whole", "clean", "local", "seasonal"],
  "tmpl-get-out-of-debt": ["debt", "owe", "credit", "loan", "bills", "payments", "financial", "broke", "behind"],
  "tmpl-move-body": ["move", "exercise", "walk", "run", "gym", "workout", "fitness", "active", "sedentary", "movement", "physical"],
  "tmpl-time-with-kids": ["kids", "children", "parenting", "family", "daughter", "son", "parent", "child"],
  "tmpl-sleep-well": ["sleep", "insomnia", "tired", "rest", "bedtime", "wake", "exhausted", "fatigue", "nap"],
  "tmpl-save-money": ["save", "saving", "savings", "money", "budget", "emergency", "fund", "spend", "spending"],
  "tmpl-grow-food": ["grow", "garden", "gardening", "plant", "homestead", "compost", "seed", "harvest", "farm"],
  "tmpl-less-stress": ["stress", "anxiety", "overwhelm", "calm", "relax", "peace", "burnout", "pressure", "overworked", "busy"],
};

export function matchTemplate(aspirationText: string): DecompositionTemplate | null {
  const words = aspirationText.toLowerCase().split(/\s+/);
  let bestMatch: TemplateMatch | null = null;

  for (const template of decompositionTemplates) {
    const keywords = KEYWORD_MAP[template.id] || [];
    let score = 0;

    for (const word of words) {
      if (keywords.includes(word)) score++;
      // Partial match for longer words
      for (const kw of keywords) {
        if (word.length > 3 && kw.startsWith(word.slice(0, 4))) score += 0.5;
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { template, score };
    }
  }

  return bestMatch && bestMatch.score >= 1 ? bestMatch.template : null;
}

/**
 * Match a clarification selection to a specific variant within a template.
 */
export function matchVariant(template: DecompositionTemplate, selectionText: string): AspirationVariant | null {
  const lower = selectionText.toLowerCase();

  for (const variant of template.variants) {
    const labelWords = variant.label.toLowerCase().split(/\s+/);
    const descWords = variant.description.toLowerCase().split(/\s+/);
    const allWords = [...labelWords, ...descWords];

    let score = 0;
    for (const word of lower.split(/\s+/)) {
      if (allWords.includes(word)) score++;
    }

    // Also check if the selection text contains the label
    if (lower.includes(variant.label.toLowerCase())) return variant;
    if (score >= 2) return variant;
  }

  // Default to first variant
  return template.variants[0];
}

/**
 * Format a template for injection into the Claude system prompt.
 * Includes behaviors, specificity hints, dimensional effects, and failure modes.
 */
export function formatTemplateForPrompt(template: DecompositionTemplate, variant?: AspirationVariant): string {
  const v = variant || template.variants[0];

  const behaviorsStr = v.behaviors.map(b => {
    const dims = b.dimensions.map(d => `${d.dimension} (${d.direction})`).join(", ");
    return `  - ${b.text}
    Frequency: ${b.frequency}${b.defaultDays ? ` (${b.defaultDays.join(", ")})` : ""}
    Time: ${b.timeEstimate}
    Dimensions: ${dims}
    Specificity: ${b.specificityHints}
    Context needed: ${b.contextDependencies.join(", ") || "none"}`;
  }).join("\n");

  const failuresStr = v.commonFailures.map(f =>
    `  - Signal: ${f.signal}\n    Cause: ${f.likelyCause}\n    Adjustment: ${f.adjustment}`
  ).join("\n");

  return `TEMPLATE MATCH: "${template.aspirationText}" → variant: "${v.label}"
${v.description}

BEHAVIORS:
${behaviorsStr}

COMMON FAILURES (use these to adapt if behaviors aren't sticking):
${failuresStr}`;
}

/**
 * Format specificity hints for sheet compilation.
 * Returns a map of behavior_key → specificityHint.
 */
export function getSpecificityHints(template: DecompositionTemplate, variant?: AspirationVariant): Record<string, string> {
  const v = variant || template.variants[0];
  const hints: Record<string, string> = {};
  for (const b of v.behaviors) {
    hints[b.key] = b.specificityHints;
  }
  return hints;
}
