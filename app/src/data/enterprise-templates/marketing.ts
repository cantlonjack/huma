import type { EnterpriseTemplate } from "./types";

export const marketingTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 5. CSA (COMMUNITY SUPPORTED AGRICULTURE)
  // ─────────────────────────────────────────────
  {
    id: "csa",
    name: "Community Supported Agriculture (CSA)",
    category: "Marketing Model — Direct Relationship",
    description: "Not an enterprise itself but a marketing and financing model that transforms other enterprises. Members pay upfront for a season's share of the harvest, providing the farm with working capital before the season starts and the operator with guaranteed income regardless of market-day weather.",
    scaleAssumption: "20–80 member households",

    financials: {
      startupCapital: {
        low: 500,
        high: 3000,
        notes: "Website/signup system ($0-500), boxes/bags for delivery ($100-500), marketing materials ($100-300), communication tools ($0-200). The CSA model's beauty is that members fund the season — their payments ARE the startup capital for production."
      },
      laborHoursPerWeek: {
        inSeason: "4-8 hours for CSA management on top of production (packing, communication, pickup coordination)",
        offSeason: "2-4 hours (member recruitment, season planning, communication)"
      },
      timeToFirstRevenue: "Revenue arrives BEFORE the season — members pay January-March for May-October delivery",
      year1Revenue: { low: 8000, high: 40000 },
      year3Revenue: { low: 20000, high: 80000 },
      grossMargin: "Higher than farmers market — no market fees, no unsold inventory, no weather-dependent sales days",
      breakeven: "Immediate — upfront payment model means you start the season funded",
      seasonalRhythm: "Recruitment in winter. Payments in late winter/early spring. Delivery weekly May-October (northern). Year-round possible in mild climates."
    },

    capitalProfile: {
      financial: { score: 5, note: "Upfront capital, guaranteed income, no market risk" },
      material: { score: 2, note: "Minimal material needs beyond production enterprises" },
      living: { score: 3, note: "Incentivizes crop diversity (members want variety) which builds soil health" },
      social: { score: 5, note: "Deep relationships — members invest in YOUR farm, not just your produce" },
      intellectual: { score: 3, note: "Communication skills, community management, logistics" },
      experiential: { score: 3, note: "Running a CSA teaches community leadership rapidly" },
      spiritual: { score: 4, note: "Direct covenant between grower and eater; shared risk = shared purpose" },
      cultural: { score: 5, note: "Rebuilds local food culture more powerfully than any other model" }
    },

    landscapeRequirements: {
      climate: "Any growing climate. Season length determines share duration.",
      water: "N/A — requirement comes from underlying production enterprises.",
      access: "Need a pickup location (on-farm, community site, or delivery route). Within 30-45 min of member base.",
      soils: "N/A — requirement comes from underlying production enterprises.",
      infrastructure: "Packing area, communication system (email/text), pickup site with some shelter.",
      minAcreage: "N/A — depends on what you're growing. A 1/4-acre intensive garden can support 20-30 shares."
    },

    synergies: [
      "Market Garden — the natural backbone of a CSA",
      "Pastured Layers — egg shares are the most popular CSA add-on",
      "Pastured Broilers — chicken shares for protein upgrade",
      "Value-Added Products — preserves, ferments as bonus items",
      "On-Farm Education — CSA member events build loyalty and social capital"
    ],
    prerequisites: [
      "At least one reliable production enterprise (usually market garden)",
      "Communication skills — members need weekly updates, recipes, farm stories",
      "Consistent production capacity — you must fill boxes every week",
      "20+ interested households identified before launch"
    ],
    commonFailureModes: [
      "Overpromising variety or quantity in first year",
      "Not communicating enough — members who feel disconnected don't renew",
      "Setting share price too low — must cover production costs PLUS the management overhead",
      "Burnout from packing day intensity without efficient systems",
      "Member attrition from inconsistent quality — better to under-promise and over-deliver"
    ],

    fitSignals: {
      loves: ["community", "teaching", "feeding people", "relationships", "storytelling"],
      skills: ["communication", "organization", "cooking", "writing", "community building"],
      worldNeeds: ["local food access", "food community", "farm viability"],
      lifestyleTraits: ["enjoys people", "comfortable with commitment", "good communicator", "wants financial security"]
    },

    sources: [
      "Elizabeth Henderson, Sharing the Harvest (2007) — CSA economics and community",
      "Jean-Martin Fortier, The Market Gardener (2014) — CSA as marketing model",
      "Local Harvest CSA database — aggregate data on share pricing"
    ]
  },

];
