import type { EnterpriseTemplate } from "./types";

export const vegetablesTemplates: EnterpriseTemplate[] = [
  // ─────────────────────────────────────────────
  // 3. NO-DIG MARKET GARDEN
  // ─────────────────────────────────────────────
  {
    id: "market-garden",
    name: "No-Dig Market Garden",
    category: "Vegetables — Intensive Annual Production",
    description: "High-intensity vegetable production on permanent beds using compost mulch, no tillage, and tight crop planning. The highest revenue per square foot of any land-based enterprise. Builds soil biology instead of destroying it.",
    scaleAssumption: "1,500–5,000 sq ft of bed space (not total area)",

    financials: {
      startupCapital: {
        low: 2000,
        high: 12000,
        notes: "Compost for bed establishment ($500-2000), seeds/transplants ($200-800), basic tools ($300-600), irrigation ($300-1500), season extension (low tunnels $200-500, caterpillar tunnels $500-3000). Can start very lean with DIY approach."
      },
      laborHoursPerWeek: {
        inSeason: "15-30 hours for 3,000 sq ft (planting, harvesting, weeding, succession sowing, market prep)",
        offSeason: "3-5 hours (bed preparation, seed ordering, crop planning, compost sourcing)"
      },
      timeToFirstRevenue: "6-8 weeks from first planting (salad greens, radishes)",
      year1Revenue: { low: 5000, high: 25000 },
      year3Revenue: { low: 15000, high: 60000 },
      grossMargin: "50-70% at farmers market/direct pricing. Crops like microgreens and salad mix hit 70%+.",
      breakeven: "First season for lean operations. Second season with infrastructure investment.",
      seasonalRhythm: "Intense March-November in northern climates. Year-round possible with tunnels. Peak harvest and revenue June-October. Winter for planning, soil building, rest."
    },

    capitalProfile: {
      financial: { score: 4, note: "Highest revenue per square foot; fast crop turns compound returns" },
      material: { score: 3, note: "Builds beds, irrigation, and season extension infrastructure" },
      living: { score: 5, note: "No-dig builds soil biology every season. Biodiversity increases with diversity of crops." },
      social: { score: 4, note: "Farmers market presence builds deep community relationships" },
      intellectual: { score: 5, note: "Crop planning, succession sowing, soil science — steep and rewarding learning curve" },
      experiential: { score: 5, note: "Daily immersion in growing; skills compound rapidly" },
      spiritual: { score: 4, note: "Hands in soil; feeding people directly; seasonal rhythm" },
      cultural: { score: 4, note: "Fresh local food culture; variety revival; culinary connection" }
    },

    landscapeRequirements: {
      climate: "All zones with appropriate crop selection. Season extension critical in zones 3-5.",
      water: "Reliable irrigation — drip preferred. 1 inch per week during growing season minimum.",
      access: "Close to processing/washing area. Vehicle access for compost delivery.",
      soils: "Adaptable — no-dig builds soil from almost any starting point. Good drainage essential.",
      infrastructure: "Wash/pack station (can start simple). Cold storage extends shelf life and market flexibility.",
      minAcreage: "Can start productive on 1/8 acre of actual bed space. 1/4-1/2 acre for serious income."
    },

    synergies: [
      "Pastured Poultry — chicken compost feeds garden beds",
      "CSA — garden produce is the backbone of CSA boxes",
      "Mushroom Production — spent mushroom substrate becomes garden compost",
      "Value-Added Products — surplus becomes ferments, preserves, dried herbs",
      "On-Farm Education — market gardens are visually compelling teaching spaces"
    ],
    prerequisites: [
      "Reliable compost source (or plan to make it)",
      "Basic crop planning skills (or willingness to learn quickly)",
      "Market channel identified: farmers market, CSA, restaurant, or farm stand",
      "Water infrastructure to garden site"
    ],
    commonFailureModes: [
      "Growing too many varieties year 1 — start with 10-15 reliable crops",
      "Not succession sowing — one planting means feast-then-famine instead of steady supply",
      "Underpricing at farmers market — premium quality commands premium price",
      "Trying to be a CSA before mastering production consistency",
      "Burnout from harvest-day intensity without efficient systems"
    ],

    fitSignals: {
      loves: ["growing things", "detail work", "cooking", "variety", "feeding people", "physical work"],
      skills: ["planning", "attention to detail", "cooking", "craft", "systems thinking"],
      worldNeeds: ["local fresh vegetables", "food desert alternatives", "chemical-free produce"],
      lifestyleTraits: ["enjoys intensive focused work", "comfortable with early mornings", "likes tangible daily progress"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale no-dig enterprise",
      "Charles Dowding, No Dig (2022) — no-dig methodology and economics",
      "Jean-Martin Fortier, The Market Gardener (2014) — biointensive economics",
      "Curtis Stone, The Urban Farmer (2015) — small-scale intensive economics"
    ]
  },


  // ─────────────────────────────────────────────
  // 4. MICROGREENS
  // ─────────────────────────────────────────────
  {
    id: "microgreens",
    name: "Microgreens Production",
    category: "Vegetables — Controlled Environment",
    description: "Indoor production of nutrient-dense microgreens on trays. Fastest crop turn in agriculture (7-14 days seed to harvest). Minimal land required. Year-round income. Exceptional entry point for operators with limited land or harsh climates.",
    scaleAssumption: "50–200 trays per week",

    financials: {
      startupCapital: {
        low: 500,
        high: 5000,
        notes: "Shelving/racks ($100-500), trays ($100-300 for 50-100), growing medium ($50-200), seeds ($100-500), basic lighting if no natural light ($200-1000), packaging ($50-200). Can bootstrap from kitchen/garage."
      },
      laborHoursPerWeek: {
        inSeason: "10-20 hours for 100 trays/week (seeding, watering, harvesting, packing, delivery)",
        offSeason: "Same — year-round enterprise"
      },
      timeToFirstRevenue: "2-3 weeks from setup to first sale",
      year1Revenue: { low: 5000, high: 30000 },
      year3Revenue: { low: 15000, high: 60000 },
      grossMargin: "60-80%. Seeds are cheap, medium is cheap, labor is the main cost.",
      breakeven: "Within first month at small scale",
      seasonalRhythm: "Year-round. No seasonality. This is the enterprise that generates income while seasonal enterprises are dormant."
    },

    capitalProfile: {
      financial: { score: 4, note: "Fastest cash flow in agriculture; high margin; scales linearly" },
      material: { score: 2, note: "Minimal physical infrastructure; trays and racks" },
      living: { score: 2, note: "Indoor enterprise — limited ecological impact. Spent medium can go to compost." },
      social: { score: 3, note: "Restaurant relationships; farmers market presence; health-conscious community" },
      intellectual: { score: 3, note: "Repeatable system; transferable to anyone with indoor space" },
      experiential: { score: 3, note: "Fast learning cycles; mastery within 2-3 months" },
      spiritual: { score: 2, note: "Less land-connected than outdoor enterprises; more transactional" },
      cultural: { score: 2, note: "Trendy but shallow cultural depth compared to garden or livestock" }
    },

    landscapeRequirements: {
      climate: "Any — indoor enterprise. Heating costs in cold climates are the main variable.",
      water: "Minimal. 50 trays/week uses ~30-50 gallons.",
      access: "Delivery vehicle for restaurant/market sales.",
      soils: "N/A — soilless growing medium (coconut coir, hemp mats, or soil mix in trays).",
      infrastructure: "Any indoor space with temperature control (50-75°F), some airflow, and either natural light or grow lights. 100 sq ft is enough to start.",
      minAcreage: "None. Can operate from a spare bedroom, garage, or basement."
    },

    synergies: [
      "Market Garden — same market channels; winter income when garden is dormant",
      "Restaurant Sales — chefs want both microgreens and market garden produce",
      "CSA — microgreens as premium add-on",
      "On-Farm Education — fast, visible, great for workshops",
      "Value-Added — dried microgreen powder for smoothie market"
    ],
    prerequisites: [
      "Indoor space with climate control",
      "Market channel: restaurants, farmers markets, or health food stores",
      "Consistent weekly schedule — microgreens don't wait"
    ],
    commonFailureModes: [
      "Mold from poor airflow — ventilation is critical",
      "Overcommitting to variety — start with 3-4 reliable crops (sunflower, pea, radish, broccoli)",
      "Restaurant accounts with net-30 payment terms creating cash flow gap",
      "Scaling beyond space capacity before having dedicated grow room"
    ],

    fitSignals: {
      loves: ["precision", "indoor work", "nutrition", "fast results", "systems"],
      skills: ["consistency", "attention to detail", "restaurant relationships", "delivery logistics"],
      worldNeeds: ["year-round local greens", "nutrient density", "restaurant supply"],
      lifestyleTraits: ["wants year-round income", "limited outdoor space", "values efficiency"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale microgreens enterprise",
      "Chris Thoreau, Microgreen Garden (various publications) — microgreens economics"
    ]
  },

];
