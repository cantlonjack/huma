import type { EnterpriseTemplate } from "./types";

export const careerTemplates: EnterpriseTemplate[] = [
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

];
