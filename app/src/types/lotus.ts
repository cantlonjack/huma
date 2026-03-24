// ─── Lotus Flow Type System ───────────────────────────────────────────────────
// Types for the 11-screen Lotus Flow onboarding that replaces ShapeBuilder.

// ─── Capital Framework ───────────────────────────────────────────────────────

export type CapitalKey =
  | "financial"
  | "material"
  | "living"
  | "social"
  | "experiential"
  | "intellectual"
  | "spiritual"
  | "cultural";

export const CAPITAL_ORDER: CapitalKey[] = [
  "financial",
  "material",
  "living",
  "social",
  "experiential",
  "intellectual",
  "spiritual",
  "cultural",
];

/** Internal capital key → user-facing label (used on sliders) */
export const CAPITAL_LABELS: Record<CapitalKey, string> = {
  financial: "Financial",
  material: "Material",
  living: "Living",
  social: "Social",
  experiential: "Experiential",
  intellectual: "Intellectual",
  spiritual: "Spiritual",
  cultural: "Cultural",
};

/** Capital key → user-facing dimension name (for display in synthesis) */
export const CAPITAL_DISPLAY_NAMES: Record<CapitalKey, string> = {
  financial: "Money",
  material: "Home",
  living: "Body",
  social: "People",
  experiential: "Joy",
  intellectual: "Growth",
  spiritual: "Purpose",
  cultural: "Identity",
};

/** Capital key → flower petal color */
export const CAPITAL_COLORS: Record<CapitalKey, string> = {
  financial: "#B5621E",  // amber-600
  material: "#6B6358",   // ink-500 (earth/brown)
  living: "#5C7A62",     // sage-500 (green, alive)
  social: "#8BAF8E",     // sage-300 (lighter green)
  experiential: "#E8935A", // amber-400 (warm, felt)
  intellectual: "#2E6B8A", // sky-600 (blue, depth)
  spiritual: "#3A5A40",  // sage-700 (deep green)
  cultural: "#A04040",   // rose-600 (identity, warm red)
};

/**
 * Maps Lotus capital keys to existing DimensionKey names for backward
 * compatibility with the shapes table.
 * financial→money, material→home, living→body, social→people,
 * intellectual→growth, experiential→joy, spiritual→purpose, cultural→identity
 */
export const CAPITAL_TO_DIMENSION: Record<CapitalKey, string> = {
  financial: "money",
  material: "home",
  living: "body",
  social: "people",
  intellectual: "growth",
  experiential: "joy",
  spiritual: "purpose",
  cultural: "identity",
};

// ─── Entity & Stage ──────────────────────────────────────────────────────────

export type EntityType = "person" | "group" | "place" | "enterprise";

export type LifeStage = "starting" | "transition" | "building" | "searching";

export type RelationshipType = "partner" | "family" | "collaborator" | "other";

export interface GovernancePerson {
  name: string;
  relationship: RelationshipType;
}

export interface Governance {
  solo: boolean;
  people: GovernancePerson[];
}

// ─── Lotus Phases ────────────────────────────────────────────────────────────

export type LotusPhase =
  | "whole"
  | "who"
  | "what"
  | "context"
  | "purpose"
  | "vision"
  | "behavior"
  | "nurture"
  | "validate"
  | "design"
  | "install"
  | "evolve";

export const LOTUS_PHASES: LotusPhase[] = [
  "whole",
  "who",
  "what",
  "context",
  "purpose",
  "vision",
  "behavior",
  "nurture",
  "validate",
  "design",
  "install",
  "evolve",
];

export const LOTUS_PHASE_LABELS: Record<LotusPhase, string> = {
  whole: "Whole",
  who: "Who",
  what: "What",
  context: "Context",
  purpose: "Purpose",
  vision: "Vision",
  behavior: "Behavior",
  nurture: "Nurture",
  validate: "Validate",
  design: "Design",
  install: "Install",
  evolve: "Evolve",
};

// ─── Compiled Pattern ────────────────────────────────────────────────────────

export interface CompiledPattern {
  id: string;
  name: string;
  description: string;
  whyYou: string;
  firstStep: string;
  timeToValue?: string;
  resourceRequirement?: string;
  sourcePatternId?: string;
  validatedBy?: number;
}

// ─── Operator Context ────────────────────────────────────────────────────────

export interface OperatorContext {
  id?: string;
  userId?: string;

  // Screen 1
  name: string;
  entityType: EntityType;

  // Screen 2
  stage: LifeStage;

  // Screen 6
  governance: Governance;

  // Screen 7 (values 1-10)
  capitals: Record<CapitalKey, number>;

  // Screen 9 (computed)
  archetype: string;
  archetypeDescription: string;
  strengths: CapitalKey[];
  growthAreas: CapitalKey[];

  // Screen 13 (optional)
  location?: string;
  climateZone?: string;

  // Post-onboarding (from AI)
  firstInsight?: string;
  firstPattern?: CompiledPattern;

  // Ikigai (Context petal)
  ikigai?: {
    love: string[];
    good: string[];
    need: string[];
    loveCards?: string[];
    goodCards?: string[];
    needCards?: string[];
    synthesis?: string;
  };

  // System
  createdAt: string;
  updatedAt: string;
  version: number;
  lotusProgress: Record<LotusPhase, boolean>;
}

// ─── Lotus Flow State Machine ────────────────────────────────────────────────

export type LotusScreen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** Maps screen numbers to their lotus phase */
export function screenToPhase(screen: LotusScreen): LotusPhase {
  if (screen <= 5) return "whole";
  if (screen === 6) return "who";
  return "what";
}

export interface LotusState {
  screen: LotusScreen;
  context: Partial<OperatorContext>;
  wholeParams: number[];
  wholePhase: 1 | 2 | 3;
  direction: 1 | -1;
  loading: boolean;
  error: string | null;
}

export type LotusAction =
  | { type: "SET_NAME"; name: string }
  | { type: "SET_ENTITY_TYPE"; entityType: EntityType }
  | { type: "SET_STAGE"; stage: LifeStage }
  | { type: "SET_GOVERNANCE"; governance: Governance }
  | { type: "SET_CAPITAL"; key: CapitalKey; value: number }
  | {
      type: "SET_SYNTHESIS";
      archetype: string;
      archetypeDescription: string;
      strengths: CapitalKey[];
      growthAreas: CapitalKey[];
    }
  | {
      type: "SET_INSIGHT";
      insight: string;
      pattern?: CompiledPattern;
    }
  | { type: "SET_LOCATION"; location: string }
  | { type: "NEXT_SCREEN" }
  | { type: "PREV_SCREEN" }
  | { type: "GO_TO_SCREEN"; screen: LotusScreen }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESTORE_STATE"; state: LotusState };
