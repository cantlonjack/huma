import type { RpplSeed } from "./types";

// ─── Capacities ─────────────────────────────────────────────────────────────
// Cultivable pre-cognitive orientations. The soil in which frameworks grow.
// Without these, no framework takes root — you're planting seeds in dead soil.
// These are not "how to think" (frameworks) or "what to believe" (principles).
// They are "what you must BE ABLE TO DO" before any of that works.
// ─────────────────────────────────────────────────────────────────────────────

export const capacitySeeds: RpplSeed[] = [
  {
    rpplId: "rppl:capacity:awareness:v1",
    type: "capacity",
    name: "Awareness",
    domain: "meta",
    domains: ["growth", "identity"],
    description:
      "The capacity to observe your own experience — metacognition. Without awareness, you cannot apply ANY framework because you cannot see what's happening. The Trivium requires observing your own thinking. Polyvagal theory requires noticing your nervous system state. The Scientific Method requires honest observation. Awareness is the prerequisite for every other capacity and every framework. It is not the same as intelligence — it is the ability to watch yourself think, feel, and act.",
    outputs: [
      { name: "Metacognition", portType: "state", key: "metacognition", description: "Ability to observe your own thinking" },
      { name: "Self-observation", portType: "state", key: "self_observation", description: "Noticing patterns, reactions, and states in real-time" },
      { name: "Emotional granularity", portType: "state", key: "emotional_granularity", description: "Specificity in identifying inner states" },
    ],
    indicators: [
      "Can describe what actually happened vs. their story about what happened",
      "Notices patterns in own behavior before being shown data",
      "Catches assumptions and reactions in real-time rather than only in retrospect",
      "Can articulate inner state with specificity ('I feel anxious about this deadline') rather than vagueness ('I feel bad')",
      "Shows curiosity about their own responses rather than just defending them",
    ],
    cultivationMethods: [
      "HUMA's daily check-in itself — the act of tracking builds the muscle of noticing",
      "Evening reflection: 'What did I actually do today vs. what I intended?'",
      "Journaling — externalizing inner experience makes it observable",
      "Meditation / mindfulness practice — sustained attention training",
      "Socratic self-questioning: 'Why did I react that way? What was the trigger?'",
      "Data mirrors: HUMA showing the gap between self-report and behavioral data",
    ],
    blockages: [
      "Constant stimulation (screens, noise, busyness) that prevents quiet observation",
      "Avoidance of discomfort — awareness often reveals uncomfortable truths",
      "Identity-threat reactions: when seeing clearly threatens your self-image, the mind clouds",
      "Dorsal vagal shutdown (polyvagal) — in collapse state, awareness narrows dramatically",
      "Alexithymia — clinical difficulty identifying and describing emotions",
    ],
    prerequisiteFor: [
      "rppl:framework:trivium:v1",
      "rppl:framework:socratic-method:v1",
      "rppl:framework:scientific-method:v1",
      "rppl:framework:first-principles:v1",
      "rppl:framework:stoicism:v1",
      "rppl:framework:jungian-psychology:v1",
      "rppl:framework:polyvagal-theory:v1",
      "rppl:framework:nvc:v1",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Metacognition research / contemplative traditions / phenomenology",
      keyReference:
        "John Flavell (metacognition, 1979); Jon Kabat-Zinn, 'Full Catastrophe Living' (1990); William James, 'The Principles of Psychology' (1890)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "beginner",
        "reactive",
        "on-autopilot",
        "disconnected",
      ],
    },
    contextTags: [
      "universal",
      "foundational",
      "metacognition",
      "self-observation",
    ],
    contraindications: [
      "Hyper-awareness can become anxious self-monitoring — the goal is clear seeing, not relentless scrutiny",
      "In acute crisis or trauma, awareness practices can be destabilizing without professional support",
    ],
    links: [
      {
        rpplId: "rppl:capacity:honesty:v1",
        relationship: "enables",
      },
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "derived_from",
      },
    ],
  },

  {
    rpplId: "rppl:capacity:honesty:v1",
    type: "capacity",
    name: "Honesty",
    domain: "meta",
    domains: ["identity", "growth"],
    description:
      "The willingness to see what's actually there rather than what you want to see. Awareness lets you observe; honesty lets you report accurately — to yourself first, then to any system tracking your life. Without honesty, every framework becomes a rationalization engine: you'll 'first-principles' your way to the conclusion you already wanted, track behaviors but lie to yourself about completion, and explain away data that contradicts your self-image. Honesty is the bridge between seeing and changing.",
    outputs: [
      { name: "Data integrity", portType: "state", key: "data_integrity", description: "Self-report matches actual behavior" },
      { name: "Self-accuracy", portType: "state", key: "self_accuracy", description: "Truthful self-assessment without distortion" },
      { name: "Feedback receptivity", portType: "state", key: "feedback_receptivity", description: "Willingness to hear and act on disconfirming data" },
    ],
    indicators: [
      "Self-report matches behavioral data (says they exercise, data confirms it)",
      "Acknowledges when behavior doesn't match stated values without excessive defensiveness",
      "Can say 'I don't know' or 'I was wrong' without identity collapse",
      "Reports failures and struggles, not just successes",
      "Willing to examine uncomfortable patterns when data surfaces them",
    ],
    cultivationMethods: [
      "HUMA data mirrors: 'You said mornings are good, but check-off data shows 2/14 completions. What's happening there?'",
      "Naming the gap between intention and action without judgment — making it safe to be honest",
      "Tracking without editing — recording what actually happened, not the curated version",
      "Trusted relationships where honesty is reciprocated and rewarded, not punished",
      "Journaling with the prompt 'What am I pretending not to know?'",
    ],
    blockages: [
      "Shame: honesty feels dangerous when the truth threatens self-worth",
      "Identity attachment: 'I am a disciplined person' makes it impossible to admit inconsistency",
      "Sunk cost: admitting something isn't working means admitting time/energy was 'wasted'",
      "Social pressure: curating a public image that requires dishonesty to maintain",
      "Perfectionism: if anything less than perfect is 'failure,' honesty about imperfection feels catastrophic",
    ],
    prerequisiteFor: [
      "rppl:framework:scientific-method:v1",
      "rppl:framework:first-principles:v1",
      "rppl:framework:holistic-management:v1",
      "rppl:framework:jungian-psychology:v1",
      "rppl:framework:general-semantics:v1",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Existential philosophy / Socratic tradition / psychotherapy (Rogers, unconditional positive regard)",
      keyReference:
        "Carl Rogers, 'On Becoming a Person' (1961); Brene Brown, 'Daring Greatly' (2012); Socrates ('The unexamined life is not worth living')",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-deceiving",
        "perfectionist",
        "image-conscious",
        "avoiding-data",
      ],
    },
    contextTags: [
      "universal",
      "foundational",
      "self-honesty",
      "data-integrity",
    ],
    links: [
      {
        rpplId: "rppl:capacity:awareness:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:capacity:humility:v1",
        relationship: "enables",
      },
    ],
  },

  {
    rpplId: "rppl:capacity:care:v1",
    type: "capacity",
    name: "Care",
    domain: "purpose",
    domains: ["meta", "identity"],
    description:
      "The generative force — the fact that something matters to you. Without care, nothing is motivated. You can have perfect awareness, total honesty, and full agency, but if nothing matters, no framework activates. Care is what Natural Law calls the 'generative principle' and what the Hermetic tradition calls the driving force behind Mentalism. If you don't care about anything, HUMA can't help yet — the conversation must first explore what used to matter, what might matter, what has been numbed.",
    outputs: [
      { name: "Intrinsic motivation", portType: "state", key: "motivation", description: "Sustained drive from meaning, not obligation" },
      { name: "Engagement", portType: "state", key: "engagement", description: "Consistent return to what matters" },
      { name: "Meaning", portType: "state", key: "meaning", description: "Felt sense that something is worth the cost" },
    ],
    indicators: [
      "Consistent engagement with at least one aspiration over time",
      "Emotional response to progress or regression (it matters enough to feel something)",
      "Initiating action without external prompting — intrinsic motivation visible",
      "Asking questions about their own patterns (curiosity = care applied to self-knowledge)",
      "Making sacrifices or trade-offs for something — willingness to pay a cost proves care",
    ],
    cultivationMethods: [
      "Find the one thing that sparks something — even a small flicker — and build from there",
      "Connect daily behaviors to personally meaningful outcomes, not abstract goals",
      "Reconnect with what used to matter before burnout or numbness set in",
      "Expose yourself to people who care deeply — care is contagious (co-regulation of meaning)",
      "Reduce overstimulation — numbness is often buried care under too much noise",
      "Ask: 'If nothing could fail, what would I build?' — bypasses the protective cynicism",
    ],
    blockages: [
      "Burnout: care was exploited until it was extinguished. Recovery, not motivation, is needed.",
      "Numbness from overstimulation: dopamine exhaustion from constant novelty makes everything feel flat",
      "Learned helplessness: caring feels dangerous when past caring led to disappointment",
      "Depression: clinical anhedonia (inability to experience pleasure/meaning) requires professional support",
      "Cynicism as armor: 'Nothing matters' as protection against vulnerability",
    ],
    prerequisiteFor: [
      "rppl:framework:holistic-management:v1",
      "rppl:framework:permaculture:v1",
      "rppl:framework:stoicism:v1",
      "rppl:framework:vedic-dharma-karma:v1",
      "rppl:framework:flow-states:v1",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Natural Law (Care as generative principle) / existentialism / logotherapy / self-determination theory",
      keyReference:
        "Viktor Frankl, 'Man's Search for Meaning' (1946); Mark Passio (Care as generative principle); Deci & Ryan, Self-Determination Theory (intrinsic motivation)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "burned-out",
        "numb",
        "apathetic",
        "cynical",
        "disconnected-from-purpose",
      ],
    },
    contextTags: ["universal", "foundational", "motivation", "meaning", "purpose"],
    contraindications: [
      "Care cannot be forced — pressuring someone to 'just care more' is counterproductive. The conditions for care must be cultivated, not demanded.",
      "If numbness or apathy is clinical (depression, PTSD), professional support is needed before capacity cultivation",
    ],
    links: [
      {
        rpplId: "rppl:capacity:agency:v1",
        relationship: "enables",
      },
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "derived_from",
      },
    ],
  },

  {
    rpplId: "rppl:capacity:agency:v1",
    type: "capacity",
    name: "Agency",
    domain: "meta",
    domains: ["identity", "purpose"],
    description:
      "The felt sense that your choices matter — not the philosophical axiom that free will exists, but the lived experience of choosing and seeing consequences follow. Learned helplessness kills every framework. A person who genuinely believes they can't change anything will not apply the Trivium, will not test inherited beliefs, will not redesign their environment. Agency is restored through small wins: making a tiny choice, seeing a result, and building from there.",
    outputs: [
      { name: "Self-efficacy", portType: "state", key: "self_efficacy", description: "Felt sense that your choices produce results" },
      { name: "Initiative", portType: "state", key: "initiative", description: "Acting without external prompting" },
      { name: "Internal locus of control", portType: "state", key: "internal_locus", description: "Connecting outcomes to own choices, not circumstances" },
    ],
    indicators: [
      "Uses 'I choose' or 'I decided' language rather than 'I have to' or 'I can't'",
      "Takes initiative without being prompted — active rather than passive posture",
      "Connects actions to outcomes in self-narrative: 'I did X and Y happened'",
      "Willingness to experiment: 'Let me try this and see what happens'",
      "Takes responsibility for outcomes without catastrophizing or externalizing",
    ],
    cultivationMethods: [
      "Start with tiny choices that prove agency exists: 'Tomorrow morning, choose ONE thing: coffee before or after sunlight. Just choose.'",
      "Decision logging with follow-up: make a choice, predict the outcome, track what actually happened",
      "Reclaiming involuntary obligations: 'I HAVE to go to work' → 'I CHOOSE to go to work because...' (reframe or drop)",
      "Identify one area of genuine control when everything feels uncontrollable — the Stoic response",
      "HUMA's daily letter as agency exercise: you choose which 5 actions to commit to. The choice IS the practice.",
    ],
    blockages: [
      "Learned helplessness: repeated experiences of powerlessness generalize to 'nothing I do matters'",
      "External locus of control: belief that outcomes are determined by luck, fate, or other people",
      "Overwhelming complexity: when everything seems interconnected and massive, individual action feels pointless",
      "Institutional dependency: long-term reliance on systems that make decisions for you atrophies the agency muscle",
      "Trauma: when past agency led to punishment or danger, choosing can feel threatening (requires nervous system safety first)",
    ],
    prerequisiteFor: [
      "rppl:framework:stoicism:v1",
      "rppl:framework:non-aggression:v1",
      "rppl:framework:first-principles:v1",
      "rppl:framework:holistic-management:v1",
      "rppl:framework:antifragility:v1",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Locus of control (Rotter) / learned helplessness (Seligman) / self-efficacy (Bandura) / existentialism",
      keyReference:
        "Martin Seligman, 'Learned Helplessness' (1975); Albert Bandura, 'Self-Efficacy' (1997); Viktor Frankl, 'Man's Search for Meaning' (1946)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "feeling-stuck",
        "helpless",
        "passive",
        "overwhelmed",
        "externally-controlled",
      ],
    },
    contextTags: [
      "universal",
      "foundational",
      "self-efficacy",
      "choice",
      "empowerment",
    ],
    contraindications: [
      "Agency emphasis can become toxic positivity: 'You can do anything!' ignores real structural constraints (poverty, disability, systemic oppression). Agency operates WITHIN constraints, not despite them.",
      "Restoring agency in someone with trauma history requires nervous system safety (polyvagal) before cognitive reframing",
    ],
    links: [
      {
        rpplId: "rppl:capacity:care:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:capacity:awareness:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "derived_from",
      },
    ],
  },

  {
    rpplId: "rppl:capacity:humility:v1",
    type: "capacity",
    name: "Humility",
    domain: "meta",
    domains: ["growth"],
    description:
      "The felt recognition that your current understanding is incomplete. Without humility, you can't learn — you'll adopt one framework, treat it as complete truth, and reject everything that contradicts it. Humility is the prerequisite for the Trivium's Grammar phase (you must know you don't know before you can gather), for the Scientific Method (you must be willing to be wrong), and for HUMA's entire validation process (your patterns might not be working, and the data will tell you).",
    outputs: [
      { name: "Learning openness", portType: "state", key: "learning_openness", description: "Willingness to encounter and absorb new information" },
      { name: "Belief flexibility", portType: "state", key: "belief_flexibility", description: "Ability to update conclusions when evidence warrants" },
      { name: "Provisional thinking", portType: "state", key: "provisional_thinking", description: "Holding positions as current-best rather than absolute" },
    ],
    indicators: [
      "Asks questions rather than making statements when encountering new domains",
      "Revises beliefs when evidence contradicts them — without excessive identity distress",
      "Holds conclusions provisionally: 'This is my current understanding, subject to revision'",
      "Curious about alternatives: 'What if I'm wrong about this?'",
      "Willing to be surprised by their own data — doesn't explain away contradictions",
    ],
    cultivationMethods: [
      "Track predictions vs. outcomes: nothing teaches humility like seeing how often you're wrong",
      "Exposure to diverse perspectives — especially from people whose experience differs from yours",
      "Pre-mortems: before acting on a conclusion, ask 'What would I need to see to know I'm wrong?'",
      "Study the history of confident-but-wrong: medical bloodletting, financial certainty before crashes, personal certainties that proved false",
      "HUMA's data as humility engine: 'I thought I was consistent. The data says otherwise.'",
    ],
    blockages: [
      "Dunning-Kruger effect: insufficient knowledge to recognize insufficient knowledge",
      "Identity attachment to being right: if 'I am smart' is core to identity, being wrong threatens identity",
      "Epistemic closure: surrounding yourself with only confirming information",
      "Sunk cost in existing worldview: the more you've invested in a belief system, the harder it is to update",
      "Social cost of changing positions: communities that punish revision create rigid thinkers",
    ],
    prerequisiteFor: [
      "rppl:framework:trivium:v1",
      "rppl:framework:scientific-method:v1",
      "rppl:framework:first-principles:v1",
      "rppl:framework:socratic-method:v1",
      "rppl:framework:general-semantics:v1",
      "rppl:framework:cognitive-biases:v1",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Socratic tradition ('I know that I know nothing') / epistemology / intellectual virtues research",
      keyReference:
        "Socrates (Apology); Karl Popper, 'The Logic of Scientific Discovery' (1959, falsifiability); Adam Grant, 'Think Again' (2021)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "rigid-thinker",
        "know-it-all",
        "epistemic-closure",
        "identity-attached-to-beliefs",
      ],
    },
    contextTags: [
      "universal",
      "foundational",
      "learning",
      "openness",
      "epistemic-virtue",
    ],
    contraindications: [
      "Humility does not mean self-doubt or lack of conviction — it means holding convictions provisionally and updating when evidence warrants",
      "Excessive 'humility' can become decision paralysis: 'I can never be sure enough to act.' At some point, act on your best current understanding.",
    ],
    links: [
      {
        rpplId: "rppl:capacity:honesty:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:capacity:awareness:v1",
        relationship: "synergy",
      },
    ],
  },
];
