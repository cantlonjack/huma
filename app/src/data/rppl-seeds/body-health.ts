import type { RpplSeed } from "./types";

// ─── Body & Health Practices ────────────────────────────────────────────────
// Specific daily/weekly patterns grounded in the body/circadian frameworks
// (circadian-biology, terrain-theory, stoicism, polyvagal-theory). Each is
// trigger-driven with a golden pathway of ordered steps — runnable today.
//
// Conventions:
// - rpplId: "rppl:practice:{slug}:v1" for core practices; domain-namespaced
//   variants (e.g. "rppl:practice:body-*") may be introduced later if a slug
//   collides across domains.
// - Link to principles via servesPrinciples, capacities via servesCapacities.
// - Provenance.source = "research" for expert/literature-derived seeds.
// ─────────────────────────────────────────────────────────────────────────────

export const bodyHealthSeeds: RpplSeed[] = [
  // ━━━ CIRCADIAN ANCHORS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:morning-threshold:v1",
    type: "practice",
    name: "Morning Threshold",
    domain: "body",
    domains: ["joy", "growth"],
    description:
      "The first hour of the day deliberately structured as a threshold between sleep and engaged life — not a ramp into email. Anchors circadian biology through light, movement, and hydration before the day's demands arrive. Sets the tone of nervous-system state, attention quality, and cortisol curve for every hour that follows.",
    trigger:
      "You wake up. Before checking phone or opening any screen, the threshold sequence begins.",
    steps: [
      "Feet on floor within 2 minutes of waking — no snooze loops",
      "Outside (or by an open window) for 5–15 minutes of natural light within 30 minutes of waking",
      "500ml water with a pinch of salt (or electrolytes) before caffeine",
      "10 minutes of movement — walk, mobility flow, or light strength — at a conversational pace",
      "Only after the above: check messages, open work",
    ],
    timeWindow: "First 60 minutes after waking",
    servesPrinciples: [
      "rppl:principle:body-light-system:v1",
      "rppl:principle:timing-matters:v1",
      "rppl:principle:rhythm-universal:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      {
        name: "Morning light access",
        portType: "boolean",
        key: "morning_light_access",
        description: "Window, balcony, porch, or outdoor access within the first 30 min",
      },
      { name: "Awareness", portType: "capacity", key: "awareness" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Cortisol alignment", portType: "state", key: "cortisol_alignment" },
      { name: "Morning attention quality", portType: "state", key: "attention_quality" },
      { name: "Circadian entrainment", portType: "state", key: "circadian_entrainment" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Circadian biology / chronobiology",
      keyReference:
        "Satchin Panda, 'The Circadian Code' (2018); Andrew Huberman, Huberman Lab podcast episodes on morning light and cortisol awakening response",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "knowledge-workers", "parents", "shift-workers-modified", "any-climate"],
      validationNotes:
        "Light-anchored morning routines correlate with improved sleep latency, daytime alertness, and mood regulation across multiple cohort studies",
    },
    contextTags: ["universal", "circadian", "morning", "screen-discipline"],
    contraindications: [
      "Extreme-latitude winter: substitute 10,000-lux SAD lamp when no natural light is available pre-sunrise",
      "Night-shift workers: invert the protocol — 'morning threshold' is whenever your personal wake happens",
      "Post-natal parents in survival months: reduce to feet-on-floor + window light only, rebuild gradually",
    ],
    links: [
      { rpplId: "rppl:practice:sunrise-exposure:v1", relationship: "contains" },
      { rpplId: "rppl:practice:walking-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:eating-window:v1", relationship: "enables" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:sunrise-exposure:v1",
    type: "practice",
    name: "Sunrise Exposure",
    domain: "body",
    domains: ["purpose"],
    description:
      "Direct view of the morning sky within 30–60 minutes of waking — eyes open, glasses off if safe, no window between you and the light. The strongest known zeitgeber for resetting the master circadian clock. Works year-round, though winter requires longer dwell time. Not about 'seeing the sunrise' aesthetically — it's about letting the blue/UV spectrum hit the retina while the suprachiasmatic nucleus is most sensitive.",
    trigger:
      "You wake up and the sun is up (or nearly up). Before anything else that can wait.",
    steps: [
      "Step outside — not behind glass, not through sunglasses",
      "Face the direction of the sun (don't stare at it directly) for 2–10 minutes depending on cloud cover",
      "If cloudy: double the time. Overcast morning sky is still many thousands of lux brighter than indoor light",
      "Pair with walking or simply standing — whatever keeps you outside long enough",
      "Repeat daily, not just on 'nice days' — consistency is the mechanism",
    ],
    timeWindow: "Within 30–60 minutes of natural wake",
    servesPrinciples: [
      "rppl:principle:body-light-system:v1",
      "rppl:principle:timing-matters:v1",
    ],
    servesCapacities: ["rppl:capacity:awareness:v1"],
    inputs: [
      {
        name: "Outdoor access",
        portType: "boolean",
        key: "outdoor_access",
      },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Circadian entrainment", portType: "state", key: "circadian_entrainment" },
      { name: "Melatonin timing", portType: "state", key: "melatonin_timing" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Circadian biology",
      keyReference:
        "Jack Kruse, 'Make Like the Sphinx' concept; Andrew Huberman on viewing morning sunlight; Satchin Panda on zeitgeber hierarchy",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "any-latitude-adjust-dwell-time", "any-climate"],
    },
    contextTags: ["circadian", "light", "morning"],
    contraindications: [
      "Never look directly at the sun — peripheral/diffuse light is sufficient",
      "Post-dilation eye exams: skip until pupils recover",
      "Extreme winter at high latitude: 10,000-lux light box is the substitute",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "part_of" },
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:evening-light-dimming:v1",
    type: "practice",
    name: "Evening Light Dimming",
    domain: "body",
    description:
      "The inverse of morning sunlight — deliberate reduction of blue-spectrum light in the final 2–3 hours before bed so the body can produce melatonin on schedule. Modern indoor lighting and screens signal 'mid-day' to the suprachiasmatic nucleus well into the night, pushing sleep onset later and fragmenting architecture. This practice works with the body's chemistry rather than fighting it with sleep aids.",
    trigger:
      "The sun sets (or 3 hours before your intended sleep time, whichever is later).",
    steps: [
      "Switch main overhead lights to warm, low-lumen lamps — red/amber bulbs or candles if possible",
      "Put on blue-blocking glasses (amber lens) or enable warm-shift on all screens",
      "Stop using overhead or fluorescent lighting — down-light only",
      "One hour before bed: minimize screens entirely if possible, or accept the trade and dim maximally",
      "Last 30 minutes: candle/red-light-only reading, conversation, or simple tasks",
    ],
    timeWindow: "From sunset (or 3h pre-bed) until sleep",
    servesPrinciples: [
      "rppl:principle:body-light-system:v1",
      "rppl:principle:timing-matters:v1",
    ],
    servesCapacities: ["rppl:capacity:agency:v1"],
    inputs: [
      { name: "Lighting control", portType: "boolean", key: "lighting_control" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Melatonin production", portType: "state", key: "melatonin_production" },
      { name: "Sleep onset latency", portType: "state", key: "sleep_latency" },
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Circadian biology / photobiology",
      keyReference:
        "Jack Kruse writings on photobiology; Satchin Panda, 'The Circadian Code'; Blume et al. 2019 review on light and melatonin suppression",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "screen-heavy-workers", "shift-workers", "light-sensitive"],
      validationNotes:
        "Blue-light suppression of melatonin is well-established; behavioral protocols targeting evening exposure show improved subjective and objective sleep markers",
    },
    contextTags: ["circadian", "light", "sleep", "evening"],
    contraindications: [
      "Cohabitants who want bright lights — requires negotiation, individual blue-blockers help",
      "Evening-shift workers whose 'night' is daytime: invert the logic",
    ],
    links: [
      { rpplId: "rppl:practice:sunrise-exposure:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "enables" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "derived_from" },
    ],
  },

  // ━━━ SLEEP ARCHITECTURE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:sleep-protocol:v1",
    type: "practice",
    name: "Sleep Protocol (Cool, Dark, Consistent)",
    domain: "body",
    description:
      "Three non-negotiables that produce the highest sleep-quality leverage for the least behavioral cost: a cool room, a fully dark room, and a consistent wake time (weekends included). Not a luxury sleep optimization stack — these are the baseline the body was built to operate within.",
    trigger: "30 minutes before intended sleep time (and every morning's alarm).",
    steps: [
      "Bedroom set to 60–67°F / 16–19°C — the body needs core temperature to drop to initiate sleep",
      "Blackout: tape every LED, blackout curtains or eye mask, phone in another room or face-down in do-not-disturb",
      "Wake time within a 30-minute window every day — including weekends (consistency beats duration)",
      "No caffeine after 2pm (or earlier for slow metabolizers — observe your own pattern)",
      "Last food 2–3 hours before bed; last large fluid 90 minutes before bed",
    ],
    timeWindow: "Pre-bed + alarm",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:timing-matters:v1",
      "rppl:principle:body-light-system:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Bedroom temperature control", portType: "boolean", key: "temperature_control" },
      { name: "Darkness achievable", portType: "boolean", key: "darkness_achievable" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Deep sleep percentage", portType: "state", key: "deep_sleep" },
      { name: "Recovery", portType: "state", key: "recovery" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Sleep science",
      keyReference:
        "Matthew Walker, 'Why We Sleep' (2017); AASM clinical guidelines on sleep hygiene; Satchin Panda on timing consistency",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "any-context"],
      validationNotes:
        "Temperature, darkness, and consistency each have decades of sleep-lab evidence; combining them is the practical floor before exploring advanced interventions",
    },
    contextTags: ["sleep", "circadian", "foundational"],
    contraindications: [
      "New parents / caregivers of infants: consistency target is aspirational, not a rule — prioritize recovery however it comes",
      "Chronic insomnia: may require CBT-I rather than sleep-hygiene-only approach",
    ],
    links: [
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:terrain-theory:v1", relationship: "derived_from" },
    ],
  },

  // ━━━ NERVOUS-SYSTEM REGULATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:physiological-sigh:v1",
    type: "practice",
    name: "Physiological Sigh",
    domain: "body",
    domains: ["people"],
    description:
      "A double-inhale through the nose followed by an extended exhale through the mouth — the body's own built-in rapid-downshift mechanism, now characterized in controlled studies. Activates the parasympathetic branch faster than any other voluntary breathing technique. One to three cycles is enough to measurably drop heart rate and subjective stress. Useful in acute moments, not a replacement for long-term regulation work.",
    trigger:
      "Acute stress, pre-conversation tension, pre-performance activation, or any moment you notice yourself holding breath.",
    steps: [
      "Inhale through the nose — fill the lungs",
      "Second short inhale on top of the first — top off the lungs (this is the key move)",
      "Long, slow exhale through the mouth — ideally 2× the inhale duration",
      "Repeat 1–3 times",
      "Notice the state change before re-engaging",
    ],
    timeWindow: "Anytime, ~30–60 seconds",
    servesPrinciples: [
      "rppl:principle:regulate-before-reason:v1",
      "rppl:principle:body-light-system:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [{ name: "Awareness", portType: "capacity", key: "awareness" }],
    outputs: [
      { name: "Heart rate variability", portType: "state", key: "heart_rate_variability" },
      { name: "Stress regulation", portType: "state", key: "stress_regulation" },
      { name: "Nervous-system state", portType: "state", key: "nervous_system_state" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Respiratory physiology / polyvagal theory",
      keyReference:
        "Balban et al. 2023 (Cell Reports Medicine) — controlled trial showing physiological sigh outperforms box breathing and cyclic hyperventilation for mood/anxiety; Andrew Huberman popularization",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["anyone-breathing", "stress-prone", "performers", "parents"],
      validationNotes:
        "Randomized controlled trial (Balban 2023) demonstrated measurable stress reduction after 5 min/day for 1 month",
    },
    contextTags: ["universal", "stress", "acute", "breath"],
    contraindications: [
      "Active panic attack with hyperventilation: do the exhale emphasis but skip the double-inhale — extend exhale only",
      "Severe asthma during an exacerbation: use rescue protocol first",
    ],
    links: [
      { rpplId: "rppl:framework:polyvagal-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:nasal-breathing-baseline:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:nasal-breathing-baseline:v1",
    type: "practice",
    name: "Nasal Breathing as Default",
    domain: "body",
    description:
      "Breathing through the nose — not the mouth — as the resting state across the day and through the night. Nasal breathing filters, humidifies, and warms air, increases nitric-oxide production (a vasodilator), and drives CO2 tolerance that underlies efficient oxygen delivery. Mouth breathing as a habit is associated with poorer sleep, worse dental health, and chronic low-grade sympathetic activation.",
    trigger: "Every in-breath the rest of your life. Start by noticing which you're doing right now.",
    steps: [
      "Close your mouth. Breathe through your nose — slow, silent, unhurried",
      "Drop tongue to roof of mouth (behind front teeth) as the resting position",
      "During light exercise (walking, desk work): keep mouth closed, pace breath to whatever you can sustain nasally",
      "During sleep: tape the mouth closed with a thin strip of surgical tape (skip if sinus-blocked or claustrophobic about it)",
      "If congested: do a deca-lock or Nose Unblocking Exercise from Buteyko method to clear",
    ],
    timeWindow: "All-day default; sleep with mouth taped if tolerated",
    servesPrinciples: [
      "rppl:principle:terrain-not-defense:v1",
      "rppl:principle:rhythm-universal:v1",
    ],
    servesCapacities: ["rppl:capacity:awareness:v1"],
    inputs: [{ name: "Awareness", portType: "capacity", key: "awareness" }],
    outputs: [
      { name: "Breath efficiency", portType: "state", key: "breath_efficiency" },
      { name: "CO2 tolerance", portType: "state", key: "co2_tolerance" },
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Buteyko method / functional breathing / craniofacial medicine",
      keyReference:
        "James Nestor, 'Breath: The New Science of a Lost Art' (2020); Patrick McKeown, 'The Oxygen Advantage'; Buteyko Clinic methodology",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "children-especially", "athletes", "poor-sleepers"],
    },
    contextTags: ["universal", "breath", "sleep", "foundational"],
    contraindications: [
      "Severe sinus issues, deviated septum, or chronic congestion — address structural issue first",
      "Mouth taping during sleep: start only when confidently calm with nasal-only breathing during waking hours",
    ],
    links: [
      { rpplId: "rppl:practice:physiological-sigh:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:polyvagal-theory:v1", relationship: "synergy" },
    ],
  },

  // ━━━ MOVEMENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:walking-daily:v1",
    type: "practice",
    name: "Walking as Primary Movement",
    domain: "body",
    domains: ["joy"],
    description:
      "Walking — 30 to 60 minutes most days, outside when possible — treated not as 'cardio exercise' but as the human default gait. Step counts are a proxy; what matters is consistent, low-intensity ambulation that keeps the circulatory, lymphatic, and mood systems operating as designed. Accessible to nearly every age, body, and fitness level. Compounds with morning sunlight, nature exposure, and social connection when done with someone.",
    trigger:
      "Any gap in the day when you would otherwise sit (post-meal, mid-afternoon slump, end of workday).",
    steps: [
      "Aim for 30–60 minutes total, in one block or split",
      "Outside if possible — terrain variation, light, fresh air all matter",
      "Conversational pace — you should be able to talk in full sentences",
      "After meals (especially dinner) is highest-leverage for glucose regulation",
      "Count consistency, not distance — 5 days/week beats weekend heroics",
    ],
    timeWindow: "Anytime; post-prandial highest-leverage",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:terrain-not-defense:v1",
    ],
    servesCapacities: ["rppl:capacity:care:v1"],
    inputs: [
      {
        name: "Mobility (walking-capable)",
        portType: "boolean",
        key: "mobility_walking",
      },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Cardiovascular base", portType: "state", key: "cardiovascular_base" },
      { name: "Glucose regulation", portType: "state", key: "glucose_regulation" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Exercise physiology / public health",
      keyReference:
        "Lee et al. 2019 (JAMA Internal Medicine) on steps and all-cause mortality; Herman Pontzer, 'Burn' (2021) on walking as the evolutionary default; post-meal walking meta-analyses on glycemic response",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "elderly", "sedentary-workers", "post-prandial", "any-fitness"],
    },
    contextTags: ["movement", "universal", "accessible"],
    contraindications: [
      "Acute injury to lower body — substitute upper-body movement or seated mobility",
      "Severe cardiopulmonary conditions: check with cardiologist on intensity ceiling",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sunrise-exposure:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "synergy" },
    ],
  },

  // ━━━ NUTRITION TIMING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:eating-window:v1",
    type: "practice",
    name: "Time-Restricted Eating Window",
    domain: "body",
    description:
      "All calories consumed inside a consistent 8–12 hour window, aligned toward the earlier part of the day. This is not caloric restriction — it's temporal restriction. The point is to give every cell's circadian clock a predictable fast/feed signal, which improves metabolic flexibility, sleep quality, and glucose handling without mandating what you eat. Start wide (12h) and narrow gradually.",
    trigger:
      "First bite of the day (start the clock) and last bite (close the clock). Water, black coffee, and plain tea do not count.",
    steps: [
      "Pick an eating window you can sustain — start with 12 hours (e.g. 8am–8pm)",
      "Move toward 10 hours over several weeks if comfortable (e.g. 9am–7pm)",
      "Anchor it earlier, not later — finishing dinner 3 hours before bed matters more than a short window",
      "Keep the window consistent day-to-day — variability undermines the circadian signal",
      "Inside the window, prioritize protein and whole foods; the window matters independent of composition",
    ],
    timeWindow: "Daily, consistent anchor times",
    servesPrinciples: [
      "rppl:principle:timing-matters:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:body-light-system:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Agency", portType: "capacity", key: "agency" },
      { name: "Meal autonomy", portType: "boolean", key: "meal_autonomy" },
    ],
    outputs: [
      { name: "Metabolic flexibility", portType: "state", key: "metabolic_flexibility" },
      { name: "Glucose regulation", portType: "state", key: "glucose_regulation" },
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Chrononutrition / circadian biology",
      keyReference:
        "Satchin Panda, 'The Circadian Code' (2018); Sutton et al. 2018 (Cell Metabolism) on early time-restricted feeding; ongoing research from Salk Institute",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "metabolic-health", "shift-workers-adjusted"],
      validationNotes:
        "Strong mechanistic basis and growing human trial data; individual response variable enough that N=1 tracking is the right validation path",
    },
    contextTags: ["nutrition", "circadian", "metabolic"],
    contraindications: [
      "History of eating disorder: skip this practice — temporal restriction can entangle with restrictive patterns",
      "Pregnancy / breastfeeding / growing children / athletes in heavy training: not appropriate",
      "Diabetes or hypoglycemia: coordinate with clinician before narrowing window",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "derived_from" },
    ],
  },

  // ━━━ STRENGTH & LOAD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:strength-compound:v1",
    type: "practice",
    name: "Compound Strength Training",
    domain: "body",
    description:
      "Two to three sessions a week built around a handful of compound movements — squat, hinge, push, pull, carry — loaded progressively over time. The goal is not aesthetic but structural: muscle mass, bone density, insulin sensitivity, and the capacity to move your own body through the decades ahead. After age 30, strength is actively lost unless defended; compound lifts are the highest-leverage defense.",
    trigger:
      "A fixed slot in the week (e.g. Mon/Wed/Fri morning, or Tue/Sat). The session starts when you enter the gym or unrack the bar — no 'feeling like it' required.",
    steps: [
      "Pick one movement from each pattern: squat (back squat/goblet), hinge (deadlift/RDL), push (bench/overhead press), pull (row/pull-up), carry (farmer walk)",
      "Warm up with empty bar / bodyweight for 2 sets; then 2–4 working sets of 5–8 reps per lift",
      "Log every set — weight × reps. Progression only happens when it's written down",
      "Add weight (2.5–5 lb) only when the prescribed reps are clean with good form",
      "Rest 2–3 minutes between heavy sets; under-resting is the most common quality killer",
      "Keep sessions to 45–60 minutes — length is not the point, intensity and consistency are",
    ],
    timeWindow: "2–3 sessions/week, year-round",
    servesPrinciples: [
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:stress-as-input:v1",
      "rppl:principle:terrain-not-defense:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Access to weights or bodyweight setup", portType: "boolean", key: "strength_equipment_access" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Muscle mass", portType: "state", key: "muscle_mass" },
      { name: "Bone density", portType: "state", key: "bone_density" },
      { name: "Insulin sensitivity", portType: "state", key: "insulin_sensitivity" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Strength & conditioning / exercise physiology",
      keyReference:
        "Mark Rippetoe, 'Starting Strength' (3rd ed.); Peter Attia, 'Outlive' (2023) on the centenarian decathlon; Stuart Phillips on protein/resistance training and sarcopenia",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "aging-adults-especially", "post-rehab-with-clearance", "any-sex"],
      validationNotes:
        "Resistance training's effect on lean mass, mortality, and metabolic markers is among the most replicated findings in exercise science",
    },
    contextTags: ["movement", "strength", "foundational", "longevity"],
    contraindications: [
      "Acute orthopedic injury — rehabilitate before loading; consult a PT for movement-specific modifications",
      "Uncontrolled hypertension or cardiac disease — clear intensity ceiling with a clinician",
      "Brand-new lifters should spend the first month on movement quality with a coach before chasing weight",
    ],
    links: [
      { rpplId: "rppl:practice:walking-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:terrain-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:antifragility:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:movement-snacks:v1",
    type: "practice",
    name: "Movement Snacks",
    domain: "body",
    description:
      "Short bursts of movement — 2 to 5 minutes — threaded through an otherwise sedentary day. Not a workout. The point is to interrupt the metabolic and postural consequences of prolonged sitting: glucose pooling, hip-flexor shortening, sympathetic flatline. A desk worker doing six movement snacks has a meaningfully different physiology at 6pm than one who does a single 60-minute evening workout after sitting for 10 hours.",
    trigger:
      "An hourly cue during desk work (timer, calendar block, or a recurring body signal like 'shoulders have crept up').",
    steps: [
      "Stand up. Leave the desk area entirely — kitchen, hallway, outside",
      "Pick one: 20 bodyweight squats, a set of push-ups, a 2-minute walk up stairs, a hang from a bar, or a shoulder/hip mobility flow",
      "Breathe through the nose — treat it as restoration, not exertion",
      "Return to work within 3–5 minutes — this is not a workout escape hatch",
      "Track frequency, not intensity — six light snacks beats one heroic one",
    ],
    timeWindow: "Hourly during any 4+ hour seated block",
    servesPrinciples: [
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: ["rppl:capacity:awareness:v1"],
    inputs: [
      { name: "Sedentary work pattern", portType: "boolean", key: "sedentary_work" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Glucose regulation", portType: "state", key: "glucose_regulation" },
      { name: "Postural integrity", portType: "state", key: "postural_integrity" },
      { name: "Focus recovery", portType: "state", key: "focus" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Occupational physiology / inactivity research",
      keyReference:
        "Katarina Kos et al. on postprandial glucose and brief activity breaks; Martin Gibala on exercise snacks; James Levine's NEAT research at Mayo Clinic",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["desk-workers", "remote-workers", "students", "anyone-sitting-4+-hours"],
    },
    contextTags: ["movement", "desk-workers", "micro-practice"],
    contraindications: [
      "Customer-facing roles with no break autonomy: substitute seated mobility (ankle circles, thoracic twists) at the desk",
      "Acute injury — keep snacks below pain threshold",
    ],
    links: [
      { rpplId: "rppl:practice:walking-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:strength-compound:v1", relationship: "synergy" },
    ],
  },

  // ━━━ THERMAL STRESS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:cold-exposure-graduated:v1",
    type: "practice",
    name: "Graduated Cold Exposure",
    domain: "body",
    description:
      "Brief, deliberate exposure to cold water — starting as a 30-second finish on an ordinary shower — escalated over weeks toward cold plunges or outdoor cold if the environment allows. The mechanism is hormetic stress: a short, measurable insult that triggers noradrenaline release, brown-fat activation, and a downstream baseline shift in mood, focus, and stress tolerance. Not a status game — the smallest dose that produces adaptation is the right dose.",
    trigger:
      "The last 30 seconds of your normal shower. No separate time slot required to begin.",
    steps: [
      "Week 1–2: finish every shower with 30 seconds of the coldest water your tap produces",
      "Week 3–4: extend to 60–90 seconds, breathing slow and nasal — do not hyperventilate",
      "After a month, if adapted and motivated: explore cold plunges (1–3 minutes in ~50°F/10°C water, 2–4x/week)",
      "Prioritize morning exposure — the noradrenaline spike compounds with natural cortisol curve",
      "Always exit under your own power; never push to shivering/blue-lips",
    ],
    timeWindow: "Morning, 30–180 seconds",
    servesPrinciples: [
      "rppl:principle:stress-as-input:v1",
      "rppl:principle:terrain-not-defense:v1",
      "rppl:principle:self-regulation-freedom:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Access to cold water", portType: "boolean", key: "cold_water_access" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Noradrenaline baseline", portType: "state", key: "noradrenaline_baseline" },
      { name: "Stress tolerance", portType: "state", key: "stress_regulation" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Hormesis / Wim Hof method / cold-adaptation physiology",
      keyReference:
        "Wim Hof, 'The Wim Hof Method' (2020); Søberg et al. 2021 on brown-fat activation; Huberman Lab protocols on deliberate cold exposure",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "healthy-cardiovascular", "cold-naive-start-gradually"],
      validationNotes:
        "Acute catecholamine and brown-fat effects are well-characterized; long-term mood and metabolic claims still require bigger trials — the practice is low-cost so N=1 validation is reasonable",
    },
    contextTags: ["hormesis", "morning", "stress-adaptation"],
    contraindications: [
      "Cardiovascular disease, uncontrolled hypertension, or arrhythmias — do not attempt without cardiology clearance",
      "Raynaud's syndrome, cold urticaria, or peripheral vascular disease",
      "Pregnancy — skip cold plunges; mild shower exposure only if already adapted",
      "Never combine with breath-holds in water (shallow water blackout risk)",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:physiological-sigh:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:antifragility:v1", relationship: "derived_from" },
    ],
  },

  // ━━━ ENVIRONMENT & ATTENTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:nature-exposure-daily:v1",
    type: "practice",
    name: "Daily Nature Exposure",
    domain: "body",
    domains: ["joy", "purpose"],
    description:
      "At least 20 minutes per day in a natural setting — trees, water, sky, dirt — without a task attached. The mechanism isn't mysterious: natural environments reduce sympathetic tone, broaden visual attention from narrow foveal focus to panoramic, and expose the body to volatile compounds (phytoncides), microbial diversity, and unstructured sensory input the nervous system was shaped by. A parking-lot tree counts; the dose-response is steep at the low end.",
    trigger:
      "A scheduled block in the day (lunch, end of workday) or a trigger-stack on top of an existing walk or commute.",
    steps: [
      "Find any natural setting — park, greenbelt, coastline, a single tree in a courtyard",
      "Leave the phone pocketed (airplane mode helps) — the point is unstructured attention",
      "20 minutes minimum; longer and wilder is better but not required",
      "Let your eyes go 'panoramic' — soft gaze across distance, not screen-width",
      "Aim for daily; weekends can stretch toward a longer 'nature bath' of 2+ hours",
    ],
    timeWindow: "Any; 20+ minutes daily",
    servesPrinciples: [
      "rppl:principle:terrain-not-defense:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:home-first-ecosystem:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Nature access", portType: "boolean", key: "nature_access" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Stress regulation", portType: "state", key: "stress_regulation" },
      { name: "Attention restoration", portType: "state", key: "attention_restoration" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Attention restoration theory / shinrin-yoku",
      keyReference:
        "Rachel and Stephen Kaplan, attention restoration theory (1989); Qing Li on phytoncides and forest bathing; White et al. 2019 (Scientific Reports) — 120 min/week as a threshold for well-being",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "urban-dwellers-especially", "knowledge-workers", "children"],
    },
    contextTags: ["nature", "attention", "mood", "daily"],
    contraindications: [
      "Severe allergies in pollen season — time exposure accordingly or pick non-flowering settings",
      "Tick-borne illness areas — dress for it; don't skip the practice",
    ],
    links: [
      { rpplId: "rppl:practice:walking-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sunrise-exposure:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:digital-sabbath:v1",
    type: "practice",
    name: "Digital Sabbath",
    domain: "body",
    domains: ["people", "joy"],
    description:
      "One fixed block per week — a full day if possible, a half-day as an entry point — entirely off screens. Not a productivity hack. A regular interruption of the dopaminergic, attention-fragmenting, never-ending-input state that modern devices produce. The body and nervous system need a contrast rhythm to know what 'rest' and 'presence' actually feel like, and the weekly cadence is old enough to have survived every civilization that tried it.",
    trigger:
      "A fixed day and start-time (e.g. Saturday sundown → Sunday sundown). Phone goes in a drawer at the start; non-device plans for the block are made in advance.",
    steps: [
      "Choose a day and duration that matches your life — 24h is traditional; 12h is a real start",
      "The day before: tell people you'll be offline, pre-download maps/directions, line up analog plans",
      "At the start: phone off (not silent) in a drawer or other room — computer lid closed",
      "Fill the block with non-screen modes: outdoors, cooking, reading physical books, conversation, rest, making",
      "End deliberately — don't slide back into the feed the moment the clock hits. Re-entry with intention",
    ],
    timeWindow: "Weekly, 12–24h block",
    servesPrinciples: [
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:signal-not-noise:v1",
      "rppl:principle:attention-grows:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Schedule autonomy", portType: "boolean", key: "weekend_autonomy" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Attention restoration", portType: "state", key: "attention_restoration" },
      { name: "Nervous-system state", portType: "state", key: "nervous_system_state" },
      { name: "Relational presence", portType: "state", key: "relational_presence" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Sabbath traditions (Jewish/Christian) / digital-minimalism literature",
      keyReference:
        "Cal Newport, 'Digital Minimalism' (2019); Tiffany Shlain, '24/6' (2019); Abraham Joshua Heschel, 'The Sabbath' (1951)",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["adults", "knowledge-workers", "families", "creatives"],
      validationNotes:
        "Experiential and traditional evidence is strong; clinical literature on device abstention is emerging — N=1 validation is appropriate here",
    },
    contextTags: ["attention", "rest", "weekly", "digital-minimalism"],
    contraindications: [
      "On-call medical/emergency roles — scope the sabbath to non-call weeks or to a 4-hour half-day",
      "People living far from family who rely on digital contact — keep a single phone call window open inside the block",
    ],
    links: [
      { rpplId: "rppl:practice:nature-exposure-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:taoism:v1", relationship: "synergy" },
    ],
  },

  // ━━━ SLEEP SUPPORT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:wind-down-routine:v1",
    type: "practice",
    name: "Evening Wind-Down Routine",
    domain: "body",
    description:
      "A 30- to 60-minute deliberately low-intensity buffer between the active day and sleep. The purpose is not ritual for its own sake — it's to give the parasympathetic nervous system the runway it needs to take over from the sympathetic system that ran the day. Without this buffer, most insomnia is actually unprocessed arousal. The content is less important than the fact that the routine is (a) consistent, (b) low-stimulus, and (c) the same direction every night.",
    trigger:
      "A fixed time 30–60 minutes before intended lights-out. Non-negotiable except in true emergencies.",
    steps: [
      "Shut down work — laptop closed, notifications silenced, tomorrow's first task written down so your brain can let go of it",
      "Dim the lighting (see Evening Light Dimming) — this is a visual signal to the body",
      "Pick your wind-down mode: warm shower, reading fiction on paper, gentle stretching, journaling, quiet conversation — any mode that is low-stimulus and predictable",
      "Keep the sequence similar night-to-night — the body learns the chain and drops into parasympathetic faster each week",
      "In bed, let thoughts pass without engaging — if unable after 20 minutes, get up, do something calm in dim light, return when drowsy",
    ],
    timeWindow: "30–60 minutes before lights-out, nightly",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:timing-matters:v1",
      "rppl:principle:regulate-before-reason:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Evening time autonomy", portType: "boolean", key: "evening_autonomy" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Sleep onset latency", portType: "state", key: "sleep_latency" },
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Nervous-system state", portType: "state", key: "nervous_system_state" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Sleep medicine / CBT-I",
      keyReference:
        "Matthew Walker, 'Why We Sleep' (2017); AASM clinical guidelines; Perlis et al. stimulus-control instructions for CBT-I",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "insomnia-prone", "shift-workers-adjusted", "parents-of-older-children"],
    },
    contextTags: ["sleep", "evening", "nervous-system"],
    contraindications: [
      "Parents of infants — consistency is aspirational; any brief buffer counts",
      "Night-shift workers: invert the pattern to match your personal pre-sleep window regardless of clock time",
    ],
    links: [
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "part_of" },
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:morning-pages:v1", relationship: "synergy" },
    ],
  },

  // ━━━ NUTRITION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:elimination-protocol:v1",
    type: "practice",
    name: "Elimination & Reintroduction Protocol",
    domain: "body",
    description:
      "A time-bounded experiment — typically 30 days — in which the most common dietary triggers (gluten, dairy, seed oils, added sugar, alcohol) are removed completely, then reintroduced one at a time with symptom tracking. The point is not a permanent restricted diet. The point is information: knowing which foods actually affect you in this body, under this stress load, right now — rather than relying on generic guidelines or marketing.",
    trigger:
      "A 30-day window with no major travel, events, or life upheaval scheduled. Start on a specific date, written down.",
    steps: [
      "Pick the categories to eliminate — common starter set: gluten, dairy, industrial seed oils, added sugar, alcohol",
      "30 days with zero exceptions — 'mostly' produces inconclusive data; either you did it or you didn't",
      "Track daily: digestion, skin, sleep, mood, energy on a simple 1–5 scale",
      "Reintroduce one food at a time over 2–3 days each, watching the same metrics for 48–72 hours after",
      "Write conclusions — then design an eating pattern around what YOUR body actually tolerates, not a philosophy",
    ],
    timeWindow: "30 days elimination + 2–3 weeks reintroduction",
    servesPrinciples: [
      "rppl:principle:evidence-not-authority:v1",
      "rppl:principle:test-inherited-beliefs:v1",
      "rppl:principle:observation-before-intervention:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "Food autonomy", portType: "boolean", key: "meal_autonomy" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Food sensitivity map", portType: "state", key: "food_sensitivity_map" },
      { name: "Digestive function", portType: "state", key: "digestive_function" },
      { name: "Inflammation markers", portType: "state", key: "inflammation_markers" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Functional medicine / Whole30 / AIP",
      keyReference:
        "Melissa Urban, 'The Whole30' (2015); Sarah Ballantyne, 'The Paleo Approach' on AIP; functional-medicine elimination-diet protocols",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "chronic-gut-issues", "skin-conditions", "unexplained-fatigue", "autoimmune"],
      validationNotes:
        "Elimination diets are a standard functional-medicine tool; controlled-trial evidence strongest for gluten (celiac/NCGS) and dairy; best viewed as personal diagnostics",
    },
    contextTags: ["nutrition", "diagnostic", "self-experiment"],
    contraindications: [
      "Active or historical eating disorder — do not run this protocol; work with a clinician",
      "Pregnancy, breastfeeding, heavy athletic training — not an appropriate time for restriction",
      "Growing children — involve a pediatric clinician before eliminating food groups",
    ],
    links: [
      { rpplId: "rppl:practice:meal-prep-batch:v1", relationship: "enables" },
      { rpplId: "rppl:framework:scientific-method:v1", relationship: "derived_from" },
      { rpplId: "rppl:practice:eating-window:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:meal-prep-batch:v1",
    type: "practice",
    name: "Weekly Batch Meal Prep",
    domain: "body",
    domains: ["money", "home"],
    description:
      "One block each week — 90 minutes to 3 hours — in which the next 5–7 days of meals are largely pre-built: a protein, a starch, a vegetable, a sauce. Not chef-prepared boxed lunches. The point is to remove the 5pm decision load when willpower and time are at their weakest, which is when most off-plan eating actually happens. Solves for nutrition quality, food budget, and daily cognitive load at the same time.",
    trigger:
      "A fixed weekly slot (e.g. Sunday afternoon) with groceries already bought. Starts when you tie the apron on.",
    steps: [
      "Plan 3–5 meals that share ingredients — cross-use cuts waste and cost",
      "Cook one protein in bulk (roast chicken, slow-cooked beef, lentils), one grain/starch (rice, potatoes, quinoa), and 2–3 roasted or raw vegetable sides",
      "Build one flavor-variable element — a sauce, a dressing, or a spice mix — that lets the same base feel different across the week",
      "Store in portioned containers — label with the date if you keep mixed proteins",
      "Leave breakfast and one dinner unscheduled for flexibility and social eating",
    ],
    timeWindow: "Weekly, 90–180 minutes",
    servesPrinciples: [
      "rppl:principle:design-for-flow:v1",
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:small-patterns-compose:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Kitchen access", portType: "boolean", key: "kitchen_access" },
      { name: "Time block available", portType: "resource", key: "weekly_prep_time" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Food quality baseline", portType: "state", key: "food_quality_baseline" },
      { name: "Decision load", portType: "state", key: "decision_load" },
      { name: "Food budget efficiency", portType: "state", key: "food_budget_efficiency" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Behavioral design / culinary practice",
      keyReference:
        "BJ Fogg, 'Tiny Habits' (2020) on environment design; Michael Pollan, 'Cooked' (2013); widespread practitioner use in athletic and frugal cooking communities",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["busy-professionals", "families", "single-parents", "budget-constrained", "athletes"],
    },
    contextTags: ["nutrition", "design", "weekly", "budget"],
    contraindications: [
      "Shared kitchens without storage — scale down to 2–3 days of prep",
      "People who genuinely thrive on spontaneous cooking — don't force the pattern if it removes joy",
    ],
    links: [
      { rpplId: "rppl:practice:eating-window:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:elimination-protocol:v1", relationship: "synergy" },
    ],
  },

  // ━━━ RECOVERY & ATTENTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:post-illness-recovery:v1",
    type: "practice",
    name: "Post-Illness Graduated Return",
    domain: "body",
    description:
      "A structured return to normal load after an acute illness (flu, COVID, severe GI, injury) rather than a same-day snap back to full capacity. The body under acute load spends metabolic currency on repair; demanding full output immediately is how minor illnesses become long recoveries and post-viral syndromes. Base rule of thumb: for every day symptoms kept you fully down, allow one day of deliberately reduced load before returning to baseline — more if fatigue, breathlessness, or cognitive fog linger.",
    trigger:
      "The day symptoms resolve enough that you feel 'I could probably do normal stuff today' — which is the moment to not.",
    steps: [
      "Day 1 of feeling recovered: keep load at ~50% — short walks only, no training, early sleep",
      "Day 2–3: add light activity — longer walks, easy mobility, resume normal work with buffer",
      "Day 4–5: re-introduce low-intensity training sessions at ~60–70% of normal volume",
      "Return to full training/load only when resting HR, sleep, and mood are back to baseline for 2+ days",
      "If any symptom returns — fatigue crash, HR drift, breathlessness — step back one phase, not a full reset",
    ],
    timeWindow: "3–10 days after acute illness, longer if post-viral",
    servesPrinciples: [
      "rppl:principle:rest-is-productive:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:observation-before-intervention:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Recent acute illness", portType: "boolean", key: "recent_acute_illness" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
    ],
    outputs: [
      { name: "Recovery trajectory", portType: "state", key: "recovery_trajectory" },
      { name: "Immune resilience", portType: "state", key: "immune_resilience" },
      { name: "Risk of post-viral syndrome", portType: "state", key: "post_viral_risk" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Sports medicine / post-viral rehabilitation",
      keyReference:
        "Return-to-play guidelines (AMSSM, BJSM); post-COVID graded return-to-activity protocols (e.g. Elliott et al. 2020); long-COVID pacing literature",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["athletes", "active-adults", "post-COVID", "post-flu"],
      validationNotes:
        "Graduated return-to-play is standard in sports medicine and has been extended to post-viral protocols; premature return correlates with prolonged symptoms",
    },
    contextTags: ["recovery", "illness", "staged"],
    contraindications: [
      "Cardiac symptoms post-illness (chest pain, new palpitations) — stop and see a clinician before any return",
      "Suspected long-COVID / ME/CFS patterns — pacing is the protocol; graduated exercise can worsen; see specialist",
    ],
    links: [
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:walking-daily:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:terrain-theory:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:morning-pages:v1",
    type: "practice",
    name: "Morning Pages",
    domain: "body",
    domains: ["growth", "purpose"],
    description:
      "Three pages of longhand, stream-of-consciousness writing, done as early in the day as possible. Not a journal in the reflective sense — closer to a mental-hygiene practice: pulling the unfinished thoughts, resentments, lists, and half-worries out of the working memory so they stop running in the background all day. The cost is ~20 minutes. The return is a consistent, measurable reduction in mental clutter and a reliable route to creative clarity.",
    trigger:
      "First 20 minutes of the day, before opening email or consuming any input. Pen, paper, coffee — start writing.",
    steps: [
      "Pen and physical paper — the slower bandwidth is part of the mechanism",
      "Three pages of whatever comes. No editing, no re-reading during the session, no topic",
      "If stuck: literally write 'I don't know what to write' until something else shows up — it always does",
      "Do not share or re-read for at least a week — that changes what you write",
      "Daily consistency beats length or quality — miss a day, don't double up; just continue tomorrow",
    ],
    timeWindow: "First 20 minutes of the day",
    servesPrinciples: [
      "rppl:principle:observation-before-intervention:v1",
      "rppl:principle:attention-grows:v1",
      "rppl:principle:signal-not-noise:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
    ],
    inputs: [
      { name: "20 minutes of morning solitude", portType: "boolean", key: "morning_solitude" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Mental clarity", portType: "state", key: "mental_clarity" },
      { name: "Attention restoration", portType: "state", key: "attention_restoration" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Intellectual capital", portType: "capital", key: "intellectual" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Expressive writing / creativity practice",
      keyReference:
        "Julia Cameron, 'The Artist's Way' (1992) — original 'morning pages' formulation; James Pennebaker's expressive-writing research on health and cognitive outcomes",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "knowledge-workers", "creatives", "high-rumination"],
      validationNotes:
        "Pennebaker's expressive-writing body of work provides strong clinical grounding; the specific 'three pages every morning' form is practitioner-validated rather than trial-tested",
    },
    contextTags: ["attention", "morning", "writing", "mental-hygiene"],
    contraindications: [
      "Active trauma processing — expressive writing about trauma can temporarily worsen symptoms; pair with a clinician",
      "Parents of infants whose mornings are claimed — scale to one page or shift to a different time-window",
    ],
    links: [
      { rpplId: "rppl:practice:morning-threshold:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:wind-down-routine:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
    ],
  },
];
