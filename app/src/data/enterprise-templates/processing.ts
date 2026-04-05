import type { EnterpriseTemplate } from "./types";

export const processingTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 10. VALUE-ADDED PRODUCTS
  // ─────────────────────────────────────────────
  {
    id: "value-added",
    name: "Value-Added Products",
    category: "Processing — Preserves, Ferments, Prepared Foods",
    description: "Transforming raw farm products into shelf-stable or premium goods: fermented vegetables, jams/preserves, hot sauce, dried herbs, bone broth, baked goods, herbal teas, salve/soap. Captures more value per unit of production, uses surplus and seconds, and creates year-round income from seasonal harvests.",
    scaleAssumption: "Cottage-scale to licensed kitchen, 5-20 product SKUs",

    financials: {
      startupCapital: {
        low: 500,
        high: 8000,
        notes: "Kitchen equipment ($200-2000 depending on existing setup), packaging/labels ($200-1000), licensing/permits ($50-500 depending on state cottage food laws), ingredients for first batches ($100-500). Many states allow cottage food production from home kitchens under certain revenue thresholds."
      },
      laborHoursPerWeek: {
        inSeason: "8-20 hours (processing, packaging, labeling, market prep)",
        offSeason: "3-8 hours (continued production of shelf-stable items, marketing, recipe development)"
      },
      timeToFirstRevenue: "2-4 weeks from first batch to first sale",
      year1Revenue: { low: 2000, high: 15000 },
      year3Revenue: { low: 8000, high: 40000 },
      grossMargin: "50-75% depending on product. Fermented vegetables and herbal products tend highest.",
      breakeven: "First month at cottage scale",
      seasonalRhythm: "Peak processing during harvest glut (summer/fall). Sales year-round for shelf-stable. Holiday season is major revenue opportunity for gift items."
    },

    capitalProfile: {
      financial: { score: 3, note: "Higher margin per unit than raw produce. Year-round revenue from seasonal production." },
      material: { score: 2, note: "Kitchen infrastructure; packaging systems" },
      living: { score: 2, note: "Indirect — incentivizes growing more diversity for processing" },
      social: { score: 4, note: "Products carry your story. Every jar is a brand ambassador." },
      intellectual: { score: 4, note: "Food science, recipe development, preservation knowledge" },
      experiential: { score: 4, note: "Craft skills deepen over years; fermentation especially rewards experience" },
      spiritual: { score: 3, note: "Alchemy of transformation — raw to preserved; seasonal to permanent" },
      cultural: { score: 5, note: "Preserving food IS preserving culture. Fermentation traditions are ancient and cross-cultural." }
    },

    landscapeRequirements: {
      climate: "Any — processing is indoor work. Climate determines what raw materials are available.",
      water: "Processing uses water for cleaning and some recipes. Standard kitchen water supply sufficient.",
      access: "N/A beyond market access.",
      soils: "N/A — raw materials come from other enterprises or are purchased.",
      infrastructure: "Kitchen space (home kitchen for cottage food; licensed commercial kitchen for scale). Storage for inventory.",
      minAcreage: "None. Can process purchased ingredients. Ideally connected to own production."
    },

    synergies: [
      "Market Garden — surplus and seconds become raw material instead of waste",
      "CSA — value-added items as bonus/premium shares",
      "Honey Bees — honey is itself value-added; beeswax for candles/balm",
      "Mushroom Production — dried mushrooms, tinctures, powders",
      "On-Farm Education — preservation workshops"
    ],
    prerequisites: [
      "Know your state's cottage food laws (revenue limits, allowed products, labeling requirements)",
      "Basic food safety and preservation knowledge",
      "Product development: test recipes extensively before selling",
      "Packaging and labeling that meets legal requirements and looks professional"
    ],
    commonFailureModes: [
      "Too many SKUs too fast — start with 3-5 products, perfect them, then expand",
      "Ignoring labeling regulations — can result in fines or shutdown",
      "Underpricing — handmade small-batch products command premium prices",
      "Scaling beyond cottage food limits without proper licensing",
      "Inconsistent quality — recipe standardization is essential for repeat customers"
    ],

    fitSignals: {
      loves: ["cooking", "creating", "craft", "feeding people", "tradition", "fermentation"],
      skills: ["cooking", "recipe development", "attention to detail", "branding/design", "food safety"],
      worldNeeds: ["local preserved foods", "fermented foods", "alternatives to industrial processed food"],
      lifestyleTraits: ["enjoys kitchen work", "creative", "detail-oriented", "comfortable with repetitive craft work"]
    },

    sources: [
      "State-specific cottage food law databases",
      "Sandor Katz, The Art of Fermentation (2012)",
      "USDA National Center for Home Food Preservation guidelines"
    ]
  },

];
