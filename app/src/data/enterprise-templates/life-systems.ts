import type { EnterpriseTemplate } from "./types";

export const lifeSystemsTemplates: EnterpriseTemplate[] = [
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

];
