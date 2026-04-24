// ─── HUMA Context Model ──────────────────────────────────────────────────────
// The structured, persistent model of a user's whole life.
// This is the product. Everything else — daily sheets, decision support,
// proactive nudges, pattern intelligence — is an output of this model.
//
// Design principles:
// - Organized by the 8 dimensions (Body, People, Money, Home, Growth, Joy, Purpose, Identity)
// - Every field tracks its source (conversation, inferred, explicit edit)
// - Deep merge, not shallow — nested fields update independently
// - The model is built through conversation, not forms

import type { DimensionKey } from "./v2";

// ─── Source Tracking ────────────────────────────────────────────────────────
// Every fact in the context model knows where it came from and when.

export type ContextSourceType = "conversation" | "inferred" | "explicit" | "template";

export interface ContextSource {
  fieldPath: string;             // e.g. "people.household[0].name"
  value: unknown;                // the value that was set
  source: ContextSourceType;
  date: string;                  // ISO date
  messageId?: string;            // which conversation message produced this
}

// ─── People ─────────────────────────────────────────────────────────────────

export interface Person {
  name: string;
  relationship: string;          // "wife", "daughter", "business partner", "neighbor"
  age?: number;
  detail?: string;               // anything relevant: "works nights", "has coyote problems"
}

export interface PeopleContext {
  household?: Person[];          // people living with the user
  community?: Person[];          // neighbors, local contacts, market connections
  professional?: Person[];       // mentors, accountants, consultants, collaborators
}

// ─── Money ──────────────────────────────────────────────────────────────────

export interface Enterprise {
  name: string;
  type?: string;                 // "employment", "side business", "farm enterprise"
  revenue?: string;              // "~$2000/month", "$14000/yr projected"
  status: "active" | "planned" | "exploring";
  detail?: string;
}

export interface MoneyContext {
  income?: string;               // "combined household ~$85k", "freelance, variable"
  constraints?: string[];        // "$400/month food budget", "no discretionary until May"
  rhythm?: string;               // "paid bi-weekly Fridays"
  enterprises?: Enterprise[];    // income streams — jobs, businesses, side projects
  debt?: string;                 // "student loans $22k", "mortgage $180k"
  savings?: string;              // "emergency fund 3 months", "barn fund $1200"
  financialGoal?: string;        // "quit day job by 2028", "pay off debt by 2027"
}

// ─── Home & Resources ───────────────────────────────────────────────────────

export interface Resource {
  name: string;
  detail?: string;               // "2 acres", "3-season garden", "commercial kitchen"
}

export interface HomeContext {
  location?: string;             // "rural Michigan", "Portland OR"
  climateZone?: string;          // "Zone 5b", "maritime"
  type?: string;                 // "apartment", "house", "homestead", "land"
  resources?: Resource[];        // physical assets: tools, equipment, spaces
  infrastructure?: string[];     // "perimeter fencing", "well water", "solar panels"
  land?: string;                 // "2 acres sandy soil", "1/4 acre suburban lot"
}

// ─── Body ───────────────────────────────────────────────────────────────────

export interface BodyContext {
  conditions?: string[];         // "bad knee", "chronic fatigue", "type 2 diabetes"
  capacity?: string;             // "can run 5k", "limited mobility", "high energy"
  sleep?: string;                // "6 hours average", "insomnia", "good"
  nutrition?: string;            // "animal-based", "vegetarian", "no restrictions"
}

// ─── Growth ─────────────────────────────────────────────────────────────────

export interface Skill {
  name: string;
  level: "learning" | "competent" | "expert";
  source?: string;               // "10 years professional", "self-taught", "coursework"
}

export interface GrowthContext {
  skills?: Skill[];              // what the user knows and how well
  gaps?: string[];               // what they need to learn
  currentLearning?: string[];    // active learning: courses, books, practice
  interests?: string[];          // things they want to explore
}

// ─── Joy ────────────────────────────────────────────────────────────────────

export interface JoyContext {
  sources?: string[];            // what brings them joy
  drains?: string[];             // what depletes them
  rhythms?: string[];            // "Sunday morning coffee", "evening walks"
}

// ─── Purpose ────────────────────────────────────────────────────────────────

export interface PurposeContext {
  whyStatement?: string;         // their north star, if articulated
  whyDate?: string;              // when the WHY was last updated
  contribution?: string;         // how they want to serve others/community
  vision?: string;               // 5-20 year picture: "self-sufficient homestead", "own business"
  values?: string[];             // explicitly stated values
}

// ─── Identity ───────────────────────────────────────────────────────────────

export interface IdentityContext {
  archetypes?: string[];         // selected archetypes from onboarding
  roles?: string[];              // "father", "engineer", "homesteader", "caregiver"
  culture?: string;              // cultural context that shapes decisions
}

// ─── Time & Schedule ────────────────────────────────────────────────────────

export interface TimeBlock {
  day?: string;                  // "weekdays", "sunday", "daily"
  time?: string;                 // "5-6am", "after kids' bedtime"
  availableMinutes?: number;
  notes?: string;                // "only if wife is home", "flexible"
}

export interface TimeContext {
  stage?: string;                // life stage: "new parent", "career transition", "retired"
  stageDetail?: string;          // "baby arriving October", "just moved"
  timeBlocks?: TimeBlock[];      // when they have capacity for what
  constraints?: string[];        // "wife works nights", "school pickup at 3pm"
}

// ─── Temporal Planning ──────────────────────────────────────────────────────
// What's due, overdue, and coming — the basis for proactive nudges.

export interface TimelineItem {
  what: string;                  // "order pullets for June delivery"
  when: string;                  // "March 2026", "next week", ISO date
  source: "plan" | "seasonal" | "user" | "pattern";
  completed?: boolean;
  completedDate?: string;
}

export interface Milestone {
  name: string;                  // "barn build", "launch cheese enterprise"
  targetDate?: string;           // ISO date or rough: "Year 4"
  status: "planned" | "in-progress" | "completed" | "deferred";
  dependencies?: string[];       // what needs to happen first
  detail?: string;
}

export interface TemporalContext {
  upcoming?: TimelineItem[];
  overdue?: TimelineItem[];
  season?: string;               // current season + what it implies
  milestones?: Milestone[];
}

// ─── Decision Log ───────────────────────────────────────────────────────────
// Every significant decision, with reasoning and follow-up.

export interface Decision {
  id: string;
  date: string;                  // ISO date
  description: string;           // "Decided to build temporary sheep shelter"
  reasoning: string;             // "Saves $2,200 for barn fund. Gets through winter."
  frameworksSurfaced?: string[];  // which HM tests were relevant: "weak_link", "marginal_reaction"
  outcome?: string;              // filled in when HUMA follows up
  outcomeDate?: string;
  followUpDue?: string;          // when to ask "how did this work out?"
}

// ─── Capacity State ─────────────────────────────────────────────────────────
// The "soil measurement" — determines what frameworks can take root.
// Assessed from behavioral signals, not self-report.

export type CapacityLevel = "undeveloped" | "emerging" | "developing" | "strong";

export interface CapacityState {
  awareness: CapacityLevel;
  honesty: CapacityLevel;
  care: CapacityLevel;
  agency: CapacityLevel;
  humility: CapacityLevel;
  _assessedAt?: string;      // ISO timestamp of last assessment
  _assessedFrom?: string;    // "conversation" | "behavioral" | "self-report"
}

// ─── The Complete Context Model ─────────────────────────────────────────────

export interface HumaContext {
  // The 8 dimensions
  body: BodyContext;
  people: PeopleContext;
  money: MoneyContext;
  home: HomeContext;
  growth: GrowthContext;
  joy: JoyContext;
  purpose: PurposeContext;
  identity: IdentityContext;

  // Cross-cutting
  time: TimeContext;
  temporal: TemporalContext;
  decisions: Decision[];
  capacityState?: CapacityState;

  // REGEN-02: Dormancy — operator-state rest signal. Toggle from /whole SettingsSheet.
  // active=true silences sheet + push + nudges; visibility (Whole, Grow, patterns) unaffected.
  // `since` is set on enable; left intact on disable so analytics can compute rest duration.
  dormant?: { active: boolean; since: string };

  // REGEN-05 (Plan 02-04): Fallow days — situational one-day rest. ISO YYYY-MM-DD entries.
  // Additive, no new table (lives in the existing huma_context JSONB column). When today's
  // local date is in this array, /today replaces the sheet with "Fallow. Compost day." and
  // /api/sheet/check rejects new checkoffs (409 FALLOW_DAY). Unmark is allowed on the same
  // calendar day only; post-midnight unmark returns 409 FALLOW_FROZEN.
  fallowDays?: string[];

  // Meta
  _sources: ContextSource[];
  _lastUpdated: string;
  _version: number;              // schema version for future migrations
}

// ─── Dimension Completeness ─────────────────────────────────────────────────
// Used to guide conversation toward sparse dimensions.

export interface DimensionCompleteness {
  dimension: DimensionKey | "time";
  fieldCount: number;            // how many fields have values
  totalFields: number;           // how many fields exist
  percentage: number;            // 0-100
  label: string;                 // human-readable: "Body", "Time & Schedule"
  sparseSummary?: string;        // "No health conditions, sleep, or nutrition info"
}

export interface ContextCompleteness {
  dimensions: DimensionCompleteness[];
  overall: number;               // 0-100
  strongDimensions: string[];    // dimensions with >50% completeness
  sparseDimensions: string[];    // dimensions with <25% completeness
}

// ─── Empty Context Factory ──────────────────────────────────────────────────

export function createEmptyContext(): HumaContext {
  return {
    body: {},
    people: {},
    money: {},
    home: {},
    growth: {},
    joy: {},
    purpose: {},
    identity: {},
    time: {},
    temporal: {},
    decisions: [],
    _sources: [],
    _lastUpdated: new Date().toISOString(),
    _version: 1,
  };
}
