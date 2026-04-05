import type { EnterpriseTemplate } from "./types";

export const specialtyCropsTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 13. CUT FLOWERS
  // ─────────────────────────────────────────────
  {
    id: "cut-flowers",
    name: "Cut Flower Production",
    category: "Specialty Crops — Floriculture",
    description: "Growing flowers for bouquets, florists, weddings, and direct sales. Astonishingly profitable per square foot. Appeals to a completely different customer base than food enterprises, opening new market channels. Low barrier to entry, rapid learning curve, and deeply satisfying creative work.",
    scaleAssumption: "2,000–10,000 sq ft of production",

    financials: {
      startupCapital: {
        low: 1000,
        high: 6000,
        notes: "Seeds/bulbs/transplants ($200-1000), bed preparation ($200-500), irrigation ($200-800), season extension ($200-1500), post-harvest handling (buckets, cooler space, wrapping — $200-800). Very lean startup possible."
      },
      laborHoursPerWeek: {
        inSeason: "10-20 hours (planting, maintaining, harvesting, arranging, delivering)",
        offSeason: "2-5 hours (planning, seed ordering, perennial maintenance)"
      },
      timeToFirstRevenue: "8-12 weeks from spring planting to first bouquets",
      year1Revenue: { low: 3000, high: 20000 },
      year3Revenue: { low: 10000, high: 50000 },
      grossMargin: "60-80% for direct-to-consumer bouquets ($12-25 each). Wedding work is highest margin.",
      breakeven: "First season at lean scale",
      seasonalRhythm: "Intense May-October in northern climates. Dried flowers extend into winter. Wedding season peaks June-September. Year-round possible with tunnels and cool-season varieties."
    },

    capitalProfile: {
      financial: { score: 4, note: "Remarkably high revenue per square foot. Multiple market channels." },
      material: { score: 2, note: "Modest infrastructure. Cooler space is the main investment at scale." },
      living: { score: 4, note: "Flower production supports pollinators, beneficial insects, and soil biology" },
      social: { score: 5, note: "Flowers create joy. Bouquet subscriptions build deep community connections." },
      intellectual: { score: 3, note: "Botanical knowledge, variety selection, design skills" },
      experiential: { score: 4, note: "Deeply sensory work — color, scent, texture, seasonal rhythm" },
      spiritual: { score: 4, note: "Beauty as practice. Growing something whose purpose is pure joy." },
      cultural: { score: 5, note: "Local flowers replace imported industrial stems. Reconnects celebration with place." }
    },

    landscapeRequirements: {
      climate: "All zones with appropriate variety selection. Season extension dramatically increases viability in cold climates.",
      water: "Reliable irrigation. Flowers need consistent moisture — stress shows in quality.",
      access: "Post-harvest handling area close to production. Vehicle for market/delivery.",
      soils: "Well-drained, fertile soil preferred. No-dig methods apply well.",
      infrastructure: "Cooler space for post-harvest (even a shade structure with wet burlap helps). Design workspace for arranging.",
      minAcreage: "Can start productive on 1/8 acre. 1/4-1/2 acre for serious income."
    },

    synergies: [
      "Market Garden — share bed space, infrastructure, and market channels",
      "CSA — flower shares or bouquet add-ons",
      "Honey Bees — flowers provide excellent bee forage",
      "Value-Added — dried flower wreaths, sachets, pressed flower products",
      "On-Farm Education — flower arranging workshops"
    ],
    prerequisites: [
      "Aesthetic sense (develops quickly with practice)",
      "Market channel: farmers market, florists, wedding planners, bouquet subscriptions",
      "Succession planting schedule — continuous bloom through the season",
      "Post-harvest handling for flower longevity (cold water, cool storage)"
    ],
    commonFailureModes: [
      "Growing what's beautiful but not marketable — know your customer",
      "Not succession planting — one flush of bloom followed by nothing",
      "Underpricing — locally grown flowers are premium products",
      "Ignoring post-harvest handling — wilted flowers destroy reputation instantly",
      "Wedding work without contracts — verbal agreements fail"
    ],

    fitSignals: {
      loves: ["beauty", "design", "color", "nature", "craft", "making people happy"],
      skills: ["aesthetic sense", "attention to detail", "design", "marketing", "event coordination"],
      worldNeeds: ["local flowers", "sustainable floristry", "beauty in daily life"],
      lifestyleTraits: ["creative", "visual", "enjoys craft work", "comfortable with celebration and ceremony"]
    },

    sources: [
      "Lynn Byczynski, The Flower Farmer (2008)",
      "Erin Benzakein, Floret Farm's Cut Flower Garden (2017)",
      "Lisa Mason Ziegler, Cool Flowers (2014)",
      "Association of Specialty Cut Flower Growers — enterprise budgets"
    ]
  },

];
