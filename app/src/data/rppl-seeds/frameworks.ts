import type { RpplSeed } from "./types";

// ─── Foundational Frameworks ────────────────────────────────────────────────
// Meta-level thinking tools that teach HOW to think, not what to do.
// These produce Principles, which inform Practices.
// ─────────────────────────────────────────────────────────────────────────────

export const frameworkSeeds: RpplSeed[] = [
  // ━━━ CLASSICAL THINKING TOOLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:trivium:v1",
    type: "framework",
    name: "The Trivium",
    domain: "meta",
    domains: ["growth"],
    description:
      "The three-part method of learning HOW to think, not what to think. Grammar gathers the raw facts and defines terms. Logic tests those facts for internal consistency, validity, and truth. Rhetoric applies and communicates understanding effectively. Together they form the operating system of the mind — applicable to any subject, any decision, any claim.",
    tenets: [
      "Grammar: systematically gather knowledge — define terms precisely, collect facts, understand the raw material before analyzing it",
      "Logic (Dialectic): test gathered knowledge for consistency and truth — identify contradictions, evaluate arguments, distinguish valid reasoning from fallacious",
      "Rhetoric: apply and communicate understanding — express conclusions clearly, persuade with evidence, translate knowledge into action",
      "The three arts are sequential: you cannot reason about what you haven't gathered, and you cannot apply what you haven't tested",
      "This is a method of learning, not three subjects — it applies to evaluating any claim in any domain",
    ],
    applications: [
      "Evaluating health advice: gather all claims (Grammar), test for logical consistency and check primary evidence (Logic), then decide and communicate your position (Rhetoric)",
      "Making financial decisions: define terms and gather data (Grammar), test assumptions and projections (Logic), act and explain your reasoning (Rhetoric)",
      "Navigating relationship conflict: understand what was actually said and meant (Grammar), evaluate fairness and consistency (Logic), communicate clearly (Rhetoric)",
      "Assessing any expert recommendation: separate fact from opinion, test the reasoning, then decide",
    ],
    tradition:
      "Classical liberal arts — ancient Greece (Aristotle, Plato) → Rome (Cicero, Quintilian) → medieval universities (Alcuin) → modern revival (Dorothy Sayers 'The Lost Tools of Learning', Sister Miriam Joseph 'The Trivium')",
    provenance: {
      source: "research",
      sourceTradition: "Classical liberal arts / Western trivium tradition",
      keyReference:
        "Sister Miriam Joseph, 'The Trivium: The Liberal Arts of Logic, Grammar, and Rhetoric' (1937/2002); Dorothy Sayers, 'The Lost Tools of Learning' (1947)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "critical-thinker",
        "student",
        "decision-maker",
        "information-evaluator",
      ],
    },
    contextTags: [
      "universal",
      "education",
      "critical-thinking",
      "decision-making",
    ],
    contraindications: [
      "Can become overly analytical if Logic phase is never followed by Rhetoric (action) — analysis paralysis",
      "Requires intellectual honesty — those committed to a predetermined conclusion will misapply it",
    ],
    links: [
      {
        rpplId: "rppl:framework:quadrivium:v1",
        relationship: "enables",
      },
      {
        rpplId: "rppl:framework:organon:v1",
        relationship: "contains",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:quadrivium:v1",
    type: "framework",
    name: "The Quadrivium",
    domain: "meta",
    domains: ["growth"],
    description:
      "The four-part method of understanding the structure of reality through number and proportion. Arithmetic studies pure number (discrete quantity). Geometry studies number in space (continuous quantity). Music studies number in time (ratio, harmony, proportion). Astronomy studies number in space and time (cosmological pattern and cycle). Together they reveal the mathematical order that underlies all natural phenomena.",
    tenets: [
      "Arithmetic: pure number — the foundation of quantity, pattern, and relationship (discrete)",
      "Geometry: number in space — proportion, form, structure, and spatial relationships (continuous)",
      "Music (Harmony): number in time — ratio, resonance, intervals, and the mathematics of vibration and proportion",
      "Astronomy (Cosmology): number in space AND time — cycles, celestial patterns, the grand rhythms governing natural systems",
      "Reality has mathematical structure — understanding number and proportion reveals the patterns beneath surface appearances",
    ],
    applications: [
      "Recognizing cyclical patterns in your own data — weekly rhythms, monthly cycles, seasonal variations (Astronomy applied personally)",
      "Understanding proportional relationships — the 80/20 principle, diminishing returns, optimal ratios of effort to rest (Arithmetic/Geometry)",
      "Finding harmony and rhythm in daily structure — sleep cycles, work-rest cadences, circadian alignment (Music applied to time)",
      "Seeing geometric relationships in life design — how small changes in one area create proportional effects across domains",
    ],
    tradition:
      "Pythagoras → Plato (Republic, Book VII) → Nicomachus of Gerasa → Boethius ('De Institutione Arithmetica') → Medieval universities → modern sacred geometry and mathematical philosophy",
    provenance: {
      source: "research",
      sourceTradition:
        "Pythagorean / Platonic mathematical philosophy → medieval liberal arts",
      keyReference:
        "Boethius, 'De Institutione Arithmetica'; Nicomachus of Gerasa, 'Introduction to Arithmetic'; modern: Scott Olsen, 'The Golden Section'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "pattern-seeker",
        "systems-thinker",
        "quantitative-minded",
      ],
    },
    contextTags: [
      "universal",
      "pattern-recognition",
      "mathematical-thinking",
      "cycles",
    ],
    contraindications: [
      "Can lead to pattern-matching where none exists (apophenia) if not grounded in Trivium-level critical thinking",
      "Abstract — requires concrete application to be useful in daily life",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "enables",
      },
    ],
  },

  // ━━━ SYSTEMS & DECISION FRAMEWORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:holistic-management:v1",
    type: "framework",
    name: "Holistic Management",
    domain: "meta",
    domains: ["money", "purpose", "home"],
    description:
      "Allan Savory's decision-making framework for managing complex wholes. Define what you manage (your 'whole'), articulate your holistic context (quality of life + future resource base + forms of production), then test every decision against seven questions. Originally designed for land management, it applies powerfully to life design — every major decision tested against your stated context, not reactive impulse.",
    tenets: [
      "Define your 'whole': clearly identify what you are managing — yourself, your family, your household, your enterprise. You cannot manage what you haven't defined.",
      "Create a holistic context with three parts: (1) Quality of life statement — how you want your life to feel and function, (2) Future resource base — the resources (health, relationships, skills, savings, land) that must be sustained to support that quality of life, (3) Forms of production — how you will produce what you need",
      "Test every significant decision against seven questions: (1) Root cause — does this address the root cause or just a symptom? (2) Weak link — social, biological, or financial: which is the weakest link right now? (3) Marginal reaction — which action gives the greatest return per additional unit of time, money, or effort? (4) Gross profit analysis — which enterprise or activity contributes most to overall well-being? (5) Energy/money source and use — is the energy/money coming from a source that aligns with the future resource base? (6) Sustainability — if continued, will this action sustain or degrade the future resource base? (7) Society and culture — does this decision move toward or away from the values and culture you want?",
      "Decisions are never 'right' or 'wrong' in isolation — they are only right or wrong relative to your holistic context",
      "Monitor, control, and replan: no plan survives first contact with reality. Build feedback loops.",
    ],
    applications: [
      "Career decisions: does this job/opportunity serve your holistic context — quality of life, future resource base, AND forms of production? Not just income.",
      "Health decisions: apply the weak link test — is sleep, nutrition, movement, or stress management the current weak link? Address that first.",
      "Financial decisions: marginal reaction — where does the next dollar/hour produce the most return? Sustainability — does this spending pattern sustain or degrade your resource base?",
      "Relationship decisions: society and culture test — does this relationship move toward or away from the culture you want in your life?",
    ],
    tradition:
      "Holistic Management (Allan Savory, Jody Butterfield) — originated in savanna ecology and land management, generalized to complex system management",
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management / regenerative decision-making",
      keyReference:
        "Allan Savory & Jody Butterfield, 'Holistic Management: A Commonsense Revolution to Restore Our Environment' (3rd ed., 2016)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "decision-maker",
        "land-manager",
        "entrepreneur",
        "family-steward",
        "anyone-facing-complex-decisions",
      ],
    },
    contextTags: [
      "universal",
      "decision-making",
      "systems-thinking",
      "regenerative",
    ],
    contraindications: [
      "Requires upfront work to define holistic context — not useful for trivial decisions",
      "The seven testing questions can feel heavy if applied to everything; reserve for significant decisions",
      "Originally designed for land management — life design application requires thoughtful translation",
      "Savory's specific claims about holistic grazing reversing climate change have been challenged by peer-reviewed research (Briske et al.). The DECISION-MAKING FRAMEWORK is robust; some of his ecological claims are contested. Separate the method from the advocacy.",
    ],
    links: [
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:regrarians:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:first-principles:v1",
    type: "framework",
    name: "First Principles Thinking",
    domain: "meta",
    domains: ["growth"],
    description:
      "Reasoning from fundamental truths rather than by analogy or convention. Decompose any claim, assumption, or 'the way things are done' into its base elements. Verify each independently. Rebuild understanding from verified foundations. The antidote to 'this is how it's always been done' and 'everyone does it this way.'",
    tenets: [
      "Identify your assumptions: every belief, every 'obvious truth,' every 'common sense' conclusion rests on assumptions. Name them.",
      "Decompose to fundamentals: break each assumption down to its most basic, independently verifiable components",
      "Verify each fundamental: test whether each base component is actually true — from evidence, not from authority or convention",
      "Rebuild from verified foundations: reassemble your understanding using only the components that survived verification. The conclusion may look nothing like where you started.",
      "Reasoning by analogy ('this is like that, so...') is useful for speed but dangerous for truth. First principles corrects for inherited errors in the analogy.",
    ],
    applications: [
      "Questioning dietary guidelines: 'Eat 6 small meals a day' — what is this based on? Does the foundational claim hold up? Or was it reasoning by analogy from one study?",
      "Evaluating career paths: 'You need a degree to succeed' — decompose. What does 'succeed' mean? Is the degree the actual cause, or is it correlation?",
      "Financial assumptions: 'Buy a house as soon as possible' — decompose the reasoning. Does it hold in YOUR context with YOUR numbers?",
      "Health protocols: 'Cardio is the best exercise for health' — what does 'best' mean? What does 'health' mean? What evidence exists for this specific claim?",
    ],
    tradition:
      "Aristotle ('Posterior Analytics' — reasoning from first principles / arkhai) → scientific revolution (Descartes' methodical doubt) → modern application (Charlie Munger, Elon Musk)",
    provenance: {
      source: "research",
      sourceTradition:
        "Aristotelian logic / scientific method / rational inquiry",
      keyReference:
        "Aristotle, 'Posterior Analytics'; Rene Descartes, 'Discourse on the Method' (1637); Shane Parrish, 'First Principles: The Building Blocks of True Knowledge' (Farnam Street)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "decision-maker",
        "entrepreneur",
        "critical-thinker",
      ],
    },
    contextTags: [
      "universal",
      "critical-thinking",
      "decision-making",
      "innovation",
    ],
    contraindications: [
      "Time-intensive — not practical for every small decision. Reserve for high-stakes or recurring assumptions.",
      "Can lead to nihilistic over-questioning if not balanced with action (Trivium: Rhetoric must follow Logic)",
      "Requires intellectual honesty — easy to 'first principles' your way to a conclusion you already wanted",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:permaculture:v1",
    type: "framework",
    name: "Permaculture Design Principles",
    domain: "meta",
    domains: ["home", "body", "money"],
    description:
      "David Holmgren's twelve principles for designing sustainable human systems. Originally for agriculture and land design, these principles apply directly to life design — every one describes a universal pattern for creating systems that sustain themselves and produce abundance over time rather than depleting their foundations.",
    tenets: [
      "1. Observe and interact: engage thoughtfully before intervening. Understand the system before changing it.",
      "2. Catch and store energy: capture resources (time, money, attention, knowledge) when they're abundant for use when they're scarce",
      "3. Obtain a yield: ensure every element serves a purpose — every effort should produce something tangible",
      "4. Apply self-regulation and accept feedback: build internal feedback loops. Discourage inappropriate activity before external forces do it for you.",
      "5. Use and value renewable resources and services: reduce dependence on non-renewable inputs (borrowed money, unsustainable pace, external validation)",
      "6. Produce no waste: value and make use of all available resources. 'Waste' is an output not yet matched to an input.",
      "7. Design from patterns to details: observe the big pattern first, then fill in details. Don't get lost in specifics before understanding the whole.",
      "8. Integrate rather than segregate: place elements so they support each other. Relationships between things are as important as the things themselves.",
      "9. Use small and slow solutions: small, incremental systems are easier to maintain, more resilient, and make better use of local resources",
      "10. Use and value diversity: don't over-specialize. Diverse skills, income streams, relationships, and interests create resilience.",
      "11. Use edges and value the marginal: the most productive and interesting events happen at boundaries — between disciplines, between communities, between comfort and discomfort",
      "12. Creatively use and respond to change: stability is not the absence of change. Turn inevitable changes into opportunities rather than threats.",
    ],
    applications: [
      "Principle 3 (Obtain a yield) applied to time: every meeting, every habit, every relationship should produce something. If it doesn't, redesign or remove it.",
      "Principle 8 (Integrate rather than segregate) applied to life domains: don't silo health, work, relationships. Design so they feed each other.",
      "Principle 11 (Use edges) applied to growth: seek the boundaries between what you know and don't know, between your comfort zone and the unknown — that's where growth happens.",
      "Principle 9 (Small and slow) applied to change: don't overhaul your life. Change one small thing, let it stabilize, then add the next.",
    ],
    tradition:
      "Permaculture — Bill Mollison & David Holmgren (1978, Tasmania) → global movement. Ethics: Earth care, People care, Fair share. Holmgren codified the 12 principles in 'Permaculture: Principles and Pathways Beyond Sustainability' (2002).",
    provenance: {
      source: "research",
      sourceTradition: "Permaculture / ecological design / systems ecology",
      keyReference:
        "David Holmgren, 'Permaculture: Principles and Pathways Beyond Sustainability' (2002); Bill Mollison, 'Permaculture: A Designers' Manual' (1988)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "designer",
        "homesteader",
        "systems-thinker",
        "sustainability-minded",
      ],
    },
    contextTags: [
      "universal",
      "design-thinking",
      "sustainability",
      "resilience",
    ],
    contraindications: [
      "Can romanticize slowness when urgent action is needed — 'small and slow' is a default, not an absolute",
      "Originally agricultural — life design application requires thoughtful metaphor, not forced analogy",
      "12 principles can feel overwhelming — start with the 2-3 most relevant to your current situation",
    ],
    links: [
      {
        rpplId: "rppl:framework:holistic-management:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:regrarians:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:pattern-language:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:regrarians:v1",
    type: "framework",
    name: "Regrarians Platform / Scale of Permanence",
    domain: "meta",
    domains: ["home", "money"],
    description:
      "Darren Doherty's hierarchy for developing landscapes and systems, built on P.A. Yeomans' Keyline Scale of Permanence. The core insight: address things in order of how permanent they are. Don't optimize your economy before you've addressed your water. Don't redesign your kitchen before you've fixed your sleep. Applied to life: there is a permanence hierarchy — health outlasts career, relationships outlast addresses, purpose outlasts any single job.",
    tenets: [
      "Address things in order of permanence — most permanent first, least permanent last",
      "The Regrarians scale (landscape): Climate → Geography → Water → Access → Forestry → Buildings → Fencing → Soils → Economy → Energy",
      "Applied to life design: Biology/Health → Core Relationships → Purpose/Values → Skills/Knowledge → Home/Environment → Career/Economy → Daily Habits. Don't optimize daily habits while your health foundation is broken.",
      "Each layer creates the context for the layers below it — getting a higher layer wrong undermines everything built on top of it",
      "You cannot change Climate (your fundamental biology, your era, your starting conditions) — but you can work skillfully with it rather than against it",
    ],
    applications: [
      "Life triage: when everything feels broken, start with the most permanent layer that's misaligned. Fix sleep before fixing your resume.",
      "Investment priority: invest time and money in the most permanent layers first — health maintenance costs less than health recovery",
      "Decision filtering: 'Is this a Climate-level constraint I need to accept, or a Fencing-level detail I can easily change?'",
      "Avoiding premature optimization: don't fine-tune your productivity system (Economy) while your relationships (Geography) are in crisis",
    ],
    tradition:
      "Regrarians (Darren Doherty) → Keyline Plan (P.A. Yeomans, 'The Keyline Plan' 1954) → holistic landscape design → regenerative agriculture",
    provenance: {
      source: "research",
      sourceTradition:
        "Regrarians Platform / Keyline / regenerative landscape design",
      keyReference:
        "Darren Doherty, 'Regrarians Handbook' (2013); P.A. Yeomans, 'The Keyline Plan' (1954), 'Water for Every Farm' (1973)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "land-manager",
        "homesteader",
        "life-designer",
        "overwhelmed",
      ],
    },
    contextTags: [
      "universal",
      "prioritization",
      "systems-design",
      "regenerative",
    ],
    contraindications: [
      "The specific landscape scale (Climate → Economy) doesn't map 1:1 to life — the translation requires judgment",
      "Can be used to justify inaction on lower layers ('I can't work on my career until my health is perfect') — all layers need SOME attention",
      "Permanence is relative — what's permanent in one context may not be in another",
    ],
    links: [
      {
        rpplId: "rppl:framework:holistic-management:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:pattern-language:v1",
    type: "framework",
    name: "Alexander's Pattern Language",
    domain: "meta",
    domains: ["growth", "home"],
    description:
      "Christopher Alexander's foundational insight: good design is not a single grand plan but a network of interconnected patterns at multiple scales, each solving a recurring problem in a specific context. Patterns compose — small patterns nest within larger ones, creating coherent wholes. This is the meta-framework that describes what RPPLs actually ARE: a pattern language for life.",
    tenets: [
      "A 'pattern' is a proven solution to a recurring problem in a context — it names the problem, describes the context, and offers a resolution",
      "Patterns exist at multiple scales: a doorway pattern exists within a room pattern, within a building pattern, within a neighborhood pattern. Each scale has its own patterns.",
      "Patterns compose: small patterns combine to form larger wholes. The quality of the whole emerges from the relationships between patterns, not from any single pattern alone.",
      "A 'pattern language' is a coherent collection of patterns that work together — like a vocabulary for design, where combining patterns creates meaning",
      "The 'Quality Without a Name': Alexander's term for the emergent property of well-composed patterns — alive, whole, comfortable, free, exact. You recognize it when you feel it.",
    ],
    applications: [
      "Life as pattern language: your daily patterns (morning routine, meals, movement) nest within weekly patterns (work rhythm, social rhythm) which nest within seasonal patterns which nest within life-stage patterns",
      "Debugging life problems: when something feels wrong, identify which SCALE the pattern is broken at. A broken morning routine is a different problem than a broken career direction.",
      "Composing new patterns: don't try to redesign everything at once. Add one small pattern, let it integrate with existing patterns, then add the next.",
      "Pattern recognition: once you see life as a pattern language, you start recognizing recurring problems and can apply proven solutions from other contexts",
    ],
    tradition:
      "Christopher Alexander — 'A Pattern Language' (1977), 'The Timeless Way of Building' (1979), 'The Nature of Order' (2002-2005). Extended into software (Gang of Four design patterns), urban planning, organizational design.",
    provenance: {
      source: "research",
      sourceTradition:
        "Architectural pattern theory / Christopher Alexander / design science",
      keyReference:
        "Christopher Alexander, 'A Pattern Language: Towns, Buildings, Construction' (1977); 'The Timeless Way of Building' (1979)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "designer",
        "systems-thinker",
        "software-engineer",
      ],
    },
    contextTags: ["universal", "design-thinking", "composability", "holistic"],
    contraindications: [
      "Can lead to over-systematizing life if every moment must fit a 'pattern' — leave room for spontaneity",
      "Alexander's architectural patterns don't all translate to life design — the method is universal, the specific patterns are not",
    ],
    links: [
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:quadrivium:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EPISTEMOLOGICAL FRAMEWORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:organon:v1",
    type: "framework",
    name: "The Organon — Aristotelian Logic",
    domain: "meta",
    domains: ["growth"],
    description:
      "Aristotle's system for evaluating whether an argument is valid. The original toolkit for distinguishing sound reasoning from fallacious reasoning. Categories of being, rules of syllogistic inference, and the identification of sophistical refutations (logical fallacies). Most bad advice — health, financial, relationship — contains identifiable logical errors. Recognizing them is a superpower.",
    tenets: [
      "Valid reasoning follows specific rules of inference — a conclusion follows necessarily from its premises only if the logical form is correct",
      "Syllogistic reasoning: if all A are B, and all B are C, then all A are C. Violations of this form produce fallacious conclusions that feel true but aren't.",
      "Fallacy identification: ad hominem (attacking the person, not the argument), appeal to authority, false dilemma, hasty generalization, correlation-causation confusion, straw man, equivocation — each has a specific structure you can learn to see",
      "Categories: the fundamental types of things that can be said about something — substance, quantity, quality, relation, place, time, position, state, action, affection",
      "Demonstration vs. dialectic: demonstration proves from certain premises; dialectic reasons from commonly accepted opinions. Know which you're doing.",
    ],
    applications: [
      "Evaluating health claims: 'Expert X says Y, therefore Y is true' — appeal to authority. What is the actual evidence?",
      "Detecting manipulation: advertising, political rhetoric, and social pressure rely on identifiable fallacies. Once you see the form, you can't unsee it.",
      "Strengthening your own thinking: before stating a conclusion, check your own reasoning for logical errors",
      "Arguments with others: separate the person from the argument. Attack the logic, not the speaker.",
    ],
    tradition:
      "Aristotle — 'Categories', 'On Interpretation', 'Prior Analytics', 'Posterior Analytics', 'Topics', 'Sophistical Refutations' (collectively 'The Organon', ~350 BCE). Foundation of Western logic.",
    provenance: {
      source: "research",
      sourceTradition: "Aristotelian logic / classical Western philosophy",
      keyReference:
        "Aristotle, 'The Organon' (~350 BCE); modern introductions: Irving Copi, 'Introduction to Logic'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "critical-thinker",
        "student",
        "debater",
        "information-evaluator",
      ],
    },
    contextTags: ["universal", "logic", "critical-thinking", "argumentation"],
    contraindications: [
      "Formal logic alone is insufficient — valid arguments can have false premises. You need both logic AND empirical verification (Trivium: Grammar + Logic).",
      "Can become a weapon in arguments rather than a tool for truth if used to 'win' rather than to understand",
      "Some domains (ethics, aesthetics, personal meaning) resist purely logical analysis",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "part_of",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "enables",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:socratic-method:v1",
    type: "framework",
    name: "The Socratic Method",
    domain: "meta",
    domains: ["growth", "people"],
    description:
      "Systematic questioning to expose assumptions, clarify thinking, and arrive at truth through dialogue rather than instruction. The interlocutor discovers truth through their own reasoning — they are never told what to think, but guided to see what they already know (or don't). This is the conversational engine of HUMA: guided questioning that helps the user discover what they actually think and want.",
    tenets: [
      "Begin with intellectual humility: 'I know that I know nothing' — genuine inquiry starts from acknowledging what you don't know",
      "Question definitions: 'What do you mean by X?' — most disagreements and confusions dissolve when terms are precisely defined",
      "Test with counterexamples: 'Does your definition hold in case Y?' — every claim should survive specific challenging cases",
      "Follow implications: 'If that's true, then what follows?' — trace beliefs to their logical conclusions. If the conclusions are absurd, the premise needs revision.",
      "Expose contradictions: 'You said A earlier and B now — can both be true?' — internal consistency is the minimum bar for truth",
      "The goal is not to win but to understand — Socratic dialogue succeeds when both parties learn something",
    ],
    applications: [
      "Self-examination: apply Socratic questioning to your own beliefs. 'Why do I believe this? What would I need to see to change my mind?'",
      "Helping others think: instead of giving advice, ask questions that help the other person discover their own answer",
      "Decision-making: 'What am I assuming? What would happen if I'm wrong? What's the strongest argument against this?'",
      "HUMA's conversation model: guided questioning to help users discover what they actually want, not to prescribe answers",
    ],
    tradition:
      "Socrates (as portrayed in Plato's dialogues, especially 'Meno', 'Euthyphro', 'Theaetetus', 'Republic') → Socratic tradition in philosophy and education → modern: Mortimer Adler, Matthew Lipman (Philosophy for Children)",
    provenance: {
      source: "research",
      sourceTradition:
        "Socratic / Platonic dialogical philosophy / classical education",
      keyReference:
        "Plato, dialogues (especially 'Meno', 'Euthyphro', 'Republic', ~380 BCE); Mortimer Adler, 'How to Read a Book' (1940/1972)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "educator",
        "parent",
        "coach",
        "self-examiner",
      ],
    },
    contextTags: [
      "universal",
      "dialogue",
      "self-discovery",
      "critical-thinking",
    ],
    contraindications: [
      "Can feel aggressive if used as interrogation rather than genuine inquiry — the spirit matters more than the form",
      "Requires patience — not suitable when rapid decision-making is needed",
      "Some people experience Socratic questioning as invalidating if not done with care and genuine curiosity",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:organon:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:scientific-method:v1",
    type: "framework",
    name: "The Scientific Method (Real, Not Institutional)",
    domain: "meta",
    domains: ["growth", "body"],
    description:
      "The actual method of acquiring reliable knowledge: observe, hypothesize, design an experiment, test, measure, conclude, share, and allow others to replicate or refute. Not 'trust the experts' — the method is inherently anti-authoritarian. It says 'test it yourself.' N=1 self-experimentation, properly tracked, is legitimate science. HUMA's pattern validation IS the scientific method applied to your own life.",
    tenets: [
      "Observation: notice something that needs explanation. Gather data before forming opinions.",
      "Hypothesis: propose a testable explanation — 'I think X causes Y.' This must be falsifiable.",
      "Experimentation: design a test that could prove your hypothesis WRONG. The goal is falsification, not confirmation.",
      "Measurement: track results objectively. Numbers. Dates. Specifics. Not feelings about how it went.",
      "Conclusion: what did the data actually show? Be honest even when the answer isn't what you wanted.",
      "Replication: can you or someone else repeat the experiment and get the same result? If not, the conclusion is provisional.",
      "N=1 is real science: when YOU are the subject, your data is the most relevant data. Population averages may not apply to you. Self-experimentation with honest tracking is rigorous inquiry.",
      "The method, not the institution: 'The science says X' is an appeal to authority. The method says 'test X for yourself.' These are different epistemological claims.",
    ],
    applications: [
      "Personal health optimization: adopt a pattern (hypothesis), practice it for a defined period (experiment), track specific metrics (measurement), evaluate honestly (conclusion)",
      "Diet and nutrition: 'Does intermittent fasting work for ME?' — not 'does the research say it works in general?' Test it. Track it. Decide from your data.",
      "Productivity experiments: 'Will waking up at 5am make me more productive?' — test for 30 days, track actual output, compare to baseline",
      "Pattern validation in HUMA: every RPPL adoption is a hypothesis, every practice period is an experiment, every tracked behavior is data. HUMA IS a personal science lab.",
    ],
    tradition:
      "Ancient: Aristotle (empiricism), Ibn al-Haytham (experimental method, ~1021). Modern codification: Francis Bacon ('Novum Organum' 1620), Karl Popper (falsifiability), Thomas Kuhn (paradigm shifts). N=1 tradition: Seth Roberts, Tim Ferriss, QS movement.",
    provenance: {
      source: "research",
      sourceTradition:
        "Empiricism / experimental philosophy / philosophy of science",
      keyReference:
        "Francis Bacon, 'Novum Organum' (1620); Karl Popper, 'The Logic of Scientific Discovery' (1959); modern N=1: Seth Roberts, 'The Shangri-La Diet' (self-experimentation methodology)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-experimenter",
        "health-optimizer",
        "data-driven",
      ],
    },
    contextTags: [
      "universal",
      "empiricism",
      "self-experimentation",
      "evidence-based",
    ],
    contraindications: [
      "Self-experimentation has limits — some things (medications, extreme protocols) require professional guidance",
      "N=1 results may not generalize — what works for you may not work for others (and vice versa). That's the point.",
      "Confirmation bias is the enemy: you will unconsciously seek data that confirms your hypothesis. Pre-commit to what 'success' and 'failure' look like BEFORE the experiment.",
      "Not everything meaningful is measurable — some life domains resist quantification",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "enables",
      },
    ],
  },

  // ━━━ ETHICAL / MORAL FRAMEWORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:stoicism:v1",
    type: "framework",
    name: "Stoic Philosophy",
    domain: "purpose",
    domains: ["meta", "identity", "joy"],
    description:
      "A practical philosophy for living well regardless of external circumstances. The dichotomy of control: focus all energy on what you can influence (your judgments, intentions, actions) and accept what you cannot (other people, events, outcomes). Virtue — wisdom, justice, courage, temperance — is the only true good. Everything else is 'preferred' or 'dispreferred,' not good or evil in itself.",
    tenets: [
      "Dichotomy of control: some things are within your power (your opinions, desires, aversions, actions) and some are not (your body, possessions, reputation, public office). Focus exclusively on the former.",
      "Virtue is the sole good: wisdom (understanding what is truly good), justice (giving each their due), courage (enduring what must be endured), temperance (moderation in all things). External goods are 'preferred indifferents.'",
      "Judgments, not events, cause suffering: 'It is not things that disturb us, but our judgments about things.' (Epictetus) — you can change your response to any event.",
      "Premeditatio malorum: negative visualization — regularly imagine the worst case. This reduces fear, increases gratitude, and prepares you for reality.",
      "Memento mori: remember you will die. This is not morbid — it clarifies priorities. What would you do differently if this were your last year?",
      "Morning intention, evening reflection: begin each day with purpose, end each day with honest self-assessment. What went well? Where did I fall short? What will I do differently?",
    ],
    applications: [
      "Daily structure: morning intention-setting (Marcus Aurelius' morning meditation) and evening journaling (Seneca's nightly self-examination)",
      "Emotional regulation: when upset, ask 'Is this within my control?' If yes, act. If no, redirect energy to what IS within your control.",
      "Decision-making under uncertainty: ask 'What is the worst that could happen? Can I endure that? Then proceed.'",
      "Relationship with possessions and status: practice wanting what you have rather than having what you want",
    ],
    tradition:
      "Stoic philosophy — Zeno of Citium (founder, ~300 BCE) → Cleanthes → Chrysippus → Roman Stoicism: Seneca ('Letters to Lucilius'), Epictetus ('Discourses', 'Enchiridion'), Marcus Aurelius ('Meditations'). Modern: Ryan Holiday, Massimo Pigliucci.",
    provenance: {
      source: "research",
      sourceTradition: "Stoic philosophy / Hellenistic ethics",
      keyReference:
        "Marcus Aurelius, 'Meditations' (~170 CE); Epictetus, 'Enchiridion' / 'Discourses' (~108 CE); Seneca, 'Letters to Lucilius' (~65 CE)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "anxious",
        "facing-adversity",
        "seeking-resilience",
        "leader",
      ],
    },
    contextTags: [
      "universal",
      "resilience",
      "emotional-regulation",
      "practical-philosophy",
    ],
    contraindications: [
      "Can be misused to suppress emotions rather than process them — Stoics didn't advocate emotional suppression, but rather correct judgment about emotions",
      "The 'preferred indifferents' concept can lead to detachment that feels cold or dismissive to others — balance with relational warmth",
      "Extreme Stoic practice without community can become isolation dressed up as virtue",
      "Not a substitute for addressing genuine mental health conditions that require professional support",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:non-aggression:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:non-aggression:v1",
    type: "framework",
    name: "The Non-Aggression Principle / Voluntarism",
    domain: "purpose",
    domains: ["meta", "people", "identity"],
    description:
      "The foundational ethical principle that no person has the right to initiate force, fraud, or coercion against another person or their property. All human interaction should be voluntary. This is not pacifism — it affirms the right to defend against aggression. Applied to life design, it clarifies a crucial question: are you doing what you're doing because you CHOSE it, or because someone — culture, authority, social pressure — told you to?",
    tenets: [
      "Self-ownership: you own your body, your labor, and the products of your labor. No one else has a higher claim to you than you do.",
      "Non-aggression: initiating force, fraud, or coercion against another person or their property is wrong. This applies to individuals, groups, and institutions alike.",
      "Voluntarism: all legitimate human interaction is voluntary. Consent matters. Coerced 'agreements' are not agreements.",
      "Defensive force is legitimate: the NAP prohibits INITIATING force, not responding to it. You have the right to defend yourself and your property.",
      "Personal responsibility: freedom and responsibility are inseparable. You are free to make your own choices AND you bear the full consequences of those choices.",
    ],
    applications: [
      "Self-examination: which of your habits, beliefs, and obligations are voluntary? Which are inherited compulsions or social coercion dressed up as duty?",
      "Relationships: are your relationships based on mutual voluntary choice, or on obligation, guilt, or social expectation?",
      "Work: are you trading your labor freely, or are you coerced by circumstances you haven't examined?",
      "Parenting: raising children toward autonomy — teaching them to think and choose rather than to obey without question",
      "Health: are your health choices YOUR choices, or are you complying with authority recommendations you haven't personally evaluated?",
    ],
    tradition:
      "Natural rights philosophy: John Locke ('Two Treatises of Government', 1689) → Frederic Bastiat ('The Law', 1850) → Lysander Spooner → Murray Rothbard ('The Ethics of Liberty', 1982) → modern libertarian / voluntarist thought",
    provenance: {
      source: "research",
      sourceTradition:
        "Natural rights / libertarian ethics / voluntarism",
      keyReference:
        "Murray Rothbard, 'The Ethics of Liberty' (1982); Frederic Bastiat, 'The Law' (1850); Lysander Spooner, 'No Treason' (1867-1870)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-directed",
        "liberty-minded",
        "questioning-authority",
      ],
    },
    contextTags: [
      "universal",
      "ethics",
      "self-sovereignty",
      "voluntary-exchange",
    ],
    contraindications: [
      "Can be taken to an extreme that ignores genuine interdependence and community obligation — humans are social animals with relational responsibilities",
      "The line between 'voluntary' and 'coerced' is not always clear — economic necessity, social context, and power dynamics complicate the picture",
      "Insufficient alone for a complete ethics — it tells you what NOT to do (aggress) but not what TO do (virtue, care, contribution)",
      "Children, the disabled, and those in crisis cannot fully exercise autonomy — the framework needs supplementation for dependent relationships",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "derived_from",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ BIOLOGICAL / HEALTH FRAMEWORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:terrain-theory:v1",
    type: "framework",
    name: "Terrain Theory",
    domain: "body",
    domains: ["meta"],
    description:
      "The internal environment (terrain) is the primary determinant of health, not external pathogens alone. A healthy terrain resists disease; an unhealthy terrain is vulnerable. This shifts health strategy from 'avoid and destroy pathogens' to 'build and maintain a resilient internal environment.' Presented alongside germ theory as a complementary lens — both pathogen virulence and host terrain matter — with the user's own data determining which lens serves them.",
    tenets: [
      "The terrain is primary: the state of your internal environment — gut microbiome, immune function, metabolic health, nutritional status, sleep quality, stress levels — determines your vulnerability or resilience",
      "A healthy terrain is naturally resistant: organisms that cause disease in a weakened host are often harmless in a strong one. The host matters at least as much as the pathogen.",
      "Build resilience, don't just avoid threats: the strategic emphasis shifts from sterilization and avoidance to nourishment, sleep, sunlight, movement, and stress management",
      "Both lenses have utility: germ theory accurately describes pathogen transmission. Terrain theory accurately describes host susceptibility. They answer different questions.",
      "Your data is the arbiter: when you track your terrain-building practices against health outcomes, you generate evidence for what actually works FOR YOU",
    ],
    applications: [
      "Health strategy: prioritize terrain-building (sleep, nutrition, light exposure, movement, microbiome support) as the foundation, with targeted pathogen-specific interventions when needed",
      "Nutrition: focus on nutrient density and gut health rather than calorie counting or macro ratios in isolation",
      "Immune health: build robustness through lifestyle rather than relying solely on external interventions",
      "Evaluating health advice: ask 'Does this address my terrain, or does it just target a pathogen/symptom?'",
    ],
    tradition:
      "Antoine Bechamp (pleomorphism, 'terrain is everything') → Claude Bernard ('The microbe is nothing, the terrain is everything' — attributed) → modern: microbiome science, functional medicine, integrative medicine, psychoneuroimmunology",
    provenance: {
      source: "research",
      sourceTradition:
        "Terrain theory / Bechamp / functional medicine / microbiome science",
      keyReference:
        "Antoine Bechamp, 'The Blood and Its Third Element' (1912, translated); modern synthesis: Dr. Zach Bush, Dr. Thomas Cowan; microbiome: Ed Yong, 'I Contain Multitudes' (2016)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "health-conscious",
        "self-experimenter",
        "holistic-health",
        "questioning-conventional-medicine",
      ],
    },
    contextTags: [
      "health",
      "resilience",
      "holistic-medicine",
      "self-experimentation",
    ],
    contraindications: [
      "Do NOT use terrain theory to justify ignoring acute infectious disease, refusing emergency medical treatment, or dismissing public health measures wholesale",
      "Some pathogens are virulent enough to overwhelm even healthy terrain — terrain theory is not a magic shield",
      "The Bechamp vs. Pasteur historical narrative is often oversimplified — both contributed valid observations, and modern microbiology has moved beyond the binary",
      "Terrain-building is a long-term strategy, not an acute intervention. If you're currently ill, address the immediate situation with appropriate care.",
    ],
    links: [
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:circadian-biology:v1",
    type: "framework",
    name: "Circadian Biology",
    domain: "body",
    domains: ["meta", "joy", "growth"],
    description:
      "The body is fundamentally a light-driven system. Every cell contains molecular clocks (PER, CRY, BMAL1, CLOCK genes) that synchronize to the solar cycle via light exposure, primarily through the suprachiasmatic nucleus (SCN). Disrupting this synchronization — through artificial light at night, irregular eating, shift work, or chronic indoor living — produces cascading metabolic, immune, and cognitive dysfunction. This framework underpins virtually every 'health pattern' in the RPPL library.",
    tenets: [
      "Every cell has a clock: molecular clock genes (PER1/2, CRY1/2, BMAL1, CLOCK) operate in every tissue. The SCN in the hypothalamus is the master coordinator, synchronized by light hitting the retina.",
      "Light is the primary zeitgeber (time-giver): morning sunlight (especially the blue-shifted spectrum at sunrise) sets the master clock. Evening darkness signals melatonin release. Artificial light at night disrupts this signal.",
      "Peripheral clocks follow the master: when you eat, move, and sleep all send timing signals to peripheral clocks in the liver, gut, muscles, and skin. Misalignment between the master clock and peripheral clocks is a disease state.",
      "Circadian disruption is a root cause, not a symptom: metabolic syndrome, immune suppression, mood disorders, cognitive decline, and accelerated aging are all downstream of circadian misalignment",
      "Timing matters as much as content: WHEN you eat, sleep, exercise, and get light exposure matters as much as WHAT you eat, how long you sleep, or what exercise you do",
    ],
    applications: [
      "Morning light exposure: get direct sunlight in your eyes within 30-60 minutes of waking. This is the single highest-leverage health behavior.",
      "Meal timing: time-restricted eating (8-12 hour window, aligned with daylight) allows peripheral clocks to synchronize. Late-night eating sends conflicting timing signals.",
      "Sleep architecture: consistent sleep-wake times (even weekends) maintain circadian alignment. Light hygiene after sunset (dim warm lights, blue-blocking if needed) supports melatonin onset.",
      "Exercise timing: morning or early afternoon exercise reinforces circadian rhythm. Late-night intense exercise can delay sleep onset.",
      "The foundation beneath all health patterns: virtually every RPPL health practice derives its mechanism from circadian biology",
    ],
    tradition:
      "Chronobiology research: Colin Pittendrigh (circadian pioneer), Jeffrey Hall / Michael Rosbash / Michael Young (Nobel Prize 2017, molecular clock discovery) → clinical application: Dr. Satchin Panda (time-restricted eating, 'The Circadian Code'), Dr. Andrew Huberman (light protocols), Dr. Jack Kruse (quantum biology perspective)",
    provenance: {
      source: "research",
      sourceTradition:
        "Chronobiology / circadian science / molecular clock research",
      keyReference:
        "Dr. Satchin Panda, 'The Circadian Code' (2018); Hall, Rosbash, Young (Nobel Prize in Physiology 2017); Dr. Andrew Huberman, Huberman Lab (light exposure protocols)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "health-conscious",
        "poor-sleep",
        "shift-worker",
        "indoor-worker",
        "screen-heavy",
      ],
    },
    contextTags: [
      "health",
      "sleep",
      "metabolism",
      "light-exposure",
      "foundational",
    ],
    contraindications: [
      "Shift workers face genuine constraints — circadian optimization advice must be adapted, not just prescribed. Some people cannot get morning sunlight.",
      "Circadian biology is real science, but some practitioners extrapolate beyond the evidence into speculative territory — apply scientific method to evaluate claims",
      "Perfectionism about light exposure and meal timing can create anxiety that undermines the very health benefits sought — the dose makes the poison",
      "People with SAD, bipolar disorder, or other light-sensitive conditions should work with professionals when modifying light exposure",
    ],
    links: [
      {
        rpplId: "rppl:framework:terrain-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ PHYSICS & MATHEMATICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:thermodynamics:v1",
    type: "framework",
    name: "Thermodynamics",
    domain: "meta",
    domains: ["body", "home", "money"],
    description:
      "The laws governing energy and entropy — possibly the most practically important physics for life design. The Second Law: every closed system tends toward disorder (entropy). Your health, relationships, skills, home, and finances all degrade toward chaos unless you actively input energy to maintain them. The First Law: energy is conserved — you cannot create something from nothing, and every output requires a proportional input. These are not metaphors. They are the literal physics of why daily maintenance patterns matter.",
    tenets: [
      "First Law (Conservation): energy cannot be created or destroyed, only transformed. Every output requires an input. There is no free lunch — in health, wealth, or relationships.",
      "Second Law (Entropy): every isolated system moves toward maximum disorder. Without active energy input, everything decays — muscles atrophy, skills erode, relationships drift, houses crumble, gardens revert to weeds.",
      "Entropy is the default state: order is the exception that requires constant work. This is why 'just let things be' is sometimes catastrophic advice.",
      "Energy flows from concentrated to dispersed: focus is a form of low entropy. Distraction is entropy in action. Maintaining focus requires active work against the natural tendency to diffuse.",
      "Maintenance is not optional — it is the cost of existing in an ordered state. Neglecting maintenance doesn't save energy; it accumulates entropy debt that compounds.",
    ],
    applications: [
      "Understanding why daily patterns matter: every day without maintenance is a day entropy advances. Health, skills, relationships — all require active input.",
      "Resource budgeting: you have finite energy. Every commitment is an energy allocation. Saying yes to one thing means less energy for everything else (First Law applied to attention).",
      "Recognizing entropy debt: that neglected relationship, that deferred maintenance, that skill you stopped practicing — entropy has been accumulating. The longer you wait, the more energy required to restore order.",
      "Designing for sustainability: if your life design requires more energy input than you have, the system will fail. Build systems that generate more energy than they consume.",
    ],
    tradition:
      "Carnot, Clausius, Boltzmann (classical thermodynamics, 19th century) → Prigogine (dissipative structures, far-from-equilibrium systems, Nobel 1977) → modern applications in information theory, ecology, and complex systems",
    provenance: {
      source: "research",
      sourceTradition:
        "Classical thermodynamics / statistical mechanics / complex systems",
      keyReference:
        "Rudolf Clausius (Second Law formulation, 1850); Ludwig Boltzmann (statistical interpretation); Ilya Prigogine, 'Order Out of Chaos' (1984)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "procrastinator",
        "overwhelmed",
        "neglecting-maintenance",
        "energy-management",
      ],
    },
    contextTags: [
      "universal",
      "physics",
      "maintenance",
      "energy-management",
      "entropy",
    ],
    contraindications: [
      "Entropy applies to closed systems — living systems are open and can locally decrease entropy by importing energy. Don't use thermodynamics to justify fatalism.",
      "Can be depressing if interpreted as 'everything decays no matter what' — the correct reading is 'order is achievable but requires intentional input'",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:fractal-geometry:v1",
    type: "framework",
    name: "Fractal Geometry & Self-Similarity",
    domain: "meta",
    domains: ["growth"],
    description:
      "Patterns repeat at every scale — not as metaphor but as mathematical structure. A coastline looks the same whether viewed from a satellite or with a magnifying glass. Your daily rhythm mirrors your weekly rhythm mirrors your seasonal rhythm mirrors your life arc. A dysfunctional morning produces a dysfunctional week by the same structural pattern. This is why HUMA's 'small patterns compose into life design' is mathematically real, not motivational.",
    tenets: [
      "Self-similarity: the same structural pattern appears at multiple scales. The part contains the whole in miniature.",
      "Fractals are generated by simple rules applied recursively: complex outcomes arise from simple repeated processes — small daily actions, repeated consistently, produce life-scale structures",
      "Scale invariance: the dynamics operating at the daily level are the same dynamics operating at the yearly and life-stage levels. Fix the pattern at one scale and it improves at all scales.",
      "Fractal boundaries are infinite: the edge between any two domains (work/rest, known/unknown, self/other) is infinitely complex and infinitely productive — connecting to Permaculture's edge principle",
    ],
    applications: [
      "Diagnostic power: examine your day to understand your year. If your mornings are chaotic, your life trajectory likely is too. The fractal principle says: fix the small scale and the large scale shifts.",
      "Pattern recognition: when you see the same dynamic repeating in different domains (conflict at work mirrors conflict at home), you're seeing a fractal — the root pattern lives deeper than either instance",
      "Understanding compound effects: small daily inputs generate exponential long-term results because the pattern recurses across time scales",
      "Life design as fractal design: design one excellent day and you've designed the seed pattern for an excellent life",
    ],
    tradition:
      "Benoit Mandelbrot, 'The Fractal Geometry of Nature' (1982) → complexity science → application in ecology, markets, biological systems, network theory",
    provenance: {
      source: "research",
      sourceTradition:
        "Fractal mathematics / complexity science / Mandelbrot",
      keyReference:
        "Benoit Mandelbrot, 'The Fractal Geometry of Nature' (1982); James Gleick, 'Chaos: Making a New Science' (1987)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "pattern-seeker",
        "systems-thinker",
        "detail-oriented",
      ],
    },
    contextTags: [
      "universal",
      "pattern-recognition",
      "self-similarity",
      "compound-effects",
    ],
    contraindications: [
      "Self-similarity is a tendency, not an iron law — not everything at the small scale perfectly predicts the large scale. Context matters.",
      "Can encourage over-reading patterns where noise exists — apply Trivium analysis before concluding 'this is a fractal'",
    ],
    links: [
      {
        rpplId: "rppl:framework:pattern-language:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:quadrivium:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:chaos-theory:v1",
    type: "framework",
    name: "Chaos Theory & Sensitive Dependence",
    domain: "meta",
    domains: ["growth"],
    description:
      "Small changes in initial conditions cascade into massively different outcomes. This is not randomness — chaotic systems are deterministic but unpredictable beyond short horizons. Applied to life: the night you cooked dinner instead of ordering out cascaded into better sleep, better focus, better work, a better evening. Leverage points are real because of chaos theory. HUMA tracks exactly these cascading micro-decisions.",
    tenets: [
      "Sensitive dependence on initial conditions: tiny differences in starting state produce dramatically different trajectories over time. This is mathematically proven, not speculation.",
      "Deterministic but unpredictable: chaotic systems follow rules, but those rules amplify small differences until long-term prediction becomes impossible. This is why rigid life plans fail but daily patterns succeed.",
      "Leverage points exist: in any complex system, certain variables have outsized influence. Finding the right leverage point (the one behavior that cascades into everything else) is the highest-ROI activity in life design.",
      "Strange attractors: chaotic systems orbit around patterns without ever exactly repeating. Your life has attractors — stable themes around which daily variation swirls. Change the attractor and you change the orbit.",
    ],
    applications: [
      "Leverage point identification: HUMA's core value proposition. Which single behavior change cascades into the most improvement across domains?",
      "Understanding why small changes matter: the 'butterfly effect' is real in your daily life. One good decision early in the day changes the trajectory of everything after it.",
      "Embracing unpredictability: long-term plans are less important than daily patterns because chaos ensures the plan won't survive. But patterns shape the attractor around which your life orbits.",
      "Identifying your attractors: what are the stable themes your life keeps returning to? Those are your strange attractors. Working with them (not against them) is working with chaos rather than fighting it.",
    ],
    tradition:
      "Edward Lorenz (meteorological chaos, 1963) → James Gleick ('Chaos' 1987) → complexity science, Santa Fe Institute → Donella Meadows ('Leverage Points' 1999)",
    provenance: {
      source: "research",
      sourceTradition:
        "Chaos theory / complexity science / dynamical systems",
      keyReference:
        "Edward Lorenz (sensitive dependence, 1963); James Gleick, 'Chaos: Making a New Science' (1987); Donella Meadows, 'Leverage Points: Places to Intervene in a System' (1999)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "seeking-leverage",
        "feeling-stuck",
        "overwhelmed-by-complexity",
      ],
    },
    contextTags: [
      "universal",
      "leverage-points",
      "cascading-effects",
      "complexity",
    ],
    contraindications: [
      "Chaos theory does not mean 'anything can happen' — systems have boundaries and attractors. It means precise prediction is impossible, not that patterns don't exist.",
      "Can be used to justify both action ('small things matter!') and inaction ('nothing is predictable anyway') — the correct application is: act at leverage points, don't try to control outcomes",
    ],
    links: [
      {
        rpplId: "rppl:framework:fractal-geometry:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:holistic-management:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:quantum-principles:v1",
    type: "framework",
    name: "Quantum Principles (Legitimate Subset)",
    domain: "meta",
    domains: ["growth"],
    description:
      "Three principles from quantum mechanics that legitimately apply to life design — stripped of mystical distortion. Uncertainty: you cannot know everything simultaneously, which is why data-driven validation beats assumption. Complementarity: apparently contradictory descriptions can both be true (rest AND effort, individual AND community). The observer effect: measurement changes the measured — tracking your behavior literally changes your behavior, which is a feature, not a bug.",
    tenets: [
      "Uncertainty principle (Heisenberg): fundamental limits exist on simultaneous knowledge. You cannot optimize every dimension at once. Accepting uncertainty is not weakness — it's accurate physics. This is why HUMA validates with data instead of assuming.",
      "Complementarity (Bohr): wave AND particle — both descriptions are necessary, neither is complete alone. Applied: rest AND effort are both productive. Structure AND freedom are both necessary. Individual AND community are both true. Holding complementary truths without forcing resolution is maturity.",
      "Observer effect: the act of measuring changes the system being measured. Tracking your behavior DOES change your behavior — increased awareness alters choices. This is why HUMA's tracking works even before any 'insight' is generated.",
      "BOUNDARY: 'quantum manifestation,' 'consciousness collapses reality into what you want,' and 'vibration attracts like vibration' are NOT supported by quantum mechanics. If a claim doesn't survive Trivium analysis, it doesn't belong here.",
    ],
    applications: [
      "Embracing uncertainty: stop trying to know everything before acting. Design experiments, gather data, adjust. Perfect information is physically impossible.",
      "Holding complementary truths: when two apparently contradictory approaches both seem valid, consider that both may be necessary at different times or scales (complementarity)",
      "Using the observer effect: simply tracking a behavior — even without changing anything else — alters outcomes. This is why the daily check-in works.",
      "Epistemic humility: quantum mechanics fundamentally limits what can be known. This should inform how confidently you hold any life strategy — always provisionally, always with data.",
    ],
    tradition:
      "Heisenberg (uncertainty principle, 1927), Niels Bohr (complementarity, Copenhagen interpretation), modern quantum mechanics — ONLY the experimentally verified principles, not speculative interpretations",
    provenance: {
      source: "research",
      sourceTradition:
        "Quantum mechanics / Copenhagen interpretation / philosophy of physics",
      keyReference:
        "Werner Heisenberg, 'Physics and Philosophy' (1958); Niels Bohr (complementarity lectures); Richard Feynman, 'The Character of Physical Law' (1965) — 'If you think you understand quantum mechanics, you don't understand quantum mechanics'",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "seeking-certainty",
        "binary-thinker",
        "analysis-paralysis",
      ],
    },
    contextTags: [
      "universal",
      "uncertainty",
      "complementarity",
      "epistemic-humility",
    ],
    contraindications: [
      "CRITICAL: quantum mechanics describes subatomic phenomena. Scaling quantum effects to macro life decisions requires extreme care. The principles listed here are ANALOGIES that happen to be useful, not direct physical mechanisms.",
      "Reject any 'quantum' claim that can't be stated in plain language, tested, and potentially falsified. 'Quantum' is not a magic word.",
      "This framework explicitly excludes: Law of Attraction physics claims, 'quantum consciousness' theories, 'vibration matching' pseudo-physics",
    ],
    links: [
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:information-theory:v1",
    type: "framework",
    name: "Information Theory",
    domain: "meta",
    domains: ["growth"],
    description:
      "Claude Shannon's mathematical framework for signal versus noise. Your life is full of information, most of it noise. The skill is compression: extracting the signal that actually matters from the overwhelming stream of data, news, opinions, metrics, and stimuli. This is what HUMA's daily letter does — compresses your entire life context into 5 actionable behaviors. Information theory also explains why attention is finite and must be allocated, not just spent.",
    tenets: [
      "Signal vs. noise: in any information stream, only a fraction is meaningful (signal). The rest is noise — irrelevant, redundant, or misleading. The ratio matters more than the volume.",
      "Compression: the art of representing the same essential information in fewer bits. A good summary, a good metric, a good daily plan — these are acts of compression. Lossy compression (some detail lost) is acceptable when the signal is preserved.",
      "Channel capacity: every channel (your attention, your day, your bandwidth) has a maximum throughput. Exceeding it doesn't add information — it adds noise and error.",
      "Redundancy: some repetition protects signal integrity (error correction). Daily patterns work partly because repetition reinforces the signal through noise.",
      "Entropy (information): the measure of uncertainty or surprise in a message. High-entropy inputs (unpredictable, novel) require more processing. Low-entropy inputs (routine, expected) are cheap. Design your day to front-load the high-entropy work when processing capacity is highest.",
    ],
    applications: [
      "Information diet: most news, social media, and opinion content is noise. Curate for signal. The metric is: did this input change any decision I would have made?",
      "HUMA's daily letter as compression: your entire life context, hundreds of data points, compressed into 5 actions. This is information theory applied to life design.",
      "Attention as channel capacity: you have finite processing bandwidth. Every input competes. Choose inputs that have the highest signal-to-noise ratio.",
      "Communication clarity: when you communicate, compress. State the essential. Remove the redundant. Respect the receiver's channel capacity.",
    ],
    tradition:
      "Claude Shannon, 'A Mathematical Theory of Communication' (1948, Bell Labs) → information theory, coding theory, data compression → applications in neuroscience, linguistics, ecology",
    provenance: {
      source: "research",
      sourceTradition:
        "Information theory / signal processing / Shannon",
      keyReference:
        "Claude Shannon, 'A Mathematical Theory of Communication' (1948); James Gleick, 'The Information: A History, A Theory, A Flood' (2011)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "information-overloaded",
        "doom-scroller",
        "unfocused",
        "communicator",
      ],
    },
    contextTags: [
      "universal",
      "attention",
      "signal-noise",
      "compression",
      "focus",
    ],
    contraindications: [
      "Not everything valuable is reducible to 'information' — embodied experience, emotional knowledge, and relational knowing don't compress cleanly",
      "Aggressive noise-filtering can cut you off from serendipity, diverse perspectives, and weak signals that turn out to be important",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:pareto-principle:v1",
    type: "framework",
    name: "The Pareto Principle (Power Law Distribution)",
    domain: "meta",
    domains: ["money", "growth"],
    description:
      "Not just a business heuristic — it's a mathematical distribution that appears throughout nature, economics, and human behavior. A small fraction of inputs produces a disproportionate fraction of outputs. 20% of your behaviors produce 80% of your results. 20% of your relationships provide 80% of your connection. HUMA's leverage point identification IS Pareto analysis applied to life — finding the vital few among the trivial many.",
    tenets: [
      "Power law distribution: inputs and outputs are not equally distributed. A small number of causes produce a disproportionate share of effects. This is empirically observed across domains.",
      "The vital few vs. the trivial many: in any system, a small subset of elements carries most of the load. Identifying and optimizing these elements produces outsized returns.",
      "Pareto is recursive: the 80/20 applies within the 20%. The top 4% of inputs produce ~64% of outputs. Focus sharpens exponentially.",
      "Inverse Pareto: 80% of your problems likely come from 20% of your behaviors or circumstances. Eliminating the worst few inputs may matter more than optimizing the best.",
    ],
    applications: [
      "Behavior audit: which 3-4 daily behaviors produce the most positive cascading effects across your life? Those are your Pareto behaviors. Protect them above all else.",
      "Relationship triage: which relationships provide the most support, growth, and meaning? Invest disproportionately there.",
      "Financial: which income source or skill produces the most return per unit of effort? Double down.",
      "Problem-solving: which single source of friction, if removed, would eliminate the most daily frustration? Attack that first.",
      "Inverse application: which habits, commitments, or inputs are producing the most negative effects? Eliminating these often matters more than adding positive ones.",
    ],
    tradition:
      "Vilfredo Pareto (income distribution observations, 1896) → Joseph Juran (quality management, 'vital few and trivial many') → power law mathematics → Nassim Taleb (extreme distributions)",
    provenance: {
      source: "research",
      sourceTradition:
        "Power law mathematics / Pareto / quality management / complexity science",
      keyReference:
        "Vilfredo Pareto (1896); Richard Koch, 'The 80/20 Principle' (1997); Joseph Juran (quality management application)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "optimizer",
        "time-constrained",
        "seeking-leverage",
      ],
    },
    contextTags: [
      "universal",
      "leverage",
      "prioritization",
      "optimization",
    ],
    contraindications: [
      "The exact 80/20 ratio is illustrative, not precise — the actual distribution varies. The principle is 'unequal distribution,' not 'always 80/20.'",
      "Pareto optimization can lead to neglecting the 'trivial many' that collectively matter — some 80% activities (play, exploration, serendipity) are essential for wellbeing even if not 'productive'",
      "Can justify ruthless elimination of activities/people that don't 'produce' — balance with human values",
    ],
    links: [
      {
        rpplId: "rppl:framework:holistic-management:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:chaos-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ PSYCHOLOGY & CONSCIOUSNESS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:jungian-psychology:v1",
    type: "framework",
    name: "Jungian Depth Psychology",
    domain: "identity",
    domains: ["purpose", "growth", "people"],
    description:
      "Carl Jung's framework for understanding the psyche's structure: the ego (conscious identity), the shadow (denied and repressed aspects), the persona (public mask), the anima/animus (contrasexual inner figure), and the Self (the integrating whole). Individuation — becoming who you actually are rather than who you were told to be — is the central process. HUMA already uses archetypes; Jung's deeper framework explains WHY they resonate and what the shadow costs you when unexamined.",
    tenets: [
      "The Shadow: what you deny, repress, or refuse to acknowledge in yourself doesn't disappear — it operates unconsciously, shaping your behavior, reactions, and projections. Integrating the shadow is the prerequisite for authentic living.",
      "The Persona: the social mask you present to the world. Necessary but dangerous when you mistake the mask for the self. 'I am what I present' is a confusion of persona with identity.",
      "Individuation: the lifelong process of integrating conscious and unconscious, persona and shadow, into a unified whole. Becoming who you ACTUALLY are, not who your family, culture, or society told you to be. This is HUMA's core promise in Jungian terms.",
      "Archetypes: universal patterns in the collective unconscious — the Hero, the Shadow, the Wise Old Man, the Great Mother, the Trickster. These are not cultural inventions; they are structural patterns of the psyche that appear cross-culturally.",
      "The Collective Unconscious: below personal experience lies a shared psychic substrate containing archetypal patterns. RPPLs that validate across many users in many cultures may be touching this layer.",
      "Projection: what you can't see in yourself, you see (and react to) in others. Strong emotional reactions to other people often reveal your own shadow material.",
    ],
    applications: [
      "Shadow work: when you have a disproportionate reaction to someone's behavior, ask 'What in me is being triggered?' This reveals denied aspects of self.",
      "Persona audit: which of your public behaviors are authentic expressions and which are masks? Where is there a gap between who you present and who you are?",
      "Individuation as life design: HUMA's journey from 'who was I told to be?' to 'who am I actually?' is individuation. The context model should track both persona (how you present) and emerging self (who you're becoming).",
      "Dream and symbol attention: Jung treated dreams and spontaneous imagery as communications from the unconscious. Not mystical — practical information about what your conscious mind is ignoring.",
    ],
    tradition:
      "Carl Gustav Jung — 'Collected Works' (1902-1961), especially 'Aion', 'The Archetypes and the Collective Unconscious', 'Psychology and Alchemy'. Extended by Marie-Louise von Franz, James Hillman (archetypal psychology), Robert Moore & Douglas Gillette (masculine archetypes), Clarissa Pinkola Estes ('Women Who Run With the Wolves').",
    provenance: {
      source: "research",
      sourceTradition:
        "Analytical psychology / depth psychology / Carl Jung",
      keyReference:
        "Carl Jung, 'The Archetypes and the Collective Unconscious' (CW 9/1); 'Aion' (CW 9/2); Robert Johnson, 'Owning Your Own Shadow' (1991)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-examining",
        "in-transition",
        "relationship-issues",
        "repeating-patterns",
      ],
    },
    contextTags: [
      "universal",
      "self-knowledge",
      "shadow-work",
      "individuation",
      "archetypes",
    ],
    contraindications: [
      "Shadow work can surface painful material — not a substitute for therapy when deep trauma is involved",
      "Jungian concepts can become an intellectual game ('I'm projecting my anima') without genuine emotional engagement — the work is experiential, not just conceptual",
      "Some Jungian concepts (collective unconscious, synchronicity) are not empirically testable in standard scientific frameworks — use what's useful, hold the rest lightly",
    ],
    links: [
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:flow-states:v1",
    type: "framework",
    name: "Flow States",
    domain: "joy",
    domains: ["growth", "purpose"],
    description:
      "Mihaly Csikszentmihalyi's research on optimal experience: the state where you are fully immersed, energized, and performing at your best. Flow is not random — its conditions are known and designable: clear goals, immediate feedback, and challenge matched to skill. This is a framework you can structure your day around. HUMA's daily letter could explicitly create flow conditions by setting clear goals (5 actions), providing immediate feedback (check-offs), and matching challenge to current capacity.",
    tenets: [
      "Flow conditions are known: (1) Clear goals — you know exactly what you're trying to do. (2) Immediate feedback — you know how you're doing in real time. (3) Challenge-skill balance — the task is hard enough to engage but not so hard it overwhelms.",
      "The flow channel: too much challenge relative to skill produces anxiety. Too little produces boredom. Flow exists in the narrow channel between them. As skill grows, challenge must increase to maintain flow.",
      "Autotelic experience: in flow, the activity becomes its own reward. External motivation becomes irrelevant. This is the state where discipline becomes unnecessary because engagement replaces effort.",
      "Time distortion: in flow, time perception shifts — hours feel like minutes. This is a reliable indicator that you've entered the state.",
      "Flow is trainable: you can design your environment, tasks, and daily structure to increase the frequency and duration of flow states.",
    ],
    applications: [
      "Daily design: structure your most important work to meet flow conditions — clear objective, feedback mechanism, appropriate difficulty",
      "Skill development: deliberately raise challenge as skill improves. Staying in your comfort zone kills flow.",
      "HUMA integration: the daily letter provides clear goals (5 actions). Check-offs provide immediate feedback. Pattern difficulty should match current capacity.",
      "Identifying flow activities: track when you lose track of time. Those activities reveal your natural flow channels — strong candidates for career alignment and purpose.",
    ],
    tradition:
      "Mihaly Csikszentmihalyi, 'Flow: The Psychology of Optimal Experience' (1990) → positive psychology → performance science → Steven Kotler, 'The Rise of Superman' (2014, flow in extreme sports)",
    provenance: {
      source: "research",
      sourceTradition: "Positive psychology / flow research / performance science",
      keyReference:
        "Mihaly Csikszentmihalyi, 'Flow: The Psychology of Optimal Experience' (1990); Steven Kotler, 'The Rise of Superman' (2014)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "creative",
        "knowledge-worker",
        "athlete",
        "seeking-engagement",
        "bored",
      ],
    },
    contextTags: [
      "universal",
      "optimal-experience",
      "performance",
      "engagement",
      "joy",
    ],
    contraindications: [
      "Flow can become addictive — extreme sports athletes and gamers can pursue flow at the expense of relationships, health, and balance",
      "Not all valuable work produces flow — some necessary tasks (maintenance, administration, care work) are important but not flow-inducing. Don't devalue them.",
      "Flow requires privilege: uninterrupted time, appropriate challenge, and psychological safety are not equally available to everyone",
    ],
    links: [
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:cognitive-biases:v1",
    type: "framework",
    name: "Cognitive Biases & Dual Process Theory",
    domain: "meta",
    domains: ["growth", "money"],
    description:
      "Daniel Kahneman's research demonstrating that human cognition operates in two modes: System 1 (fast, automatic, intuitive, error-prone) and System 2 (slow, deliberate, analytical, effortful). Most daily decisions run on System 1 — which is systematically biased in predictable ways. You are not a rational actor. You are a biased actor whose biases are PREDICTABLE and therefore DESIGNABLE. HUMA's job is to help you upgrade System 1 patterns using System 2 analysis — then let the improved System 1 run on autopilot.",
    tenets: [
      "System 1 (fast): automatic, effortless, associative, emotional. Runs most of your daily decisions. Subject to systematic biases. Cannot be turned off.",
      "System 2 (slow): deliberate, effortful, logical, serial. Activated for novel or complex tasks. Accurate but costly — it fatigues, and it's lazy by default.",
      "Key biases: confirmation bias (seek evidence that confirms existing beliefs), anchoring (over-weight first information received), availability heuristic (judge probability by what comes easily to mind), loss aversion (losses feel ~2x as bad as equivalent gains feel good), status quo bias (prefer the current state over change), present bias (overvalue immediate over future rewards)",
      "Biases are predictable: because the same biases operate in the same ways across people, you can DESIGN AGAINST them. Choice architecture, commitment devices, default settings, and environmental design all exploit bias predictability.",
      "You cannot think your way out of bias: knowing about biases does not eliminate them. You must design your environment and systems to account for them.",
    ],
    applications: [
      "Environment design: since System 1 runs on defaults, change the defaults. Put healthy food in front, hide junk food. Set automatic savings. Remove friction from good behaviors, add friction to bad ones.",
      "Pre-commitment: use System 2 (when it's fresh) to set up commitments that System 1 can't easily break. This is what HUMA's morning letter does — System 2 commits to 5 actions before System 1 takes over the day.",
      "Bias awareness in decisions: before major decisions, explicitly check: Am I anchored to the first option? Am I confirming what I already believe? Am I overweighting recent events?",
      "Habit formation: habits are System 1 patterns. HUMA's pattern validation IS the process of using System 2 analysis to design better System 1 defaults.",
    ],
    tradition:
      "Daniel Kahneman & Amos Tversky (Prospect Theory, 1979; heuristics and biases research program) → Kahneman, 'Thinking, Fast and Slow' (2011) → behavioral economics (Richard Thaler, Cass Sunstein, 'Nudge' 2008) → choice architecture",
    provenance: {
      source: "research",
      sourceTradition:
        "Behavioral economics / cognitive psychology / Kahneman & Tversky",
      keyReference:
        "Daniel Kahneman, 'Thinking, Fast and Slow' (2011); Kahneman & Tversky, 'Prospect Theory: An Analysis of Decision under Risk' (1979); Richard Thaler & Cass Sunstein, 'Nudge' (2008)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "decision-maker",
        "impulsive",
        "procrastinator",
        "financial-decisions",
      ],
    },
    contextTags: [
      "universal",
      "decision-making",
      "bias-awareness",
      "choice-architecture",
    ],
    contraindications: [
      "The 'replication crisis' has challenged some specific bias findings — the framework is robust but individual bias studies should be evaluated carefully",
      "Can lead to paternalism ('people are irrational, so we should design their choices for them') — the HUMA application is self-paternalism, which is different",
      "System 1 is not 'bad' — it's fast, efficient, and often correct. The goal is to improve it, not replace it.",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:maslows-hierarchy:v1",
    type: "framework",
    name: "Maslow's Hierarchy of Needs",
    domain: "meta",
    domains: ["body", "people", "purpose"],
    description:
      "Abraham Maslow's observation that human needs follow a rough hierarchy: physiological survival → safety and security → belonging and love → esteem and recognition → self-actualization. You cannot sustainably focus on purpose when you're worried about rent. You can't build deep relationships when you feel physically unsafe. This connects to Regrarians (address things in order of permanence) but applied specifically to human psychology and motivation.",
    tenets: [
      "Physiological needs come first: food, water, shelter, sleep, warmth. These are non-negotiable prerequisites. Neglecting them undermines everything above.",
      "Safety and security: physical safety, financial stability, health security, predictability. Without a baseline of safety, higher-level pursuits are anxious and unsustainable.",
      "Belonging and love: connection, intimacy, community, friendship. Humans are social animals. Isolation degrades mental and physical health regardless of other circumstances.",
      "Esteem: self-respect, competence, recognition, dignity. Both internal (I respect myself) and external (others respect me). Deficiency here produces either grandiosity or self-loathing.",
      "Self-actualization: becoming what you are capable of becoming. Purpose, creativity, meaning, full expression of potential. Only sustainably accessible when lower levels are met.",
      "The hierarchy is not rigid: people sometimes pursue higher needs while lower ones are unmet (artists starving for their work). But the general pattern holds — unmet lower needs create persistent drag.",
    ],
    applications: [
      "Life triage: when everything feels wrong, identify which level of the hierarchy is unmet. Address that first — it likely explains the dysfunction above it.",
      "Understanding motivation: if someone (including yourself) is unmotivated, check the hierarchy. They may be struggling with belonging while you're offering self-actualization opportunities.",
      "Career decisions: a job that provides good income (safety) but destroys relationships (belonging) is not a net gain — it undermines a deeper need.",
      "Connecting to Regrarians: Maslow's hierarchy IS the Regrarians scale applied to human psychology. Address in order of permanence.",
    ],
    tradition:
      "Abraham Maslow, 'A Theory of Human Motivation' (1943), 'Motivation and Personality' (1954) → humanistic psychology → positive psychology → modern: Scott Barry Kaufman, 'Transcend' (2020, updated Maslow model)",
    provenance: {
      source: "research",
      sourceTradition:
        "Humanistic psychology / motivational theory / Maslow",
      keyReference:
        "Abraham Maslow, 'Motivation and Personality' (1954); Scott Barry Kaufman, 'Transcend: The New Science of Self-Actualization' (2020)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overwhelmed",
        "stuck",
        "in-crisis",
        "seeking-purpose",
      ],
    },
    contextTags: [
      "universal",
      "needs",
      "prioritization",
      "motivation",
      "human-development",
    ],
    contraindications: [
      "The rigid pyramid model is Maslow's simplification — he later acknowledged needs can be pursued non-linearly. Use as a guideline, not a strict sequence.",
      "Cultural bias: Maslow's hierarchy reflects Western individualist values. Some cultures prioritize belonging over esteem, or community over self-actualization.",
      "Can be used to dismiss people's aspirations: 'You can't worry about meaning, you need to focus on money first' — people have the right to pursue any level regardless of circumstances",
    ],
    links: [
      {
        rpplId: "rppl:framework:regrarians:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:holistic-management:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EASTERN & INDIGENOUS WISDOM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:taoism:v1",
    type: "framework",
    name: "Taoism & Wu Wei",
    domain: "purpose",
    domains: ["meta", "joy", "body"],
    description:
      "The Tao (the Way) is the natural order of reality — the flow that governs all things. Wu Wei is not passivity but action through alignment: doing what is natural, effortless, and appropriate to the moment rather than forcing outcomes through willpower alone. The water that flows around the rock isn't weak — it shaped the Grand Canyon. This challenges the Western productivity framework: sometimes the highest-leverage action is non-action. Rest, observation, waiting for the right moment.",
    tenets: [
      "The Tao: the fundamental nature of reality cannot be fully named or grasped conceptually. It can be aligned with through attention, not captured through analysis alone.",
      "Wu Wei (non-action / effortless action): not inaction, but action that arises naturally from alignment with conditions. Like water flowing downhill — it doesn't try, it doesn't force, and it's unstoppable.",
      "The usefulness of emptiness: 'We shape clay into a pot, but it is the emptiness inside that holds what we want.' Space, rest, silence, and fallow periods are not absences — they are functional. The Tao Te Ching treats emptiness as essential, not deficient.",
      "Yin and Yang: complementary opposites that generate each other. Not opposition but partnership — activity generates rest, rest generates activity. Neither is superior.",
      "The soft overcomes the hard: 'Water is the softest thing, yet it can penetrate mountains and earth.' Persistence, flexibility, and yielding are often more powerful than force.",
      "Simplicity (Pu): the uncarved block. Before social conditioning and accumulated complexity, there is a natural simplicity. Returning to it (not regressing, but integrating) is wisdom.",
    ],
    applications: [
      "Recognizing when to NOT act: not every problem requires immediate intervention. Sometimes the most powerful response is observation, patience, or strategic withdrawal.",
      "Flow alignment: instead of forcing a rigid schedule, notice your natural energy rhythms and design with them. Wu Wei in daily life means reducing friction, not increasing willpower.",
      "Emptiness as design: schedule unstructured time. Not every moment needs to be optimized. The 'empty' time is often where insight, creativity, and integration happen.",
      "Softness as strategy: in conflict, relationships, and problem-solving, yielding intelligently often achieves what forcing cannot.",
    ],
    tradition:
      "Lao Tzu, 'Tao Te Ching' (~6th century BCE); Zhuangzi, 'Zhuangzi' (~4th century BCE); Taoist philosophy and practice. Influenced: Chan/Zen Buddhism, martial arts (Tai Chi, Aikido), traditional Chinese medicine.",
    provenance: {
      source: "research",
      sourceTradition: "Taoism / Chinese philosophy / Lao Tzu / Zhuangzi",
      keyReference:
        "Lao Tzu, 'Tao Te Ching' (Stephen Mitchell translation recommended, 1988); Zhuangzi, 'The Complete Works' (Burton Watson translation, 1968)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "overachiever",
        "burned-out",
        "control-oriented",
        "seeking-ease",
      ],
    },
    contextTags: [
      "universal",
      "alignment",
      "non-forcing",
      "natural-rhythm",
      "simplicity",
    ],
    contraindications: [
      "Wu Wei can be misused to justify passivity and avoidance — 'I'm not lazy, I'm practicing non-action.' Genuine Wu Wei requires skill, attention, and engagement.",
      "Western interpretations often romanticize Taoism and strip it of its cultural context. Use the principles, respect the tradition.",
      "Some situations (emergencies, injustice, time-sensitive decisions) require decisive action, not non-action",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:vedic-dharma-karma:v1",
    type: "framework",
    name: "Vedic Framework — Dharma & Karma",
    domain: "purpose",
    domains: ["meta", "identity"],
    description:
      "Not the popular misunderstanding ('karma will get you'). Dharma: your unique purpose — the thing only you can do, your particular contribution to the whole. Karma: action and consequence — every action creates results, and the accumulated results of past actions shape your present conditions. This is another lens on Natural Law's cause and effect, but with the critical addition of dharma — the idea that you have a specific, unique purpose that no one else can fulfill.",
    tenets: [
      "Dharma (righteous duty / unique purpose): each person has a specific nature and a specific contribution to make. Living in alignment with your dharma produces fulfillment; living against it produces suffering, regardless of material success.",
      "Karma (action and consequence): not cosmic punishment or reward, but the straightforward principle that every action has consequences that shape future conditions. Your present life is partly the accumulated consequence of past actions. Your future life will be shaped by what you do now.",
      "Svadharma (one's own dharma): 'Better is one's own dharma, though imperfectly performed, than the dharma of another well performed.' (Bhagavad Gita 3.35) — doing your own thing badly is better than doing someone else's thing well. This is the antidote to comparison.",
      "Karma Yoga (action without attachment to results): act according to dharma, then release attachment to the outcome. This is not apathy — it's doing your best and then accepting whatever follows.",
      "The Gunas (qualities of nature): Sattva (clarity, harmony), Rajas (activity, passion, agitation), Tamas (inertia, darkness, dullness). Your daily choices move you toward one guna or another. Self-awareness means recognizing which guna is dominant and adjusting.",
    ],
    applications: [
      "Dharma discovery: HUMA's individuation process — uncovering what you're uniquely suited for rather than following convention",
      "Karma literacy: tracing the causal chains between past choices and present conditions. Not blame — agency. If you can see the chain, you can change the inputs.",
      "Svadharma vs comparison: when tempted to compare your path to others', remember — their dharma is not yours. Comparison is literally comparing different purposes.",
      "Guna awareness: am I operating from clarity (sattva), agitation (rajas), or inertia (tamas) right now? This simple check reframes your current state as a modifiable quality, not a fixed identity.",
    ],
    tradition:
      "Vedic philosophy — 'Bhagavad Gita' (~500 BCE-200 CE), Upanishads, Yoga Sutras of Patanjali. Core concepts in Hinduism, Buddhism (karma), Jainism. Modern: Ram Dass, Eknath Easwaran (translator).",
    provenance: {
      source: "research",
      sourceTradition:
        "Vedic philosophy / Bhagavad Gita / Hindu-Buddhist-Jain traditions",
      keyReference:
        "Bhagavad Gita (Eknath Easwaran translation recommended, 1985); Patanjali, 'Yoga Sutras'; modern: Ram Dass, 'Be Here Now' (1971)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "seeking-purpose",
        "comparing-to-others",
        "spiritually-curious",
        "in-transition",
      ],
    },
    contextTags: [
      "universal",
      "purpose",
      "personal-duty",
      "consequence",
      "unique-path",
    ],
    contraindications: [
      "Dharma can be used to justify rigid social stratification (caste) — the HUMA application focuses on personal dharma (svadharma), not social role assignment",
      "Karma can become self-blame: 'I deserve my suffering because of past actions.' The application is forward-looking agency, not backward-looking guilt.",
      "Western appropriation often strips these concepts of their philosophical depth and reduces them to self-help slogans. Engage with the source texts seriously.",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:jungian-psychology:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:cyclical-time:v1",
    type: "framework",
    name: "Indigenous Cyclical Time",
    domain: "meta",
    domains: ["joy", "body", "purpose"],
    description:
      "Time as circular, not linear. Seasons return. Life stages cycle. Growth and decay are partners, not enemies. Western culture treats time as an arrow — progress, growth, forward, never back. Indigenous frameworks across cultures recognize the wheel: planting follows harvesting follows fallow follows planting. This is foundational to HUMA's seasonal rhythm concept and directly challenges the 'linear graduation' model (0→100 score) that contradicts biological and ecological reality.",
    tenets: [
      "Time is a wheel, not an arrow: seasons return, life stages recur, themes revisit at deeper levels. 'Progress' is not linear advancement but deepening spiral.",
      "The Great Cycles: many indigenous traditions recognize nested cycles — daily (sunrise/sunset), monthly (lunar), seasonal (solar), generational, and cosmic. Living well means aligning with the appropriate cycle for each activity.",
      "Fallow periods are productive: a field left fallow is not wasted — it is rebuilding soil. A person in rest is not idle — they are integrating. Western 'productivity' culture has forgotten this.",
      "Death feeds life: decay, endings, and release are not failures — they are the composting process that feeds the next cycle. Letting go is as important as holding on.",
      "Place-based time: different environments have different rhythms. Tropical cycles differ from temperate. Urban rhythms differ from rural. Aligning with your specific environment's cycles is more accurate than following a universal calendar.",
    ],
    applications: [
      "Seasonal living: plan your year in cycles, not sprints. Winter for reflection and planning, spring for initiating, summer for maximum output, autumn for harvesting and completing.",
      "Challenging linear metrics: HUMA should not track 'progress' as a one-way score. A validation score that rises and falls with seasons is HEALTHY, not failing.",
      "Honoring endings: when a project, relationship, or life stage completes, practice letting go rather than immediately starting the next thing. The fallow period IS the next step.",
      "Recognizing returning themes: when an old pattern or challenge reappears, it's not regression — it's the spiral. You're meeting it at a deeper level with more capacity.",
    ],
    tradition:
      "Cross-cultural indigenous wisdom: Aboriginal Australian Dreamtime (cyclical creation), Lakota Medicine Wheel, Mesoamerican calendar systems (Mayan Long Count), Celtic Wheel of the Year, Hindu Yugas, Buddhist Wheel of Dharma. Modern synthesis: Tyson Yunkaporta, 'Sand Talk' (2019).",
    provenance: {
      source: "research",
      sourceTradition:
        "Indigenous knowledge systems / cyclical cosmology / cross-cultural wisdom traditions",
      keyReference:
        "Tyson Yunkaporta, 'Sand Talk: How Indigenous Thinking Can Save the World' (2019); Robin Wall Kimmerer, 'Braiding Sweetgrass' (2013); various indigenous oral traditions",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "linear-thinker",
        "burned-out",
        "seasonal-affective",
        "transition",
      ],
    },
    contextTags: [
      "universal",
      "cycles",
      "seasonal-living",
      "rest",
      "deep-time",
    ],
    contraindications: [
      "Romanticizing indigenous time while ignoring the genuine benefits of linear planning (deadlines, milestones, accountability) is unhelpful. Both modes have their place.",
      "Non-indigenous people should engage with these concepts respectfully and acknowledge their sources rather than claiming them as novel discoveries",
      "Cyclical time doesn't mean nothing changes — each cycle can deepen or degrade. The spiral goes both directions.",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ COMMUNICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:nvc:v1",
    type: "framework",
    name: "Nonviolent Communication",
    domain: "people",
    domains: ["meta", "identity"],
    description:
      "Marshall Rosenberg's complete framework for communication without coercion, manipulation, or guilt. Four components: (1) observation vs. evaluation, (2) feelings vs. thoughts, (3) needs vs. strategies, (4) requests vs. demands. This is a framework, not a practice — it produces hundreds of specific practices for every relationship conversation. It changes how you hear others and how you express yourself.",
    tenets: [
      "Observation vs. evaluation: separate what actually happened ('You arrived at 9:15') from your judgment about it ('You're always late'). Evaluations trigger defensiveness. Observations create space for dialogue.",
      "Feelings vs. thoughts: 'I feel angry' is a feeling. 'I feel like you don't care' is a thought disguised as a feeling. Identify the actual emotion, not the story about the other person.",
      "Needs vs. strategies: beneath every feeling is a need (safety, autonomy, connection, meaning, rest). Needs are universal. Strategies for meeting needs are specific and negotiable. Fighting over strategies when you share the same need is the core of most conflict.",
      "Requests vs. demands: a request leaves the other person free to say no without punishment. A demand disguised as a request ('Would you mind...or else') is still coercion. Genuine requests can be declined.",
      "Empathic listening: before expressing yourself, seek to understand the other person's observation, feeling, need, and request. Most people have never felt truly heard.",
    ],
    applications: [
      "Conflict resolution: translate blame into observations, feelings, and needs. 'You never help' becomes 'When I see dishes in the sink for three days, I feel exhausted because I need shared responsibility.'",
      "Self-connection: use NVC internally. 'I'm such a failure' becomes 'I notice I didn't finish the report. I feel anxious because I need competence and reliability.'",
      "Parenting: distinguish between controlling behavior and meeting needs. Children have the same universal needs as adults — expressed differently.",
      "HUMA application: the conversation engine can model NVC structure — helping users identify their actual needs beneath their stated goals",
    ],
    tradition:
      "Marshall Rosenberg, 'Nonviolent Communication: A Language of Life' (1st ed. 1999, 3rd ed. 2015). Influenced by Carl Rogers (humanistic psychology), Mahatma Gandhi (nonviolence), and Martin Buber (I-Thou dialogue).",
    provenance: {
      source: "research",
      sourceTradition:
        "Nonviolent Communication / humanistic psychology / Rosenberg",
      keyReference:
        "Marshall Rosenberg, 'Nonviolent Communication: A Language of Life' (3rd ed., 2015)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "in-conflict",
        "parent",
        "partner",
        "leader",
        "communicator",
      ],
    },
    contextTags: [
      "universal",
      "communication",
      "relationships",
      "conflict-resolution",
      "empathy",
    ],
    contraindications: [
      "NVC can sound formulaic and inauthentic if applied mechanically ('When you... I feel... because I need... would you...'). The spirit matters more than the formula.",
      "In situations involving genuine abuse or power imbalance, NVC's emphasis on empathy for both parties can be inappropriate — safety comes first",
      "Some cultures communicate in ways that NVC would label as 'violent' but are contextually appropriate. Cultural sensitivity is required.",
    ],
    links: [
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:non-aggression:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EPISTEMOLOGY (EXPANDED) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:general-semantics:v1",
    type: "framework",
    name: "General Semantics",
    domain: "meta",
    domains: ["growth", "identity"],
    description:
      "Alfred Korzybski's foundational insight: 'The map is not the territory.' Your mental model of reality is not reality. Your context model in HUMA is not your life — it's a map. People confuse their story about their life with their actual life. The word is not the thing. 'I'm a failure' is a map, not territory. This framework trains the critical distinction between the thing itself and your representation of it — the single most important epistemological skill.",
    tenets: [
      "'The map is not the territory': every description, model, label, and category is an abstraction — a map. Reality (the territory) is always richer, more complex, and more nuanced than any map of it.",
      "'The word is not the thing': language shapes perception. When you label yourself ('I'm lazy'), you confuse a description with a reality. The description is a map; you are the territory.",
      "Abstracting in levels: humans abstract from reality in layers — from sensory experience to description to categorization to generalization. Each level loses information. Awareness of which level you're operating at prevents confusion.",
      "Indexing: 'failure₁ is not failure₂' — each instance is unique. Your failure at one specific task is not the same as 'being a failure.' General Semantics teaches you to index (specify) rather than generalize.",
      "Extensional orientation: prioritize direct experience (territory) over verbal descriptions (map). Check your abstractions against reality regularly.",
    ],
    applications: [
      "Identity liberation: 'I am X' confuses map with territory. You BEHAVED in a certain way (territory). 'I am' is a map. You can change behavior; you can't change 'who you are' if you've fused identity with a label.",
      "HUMA's context model: the context model IS a map. It should be treated as a useful approximation, not as the user's actual life. Regularly check the map against the territory (data vs. lived experience).",
      "Reducing reactivity: when you react strongly to a word or label, you're reacting to the map, not the territory. Pausing to distinguish map from territory reduces unnecessary emotional activation.",
      "Communication clarity: when people disagree, they often agree about the territory but disagree about maps. Checking 'what specifically do you mean?' resolves most disputes.",
    ],
    tradition:
      "Alfred Korzybski, 'Science and Sanity' (1933) → Institute of General Semantics → influenced: Gregory Bateson (ecology of mind), Robert Anton Wilson ('Prometheus Rising'), NLP (derived partially from General Semantics), cognitive-behavioral therapy (the thought is not the reality)",
    provenance: {
      source: "research",
      sourceTradition:
        "General Semantics / Korzybski / philosophy of language",
      keyReference:
        "Alfred Korzybski, 'Science and Sanity' (1933); S.I. Hayakawa, 'Language in Thought and Action' (1949, more accessible introduction)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "over-identifier",
        "rigid-thinker",
        "reactive",
        "label-attached",
      ],
    },
    contextTags: [
      "universal",
      "epistemology",
      "language-awareness",
      "map-territory",
    ],
    contraindications: [
      "Taken to an extreme ('nothing is real, everything is just a map'), General Semantics can become solipsistic or nihilistic. Maps are useful — the point is to not confuse them with territory, not to abandon them.",
      "Some of Korzybski's original work is dense and dated. Modern introductions (Hayakawa) are more accessible.",
    ],
    links: [
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:socratic-method:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ BIOLOGY (EXPANDED) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:epigenetics:v1",
    type: "framework",
    name: "Epigenetics",
    domain: "body",
    domains: ["meta", "identity"],
    description:
      "Your genes are not your destiny. Epigenetics — the study of changes in gene expression that don't alter the DNA sequence itself — demonstrates that your environment, behavior, nutrition, stress, and choices change WHICH genes are expressed and which are silenced. You are not trapped by your genetics. Your daily patterns literally rewrite your gene expression profile. This is scientifically established and profoundly empowering.",
    tenets: [
      "Gene expression is modifiable: DNA methylation, histone modification, and non-coding RNA regulate which genes are active. These are influenced by environment, diet, stress, sleep, exercise, and toxin exposure.",
      "Your choices shape your biology: exercise upregulates genes for mitochondrial biogenesis, anti-inflammatory pathways, and neuroplasticity. Chronic stress upregulates inflammatory genes. Sleep deprivation alters hundreds of gene expression profiles.",
      "Transgenerational inheritance: some epigenetic changes can be passed to offspring. Your grandparents' nutrition, stress, and environmental exposures may have shaped your gene expression. This is not determinism — it's context.",
      "Plasticity, not fixedness: the epigenome is dynamic. Unlike DNA sequence (fixed at conception), gene expression patterns can change throughout life in response to changed conditions. You can turn favorable genes ON and unfavorable genes OFF through sustained behavioral change.",
    ],
    applications: [
      "Empowerment: 'It's in my genes' is rarely a complete explanation. Your gene expression is a conversation between your genome and your environment — and you control much of the environment.",
      "Long-term motivation: the behavioral patterns you practice aren't just building habits — they're physically reshaping your gene expression. The molecular case for consistency.",
      "Health resilience: even with genetic predispositions, epigenetic modulation through lifestyle can significantly alter risk. Family history is a starting point, not a sentence.",
      "HUMA application: pattern data combined with health outcomes can reveal which behaviors are modulating which aspects of the user's biology — N=1 epigenetic optimization.",
    ],
    tradition:
      "Conrad Waddington (coined 'epigenetics', 1942) → Human Epigenome Project → modern: Moshe Szyf, Michael Meaney (stress and epigenetics), Nessa Carey ('The Epigenetics Revolution')",
    provenance: {
      source: "research",
      sourceTradition:
        "Molecular biology / epigenetics / gene regulation research",
      keyReference:
        "Nessa Carey, 'The Epigenetics Revolution' (2011); Richard Francis, 'Epigenetics: How Environment Shapes Our Genes' (2011)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "genetic-concerns",
        "family-history",
        "health-conscious",
        "seeking-agency",
      ],
    },
    contextTags: [
      "health",
      "biology",
      "gene-expression",
      "empowerment",
      "plasticity",
    ],
    contraindications: [
      "Epigenetic plasticity is real but not unlimited — some genetic conditions have strong penetrance regardless of lifestyle. Don't blame people for genetic diseases.",
      "The field is young and some claims are ahead of the evidence. Apply scientific method: what is established vs. what is speculative?",
      "Transgenerational epigenetic inheritance in humans is still being established — most robust evidence is from animal models",
    ],
    links: [
      {
        rpplId: "rppl:framework:terrain-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:scientific-method:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:ecological-succession:v1",
    type: "framework",
    name: "Ecological Succession",
    domain: "growth",
    domains: ["meta", "money"],
    description:
      "Ecosystems develop through predictable stages: bare ground → pioneer species (fast, fragile, opportunistic) → intermediate communities (more diverse, more resilient) → climax ecosystem (complex, stable, self-sustaining). Each stage has different rules, different species, and different strategies. You cannot skip stages. Applied to life: starting a new habit, building a business, entering a relationship, developing a skill — all follow succession. The rules that work in the pioneer stage fail in the climax stage, and vice versa.",
    tenets: [
      "Stages are sequential: pioneer → intermediate → climax. Each creates the conditions for the next. Pioneer species change the environment (build soil, provide shade) so that intermediate species can establish.",
      "Each stage has different rules: pioneer species are fast-growing, sun-loving opportunists. Climax species are slow-growing, shade-tolerant specialists. The strategies that succeed at each stage are fundamentally different.",
      "You cannot skip stages: attempting to plant climax species on bare ground fails. They need the soil, shade, and microbial community that only earlier stages can build.",
      "Disturbance resets succession: fire, flood, upheaval — these return the system to an earlier stage. Not destruction but renewal. The new succession on the burned ground follows the same sequence but may produce a different (and sometimes richer) outcome.",
      "Climax is not permanent: even 'climax' ecosystems are dynamic. They maintain themselves through ongoing small disturbances and internal renewal — not stasis.",
    ],
    applications: [
      "New habits (pioneer stage): fragile, need protection, require extra energy input, easily lost. Don't expect climax-stage stability from a new pattern.",
      "Business development: startup rules (hustle, improvise, move fast) differ fundamentally from mature business rules (systematize, delegate, optimize). Applying climax strategies to a pioneer venture kills it.",
      "Relationships: new relationships need different care than established ones. Trying to skip the getting-to-know-you stage produces instability.",
      "After disruption: job loss, breakup, health crisis — you've been reset to pioneer stage. Apply pioneer strategies (fast, flexible, experimental) not climax strategies (optimize, specialize).",
      "Recognizing your current stage: for any life domain, ask 'What stage of succession am I in?' and apply the rules appropriate to that stage.",
    ],
    tradition:
      "Frederic Clements (climax theory, 1916) → Henry Gleason (individualistic concept) → modern: complex adaptive systems, resilience ecology (C.S. Holling, adaptive cycle) → Regrarians and permaculture application",
    provenance: {
      source: "research",
      sourceTradition:
        "Ecology / succession theory / resilience science",
      keyReference:
        "C.S. Holling, 'Resilience and Stability of Ecological Systems' (1973); Lance Gunderson & C.S. Holling, 'Panarchy' (2002); permaculture succession planting",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "starting-over",
        "impatient",
        "in-transition",
        "entrepreneur",
        "after-disruption",
      ],
    },
    contextTags: [
      "universal",
      "stages",
      "patience",
      "development",
      "resilience",
    ],
    contraindications: [
      "The ecological metaphor is useful but not exact — human systems have agency that ecosystems don't. You can sometimes accelerate succession through deliberate action.",
      "Can be used to justify patience when action is needed — 'I'm just in the pioneer stage' can become an excuse for staying small",
      "Climax communities in ecology are debated — some ecologists argue all communities are always in transition. Use the model as a useful approximation.",
    ],
    links: [
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:regrarians:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:cyclical-time:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:biomimicry:v1",
    type: "framework",
    name: "Biomimicry",
    domain: "meta",
    domains: ["home", "growth"],
    description:
      "Nature has 3.8 billion years of R&D. Every design problem you face — time management, resilience, energy efficiency, communication, waste processing, structural integrity — has been solved repeatedly in biological systems. Biomimicry is the practice of looking to nature's solutions as models for human design challenges. Not metaphor — direct functional analogy. How does a forest manage energy? How does a coral reef build resilience? How does a mycelial network distribute resources? These answers apply to your life.",
    tenets: [
      "Nature as model: biological organisms and ecosystems have solved the same fundamental problems (energy management, waste, resilience, communication, adaptation) through billions of years of selection. These solutions are tested at scale.",
      "Nature as measure: what survives in nature is what works sustainably. If your life design can't sustain itself without constant heroic effort, it's a design problem — nature doesn't require heroism to function.",
      "Nature as mentor: not what you can extract FROM nature, but what you can LEARN from nature. The relationship is student-teacher, not consumer-resource.",
      "Life creates conditions conducive to life: sustainable biological systems don't just sustain themselves — they create conditions that support MORE life around them. This is the regenerative standard: does your activity leave conditions better than you found them?",
    ],
    applications: [
      "Resilience design: how do ecosystems survive disruption? Diversity, redundancy, modularity, and adaptive capacity. Apply these to your income, skills, and relationships.",
      "Energy management: ecosystems run on current solar income, not stored capital. Your daily energy should primarily come from sustainable sources (sleep, nutrition, sunlight) not from stimulants and adrenaline (stored capital depletion).",
      "Waste as resource: in nature, one organism's waste is another's food. In life design: can your failures, mistakes, and 'wasted' experiences be composted into learning?",
      "Network intelligence: mycelial networks distribute resources to where they're needed most without central planning. Your social network can function the same way — if designed for mutual support rather than extraction.",
    ],
    tradition:
      "Janine Benyus, 'Biomimicry: Innovation Inspired by Nature' (1997) → Biomimicry Institute → industrial application (Velcro, bullet train nose, self-cleaning surfaces) → regenerative design movement",
    provenance: {
      source: "research",
      sourceTradition:
        "Biomimicry / ecological design / regenerative thinking",
      keyReference:
        "Janine Benyus, 'Biomimicry: Innovation Inspired by Nature' (1997); Biomimicry Institute (asknature.org)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "designer",
        "systems-thinker",
        "nature-connected",
        "sustainability-minded",
      ],
    },
    contextTags: [
      "universal",
      "design",
      "sustainability",
      "regenerative",
      "nature-wisdom",
    ],
    contraindications: [
      "The naturalistic fallacy: 'natural' does not mean 'good for humans.' Nature includes parasitism, predation, and disease. Biomimicry selects principles, not everything.",
      "Analogies between biological and human systems can be stretched too far. Use as inspiration and hypothesis, then test (scientific method).",
    ],
    links: [
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:ecological-succession:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ ECONOMICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:austrian-economics:v1",
    type: "framework",
    name: "Austrian Economics",
    domain: "money",
    domains: ["meta", "purpose"],
    description:
      "The Austrian school's core insights applied to life design: subjective value (things are worth what they're worth TO YOU, not what 'the market' or society says), time preference (how much you value the future relative to the present shapes every decision), and spontaneous order (complex systems self-organize through individual action without central planning). These challenge mainstream economics that treats humans as rational calculators responding to objective value.",
    tenets: [
      "Subjective value: value is not inherent in objects — it is assigned by the individual based on their specific needs, context, and preferences. A glass of water is worth almost nothing to someone near a river and almost everything to someone in a desert. You decide what things are worth to YOU.",
      "Time preference: every choice involves a trade-off between present and future satisfaction. Low time preference (willingness to delay gratification for better future outcomes) is the foundation of capital accumulation, skill development, and health. High time preference (immediate gratification) depletes resources.",
      "Spontaneous order: complex, functional order emerges from individual actions without central planning. Markets, language, culture, and social norms all self-organize. Your life doesn't need a master plan — it needs good local decision-making based on clear principles.",
      "Opportunity cost: every choice has a cost — the value of the next-best alternative you gave up. There is no 'free.' Every yes is a no to something else.",
      "Entrepreneurial discovery: value is not calculated, it is discovered through action. You don't find your purpose by thinking about it — you find it by trying things and paying attention to what produces genuine value.",
    ],
    applications: [
      "Personal valuation: stop letting 'the market' or social consensus determine what's valuable to you. A career that society values but you don't is mispriced in your personal economy.",
      "Time preference management: the single best predictor of long-term life outcomes. Train yourself to lower time preference — invest in future health, skills, and relationships even when present gratification is available.",
      "Opportunity cost awareness: every hour spent on social media has an opportunity cost. Every dollar spent has a dollar not invested. Make the trade-offs explicit rather than invisible.",
      "Spontaneous order in life design: you don't need a 5-year plan. You need clear principles and good daily decisions. Order emerges from consistent local optimization.",
    ],
    tradition:
      "Carl Menger ('Principles of Economics' 1871, subjective value) → Eugen von Bohm-Bawerk (time preference, capital theory) → Ludwig von Mises ('Human Action' 1949) → F.A. Hayek (spontaneous order, knowledge problem, Nobel 1974) → Murray Rothbard → modern: Saifedean Ammous",
    provenance: {
      source: "research",
      sourceTradition:
        "Austrian school of economics / Menger / Mises / Hayek",
      keyReference:
        "Ludwig von Mises, 'Human Action' (1949); F.A. Hayek, 'The Use of Knowledge in Society' (1945); Saifedean Ammous, 'The Fiat Standard' (2021)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "financially-minded",
        "entrepreneur",
        "saver",
        "decision-maker",
      ],
    },
    contextTags: [
      "money",
      "decision-making",
      "value-theory",
      "time-preference",
    ],
    contraindications: [
      "Austrian economics rejects mathematical modeling and empirical testing in some interpretations — which contradicts the scientific method framework. Use the insights, but test them.",
      "The emphasis on individual choice can underestimate structural constraints (poverty, discrimination, disability) that limit real choice",
      "Spontaneous order is not automatic — it requires functional institutions, trust, and shared norms to emerge. It's not an argument against all coordination.",
    ],
    links: [
      {
        rpplId: "rppl:framework:first-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:non-aggression:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:holistic-management:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ RELATIONSHIPS & SOCIAL DYNAMICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:attachment-theory:v1",
    type: "framework",
    name: "Attachment Theory",
    domain: "people",
    domains: ["identity", "growth"],
    description:
      "Your attachment style — formed in your earliest relationships and operating largely unconsciously — shapes every close relationship you have: romantic, friendship, parental, professional. Under relational stress, your attachment system activates a default strategy: secure (stay present, communicate needs), anxious (cling, protest, seek reassurance), avoidant (withdraw, minimize needs, self-rely), or disorganized (oscillate between clinging and withdrawing). Understanding your attachment style is the structural equivalent of circadian biology for the body — the deep mechanism beneath the surface behaviors.",
    tenets: [
      "Attachment is an evolved survival system: infants who maintained proximity to caregivers survived. The strategies that kept you safe as a child become your default relational patterns as an adult.",
      "Four attachment styles: Secure (comfortable with intimacy and autonomy), Anxious-preoccupied (hyperactivated attachment — seeks closeness, fears abandonment, protests distance), Avoidant-dismissive (deactivated attachment — values independence, minimizes emotional needs, withdraws under pressure), Disorganized/Fearful-avoidant (no coherent strategy — wants closeness but fears it, oscillates between approach and withdrawal).",
      "Attachment styles are not fixed: 'earned security' is well-documented. Through awareness, secure relationships, and sometimes therapeutic work, insecure attachment patterns can shift toward security. Your childhood shaped your defaults, not your destiny.",
      "The anxious-avoidant trap: anxious and avoidant styles are magnetically attracted to each other and produce a painful pursue-withdraw cycle. Understanding this dynamic alone can save years of relationship suffering.",
      "Internal working models: your attachment style creates unconscious 'models' of self (am I worthy of love?) and others (are people reliable?). These models filter incoming data — an avoidant person genuinely doesn't notice bids for connection; an anxious person reads threat into neutral behavior.",
    ],
    applications: [
      "Identifying your style: track your behavior under relational stress, not when things are calm. Do you reach out or withdraw? Escalate or minimize? Your stress response reveals your attachment pattern.",
      "The pursue-withdraw cycle: if your relationships consistently feature one person chasing and the other retreating, you're in the anxious-avoidant trap. Naming it breaks the automaticity.",
      "Earning security: deliberately seek out and invest in relationships with securely attached people. Security is transmitted through relational experience, not just understanding.",
      "Parenting: your attachment style with your children is the single strongest predictor of their attachment style. Understanding yours is the prerequisite for giving them security.",
      "HUMA application: the 'people' domain should track relational patterns under stress, not just relationship 'status.' Attachment is about dynamics, not inventory.",
    ],
    tradition:
      "John Bowlby ('Attachment and Loss' trilogy, 1969-1980) → Mary Ainsworth (Strange Situation, attachment classifications, 1978) → Mary Main (Adult Attachment Interview, disorganized attachment) → modern: Amir Levine & Rachel Heller ('Attached' 2010), Stan Tatkin ('Wired for Love' 2012)",
    provenance: {
      source: "research",
      sourceTradition:
        "Developmental psychology / attachment research / Bowlby-Ainsworth tradition",
      keyReference:
        "John Bowlby, 'Attachment and Loss' (3 vols, 1969-1980); Mary Ainsworth, 'Patterns of Attachment' (1978); accessible: Amir Levine & Rachel Heller, 'Attached' (2010)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "relationship-issues",
        "parent",
        "anxious-in-relationships",
        "avoidant",
        "repeating-relational-patterns",
      ],
    },
    contextTags: [
      "relationships",
      "self-knowledge",
      "parenting",
      "intimacy",
      "developmental",
    ],
    contraindications: [
      "Attachment style is a tendency, not a box — people show different patterns in different relationships and contexts. Don't over-identify ('I AM avoidant') — General Semantics applies here too.",
      "Self-diagnosis from pop-psych descriptions is unreliable. The Adult Attachment Interview (AAI) is the gold standard assessment and it measures narrative coherence, not self-report.",
      "Can become a weapon: 'You're just being avoidant' used as an accusation is NVC-violating blame, not insight. Use to understand yourself first, then to have compassion for others.",
      "Attachment work can surface early relational trauma — professional support is appropriate when the material is destabilizing",
    ],
    links: [
      {
        rpplId: "rppl:framework:nvc:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:jungian-psychology:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:polyvagal-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:evolutionary-mismatch:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:game-theory:v1",
    type: "framework",
    name: "Game Theory",
    domain: "people",
    domains: ["meta", "money"],
    description:
      "The mathematics of strategic interaction — every situation where your outcome depends on what other people choose. Not 'games' in the trivial sense but the formal structure of cooperation, competition, trust, betrayal, coordination, and negotiation. Understanding game theory changes how you see every relationship, negotiation, and social situation: the prisoner's dilemma explains why cooperation fails even when everyone wants it, tit-for-tat explains why reciprocity works, and coordination games explain why couples fight about restaurants.",
    tenets: [
      "Strategic interdependence: in any interaction involving other people, your outcome depends not just on your choice but on their choice too. Optimizing in isolation is meaningless — you must consider the other player's likely moves.",
      "The Prisoner's Dilemma: two players both benefit from cooperating, but each has an individual incentive to defect. This single model explains: arms races, environmental tragedy of the commons, broken trust in relationships, workplace politics, and why 'just cooperate' doesn't work without structure.",
      "Tit-for-tat (Axelrod): in repeated interactions, the winning strategy is simple — cooperate first, then mirror whatever the other player did last. Be nice (start cooperating), retaliatory (punish defection), forgiving (return to cooperation after punishment), and clear (make your strategy legible). This is the mathematically optimal relationship strategy.",
      "Coordination games: sometimes the problem isn't competition but coordination — both players want to cooperate but can't agree on HOW. The restaurant fight, the thermostat war, the division of household labor. The solution is usually a focal point (Schelling) or explicit negotiation, not more arguing.",
      "Positive-sum vs. zero-sum: zero-sum games have a fixed pie (my gain is your loss). Positive-sum games can grow the pie. Most real-life interactions are positive-sum — but people mistakenly treat them as zero-sum, destroying value for everyone.",
      "Nash Equilibrium: the stable state where no player can improve their outcome by changing strategy unilaterally. Many bad life situations (toxic work cultures, dysfunctional relationships) are Nash equilibria — stable but terrible. Changing them requires coordinated action, not individual optimization.",
    ],
    applications: [
      "Relationship dynamics: is this interaction zero-sum or positive-sum? If you're treating it as zero-sum ('I win, you lose'), you're destroying value. Reframe to find the positive-sum structure.",
      "Building trust: tit-for-tat in practice — start by extending trust, reciprocate what you receive, forgive after correction, make your principles visible and consistent",
      "Negotiation: identify whether you're in a coordination game (agree on what) or a competition (divide a fixed pie). The strategies are completely different.",
      "Escaping bad equilibria: if you're stuck in a toxic dynamic that feels impossible to change, you may be in a Nash equilibrium. The exit requires changing the game structure (rules, players, incentives), not just trying harder within it.",
      "Parenting and teaching: model cooperation, demonstrate that generosity produces returns, show that reputation is the most valuable long-term asset in repeated games",
    ],
    tradition:
      "John von Neumann & Oskar Morgenstern ('Theory of Games and Economic Behavior' 1944) → John Nash (equilibrium, 1950, Nobel 1994) → Robert Axelrod ('The Evolution of Cooperation' 1984) → Thomas Schelling (focal points, 'The Strategy of Conflict' 1960, Nobel 2005)",
    provenance: {
      source: "research",
      sourceTradition:
        "Game theory / strategic interaction / mathematical social science",
      keyReference:
        "Robert Axelrod, 'The Evolution of Cooperation' (1984); Thomas Schelling, 'The Strategy of Conflict' (1960); accessible: William Poundstone, 'Prisoner's Dilemma' (1992)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "negotiator",
        "in-conflict",
        "manager",
        "parent",
        "partner",
      ],
    },
    contextTags: [
      "relationships",
      "cooperation",
      "negotiation",
      "strategic-thinking",
      "trust",
    ],
    contraindications: [
      "Game theory assumes rational actors — real humans are biased (see cognitive biases framework). Use game theory to understand structure, not to predict exact behavior.",
      "Can make relationships feel transactional if applied mechanically. The math reveals dynamics; it doesn't replace genuine care and connection.",
      "Zero-sum thinking is itself a bias — most people over-apply competitive framing. Game theory should help you SEE positive-sum opportunities, not justify competition.",
    ],
    links: [
      {
        rpplId: "rppl:framework:cognitive-biases:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:nvc:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:non-aggression:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:network-theory:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:framework:network-theory:v1",
    type: "framework",
    name: "Network Theory",
    domain: "people",
    domains: ["meta", "money", "growth"],
    description:
      "Your life IS a network — social connections, skills, knowledge, habits, information sources — all form interconnected graphs with measurable properties. Understanding network structure changes how you invest in relationships, seek information, build resilience, and create opportunity. For a system whose core promise is showing 'how parts of your life connect,' the mathematics of connection is foundational.",
    tenets: [
      "Strength of weak ties (Granovetter): your closest friends know what you know. Novel information, job opportunities, and perspective shifts come through weak ties — acquaintances, friends-of-friends, people in adjacent circles. Investing ONLY in strong ties creates an echo chamber.",
      "Hub-and-spoke vs. distributed networks: networks with a few central hubs are efficient but fragile (lose the hub, lose the network). Distributed networks are slower but resilient. Your social network, income sources, and skill set should tend toward distributed.",
      "Bridge positions: people who connect otherwise disconnected groups hold disproportionate informational and social power. Being a bridge — between industries, communities, disciplines — is one of the highest-value social positions.",
      "Small-world phenomenon: most people are connected to most others through surprisingly few intermediaries. This means any piece of knowledge, any person, any opportunity is closer than you think — IF you can navigate the network.",
      "Network effects: some things become more valuable as more people use them — languages, platforms, standards, communities. Understanding which of your investments have network effects changes your allocation.",
      "Preferential attachment: nodes with more connections tend to get more connections (the rich get richer). Early investment in relationship-building compounds. Starting late means working harder for the same result.",
    ],
    applications: [
      "Social capital investment: deliberately cultivate weak ties in diverse domains. Your next opportunity is more likely to come from an acquaintance than a close friend.",
      "Information diet: if all your information comes from the same cluster, you're in an echo chamber. Bridge to different clusters for perspective.",
      "Resilience audit: if one person, one income source, or one skill is your 'hub,' you're structurally fragile. Distribute.",
      "HUMA application: the holonic map IS a network visualization. Network theory provides the mathematics for identifying which connections are load-bearing, which are redundant, and where the structural gaps are.",
      "Career strategy: position yourself as a bridge between communities or disciplines. The value of bridging exceeds the value of depth in a single cluster.",
    ],
    tradition:
      "Leonhard Euler (graph theory, Konigsberg bridges, 1736) → Paul Erdos & Alfred Renyi (random graphs) → Mark Granovetter ('Strength of Weak Ties' 1973) → Duncan Watts & Steven Strogatz (small-world networks, 1998) → Albert-Laszlo Barabasi ('Linked' 2002, scale-free networks)",
    provenance: {
      source: "research",
      sourceTradition:
        "Network science / graph theory / social network analysis",
      keyReference:
        "Mark Granovetter, 'The Strength of Weak Ties' (1973); Albert-Laszlo Barabasi, 'Linked: How Everything Is Connected to Everything Else' (2002); Duncan Watts, 'Six Degrees' (2003)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "socially-isolated",
        "career-building",
        "entrepreneur",
        "community-builder",
      ],
    },
    contextTags: [
      "relationships",
      "social-capital",
      "information-flow",
      "resilience",
      "connection",
    ],
    contraindications: [
      "Instrumentalizing relationships (treating people as 'nodes' to optimize) undermines genuine connection. Network theory reveals structure; it doesn't replace care.",
      "Weak ties are valuable for information and opportunity, but strong ties are essential for emotional support and wellbeing. Don't neglect depth for breadth.",
      "Network analysis can over-emphasize quantity of connections. A small, well-connected network often outperforms a large, sparse one.",
    ],
    links: [
      {
        rpplId: "rppl:framework:game-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:pattern-language:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:information-theory:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ BODY-MIND BRIDGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:polyvagal-theory:v1",
    type: "framework",
    name: "Polyvagal Theory — Nervous System Regulation",
    domain: "body",
    domains: ["people", "meta", "identity"],
    description:
      "Stephen Porges' framework for understanding the autonomic nervous system as a hierarchy of three states: ventral vagal (safe, social, creative), sympathetic (fight/flight, mobilized), and dorsal vagal (shutdown, freeze, collapse). The critical insight for life design: you cannot access your best thinking, your relationships, or your creativity from a dysregulated nervous system. Stoicism says 'I am my response, not my circumstances.' Polyvagal theory explains the biological prerequisite for being ABLE to choose your response at all. This is the body-mind bridge.",
    tenets: [
      "Three-state hierarchy: Ventral vagal (safe — social engagement, creative thinking, connection, calm alertness) → Sympathetic (threat — fight or flight, mobilization, anxiety, anger, hypervigilance) → Dorsal vagal (life-threat — shutdown, collapse, dissociation, numbness, depression). States are hierarchical: you descend under increasing threat.",
      "Neuroception: your nervous system evaluates safety/threat below conscious awareness. You don't DECIDE to feel unsafe — your body decides before your mind catches up. This is why 'just think positive' fails when the nervous system reads danger.",
      "Co-regulation: nervous systems regulate THROUGH other nervous systems. A calm person calms those around them. An anxious person activates those around them. This is the biological basis of social connection — we literally lend each other our nervous systems.",
      "The ventral vagal state is required for higher cognition: you cannot do first-principles thinking, shadow work, Socratic questioning, or NVC from a sympathetic or dorsal vagal state. Regulation FIRST, then analysis.",
      "The vagal brake: the ventral vagal system acts as a 'brake' on the sympathetic system. Strong vagal tone = ability to stay calm under pressure. Vagal tone is trainable through breath, cold exposure, social connection, and safety cues.",
      "Window of tolerance: each person has a bandwidth within which they can process stress without leaving the ventral vagal state. Outside that window, they flip to sympathetic (over-arousal) or dorsal (under-arousal). The goal is to widen the window, not eliminate stress.",
    ],
    applications: [
      "State before strategy: before trying to think, decide, or communicate, check your nervous system state. If you're activated (sympathetic) or shut down (dorsal), regulate first. No framework works from a dysregulated state.",
      "Co-regulation in relationships: your calm IS a gift to others. Your dysregulation IS contagious. This is not weakness — it's mammalian biology. Be intentional about whose nervous system you're connecting to.",
      "Vagal toning practices: slow exhale-dominant breathing (physiological sigh), cold exposure, humming/singing (activates the vagus nerve), safe social connection, grounding through the senses",
      "Understanding 'overreaction': when your response is disproportionate to the situation, your neuroception is likely reading a past threat, not a present one. The body is responding accurately to the signal it's receiving — the signal is just outdated.",
      "HUMA application: behavior check-offs done from ventral vagal state have a different quality than those done from sympathetic. Tracking nervous system state alongside behavior would reveal which patterns are sustainable vs. cortisol-driven.",
    ],
    tradition:
      "Stephen Porges, 'The Polyvagal Theory' (2011) → Deb Dana, 'The Polyvagal Theory in Therapy' (2018, clinical application) → Peter Levine, 'Waking the Tiger' (1997, somatic experiencing, adjacent). Builds on: autonomic nervous system research, vagus nerve physiology, evolutionary neurobiology.",
    provenance: {
      source: "research",
      sourceTradition:
        "Polyvagal theory / autonomic neuroscience / Porges",
      keyReference:
        "Stephen Porges, 'The Polyvagal Theory' (2011); Deb Dana, 'The Polyvagal Theory in Therapy' (2018); accessible: Deb Dana, 'Anchored' (2021)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "anxious",
        "trauma-history",
        "reactive",
        "burned-out",
        "shutdown",
        "parent",
      ],
    },
    contextTags: [
      "body-mind",
      "nervous-system",
      "regulation",
      "safety",
      "co-regulation",
      "foundational",
    ],
    contraindications: [
      "Polyvagal theory has academic critics (e.g., Paul Grossman) who argue the phylogenetic claims are oversimplified. The three-state model is clinically useful even if the evolutionary narrative is debated.",
      "Can be used to avoid responsibility: 'My nervous system made me do it' — understanding doesn't excuse behavior, it informs the work of changing it",
      "People with significant trauma should explore nervous system work WITH professional support, not as a solo DIY project",
      "Vagal toning practices are gentle interventions, not replacements for clinical treatment of PTSD, panic disorder, or chronic dissociation",
    ],
    links: [
      {
        rpplId: "rppl:framework:attachment-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:nvc:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:terrain-theory:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ EVOLUTIONARY CONTEXT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:evolutionary-mismatch:v1",
    type: "framework",
    name: "Evolutionary Mismatch",
    domain: "meta",
    domains: ["body", "people", "joy", "identity"],
    description:
      "Your brain and body were designed by natural selection for a radically different environment than the one you live in. Anxiety is an evolved threat-detection system running in a world with no predators but infinite social media triggers. Obesity is a calorie-storage system optimized for scarcity operating in unprecedented abundance. Loneliness is a tribal-bonding drive in an atomized society. This is the meta-explanation for why modern life is hard — not because you're broken, but because the environment changed faster than the biology. Every health, relationship, and psychological challenge in the modern world is illuminated by asking: 'What was this system designed for, and how does the current environment mismatch?'",
    tenets: [
      "Environment of Evolutionary Adaptedness (EEA): human psychology and physiology were shaped over ~2 million years in small-group, hunter-gatherer conditions. Agriculture is ~10,000 years old. Industrial civilization is ~250 years old. The smartphone is ~15 years old. Your biology hasn't caught up.",
      "Supernormal stimuli: evolution designed your reward systems for scarce, hard-to-obtain rewards (sugar, fat, social approval, sexual signals). Modern technology provides supernormal versions of these stimuli (processed food, social media, pornography) that hijack evolved circuits.",
      "Social mismatch: humans evolved for groups of 50-150 (Dunbar's number). Modern life features simultaneously TOO MANY shallow connections (thousands online) and TOO FEW deep ones (social isolation). Both problems are mismatch problems.",
      "Movement mismatch: the human body was designed for 8-16 km of daily movement across varied terrain. Sitting in chairs for 8+ hours is an evolutionary novelty your body doesn't handle well.",
      "Light mismatch: evolved for sunrise-to-sunset light exposure and pitch darkness at night. Now: indoor fluorescent lighting by day, blue-light screens by night. This is the root cause that circadian biology addresses.",
      "Mismatch is not a value judgment: evolution didn't design 'good' or 'bad' systems — it designed systems that worked in specific conditions. Modern pathologies are working systems in mismatched conditions, not broken systems.",
    ],
    applications: [
      "Reframing pathology: 'What's wrong with me?' becomes 'What was this response designed for, and how is my environment mismatched?' Anxiety is not a disorder — it's a functional threat-detection system in an environment full of false positives.",
      "Environment design: instead of relying on willpower to fight evolved drives, redesign the environment to reduce mismatch. Remove supernormal stimuli. Add movement. Get outside. Eat real food. Build community.",
      "Technology audit: for every piece of technology in your life, ask: 'What evolved drive does this exploit? Is it serving me or hijacking me?'",
      "Social design: deliberately build the small-group tribal structure your nervous system expects — 3-5 close confidants, 15 good friends, 50 casual friends, 150 acquaintances (Dunbar's layers)",
      "Self-compassion: most of your struggles are not personal failures — they are predictable consequences of being a Paleolithic organism in a post-industrial world",
    ],
    tradition:
      "Evolutionary psychology: Leda Cosmides & John Tooby (founders, 'The Adapted Mind' 1992) → mismatch hypothesis: Peter Gluckman & Mark Hanson ('Mismatch' 2006) → supernormal stimuli: Deirdre Barrett ('Supernormal Stimuli' 2010) → applied: Daniel Lieberman ('The Story of the Human Body' 2013)",
    provenance: {
      source: "research",
      sourceTradition:
        "Evolutionary psychology / mismatch hypothesis / evolutionary medicine",
      keyReference:
        "Daniel Lieberman, 'The Story of the Human Body: Evolution, Health, and Disease' (2013); Deirdre Barrett, 'Supernormal Stimuli' (2010); Sebastian Junger, 'Tribe' (2016, social mismatch)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "anxious",
        "screen-addicted",
        "sedentary",
        "lonely",
        "overweight",
        "modern-life-struggling",
      ],
    },
    contextTags: [
      "universal",
      "evolutionary",
      "environment-design",
      "root-cause",
      "self-compassion",
    ],
    contraindications: [
      "Evolutionary psychology can be used to justify behavior ('it's natural, therefore it's fine') — the naturalistic fallacy. Understanding the evolved drive doesn't mean surrendering to it.",
      "The EEA is partly speculative — we have limited direct evidence of ancestral conditions. Use as a useful model, not as established fact about specific ancestral behaviors.",
      "Can be reductive: 'Everything is explained by evolution' ignores culture, individual agency, and the genuine novelty of human consciousness",
      "Some mismatch claims are overstated in popular science. Apply scientific method: which specific mismatch claims have strong evidence?",
    ],
    links: [
      {
        rpplId: "rppl:framework:circadian-biology:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:terrain-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:attachment-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:cognitive-biases:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:polyvagal-theory:v1",
        relationship: "synergy",
      },
    ],
  },

  // ━━━ ANTI-FRAGILITY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:framework:antifragility:v1",
    type: "framework",
    name: "Antifragility",
    domain: "meta",
    domains: ["body", "growth", "money"],
    description:
      "Beyond resilience. Nassim Taleb's central insight: some systems don't just survive stress — they get STRONGER from it. Your muscles grow from strain. Your immune system strengthens from exposure. Your problem-solving improves from difficulty. Your children develop competence from age-appropriate challenge. The opposite of fragile is not robust (withstands stress) — it is antifragile (benefits from stress). Overprotection — of yourself, your children, your portfolio, your comfort — produces fragility. Appropriate stressors produce strength.",
    tenets: [
      "The triad: Fragile (breaks under stress — glass, rigid plans, monocultures) → Robust (withstands stress — concrete, savings accounts, stoic indifference) → Antifragile (benefits from stress — muscles, immune system, reputation through survived scandal, entrepreneurial learning through failure)",
      "Hormesis: small doses of stress produce beneficial adaptation. Exercise, fasting, cold exposure, intellectual challenge, social friction — all produce antifragile responses when dosed appropriately. The dose makes the poison AND the medicine.",
      "Via negativa: antifragility is often achieved by REMOVING harmful things rather than adding beneficial ones. Stop the thing that's making you fragile before trying to become stronger. Subtraction before addition.",
      "Optionality: antifragile systems have more upside than downside — they are 'convex' to stress. Design your life with options: the ability to benefit from good surprises without being destroyed by bad ones.",
      "Skin in the game: systems where decision-makers bear the consequences of their decisions are antifragile. Systems where they don't (bailouts, no-consequence advice) become fragile. You should have skin in the game of your own life advice.",
      "The Lindy Effect: the longer something has survived, the longer it's expected to survive. Books, traditions, foods, frameworks that have existed for centuries are more trustworthy than last year's trend. This validates HUMA's emphasis on ancient frameworks.",
    ],
    applications: [
      "Training vs. protection: expose yourself to appropriate stressors (cold, physical challenge, intellectual difficulty, social discomfort) rather than avoiding all stress. Comfort is the path to fragility.",
      "Portfolio design: in finances, career, and skills — design for optionality. Many small experiments with limited downside and unlimited upside, not one big bet.",
      "Parenting: age-appropriate challenge, failure, and struggle build antifragile children. Removing all difficulty builds fragile ones. Let them fall. Let them figure it out.",
      "Via negativa for life design: before adding new practices, identify and remove the things making you fragile. What would you STOP doing? Often more powerful than what you'd start.",
      "Pattern validation: HUMA's validation process IS an antifragile system — patterns that survive real-world testing are stronger than patterns adopted from theory alone",
    ],
    tradition:
      "Nassim Nicholas Taleb, 'Antifragile: Things That Gain from Disorder' (2012), part of the 'Incerto' series ('Fooled by Randomness' 2001, 'The Black Swan' 2007, 'Skin in the Game' 2018). Builds on: hormesis research, evolutionary biology, Stoic philosophy, fat-tailed probability distributions.",
    provenance: {
      source: "research",
      sourceTradition:
        "Antifragility / risk theory / Taleb / complexity science",
      keyReference:
        "Nassim Nicholas Taleb, 'Antifragile: Things That Gain from Disorder' (2012); also: 'Skin in the Game' (2018), 'The Black Swan' (2007)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "risk-averse",
        "overprotective",
        "comfort-seeking",
        "parent",
        "entrepreneur",
        "investor",
      ],
    },
    contextTags: [
      "universal",
      "resilience-plus",
      "stress-as-input",
      "optionality",
      "via-negativa",
    ],
    contraindications: [
      "Not all stress is beneficial. Trauma, chronic overwhelming stress, and toxic environments are not 'making you stronger' — they're causing damage. Hormesis requires appropriate dosing.",
      "Can be used to justify cruelty ('I'm toughening you up') or dismiss genuine suffering ('What doesn't kill you makes you stronger' — sometimes it just damages you). Context and consent matter.",
      "Taleb's writing style is provocative and dismissive of academia — the ideas are strong but the presentation alienates many. Separate the insight from the personality.",
      "Antifragility bias: not everything should be antifragile. Some things should be robust (your emergency fund) or even fragile by design (a circuit breaker that fails to protect the system).",
    ],
    links: [
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:permaculture:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:thermodynamics:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:terrain-theory:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:evolutionary-mismatch:v1",
        relationship: "synergy",
      },
    ],
  },
];
