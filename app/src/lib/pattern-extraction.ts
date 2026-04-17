import type {
  Aspiration,
  Behavior,
  Pattern,
  PatternStep,
  PatternEvidence,
  PatternConfidence,
} from "@/types/v2";

// ─── Evidence thresholds ───────────────────────────────────────────────────
// Exported so UI can reason about the low-data state consistently.
export const EVIDENCE_MIN_OBSERVED_DAYS = 14;
export const EVIDENCE_MIN_TRIGGER_DAYS = 3;
export const EVIDENCE_MIN_NO_TRIGGER_DAYS = 3;
export const EVIDENCE_DEFAULT_WINDOW_DAYS = 28;

// Lift tier cut-offs. Lift = P(pathway | trigger) − P(pathway | ¬trigger).
export const EVIDENCE_TIER_EMERGING = 0.10;
export const EVIDENCE_TIER_VALIDATED = 0.25;
export const EVIDENCE_TIER_PROVEN = 0.40;

// Sample-size tier cut-offs (observed days).
export const EVIDENCE_SAMPLE_VALIDATED = 21;
export const EVIDENCE_SAMPLE_PROVEN = 45;

/**
 * Extract a pattern from an aspiration's behaviors when a trigger exists.
 *
 * A pattern emerges when:
 * 1. At least one behavior is marked `is_trigger: true` (from decomposition)
 * 2. There are 2+ behaviors (a trigger alone isn't a pattern)
 *
 * The trigger becomes The Decision. The remaining behaviors form the
 * Golden Pathway in their original order.
 *
 * Behaviors without `is_trigger` are standalone (pre-pattern) and
 * don't get bundled into a pattern.
 */
export function extractPatternFromAspiration(
  aspiration: Aspiration
): Pattern | null {
  const behaviors = aspiration.behaviors as (Behavior & { is_trigger?: boolean })[];
  if (!behaviors || behaviors.length < 2) return null;

  const triggerBehavior = behaviors.find(b => b.is_trigger);
  if (!triggerBehavior) return null;

  // Build ordered steps: trigger first, then remaining in order
  const steps: PatternStep[] = [];

  steps.push({
    behaviorKey: triggerBehavior.key,
    text: triggerBehavior.text,
    order: 0,
    isTrigger: true,
  });

  let order = 1;
  for (const b of behaviors) {
    if (b.key === triggerBehavior.key) continue;
    if (b.enabled === false) continue;
    steps.push({
      behaviorKey: b.key,
      text: b.text,
      order,
      isTrigger: false,
    });
    order++;
  }

  // Need at least trigger + 1 step to form a pattern
  if (steps.length < 2) return null;

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    aspirationId: aspiration.id,
    name: aspiration.title || aspiration.clarifiedText || aspiration.rawText,
    trigger: triggerBehavior.text,
    steps,
    timeWindow: undefined,
    validationMetric: undefined,
    validationCount: 0,
    validationTarget: 30,
    status: "finding",
    provenance: { source: "conversation" },
    evidence: { confidence: "seed", contextTags: [] },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Extract patterns from multiple aspirations.
 * Returns only aspirations that have a trigger behavior.
 */
export function extractPatternsFromAspirations(
  aspirations: Aspiration[]
): Pattern[] {
  const patterns: Pattern[] = [];
  for (const asp of aspirations) {
    const pattern = extractPatternFromAspiration(asp);
    if (pattern) patterns.push(pattern);
  }
  return patterns;
}

// ─── Correlation-based Evidence ────────────────────────────────────────────
// Given a pattern's trigger + golden pathway and a stream of behavior_log
// rows, measure directional lift: does completing the trigger predict
// completing the rest of the pathway?
//
// Lift = mean(pathwayRate | trigger done) − mean(pathwayRate | trigger not done)
// Range: [-1, 1]. Positive means the trigger predicts the pathway.
// The "not done" set includes observed days where the trigger row is
// missing or completed=false.

export interface BehaviorLogRow {
  behavior_key: string;
  date: string;
  completed: boolean;
}

export interface EvidenceComputation extends PatternEvidence {
  // Guaranteed numeric for computed evidence (overrides optional base fields)
  strength: number;
  sampleSize: number;
  triggerDays: number;
  noTriggerDays: number;
  windowDays: number;
  computedAt: string;
}

/**
 * Derive a PatternConfidence tier from numeric strength + sample size.
 * Returns "seed" for anything below the thresholds — an honest
 * "not enough data yet" signal rather than a false claim.
 */
export function deriveConfidence(
  strength: number,
  sampleSize: number,
  triggerDays: number,
  noTriggerDays: number,
): PatternConfidence {
  const hasSample =
    sampleSize >= EVIDENCE_MIN_OBSERVED_DAYS &&
    triggerDays >= EVIDENCE_MIN_TRIGGER_DAYS &&
    noTriggerDays >= EVIDENCE_MIN_NO_TRIGGER_DAYS;
  if (!hasSample) return "seed";
  if (strength >= EVIDENCE_TIER_PROVEN && sampleSize >= EVIDENCE_SAMPLE_PROVEN) {
    return "proven";
  }
  if (strength >= EVIDENCE_TIER_VALIDATED && sampleSize >= EVIDENCE_SAMPLE_VALIDATED) {
    return "validated";
  }
  if (strength >= EVIDENCE_TIER_EMERGING) return "emerging";
  return "seed";
}

/**
 * Compute correlation-based evidence for a pattern from behavior_log rows.
 * Pure function — no DB access. The caller is responsible for providing
 * the row set (typically a single query bounded to the window).
 */
export function computePatternEvidence(
  pattern: Pattern,
  rows: BehaviorLogRow[],
  opts?: {
    windowDays?: number;
    contextTags?: string[];
    validationNotes?: string;
  },
): EvidenceComputation {
  const windowDays = opts?.windowDays ?? EVIDENCE_DEFAULT_WINDOW_DAYS;
  const contextTags = opts?.contextTags ?? [];

  const triggerStep = pattern.steps.find(s => s.isTrigger);
  const pathwaySteps = pattern.steps.filter(s => !s.isTrigger);

  const emptyResult: EvidenceComputation = {
    confidence: "seed",
    contextTags,
    strength: 0,
    sampleSize: 0,
    triggerDays: 0,
    noTriggerDays: 0,
    windowDays,
    computedAt: new Date().toISOString(),
    ...(opts?.validationNotes ? { validationNotes: opts.validationNotes } : {}),
  };

  if (!triggerStep) return emptyResult;

  const triggerKey = triggerStep.behaviorKey;
  const pathwayKeys = pathwaySteps.map(s => s.behaviorKey);
  const allKeys = new Set<string>([triggerKey, ...pathwayKeys]);

  // Index rows by date → behaviorKey → completed. Include rows with
  // completed=false so we can distinguish "tracked but missed" from
  // "untracked".
  const byDate = new Map<string, Map<string, boolean>>();
  for (const row of rows) {
    if (!allKeys.has(row.behavior_key)) continue;
    let dayMap = byDate.get(row.date);
    if (!dayMap) {
      dayMap = new Map();
      byDate.set(row.date, dayMap);
    }
    // Prefer completed=true over completed=false on the same day
    const prev = dayMap.get(row.behavior_key);
    if (prev !== true) dayMap.set(row.behavior_key, row.completed);
  }

  // Observed days = any date where at least one of this pattern's behaviors
  // has a log row. This represents "days where the user engaged with this
  // pattern at all," which is the appropriate denominator for correlation.
  const observedDates = Array.from(byDate.keys());
  const sampleSize = observedDates.length;

  if (sampleSize === 0) return emptyResult;

  let triggerSum = 0;
  let noTriggerSum = 0;
  let triggerDays = 0;
  let noTriggerDays = 0;

  for (const date of observedDates) {
    const dayMap = byDate.get(date)!;
    const triggered = dayMap.get(triggerKey) === true;

    // Pathway completion rate for this day
    let pathwayCompleted = 0;
    if (pathwayKeys.length > 0) {
      for (const key of pathwayKeys) {
        if (dayMap.get(key) === true) pathwayCompleted++;
      }
    }
    const pathwayRate =
      pathwayKeys.length > 0 ? pathwayCompleted / pathwayKeys.length : (triggered ? 1 : 0);

    if (triggered) {
      triggerSum += pathwayRate;
      triggerDays++;
    } else {
      noTriggerSum += pathwayRate;
      noTriggerDays++;
    }
  }

  const withTriggerMean = triggerDays > 0 ? triggerSum / triggerDays : 0;
  const withoutTriggerMean = noTriggerDays > 0 ? noTriggerSum / noTriggerDays : 0;
  const strength = +(withTriggerMean - withoutTriggerMean).toFixed(4);

  const confidence = deriveConfidence(strength, sampleSize, triggerDays, noTriggerDays);

  return {
    confidence,
    contextTags,
    strength,
    sampleSize,
    triggerDays,
    noTriggerDays,
    windowDays,
    computedAt: new Date().toISOString(),
    ...(opts?.validationNotes ? { validationNotes: opts.validationNotes } : {}),
  };
}

/**
 * Derive context tags from a pattern's structural metadata. These are
 * coarse, honest tags — not behavioral inferences. Used to seed the
 * Evidence.contextTags field so cross-user pattern matching (future RPPL
 * commons work) has something to hang on to.
 */
export function deriveContextTags(
  pattern: Pattern,
  aspiration?: Aspiration,
): string[] {
  const tags: string[] = [];

  // Time-of-day from pattern.timeWindow or aspiration trigger window
  const window = pattern.timeWindow || aspiration?.triggerData?.window || "";
  const winLower = window.toLowerCase();
  if (/\bam\b|morning|5:|6:|7:|8:/.test(winLower)) tags.push("morning");
  else if (/\bpm\b|evening|night|9:|10:|11:|8:3/.test(winLower)) tags.push("evening");
  else if (/afternoon|1:|2:|3:|4:/.test(winLower)) tags.push("afternoon");

  // Primary dimension from aspiration behaviors (if available)
  if (aspiration?.behaviors && aspiration.behaviors.length > 0) {
    const dimCounts = new Map<string, number>();
    for (const b of aspiration.behaviors) {
      const dims = b.dimensions || [];
      for (const d of dims) {
        const key = typeof d === "string" ? d : d.dimension;
        if (key) dimCounts.set(key, (dimCounts.get(key) || 0) + 1);
      }
    }
    const sorted = Array.from(dimCounts.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted[0]) tags.push(sorted[0][0]);
  }

  return tags;
}
