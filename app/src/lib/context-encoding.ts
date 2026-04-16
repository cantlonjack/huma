// ─── Compressed Life-Graph Encoding ──────────────────────────────────────────
// Encodes the entire life graph into a token-efficient format for Claude.
//
// Three compression levels:
// - Level 0 "folded": entire life in ~200 tokens. Claude sees everything at once.
// - Level 1 "aspiration": one aspiration unfolded with practices + evidence (~500 tokens).
// - Level 2 "practice": specific practice with full behavioral evidence (~1000 tokens).
//
// Design from WeaveMind: compress the whole system so Claude can reason about
// the complete graph, not just the currently-relevant slice.

import type { HumaContext, CapacityState, CapacityLevel } from "@/types/context";
import type { Aspiration, Pattern, DimensionKey } from "@/types/v2";
import type { CapitalForm, CapitalScore } from "@/engine/canvas-types";
import type { RpplSeed } from "@/data/rppl-seeds/types";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CompressionLevel = "folded" | "aspiration" | "practice";

export interface EncodingInput {
  context: HumaContext;
  aspirations: Aspiration[];
  patterns: Pattern[];
  capitalScores?: CapitalScore[];
  dayCount?: number;
  behaviorCounts?: Record<string, { completed: number; total: number }>;
  rpplSeeds?: RpplSeed[];
}

// ─── Capacity Level Encoding ────────────────────────────────────────────────

const CAPACITY_LEVEL_NUM: Record<CapacityLevel, number> = {
  undeveloped: 1,
  emerging: 2,
  developing: 3,
  strong: 4,
};

function encodeCapacityState(cs: CapacityState): string {
  const aw = CAPACITY_LEVEL_NUM[cs.awareness] || 0;
  const ho = CAPACITY_LEVEL_NUM[cs.honesty] || 0;
  const ca = CAPACITY_LEVEL_NUM[cs.care] || 0;
  const ag = CAPACITY_LEVEL_NUM[cs.agency] || 0;
  const hu = CAPACITY_LEVEL_NUM[cs.humility] || 0;
  return `CAP[aw:${aw} ho:${ho} ca:${ca} ag:${ag} hu:${hu}]`;
}

// ─── Dimension Encoding ─────────────────────────────────────────────────────

function encodeDimensionScore(
  capitalScores: CapitalScore[] | undefined,
  dimensionKey: DimensionKey,
  context: HumaContext,
): string {
  // Map dimension to primary capital for score
  const dimCapitalMap: Record<DimensionKey, CapitalForm> = {
    body: "living", people: "social", money: "financial", home: "material",
    growth: "intellectual", joy: "experiential", purpose: "spiritual", identity: "cultural",
  };

  const capital = dimCapitalMap[dimensionKey];
  const score = capitalScores?.find(c => c.form === capital);
  const scoreStr = score ? score.score.toFixed(1) : "?";

  // Extract key details from context
  const details: string[] = [];
  const flags: string[] = [];

  switch (dimensionKey) {
    case "body":
      if (context.body.sleep) details.push(`sleep:${context.body.sleep}`);
      if (context.body.conditions?.length) details.push(context.body.conditions[0]);
      break;
    case "people":
      if (context.people.household?.length) details.push(`household:${context.people.household.length}`);
      break;
    case "money":
      if (context.money.income) details.push(context.money.income);
      if (context.money.debt) flags.push("debt-active");
      break;
    case "home":
      if (context.home.location) details.push(context.home.location);
      if (context.home.land) details.push(context.home.land);
      break;
    case "growth":
      if (context.growth.currentLearning?.length) details.push(`learning:${context.growth.currentLearning.length}`);
      break;
    case "joy":
      if (context.joy.sources?.length) details.push(`sources:${context.joy.sources.length}`);
      if (!context.joy.sources?.length && !context.joy.rhythms?.length) flags.push("dormant");
      break;
    case "purpose":
      if (context.purpose.whyStatement) details.push("WHY:set");
      break;
    case "identity":
      if (context.identity.archetypes?.length) details.push(context.identity.archetypes[0]);
      break;
  }

  const detailStr = details.length > 0 ? ` ${details.join(" ")}` : "";
  const flagStr = flags.length > 0 ? ` \u26a0\ufe0f${flags.join(",")}` : "";

  return `${dimensionKey}[${scoreStr}]${detailStr}${flagStr}`;
}

// ─── Aspiration Trend ───────────────────────────────────────────────────────

function aspirationTrend(
  aspiration: Aspiration,
  behaviorCounts?: Record<string, { completed: number; total: number }>,
): string {
  if (!behaviorCounts || !aspiration.behaviors?.length) return "\u2192";

  let totalCompleted = 0;
  let totalPossible = 0;

  for (const b of aspiration.behaviors) {
    const key = `${aspiration.id}:${b.key}`;
    const counts = behaviorCounts[key];
    if (counts) {
      totalCompleted += counts.completed;
      totalPossible += counts.total;
    }
  }

  if (totalPossible === 0) return "\u2192";
  const rate = Math.round((totalCompleted / totalPossible) * 100);

  // Simple trend arrow
  if (rate >= 70) return "\u2191";
  if (rate <= 30) return "\u2193";
  return "\u2192";
}

// ─── Level 0: Folded Encoding (~200 tokens) ────────────────────────────────

export function encodeFolded(input: EncodingInput): string {
  const { context, aspirations, patterns, capitalScores, dayCount, behaviorCounts } = input;

  const activeAspirations = aspirations.filter(a => a.status === "active");
  const activePatterns = patterns.filter(p => p.status !== "validated");

  const lines: string[] = [];

  // Header
  lines.push(`LIFE[d${dayCount || 0} a${activeAspirations.length} p${activePatterns.length}]`);

  // WHY statement
  if (context.purpose.whyStatement) {
    lines.push(` WHY:"${context.purpose.whyStatement}"`);
  }

  // Capacity state
  if (context.capacityState) {
    lines.push(` ${encodeCapacityState(context.capacityState)}`);
  }

  // Dimension scores (compact line)
  const dims: DimensionKey[] = ["body", "people", "money", "home", "growth", "joy", "purpose", "identity"];
  const dimPairs: string[] = [];
  for (const dim of dims) {
    dimPairs.push(encodeDimensionScore(capitalScores, dim, context));
  }
  // Group into 2 lines of 4
  lines.push(` ${dimPairs.slice(0, 4).join(" | ")}`);
  lines.push(` ${dimPairs.slice(4).join(" | ")}`);

  // Aspirations (one line each)
  for (const asp of activeAspirations) {
    const title = asp.title || asp.clarifiedText || asp.rawText;
    const shortTitle = title.replace(/\s+/g, "").slice(0, 20);

    let rate = 0;
    if (behaviorCounts && asp.behaviors?.length) {
      let completed = 0, total = 0;
      for (const b of asp.behaviors) {
        const key = `${asp.id}:${b.key}`;
        const counts = behaviorCounts[key];
        if (counts) { completed += counts.completed; total += counts.total; }
      }
      rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    const trend = aspirationTrend(asp, behaviorCounts);
    lines.push(` ASP:${shortTitle}[${rate}%${trend}]`);
  }

  // Flags (aggregate warnings)
  const flags: string[] = [];
  if (!context.joy.sources?.length && !context.joy.rhythms?.length) flags.push("joy-dormant");
  if (context.money.debt) flags.push("debt-active");
  if (flags.length > 0) {
    lines.push(` \u26a0\ufe0fFLAGS: ${flags.join(", ")}`);
  }

  return lines.join("\n");
}

// ─── Level 1: Aspiration-Expanded (~500 tokens) ────────────────────────────

export function encodeAspiration(
  input: EncodingInput,
  aspirationId: string,
): string {
  const { aspirations, patterns, behaviorCounts, dayCount } = input;

  const asp = aspirations.find(a => a.id === aspirationId);
  if (!asp) return `ASP:not-found[${aspirationId}]`;

  const title = asp.title || asp.clarifiedText || asp.rawText;
  const aspPatterns = patterns.filter(p => p.aspirationId === aspirationId);

  let overallRate = 0;
  if (behaviorCounts && asp.behaviors?.length) {
    let completed = 0, total = 0;
    for (const b of asp.behaviors) {
      const key = `${asp.id}:${b.key}`;
      const counts = behaviorCounts[key];
      if (counts) { completed += counts.completed; total += counts.total; }
    }
    overallRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  const trend = aspirationTrend(asp, behaviorCounts);
  const lines: string[] = [];

  lines.push(`ASP:${title}[${overallRate}%${trend} d${dayCount || 0}]`);

  // Behaviors as practice lines
  if (asp.behaviors?.length) {
    for (const behavior of asp.behaviors) {
      const key = `${asp.id}:${behavior.key}`;
      const counts = behaviorCounts?.[key];
      const completed = counts?.completed || 0;
      const total = counts?.total || 7;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const statusIcon = rate >= 70 ? "\u2713" : rate <= 30 ? "\u26a0\ufe0f" : "\u2192";
      const freq = behavior.frequency || "daily";
      const dims = behavior.dimensions?.map(d => d.dimension).join(",") || "";

      lines.push(` \u251c\u2500 PRC:${behavior.text} ${freq} ${completed}/${total} ${statusIcon}`);
      if (dims) {
        lines.push(` \u2502   dims[${dims}]`);
      }
    }
  }

  // Patterns
  if (aspPatterns.length > 0) {
    for (const pattern of aspPatterns) {
      lines.push(` \u2514\u2500 PATTERN: ${pattern.name} (${pattern.status}, ${pattern.validationCount}/${pattern.validationTarget}d)`);
    }
  }

  // Gaps: dimensions touched by aspiration but no active behavior
  const touchedDims = new Set(asp.dimensionsTouched || []);
  const behaviorDims = new Set<string>();
  if (asp.behaviors) {
    for (const b of asp.behaviors) {
      if (b.dimensions) b.dimensions.forEach(d => behaviorDims.add(d.dimension));
    }
  }
  const gaps = [...touchedDims].filter(d => !behaviorDims.has(d));
  if (gaps.length > 0) {
    lines.push(` GAP: no active behavior for ${gaps.join(", ")}`);
  }

  return lines.join("\n");
}

// ─── Level 2: Practice-Expanded (~1000 tokens) ─────────────────────────────

export function encodePractice(
  input: EncodingInput,
  aspirationId: string,
  behaviorKey: string,
): string {
  const { aspirations, patterns, behaviorCounts, rpplSeeds } = input;

  const asp = aspirations.find(a => a.id === aspirationId);
  if (!asp) return `PRC:not-found[${aspirationId}]`;

  const behavior = asp.behaviors?.find(b => b.key === behaviorKey);
  if (!behavior) return `PRC:not-found[${behaviorKey}]`;

  const key = `${aspirationId}:${behaviorKey}`;
  const counts = behaviorCounts?.[key];

  const pattern = patterns.find(
    p => p.aspirationId === aspirationId && p.steps.some(s => s.behaviorKey === behaviorKey)
  );

  const lines: string[] = [];

  lines.push(`PRC:${behavior.text}`);

  // RPPL provenance if available
  if (pattern?.provenance?.rpplId && rpplSeeds) {
    const seed = rpplSeeds.find(s => s.rpplId === pattern.provenance!.rpplId);
    if (seed) {
      lines.push(` RPPL: ${seed.name} [${seed.type}]`);
      if (seed.provenance.sourceTradition) {
        lines.push(` TRADITION: ${seed.provenance.sourceTradition}`);
      }
    }
  }

  // Trigger and steps
  if (behavior.detail) {
    lines.push(` DETAIL: ${behavior.detail}`);
  }
  if (behavior.frequency) {
    lines.push(` FREQ: ${behavior.frequency}`);
  }

  // Pattern steps
  if (pattern?.steps?.length) {
    const stepStr = pattern.steps
      .sort((a, b) => a.order - b.order)
      .map(s => `${s.order}.${s.text}${s.isTrigger ? "*" : ""}`)
      .join(" ");
    lines.push(` STEPS: ${stepStr}`);
  }
  if (pattern?.timeWindow) {
    lines.push(` WINDOW: ${pattern.timeWindow}`);
  }

  // Evidence
  if (counts) {
    const rate = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
    const status = rate >= 70 ? "working" : rate >= 40 ? "finding" : "struggling";
    lines.push(` EVIDENCE:`);
    lines.push(`  completion: ${counts.completed}/${counts.total} (${rate}%) status:${status}`);
  }

  return lines.join("\n");
}

// ─── Conversation History Compression ──────────────────────────────────────
// Keep the most recent messages in full; condense older ones to a single
// line each. Target: 60-75% reduction vs. shipping raw conversation.

export interface ConversationMessage {
  role: string;
  content: string;
}

export function compressConversationHistory(
  messages: ConversationMessage[],
  keepRecent: number = 5,
  condenseMax: number = 60,
): string {
  if (messages.length === 0) return "No conversation yet.";

  const older = messages.slice(0, -keepRecent);
  const recent = messages.slice(-keepRecent);

  const condensed = older.map(m => {
    const roleTag = m.role === "user" ? "U" : "H";
    const text = m.content.replace(/\s+/g, " ").trim();
    const short = text.length > condenseMax ? `${text.slice(0, condenseMax)}\u2026` : text;
    return `${roleTag}:${short}`;
  });

  const full = recent.map(m => `${m.role === "user" ? "Operator" : "HUMA"}: ${m.content}`);

  const parts: string[] = [];
  if (condensed.length > 0) {
    parts.push(`[Earlier ${condensed.length} exchanges condensed]`);
    parts.push(condensed.join("\n"));
    parts.push("");
  }
  parts.push("[Recent exchanges]");
  parts.push(full.join("\n\n"));

  return parts.join("\n");
}

// ─── Main Encoder ───────────────────────────────────────────────────────────

export function encodeLifeGraph(
  input: EncodingInput,
  level: CompressionLevel,
  focusId?: string,
  behaviorKey?: string,
): string {
  switch (level) {
    case "folded":
      return encodeFolded(input);
    case "aspiration":
      if (!focusId) return encodeFolded(input);
      return `${encodeFolded(input)}\n\n${encodeAspiration(input, focusId)}`;
    case "practice":
      if (!focusId || !behaviorKey) return encodeFolded(input);
      return `${encodeFolded(input)}\n\n${encodePractice(input, focusId, behaviorKey)}`;
  }
}
