import type { EnterpriseTemplate } from "./types";

export const knowledgeTemplates: EnterpriseTemplate[] = [
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

];
