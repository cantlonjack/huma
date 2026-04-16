# Build Plan: Typed RPPL Graph & Compressed Life Context

## What We're Taking From WeaveMind

Not the platform. The design principles:

1. **Typed ports** — every node has defined inputs and outputs, enabling composability and compile-time verification
2. **Recursive foldability** — any sub-graph collapses to a single node with its interface visible. Zoom in/out at any level.
3. **Compression for AI context** — design primitives that carry maximum semantic weight in minimum tokens, so Claude can reason about the whole system at once
4. **Graph-as-intelligence** — the typed graph of connections IS the system, not a visualization of it. Gaps, conflicts, and integrity are properties of the graph itself.
5. **Standard interfaces** — every node exposes the same contract (/action, /health, /outputs). Applied to RPPLs: what to do, how am I doing, what has this produced.

What we're NOT taking: Kubernetes, sidecars, Rust compilation, pipeline orchestration. HUMA is a consumer product, not an infrastructure platform.

---

## The Core Problem This Solves

HUMA's central challenge: give Claude enough context about someone's entire life to make intelligent, connected recommendations — within a finite token budget.

Current state:
- Context serialization (`contextForPrompt()`) produces 500-1,500 tokens of prose
- Conversation history ships uncondensed at 1,500-3,500 tokens
- Sheet compilation costs 6,500-12,500 tokens total
- RPPLs have no typed interfaces — they're prose descriptions, not composable nodes
- No way to verify that a recommended practice actually connects to the user's aspirations through a valid chain
- No way for Claude to "see" the whole life graph at once

Target state:
- Compressed life-graph encoding: entire life in ~200 tokens (folded), relevant domain in ~500 tokens (unfolded)
- RPPLs have typed ports: inputs (prerequisites), outputs (effects on capitals/dimensions)
- Graph verification: before recommending a practice, the system can check prerequisites, connections, and conflicts
- Claude can reason about the WHOLE life graph, not just the currently-relevant slice

---

## Phase 1: Typed RPPL Ports

### What changes

Add input/output port definitions to every RPPL seed. This makes RPPLs composable — you can verify that one practice's outputs satisfy another's inputs, and that a recommended practice actually connects to the user's aspirations.

### Type changes (`app/src/data/rppl-seeds/types.ts`)

```typescript
// Port types — what flows between RPPLs
export type PortType =
  | "dimension"     // body, people, money, home, growth, joy, purpose, identity
  | "capital"       // financial, material, living, social, intellectual, experiential, spiritual, cultural
  | "capacity"      // awareness, honesty, care, agency, humility
  | "state"         // sleep_quality, stress_level, energy, focus, mood
  | "resource"      // time, money, attention, social_support
  | "boolean";      // binary prerequisites (has_outdoor_access, has_partner, etc.)

export interface RpplPort {
  name: string;           // Human-readable: "Morning sunlight access"
  portType: PortType;     // What category of data flows here
  key: string;            // Machine key: "morning_light_access"
  required?: boolean;     // Default true for inputs, always true for outputs
  description?: string;   // What this port means in context
}

// Add to RpplSeed interface:
export interface RpplSeed {
  // ... existing fields ...

  // ─── Ports (typed I/O for composability) ───
  inputs?: RpplPort[];    // What this RPPL requires to function
  outputs?: RpplPort[];   // What this RPPL produces when practiced
}
```

### Example: Cold Exposure Practice (future)

```typescript
{
  rpplId: "rppl:practice:cold-exposure:v1",
  inputs: [
    { name: "Physical readiness", portType: "state", key: "physical_readiness", required: true },
    { name: "Time available", portType: "resource", key: "time_5min", required: true },
    { name: "Water access", portType: "boolean", key: "cold_water_access", required: true },
    { name: "Awareness capacity", portType: "capacity", key: "body_awareness", required: false },
  ],
  outputs: [
    { name: "Physical resilience", portType: "capital", key: "living" },
    { name: "Discipline", portType: "state", key: "discipline" },
    { name: "Stress tolerance", portType: "state", key: "stress_tolerance" },
    { name: "Vagal tone", portType: "state", key: "vagal_tone" },
  ],
}
```

### Example: Framework ports (Stoicism)

```typescript
{
  rpplId: "rppl:framework:stoicism:v1",
  inputs: [
    { name: "Awareness", portType: "capacity", key: "awareness", required: true },
    { name: "Agency", portType: "capacity", key: "agency", required: true },
    { name: "Honesty", portType: "capacity", key: "honesty" },
  ],
  outputs: [
    { name: "Emotional regulation", portType: "state", key: "emotional_regulation" },
    { name: "Resilience", portType: "capital", key: "spiritual" },
    { name: "Decision clarity", portType: "state", key: "decision_clarity" },
  ],
}
```

### Implementation

1. Add port types to `types.ts`
2. Add `inputs`/`outputs` to existing axiom, capacity, framework, and principle seeds
3. Ports are optional on RpplSeed — additive, non-breaking
4. Build verification after each file

### Files affected
- `app/src/data/rppl-seeds/types.ts` — add PortType, RpplPort, extend RpplSeed
- `app/src/data/rppl-seeds/axioms.ts` — add outputs (what each axiom reveals)
- `app/src/data/rppl-seeds/capacities.ts` — add outputs (what each capacity enables)
- `app/src/data/rppl-seeds/frameworks.ts` — add inputs (capacities required) + outputs (what framework produces)
- `app/src/data/rppl-seeds/principles.ts` — add outputs (what believing this produces)

---

## Phase 2: Compressed Life-Graph Encoding

### The problem

Current `contextForPrompt()` produces 500-1,500 tokens of prose. This is the DYNAMIC portion (not cached). Combined with conversation history (1,500-3,500 tokens uncondensed), every prompt burns 2,000-5,000 tokens on context before Claude starts thinking.

The WeaveMind insight: design primitives that compress an entire system's state into far fewer tokens. If HUMA's life graph had a compressed encoding, Claude could see EVERYTHING in ~200 tokens and unfold only what's relevant.

### The encoding design

Three compression levels:

**Level 0: Folded (~200 tokens)**
Entire life state. Claude sees the whole picture.

```
LIFE[d42 a5 p3]
 WHY:"Build regenerative systems that compound"
 CAP[aw:3 ho:3 ca:4 ag:3 hu:2]
 body[3.2] sleep:6.5h ⚠️circadian-misaligned | people[4.1] household:stable | money[2.8] ⚠️debt-active
 home[3.5] rural-5ac | growth[4.0] | joy[2.1] ⚠️dormant-12d | purpose[4.3] | identity[3.8]
 ASP:PhysicalResilience[72%↑] ASP:RegenerativeFarm[58%→] ASP:FinancialSovereignty[41%↓] ASP:DeepRelationships[88%↑] ASP:IntellectualDepth[65%→]
 ⚠️FLAGS: joy-dormant, money-declining, circadian-misaligned
```

Key: `d42`=day count, `a5`=5 aspirations, `p3`=3 active patterns. Capital scores 1-5. Arrows show 7-day trend. Flags surface what needs attention.

**Level 1: Aspiration-expanded (~500 tokens)**
One aspiration unfolded with its practices and evidence.

```
ASP:PhysicalResilience[72%↑ d42]
 PRIN:body-light-system → PRIN:terrain-not-defense → PRIN:timing-matters
 ├─ PRC:sunrise-walk daily 18/21 ✓morning-locked ↑trending
 │   in[time:20min outdoor:✓ energy:morning] out[living++ circadian-align]
 ├─ PRC:cold-exposure daily 14/21 ⚠️travel-disrupted
 │   in[physical:✓ time:5min water:✓] out[living+ discipline+ vagal+]
 ├─ PRC:zone2-cardio 3x/wk 8/9 ✓schedule-locked
 │   in[time:45min energy:moderate] out[living++ experiential+]
 └─ PATTERN: schedule-adherence→completion (strong, 21d, r=0.84)
 GAP: no evening wind-down practice (circadian flag unaddressed)
```

**Level 2: Practice-expanded (~1000 tokens)**
Specific practice with full behavioral evidence and RPPL provenance.

```
PRC:cold-exposure[rppl:practice:cold-exposure:v1]
 AXIOM: natural-law.polarity (effort↔rest, stress↔adaptation)
 PRINCIPLE: "Appropriate stress is an input, not a threat"
 FRAMEWORK: antifragility (hormesis), terrain-theory (terrain-building)
 CAPACITY-REQ: awareness(body-state), agency(voluntary-discomfort)

 TRIGGER: "After morning walk, before coffee"
 STEPS: 1.cold-water-face 2.cold-shower-30s 3.extend-10s-weekly
 WINDOW: 6:30-6:35am

 EVIDENCE[21d]:
  completion: 14/21 (67%) status:working
  pattern: drops on travel-days (5/5 misses = travel)
  correlation: cold-days → energy↑ (+0.4σ vs non-cold-days)
  capital-effect: living 2.8→3.2 over 21d
  
 PROVENANCE: terrain-theory + antifragility, validated N=1
 CONTRAINDICATION: skip if illness, Raynaud's, or <5h sleep prior night
```

### Implementation

Create `app/src/lib/context-encoding.ts`:

```typescript
export type CompressionLevel = "folded" | "aspiration" | "practice";

export function encodeLifeGraph(
  context: HumaContext,
  aspirations: Aspiration[],
  behaviors: BehaviorLog[],
  patterns: Pattern[],
  level: CompressionLevel,
  focusId?: string, // aspiration or practice to unfold
): string { ... }
```

Update `app/src/lib/services/prompt-builder.ts`:
- Replace `contextForPrompt()` call with `encodeLifeGraph()` at appropriate compression level
- Chat mode: Level 0 (folded) + Level 1 for relevant aspiration (based on tab context)
- Sheet compilation: Level 0 + all aspirations at Level 1
- Conversation history: summarize older messages, keep recent 5 in full

### Token budget targets

| Component | Current | Target | Savings |
|-----------|---------|--------|---------|
| Context prose | 500-1,500 | 150-300 (folded) | 60-80% |
| Aspiration detail | 800-2,000 | 400-600 (1 expanded) | 50-70% |
| Conversation history | 1,500-3,500 | 500-800 (summarized) | 60-75% |
| Sheet template | 3,500-4,500 | 2,000-2,500 (compressed) | 35-45% |
| **Total (chat)** | **5,500-11,500** | **2,000-4,000** | **55-65%** |
| **Total (sheet)** | **6,500-12,500** | **3,000-5,000** | **50-60%** |

This doesn't just save money — it lets Claude reason about MORE of the person's life within the same token budget. The quality of recommendations improves because Claude sees the whole graph, not a slice.

### Files affected
- `app/src/lib/context-encoding.ts` — NEW: compressed encoding engine
- `app/src/lib/services/prompt-builder.ts` — integrate compressed encoding
- `app/src/lib/services/sheet-service.ts` — use compressed context in sheet prompts

---

## Phase 3: Graph Verification Engine

### What this enables

Before recommending an RPPL, before compiling a daily sheet, before suggesting a new practice — verify the graph:

1. **Port satisfaction**: Does the user meet the inputs? (capacity levels, resource availability, physical prerequisites)
2. **Connection integrity**: Does every aspiration connect to at least one daily behavior through an RPPL chain?
3. **Gap detection**: Which aspirations have unconnected ports? Which capitals have no active practices feeding them?
4. **Conflict detection**: Are two practices competing for the same resource (time slot, energy, attention)?
5. **Orphan detection**: Are there practices with no connection to any aspiration? (zombie habits)

### Implementation

Create `app/src/lib/graph-verification.ts`:

```typescript
export interface GraphVerification {
  integrity: "valid" | "gaps" | "conflicts";
  unconnectedAspirations: string[];     // aspirations with no behavioral pathway
  unsatisfiedInputs: PortViolation[];   // practices whose prerequisites aren't met
  conflicts: PortConflict[];            // practices competing for same resource
  dormantCapitals: string[];            // capitals with no active practice feeding them
  orphanPractices: string[];            // practices connected to nothing
  suggestions: GraphSuggestion[];       // what to fix, ordered by impact
}

export function verifyLifeGraph(
  aspirations: Aspiration[],
  activePractices: Pattern[],
  rpplSeeds: RpplSeed[],
  context: HumaContext,
  capacityState: CapacityState,
): GraphVerification { ... }
```

### Where verification surfaces

- **Sheet compilation**: flag unconnected aspirations, suggest practices that would close gaps
- **Conversation engine**: when user adds a new aspiration, check what RPPLs would connect it to daily behavior
- **/whole page**: graph visualization shows connected (solid) vs unconnected (dashed) edges
- **/grow page**: gap cards showing "This aspiration has no daily practice yet"

### Files affected
- `app/src/lib/graph-verification.ts` — NEW: verification engine
- `app/src/lib/services/sheet-service.ts` — use verification to inform sheet compilation
- `app/src/lib/services/prompt-builder.ts` — inject verification summary into prompts

---

## Phase 4: RPPL Standard Interface

### The pattern

Every RPPL, at runtime, should answer three questions:

| Interface | Question | Implementation |
|-----------|----------|----------------|
| `/action` | What should I do today? | Sheet compilation for active practices |
| `/health` | Am I on track? | Pattern validation status (finding/working/validated) |
| `/outputs` | What has this produced? | Capital effects, behavioral evidence, trend data |

This isn't a literal HTTP API — it's a data contract that each active RPPL fulfills through existing systems:

- **Action**: the daily sheet already generates this (5 entries/day from active practices)
- **Health**: pattern validation already tracks this (completion rate, 30-day window)
- **Outputs**: capital computation already computes this (capital scores from behavioral data)

### What changes

Formalize these as typed functions that any component can query:

```typescript
// app/src/lib/rppl-interface.ts

export function getRpplAction(rpplId: string, context: HumaContext, date: string): RpplAction | null;
export function getRpplHealth(rpplId: string, patterns: Pattern[]): RpplHealth;
export function getRpplOutputs(rpplId: string, behaviors: BehaviorLog[], window: number): RpplOutputs;
```

### Where this surfaces
- Pattern cards on /grow show health + outputs
- Sheet entries link to the RPPL they came from
- Compressed encoding uses health/outputs for status indicators (✓, ⚠️, ↑, ↓)

---

## Phase 5: Context Model — CapacityState

### What changes

Add capacity tracking to the user's persistent profile. This is the "soil measurement" that determines what frameworks can take root.

### Type changes (`app/src/types/context.ts`)

```typescript
export type CapacityLevel = "undeveloped" | "emerging" | "developing" | "strong";

export interface CapacityState {
  awareness: CapacityLevel;
  honesty: CapacityLevel;
  care: CapacityLevel;
  agency: CapacityLevel;
  humility: CapacityLevel;
  _assessedAt?: string;      // ISO timestamp of last assessment
  _assessedFrom?: string;    // "conversation" | "behavioral" | "self-report"
}
```

Add to HumaContext:
```typescript
export interface HumaContext {
  // ... existing dimensions ...
  capacityState?: CapacityState;
}
```

### How capacities are assessed

Not self-report (unreliable). Inferred from behavioral signals:

| Capacity | Signal | Source |
|----------|--------|--------|
| Awareness | Can describe what happened vs. story about it | Conversation analysis |
| Honesty | Self-report matches behavioral data | Check-off data vs. stated habits |
| Care | Consistent engagement over time | Aspiration activity, return rate |
| Agency | "I choose" vs "I have to" language | Conversation analysis |
| Humility | Updates beliefs when shown contradicting data | Response to data mirrors |

Initial implementation: Claude assesses during conversation, outputs via `[[CONTEXT:{"capacityState":{...}}]]` marker. Later: automated assessment from behavioral data.

### Files affected
- `app/src/types/context.ts` — add CapacityState, extend HumaContext
- `app/src/lib/context-model.ts` — handle capacityState in merge/serialize
- `app/src/lib/services/prompt-builder.ts` — include capacity awareness in prompts

---

## Implementation Order

| Phase | Scope | Dependencies | Estimated Effort |
|-------|-------|-------------|------------------|
| **1: Typed Ports** | Data layer only | None (additive) | Medium — add ports to 96 seeds |
| **2: Compressed Encoding** | Lib + prompt builder | Phase 1 (uses port data) | Large — new encoding engine |
| **3: Graph Verification** | Lib + prompt builder | Phase 1 + 2 | Medium — verification functions |
| **4: RPPL Interface** | Lib layer | Existing sheet/pattern systems | Small — formalize existing logic |
| **5: CapacityState** | Types + context model | Phase 1 (capacity ports) | Medium — new context dimension |

**Recommended sequence**: 1 → 5 → 2 → 4 → 3

Rationale:
- Phase 1 (ports) is purely additive, enables everything else
- Phase 5 (capacity state) is small and high-value — enables capacity-aware prompts immediately
- Phase 2 (compression) is the highest-impact change for prompt quality
- Phase 4 (interface) formalizes existing functionality
- Phase 3 (verification) is the capstone — requires all other pieces

---

## What This Means for the Product

After all five phases, HUMA's architecture shifts:

**Before**: RPPLs are prose descriptions. Context is a serialized blob. Recommendations are generated from incomplete views. The life map is a visualization.

**After**: RPPLs are typed nodes with defined I/O. Context is a compressed, foldable graph that Claude can see whole. Recommendations are verified against the graph before delivery. The life map IS the system — gaps, conflicts, and integrity are computable properties.

The user never sees any of this machinery. They see: better recommendations, fewer irrelevant suggestions, clearer explanations of WHY, and a life map that actually reveals where the gaps are.
