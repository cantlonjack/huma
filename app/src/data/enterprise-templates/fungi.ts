import type { EnterpriseTemplate } from "./types";

export const fungiTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 7. MUSHROOM PRODUCTION
  // ─────────────────────────────────────────────
  {
    id: "mushrooms",
    name: "Mushroom Production",
    category: "Fungi — Log & Indoor Cultivation",
    description: "Outdoor log-grown and/or indoor bag/block cultivation of gourmet and medicinal mushrooms. Unique enterprise that fits shady areas other crops can't use, produces year-round income indoors, and builds the fungal networks that underpin soil health.",
    scaleAssumption: "200–500 logs outdoor + optional 100-200 sq ft indoor fruiting room",

    financials: {
      startupCapital: {
        low: 1000,
        high: 8000,
        notes: "Logs (free if you have woods, $2-5/log if purchased × 200-500), spawn ($200-600), drill and wax for inoculation ($100-200), indoor setup if applicable ($500-3000 for shelving, humidity, bags/blocks). Log production is very low-cost to start."
      },
      laborHoursPerWeek: {
        inSeason: "5-15 hours (harvesting, soaking/shocking logs, indoor block management, market prep)",
        offSeason: "2-5 hours (log inoculation in winter/spring, indoor production year-round)"
      },
      timeToFirstRevenue: "Log-grown shiitake: 6-12 months from inoculation. Indoor oyster mushrooms: 3-4 weeks from setup.",
      year1Revenue: { low: 2000, high: 15000 },
      year3Revenue: { low: 8000, high: 35000 },
      grossMargin: "60-75% for direct-to-consumer gourmet mushrooms ($12-20/lb fresh). Dried and medicinal products even higher.",
      breakeven: "Indoor production: 1-2 months. Log production: end of first fruiting year.",
      seasonalRhythm: "Log mushrooms fruit spring and fall with forced fruitings in summer. Indoor production year-round. Inoculation in late winter/early spring."
    },

    capitalProfile: {
      financial: { score: 3, note: "Good margins, growing demand. Revenue builds as log inventory matures." },
      material: { score: 2, note: "Modest infrastructure; logs are a self-replacing asset if you manage woodlot" },
      living: { score: 5, note: "Mushrooms ARE the fungal network. Spent substrate builds soil. Supports forest health." },
      social: { score: 3, note: "Unique product creates memorable market presence; chef relationships" },
      intellectual: { score: 4, note: "Mycology is deep and fascinating; transferable knowledge to soil health" },
      experiential: { score: 4, note: "Entirely different skill set from plant/animal agriculture; enriching" },
      spiritual: { score: 4, note: "Working with fungi connects to hidden underground networks; humbling" },
      cultural: { score: 3, note: "Mushroom culture is ancient and cross-cultural; growing interest in medicinal use" }
    },

    landscapeRequirements: {
      climate: "Zones 3-9 for outdoor logs. Indoor production any climate.",
      water: "Logs need soaking for forced fruiting. Indoor needs humidification. Moderate water use overall.",
      access: "Log yard needs vehicle access for log handling. Indoor facility needs year-round access.",
      soils: "N/A for production. Spent substrate is excellent soil amendment.",
      infrastructure: "Shade structure or forest canopy for log yard. Indoor: any space with humidity control and fresh air exchange.",
      minAcreage: "Log yard: 1/10 acre in shady area. Indoor: 100 sq ft. Uses land that's unsuitable for other enterprises."
    },

    synergies: [
      "Silvopasture — log-grown mushrooms under developing tree canopy",
      "Market Garden — spent mushroom substrate as compost; same market channels",
      "CSA — mushroom shares as premium add-on",
      "Value-Added — dried mushrooms, tinctures, powders command high prices",
      "On-Farm Education — mushroom workshops are extremely popular"
    ],
    prerequisites: [
      "Source of hardwood logs (own woodlot or relationship with arborist/logger)",
      "Basic mycology knowledge (inoculation technique, contamination management)",
      "Market for gourmet mushrooms (restaurants, farmers markets, health food stores)"
    ],
    commonFailureModes: [
      "Contamination in indoor production from poor sterile technique",
      "Log yard in wrong location — needs 80% shade and good drainage",
      "Using softwood logs (they don't work for most gourmet species)",
      "Not force-fruiting logs in summer — missing peak demand season",
      "Overcomplicating indoor setup before mastering basics"
    ],

    fitSignals: {
      loves: ["nature", "science", "forests", "the hidden world", "cooking", "foraging"],
      skills: ["attention to detail", "patience", "scientific thinking", "working in shade/cool"],
      worldNeeds: ["local gourmet food", "medicinal mushrooms", "forest product alternatives"],
      lifestyleTraits: ["curious", "comfortable with biology", "likes working in woods", "appreciates subtlety"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — forest enterprises",
      "Tradd Cotter, Organic Mushroom Farming and Mycoremediation (2014)",
      "Paul Stamets, Mycelium Running (2005)",
      "Cornell Small Farms Program — mushroom enterprise budgets"
    ]
  },

];
