import type { RpplSeed } from "./types";

// ─── Core Principles ────────────────────────────────────────────────────────
// Derived from foundational frameworks. Each states an axiom, traces to its
// framework source(s), and may challenge an inherited belief.
// ─────────────────────────────────────────────────────────────────────────────

export const principleSeeds: RpplSeed[] = [
  // ━━━ BODY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:body-light-system:v1",
    type: "principle",
    name: "My body is a light-driven system",
    domain: "body",
    domains: ["meta"],
    description:
      "Every cell in your body contains molecular clocks synchronized to the solar cycle. Light exposure — when, how much, what spectrum — is the primary signal your biology uses to coordinate metabolism, immunity, hormone production, and cognition. This single understanding reframes every health decision: timing and light environment matter as much as diet and exercise.",
    outputs: [
      { name: "Circadian alignment", portType: "state", key: "circadian_alignment" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:circadian-biology:v1",
      "rppl:axiom:hermetic-principles:v1",
    ],
    axiom:
      "My biology is orchestrated by light. Aligning with the solar cycle is the foundation of health, not an optimization.",
    challenges:
      "Indoor lighting and screens have no meaningful health impact. Health is primarily about diet and exercise.",
    provenance: {
      source: "research",
      sourceTradition: "Circadian science / Hermetic correspondence",
      keyReference:
        "Dr. Satchin Panda, 'The Circadian Code' (2018); Nobel Prize in Physiology 2017 (molecular clocks)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "indoor-worker",
        "poor-sleep",
        "screen-heavy",
        "health-conscious",
      ],
    },
    contextTags: ["health", "sleep", "light-exposure", "foundational"],
    links: [
      {
        rpplId: "rppl:principle:terrain-not-defense:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:terrain-not-defense:v1",
    type: "principle",
    name: "My health is my terrain, not my defense against pathogens",
    domain: "body",
    domains: ["meta"],
    description:
      "Health strategy shifts from 'avoid and destroy what might make me sick' to 'build and maintain an internal environment that is naturally resilient.' Sleep quality, gut microbiome, nutritional status, stress levels, and light exposure collectively determine your terrain. A strong terrain doesn't guarantee immunity but dramatically changes the odds.",
    outputs: [
      { name: "Terrain strength", portType: "state", key: "terrain_strength" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:terrain-theory:v1",
      "rppl:framework:circadian-biology:v1",
    ],
    axiom:
      "I build health from the inside out by strengthening my terrain, not by fearing what's outside.",
    challenges:
      "Health is about avoiding germs, taking medicine when sick, and staying current on institutional health recommendations without question.",
    provenance: {
      source: "research",
      sourceTradition: "Terrain theory / functional medicine / microbiome science",
      keyReference:
        "Antoine Bechamp (terrain theory); Ed Yong, 'I Contain Multitudes' (2016); modern functional medicine synthesis",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "health-conscious",
        "self-experimenter",
        "questioning-conventional",
      ],
    },
    contextTags: ["health", "resilience", "holistic", "terrain-building"],
    contraindications: [
      "Does not replace acute medical care — if you are seriously ill, get appropriate treatment",
      "Terrain-building is a long-term investment, not a cure for existing conditions",
    ],
    links: [
      {
        rpplId: "rppl:principle:body-light-system:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:timing-matters:v1",
    type: "principle",
    name: "When matters as much as what",
    domain: "body",
    domains: ["meta", "growth"],
    description:
      "WHEN you eat, sleep, exercise, and get light exposure is at least as important as WHAT you eat, how long you sleep, or what exercise you do. The same meal eaten at noon versus midnight produces different metabolic responses. The same workout at 7am versus 11pm has different hormonal effects. Timing is a free lever most people never pull.",
    outputs: [
      { name: "Timing awareness", portType: "state", key: "timing_awareness" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:circadian-biology:v1",
      "rppl:axiom:natural-law:v1",
    ],
    axiom:
      "The timing of an action determines its effect as much as the action itself.",
    challenges:
      "A calorie is a calorie regardless of when it's consumed. Exercise is exercise regardless of time of day.",
    provenance: {
      source: "research",
      sourceTradition: "Chronobiology / time-restricted eating research",
      keyReference:
        "Dr. Satchin Panda (time-restricted eating); circadian metabolism research",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "health-optimizer",
        "shift-worker",
        "metabolic-issues",
      ],
    },
    contextTags: ["health", "metabolism", "circadian", "optimization"],
    links: [
      {
        rpplId: "rppl:principle:body-light-system:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ META / EPISTEMOLOGICAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:evidence-not-authority:v1",
    type: "principle",
    name: "I evaluate claims by evidence, not authority",
    domain: "meta",
    domains: ["growth", "body"],
    description:
      "The source of a claim — regardless of credentials, institutional backing, or social status — does not determine its truth. Evidence, logical consistency, and reproducibility determine truth. 'The expert says so' is an appeal to authority, not an argument. This doesn't mean ignoring expertise — it means verifying independently rather than deferring unconditionally.",
    outputs: [
      { name: "Evidence literacy", portType: "state", key: "evidence_literacy" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:trivium:v1",
      "rppl:framework:scientific-method:v1",
      "rppl:framework:first-principles:v1",
    ],
    axiom:
      "Truth is determined by evidence and logic, not by who states it. I verify, not defer.",
    challenges:
      "If the doctor, the government, the expert, or the institution says so, it must be true. Questioning authority is dangerous or irresponsible.",
    provenance: {
      source: "research",
      sourceTradition: "Trivium / empiricism / scientific method",
      keyReference:
        "Aristotle (fallacy of appeal to authority); Karl Popper, 'The Logic of Scientific Discovery' (1959)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "critical-thinker",
        "information-consumer",
        "health-decision-maker",
      ],
    },
    contextTags: [
      "universal",
      "critical-thinking",
      "epistemology",
      "sovereignty",
    ],
    links: [
      {
        rpplId: "rppl:principle:test-inherited-beliefs:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:observation-before-intervention:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:test-inherited-beliefs:v1",
    type: "principle",
    name: "I test my inherited beliefs against my own experience",
    domain: "meta",
    domains: ["identity", "growth"],
    description:
      "Most of what you believe about health, money, relationships, and purpose was inherited — from parents, culture, institutions, or social norms. Some of it is true. Some of it served the source but not you. Some of it was never examined. The practice of identifying inherited beliefs and testing them against your own data is the beginning of genuine self-authorship.",
    outputs: [
      { name: "Belief examination", portType: "state", key: "belief_examination" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:trivium:v1",
      "rppl:framework:scientific-method:v1",
      "rppl:framework:first-principles:v1",
    ],
    axiom:
      "I distinguish between beliefs I chose and beliefs I inherited, and I test both.",
    challenges:
      "The beliefs I grew up with are correct by default. Questioning them is disloyal or ungrateful.",
    provenance: {
      source: "research",
      sourceTradition:
        "Socratic examination / first principles / scientific self-experimentation",
      keyReference:
        "Socrates ('The unexamined life is not worth living'); Descartes' methodical doubt",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "in-transition",
        "questioning-norms",
        "self-authoring",
      ],
    },
    contextTags: [
      "universal",
      "self-examination",
      "deconditioning",
      "growth",
    ],
    links: [
      {
        rpplId: "rppl:principle:evidence-not-authority:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:cause-and-effect:v1",
    type: "principle",
    name: "Cause and effect are real and inescapable",
    domain: "meta",
    domains: ["purpose", "identity"],
    description:
      "Every action produces consequences. You are free to choose your actions, but you are not free to choose their consequences. This is not cosmic punishment — it is the operating law of reality. Understanding this deeply transforms decision-making: you stop looking for shortcuts and start examining the causal chains between your behaviors and your outcomes.",
    outputs: [
      { name: "Causal thinking", portType: "state", key: "causal_thinking" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:axiom:natural-law:v1",
      "rppl:axiom:hermetic-principles:v1",
    ],
    axiom:
      "I choose my actions knowing that consequences follow necessarily. There are no shortcuts to outcomes, only to regrets.",
    challenges:
      "I can shortcut consequences. Correlation isn't causation (misused as an excuse to ignore obvious causal chains). Luck matters more than behavior.",
    provenance: {
      source: "research",
      sourceTradition: "Natural Law / Hermetic Cause & Effect / Stoic physics",
      keyReference:
        "Hermetic Principle of Cause and Effect (The Kybalion); Marcus Aurelius, 'Meditations'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "consequence-avoider",
        "decision-maker",
        "seeking-agency",
      ],
    },
    contextTags: ["universal", "responsibility", "agency", "natural-law"],
    links: [
      {
        rpplId: "rppl:principle:own-consequences:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:attention-grows:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:observation-before-intervention:v1",
    type: "principle",
    name: "Observation precedes intervention",
    domain: "meta",
    domains: ["growth"],
    description:
      "Before changing anything — a diet, a relationship, a work process, a life direction — observe it as it is. Understand the existing system before redesigning it. Most failed interventions fail because the problem was misdiagnosed, not because the solution was wrong. The impulse to 'fix things immediately' is almost always counterproductive.",
    outputs: [
      { name: "Observational patience", portType: "state", key: "observational_patience" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:scientific-method:v1",
      "rppl:framework:socratic-method:v1",
    ],
    axiom:
      "I understand before I intervene. The first step is always observation, never action.",
    challenges:
      "If something is broken, fix it immediately. Action is always better than inaction. Speed is a virtue.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture Principle 1 / scientific observation / Socratic inquiry",
      keyReference:
        "David Holmgren, 'Observe and interact' (Permaculture Principle 1); scientific method (observation phase)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "action-oriented",
        "fixer",
        "overwhelmed",
        "in-transition",
      ],
    },
    contextTags: ["universal", "patience", "systems-thinking", "diagnosis"],
    links: [
      {
        rpplId: "rppl:principle:evidence-not-authority:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:question-over-answer:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:question-over-answer:v1",
    type: "principle",
    name: "The question is more powerful than the answer",
    domain: "growth",
    domains: ["meta", "people"],
    description:
      "A good question opens thinking; a premature answer closes it. The quality of your life is shaped by the quality of the questions you ask — of yourself, of others, of your circumstances. Answers are provisional and context-dependent. Questions are tools that keep working long after any specific answer has expired.",
    outputs: [
      { name: "Inquiry orientation", portType: "state", key: "inquiry_orientation" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:socratic-method:v1",
      "rppl:framework:trivium:v1",
    ],
    axiom:
      "I ask better questions rather than seeking faster answers. The right question dissolves the problem.",
    challenges:
      "The goal is to have answers. Uncertainty is weakness. Questions are for beginners.",
    provenance: {
      source: "research",
      sourceTradition: "Socratic method / Trivium / inquiry-based learning",
      keyReference:
        "Plato's Socratic dialogues; Rainer Maria Rilke, 'Letters to a Young Poet' ('Live the questions')",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "learner",
        "coach",
        "parent",
        "leader",
      ],
    },
    contextTags: ["universal", "learning", "dialogue", "self-discovery"],
    links: [
      {
        rpplId: "rppl:principle:observation-before-intervention:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:test-inherited-beliefs:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:patterns-at-every-scale:v1",
    type: "principle",
    name: "As above, so below — patterns repeat at every scale",
    domain: "meta",
    domains: ["growth"],
    description:
      "The same patterns appear at the scale of a day, a year, a life, and a civilization. Your morning mirrors your spring. Your daily energy cycle mirrors your seasonal energy cycle. Understanding the pattern at one scale reveals it at all scales. This is not metaphor — it is the structure of reality operating through self-similarity, fractals, and nested cycles.",
    outputs: [
      { name: "Scale awareness", portType: "state", key: "scale_awareness" },
      { name: "Pattern recognition", portType: "state", key: "pattern_recognition" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:axiom:hermetic-principles:v1",
      "rppl:framework:quadrivium:v1",
      "rppl:framework:pattern-language:v1",
    ],
    axiom:
      "I look for the pattern beneath the pattern. What repeats at the small scale reveals the large, and vice versa.",
    challenges:
      "Each situation is unique and unrelated to others. Looking for patterns is superstitious or reductive.",
    provenance: {
      source: "research",
      sourceTradition:
        "Hermetic Correspondence / Quadrivium / fractal geometry / Alexander's pattern theory",
      keyReference:
        "The Kybalion (Principle of Correspondence); Benoit Mandelbrot, 'The Fractal Geometry of Nature' (1982); Christopher Alexander, 'The Nature of Order'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "pattern-seeker",
        "systems-thinker",
        "philosophical",
      ],
    },
    contextTags: [
      "universal",
      "pattern-recognition",
      "self-similarity",
      "depth",
    ],
    links: [
      {
        rpplId: "rppl:principle:small-patterns-compose:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ DESIGN / SYSTEMS PRINCIPLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:multiple-yields:v1",
    type: "principle",
    name: "Every action should produce multiple yields",
    domain: "meta",
    domains: ["money", "growth"],
    description:
      "Design each element of your life to serve multiple functions. A morning walk can build health, provide sunlight for circadian alignment, offer thinking time, and build relationship if done with a partner. A single-purpose action is a missed opportunity. This doesn't mean cramming — it means designing intelligently so that natural synergies emerge.",
    outputs: [
      { name: "Synergy design", portType: "state", key: "synergy_design" },
      { name: "Resource efficiency", portType: "state", key: "resource_efficiency" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:holistic-management:v1",
    ],
    axiom:
      "I design actions that serve multiple purposes simultaneously. Single-function is a design failure, not a simplification.",
    challenges:
      "Single-purpose activities are fine. Multitasking is bad. Just do one thing at a time.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture (Principle 3: Obtain a yield) / Holistic Management (marginal reaction)",
      keyReference:
        "David Holmgren, 'Permaculture: Principles and Pathways' (stacking functions); Bill Mollison, 'Permaculture: A Designers' Manual'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "time-constrained",
        "optimizer",
        "designer",
        "parent",
      ],
    },
    contextTags: ["universal", "efficiency", "design", "stacking-functions"],
    links: [
      {
        rpplId: "rppl:principle:integrate-not-segregate:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:whole-context-decisions:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:permanence-order:v1",
    type: "principle",
    name: "Address things in order of permanence",
    domain: "meta",
    domains: ["home", "body"],
    description:
      "When everything feels broken or overwhelming, start with the most permanent layer. Don't optimize your productivity system while your sleep is destroyed. Don't redesign your career while your primary relationship is in crisis. Health outlasts career. Relationships outlast addresses. Purpose outlasts any single job. Fix the foundation before decorating the walls.",
    outputs: [
      { name: "Priority clarity", portType: "state", key: "priority_clarity" },
      { name: "Decision clarity", portType: "state", key: "decision_clarity" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:regrarians:v1"],
    axiom:
      "I fix foundations before facades. The most permanent layer gets attention first.",
    challenges:
      "Focus on what's urgent, not what's foundational. The squeaky wheel gets the grease. Optimize what's visible.",
    provenance: {
      source: "research",
      sourceTradition:
        "Regrarians Platform / Keyline Scale of Permanence / holistic prioritization",
      keyReference:
        "Darren Doherty, 'Regrarians Handbook' (2013); P.A. Yeomans, Scale of Permanence",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "in-crisis",
        "rebuilding",
        "prioritizing",
      ],
    },
    contextTags: [
      "universal",
      "prioritization",
      "triage",
      "foundations-first",
    ],
    links: [
      {
        rpplId: "rppl:principle:whole-context-decisions:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:small-patterns-compose:v1",
    type: "principle",
    name: "Small patterns compose into life design",
    domain: "meta",
    domains: ["growth"],
    description:
      "You don't need a grand plan to change your life. Small daily patterns compose into weekly patterns, which compose into monthly rhythms, which compose into seasonal flows, which compose into a life. The quality of the whole emerges from the relationships between small patterns, not from any single dramatic intervention. One good pattern, practiced consistently, changes everything it touches.",
    outputs: [
      { name: "Compositional thinking", portType: "state", key: "compositional_thinking" },
      { name: "Incremental design", portType: "state", key: "incremental_design" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:pattern-language:v1",
      "rppl:framework:permaculture:v1",
    ],
    axiom:
      "I change my life by adding one small pattern at a time and letting it integrate before adding the next.",
    challenges:
      "I need a grand plan to change my life. Small changes don't matter. Only dramatic overhauls produce results.",
    provenance: {
      source: "research",
      sourceTradition:
        "Alexander's Pattern Language / Permaculture (Principle 9: small and slow solutions)",
      keyReference:
        "Christopher Alexander, 'A Pattern Language' (1977); David Holmgren (small and slow solutions)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "perfectionist",
        "all-or-nothing",
        "beginner",
      ],
    },
    contextTags: ["universal", "incremental", "composability", "patience"],
    links: [
      {
        rpplId: "rppl:principle:patterns-at-every-scale:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:rhythm-universal:v1",
    type: "principle",
    name: "Rhythm is universal — my life has seasons",
    domain: "meta",
    domains: ["joy", "body"],
    description:
      "Everything flows in cycles — energy, motivation, creativity, relationships, markets, health. Fighting this rhythm is fighting reality. You will not maintain the same output level year-round, the same emotional tone, the same creative fire. Planning for cycles instead of pretending they don't exist is the difference between sustainable living and burnout.",
    outputs: [
      { name: "Rhythm awareness", portType: "state", key: "rhythm_awareness" },
      { name: "Cyclical thinking", portType: "state", key: "cyclical_thinking" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:axiom:natural-law:v1",
      "rppl:axiom:hermetic-principles:v1",
      "rppl:framework:permaculture:v1",
    ],
    axiom:
      "I plan for cycles rather than pretending they don't exist. Expansion and contraction are both necessary.",
    challenges:
      "I should maintain the same productivity, energy, and output year-round. Slowing down is falling behind.",
    provenance: {
      source: "research",
      sourceTradition:
        "Hermetic Rhythm / Natural Law / circadian and seasonal biology",
      keyReference:
        "The Kybalion (Principle of Rhythm); Ecclesiastes 3 ('To everything there is a season'); chronobiology research",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "burned-out",
        "overachiever",
        "seasonal-affective",
        "creative",
      ],
    },
    contextTags: ["universal", "cycles", "sustainability", "rest"],
    links: [
      {
        rpplId: "rppl:principle:rest-is-productive:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:body-light-system:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:rest-is-productive:v1",
    type: "principle",
    name: "Rest is as productive as effort",
    domain: "joy",
    domains: ["body", "meta"],
    description:
      "Polarity is not optional. Effort without rest is degradation, not productivity. Sleep builds memory and repairs tissue. Fallow periods in fields rebuild soil. Winter prepares for spring. Rest is not the absence of productivity — it is the other half of the productivity cycle. Treating rest as laziness is a violation of Natural Law that eventually breaks the system.",
    outputs: [
      { name: "Rest appreciation", portType: "state", key: "rest_appreciation" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:axiom:hermetic-principles:v1",
      "rppl:axiom:natural-law:v1",
    ],
    axiom:
      "Rest is the other half of the effort cycle. Without it, effort degrades into diminishing returns and eventual breakdown.",
    challenges:
      "Productivity equals hours worked. Rest is laziness. Sleeping less is a competitive advantage. You'll sleep when you're dead.",
    provenance: {
      source: "research",
      sourceTradition:
        "Hermetic Polarity / Natural Law Rhythm / sleep science",
      keyReference:
        "The Kybalion (Principle of Polarity); Matthew Walker, 'Why We Sleep' (2017)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "workaholic",
        "burned-out",
        "guilt-about-rest",
        "high-performer",
      ],
    },
    contextTags: ["universal", "rest", "polarity", "sustainable-performance"],
    links: [
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:whole-context-decisions:v1",
    type: "principle",
    name: "My decisions serve my whole context, not single dimensions",
    domain: "meta",
    domains: ["money", "purpose"],
    description:
      "Optimizing for one dimension (income, fitness, social status) while ignoring the others produces a life that looks good on one axis and is broken on the rest. Every significant decision should be tested against your whole context — quality of life, future resource base, and forms of production. Single-dimension optimization is a trap disguised as focus.",
    outputs: [
      { name: "Holistic framing", portType: "state", key: "holistic_framing" },
      { name: "Decision clarity", portType: "state", key: "decision_clarity" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:holistic-management:v1"],
    axiom:
      "I test every significant decision against my whole context, not just the dimension that's screaming loudest.",
    challenges:
      "Focus on one thing and sacrifice everything else. Optimize for career/money/fitness above all. You can catch up on the rest later.",
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management / whole-systems decision-making",
      keyReference:
        "Allan Savory, 'Holistic Management' (holistic context / seven testing questions)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "single-dimension-optimizer",
        "burnout-risk",
        "major-decision",
      ],
    },
    contextTags: ["universal", "decision-making", "balance", "holistic"],
    links: [
      {
        rpplId: "rppl:principle:permanence-order:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:multiple-yields:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:integrate-not-segregate:v1",
    type: "principle",
    name: "Integrate rather than segregate — connection creates value",
    domain: "people",
    domains: ["meta", "home"],
    description:
      "The value of elements comes from their relationships to each other, not from their isolation. In life design: don't silo health, work, relationships, and creativity into separate boxes. Design so they feed each other. A walk with your partner integrates health, relationship, and reflection. A work project that uses your deepest skills integrates purpose and livelihood. Separation is overhead; integration is yield.",
    outputs: [
      { name: "Integration thinking", portType: "state", key: "integration_thinking" },
      { name: "Systems awareness", portType: "state", key: "systems_awareness" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:holistic-management:v1",
    ],
    axiom:
      "I design my life so that its parts feed each other rather than competing for the same limited resources.",
    challenges:
      "Keep work and life separate. Compartmentalize for sanity. Each domain needs its own dedicated time.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture Principle 8 / systems ecology / Holistic Management",
      keyReference:
        "David Holmgren, 'Integrate rather than segregate' (Permaculture Principle 8)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "parent",
        "multi-role",
        "time-constrained",
        "burnt-out-from-compartmentalizing",
      ],
    },
    contextTags: [
      "universal",
      "integration",
      "relationship-design",
      "efficiency",
    ],
    links: [
      {
        rpplId: "rppl:principle:multiple-yields:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:growth-at-edges:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:energy-capture:v1",
    type: "principle",
    name: "Energy must be captured when available",
    domain: "meta",
    domains: ["money", "body"],
    description:
      "Resources — energy, money, attention, knowledge, sunlight, inspiration — are not uniformly available. They peak and trough. The practice is to capture and store them during abundance for use during scarcity. Morning sunlight won't wait. A burst of creative energy won't come back on command. A financial windfall invested well compounds; spent reactively, it's gone.",
    outputs: [
      { name: "Energy awareness", portType: "state", key: "energy_awareness" },
      { name: "Resource efficiency", portType: "state", key: "resource_efficiency" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:circadian-biology:v1",
    ],
    axiom:
      "I capture resources when they're available, knowing abundance and scarcity both cycle.",
    challenges:
      "Resources will always be available when I need them. I can earn/produce/access what I need on demand.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture Principle 2 / circadian biology / seasonal wisdom",
      keyReference:
        "David Holmgren, 'Catch and store energy' (Permaculture Principle 2)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "financial-planner",
        "energy-manager",
        "seasonal-worker",
      ],
    },
    contextTags: ["universal", "resource-management", "preparedness", "cycles"],
    links: [
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:diversity-resilience:v1",
    type: "principle",
    name: "Diversity is resilience",
    domain: "growth",
    domains: ["money", "people"],
    description:
      "Monocultures fail catastrophically — in agriculture, in economies, and in lives. A single income source, a single skill set, a single social circle, a single source of meaning — each is a single point of failure. Diversity of skills, income, relationships, interests, and information sources creates the redundancy that allows you to absorb shocks and adapt to change.",
    outputs: [
      { name: "Diversification thinking", portType: "state", key: "diversification_thinking" },
      { name: "Resilience", portType: "state", key: "resilience" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:holistic-management:v1",
    ],
    axiom:
      "I cultivate diversity in income, skills, relationships, and interests because monocultures fail catastrophically.",
    challenges:
      "Specialize in one thing. Go all-in. Diversification is for people who can't commit.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture Principle 10 / ecology / portfolio theory / Nassim Taleb (antifragility)",
      keyReference:
        "David Holmgren, 'Use and value diversity' (Permaculture Principle 10); Nassim Taleb, 'Antifragile' (2012)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "single-income",
        "specialist",
        "risk-aware",
        "entrepreneur",
      ],
    },
    contextTags: [
      "universal",
      "resilience",
      "anti-fragility",
      "risk-management",
    ],
    links: [
      {
        rpplId: "rppl:principle:growth-at-edges:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:growth-at-edges:v1",
    type: "principle",
    name: "The most growth happens at the edges",
    domain: "growth",
    domains: ["meta", "identity"],
    description:
      "In ecology, the edge — where forest meets meadow, where river meets land — is the most productive and diverse zone. In life, the most interesting growth happens at the boundaries: between disciplines you know well, between comfort and discomfort, between what you've mastered and what you haven't tried. Staying safely in the center of any domain is stable but stagnant. The edge is where life is richest.",
    outputs: [
      { name: "Edge awareness", portType: "state", key: "edge_awareness" },
      { name: "Growth orientation", portType: "state", key: "growth_orientation" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:pattern-language:v1",
    ],
    axiom:
      "I seek the edges — between disciplines, between comfort and discomfort — because that's where the most growth and interesting life happens.",
    challenges:
      "Stay in your lane. Master one thing before touching another. The middle is safe.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture Principle 11 / edge ecology / interdisciplinary studies",
      keyReference:
        "David Holmgren, 'Use edges and value the marginal' (Permaculture Principle 11); ecological edge effect research",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "multi-disciplinary",
        "creative",
        "bored",
        "stagnant",
      ],
    },
    contextTags: [
      "universal",
      "interdisciplinary",
      "edge-seeking",
      "growth",
    ],
    links: [
      {
        rpplId: "rppl:principle:diversity-resilience:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:integrate-not-segregate:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:attention-grows:v1",
    type: "principle",
    name: "What I give attention to, grows",
    domain: "purpose",
    domains: ["meta", "identity"],
    description:
      "Attention is the primary resource. What you consistently give your time, energy, and focus to is what expands in your life — for better or worse. This is not 'manifesting' — it is the observable mechanism by which behavior shapes outcomes. Complaining grows complaints. Practicing gratitude grows awareness of what's working. Building skill grows capacity. Choose your attention deliberately.",
    outputs: [
      { name: "Attention direction", portType: "state", key: "attention_direction" },
      { name: "Care awareness", portType: "state", key: "care_awareness" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:axiom:hermetic-principles:v1",
      "rppl:axiom:natural-law:v1",
    ],
    axiom:
      "I treat attention as my most valuable resource and direct it deliberately, knowing that what I focus on expands.",
    challenges:
      "Where I put my attention doesn't matter — only actions count. Thinking about something has no effect.",
    provenance: {
      source: "research",
      sourceTradition:
        "Hermetic Mentalism / Natural Law (Care) / cognitive science (attentional bias)",
      keyReference:
        "The Kybalion (Principle of Mentalism); William James, 'The Principles of Psychology' ('My experience is what I agree to attend to')",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "scattered",
        "doom-scrolling",
        "unfocused",
        "seeking-direction",
      ],
    },
    contextTags: ["universal", "attention", "focus", "agency", "mindfulness"],
    links: [
      {
        rpplId: "rppl:principle:cause-and-effect:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ IDENTITY / AGENCY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:own-consequences:v1",
    type: "principle",
    name: "I own the consequences of my choices",
    domain: "identity",
    domains: ["meta", "purpose"],
    description:
      "Radical ownership means accepting that your current life is largely the accumulated consequence of your past choices — and that your future life will be the accumulated consequence of what you choose from here. This is not blame (you didn't choose your starting conditions) — it is agency. If you own the causes, you can change the effects. If you externalize the causes, you are powerless.",
    outputs: [
      { name: "Responsibility acceptance", portType: "state", key: "responsibility_acceptance" },
      { name: "Causal thinking", portType: "state", key: "causal_thinking" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:stoicism:v1",
      "rppl:axiom:natural-law:v1",
    ],
    axiom:
      "I own my choices and their consequences. This is not blame — it is the source of my power to change.",
    challenges:
      "My circumstances are other people's fault. The system is rigged. I can't help my situation.",
    provenance: {
      source: "research",
      sourceTradition:
        "Stoic dichotomy of control / Natural Law (Cause & Effect)",
      keyReference:
        "Epictetus, 'Enchiridion' (what is and isn't in our power); Jocko Willink, 'Extreme Ownership' (2015) (modern application)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "victim-mindset",
        "seeking-agency",
        "in-transition",
      ],
    },
    contextTags: ["universal", "agency", "ownership", "responsibility"],
    links: [
      {
        rpplId: "rppl:principle:cause-and-effect:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:response-not-circumstances:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:response-not-circumstances:v1",
    type: "principle",
    name: "I am not my circumstances — I am my response to them",
    domain: "identity",
    domains: ["purpose", "joy"],
    description:
      "External events are raw material, not destiny. Between stimulus and response is a space — in that space lies your freedom. Your job title is not your identity. Your bank balance is not your worth. Your diagnosis is not your fate. What defines you is how you respond: with courage or cowardice, with intention or reaction, with virtue or convenience. This is the Stoic insight that makes agency possible in any circumstance.",
    outputs: [
      { name: "Response ownership", portType: "state", key: "response_ownership" },
      { name: "Emotional regulation", portType: "state", key: "emotional_regulation" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:stoicism:v1"],
    axiom:
      "I am defined by my responses, not my circumstances. Between stimulus and response, I choose.",
    challenges:
      "I AM my job, my income, my diagnosis, my trauma, my social position. Identity is what happens TO me.",
    provenance: {
      source: "research",
      sourceTradition:
        "Stoic philosophy / existentialism / logotherapy",
      keyReference:
        "Epictetus, 'Enchiridion' ('It is not things that disturb us, but our judgments about things'); Viktor Frankl, 'Man's Search for Meaning' (1946)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "in-adversity",
        "identity-crisis",
        "loss",
        "transition",
      ],
    },
    contextTags: ["universal", "identity", "resilience", "stoic", "agency"],
    links: [
      {
        rpplId: "rppl:principle:own-consequences:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:voluntary-power:v1",
    type: "principle",
    name: "What I do voluntarily has more power than what I do from obligation",
    domain: "purpose",
    domains: ["identity", "people"],
    description:
      "Actions taken from genuine choice carry a quality of energy, creativity, and sustainability that coerced actions never can. Discipline that comes from clear understanding of WHY is sustainable. Discipline that comes from external pressure or guilt is brittle and breeds resentment. Examine your obligations: which did you choose, and which were imposed? Converting obligation to voluntary choice (or dropping the obligation entirely) transforms the quality of everything you do.",
    outputs: [
      { name: "Consent awareness", portType: "state", key: "consent_awareness" },
      { name: "Ethical clarity", portType: "state", key: "ethical_clarity" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:non-aggression:v1",
      "rppl:framework:stoicism:v1",
    ],
    axiom:
      "I act from choice, not obligation. When I can't choose the action, I choose my attitude toward it.",
    challenges:
      "Discipline means forcing yourself to do things you hate. Duty overrides desire. Toughen up and push through.",
    provenance: {
      source: "research",
      sourceTradition:
        "Voluntarism / Stoic voluntary assent / self-determination theory",
      keyReference:
        "Murray Rothbard, 'The Ethics of Liberty' (1982); Deci & Ryan, Self-Determination Theory (intrinsic vs. extrinsic motivation)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "obligation-driven",
        "people-pleaser",
        "resentful",
        "burned-out",
      ],
    },
    contextTags: ["universal", "motivation", "autonomy", "self-authorship"],
    links: [
      {
        rpplId: "rppl:principle:self-regulation-freedom:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:self-regulation-freedom:v1",
    type: "principle",
    name: "Self-regulation is freedom; imposed regulation is dependency",
    domain: "purpose",
    domains: ["meta", "identity"],
    description:
      "When you regulate your own behavior from understanding and choice, you build capacity and freedom. When regulation is imposed externally, you build dependency and atrophy. This applies to health (understanding nutrition vs. following a prescribed diet), finances (managing your own money vs. relying on an advisor to tell you what to do), and relationships (choosing your values vs. inheriting them unexamined). The goal is always to move toward self-regulation.",
    outputs: [
      { name: "Self-governance", portType: "state", key: "self_governance" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:permaculture:v1",
      "rppl:framework:non-aggression:v1",
      "rppl:framework:stoicism:v1",
    ],
    axiom:
      "I build internal regulation through understanding rather than relying on external rules I haven't examined.",
    challenges:
      "Rules and regulations exist for good reason — just follow them. Self-regulation is selfish. External authority knows better.",
    provenance: {
      source: "research",
      sourceTradition:
        "Permaculture Principle 4 / voluntarism / Stoic self-governance",
      keyReference:
        "David Holmgren, 'Apply self-regulation and accept feedback' (Permaculture Principle 4); Stoic self-mastery tradition",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "rule-follower",
        "externally-motivated",
        "seeking-autonomy",
      ],
    },
    contextTags: [
      "universal",
      "autonomy",
      "self-governance",
      "maturity",
    ],
    links: [
      {
        rpplId: "rppl:principle:voluntary-power:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:evidence-not-authority:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ MONEY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:money-follows-value:v1",
    type: "principle",
    name: "Money follows value; value follows alignment",
    domain: "money",
    domains: ["purpose"],
    description:
      "Money is a measurement of value exchanged, not a thing to be pursued directly. Chasing money is chasing a measurement. Creating genuine value — solving real problems for real people in ways aligned with your deepest skills and understanding — produces money as a natural consequence. The sequence is: alignment → value → exchange → money. Invert it and you produce misaligned work for diminishing returns.",
    outputs: [
      { name: "Value creation focus", portType: "state", key: "value_creation_focus" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:first-principles:v1",
      "rppl:framework:holistic-management:v1",
    ],
    axiom:
      "I create value through aligned work. Money follows as a consequence, not as a target.",
    challenges:
      "Money is the primary goal. Find what pays best and do that regardless of alignment. Passion is a luxury.",
    provenance: {
      source: "research",
      sourceTradition:
        "First principles / value theory / Holistic Management (gross profit, energy/money source)",
      keyReference:
        "Allan Savory (Holistic Management economic testing); Naval Ravikant, 'How to Get Rich (without getting lucky)'; Paul Graham, 'Do Things That Don't Scale'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "career-changer",
        "entrepreneur",
        "money-anxious",
        "purpose-seeker",
      ],
    },
    contextTags: ["money", "purpose", "value-creation", "alignment"],
    links: [
      {
        rpplId: "rppl:principle:whole-context-decisions:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ HOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:home-first-ecosystem:v1",
    type: "principle",
    name: "My home is my first ecosystem",
    domain: "home",
    domains: ["body", "people"],
    description:
      "Your home environment is not neutral scenery — it is the ecosystem you inhabit most. Its light quality affects your circadian rhythm. Its air quality affects your respiratory and cognitive function. Its organization affects your cognitive load. Its food environment determines your default nutrition. Designing your home environment is the highest-leverage life design intervention because it shapes every default behavior without requiring willpower.",
    outputs: [
      { name: "Environment awareness", portType: "state", key: "environment_awareness" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:regrarians:v1",
      "rppl:framework:permaculture:v1",
      "rppl:framework:terrain-theory:v1",
    ],
    axiom:
      "I design my home environment to support the life I want, knowing that defaults shape behavior more than intentions.",
    challenges:
      "Home is just where you sleep. Environment doesn't really affect behavior. Willpower is what matters.",
    provenance: {
      source: "research",
      sourceTradition:
        "Regrarians (Buildings layer) / Permaculture design / environmental psychology",
      keyReference:
        "Christopher Alexander, 'A Pattern Language' (domestic patterns); James Clear, 'Atomic Habits' (environment design); permaculture zone design",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "homeowner",
        "renter",
        "parent",
        "health-conscious",
      ],
    },
    contextTags: [
      "home",
      "environment-design",
      "defaults",
      "terrain",
    ],
    links: [
      {
        rpplId: "rppl:principle:permanence-order:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:body-light-system:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ PHYSICS & MATHEMATICS DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:entropy-default:v1",
    type: "principle",
    name: "Entropy is the default — maintenance is not optional",
    domain: "meta",
    domains: ["body", "home", "people"],
    description:
      "Everything you value decays without active energy input. Muscles atrophy, skills erode, relationships drift, gardens revert to weeds, houses crumble. This is not pessimism — it's physics. The Second Law of Thermodynamics is why daily maintenance patterns matter: they are the energy input that holds entropy at bay. Skipping maintenance doesn't save time; it accumulates entropy debt that compounds with interest.",
    outputs: [
      { name: "Entropy awareness", portType: "state", key: "entropy_awareness" },
      { name: "Maintenance thinking", portType: "state", key: "maintenance_thinking" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:thermodynamics:v1"],
    axiom:
      "Order requires active maintenance. Neglect is not neutral — it is entropy advancing. I maintain what I value, daily.",
    challenges:
      "Things will stay fine if I leave them alone. Maintenance is boring overhead, not real work. I'll get to it later.",
    provenance: {
      source: "research",
      sourceTradition: "Thermodynamics / Second Law / entropy",
      keyReference:
        "Rudolf Clausius (Second Law); applied: any observation of an unmaintained system",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "procrastinator",
        "neglecting-health",
        "drifting-relationships",
        "deferred-maintenance",
      ],
    },
    contextTags: [
      "universal",
      "maintenance",
      "entropy",
      "daily-practice",
      "discipline",
    ],
    links: [
      {
        rpplId: "rppl:principle:cause-and-effect:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:leverage-points:v1",
    type: "principle",
    name: "Small changes at leverage points cascade into large effects",
    domain: "meta",
    domains: ["growth"],
    description:
      "Not all changes are equal. In any complex system, certain variables have outsized influence — small adjustments there produce disproportionate effects everywhere else. The night you cooked dinner instead of ordering out cascaded into better sleep, better focus, better work, a better evening. Finding YOUR leverage points — the 2-3 behaviors whose improvement cascades most widely — is the highest-ROI activity in life design.",
    outputs: [
      { name: "Leverage identification", portType: "state", key: "leverage_identification" },
      { name: "Focus", portType: "state", key: "focus" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:chaos-theory:v1",
      "rppl:framework:pareto-principle:v1",
    ],
    axiom:
      "I identify and protect the few behaviors that cascade into everything else rather than trying to change everything at once.",
    challenges:
      "All changes are equally important. I need to overhaul my entire life simultaneously. Small things don't matter.",
    provenance: {
      source: "research",
      sourceTradition:
        "Chaos theory / Donella Meadows (leverage points) / Pareto distribution",
      keyReference:
        "Donella Meadows, 'Leverage Points: Places to Intervene in a System' (1999)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "seeking-leverage",
        "optimizer",
      ],
    },
    contextTags: [
      "universal",
      "leverage",
      "cascading-effects",
      "prioritization",
    ],
    links: [
      {
        rpplId: "rppl:principle:small-patterns-compose:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:pareto-few:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:signal-not-noise:v1",
    type: "principle",
    name: "Most information is noise — the skill is compression",
    domain: "meta",
    domains: ["growth"],
    description:
      "Your life is flooded with information — news, opinions, metrics, notifications, advice. Most of it is noise. The skill that matters most in an information-saturated world is compression: extracting the signal that actually changes your decisions and discarding the rest. If a piece of information wouldn't change any action you'd take, it's noise, regardless of how interesting or alarming it is.",
    outputs: [
      { name: "Signal clarity", portType: "state", key: "signal_clarity" },
      { name: "Attention direction", portType: "state", key: "attention_direction" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:information-theory:v1"],
    axiom:
      "I curate for signal. If this information wouldn't change any decision I'd make, it is noise.",
    challenges:
      "More information is always better. Staying 'informed' on everything is a duty. Missing out on information is dangerous.",
    provenance: {
      source: "research",
      sourceTradition: "Information theory / Shannon / signal processing",
      keyReference:
        "Claude Shannon, 'A Mathematical Theory of Communication' (1948); Nassim Taleb on noise vs. signal",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "information-overloaded",
        "doom-scroller",
        "news-addicted",
        "unfocused",
      ],
    },
    contextTags: ["universal", "attention", "information-diet", "focus"],
    links: [
      {
        rpplId: "rppl:principle:attention-grows:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:pareto-few:v1",
    type: "principle",
    name: "A few behaviors produce most results — find them",
    domain: "meta",
    domains: ["growth", "money"],
    description:
      "Inputs and outputs are not equally distributed. A small number of your behaviors produce a disproportionate share of your positive outcomes — and a small number produce most of your problems. Finding the vital few (the 3-4 behaviors that cascade into everything good) and the toxic few (the 2-3 patterns causing most friction) is the fastest path to transformation. Inverse Pareto (eliminating the worst) often matters more than optimizing the best.",
    outputs: [
      { name: "Vital few focus", portType: "state", key: "vital_few_focus" },
      { name: "Resource efficiency", portType: "state", key: "resource_efficiency" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:pareto-principle:v1",
      "rppl:framework:holistic-management:v1",
    ],
    axiom:
      "I find and protect the vital few behaviors that produce most of my positive outcomes, and eliminate the toxic few that produce most of my friction.",
    challenges:
      "All my habits are equally important. I need to be good at everything. Incremental improvement across the board is the way.",
    provenance: {
      source: "research",
      sourceTradition:
        "Pareto / power law distribution / Holistic Management (weak link analysis)",
      keyReference:
        "Vilfredo Pareto; Richard Koch, 'The 80/20 Principle' (1997)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "spread-thin",
        "seeking-leverage",
      ],
    },
    contextTags: ["universal", "leverage", "prioritization", "elimination"],
    links: [
      {
        rpplId: "rppl:principle:leverage-points:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:permanence-order:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ PSYCHOLOGY DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:shadow-controls:v1",
    type: "principle",
    name: "What I deny in myself controls me from the shadow",
    domain: "identity",
    domains: ["people", "growth"],
    description:
      "The parts of yourself you refuse to acknowledge — anger, ambition, vulnerability, desire, fear — don't disappear when denied. They operate unconsciously, driving reactive behavior, projection onto others, and self-sabotage. When you have a disproportionate reaction to someone else's behavior, you're often seeing your own denied material reflected back. Integrating the shadow is the prerequisite for authentic living — and for accurate self-knowledge in any life design system.",
    outputs: [
      { name: "Shadow awareness", portType: "state", key: "shadow_awareness" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:jungian-psychology:v1"],
    axiom:
      "I examine what I deny, repress, and project. What I refuse to see in myself controls my behavior from the shadows.",
    challenges:
      "I am exactly who I present myself to be. My strong reactions to others are entirely about them, not me. Self-examination is navel-gazing.",
    provenance: {
      source: "research",
      sourceTradition: "Jungian depth psychology / shadow work",
      keyReference:
        "Carl Jung, 'Aion' (CW 9/2); Robert Johnson, 'Owning Your Own Shadow' (1991)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-examining",
        "repeating-patterns",
        "relationship-conflict",
        "self-sabotaging",
      ],
    },
    contextTags: [
      "universal",
      "shadow-work",
      "self-knowledge",
      "authenticity",
    ],
    contraindications: [
      "Shadow work can surface painful material — seek professional support when deep trauma is involved",
    ],
    links: [
      {
        rpplId: "rppl:principle:response-not-circumstances:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:test-inherited-beliefs:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:design-for-flow:v1",
    type: "principle",
    name: "I design for flow — clear goals, immediate feedback, matched challenge",
    domain: "joy",
    domains: ["growth", "purpose"],
    description:
      "Optimal experience is not random — its conditions are known and designable. Clear goals (I know exactly what I'm trying to do), immediate feedback (I can see how I'm doing in real time), and challenge matched to skill (hard enough to engage, not so hard it overwhelms). Structure these three conditions into your most important work and the experience transforms from effortful discipline into absorbed engagement.",
    outputs: [
      { name: "Flow design", portType: "state", key: "flow_design" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:flow-states:v1"],
    axiom:
      "I structure my most important work to meet flow conditions rather than relying on motivation or discipline.",
    challenges:
      "Motivation is a prerequisite for good work. Some tasks are inherently boring and that can't be changed. Discipline should be sufficient.",
    provenance: {
      source: "research",
      sourceTradition: "Flow research / positive psychology / Csikszentmihalyi",
      keyReference:
        "Mihaly Csikszentmihalyi, 'Flow: The Psychology of Optimal Experience' (1990)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "bored",
        "unmotivated",
        "creative",
        "knowledge-worker",
      ],
    },
    contextTags: [
      "universal",
      "engagement",
      "performance",
      "daily-design",
    ],
    links: [
      {
        rpplId: "rppl:principle:voluntary-power:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:design-for-bias:v1",
    type: "principle",
    name: "I am predictably irrational — I design for my biases, not against them",
    domain: "meta",
    domains: ["growth", "money"],
    description:
      "You are not a rational actor. Your brain is systematically biased in predictable ways — confirmation bias, loss aversion, present bias, anchoring, status quo bias. Knowing this does not fix it. You cannot think your way out of bias. But because biases are PREDICTABLE, you can design systems that account for them: change defaults, pre-commit decisions, add friction to bad behaviors, remove friction from good ones. Design for the human you actually are, not the rational agent you wish you were.",
    outputs: [
      { name: "Bias-aware design", portType: "state", key: "bias_aware_design" },
      { name: "Decision clarity", portType: "state", key: "decision_clarity" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:cognitive-biases:v1"],
    axiom:
      "I design my environment and systems for the biased human I actually am, not the rational agent I imagine myself to be.",
    challenges:
      "I make rational decisions. Willpower is sufficient to override bad impulses. Knowing about a bias eliminates it.",
    provenance: {
      source: "research",
      sourceTradition:
        "Behavioral economics / Kahneman / choice architecture",
      keyReference:
        "Daniel Kahneman, 'Thinking, Fast and Slow' (2011); Richard Thaler, 'Nudge' (2008)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "impulsive",
        "procrastinator",
        "willpower-depleted",
        "decision-fatigued",
      ],
    },
    contextTags: [
      "universal",
      "choice-architecture",
      "environment-design",
      "bias-awareness",
    ],
    links: [
      {
        rpplId: "rppl:principle:home-first-ecosystem:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:needs-have-order:v1",
    type: "principle",
    name: "Higher needs wait for lower needs — meet the foundation first",
    domain: "meta",
    domains: ["body", "purpose"],
    description:
      "You cannot sustainably focus on purpose when you're worried about rent. You can't build deep intimacy when you feel physically unsafe. Needs have a rough hierarchy: physiological → safety → belonging → esteem → self-actualization. When a lower level is compromised, it creates a gravitational pull that drags attention away from everything above it. This is not a rigid ladder — but the general pattern holds and explains why 'just follow your passion' fails when your foundation is shaking.",
    outputs: [
      { name: "Needs awareness", portType: "state", key: "needs_awareness" },
      { name: "Priority clarity", portType: "state", key: "priority_clarity" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:maslows-hierarchy:v1",
      "rppl:framework:regrarians:v1",
    ],
    axiom:
      "I address foundational needs before aspirational ones, knowing that an unmet lower need undermines everything above it.",
    challenges:
      "Passion conquers all. Just push through material concerns. Self-actualization doesn't require stability.",
    provenance: {
      source: "research",
      sourceTradition: "Maslow / humanistic psychology / Regrarians",
      keyReference:
        "Abraham Maslow, 'Motivation and Personality' (1954); Regrarians Scale of Permanence",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "in-crisis",
        "foundations-shaking",
        "overwhelmed",
        "stuck",
      ],
    },
    contextTags: [
      "universal",
      "prioritization",
      "needs",
      "foundation-first",
    ],
    links: [
      {
        rpplId: "rppl:principle:permanence-order:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EASTERN WISDOM DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:non-action-leverage:v1",
    type: "principle",
    name: "Sometimes the highest-leverage action is non-action",
    domain: "purpose",
    domains: ["meta", "joy"],
    description:
      "Not every problem requires immediate intervention. Water flowing around a rock is not weak — it shaped the Grand Canyon. Strategic non-action — observation, patience, waiting for the right moment, allowing a situation to resolve itself — is often more powerful than forced intervention. This challenges the Western bias that action is always superior to inaction. The empty space, the pause, the fallow period — these are functional, not failures.",
    outputs: [
      { name: "Non-action awareness", portType: "state", key: "non_action_awareness" },
      { name: "Timing awareness", portType: "state", key: "timing_awareness" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:taoism:v1",
      "rppl:framework:permaculture:v1",
    ],
    axiom:
      "I distinguish between laziness and strategic non-action. Not every problem is mine to solve, and not every moment requires intervention.",
    challenges:
      "Action is always better than inaction. Waiting is wasting time. If you're not doing something, you're falling behind.",
    provenance: {
      source: "research",
      sourceTradition: "Taoism (Wu Wei) / Permaculture (observe and interact)",
      keyReference:
        "Lao Tzu, 'Tao Te Ching'; David Holmgren, Permaculture Principle 1",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overachiever",
        "burned-out",
        "control-oriented",
        "anxious",
      ],
    },
    contextTags: ["universal", "wu-wei", "patience", "strategic-rest"],
    links: [
      {
        rpplId: "rppl:principle:rest-is-productive:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:observation-before-intervention:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:dharma-unique:v1",
    type: "principle",
    name: "My purpose is what only I can do",
    domain: "purpose",
    domains: ["identity"],
    description:
      "You have a specific nature and a specific contribution to make — your dharma. Living in alignment with it produces fulfillment regardless of material outcome. Living against it produces emptiness regardless of material success. 'Better is one's own dharma imperfectly performed than the dharma of another well performed.' The antidote to comparison: their path is not your path. Stop measuring yourself against a purpose that was never yours.",
    outputs: [
      { name: "Dharma clarity", portType: "state", key: "dharma_clarity" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:vedic-dharma-karma:v1",
      "rppl:framework:jungian-psychology:v1",
    ],
    axiom:
      "I pursue my own purpose imperfectly rather than someone else's purpose perfectly. Comparison is comparing different dharmas.",
    challenges:
      "Success means doing what successful people do. There's one right path. Comparison is motivating.",
    provenance: {
      source: "research",
      sourceTradition: "Vedic philosophy (svadharma) / Jungian individuation",
      keyReference:
        "Bhagavad Gita 3.35; Carl Jung (individuation as self-realization)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "comparing-to-others",
        "seeking-purpose",
        "misaligned",
        "successful-but-empty",
      ],
    },
    contextTags: ["universal", "purpose", "unique-path", "anti-comparison"],
    links: [
      {
        rpplId: "rppl:principle:voluntary-power:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:money-follows-value:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:time-is-wheel:v1",
    type: "principle",
    name: "Time is a wheel, not an arrow — returning themes deepen, they don't repeat",
    domain: "meta",
    domains: ["joy", "growth"],
    description:
      "When an old pattern, challenge, or theme reappears in your life, it's not regression — it's the spiral. You're meeting it at a deeper level with more capacity. Seasons return but each spring is a new spring. Linear metrics that only count 'forward progress' miss this: a validation score that rises and falls with seasons is HEALTHY, not failing. The spiral goes both directions — each return is an opportunity for deeper integration or deeper avoidance.",
    outputs: [
      { name: "Cyclical awareness", portType: "state", key: "cyclical_awareness" },
      { name: "Timing awareness", portType: "state", key: "timing_awareness" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:cyclical-time:v1",
      "rppl:axiom:hermetic-principles:v1",
    ],
    axiom:
      "When old themes return, I meet them at a deeper level. The spiral is not regression — it is deepening.",
    challenges:
      "I should have 'gotten past' this by now. Returning to old themes means I failed. Progress is strictly linear.",
    provenance: {
      source: "research",
      sourceTradition:
        "Indigenous cyclical time / Hermetic Rhythm / spiral dynamics",
      keyReference:
        "Tyson Yunkaporta, 'Sand Talk' (2019); Hermetic Principle of Rhythm",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "returning-patterns",
        "frustrated-by-cycles",
        "seasonal",
        "growth-oriented",
      ],
    },
    contextTags: ["universal", "cycles", "spiral", "seasonal", "non-linear"],
    links: [
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ COMMUNICATION DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:needs-not-judgments:v1",
    type: "principle",
    name: "I speak needs, not judgments",
    domain: "people",
    domains: ["identity"],
    description:
      "Beneath every complaint is an unmet need. 'You never listen' is a judgment. 'I need to feel heard' is a need. Judgments trigger defensiveness and escalation. Needs create space for connection and problem-solving. The shift from evaluation to observation, from blame to need, transforms every relationship conversation. Most conflict dissolves when both parties realize they share the same underlying need and are fighting over strategies.",
    outputs: [
      { name: "Needs literacy", portType: "state", key: "needs_literacy" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:nvc:v1"],
    axiom:
      "I express what I need rather than what's wrong with you. Beneath every judgment is an unmet need — I find it and speak it.",
    challenges:
      "If I just explain clearly enough what they're doing wrong, they'll change. Being direct means being blunt. Vulnerability is weakness.",
    provenance: {
      source: "research",
      sourceTradition: "Nonviolent Communication / Rosenberg",
      keyReference:
        "Marshall Rosenberg, 'Nonviolent Communication' (3rd ed., 2015)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "in-conflict",
        "parent",
        "partner",
        "manager",
      ],
    },
    contextTags: [
      "relationships",
      "communication",
      "conflict-resolution",
      "vulnerability",
    ],
    links: [
      {
        rpplId: "rppl:principle:integrate-not-segregate:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EPISTEMOLOGY DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:map-not-territory:v1",
    type: "principle",
    name: "The map is not the territory — my model of life is not my life",
    domain: "meta",
    domains: ["identity", "growth"],
    description:
      "Every description, label, category, and model — including HUMA's context model — is a map. Maps are useful. Maps are necessary. But maps are not reality. 'I'm a failure' is a map, not territory. 'My life is falling apart' is a map, not territory. The actual territory is always richer, more nuanced, and more open to change than any map of it. Confusing the map (your story about your life) with the territory (your actual life) is the root of most unnecessary suffering.",
    outputs: [
      { name: "Map-territory awareness", portType: "state", key: "map_territory_awareness" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:general-semantics:v1",
      "rppl:framework:first-principles:v1",
    ],
    axiom:
      "I hold my models, labels, and stories lightly. They are useful maps, not the territory itself. I can redraw the map.",
    challenges:
      "My story about my life IS my life. Labels define me. My mental model is reality.",
    provenance: {
      source: "research",
      sourceTradition: "General Semantics / Korzybski / cognitive therapy",
      keyReference:
        "Alfred Korzybski, 'Science and Sanity' (1933); Gregory Bateson, 'Steps to an Ecology of Mind' (1972)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "over-identifier",
        "stuck-in-narrative",
        "rigid-thinker",
        "label-attached",
      ],
    },
    contextTags: [
      "universal",
      "map-territory",
      "flexibility",
      "identity-freedom",
    ],
    links: [
      {
        rpplId: "rppl:principle:test-inherited-beliefs:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:response-not-circumstances:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ BIOLOGY DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:genes-not-destiny:v1",
    type: "principle",
    name: "My genes are not my destiny — my choices shape my expression",
    domain: "body",
    domains: ["identity", "meta"],
    description:
      "Your DNA sequence is fixed at conception. Your gene expression is not. Exercise upregulates anti-inflammatory genes. Chronic stress upregulates inflammatory genes. Sleep deprivation alters hundreds of expression profiles. Your daily behavioral patterns are not just building habits — they are physically rewriting which genes are active and which are silenced. Family history is a starting point, not a sentence. Epigenetics is the molecular case for the power of daily practice.",
    outputs: [
      { name: "Epigenetic awareness", portType: "state", key: "epigenetic_awareness" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:epigenetics:v1",
      "rppl:framework:terrain-theory:v1",
    ],
    axiom:
      "My genetic predispositions are context, not fate. My choices modulate which genes are expressed. Every consistent practice reshapes my biology.",
    challenges:
      "It's in my genes — I can't change it. Family history determines health destiny. Biology is fixed.",
    provenance: {
      source: "research",
      sourceTradition: "Epigenetics / gene regulation / molecular biology",
      keyReference:
        "Nessa Carey, 'The Epigenetics Revolution' (2011); exercise and gene expression research",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "family-history-concerns",
        "genetic-fatalism",
        "health-conscious",
      ],
    },
    contextTags: [
      "health",
      "agency",
      "epigenetics",
      "empowerment",
    ],
    links: [
      {
        rpplId: "rppl:principle:terrain-not-defense:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:growth-has-stages:v1",
    type: "principle",
    name: "Growth has stages — each has different rules, and none can be skipped",
    domain: "growth",
    domains: ["meta", "money"],
    description:
      "Pioneer → intermediate → mature. Starting a new habit is pioneer stage: fragile, needs protection, easily lost. Building a business is pioneer stage: hustle, improvise, move fast. The rules that work in one stage fail in another — startup energy kills a mature system, and mature-system optimization kills a startup. After disruption (job loss, breakup, health crisis), you've been reset to pioneer. Apply pioneer rules, not climax rules. Recognizing your current stage prevents applying yesterday's strategies to today's reality.",
    outputs: [
      { name: "Stage awareness", portType: "state", key: "stage_awareness" },
      { name: "Patience", portType: "state", key: "patience" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:ecological-succession:v1"],
    axiom:
      "I identify which stage of development I'm in for each domain and apply the rules appropriate to THAT stage, not the one I wish I were in.",
    challenges:
      "Growth is linear. The same strategies work at every stage. I should be further along than I am.",
    provenance: {
      source: "research",
      sourceTradition: "Ecological succession / resilience ecology / Holling",
      keyReference:
        "C.S. Holling, adaptive cycle; ecological succession theory; permaculture succession planting",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "starting-over",
        "in-transition",
        "impatient",
        "after-disruption",
      ],
    },
    contextTags: [
      "universal",
      "stages",
      "patience",
      "appropriate-strategy",
    ],
    links: [
      {
        rpplId: "rppl:principle:rhythm-universal:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:time-is-wheel:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ ECONOMICS DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:subjective-value:v1",
    type: "principle",
    name: "Value is subjective — worth is what it's worth to me",
    domain: "money",
    domains: ["meta", "purpose"],
    description:
      "Value is not inherent in objects, careers, or lifestyles — it is assigned by the individual based on their specific needs, context, and preferences. A career that society values at $300K but that empties your soul is mispriced in your personal economy. A hobby that 'wastes time' but restores your capacity is underpriced by conventional metrics. Stop letting external consensus determine what's valuable to you. Your valuation is sovereign.",
    outputs: [
      { name: "Value subjectivity awareness", portType: "state", key: "value_subjectivity" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:austrian-economics:v1",
      "rppl:framework:first-principles:v1",
    ],
    axiom:
      "I determine what's valuable to me based on my own context, not market consensus, social status, or inherited rankings.",
    challenges:
      "Value is objective — things have a 'real' worth determined by the market. Social prestige accurately measures what's valuable. My personal preferences are irrelevant compared to market signals.",
    provenance: {
      source: "research",
      sourceTradition:
        "Austrian economics (subjective value theory) / Carl Menger / First principles",
      keyReference:
        "Carl Menger, 'Principles of Economics' (1871); Ludwig von Mises, 'Human Action' (1949)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "externally-validated",
        "status-chasing",
        "career-evaluating",
        "misaligned",
      ],
    },
    contextTags: [
      "money",
      "purpose",
      "sovereignty",
      "personal-valuation",
    ],
    links: [
      {
        rpplId: "rppl:principle:money-follows-value:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:dharma-unique:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ RELATIONSHIP DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:attachment-awareness:v1",
    type: "principle",
    name: "My relational defaults were set in childhood — but they can be updated",
    domain: "people",
    domains: ["identity", "growth"],
    description:
      "Your attachment style — the way you respond under relational stress — was shaped by your earliest relationships and runs on autopilot. You don't choose to cling, withdraw, or shut down; your nervous system does it before your conscious mind catches up. But attachment patterns are not fixed. Through awareness, secure relationships, and deliberate work, your defaults can shift toward security. The first step is seeing the pattern clearly without judgment.",
    outputs: [
      { name: "Attachment awareness", portType: "state", key: "attachment_awareness" },
      { name: "Relational security", portType: "state", key: "relational_security" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:attachment-theory:v1",
      "rppl:framework:polyvagal-theory:v1",
    ],
    axiom:
      "I recognize my relational defaults as learned patterns, not character flaws. I can update them through awareness and secure connection.",
    challenges:
      "I am just the way I am in relationships. My partner is the problem. I don't have 'attachment issues.'",
    provenance: {
      source: "research",
      sourceTradition: "Attachment theory / earned security / Bowlby",
      keyReference:
        "John Bowlby, 'Attachment and Loss' (1969-1980); Amir Levine, 'Attached' (2010)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "relationship-struggles",
        "anxious-in-love",
        "avoidant",
        "repeating-patterns",
        "parent",
      ],
    },
    contextTags: [
      "relationships",
      "self-knowledge",
      "growth",
      "earned-security",
    ],
    contraindications: [
      "Attachment labels are not identities — 'I am avoidant' is map-territory confusion. You EXHIBIT avoidant patterns.",
    ],
    links: [
      {
        rpplId: "rppl:principle:shadow-controls:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:regulate-before-reason:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:cooperation-structure:v1",
    type: "principle",
    name: "Cooperation doesn't happen by wishing — it requires structure",
    domain: "people",
    domains: ["meta", "money"],
    description:
      "The prisoner's dilemma is everywhere: two people who would both benefit from cooperating each have an individual incentive to defect. Wishing for cooperation, moralizing about it, or feeling betrayed when it fails all miss the point. Cooperation is a structural problem, not a character problem. It requires: repeated interaction (so reputation matters), visible consequences (so defection costs), and forgiveness (so recovery is possible). Design for cooperation instead of hoping for it.",
    outputs: [
      { name: "Cooperation design", portType: "state", key: "cooperation_design" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:game-theory:v1",
      "rppl:framework:nvc:v1",
    ],
    axiom:
      "I design relationships and agreements for cooperation rather than hoping people will cooperate out of goodwill alone.",
    challenges:
      "Good people cooperate naturally. If someone isn't cooperating, they're a bad person. Trust should be unconditional.",
    provenance: {
      source: "research",
      sourceTradition: "Game theory / Axelrod / cooperation research",
      keyReference:
        "Robert Axelrod, 'The Evolution of Cooperation' (1984)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "partnership",
        "team-leader",
        "co-parent",
        "business-partner",
      ],
    },
    contextTags: [
      "relationships",
      "cooperation",
      "trust-building",
      "structure",
    ],
    links: [
      {
        rpplId: "rppl:principle:needs-not-judgments:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:weak-ties-matter:v1",
    type: "principle",
    name: "My next opportunity lives in my weak ties, not my close circle",
    domain: "people",
    domains: ["money", "growth"],
    description:
      "Your closest friends know what you know, see what you see, and have access to what you have access to. Novel information, unexpected opportunities, and perspective shifts almost always come through weak ties — acquaintances, friends-of-friends, people in adjacent communities. Investing ONLY in your inner circle creates an echo chamber of shared limitation. Deliberately cultivating diverse, loose connections is not superficial — it's structurally essential for growth and opportunity.",
    outputs: [
      { name: "Network awareness", portType: "state", key: "network_awareness" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    principleSource: "derived",
    derivedFrom: ["rppl:framework:network-theory:v1"],
    axiom:
      "I cultivate diverse weak ties alongside my strong ones, knowing that novelty, opportunity, and perspective come from the edges of my network.",
    challenges:
      "I only need a few close friends. Networking is fake. Quality over quantity, always.",
    provenance: {
      source: "research",
      sourceTradition: "Network theory / Granovetter / social capital",
      keyReference:
        "Mark Granovetter, 'The Strength of Weak Ties' (1973)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "socially-insular",
        "career-changing",
        "seeking-novelty",
        "echo-chambered",
      ],
    },
    contextTags: ["relationships", "opportunity", "diversity", "social-capital"],
    links: [
      {
        rpplId: "rppl:principle:diversity-resilience:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:growth-at-edges:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ BODY-MIND BRIDGE DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:regulate-before-reason:v1",
    type: "principle",
    name: "Regulate before you reason — state before strategy",
    domain: "body",
    domains: ["meta", "people"],
    description:
      "You cannot do first-principles thinking, shadow work, Socratic questioning, NVC, or any cognitive framework from a dysregulated nervous system. When your body is in fight/flight or shutdown, your prefrontal cortex goes offline. The higher cognition required by every other framework in this library requires a ventral vagal (safe, social) nervous system state. Regulation first, THEN analysis. This is the biological prerequisite that makes all the thinking frameworks actually work.",
    outputs: [
      { name: "Regulation priority", portType: "state", key: "regulation_priority" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:polyvagal-theory:v1",
      "rppl:framework:stoicism:v1",
    ],
    axiom:
      "I check my nervous system state before making important decisions, having difficult conversations, or attempting deep work. If I'm activated or shut down, I regulate first.",
    challenges:
      "Just push through. Mind over matter. Emotions are irrelevant to good decision-making. Rational people don't need to 'regulate.'",
    provenance: {
      source: "research",
      sourceTradition: "Polyvagal theory / autonomic neuroscience / Porges",
      keyReference:
        "Stephen Porges, 'The Polyvagal Theory' (2011); Deb Dana, 'Anchored' (2021)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "reactive",
        "anxious",
        "burned-out",
        "conflict-avoidant",
        "shutdown",
      ],
    },
    contextTags: [
      "universal",
      "nervous-system",
      "emotional-regulation",
      "body-mind",
      "foundational",
    ],
    links: [
      {
        rpplId: "rppl:principle:observation-before-intervention:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:attachment-awareness:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:calm-is-contagious:v1",
    type: "principle",
    name: "My nervous system state is contagious — calm is a gift, dysregulation spreads",
    domain: "people",
    domains: ["body", "home"],
    description:
      "Nervous systems regulate through other nervous systems. A calm person calms the room. An anxious person activates everyone nearby. This is not metaphor — it is mammalian co-regulation biology. Your state IS your first contribution to every interaction. Arriving regulated to a conversation, a family dinner, or a workplace is not passive — it is the highest-leverage social act available to you.",
    outputs: [
      { name: "Co-regulation awareness", portType: "state", key: "co_regulation_awareness" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:polyvagal-theory:v1",
      "rppl:framework:attachment-theory:v1",
    ],
    axiom:
      "I treat my own regulation as a contribution to everyone around me. My calm is the most valuable thing I bring to any room.",
    challenges:
      "My emotional state is my private business. Other people's anxiety is their problem. You can't 'catch' someone's mood.",
    provenance: {
      source: "research",
      sourceTradition: "Polyvagal co-regulation / attachment / social neuroscience",
      keyReference:
        "Stephen Porges (co-regulation); Deb Dana, 'Anchored' (2021)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "parent",
        "leader",
        "partner",
        "in-group-settings",
      ],
    },
    contextTags: [
      "relationships",
      "co-regulation",
      "leadership",
      "parenting",
    ],
    links: [
      {
        rpplId: "rppl:principle:regulate-before-reason:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:home-first-ecosystem:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EVOLUTIONARY CONTEXT DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:not-broken-mismatched:v1",
    type: "principle",
    name: "I'm not broken — I'm mismatched",
    domain: "identity",
    domains: ["body", "meta"],
    description:
      "Most modern struggles — anxiety, obesity, loneliness, addiction, attention deficit — are not personal failures. They are predictable consequences of evolved systems operating in mismatched conditions. Your anxiety is a functional threat-detection system in an environment full of false positives. Your sugar cravings are a functional scarcity response in an environment of artificial abundance. Understanding mismatch replaces shame with agency: you're not broken, your environment needs redesigning.",
    outputs: [
      { name: "Mismatch awareness", portType: "state", key: "mismatch_awareness" },
      { name: "Environment design", portType: "state", key: "environment_design" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:evolutionary-mismatch:v1",
      "rppl:framework:terrain-theory:v1",
    ],
    axiom:
      "Before asking 'What's wrong with me?', I ask 'What's mismatched between my biology and my environment?' — then I redesign the environment.",
    challenges:
      "If I'm struggling, it's my fault. I should be able to handle modern life. Needing to change my environment is weakness.",
    provenance: {
      source: "research",
      sourceTradition:
        "Evolutionary mismatch / evolutionary medicine / Lieberman",
      keyReference:
        "Daniel Lieberman, 'The Story of the Human Body' (2013); Deirdre Barrett, 'Supernormal Stimuli' (2010)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-blaming",
        "anxious",
        "addicted",
        "overweight",
        "lonely",
      ],
    },
    contextTags: [
      "universal",
      "self-compassion",
      "environment-design",
      "reframing",
    ],
    links: [
      {
        rpplId: "rppl:principle:design-for-bias:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:home-first-ecosystem:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ ANTIFRAGILITY DERIVED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:principle:stress-as-input:v1",
    type: "principle",
    name: "Appropriate stress is an input, not a threat",
    domain: "growth",
    domains: ["body", "meta"],
    description:
      "Your muscles grow from strain. Your immune system strengthens from exposure. Your problem-solving sharpens from difficulty. Your confidence builds from survived challenge. Overprotecting yourself — from discomfort, difficulty, failure, and friction — produces fragility, not safety. The dose makes the medicine: overwhelming stress damages, appropriate stress builds. Designing for zero-stress is designing for fragility. Designing for appropriate, chosen stress is designing for antifragility.",
    outputs: [
      { name: "Hormesis awareness", portType: "state", key: "hormesis_awareness" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:antifragility:v1",
      "rppl:framework:terrain-theory:v1",
    ],
    axiom:
      "I seek appropriate challenge rather than comfort. Difficulty is the input from which strength is built.",
    challenges:
      "Comfort is the goal. Stress is always bad. A good life is a frictionless life. Avoiding difficulty is self-care.",
    provenance: {
      source: "research",
      sourceTradition:
        "Antifragility / hormesis / Taleb / exercise physiology",
      keyReference:
        "Nassim Taleb, 'Antifragile' (2012); hormesis research; Stoic voluntary discomfort",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "comfort-seeking",
        "risk-averse",
        "overprotective-parent",
        "stagnant",
      ],
    },
    contextTags: [
      "universal",
      "antifragility",
      "hormesis",
      "growth-through-challenge",
    ],
    links: [
      {
        rpplId: "rppl:principle:growth-at-edges:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:growth-has-stages:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:principle:subtract-before-add:v1",
    type: "principle",
    name: "Remove what makes me fragile before adding what makes me strong",
    domain: "meta",
    domains: ["body", "home"],
    description:
      "Via negativa: subtraction is often more powerful than addition. Before adding a new supplement, remove the inflammatory food. Before adding a productivity system, eliminate the top 3 distractions. Before adding a new commitment, drop the one that drains you most. The things making you fragile are usually doing more damage than the things you're adding are doing good. Identify and remove the worst before optimizing the best.",
    outputs: [
      { name: "Subtraction thinking", portType: "state", key: "subtraction_thinking" },
      { name: "Resource efficiency", portType: "state", key: "resource_efficiency" },
    ],
    principleSource: "derived",
    derivedFrom: [
      "rppl:framework:antifragility:v1",
      "rppl:framework:pareto-principle:v1",
    ],
    axiom:
      "I subtract what makes me fragile before I add what might make me strong. Removal is the first and often the most powerful intervention.",
    challenges:
      "Self-improvement means adding good things. More is better. I need to DO more, not do less.",
    provenance: {
      source: "research",
      sourceTradition: "Antifragility (via negativa) / inverse Pareto / Taleb",
      keyReference:
        "Nassim Taleb, 'Antifragile' (2012, via negativa); Charlie Munger, 'invert, always invert'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "over-committed",
        "adding-without-subtracting",
        "cluttered",
      ],
    },
    contextTags: [
      "universal",
      "via-negativa",
      "simplification",
      "elimination",
    ],
    links: [
      {
        rpplId: "rppl:principle:pareto-few:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:principle:entropy-default:v1",
        relationship: "synergy",
      },
    ],
  },
];
