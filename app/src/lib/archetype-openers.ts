import { getDomainTemplate } from "@/data/archetype-templates";

// ─── Archetype-Aware Opening Messages ──────────────────────────────────────
// When the operator selects archetypes, HUMA opens with context instead of
// a blank "What's going on?" The opening references template aspirations
// by name if they exist (template path) or asks an archetype-specific
// question (blank-slate path).

interface OpenerConfig {
  /** Opening when templates were pre-populated — references starter aspiration names */
  withTemplates: (aspirationNames: string[]) => string;
  /** Opening when operator chose "start blank" — archetype-specific question */
  blank: string;
}

const DOMAIN_OPENERS: Record<string, OpenerConfig> = {
  "Earth Tender": {
    withTemplates: (names) =>
      `Earth Tender — so the land is the center of it. I've started you with a couple of things that tend to come up: ${names.join(" and ")}. Tell me what's actually going on and we'll adjust.`,
    blank:
      "Earth Tender — so the land is the center of it. What's the thing that keeps not working the way it should?",
  },
  "Creator": {
    withTemplates: (names) =>
      `Creator — so the work matters. I've started with a couple of things that tend to come up: ${names.join(" and ")}. Tell me what's actually going on and we'll adjust.`,
    blank:
      "Creator — so the work matters. What's the thing that keeps getting in the way of the making?",
  },
  "Entrepreneur": {
    withTemplates: (names) =>
      `Entrepreneur — so you're building something. I've started with: ${names.join(" and ")}. Tell me what's actually going on and we'll shape it to fit.`,
    blank:
      "Entrepreneur — so you're building something. What's the part that isn't running the way it should?",
  },
  "Official": {
    withTemplates: (names) =>
      `Official — you hold structure for others. I've started with: ${names.join(" and ")}. Tell me what's actually weighing on you and we'll adjust.`,
    blank:
      "Official — you hold structure for others. What's the thing you carry home that you shouldn't have to?",
  },
  "Economic Shaper": {
    withTemplates: (names) =>
      `Economic Shaper — money as a tool, not just a score. I've started with: ${names.join(" and ")}. Tell me what's actually going on and we'll refine.`,
    blank:
      "Economic Shaper — money as a tool, not just a score. Where's the gap between how your resources move and how you want them to?",
  },
  "Spirit": {
    withTemplates: (names) =>
      `Spirit — inner life drives outer life. I've started with: ${names.join(" and ")}. Tell me what's actually going on and we'll adjust.`,
    blank:
      "Spirit — inner life drives outer life. What's the gap between what you practice and how your days actually go?",
  },
  "Media": {
    withTemplates: (names) =>
      `Media — you shape how people see. I've started with: ${names.join(" and ")}. Tell me what's actually going on and we'll shape it.`,
    blank:
      "Media — you shape how people see. What's the thing that keeps pulling you away from the work that's actually yours?",
  },
  "Educator": {
    withTemplates: (names) =>
      `Educator — knowledge is your material. I've started with: ${names.join(" and ")}. Tell me what's actually going on and we'll adjust.`,
    blank:
      "Educator — knowledge is your material. What's the part of the work that's draining instead of filling?",
  },
  "Parent": {
    withTemplates: (names) =>
      `Parent — the kids are the organizing principle right now. I've started with: ${names.join(" and ")}. Tell me what's actually not working and we'll adjust.`,
    blank:
      "Parent — so the kids are the organizing principle right now. What's the thing that keeps not working?",
  },
};

/**
 * Build the archetype-aware opening message for the conversation.
 *
 * @param archetypes - Selected archetype names (domains + orientations)
 * @param hasTemplates - Whether template aspirations were pre-populated
 * @param templateAspirationNames - Names of pre-populated template aspirations (if any)
 * @returns Opening message string, or null if no archetype was selected (skip path)
 */
export function getArchetypeOpener(
  archetypes: string[] | undefined,
  hasTemplates: boolean,
  templateAspirationNames?: string[],
): string | null {
  if (!archetypes || archetypes.length === 0) return null;

  // Use the first domain archetype for the opener
  const primaryDomain = archetypes.find((a) => a in DOMAIN_OPENERS);

  if (!primaryDomain) return null;

  const config = DOMAIN_OPENERS[primaryDomain];

  if (hasTemplates && templateAspirationNames && templateAspirationNames.length > 0) {
    return config.withTemplates(templateAspirationNames);
  }

  return config.blank;
}

/**
 * Get template aspiration names for openers by looking up domain templates.
 */
export function getTemplateAspirationNames(domainArchetypes: string[]): string[] {
  const names: string[] = [];
  for (const domain of domainArchetypes) {
    const template = getDomainTemplate(domain);
    if (template) {
      for (const asp of template.starterAspirations.slice(0, 2)) {
        names.push(`"${asp.text}"`);
      }
    }
  }
  return names;
}
