import type { RpplSeed } from "./types";

// ─── Axioms ─────────────────────────────────────────────────────────────────
// Irreducible truths about how reality operates. Not thinking tools (those are
// frameworks) — statements about what IS, whether you acknowledge it or not.
// Every principle, capacity, and framework rests on these.
// ─────────────────────────────────────────────────────────────────────────────

export const axiomSeeds: RpplSeed[] = [
  {
    rpplId: "rppl:axiom:natural-law:v1",
    type: "axiom",
    name: "Natural Law",
    domain: "meta",
    domains: ["purpose", "identity"],
    description:
      "The inherent operating principles of reality — not legislation, but the actual laws of cause and effect, rhythm, polarity, and correspondence that function whether you acknowledge them or not. These are not beliefs to adopt but observations to verify. Aligning your life with Natural Law means working WITH reality rather than against it. Most suffering comes from violating principles that cannot be legislated away — they simply are.",
    laws: [
      "Cause and Effect: every action produces consequences. You are free to choose your actions, but you are not free to choose their consequences. This operates in health, finance, relationships, and every other domain without exception.",
      "Rhythm: everything flows in cycles — tides, seasons, energy, attention, economies, relationships. No state is permanent. Fighting rhythm is fighting reality.",
      "Polarity: every quality has its opposite, and both are necessary. Light/dark, effort/rest, expansion/contraction. Trying to have one without the other creates imbalance. Opposites are the same thing differing in degree.",
      "Correspondence: patterns repeat at every scale. The structure of your day mirrors the structure of your year. Your daily rhythm mirrors seasonal rhythm mirrors life-stage rhythm. Understanding one scale reveals the others.",
      "Care (Attention): what you consistently give your time, energy, and attention to is what grows in your life — for better or worse. Care is the generative force.",
      "Freedom and Responsibility are inseparable: genuine freedom requires accepting full responsibility for consequences. Rights without responsibility is a contradiction of Natural Law.",
    ],
    observableIn: [
      "Biology: circadian rhythm (Rhythm), immune adaptation (Cause & Effect), homeostasis (Polarity)",
      "Economics: business cycles and market corrections (Rhythm), investment returns track value creation (Cause & Effect), boom/bust as inevitable polarity",
      "Ecology: seasonal cycles (Rhythm), trophic cascades (Cause & Effect), predator-prey balance (Polarity), fractal branching in trees/rivers/lungs (Correspondence)",
      "Relationships: what you invest is what you harvest (Cause & Effect), relationships have seasons of closeness and distance (Rhythm)",
      "Physics: Newton's Third Law (Cause & Effect), wave motion (Rhythm), matter-antimatter (Polarity), self-similar structures at quantum and cosmic scales (Correspondence)",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Perennial philosophy / natural philosophy / indigenous wisdom",
      keyReference:
        "Aldous Huxley, 'The Perennial Philosophy' (1945); Marcus Aurelius, 'Meditations'; Mark Passio, 'Natural Law: The Real Law of Attraction' (seminar series)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "self-directed",
        "questioning-authority",
        "seeking-alignment",
      ],
    },
    contextTags: ["universal", "philosophy", "self-governance", "alignment"],
    contraindications: [
      "Can be misused to blame victims ('you attracted this') — cause and effect is about personal responsibility, not cosmic punishment",
      "Requires nuance — 'natural' does not mean 'easy' or 'automatically correct'",
      "Some presentations mix solid principles with unfalsifiable metaphysical claims — apply Trivium analysis",
    ],
    links: [
      {
        rpplId: "rppl:axiom:hermetic-principles:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:stoicism:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:non-aggression:v1",
        relationship: "derived_from",
      },
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
    ],
  },

  {
    rpplId: "rppl:axiom:hermetic-principles:v1",
    type: "axiom",
    name: "The Seven Hermetic Principles",
    domain: "meta",
    domains: ["growth", "purpose"],
    description:
      "Seven principles describing how reality operates at every scale, attributed to Hermes Trismegistus and codified in the Hermetic tradition. These are observational, not mystical — each describes a phenomenon that can be verified through direct experience. They provide a unified lens for understanding why patterns repeat, why cycles exist, why opposites are necessary, and why your mental state shapes your experience.",
    laws: [
      "Mentalism: 'The All is Mind; the Universe is Mental.' — Your mental state shapes your perception and experience. What you believe about reality filters what you see and how you respond. This is observably true: framing effects, confirmation bias, and attentional filtering are all Mentalism in action.",
      "Correspondence: 'As above, so below; as below, so above.' — Patterns repeat at every scale. Your circadian rhythm mirrors the solar cycle. Your daily habits mirror your life trajectory. A dysfunctional morning mirrors a dysfunctional year. Understanding one scale reveals the others.",
      "Vibration: 'Nothing rests; everything moves; everything vibrates.' — Everything is in motion. Matter, energy, thought — all dynamic processes, not fixed states. Moods, relationships, and habits are processes, not things.",
      "Polarity: 'Everything is dual; everything has poles; everything has its pair of opposites.' — Hot and cold are the same thing (temperature) differing in degree. Love and hate are the same thing (feeling toward) differing in degree. Opposites are identical in nature but different in degree.",
      "Rhythm: 'Everything flows, out and in; everything has its tides; all things rise and fall.' — The pendulum swing is in everything. After expansion comes contraction. After exertion comes recovery. Mastering rhythm means not fighting the swing but learning to anticipate and work with it.",
      "Cause and Effect: 'Every cause has its effect; every effect has its cause.' — Nothing happens by chance — only by unrecognized causes. Understanding causation gives agency. Denying it produces helplessness.",
      "Gender: 'Gender is in everything; everything has its masculine and feminine principles.' — Not biological sex. Masculine = the active, projective, generative principle. Feminine = the receptive, nurturing, creative principle. Both are present in all things and both are necessary for creation. Action without reflection is reckless; reflection without action is sterile.",
    ],
    observableIn: [
      "Mentalism: cognitive science (framing effects, confirmation bias, placebo), behavioral economics (mental models shape decisions)",
      "Correspondence: fractal geometry (self-similar structures in nature), circadian biology (body clocks mirror solar cycle), ecology (patterns at organism/ecosystem/biome scales)",
      "Vibration: thermodynamics (all matter is energy in motion), neuroscience (neural oscillations), psychology (moods as dynamic states, not fixed traits)",
      "Polarity: physics (positive/negative charge, wave crests/troughs), biology (sympathetic/parasympathetic nervous system), psychology (approach/avoidance motivation)",
      "Rhythm: chronobiology (circadian, ultradian, seasonal cycles), economics (business cycles), ecology (succession, seasonal patterns)",
      "Cause and Effect: physics (every force produces an equal and opposite reaction), biology (stimulus-response), behavioral science (reinforcement schedules)",
      "Gender: creative process research (divergent/convergent thinking), project management (planning/execution), biology (anabolic/catabolic processes)",
    ],
    provenance: {
      source: "research",
      sourceTradition:
        "Hermetic tradition / Emerald Tablet / Corpus Hermeticum",
      keyReference:
        "Three Initiates, 'The Kybalion' (1908); attributed to Hermes Trismegistus; Corpus Hermeticum (2nd-3rd c. CE)",
    },
    evidence: {
      confidence: "seed",
      contextTags: [
        "anyone",
        "philosophical",
        "pattern-seeker",
        "seeking-depth",
      ],
    },
    contextTags: [
      "universal",
      "philosophy",
      "pattern-recognition",
      "self-understanding",
    ],
    contraindications: [
      "The Kybalion (1908) is a modern interpretation, not an ancient text — the seven-principle structure is its invention, not found in the original Corpus Hermeticum",
      "Can attract 'magical thinking' if Mentalism is misunderstood as 'thoughts directly create physical reality' rather than 'thoughts shape perception and action which shape outcomes'",
      "Some principles (Vibration, Gender) require careful interpretation to separate observational insight from metaphysical speculation",
      "Risks unfalsifiability — principles are broad enough to 'explain' anything retroactively. Apply Trivium analysis: gather specific evidence, test logically, then apply",
    ],
    links: [
      {
        rpplId: "rppl:axiom:natural-law:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:quadrivium:v1",
        relationship: "synergy",
      },
      {
        rpplId: "rppl:framework:trivium:v1",
        relationship: "synergy",
      },
    ],
  },
];
