# H U M A
## RPPL Pattern Schema & Seed Library
### The Knowledge That Powers the Medium

*This document defines the structure of every pattern in HUMA's library and provides the first 12 seed patterns. These patterns are drawn directly from the intellectual lineage sources and represent validated, cross-domain practical wisdom. They are the foundation of every recommendation HUMA makes.*

March 2026 · Foundational Architecture

> **Note:** RPPL (Reality Pattern Protocol Layer) is the internal/developer-facing name. Users see 'HUMA' and interact with patterns as 'moves.' See HUMA_PRODUCT_SURFACE.md §13 for the full language mapping.

---

## 01 — What a Pattern Is

A pattern is not advice. It is not a tip. It is not a how-to guide.

A pattern is a **structured, context-sensitive, validated unit of practical wisdom** that says: here is a situation that recurs. Here is what works. Here is why it works. Here is how to adapt it. Here is what it connects to.

Patterns are the fundamental knowledge unit of RPPL. They are holonic (both whole and part of larger wholes), living (they evolve through use), contributed (anyone can discover one), and connected (they link across domains).

The analogy from the intellectual lineage: patterns are to RPPL what recipes are to Bullipedia. Ingredients are data (your life dimensions). Techniques are functions (patterns). Recipes are programs (pattern stacks). The kitchen is the compiler (HUMA's AI engine). The cook is the operator.

---

## 02 — Pattern Schema (RPPL v0.1)

Every pattern in the HUMA library conforms to this schema. Fields marked [required] must be present for a pattern to be valid. Fields marked [enriched] are added as the pattern accumulates validation data.

```yaml
rppl_version: "0.1"

pattern:
  # ─── Identity ───
  id: string              # [required] Format: "rppl:{domain}:{name}:{version}"
  name: string            # [required] Human-readable name
  version: integer        # [required] Starts at 1, increments on significant revision

  # ─── Situation ───
  situation:
    description: string   # [required] When does this pattern apply? What does the operator see/feel?
    domains: string[]     # [required] Which life/work domains this applies to
    signals: string[]     # [required] Observable indicators that this pattern is relevant
    prerequisites: string[] # Patterns that should be in place first (IDs or descriptions)

  # ─── Action ───
  action:
    description: string   # [required] What to do — the core instruction
    steps: string[]       # [required] Sequenced actions, concrete and specific
    duration: string      # How long the pattern takes to implement ("2 weeks", "one season")
    effort: string        # Realistic effort level ("15 min/day", "one full weekend")
    adaptations:          # [enriched] Domain-specific variations
      {domain}:
        note: string      # How the pattern expresses in this domain
        modified_steps: string[]  # Any steps that change for this domain

  # ─── Principle ───
  principle: string       # [required] WHY this works — the underlying mechanism.
                          # This is what enables intelligent adaptation.

  # ─── Provenance ───
  provenance:
    source_tradition: string    # Which intellectual lineage this descends from
    original_context: string    # Where/how this was first practiced
    key_reference: string       # Book, paper, or practitioner to credit

  # ─── Connections ───
  connections:
    synergies: string[]         # Patterns that amplify this one
    conflicts: string[]         # Patterns that interfere with this one
    enables: string[]           # Patterns this one makes possible
    part_of: string[]           # Larger pattern wholes this belongs to
    contains: string[]          # Smaller patterns nested within this one

  # ─── Capital Impact ───
  capital_impact:
    primary: string[]           # [required] Which of the 8 capitals this most directly builds
    secondary: string[]         # Capitals that benefit indirectly
    cost: string[]              # Capitals that are spent/depleted during implementation

  # ─── Validation ─── [enriched over time]
  validation:
    applications: integer       # Total times applied by operators
    success_rate: float         # % who reported positive outcome
    contexts: object[]          # { domain, sub_domain, count, rate }
    confidence: string          # "seed" | "emerging" | "validated" | "proven"
    avg_improvement: string     # Typical outcome described qualitatively

  # ─── Attribution ─── [enriched over time]
  attribution:
    original_contributor: string
    significant_adaptations: object[]  # { contributor, adaptation, date }
```

### Validation Levels

| Level | Criteria | Meaning |
|-------|----------|---------|
| seed | From intellectual lineage, not yet tested by HUMA operators | Theoretically grounded, awaiting practice data |
| emerging | Applied by 1-10 operators with >60% positive outcomes | Shows promise, needs more context diversity |
| validated | Applied by 10-50 operators across 3+ domains with >75% positive outcomes | Reliable in multiple contexts |
| proven | Applied by 50+ operators across 5+ domains with >80% positive outcomes | Deep structural validity confirmed |

---

## 03 — The Seed Library (12 Patterns)

These patterns are drawn directly from the eight source traditions. They represent the foundational knowledge HUMA launches with. Each is fully specified in the schema format.

---

### Pattern 1: Production Batching

```yaml
id: "rppl:operations:production-batching:v1"
name: "Production Batching"
version: 1

situation:
  description: "The same type of task is spread across multiple days, creating
    repeated setup/teardown overhead. Quality varies between sessions. The operator
    feels busy but inefficient."
  domains: ["agriculture", "food-production", "education", "small-business", "creative-work"]
  signals:
    - "Same task done partially on multiple days"
    - "Significant setup or cleanup time each session"
    - "Quality or speed varies between sessions"
    - "'I never seem to finish anything in one go'"
  prerequisites: []

action:
  description: "Consolidate all instances of a repetitive task into dedicated batch
    sessions. Design the batch size to fill the natural energy arc of a single work session."
  steps:
    - "Inventory every instance of the target task across your current week"
    - "Identify the natural batch size — enough to justify setup, not so much it exceeds one session's energy"
    - "Assign a dedicated time block for the batch session"
    - "Stage all inputs in advance — eliminate mid-task retrieval"
    - "Run the batch. Note actual time versus estimated."
    - "Adjust batch size based on reality, not aspiration"
  duration: "1 week to test, 1 month to validate"
  effort: "The same total hours — redistributed, not added"
  adaptations:
    agriculture:
      note: "Cluster same-harvest crops in adjacent beds to batch harvest + wash + pack in a single flow. Physical layout IS the batching system."
    education:
      note: "Batch all grading for one assignment type in one session rather than grading across assignments daily. Rubric setup amortized."
    creative-work:
      note: "Batch administrative tasks (email, invoicing, scheduling) into one session to protect creative blocks from context-switching."

principle: "Context-switching has a cognitive and physical cost that compounds with
  frequency. Batching amortizes setup cost across more units and allows flow state to
  develop. The improvement comes not from working harder but from eliminating the
  transitions between work."

provenance:
  source_tradition: "Richard Perkins / Enterprise Economics"
  original_context: "Small-scale farm operations at Ridgedale, Sweden"
  key_reference: "Regenerative Agriculture (Perkins, 2020), Chapter 8"

connections:
  synergies: ["rppl:operations:spatial-clustering:v1", "rppl:operations:time-blocking:v1"]
  conflicts: ["rppl:operations:responsive-scheduling:v1"]
  enables: ["rppl:operations:energy-arc-design:v1"]
  part_of: ["rppl:systems:operational-efficiency:v1"]
  contains: []

capital_impact:
  primary: ["experiential", "financial"]
  secondary: ["intellectual", "living"]
  cost: []

validation:
  applications: 0
  success_rate: 0
  contexts: []
  confidence: "seed"
  avg_improvement: "Expected 20-30% time reduction per batched task based on Perkins data"

attribution:
  original_contributor: "Richard Perkins (Ridgedale Farm)"
  significant_adaptations: []
```

---

### Pattern 2: QoL Decomposition

```yaml
id: "rppl:design:qol-decomposition:v1"
name: "Quality of Life Decomposition"
version: 1

situation:
  description: "The operator has a life aspiration ('evenings free for family') but no
    operational chain connecting that aspiration to daily reality. The aspiration
    feels like a wish rather than a design constraint."
  domains: ["life-design", "agriculture", "small-business", "parenting", "career-change"]
  signals:
    - "Aspirations stated but not tested against operational reality"
    - "'I want X but I never seem to get there'"
    - "No weekly validation — success/failure is felt, not measured"
    - "When the aspiration fails, the response is personal ('I need more discipline') rather than systemic"
  prerequisites: []

action:
  description: "Decompose a quality of life aspiration into a chain: statement →
    enabling conditions → weekly commitments → daily behaviors → validation question →
    systemic adjustment when below target."
  steps:
    - "Name the aspiration in one sentence ('Evenings free for my daughter')"
    - "List the structural conditions that must be true for it to hold ('All revenue work done by 3pm', 'No customer communication after 4pm')"
    - "Translate conditions into weekly commitments ('Monday: plan harvest. Tue/Thu: pack days done by 2pm')"
    - "Define a weekly validation question and target ('How many evenings free? Target: 5+/7')"
    - "Pre-write the systemic response for when target is missed — it must be a design question, not a discipline question ('Which enterprise is leaking past 4pm? Is it a packing problem or a boundary problem?')"
  duration: "20 minutes to decompose, ongoing to validate"
  effort: "One-time design work, then 2 minutes/week to check"

principle: "Aspirations are not goals — they are design constraints. A goal asks 'did I
  succeed?' A design constraint asks 'does the system support this?' When the constraint
  fails, the system is redesigned, not the person. This shifts the locus of change from
  willpower to architecture."

provenance:
  source_tradition: "Allan Savory / Holistic Management + Dan Palmer / Living Design Process"
  original_context: "Holistic Management quality of life statements tested against whole-farm decisions"
  key_reference: "Holistic Management (Savory & Butterfield, 1999), Chapter 7"

connections:
  synergies: ["rppl:design:weekly-pulse:v1", "rppl:design:seasonal-arc:v1"]
  conflicts: []
  enables: ["rppl:design:enterprise-qol-validation:v1", "rppl:operations:weekly-rhythm:v1"]
  part_of: ["rppl:systems:holistic-context-definition:v1"]
  contains: []

capital_impact:
  primary: ["experiential", "social"]
  secondary: ["spiritual", "intellectual"]
  cost: ["intellectual"]

validation:
  confidence: "seed"
  avg_improvement: "Expected shift from feeling-based to signal-based life assessment within 4 weeks"

attribution:
  original_contributor: "Allan Savory / Dan Palmer (synthesized for HUMA)"
```

---

### Pattern 3: The Weekly Pulse

```yaml
id: "rppl:operations:weekly-pulse:v1"
name: "The Weekly Pulse"
version: 1

situation:
  description: "The operator has a plan but no regular check against reality. Drift
    accumulates silently. By the time a problem is visible, it has been compounding for
    weeks."
  domains: ["life-design", "agriculture", "small-business", "education", "creative-work"]
  signals:
    - "No weekly review practice"
    - "'I feel like things are slipping but I can't point to why'"
    - "Seasonal reviews reveal problems that could have been caught earlier"
    - "The operator is reactive rather than proactive"

action:
  description: "Establish a fixed weekly review — same day, same time, same duration,
    same questions — that validates the whole context against the operator's stated
    quality of life."
  steps:
    - "Choose a day and time (Sunday evening recommended — transitions from rest to planning)"
    - "Define 3-5 validation questions drawn from QoL decompositions"
    - "Each week: answer the questions honestly (numbers or brief notes)"
    - "Review the answers against the last 2-4 weeks — look for patterns, not events"
    - "Identify one systemic adjustment if a pattern is detected"
    - "Do not identify more than one. One is the discipline."
  duration: "10 minutes per week, indefinitely"
  effort: "10 minutes. Non-negotiable. Protected like any other appointment."

principle: "Monitoring is not measurement — it is attention. Regular, structured
  attention to the whole system prevents silent drift from accumulating into crisis.
  The questions are not assessments — they are probes that keep the operator's
  awareness connected to the system's actual state."

provenance:
  source_tradition: "Allan Savory / Holistic Management monitoring loop"
  original_context: "Planned grazing monitoring — checking grassland health weekly against the holistic context"
  key_reference: "Holistic Management (Savory & Butterfield, 1999), Chapters 15-16"

connections:
  synergies: ["rppl:design:qol-decomposition:v1", "rppl:operations:morning-threshold:v1"]
  conflicts: []
  enables: ["rppl:design:seasonal-arc:v1", "rppl:intelligence:pattern-recognition:v1"]
  part_of: ["rppl:systems:operate-mode:v1"]
  contains: ["rppl:design:qol-decomposition:v1"]

capital_impact:
  primary: ["intellectual", "experiential"]
  secondary: ["spiritual", "social"]
  cost: []

validation:
  confidence: "seed"
  avg_improvement: "Expected reduction in 'surprise problems' by 60% within 2 months of consistent practice"

attribution:
  original_contributor: "Allan Savory (adapted for HUMA)"
```

---

### Pattern 4: Nodal Intervention Selection

```yaml
id: "rppl:design:nodal-intervention:v1"
name: "Nodal Intervention Selection"
version: 1

situation:
  description: "The operator faces multiple possible actions and feels overwhelmed.
    Everything seems equally urgent. Analysis paralysis or scattered effort."
  domains: ["life-design", "agriculture", "small-business", "community-organizing", "education"]
  signals:
    - "Long to-do list with no clear priority"
    - "'Everything is connected — where do I even start?'"
    - "Effort spread thin across many fronts"
    - "No clear cascade logic — actions feel isolated"

action:
  description: "Identify the single point of maximum leverage — the one action that
    cascades through the most dimensions of the system — and commit to it before
    considering anything else."
  steps:
    - "List every possible action you're considering"
    - "For each action, trace its cascade: what does it directly enable? What does that enable?"
    - "Count the number of capitals each action touches through its cascade chain"
    - "Identify the action with the longest cascade that also addresses the most pressing deficit"
    - "Commit to that action. Defer everything else until it's complete or in motion."
    - "Revisit the list only after the nodal intervention has produced its first cascade effect"
  duration: "30 minutes to identify, 2-8 weeks to implement"
  effort: "Varies by intervention — but always less total effort than doing everything at once"

principle: "In any complex system, there are points where a small intervention produces
  disproportionate effects across the whole. These nodes exist because systems are
  interconnected — an action at a node cascades through connections that scatter effort
  cannot reach. Finding the node is a design skill. Starting there is a discipline."

provenance:
  source_tradition: "Dan Palmer / Living Design Process + Donella Meadows / Leverage Points"
  original_context: "Permaculture design — finding the highest-leverage starting point in a landscape"
  key_reference: "Making Permaculture Stronger (Palmer, various articles, 2015-2022)"

connections:
  synergies: ["rppl:design:qol-decomposition:v1", "rppl:operations:cascade-mapping:v1"]
  conflicts: ["rppl:operations:responsive-scheduling:v1"]
  enables: ["rppl:operations:sequential-implementation:v1"]
  part_of: ["rppl:systems:design-mode:v1"]
  contains: ["rppl:operations:cascade-mapping:v1"]

capital_impact:
  primary: ["intellectual", "experiential"]
  secondary: ["all — depends on which node is selected"]
  cost: ["experiential"]

validation:
  confidence: "seed"

attribution:
  original_contributor: "Dan Palmer / Donella Meadows (synthesized for HUMA)"
```

---

### Pattern 5: Spatial Clustering

```yaml
id: "rppl:operations:spatial-clustering:v1"
name: "Spatial Clustering"
version: 1

situation:
  description: "Physical movement between task stations consumes time and breaks
    flow. Tools, materials, or activities that belong together are spread across
    the workspace."
  domains: ["agriculture", "manufacturing", "food-production", "home-design", "education"]
  signals:
    - "Walking back and forth between areas during a single task"
    - "Tools stored far from where they're used"
    - "Tasks that could flow into each other separated by physical distance"

action:
  description: "Redesign the physical layout so that tasks which happen in sequence
    are in proximity. Inputs staged at the point of use. Outputs flow to the next
    station without transport."
  steps:
    - "Map the actual movement path for your most repeated workflow"
    - "Identify every instance of unnecessary travel between stations"
    - "Redesign the layout so the workflow moves in one direction without backtracking"
    - "Stage all inputs at the starting point of the flow"
    - "Test the new layout for one full cycle and measure time saved"
  duration: "1 day to redesign, 1 week to validate"
  effort: "One-time physical reorganization"

principle: "Physical layout is frozen time. Every meter of unnecessary movement, repeated
  daily, compounds into hours lost per season. Spatial design is not optimization — it is
  the recognition that how you arrange your space determines how you spend your life."

provenance:
  source_tradition: "Richard Perkins / Enterprise Economics"
  original_context: "Farm infrastructure layout at Ridgedale — minimizing movement between enterprises"
  key_reference: "Regenerative Agriculture (Perkins, 2020), Chapter 4"

connections:
  synergies: ["rppl:operations:production-batching:v1"]
  conflicts: []
  enables: ["rppl:operations:flow-station-design:v1"]
  part_of: ["rppl:systems:operational-efficiency:v1"]

capital_impact:
  primary: ["material", "experiential"]
  secondary: ["financial", "living"]
  cost: ["material"]

validation:
  confidence: "seed"

attribution:
  original_contributor: "Richard Perkins (Ridgedale Farm)"
```

---

### Pattern 6: The Morning Threshold

```yaml
id: "rppl:practice:morning-threshold:v1"
name: "The Morning Threshold"
version: 1

situation:
  description: "The operator's mornings are reactive — immediately absorbed by email,
    urgencies, or whatever demands attention first. There is no intentional threshold
    between rest and work."
  domains: ["life-design", "agriculture", "creative-work", "parenting", "small-business"]
  signals:
    - "First action of the day is checking phone or email"
    - "Mornings feel like 'catching up' rather than 'beginning'"
    - "No physical or temporal marker between personal time and work time"
    - "The operator feels the day 'happens to them'"

action:
  description: "Design a 5-15 minute morning practice that creates an intentional
    threshold between rest and engagement. The practice should be physical, not digital,
    and should connect the operator to their whole context before the day's demands begin."
  steps:
    - "Choose one physical action that takes you outside or into your body (walk, stretch, tend plants, stand on the land)"
    - "During that action, ask one question: 'What matters most today?'"
    - "Let the answer come from the body, not from the to-do list"
    - "Only after the threshold action: open the phone, check the schedule, begin work"
    - "Protect this threshold as non-negotiable. It is not a luxury — it is the first design decision of the day."
  duration: "5-15 minutes daily"
  effort: "Minimal — the point is presence, not effort"

principle: "Ikigai is a daily practice, not a life destination. The morning threshold
  reconnects the operator to their essence before the day's demands pull them into
  reaction. The physical quality of the practice (outside, body-based) bridges the
  embodiment gap between the digital tool and the lived life."

provenance:
  source_tradition: "Ikigai tradition + Carol Sanford / Essence development"
  original_context: "Japanese daily practice of tending purpose; Sanford's 'start from essence' principle"
  key_reference: "Ikigai (García & Miralles, 2016); The Responsible Entrepreneur (Sanford, 2014)"

connections:
  synergies: ["rppl:operations:weekly-pulse:v1", "rppl:practice:hard-stop:v1"]
  enables: ["rppl:practice:seasonal-attunement:v1"]
  part_of: ["rppl:systems:operate-mode:v1"]

capital_impact:
  primary: ["spiritual", "experiential"]
  secondary: ["living", "social"]
  cost: []

validation:
  confidence: "seed"

attribution:
  original_contributor: "Ikigai tradition / Carol Sanford (synthesized for HUMA)"
```

---

### Pattern 7: Capital Rotation

```yaml
id: "rppl:design:capital-rotation:v1"
name: "Capital Rotation"
version: 1

situation:
  description: "One capital form is being accumulated at the expense of others.
    The operator is financially focused but socially depleted, or intellectually
    rich but physically deteriorating. Imbalance is producing system stress."
  domains: ["life-design", "small-business", "agriculture", "career-development"]
  signals:
    - "One dimension consistently high while others are low"
    - "Success in one area creating problems in another"
    - "The operator feels 'stuck' despite measurable progress"
    - "Capital pollution — excess in one form becoming toxic"

action:
  description: "Intentionally redirect energy from the over-accumulated capital toward
    the depleted capitals, using the strength of the high capital as the vehicle."
  steps:
    - "Identify the highest and lowest capitals in your current profile"
    - "Ask: how can the strength of the high capital serve the low one?"
    - "Design one specific action that converts high-capital surplus into low-capital investment"
    - "Implement for 2-4 weeks"
    - "Re-assess the profile — has the low capital moved?"
  duration: "2-4 weeks per rotation"
  effort: "No additional hours — redirect existing energy"

principle: "Capital is healthiest as flow, not accumulation. Stagnant capital of any
  kind becomes pollution — excess financial capital breeds paranoia, excess intellectual
  capital breeds disconnection. Health is circulation. The rotation principle treats life
  capitals like soil nutrients: what is abundant must flow to where it's needed."

provenance:
  source_tradition: "Ethan Roland & Gregory Landua / 8 Forms of Capital"
  original_context: "Regenerative enterprise design — capital exchange rates between forms"
  key_reference: "Regenerative Enterprise (Roland & Landua, 2013)"

connections:
  synergies: ["rppl:operations:weekly-pulse:v1", "rppl:design:qol-decomposition:v1"]
  enables: ["rppl:design:enterprise-capital-stacking:v1"]
  part_of: ["rppl:systems:evolve-mode:v1"]

capital_impact:
  primary: ["whichever capitals are in deficit"]
  secondary: ["all — rotation benefits the whole system"]
  cost: ["whichever capital is being redirected from"]

validation:
  confidence: "seed"

attribution:
  original_contributor: "Ethan Roland & Gregory Landua"
```

---

### Pattern 8: Seasonal Arc Design

```yaml
id: "rppl:design:seasonal-arc:v1"
name: "Seasonal Arc Design"
version: 1

situation:
  description: "The operator treats every week the same. No distinction between
    intense seasons and rest seasons. Either constant low-grade effort or periodic
    burnout cycles."
  domains: ["agriculture", "education", "creative-work", "small-business", "parenting"]
  signals:
    - "Same weekly rhythm year-round"
    - "Periodic burnout followed by collapse"
    - "No planned rest or recovery periods"
    - "'I can't keep this up' feeling, cyclically"

action:
  description: "Design two distinct operational modes — peak and rest — and assign
    them to calendar periods based on your domain's natural rhythm. Protect the
    rest season as fiercely as the peak season."
  steps:
    - "Identify your domain's natural peak (when work demands are highest)"
    - "Identify the natural rest (when work demands are lowest)"
    - "Design a peak-season weekly rhythm that is sustainable for 12-16 weeks"
    - "Design a rest-season weekly rhythm that is 50-60% of peak intensity"
    - "Name the QoL statements most under pressure during peak and protect them with specific boundaries"
    - "Name the QoL statements that are naturally honored during rest and use that season to deepen them"
  duration: "Seasonal — designed once per year, adjusted quarterly"
  effort: "Planning effort only — the work itself is redistributed, not increased"

principle: "All living systems oscillate between intensity and rest. The annual cycle
  of seasons, the daily cycle of waking and sleeping, the agricultural cycle of planting
  and fallowing — each one demonstrates that sustained output requires structured
  recovery. Designing the arc means designing the rest, not just the work."

provenance:
  source_tradition: "Holistic Management / Regenerative Agriculture"
  original_context: "Planned grazing rotations — periods of intensive use followed by mandatory recovery"
  key_reference: "Holistic Management (Savory, 1999); Regenerative Agriculture (Perkins, 2020)"

connections:
  synergies: ["rppl:operations:weekly-pulse:v1", "rppl:practice:hard-stop:v1"]
  enables: ["rppl:practice:seasonal-attunement:v1"]
  part_of: ["rppl:systems:evolve-mode:v1"]

capital_impact:
  primary: ["experiential", "living"]
  secondary: ["social", "spiritual"]
  cost: []

validation:
  confidence: "seed"

attribution:
  original_contributor: "Allan Savory / Richard Perkins (synthesized for HUMA)"
```

---

### Pattern 9: The Essence Probe

```yaml
id: "rppl:practice:essence-probe:v1"
name: "The Essence Probe"
version: 1

situation:
  description: "The operator is operating from goals or obligations rather than from
    their authentic essence. Actions feel dutiful rather than alive. 'I should'
    has replaced 'I want to.'"
  domains: ["life-design", "career-change", "creative-work", "parenting", "leadership"]
  signals:
    - "Language dominated by 'should', 'have to', 'need to'"
    - "Success that feels hollow"
    - "Difficulty articulating what they actually want (vs. what they think they should want)"
    - "Purpose dimension low despite material stability"

action:
  description: "Ask the question that bypasses the should-layer and reaches the
    authentic signal: 'What's been sitting in the back of your mind?'"
  steps:
    - "Find a quiet moment — not during crisis, not during productivity"
    - "Ask yourself: 'What keeps coming back? The thing I think about when I'm not thinking about anything?'"
    - "Write the answer without editing. One sentence."
    - "Ask: 'If I took this seriously, what would change?'"
    - "Don't act on it yet. Just hold it. Let it clarify over a week."
  duration: "10 minutes to surface, 1-2 weeks to clarify"
  effort: "Minimal — the difficulty is honesty, not effort"

principle: "Every person has an essence — an irreducible singularity that seeks
  expression. Goals and obligations often overlay this essence with external
  expectations. The probe question bypasses the cognitive layer (which has been
  trained to produce 'correct' answers) and surfaces what is authentically present.
  Sanford's principle: development means evolving the expression of essence, not
  imposing a template."

provenance:
  source_tradition: "Carol Sanford / Essence development"
  original_context: "Sanford's work with Fortune 500 executives — surfacing authentic purpose beneath corporate personas"
  key_reference: "The Responsible Entrepreneur (Sanford, 2014), Chapter 3"

connections:
  synergies: ["rppl:practice:morning-threshold:v1"]
  enables: ["rppl:design:qol-decomposition:v1", "rppl:design:enterprise-selection:v1"]
  part_of: ["rppl:systems:design-mode:v1"]

capital_impact:
  primary: ["spiritual", "cultural"]
  secondary: ["experiential", "social"]
  cost: []

validation:
  confidence: "seed"

attribution:
  original_contributor: "Carol Sanford"
```

---

### Pattern 10: Enterprise-QoL Validation

```yaml
id: "rppl:design:enterprise-qol-validation:v1"
name: "Enterprise-QoL Validation"
version: 1

situation:
  description: "An enterprise or project looks good on paper but hasn't been tested
    against the operator's stated quality of life. The revenue projection is exciting
    but the labor reality conflicts with a core life commitment."
  domains: ["agriculture", "small-business", "career-change", "creative-work"]
  signals:
    - "Enterprises selected based on revenue potential alone"
    - "No time-of-day analysis for combined enterprise stack"
    - "'I didn't realize it would take this much time'"
    - "QoL statements failing within months of enterprise launch"

action:
  description: "Before committing to any enterprise, test it against every QoL statement
    by mapping its actual daily time demands against the operator's time boundaries."
  steps:
    - "List every QoL statement with its time boundary ('done by 3pm', 'weekends free')"
    - "For the proposed enterprise, map a realistic peak-season day hour by hour"
    - "Stack all enterprises together — what does a full day look like?"
    - "Check: does any enterprise violate a QoL time boundary?"
    - "If yes: modify the enterprise design, reduce scale, or reject it"
    - "Never modify the QoL statement to fit the enterprise"
  duration: "30 minutes per enterprise"
  effort: "Design work only — prevents months of misalignment"

principle: "The holistic context is primary. Every decision must be tested against
  the whole before it is adopted. An enterprise that produces excellent revenue but
  violates a core quality of life statement is not a good enterprise — it is a
  well-disguised trap. The QoL validation ensures the operation serves the life,
  not the other way around."

provenance:
  source_tradition: "Allan Savory / Holistic Management testing questions"
  original_context: "Testing proposed actions against the holistic context before committing resources"
  key_reference: "Holistic Management (Savory & Butterfield, 1999), Chapter 12"

connections:
  synergies: ["rppl:design:qol-decomposition:v1", "rppl:design:nodal-intervention:v1"]
  conflicts: []
  enables: ["rppl:operations:weekly-rhythm:v1"]
  part_of: ["rppl:systems:design-mode:v1"]

capital_impact:
  primary: ["experiential", "social"]
  secondary: ["financial"]
  cost: ["financial"]

validation:
  confidence: "seed"

attribution:
  original_contributor: "Allan Savory (adapted for HUMA)"
```

---

### Pattern 11: The Hard Stop

```yaml
id: "rppl:practice:hard-stop:v1"
name: "The Hard Stop"
version: 1

situation:
  description: "Work bleeds into personal time without a clear boundary. The operator
    intends to stop at a certain time but consistently works past it. The boundary
    exists as an intention, not as a design."
  domains: ["life-design", "agriculture", "small-business", "remote-work", "parenting"]
  signals:
    - "Consistent overrun past intended stop time"
    - "'Just one more thing' pattern"
    - "Evening QoL statements failing"
    - "Stop time exists as willpower, not as system design"

action:
  description: "Make the hard stop a physical event, not a mental decision. Design
    a transition action that makes continuing work structurally impossible or
    strongly inconvenient."
  steps:
    - "Set a hard stop time that honors your most important evening QoL statement"
    - "Design a physical transition: change clothes, move locations, start cooking, pick up your child"
    - "Set a 15-minute warning that triggers shutdown tasks (tools away, notes captured)"
    - "At the hard stop, execute the physical transition regardless of task completion"
    - "Incomplete tasks go to tomorrow's plan — not tonight's overflow"
  duration: "Immediate implementation, 2-3 weeks to become automatic"
  effort: "Zero additional effort — it's a boundary, not a task"

principle: "Boundaries are not acts of willpower — they are design elements. A physical
  transition is harder to override than a mental intention. The hard stop protects the
  system (evenings, relationships, rest) from the operator's own tendency to over-work.
  What you design, you maintain. What you decide, you negotiate."

provenance:
  source_tradition: "Holistic Management / QoL validation"
  original_context: "Farm operations — preventing harvest work from consuming all daylight hours"
  key_reference: "HUMA Design Clarification (2026)"

connections:
  synergies: ["rppl:design:qol-decomposition:v1", "rppl:design:seasonal-arc:v1"]
  part_of: ["rppl:systems:operate-mode:v1"]

capital_impact:
  primary: ["social", "experiential"]
  secondary: ["living", "spiritual"]
  cost: ["financial"]

validation:
  confidence: "seed"

attribution:
  original_contributor: "HUMA (original synthesis)"
```

---

### Pattern 12: Succession Stacking

```yaml
id: "rppl:design:succession-stacking:v1"
name: "Succession Stacking"
version: 1

situation:
  description: "The operator tries to launch everything at once, overwhelming their
    capacity and capital. Or they launch one enterprise and wait too long to start
    the next, losing momentum and diversification opportunity."
  domains: ["agriculture", "small-business", "career-change", "community-organizing"]
  signals:
    - "Attempting to launch multiple enterprises simultaneously"
    - "Or: single enterprise for 2+ years with no diversification"
    - "Cash flow gaps between enterprise maturation cycles"
    - "No clear sequence for when to start what"

action:
  description: "Sequence enterprise launches so that each new enterprise starts as the
    previous one reaches operational stability — each one's early outputs feeding the
    next one's startup needs."
  steps:
    - "Order enterprises by time-to-revenue (fastest first)"
    - "Identify the 'cascade gift' each enterprise provides to the next (cash, fertility, infrastructure, skills, community)"
    - "Launch enterprise 1. When it reaches 60% of projected capacity, begin enterprise 2"
    - "Use enterprise 1's surplus (cash, inputs, knowledge) to fund enterprise 2's startup"
    - "Never launch two enterprises in the same season unless one is passive"
  duration: "Multi-year sequence — planned in year 1, executed over years 1-3"
  effort: "Lower than simultaneous launch — the discipline is patience"

principle: "Ecological succession is nature's strategy for building complex systems:
  pioneer species create the conditions for the next wave, which creates conditions
  for the next. The same principle applies to enterprise development. The market garden
  (pioneer) creates cash flow and soil biology that enables the nursery (secondary),
  which creates the knowledge base that enables the education enterprise (tertiary).
  Rushing the succession produces failure. Honoring it produces compound returns."

provenance:
  source_tradition: "Permaculture / Ecological succession + Richard Perkins / Enterprise stacking"
  original_context: "Ridgedale Farm — 10-year enterprise development sequence"
  key_reference: "Regenerative Agriculture (Perkins, 2020), Chapter 3"

connections:
  synergies: ["rppl:design:nodal-intervention:v1", "rppl:design:enterprise-qol-validation:v1"]
  conflicts: ["rppl:operations:parallel-launch:v1"]
  enables: ["rppl:design:capital-rotation:v1"]
  part_of: ["rppl:systems:design-mode:v1"]

capital_impact:
  primary: ["financial", "intellectual"]
  secondary: ["material", "living", "experiential"]
  cost: ["experiential"]

validation:
  confidence: "seed"

attribution:
  original_contributor: "Richard Perkins / Permaculture tradition"
```

---

## 04 — Universal Seed Patterns

*The first 12 seed patterns above emerged from regenerative agriculture — the beachhead domain. The following patterns are domain-general: they apply to any human life understood as a connected system. They demonstrate that the RPPL architecture is universal.*

### Pattern 13: Time Block Batching

```yaml
rppl_version: "0.1"

pattern:
  id: "rppl:universal:time-block-batching:1"
  name: "Time Block Batching"
  version: 1

  situation:
    description: "Work feels scattered. You're switching between types of tasks (creative, administrative, communication) multiple times per day. Energy is drained by context-switching, not by the work itself."
    domains: ["freelance", "small-business", "creative-work", "education", "any-knowledge-work"]
    signals:
      - "End of day with many things started, few finished"
      - "Constant inbox/notification checking between tasks"
      - "Feeling busy but not productive"
      - "Creative work interrupted by administrative demands"
    prerequisites: []

  action:
    description: "Group similar tasks into dedicated time blocks. Protect creative blocks from interruption. Batch administrative and communication tasks into a single daily window."
    steps:
      - "Identify your 3-4 task types (e.g., creative/deep work, communication, admin, meetings)"
      - "Assign each type a daily block: creative work in your peak energy window, communication after lunch, admin end of day"
      - "Set a hard boundary: no email/messages during creative blocks"
      - "Batch all communication into one 60-90 minute window"
      - "Review weekly: which blocks held? Which leaked? Adjust the design, not the discipline"
    duration: "1 week to establish, 3 weeks to stabilize"
    effort: "15 minutes to plan, then discipline to hold the blocks"
    adaptations:
      freelance:
        note: "Client communication is the biggest leak. Set expectations: you respond between 1-3pm."
        modified_steps:
          - "Add a 'client day' (e.g., Tuesday) for all calls and reviews — protect other days for deep work"
      education:
        note: "Teaching hours are fixed. Batch grading and prep into dedicated non-teaching days."
        modified_steps:
          - "Never grade and prep on the same day — they use different cognitive modes"

  principle: "Context-switching has a cognitive cost that compounds across a day. Batching amortizes setup cost and enables flow state. The principle is the same whether you're batching harvest tasks on a farm or creative tasks at a desk."

  provenance:
    source_tradition: "Perkins enterprise design + universal productivity research"
    original_context: "Farm task batching (Perkins), adapted to knowledge work"
    key_reference: "Cal Newport, 'Deep Work'; Richard Perkins, 'Regenerative Agriculture'"

  connections:
    synergies: ["rppl:universal:energy-rhythm-mapping:1", "rppl:universal:hard-stop-practice:1"]
    conflicts: ["On-demand client availability expectations"]
    enables: ["Sustained creative output", "Reduced decision fatigue"]
    part_of: ["Weekly rhythm design"]
    contains: []

  capital_impact:
    primary: ["Intellectual", "Experiential"]
    secondary: ["Financial", "Social"]
    cost: ["Requires saying no to real-time availability"]

  validation:
    metric: "Uninterrupted creative blocks per week (target: 4+)"
    frequency: "weekly"
    threshold: "4+ blocks of 90min+ with no interruption, sustained for 3 weeks"
```

### Pattern 14: Hard Stop Practice

```yaml
rppl_version: "0.1"

pattern:
  id: "rppl:universal:hard-stop-practice:1"
  name: "Hard Stop Practice"
  version: 1

  situation:
    description: "Work expands to fill available time. Evenings and weekends erode. The things that matter most — relationships, rest, joy — get whatever is left over, which is usually nothing."
    domains: ["any-work", "freelance", "parenting", "caregiving"]
    signals:
      - "Regularly working past intended stop time"
      - "Partner/family complaints about availability"
      - "Rest feels like something you haven't earned yet"
      - "Joy dimension consistently low despite other dimensions being okay"
    prerequisites: []

  action:
    description: "Set a non-negotiable daily stop time tied to a specific quality-of-life commitment. Design the work to fit inside the boundary, not the boundary around the work."
    steps:
      - "Name the QoL commitment the stop time protects (e.g., 'dinner with my partner by 6:30')"
      - "Set the hard stop time (e.g., 5:30pm including shutdown ritual)"
      - "Work backward: what has to be true for all essential work to be done by then?"
      - "Identify the one task type that most often causes overrun — redesign or reschedule it"
      - "When the stop time arrives, stop. Even if something is unfinished. The unfinished thing is tomorrow's first task."
      - "Weekly review: how many hard stops held? If fewer than 5/7, look at the system, not your discipline"
    duration: "Immediate to start, 2-3 weeks to stabilize"
    effort: "Zero additional effort — this is about stopping, not doing more"
    adaptations:
      parenting:
        note: "The hard stop is often set by school pickup or childcare end time. The design challenge is working backward from that fixed point."
        modified_steps:
          - "Identify the 'last possible leave time' and subtract 15min buffer — that's your real stop time"
      freelance:
        note: "Client urgency is the biggest threat to the hard stop. Set communication boundaries that prevent 4pm emergencies."
        modified_steps:
          - "Move all client deliverable deadlines to morning — nothing due end-of-day"

  principle: "Time boundaries protect what matters. When work has no boundary, it consumes everything — not because the work demands it, but because an open system expands to fill its container. A hard stop is a design constraint that forces prioritization."

  provenance:
    source_tradition: "Holistic Management (Savory) — QoL-first decision making"
    original_context: "Farm hard stops protecting family time (HUMA beachhead)"
    key_reference: "Allan Savory, 'Holistic Management'; Dan Martell, 'Buy Back Your Time'"

  connections:
    synergies: ["rppl:universal:time-block-batching:1", "rppl:universal:weekly-rhythm-design:1"]
    conflicts: ["Cultures of on-demand availability"]
    enables: ["Protected relationship time", "Rest without guilt", "Joy recovery"]
    part_of: ["QoL decomposition chain"]
    contains: []

  capital_impact:
    primary: ["Experiential", "Social"]
    secondary: ["Living", "Spiritual"]
    cost: ["May limit Financial capital in short term (fewer billable hours)"]

  validation:
    metric: "Hard stops held per week (target: 5+/7)"
    frequency: "weekly"
    threshold: "5+ days with hard stop respected for 4 consecutive weeks"
```

### Pattern 15: Financial Clarity Practice

```yaml
rppl_version: "0.1"

pattern:
  id: "rppl:universal:financial-clarity-practice:1"
  name: "Financial Clarity Practice"
  version: 1

  situation:
    description: "Money feels like fog — you know roughly what comes in and goes out, but the specifics are avoided. The avoidance itself generates anxiety that bleeds into sleep, relationships, and decision-making."
    domains: ["personal-finance", "freelance", "small-business", "any-life"]
    signals:
      - "Money dimension rated low but you can't name the specific gap"
      - "Avoiding looking at bank balance"
      - "Financial decisions made from anxiety rather than information"
      - "Sleep disrupted by money worry"
    prerequisites: []

  action:
    description: "Replace money anxiety with money clarity through a single weekly practice: 15 minutes with the real numbers. Not budgeting. Not optimizing. Just seeing."
    steps:
      - "Pick a fixed weekly time (Sunday evening or Monday morning works for most people)"
      - "Open all accounts. Write down three numbers: what came in this week, what went out, what's left"
      - "No judgment. No planning. Just the numbers. Sit with them for 2 minutes."
      - "Name one thing that surprised you. That's the signal."
      - "After 3 weeks: the anxiety shifts from fog to specifics. Specific problems have specific solutions."
    duration: "15 minutes per week, 3 weeks to shift from avoidance to clarity"
    effort: "15 minutes weekly"

  principle: "Financial anxiety is almost always driven by avoidance, not by the actual numbers. The fog is worse than the reality. Clarity — even clarity about a bad situation — reduces anxiety because the nervous system can work with concrete information. It can't work with undefined dread."

  provenance:
    source_tradition: "Holistic Management (Savory) — planning for financial health as part of the whole"
    original_context: "Universal — applies to any person with income and expenses"
    key_reference: "Ramit Sethi (conscious spending); Allan Savory (financial planning within holistic context)"

  connections:
    synergies: ["rppl:universal:hard-stop-practice:1"]
    conflicts: ["Avoidance as coping strategy (pattern must be introduced gently)"]
    enables: ["Informed financial decisions", "Sleep improvement", "Reduced relationship tension about money"]
    part_of: ["Weekly rhythm design"]
    contains: []

  capital_impact:
    primary: ["Financial"]
    secondary: ["Living", "Social", "Experiential"]
    cost: ["Short-term discomfort of facing numbers"]

  validation:
    metric: "Weekly money check-ins completed (target: 3+/4 weeks)"
    frequency: "monthly"
    threshold: "3+ check-ins per month for 2 consecutive months"
```

### Pattern 16: Weekly Rhythm Design

```yaml
rppl_version: "0.1"

pattern:
  id: "rppl:universal:weekly-rhythm-design:1"
  name: "Weekly Rhythm Design"
  version: 1

  situation:
    description: "Every week feels like it's happening to you rather than being shaped by you. Days blur together. Important-but-not-urgent things (health, relationships, creative projects) never get space because urgent things fill every gap."
    domains: ["any-life", "freelance", "parenting", "education", "small-business"]
    signals:
      - "No distinction between different days of the week"
      - "Important personal projects haven't moved in weeks"
      - "Feeling reactive rather than intentional"
      - "Weekend used to recover from the week rather than to live"
    prerequisites: ["rppl:universal:hard-stop-practice:1"]

  action:
    description: "Give each day a theme that reflects what matters. Not a rigid schedule — a shape. Monday is for planning and deep work. Wednesday is for people. Friday is for loose ends. The theme doesn't control every hour — it sets the tone and protects the priority."
    steps:
      - "List your 4-5 recurring task/life types (deep work, communication, admin, relationships, rest)"
      - "Assign each a primary day. Not exclusive — just primary."
      - "Protect one morning per week for the thing that matters most but never gets space"
      - "Designate one day as 'light' — half the normal load, buffer for overflow"
      - "Sunday evening or Monday morning: 10-minute preview of the week's shape"
      - "Sunday evening: 5-minute review — which themes held? Which got overrun? Adjust the design."
    duration: "1 week to draft, 4 weeks to stabilize"
    effort: "15 minutes to plan, then holding the shape through the week"

  principle: "A week without rhythm is a week without leverage. Theming days reduces daily decision-making (you know what today is FOR), protects important-not-urgent work, and creates natural transitions between different modes of attention. The rhythm is a design constraint, not a cage — it shapes the week so the week doesn't shape you."

  provenance:
    source_tradition: "Perkins (weekly farm rhythm design) + Palmer (design process)"
    original_context: "Farm weekly rhythm (Perkins), generalized to any life"
    key_reference: "Richard Perkins, 'Regenerative Agriculture'; Mike Vardy, 'Productivityist'"

  connections:
    synergies: ["rppl:universal:time-block-batching:1", "rppl:universal:hard-stop-practice:1", "rppl:universal:financial-clarity-practice:1"]
    conflicts: ["Jobs with unpredictable schedules (pattern needs heavy adaptation)"]
    enables: ["Protected creative time", "Relationship maintenance", "Sustainable work pace"]
    part_of: ["Operational design (Phase 6)"]
    contains: ["rppl:universal:time-block-batching:1", "rppl:universal:hard-stop-practice:1"]

  capital_impact:
    primary: ["Intellectual", "Experiential", "Social"]
    secondary: ["Living", "Spiritual"]
    cost: ["Requires saying no to some spontaneous requests"]

  validation:
    metric: "Days where the theme held vs. was overridden (target: 4+/5 workdays)"
    frequency: "weekly"
    threshold: "4+ themed days holding for 3 consecutive weeks"
```

---

## 05 — How Patterns Are Used by the AI Engine

The AI engine selects patterns through a three-step process:

**Step 1: Read the operator's context.** The current Shape (capital profile), QoL statements, active enterprises, recent weekly review data, and the specific question or situation they've raised.

**Step 2: Match against situation signals.** For each pattern in the library, check whether the operator's context matches the pattern's situation signals. Rank matches by signal strength and capital impact alignment.

**Step 3: Deliver with adaptation.** When recommending a pattern, the AI adapts it to the operator's specific context — using the domain-specific adaptations if available, and generating context-specific steps if needed. The pattern's principle is always communicated, because the principle is what enables the operator to adapt it intelligently on their own.

The AI never recommends a pattern without explaining why it fits THIS operator in THIS situation. Generic pattern recommendations are a violation of the whole-context principle.

---

## 05 — How Patterns Grow

Seed patterns (like these 12) are theoretical — drawn from the intellectual lineage but not yet validated by HUMA operators. As operators use HUMA:

1. **Application data accumulates.** Each time a pattern is recommended and the operator reports an outcome, the validation data grows.
2. **Adaptations emerge.** When an operator modifies a pattern for their context and the modification works, it becomes a recorded adaptation.
3. **New patterns are discovered.** When a seasonal review reveals a novel insight that doesn't match any existing pattern, it can be contributed as a new seed pattern.
4. **Cross-domain connections appear.** When the same pattern is validated across multiple domains, its structural validity deepens and its transferability increases.

The pattern library is alive. These 12 seeds are the beginning. The operators grow the forest.

---

## Research Protocol

New patterns are discovered through the huma-researcher skill's DISCOVER program.
Every candidate pattern must:

1. Score 16/20 minimum on the completeness checklist (10 required + 6 quality)
2. Pass stress testing against 3 diverse operator profiles
3. Be logged in docs/research/pattern-research-log.md with full evidence

Patterns enter the library at confidence level "seed" and advance through
"emerging" → "validated" → "proven" as operators apply them and report outcomes.

Discovery methods: Source Tradition Mining, Cross-Domain Translation,
Structural Gap Analysis, Cascade Discovery, Failure Mode Analysis.

See .claude/skills/huma-researcher/SKILL.md for the full protocol.

---

## Pattern Compilation

Patterns are not advice to be read — they are programs to be compiled against an operator's field. See the Technical Specification for the six compilation operations (domain selection, field constraints, prerequisite check, conflict check, node identification, capital prediction).

When the AI recommends a pattern during Operate Mode, it should compile the pattern — not just reference it. The operator receives a specific, adapted action plan, not a generic description.

---

## Pattern Evolution

Patterns in this library are living. Their lifecycle follows evolutionary dynamics: birth → application → mutation → selection → speciation → evolution → death.

Every pattern's validation section tracks its evolutionary state. As the population study and real operator data accumulate, patterns will change: steps that nobody follows will be questioned, prerequisites that operators keep discovering will be added, failure modes that keep appearing will be documented, and the principle itself may sharpen or broaden.

Significantly divergent adaptations fork into new patterns that reference their parent. Patterns that consistently fail get deprecated with full evolutionary history — the failure record is itself knowledge.

---

## Transformer Library

As cross-domain pattern transfers are studied, the reusable mechanisms (Transformers) are documented separately from the patterns themselves. A Transformer is not a pattern — it is a bridge between patterns across domains. The Transformer library will grow alongside the pattern library as more domain pairs are studied.

---

*HUMA · RPPL Pattern Schema & Seed Library · March 2026*
