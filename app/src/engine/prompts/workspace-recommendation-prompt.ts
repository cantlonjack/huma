/**
 * Workspace Recommendation Prompt — two-tier system based on context depth.
 *
 * Tier 1 (Lotus Flow only): Archetype + capitals + first pattern. Directional.
 * Tier 2 (Lotus Flow + Ikigai): Sharper — references what they love, connects
 *   to capital shape, suggests a move aligned with their Ikigai.
 */

import type { OperatorContext } from "@/types/lotus";

export type RecommendationTier = 1 | 2;

export function getRecommendationTier(context: OperatorContext): RecommendationTier {
  return context.ikigai?.synthesis ? 2 : 1;
}

function buildTier1SystemPrompt(): string {
  return `You are HUMA. You help people see their life as a connected system.

An operator has their initial context: archetype, capital profile, strengths, and growth areas. You know their shape but not yet what drives them.

Write ONE recommendation. 1-2 sentences maximum.

Rules:
- Name what their capital shape suggests as a next move
- Reference their strongest capital and how it could address a growth area
- Be directional — point toward a pattern, not a specific action yet
- DO NOT say "based on what you shared" or "from your profile"
- DO NOT use framework language (capitals, archetype names, RPPL)
- Use plain human terms. Warm, direct, spare.
- DO NOT cheerleader. No "great job" or "you've got this."

Respond in JSON: { "recommendation": "...", "pattern": "short pattern name or null" }`;
}

function buildTier2SystemPrompt(): string {
  return `You are HUMA. You help people see their life as a connected system.

An operator has deep context: their capital shape, archetype, AND their Ikigai — what they love, what they're good at, what the world needs, and the synthesis of where those intersect.

Write ONE recommendation. 1-2 sentences maximum. This should be NOTICEABLY more specific than a general recommendation. Reference what they love. Connect it to their capital shape. Suggest a concrete move aligned with their Ikigai.

Rules:
- The operator should think "this got way more specific"
- Reference something from their Ikigai directly — what they love or what they're good at
- Connect it to where their capital shape has leverage
- Name a specific move, not a vague direction
- DO NOT say "based on what you shared" or "your Ikigai shows"
- DO NOT use framework language
- Warm, direct, spare. Like a neighbor who sees the whole picture.
- DO NOT cheerleader.

Respond in JSON: { "recommendation": "...", "pattern": "short pattern name or null" }`;
}

export function buildRecommendationSystemPrompt(tier: RecommendationTier): string {
  return tier === 2 ? buildTier2SystemPrompt() : buildTier1SystemPrompt();
}

export function buildRecommendationMessage(
  context: OperatorContext,
  tier: RecommendationTier
): string {
  const caps = context.capitals ?? ({} as Record<string, number>);
  const capitalEntries = Object.entries(caps).sort(([, a], [, b]) => b - a);
  const strongest = capitalEntries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}/10`)
    .join(", ");
  const weakest = capitalEntries
    .slice(-2)
    .map(([k, v]) => `${k}: ${v}/10`)
    .join(", ");

  let msg = `Operator: ${context.name || "Unknown"}
Entity: ${context.entityType || "person"}
Stage: ${context.stage || "starting"}
Archetype: ${context.archetype || "Unknown"}
Strongest: ${strongest}
Growth areas: ${weakest}`;

  if (tier === 2 && context.ikigai) {
    const ik = context.ikigai;
    const loves = [...(ik.love || []), ...(ik.loveCards || [])];
    const goods = [...(ik.good || []), ...(ik.goodCards || [])];
    const needs = [...(ik.need || []), ...(ik.needCards || [])];

    msg += `\n\nWhat they love: ${loves.join(", ")}
What they're good at: ${goods.join(", ")}
What the world needs: ${needs.join(", ")}`;

    if (ik.synthesis) {
      msg += `\nIkigai synthesis: ${ik.synthesis}`;
    }
  }

  return msg;
}
