import type { RpplSeed } from "./types";

// ─── Growth / Purpose / Joy Practices ───────────────────────────────────────
// Practice seeds spanning three tightly-coupled dimensions: how you get better
// (growth), what you're moving toward (purpose), and what keeps the whole
// thing worth doing (joy / rest). Separated here by group via section
// banners, but shipped together because the archetypes treat them as one
// intertwined cluster.
//
// Conventions match body-health.ts: kebab-case slugs, practice type, typed
// ports, honest contraindications, source-tradition provenance.
// ─────────────────────────────────────────────────────────────────────────────

export const growthPurposeJoySeeds: RpplSeed[] = [
  // ━━━ GROWTH & LEARNING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:deliberate-practice:v1",
    type: "practice",
    name: "Deliberate Practice Session",
    domain: "growth",
    description:
      "Not 'practice hours' — deliberate practice. A single skill isolated, an explicit target just beyond current ability, immediate feedback on each rep, and full attention for the duration. Most adults spend years 'practicing' and improve only marginally because they work inside their current competence. A 45-minute deliberate session moves the needle further than a month of background repetition.",
    trigger:
      "A fixed slot (daily or 3–5x/week) with the instrument, tool, code editor, or notebook already set up so you begin working, not preparing.",
    steps: [
      "Pick ONE sub-skill to work on today — narrow enough that you can articulate what success looks like",
      "Set a target that you fail at ~30% of the time — too easy is coasting, too hard is flailing",
      "Work in 20–45 minute blocks of undivided attention — no phone, no browser tabs, no 'background' music you'll analyze",
      "Get feedback every rep you can — recording, metronome, test suite, a mirror, a critic whose ear you trust",
      "Log: what you practiced, what broke, what you'll try next session. Progression comes from reading the log",
    ],
    timeWindow: "20–45 minute session, 3–6 days/week",
    servesPrinciples: [
      "rppl:principle:growth-at-edges:v1",
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:attention-grows:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Clear skill target", portType: "boolean", key: "skill_target_defined" },
      { name: "Feedback loop access", portType: "boolean", key: "feedback_available" },
      { name: "Humility", portType: "capacity", key: "humility" },
    ],
    outputs: [
      { name: "Skill development", portType: "state", key: "skill_development" },
      { name: "Mental model refinement", portType: "state", key: "mental_model" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Expertise research / skill acquisition",
      keyReference:
        "K. Anders Ericsson, 'Peak: Secrets from the New Science of Expertise' (2016); Ericsson et al. 1993 (Psychological Review) — the original deliberate-practice framework",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "learners", "performers", "knowledge-workers"],
      validationNotes:
        "Deliberate practice (as Ericsson defined it — targeted, feedback-rich, at the edge) is the strongest predictor of expert performance across music, chess, sport, and surgery; 10,000-hour pop-reading is a weaker framing of the underlying mechanism",
    },
    contextTags: ["growth", "skill", "foundational"],
    contraindications: [
      "Early burnout / overtraining — deliberate practice is high-cost; rest days matter as much as work days",
      "Complete novices: spend the first phase with a coach or structured curriculum before trying to self-direct",
    ],
    links: [
      { rpplId: "rppl:practice:deep-work-block:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:teaching-as-learning:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:first-principles:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:deep-work-block:v1",
    type: "practice",
    name: "Deep Work Block",
    domain: "growth",
    domains: ["money", "purpose"],
    description:
      "A protected 60–120 minute block — no Slack, no email, no 'quick checks' — devoted to a single cognitively demanding task. The point isn't asceticism; it's recognizing that a knowledge worker's economic and creative output comes almost entirely from hours like these, and that fragmented attention destroys the output without reducing the hours. Most professionals manage one or two of these a day at most. That's enough to double what they produce.",
    trigger:
      "A calendar block defended like a meeting you can't miss. Begins with closing every non-essential tab and putting the phone out of sight.",
    steps: [
      "Name the one outcome this block will produce — specific enough that you'll know at the end whether you got there",
      "Close email, Slack, chat apps. Phone in another room or in a drawer",
      "Set a timer for 60–120 minutes — most people hit a ceiling around 90, build toward that",
      "If stuck: stay with the problem. Resist the impulse to 'check something quickly' — the check is the leak",
      "End the block with 5 minutes writing down where you stopped and what the next move is — entry point for next session",
    ],
    timeWindow: "60–120 min, 1–3 blocks/day",
    servesPrinciples: [
      "rppl:principle:attention-grows:v1",
      "rppl:principle:leverage-points:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:pareto-few:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Calendar autonomy", portType: "boolean", key: "calendar_autonomy" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "High-leverage output", portType: "state", key: "deep_work_output" },
      { name: "Focus capacity", portType: "state", key: "focus" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Attention research / knowledge work productivity",
      keyReference:
        "Cal Newport, 'Deep Work' (2016); Mihaly Csikszentmihalyi on flow; Sophie Leroy 2009 on attention residue from task-switching",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["knowledge-workers", "creatives", "researchers", "founders"],
      validationNotes:
        "Attention-residue and task-switching cost literature is well-established; the specific 'deep work' protocol is practitioner-validated at scale rather than RCT-tested",
    },
    contextTags: ["attention", "work", "output"],
    contraindications: [
      "Roles with genuine on-call duties (medical, infra, customer-critical) — pair with a teammate who holds the pager during your block",
      "ADHD without support: start with 25-min Pomodoros and build up — 90 minutes cold is demoralizing",
    ],
    links: [
      { rpplId: "rppl:practice:hard-stop:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:deliberate-practice:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:flow-states:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:spaced-repetition:v1",
    type: "practice",
    name: "Spaced Repetition Review",
    domain: "growth",
    description:
      "Instead of re-reading or highlighting, the material you want to actually remember is encoded as question/answer cards and reviewed on an expanding schedule — today, in two days, in a week, in a month. The forgetting curve is a mechanical feature of memory; spaced repetition exploits it instead of fighting it. Ten minutes a day, sustained, retains more than hours of cramming.",
    trigger:
      "A fixed 5–15 minute daily slot (often right after morning pages or first coffee) when the review app is opened and the day's due cards are cleared.",
    steps: [
      "Choose a tool: Anki, Mochi, or a physical Leitner box — the mechanism matters more than the app",
      "Make cards only from material you actually want to retain — not everything you read",
      "Minimum-information principle: one fact per card, phrased as a concrete question, not a vague prompt",
      "Review every day — consistency beats session length. Missing 3 days means the schedule collapses",
      "When a card fails repeatedly: it's the card, not your memory. Rewrite it into two simpler cards",
    ],
    timeWindow: "5–15 minutes daily",
    servesPrinciples: [
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:signal-not-noise:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Review tool", portType: "boolean", key: "srs_tool_available" },
      { name: "Daily slot", portType: "resource", key: "daily_review_slot" },
    ],
    outputs: [
      { name: "Long-term retention", portType: "state", key: "long_term_retention" },
      { name: "Active recall capacity", portType: "state", key: "recall_capacity" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Cognitive science / memory research",
      keyReference:
        "Hermann Ebbinghaus, 'Über das Gedächtnis' (1885) — original forgetting curve; Piotr Woźniak's SuperMemo research; Karpicke & Roediger 2008 on testing effect",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["students", "language-learners", "medical-trainees", "any-knowledge-work"],
      validationNotes:
        "Spacing effect and testing effect are among the most replicated findings in cognitive psychology; practical SRS gains are substantial in vocabulary and medical-exam domains",
    },
    contextTags: ["growth", "memory", "daily"],
    contraindications: [
      "Overuse as substitute for understanding — cards of things you don't really grasp become noise",
      "Skill-based learning (motor, creative) — spaced repetition is for facts and concepts, not for muscle memory or taste",
    ],
    links: [
      { rpplId: "rppl:practice:focused-reading-habit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:teaching-as-learning:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:focused-reading-habit:v1",
    type: "practice",
    name: "Focused Reading Habit",
    domain: "growth",
    domains: ["joy", "purpose"],
    description:
      "15 to 30 minutes of deliberate reading daily — books or long-form, never a phone feed — in a fixed place and time, with a pen. This is both intellectual infrastructure and a contrast practice against fragmented-scroll reading. The compounded effect of 30 minutes daily across a decade is not a few extra books — it's a different shape of mind.",
    trigger:
      "A consistent slot (morning coffee, lunch, pre-bed) paired with a consistent place and a physical book pre-staged.",
    steps: [
      "Pick a book slightly above comfortable difficulty — easy reads make for slow minds",
      "Read with a pen in hand — underline, note, argue in the margin. Passive reading is half-reading",
      "Go 15–30 minutes minimum. Put the phone in another room. Re-read a paragraph when you notice your eyes moved without understanding",
      "End each session writing one sentence: what struck you, or one question the reading raised",
      "If a book stops earning your time: drop it without guilt. Reading is not an obligation",
    ],
    timeWindow: "15–30 minutes daily, same time and place",
    servesPrinciples: [
      "rppl:principle:attention-grows:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:small-patterns-compose:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Book available", portType: "boolean", key: "book_access" },
      { name: "Quiet slot", portType: "resource", key: "reading_slot" },
    ],
    outputs: [
      { name: "Knowledge base", portType: "state", key: "knowledge_base" },
      { name: "Attention stamina", portType: "state", key: "attention_stamina" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Reading practice / literary tradition",
      keyReference:
        "Mortimer Adler, 'How to Read a Book' (1940); Naomi Baron, 'Words Onscreen' (2015) on comprehension differences across media; Maryanne Wolf, 'Reader, Come Home' (2018)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "students", "knowledge-workers", "phone-heavy-users"],
      validationNotes:
        "Comprehension differences between paper and screen reading are well-documented; the broader claim that daily focused reading restructures attention is practitioner-validated and aligned with neuroplasticity literature",
    },
    contextTags: ["attention", "growth", "daily"],
    contraindications: [
      "Active reading disability: use audiobooks + notes — the medium serves the same end",
      "Exhausted parents of young children: 10 minutes before sleep is a legitimate version",
    ],
    links: [
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:spaced-repetition:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:morning-pages:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:teaching-as-learning:v1",
    type: "practice",
    name: "Teach-to-Learn (Feynman Technique)",
    domain: "growth",
    description:
      "The fastest way to find out what you actually understand is to explain it — out loud, in writing, or to a real person — using plain language and no jargon. Where your explanation breaks, your understanding breaks. The practice is not 'teach after you've learned' but 'teach in order to learn.' Done regularly, it converts passive consumption into compounding comprehension.",
    trigger:
      "Finishing any significant piece of learning — a chapter, a lecture, a work-problem you just solved. Before moving on, you explain it.",
    steps: [
      "Pick the concept. State what you think you understand in one sentence",
      "Explain it in plain language — as if to a curious 12-year-old or a smart friend in a different field",
      "Notice every place you reach for jargon, hand-wave, or say 'basically' — those are the gaps",
      "Go back to the source material and close the specific gap, not just skim the whole thing again",
      "Re-explain. Optional: publish the explanation (blog, team wiki, teach a colleague) — public commitment raises the bar",
    ],
    timeWindow: "10–30 min per concept, anytime post-learning",
    servesPrinciples: [
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:question-over-answer:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Audience or writing surface", portType: "boolean", key: "teaching_surface" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Genuine understanding", portType: "state", key: "understanding_depth" },
      { name: "Gap detection", portType: "state", key: "knowledge_gaps_identified" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Pedagogy / Feynman technique",
      keyReference:
        "Richard Feynman, 'Surely You're Joking, Mr. Feynman!' (1985); the 'protégé effect' literature — Nestojko et al. 2014 on expecting-to-teach improves learning",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["students", "professionals", "tutors", "writers"],
      validationNotes:
        "The protégé effect — learning more when you expect to teach — has been replicated in multiple studies; classroom research on 'learning-by-teaching' is well-established",
    },
    contextTags: ["growth", "understanding", "honesty"],
    contraindications: [
      "Performative teaching of things you don't yet grasp — harmful if the audience takes it seriously. Teach in lower-stakes contexts first",
    ],
    links: [
      { rpplId: "rppl:practice:deliberate-practice:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:learning-in-public:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:trivium:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:learning-in-public:v1",
    type: "practice",
    name: "Learning in Public",
    domain: "growth",
    domains: ["people", "purpose"],
    description:
      "Sharing what you're learning while you're learning it — rough notes, half-baked thoughts, weekly updates — rather than waiting to 'become an expert' first. The mechanism is three-fold: it forces clarity (teaching-as-learning), it compounds serendipity (the right person finds you), and it builds a body of work that becomes the foundation of a reputation. The bar to start is much lower than ego expects.",
    trigger:
      "A weekly rhythm — the same day and time — when you publish one thing: a short post, a thread, a project log, a video.",
    steps: [
      "Pick one channel where your target audience already lives — blog, Substack, X/Twitter, LinkedIn, YouTube, GitHub — and commit to it",
      "Choose a weekly cadence you can actually sustain for 6 months — better one post/week for a year than five/week for a month",
      "Share what you're learning, not what you've mastered — include the confusion, the dead-ends, the unresolved questions",
      "Respond to every thoughtful comment for the first year — that's where the serendipity lives",
      "After 6 months, review: what did you actually learn from publishing, who showed up, what should the next 6 months be?",
    ],
    timeWindow: "Weekly publication; response/engagement threaded through the week",
    servesPrinciples: [
      "rppl:principle:growth-at-edges:v1",
      "rppl:principle:diversity-resilience:v1",
      "rppl:principle:own-consequences:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Channel access", portType: "boolean", key: "publishing_channel" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Public body of work", portType: "state", key: "body_of_work" },
      { name: "Network quality", portType: "state", key: "network_quality" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Internet-native learning / creator economy",
      keyReference:
        "Shawn @swyx Wang, 'Learn In Public' essay (2018); David Perell writings on writing online; Austin Kleon, 'Show Your Work!' (2014)",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["professionals", "creatives", "career-changers", "freelancers"],
      validationNotes:
        "Practitioner-validated at scale across tech, writing, and creative fields; no RCT evidence, but the mechanism (feedback + serendipity + portfolio) is straightforward",
    },
    contextTags: ["growth", "public", "weekly"],
    contraindications: [
      "Roles with strict employer or legal confidentiality — scope what can be shared first",
      "Active mental-health crisis — the exposure and comments can worsen a hard period",
      "Platforms with algorithmic volatility: don't build your entire sense-of-self on metrics you don't control",
    ],
    links: [
      { rpplId: "rppl:practice:teaching-as-learning:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:hard-stop:v1", relationship: "synergy" },
    ],
  },

  // ━━━ PURPOSE & MEANING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:essence-probe:v1",
    type: "practice",
    name: "Essence Probe",
    domain: "purpose",
    domains: ["identity", "growth"],
    description:
      "A structured self-inquiry practice — monthly or quarterly — aimed at what's actually underneath the roles, tasks, and identities of the current moment. Not journaling in the open sense. A specific set of probing questions, answered honestly, that surface what you care about at the level below your current strategies. This is the practice that keeps aspirations rooted in something real rather than drifting toward what sounds impressive.",
    trigger:
      "A monthly or quarterly appointment with yourself — same time each cycle, a quiet place, 45–90 minutes blocked, phone elsewhere.",
    steps: [
      "Question 1: If no one were watching or measuring, what would I be doing with this season of my life?",
      "Question 2: What have I been pretending not to know about my life lately?",
      "Question 3: What's the difference between who I'm being and who I'd respect?",
      "Question 4: Which of my current 'goals' would I still pursue if success were guaranteed? Which would I drop if success were impossible?",
      "Write answers long-hand, without editing. Read them aloud. Notice which answers you want to take back — those are the signal",
    ],
    timeWindow: "45–90 minute session, monthly or quarterly",
    servesPrinciples: [
      "rppl:principle:test-inherited-beliefs:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:question-over-answer:v1",
      "rppl:principle:shadow-controls:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:awareness:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Protected solitude", portType: "boolean", key: "solitude_access" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Values clarity", portType: "state", key: "values_clarity" },
      { name: "Role/identity distinction", portType: "state", key: "identity_distinction" },
      { name: "Direction signal", portType: "state", key: "direction_signal" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Socratic inquiry / contemplative psychology / Internal Family Systems",
      keyReference:
        "Parker Palmer, 'Let Your Life Speak' (2000); James Hollis, 'What Matters Most' (2009); Socratic elenchus tradition; IFS 'unblending' practice",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["adults", "mid-career", "life-transitions", "parents", "leaders"],
      validationNotes:
        "Structured self-inquiry has long contemplative and therapeutic grounding; specific 4-question format is practitioner-distilled and designed to surface the gap between stated and actual values",
    },
    contextTags: ["purpose", "identity", "quarterly"],
    contraindications: [
      "Active depressive episode — the probing can spiral; pair with a therapist or postpone",
      "Post-traumatic period — gentler practices (body-based, supported) may be more appropriate first",
    ],
    links: [
      { rpplId: "rppl:practice:values-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:eulogy-exercise:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:socratic-method:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:jungian-psychology:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:values-audit:v1",
    type: "practice",
    name: "Values Audit",
    domain: "purpose",
    domains: ["identity"],
    description:
      "A side-by-side examination of the values you name when asked and the values revealed by where your time, money, and attention actually went this past month. Stated values are cheap; enacted values are the real ones. The gap between the two is the most actionable data about your life — and it can only be seen when written down.",
    trigger:
      "A monthly review slot (end of month or first week of next) with last month's calendar, bank statements, and screen-time data open.",
    steps: [
      "Write 5–8 values you'd claim matter to you — no ranking, just the words",
      "For each value, note one specific behavior from the past month that enacted it — and one where you acted against it",
      "Add up hours spent on the top 3 stated values in the last week — compare to hours actually spent on them",
      "Where stated and enacted diverge most: name it plainly. 'I say family matters most; I spent 6 hours with them and 42 at work'",
      "Choose one tangible change for the next month — a time block, a deletion, a boundary — not a resolution. A move",
    ],
    timeWindow: "60 min, monthly",
    servesPrinciples: [
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:test-inherited-beliefs:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:own-consequences:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Time/spend data", portType: "boolean", key: "historical_data_access" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Values-behavior gap", portType: "state", key: "values_behavior_gap" },
      { name: "Priority clarity", portType: "state", key: "priority_clarity" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Acceptance and Commitment Therapy (ACT) / Stoic examen",
      keyReference:
        "Steven Hayes et al. on ACT values work; Russ Harris, 'The Happiness Trap' (2008); the Stoic end-of-day examen tradition (Seneca, Marcus Aurelius)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "goal-oriented", "mid-life", "parents"],
      validationNotes:
        "ACT-style values work has clinical evidence for wellbeing outcomes; the data-driven audit variant is a practical adaptation with widespread practitioner use",
    },
    contextTags: ["purpose", "identity", "monthly"],
    contraindications: [
      "Tendency toward harsh self-criticism — add a 'what went well' pass first, or do this with a coach",
    ],
    links: [
      { rpplId: "rppl:practice:essence-probe:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:stoic-bookends:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:eulogy-exercise:v1",
    type: "practice",
    name: "Eulogy Exercise",
    domain: "purpose",
    domains: ["identity"],
    description:
      "Write what you'd want said about you at your funeral — by the three or four people who'd know you best. Not in a morbid key; as a planning tool. Working backward from that specific end surfaces what actually matters to you with a clarity that forward-looking goals rarely do. Most people discover the gap between the eulogy they'd want and the life they're building is not small.",
    trigger:
      "An annual or semi-annual ritual — often paired with a new year or birthday — 60–90 minutes in one sitting.",
    steps: [
      "Identify the 3–4 people whose eulogy of you would matter most (partner, child, closest friend, mentor)",
      "For each, write what you'd want them to say — not bullet points; paragraphs, in their voice",
      "Compare to your current trajectory: what would each of them actually say about you today?",
      "Name the gap: what would need to change — in the next 5 years, the next year, the next month — for their true eulogy to match the wanted one?",
      "Re-read annually. The answers shift as you age; that's part of the data",
    ],
    timeWindow: "60–90 min, annually or semi-annually",
    servesPrinciples: [
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:leverage-points:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Uninterrupted time", portType: "boolean", key: "ritual_time" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Long-horizon clarity", portType: "state", key: "long_horizon_clarity" },
      { name: "Values prioritization", portType: "state", key: "values_prioritization" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Stoic memento mori / Covey principles / narrative therapy",
      keyReference:
        "Stephen Covey, 'The 7 Habits of Highly Effective People' (1989) — 'begin with the end in mind'; Stoic memento mori tradition; Bronnie Ware, 'The Top Five Regrets of the Dying' (2011)",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["adults", "mid-life", "post-loss", "major-decision-points"],
      validationNotes:
        "No direct trial evidence; long-standing tradition across Stoic, Christian, and Buddhist practice. Regret-minimization framing has durable utility for major life decisions",
    },
    contextTags: ["purpose", "mortality", "annual"],
    contraindications: [
      "Recent bereavement — wait until the acute grief has settled; the exercise can collapse into rumination",
      "Terminal illness — a different, softer version is appropriate; do with a counselor if done at all",
    ],
    links: [
      { rpplId: "rppl:practice:essence-probe:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:qol-statement:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:stoicism:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:stoic-bookends:v1",
    type: "practice",
    name: "Stoic Morning & Evening Bookends",
    domain: "purpose",
    domains: ["identity", "body"],
    description:
      "Two short reflective moments — one in the morning, one at night — structured after the Stoic practice of praemeditatio malorum (morning) and examen (evening). The morning sets intention against likely friction; the evening reviews what was done against what was intended. Ten minutes total. Practiced consistently, it produces a quiet, incremental moral steering that willpower alone cannot.",
    trigger:
      "Two cues: the first quiet moment of the morning (post-coffee, pre-inbox) and the last quiet moment of the evening (post-teeth, pre-sleep).",
    steps: [
      "MORNING (5 min): Write one sentence — what kind of person do I want to be today? Then name the 1–2 likely frictions (a difficult meeting, an old pattern) and how you intend to meet them",
      "Throughout the day: when friction arrives, the morning sentence is the compass — not an answer, a direction",
      "EVENING (5 min): Three questions — What did I do well today? Where did I fall short? What will I do differently tomorrow?",
      "Be honest, be brief, do not spiral. The practice is reflection, not self-flagellation",
      "Keep both in the same notebook — over months it becomes an honest ledger of your direction",
    ],
    timeWindow: "5 min morning + 5 min evening, daily",
    servesPrinciples: [
      "rppl:principle:response-not-circumstances:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:own-consequences:v1",
      "rppl:principle:voluntary-power:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Notebook", portType: "boolean", key: "notebook_available" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Intentional day", portType: "state", key: "daily_intention" },
      { name: "Self-knowledge", portType: "state", key: "self_knowledge" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Stoicism",
      keyReference:
        "Marcus Aurelius, 'Meditations' (Books 2 and 5 especially); Seneca, 'On Anger' (Book III) on the evening examen; Epictetus, 'Discourses' on morning praemeditatio",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "professionals", "parents", "anyone-with-daily-friction"],
      validationNotes:
        "The Stoic examen has 2,000 years of practitioner tradition across Stoic, Ignatian, and secular variants; modern gratitude-journaling research overlaps with the evening practice",
    },
    contextTags: ["purpose", "daily", "bookend"],
    contraindications: [
      "High-self-criticism profiles — lean the evening questions toward 'what did I do well' until the habit is stable",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:wind-down-routine:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:morning-pages:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:stoicism:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:qol-statement:v1",
    type: "practice",
    name: "Quality-of-Life Statement",
    domain: "purpose",
    domains: ["identity", "home", "money"],
    description:
      "The Holistic Management three-part description of the life you're trying to build: what you want your life to feel like, the foundational behaviors that produce that feeling, and the future resource base (people, land, capital, capacities) required to sustain it. Written once, revisited quarterly. Every significant decision gets tested against it: does this move us toward the described life, or away from it?",
    trigger:
      "A deliberate session (alone, or with partner for shared lives) — 2–4 hours, usually paired with an annual or semi-annual review.",
    steps: [
      "Part 1 — QUALITY OF LIFE: describe in sensory detail what you want the day-to-day to feel like. Not 'happy' — specific scenes, pace, relationships, the texture of time",
      "Part 2 — FORMS OF PRODUCTION: the recurring behaviors and roles that produce that life — the work you do, the care you give, the practices you keep",
      "Part 3 — FUTURE RESOURCE BASE: the people, land, tools, capital, health, knowledge, and reputation you need to still be doing this in 20 years",
      "Write it as prose, not bullets. Paragraphs a spouse or close friend would recognize as yours",
      "Use it as a decision filter for the next quarter — every significant 'should I?' gets tested against the statement",
    ],
    timeWindow: "2–4 hour session, revisit quarterly",
    servesPrinciples: [
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:multiple-yields:v1",
      "rppl:principle:permanence-order:v1",
      "rppl:principle:integrate-not-segregate:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Long block of time", portType: "resource", key: "review_block" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Decision filter", portType: "state", key: "decision_filter" },
      { name: "Life coherence", portType: "state", key: "life_coherence" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
      { name: "Cultural capital", portType: "capital", key: "cultural" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Holistic Management (Allan Savory)",
      keyReference:
        "Allan Savory, 'Holistic Management: A Commonsense Revolution to Restore Our Environment' (3rd ed, 2016); Savory Institute training materials on the three-part holisticgoal",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["family-units", "farmers", "business-owners", "couples", "any-long-horizon"],
      validationNotes:
        "Practitioner-validated across Savory-trained farms, businesses, and families for 40+ years; no RCT, but strong structural reason the three parts together outperform any part alone",
    },
    contextTags: ["purpose", "foundational", "quarterly"],
    contraindications: [
      "Major life instability (recent loss, breakup, job loss) — wait until the ground is steady enough to describe it honestly",
    ],
    links: [
      { rpplId: "rppl:practice:essence-probe:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:values-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:legacy-project:v1",
    type: "practice",
    name: "Legacy Project",
    domain: "purpose",
    domains: ["growth"],
    description:
      "One piece of work that outlasts you — a book, a garden, a family archive, a codebase, a body of teaching, a restored piece of land — built slowly across years, protected from the weekly urgency cycle. Not required for a meaningful life, but for those who feel the pull, naming it explicitly and blocking real time for it is the difference between finishing it and looking back wishing you had.",
    trigger:
      "An annual decision of what the project is (or that it remains the same), plus a weekly or monthly block reserved for work on it — outside normal 'work' hours if necessary.",
    steps: [
      "Name it specifically — 'a book on X,' 'a restored 40 acres,' 'a twenty-year photographic archive of the family.' Vague doesn't compound",
      "Allocate a recurring block — 4 hours a week minimum is a common floor for meaningful progress",
      "Define a first milestone small enough to hit in 90 days and big enough to prove the project is real",
      "Protect the time with the same firmness as a job — legacy work dies quietly in the gap between 'important' and 'urgent'",
      "Review annually: is this still the project? Is it still alive? If abandoned, name the reason; don't pretend",
    ],
    timeWindow: "Weekly 2–8 hour block over multiple years",
    servesPrinciples: [
      "rppl:principle:permanence-order:v1",
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:growth-at-edges:v1",
      "rppl:principle:leverage-points:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Long-horizon slack", portType: "resource", key: "long_horizon_time" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Body of lasting work", portType: "state", key: "lasting_work" },
      { name: "Meaning density", portType: "state", key: "meaning_density" },
      { name: "Cultural capital", portType: "capital", key: "cultural" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Generativity (Erikson) / craft traditions",
      keyReference:
        "Erik Erikson, 'Childhood and Society' (1950) on generativity vs. stagnation in middle adulthood; Lewis Hyde, 'The Gift' (1983) on work meant to outlast the maker",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["mid-life", "late-career", "parents", "creatives", "craftspeople"],
      validationNotes:
        "Generativity as a developmental task is well-grounded in Eriksonian psychology; specific project-work practice is practitioner-validated across craft, writing, and land-restoration communities",
    },
    contextTags: ["purpose", "long-horizon", "weekly"],
    contraindications: [
      "Survival phase of life (early parenthood, financial crisis) — protect the intention, scale back the time, don't add guilt",
      "Performative legacy chasing — if the motive is 'be remembered,' the work tends to hollow out; examine motive",
    ],
    links: [
      { rpplId: "rppl:practice:deep-work-block:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:qol-statement:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:hard-stop:v1", relationship: "synergy" },
    ],
  },

  // ━━━ JOY & REST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:hard-stop:v1",
    type: "practice",
    name: "End-of-Workday Hard Stop",
    domain: "joy",
    domains: ["body", "people", "growth"],
    description:
      "A fixed time — enforced like a physical law — when the workday ends. Laptop closed, tabs shut, tools put down, notifications muted until tomorrow. Not a soft 'wrap up soon.' A firm boundary that completes the day's open loops via a shutdown ritual so the nervous system can actually exit work mode. Without it, knowledge workers and entrepreneurs bleed work into evening, family time, and sleep — not because the extra hours help, but because the stop wasn't designed.",
    trigger:
      "A specific clock time (e.g. 5:30pm, or sundown for seasonal workers) that is the same every working day. When the time arrives, the shutdown sequence begins regardless of task state.",
    steps: [
      "5 minutes before the stop: write down tomorrow's first move and what 'open' items need to be re-entered — so the brain can release them",
      "Close laptop, shut tabs, log out of work chat — signal to the nervous system that work is actually done",
      "Say a fixed phrase aloud ('done for today' works) — a verbal cue reinforces the transition (Newport's 'shutdown complete')",
      "Transition with a physical action: change clothes, walk, cook, greet family — don't slide directly from screen to couch",
      "Emergencies only reopen the laptop. Everything else waits until tomorrow's first block",
    ],
    timeWindow: "Same clock time, every working day",
    servesPrinciples: [
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:self-regulation-freedom:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "End-time autonomy", portType: "boolean", key: "end_time_autonomy" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Work/life boundary", portType: "state", key: "work_life_boundary" },
      { name: "Evening presence", portType: "state", key: "relational_presence" },
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Work boundary research / Deep Work practice",
      keyReference:
        "Cal Newport, 'Deep Work' (2016) — shutdown ritual protocol; Sonnentag et al. on psychological detachment from work and recovery; 'always-on' culture critiques (Pang, 'Rest')",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["knowledge-workers", "entrepreneurs", "remote-workers", "parents", "creatives"],
      validationNotes:
        "Psychological-detachment research consistently finds that the ability to mentally disengage from work post-workday predicts recovery, sleep, and next-day performance; shutdown ritual is a practical mechanism for producing detachment",
    },
    contextTags: ["work", "boundary", "daily", "foundational"],
    contraindications: [
      "Genuine on-call rotations (medical, infra) — scope hard-stop to off-call days",
      "Farmer / founder phases where the work is genuinely open-ended — use sundown or a natural boundary instead of clock time",
      "Partners who haven't agreed — the practice strains households when imposed unilaterally; negotiate first",
    ],
    links: [
      { rpplId: "rppl:practice:deep-work-block:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:wind-down-routine:v1", relationship: "enables" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "enables" },
    ],
  },

  {
    rpplId: "rppl:practice:sabbath-weekly:v1",
    type: "practice",
    name: "Weekly Sabbath",
    domain: "joy",
    domains: ["people", "purpose"],
    description:
      "One full day every week where the work is not done. Not 'catch-up Sunday' — a real stop. The tradition is older than any productivity system, and every culture that has tried it found the six days of work got better, not worse. In religious form it anchors to a specific day and theology; in secular form it requires explicit design, because the gravitational pull of modern life is toward seven working days.",
    trigger:
      "A fixed day (and ideally a fixed start and end — sundown-to-sundown is traditional; Friday evening through Saturday evening, or Saturday sundown through Sunday sundown, are common).",
    steps: [
      "Pick the day and the start/end points — written down, communicated to household and close collaborators",
      "Prep in advance: cook, shop, finish the urgent items by the start time — the day should require no 'one quick thing'",
      "At start: work tools out of sight. Laptop in a drawer. Work phone off (personal phone restricted)",
      "Fill the day with what renews you — nature, rest, worship if that's your tradition, unhurried food, people you love, a hobby with no outcome",
      "Re-enter gently. Don't let the feed or the inbox be the first thing that greets you on the other side",
    ],
    timeWindow: "24h weekly (or 12h as a starter)",
    servesPrinciples: [
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:time-is-wheel:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Weekend / off-day autonomy", portType: "boolean", key: "weekly_off_day" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Recovery depth", portType: "state", key: "recovery_depth" },
      { name: "Work-week quality", portType: "state", key: "work_week_quality" },
      { name: "Relational presence", portType: "state", key: "relational_presence" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
      { name: "Cultural capital", portType: "capital", key: "cultural" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Sabbath traditions (Jewish / Christian) / secular rest-practice literature",
      keyReference:
        "Abraham Joshua Heschel, 'The Sabbath' (1951); Walter Brueggemann, 'Sabbath as Resistance' (2014); Tiffany Shlain, '24/6' (2019); Alex Soojung-Kim Pang, 'Rest' (2016)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "families", "knowledge-workers", "religious-traditions", "burnout-prone"],
      validationNotes:
        "Millennia of practitioner tradition across religious communities; emerging clinical research on psychological detachment and weekly recovery supports the mechanism",
    },
    contextTags: ["rest", "weekly", "foundational"],
    contraindications: [
      "Caregivers of infants or chronically ill — a full sabbath is aspirational; a half-day or shared rotation is realistic",
      "Solo parents: partner with community; a weekly stop is nearly impossible alone and non-negotiable for sustainability",
    ],
    links: [
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:hard-stop:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:nature-exposure-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:taoism:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:scheduled-play:v1",
    type: "practice",
    name: "Scheduled Play",
    domain: "joy",
    domains: ["body", "people"],
    description:
      "Weekly time blocked for activity that has no outcome — not exercise, not networking, not skill-building. Play in the full Stuart Brown sense: voluntary, seemingly purposeless, apparently frivolous, with a sense of timelessness. Adults who stop playing don't become more productive; they become more brittle. Scheduling it is necessary precisely because, as an adult, there's no external structure that puts it back on the calendar.",
    trigger:
      "A recurring weekly block (e.g. 2 hours Saturday morning) — scheduled like any other appointment so it doesn't get evaporated by 'errands.'",
    steps: [
      "Identify what you actually find playful — not 'should be fun' — by recalling what you lost yourself in as a child or young adult",
      "Block the time weekly, minimum 90 minutes — short sessions rarely reach the depth where play actually refreshes",
      "Remove the outcome frame — if you track, compete, or monetize it, it's not play anymore (different activity, different day)",
      "Permit 'wasting time' inside the block — that is the signal the practice is working",
      "Track how you feel in the rest of the week — the compound effect shows up 3–6 months in, not week to week",
    ],
    timeWindow: "90+ min weekly",
    servesPrinciples: [
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:multiple-yields:v1",
      "rppl:principle:diversity-resilience:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Discretionary time", portType: "resource", key: "play_time" },
      { name: "Humility", portType: "capacity", key: "humility" },
    ],
    outputs: [
      { name: "Creative reserves", portType: "state", key: "creative_reserves" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Stress recovery", portType: "state", key: "stress_recovery" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Play research / developmental psychology",
      keyReference:
        "Stuart Brown, 'Play: How It Shapes the Brain, Opens the Imagination, and Invigorates the Soul' (2009); Brian Sutton-Smith on play across the lifespan",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "overworked", "parents", "creatives"],
      validationNotes:
        "Stuart Brown's play research synthesizes evidence from neuroscience, anthropology, and clinical work; specific 'scheduled adult play' protocol is practitioner-adapted and widely found useful",
    },
    contextTags: ["joy", "weekly", "restoration"],
    contraindications: [
      "Parents of young children — 'playing with the kids' can count if you're actually in play mode, not managing them",
      "Chronic depression: play blocks can feel impossible at first; start with passive enjoyment (music, nature) and let activity return",
    ],
    links: [
      { rpplId: "rppl:practice:sabbath-weekly:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:joy-inventory:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:nature-exposure-daily:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:joy-inventory:v1",
    type: "practice",
    name: "Joy Inventory",
    domain: "joy",
    domains: ["identity"],
    description:
      "A two-column tracker, kept for a month, that separates what you think should bring joy from what actually brings joy in observation. The list typically surprises everyone who keeps it — the activities on one side routinely fail to show up on the other. The purpose is not hedonism; it's information. You cannot design a meaningful life around imagined sources of joy, only around the actual ones.",
    trigger:
      "A 30-day observation window, started deliberately, with a simple notebook or note-app template staged for daily use.",
    steps: [
      "Day 1: list 10–15 things you'd claim bring you joy — activities, people, places, moods",
      "Each night for 30 days: write one line on today's genuine joy moments — specific scenes, not categories",
      "At 30 days: compare the two lists. Highlight what appears on the expected list but never in the logs",
      "Highlight what appears in the logs but never in the expected list — these are the undercredited sources",
      "Redesign one week around the logs, not the theory. Notice what changes",
    ],
    timeWindow: "30-day observation; 1–2 min/day logging",
    servesPrinciples: [
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:test-inherited-beliefs:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Notebook or app", portType: "boolean", key: "joy_log_tool" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Authentic joy map", portType: "state", key: "joy_map" },
      { name: "Self-knowledge", portType: "state", key: "self_knowledge" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Positive psychology / affective forecasting research",
      keyReference:
        "Dan Gilbert, 'Stumbling on Happiness' (2006) on affective-forecasting errors; Sonja Lyubomirsky on experiential sampling; practitioner traditions in ACT around 'contacting the present moment'",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "mid-life", "burnout-recovery", "identity-transitions"],
      validationNotes:
        "Affective-forecasting research shows humans systematically mispredict what will bring joy; diary/sampling methods reliably reveal the gap between predicted and actual affect",
    },
    contextTags: ["joy", "self-knowledge", "monthly"],
    contraindications: [
      "Anhedonic depression — 'nothing brings joy' is a symptom, not a true finding; get clinical support first",
    ],
    links: [
      { rpplId: "rppl:practice:scheduled-play:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:values-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:essence-probe:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:creative-ship-small:v1",
    type: "practice",
    name: "Ship Small to Break Creative Resistance",
    domain: "joy",
    domains: ["growth", "purpose"],
    description:
      "The phenomenon called 'writer's block' or 'creative block' is rarely a failure of imagination — it's fear of shipping something imperfect. The protocol: when stuck on a large creative work, define the smallest possible public artifact adjacent to it and ship that within 48 hours. A sketch, a thread, a rough demo, a 500-word piece. The point isn't the artifact; it's reconnecting the nervous system to the experience of shipping and surviving.",
    trigger:
      "Any time you've been 'stuck' on a piece of creative work for more than 2 weeks with no movement, or when you notice avoidance patterns (research loops, gear acquisition, re-planning) in place of making.",
    steps: [
      "Name the resistance accurately — not 'no ideas,' but 'I'm afraid this won't be good enough'",
      "Define the smallest ship-able thing you can make adjacent to the stuck work — one scene, one drawing, one 3-minute video",
      "Give it a 48-hour ceiling. Set a fixed publish time. Cap the perfection budget",
      "Ship on schedule regardless of quality judgment — the act of publishing is the intervention",
      "Note what actually happened after you shipped — usually: much less than ego predicted, which is the data",
    ],
    timeWindow: "48-hour cycle when stuck; repeat as needed",
    servesPrinciples: [
      "rppl:principle:growth-at-edges:v1",
      "rppl:principle:stress-as-input:v1",
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:cause-and-effect:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Publishing surface", portType: "boolean", key: "publishing_surface" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Creative flow restored", portType: "state", key: "creative_flow" },
      { name: "Perfectionism calibration", portType: "state", key: "perfectionism_calibration" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Creative practice / exposure therapy principles",
      keyReference:
        "Steven Pressfield, 'The War of Art' (2002) on 'Resistance'; Anne Lamott, 'Bird by Bird' (1994) on shitty first drafts; exposure-and-response-prevention therapy parallels for perfectionism",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["creatives", "writers", "designers", "founders", "perfectionists"],
      validationNotes:
        "Practitioner-validated across writing and design communities; the underlying mechanism (exposure to feared outcome, discovery of non-catastrophic result) is aligned with clinical exposure research",
    },
    contextTags: ["joy", "creative", "as-needed"],
    contraindications: [
      "Context where shipping poorly has real consequences (client deliverables, high-stakes publication) — use an internal-only version for the practice",
      "Active burnout — the cure for burnout is rest, not more shipping; don't use this protocol as a willpower prod",
    ],
    links: [
      { rpplId: "rppl:practice:learning-in-public:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:deep-work-block:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:antifragility:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:seasonal-review:v1",
    type: "practice",
    name: "Seasonal Review",
    domain: "purpose",
    domains: ["identity", "growth", "joy"],
    description:
      "A 90-day cycle is short enough to course-correct and long enough for a practice to prove itself. Four times a year, a dedicated session reviews what the last season produced (not just tasks — state, health, relationships, direction) and sets the shape of the next. Paired with solstice/equinox timing when possible, the practice re-anchors personal planning to natural rhythms older than any quarterly review.",
    trigger:
      "A fixed day each quarter (often on or near solstice/equinox), 2–3 hours blocked, ideally somewhere different from the usual workspace.",
    steps: [
      "LOOK BACK: what happened this season? In each life dimension (body, people, money, home, growth, joy, purpose, identity), name one thing that improved and one that slipped",
      "EVIDENCE: pull actual data — calendar, sleep, spending, health metrics, journal — don't review from memory alone",
      "GRATITUDE + HARVEST: three things you're grateful for; three lessons the season taught that you want to carry forward",
      "SHAPE THE NEXT SEASON: one theme (not a list of goals), one practice to install, one to retire",
      "Commit to the monthly touch-points that will keep the season honest — don't review once and coast",
    ],
    timeWindow: "2–3 hour session, quarterly",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:time-is-wheel:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:whole-context-decisions:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Historical data", portType: "boolean", key: "quarterly_data_access" },
      { name: "Uninterrupted session", portType: "resource", key: "quarterly_block" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Seasonal clarity", portType: "state", key: "seasonal_clarity" },
      { name: "Course correction", portType: "state", key: "course_correction" },
      { name: "Life coherence", portType: "state", key: "life_coherence" },
      { name: "Spiritual capital", portType: "capital", key: "spiritual" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Cyclical time traditions / agile retrospective / annual-review culture",
      keyReference:
        "Holistic Management quarterly planning (Savory Institute); Ali Abdaal and Tim Ferriss variants of the annual/quarterly review; older solstice/equinox observances across cultures",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["adults", "professionals", "families", "creatives", "founders"],
      validationNotes:
        "No RCT; practitioner-validated across high-output individuals and HM-trained families/businesses for decades. The mechanism (forced reflection + pre-commitment) is well-supported in behavioral literature",
    },
    contextTags: ["purpose", "quarterly", "review"],
    contraindications: [
      "Rigid over-planning tendency — the session is for direction, not a detailed task plan; if it becomes Gantt charts, loosen the protocol",
      "Acute crisis phase — postpone; reviews are for steady-state reflection, not crisis-mode decisions",
    ],
    links: [
      { rpplId: "rppl:practice:essence-probe:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:qol-statement:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:values-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:cyclical-time:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:holistic-management:v1", relationship: "derived_from" },
    ],
  },
];
