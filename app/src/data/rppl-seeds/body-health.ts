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
];
