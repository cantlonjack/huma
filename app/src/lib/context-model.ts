// ─── Context Model Utilities ─────────────────────────────────────────────────
// Merge, query, completeness, and prompt serialization for the HumaContext.
//
// The context model is the product. These utilities are how every other feature
// interacts with it.

import type {
  HumaContext,
  ContextSource,
  ContextSourceType,
  ContextCompleteness,
  DimensionCompleteness,
} from "@/types/context";
import type { KnownContext } from "@/types/v2";
import { createEmptyContext } from "@/types/context";

// ─── Deep Merge ─────────────────────────────────────────────────────────────
// Merges extracted context into the existing model.
// Unlike the old shallow merge ({...old, ...new}), this preserves nested fields.
// If existing.people.household = [{name: "Sarah"}] and extracted = {people: {community: [{name: "Dave"}]}},
// the result has BOTH household and community.

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (sourceVal === undefined) continue;

    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      // Recurse into nested objects
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      ) as T[keyof T];
    } else if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
      // For arrays: merge by matching on 'name' field if items have it,
      // otherwise append new items
      result[key] = mergeArrays(targetVal, sourceVal) as T[keyof T];
    } else {
      // Scalar or type-changed: source wins
      result[key] = sourceVal as T[keyof T];
    }
  }

  return result;
}

function mergeArrays(target: unknown[], source: unknown[]): unknown[] {
  // If items have a 'name' field, merge by name (update existing, add new)
  const targetHasNames = target.every(
    (item) => isPlainObject(item) && "name" in item
  );
  const sourceHasNames = source.every(
    (item) => isPlainObject(item) && "name" in item
  );

  if (targetHasNames && sourceHasNames && target.length > 0) {
    const result = [...target] as Record<string, unknown>[];
    for (const sourceItem of source as Record<string, unknown>[]) {
      const existingIdx = result.findIndex(
        (t) => t.name === sourceItem.name
      );
      if (existingIdx >= 0) {
        result[existingIdx] = deepMerge(result[existingIdx], sourceItem);
      } else {
        result.push(sourceItem);
      }
    }
    return result;
  }

  // For string arrays or unnamed objects: deduplicate by value
  if (source.every((item) => typeof item === "string")) {
    const combined = new Set([
      ...(target as string[]),
      ...(source as string[]),
    ]);
    return Array.from(combined);
  }

  // Fallback: append
  return [...target, ...source];
}

/**
 * Merge extracted context into the existing model.
 * Tracks sources for each field that was updated.
 */
export function mergeContext(
  existing: HumaContext,
  extracted: Partial<HumaContext>,
  source: ContextSourceType = "conversation",
  messageId?: string
): HumaContext {
  const now = new Date().toISOString();

  // Track what changed
  const newSources: ContextSource[] = [];
  function trackSources(obj: unknown, path: string) {
    if (isPlainObject(obj)) {
      for (const [key, val] of Object.entries(obj)) {
        if (key.startsWith("_")) continue; // skip meta fields
        trackSources(val, path ? `${path}.${key}` : key);
      }
    } else if (Array.isArray(obj)) {
      // Track the array as a whole
      newSources.push({ fieldPath: path, value: obj, source, date: now, messageId });
    } else if (obj !== undefined && obj !== null) {
      newSources.push({ fieldPath: path, value: obj, source, date: now, messageId });
    }
  }

  // Strip meta fields from extracted before merge
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _sources: _s, _lastUpdated: _lu, _version: _v, ...contextData } = extracted as Record<string, unknown>;
  trackSources(contextData, "");

  const merged = deepMerge(
    existing as unknown as Record<string, unknown>,
    contextData
  ) as unknown as HumaContext;

  // Append new sources, keep last 200
  const allSources = [...(merged._sources || []), ...newSources].slice(-200);

  return {
    ...merged,
    _sources: allSources,
    _lastUpdated: now,
    _version: existing._version,
  };
}

// ─── Context Completeness ───────────────────────────────────────────────────
// How much does HUMA know about each dimension?
// Used to guide conversation toward sparse areas.

interface DimensionFieldSpec {
  key: string;
  label: string;
  fields: string[]; // field names within the dimension object
}

const DIMENSION_SPECS: DimensionFieldSpec[] = [
  { key: "body", label: "Body", fields: ["conditions", "capacity", "sleep", "nutrition"] },
  { key: "people", label: "People", fields: ["household", "community", "professional"] },
  { key: "money", label: "Money", fields: ["income", "constraints", "enterprises", "debt", "savings", "financialGoal"] },
  { key: "home", label: "Home", fields: ["location", "type", "resources", "infrastructure", "land"] },
  { key: "growth", label: "Growth", fields: ["skills", "gaps", "currentLearning", "interests"] },
  { key: "joy", label: "Joy", fields: ["sources", "drains", "rhythms"] },
  { key: "purpose", label: "Purpose", fields: ["whyStatement", "contribution", "vision", "values"] },
  { key: "identity", label: "Identity", fields: ["archetypes", "roles", "culture"] },
  { key: "time", label: "Time & Schedule", fields: ["stage", "timeBlocks", "constraints"] },
];

function hasValue(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (isPlainObject(val)) return Object.values(val).some(hasValue);
  return true;
}

export function contextCompleteness(context: HumaContext): ContextCompleteness {
  const dimensions: DimensionCompleteness[] = DIMENSION_SPECS.map((spec) => {
    const dimension = context[spec.key as keyof HumaContext];
    if (!isPlainObject(dimension)) {
      return {
        dimension: spec.key as DimensionCompleteness["dimension"],
        fieldCount: 0,
        totalFields: spec.fields.length,
        percentage: 0,
        label: spec.label,
        sparseSummary: `No ${spec.label.toLowerCase()} information yet`,
      };
    }

    const dimObj = dimension as Record<string, unknown>;
    const filledFields = spec.fields.filter((f) => hasValue(dimObj[f]));
    const missingFields = spec.fields.filter((f) => !hasValue(dimObj[f]));
    const percentage = Math.round((filledFields.length / spec.fields.length) * 100);

    return {
      dimension: spec.key as DimensionCompleteness["dimension"],
      fieldCount: filledFields.length,
      totalFields: spec.fields.length,
      percentage,
      label: spec.label,
      sparseSummary:
        missingFields.length > 0
          ? `Missing: ${missingFields.join(", ")}`
          : undefined,
    };
  });

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.percentage, 0) / dimensions.length
  );

  return {
    dimensions,
    overall,
    strongDimensions: dimensions
      .filter((d) => d.percentage >= 50)
      .map((d) => d.label),
    sparseDimensions: dimensions
      .filter((d) => d.percentage < 25)
      .map((d) => d.label),
  };
}

// ─── Context to Prose ───────────────────────────────────────────────────────
// Flatten the context model to natural language for Claude injection.
// This replaces the old JSON.stringify(knownContext) approach.

export function contextForPrompt(context: HumaContext): string {
  const sections: string[] = [];

  // Purpose & Identity (who they are)
  const purposeLines: string[] = [];
  if (context.purpose.whyStatement) {
    purposeLines.push(`WHY: ${context.purpose.whyStatement}`);
  }
  if (context.purpose.vision) {
    purposeLines.push(`Vision: ${context.purpose.vision}`);
  }
  if (context.purpose.values?.length) {
    purposeLines.push(`Values: ${context.purpose.values.join(", ")}`);
  }
  if (context.identity.archetypes?.length) {
    purposeLines.push(`Archetypes: ${context.identity.archetypes.join(", ")}`);
  }
  if (context.identity.roles?.length) {
    purposeLines.push(`Roles: ${context.identity.roles.join(", ")}`);
  }
  if (purposeLines.length > 0) {
    sections.push(`IDENTITY & PURPOSE:\n${purposeLines.join("\n")}`);
  }

  // People
  const peopleLines: string[] = [];
  if (context.people.household?.length) {
    const members = context.people.household.map((p) => {
      let desc = `${p.name} (${p.relationship}`;
      if (p.age) desc += `, ${p.age}`;
      desc += ")";
      if (p.detail) desc += ` — ${p.detail}`;
      return desc;
    });
    peopleLines.push(`Household: ${members.join("; ")}`);
  }
  if (context.people.community?.length) {
    const members = context.people.community.map((p) => {
      let desc = `${p.name} (${p.relationship})`;
      if (p.detail) desc += ` — ${p.detail}`;
      return desc;
    });
    peopleLines.push(`Community: ${members.join("; ")}`);
  }
  if (context.people.professional?.length) {
    const members = context.people.professional.map((p) => {
      let desc = `${p.name} (${p.relationship})`;
      if (p.detail) desc += ` — ${p.detail}`;
      return desc;
    });
    peopleLines.push(`Professional: ${members.join("; ")}`);
  }
  if (peopleLines.length > 0) {
    sections.push(`PEOPLE:\n${peopleLines.join("\n")}`);
  }

  // Home & Resources
  const homeLines: string[] = [];
  if (context.home.location) homeLines.push(`Location: ${context.home.location}`);
  if (context.home.type) homeLines.push(`Type: ${context.home.type}`);
  if (context.home.land) homeLines.push(`Land: ${context.home.land}`);
  if (context.home.climateZone) homeLines.push(`Climate: ${context.home.climateZone}`);
  if (context.home.infrastructure?.length) {
    homeLines.push(`Infrastructure: ${context.home.infrastructure.join(", ")}`);
  }
  if (context.home.resources?.length) {
    const resources = context.home.resources.map(
      (r) => (r.detail ? `${r.name} (${r.detail})` : r.name)
    );
    homeLines.push(`Resources: ${resources.join(", ")}`);
  }
  if (homeLines.length > 0) {
    sections.push(`HOME & RESOURCES:\n${homeLines.join("\n")}`);
  }

  // Money
  const moneyLines: string[] = [];
  if (context.money.income) moneyLines.push(`Income: ${context.money.income}`);
  if (context.money.enterprises?.length) {
    const ents = context.money.enterprises.map((e) => {
      let desc = `${e.name} (${e.status})`;
      if (e.revenue) desc += ` — ${e.revenue}`;
      if (e.detail) desc += ` — ${e.detail}`;
      return desc;
    });
    moneyLines.push(`Enterprises: ${ents.join("; ")}`);
  }
  if (context.money.constraints?.length) {
    moneyLines.push(`Constraints: ${context.money.constraints.join("; ")}`);
  }
  if (context.money.debt) moneyLines.push(`Debt: ${context.money.debt}`);
  if (context.money.savings) moneyLines.push(`Savings: ${context.money.savings}`);
  if (context.money.financialGoal) moneyLines.push(`Goal: ${context.money.financialGoal}`);
  if (context.money.rhythm) moneyLines.push(`Pay rhythm: ${context.money.rhythm}`);
  if (moneyLines.length > 0) {
    sections.push(`MONEY:\n${moneyLines.join("\n")}`);
  }

  // Body
  const bodyLines: string[] = [];
  if (context.body.conditions?.length) {
    bodyLines.push(`Conditions: ${context.body.conditions.join(", ")}`);
  }
  if (context.body.capacity) bodyLines.push(`Capacity: ${context.body.capacity}`);
  if (context.body.sleep) bodyLines.push(`Sleep: ${context.body.sleep}`);
  if (context.body.nutrition) bodyLines.push(`Nutrition: ${context.body.nutrition}`);
  if (bodyLines.length > 0) {
    sections.push(`BODY:\n${bodyLines.join("\n")}`);
  }

  // Growth
  const growthLines: string[] = [];
  if (context.growth.skills?.length) {
    const skills = context.growth.skills.map(
      (s) => `${s.name} (${s.level})`
    );
    growthLines.push(`Skills: ${skills.join(", ")}`);
  }
  if (context.growth.gaps?.length) {
    growthLines.push(`Gaps: ${context.growth.gaps.join(", ")}`);
  }
  if (context.growth.currentLearning?.length) {
    growthLines.push(`Learning: ${context.growth.currentLearning.join(", ")}`);
  }
  if (growthLines.length > 0) {
    sections.push(`GROWTH:\n${growthLines.join("\n")}`);
  }

  // Joy
  const joyLines: string[] = [];
  if (context.joy.sources?.length) {
    joyLines.push(`Sources: ${context.joy.sources.join(", ")}`);
  }
  if (context.joy.drains?.length) {
    joyLines.push(`Drains: ${context.joy.drains.join(", ")}`);
  }
  if (context.joy.rhythms?.length) {
    joyLines.push(`Rhythms: ${context.joy.rhythms.join(", ")}`);
  }
  if (joyLines.length > 0) {
    sections.push(`JOY:\n${joyLines.join("\n")}`);
  }

  // Time & Schedule
  const timeLines: string[] = [];
  if (context.time.stage) {
    let stageStr = context.time.stage;
    if (context.time.stageDetail) stageStr += ` — ${context.time.stageDetail}`;
    timeLines.push(`Life stage: ${stageStr}`);
  }
  if (context.time.constraints?.length) {
    timeLines.push(`Constraints: ${context.time.constraints.join("; ")}`);
  }
  if (context.time.timeBlocks?.length) {
    const blocks = context.time.timeBlocks.map((b) => {
      const parts = [b.day, b.time, b.notes].filter(Boolean);
      return parts.join(" ");
    });
    timeLines.push(`Available time: ${blocks.join("; ")}`);
  }
  if (timeLines.length > 0) {
    sections.push(`TIME & SCHEDULE:\n${timeLines.join("\n")}`);
  }

  // Temporal (upcoming, milestones)
  const temporalLines: string[] = [];
  if (context.temporal.milestones?.length) {
    const ms = context.temporal.milestones
      .filter((m) => m.status !== "completed")
      .map((m) => `${m.name} (${m.targetDate || "no date"}, ${m.status})`);
    if (ms.length) temporalLines.push(`Milestones: ${ms.join("; ")}`);
  }
  if (context.temporal.upcoming?.length) {
    const upcoming = context.temporal.upcoming
      .filter((t) => !t.completed)
      .slice(0, 5)
      .map((t) => `${t.what} (${t.when})`);
    if (upcoming.length) temporalLines.push(`Upcoming: ${upcoming.join("; ")}`);
  }
  if (context.temporal.overdue?.length) {
    const overdue = context.temporal.overdue
      .filter((t) => !t.completed)
      .map((t) => `${t.what} (was due ${t.when})`);
    if (overdue.length) temporalLines.push(`OVERDUE: ${overdue.join("; ")}`);
  }
  if (temporalLines.length > 0) {
    sections.push(`PLANNING:\n${temporalLines.join("\n")}`);
  }

  // Recent decisions
  if (context.decisions.length > 0) {
    const recent = context.decisions.slice(-5).map((d) => {
      let desc = `${d.date}: ${d.description}`;
      if (d.reasoning) desc += ` (${d.reasoning})`;
      if (d.outcome) desc += ` → Outcome: ${d.outcome}`;
      else if (d.followUpDue) desc += ` [follow-up: ${d.followUpDue}]`;
      return desc;
    });
    sections.push(`RECENT DECISIONS:\n${recent.join("\n")}`);
  }

  if (sections.length === 0) {
    return "No context yet — this is a new conversation.";
  }

  return sections.join("\n\n");
}

// ─── Completeness Hint for Claude ───────────────────────────────────────────
// A one-line hint telling Claude which dimensions are sparse.

export function completenessHint(context: HumaContext): string {
  const comp = contextCompleteness(context);

  if (comp.overall === 0) {
    return "You know nothing about this person yet. Start by understanding their situation.";
  }

  const parts: string[] = [];

  if (comp.strongDimensions.length > 0) {
    parts.push(`You know a good amount about: ${comp.strongDimensions.join(", ")}.`);
  }

  if (comp.sparseDimensions.length > 0) {
    parts.push(
      `You know very little about: ${comp.sparseDimensions.join(", ")}. Explore these naturally when relevant.`
    );
  }

  return parts.join(" ");
}

// ─── Migration from KnownContext ────────────────────────────────────────────
// Convert the old flat KnownContext to the new structured HumaContext.

export function migrateFromKnownContext(
  old: KnownContext,
  whyStatement?: string,
  archetypes?: string[]
): HumaContext {
  const ctx = createEmptyContext();

  // People
  if (old.people?.length) {
    ctx.people.household = old.people.map((p) => ({
      name: p.name,
      relationship: p.role,
    }));
  }

  // Home
  if (old.place) {
    ctx.home.location = old.place.name;
    if (old.place.detail && old.place.detail !== old.place.name) {
      ctx.home.type = old.place.detail;
    }
  }
  if (old.resources?.length) {
    ctx.home.resources = old.resources.map((r) => ({ name: r }));
  }

  // Money
  if (old.financial) {
    ctx.money.income = old.financial.income;
    ctx.money.constraints = old.financial.constraints;
    ctx.money.rhythm = old.financial.rhythm;
    if (old.financial.situation) {
      // Store as the first constraint if it's descriptive
      if (!ctx.money.constraints) ctx.money.constraints = [];
      ctx.money.constraints.unshift(old.financial.situation);
    }
  }

  // Body
  if (old.health?.detail) {
    ctx.body.conditions = [old.health.detail];
  }

  // Time
  if (old.stage) {
    ctx.time.stage = old.stage.label;
    ctx.time.stageDetail = old.stage.detail;
  }
  if (old.time?.detail) {
    ctx.time.constraints = [old.time.detail];
  }

  // Work → could be money (enterprise) or identity (role)
  if (old.work) {
    ctx.money.enterprises = [
      {
        name: old.work.title,
        type: "employment",
        status: "active" as const,
        detail: old.work.detail,
      },
    ];
    ctx.identity.roles = [old.work.title];
  }

  // Purpose
  if (whyStatement) {
    ctx.purpose.whyStatement = whyStatement;
    ctx.purpose.whyDate = new Date().toISOString();
  }

  // Identity
  if (archetypes?.length) {
    ctx.identity.archetypes = archetypes;
  }

  ctx._lastUpdated = new Date().toISOString();

  return ctx;
}

// ─── Dimension Keys Affected ────────────────────────────────────────────────
// Given a partial context update, return which dimensions were touched.
// Used for the "HUMA now knows: home, body, people" indicator.

export function dimensionsTouched(
  extracted: Partial<HumaContext>
): string[] {
  const dimensionKeys = [
    "body", "people", "money", "home", "growth", "joy", "purpose", "identity", "time",
  ] as const;

  const labels: Record<string, string> = {
    body: "Body",
    people: "People",
    money: "Money",
    home: "Home",
    growth: "Growth",
    joy: "Joy",
    purpose: "Purpose",
    identity: "Identity",
    time: "Time",
  };

  return dimensionKeys
    .filter((key) => {
      const val = extracted[key as keyof HumaContext];
      return val !== undefined && hasValue(val);
    })
    .map((key) => labels[key]);
}
