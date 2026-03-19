# H U M A
## RPPL Pattern Schema & Seed Library
### The Knowledge That Powers the Medium

*This document defines the structure of every pattern in HUMA's library and provides the first 12 seed patterns. These patterns are drawn directly from the intellectual lineage sources and represent validated, cross-domain practical wisdom. They are the foundation of every recommendation HUMA makes.*

March 2026 · Foundational Architecture

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

## 04 — How Patterns Are Used by the AI Engine

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
