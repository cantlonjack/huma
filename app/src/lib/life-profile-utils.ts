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

export interface ProseLine {
  text: string;
  /** Dotted path into HumaContext, e.g. "home.location" or "identity.roles" */
  field: string;
  /** Whether this line is editable in manage mode */
  editable: boolean;
}

export interface ProfileSection {
  id: string;
  label: string;
  prose: ProseLine[];        // Natural language lines with field provenance
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

function buildIdentityProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];

  if (ctx.purpose?.whyStatement) {
    lines.push({ text: `"${ctx.purpose.whyStatement}"`, field: "purpose.whyStatement", editable: true });
  }

  if (ctx.identity?.archetypes?.length) {
    lines.push({ text: ctx.identity.archetypes.join(" · "), field: "identity.archetypes", editable: true });
  }

  if (ctx.identity?.roles?.length) {
    lines.push({ text: ctx.identity.roles.join(", "), field: "identity.roles", editable: true });
  }

  if (ctx.time?.stage) {
    const detail = ctx.time.stageDetail ? ` — ${ctx.time.stageDetail}` : "";
    lines.push({ text: `${ctx.time.stage}${detail}`, field: "time.stage", editable: true });
  }

  if (ctx.identity?.culture) {
    lines.push({ text: ctx.identity.culture, field: "identity.culture", editable: true });
  }

  if (ctx.purpose?.values?.length) {
    lines.push({ text: `Values: ${ctx.purpose.values.join(", ")}`, field: "purpose.values", editable: true });
  }

  return lines;
}

function buildPlaceProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];
  const h = ctx.home;
  if (!h) return lines;

  if (h.location) {
    const parts = [h.location];
    if (h.climateZone) parts.push(h.climateZone);
    lines.push({ text: parts.join(" — "), field: "home.location", editable: true });
  }

  if (h.type) lines.push({ text: h.type, field: "home.type", editable: true });

  if (h.land) lines.push({ text: h.land, field: "home.land", editable: true });

  if (h.resources?.length) {
    const names = h.resources.map((r) => (typeof r === "string" ? r : r.name)).filter(Boolean);
    if (names.length > 0) lines.push({ text: names.join(", "), field: "home.resources", editable: true });
  }

  if (h.infrastructure?.length) {
    lines.push({ text: h.infrastructure.join(", "), field: "home.infrastructure", editable: true });
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

function buildPeopleProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];
  const p = ctx.people;
  if (!p) return lines;

  if (p.household?.length) {
    p.household.forEach((person, i) => {
      lines.push({ text: formatPerson(person), field: `people.household[${i}].name`, editable: true });
    });
  }

  if (p.community?.length) {
    p.community.forEach((person, i) => {
      lines.push({ text: formatPerson(person), field: `people.community[${i}].name`, editable: true });
    });
  }

  if (p.professional?.length) {
    p.professional.forEach((person, i) => {
      lines.push({ text: formatPerson(person), field: `people.professional[${i}].name`, editable: true });
    });
  }

  return lines;
}

function buildBodyProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];

  if (ctx.body?.conditions?.length) {
    lines.push({ text: ctx.body.conditions.join(", "), field: "body.conditions", editable: true });
  }

  if (ctx.body?.capacity) lines.push({ text: `Capacity: ${ctx.body.capacity}`, field: "body.capacity", editable: true });
  if (ctx.body?.sleep) lines.push({ text: `Sleep: ${ctx.body.sleep}`, field: "body.sleep", editable: true });
  if (ctx.body?.nutrition) lines.push({ text: `Nutrition: ${ctx.body.nutrition}`, field: "body.nutrition", editable: true });

  if (ctx.time?.timeBlocks?.length) {
    ctx.time.timeBlocks.forEach((block, i) => {
      const parts: string[] = [];
      if (block.day) parts.push(block.day);
      if (block.time) parts.push(block.time);
      if (block.availableMinutes) parts.push(`${block.availableMinutes} min`);
      if (block.notes) parts.push(block.notes);
      if (parts.length > 0) lines.push({ text: parts.join(" · "), field: `time.timeBlocks[${i}]`, editable: false });
    });
  }

  if (ctx.time?.constraints?.length) {
    lines.push({ text: `Constraints: ${ctx.time.constraints.join(", ")}`, field: "time.constraints", editable: true });
  }

  return lines;
}

function buildMoneyProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];
  const m = ctx.money;
  if (!m) return lines;

  if (m.income) lines.push({ text: m.income, field: "money.income", editable: true });

  if (m.enterprises?.length) {
    m.enterprises.forEach((e, i) => {
      const parts = [e.name];
      if (e.type) parts.push(e.type);
      if (e.status && e.status !== "active") parts.push(`(${e.status})`);
      if (e.revenue) parts.push(`— ${e.revenue}`);
      lines.push({ text: parts.join(" "), field: `money.enterprises[${i}].name`, editable: true });
    });
  }

  if (m.rhythm) lines.push({ text: m.rhythm, field: "money.rhythm", editable: true });
  if (m.debt) lines.push({ text: `Debt: ${m.debt}`, field: "money.debt", editable: true });
  if (m.savings) lines.push({ text: `Savings: ${m.savings}`, field: "money.savings", editable: true });
  if (m.financialGoal) lines.push({ text: `Goal: ${m.financialGoal}`, field: "money.financialGoal", editable: true });

  if (m.constraints?.length) {
    lines.push({ text: `Constraints: ${m.constraints.join(", ")}`, field: "money.constraints", editable: true });
  }

  return lines;
}

function buildGrowthProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];

  if (ctx.growth?.skills?.length) {
    const skillStrings = ctx.growth.skills.map((s) =>
      typeof s === "string" ? s : `${s.name} (${s.level})`
    );
    lines.push({ text: `Skills: ${skillStrings.join(", ")}`, field: "growth.skills", editable: true });
  }

  if (ctx.growth?.currentLearning?.length) {
    lines.push({ text: `Learning: ${ctx.growth.currentLearning.join(", ")}`, field: "growth.currentLearning", editable: true });
  }

  if (ctx.growth?.interests?.length) {
    lines.push({ text: `Interests: ${ctx.growth.interests.join(", ")}`, field: "growth.interests", editable: true });
  }

  if (ctx.growth?.gaps?.length) {
    lines.push({ text: `Gaps: ${ctx.growth.gaps.join(", ")}`, field: "growth.gaps", editable: true });
  }

  if (ctx.joy?.sources?.length) {
    lines.push({ text: `Joy: ${ctx.joy.sources.join(", ")}`, field: "joy.sources", editable: true });
  }

  if (ctx.joy?.drains?.length) {
    lines.push({ text: `Drains: ${ctx.joy.drains.join(", ")}`, field: "joy.drains", editable: true });
  }

  if (ctx.joy?.rhythms?.length) {
    lines.push({ text: `Rhythms: ${ctx.joy.rhythms.join(", ")}`, field: "joy.rhythms", editable: true });
  }

  return lines;
}

function buildAheadProse(ctx: HumaContext): ProseLine[] {
  const lines: ProseLine[] = [];

  if (ctx.purpose?.vision) lines.push({ text: ctx.purpose.vision, field: "purpose.vision", editable: true });
  if (ctx.purpose?.contribution) lines.push({ text: ctx.purpose.contribution, field: "purpose.contribution", editable: true });

  if (ctx.temporal?.upcoming?.length) {
    ctx.temporal.upcoming.slice(0, 5).forEach((item, i) => {
      lines.push({ text: `${item.what} (${item.when})`, field: `temporal.upcoming[${i}].what`, editable: true });
    });
  }

  if (ctx.temporal?.overdue?.length) {
    ctx.temporal.overdue.forEach((item, i) => {
      lines.push({ text: `OVERDUE: ${item.what} (was due ${item.when})`, field: `temporal.overdue[${i}].what`, editable: false });
    });
  }

  if (ctx.temporal?.milestones?.length) {
    ctx.temporal.milestones.filter((m) => m.status !== "completed").forEach((m, i) => {
      const date = m.targetDate ? ` by ${m.targetDate}` : "";
      lines.push({ text: `${m.name}${date} (${m.status})`, field: `temporal.milestones[${i}].name`, editable: true });
    });
  }

  return lines;
}

// ─── Main Functions ────────────────────────────────────────────────────────

const PROSE_BUILDERS: Record<string, (ctx: HumaContext) => ProseLine[]> = {
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
