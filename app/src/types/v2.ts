// ─── HUMA V2 Type System ──────────────────────────────────────────────────────
// Core types for the V2 core loop: Conversation → Decomposition → Production Sheet → Insight

// ─── Dimensions ──────────────────────────────────────────────────────────────

export type DimensionKey =
  | "body"
  | "people"
  | "money"
  | "home"
  | "growth"
  | "joy"
  | "purpose"
  | "identity";

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  body: "Body",
  people: "People",
  money: "Money",
  home: "Home",
  growth: "Growth",
  joy: "Joy",
  purpose: "Purpose",
  identity: "Identity",
};

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  body: "#5C7A62",     // sage-500
  people: "#8BAF8E",   // sage-300
  money: "#B5621E",    // amber-600
  home: "#6B6358",     // ink-500
  growth: "#2E6B8A",   // sky-600
  joy: "#E8935A",      // amber-400
  purpose: "#3A5A40",  // sage-700
  identity: "#A04040", // rose-600
};

// ─── Behaviors & Aspirations ─────────────────────────────────────────────────

export interface DimensionEffect {
  dimension: DimensionKey;
  direction: "builds" | "costs" | "protects";
  reasoning: string;
}

export interface Behavior {
  key: string;
  text: string;
  frequency: "daily" | "weekly" | "specific-days";
  days?: string[];
  dimensions: DimensionEffect[];
  detail?: string;
  enabled?: boolean;
  source?: "template" | "conversation";
}

export interface AspirationFunnel {
  stage: number; // 0-7
  patternsRemaining: number;
  selectedPatternId: string | null;
  validationStatus:
    | "working"
    | "active"
    | "finding"
    | "adjusting"
    | "no_path"
    | null;
}

export interface AspirationTrigger {
  behavior: string;
  window: string;
  failureNote: string;
}

export interface FutureAction {
  name: string;
  detail: string;
  timeframe: string;
}

export interface FuturePhase {
  phase: string;
  detail: string;
  timeframe: string;
}

export interface Aspiration {
  id: string;
  rawText: string;
  clarifiedText: string;
  title?: string;             // Short name (3-5 words) from decomposition
  summary?: string;           // One sentence — what this is for this person
  behaviors: Behavior[];      // this_week behaviors (go to production sheet)
  comingUp?: FutureAction[];  // Next 2-4 weeks (stored, not on /today)
  longerArc?: FuturePhase[];  // Seasonal/multi-month picture (stored, not on /today)
  dimensionsTouched: DimensionKey[];
  status: "active" | "paused" | "completed" | "dropped" | "archived";
  stage: "active" | "planning" | "someday";
  source?: "conversation" | "template";  // How this aspiration was created
  funnel?: AspirationFunnel;
  triggerData?: AspirationTrigger;
}

// ─── Patterns ───────────────────────────────────────────────────────────────
// A pattern is a validated sequence of behaviors with a trigger, golden pathway,
// time window, and validation metric. Patterns emerge from aspirations when
// behaviors have a trigger + sequence + window.

export type PatternStatus = "finding" | "working" | "validated";

export interface PatternStep {
  behaviorKey: string;
  text: string;
  order: number;
  isTrigger: boolean;
}

export interface Pattern {
  id: string;
  aspirationId: string;
  name: string;
  trigger: string;              // The Decision — the behavior that starts the chain
  steps: PatternStep[];         // Golden Pathway — ordered behavior sequence
  timeWindow?: string;          // e.g. "5:15-5:45 AM"
  validationMetric?: string;    // What counts as validated (e.g. "completed 26/30 days")
  validationCount: number;      // Days completed in current 30-day window
  validationTarget: number;     // Target days (default 30)
  status: PatternStatus;        // finding (<50%), working (50-90%), validated (>90%)
  createdAt: string;
  updatedAt: string;
}

// ─── Merge Suggestions ────────────────────────────────────────────────────
// When two patterns from different aspirations share one or more behaviors,
// HUMA surfaces a merge suggestion on the pattern card. The operator can
// merge (combining golden pathways) or dismiss (keep separate).

export interface MergeSuggestion {
  patternId: string;            // The pattern this suggestion appears on
  otherPatternId: string;       // The pattern it could merge with
  otherPatternName: string;     // Display name of the other pattern
  sharedBehaviors: string[];    // Behavior texts that overlap
}

// ─── Emerging Behaviors ────────────────────────────────────────────────────
// An unnamed behavior that has appeared consistently (12+ of last 14 days)
// without being part of an existing pattern. Surfaced on the Grow tab as
// "something forming..." for the operator to name/formalize or dismiss.

export interface EmergingBehavior {
  behaviorKey: string;
  behaviorName: string;             // Display text from behavior_log
  completedDays: number;            // Number of completed days in 14-day window
  totalDays: number;                // Always 14
  dimensions: DimensionKey[];       // From source aspiration behavior, if matched
  aspirationId?: string;            // Source aspiration, if identifiable
}

// ─── Principles ─────────────────────────────────────────────────────────────

export interface Principle {
  id: string;
  text: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Known Context (Structured) ─────────────────────────────────────────────

export interface KnownContextPerson {
  name: string;
  role: string;
}

export interface NotificationPreferences {
  morning?: { enabled: boolean; hour: number };   // hour in local time (0-23), default 7
  evening?: { enabled: boolean; hour: number };    // hour in local time (0-23), default 21
  timezone?: string;                                // IANA timezone, e.g. "America/New_York"
}

export interface FinancialContext {
  situation?: string;       // e.g. "tight budget", "comfortable", "debt payoff mode"
  income?: string;          // e.g. "freelance, variable" or "salaried, bi-weekly"
  constraints?: string[];   // e.g. ["$200/week groceries", "no discretionary until May"]
  rhythm?: string;          // e.g. "paid bi-weekly Fridays" or "invoices land mid-month"
}

export interface KnownContext {
  people?: KnownContextPerson[];
  place?: { name: string; detail: string };
  work?: { title: string; detail: string };
  time?: { detail: string };
  stage?: { label: string; detail: string };
  health?: { detail: string };
  financial?: FinancialContext;
  resources?: string[];
  notifications?: NotificationPreferences;
  [key: string]: unknown;
}

// ─── Production Sheet ────────────────────────────────────────────────────────

export interface SheetEntry {
  id: string;
  aspirationId: string;
  behaviorKey: string;
  behaviorText: string;
  headline?: string;
  detail: string | Record<string, unknown>;
  timeOfDay: "morning" | "midday" | "evening";
  dimensions?: string[];
  checked: boolean;
  checkedAt?: string;
  streakText?: string;
}

// ─── Insights ────────────────────────────────────────────────────────────────

export interface Insight {
  id: string;
  text: string;
  dimensionsInvolved: DimensionKey[];
  behaviorsInvolved: string[];
  dataBasis: {
    correlation: number;
    dataPoints: number;
    pattern: string;
  };
  delivered: boolean;
  deliveredAt?: string;
}

// ─── Sparkline Data ─────────────────────────────────────────────────────────

/** Daily completion ratio for a pattern over a 14-day window. */
export interface SparklinePoint {
  date: string;       // YYYY-MM-DD
  ratio: number;      // 0–1 (completions / total behaviors in pattern)
}

/** Sparkline data for one pattern: 14 daily points + trend direction. */
export interface SparklineData {
  patternId: string;
  points: SparklinePoint[];       // 14 entries, oldest first
  trend: "rising" | "stable" | "dropping";
}

// ─── Proactive Nudges ───────────────────────────────────────────────────────
// 0-2 nudges per day. Shown when the operator opens Today. Dismissable.
// Types: temporal (time-sensitive), pattern (behavioral trends), opportunity (connections).

export type NudgeType = "temporal" | "pattern" | "opportunity";

export interface Nudge {
  id: string;
  type: NudgeType;
  text: string;                    // The nudge itself (1-2 sentences)
  source?: string;                 // What triggered this nudge (for debugging/learning)
  dismissedAt?: string;            // ISO date if operator dismissed
}

// ─── Capital Pulse ──────────────────────────────────────────────────────────
// One-line summary of which dimensions were moved today.

export interface CapitalPulse {
  moved: DimensionKey[];           // Dimensions with at least one check-off today
  dormant: DimensionKey[];         // Dimensions with no activity in 5+ days
  text: string;                    // e.g. "Today moved Body and Money. Growth hasn't been touched in 5 days."
}

// ─── Monthly Review ─────────────────────────────────────────────────────────

/** Consistency level for a behavior in a given week. */
export type WeekConsistency = "consistent" | "intermittent" | "absent";

/** One behavior's row in the monthly review grid. */
export interface MonthlyReviewRow {
  behaviorKey: string;
  behaviorName: string;
  dimensions: DimensionKey[];
  weeks: WeekConsistency[];  // 4 entries (week 1–4, oldest first)
}

/** Full monthly review data. */
export interface MonthlyReviewData {
  month: string;             // e.g. "March 2026"
  weekRanges: string[];      // 4 entries, e.g. ["Mar 3–9", "Mar 10–16", ...]
  rows: MonthlyReviewRow[];
}

// ─── Life Stage Transition ──────────────────────────────────────────────────

/** Detected when multiple aspirations decline simultaneously — signals a life stage shift. */
export interface TransitionSignal {
  detected: boolean;
  severity: "gentle" | "significant";   // gentle: 2 aspirations dropping; significant: 3+
  decliningAspirations: Array<{
    id: string;
    name: string;
    completionRate: number;             // 0–100
    previousRate: number;               // 0–100 (prior 14-day window)
    drop: number;                       // percentage points dropped
  }>;
  stableAspirations: Array<{
    id: string;
    name: string;
    completionRate: number;
  }>;
  daysSinceLastTransition?: number;     // cooldown — don't re-fire within 14 days
  dismissedAt?: string;                 // ISO date if operator dismissed this signal
}

/** Output from a reorganization conversation — what to release, protect, revise. */
export interface ReorganizationPlan {
  release: Array<{
    aspirationId: string;
    name: string;
    reason: string;                     // Why this can be released right now
  }>;
  protect: Array<{
    aspirationId: string;
    name: string;
    reason: string;                     // Why this needs guarding
  }>;
  revise: Array<{
    aspirationId: string;
    name: string;
    revisedBehaviors: Array<{
      key: string;
      name: string;
      text: string;
      detail: string;
      is_trigger: boolean;
      dimensions: string[];
      frequency: "daily" | "weekly" | "specific-days";
    }>;
  }>;
  contextUpdate?: Record<string, unknown>; // New context learned during reorganization
}

// ─── Chat Messages ───────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "huma";
  content: string;
  contextExtracted?: Record<string, unknown>;
  createdAt: string;
}

// ─── Operator Context (V2) ───────────────────────────────────────────────────

export interface OperatorContextV2 {
  id: string;
  userId?: string;
  rawStatements: string[];
  aspirations: Aspiration[];
  knownContext: KnownContext;
  dimensionalState: Record<DimensionKey, number>;
  whyStatement?: string;
  whyDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

export interface PaletteConcept {
  id: string;
  text: string;
  category: "pain" | "aspiration";
  primaryDimensions: DimensionKey[];
  relatedConcepts: string[];
  decompositionHint: string;
}

// ─── API Request/Response Types ──────────────────────────────────────────────

export interface DecomposeRequest {
  messages: ChatMessage[];
  aspirationText: string;
  clarifications: Record<string, string>;
}

export interface DecomposeResponse {
  aspiration: Aspiration;
  followUpQuestion?: string;
}

export interface SheetCompileRequest {
  name: string;
  date: string;                                    // YYYY-MM-DD, client local timezone
  aspirations: Array<{
    id: string;
    rawText: string;
    clarifiedText: string;
    behaviors: Array<{
      key: string;
      text: string;
      frequency: string;
      days?: string[];
      detail?: string;
      enabled?: boolean;
    }>;
  }>;
  knownContext: KnownContext;                       // Full structured context
  recentHistory: Array<{                           // Last 7 days of check-off data
    date: string;
    behaviorKey: string;
    checked: boolean;
  }>;
  conversationMessages: Array<{                    // Recent conversation (last 20)
    role: string;
    content: string;
  }>;
  dayOfWeek: string;                               // e.g. "Wednesday"
  season: string;                                  // e.g. "early spring"
  dayCount: number;                                // Days since operator started
  archetypes?: string[];                           // Primary/secondary archetype names
  whyStatement?: string;                           // Operator's WHY
}

export interface SheetCompileResponse {
  entries: SheetEntry[];
  date: string;
}

export interface InsightComputeRequest {
  userId: string;
}

export interface InsightComputeResponse {
  insight: Insight | null;
}

export interface PaletteRequest {
  conversationSoFar: string[];
  selectedConcepts: string[];
}

export interface PaletteResponse {
  concepts: PaletteConcept[];
}
