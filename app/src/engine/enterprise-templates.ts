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

export const ENTERPRISE_TEMPLATES: EnterpriseTemplate[] = [

  // ─────────────────────────────────────────────
  // 1. PASTURED BROILERS
  // ─────────────────────────────────────────────
  {
    id: "pastured-broilers",
    name: "Pastured Broilers",
    category: "Livestock — Poultry",
    description: "Raising meat chickens on pasture in mobile shelters, moved daily to fresh ground. The workhorse enterprise of small-scale regenerative farming — fast cash flow, moderate skill requirement, exceptional soil building.",
    scaleAssumption: "400–800 birds per batch, 3–5 batches per season",

    financials: {
      startupCapital: {
        low: 2500,
        high: 7000,
        notes: "Mobile shelters ($300-800 each, 2-4 needed), brooder setup ($200-500), waterers/feeders ($200-400), processing equipment or mobile processor access ($500-2000), initial feed and chick purchase ($800-1500). Can start lower with DIY shelters."
      },
      laborHoursPerWeek: {
        inSeason: "8-15 hours (daily moves, feeding, watering, processing days are 12+ hours)",
        offSeason: "1-2 hours (equipment maintenance, planning, marketing)"
      },
      timeToFirstRevenue: "10-12 weeks from chick delivery to processed bird",
      year1Revenue: { low: 8000, high: 20000 },
      year3Revenue: { low: 18000, high: 45000 },
      grossMargin: "35-50% at direct-to-consumer pricing ($5-7/lb whole bird)",
      breakeven: "First batch if pre-sold; otherwise end of first season",
      seasonalRhythm: "Active April-October in northern climates. Batches staggered every 3-4 weeks. Winter for planning, marketing, infrastructure."
    },

    capitalProfile: {
      financial: { score: 4, note: "Fast cash flow, reliable demand, scalable in increments" },
      material: { score: 3, note: "Builds mobile infrastructure, processing capacity" },
      living: { score: 5, note: "Exceptional soil building — each batch fertilizes fresh pasture" },
      social: { score: 4, note: "Customers become community; farm pickup days build relationships" },
      intellectual: { score: 3, note: "Transferable skills in animal husbandry, direct marketing" },
      experiential: { score: 4, note: "Rapid learning cycles — each batch teaches" },
      spiritual: { score: 3, note: "Daily rhythm of care; visible land improvement" },
      cultural: { score: 3, note: "Revives local food culture; customers reconnect with food sourcing" }
    },

    landscapeRequirements: {
      climate: "Works in zones 3-9. Need 12+ weeks above freezing. Heat stress above 95°F is the main climate risk.",
      water: "Reliable water source accessible across pasture. Each batch needs 50-100 gallons/day at peak.",
      access: "Vehicle access to pasture for feed delivery. Within 1-2 hours of customer base for direct sales.",
      soils: "Any pasture with reasonable drainage. Actually improves poor soils rapidly — this is a soil-building enterprise.",
      infrastructure: "Brooder space (can be garage/barn corner). Secure from predators. Processing area or mobile processor access.",
      minAcreage: "0.5 acres of pasture minimum for 1 batch. 2-5 acres for full-scale rotation."
    },

    synergies: [
      "Pastured Layers — share infrastructure, brooder, processing knowledge",
      "Market Garden — broiler pasture pre-fertilizes future garden beds",
      "CSA — add chicken shares to vegetable subscriptions",
      "On-Farm Education — processing days become learning events",
      "Compost Production — offal and bedding become high-quality compost"
    ],
    prerequisites: [
      "Predator management plan (electric fence, guardian animals, or secure shelters)",
      "Processing solution (on-farm license, mobile processor, or exempt under state small-flock rules)",
      "Pre-sold or identified customer base before first batch"
    ],
    commonFailureModes: [
      "Starting too large — begin with 50-100 birds, not 500",
      "Not pre-selling — processing birds without buyers is devastating",
      "Predator losses from inadequate protection",
      "Heat stress mortality in summer batches",
      "Underpricing — must charge $5-7/lb to be viable, not commodity pricing"
    ],

    fitSignals: {
      loves: ["animals", "outdoor work", "daily rhythm", "physical labor", "feeding people"],
      skills: ["animal handling", "building things", "marketing", "early morning routine"],
      worldNeeds: ["local protein", "pastured meat access", "food transparency"],
      lifestyleTraits: ["comfortable with daily commitment", "can handle processing emotionally", "wants fast results"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale broiler enterprise data",
      "Joel Salatin, Pastured Poultry Profits (1993, updated) — Polyface model economics",
      "USDA Small-Scale Poultry Processing guidelines"
    ]
  },

  // ─────────────────────────────────────────────
  // 2. PASTURED LAYING HENS
  // ─────────────────────────────────────────────
  {
    id: "pastured-layers",
    name: "Pastured Laying Hens",
    category: "Livestock — Poultry",
    description: "Egg production from hens on pasture using mobile housing (egg-mobile) following behind other livestock or rotating across paddocks. Steady income, lower labor than broilers, exceptional fit for beginning operators.",
    scaleAssumption: "100–400 hens in mobile housing",

    financials: {
      startupCapital: {
        low: 3000,
        high: 10000,
        notes: "Egg-mobile or mobile coop ($1000-4000 DIY, $3000-6000 purchased), laying hens at point-of-lay ($8-15/bird × 100-400), feeders/waterers ($200-500), electric netting ($300-800), egg handling supplies ($100-300)."
      },
      laborHoursPerWeek: {
        inSeason: "5-10 hours (daily collect, move weekly, feed/water, egg washing/packing)",
        offSeason: "3-6 hours (reduced laying, coop maintenance, flock health)"
      },
      timeToFirstRevenue: "Immediate if purchasing point-of-lay hens; 20-24 weeks if starting from chicks",
      year1Revenue: { low: 6000, high: 24000 },
      year3Revenue: { low: 10000, high: 35000 },
      grossMargin: "40-55% at $5-8/dozen direct-to-consumer",
      breakeven: "4-8 months with point-of-lay hens and pre-established market",
      seasonalRhythm: "Year-round production with natural dip in winter (shorter days). Peak production spring-summer. Supplemental lighting optional but extends production."
    },

    capitalProfile: {
      financial: { score: 3, note: "Steady weekly income but lower per-unit margin than broilers" },
      material: { score: 3, note: "Egg-mobile is a durable asset; egg handling infrastructure" },
      living: { score: 4, note: "Hens scratch, fertilize, and eat pest larvae — mobile soil builders" },
      social: { score: 5, note: "Eggs are the ultimate relationship product — weekly touchpoint with customers" },
      intellectual: { score: 2, note: "Lower learning curve than most livestock enterprises" },
      experiential: { score: 3, note: "Steady skill building in flock management, pasture reading" },
      spiritual: { score: 4, note: "Daily gathering ritual; deep satisfaction in self-provisioning" },
      cultural: { score: 4, note: "Eggs are universal — everyone cooks with them, everyone has an opinion about them" }
    },

    landscapeRequirements: {
      climate: "Works in zones 2-10. Cold-hardy breeds handle deep winter. Heat is manageable with shade and ventilation.",
      water: "Water access at each paddock position. 100 hens drink ~8 gallons/day.",
      access: "Must be able to move egg-mobile — vehicle or tractor access to pasture.",
      soils: "Any pasture. Following cattle rotation is ideal (hens break up dung pats, eat fly larvae).",
      infrastructure: "Egg washing/packing area (can be kitchen-scale initially). Refrigeration for storage.",
      minAcreage: "0.25 acres for small flock. 2-5 acres for rotational system with 200-400 hens."
    },

    synergies: [
      "Pastured Broilers — shared knowledge, equipment, customer base",
      "Grass-fed Cattle/Sheep — hens follow grazers in leader-follower system (Salatin model)",
      "Market Garden — hens pre-condition future garden areas",
      "CSA — egg shares are the most popular add-on",
      "On-Farm Education — families love visiting laying hens"
    ],
    prerequisites: [
      "Predator-proof mobile housing or electric netting system",
      "Egg handling compliance (varies by state — check cottage food and egg laws)",
      "Customer base: 100 hens produce ~70 dozen/week at peak"
    ],
    commonFailureModes: [
      "Predator losses — especially from aerial predators (hawks) on open pasture",
      "Underestimating feed costs — layers eat year-round, not just seasonally",
      "Not replacing hens on schedule — production drops sharply after year 2",
      "Egg pricing too low — must be $5-8/dozen to sustain, not $3"
    ],

    fitSignals: {
      loves: ["animals", "daily rhythm", "nurturing", "community connection"],
      skills: ["basic animal care", "consistency", "relationship building"],
      worldNeeds: ["local eggs", "pasture-raised alternatives to factory eggs"],
      lifestyleTraits: ["wants daily routine", "comfortable with year-round commitment", "values steady over dramatic"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale layer enterprise",
      "Joel Salatin, The Sheer Ecstasy of Being a Lunatic Farmer — Polyface egg-mobile model",
      "Harvey Ussery, The Small-Scale Poultry Flock (2011)"
    ]
  },

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

  // ─────────────────────────────────────────────
  // 8. HONEY BEES
  // ─────────────────────────────────────────────
  {
    id: "honey-bees",
    name: "Honey Bees & Apiary Products",
    category: "Livestock — Pollinators",
    description: "Beekeeping for honey, beeswax, and pollination services. Low land footprint, supports all other enterprises through pollination, and produces high-value products. Deep skill development over years.",
    scaleAssumption: "5–20 hives",

    financials: {
      startupCapital: {
        low: 1500,
        high: 6000,
        notes: "Hive equipment ($200-400/hive × 5-10), nucleus colonies or packages ($150-250/colony × 5-10), protective gear ($100-300), extraction equipment ($200-800, or share/rent), jars/packaging ($100-300)."
      },
      laborHoursPerWeek: {
        inSeason: "3-8 hours for 10 hives (inspections, swarm management, harvest)",
        offSeason: "1-2 hours (equipment repair, planning, treatment if needed)"
      },
      timeToFirstRevenue: "First honey harvest: 6-12 months (don't harvest first year from new colonies)",
      year1Revenue: { low: 0, high: 2000 },
      year3Revenue: { low: 3000, high: 15000 },
      grossMargin: "60-80% for direct-sale honey ($10-18/lb). Beeswax products even higher margin.",
      breakeven: "Year 2-3. First year is investment in colony establishment.",
      seasonalRhythm: "Spring buildup and swarm management. Summer: main honey flow. Fall: winter preparation. Winter: equipment maintenance, candle/product making."
    },

    capitalProfile: {
      financial: { score: 2, note: "Moderate income but very high margin. Value-added products (candles, lip balm) increase significantly." },
      material: { score: 2, note: "Hives and equipment are modest; extraction setup is the main investment" },
      living: { score: 5, note: "Pollination supports all plant life on the farm and beyond. Ecological keystone." },
      social: { score: 3, note: "Honey is a gift economy product — everyone loves receiving it" },
      intellectual: { score: 4, note: "Beekeeping is endlessly deep; connects to botany, ecology, biology" },
      experiential: { score: 5, note: "Profound sensory experience; years to develop intuition" },
      spiritual: { score: 5, note: "Ancient practice; superorganism relationship; humility and awe" },
      cultural: { score: 4, note: "One of humanity's oldest agricultural practices; ceremonial significance across cultures" }
    },

    landscapeRequirements: {
      climate: "Zones 3-10 with appropriate bee genetics and management. Cold climates need winter-hardy stock.",
      water: "Bees need water source within 1/4 mile. A pond, creek, or dripping faucet suffices.",
      access: "Vehicle access to hives for equipment and honey supers.",
      soils: "N/A. Hives can go on any stable ground.",
      infrastructure: "Extraction space (can be kitchen for small scale). Storage for supers and equipment.",
      minAcreage: "Bees forage 2-3 miles from the hive — they use the whole landscape. Hives themselves need a few square feet each."
    },

    synergies: [
      "Market Garden — pollination dramatically increases yields",
      "Silvopasture — flowering trees provide major nectar/pollen sources",
      "CSA — honey shares as premium add-on",
      "Value-Added Products — beeswax candles, lip balm, propolis tinctures",
      "On-Farm Education — bee observation hives are captivating"
    ],
    prerequisites: [
      "Willingness to work with stinging insects (not trivial)",
      "Mentorship from experienced beekeeper strongly recommended",
      "Understanding of local nectar flows and seasonal timing",
      "Check local regulations on hive placement and registration"
    ],
    commonFailureModes: [
      "Colony losses from varroa mites — management is non-negotiable",
      "Harvesting too much honey first year, weakening colonies for winter",
      "Placing hives poorly (need morning sun, wind protection, good drainage)",
      "Not connecting to local beekeeping community for mentorship",
      "Expecting profit in year 1 — this is a year 2-3 revenue enterprise"
    ],

    fitSignals: {
      loves: ["nature", "observation", "stillness", "ecology", "craft", "ancient practices"],
      skills: ["patience", "observation", "calm under pressure", "attention to seasonal rhythm"],
      worldNeeds: ["pollinator support", "local honey", "bee conservation"],
      lifestyleTraits: ["meditative temperament", "comfortable with discomfort", "long-term thinker", "values ancient knowledge"]
    },

    sources: [
      "Extensive beekeeping literature; USDA Honey Bee Research",
      "Michael Bush, The Practical Beekeeper (2011)",
      "Local extension service apiary programs"
    ]
  },

  // ─────────────────────────────────────────────
  // 9. ON-FARM EDUCATION
  // ─────────────────────────────────────────────
  {
    id: "education",
    name: "On-Farm Education & Workshops",
    category: "Knowledge Economy — Teaching",
    description: "Teaching what you know and what your land demonstrates. Workshops, farm tours, apprenticeships, and online content. Converts Experiential and Intellectual capital directly into Financial and Social capital. Often becomes the highest-margin enterprise on a regenerative farm.",
    scaleAssumption: "4–12 workshops per year + optional online content",

    financials: {
      startupCapital: {
        low: 200,
        high: 3000,
        notes: "Event setup (outdoor classroom seating $100-500), marketing ($0-500 with social media), insurance rider ($200-500), teaching materials ($100-300), website/booking system ($0-500). The capital is already invested — it's your farm and your knowledge."
      },
      laborHoursPerWeek: {
        inSeason: "5-15 hours during workshop weeks (preparation, teaching, follow-up). Near zero between events.",
        offSeason: "2-5 hours (marketing, planning, content creation)"
      },
      timeToFirstRevenue: "As soon as you announce your first workshop. Can be within weeks of deciding to teach.",
      year1Revenue: { low: 2000, high: 20000 },
      year3Revenue: { low: 10000, high: 60000 },
      grossMargin: "70-90%. Your knowledge is already developed. Marginal cost per participant is near zero.",
      breakeven: "First workshop. No inventory, no inputs, no perishable product.",
      seasonalRhythm: "Spring and fall are peak workshop seasons. Summer for farm tours and family events. Winter for online content and planning."
    },

    capitalProfile: {
      financial: { score: 4, note: "Highest margin enterprise on most farms. Scales through online without land constraints." },
      material: { score: 1, note: "Minimal material needs — your farm IS the classroom" },
      living: { score: 2, note: "Indirect — students who learn regenerative practices go improve their own land" },
      social: { score: 5, note: "Every student becomes an ambassador. Network effects compound." },
      intellectual: { score: 5, note: "Teaching deepens your own understanding. Forces articulation of tacit knowledge." },
      experiential: { score: 4, note: "Develops facilitation and communication skills rapidly" },
      spiritual: { score: 4, note: "Transmission of knowledge; mentorship; contributing to something larger" },
      cultural: { score: 5, note: "Building the next generation of regenerative practitioners — direct cultural impact" }
    },

    landscapeRequirements: {
      climate: "Any — teach what your climate teaches you. Challenges become curriculum.",
      water: "N/A beyond existing farm needs.",
      access: "Parking for visitors. Accessible teaching areas. Bathroom access.",
      soils: "N/A — your farm's soil story IS the teaching content.",
      infrastructure: "Covered outdoor space for rain days. Indoor backup optional. Seating for 10-25 people.",
      minAcreage: "Any — even a 1/4-acre urban garden can host workshops."
    },

    synergies: [
      "ALL other enterprises — every enterprise becomes a teaching topic",
      "CSA — member workshops build loyalty and reduce churn",
      "Pastured Poultry — processing workshops are popular and practical",
      "Market Garden — hands-on growing workshops",
      "Mushroom Production — mushroom cultivation workshops are consistently oversubscribed"
    ],
    prerequisites: [
      "At least 1-2 years of hands-on experience to teach credibly",
      "Comfort speaking to groups (develops quickly with practice)",
      "Liability insurance (usually a rider on farm policy)",
      "Something worth showing — your farm needs to demonstrate what you teach"
    ],
    commonFailureModes: [
      "Teaching before you have enough experience — credibility is everything with this audience",
      "Undercharging — $75-200/person for a full-day workshop is standard, not excessive",
      "Not building an email list — your future students come from past attendees' recommendations",
      "Overcomplicating curriculum — teach what you actually do, not what you've read about",
      "Neglecting farm operations during teaching season — the farm IS the product"
    ],

    fitSignals: {
      loves: ["teaching", "sharing", "people", "explaining", "mentoring", "public speaking"],
      skills: ["communication", "facilitation", "storytelling", "writing", "organization"],
      worldNeeds: ["regenerative education", "practical farming knowledge", "hands-on learning"],
      lifestyleTraits: ["extroverted or comfortable performing", "articulate", "enjoys hosting", "values knowledge transmission"]
    },

    sources: [
      "Richard Perkins — Ridgedale education enterprise model (highest revenue/hour on the farm)",
      "Joel Salatin — Polyface apprenticeship and workshop model",
      "Jean-Martin Fortier — workshop model at Les Jardins de la Grelinette"
    ]
  },

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

  // ─────────────────────────────────────────────
  // 11. PASTURED PORK
  // ─────────────────────────────────────────────
  {
    id: "pastured-pork",
    name: "Pastured Pork",
    category: "Livestock — Swine",
    description: "Raising pigs on pasture and/or in woodland. Pigs are the ultimate landscape transformers — they root, clear brush, incorporate organic matter, and prepare ground for planting. High value per animal, strong direct-sale demand, and remarkable fit for wooded or rough land that other enterprises can't use.",
    scaleAssumption: "5–20 feeder pigs per year (seasonal batch)",

    financials: {
      startupCapital: {
        low: 2000,
        high: 8000,
        notes: "Fencing — electric netting or permanent ($500-2000), shelter — simple hoop or A-frame ($200-800), waterers ($100-300), feeder pigs ($75-150 each × 5-20), initial feed ($500-1500), processing reservation ($0 upfront, $250-350/pig at processing)."
      },
      laborHoursPerWeek: {
        inSeason: "5-10 hours (daily feeding/watering, fence moves, monitoring)",
        offSeason: "1-2 hours (infrastructure maintenance, marketing for next season)"
      },
      timeToFirstRevenue: "5-7 months from purchasing feeder pigs to processed pork sales",
      year1Revenue: { low: 5000, high: 20000 },
      year3Revenue: { low: 12000, high: 40000 },
      grossMargin: "30-45% selling whole/half hogs direct; 40-55% selling individual cuts",
      breakeven: "First batch if pre-sold (most profitable model: sell whole/half hogs before purchasing feeder pigs)",
      seasonalRhythm: "Purchase feeder pigs in spring. Raise on pasture/woods through summer/fall. Process in late fall. Sell through winter. Can run two batches in long-season climates."
    },

    capitalProfile: {
      financial: { score: 3, note: "Good per-animal value. Whole/half hog sales reduce marketing burden." },
      material: { score: 3, note: "Fencing and shelter are reusable year to year" },
      living: { score: 4, note: "Pigs transform brushy, rough, and wooded land. Prepare ground for future enterprises." },
      social: { score: 4, note: "Pork is celebratory food. Whole/half hog sales create deep customer relationships." },
      intellectual: { score: 3, note: "Moderate learning curve; connects to land management strategy" },
      experiential: { score: 4, note: "Working with intelligent animals; land transformation is visible and dramatic" },
      spiritual: { score: 3, note: "Honest reckoning with the cycle of life. Pigs are personable — this enterprise asks you to be present with mortality." },
      cultural: { score: 4, note: "Whole-hog cooking traditions; charcuterie culture; farm-to-table movement" }
    },

    landscapeRequirements: {
      climate: "Zones 3-9. Pigs handle cold well with shelter. Heat stress above 85°F requires shade and wallows.",
      water: "Significant water needs — drinking plus wallowing in heat. 5-10 gallons/pig/day.",
      access: "Vehicle access for feed delivery to pig paddocks.",
      soils: "Any — pigs are the soil preparation enterprise. They MAKE soil workable.",
      infrastructure: "Strong fencing (pigs are escape artists). Simple shelter. Processing relationship (USDA-inspected for retail sale).",
      minAcreage: "0.5 acres for 5 pigs with rotation. 2-5 acres for 20 pigs. Wooded land is ideal — pigs in forest is a feature, not a limitation."
    },

    synergies: [
      "Silvopasture — pigs clear understory in developing silvopasture; prepare planting areas",
      "Market Garden — pigs prepare future garden beds by rooting and incorporating organic matter",
      "Value-Added Products — charcuterie, sausage, lard, bone broth from whole-animal utilization",
      "CSA — pork shares for protein upgrade; whole/half hog sales to committed members",
      "Pastured Poultry — pigs and chickens can follow each other in rotation"
    ],
    prerequisites: [
      "Strong fencing — not optional. Electric is minimum; permanent perimeter recommended.",
      "Processing relationship (USDA-inspected facility) reserved well in advance — slots fill up",
      "Pre-sold whole/half hogs before purchasing feeder pigs (de-risks the enterprise)",
      "Water infrastructure to pig paddocks"
    ],
    commonFailureModes: [
      "Inadequate fencing — escaped pigs damage relationships with neighbors",
      "Not reserving processing dates early enough — many facilities book 6+ months out",
      "Feeding too much purchased grain instead of utilizing pasture/forest/surplus",
      "Not pre-selling — sitting on 1,000+ lbs of frozen pork with no buyers",
      "Taking on breeding stock before mastering raising feeder pigs"
    ],

    fitSignals: {
      loves: ["animals", "land clearing", "transformation", "working with intelligent creatures", "whole-animal utilization"],
      skills: ["fencing", "construction", "animal handling", "marketing", "physical strength"],
      worldNeeds: ["local pastured pork", "humane meat", "land clearing/restoration"],
      lifestyleTraits: ["comfortable with large animals", "can handle butchering emotionally", "enjoys physical challenge"]
    },

    sources: [
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale forest pork enterprise",
      "Joel Salatin, various publications — Polyface pig models",
      "Sugar Mountain Farm (Vermont) — published pastured pork economics"
    ]
  },

  // ─────────────────────────────────────────────
  // 12. GRASS-FED BEEF (SMALL SCALE)
  // ─────────────────────────────────────────────
  {
    id: "grass-fed-beef",
    name: "Grass-Fed Beef (Small Scale)",
    category: "Livestock — Ruminants",
    description: "Raising cattle on managed pasture using rotational grazing principles from Holistic Management. The quintessential regenerative enterprise — properly managed cattle are the primary tool for grassland restoration. Slow financial returns but massive ecological and social capital.",
    scaleAssumption: "5–20 head on 15–50 acres of pasture",

    financials: {
      startupCapital: {
        low: 8000,
        high: 30000,
        notes: "Cattle purchase ($800-2000/head × 5-20), fencing for rotational grazing ($2000-8000), water infrastructure for paddocks ($500-3000), handling facilities ($500-2000), hay/feed reserve for first winter ($1000-3000). Highest startup cost of common small-farm enterprises."
      },
      laborHoursPerWeek: {
        inSeason: "5-10 hours (daily moves in intensive rotation, water checks, fence maintenance)",
        offSeason: "3-7 hours (feeding, water in freezing conditions, health checks, calving if breeding)"
      },
      timeToFirstRevenue: "12-24 months (grass-finishing takes time). Faster if buying yearlings to finish rather than calving.",
      year1Revenue: { low: 0, high: 10000 },
      year3Revenue: { low: 10000, high: 40000 },
      grossMargin: "25-40% on whole/half beef direct-to-consumer ($6-10/lb hanging weight)",
      breakeven: "Year 2-3. Cattle are a long-cycle enterprise.",
      seasonalRhythm: "Grazing season mirrors grass growth (April-November in north). Winter feeding required in cold climates. Processing in fall. Calving in spring if breeding."
    },

    capitalProfile: {
      financial: { score: 2, note: "Slow returns, high capital requirement. But direct-sale beef customers are extremely loyal." },
      material: { score: 4, note: "Fencing, water infrastructure, handling facilities are permanent farm improvements" },
      living: { score: 5, note: "Managed grazing is THE primary tool for grassland restoration. Carbon sequestration, water cycle repair, biodiversity." },
      social: { score: 4, note: "Beef is a relationship product — whole/half sales create annual commitments" },
      intellectual: { score: 4, note: "Holistic Management, grazing planning, grass/soil science — deep knowledge domain" },
      experiential: { score: 4, note: "Reading grass, reading animals, reading weather — develops over decades" },
      spiritual: { score: 5, note: "Visible land transformation. Working with the grassland-herbivore co-evolution. Profound." },
      cultural: { score: 4, note: "Ranching heritage; grass-fed movement; land stewardship identity" }
    },

    landscapeRequirements: {
      climate: "Zones 3-9. Cattle breeds adaptable to most climates. Stockpiling forage extends grazing season.",
      water: "Critical — water access in every paddock. Cattle drink 10-20 gallons/head/day. Pond, creek, or piped system.",
      access: "Vehicle access for hay delivery, cattle handling, veterinary access.",
      soils: "Grassland soils. Cattle BUILD soil — this is the enterprise for degraded pasture restoration.",
      infrastructure: "Perimeter fencing (permanent). Cross-fencing for rotation (can be temporary electric). Water delivery. Handling pen/chute. Hay storage.",
      minAcreage: "10-15 acres minimum for 5 head with rotation. More is better — stocking rate depends on forage production."
    },

    synergies: [
      "Pastured Layers — hens follow cattle in leader-follower system (Salatin model)",
      "Silvopasture — cattle are the grazing management in developing silvopasture",
      "Hay/Forage — excess pasture becomes hay enterprise",
      "On-Farm Education — managed grazing demonstrations are powerful teaching",
      "Value-Added — bone broth, tallow products, leather"
    ],
    prerequisites: [
      "Adequate pasture acreage for your climate's carrying capacity",
      "Perimeter fencing in good condition",
      "Water infrastructure to support rotational grazing",
      "Processing relationship (USDA-inspected) reserved well in advance",
      "Understanding of Holistic Management grazing planning (even introductory level)"
    ],
    commonFailureModes: [
      "Overstocking — more cattle than the land can support degrades instead of regenerates",
      "Not rotating frequently enough — the magic is in the MOVE, not just having cattle",
      "Underestimating winter feed costs in cold climates",
      "Not pre-selling beef — same problem as pork but larger quantities",
      "Commodity pricing — must sell direct at $6-10/lb hanging weight, not commodity at $2/lb"
    ],

    fitSignals: {
      loves: ["landscape", "grasslands", "cattle", "big-picture ecology", "ranching heritage", "open space"],
      skills: ["animal handling", "fence building", "landscape reading", "patience"],
      worldNeeds: ["grass-fed protein", "grassland restoration", "carbon sequestration"],
      lifestyleTraits: ["long time horizon", "comfortable with large animals", "values land stewardship", "can handle financial patience"]
    },

    sources: [
      "Allan Savory, Holistic Management (2016 edition) — grazing management economics",
      "Richard Perkins, Regenerative Agriculture (2020) — Ridgedale beef enterprise",
      "Greg Judy, No Risk Ranching (2001) — custom grazing economics",
      "Gabe Brown, Dirt to Soil (2018) — integrated grazing economics"
    ]
  },

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

  // ─────────────────────────────────────────────
  // 15. PRIMARY EMPLOYMENT
  // ─────────────────────────────────────────────
  {
    id: "primary-employment",
    name: "Primary Employment",
    category: "Career — Employment",
    description: "Structured full-time or part-time employment providing baseline financial stability and often benefits (health insurance, retirement matching, paid leave). The financial bedrock that funds everything else — but only if you keep it from consuming everything else.",
    scaleAssumption: "30–50 hrs/week, single employer",

    financials: {
      startupCapital: {
        low: 200,
        high: 2000,
        notes: "Job search costs: professional clothing ($100-500), resume/portfolio preparation ($0-300), commute setup ($100-800), relocation if necessary ($0-5000+). Most people underestimate the cost of getting a job."
      },
      laborHoursPerWeek: {
        inSeason: "40-50 hours (including commute, prep, and recovery time — not just clock hours)",
        offSeason: "Same — employment doesn't have an off-season, which is the point and the trap"
      },
      timeToFirstRevenue: "2-8 weeks from accepting offer to first paycheck",
      year1Revenue: { low: 35000, high: 75000 },
      year3Revenue: { low: 42000, high: 95000 },
      grossMargin: "85-95% net of commute, clothing, and meals — high margin but fixed ceiling",
      breakeven: "First paycheck — immediate positive cash flow is the core advantage",
      seasonalRhythm: "Continuous. Some roles have crunch periods (accounting in Q1, retail in Q4). Benefits typically vest on annual cycles."
    },

    capitalProfile: {
      financial: { score: 4, note: "Predictable income, benefits, retirement matching — the stability others build on" },
      material: { score: 2, note: "Company provides tools/space, but you own none of it" },
      living: { score: 1, note: "Sedentary roles actively degrade body capital without deliberate counterbalance" },
      social: { score: 3, note: "Workplace relationships are real but often don't survive a job change" },
      intellectual: { score: 3, note: "Depends heavily on the role — some jobs teach, some jobs extract" },
      experiential: { score: 3, note: "Structured skill building through repetition and mentorship" },
      spiritual: { score: 2, note: "Alignment varies wildly — a meaningful role builds this, a misaligned one erodes it" },
      cultural: { score: 2, note: "Contributes to organizational culture but rarely to broader community culture" }
    },

    landscapeRequirements: {
      climate: "N/A — role-dependent. Remote work eliminates geographic constraints for some fields.",
      water: "N/A",
      access: "Reliable transportation to workplace, or stable internet for remote roles.",
      soils: "N/A",
      infrastructure: "Appropriate workspace, professional wardrobe or equipment as required by role.",
      minAcreage: "N/A"
    },

    synergies: [
      "Freelance Practice — employment provides stability while building independent client base",
      "Learning Program — employer tuition reimbursement funds skill acquisition",
      "Financial Restructuring — steady paycheck enables systematic debt reduction",
      "Health Practice — benefits often include gym subsidies or wellness programs",
      "Creative Practice — financial security frees creative work from monetization pressure"
    ],
    prerequisites: [
      "Marketable skill set or willingness to start at entry level and learn",
      "Clear boundaries practice — the role will expand to fill all available time if you let it",
      "Transportation or remote work setup"
    ],
    commonFailureModes: [
      "Golden handcuffs — staying in a misaligned role because the salary is comfortable",
      "Identity fusion — defining yourself entirely by your job title and employer",
      "Allowing work to consume all other capitals because the paycheck feels productive",
      "Never developing parallel income streams, leaving you vulnerable to layoffs",
      "Confusing busyness with purpose — being fully employed but building nothing lasting"
    ],

    fitSignals: {
      loves: ["structure", "collaboration", "clear expectations", "being part of something larger"],
      skills: ["professional communication", "time management", "working within systems"],
      worldNeeds: ["specialized expertise in a field", "organizational capacity", "team contribution"],
      lifestyleTraits: ["values stability over autonomy", "benefits matter for family", "wants clear work-life separation"]
    },

    sources: [
      "U.S. Bureau of Labor Statistics — Occupational Employment and Wage Statistics (2024)",
      "Gallup State of the Global Workplace Report (2023)",
      "SHRM Employee Benefits Survey (2024)"
    ]
  },

  // ─────────────────────────────────────────────
  // 16. FREELANCE PRACTICE
  // ─────────────────────────────────────────────
  {
    id: "freelance-practice",
    name: "Freelance Practice",
    category: "Career — Independent",
    description: "Independent professional practice selling expertise directly to clients. You own the client relationship, set the price, and choose the work — but you also own every failure, every dry spell, and every unpaid invoice. The upside is real. So is the isolation.",
    scaleAssumption: "15–40 hrs/week, 3–8 active clients",

    financials: {
      startupCapital: {
        low: 500,
        high: 5000,
        notes: "Professional website/portfolio ($200-1500), software/tools ($100-1000), business registration ($50-500), initial marketing ($100-1000), 3-month expense runway ($0-5000+). Most underinvest in the runway."
      },
      laborHoursPerWeek: {
        inSeason: "25-40 hours (15-30 billable, 10+ hours on admin, marketing, invoicing, proposals)",
        offSeason: "10-20 hours (marketing, skill development, pipeline building — there is no true off-season)"
      },
      timeToFirstRevenue: "2-12 weeks from launch to first paid project, highly variable",
      year1Revenue: { low: 25000, high: 80000 },
      year3Revenue: { low: 50000, high: 150000 },
      grossMargin: "70-90% — high margin but you are the cost of goods sold",
      breakeven: "Month 2-6 if you have existing network; month 6-12 if building from scratch",
      seasonalRhythm: "Feast-famine cycles until pipeline is mature. Many fields slow in December and August. Q1 and Q4 are often strong for B2B."
    },

    capitalProfile: {
      financial: { score: 4, note: "Higher ceiling than employment but less predictable — the floor can be zero" },
      material: { score: 2, note: "You build tools and systems but they're personal, not transferable assets" },
      living: { score: 2, note: "Flexibility helps but isolation and screen time often degrade body capital" },
      social: { score: 3, note: "Client relationships are genuine but transactional — build community deliberately" },
      intellectual: { score: 4, note: "Every engagement teaches. Diverse clients accelerate learning faster than any single employer" },
      experiential: { score: 5, note: "Rapid, varied skill application across contexts — the most potent learning loop" },
      spiritual: { score: 3, note: "Freedom to choose aligned work — but financial pressure can override values" },
      cultural: { score: 2, note: "Limited unless you deliberately build in public or teach" }
    },

    landscapeRequirements: {
      climate: "N/A — most freelance work is location-independent, though some fields require on-site presence.",
      water: "N/A",
      access: "Reliable high-speed internet. Professional communication setup. Portfolio or proof of work.",
      soils: "N/A",
      infrastructure: "Dedicated workspace (home office or co-working). Professional tools for your field. Accounting system.",
      minAcreage: "N/A"
    },

    synergies: [
      "Primary Employment — freelance alongside employment to build pipeline before leaping",
      "Creative Practice — creative skills become billable when framed as professional services",
      "Learning Program — each client engagement is a paid learning opportunity",
      "Education — teaching workshops builds authority and generates leads"
    ],
    prerequisites: [
      "Demonstrable expertise or portfolio in a specific domain — generalists starve",
      "3-6 month expense runway before going full-time independent",
      "At least 2-3 warm leads or existing relationships before launching",
      "Comfort with inconsistent income and self-directed structure"
    ],
    commonFailureModes: [
      "Feast-famine cycle — not marketing during busy periods, then scrambling when projects end",
      "Underpricing — charging employee rates without accounting for taxes, benefits, admin, and downtime",
      "Scope creep — saying yes to everything because you're afraid of losing the client",
      "Isolation — working alone for months without peer feedback or community",
      "Not firing bad clients — one toxic relationship can consume all your energy and time"
    ],

    fitSignals: {
      loves: ["autonomy", "variety", "direct client relationships", "solving problems"],
      skills: ["self-direction", "sales and marketing", "clear communication", "estimation and scoping"],
      worldNeeds: ["specialized expertise not available locally", "flexible professional capacity"],
      lifestyleTraits: ["comfortable with uncertainty", "self-motivated", "can set own boundaries", "doesn't need external structure"]
    },

    sources: [
      "Freelancers Union & Upwork — Freelance Forward Survey (2023)",
      "U.S. Bureau of Labor Statistics — Self-Employment data",
      "Brennan Dunn — Double Your Freelancing research and surveys"
    ]
  },

  // ─────────────────────────────────────────────
  // 17. CREATIVE PRACTICE
  // ─────────────────────────────────────────────
  {
    id: "creative-practice",
    name: "Creative Practice",
    category: "Creative — Practice",
    description: "Sustained creative work — writing, art, music, craft, design, woodworking, whatever the medium — as a deliberate capital-building enterprise. May or may not generate income directly. The financial return is often zero for years, and that's fine if you're honest about it and the other capitals are real.",
    scaleAssumption: "5–20 hrs/week dedicated creative time",

    financials: {
      startupCapital: {
        low: 100,
        high: 3000,
        notes: "Materials and tools ($50-1500), workspace setup ($0-1000), learning resources ($50-500). Varies enormously by medium — writing needs almost nothing, ceramics needs a kiln."
      },
      laborHoursPerWeek: {
        inSeason: "5-20 hours (practice, creation, revision — the work itself, not promotion)",
        offSeason: "2-5 hours (creative rest is not laziness — it's composting)"
      },
      timeToFirstRevenue: "6 months to never — and 'never' is a valid answer if other capitals are building",
      year1Revenue: { low: 0, high: 5000 },
      year3Revenue: { low: 0, high: 25000 },
      grossMargin: "Highly variable. Craft/physical goods: 30-60%. Digital/writing: 70-95%. Many practices run at a financial loss offset by experiential and spiritual returns.",
      breakeven: "Many creative practices never break even financially and shouldn't be forced to",
      seasonalRhythm: "Self-directed. Holiday markets for physical goods. Submission seasons for writing. But the real rhythm is internal — creative energy ebbs and flows."
    },

    capitalProfile: {
      financial: { score: 1, note: "Usually low to zero direct financial return, especially early. Be honest about this." },
      material: { score: 2, note: "Builds tools and workspace, sometimes a body of work with lasting value" },
      living: { score: 2, note: "Sedentary for most creative work, though craft and performance are exceptions" },
      social: { score: 3, note: "Creative communities are real and deep — if you show up and share" },
      intellectual: { score: 4, note: "Creative problem-solving transfers to everything else in your life" },
      experiential: { score: 5, note: "The practice itself IS the capital — mastery through sustained attention" },
      spiritual: { score: 5, note: "Making things gives meaning. This is not optional — it's what makes the rest bearable." },
      cultural: { score: 3, note: "Contributes to community culture when shared, but don't force sharing before the work is ready" }
    },

    landscapeRequirements: {
      climate: "N/A — some creative work benefits from solitude and natural beauty, but it's not required.",
      water: "N/A",
      access: "Access to materials, community of practice (online or local), exhibition/sharing venues if desired.",
      soils: "N/A",
      infrastructure: "Dedicated creative space, even if small. Tools appropriate to the medium. Time protection — the hardest infrastructure to build.",
      minAcreage: "N/A"
    },

    synergies: [
      "Primary Employment — stable income removes monetization pressure from creative work",
      "Freelance Practice — creative skills often translate to billable professional work",
      "Education — teaching your craft deepens your own understanding and builds community",
      "Health Practice — physical practice prevents the body degradation of sedentary creative work"
    ],
    prerequisites: [
      "A practice you'll actually show up for — not the one that sounds impressive, the one that pulls you",
      "Protected time in the weekly rhythm — creativity requires defended space",
      "Financial stability from other sources so the work doesn't have to earn before it's ready"
    ],
    commonFailureModes: [
      "Monetization pressure killing the joy — turning a practice into a hustle before the craft matures",
      "Inconsistency — waiting for inspiration instead of building a practice habit",
      "Comparison — measuring your inside against someone else's polished outside",
      "Isolation — creating alone without feedback, community, or exhibition",
      "Perfectionism — never finishing, never sharing, never getting the feedback that fuels growth"
    ],

    fitSignals: {
      loves: ["making things", "beauty", "expression", "craft", "solitude with purpose"],
      skills: ["sustained attention", "comfort with ambiguity", "self-critique without self-destruction"],
      worldNeeds: ["beauty and meaning", "cultural contribution", "original perspective"],
      lifestyleTraits: ["can protect creative time from obligations", "doesn't need external validation to continue", "comfortable with slow returns"]
    },

    sources: [
      "Julia Cameron — The Artist's Way, long-term creative practice frameworks",
      "Cal Newport — Deep Work and the economics of creative output",
      "Bureau of Labor Statistics — Artists and Authors occupational data (2024)"
    ]
  },

  // ─────────────────────────────────────────────
  // 18. HEALTH PRACTICE
  // ─────────────────────────────────────────────
  {
    id: "health-practice",
    name: "Health Practice",
    category: "Life System — Body",
    description: "Structured health and fitness practice as a deliberate investment in body capital — the infrastructure everything else runs on. Not a hobby, not a luxury, not vanity. This is maintenance of the system that does all the other work. Neglect it and every other enterprise degrades.",
    scaleAssumption: "3–7 hrs/week active practice, plus sleep and nutrition attention",

    financials: {
      startupCapital: {
        low: 50,
        high: 2000,
        notes: "Decent walking shoes ($50). Gym membership ($20-80/month). Basic equipment ($100-800). Quality food premium ($50-200/month above baseline). The real cost is time, not money."
      },
      laborHoursPerWeek: {
        inSeason: "3-7 hours direct practice (exercise, meal prep, recovery). Always in season.",
        offSeason: "1-2 hours (maintenance movement during recovery weeks or travel)"
      },
      timeToFirstRevenue: "Immediate — the 'revenue' is reduced sick days, medical costs, and productivity gains across every other enterprise.",
      year1Revenue: { low: 2000, high: 8000 },
      year3Revenue: { low: 3000, high: 12000 },
      grossMargin: "Frame as cost savings: $2,000-8,000/year in reduced medical expenses, sick days, and productivity gains. Hard to measure, very real.",
      breakeven: "Month 1 — the return is capacity in every other enterprise. An unfit operator is a bottleneck in every system.",
      seasonalRhythm: "Continuous with seasonal variation. Outdoor movement in good weather, indoor alternatives in winter. Adjust intensity around high-demand periods in other enterprises."
    },

    capitalProfile: {
      financial: { score: 1, note: "Direct cost, no direct revenue — but poor health is the most expensive thing in your system" },
      material: { score: 1, note: "Some equipment accumulation, but the body itself is the capital" },
      living: { score: 5, note: "This IS the living capital enterprise — energy, resilience, longevity, daily capacity" },
      social: { score: 2, note: "Group fitness and sport build community. Solo practice less so." },
      intellectual: { score: 2, note: "Body literacy, nutrition knowledge, movement science understanding" },
      experiential: { score: 4, note: "Deep knowledge of your own body and its responses — irreplaceable lived wisdom" },
      spiritual: { score: 3, note: "Physical practice often becomes meditative. Runner's clarity. Gardener's calm." },
      cultural: { score: 1, note: "Minimal direct cultural contribution unless you teach or lead community fitness" }
    },

    landscapeRequirements: {
      climate: "Outdoor practice shifts with seasons. Extreme heat or cold require indoor alternatives.",
      water: "Adequate hydration access during exercise.",
      access: "Walking paths, gym, or home exercise space. Access to quality food sources.",
      soils: "N/A",
      infrastructure: "Exercise space (even a room corner). Basic equipment if desired. Kitchen for meal prep. Sleep environment optimization.",
      minAcreage: "N/A — a body is the only acreage required"
    },

    synergies: [
      "Primary Employment — physical capacity directly affects work performance and energy",
      "Creative Practice — body movement prevents the degradation of sedentary creative work",
      "Market Garden — farm work IS the exercise if designed well",
      "Financial Restructuring — health improvements reduce the single largest expense risk in most budgets"
    ],
    prerequisites: [
      "Medical clearance if starting from sedentary baseline with known health conditions",
      "Honesty about current capacity — start where you are, not where your ego wants to be",
      "Weekly rhythm with protected exercise slots — it gets cancelled first if not defended"
    ],
    commonFailureModes: [
      "All-or-nothing thinking — missing one workout becomes missing all of them",
      "Injury from overtraining or ego-driven intensity beyond current capacity",
      "Using exercise as punishment for eating or as compensation for other life stress",
      "Neglecting rest and recovery — training is the stimulus, rest is when adaptation happens",
      "Letting the practice slide during busy periods in other enterprises, then losing momentum"
    ],

    fitSignals: {
      loves: ["movement", "physical challenge", "being outdoors", "cooking", "feeling strong"],
      skills: ["consistency over intensity", "listening to body signals", "meal planning"],
      worldNeeds: ["personal resilience", "modeling health for family", "reducing healthcare burden"],
      lifestyleTraits: ["willing to protect time for health", "can start small without feeling inadequate", "prefers sustainable habits over dramatic transformations"]
    },

    sources: [
      "American College of Sports Medicine — Exercise Prescription Guidelines (2024)",
      "Peter Attia — Outlive: The Science and Art of Longevity (2023)",
      "CDC — Physical Activity Guidelines for Americans"
    ]
  },

  // ─────────────────────────────────────────────
  // 19. FINANCIAL RESTRUCTURING
  // ─────────────────────────────────────────────
  {
    id: "financial-restructuring",
    name: "Financial Restructuring",
    category: "Life System — Money",
    description: "Deliberate program to restructure your financial situation — debt reduction, emergency fund building, expense rationalization, income stream diversification. Not a budget spreadsheet. A design problem: how does money flow through your system, and where are the leaks, traps, and leverage points?",
    scaleAssumption: "2–4 hrs/week active management, ongoing attention",

    financials: {
      startupCapital: {
        low: 25,
        high: 500,
        notes: "Budgeting app or notebook ($0-50), financial software/tools ($0-200), professional consultation if needed ($100-300/session), possibly a financial planning course ($0-500). The irony: the people who need this most have the least to invest in it."
      },
      laborHoursPerWeek: {
        inSeason: "2-4 hours (tracking, planning, negotiating, learning — intense during restructuring phase)",
        offSeason: "0.5-1 hour (maintenance tracking and periodic review once systems are established)"
      },
      timeToFirstRevenue: "Immediate — the 'revenue' is reduced outflow. Most people find $200-500/month in waste within the first week of honest tracking.",
      year1Revenue: { low: 2400, high: 12000 },
      year3Revenue: { low: 5000, high: 30000 },
      grossMargin: "N/A — frame as savings rate improvement: from typical 5-10% to 20-40% of income. The compound effect over 3 years is dramatic.",
      breakeven: "Week 1 — honest tracking nearly always reveals immediate savings opportunities",
      seasonalRhythm: "Intensive first 3 months of restructuring, then maintenance mode. Annual reviews around tax season. Major reassessment when income or expenses shift significantly."
    },

    capitalProfile: {
      financial: { score: 5, note: "The whole point — transforming financial stress into financial clarity and runway" },
      material: { score: 1, note: "Doesn't build material assets directly, but frees capital to invest in them" },
      living: { score: 2, note: "Financial stress relief measurably improves sleep, blood pressure, and immune function" },
      social: { score: 1, note: "Money conversations are taboo — but being honest about money deepens a few key relationships" },
      intellectual: { score: 3, note: "Financial literacy transfers to every other enterprise — understanding flows, margins, leverage" },
      experiential: { score: 3, note: "The lived experience of financial control is profoundly different from financial anxiety" },
      spiritual: { score: 2, note: "Alignment between spending and values reveals itself during this process" },
      cultural: { score: 1, note: "Modeling financial honesty is countercultural and quietly powerful" }
    },

    landscapeRequirements: {
      climate: "N/A",
      water: "N/A",
      access: "Access to financial accounts and records. Spreadsheet or budgeting tool. Possibly access to a financial advisor or community.",
      soils: "N/A",
      infrastructure: "Computer or phone for tracking. Secure document storage. Calendar for weekly review sessions.",
      minAcreage: "N/A"
    },

    synergies: [
      "Primary Employment — steady income provides the raw material for restructuring",
      "Health Practice — reduced financial stress directly improves physical health outcomes",
      "Freelance Practice — financial clarity reveals the true minimum viable income for independence",
      "Learning Program — may reveal that investment in skills has the highest ROI of any option"
    ],
    prerequisites: [
      "Willingness to look honestly at current financial reality — the numbers, not the narrative",
      "Income source (even small) — you can't restructure what doesn't exist",
      "Emotional readiness — money shame is real and must be named before it can be addressed"
    ],
    commonFailureModes: [
      "Deprivation mindset — cutting so aggressively that the plan is unsustainable and collapses within weeks",
      "Analysis paralysis — perfecting the spreadsheet instead of making the first change",
      "Shame spiral — discovering the real numbers triggers self-blame instead of system redesign",
      "Ignoring the emotional dimension of money — treating it as pure math when it's deeply psychological",
      "Optimizing expenses without addressing income — you can't cut your way to abundance"
    ],

    fitSignals: {
      loves: ["systems thinking", "spreadsheets", "seeing progress", "solving puzzles"],
      skills: ["honesty with self", "discipline without rigidity", "basic math and tracking"],
      worldNeeds: ["personal financial stability", "modeling financial literacy for family", "reducing systemic financial anxiety"],
      lifestyleTraits: ["ready to confront financial reality", "can defer gratification", "values clarity over comfort"]
    },

    sources: [
      "Ramit Sethi — I Will Teach You to Be Rich (2nd ed., 2019)",
      "Federal Reserve — Survey of Consumer Finances (2022)",
      "Consumer Financial Protection Bureau — Financial Well-Being in America report"
    ]
  },

  // ─────────────────────────────────────────────
  // 20. LEARNING PROGRAM
  // ─────────────────────────────────────────────
  {
    id: "learning-program",
    name: "Learning Program",
    category: "Growth — Structured",
    description: "Deliberate skill acquisition program with clear milestones — could be formal education, self-directed study, apprenticeship, or professional development. The enterprise is the learning itself, treated with the same rigor as any other investment. The question isn't whether to learn, but what to learn and why — because unfocused learning is just expensive entertainment.",
    scaleAssumption: "5–15 hrs/week dedicated study and practice",

    financials: {
      startupCapital: {
        low: 50,
        high: 10000,
        notes: "Books and materials ($50-500). Online courses $0-2000. Community college semester $1500-5000. Professional bootcamp $5000-15000. The range is enormous — and expensive doesn't mean better."
      },
      laborHoursPerWeek: {
        inSeason: "5-15 hours (study, practice, projects, mentorship sessions — the actual learning, not watching tutorials)",
        offSeason: "2-5 hours (review, practice maintenance, applying what was learned in real contexts)"
      },
      timeToFirstRevenue: "3-18 months depending on the skill and market. Some skills pay immediately (coding bootcamp → first contract). Others take years (PhD → academic position).",
      year1Revenue: { low: 0, high: 5000 },
      year3Revenue: { low: 0, high: 30000 },
      grossMargin: "N/A — this is an investment enterprise. Frame as ROI: what's the salary/income increase attributable to the new skill? Typical professional development ROI: 10-30% income increase within 2 years.",
      breakeven: "Varies wildly. A $500 online course that leads to a $5000 raise breaks even immediately. A $100K degree that doesn't change your career trajectory never breaks even financially.",
      seasonalRhythm: "Follows academic calendar for formal education. Self-directed programs should follow a semester-like rhythm: 10-12 week intensive blocks with breaks for integration."
    },

    capitalProfile: {
      financial: { score: 2, note: "Usually a net cost in the short term — the financial return is deferred and uncertain" },
      material: { score: 1, note: "Minimal — some tools and reference materials accumulated" },
      living: { score: 1, note: "Sedentary. Study time competes with movement time. Counterbalance deliberately." },
      social: { score: 3, note: "Learning communities and mentorship relationships are among the deepest you'll form" },
      intellectual: { score: 5, note: "This IS the intellectual capital enterprise — systematic knowledge and capability building" },
      experiential: { score: 4, note: "Applied learning (projects, practice, apprenticeship) builds irreplaceable experiential capital" },
      spiritual: { score: 2, note: "The beginner's mind experience can be humbling and renewing — or ego-crushing" },
      cultural: { score: 2, note: "Teaching others what you learn is the highest form of learning and a cultural contribution" }
    },

    landscapeRequirements: {
      climate: "N/A",
      water: "N/A",
      access: "Access to learning resources: library, internet, mentors, practice environments. For hands-on skills, access to workshop or lab space.",
      soils: "N/A",
      infrastructure: "Quiet study space. Computer for most modern learning. Note-taking system. Calendar with protected study blocks.",
      minAcreage: "N/A"
    },

    synergies: [
      "Freelance Practice — new skills open new service offerings and higher rates",
      "Primary Employment — employer may fund professional development; new skills earn promotions",
      "Creative Practice — learning new techniques deepens creative range",
      "Education — teaching what you're learning accelerates your own mastery"
    ],
    prerequisites: [
      "Clear learning objective tied to a specific capital you want to build — 'learn to code' is too vague, 'build a web app for my farm's CSA by June' is a program",
      "Protected weekly time in the rhythm — learning requires sustained attention, not scraps of time",
      "Honest assessment of current level — start where you are, not where you wish you were"
    ],
    commonFailureModes: [
      "Credential collecting without application — degrees and certificates that never change your actual work",
      "Tutorial hell — endlessly consuming content without building anything real",
      "Never shipping — learning in private forever, never testing skills against real-world feedback",
      "Perfectionism — waiting to be 'ready' before applying knowledge, which means never applying it",
      "Shiny object syndrome — starting new programs before completing current ones, finishing nothing"
    ],

    fitSignals: {
      loves: ["learning", "reading", "understanding how things work", "mastery", "teaching others"],
      skills: ["sustained focus", "note-taking", "self-assessment", "asking good questions"],
      worldNeeds: ["specialized knowledge in a growing field", "skill gaps in local community"],
      lifestyleTraits: ["comfortable being a beginner", "can tolerate frustration of not-yet-knowing", "values growth over comfort"]
    },

    sources: [
      "Anders Ericsson — Peak: Secrets from the New Science of Expertise (2016)",
      "Scott Young — Ultralearning: Accelerate Your Career (2019)",
      "Bureau of Labor Statistics — Education and Training Outlook data (2024)"
    ]
  },

];


// ─── Enterprise Injection into System Prompt ───
// This formats the template data for inclusion in the
// Enterprise phase prompt. The AI uses it as reference
// material — real numbers to draw from, adjusted to the
// operator's specific context.

const CAPITALS_ORDER = ["financial", "material", "living", "social", "intellectual", "experiential", "spiritual", "cultural"] as const;

/**
 * Compute aggregate capital scores across selected enterprises.
 * Returns 8 scores (one per capital form) averaging matched template profiles.
 */
export function computeAggregateCapitalScores(selectedNames: string[]): number[] {
  const matched = selectedNames
    .map((name) =>
      ENTERPRISE_TEMPLATES.find(
        (t) =>
          t.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(t.name.toLowerCase())
      )
    )
    .filter(Boolean) as EnterpriseTemplate[];

  if (matched.length === 0) return [3, 3, 3, 3, 3, 3, 3, 3];

  return CAPITALS_ORDER.map((cap) => {
    const sum = matched.reduce((s, t) => s + t.capitalProfile[cap].score, 0);
    return Math.round((sum / matched.length) * 10) / 10;
  });
}

// IDs of universal (non-agricultural) enterprise templates
const UNIVERSAL_TEMPLATE_IDS = new Set([
  "primary-employment",
  "freelance-practice",
  "creative-practice",
  "health-practice",
  "financial-restructuring",
  "learning-program",
]);

function isUniversalTemplate(e: EnterpriseTemplate): boolean {
  return UNIVERSAL_TEMPLATE_IDS.has(e.id);
}

export function buildEnterpriseReferenceBlock(
  fieldType?: "land" | "universal" | "hybrid"
): string {
  const templates = ENTERPRISE_TEMPLATES.filter((e) => {
    if (fieldType === "universal") return isUniversalTemplate(e);
    if (fieldType === "land") return !isUniversalTemplate(e);
    // "hybrid" or undefined — include all
    return true;
  });

  const contextLabel =
    fieldType === "universal"
      ? "life design"
      : fieldType === "land"
        ? "land-based"
        : "land-based and life design";

  let block = `\n\n## Enterprise Reference Data

The following are baseline ${contextLabel} enterprise templates with real numbers from published sources. Use these as STARTING POINTS when recommending enterprises. ALWAYS adjust for the operator's specific:
- Existing capitals, skills, and infrastructure
- Market access, geographic context, and local pricing
- Labor availability and physical capacity
- Regulatory environment and professional requirements

Do NOT copy these templates verbatim. Synthesize them with the operator's Ikigai, Holistic Context, and Situation Reading to produce recommendations that are genuinely specific to their situation.

When presenting numbers, give ranges and be honest about uncertainty.\n\n`;

  for (const e of templates) {
    const universal = isUniversalTemplate(e);
    block += `### ${e.name} (${e.category})\n`;
    block += `${e.description}\n`;
    block += `Scale: ${e.scaleAssumption}\n`;
    block += `Startup: $${e.financials.startupCapital.low.toLocaleString()}-${e.financials.startupCapital.high.toLocaleString()} (${e.financials.startupCapital.notes})\n`;
    block += `Time: ${e.financials.laborHoursPerWeek.inSeason}${universal ? "" : ` in-season, ${e.financials.laborHoursPerWeek.offSeason} off-season`}\n`;
    block += `First Revenue: ${e.financials.timeToFirstRevenue}\n`;
    block += `Year 1: $${e.financials.year1Revenue.low.toLocaleString()}-${e.financials.year1Revenue.high.toLocaleString()} | Year 3: $${e.financials.year3Revenue.low.toLocaleString()}-${e.financials.year3Revenue.high.toLocaleString()}\n`;
    block += `Margin: ${e.financials.grossMargin}\n`;
    if (!universal) {
      block += `Min acreage: ${e.landscapeRequirements.minAcreage}\n`;
    }
    block += `Key synergies: ${e.synergies.slice(0, 3).join("; ")}\n`;
    block += `Fit signals: loves ${e.fitSignals.loves.slice(0, 4).join(", ")}; skills ${e.fitSignals.skills.slice(0, 3).join(", ")}\n`;
    block += `Top capitals: ${Object.entries(e.capitalProfile).filter(([_, v]) => v.score >= 4).map(([k, v]) => `${k} (${v.score}/5)`).join(", ")}\n`;
    block += `Common failures: ${e.commonFailureModes.slice(0, 2).join("; ")}\n\n`;
  }

  return block;
}
