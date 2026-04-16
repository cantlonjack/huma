import type { RpplSeed } from "./types";

// ─── Home & Relationships Practices ─────────────────────────────────────────
// Patterns for the physical environment that holds a life and the human
// systems that run inside it. Home is treated the way Regrarians treats land:
// permanence before detail, structure before ornament. Relationships are
// treated as nervous-systems-in-contact (Porges/Gottman), not as emotional
// contracts to be optimized. Each seed is a concrete, runnable pattern with
// honest evidence notes — not a self-help aphorism.
//
// Conventions: rpplId: "rppl:practice:{slug}:v1"; link to principles via
// servesPrinciples and frameworks via links.derived_from; evidence grounded
// where possible, tagged as "seed" when experiential/traditional only.
// ─────────────────────────────────────────────────────────────────────────────

export const homeRelationshipsSeeds: RpplSeed[] = [
  // ━━━ HOUSEHOLD SYSTEMS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:weekly-home-reset:v1",
    type: "practice",
    name: "Weekly Home Reset",
    domain: "home",
    domains: ["people"],
    description:
      "One scheduled block per week — 60 to 120 minutes — that returns the house to a baseline state: surfaces clear, laundry cycling, dishes zeroed, floors acceptable, fridge triaged. The point is not perfection — it's that the same starting line exists every Monday. Without a reset, household entropy accumulates into the kind of cascading mess that eats whole weekends. One block spent deliberately saves many spent reactively.",
    trigger:
      "A fixed weekly slot (e.g. Sunday late morning) scheduled like any other appointment. Starts when the timer begins — no pre-game required.",
    steps: [
      "Start a timer (60–120 minutes) and a short playlist — this is a time-boxed session, not a project",
      "Clear all horizontal surfaces first — kitchen counters, table, entryway — everything goes to its home or the donate/discard pile",
      "Floors and trash in one sweep — vacuum/sweep, take bins out, replace liners",
      "One load through laundry (start-to-fold) and one fridge triage (expired out, leftovers labeled)",
      "Stop when the timer ends — unfinished items become candidates for next week, not tonight",
    ],
    timeWindow: "Weekly, 60–120 minute block",
    servesPrinciples: [
      "rppl:principle:entropy-default:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:design-for-flow:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Household autonomy", portType: "boolean", key: "household_autonomy" },
      { name: "Weekly time block", portType: "resource", key: "weekly_reset_time" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Household baseline", portType: "state", key: "household_baseline" },
      { name: "Decision load", portType: "state", key: "decision_load" },
      { name: "Material capital", portType: "capital", key: "material" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "FlyLady system / home management traditions",
      keyReference:
        "Marla Cilley, 'Sink Reflections' (2002) and FlyLady.net; Marie Kondo on surface-clearing as system reset; David Allen 'GTD' on weekly review parallels",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["any-household", "families", "roommates", "single-adults"],
      validationNotes:
        "Strong practitioner validation across decades; no controlled trials on household routine per se, but the mechanism (decision-load reduction, entropy management) is well-grounded",
    },
    contextTags: ["home", "weekly", "systems", "foundational"],
    contraindications: [
      "Post-natal months / acute illness / caregiver crisis — scale down to a single surface, not a full reset",
      "Shared households with no chore agreement — handle agreements (see Shared Household Agreements) first or this becomes silent resentment work",
    ],
    links: [
      { rpplId: "rppl:practice:zone-cleaning-rotation:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:shared-household-agreements:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:meal-prep-batch:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:zone-cleaning-rotation:v1",
    type: "practice",
    name: "Zone Cleaning Rotation",
    domain: "home",
    description:
      "The house is divided into 4–5 zones; each week one zone gets 15 minutes a day of deeper attention (baseboards, inside the fridge, the closet that everything falls out of). Marathon cleaning is how households oscillate between spotless and buried; rotation converts that oscillation into a steady, manageable current. The point is that everything gets attention every month without anything ever requiring a lost Saturday.",
    trigger:
      "Daily 15-minute cue in the current week's zone — often stacked onto an existing morning or evening block (coffee, before dinner).",
    steps: [
      "Divide home into 4–5 zones — e.g. Entry/Living, Kitchen, Bathrooms, Bedroom, Bonus (garage/outdoor)",
      "Assign one zone per week — cycle every month or five weeks",
      "Each day in that zone: 15 minutes of deeper attention on tasks the weekly reset doesn't catch (wipe baseboards, deep-clean appliance, purge drawer)",
      "Keep a running list for that zone so you're not re-deciding what to do daily",
      "Hard stop at 15 minutes — depth beats marathon; what's not done this rotation returns in 4 weeks",
    ],
    timeWindow: "Daily 15-minute blocks, rotating zones weekly",
    servesPrinciples: [
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: ["rppl:capacity:care:v1"],
    inputs: [
      { name: "Daily routine anchor", portType: "boolean", key: "daily_routine_anchor" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Deep-cleaning coverage", portType: "state", key: "deep_cleaning_coverage" },
      { name: "Household baseline", portType: "state", key: "household_baseline" },
      { name: "Material capital", portType: "capital", key: "material" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "FlyLady zone system / traditional housekeeping",
      keyReference:
        "Marla Cilley FlyLady zone system; 'Home Comforts' by Cheryl Mendelson (1999) on cyclical home care",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["any-household", "time-constrained-adults", "families"],
    },
    contextTags: ["home", "daily", "systems"],
    contraindications: [
      "Very small living spaces (studio, single room): 2 zones with a two-week cycle is often more appropriate",
      "People whose household stress is about decision-fatigue rather than cleanliness — start with Weekly Home Reset and skip this layer until the baseline holds",
    ],
    links: [
      { rpplId: "rppl:practice:weekly-home-reset:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:seasonal-home-maintenance:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:shared-household-agreements:v1",
    type: "practice",
    name: "Shared Household Agreements",
    domain: "home",
    domains: ["people", "money"],
    description:
      "An explicit, written agreement among people who share a dwelling — roommates, partners, multi-generational family — covering the predictable friction surfaces: chores, money, guests, noise, shared food, quiet hours. Most household conflict isn't about character; it's about unspoken assumptions colliding. The agreement makes the assumptions visible and disputable, so the argument is with a document instead of a person.",
    trigger:
      "Move-in day, a new cohabitant, or the moment you notice the same complaint surfacing twice in a month. A scheduled conversation — not a heat-of-the-moment correction.",
    steps: [
      "Schedule a 60–90 minute sit-down — neutral time, no phones, ideally not in anyone's bedroom",
      "List the friction categories: chores (who does what, how often), money (rent split, utilities, shared groceries, Netflix), guests (overnight, advance notice), noise (quiet hours, weekends), shared food (labeling, replacement), cleaning standards",
      "Each person proposes their non-negotiables and their preferences — distinguish the two explicitly",
      "Write the agreement — plain language, dated, stored somewhere both people can see (shared note, fridge)",
      "Re-open it every 3–6 months or when a new pattern emerges — agreements are living documents, not vows",
    ],
    timeWindow: "Initial 60–90 minutes; review every 3–6 months",
    servesPrinciples: [
      "rppl:principle:cooperation-structure:v1",
      "rppl:principle:voluntary-power:v1",
      "rppl:principle:needs-not-judgments:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Cohabitants willing to sit down", portType: "boolean", key: "cohabitant_willingness" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Cohabitation friction", portType: "state", key: "cohabitation_friction" },
      { name: "Shared expectations clarity", portType: "state", key: "shared_expectations_clarity" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Nonviolent Communication / cohousing practice / conflict resolution",
      keyReference:
        "Marshall Rosenberg, 'Nonviolent Communication' (2003); Diana Leafe Christian, 'Creating a Life Together' (2003) on intentional-community governance; roommate-mediation research from university housing services",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["roommates", "couples", "multi-generational-households", "new-cohabitants"],
    },
    contextTags: ["home", "people", "agreements", "cooperation"],
    contraindications: [
      "Abusive cohabitation — agreements cannot fix coercion; safety planning and exit support come first",
      "Very transient living situations (<1 month) — a 10-minute verbal alignment is usually enough",
    ],
    links: [
      { rpplId: "rppl:practice:weekly-relationship-checkin:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:monthly-money-meeting:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:nvc:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:home-light-architecture:v1",
    type: "practice",
    name: "Home Light Architecture",
    domain: "home",
    domains: ["body"],
    description:
      "Arranging the home's lighting so the body receives bright, cool light by day and warm, dim light after sunset — without requiring willpower every evening. The same circadian signals that Morning Threshold and Evening Light Dimming chase are won or lost by what's already screwed into the ceiling. A one-time configuration change does what daily discipline otherwise would.",
    trigger:
      "A weekend afternoon, a new move-in, or the observation that the same 'dim the lights' reminder hasn't stuck for a month. One audit, then installations.",
    steps: [
      "Walk through every room with the lights on — note which fixtures are overhead/bright-white and which are warm/low",
      "Replace bulbs in main living spaces with tunable or 2700K warm-white LEDs; reserve 5000K+ for bathrooms/kitchens only",
      "Install a red or amber lamp (or red-filter bulb) in the bedroom and one main evening space — becomes the 'after 9pm' lighting",
      "Add dimmers (plug-in or switch-replace) on any fixture you use after sunset",
      "Put a blackout curtain or mask in the bedroom — zero ambient light from the outside is the default",
    ],
    timeWindow: "One-time setup, 2–4 hours + minor ongoing",
    servesPrinciples: [
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:body-light-system:v1",
      "rppl:principle:home-first-ecosystem:v1",
    ],
    servesCapacities: ["rppl:capacity:agency:v1"],
    inputs: [
      { name: "Lighting-control autonomy (owner or permissive rental)", portType: "boolean", key: "lighting_autonomy" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Circadian alignment", portType: "state", key: "circadian_entrainment" },
      { name: "Evening wind-down ease", portType: "state", key: "sleep_latency" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Material capital", portType: "capital", key: "material" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Circadian biology / environmental design",
      keyReference:
        "Satchin Panda, 'The Circadian Code' (2018); WELL Building Standard lighting criteria; Jack Kruse photobiology writings",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["homeowners", "long-term-renters", "families", "screen-heavy-households"],
    },
    contextTags: ["home", "circadian", "environment", "one-time-setup"],
    contraindications: [
      "Short-term rentals / temporary housing — use plug-in lamps and portable solutions only",
      "Cohabitants with conflicting preferences — negotiate zone-by-zone rather than house-wide",
      "Vision conditions that require specific lighting (low-vision adaptation) — defer to the accommodating need",
    ],
    links: [
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "enables" },
      { rpplId: "rppl:practice:sunrise-exposure:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:circadian-biology:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:seasonal-home-maintenance:v1",
    type: "practice",
    name: "Seasonal Home Maintenance",
    domain: "home",
    description:
      "A four-cadence maintenance rhythm matched to the seasons: equinoxes and solstices (or the local analog) become fixed appointments for home/vehicle/property tasks that don't fit a weekly cycle — filters, gutters, tires, caulking, smoke alarms, garden transitions. The cost of skipping these is not linear: a neglected gutter becomes a water-damage claim; a tire left under-pressured becomes a blowout. The cadence converts rare but expensive failures into predictable small work.",
    trigger:
      "Each solstice/equinox (or the nearest weekend). A recurring calendar event with a checklist attached — the trigger is the date, not the need.",
    steps: [
      "Build a four-column checklist: Spring, Summer, Autumn, Winter — list tasks by season (gutters in autumn, HVAC service before summer, tire changeover, battery check, caulking, smoke-alarm test)",
      "Add vehicle and outdoor equipment to the same list — oil, fluids, winterization, mower",
      "Budget half a Saturday per cadence — more if you have land or aging infrastructure",
      "Work the list in priority order — safety items (alarms, carbon monoxide, tires) first, aesthetic last",
      "Archive the completed list with date and any issues found — becomes the provenance trail for the home",
    ],
    timeWindow: "Four times/year, 3–6 hour block each",
    servesPrinciples: [
      "rppl:principle:permanence-order:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:entropy-default:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Home/vehicle ownership or maintenance responsibility", portType: "boolean", key: "maintenance_responsibility" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Asset longevity", portType: "state", key: "asset_longevity" },
      { name: "Failure risk", portType: "state", key: "failure_risk" },
      { name: "Material capital", portType: "capital", key: "material" },
      { name: "Financial capital", portType: "capital", key: "financial" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Permaculture / Regrarians / traditional property stewardship",
      keyReference:
        "Regrarians Permanence Scale (Darren Doherty); 'Home Comforts' by Cheryl Mendelson; Bob Vila-era home-maintenance handbooks",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["homeowners", "vehicle-owners", "property-stewards", "rural-living"],
      validationNotes:
        "Insurance and property-management data consistently show preventive maintenance reduces catastrophic-failure rates; the specific quarterly cadence is practitioner convention",
    },
    contextTags: ["home", "seasonal", "maintenance", "foundational"],
    contraindications: [
      "Renters with no maintenance responsibility — scope to possessions only (bike, vehicle, seasonal clothes)",
      "High-rise apartment dwellers — compress to two cadences (spring/fall) for applicable tasks",
    ],
    links: [
      { rpplId: "rppl:practice:zone-cleaning-rotation:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:seasonal-review:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:regrarians:v1", relationship: "derived_from" },
    ],
  },

  // ━━━ LAND & ECOSYSTEM (HOME AS SYSTEM) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:kitchen-garden-establishment:v1",
    type: "practice",
    name: "Kitchen Garden Establishment",
    domain: "home",
    domains: ["body", "joy"],
    description:
      "Starting the smallest viable food garden — a few raised beds, a container herb setup, or a single bed — built on a soil-first approach rather than a plant-first one. Regrarians and permaculture both put soil and water before species selection; a rich bed grows almost anything, a poor bed grows almost nothing. The practice is not about self-sufficiency — it's about restoring a direct feedback loop between daily life and food, which subtly re-orders many other choices.",
    trigger:
      "Late winter / early spring (or the local equivalent). Soil preparation begins 4–6 weeks before the first planting — the trigger is the calendar, not enthusiasm.",
    steps: [
      "Pick the smallest viable footprint — one 4×8 ft raised bed, three containers, or a 10 sq ft in-ground patch",
      "Build soil before buying plants: 4–6 inches of finished compost layered onto the planting area, left to settle for 2–4 weeks",
      "Pick 3–5 crops you will actually eat — lettuce, kale, tomatoes, herbs, beans are high-yield / low-skill",
      "Install a basic watering system (drip line + timer, or a daily hose routine you'll actually follow) before the first transplant",
      "Harvest weekly into your meals — the loop from bed to plate is the point; a bed you don't eat from dies",
    ],
    timeWindow: "Seasonal setup; ongoing weekly tending",
    servesPrinciples: [
      "rppl:principle:permanence-order:v1",
      "rppl:principle:multiple-yields:v1",
      "rppl:principle:home-first-ecosystem:v1",
      "rppl:principle:integrate-not-segregate:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Outdoor or sun-exposed growing space", portType: "boolean", key: "growing_space_access" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Food provenance", portType: "state", key: "food_provenance" },
      { name: "Soil biology", portType: "state", key: "soil_biology" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
      { name: "Material capital", portType: "capital", key: "material" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Regrarians / permaculture / kitchen-garden tradition",
      keyReference:
        "Regrarians Permanence Scale — soil precedes structure (Darren Doherty); David Holmgren, 'Permaculture: Principles & Pathways' (2002); Eliot Coleman, 'The New Organic Grower'",
    },
    evidence: {
      confidence: "seed",
      contextTags: ["land-access", "homeowners", "renters-with-outdoor-access", "families", "beginners"],
      validationNotes:
        "Practitioner traditions are deep; the specific claim of life-ordering effect is experiential rather than trial-tested — food-production literature shows well-being effects that support the direction",
    },
    contextTags: ["home", "land", "food", "seasonal", "beginner-friendly"],
    contraindications: [
      "No outdoor access or south-facing window — scale to sprouting and indoor herb-only setup",
      "Frequent moves (< 1 year stays) — use containers only; in-ground effort won't repay",
      "Contaminated urban soil (lead risk) — raised beds with imported soil only; test if uncertain",
    ],
    links: [
      { rpplId: "rppl:practice:household-composting-loop:v1", relationship: "enables" },
      { rpplId: "rppl:practice:seasonal-home-maintenance:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:regrarians:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:permaculture:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:household-composting-loop:v1",
    type: "practice",
    name: "Household Composting Loop",
    domain: "home",
    domains: ["body", "money"],
    description:
      "A closed loop between the kitchen and the soil: food scraps → compost → garden → food. It's the clearest household expression of the principle that waste is a design failure. A countertop caddy, a backyard pile or bokashi bucket, and a monthly turn is usually enough. Beyond landfill reduction, the practical effect is that you never run out of the most valuable input to a kitchen garden, and the kitchen itself starts sorting its outputs as a matter of habit.",
    trigger:
      "The next time you throw food scraps in the trash. The decision to route scraps elsewhere is what starts the loop.",
    steps: [
      "Put a small lidded container on the kitchen counter — this is the only daily-facing piece",
      "Pick a composting method that matches your living situation — backyard pile (land), tumbler (small yard), bokashi bucket (apartment), worm bin (indoor), or municipal compost pickup",
      "Empty the counter caddy every 1–3 days — let it sit longer and the habit breaks when it stinks",
      "Turn/add to the outdoor pile monthly (or follow bokashi fermentation cycles); harvest finished compost 2–4 times a year",
      "Return finished compost directly to the kitchen garden or houseplants — closing the loop matters emotionally and ecologically",
    ],
    timeWindow: "Daily caddy empty + monthly tending",
    servesPrinciples: [
      "rppl:principle:multiple-yields:v1",
      "rppl:principle:integrate-not-segregate:v1",
      "rppl:principle:home-first-ecosystem:v1",
      "rppl:principle:subtract-before-add:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Composting method available (yard, tumbler, bokashi, or pickup)", portType: "boolean", key: "composting_method_available" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Finished compost output", portType: "resource", key: "finished_compost" },
      { name: "Landfill waste volume", portType: "state", key: "landfill_waste_volume" },
      { name: "Soil biology", portType: "state", key: "soil_biology" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Material capital", portType: "capital", key: "material" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Permaculture / soil science / zero-waste practice",
      keyReference:
        "Permaculture principle 'produce no waste' (Holmgren); Sir Albert Howard, 'An Agricultural Testament' (1940) on composting and soil; bokashi method from Teruo Higa",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["any-household", "gardeners", "households-with-yard", "urban-bokashi-or-pickup"],
      validationNotes:
        "Composting efficacy for soil amendment is well-established; the behavioral pattern (counter caddy → method) is the practical bottleneck that this practice targets",
    },
    contextTags: ["home", "loop", "daily-habit", "zero-waste"],
    contraindications: [
      "Rented housing with no yard, no bokashi tolerance, and no municipal pickup — practice is not feasible without one of these",
      "Vermin-heavy urban environments — closed systems (bokashi, tumbler) only; open piles can attract rats",
    ],
    links: [
      { rpplId: "rppl:practice:kitchen-garden-establishment:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:permaculture:v1", relationship: "derived_from" },
    ],
  },

  {
    rpplId: "rppl:practice:phone-free-zones:v1",
    type: "practice",
    name: "Phone-Free Zones",
    domain: "home",
    domains: ["people", "body"],
    description:
      "Two or three fixed areas of the home — typically the bedroom and the dinner table — declared phone-free as a household rule, not an individual virtue. Spatial constraints hold better than willpower, and the effect on sleep, conversation, and presence is quick and measurable. Distinct from Digital Sabbath (which is temporal): this practice alters the geography of attention.",
    trigger:
      "The household's agreement that the pattern starts — typically after a conversation about sleep, kid screens, or 'we don't talk at dinner anymore'. A physical landing spot is placed at each zone's threshold.",
    steps: [
      "Name the zones explicitly — bedroom, dinner table, and optionally one other (living-room couch, bath)",
      "Create a landing spot at the boundary — a charging shelf by the front door, a basket on the hall table",
      "When entering a zone, phone goes to the landing spot — visible, public, same rule for adults and kids",
      "For emergencies: a non-phone alarm clock in the bedroom; a kitchen phone on silent-visible for urgent calls",
      "Revisit after 2 weeks — adjust zone list up or down based on what's actually working",
    ],
    timeWindow: "Continuous / zone-triggered",
    servesPrinciples: [
      "rppl:principle:design-for-bias:v1",
      "rppl:principle:attention-grows:v1",
      "rppl:principle:subtract-before-add:v1",
      "rppl:principle:signal-not-noise:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Household buy-in or single-occupant autonomy", portType: "boolean", key: "household_buyin" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Sleep quality", portType: "state", key: "sleep_quality" },
      { name: "Relational presence", portType: "state", key: "relational_presence" },
      { name: "Attention restoration", portType: "state", key: "attention_restoration" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Digital-minimalism literature / behavioral environment design",
      keyReference:
        "Cal Newport, 'Digital Minimalism' (2019); Catherine Price, 'How to Break Up with Your Phone' (2018); BJ Fogg on environment design",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["families", "couples", "teenagers", "knowledge-workers", "screen-heavy-households"],
    },
    contextTags: ["home", "attention", "boundaries", "households"],
    contraindications: [
      "On-call roles that genuinely require phone at bedside — use a do-not-disturb allowlist instead of full zone rule",
      "Caregivers of at-risk individuals where rapid contact matters — adapt the zone rule with a clearly-defined exception",
    ],
    links: [
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:evening-light-dimming:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:sleep-protocol:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:protected-quality-time:v1", relationship: "enables" },
    ],
  },

  // ━━━ COUPLES & INTIMATE RELATIONSHIPS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:weekly-relationship-checkin:v1",
    type: "practice",
    name: "Weekly Relationship Check-in",
    domain: "people",
    description:
      "A 30- to 60-minute structured conversation with a partner — same time each week — that surfaces appreciations, concerns, and upcoming-week logistics before they accumulate into resentment or surprise. Gottman's research is unambiguous: couples who make time for regular, low-stakes connection dramatically outperform those who wait for issues to force a conversation. The cost is one block a week. The alternative is paying in a larger currency later.",
    trigger:
      "A fixed recurring slot — e.g. Sunday evening after dinner — scheduled on both calendars. Non-negotiable except for genuine emergencies.",
    steps: [
      "Appreciations first — each person names 2–3 specific things the other did this week that mattered. Not generic, not 'you're great' — behaviorally specific",
      "Shared wins / shared stresses — what went well as a couple, what felt hard",
      "Concerns — each person raises at most one or two unresolved items, phrased as needs not accusations ('I need more connection' vs 'you're always on your phone')",
      "Week-ahead logistics — calendar, commitments, money decisions, social plans",
      "Close with physical contact or a small ritual — the parasympathetic bookend matters as much as the content",
    ],
    timeWindow: "Weekly, 30–60 minute block",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:cooperation-structure:v1",
      "rppl:principle:needs-not-judgments:v1",
      "rppl:principle:regulate-before-reason:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:care:v1",
      "rppl:capacity:awareness:v1",
    ],
    inputs: [
      { name: "Partnered (romantic or committed cohabitation)", portType: "boolean", key: "has_partner" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Relationship repair capacity", portType: "state", key: "relationship_repair_capacity" },
      { name: "Shared expectations clarity", portType: "state", key: "shared_expectations_clarity" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Gottman Method / couples therapy",
      keyReference:
        "John & Julie Gottman, 'The Seven Principles for Making Marriage Work' (1999); Gottman Institute 'State of the Union' meeting protocol; Esther Perel on intentional relationship practice",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["couples", "long-term-partners", "cohabitants", "remote-parents"],
      validationNotes:
        "Gottman research tracks couples over decades; regular intentional connection is among the most reliable predictors of relationship longevity and satisfaction",
    },
    contextTags: ["people", "couples", "weekly", "foundational"],
    contraindications: [
      "Active abuse — do not practice inside an unsafe relationship; use specialist resources",
      "Acute crisis (grief, major illness) — scale down to a 10-minute appreciation-only version; skip concerns until stability returns",
    ],
    links: [
      { rpplId: "rppl:practice:repair-attempts-practice:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:monthly-money-meeting:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:protected-quality-time:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:nvc:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:monthly-money-meeting:v1",
    type: "practice",
    name: "Monthly Money Meeting",
    domain: "people",
    domains: ["money", "home"],
    description:
      "A 60-minute meeting, once a month, where a couple reviews the previous month's income and spending, the next month's plans, and any upcoming large decisions. Most financial tension in long-term relationships is not about disagreement on values — it's about asymmetric information. When both people see the same numbers the same day, the fights shrink and the decisions get faster.",
    trigger:
      "A recurring calendar event on a fixed day (e.g. the first Sunday of the month). Precondition: accounts aggregated or a shared spreadsheet updated before the meeting.",
    steps: [
      "Before the meeting: one person updates the spending summary — both people should be able to see every account",
      "Open with the month's numbers — income in, spent in each category, saved, invested, debt changed",
      "Review commitments for the next 30 days — recurring bills, upcoming large spend, social/travel costs",
      "Decide any pending money moves together — the rule is no large purchase (threshold set by the couple) happens without prior agreement here",
      "End with alignment on the monthly savings/debt number — a single shared metric to track",
    ],
    timeWindow: "Monthly, 45–60 minutes",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:cooperation-structure:v1",
      "rppl:principle:whole-context-decisions:v1",
      "rppl:principle:evidence-not-authority:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Partnered with shared finances or overlapping obligations", portType: "boolean", key: "shared_finances" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Financial transparency", portType: "state", key: "financial_transparency" },
      { name: "Money-decision latency", portType: "state", key: "money_decision_latency" },
      { name: "Financial capital", portType: "capital", key: "financial" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Financial therapy / couples money research",
      keyReference:
        "Ramit Sethi, 'I Will Teach You To Be Rich' (2009, 2nd ed. 2019) on the monthly money meeting; Brad Klontz, 'Financial Therapy' (2015); Gottman research on money as a top source of couples conflict",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["couples", "long-term-partners", "married-couples", "cohabitants-with-shared-expenses"],
      validationNotes:
        "Financial-therapy literature strongly supports regular joint review; specific cadence is practitioner convention — monthly lines up with billing cycles",
    },
    contextTags: ["people", "money", "monthly", "couples"],
    contraindications: [
      "Financial abuse / coercive control — do not normalize meetings inside an unsafe dynamic; consult a specialist",
      "Couples with fully separate finances by deliberate choice — scale to a 15-minute alignment on shared obligations only",
    ],
    links: [
      { rpplId: "rppl:practice:weekly-relationship-checkin:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:conscious-spending-plan:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:shared-household-agreements:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:repair-attempts-practice:v1",
    type: "practice",
    name: "Repair Attempts Practice",
    domain: "people",
    description:
      "Small, deliberate moves inside a disagreement that signal 'I still want to be on your team' — a deliberate softening of tone, a bid for humor, a named emotional state, a pause for water. Gottman's 40-year research found that master couples don't avoid conflict; they make and accept repair attempts early and often. The practice is learning to offer them (and not reject your partner's) before the disagreement escalates into one of the Four Horsemen (criticism, contempt, defensiveness, stonewalling).",
    trigger:
      "The moment you notice heat climbing in a disagreement — a rise in voice, a tightening in the chest, the start of 'you always'. The trigger is the physiological cue, not the topic.",
    steps: [
      "Name the state, not the person: 'I'm getting overwhelmed,' 'My heart rate is climbing,' 'I need a minute'",
      "Offer a repair bid: soften tone, acknowledge their point, share a small piece of vulnerability, make a small joke if the relationship supports it",
      "If received: continue slower — stay curious about their experience before re-arguing yours",
      "If you cross a physiological-flood threshold (heart rate ≥100 at rest, shaking, shutdown): agree on a 20–40 minute pause with a specific return time — not an exit, a reset",
      "Post-conflict: debrief within 24 hours — what triggered it, what repair worked, what would help next time",
    ],
    timeWindow: "In-the-moment; post-conflict debrief within 24h",
    servesPrinciples: [
      "rppl:principle:regulate-before-reason:v1",
      "rppl:principle:calm-is-contagious:v1",
      "rppl:principle:needs-not-judgments:v1",
      "rppl:principle:response-not-circumstances:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Relationship with recurring conflict surface (any dyad)", portType: "boolean", key: "recurring_dyad" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
      { name: "Humility", portType: "capacity", key: "humility" },
    ],
    outputs: [
      { name: "Conflict de-escalation capacity", portType: "state", key: "conflict_deescalation" },
      { name: "Nervous-system state", portType: "state", key: "nervous_system_state" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Gottman Method / polyvagal-informed couples work",
      keyReference:
        "John Gottman, 'The Relationship Cure' (2001); 'The Seven Principles' on repair attempts; Stephen Porges on physiological flooding and autonomic state",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["couples", "families", "co-parents", "any-close-relationship"],
      validationNotes:
        "Repair attempts are one of the most predictive variables in Gottman's couples research; effect generalizes beyond romantic relationships",
    },
    contextTags: ["people", "conflict", "regulation", "micro-practice"],
    contraindications: [
      "Abusive dynamics — repair attempts in an unsafe relationship can be coercive when one person refuses to hear them; specialist support first",
      "Acute trauma activation — a longer pause and professional support, not continued engagement",
    ],
    links: [
      { rpplId: "rppl:practice:weekly-relationship-checkin:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:physiological-sigh:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:polyvagal-theory:v1", relationship: "derived_from" },
      { rpplId: "rppl:framework:nvc:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:protected-quality-time:v1",
    type: "practice",
    name: "Protected Quality Time",
    domain: "people",
    domains: ["joy"],
    description:
      "A recurring, scheduled, phone-free block of time with a partner — not parenting logistics, not errands — that is treated as a fixed commitment, not a 'when we can'. Research on long-term couples repeatedly shows the same thing: the issue is not love, it's availability. Intimacy (emotional and physical) is a product of repeated small unhurried exposures; it does not survive on leftover time.",
    trigger:
      "A recurring slot on both calendars — weekly at minimum, a longer monthly date if feasible. Treated as an appointment, not a preference.",
    steps: [
      "Schedule it — concrete day, concrete duration (90–180 minutes), on both calendars",
      "Phones stay out of the room or zone — the presence of devices halves the perceived quality of the time",
      "Protect it from logistics — this is not the time to discuss childcare, bills, or work; those belong in the weekly check-in",
      "Rotate who designs the block — a simple walk, a shared meal, a project together, a physical activity, a playlist on the couch",
      "Recover it if missed — reschedule within the week, not abandon; breaking the pattern is the thing to avoid",
    ],
    timeWindow: "Weekly (90–180 min) + monthly (half-day)",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:attention-grows:v1",
      "rppl:principle:design-for-bias:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Partnered relationship", portType: "boolean", key: "has_partner" },
      { name: "Schedule autonomy (both people)", portType: "boolean", key: "dual_schedule_autonomy" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Relational presence", portType: "state", key: "relational_presence" },
      { name: "Relationship repair capacity", portType: "state", key: "relationship_repair_capacity" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Couples research / Esther Perel on erotic intelligence",
      keyReference:
        "Esther Perel, 'Mating in Captivity' (2006) on the counter-intuitive scheduling of intimacy; Gottman 'Turning Toward vs Turning Away' bids; Arthur Aron's closeness research",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["couples", "long-term-partners", "parents", "dual-career-couples"],
      validationNotes:
        "Quality-over-quantity finding is replicated across couples research; the specific 'scheduled and phone-free' form is practitioner-validated",
    },
    contextTags: ["people", "couples", "weekly", "intimacy"],
    contraindications: [
      "Newborn months / severe caregiver load — scale to 20-minute in-home micro-dates; don't force romance onto survival",
      "One partner strongly against scheduling — revisit as a needs conversation (see NVC) before trying to enforce the pattern",
    ],
    links: [
      { rpplId: "rppl:practice:phone-free-zones:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:weekly-relationship-checkin:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:digital-sabbath:v1", relationship: "synergy" },
    ],
  },

  // ━━━ FAMILY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:family-meeting:v1",
    type: "practice",
    name: "Weekly Family Meeting",
    domain: "people",
    domains: ["home"],
    description:
      "A short weekly gathering of everyone under the roof — adults and children — where the week's plans, concerns, and appreciations get aired out in a predictable format. Not a management meeting. A place where younger members have genuine voice, where logistics get sorted before they become arguments, and where the household sees itself as a team on purpose. The meeting is age-graded: with young kids it's 10 minutes over snacks; with teens it's 30 minutes with real decision weight.",
    trigger:
      "A fixed weekly slot — typically Sunday evening — held regardless of who had a hard week. Consistency is what makes kids take it seriously.",
    steps: [
      "Open with appreciations — each person names one specific thing they valued about someone else in the family this week",
      "Calendar sync — who has what coming up, who needs rides / gear / money",
      "Concerns corner — anyone can raise one issue about the household; frame as needs, age-appropriately",
      "Decisions — everyone weighs in on any household decision that affects them; adults hold final say but the input is real",
      "Close with a ritual — dessert, a game, or a read-aloud — the parasympathetic bookend doubles as the reason kids show up",
    ],
    timeWindow: "Weekly, 15–45 minutes depending on family size/ages",
    servesPrinciples: [
      "rppl:principle:cooperation-structure:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:needs-not-judgments:v1",
      "rppl:principle:whole-context-decisions:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Multi-person household", portType: "boolean", key: "multi_person_household" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Family cohesion", portType: "state", key: "family_cohesion" },
      { name: "Shared expectations clarity", portType: "state", key: "shared_expectations_clarity" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Cultural capital", portType: "capital", key: "cultural" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Positive-discipline / Adlerian family therapy / intentional parenting",
      keyReference:
        "Jane Nelsen, 'Positive Discipline' (2006) on family meetings; Ross Greene, 'The Explosive Child' (collaborative problem-solving); Bruce Feiler, 'The Secrets of Happy Families' (2013)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["families-with-kids", "multi-generational-households", "co-parents-same-home", "teens"],
    },
    contextTags: ["people", "family", "weekly", "systems"],
    contraindications: [
      "Households with active family violence or coercion — meetings can be weaponized; specialist support comes first",
      "Very young kids only (under ~4) — scale to a 5-minute mealtime appreciation ritual; a full meeting comes later",
    ],
    links: [
      { rpplId: "rppl:practice:weekly-relationship-checkin:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:shared-household-agreements:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:nvc:v1", relationship: "synergy" },
    ],
  },

  // ━━━ FRIENDSHIPS & COMMUNITY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:friendship-cadence:v1",
    type: "practice",
    name: "Friendship Cadence (5-Friend Rule)",
    domain: "people",
    description:
      "Picking a small set of friends — typically five — and maintaining deliberate regular contact with each. Dunbar's research on human social capacity converges on a similar inner circle size, and the evidence across loneliness studies is stark: what predicts flourishing is not friend count but the presence of a few people you're in frequent, unforced contact with. This practice makes contact a habit instead of an occasional gesture.",
    trigger:
      "A one-time decision to name the five, followed by a recurring weekly cue to reach out to one of them.",
    steps: [
      "Name your five — people whose relationships matter to you regardless of geography or recent friction",
      "Set a cadence per person — weekly for 1–2, monthly for 2–3, quarterly for 1 is a reasonable starting grid",
      "Each week, pick one from the list — text, call, voice note, or in-person plan",
      "Keep the contact low-stakes — a photo, a question, a memory — reaching out does not have to be a catch-up call",
      "Review the list every 6–12 months — people change, priorities shift, some friendships naturally evolve out of the inner grid",
    ],
    timeWindow: "Weekly cue, ongoing cadence",
    servesPrinciples: [
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:small-patterns-compose:v1",
      "rppl:principle:attention-grows:v1",
    ],
    servesCapacities: [
      "rppl:capacity:care:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "At least a handful of existing meaningful relationships", portType: "boolean", key: "existing_friendships" },
      { name: "Care", portType: "capacity", key: "care" },
    ],
    outputs: [
      { name: "Close-friend contact frequency", portType: "state", key: "close_friend_contact_frequency" },
      { name: "Perceived social support", portType: "state", key: "perceived_social_support" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Dunbar's number research / social-connectedness literature",
      keyReference:
        "Robin Dunbar, 'Friends: Understanding the Power of our Most Important Relationships' (2021); Julianne Holt-Lunstad's meta-analyses on social connection and mortality; Harvard Study of Adult Development (Waldinger)",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "distance-separated-friends", "introverts", "busy-professionals"],
      validationNotes:
        "Social-connection-and-health evidence is among the strongest in well-being research; the specific '5-friend cadence' is a practical packaging of Dunbar's inner-circle finding",
    },
    contextTags: ["people", "friendships", "weekly", "Dunbar"],
    contraindications: [
      "Active social-anxiety flare or grief — scale to one friend, one contact per week, without guilt about the others",
      "Social relationships that have become coercive or draining — audit the five honestly before cementing them",
    ],
    links: [
      { rpplId: "rppl:practice:adult-friendship-building:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:loneliness-intervention:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:adult-friendship-building:v1",
    type: "practice",
    name: "Adult Friendship Building",
    domain: "people",
    domains: ["joy"],
    description:
      "Making friends after early adulthood is not luck — it's a specific formula that sociologists have mapped for decades: proximity, repeated unplanned interaction, and settings that lower vulnerability. Most adults who complain about having no friends have no recurring third places in their life. The practice is to join or create one, and keep showing up long enough for acquaintance to drift into friendship — a process that typically takes 6–12 months of weekly or biweekly contact.",
    trigger:
      "A moment of admitting the loneliness honestly — not scrolling past it. Followed by picking one recurring setting and committing to it for three months.",
    steps: [
      "Pick a recurring context — a weekly class, a sport league, a book club, a volunteer shift, a religious or civic group",
      "Choose proximity: the setting has to be close enough that you can realistically attend weekly or biweekly for six months",
      "Show up consistently — friendship research identifies ~50 hours of shared time for 'casual friend', ~200 for 'friend', ~300+ for close friend",
      "Go slightly past the event — linger for the post-activity coffee, offer a ride, remember names",
      "After a few months, initiate outside the setting — low-stakes invite ('coming to this event, want in?'); this is the threshold that turns acquaintance into friendship",
    ],
    timeWindow: "Ongoing; 6–12 month horizon",
    servesPrinciples: [
      "rppl:principle:weak-ties-matter:v1",
      "rppl:principle:rhythm-universal:v1",
      "rppl:principle:growth-at-edges:v1",
      "rppl:principle:small-patterns-compose:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Stable geographic base for 6+ months", portType: "boolean", key: "geographic_stability" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "New friendships formed", portType: "state", key: "new_friendships_formed" },
      { name: "Weak-tie network size", portType: "state", key: "weak_tie_network_size" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Experiential capital", portType: "capital", key: "experiential" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Sociology of friendship / third-place theory",
      keyReference:
        "Ray Oldenburg, 'The Great Good Place' (1989) on third places; Jeffrey Hall 2019 (J. Social & Personal Relationships) on hours-to-friendship thresholds; Robert Putnam, 'Bowling Alone' (2000)",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "new-in-town", "post-college", "new-parents", "retirees", "remote-workers"],
      validationNotes:
        "The proximity/repetition/vulnerability triad is well-supported; specific hour thresholds (Hall 2019) are best treated as directionally correct rather than precise",
    },
    contextTags: ["people", "community", "friendships", "community-building"],
    contraindications: [
      "Severe social anxiety — start with parallel-play settings (library, gym, running club) where no conversation is required for first weeks",
      "Frequent geographic moves — online community + periodic in-person meetups may be the realistic form",
    ],
    links: [
      { rpplId: "rppl:practice:friendship-cadence:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:neighbor-onboarding:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:loneliness-intervention:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:neighbor-onboarding:v1",
    type: "practice",
    name: "Neighbor Onboarding",
    domain: "people",
    domains: ["home"],
    description:
      "The first six months in a new place are the window for building the neighbor relationships that will actually matter — for watching each other's packages, for noticing when something is wrong, for forming the weak-tie layer of local belonging. After that, patterns ossify. The practice is a set of concrete first moves: introductions, small favors offered, names learned, a contact exchange. It trades a few hours upfront for years of low-grade community benefit.",
    trigger:
      "The first two weekends after moving in — or, if you've been in place a while and don't know the neighbors, one weekend this month.",
    steps: [
      "Introduce yourself to the neighbors on both sides and across the street — knock, name, a minute of conversation, nothing more",
      "Offer a small service — watching packages while they travel, sharing a contact, an extra garden produce drop — offering comes before asking",
      "Learn names and write them down — next to house numbers if that's what it takes",
      "Exchange numbers with at least one neighbor — the 'text if you see something weird at my place' contact",
      "Repeat the small contact twice in the first three months — wave, a few-sentence conversation, another small offer — enough to move from introduction to recognition",
    ],
    timeWindow: "First 1–6 months in a new place",
    servesPrinciples: [
      "rppl:principle:weak-ties-matter:v1",
      "rppl:principle:home-first-ecosystem:v1",
      "rppl:principle:cooperation-structure:v1",
    ],
    servesCapacities: [
      "rppl:capacity:agency:v1",
      "rppl:capacity:humility:v1",
    ],
    inputs: [
      { name: "Recent move or lack of neighbor relationships", portType: "boolean", key: "new_in_place" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Local tie density", portType: "state", key: "local_tie_density" },
      { name: "Neighborhood safety perception", portType: "state", key: "neighborhood_safety" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Social-capital research / community-safety literature",
      keyReference:
        "Robert Putnam, 'Bowling Alone' (2000); Peter Lovenheim, 'In the Neighborhood' (2010); Sampson's collective-efficacy research on urban neighborhoods",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["new-movers", "urban-dwellers", "suburban-homeowners", "rural-newcomers", "renters"],
    },
    contextTags: ["people", "home", "community", "onboarding"],
    contraindications: [
      "High-security apartment buildings with strict anonymity culture — scale to elevator greetings + building events",
      "Situations where personal safety suggests anonymity — trust your instinct; don't force contact",
    ],
    links: [
      { rpplId: "rppl:practice:adult-friendship-building:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:seasonal-home-maintenance:v1", relationship: "synergy" },
    ],
  },

  // ━━━ DIFFICULT RELATIONSHIPS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    rpplId: "rppl:practice:boundary-setting-protocol:v1",
    type: "practice",
    name: "Boundary Setting Protocol",
    domain: "people",
    description:
      "A boundary is not a wish about how someone else behaves — it's a decision about what you will do in response to a specific behavior. This practice converts vague grievance ('I wish they'd stop calling so late') into a specific, communicable, enforceable pattern. Three elements: a named behavior, a stated response, and follow-through without performance. Most failed boundaries are not about language — they fail at follow-through.",
    trigger:
      "A recurring relational pattern that drains you, which you've previously addressed only by complaining, avoiding, or hoping. The trigger is recognizing the pattern is recurring — not waiting for the next incident.",
    steps: [
      "Name the specific behavior — not the person's character, not the history — one concrete, observable action",
      "Decide your response in advance — what YOU will do when that behavior happens (leave the room, end the call, skip the event, exit the relationship)",
      "Communicate it once — short, clear, not an argument: 'When X happens, I'll do Y.' Not a request, not a threat — a plan",
      "Follow through the first time — the boundary becomes real in the moment you act, not in the moment you state it. Without follow-through, a boundary is an accusation",
      "Repeat the response every time the behavior recurs — without re-explaining, re-justifying, or escalating emotionally",
    ],
    timeWindow: "Conversation + ongoing enforcement",
    servesPrinciples: [
      "rppl:principle:response-not-circumstances:v1",
      "rppl:principle:own-consequences:v1",
      "rppl:principle:self-regulation-freedom:v1",
      "rppl:principle:voluntary-power:v1",
    ],
    servesCapacities: [
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
      "rppl:capacity:care:v1",
    ],
    inputs: [
      { name: "Relationship with recurring friction", portType: "boolean", key: "recurring_friction_relationship" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
      { name: "Agency", portType: "capacity", key: "agency" },
    ],
    outputs: [
      { name: "Boundary integrity", portType: "state", key: "boundary_integrity" },
      { name: "Resentment level", portType: "state", key: "resentment_level" },
      { name: "Nervous-system state", portType: "state", key: "nervous_system_state" },
      { name: "Living capital", portType: "capital", key: "living" },
      { name: "Social capital", portType: "capital", key: "social" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Boundary literature / attachment-informed therapy / NVC",
      keyReference:
        "Nedra Glover Tawwab, 'Set Boundaries, Find Peace' (2021); Harriet Lerner, 'The Dance of Anger' (1985); Marshall Rosenberg on requests vs demands",
    },
    evidence: {
      confidence: "emerging",
      contextTags: ["adults", "family-of-origin-dynamics", "workplaces", "recovering-people-pleasers"],
      validationNotes:
        "Therapy literature consistently supports the form; the specific 'behavior + your response + follow-through' frame is widely practitioner-validated",
    },
    contextTags: ["people", "conflict", "agency", "difficult-relationships"],
    contraindications: [
      "Safety-threatening relationships — safety planning and exit support first; boundary language can provoke escalation with abusive partners",
      "Cultural or family contexts where direct language backfires — work with a therapist to adapt the form without losing the structure",
    ],
    links: [
      { rpplId: "rppl:practice:repair-attempts-practice:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:shared-household-agreements:v1", relationship: "synergy" },
      { rpplId: "rppl:framework:nvc:v1", relationship: "synergy" },
    ],
  },

  {
    rpplId: "rppl:practice:loneliness-intervention:v1",
    type: "practice",
    name: "Loneliness Intervention",
    domain: "people",
    domains: ["body", "joy"],
    description:
      "Chronic loneliness is not a feeling to wait out — the evidence treats it as a health condition comparable in mortality impact to daily smoking. The counterintuitive finding: 'socialize more' is the wrong prescription for most lonely people, because the underlying gap is a sense of belonging, not a shortage of interactions. The practice works on three levels simultaneously: contact (Friendship Cadence), context (a recurring shared setting), and cognition (examining the stories running in the background about whether you are wanted).",
    trigger:
      "A two-week stretch in which loneliness has been a persistent background state — not a single hard evening. The trigger is honest self-report, often surfaced through morning pages, therapy, or a friend's observation.",
    steps: [
      "Start with contact — reach out to one person on your five this week, even a two-sentence text. Don't wait to 'feel like it'",
      "Add a recurring context — the one setting (see Adult Friendship Building) that gets you into the room with the same people weekly",
      "Examine the stories — the 'nobody wants to hear from me,' 'I'm a burden,' 'everyone has their own friends' narratives that loneliness amplifies. Name them in writing; most are untrue",
      "Offer service — one small, consistent way of showing up for someone else (a ride, a meal drop, a check-in). Belonging grows from contribution as much as reception",
      "If loneliness persists beyond 8–12 weeks of consistent practice — add professional support. Chronic loneliness often overlaps with depression, and both respond to treatment",
    ],
    timeWindow: "Multi-month protocol; re-evaluate at 8–12 weeks",
    servesPrinciples: [
      "rppl:principle:terrain-not-defense:v1",
      "rppl:principle:weak-ties-matter:v1",
      "rppl:principle:response-not-circumstances:v1",
      "rppl:principle:map-not-territory:v1",
    ],
    servesCapacities: [
      "rppl:capacity:awareness:v1",
      "rppl:capacity:honesty:v1",
      "rppl:capacity:agency:v1",
    ],
    inputs: [
      { name: "Honest self-report of chronic loneliness", portType: "boolean", key: "chronic_loneliness_report" },
      { name: "Awareness", portType: "capacity", key: "awareness" },
      { name: "Honesty", portType: "capacity", key: "honesty" },
    ],
    outputs: [
      { name: "Perceived social support", portType: "state", key: "perceived_social_support" },
      { name: "Sense of belonging", portType: "state", key: "sense_of_belonging" },
      { name: "Mood regulation", portType: "state", key: "mood_regulation" },
      { name: "Social capital", portType: "capital", key: "social" },
      { name: "Living capital", portType: "capital", key: "living" },
    ],
    provenance: {
      source: "research",
      sourceTradition: "Social neuroscience / loneliness research",
      keyReference:
        "John Cacioppo, 'Loneliness: Human Nature and the Need for Social Connection' (2008); Vivek Murthy, 'Together' (2020) — US Surgeon General's loneliness framework; Holt-Lunstad meta-analyses on social connection and mortality",
    },
    evidence: {
      confidence: "validated",
      contextTags: ["adults", "remote-workers", "older-adults", "new-parents", "grief-stages", "post-breakup"],
      validationNotes:
        "Loneliness-as-health-risk is strongly evidenced; specific intervention design is emerging — multi-layer (contact + context + cognition) approaches outperform single-layer",
    },
    contextTags: ["people", "mental-health", "belonging", "multi-layer"],
    contraindications: [
      "Clinical depression or suicidal ideation — professional support is the priority, not a self-guided intervention",
      "Loneliness driven by grief — honor the stage; over-intervention early in grief can be its own harm",
    ],
    links: [
      { rpplId: "rppl:practice:friendship-cadence:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:adult-friendship-building:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:morning-pages:v1", relationship: "synergy" },
      { rpplId: "rppl:practice:walking-daily:v1", relationship: "synergy" },
    ],
  },
];
