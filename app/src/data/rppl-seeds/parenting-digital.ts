import type { RpplSeed } from "./types";

// ─── Parenting & Digital Life Practices ─────────────────────────────────────
// Two domains that intersect more than they diverge: both are about the
// deliberate design of an attention field — the child's, and your own. The
// parenting seeds are attachment-first rather than behavior-first (Neufeld,
// Lansbury, Gottman), with room for the unconventional (free play, slow
// parenting, early financial literacy). The digital seeds are about reclaiming
// the foreground of attention from tools that were designed to capture it
// (Newport, Price, Eyal, Harris).
//
// Conventions: rpplId: "rppl:practice:{slug}:v1"; link to principles via
// servesPrinciples, frameworks via links.derived_from; confidence graded
// honestly — most parenting and digital-minimalism practices are "seed" or
// "emerging" rather than "validated" due to ecological-validity limits on
// randomized trials in these domains.
// ─────────────────────────────────────────────────────────────────────────────

export const parentingDigitalSeeds: RpplSeed[] = [
  // ━━━ ATTACHMENT & DISCIPLINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:connection-before-correction:v1",
    type: "practice",
    name: "Connection Before Correction",
    domain: "people",
    domains: ["home", "growth"],
    description:
      "Before you name the behavior, name the child — in tone, eye contact, posture. A dysregulated child cannot access the part of the brain that learns from correction; a regulated child almost always can. The sequence is not 'be nice then discipline' — it's neurological. Co-regulation precedes cognition. Skipping the connection step is why the same correction has to be delivered a hundred times without landing.",
    trigger:
      "Your child is about to hear a correction — a limit, a consequence, a redirection. Before the words come out, the connection moment begins.",
    steps: [
      "Get to their eye level — kneel, sit, lean in; never correct from standing above a small person",
      "Make contact first — name the feeling you see ('you're frustrated'), touch their shoulder, match their face for a beat",
      "Wait for the nervous-system shift — pupils soften, shoulders drop, breath slows. This may take 10 seconds or 2 minutes",
      "Then — and only then — deliver the correction or limit, short and clear",
      "If they escalate, they weren't regulated yet; return to connection, do not escalate with them",
    ],
    timeWindow: "Any moment a correction is about to happen",
    servesPrinciples: [
      "rppl:principle:attachment-awareness:v1",
      "rppl:principle:regulate-before-reason:v1",
      "rppl:principle:calm-is-contagious:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Child present and dysregulated", portType: "boolean", key: "child_needs_correction" },
      { name: "Caregiver regulation", portType: "state", key: "nervous_system_state" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Attachment security", portType: "state", key: "attachment_security" },
      { name: "Child self-regulation", portType: "state", key: "child_regulation" },
      { name: "Relational presence", portType: "state", key: "relational_presence" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Attachment theory / interpersonal neurobiology",
      keyReference:
        "Gordon Neufeld, 'Hold On to Your Kids' (2004); Dan Siegel & Tina Payne Bryson, 'The Whole-Brain Child' (2011) and 'No-Drama Discipline' (2014); Janet Lansbury, 'No Bad Kids' (2014)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "toddlers", "school-age", "teachers", "caregivers"],
      validationNotes:
        "Mechanism (downshifted PFC during dysregulation) is well-established in neuroscience; the specific behavioral protocol is practitioner-validated across attachment-focused traditions",
    },
    contextTags: ["parenting", "attachment", "universal", "foundational"],
    contraindications: [
      "Immediate safety situations (child running into street, hitting another child) — physically intervene first, connect after",
      "Caregiver in genuine dysregulation: regulate yourself first, even if that means stepping away for 60 seconds",
    ],
    links: [
      { rpplId: "rppl:framework:attachment-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:polyvagal-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:repair-protocol:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:physiological-sigh:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:repair-protocol:v1",
    type: "practice",
    name: "Rupture & Repair Protocol",
    domain: "people",
    domains: ["home", "growth"],
    description:
      "You will lose it with your child. Every parent does — the research is clear that perfection is not the goal and is not even achievable. What matters is what happens after the rupture. A consistent, named repair is what builds attachment security over time; an avoided repair is what turns small ruptures into template ones. The practice is not elaborate apology — it's four moves, done close to the event, in language the child can receive.",
    trigger:
      "You raised your voice, shamed them, ignored them, or otherwise stepped outside the parent you want to be — and you notice within minutes or hours.",
    steps: [
      "Regulate yourself first — you cannot lead a repair from the same state that caused the rupture",
      "Go to them — short distance, eye level, low voice: 'I want to talk about what just happened'",
      "Name what you did, without 'but' ('I yelled at you' — not 'I yelled at you but you were...')",
      "Name the impact you can see ('that was scary' / 'you felt unloved in that moment')",
      "Name what you'll try differently next time — specific, small, honest — and ask for a hug if they're ready",
    ],
    timeWindow: "Within the same day as the rupture; sooner if the child is young",
    servesPrinciples: [
      "rppl:principle:attachment-awareness:v1",
      "rppl:principle:own-consequences:v1",
      "rppl:principle:regulate-before-reason:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Recent rupture", portType: "boolean", key: "recent_rupture" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
      { name: "Humility", portType: "capacity", key: "humility" },
    ],
    outputs: [
      { name: "Attachment security", portType: "state", key: "attachment_security" },
      { name: "Child trust in repair", portType: "state", key: "repair_model" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Attachment research / relational-repair theory",
      keyReference:
        "Ed Tronick 'still-face' research on rupture-and-repair; John Gottman's repair-attempt findings extended to parent-child; Dan Siegel on 'good-enough' parenting",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "all-ages", "step-parents", "co-parents"],
      validationNotes:
        "Tronick's rupture-and-repair research and Gottman's repair-attempt literature are both well-established; the translation to a parent-script is practitioner-validated",
    },
    contextTags: ["parenting", "repair", "attachment", "universal"],
    contraindications: [
      "Do not repair by over-explaining or turning the moment into a lecture — repair, then stop",
      "Avoid repair that makes the child responsible for your emotions ('I was sad because you...') — that inverts the relationship",
    ],
    links: [
      { rpplId: "rppl:practice:connection-before-correction:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:attachment-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:nvc:v1", relationship: "synergy" },
    ],
  },

  // ━━━ RHYTHM & PRESENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:family-rhythm-design:v1",
    type: "practice",
    name: "Family Rhythm Design",
    domain: "people",
    domains: ["home"],
    description:
      "Children (and adults) regulate better inside a predictable structure than inside a constantly re-negotiated one. This is not a schedule down to the minute — it's a small set of anchors: when we wake, when we eat, when we're outside, when screens close, when we reconnect at the end of the day. The anchors are load-bearing; everything else can flex. Without anchors, every transition becomes a negotiation, and the household runs on decision-debt.",
    trigger:
      "A quarterly family check-in (or a noticing that the household feels chaotic). Sit down with other caregivers and map the current rhythm.",
    steps: [
      "List the current actual rhythm — wake, meals, outdoors, screens, bedtime — over a normal week, not an aspirational one",
      "Identify 4–6 anchors that will hold steady (e.g. 7am wake, 6pm dinner, 7:30 screens off, 8pm books, 8:30 lights)",
      "Name what's deliberately flexible around the anchors — weekends, extracurriculars, travel",
      "Communicate the anchors to the kids at their level — picture chart for little ones, family agreement for teens",
      "Revisit every season — rhythms should evolve with developmental stage, not be imposed indefinitely",
    ],
    timeWindow: "Quarterly review; anchors held daily/weekly",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:home-first-ecosystem:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Household authority", portType: "boolean", key: "household_authority" },
      { name: "Caregiver alignment", portType: "boolean", key: "caregiver_alignment" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Household baseline", portType: "state", key: "household_baseline" },
      { name: "Child self-regulation", portType: "state", key: "child_regulation" },
      { name: "Decision load", portType: "state", key: "decision_load" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Developmental psychology / Waldorf rhythm tradition",
      keyReference:
        "Kim John Payne, 'Simplicity Parenting' (2009) on rhythm as the primary intervention; Rudolf Steiner / Waldorf tradition on the role of daily, weekly, seasonal rhythm; child-development research on predictability and self-regulation",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["families", "parents", "preschool", "school-age", "homeschoolers"],
      validationNotes:
        "Developmental research supports predictable routines for self-regulation and attachment; specific 'anchor' model is practitioner-validated",
    },
    contextTags: ["parenting", "rhythm", "household", "foundational"],
    contraindications: [
      "Households in acute transition (new baby, move, illness) — hold fewer anchors more loosely until the ground is steady again",
      "Shift-work or irregular-schedule parents — anchor the child's rhythm to one parent's pattern plus a weekly shared meal",
    ],
    links: [
      { rpplId: "rppl:practice:weekly-home-reset:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:evening-wind-down-family:v1", relationship: "contains" },
      { rpplId: "rppl:framework:attachment-theory:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:evening-wind-down-family:v1",
    type: "practice",
    name: "Family Evening Wind-Down",
    domain: "people",
    domains: ["home", "body"],
    description:
      "The last hour before a child's bedtime is a disproportionate driver of sleep quality — theirs and yours. A predictable, low-stimulus wind-down (dim lights, bath, books, one-on-one time, lights out) does more for family functioning than any parenting technique applied during the day. Children who go to bed regulated wake up regulated; parents who protect this hour reclaim the evening.",
    trigger:
      "60–90 minutes before the child's target sleep time. The wind-down begins whether the rest of the day went well or not.",
    steps: [
      "Dim the lights throughout the house — visual cue to the whole family that the day is closing",
      "Screens off, ideally all of them — put devices out of sight, not just muted",
      "Bath or shower as a transitional body signal (water transitions work across ages)",
      "Books in a low-lit room; one-on-one if you have multiple kids (rotate nights)",
      "Short connection ritual at lights-out — gratitude, a song, a specific phrase — the same one every night",
    ],
    timeWindow: "60–90 minutes before child's sleep time, nightly",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:timing-matters:v1",
      "rppl:principle:calm-is-contagious:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Evening presence", portType: "boolean", key: "evening_presence" },
      { name: "Caregiver alignment", portType: "boolean", key: "caregiver_alignment" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Child sleep quality", portType: "state", key: "child_sleep_quality" },
      { name: "Parent evening autonomy", portType: "state", key: "evening_autonomy" },
      { name: "Attachment security", portType: "state", key: "attachment_security" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Pediatric sleep medicine / attachment parenting",
      keyReference:
        "Jodi Mindell, 'Sleeping Through the Night' (2005); Marc Weissbluth 'Healthy Sleep Habits, Happy Child'; AASM pediatric sleep-hygiene guidelines",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["families", "parents-of-0-12", "multi-child-households"],
      validationNotes:
        "Pediatric sleep research strongly supports consistent, low-stimulus bedtime routines for both sleep onset and downstream behavioral regulation",
    },
    contextTags: ["parenting", "sleep", "evening", "routines"],
    contraindications: [
      "Co-parenting across households — coordinate the anchor times; misaligned bedtimes across homes are harder on kids than either approach alone",
      "Parents of infants — the wind-down is aspirational, not a rule; any predictability counts in the first year",
    ],
    links: [
      { rpplId: "rppl:practice:family-rhythm-design:v1", relationship: "part_of" },
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "synergy" },
    ],
  },

  // ━━━ STAGE-SPECIFIC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:newborn-survival-mode:v1",
    type: "practice",
    name: "Newborn Survival Mode",
    domain: "people",
    domains: ["home", "body"],
    description:
      "The first three months with a newborn are not parenting in any normal sense — they are a physiological event being survived. The correct move is to lower every standard that isn't safety or bonding, accept help aggressively, and stop trying to 'maintain' the pre-baby life. Parents who try to keep everything going are the ones most likely to end up in postpartum collapse. Fewer standards, for longer, is the intervention.",
    trigger:
      "A baby is born (or arrives through adoption/foster). The protocol starts immediately — the window is roughly birth through 12 weeks.",
    steps: [
      "Hold two non-negotiables only: baby is fed and safe; the primary caregiver is eating, hydrating, and sleeping in chunks",
      "Suspend all optional commitments for 6 weeks minimum — meetings, social obligations, home projects — and say so explicitly to people who expect otherwise",
      "Accept every offer of help concretely ('yes, please bring dinner Tuesday' — not 'we're fine, thanks')",
      "Keep the house functional at the 'dishes done and trash out' level — not showable; inspectable",
      "Screen postpartum mood daily for both parents (not just the birthing one); get help the first time a red flag appears, not the fifth",
    ],
    timeWindow: "Birth through 12 weeks minimum; extend if NICU / medical complexity / multiples",
    servesPrinciples: [
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:pareto-few:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Recent birth or adoption", portType: "boolean", key: "newborn_in_home" },
      { name: "Social support available", portType: "resource", key: "social_support" },
      { name: "Humility", portType: "capacity", key: "humility" },
    ],
    outputs: [
      { name: "Caregiver recovery", portType: "state", key: "postpartum_recovery" },
      { name: "Attachment security", portType: "state", key: "attachment_security" },
      { name: "Postpartum mood", portType: "state", key: "postpartum_mood" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Postpartum medicine / cross-cultural postpartum traditions",
      keyReference:
        "Heng Ou, 'The First Forty Days' (2016) on cross-cultural postpartum care; Harvey Karp, 'The Happiest Baby on the Block' (2002); WHO guidelines on postnatal care",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["new-parents", "postpartum", "adoptive-parents", "foster-parents"],
      validationNotes:
        "Cross-cultural postpartum confinement traditions and modern postpartum-care research both point to reduced expectations plus concrete support as the intervention with the largest effect on postpartum depression risk",
    },
    contextTags: ["parenting", "newborn", "postpartum", "survival"],
    contraindications: [
      "Red-flag postpartum symptoms (thoughts of harm, sustained inability to sleep when baby sleeps, detachment) — seek clinical help immediately; this protocol is not a substitute",
      "Single-parent contexts require different variables — see the single-parent systems seed",
    ],
    links: [
      { rpplId: "rppl:framework:attachment-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:weekly-home-reset:v1", relationship: "conflict" },
    ],
  },

  {
    rpplId: "rppl:practice:toddler-yes-environment:v1",
    type: "practice",
    name: "Toddler Yes Environment",
    domain: "people",
    domains: ["home"],
    description:
      "The fastest way to reduce conflict with a 1-3 year old is not better discipline — it's a physical environment engineered so that 'no' is rarely needed. A yes environment confines risk (gates, latches, removed hazards) so that the child can freely explore within a bounded space. Autonomy develops through 'yes'; compliance-fatigue develops through 'no'. The parent's job is the design — the child's job is to move, touch, pour, climb, and try.",
    trigger:
      "Your child begins to crawl or walk. Before they reach the next height of shelf, the environment is re-designed.",
    steps: [
      "Walk each room on your knees — see what they see, reach for what they'll reach for",
      "Remove or lock away what you don't want touched; put what they CAN explore at their level",
      "Install gates/latches at real hazards (stairs, stove, cleaning products, water) — not at every doorway",
      "Offer real choices within the yes environment ('milk or water?' — not 'what do you want?') — choice within limits builds autonomy without decision overload",
      "Revise every 3 months — a 12-month-old's yes environment is not an 18-month-old's",
    ],
    timeWindow: "Ongoing, reviewed quarterly through age 3",
    servesPrinciples: [
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:growth-has-stages:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Physical home autonomy", portType: "boolean", key: "home_modification_authority" },
      { name: "Toddler present", portType: "boolean", key: "toddler_in_home" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Parent-child conflict frequency", portType: "state", key: "conflict_frequency" },
      { name: "Child autonomy", portType: "state", key: "child_autonomy" },
      { name: "Safety baseline", portType: "state", key: "home_safety" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Material capital", portType: "capital", key: "material" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "RIE / Montessori / respectful parenting",
      keyReference:
        "Magda Gerber, RIE (Resources for Infant Educarers) approach; Janet Lansbury, 'Elevating Child Care' (2014); Maria Montessori on prepared environment",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "toddlers", "1-3-years"],
      validationNotes:
        "Environmental design as behavior intervention is well-established; specific RIE/Montessori protocol is practitioner-validated rather than RCT-tested",
    },
    contextTags: ["parenting", "toddler", "environment", "autonomy"],
    contraindications: [
      "Rentals with no modification authority — focus on portable gates and object-relocation rather than built-ins",
      "Multi-age households — the yes environment has to be negotiated around older children's possessions; use a 'toddler-free' zone plus a 'toddler-free-range' zone",
    ],
    links: [
      { rpplId: "rppl:practice:family-rhythm-design:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:connection-before-correction:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:school-age-chores:v1",
    type: "practice",
    name: "Chores as Capability",
    domain: "people",
    domains: ["home", "growth"],
    description:
      "Chores are not punishment, not virtue training, and not 'helping Mom.' They are the primary mechanism by which a child internalizes the sense that they are a contributing member of the household — which correlates in longitudinal research with better adult outcomes than almost any other family variable. The key is real work with visible consequences: not busywork. A 6-year-old who knows the dishwasher is their job by Friday has installed a template that will run for life.",
    trigger:
      "Your child reaches roughly age 4–5 (earlier if they're asking, later is fine too). The family adds their first real, recurring contribution.",
    steps: [
      "Pick one recurring contribution they're developmentally ready for — set the table, feed a pet, empty a small trash can, fold their own laundry",
      "Teach it once, slowly, with them doing the hands — then step back and accept 'their version' of done",
      "Connect it to the family system, not to reward — 'this is your job because our family runs on everyone's work'",
      "Let the natural consequence land (table isn't set → eat standing up this once) — don't nag, don't rescue, don't lecture",
      "Add one new contribution each year; transition old ones to full independence",
    ],
    timeWindow: "Daily/weekly contributions, reviewed annually",
    servesPrinciples: [
      "rppl:principle:own-consequences:v1",
      "rppl:principle:cooperation-structure:v1",
      "rppl:principle:growth-has-stages:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "School-age child in home", portType: "boolean", key: "school_age_child" },
      { name: "Household authority", portType: "boolean", key: "household_authority" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Child competence", portType: "state", key: "child_competence" },
      { name: "Household functioning", portType: "state", key: "household_baseline" },
      { name: "Family belonging", portType: "state", key: "family_belonging" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Longitudinal developmental research / Adlerian parenting",
      keyReference:
        "Marty Rossmann's University of Minnesota longitudinal research on chores and adult outcomes; Julie Lythcott-Haims, 'How to Raise an Adult' (2015); Jane Nelsen 'Positive Discipline'",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "school-age", "5-12-years", "homeschoolers"],
      validationNotes:
        "Rossmann's 25-year longitudinal data linking early chore participation to adult well-being and career success is the strongest single finding; causation-vs-correlation caveats apply",
    },
    contextTags: ["parenting", "school-age", "capability", "chores"],
    contraindications: [
      "Chores used as punishment — breaks the mechanism; the contribution becomes associated with shame rather than belonging",
      "Perfectionist households where parents redo the child's work visibly — undermines the signal that their work counts",
    ],
    links: [
      { rpplId: "rppl:practice:financial-literacy-early:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:weekly-home-reset:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:shared-household-agreements:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:teenager-relationship-preservation:v1",
    type: "practice",
    name: "Teenager Relationship Preservation",
    domain: "people",
    domains: ["growth"],
    description:
      "The parenting task in adolescence shifts from shaping behavior to preserving the relationship through which future influence can flow. Research on adolescent outcomes is unsentimental: the strongest protective factor is ongoing, non-judgmental connection with a parent — and the strongest risk factor is interrogation-and-control patterns that drive teens to hide their lives. Presence beats surveillance. Curiosity beats interrogation. You cannot control a 16-year-old; you can stay worth talking to.",
    trigger:
      "Your child turns roughly 11–12 and the relational mode begins to shift. The shift in your approach is not optional — it's a response to their developmental reality.",
    steps: [
      "Trade interrogation for presence — car rides, late-night kitchen moments, side-by-side activity, no eye contact required",
      "Replace 'how was your day?' with specific curiosity ('what was the weirdest part of today?') — open questions beat closed ones",
      "Name the new contract once, explicitly: 'You can tell me anything. I may not always agree, but I will never make you regret telling me'",
      "Hold bright lines on safety (drugs, driving, consent, suicidal ideation) — negotiate everything else visibly",
      "When they come to you with something hard, listen first, solve later, and shut up about it the next day unless they bring it back",
    ],
    timeWindow: "Ages ~11–18, daily and weekly; the practice is years long",
    servesPrinciples: [
      "rppl:principle:attachment-awareness:v1",
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:growth-has-stages:v1",
    ],
    servesCapacities: [
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Teen in home", portType: "boolean", key: "teen_in_home" },
      { name: "Humility", portType: "capacity", key: "humility" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Adolescent attachment", portType: "state", key: "adolescent_attachment" },
      { name: "Parent-teen trust", portType: "state", key: "parent_teen_trust" },
      { name: "Risk-behavior disclosure", portType: "state", key: "risk_disclosure" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Adolescent development / attachment research extended to teens",
      keyReference:
        "Gordon Neufeld, 'Hold On to Your Kids' (2004); Lisa Damour, 'Untangled' (2016) and 'Under Pressure' (2019); Laurence Steinberg, 'Age of Opportunity' (2014)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "teens", "preteens", "stepparents", "foster-teens"],
      validationNotes:
        "Adolescent-development research is clear that parent-teen relationship quality predicts risk behaviors, mental health, and adult outcomes; specific behavioral translations are practitioner-validated",
    },
    contextTags: ["parenting", "teenager", "relationship", "adolescent"],
    contraindications: [
      "Active safety crises (suicidal ideation, severe substance use, exploitation) — preservation mode pauses; clinical intervention and structure first",
      "Parents with their own unprocessed adolescent trauma — work with a therapist; your own 16-year-old is in the room with you otherwise",
    ],
    links: [
      { rpplId: "rppl:framework:attachment-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:connection-before-correction:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:family-rhythm-design:v1", relationship: "synergy" },
    ],
  },

  // ━━━ UNCONVENTIONAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:outdoor-childhood:v1",
    type: "practice",
    name: "Outdoor Free-Play Childhood",
    domain: "people",
    domains: ["body", "joy", "growth"],
    description:
      "Unstructured time outside — ideally with other kids, no adult-led agenda, and some real (not catastrophic) risk — is a specific developmental input, not a 'nice to have.' Children who get it build executive function, social negotiation, and risk calibration that adult-led activities do not produce. The dose-response matters: once a week is not enough; daily in some form is the threshold. Adults attend to safety without structuring the play.",
    trigger:
      "Afternoon or weekend blocks of unstructured time. The default becomes 'outside', not 'inside unless it's nice.'",
    steps: [
      "Carve one protected outdoor block per day — even 30 minutes counts; longer on weekends",
      "Adult job is safety and refreshments — not entertaining, narrating, or refereeing minor conflicts",
      "Boredom is allowed and productive — do not rescue with suggestions for 10+ minutes",
      "Lean toward nature over playgrounds when possible — trees, water, dirt, slopes provide richer play affordances than fixed equipment",
      "Let small risks happen (climbing, rough-and-tumble, sharp-ish sticks) — intervene only when the risk becomes a hazard",
    ],
    timeWindow: "Daily 30–180 minute blocks, more on weekends",
    servesPrinciples: [
      "rppl:principle:terrain-not-defense:v1",
      "rppl:principle:stress-as-input:v1",
      "rppl:principle:home-first-ecosystem:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Outdoor access", portType: "boolean", key: "outdoor_access" },
      { name: "Child time autonomy", portType: "boolean", key: "child_time_autonomy" },
      { name: "Humility", portType: "capacity", key: "humility" },
    ],
    outputs: [
      { name: "Child executive function", portType: "state", key: "executive_function" },
      { name: "Risk calibration", portType: "state", key: "risk_calibration" },
      { name: "Physical development", portType: "state", key: "physical_development" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Free-play research / nature-deficit literature",
      keyReference:
        "Peter Gray, 'Free to Learn' (2013) on decline-in-free-play and rise in mental-health problems; Richard Louv, 'Last Child in the Woods' (2005); Ellen Sandseter on risky play and anxiety reduction",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "all-ages-kids", "homeschoolers", "unschoolers", "nature-based"],
      validationNotes:
        "Cross-disciplinary evidence (developmental psychology, motor-learning, mental-health epidemiology) points to reduced free play as a causal contributor to rising child mental-health problems",
    },
    contextTags: ["parenting", "outdoors", "free-play", "child-development"],
    contraindications: [
      "Dense urban environments with genuine safety issues — substitute supervised-but-unstructured park trips plus indoor risky-play equivalents",
      "Extreme weather — dress for it; don't skip the practice most days",
    ],
    links: [
      { rpplId: "rppl:practice:nature-exposure-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:slow-parenting:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:evolutionary-mismatch:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:slow-parenting:v1",
    type: "practice",
    name: "Slow Parenting",
    domain: "people",
    domains: ["growth", "joy"],
    description:
      "Deliberately refusing the enrichment arms race — fewer scheduled activities, more unscheduled time, more presence with the family you actually have. The modern parenting default is to over-schedule children for fear of falling behind peers; the research suggests the over-scheduled child loses more than they gain. Slow parenting is a decision, renewed quarterly, to resist the default. It is socially expensive and developmentally inexpensive.",
    trigger:
      "The annual/seasonal moment when activity sign-ups go live and the peer pressure arrives. Decide deliberately, before defaulting.",
    steps: [
      "Count the total weekly hours currently committed to structured activities — music, sports, tutoring, clubs",
      "Cap extracurriculars at a deliberately chosen number — e.g. 'one sport, one creative, nothing on Sundays' — and name the cap out loud",
      "For each 'should we sign up for X?' — ask 'what will we remove to make room?' (You cannot add without subtracting.)",
      "Protect one weekend day a month as 'nothing planned' — including no playdates, no errands, no catch-up",
      "When peer parents imply you're under-scheduling, re-anchor on the reason — you chose this; explain once if asked, not every time",
    ],
    timeWindow: "Quarterly activity review; weekly calendar protection",
    servesPrinciples: [
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:rest-is-productive:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Schedule authority", portType: "boolean", key: "family_schedule_authority" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Unstructured family time", portType: "state", key: "unstructured_time" },
      { name: "Child boredom tolerance", portType: "state", key: "boredom_tolerance" },
      { name: "Parent capacity", portType: "state", key: "parent_capacity" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Slow-movement parenting / simplicity parenting",
      keyReference:
        "Kim John Payne, 'Simplicity Parenting' (2009); Carl Honoré, 'Under Pressure' (2008) / 'In Praise of Slow' (2004); Madeline Levine, 'The Price of Privilege' (2006) on over-scheduled children",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "middle-class", "academically-pressured", "families"],
      validationNotes:
        "Research linking over-scheduling to adolescent mental-health problems is emerging; simplicity parenting outcomes are practitioner-validated",
    },
    contextTags: ["parenting", "slow", "anti-optimization", "presence"],
    contraindications: [
      "Children with a specific, child-initiated passion (serious athletes, artists) — slow parenting doesn't mean denying a kid's own drive",
      "Under-resourced families using extracurriculars for safe-childcare — the frame is different; don't apply middle-class over-scheduling critique to this case",
    ],
    links: [
      { rpplId: "rppl:practice:outdoor-childhood:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:family-rhythm-design:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:financial-literacy-early:v1",
    type: "practice",
    name: "Early Financial Literacy",
    domain: "people",
    domains: ["money", "growth"],
    description:
      "Money concepts are most efficiently learned with small amounts and real consequences, starting around age 5. Theory-based financial education in high school has almost zero long-term effect; hands-on practice with tradeoffs at age 7 has large effect by age 17. The mechanism is exposure to real scarcity, real choice, and real waiting — the emotional texture of money, not its arithmetic. The amounts should be small enough that the lesson is cheap; the choices real enough that the lesson lands.",
    trigger:
      "Your child asks for something at a store, or notices that money is exchanged for things — whichever comes first. Around age 5 for most.",
    steps: [
      "Give them a small, real allowance (weekly) — tied loosely to age, not to chores (chores are separate — see that seed)",
      "Three jars/accounts from day one: spend, save, share — they pick percentages, you advise",
      "Let them spend their spend jar on junk they regret — the regret is the lesson; do not prevent it",
      "For bigger items, require them to save (match savings early on if motivation flags) — waiting and working toward is the mechanism",
      "Age 10+: add a 'invest' jar with a real account they can watch — show a compound-interest calculator, have them experience a year of nothing happening, then returns",
    ],
    timeWindow: "Weekly allowance; ongoing conversation",
    servesPrinciples: [
      "rppl:principle:own-consequences:v1",
      "rppl:principle:cause-and-effect:v1",
      "rppl:principle:growth-has-stages:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Child old enough (~5+)", portType: "boolean", key: "child_age_5_plus" },
      { name: "Discretionary income", portType: "resource", key: "allowance_budget" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Financial literacy", portType: "state", key: "child_financial_literacy" },
      { name: "Delayed gratification", portType: "state", key: "delay_gratification" },
      { name: "Money emotional regulation", portType: "state", key: "money_regulation" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Behavioral finance / personal-finance education research",
      keyReference:
        "Ron Lieber, 'The Opposite of Spoiled' (2015); Beth Kobliner, 'Make Your Kid a Money Genius'; research (Mandell, FINRA) showing classroom financial literacy has weak outcomes while practice-based learning correlates with adult financial behavior",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["parents", "5-plus", "homeschoolers", "budget-aware-families"],
      validationNotes:
        "Strong negative finding: classroom financial-literacy curricula don't move adult behavior; practitioner and behavioral-finance literature both suggest early hands-on practice does",
    },
    contextTags: ["parenting", "money", "early-finance", "real-consequences"],
    contraindications: [
      "Households in acute financial crisis — the practice is demoralizing when the amounts feel weighty; simplify to 'save + share' only until stable",
      "Do not tie allowance to behavior management — the signal becomes 'money is a tool for controlling you', which inverts the lesson",
    ],
    links: [
      { rpplId: "rppl:practice:school-age-chores:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:austrian-economics:v1", relationship: "synergy" },
    ],
  },

  // ━━━ DIGITAL: ATTENTION & FOCUS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:phone-free-morning:v1",
    type: "practice",
    name: "Phone-Free First Hour",
    domain: "growth",
    domains: ["body", "purpose"],
    description:
      "The single highest-leverage digital pattern: the first hour of the day is not for inputs. A phone touched in the first ten minutes shapes the attentional state of the next twelve hours — dopaminergic, reactive, fragmented. A phone left alone for an hour lets the prefrontal cortex come online on its own schedule and leaves room for the morning threshold practices (light, movement, water, thought) that actually set the day's tone. You are not missing anything that can't wait 60 minutes.",
    trigger:
      "You wake up. The phone has stayed in another room or face-down in a drawer. The first hour begins.",
    steps: [
      "Keep the phone out of the bedroom — use a real alarm clock. If that's impossible, phone lives face-down in a drawer and is not opened until the hour is up",
      "Do not open any screen — phone, laptop, tablet, TV — for the first 60 minutes after waking",
      "Replace the first-thing-phone habit with a specific alternative: morning threshold practice, coffee + window, a short written plan for the day",
      "If you must check phone (on-call work, parent of adult child with health issue), scope it: messages-only app open for 60 seconds, not the full device",
      "When you do open the phone at the 60-minute mark, open it with intent — what are you looking for? — not in reactive-scroll mode",
    ],
    timeWindow: "First 60 minutes after waking, daily",
    servesPrinciples: [
      "rppl:principle:attention-grows:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Alarm alternative", portType: "boolean", key: "non_phone_alarm" },
      { name: "Morning autonomy", portType: "boolean", key: "morning_autonomy" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Morning attention quality", portType: "state", key: "attention_quality" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Reactive-mode avoidance", portType: "state", key: "reactive_avoidance" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Digital minimalism / attention economy research",
      keyReference:
        "Cal Newport, 'Digital Minimalism' (2019); Catherine Price, 'How to Break Up with Your Phone' (2018); Nir Eyal, 'Indistractable' (2019)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "knowledge-workers", "students", "parents"],
      validationNotes:
        "Direct RCTs on 'first hour phone-free' are scarce, but large practitioner validation and adjacent evidence (attention residue from Sophie Leroy; morning cortisol curve research) strongly support the mechanism",
    },
    contextTags: ["digital", "morning", "attention", "foundational"],
    contraindications: [
      "On-call medical, emergency, or primary-caregiver roles — use a single-purpose app or device rather than abandoning the practice entirely",
      "Parents of young children in other homes (custody schedules) — keep an emergency channel open, close everything else",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:notification-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:deep-work-phone-away:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:notification-audit:v1",
    type: "practice",
    name: "Notification Audit",
    domain: "growth",
    description:
      "Most notifications do not serve you — they serve the app that produced them. A phone as delivered buzzes dozens to hundreds of times a day, each buzz a small interruption of attention that the app monetizes and you pay for. The audit is a single 20-minute pass through every app's notification settings, turning off everything that is not a direct human trying to reach you or a time-critical alert you actually rely on.",
    trigger:
      "Once — then quarterly revisits. The first audit is a Sunday evening block. Each new app installed is audited at install-time.",
    steps: [
      "Open phone Settings → Notifications → see the full list (often 100+ apps)",
      "For each app, ask: 'If this app notifies me, do I need to act within 60 minutes?' — if no, turn the notification off entirely",
      "Keep only: real people messaging you, calendar alerts for things happening today, critical safety (2FA, banking fraud alerts)",
      "Turn off: social media, news, shopping, most games, most productivity tools, marketing from any installed retailer",
      "Add to calendar: a quarterly 10-minute re-audit; newly installed apps sneak notifications back in",
    ],
    timeWindow: "One 20-minute setup; quarterly 10-minute review",
    servesPrinciples: [
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:design-for-bias:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Device ownership / admin", portType: "boolean", key: "device_admin" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Interruption frequency", portType: "state", key: "interruption_frequency" },
      { name: "Attention quality", portType: "state", key: "attention_quality" },
      { name: "Stress regulation", portType: "state", key: "stress_regulation" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Digital minimalism / attention-economy critique",
      keyReference:
        "Tristan Harris / Center for Humane Technology on notification design; Nir Eyal, 'Indistractable'; Cal Newport on 'tool selection and configuration'",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["anyone-with-smartphone", "knowledge-workers", "students", "parents"],
      validationNotes:
        "Attention-residue and task-switching research firmly supports reduced interruption; specific 'audit' protocol is practitioner-validated",
    },
    contextTags: ["digital", "attention", "setup", "low-cost"],
    contraindications: [
      "On-call roles — scope to a single allow-list rather than a blanket shutdown",
      "Shared family devices — audit together; one person turning off everything breaks family communication assumptions",
    ],
    links: [
      { rpplId: "rppl:practice:phone-free-morning:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:deep-work-phone-away:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:email-batch-processing:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:deep-work-phone-away:v1",
    type: "practice",
    name: "Deep Work Phone Protocol",
    domain: "growth",
    domains: ["money"],
    description:
      "Silenced-but-nearby is not enough. A phone in the same room as cognitive work degrades performance even when face-down and ignored — measurable in controlled studies. The body knows the device is there; attention leaks toward it. The protocol is physical distance: the phone is in another room, or in a locked drawer, or in a bag across the office. Small cost, disproportionate return on any cognitive work that matters.",
    trigger:
      "The start of a deep-work block — writing, coding, deep reading, creative work, important conversation.",
    steps: [
      "Before starting: phone goes somewhere you cannot see or easily reach — another room is best, a drawer works, 'on your desk face-down' does not",
      "Set a time-box (45–90 minutes typical) — the deep-work window matches the phone's away time",
      "If real emergencies are possible (kids, on-call), keep a single allowlist open via a secondary device or a smartwatch set to critical-only",
      "At the end of the block, retrieve phone deliberately — 5 minutes to triage, then put it back or move to next block",
      "Track which blocks you actually did this — over a week, the delta in output is the validation",
    ],
    timeWindow: "During any deep-work block, 45–90 minutes at a time",
    servesPrinciples: [
      "rppl:principle:attention-grows:v1",
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:pareto-few:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Work autonomy", portType: "boolean", key: "work_autonomy" },
      { name: "Separable workspace", portType: "boolean", key: "separable_workspace" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Deep work output", portType: "state", key: "deep_work_output" },
      { name: "Attention quality", portType: "state", key: "attention_quality" },
      { name: "Flow-state access", portType: "state", key: "flow_access" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Attention research / deep-work literature",
      keyReference:
        "Ward et al. 2017 (J. of Assoc. for Consumer Research) — 'Brain Drain' study showing measurable cognitive cost of phone presence; Cal Newport, 'Deep Work' (2016); Gloria Mark on task-switching costs",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["knowledge-workers", "students", "writers", "coders", "creatives"],
      validationNotes:
        "Ward et al.'s 'brain drain' finding is the strongest single piece of evidence: phone presence (even silenced, even not checked) measurably reduces working-memory performance",
    },
    contextTags: ["digital", "deep-work", "attention", "performance"],
    contraindications: [
      "On-call medical / emergency — use a phone-alternative device (pager, watch with allowlist) rather than abandoning the protocol",
      "Parents of kids in different locations — allowlist-only secondary channel; not a reason to keep the full phone adjacent",
    ],
    links: [
      { rpplId: "rppl:practice:notification-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:phone-free-morning:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:email-batch-processing:v1", relationship: "synergy" },
    ],
  },

  // ━━━ DIGITAL: INFORMATION DIET ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:news-consumption-protocol:v1",
    type: "practice",
    name: "News Consumption Protocol",
    domain: "growth",
    domains: ["purpose"],
    description:
      "The news is designed to feel urgent regardless of whether it is actionable for you. Continuous feed-based consumption produces measurable stress with minimal information gain — most 'breaking' stories are either wrong at first, irrelevant to your life, or will be summarized more accurately tomorrow. The protocol is to treat news as a once-daily activity, with chosen sources, outside your reactive mode. If it matters enough, it will find you.",
    trigger:
      "The impulse to check the news — typically morning, lunch, evening. Each impulse is met with the protocol rather than the feed.",
    steps: [
      "Pick a single daily time-window (e.g. 20 minutes after lunch) — that is when news happens for you",
      "Pick 2–3 curated sources — a long-form weekly, a newsletter, or a single daily brief — not social feeds and not cable news",
      "Delete news apps from the phone home screen — web access only, on purpose, not by notification",
      "Do not refresh within the window — read what's there and close it",
      "Breaking actual-emergency news (weather, local safety) comes via specific emergency channels, not via general news",
    ],
    timeWindow: "Once daily, 15–30 minute window",
    servesPrinciples: [
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:attention-grows:v1",
      "rppl:principle:response-not-circumstances:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "News autonomy", portType: "boolean", key: "news_autonomy" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Information quality", portType: "state", key: "information_quality" },
      { name: "Stress regulation", portType: "state", key: "stress_regulation" },
      { name: "Attention quality", portType: "state", key: "attention_quality" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Digital minimalism / media-psychology research",
      keyReference:
        "Rolf Dobelli, 'Stop Reading the News' (2020); Cal Newport, 'Digital Minimalism' (2019); media-psychology research on news exposure and anxiety (Holman et al. on Boston Marathon coverage and PTSD)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "news-heavy", "anxiety-prone", "knowledge-workers"],
      validationNotes:
        "Research on repeated disaster-news exposure and acute stress is well-documented; the positive case for protocolized consumption is practitioner-validated",
    },
    contextTags: ["digital", "information", "news", "attention"],
    contraindications: [
      "Journalists and policy professionals — news is the job; consume with more volume but still with structure",
      "Active civic-engagement periods (election, protest, local crisis) — widen the window deliberately but with a start and stop time",
    ],
    links: [
      { rpplId: "rppl:practice:notification-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:social-media-tool:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:social-media-tool:v1",
    type: "practice",
    name: "Social Media as Tool",
    domain: "growth",
    domains: ["people"],
    description:
      "The default mode of social media is consumption; the useful mode is production. Reversing the ratio — create more than you consume, engage on purpose, time-box the browsing — changes the platform's relationship to you. The algorithm feeds on undirected attention; giving it directed attention produces better returns. This is not a ban; it is a shift from being used by the tool to using it.",
    trigger:
      "You open a social app. The question is: 'What am I here to do?' If there isn't an answer, close it.",
    steps: [
      "For each platform, write down its specific purpose for you ('stay in touch with distant family', 'share work, attract collaborators', 'follow a specific community') — one sentence max",
      "Unfollow / mute aggressively — if an account does not serve the stated purpose, it goes; your feed is a curation, not a default",
      "Time-box use: open the app only with an intent, use a timer (15–30 min typical), close it when the timer ends",
      "Shift the consume/create ratio over time — if you're only reading, you're an unpaid product; if you're posting, you're building",
      "Audit quarterly — platforms that don't serve you get deleted, not 'tried again'",
    ],
    timeWindow: "Per-session intent + quarterly audit",
    servesPrinciples: [
      "rppl:principle:attention-grows:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:voluntary-power:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Device autonomy", portType: "boolean", key: "device_admin" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Feed quality", portType: "state", key: "feed_quality" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Creation output", portType: "state", key: "creation_output" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Cultural capital", portType: "capital", key: "cultural" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Digital minimalism / attention-economy critique",
      keyReference:
        "Cal Newport, 'Digital Minimalism' (2019) — 'tool selection' and 'leisure optimization'; Jaron Lanier, 'Ten Arguments for Deleting Your Social Media Accounts'; Haidt & Twenge on adolescent social-media effects",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "creatives", "entrepreneurs", "teens-modified"],
      validationNotes:
        "Epidemiological evidence on passive social-media use and mood is strong for adolescents; mechanism plausible for adults; intentional-use protocols are practitioner-validated",
    },
    contextTags: ["digital", "social-media", "curation", "intent"],
    contraindications: [
      "Adolescents — stricter protocols apply; the research on teen mental health and social media suggests meaningful restriction over optimization",
      "People using social media as a support community for rare conditions — don't 'optimize away' a lifeline; just audit the rest",
    ],
    links: [
      { rpplId: "rppl:practice:notification-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:news-consumption-protocol:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:email-batch-processing:v1",
    type: "practice",
    name: "Email as Batch Processing",
    domain: "growth",
    domains: ["money"],
    description:
      "Treating email as a continuous feed is how a 20-minute daily task becomes a day-long interruption engine. Batch processing — 2 to 3 scheduled email windows a day, inbox closed otherwise — recovers hours of cognitive time and, counterintuitively, improves response quality because the messages you answer are ones you've had time to think about. The people around you adapt to your response cadence within two weeks; set the cadence deliberately.",
    trigger:
      "The start of each scheduled email window (e.g. 9:30am, 1pm, 4:30pm). Outside those windows, the inbox is closed.",
    steps: [
      "Pick 2–3 windows per day — 30 minutes each, on your calendar as real blocks",
      "Outside windows: email tab closed, email app closed, notifications off (see the notification-audit seed)",
      "During windows: process top-down without skipping — reply, delegate, defer with a scheduled time, or archive; do not 'star for later' as a default",
      "For anything requiring >5 minutes of thought, defer to a specific task block with a specific time — don't do it inside email",
      "Set an auto-responder once that names your cadence without apology — 'I check email at 9:30, 1, and 4:30' — and let people adapt",
    ],
    timeWindow: "2–3 scheduled 30-minute windows daily",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:pareto-few:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Work autonomy", portType: "boolean", key: "work_autonomy" },
      { name: "Calendar authority", portType: "boolean", key: "calendar_authority" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Deep work output", portType: "state", key: "deep_work_output" },
      { name: "Email response quality", portType: "state", key: "email_quality" },
      { name: "Interruption frequency", portType: "state", key: "interruption_frequency" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Knowledge-work productivity / deep-work literature",
      keyReference:
        "Cal Newport, 'A World Without Email' (2021) and 'Deep Work' (2016); Tim Ferriss, '4-Hour Workweek' on batching; Gloria Mark's interruption research",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["knowledge-workers", "remote-workers", "managers", "freelancers"],
      validationNotes:
        "Task-switching cost research strongly supports batching; specific 2–3 window protocol is practitioner-validated",
    },
    contextTags: ["digital", "email", "deep-work", "batching"],
    contraindications: [
      "Customer-service / support roles where email is the job — batching compressed to 15-minute windows; the protocol still helps",
      "Genuine time-critical roles (some sales, some legal, some medical) — allowlist a small number of senders for real-time; batch the rest",
    ],
    links: [
      { rpplId: "rppl:practice:notification-audit:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:deep-work-phone-away:v1", relationship: "synergy" },
    ],
  },

  // ━━━ DIGITAL: SECURITY & PRIVACY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:password-manager-2fa:v1",
    type: "practice",
    name: "Password Manager + 2FA Baseline",
    domain: "money",
    domains: ["home"],
    description:
      "The baseline digital security setup that prevents 95%+ of account-takeover risk: a password manager generating unique long passwords for every account, plus two-factor authentication (ideally via an authenticator app or hardware key, not SMS) on every account that holds money, identity, or critical communication. Setup takes one evening; the compounding protection runs for the rest of your life. The cost of not doing it is usually discovered at the worst possible moment.",
    trigger:
      "One dedicated evening to set up the infrastructure — or any password breach notice, which is the cheap reason to finally do this.",
    steps: [
      "Pick a reputable password manager (1Password, Bitwarden, iCloud Keychain for Apple-only users)",
      "Create a strong master password (long passphrase, memorable) — write it down on paper in one secure place, not in the cloud",
      "Import or add every account — let the manager generate unique 20+ character passwords as you go; don't try to do this all in one night",
      "Add 2FA via authenticator app (Authy, 1Password built-in) or hardware key (YubiKey) on: email, banking, primary brokerage, phone carrier, primary cloud, any account holding tax info",
      "Save backup codes to the password manager — when your phone breaks, these are what let you back in",
    ],
    timeWindow: "One 90-minute evening to set up; rolling 10 minutes per week for a month to migrate all accounts",
    servesPrinciples: [
      "rppl:principle:entropy-default:v1",
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:leverage-points:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Device administration", portType: "boolean", key: "device_admin" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Account security", portType: "state", key: "account_security" },
      { name: "Breach-recovery ease", portType: "state", key: "breach_recovery" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Material capital", portType: "capital", key: "material" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Information-security best practice / NIST guidelines",
      keyReference:
        "NIST SP 800-63B Digital Identity Guidelines; Google research showing hardware 2FA blocks ~100% of automated attacks; Troy Hunt 'Have I Been Pwned' on breach frequency",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["anyone-with-online-accounts", "adults", "freelancers", "small-business"],
      validationNotes:
        "Industry and NIST consensus; Google's internal data on 2FA efficacy is particularly strong (hardware keys blocked 100% of targeted phishing in studied populations)",
    },
    contextTags: ["digital", "security", "infrastructure", "foundational"],
    contraindications: [
      "SMS-only 2FA on high-value accounts — better than nothing but substantially weaker than app/hardware 2FA due to SIM-swap attacks",
      "Shared family accounts — need a password-manager family plan with deliberate sharing, not re-use of a single password",
    ],
    links: [
      { rpplId: "rppl:practice:digital-estate-plan:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:digital-estate-plan:v1",
    type: "practice",
    name: "Digital Estate Plan",
    domain: "money",
    domains: ["home", "people"],
    description:
      "If something happens to you, can your people access your accounts, your photos, your business, your money? For most adults, the answer is no — and the cost of that 'no' lands on the people who are also grieving. A digital estate plan is a written, updated document listing what exists digitally, where it is, and how to reach it, left somewhere a trusted person can find. The practice is uncomfortable for an afternoon and a massive gift for whoever inherits the mess.",
    trigger:
      "A life event — marriage, child, major purchase, death of someone else — or a deliberate once-a-year block. Inaction is the default; the deliberate block is the intervention.",
    steps: [
      "List the categories: primary email, phone, financial accounts, crypto, cloud storage, social-media profiles, recurring subscriptions, domain names, business accounts, any online income streams",
      "For each: where it lives, how to access (password manager reference — not raw passwords), what the executor should do (close, memorialize, transfer, delete)",
      "Name a digital executor — could be the same as legal executor, could be someone more technical — and tell them where the document lives",
      "Store the master document somewhere specific: sealed envelope in a fire safe + a note in the will + the password-manager emergency-access feature",
      "Review annually — accounts drift, logins change, the document becomes useless if it's not maintained",
    ],
    timeWindow: "One 2-hour block + annual 30-minute review",
    servesPrinciples: [
      "rppl:principle:permanence-order:v1",
      "rppl:principle:own-consequences:v1",
      "rppl:principle:needs-have-order:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Executor relationship", portType: "boolean", key: "executor_relationship" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Digital estate clarity", portType: "state", key: "digital_estate_clarity" },
      { name: "Survivor burden reduction", portType: "state", key: "survivor_burden_reduction" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Cultural capital", portType: "capital", key: "cultural" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Estate planning / digital-legacy practice",
      keyReference:
        "Evan Carroll & John Romano, 'Your Digital Afterlife' (2010); Uniform Fiduciary Access to Digital Assets Act (RUFADAA) — state-level legal framework; platform-specific legacy tools (Apple Legacy Contact, Google Inactive Account Manager, Facebook Memorialization)",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["adults", "parents", "entrepreneurs", "creators", "asset-holders"],
      validationNotes:
        "No controlled studies — but legal and practitioner consensus is strong: undocumented digital estates routinely produce months of preventable burden and irrecoverable loss",
    },
    contextTags: ["digital", "estate", "security", "long-term"],
    contraindications: [
      "Do not put raw passwords in a will or in plain email — use password-manager emergency access plus a physical envelope reference",
      "Sensitive accounts (secret journaling, private photos) — decide deliberately whether those survive you, then build that into the plan",
    ],
    links: [
      { rpplId: "rppl:practice:password-manager-2fa:v1", relationship: "synergy" },
    ],
  },
];
