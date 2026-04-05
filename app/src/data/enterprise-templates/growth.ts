import type { EnterpriseTemplate } from "./types";

export const growthTemplates: EnterpriseTemplate[] = [
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
