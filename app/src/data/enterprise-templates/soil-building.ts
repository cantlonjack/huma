import type { EnterpriseTemplate } from "./types";

export const soilBuildingTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 14. COMPOST PRODUCTION
  // ─────────────────────────────────────────────
  {
    id: "compost",
    name: "Compost Production & Sales",
    category: "Soil Building — Fertility Enterprise",
    description: "Producing high-quality compost from farm waste streams, sourced organic material, and community inputs. The enterprise that closes the loop on every other enterprise — waste becomes input, cost becomes revenue. Serves both on-farm fertility needs and a growing market for quality compost.",
    scaleAssumption: "10–100 cubic yards per year",

    financials: {
      startupCapital: {
        low: 500,
        high: 5000,
        notes: "Turning equipment (pitchfork for small scale, $50; tractor attachment for larger, $2000+), thermometer ($30), source material collection containers ($100-500), screening/sifting if selling ($200-1000). Can start with almost zero capital."
      },
      laborHoursPerWeek: {
        inSeason: "3-8 hours (building piles, turning, monitoring temperature, screening)",
        offSeason: "2-4 hours (slower process but continues year-round)"
      },
      timeToFirstRevenue: "3-6 months from first pile to finished compost",
      year1Revenue: { low: 1000, high: 8000 },
      year3Revenue: { low: 3000, high: 20000 },
      grossMargin: "60-80% if sourcing inputs for free (which is often possible). Revenue is both from compost sales AND avoided fertility purchase costs on-farm.",
      breakeven: "First batch if inputs are free (farm waste, collected leaves, food scraps)",
      seasonalRhythm: "Pile building peaks in fall (leaves, crop residues) and spring (manure cleanout). Processing year-round. Sales peak in spring for garden season."
    },

    capitalProfile: {
      financial: { score: 2, note: "Moderate direct revenue but massive indirect value through avoided input costs" },
      material: { score: 3, note: "Compost infrastructure; screening equipment; storage" },
      living: { score: 5, note: "COMPOST IS LIFE. The foundation of soil biology and the fertility cycle." },
      social: { score: 3, note: "Community composting builds relationships; food scrap collection creates touchpoints" },
      intellectual: { score: 4, note: "Soil biology, thermophilic processes, recipe formulation — deep science" },
      experiential: { score: 4, note: "Developing the nose, the eye, the feel for finished compost — embodied knowledge" },
      spiritual: { score: 4, note: "Transformation of death into life. The most literal expression of regeneration." },
      cultural: { score: 3, note: "Composting culture is foundational to regenerative community identity" }
    },

    landscapeRequirements: {
      climate: "Any. Cold climates slow the process; hot climates accelerate it. Both work.",
      water: "Compost piles need moisture — water access to composting area.",
      access: "Vehicle access for bringing inputs and moving finished compost.",
      soils: "N/A — compost area on any well-drained ground.",
      infrastructure: "Composting pad (gravel or concrete prevents mud), bins or windrow space, covered storage for finished product.",
      minAcreage: "1/10 acre for composting area sufficient for farm-scale production."
    },

    synergies: [
      "Market Garden — compost is the primary input for no-dig beds",
      "Pastured Poultry — bedding and manure become compost feedstock",
      "Pastured Pork — deep-bedding systems produce excellent compost base",
      "Mushroom Production — spent mushroom substrate is premium compost ingredient",
      "ALL enterprises — closes fertility loops across the entire farm"
    ],
    prerequisites: [
      "Source of carbon materials (leaves, wood chips, straw)",
      "Source of nitrogen materials (manure, food scraps, green waste)",
      "Basic understanding of C:N ratios and thermophilic composting",
      "Space and vehicle access for pile management"
    ],
    commonFailureModes: [
      "Anaerobic piles (too wet, not turned) — smell bad and lose nutrients",
      "Not monitoring temperature — missing the thermophilic window",
      "Contaminated inputs (herbicide-treated hay is a common disaster)",
      "Underselling — quality compost is worth $30-60/cubic yard retail",
      "Not screening for sale — lumpy unfinished compost doesn't sell"
    ],

    fitSignals: {
      loves: ["cycles", "transformation", "soil", "science", "closing loops", "efficiency"],
      skills: ["physical work", "process management", "basic biology", "systems thinking"],
      worldNeeds: ["soil restoration", "organic waste diversion", "local fertility production"],
      lifestyleTraits: ["process-oriented", "not squeamish about decomposition", "values efficiency and closed loops"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — on-farm fertility cycling",
      "The Rodale Book of Composting (various editions)",
      "USDA National Organic Program composting standards"
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // UNIVERSAL ENTERPRISES (non-agricultural)
  //
  // These follow the same interface as agricultural templates
  // but with adapted framing. For non-revenue enterprises,
  // "revenue" fields represent financial return (salary, savings,
  // cost avoidance) and "landscape" fields represent life context.
  //
  // Sources are general labor/industry data, not farm-specific.
  // ═════════════════════════════════════════════════════════════

];
