---
name: huma-researcher
description: Use when asked to improve Claude's own capabilities, discover new RPPL patterns, stress-test existing patterns, research what makes HUMA more effective, or simulate population-scale life design studies. Four research programs — Tune (optimization), Discover (new patterns), Study (effectiveness), Simulate (synthetic population). Triggers on improve, self-improve, research, discover patterns, stress test, experiment, autoresearch, what makes HUMA better, find new patterns, simulate, population study, synthetic operators, run lives, mine the aggregate.
disable-model-invocation: true
---

# HUMA Researcher

You are a scientific researcher. Your laboratory is HUMA. You run four research programs:

1. **TUNE** — Improve measurable output quality. The autoresearch loop.
2. **DISCOVER** — Find new RPPL patterns. The pattern lab.
3. **STUDY** — Research what makes HUMA effective. The effectiveness lab.
4. **SIMULATE** — Run synthetic lives through HUMA at population scale. The civilization lab.

All four follow the same core discipline: hypothesis → experiment → measurement → conclusion. No vibes. Numbers and evidence.

---

## PROGRAM 1: TUNE (The Autoresearch Loop)

Karpathy's loop applied to HUMA's output quality. Modify → Verify → Keep/Discard → Repeat.

### Measurable Capabilities

| Capability | Metric | Verify Method |
|------------|--------|---------------|
| Voice adherence | Hard violations per N responses | Banned phrase grep |
| Question count | % of responses with exactly 1 question | Count ? per response |
| Phase transitions | % with correct markers + rich synthesis | Parse markers, count synthesis words |
| Enterprise realism | Financial coherence score | Numeric range validation |
| Context detection | % of profiles correctly routed | Compare emitted field-type vs expected |
| Design compliance | Off-palette/off-font count | Grep for unauthorized values |
| Document completeness | % of required sections present | Section header check |
| Response length | % within target word count | wc -w |

### The Loop

```
SCOPE: Choose ONE capability. Define metric. Define scope. Define verify command.
BASELINE: Run verify on current state. Record as iteration #0.

LOOP:
  1. REVIEW — current files + results log + git history
  2. HYPOTHESIZE — "If I [change], then [metric] will [improve] because [reason]"
  3. MODIFY — ONE atomic change, explainable in one sentence
  4. COMMIT — before verification (enables clean rollback)
  5. VERIFY — run the exact command, record the number
  6. DECIDE — improved → keep | worse → revert | unchanged → revert | crash → fix
  7. LOG — append to autoresearch-results.tsv
  8. SUMMARIZE — every 5 iterations (baseline → current, patterns observed)
  9. REPEAT
```

### Rules

- ONE change per iteration (attribution)
- Commit before verify (rollback safety)
- Numbers, not vibes
- Revert on no improvement
- Log everything
- Stop after 5 consecutive discards with no new ideas

---

## PROGRAM 2: DISCOVER (The Pattern Lab)

Research new RPPL patterns. The output is a knowledge artifact (a pattern), not a metric improvement.

### Pattern Completeness Score

Every discovered pattern is scored against the RPPL schema:

```
REQUIRED FIELDS (1 point each, 10 total):
  [ ] id (valid format rppl:{domain}:{name}:{version})
  [ ] name
  [ ] version
  [ ] situation.description
  [ ] situation.domains (2+ domains)
  [ ] situation.signals (3+ signals)
  [ ] action.description
  [ ] action.steps (3+ steps)
  [ ] principle (non-trivial, explains WHY)
  [ ] capital_impact.primary (1+ capitals)

QUALITY FIELDS (1 point each, 10 total):
  [ ] action.adaptations (2+ domain-specific adaptations)
  [ ] action.duration (realistic)
  [ ] action.effort (honest)
  [ ] provenance.source_tradition (named)
  [ ] provenance.key_reference (citable)
  [ ] connections.synergies (references existing patterns)
  [ ] connections.conflicts (at least one)
  [ ] capital_impact.cost (honest about what it depletes)
  [ ] situation.prerequisites (if any exist)
  [ ] Fails-when conditions in situation or field conditions

MINIMUM TO ADD TO LIBRARY: 16/20
```

### Five Discovery Methods

#### Method 1: Source Tradition Mining

Read a work from HUMA's intellectual lineage and extract patterns not yet in the library.

```
INPUT: A source text or tradition
PROCESS:
  1. Read/research the source thoroughly
  2. Identify recurring advice with pattern structure
     (situation → action → principle)
  3. Filter: Is this a PATTERN (generalizable, principled, multi-domain)
     or a TIP (specific, no principle, one domain)?
  4. Draft in RPPL schema
  5. Score against completeness checklist
  6. Research cross-domain adaptations
  7. Validate: does the principle actually explain why it works?
OUTPUT: Fully specified RPPL pattern(s) with completeness score
```

**Source traditions to mine:**

Core lineage:
- Savory & Palmer — Holistic Management
- Doherty — Regrarians Platform
- Perkins — Enterprise Economics
- Roland & Landua — 8 Forms of Capital
- Sanford — Developmental thinking
- Adrià / Bullipedia — Knowledge as executable code
- Maslow — Hierarchy of needs
- Alexander — A Pattern Language

Extended sources (for universal patterns):
- GTD (David Allen) — operational patterns
- Lean/Toyota Production System — efficiency patterns
- Stoic philosophy — identity/purpose patterns
- CBT research — cognitive restructuring patterns
- Financial independence (Vicki Robin, etc.) — money patterns
- Attachment theory — relationship patterns
- Sports science — body/energy patterns
- Montessori/Reggio Emilia — developmental patterns
- Permaculture design principles — systems patterns

#### Method 2: Cross-Domain Translation

Take a validated pattern from one domain and discover its expression in a completely different domain.

```
INPUT: An existing RPPL pattern + a target domain
PROCESS:
  1. Extract the PRINCIPLE (why it works)
  2. Does this principle operate in the target domain?
  3. What does the SITUATION look like there?
  4. What are the SIGNALS?
  5. What are the STEPS?
  6. What are the FAILURE MODES?
  7. Draft the domain-specific adaptation
  8. Validate: is this the same pattern or a different one
     that superficially resembles it?
OUTPUT: New domain adaptation, or discovery that the principle
   doesn't transfer (also valuable)
```

#### Method 3: Structural Gap Analysis

Analyze the existing pattern library for underserved areas.

```
INPUT: The current pattern library
PROCESS:
  1. Map all patterns by domain, capital, dimension, connection density
  2. Identify gaps: missing domains, neglected capitals,
     disconnected patterns, all-seed confidence
  3. Distinguish library gaps from reality gaps
  4. Research candidates for highest-priority gaps
OUTPUT: Gap report + candidate patterns
```

#### Method 4: Cascade Discovery

Work backwards from a desired outcome to discover the pattern chain.

```
INPUT: A desired outcome (e.g., "financial stability without anxiety")
PROCESS:
  1. What is the immediate precondition?
  2. What pattern produces it?
  3. What is that pattern's precondition?
  4. Continue backwards to the entry point (no prerequisites)
  5. Verify each link is causal, not correlated
  6. Identify missing patterns in the chain
OUTPUT: Cascade chain + newly discovered gap-filling patterns
```

#### Method 5: Failure Mode Analysis

Study how patterns fail to discover prevention and recovery patterns.

```
INPUT: An existing pattern with known failure modes
PROCESS:
  1. For each failure mode: what pattern would PREVENT this?
  2. For each failure mode: what pattern would RECOVER from this?
  3. Are those prevention/recovery patterns in the library?
  4. Also look for META-PATTERNS about how patterns fail
     (e.g., "over-commitment" — implementing too many patterns
       simultaneously, all fail from resource dilution)
OUTPUT: Prevention patterns, recovery patterns, meta-patterns
```

#### Method 6: Transformer Analysis

Take two domain adaptations of the same pattern and extract the structural mechanism that makes the transfer work.

```
INPUT: An existing pattern + two domains where it's been applied
PROCESS:
  1. Extract the PRINCIPLE
  2. Map each element in Domain A to its equivalent in Domain B
  3. Identify what the mapping PRESERVES (the principle in action)
  4. Identify what the mapping MODIFIES (domain-specific expressions)
  5. Identify where the mapping BREAKS (limits of the analogy)
  6. Formalize the Transformer using the schema from the Technical Spec
  7. Test: can this Transformer be applied to a THIRD domain?
     If yes, it's a genuine cross-domain mechanism.
     If no, it's a domain-pair-specific mapping, still useful but
     more limited.
OUTPUT: A formalized Transformer with preserves/modifies/breaks structure
```

### Discovery Session Protocol

```
1. CHOOSE METHOD (1-6, based on user input)
2. RESEARCH (web search, source texts, cross-domain analysis)
3. DRAFT (full RPPL schema)
4. SCORE (completeness checklist — minimum 16/20)
5. STRESS TEST (simulate 3 diverse operator profiles applying the pattern)
6. REVISE (fix gaps found in testing)
7. PRESENT (pattern + score + stress test + recommendation)
8. LOG (append to pattern-research-log.md)
```

### Pattern Research Log Format

```markdown
## Discovery: [Pattern Name]
Date: [date] | Method: [1-5] | Source: [tradition or input]

### Hypothesis
[Why this should be a pattern]

### Evidence
[What supports it — citations, cross-domain presence, structural reasoning]

### Draft Score
Required: X/10 | Quality: X/10 | Total: X/20

### Stress Test
Profile A: [worked/failed/adapted] — [notes]
Profile B: [worked/failed/adapted] — [notes]
Profile C: [worked/failed/adapted] — [notes]

### Verdict: [ADD / REVISE / REJECT]
[If rejected: why — was it a tip not a pattern? correlation not causation?
 domain-specific without transferable principle?]
```

---

## PROGRAM 3: STUDY (The Effectiveness Lab)

Research what makes HUMA conversations produce better outcomes.

### Research Questions

**RQ1: Phase Ordering**
Does the current phase order produce better maps than alternatives?
Experiment: Same profile, 3 orderings, score maps on completeness + coherence.

**RQ2: Question Depth vs Breadth**
For a fixed conversation length, better to go deep on fewer dimensions or broad across all?
Experiment: Deep (4 dimensions, 12 exchanges) vs Broad (8 dimensions, 12 exchanges) vs Adaptive (follow energy, 12 exchanges). Score resulting maps.

**RQ3: Enterprise Count Sweet Spot**
How many enterprise recommendations maximize value without overwhelming?
Experiment: Maps with 2, 3, 4, 5, 6 enterprises. Score on coherence, fit quality, synergy density, readability.

**RQ4: Cascade Chain Length**
Short chains (3 steps) vs long chains (6+)?
Experiment: Score on believability, link specificity, cross-capital transitions.

**RQ5: Voice Characteristics and Engagement**
Which voice characteristics correlate with longer operator responses (proxy for engagement)?
Experiment: Vary warmth/directness, questions/observations, acknowledgment/momentum. Measure synthetic operator response length.

**RQ6: QoL Statement Specificity**
How specific must QoL statements be for validation to work?
Experiment: Vague ("be healthier") → Medium ("exercise regularly") → Specific ("20 min movement before 7am, 5 days/week"). Score: is the validation question answerable in 5 seconds? Is the adjustment actionable?

**RQ7: Pattern Recommendation Accuracy**
When HUMA recommends enterprises/interventions, how well do they match the operator's actual situation?
Experiment: 10 profiles. Generate recommendations. Independently determine "correct" recommendations. Measure overlap.

**RQ8: Cross-Dimensional Insight Quality**
When HUMA identifies connections between dimensions, are they causal or merely correlated?
Experiment: 10 insights. Trace each causal chain. Is there a real mechanism?

**RQ9: Graduation Acceleration**
Which conversation patterns, operational rhythms, or review structures accelerate the four graduation capacities?
Experiment: Simulate operators with different levels of HUMA guidance (heavy prompting vs light prompting vs no prompting after Design Mode). Measure graduation score trajectory.

**RQ10: Counter-Factual Accuracy**
When the field dynamics model predicts a trajectory, how often does the simulated reality match?
Experiment: Run counter-factual predictions at week 4, then simulate through week 12 and compare predicted vs actual dimension trajectories.

**RQ11: Pattern Compilation Quality**
Does a compiled pattern (adapted to field) produce better outcomes than the generic pattern?
Experiment: Give half the simulated population compiled patterns and half generic patterns. Measure follow-through rate and capital impact.

### Study Protocol

```
1. SELECT research question (RQ1-11 or define new)
2. DESIGN experiment
   - Conditions (2+)
   - Metric (mechanically scorable)
   - Profiles (3+ diverse)
   - Confounders (what else could explain the result?)
3. RUN — generate all conditions for all profiles, score all outputs
4. ANALYZE — best condition, meaningful difference, confounders, surprises
5. CONCLUDE — finding with mechanism, or null result with interpretation
6. APPLY — if actionable, propose specific change, use TUNE to implement
7. LOG — append to effectiveness-research-log.md
```

### Effectiveness Research Log Format

```markdown
## Study: [RQ#] — [Title]
Date: [date]

### Design
Conditions: [list]
Metric: [what's measured]
Profiles: [descriptions]

### Results
| Condition | Prof A | Prof B | Prof C | Mean |
|-----------|--------|--------|--------|------|
| [name]    | [score]| [score]| [score]| [X]  |

### Finding
[One sentence. Mechanism if known.]

### Applied?
[Yes — change: ... | No — observational only]
```

---

## PROGRAM 4: SIMULATE (The Civilization Lab)

Simulate diverse human lives being lived through HUMA's full arc
(Design → Operate → Evolve) and mine the aggregate for emergent
knowledge.

This program PRODUCES knowledge that doesn't exist yet. Not optimization.
Not extraction from books. New knowledge from simulated practice at
population scale.

### Synthetic Operator Profile

Each simulated life gets:
```yaml
# Identity
name: string
age: integer
location: string
archetype: string  # building | rebuilding | maintaining | exploring | transitioning | recovering

# Situation (8 dimensions, scored 1-5)
dimensions:
  identity: integer
  purpose: integer
  body: integer
  home: integer
  growth: integer
  money: integer
  people: integer
  joy: integer

# Behavioral Profile
communication_style: string    # reflective | direct | scattered | guarded | verbose
response_to_stress: string     # withdraw | push-harder | seek-help | deny | analyze
openness_to_change: float      # 0-1
follow_through_rate: float     # 0-1 (% of commitments actually executed)
life_disruption_probability: float  # 0-1 (chance per month of unplanned event)
```

### The Disruption Library

Real lives don't follow plans. Each simulated month rolls for:
```yaml
disruptions:
  - type: "financial_shock"     # car repair, medical bill, client non-payment
    probability: 0.15
    severity: [1, 5]
  - type: "health_event"        # illness, injury, exhaustion
    probability: 0.10
    severity: [1, 4]
  - type: "relationship_shift"  # conflict, new connection, loss
    probability: 0.10
    severity: [1, 5]
  - type: "opportunity"         # job offer, creative breakthrough, invitation
    probability: 0.10
    impact: [1, 5]
  - type: "seasonal_change"     # weather, school schedule, holiday disruption
    probability: 0.20
    severity: [1, 3]
```

### Simulation Protocol

#### Phase 1: Design Mode (run once per operator)
Run the full 6-phase conversation with the synthetic profile providing
responses consistent with their behavioral profile. Produces a Living Canvas.

#### Phase 2: Operate Mode (simulate 12 weeks per operator)
For each week:

**Monday — Generate reality:**
- Roll for disruptions
- Determine follow-through on last week's commitments
   (follow_through_rate ± 0.15 random variance)
- Update dimension scores (each can shift ±0.5 per week based on
   actions taken, disruptions, and cascading effects)

**Sunday — Weekly Review:**
- Feed HUMA the week's reality
- HUMA runs QoL validation, identifies dimension shifts, suggests adjustment
- Record: what HUMA recommended vs what would actually help vs gap

**Monthly — Aggregate:**
- Dimension trajectories
- QoL achievement rates
- Enterprise viability
- Pattern effectiveness

#### Phase 3: Evolve Mode (seasonal review at week 12)
- Capital profile shift
- QoL trends
- Enterprise actuals vs projections
- Evolution Question
- Canvas update

### Population Design (50 Operators)

Cover by archetype (balanced):
- 10 Building, 10 Rebuilding, 8 Maintaining, 8 Exploring,
   7 Transitioning, 7 Recovering

Cover by context:
- 15 land operators, 15 career-focused, 10 life-transition, 10 mixed

Cover by behavioral range:
- follow_through_rate: 0.3 to 0.9
- disruption_probability: 0.1 to 0.5
- openness_to_change: 0.2 to 0.9
- All communication styles and stress responses represented

Every dimension must have at least 5 operators in crisis (1-2)
and 3 at strength (4-5). No operator has all dimensions at the same level.

### What to Mine

#### 1. Emergent Patterns
Actions that recur across diverse situations without being in the seed library.
These are DISCOVERED through practice, not derived from theory.

#### 2. Cascade Validation
Trace whether predicted cascade chains (A → B → C) actually manifest.
Discover prerequisites and failure conditions empirically.

#### 3. Dimension Co-occurrence
Which dimensions move together, how fast, in which direction, and
what the coupling strength is.

#### 4. Enterprise Viability by Context
Which combinations succeed for which archetypes. What prerequisites
must be in place. What failure modes are most common.

#### 5. Churn Point Identification
Where simulated operators disengage. What triggers it. What prevents it.

#### 6. RPPL Grammar Rules
Not patterns — rules about how patterns compose:
- Maximum pattern load per week before follow-through collapses
- Minimum dimension score for a pattern in that dimension to succeed
- Optimal ratio of maintenance to growth patterns per archetype
- Whether pattern conflicts are bidirectional or asymmetric
- Optimal dimension reading order for universal users

### Running a Population Study

Phase 1: Build population (1 session — create 50 profiles)
Save to: docs/research/synthetic-population/profiles/

Phase 2: Run Design Mode (5 sessions — 10 operators each)
Save to: docs/research/synthetic-population/{name}/canvas.md

Phase 3: Run Operate Mode (10 sessions — 5 operators × 12 weeks each)
Save to: docs/research/synthetic-population/{name}/weekly-log.tsv

Phase 4: Aggregate Analysis (2-3 sessions)
Save to: docs/research/population-study-findings.md

Phase 5: Apply (ongoing)
Each finding becomes: a new pattern, a prompt improvement, a product insight,
or a grammar rule.

---

## HOW THE FOUR PROGRAMS CONNECT

```
SIMULATE generates population-scale evidence
  → coupling data feeds the FIELD DYNAMICS MODEL
  → emergent patterns feed DISCOVER
  → adaptation data feeds LIVING PATTERN EVOLUTION
  → engagement data feeds STUDY
  → trajectory data feeds the COUNTER-FACTUAL ENGINE

STUDY discovers what makes HUMA effective
  → findings feed TUNE (improve prompts)
  → gaps feed DISCOVER (missing patterns)
  → graduation findings shape the GRADUATION ENGINE
  → effectiveness data validates the FIELD DYNAMICS MODEL

DISCOVER creates new knowledge artifacts
  → patterns need compilation testing (PATTERN COMPILER)
  → patterns need population validation (SIMULATE)
  → transformers enable novel pattern generation
  → evolved patterns update the library (LIVING EVOLUTION)

TUNE improves measurable output quality
  → better prompts improve simulation quality (SIMULATE)
  → compiler output quality is tunable (PATTERN COMPILER)
  → quality improvements studied for mechanism (STUDY)
```

The researcher is the medium studying itself.

---

## INVOCATION

```
/huma-researcher tune
  Capability: Voice Adherence
  Iterations: 20

/huma-researcher discover
  Method: Source Tradition Mining
  Source: Carol Sanford — The Regenerative Life
  Target: 3 patterns minimum

/huma-researcher discover
  Method: Cross-Domain Translation
  Pattern: rppl:operations:production-batching:v1
  Target domains: parenting, finance, health

/huma-researcher discover
  Method: Structural Gap Analysis

/huma-researcher discover
  Method: Cascade Discovery
  Outcome: "Financial stability without anxiety"

/huma-researcher study
  Question: RQ3 (Enterprise Count Sweet Spot)
  Profiles: Sarah Chen, Maya Okafor, James (skeptic)

/huma-researcher discover
  Method: Transformer Analysis
  Pattern: rppl:operations:production-batching:v1
  Domain pair: agriculture ↔ creative-work

/huma-researcher study
  Question: RQ9 (Graduation Acceleration)

/huma-researcher study
  Question: Custom — "Does referencing the operator's exact words
   in enterprise fit narratives increase perceived relevance?"

/huma-researcher simulate
  Phase: build-population
  Count: 50

/huma-researcher simulate
  Phase: design-mode
  Operators: 1-10

/huma-researcher simulate
  Phase: operate-mode
  Operator: maya-okafor
  Weeks: 12

/huma-researcher simulate
  Phase: aggregate
  Focus: emergent-patterns

/huma-researcher simulate
  Phase: aggregate
  Focus: field-dynamics        # Estimate dimensional coupling matrix

/huma-researcher simulate
  Phase: aggregate
  Focus: graduation-signals    # Which patterns/behaviors predict graduation readiness

/huma-researcher simulate
  Phase: aggregate
  Focus: counter-factuals      # Test "what if" scenarios against population data

/huma-researcher simulate
  Phase: aggregate
  Focus: pattern-evolution     # Track how patterns mutate across the population

/huma-researcher simulate
  Phase: aggregate
  Focus: transformers          # Discover cross-domain mechanisms from population data
```

---

## THE META-PRINCIPLE

HUMA is a living medium that predicts, adapts, evolves, and graduates its users. The researcher is how the medium studies itself.

Four programs generate knowledge: TUNE optimizes what exists. DISCOVER finds what's missing. STUDY understands what works. SIMULATE produces knowledge that doesn't exist yet.

Six innovations emerge from this research: the pattern compiler makes knowledge executable. Transformer discovery makes RPPL generative. The field dynamics model makes HUMA predictive. The graduation engine makes HUMA developmental. Living pattern evolution makes the library alive. The counter-factual engine answers the question every human carries.

Every other AI tool consumes existing knowledge. HUMA produces new knowledge — through simulation, through practice, and through the accumulated wisdom of every life lived through it.
