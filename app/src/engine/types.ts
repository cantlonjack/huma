export type Phase =
  | "ikigai"
  | "holistic-context"
  | "landscape"
  | "enterprise-map"
  | "nodal-interventions"
  | "operational-design"
  | "complete";

export interface PhaseInfo {
  id: Phase;
  label: string;
  subtitle: string;
}

export const PHASES: PhaseInfo[] = [
  { id: "ikigai", label: "Ikigai", subtitle: "Purpose Discovery" },
  { id: "holistic-context", label: "Holistic Context", subtitle: "The Whole Situation" },
  { id: "landscape", label: "Landscape", subtitle: "Reading Your Land" },
  { id: "enterprise-map", label: "Enterprises", subtitle: "Pattern Matching" },
  { id: "nodal-interventions", label: "Nodal Interventions", subtitle: "Maximum Cascade" },
  { id: "operational-design", label: "Operational Design", subtitle: "Your Weekly Rhythm" },
];

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ConversationContext {
  operatorName: string;
  ikigai: {
    loves: string[];
    skills: string[];
    worldNeeds: string[];
    sustains: string[];
    essenceSynthesis: string;
  };
  holisticContext: {
    qualityOfLife: string;
    productionForms: string;
    futureResourceBase: string;
    synthesis: string;
  };
  landscape: {
    location: string;
    climate: string;
    geography: string;
    water: string;
    access: string;
    forestry: string;
    buildings: string;
    fencing: string;
    soils: string;
    synthesis: string;
  };
  enterprises: {
    candidates: string[];
    selected: string[];
    reasoning: string;
  };
  nodalInterventions: {
    actions: string[];
    cascadeAnalysis: string;
  };
  operationalDesign: {
    weeklyRhythm: string;
    validationProtocol: string;
    seasonalCadence: string;
    synthesis: string;
  };
  currentPhase: Phase;
  messageCount: number;
  phaseMessageCount: number;
}
