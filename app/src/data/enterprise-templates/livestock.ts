import type { EnterpriseTemplate } from "./types";

export const livestockTemplates: EnterpriseTemplate[] = [
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

];
