// ═══════════════════════════════════════════════════════════════
// HUMA — Enterprise Data Templates
//
// Real numbers drawn from published sources: Richard Perkins
// (Regenerative Agriculture, Ridgedale Farm data), Joel Salatin
// (Polyface Farm published economics), Jean-Martin Fortier
// (The Market Gardener), Curtis Stone (The Urban Farmer),
// Mark Shepard (Restoration Agriculture), and publicly
// available USDA/extension service enterprise budgets.
//
// All figures are USD, scaled to small/beginning operator,
// North American/Northern European contexts. Ranges reflect
// regional variation. These are STARTING POINTS — the AI
// should adjust based on the operator's specific location,
// climate, market access, and existing capitals.
//
// This file is injected into the Enterprise phase prompt
// as reference material. The AI uses it as a floor of
// credibility, not a ceiling of possibility.
// ═══════════════════════════════════════════════════════════════

export interface EnterpriseTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  scaleAssumption: string;

  // Perkins-style financials
  financials: {
    startupCapital: { low: number; high: number; notes: string };
    laborHoursPerWeek: { inSeason: string; offSeason: string };
    timeToFirstRevenue: string;
    year1Revenue: { low: number; high: number };
    year3Revenue: { low: number; high: number };
    grossMargin: string;
    breakeven: string;
    seasonalRhythm: string;
  };

  // 8 Forms of Capital profile (1-5 scale)
  capitalProfile: {
    financial: { score: number; note: string };
    material: { score: number; note: string };
    living: { score: number; note: string };
    social: { score: number; note: string };
    intellectual: { score: number; note: string };
    experiential: { score: number; note: string };
    spiritual: { score: number; note: string };
    cultural: { score: number; note: string };
  };

  // Regrarians layer requirements
  landscapeRequirements: {
    climate: string;
    water: string;
    access: string;
    soils: string;
    infrastructure: string;
    minAcreage: string;
  };

  // Connections
  synergies: string[];
  prerequisites: string[];
  commonFailureModes: string[];

  // Operator fit signals — what the AI listens for in Ikigai/HC
  fitSignals: {
    loves: string[];
    skills: string[];
    worldNeeds: string[];
    lifestyleTraits: string[];
  };

  sources: string[];
}
