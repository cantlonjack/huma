import type {
  PatternProvenance,
  PatternEvidence,
  PatternLink,
} from "@/types/v2";

// ─── RPPL Hierarchy (6 levels) ──────────────────────────────────────────────
// Axiom → Principle → Capacity → Framework → Practice → Action
//
// Axioms are irreducible truths about reality (Hermetic/Natural Law).
// Principles are beliefs derived from axioms and experience.
// Capacities are cultivable orientations needed for frameworks to work.
// Frameworks are thinking tools for applying principles in specific domains.
// Practices are specific daily/weekly patterns grounded in frameworks.
// Actions are daily instances of practices (generated at runtime, not in seeds).

export type RpplType = "axiom" | "principle" | "capacity" | "framework" | "practice";

// ─── Port Types (typed I/O for composability) ──────────────────────────────
// What flows between RPPLs. Enables graph verification, gap detection,
// and compressed encoding.

export type PortType =
  | "dimension"     // body, people, money, home, growth, joy, purpose, identity
  | "capital"       // financial, material, living, social, intellectual, experiential, spiritual, cultural
  | "capacity"      // awareness, honesty, care, agency, humility
  | "state"         // sleep_quality, stress_level, energy, focus, mood, etc.
  | "resource"      // time, money, attention, social_support
  | "boolean";      // binary prerequisites (has_outdoor_access, has_partner, etc.)

export interface RpplPort {
  name: string;           // Human-readable: "Morning sunlight access"
  portType: PortType;     // What category of data flows here
  key: string;            // Machine key: "morning_light_access"
  required?: boolean;     // Default true for inputs, always true for outputs
  description?: string;   // What this port means in context
}

export type PrincipleSource =
  | "axiomatic" // Derived directly from an axiom (irreducible truth)
  | "derived" // From a framework (user chose this based on understanding)
  | "discovered" // From their own data (HUMA found this works for them)
  | "inherited" // From culture/upbringing (may need examination)
  | "adopted"; // From expert/community recommendation

export interface RpplSeed {
  rpplId: string; // e.g. "rppl:axiom:natural-law:v1"
  type: RpplType; // "axiom", "principle", "capacity", "framework", or "practice"
  name: string; // Human-readable name
  domain: string; // Primary domain: "meta", "body", "money", etc.
  domains?: string[]; // Additional domains this touches
  description: string; // 2-4 sentences: what this is and why it matters

  // ─── Axiom-specific (type === "axiom") ───
  // Axioms are irreducible truths about reality itself
  laws?: string[]; // Irreducible truths this axiom states
  observableIn?: string[]; // Where you can verify this axiom through direct experience

  // ─── Framework-specific (type === "framework") ───
  // Frameworks don't have triggers/steps — they have tenets and applications
  tenets?: string[]; // Core principles this framework teaches
  applications?: string[]; // How this framework applies to daily life
  tradition?: string; // Intellectual tradition

  // ─── Principle-specific (type === "principle") ───
  // Principles derive from axioms/frameworks and inform practices
  principleSource?: PrincipleSource; // Where this principle comes from
  derivedFrom?: string[]; // rpplIds of axioms/frameworks this derives from
  axiom?: string; // The principle stated as a single sentence
  challenges?: string; // What inherited belief this challenges (if any)

  // ─── Capacity-specific (type === "capacity") ───
  // Capacities are cultivable pre-cognitive orientations
  indicators?: string[]; // How HUMA detects this capacity in a user
  cultivationMethods?: string[]; // How to develop this capacity
  blockages?: string[]; // What prevents this capacity from developing
  prerequisiteFor?: string[]; // rpplIds of frameworks that require this capacity

  // ─── Practice-specific (type === "practice") ───
  // Practices are specific daily/weekly patterns grounded in principles
  trigger?: string; // The decision that starts the chain
  steps?: string[]; // The golden pathway — ordered actions
  timeWindow?: string; // When to practice
  servesPrinciples?: string[]; // rpplIds of principles this practice embodies
  servesCapacities?: string[]; // rpplIds of capacities this practice cultivates

  // ─── Ports (typed I/O for composability) ───
  inputs?: RpplPort[];    // What this RPPL requires to function
  outputs?: RpplPort[];   // What this RPPL produces when practiced

  // ─── Shared fields ───
  provenance: PatternProvenance;
  evidence: PatternEvidence;
  contextTags: string[]; // Who this is for
  contraindications?: string[]; // Who should NOT use this
  links?: PatternLink[]; // Related RPPLs (synergies, conflicts, builds-on)
}
