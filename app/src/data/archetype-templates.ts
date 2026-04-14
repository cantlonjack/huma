import type { Aspiration, Behavior, DimensionKey, KnownContext, Pattern, PatternStep } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StarterAspiration {
  text: string;
  behaviors: Pick<Behavior, "key" | "text" | "frequency" | "dimensions">[];
  dimensions: DimensionKey[];
}

export interface DomainArchetypeTemplate {
  name: string;
  description: string;
  typicalConcerns: string[];
  starterAspirations: StarterAspiration[];
  contextHints: Partial<KnownContext>;
  relevantPatternIds: string[];
}

export interface OrientationArchetypeTemplate {
  name: string;
  description: string;
  modifier: string;
}

// ─── Domain Archetypes (9) ──────────────────────────────────────────────────

const EARTH_TENDER: DomainArchetypeTemplate = {
  name: "Earth Tender",
  description: "Land, food, seasons. Your life is rooted in place.",
  typicalConcerns: [
    "Keeping the land productive without burning out",
    "Balancing seasonal demands with family time",
    "Making it financially viable",
  ],
  starterAspirations: [
    {
      text: "My land sustains my household",
      behaviors: [
        {
          key: "morning-land-walk",
          text: "Walk the property before breakfast — observe what changed overnight",
          frequency: "daily",
          dimensions: [
            { dimension: "body", direction: "builds", reasoning: "Morning movement and fresh air" },
            { dimension: "home", direction: "builds", reasoning: "Land stewardship through observation" },
          ],
        },
        {
          key: "weekly-harvest-batch",
          text: "Batch harvest and process in one session",
          frequency: "weekly",
          dimensions: [
            { dimension: "home", direction: "builds", reasoning: "Efficient food production" },
            { dimension: "money", direction: "builds", reasoning: "Reduces waste, maximizes yield value" },
          ],
        },
      ],
      dimensions: ["home", "body", "money"],
    },
    {
      text: "Evenings belong to my family, not the farm",
      behaviors: [
        {
          key: "hard-stop-sundown",
          text: "Tools down by sundown — no exceptions",
          frequency: "daily",
          dimensions: [
            { dimension: "people", direction: "builds", reasoning: "Protected family time" },
            { dimension: "body", direction: "protects", reasoning: "Prevents overwork" },
          ],
        },
      ],
      dimensions: ["people", "body"],
    },
  ],
  contextHints: {
    place: { name: "", detail: "Land-based" },
  },
  relevantPatternIds: [
    "rppl:operations:production-batching:v1",
    "rppl:operations:spatial-clustering:v1",
    "rppl:design:seasonal-arc:v1",
    "rppl:practice:hard-stop:v1",
  ],
};

const CREATOR: DomainArchetypeTemplate = {
  name: "Creator",
  description: "Making things. The work itself is the point.",
  typicalConcerns: [
    "Protecting creative time",
    "Making it sustainable",
    "Shipping vs perfecting",
  ],
  starterAspirations: [
    {
      text: "I make something real every week",
      behaviors: [
        {
          key: "morning-creative-block",
          text: "First 90 minutes of the day: make, don't manage",
          frequency: "daily",
          dimensions: [
            { dimension: "joy", direction: "builds", reasoning: "Creative expression feeds fulfillment" },
            { dimension: "growth", direction: "builds", reasoning: "Skill develops through daily practice" },
          ],
        },
        {
          key: "admin-batch",
          text: "Batch email, invoicing, scheduling into one afternoon",
          frequency: "weekly",
          dimensions: [
            { dimension: "money", direction: "protects", reasoning: "Admin doesn't leak into creative time" },
            { dimension: "joy", direction: "protects", reasoning: "Prevents context-switching drain" },
          ],
        },
      ],
      dimensions: ["joy", "growth"],
    },
    {
      text: "My creative work pays for itself",
      behaviors: [
        {
          key: "weekly-revenue-check",
          text: "Sunday: review what sold, what's in progress, what ships next",
          frequency: "weekly",
          dimensions: [
            { dimension: "money", direction: "builds", reasoning: "Financial awareness without obsession" },
            { dimension: "growth", direction: "builds", reasoning: "Pattern recognition across projects" },
          ],
        },
      ],
      dimensions: ["money", "growth"],
    },
  ],
  contextHints: {
    work: { title: "", detail: "Creative practice" },
  },
  relevantPatternIds: [
    "rppl:operations:production-batching:v1",
    "rppl:practice:morning-threshold:v1",
    "rppl:practice:hard-stop:v1",
    "rppl:operations:weekly-pulse:v1",
  ],
};

const ENTREPRENEUR: DomainArchetypeTemplate = {
  name: "Entrepreneur",
  description: "Building something that sustains itself — and you.",
  typicalConcerns: [
    "Revenue before everything else",
    "Not losing yourself in the business",
    "When to hire vs do it yourself",
  ],
  starterAspirations: [
    {
      text: "The business runs without me doing everything",
      behaviors: [
        {
          key: "morning-ceo-block",
          text: "First hour: strategic work only — no inbox, no fires",
          frequency: "daily",
          dimensions: [
            { dimension: "growth", direction: "builds", reasoning: "Strategic thinking requires protected time" },
            { dimension: "money", direction: "builds", reasoning: "High-leverage work over busywork" },
          ],
        },
        {
          key: "weekly-numbers",
          text: "Monday: review revenue, pipeline, and one metric that matters",
          frequency: "weekly",
          dimensions: [
            { dimension: "money", direction: "builds", reasoning: "Financial clarity drives better decisions" },
            { dimension: "growth", direction: "builds", reasoning: "Pattern recognition across weeks" },
          ],
        },
      ],
      dimensions: ["money", "growth"],
    },
    {
      text: "I have a life outside the business",
      behaviors: [
        {
          key: "shutdown-ritual",
          text: "Write tomorrow's three priorities, then close the laptop",
          frequency: "daily",
          dimensions: [
            { dimension: "people", direction: "builds", reasoning: "Present for family/friends after work" },
            { dimension: "body", direction: "protects", reasoning: "Mental recovery from decision fatigue" },
          ],
        },
      ],
      dimensions: ["people", "body"],
    },
  ],
  contextHints: {
    work: { title: "", detail: "Business owner" },
  },
  relevantPatternIds: [
    "rppl:operations:production-batching:v1",
    "rppl:operations:weekly-pulse:v1",
    "rppl:practice:hard-stop:v1",
    "rppl:design:enterprise-qol-validation:v1",
  ],
};

const OFFICIAL: DomainArchetypeTemplate = {
  name: "Official",
  description: "Holding structure for others. Governance is your medium.",
  typicalConcerns: [
    "Decisions that affect many people",
    "Staying connected to the ground level",
    "Burnout from emotional weight",
  ],
  starterAspirations: [
    {
      text: "I make sound decisions without carrying them home",
      behaviors: [
        {
          key: "morning-briefing",
          text: "Review today's decisions and who they affect — before the first meeting",
          frequency: "daily",
          dimensions: [
            { dimension: "growth", direction: "builds", reasoning: "Intentional decision-making" },
            { dimension: "people", direction: "builds", reasoning: "Consideration of stakeholders" },
          ],
        },
        {
          key: "decompression-walk",
          text: "20-minute walk between work and home — transition ritual",
          frequency: "daily",
          dimensions: [
            { dimension: "body", direction: "builds", reasoning: "Physical movement processes stress" },
            { dimension: "purpose", direction: "protects", reasoning: "Prevents role from consuming identity" },
          ],
        },
      ],
      dimensions: ["growth", "people", "purpose"],
    },
  ],
  contextHints: {
    work: { title: "", detail: "Public service / governance" },
  },
  relevantPatternIds: [
    "rppl:practice:morning-threshold:v1",
    "rppl:practice:hard-stop:v1",
    "rppl:operations:weekly-pulse:v1",
    "rppl:practice:essence-probe:v1",
  ],
};

const ECONOMIC_SHAPER: DomainArchetypeTemplate = {
  name: "Economic Shaper",
  description: "Money as a tool for change, not just security.",
  typicalConcerns: [
    "Aligning investments with values",
    "Systemic leverage vs personal gain",
    "Measuring impact, not just returns",
  ],
  starterAspirations: [
    {
      text: "My money moves match my values",
      behaviors: [
        {
          key: "weekly-capital-review",
          text: "Sunday: review where capital went this week — does it match intent?",
          frequency: "weekly",
          dimensions: [
            { dimension: "money", direction: "builds", reasoning: "Intentional capital allocation" },
            { dimension: "purpose", direction: "builds", reasoning: "Values alignment in practice" },
          ],
        },
        {
          key: "monthly-impact-check",
          text: "First of month: what changed because of where I put resources?",
          frequency: "weekly",
          dimensions: [
            { dimension: "growth", direction: "builds", reasoning: "Learning from outcomes" },
            { dimension: "identity", direction: "builds", reasoning: "Living the values, not just stating them" },
          ],
        },
      ],
      dimensions: ["money", "purpose", "identity"],
    },
  ],
  contextHints: {},
  relevantPatternIds: [
    "rppl:design:capital-rotation:v1",
    "rppl:operations:weekly-pulse:v1",
    "rppl:design:enterprise-qol-validation:v1",
    "rppl:design:qol-decomposition:v1",
  ],
};

const SPIRIT: DomainArchetypeTemplate = {
  name: "Spirit",
  description: "Inner life drives outer life. Meaning before method.",
  typicalConcerns: [
    "Staying grounded while going deep",
    "Translating insight into daily life",
    "Not losing practical footing",
  ],
  starterAspirations: [
    {
      text: "My inner practice shapes my outer day",
      behaviors: [
        {
          key: "morning-practice",
          text: "First thing: 15 minutes of stillness, prayer, or contemplation",
          frequency: "daily",
          dimensions: [
            { dimension: "purpose", direction: "builds", reasoning: "Daily connection to source" },
            { dimension: "body", direction: "builds", reasoning: "Nervous system regulation" },
          ],
        },
        {
          key: "evening-review",
          text: "Before sleep: what felt aligned today? What felt off?",
          frequency: "daily",
          dimensions: [
            { dimension: "purpose", direction: "builds", reasoning: "Self-awareness through reflection" },
            { dimension: "identity", direction: "builds", reasoning: "Integration of inner and outer" },
          ],
        },
      ],
      dimensions: ["purpose", "identity", "body"],
    },
  ],
  contextHints: {},
  relevantPatternIds: [
    "rppl:practice:essence-probe:v1",
    "rppl:practice:morning-threshold:v1",
    "rppl:operations:weekly-pulse:v1",
    "rppl:design:seasonal-arc:v1",
  ],
};

const MEDIA: DomainArchetypeTemplate = {
  name: "Media",
  description: "Stories, signals, culture. You shape how people see.",
  typicalConcerns: [
    "Signal vs noise in your own output",
    "Staying honest under audience pressure",
    "Creative cycles vs publishing schedules",
  ],
  starterAspirations: [
    {
      text: "I publish work that's mine, not content that's expected",
      behaviors: [
        {
          key: "morning-writing",
          text: "Write before consuming — 30 minutes of original thought first",
          frequency: "daily",
          dimensions: [
            { dimension: "growth", direction: "builds", reasoning: "Original thinking before input" },
            { dimension: "identity", direction: "builds", reasoning: "Your voice, not the algorithm's" },
          ],
        },
        {
          key: "weekly-edit-session",
          text: "One session per week: edit and ship something complete",
          frequency: "weekly",
          dimensions: [
            { dimension: "joy", direction: "builds", reasoning: "Finishing feeds creative confidence" },
            { dimension: "money", direction: "builds", reasoning: "Published work compounds" },
          ],
        },
      ],
      dimensions: ["growth", "identity", "joy"],
    },
  ],
  contextHints: {
    work: { title: "", detail: "Media / content / storytelling" },
  },
  relevantPatternIds: [
    "rppl:operations:production-batching:v1",
    "rppl:practice:morning-threshold:v1",
    "rppl:practice:hard-stop:v1",
    "rppl:operations:weekly-pulse:v1",
  ],
};

const EDUCATOR: DomainArchetypeTemplate = {
  name: "Educator",
  description: "Developing others. Knowledge is your primary material.",
  typicalConcerns: [
    "Giving more than you're replenishing",
    "Keeping your own growth alive",
    "Measuring real learning, not compliance",
  ],
  starterAspirations: [
    {
      text: "I learn as much as I teach",
      behaviors: [
        {
          key: "weekly-study",
          text: "One hour per week: read or study something outside your teaching domain",
          frequency: "weekly",
          dimensions: [
            { dimension: "growth", direction: "builds", reasoning: "Cross-pollination keeps teaching alive" },
            { dimension: "joy", direction: "builds", reasoning: "Curiosity for its own sake" },
          ],
        },
        {
          key: "prep-batch",
          text: "Batch all lesson prep into one session — protect teaching energy",
          frequency: "weekly",
          dimensions: [
            { dimension: "people", direction: "builds", reasoning: "Better prepared = more present for students" },
            { dimension: "body", direction: "protects", reasoning: "Reduces daily cognitive load" },
          ],
        },
      ],
      dimensions: ["growth", "people"],
    },
  ],
  contextHints: {
    work: { title: "", detail: "Education" },
  },
  relevantPatternIds: [
    "rppl:operations:production-batching:v1",
    "rppl:design:qol-decomposition:v1",
    "rppl:operations:weekly-pulse:v1",
    "rppl:design:capital-rotation:v1",
  ],
};

const PARENT: DomainArchetypeTemplate = {
  name: "Parent",
  description: "Everything runs through the kids right now.",
  typicalConcerns: [
    "Finding time that's actually yours",
    "Not losing your identity to the role",
    "Making the logistics invisible",
  ],
  starterAspirations: [
    {
      text: "The household runs without constant firefighting",
      behaviors: [
        {
          key: "sunday-week-map",
          text: "Sunday evening: map the week's logistics — meals, pickups, commitments",
          frequency: "weekly",
          dimensions: [
            { dimension: "home", direction: "builds", reasoning: "Proactive beats reactive" },
            { dimension: "people", direction: "builds", reasoning: "Fewer surprises for everyone" },
          ],
        },
        {
          key: "morning-launch",
          text: "Morning launch sequence: same order, every day, no decisions",
          frequency: "daily",
          dimensions: [
            { dimension: "home", direction: "builds", reasoning: "Routine eliminates decision fatigue" },
            { dimension: "body", direction: "protects", reasoning: "Less cortisol from morning chaos" },
          ],
        },
      ],
      dimensions: ["home", "people"],
    },
    {
      text: "I have 30 minutes a day that belong only to me",
      behaviors: [
        {
          key: "sacred-thirty",
          text: "One non-negotiable 30-minute block: read, walk, sit — your choice",
          frequency: "daily",
          dimensions: [
            { dimension: "identity", direction: "builds", reasoning: "You exist outside the parent role" },
            { dimension: "body", direction: "builds", reasoning: "Recovery is not optional" },
          ],
        },
      ],
      dimensions: ["identity", "body"],
    },
  ],
  contextHints: {
    stage: { label: "Parent", detail: "Kids at home" },
  },
  relevantPatternIds: [
    "rppl:operations:production-batching:v1",
    "rppl:practice:morning-threshold:v1",
    "rppl:practice:hard-stop:v1",
    "rppl:design:qol-decomposition:v1",
  ],
};

// ─── Orientation Archetypes (3) ─────────────────────────────────────────────

const INITIATOR: OrientationArchetypeTemplate = {
  name: "Initiator",
  description: "You start things. Momentum is your gift.",
  modifier: "Front-load new behaviors. Start fast, adjust later.",
};

const MANIFESTOR: OrientationArchetypeTemplate = {
  name: "Manifestor",
  description: "You finish things. Execution is your gift.",
  modifier: "Sequence behaviors toward completion. One thing done beats three things started.",
};

const DESTABILIZER: OrientationArchetypeTemplate = {
  name: "Destabilizer",
  description: "You question things. Disruption is your gift.",
  modifier: "Challenge existing patterns first. Replace what isn't working before adding new.",
};

// ─── Exports ────────────────────────────────────────────────────────────────

export const DOMAIN_TEMPLATES: DomainArchetypeTemplate[] = [
  EARTH_TENDER,
  CREATOR,
  ENTREPRENEUR,
  OFFICIAL,
  ECONOMIC_SHAPER,
  SPIRIT,
  MEDIA,
  EDUCATOR,
  PARENT,
];

export const ORIENTATION_TEMPLATES: OrientationArchetypeTemplate[] = [
  INITIATOR,
  MANIFESTOR,
  DESTABILIZER,
];

export const ARCHETYPE_TEMPLATES = {
  domain: DOMAIN_TEMPLATES,
  orientation: ORIENTATION_TEMPLATES,
};

/** Look up a domain template by name */
export function getDomainTemplate(name: string): DomainArchetypeTemplate | undefined {
  return DOMAIN_TEMPLATES.find((t) => t.name === name);
}

/** Look up an orientation template by name */
export function getOrientationTemplate(name: string): OrientationArchetypeTemplate | undefined {
  return ORIENTATION_TEMPLATES.find((t) => t.name === name);
}

// ─── Pre-population ────────────────────────────────────────────────────────

export interface PrePopulationResult {
  aspirations: Aspiration[];
  patterns: Pattern[];
  contextHints: Partial<KnownContext>;
}

/**
 * Generate starter aspirations, patterns, and context hints from selected archetypes.
 * Domain archetypes contribute starter aspirations and context; orientation archetypes
 * are stored but don't generate aspirations.
 */
export function prePopulateFromArchetypes(
  selectedDomains: string[],
  _selectedOrientations: string[]
): PrePopulationResult {
  const aspirations: Aspiration[] = [];
  const patterns: Pattern[] = [];
  let contextHints: Partial<KnownContext> = {};
  const now = new Date().toISOString();

  for (const domainName of selectedDomains) {
    const template = getDomainTemplate(domainName);
    if (!template) continue;

    // Merge context hints (later archetypes override earlier ones)
    contextHints = { ...contextHints, ...template.contextHints };

    // Take up to 2 starter aspirations per domain archetype
    const starters = template.starterAspirations.slice(0, 2);
    for (const starter of starters) {
      const aspirationId = crypto.randomUUID();

      // Build full behaviors from the starter template
      const behaviors: Behavior[] = starter.behaviors.map((b) => ({
        key: b.key,
        text: b.text,
        frequency: b.frequency,
        dimensions: b.dimensions,
        source: "template" as const,
      }));

      aspirations.push({
        id: aspirationId,
        rawText: starter.text,
        clarifiedText: starter.text,
        title: starter.text,
        behaviors,
        dimensionsTouched: starter.dimensions,
        status: "active",
        stage: "active",
        source: "template",
      });

      // Create a pattern if 2+ behaviors exist (first behavior as trigger)
      if (behaviors.length >= 2) {
        const steps: PatternStep[] = behaviors.map((b, i) => ({
          behaviorKey: b.key,
          text: b.text,
          order: i,
          isTrigger: i === 0,
        }));

        patterns.push({
          id: crypto.randomUUID(),
          aspirationId,
          name: starter.text,
          trigger: behaviors[0].text,
          steps,
          validationCount: 0,
          validationTarget: 30,
          status: "finding",
          provenance: {
            source: "template",
            sourceTradition: template.name,
          },
          composition: {
            links: template.relevantPatternIds.map(rpplId => ({
              rpplId,
              relationship: "derived_from" as const,
            })),
          },
          evidence: { confidence: "seed", contextTags: [] },
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return { aspirations, patterns, contextHints };
}
