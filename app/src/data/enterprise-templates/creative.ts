import type { EnterpriseTemplate } from "./types";

export const creativeTemplates: EnterpriseTemplate[] = [
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

];
