// ─── Graph Verification Engine ───────────────────────────────────────────────
// Before recommending an RPPL, before compiling a daily sheet, before
// suggesting a new practice — verify the graph:
//
// 1. Port satisfaction: Does the user meet the inputs?
// 2. Connection integrity: Does every aspiration connect to daily behavior?
// 3. Gap detection: Which aspirations have no behavioral pathway?
// 4. Conflict detection: Are practices competing for the same resource?
// 5. Orphan detection: Are there practices connected to nothing?
//
// This is the capstone — it requires typed ports (Phase 1), capacity state
// (Phase 5), and the RPPL interface (Phase 4).

import type { HumaContext, CapacityState, CapacityLevel } from "@/types/context";
import type { Aspiration, Pattern, DimensionKey } from "@/types/v2";
import type { RpplSeed, RpplPort } from "@/data/rppl-seeds/types";

// ─── Verification Types ─────────────────────────────────────────────────────

export interface PortViolation {
  rpplId: string;
  rpplName: string;
  port: RpplPort;
  reason: string;         // "capacity 'awareness' is undeveloped, needs developing"
  severity: "blocking" | "warning";
}

export interface PortConflict {
  practiceA: string;      // aspiration/behavior identifier
  practiceB: string;
  resource: string;       // what they're competing for
  description: string;
}

export interface GraphSuggestion {
  type: "close-gap" | "resolve-conflict" | "satisfy-input" | "connect-orphan";
  target: string;         // what to fix
  suggestion: string;     // how to fix it
  impact: "high" | "medium" | "low";
}

export interface GraphVerification {
  integrity: "valid" | "gaps" | "conflicts";
  unconnectedAspirations: string[];       // aspirations with no behavioral pathway
  unsatisfiedInputs: PortViolation[];     // practices whose prerequisites aren't met
  conflicts: PortConflict[];              // practices competing for same resource
  dormantCapitals: string[];              // capitals with no active practice feeding them
  orphanPractices: string[];              // practices connected to nothing
  suggestions: GraphSuggestion[];         // what to fix, ordered by impact
}

// ─── Capacity Level Comparison ──────────────────────────────────────────────

const CAPACITY_ORDER: Record<CapacityLevel, number> = {
  undeveloped: 0,
  emerging: 1,
  developing: 2,
  strong: 3,
};

function meetsCapacityRequirement(
  userLevel: CapacityLevel | undefined,
  requiredLevel: CapacityLevel = "emerging",
): boolean {
  const user = CAPACITY_ORDER[userLevel || "undeveloped"];
  const required = CAPACITY_ORDER[requiredLevel];
  return user >= required;
}

// ─── Port Satisfaction Check ────────────────────────────────────────────────

function checkPortSatisfaction(
  seed: RpplSeed,
  capacityState: CapacityState | undefined,
): PortViolation[] {
  const violations: PortViolation[] = [];

  if (!seed.inputs) return violations;

  for (const input of seed.inputs) {
    if (input.required === false) continue;

    if (input.portType === "capacity") {
      const userLevel = capacityState?.[input.key as keyof CapacityState] as CapacityLevel | undefined;
      if (!meetsCapacityRequirement(userLevel, "emerging")) {
        violations.push({
          rpplId: seed.rpplId,
          rpplName: seed.name,
          port: input,
          reason: `capacity '${input.key}' is ${userLevel || "unknown"}, needs at least emerging`,
          severity: userLevel === "undeveloped" ? "blocking" : "warning",
        });
      }
    }
    // Future: check state, resource, boolean ports against context
  }

  return violations;
}

// ─── Main Verification ──────────────────────────────────────────────────────

export function verifyLifeGraph(
  aspirations: Aspiration[],
  patterns: Pattern[],
  rpplSeeds: RpplSeed[],
  context: HumaContext,
  behaviorCounts?: Record<string, { completed: number; total: number }>,
): GraphVerification {
  const activeAspirations = aspirations.filter(a => a.status === "active");
  const violations: PortViolation[] = [];
  const conflicts: PortConflict[] = [];
  const suggestions: GraphSuggestion[] = [];

  // ─── 1. Unconnected aspirations ────────────────────────────────────────
  const unconnectedAspirations: string[] = [];
  for (const asp of activeAspirations) {
    if (!asp.behaviors || asp.behaviors.length === 0) {
      unconnectedAspirations.push(asp.title || asp.clarifiedText || asp.rawText);
      suggestions.push({
        type: "close-gap",
        target: asp.title || asp.clarifiedText || asp.rawText,
        suggestion: `This aspiration has no daily behaviors. Decompose it into actionable practices.`,
        impact: "high",
      });
    }
  }

  // ─── 2. Port satisfaction (capacity prerequisites) ─────────────────────
  // Check frameworks that the user's active patterns reference
  const activeRpplIds = new Set<string>();
  for (const pattern of patterns) {
    if (pattern.provenance?.rpplId) {
      activeRpplIds.add(pattern.provenance.rpplId);
    }
  }

  for (const rpplId of activeRpplIds) {
    const seed = rpplSeeds.find(s => s.rpplId === rpplId);
    if (!seed) continue;

    const portViolations = checkPortSatisfaction(seed, context.capacityState);
    violations.push(...portViolations);
  }

  // Also check framework seeds that are referenced by capacity prerequisiteFor
  for (const seed of rpplSeeds) {
    if (seed.type !== "framework") continue;
    if (!seed.inputs?.length) continue;

    // Only check frameworks that connect to active aspirations through patterns
    const isActive = activeRpplIds.has(seed.rpplId);
    if (!isActive) continue;

    const portViolations = checkPortSatisfaction(seed, context.capacityState);
    for (const v of portViolations) {
      if (!violations.find(existing =>
        existing.rpplId === v.rpplId && existing.port.key === v.port.key
      )) {
        violations.push(v);
      }
    }
  }

  // Add suggestions for blocking violations
  for (const v of violations.filter(v => v.severity === "blocking")) {
    suggestions.push({
      type: "satisfy-input",
      target: v.rpplName,
      suggestion: `${v.rpplName} requires ${v.port.name} (${v.reason}). Consider cultivation practices first.`,
      impact: "high",
    });
  }

  // ─── 3. Dormant capitals ───────────────────────────────────────────────
  const allCapitals = ["financial", "material", "living", "social", "intellectual", "experiential", "spiritual", "cultural"];
  const fedCapitals = new Set<string>();

  const dimCapitalMap: Record<string, string> = {
    body: "living", people: "social", money: "financial", home: "material",
    growth: "intellectual", joy: "experiential", purpose: "spiritual", identity: "cultural",
  };

  for (const asp of activeAspirations) {
    for (const behavior of asp.behaviors || []) {
      const key = `${asp.id}:${behavior.key}`;
      const counts = behaviorCounts?.[key];
      if (counts && counts.completed > 0) {
        const dims = (behavior.dimensionOverrides ?? behavior.dimensions);
        for (const d of dims) {
          const capital = dimCapitalMap[d.dimension];
          if (capital) fedCapitals.add(capital);
        }
      }
    }
  }

  const dormantCapitals = allCapitals.filter(c => !fedCapitals.has(c));

  for (const capital of dormantCapitals) {
    suggestions.push({
      type: "close-gap",
      target: capital,
      suggestion: `No active practice feeds ${capital} capital. Consider adding a behavior in the ${Object.entries(dimCapitalMap).find(([, v]) => v === capital)?.[0] || capital} dimension.`,
      impact: "medium",
    });
  }

  // ─── 4. Orphan practices ───────────────────────────────────────────────
  const orphanPractices: string[] = [];
  for (const pattern of patterns) {
    const asp = aspirations.find(a => a.id === pattern.aspirationId);
    if (!asp || asp.status === "dropped" || asp.status === "archived") {
      orphanPractices.push(pattern.name);
      suggestions.push({
        type: "connect-orphan",
        target: pattern.name,
        suggestion: `This pattern has no active aspiration. It may be a zombie habit — consider connecting or dropping it.`,
        impact: "low",
      });
    }
  }

  // ─── 5. Time-slot conflicts ────────────────────────────────────────────
  // Simple heuristic: if multiple behaviors target the same time window
  const timeSlots = new Map<string, string[]>();
  for (const asp of activeAspirations) {
    for (const behavior of asp.behaviors || []) {
      const pattern = patterns.find(
        p => p.aspirationId === asp.id && p.steps.some(s => s.behaviorKey === behavior.key)
      );
      if (pattern?.timeWindow) {
        const existing = timeSlots.get(pattern.timeWindow) || [];
        existing.push(`${asp.title || asp.clarifiedText}:${behavior.text}`);
        timeSlots.set(pattern.timeWindow, existing);
      }
    }
  }

  for (const [window, practices] of timeSlots) {
    if (practices.length > 1) {
      conflicts.push({
        practiceA: practices[0],
        practiceB: practices[1],
        resource: `time:${window}`,
        description: `${practices.length} practices compete for the ${window} time slot`,
      });
    }
  }

  // ─── Determine overall integrity ───────────────────────────────────────
  let integrity: "valid" | "gaps" | "conflicts" = "valid";
  if (conflicts.length > 0) integrity = "conflicts";
  else if (unconnectedAspirations.length > 0 || dormantCapitals.length > 2) integrity = "gaps";

  // Sort suggestions by impact
  const impactOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return {
    integrity,
    unconnectedAspirations,
    unsatisfiedInputs: violations,
    conflicts,
    dormantCapitals,
    orphanPractices,
    suggestions,
  };
}

// ─── Compact Verification Summary (for prompt injection) ────────────────────

export function verificationSummary(v: GraphVerification): string {
  if (v.integrity === "valid" && v.suggestions.length === 0) {
    return "GRAPH: valid, no gaps or conflicts";
  }

  const parts: string[] = [];
  parts.push(`GRAPH: ${v.integrity}`);

  if (v.unconnectedAspirations.length > 0) {
    parts.push(`unconnected: ${v.unconnectedAspirations.join(", ")}`);
  }
  if (v.unsatisfiedInputs.length > 0) {
    const blocking = v.unsatisfiedInputs.filter(i => i.severity === "blocking");
    if (blocking.length > 0) {
      parts.push(`blocked: ${blocking.map(b => `${b.rpplName}(${b.port.key})`).join(", ")}`);
    }
  }
  if (v.dormantCapitals.length > 0) {
    parts.push(`dormant: ${v.dormantCapitals.join(", ")}`);
  }
  if (v.conflicts.length > 0) {
    parts.push(`conflicts: ${v.conflicts.length}`);
  }

  // Top 3 suggestions
  const topSuggestions = v.suggestions.slice(0, 3);
  if (topSuggestions.length > 0) {
    parts.push(`suggest: ${topSuggestions.map(s => s.suggestion).join(" | ")}`);
  }

  return parts.join("\n");
}
