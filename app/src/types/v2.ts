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

export interface Aspiration {
  id: string;
  rawText: string;
  clarifiedText: string;
  behaviors: Behavior[];
  dimensionsTouched: DimensionKey[];
  status: "active" | "paused" | "completed" | "dropped";
  stage: "active" | "planning" | "someday";
  funnel?: AspirationFunnel;
  triggerData?: AspirationTrigger;
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

export interface KnownContext {
  people?: KnownContextPerson[];
  place?: { name: string; detail: string };
  work?: { title: string; detail: string };
  time?: { detail: string };
  stage?: { label: string; detail: string };
  health?: { detail: string };
  resources?: string[];
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
  userId: string;
  date: string;
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
