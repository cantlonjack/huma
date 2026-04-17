import type { Aspiration, DimensionKey } from "@/types/v2";
import { DIMENSION_LABELS, getEffectiveDimensions } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BehaviorDay {
  date: string;
  behaviorKey: string;
  completed: boolean;
}

export interface WeeklyReviewData {
  /** Dimensions that moved most consistently (5+ days). */
  activeDimensions: DimensionKey[];
  /** Dimensions dormant — no completions in the week. */
  dormantDimensions: DimensionKey[];
  /** Aspirations that had zero check-offs this week. */
  zeroCheckoffAspirations: { id: string; name: string }[];
  /** Single most active aspiration id (for graph highlight). */
  leadAspirationId: string | null;
  /** Days logged across all behaviors (0–7). */
  activeDays: number;
  /** Week key, e.g. 2026-W16. */
  weekKey: string;
  /** ISO date (YYYY-MM-DD) for Monday of the week the review covers. */
  weekStart: string;
}

export interface WeeklyReviewResult {
  weekKey: string;
  weekStart: string;
  wins: string;
  drifts: string;
  oneShift: string;
  graphHighlight: {
    kind: "aspiration" | "dimension";
    id: string;
    label: string;
  } | null;
  createdAt: string;
}

// ─── Week key ───────────────────────────────────────────────────────────────

/**
 * ISO week key. Thursday-anchored so week numbers match ISO-8601.
 * Example: 2026-W16.
 */
export function getIsoWeekKey(d: Date = new Date()): string {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7; // Monday=0
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target.getTime() - firstThursday.getTime();
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Monday-anchored start of the week containing `d`, as YYYY-MM-DD. */
export function getWeekStart(d: Date = new Date()): string {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNr = (local.getDay() + 6) % 7; // Monday=0
  local.setDate(local.getDate() - dayNr);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Compute ────────────────────────────────────────────────────────────────

/**
 * Pure-function compute for the past 7 days of behavior data.
 *
 * Inputs:
 *   - `behaviorDays`: completed/attempted entries in the past 7 days
 *   - `aspirations`: active aspirations (for dimension + name lookup)
 */
export function computeWeeklyReview(
  behaviorDays: BehaviorDay[],
  aspirations: Aspiration[],
  now: Date = new Date(),
): WeeklyReviewData {
  const weekKey = getIsoWeekKey(now);
  const weekStart = getWeekStart(now);

  // Behavior-key → aspiration + dimensions lookup.
  const behaviorLookup = new Map<string, { aspirationId: string; dimensions: DimensionKey[] }>();
  for (const asp of aspirations) {
    for (const b of asp.behaviors || []) {
      const effective = getEffectiveDimensions(b);
      const dims = effective.map((e) => e.dimension);
      behaviorLookup.set(b.key, { aspirationId: asp.id, dimensions: dims });
    }
  }

  // Count completions per dimension and per aspiration.
  const dimensionDayCounts = new Map<DimensionKey, Set<string>>();
  const aspirationCheckoffs = new Map<string, number>();
  const allDates = new Set<string>();

  for (const entry of behaviorDays) {
    if (!entry.completed) continue;
    allDates.add(entry.date);
    const meta = behaviorLookup.get(entry.behaviorKey);
    if (!meta) continue;
    aspirationCheckoffs.set(meta.aspirationId, (aspirationCheckoffs.get(meta.aspirationId) || 0) + 1);
    for (const dim of meta.dimensions) {
      if (!dimensionDayCounts.has(dim)) dimensionDayCounts.set(dim, new Set());
      dimensionDayCounts.get(dim)!.add(entry.date);
    }
  }

  // Active dimensions: 5+ distinct days of movement.
  const allDimensions: DimensionKey[] = [
    "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
  ];

  const activeDimensions: DimensionKey[] = [];
  const dormantDimensions: DimensionKey[] = [];
  for (const dim of allDimensions) {
    const days = dimensionDayCounts.get(dim)?.size ?? 0;
    if (days >= 5) activeDimensions.push(dim);
    if (days === 0 && hasDimensionInUse(dim, aspirations)) dormantDimensions.push(dim);
  }

  // Zero-checkoff aspirations — active aspirations that never got checked.
  const zeroCheckoffAspirations = aspirations
    .filter((a) => a.status === "active")
    .filter((a) => (aspirationCheckoffs.get(a.id) || 0) === 0)
    .map((a) => ({
      id: a.id,
      name: a.title || a.clarifiedText || a.rawText,
    }));

  // Lead aspiration: most check-offs (ties broken by aspiration order).
  let leadAspirationId: string | null = null;
  let leadCount = 0;
  for (const [id, count] of aspirationCheckoffs) {
    if (count > leadCount) {
      leadCount = count;
      leadAspirationId = id;
    }
  }

  return {
    activeDimensions,
    dormantDimensions,
    zeroCheckoffAspirations,
    leadAspirationId,
    activeDays: allDates.size,
    weekKey,
    weekStart,
  };
}

function hasDimensionInUse(dim: DimensionKey, aspirations: Aspiration[]): boolean {
  for (const a of aspirations) {
    if (a.status !== "active") continue;
    if ((a.dimensionsTouched || []).includes(dim)) return true;
    for (const b of a.behaviors || []) {
      const effective = getEffectiveDimensions(b);
      if (effective.some((e) => e.dimension === dim)) return true;
    }
  }
  return false;
}

// ─── Compact data string for the Claude prompt ──────────────────────────────

export function formatReviewForPrompt(
  data: WeeklyReviewData,
  aspirations: Aspiration[],
): string {
  const lines: string[] = [];
  lines.push(`Week: ${data.weekKey} (starting ${data.weekStart})`);
  lines.push(`Active days: ${data.activeDays}/7`);

  if (data.activeDimensions.length > 0) {
    lines.push(
      `Moved consistently (5+ days): ${data.activeDimensions
        .map((d) => DIMENSION_LABELS[d])
        .join(", ")}`,
    );
  } else {
    lines.push("Moved consistently (5+ days): none");
  }

  if (data.dormantDimensions.length > 0) {
    lines.push(
      `Dormant this week: ${data.dormantDimensions
        .map((d) => DIMENSION_LABELS[d])
        .join(", ")}`,
    );
  }

  if (data.zeroCheckoffAspirations.length > 0) {
    lines.push(
      `Aspirations with zero check-offs: ${data.zeroCheckoffAspirations
        .map((a) => a.name)
        .join("; ")}`,
    );
  }

  if (data.leadAspirationId) {
    const lead = aspirations.find((a) => a.id === data.leadAspirationId);
    if (lead) {
      lines.push(
        `Most-active aspiration: ${lead.title || lead.clarifiedText || lead.rawText}`,
      );
    }
  }

  return lines.join("\n");
}
