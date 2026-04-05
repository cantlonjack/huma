import type { EnterpriseTemplate } from "./types";

export const agroforestryTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 6. SILVOPASTURE
  // ─────────────────────────────────────────────
  {
    id: "silvopasture",
    name: "Silvopasture",
    category: "Agroforestry — Integrated Trees + Livestock",
    description: "Intentional integration of trees, forage, and livestock on the same land. The long game of regenerative agriculture — slow to establish, compounding returns over decades, massive ecological and financial upside. Trees provide shade, fodder, timber, and fruit while livestock manage understory and fertilize.",
    scaleAssumption: "5–20 acres of existing pasture with tree establishment",

    financials: {
      startupCapital: {
        low: 3000,
        high: 15000,
        notes: "Tree stock ($2-15/tree × 100-500 trees = $500-5000), tree protection/tubes ($1-3/tree), planting labor, fencing to protect young trees ($500-3000), possible keyline ripping for water management ($500-2000). Can phase over multiple years."
      },
      laborHoursPerWeek: {
        inSeason: "2-5 hours (livestock management, tree monitoring, replanting losses)",
        offSeason: "1-3 hours (pruning, planning, fence maintenance)"
      },
      timeToFirstRevenue: "Livestock income continues from day 1 if already grazing. Tree products begin year 3-5 (fruit/nuts), timber at year 15-30.",
      year1Revenue: { low: 0, high: 5000 },
      year3Revenue: { low: 2000, high: 15000 },
      grossMargin: "Low initially; compounds dramatically. By year 10, the combined tree + livestock system produces more per acre than either alone.",
      breakeven: "3-5 years for the tree investment. Livestock covers carrying costs during establishment.",
      seasonalRhythm: "Plant trees in dormant season. Protect in spring/summer. Livestock year-round with rotational management. Pruning in winter. Harvests depend on tree species — fruit in summer/fall, nuts in fall, timber on 15-30 year rotation."
    },

    capitalProfile: {
      financial: { score: 2, note: "Slow start but exponential long-term. Multiple revenue streams at maturity." },
      material: { score: 4, note: "Trees are permanent infrastructure — increasing asset value every year" },
      living: { score: 5, note: "Carbon sequestration, biodiversity, water cycle improvement, soil building at depth" },
      social: { score: 3, note: "Visible landscape transformation attracts attention and respect" },
      intellectual: { score: 4, note: "Complex system design; deep knowledge of tree-livestock interactions" },
      experiential: { score: 4, note: "Multi-decade relationship with a maturing system; mastery over years" },
      spiritual: { score: 5, note: "Planting trees you may not fully harvest; intergenerational thinking" },
      cultural: { score: 4, note: "Restores the farmed landscape to something that looks and feels alive" }
    },

    landscapeRequirements: {
      climate: "Zones 3-9 with appropriate species selection. Tropical silvopasture is a different system.",
      water: "Keyline design often paired for water distribution. Trees need establishment irrigation in dry climates.",
      access: "Tractor/vehicle access for planting. Livestock management access.",
      soils: "Adaptable — trees actually improve soil at depth over time. Avoid waterlogged sites for most species.",
      infrastructure: "Fencing capable of protecting young trees from livestock. Temporary exclusion fencing essential in early years.",
      minAcreage: "5 acres minimum for meaningful silvopasture. 20+ for full expression."
    },

    synergies: [
      "Grass-fed Livestock — the livestock component IS the silvopasture management",
      "Pastured Poultry — hens in silvopasture benefit from shade and insect habitat",
      "Mushroom Production — log-grown mushrooms under tree canopy",
      "Honey Bees — flowering trees provide forage",
      "On-Farm Education — silvopasture is visually dramatic and intellectually compelling"
    ],
    prerequisites: [
      "Existing pastureland (or willingness to establish pasture)",
      "5+ year time horizon — this is not a quick-return enterprise",
      "Species selection matched to climate, soils, and goals (timber vs fruit vs fodder)",
      "Fencing system that can protect young trees while allowing managed grazing"
    ],
    commonFailureModes: [
      "Livestock damaging young trees before establishment — protection is non-negotiable",
      "Wrong species selection — must match climate zone and soil conditions",
      "Impatience — expecting returns before year 5",
      "Not managing canopy — unmanaged trees eventually shade out forage",
      "Planting too dense — trees need space for crown development and understory light"
    ],

    fitSignals: {
      loves: ["trees", "long-term thinking", "ecology", "landscape beauty", "legacy"],
      skills: ["patience", "planning", "livestock management", "landscape reading"],
      worldNeeds: ["carbon sequestration", "landscape restoration", "biodiversity", "resilient food systems"],
      lifestyleTraits: ["long time horizon", "values beauty", "thinks in decades", "wants to build something lasting"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale agroforestry",
      "Mark Shepard, Restoration Agriculture (2013) — New Forest Farm silvopasture model",
      "Steve Gabriel, Silvopasture (2018) — comprehensive guide to integrated systems",
      "USDA National Agroforestry Center publications"
    ]
  },

];
