/**
 * Life Profile utilities — transforms HumaContext into natural profile sections.
 *
 * Maps the 9 technical dimensions into 7 human-readable sections:
 *   Who you are · Where you are · Who's around you · How you're built
 *   What you have · What feeds you · Where you're headed
 */

import type { HumaContext, Person } from "@/types/context";
import type { Aspiration, DimensionKey } from "@/types/v2";

// ─── Section Types ─────────────────────────────────────────────────────────

export interface ProfileSection {
  id: string;
  label: string;
  prose: string[];           // Natural language lines
  aspirationNames: string[]; // Related aspiration labels
  isSparse: boolean;         // True if section has no meaningful content
  dimensions: DimensionKey[]; // Which HumaContext dimensions this section draws from
}

// ─── Section Definitions ───────────────────────────────────────────────────

const SECTION_DEFS = [
  { id: "identity", label: "Who you are", dimensions: ["identity", "purpose"] as DimensionKey[] },
  { id: "place", label: "Where you are", dimensions: ["home"] as DimensionKey[] },
  { id: "people", label: "Who's around you", dimensions: ["people"] as DimensionKey[] },
  { id: "body", label: "How you're built", dimensions: ["body", "time"] as DimensionKey[] },
  { id: "money", label: "What you have", dimensions: ["money"] as DimensionKey[] },
  { id: "growth", label: "What feeds you", dimensions: ["growth", "joy"] as DimensionKey[] },
  { id: "ahead", label: "Where you're headed", dimensions: [] as DimensionKey[] },
] as const;

// ─── Prose Builders ────────────────────────────────────────────────────────

function buildIdentityProse(ctx: HumaContext): string[] {
  const lines: string[] = [];

  if (ctx.purpose?.whyStatement) {
    lines.push(`"${ctx.purpose.whyStatement}"`);
  }

  if (ctx.identity?.archetypes?.length) {
    lines.push(ctx.identity.archetypes.join(" · "));
  }

  if (ctx.identity?.roles?.length) {
    lines.push(ctx.identity.roles.join(", "));
  }

  if (ctx.time?.stage) {
    const detail = ctx.time.stageDetail ? ` — ${ctx.time.stageDetail}` : "";
    lines.push(`${ctx.time.stage}${detail}`);
  }

  if (ctx.identity?.culture) {
    lines.push(ctx.identity.culture);
  }

  if (ctx.purpose?.values?.length) {
    lines.push(`Values: ${ctx.purpose.values.join(", ")}`);
  }

  return lines;
}

function buildPlaceProse(ctx: HumaContext): string[] {
  const lines: string[] = [];
  const h = ctx.home;
  if (!h) return lines;

  if (h.location) {
    const parts = [h.location];
    if (h.climateZone) parts.push(h.climateZone);
    lines.push(parts.join(" — "));
  }

  if (h.type) lines.push(h.type);

  if (h.land) lines.push(h.land);

  if (h.resources?.length) {
    const names = h.resources.map((r) => (typeof r === "string" ? r : r.name)).filter(Boolean);
    if (names.length > 0) lines.push(names.join(", "));
  }

  if (h.infrastructure?.length) {
    lines.push(h.infrastructure.join(", "));
  }

  return lines;
}

function formatPerson(p: Person): string {
  const parts = [p.name];
  if (p.relationship) parts.push(`(${p.relationship})`);
  if (p.age) parts.push(`age ${p.age}`);
  if (p.detail) parts.push(`— ${p.detail}`);
  return parts.join(" ");
}

function buildPeopleProse(ctx: HumaContext): string[] {
  const lines: string[] = [];
  const p = ctx.people;
  if (!p) return lines;

  if (p.household?.length) {
    lines.push(...p.household.map(formatPerson));
  }

  if (p.community?.length) {
    lines.push(...p.community.map(formatPerson));
  }

  if (p.professional?.length) {
    lines.push(...p.professional.map(formatPerson));
  }

  return lines;
}

function buildBodyProse(ctx: HumaContext): string[] {
  const lines: string[] = [];

  if (ctx.body?.conditions?.length) {
    lines.push(ctx.body.conditions.join(", "));
  }

  if (ctx.body?.capacity) lines.push(`Capacity: ${ctx.body.capacity}`);
  if (ctx.body?.sleep) lines.push(`Sleep: ${ctx.body.sleep}`);
  if (ctx.body?.nutrition) lines.push(`Nutrition: ${ctx.body.nutrition}`);

  if (ctx.time?.timeBlocks?.length) {
    for (const block of ctx.time.timeBlocks) {
      const parts: string[] = [];
      if (block.day) parts.push(block.day);
      if (block.time) parts.push(block.time);
      if (block.availableMinutes) parts.push(`${block.availableMinutes} min`);
      if (block.notes) parts.push(block.notes);
      if (parts.length > 0) lines.push(parts.join(" · "));
    }
  }

  if (ctx.time?.constraints?.length) {
    lines.push(`Constraints: ${ctx.time.constraints.join(", ")}`);
  }

  return lines;
}

function buildMoneyProse(ctx: HumaContext): string[] {
  const lines: string[] = [];
  const m = ctx.money;
  if (!m) return lines;

  if (m.income) lines.push(m.income);

  if (m.enterprises?.length) {
    for (const e of m.enterprises) {
      const parts = [e.name];
      if (e.type) parts.push(e.type);
      if (e.status && e.status !== "active") parts.push(`(${e.status})`);
      if (e.revenue) parts.push(`— ${e.revenue}`);
      lines.push(parts.join(" "));
    }
  }

  if (m.rhythm) lines.push(m.rhythm);
  if (m.debt) lines.push(`Debt: ${m.debt}`);
  if (m.savings) lines.push(`Savings: ${m.savings}`);
  if (m.financialGoal) lines.push(`Goal: ${m.financialGoal}`);

  if (m.constraints?.length) {
    lines.push(`Constraints: ${m.constraints.join(", ")}`);
  }

  return lines;
}

function buildGrowthProse(ctx: HumaContext): string[] {
  const lines: string[] = [];

  if (ctx.growth?.skills?.length) {
    const skillStrings = ctx.growth.skills.map((s) =>
      typeof s === "string" ? s : `${s.name} (${s.level})`
    );
    lines.push(`Skills: ${skillStrings.join(", ")}`);
  }

  if (ctx.growth?.currentLearning?.length) {
    lines.push(`Learning: ${ctx.growth.currentLearning.join(", ")}`);
  }

  if (ctx.growth?.interests?.length) {
    lines.push(`Interests: ${ctx.growth.interests.join(", ")}`);
  }

  if (ctx.growth?.gaps?.length) {
    lines.push(`Gaps: ${ctx.growth.gaps.join(", ")}`);
  }

  if (ctx.joy?.sources?.length) {
    lines.push(`Joy: ${ctx.joy.sources.join(", ")}`);
  }

  if (ctx.joy?.drains?.length) {
    lines.push(`Drains: ${ctx.joy.drains.join(", ")}`);
  }

  if (ctx.joy?.rhythms?.length) {
    lines.push(`Rhythms: ${ctx.joy.rhythms.join(", ")}`);
  }

  return lines;
}

function buildAheadProse(ctx: HumaContext): string[] {
  const lines: string[] = [];

  if (ctx.purpose?.vision) lines.push(ctx.purpose.vision);
  if (ctx.purpose?.contribution) lines.push(ctx.purpose.contribution);

  if (ctx.temporal?.upcoming?.length) {
    for (const item of ctx.temporal.upcoming.slice(0, 5)) {
      lines.push(`${item.what} (${item.when})`);
    }
  }

  if (ctx.temporal?.overdue?.length) {
    for (const item of ctx.temporal.overdue) {
      lines.push(`OVERDUE: ${item.what} (was due ${item.when})`);
    }
  }

  if (ctx.temporal?.milestones?.length) {
    for (const m of ctx.temporal.milestones.filter((m) => m.status !== "completed")) {
      const date = m.targetDate ? ` by ${m.targetDate}` : "";
      lines.push(`${m.name}${date} (${m.status})`);
    }
  }

  return lines;
}

// ─── Main Functions ────────────────────────────────────────────────────────

const PROSE_BUILDERS: Record<string, (ctx: HumaContext) => string[]> = {
  identity: buildIdentityProse,
  place: buildPlaceProse,
  people: buildPeopleProse,
  body: buildBodyProse,
  money: buildMoneyProse,
  growth: buildGrowthProse,
  ahead: buildAheadProse,
};

export function profileSections(
  ctx: HumaContext,
  aspirations: Aspiration[],
): ProfileSection[] {
  const activeAspirations = aspirations.filter(
    (a) => a.status === "active" || a.status === "paused",
  );

  return SECTION_DEFS.map((def) => {
    const prose = PROSE_BUILDERS[def.id]?.(ctx) ?? [];

    // Find aspirations that touch this section's dimensions
    const aspNames = activeAspirations
      .filter((a) =>
        a.dimensionsTouched?.some((d) => (def.dimensions as readonly string[]).includes(d)),
      )
      .map((a) => a.title || a.clarifiedText || a.rawText);

    return {
      id: def.id,
      label: def.label,
      prose,
      aspirationNames: aspNames,
      isSparse: prose.length === 0 && aspNames.length === 0,
      dimensions: [...def.dimensions],
    };
  });
}

export function profileCompleteness(
  ctx: HumaContext,
): { filled: number; total: number; labels: string[] } {
  const sections = profileSections(ctx, []);
  const filled = sections.filter((s) => !s.isSparse);
  return {
    filled: filled.length,
    total: SECTION_DEFS.length,
    labels: filled.map((s) => s.label),
  };
}

// Map a HumaContext dimension key to its natural profile section label
const DIMENSION_TO_SECTION: Record<string, string> = {
  body: "how you're built",
  people: "who's around you",
  money: "what you have",
  home: "where you are",
  growth: "what feeds you",
  joy: "what feeds you",
  purpose: "who you are",
  identity: "who you are",
  time: "how you're built",
};

export function sectionForDimension(dim: string): string {
  return DIMENSION_TO_SECTION[dim] || dim.toLowerCase();
}
