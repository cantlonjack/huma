// ─── RPPL Standard Interface ─────────────────────────────────────────────────
// Every active RPPL answers three questions:
//   /action  — What should I do today?
//   /health  — Am I on track?
//   /outputs — What has this produced?
//
// This isn't a literal HTTP API — it's a typed data contract that formalizes
// the existing sheet, pattern, and capital computation systems.

import type { HumaContext } from "@/types/context";
import type { Aspiration, Behavior, Pattern, DimensionKey } from "@/types/v2";
import type { RpplSeed } from "@/data/rppl-seeds/types";

// ─── Interface Types ────────────────────────────────────────────────────────

export interface RpplAction {
  rpplId?: string;
  behaviorKey: string;
  text: string;
  detail?: string;
  frequency: "daily" | "weekly" | "specific-days";
  timeWindow?: string;
  aspirationId: string;
  aspirationTitle: string;
  dimensions: DimensionKey[];
  isTrigger: boolean;
}

export type HealthStatus = "validated" | "working" | "finding" | "struggling" | "dormant";

export interface RpplHealth {
  rpplId?: string;
  patternId?: string;
  status: HealthStatus;
  completionRate: number;    // 0-100
  validationCount: number;
  validationTarget: number;
  trend: "rising" | "stable" | "dropping";
  lastActiveDate?: string;
}

export interface RpplOutputs {
  rpplId?: string;
  capitalEffects: Array<{
    capital: string;
    direction: "builds" | "costs" | "protects";
    strength: "weak" | "moderate" | "strong";
  }>;
  dimensionsAffected: DimensionKey[];
  totalCompletions: number;
  windowDays: number;
}

// ─── /action — What should I do today? ──────────────────────────────────────

export function getRpplAction(
  aspirationId: string,
  behaviorKey: string,
  aspirations: Aspiration[],
  date: string,
): RpplAction | null {
  const asp = aspirations.find(a => a.id === aspirationId);
  if (!asp || asp.status !== "active") return null;

  const behavior = asp.behaviors.find(b => b.key === behaviorKey);
  if (!behavior || behavior.enabled === false) return null;

  // Check if this behavior applies today
  const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  if (behavior.frequency === "specific-days" && behavior.days) {
    if (!behavior.days.includes(dayOfWeek)) return null;
  }

  const dims = (behavior.dimensionOverrides ?? behavior.dimensions)
    .map(d => d.dimension);

  return {
    behaviorKey: behavior.key,
    text: behavior.text,
    detail: behavior.detail,
    frequency: behavior.frequency,
    aspirationId: asp.id,
    aspirationTitle: asp.title || asp.clarifiedText || asp.rawText,
    dimensions: dims,
    isTrigger: false, // Would need pattern data to determine
  };
}

/** Get all actions for today across all active aspirations */
export function getTodayActions(
  aspirations: Aspiration[],
  date: string,
): RpplAction[] {
  const actions: RpplAction[] = [];

  for (const asp of aspirations) {
    if (asp.status !== "active") continue;
    for (const behavior of asp.behaviors) {
      const action = getRpplAction(asp.id, behavior.key, aspirations, date);
      if (action) actions.push(action);
    }
  }

  return actions;
}

// ─── /health — Am I on track? ───────────────────────────────────────────────

export function getRpplHealth(
  aspirationId: string,
  behaviorKey: string,
  patterns: Pattern[],
  behaviorCounts?: Record<string, { completed: number; total: number }>,
): RpplHealth {
  const key = `${aspirationId}:${behaviorKey}`;
  const counts = behaviorCounts?.[key];

  // Find the pattern that contains this behavior
  const pattern = patterns.find(
    p => p.aspirationId === aspirationId &&
      p.steps.some(s => s.behaviorKey === behaviorKey)
  );

  const completed = counts?.completed || 0;
  const total = counts?.total || 7;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  let status: HealthStatus;
  if (pattern?.status === "validated") {
    status = "validated";
  } else if (rate >= 70) {
    status = "working";
  } else if (rate >= 40) {
    status = "finding";
  } else if (rate > 0) {
    status = "struggling";
  } else {
    status = "dormant";
  }

  // Simple trend detection
  let trend: "rising" | "stable" | "dropping" = "stable";
  if (pattern) {
    if (pattern.status === "working" && rate >= 70) trend = "rising";
    else if (rate <= 30 && completed > 0) trend = "dropping";
  }

  return {
    patternId: pattern?.id,
    status,
    completionRate: rate,
    validationCount: pattern?.validationCount || 0,
    validationTarget: pattern?.validationTarget || 30,
    trend,
  };
}

// ─── /outputs — What has this produced? ─────────────────────────────────────

export function getRpplOutputs(
  aspirationId: string,
  behaviorKey: string,
  aspirations: Aspiration[],
  behaviorCounts?: Record<string, { completed: number; total: number }>,
  windowDays: number = 28,
): RpplOutputs {
  const asp = aspirations.find(a => a.id === aspirationId);
  const behavior = asp?.behaviors.find(b => b.key === behaviorKey);

  const key = `${aspirationId}:${behaviorKey}`;
  const counts = behaviorCounts?.[key];

  const dimensions = behavior
    ? (behavior.dimensionOverrides ?? behavior.dimensions)
    : [];

  // Map dimension effects to capital effects
  const capitalEffects = dimensions.map(d => {
    const completed = counts?.completed || 0;
    const total = counts?.total || 7;
    const rate = total > 0 ? completed / total : 0;

    return {
      capital: dimensionToCapital(d.dimension),
      direction: d.direction,
      strength: rate >= 0.7 ? "strong" as const : rate >= 0.4 ? "moderate" as const : "weak" as const,
    };
  });

  return {
    capitalEffects,
    dimensionsAffected: dimensions.map(d => d.dimension),
    totalCompletions: counts?.completed || 0,
    windowDays,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function dimensionToCapital(dim: DimensionKey): string {
  const map: Record<DimensionKey, string> = {
    body: "living",
    people: "social",
    money: "financial",
    home: "material",
    growth: "intellectual",
    joy: "experiential",
    purpose: "spiritual",
    identity: "cultural",
  };
  return map[dim] || dim;
}

// ─── Aggregate: Full RPPL status for a behavior ────────────────────────────

export interface RpplStatus {
  action: RpplAction | null;
  health: RpplHealth;
  outputs: RpplOutputs;
}

export function getRpplStatus(
  aspirationId: string,
  behaviorKey: string,
  aspirations: Aspiration[],
  patterns: Pattern[],
  date: string,
  behaviorCounts?: Record<string, { completed: number; total: number }>,
): RpplStatus {
  return {
    action: getRpplAction(aspirationId, behaviorKey, aspirations, date),
    health: getRpplHealth(aspirationId, behaviorKey, patterns, behaviorCounts),
    outputs: getRpplOutputs(aspirationId, behaviorKey, aspirations, behaviorCounts),
  };
}
