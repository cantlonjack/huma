// ═══════════════════════════════════════════════════════════════
// HUMA — Canvas Data Generation Prompt
// Instructs Claude to produce structured CanvasData JSON
// from the 6 accumulated conversation syntheses.
// ═══════════════════════════════════════════════════════════════

export function buildCanvasDataPrompt(syntheses: {
  operatorName: string;
  location: string;
  ikigaiSynthesis: string;
  holisticContextSynthesis: string;
  landscapeSynthesis: string;
  enterpriseSelections: string;
  nodalInterventions: string;
  operationalDesign?: string;
}): string {
  return `You are HUMA. Generate a structured JSON object from the following conversation syntheses.

## Operator: ${syntheses.operatorName}
## Location: ${syntheses.location}

## Ikigai Synthesis
${syntheses.ikigaiSynthesis}

## Holistic Context
${syntheses.holisticContextSynthesis}

## Landscape Reading
${syntheses.landscapeSynthesis}

## Selected Enterprises
${syntheses.enterpriseSelections}

## Nodal Interventions
${syntheses.nodalInterventions}
${syntheses.operationalDesign ? `\n## Operational Design\n${syntheses.operationalDesign}` : ""}

---

Output ONLY valid JSON matching this TypeScript interface exactly. No markdown fences, no explanation, no other text. Just the JSON object.

interface CanvasData {
  essence: { name: string; land: string; phrase: string };
  qolNodes: string[];           // 3-6 Quality of Life statements as short phrases
  productionNodes: string[];    // 3-5 Forms of Production as short phrases
  resourceNodes: string[];      // 3-5 Future Resource Base commitments as short phrases
  capitalProfile: Array<{
    form: "financial" | "material" | "living" | "social" | "intellectual" | "experiential" | "spiritual" | "cultural";
    score: number;              // 1-5, the combined strength across all enterprises
    note: string;               // Brief explanation of the rating
  }>;
  fieldLayers: Array<{
    name: string;               // Layer name from Regrarians: Climate, Geography, Water, Access, Forestry, Buildings, Fencing, Soils, Economy, Energy
    category: "permanent" | "development" | "management";
    status: "strong" | "adequate" | "leverage-point" | "needs-attention" | "unexplored";
    note: string;               // Brief status note
  }>;
  enterprises: Array<{
    name: string;
    category: string;           // e.g., "Market Garden", "Value-Added", "Agritourism"
    role: "anchor" | "foundation" | "partner" | "long-game" | "multiplier";
    description: string;        // 1-2 sentence description
    financials: {
      startup: string;          // e.g., "$2,000-5,000"
      year1: string;            // e.g., "$8,000-15,000"
      year3: string;            // e.g., "$25,000-40,000"
      laborInSeason?: string;   // e.g., "15-20 hrs/wk"
      laborOffSeason?: string;  // e.g., "3-5 hrs/wk"
      timeToRevenue?: string;   // e.g., "8-12 weeks"
      margin?: string;          // e.g., "45-60%"
    };
    capitals: Array<{ form: "financial" | "material" | "living" | "social" | "intellectual" | "experiential" | "spiritual" | "cultural"; label: string }>;
    fitNarrative: string;       // Why this fits this person AND this land, 2-3 sentences
    wide?: boolean;             // true for the anchor enterprise (optional)
  }>;
  nodalInterventions: Array<{
    action: string;             // The specific action
    timing: string;             // When to do it
    why: string;                // Why this is highest leverage right now
    cascade: Array<{ emoji: string; label: string }>;  // 3-5 cascade steps
    setupFor: string;           // What this enables next
  }>;
  weeklyRhythm?: {
    days: Array<{
      day: string;              // "Monday", "Tuesday", etc.
      focus: string;            // Primary focus for the day
      blocks: Array<{ time: string; activity: string; enterprise?: string }>;
      hardStop: string;         // e.g., "4:00 PM"
    }>;
    peakSeason: string;         // Description of peak season rhythm
    restSeason: string;         // Description of rest season rhythm
  };
  validationChecks?: Array<{
    qolStatement: string;       // The QoL statement being validated
    question: string;           // The weekly check question
    target: string;             // What "on track" looks like
    failureResponse: string;    // Systemic response when below target
  }>;
  seasonalArc?: Array<{
    name: string;               // "Spring", "Summer", "Fall", "Winter"
    months: string;             // e.g., "March-May"
    primaryActivities: string[];
    qolPressure: string[];      // QoL statements under pressure this season
    qolNatural: string[];       // QoL statements naturally honored this season
    protectAtAllCosts: string;  // The one thing to protect
  }>;
  closing?: string;             // A brief grounding closing paragraph
  epigraph?: string;            // A meaningful quote from the conversation
  date?: string;                // Today's date as ISO string
}

Rules:
- Use ONLY information from the syntheses. Never invent details.
- All financial numbers should be honest ranges.
- The "phrase" in essence should be a poetic one-liner capturing their core identity.
- Enterprise roles: "anchor" = primary income, "foundation" = ecological base, "partner" = complementary, "long-game" = develops over years, "multiplier" = amplifies other enterprises.
- Include weeklyRhythm, validationChecks, and seasonalArc ONLY if operational design data is provided.
- Capital profile must include all 8 forms.
- Field layers should include all 10 Regrarians layers.
- The date should be "${new Date().toISOString().split("T")[0]}".`;
}
