# HUMA Onboarding Redesign v2 — The Lotus Flow

## Based On

Jack's original HUMA Guide wireframes (27 screens). This spec covers Screens 1-11: the 90-second first pass that produces WHOLE 1.0 → synthesis → WHOLE 2.0 evolution.

## The Design Principle

The system GIVES before it ASKS. Every 3-4 screens, the user receives a visual reward or synthesis. By screen 9, the system has already reflected back who they are — archetype, stage, strengths, growth areas. The user is SEEN before they're asked to go deeper.

This REPLACES the current Shape Builder at `/begin`. The existing Shape Builder code is deprecated. Capital values are now editable directly in the workspace — there is no separate daily slider ritual.

## What Changes

| What | Before | After |
|------|--------|-------|
| Entry route | `/begin` → 8-card Shape Builder | `/begin` → 11-screen Lotus Flow |
| Data captured | 8 dimension ratings (1-5) | Entity type, governance, 8 capital sliders, archetype, stage |
| AI input | 8 numbers | Rich context object (type, sub-type, governance, capitals, archetype, stage) |
| First output | Generic structural insight | Archetype synthesis + compiled pattern recommendation |
| Visual artifact | Radar chart | WHOLE (evolving organic 3D form) + Regenerative Wealth flower |
| Progressive depth | Shape Builder → Daily Pulse → One-Thing → Map | Lotus Flow → Context Deepening → One-Thing → Behavior + Design → Full Depth |

## Read Before Building

- `docs/HUMA_DESIGN_SYSTEM.md` — visual system (colors, fonts, spacing)
- `docs/HUMA_VOICE_BIBLE.md` — voice and tone. **Every word of on-screen copy must pass the Voice Bible.** No cheerleading, no flattery, no hedging.
- `docs/HUMA_PRODUCT_SURFACE.md` — product context, progressive depth
- `docs/HUMA_PATTERN_LIBRARY.md` — the 12 seed patterns available for first recommendation
- `/mnt/skills/public/frontend-design/SKILL.md` — design quality bar

## MVP Scope vs. Future

**BUILD NOW (this spec):**
- 11-screen flow with Person path fully functional
- Capital spectrum sliders (8 forms)
- Regenerative Wealth flower visualization (SVG)
- Archetype inference + synthesis screen
- WHOLE visualization: start with sophisticated ANIMATED SVG (parametric curves/wireframe). Three.js 3D can come later — don't let the visualization block the flow.
- First pattern recommendation via Claude AI (using context + seed patterns)
- Lotus nav (visible, tracks progress, only WHOLE/WHO/WHAT active for now)
- Persist onboarding state to localStorage before auth (no data loss on browser close)
- Auth trigger after pattern recommendation: "Save your progress →" → magic link → /home

**BUILD LATER:**
- Group / Place / Enterprise paths (conditional branching exists in UI but routes to "Coming soon")
- Full RPPL commons browser
- WHOLE as Three.js 3D with shader-based evolution
- Remaining lotus petals (context through evolve)
- Community signals, geographic context layer

---

## The Flow: 11 Screens, 90 Seconds

Three phases mapping to the first three petals of the lotus:

```
Phase 1: WHOLE  (Screens 1-5, ~30 sec) — What ARE you?
Phase 2: WHO    (Screen 6, ~10 sec)    — Who decides?
Phase 3: WHAT   (Screens 7-11, ~50 sec) — What do you have?
```

After Screen 11, the user has:
- Defined their entity type and sub-type
- Identified decision makers
- Mapped their capital spectrum across 7-8 forms
- Received an archetype assignment
- Been told their development stage
- Seen their strengths and growth areas identified
- Watched their WHOLE evolve twice

This is enough context for HUMA to compile an initial pattern recommendation.

---

## Phase 1: WHOLE (Screens 1-5)

### Screen 1 — "What should we call you?" + "Who or What are you?"
**Time: 5-8 seconds**

Two parts on one screen:

```
What should we call you?

[_______________]
(first name is enough)


To begin, let's define your [WHOLE 1.0]

Who or What are you?

[👤 Person]  [👥 Group]  [🗺 Place]  [🏗 Enterprise]
```

**Name input** sits above the entity selection. Auto-focus on load. The name is used throughout subsequent screens ("Nice, Jack. Next..." etc.). This makes the experience personal from the first second.

**Layout:**
- Left sidebar: the 12 lotus petals as navigation. "whole" is active with a progress bar. All others listed but dimmed: who, what, context, purpose, vision, behavior, nurture, validate, design, install, evolve. Each petal has a unique icon matching Jack's wireframes.
- Main panel: name input + question + 4 entity cards (2x2 grid)
- Top bar: HUMA wordmark + tool icons (for MVP: only HUMA logo and help icon active; others visible but inactive/greyed)
- Bottom right: help icon (active), others placeholder

**Card style:**
- Each entity card: ~100px square, white background, rounded-xl (16px), subtle sand-300 border
- Contains: illustrated icon (NOT emoji — organic HUMA illustration style, teal/sage tones, field-journal sketch feel) + label below in Source Sans 3, 0.85rem, weight 500
- Selected state: border becomes sage-500, subtle sage-50 fill, scale 1.02
- Single-select

**Entity types and MVP status:**
- **Person** → FULLY BUILT. Individual life design. The primary path.
- **Group** → Visible but tapping shows: "Coming soon. Start as a Person — you can add your group later." Links to Person.
- **Place** → Same "coming soon" treatment.
- **Enterprise** → Same "coming soon" treatment.

This preserves the holonic architecture (the system CAN hold any entity type) without blocking launch on building four paths.

**What this gives the AI:** Name (personalization) + entity type (Person for MVP → determines capital framework, archetype pool, and pattern domain).

---

### Screen 2 — Conditional Branch (Person Path)
**Time: 5 seconds**

For Person, this screen captures life situation (replacing the enterprise sub-typing):

```
Nice, Jack. Which feels closest to where you are?

[🌱 Just starting out]    [🔄 In transition]
[🏗 Building something]   [🔍 Searching]
```

Four cards, 2x2 grid. Single-select. Each one maps to a development stage that narrows the pattern library:

- **Just starting out** → pre-seed stage. Foundation patterns. "Where do I begin?"
- **In transition** → seed stage. Change patterns. "I'm between things."
- **Building something** → growth stage. Scaling patterns. "I have momentum but need structure."
- **Searching** → exploration stage. Clarity patterns. "I know something needs to change."

**For Group/Place/Enterprise (future):** This screen shows relevant sub-types (for-profit/non-profit/DAO for Enterprise, etc.) as designed in the wireframes. The conditional branching architecture exists — only the Person path is built for MVP.

**What this gives the AI:** Development stage. Combined with entity type, this determines the DEPTH and URGENCY of pattern recommendations. "Just starting out" gets simple, low-cost, immediate patterns. "Building something" gets optimization and scaling patterns.

---

### Screen 3 — First Component
**Time: 2-3 seconds (auto-advances after 2s, or tap to continue)**

```
Your first building block.

Everything in HUMA is a component.
You can always change this.

[🧊 component icon]
```

**The HUMA building block (cube/hexagonal icon) appears.** This introduces the atomic unit concept. The copy is spare — no "Congratulations!" (Voice Bible: no cheerleading). Just a calm statement of what happened and the sovereignty signal that nothing is locked.

**Design note:** Brief animation of the component fading in + subtle scale from 0.9 to 1.0 (400ms, HUMA easing). Warm, not loud.

---

### Screen 4 — Canvas Introduction
**Time: 3-4 seconds**

```
As you progress through the HUMA Framework,
your context will evolve and be represented here.
```

An EMPTY canvas area appears in the main panel with a small box (the component from Screen 3) connected by a line to the upper-right corner where the WHOLE visualization will live.

**This sets the expectation:** your WHOLE will grow. The canvas is a living thing. Right now it's nearly empty — but it won't be for long.

---

### Screen 5 — WHOLE 1.0: Shape Born
**Time: 4-5 seconds**

```
[WHOLE 1.0]

[organic wireframe visualization]
```

The WHOLE 1.0 appears — an organic, parametric wireframe form. NOT a radar chart. A mathematical surface (butterfly/shell/toroidal form) rendered in fine lines, sage/teal tones.

**Animation:** The form draws itself — lines appearing in sequence over 1.5-2 seconds, creating the sense of emergence. The shape should feel alive and mathematical simultaneously.

**This is the first major reward.** The user made 2-3 selections and something beautiful was born from them. It's uniquely theirs (the shape parameters are derived from their entity type + sub-type). It's unfamiliar and intriguing.

**Technical note:** The WHOLE visualization should be a procedurally generated 3D form (Three.js or similar, or a sophisticated SVG). The parameters are seeded by the user's selections. Different entity types produce different base forms. The form evolves in later screens as more context is added.

---

## Phase 2: WHO (Screen 6)

### Screen 6 — Who's in the picture?
**Time: 5-10 seconds**

For Person path:

```
Who else is part of your picture, Jack?

[👤 Just me]  [👤+ Add someone]
```

**The WHOLE 1.0 shape appears SMALL in the upper-right corner** — it's now a persistent element that travels with the user through all subsequent screens. It will grow and evolve.

"Just me" = solo context → independent patterns, solo scheduling
"Add someone" = partner, co-parent, business partner, housemate → opens a simple "Who?" input (name + relationship: partner / family / collaborator / other). Multiple people can be added. Each is a component.

**The framing is "who's in the picture" not "who are the decision makers."** For a Person, this captures the relational field — who else matters in their system. A single person with a partner and two kids gets different time patterns than a solo individual.

**For Enterprise (future):** This becomes "Who are the decision makers?" as shown in the wireframes.

**What this gives the AI:** Relational context. Solo vs. partnered vs. family fundamentally changes which patterns work and how time/resources are allocated.

---

## Phase 3: WHAT (Screens 7-11)

### Screen 7 — Capital Spectrum Assessment
**Time: 20 seconds**

```
Quick snapshot of your resources, Jack.
This doesn't need to be exact.

FINANCIAL    [█████░░░░░░░]
MATERIAL     [████████░░░░]
LIVING       [██████████░░]
SOCIAL       [████████████]
EXPERIENTIAL [██░░░░░░░░░░]
INTELLECTUAL [███████░░░░░]
SPIRITUAL    [██████░░░░░░]
CULTURAL     [███████░░░░░]
```

**Eight sliders — one per form of capital.** This aligns with the 8 Forms of Capital framework (Roland & Landua):

| Capital | What it means (not shown to user — just for AI context) |
|---------|--------------------------------------------------------|
| Financial | Money, income streams, savings, debt |
| Material | Physical assets, tools, equipment, shelter, land |
| Living (Natural) | Health, energy, natural resources, land health |
| Social | Relationships, trust, community, network |
| Experiential | Skills learned through doing, lived wisdom |
| Intellectual | Knowledge, education, ideas, mental frameworks |
| Spiritual | Purpose, meaning, connection to something larger |
| Cultural | Identity, heritage, traditions, belonging |

**Each slider is a COLOR SPECTRUM bar:** Red (left/low) → Orange → Yellow → Green (right/strong). 10 tappable segments — tap anywhere on the bar to set the level. NOT numbered 1-10. The COLOR communicates: red = scarce/urgent, green = strong/abundant.

**The WHOLE shape continues to live in the upper-right corner.**

**Layout:**
- Each row: Capital icon (small, ~24px, organic illustration in HUMA style) + capital name label (Source Sans 3, 0.8rem, weight 500, ink-700, uppercase, letter-spacing 0.1em) + spectrum bar (flex-grow, height 28px, rounded-lg)
- 8 rows visible on one screen. On small mobile, may need slight scroll — acceptable.
- Copy is spare: "Quick snapshot of your resources." Not "Let's try to get a quick breakdown of your full spectrum capital." (Too wordy, too clinical.)

**Technical: Spectrum bar component**
```
- Container: 100% width, height 28px, rounded-lg, sand-200 background
- 10 segments, each 10% width
- Tapping segment N fills segments 1-N with gradient:
  - Segments 1-3: red → deep orange (rose-600 → amber-600)
  - Segments 4-6: orange → yellow (amber-500 → amber-300)
  - Segments 7-9: yellow-green → green (sage-300 → sage-500)
  - Segment 10: rich green (sage-600)
- Unfilled segments: sand-200
- Transition: 200ms fill, HUMA easing
- Accessible: each segment is a button with aria-label "Financial capital level N of 10"
```

**What this gives the AI:** Quantified capital profile across all 8 dimensions. Combined with entity type, stage, and governance, this is enough to compute archetype and compile patterns., sovereignty signal

**Label names:** These are the INTERNAL names (Financial, Material, Natural, Social, Experiential, Intellectual, Spiritual). This is the "What" phase — slightly more technical than the user-facing dimension names. For the Person flow, we could alternatively show the user-facing names (Money, Home, Body, People, Joy, Growth, Purpose) — DECISION NEEDED from Jack.

**What this gives the AI:** Quantified capital profile across all dimensions. Combined with entity type + sub-type + governance, this is enough to compute an archetype and development stage.

---

### Screen 8 — Regenerative Wealth (Flower Visualization)
**Time: 5 seconds**

```
Your Regenerative Wealth

[FLOWER PETAL VISUALIZATION]
```

A FLOWER with 8 petals, each representing a form of capital. Each petal is SIZED proportionally to the slider value and COLORED with its capital color. TIME sits at the CENTER — not a slider, but a visual anchor reminding that time is the resource that connects everything.

**Petal mapping (colors from HUMA design system + extended palette):**
- Financial → amber-600 (#B5621E)
- Material → ink-500 (#6B6358) — earth/brown tone
- Living → sage-500 (#5C7A62) — green, alive
- Social → sage-300 (#8BAF8E) — lighter green, relational
- Experiential → amber-400 (#E8935A) — warm, felt
- Intellectual → sky-600 (#2E6B8A) — blue, depth
- Spiritual → sage-700 (#3A5A40) — deep green, grounding
- Cultural → rose-600 (#A04040) — identity, warm red

TIME at center: small hourglass icon, ink-400, with subtle pulse animation.

**Petal sizing:** Each petal's length is proportional to the slider value (1-10 maps to 20%-100% of max petal length). A petal at 1 is small and red-tinted. A petal at 10 is full and richly colored. The SHAPE of the flower is unique to this person.

**Animation:** Petals grow from center outward (unfurl, 1-1.5 seconds, staggered 100ms per petal, HUMA easing). The flower assembles itself.

**This is the SECOND major reward.** The user sees their capital profile as something organic and alive — not a bar chart or radar. It has beauty and asymmetry and it's THEIRS.

**Technical:** SVG flower. Each petal is a bezier-curved path, not a straight wedge. Organic shapes, slightly irregular edges. Think botanical illustration, not pie chart. The flower should feel like it grew, not like it was computed.

**The WHOLE in the corner may shift subtly** — responding to the new data, a preview of the evolution coming in screens 10-11.

---

### Screen 9 — Synthesis: HUMA Sees You
**Time: 15 seconds**

```
Here's what I see, Jack.

You're an [🌿 EARTH TENDER]

[🔍 Searching] stage.

Strongest:    [Living ●] [Social ●] [Spiritual ●]

Wanting more: [Financial] [Experiential]

[That's right]  [Adjust]
```

**THIS IS THE "HOLY SHIT" MOMENT.**

HUMA has taken: entity type, life stage, governance, and 8 capital sliders — and SYNTHESIZED:
- An **archetype** — inferred from the PATTERN of capitals, not self-reported
- Confirmation of their **stage** (from Screen 2, reflected back in context)
- **Strengths** — top 3 capitals (shown as colored dots matching petal colors)
- **Growth areas** — bottom 2 capitals (shown as labels, not red/warning — these are OPPORTUNITIES not failures)

**Voice note:** "Here's what I see" — not "Let's reflect on what we have so far!" (too cheerful, too facilitative). HUMA just says what it sees. Spare. Direct. The fence-post neighbor energy.

**"That's right" / "Adjust"** — equal weight buttons. "Adjust" opens an edit mode where they can tap to change archetype or re-do sliders. Sovereignty.

### Archetype Computation Logic

Archetypes are computed from the SHAPE of the capital profile — which capitals are high, which are low, and the ratios between them. The AI (Claude) does this computation using the following heuristics:

**For Person entity type, the archetype pool:**

| Archetype | Capital Pattern | Description |
|-----------|----------------|-------------|
| **Earth Tender** | High Living + Spiritual, lower Financial | Connected to land and meaning, building material foundation |
| **Maker** | High Material + Intellectual, any Financial | Builds things. Physical or digital. Skilled with hands or mind. |
| **Healer** | High Social + Experiential + Spiritual | Care-oriented. People come to them. Holds space. |
| **Builder** | High Financial + Material + Intellectual | Enterprise-minded. Creates systems and structures. |
| **Seeker** | High Intellectual + Spiritual, lower Material | Learning-driven. Searching for the right path. Knowledge-rich but not yet applied. |
| **Connector** | High Social, moderate across others | Community-oriented. Brings people together. Network is their capital. |
| **Pioneer** | 1-2 very high, rest low | Strong in one or two areas, starting from scratch in others. High asymmetry. |
| **Steward** | Moderate-high across most, no extreme lows | Balanced. Managing complexity. Needs optimization, not foundation. |

The AI should use these as GUIDES, not rigid categories. The archetype name and description should be adapted to the specific profile. "You're closest to an Earth Tender — strong in living systems and purpose, building your financial foundation" is better than just "Earth Tender."

**Development stage** comes from Screen 2 directly (Just starting out / In transition / Building / Searching), mapped to: pre-seed / seed / growth / exploration.

**Strengths** = top 3 capitals by slider value. If tied, prefer the capitals that are most unusual for the archetype (these represent unique advantages).

**Growth areas** = bottom 2 capitals by slider value. Framed as opportunity, never deficit.

**What this gives the AI:** A complete operator profile: name, entity type, stage, archetype, capital strengths, capital gaps, governance structure. This is the GPS data.

---

### Screen 10 — WHOLE Evolves (First Evolution)
**Time: 3 seconds**

```
Your WHOLE is changing.

[wireframe shape — DIFFERENT from WHOLE 1.0]
```

The copy is simple. Not "WHAT!? Your WHOLE is evolving!!" (too gamified, too loud — Voice Bible: spare without cold). Just: "Your WHOLE is changing." Let the visual do the talking.

The WHOLE wireframe MORPHS — same parametric style but the form has changed. New parameters from the capital data have reshaped it. More complex, more defined. The topology shifted because the system now knows more about this person.

**Animation:** The wireframe from WHOLE 1.0 smoothly transforms into the new shape over 1.5 seconds (HUMA easing). Lines reconfigure, curves deepen.

---

### Screen 11 — WHOLE Evolves (Phase Transition)
**Time: 3 seconds**

```
[organic 3D form — evolved from wireframe]
```

No text needed. The wireframe PHASE TRANSITIONS into something organic — volumetric, colored, alive. The mathematical skeleton has grown skin.

**Animation:** The wireframe dissolves/blooms into the organic form (1.5-2 seconds). The feeling: this thing is becoming real.

**MVP pragmatism for the WHOLE visualization:**

The WHOLE is technically ambitious. For MVP, implement as:

1. **WHOLE 1.0 (Screen 5):** Animated SVG. A parametric curve system (Lissajous curves, rose curves, or similar mathematical forms) drawn with fine stroke lines in sage-400/sage-500. Parameters seeded by entity type. The form should feel organic and mathematical — like a nature documentary visualization. Use SVG `<path>` elements with animated `stroke-dashoffset` for the draw-on effect.

2. **WHOLE evolution (Screen 10):** The SVG path parameters morph via CSS transitions or GSAP. New parameters derived from capital values reshape the curves. Same line-drawing style but different topology.

3. **WHOLE phase transition (Screen 11):** CSS filter transforms the line art into a glowing, soft-edged form. `filter: blur(2px)` + `opacity` layers + color overlay in sage/amber gradient. This approximates the organic 3D look without requiring Three.js. The wireframe lines become soft glowing shapes.

4. **Future (post-MVP):** Replace SVG with Three.js procedural mesh. Add proper 3D rotation, shader-based evolution, particle transitions. The data model stays the same — only the renderer changes.

**This completes the 90-second onboarding.** The user now has:
1. Given their name
2. Defined what they are (Person)
3. Identified their life stage
4. Identified who else is in their picture
5. Mapped their capital spectrum across 8 forms
6. Seen their wealth as a living flower
7. Been assigned an archetype and had their strengths/gaps identified
8. Watched their WHOLE evolve twice

---

## What Happens After Screen 11

### Screen 12 — First Insight + Pattern Recommendation

A brief loading moment (the WHOLE breathes/pulses, 2-3 seconds while Claude processes). Then:

**The insight** — 2-3 sentences max, fence-post neighbor voice:

```
Jack, you've got strong living and social capital
but financial is where the tension is. That's common
for Earth Tenders — the thing you're richest in
isn't the thing that pays the bills yet.

Here's where people in your situation usually
find the lever:
```

**The pattern card:**

```
┌─────────────────────────────────────────────┐
│  YOUR FIRST MOVE                            │
│                                             │
│  [Pattern name — compiled for this person]  │
│                                             │
│  What: [1-2 sentences, specific, doable]    │
│                                             │
│  Why you: [connects to their capital shape] │
│                                             │
│  First step: [doable THIS WEEK]             │
│                                             │
│  [Got it]  [Show me others]                 │
└─────────────────────────────────────────────┘
```

Card style: white background, sand-300 border, 4px sage-500 left border, rounded-xl. "YOUR FIRST MOVE" in Source Sans 3, 0.62rem, weight 600, uppercase, letter-spacing 0.2em, sage-500.

**AI Prompt for First Insight:**

```
You are HUMA. An operator just completed their initial context painting.

Context:
- Name: {name}
- Entity: Person
- Stage: {stage}
- Governance: {solo/partnered/family}
- Archetype: {archetype}
- Capital profile: {8 capital values, 1-10 each}
- Strongest: {top 3}
- Growth areas: {bottom 2}

Your job: deliver ONE insight (2-3 sentences) and ONE pattern
recommendation that is specific to their capital shape.

Rules:
- Use their name once, naturally.
- Name the tension between their strengths and growth areas.
- The pattern must leverage what they HAVE (strong capitals)
  to address what they NEED (weak capitals).
- The first step must be doable this week with their current
  resources.
- DO NOT say "based on what you shared" or "from your answers."
  Speak as if you simply know them.
- Voice: fence-post neighbor. Warm, direct, spare. See Voice Bible.
- Maximum: 3 sentences for insight. Pattern card format for
  recommendation.
- If you don't have enough context for a truly specific
  recommendation, say so honestly: "I'd need to know more about
  your situation to be specific. Want to keep going?"
```

The AI uses the 12 seed patterns from the Pattern Library as source material, adapting and combining them for the operator's specific context. If no seed pattern fits well, the AI generates a contextual first-step recommendation from its general knowledge, noting it hasn't been community-validated yet.

### Screen 13 — Location + Save

After the pattern card, before the user leaves:

```
One more thing — where are you, roughly?

[_______________]
(city, state, or region — helps HUMA find local patterns)

[Save my progress →]
```

Location is OPTIONAL but valuable. It enables:
- Climate zone inference → agricultural and land patterns
- Local market context → enterprise viability
- Regional regulations → cottage food laws, zoning, etc.
- Community matching (future) → find others nearby

**"Save my progress →"** triggers auth: email magic link → creates account → redirects to /home with the three-tab shell. All onboarding data persists.

**If they skip auth:** Onboarding data lives in localStorage. On next visit, HUMA recognizes them: "Welcome back, Jack. Pick up where you left off?" No data loss.

### Invitation to Continue or Return

```
Your WHOLE is just getting started.
Come back tomorrow — or keep going now.

[Continue to Context →]  [I'll be back]
```

"Continue to Context" opens the Ikigai flow (Screens 12-16 from the wireframes — Love, Good, Need). This is the SECOND session for most users, but available immediately for those with momentum.

"I'll be back" → /home (if authenticated) or closes with localStorage persistence.

**Progressive depth mapping:**
| Session | What happens | Lotus petals |
|---------|-------------|-------------|
| Day 1 (90 sec) | WHOLE + WHO + WHAT → archetype + first pattern | whole, who, what |
| Day 2+ (optional depth) | CONTEXT: Ikigai (Love, Good, Need) | context |
| Day 3+ | PURPOSE + VISION | purpose, vision |
| Daily return | Workspace: see context, edit anything, get recommendations | workspace |
| Week 2+ | BEHAVIOR: purpose→pattern mapping | behavior |
| Ongoing | DESIGN, INSTALL, VALIDATE, EVOLVE | deeper petals |

Each return visit can advance through a new petal, or edit any existing context. The WHOLE evolves with each petal completed. The user controls the pace.

---

## Architecture Notes

### Route Structure

| Route | What | Status |
|-------|------|--------|
| `/begin` | The Lotus Flow onboarding (this spec) | REPLACE existing Shape Builder |
| `/home` | Three-tab shell (Your Map / Your Day / Your Journey) | EXISTS (minimal) |
| `/home` | Workspace (context dashboard + recommendations + editing) | EXISTS (update for workspace model) |
| `/` | Landing page | EXISTS (update later with Google Maps positioning) |

### Existing Code Impact

**REPLACE:**
- The current Shape Builder at `/begin` (8-card dimension rating)
- The ShapeAssessment data model
- The insight generation prompt (too generic without context)

**KEEP:**
- The AI provider abstraction (Claude API)
- The Supabase auth flow (magic links)
- The design token system (colors, fonts, spacing)
- The /home shell and tab structure
- The Living Canvas at /map/[id]
- The 6-phase conversation engine (becomes a deeper petal, not the entry)

**EXTEND:**
- The database schema needs the new UserContext/OperatorContext model
- The AI prompt system needs the archetype computation + pattern compilation prompts

### Data Model

The onboarding creates an `OperatorContext` — richer than the old `ShapeAssessment`:

```typescript
interface OperatorContext {
  id: string;
  userId?: string; // null before auth, linked after magic link

  // Screen 1
  name: string;
  entityType: 'person' | 'group' | 'place' | 'enterprise';

  // Screen 2
  stage: 'starting' | 'transition' | 'building' | 'searching';

  // Screen 6
  governance: {
    solo: boolean;
    people: Array<{
      name: string;
      relationship: 'partner' | 'family' | 'collaborator' | 'other';
    }>;
  };

  // Screen 7
  capitals: {
    financial: number;    // 1-10
    material: number;
    living: number;
    social: number;
    experiential: number;
    intellectual: number;
    spiritual: number;
    cultural: number;
  };

  // Screen 9 (computed)
  archetype: string;           // e.g. "Earth Tender"
  archetypeDescription: string; // e.g. "Strong in living systems..."
  strengths: string[];         // top 3 capital names
  growthAreas: string[];       // bottom 2 capital names

  // Screen 13 (optional)
  location?: string;
  climateZone?: string;        // inferred from location

  // Post-onboarding (computed by AI)
  firstInsight: string;
  firstPattern?: CompiledPattern;

  // System
  createdAt: Date;
  updatedAt: Date;
  version: number;             // increments with each spiral pass
  lotusProgress: {             // which petals are complete
    whole: boolean;
    who: boolean;
    what: boolean;
    context: boolean;
    purpose: boolean;
    vision: boolean;
    behavior: boolean;
    nurture: boolean;
    validate: boolean;
    design: boolean;
    install: boolean;
    evolve: boolean;
  };
}

interface CompiledPattern {
  id: string;
  name: string;
  description: string;
  whyYou: string;            // why this pattern for this person
  firstStep: string;         // doable this week
  timeToValue?: string;      // "2-4 weeks"
  resourceRequirement?: string; // "$200-500"
  sourcePatternId?: string;  // link to RPPL seed pattern if applicable
  validatedBy?: number;      // number of operators who've used this
}
```

**localStorage schema (pre-auth):**
```typescript
// Key: 'huma_onboarding'
{
  currentScreen: number;     // 1-13, for resume-on-return
  context: Partial<OperatorContext>; // accumulated data
  wholeVisualization: {      // parameters for rendering the WHOLE
    phase: 1 | 2 | 3;
    params: number[];        // derived from selections
  };
}
```

### The WHOLE Visualization

The WHOLE is the signature HUMA visual. It is NOT a radar chart, bar chart, or static image.

It IS a procedurally generated organic form, parameterized by context data, evolving through visual phases as context deepens.

**Evolution phases:**
| Phase | Trigger | Visual | MVP Implementation |
|-------|---------|--------|-------------------|
| 1 (WHOLE 1.0) | After Screen 1-2 | Fine-line wireframe, mathematical | Animated SVG (Lissajous/rose curves, `stroke-dashoffset` draw-on) |
| 2 (Evolution) | After Screen 9 | Morphed wireframe, more complex | SVG path morphing (CSS transitions or `d` attribute interpolation) |
| 3 (Phase transition) | After Screen 9 | Organic, glowing, alive | SVG + CSS filters (`blur`, `opacity` layers, gradient overlay) |
| 4 (WHOLE 2.0) | After Context/Purpose completion | Perforated sphere | Future: Three.js |
| 5+ | Ongoing | Further evolution | Future: Three.js with shaders |

**Parameter mapping (how selections become shape):**
- Entity type → base curve family (Person = rose curve, Enterprise = Lissajous, etc.)
- Stage → curve complexity (starting = simple, building = complex)
- Capital values → curve amplitudes and phase offsets (each capital affects a parameter)
- Total capital sum → overall scale
- Capital variance → asymmetry (balanced capitals = symmetric form, imbalanced = asymmetric)

The exact parameterization should be tuned visually — the math should produce forms that FEEL right, not just compute correctly. Claude Code should generate several variants and Jack picks the one that resonates.

### The Component System

Everything in HUMA is a COMPONENT. Entity types, people, capitals, interests, purposes, visions, behaviors, patterns — all components. Components connect to form the operator's context network.

```typescript
interface HumaComponent {
  id: string;
  type: ComponentType;
  label: string;
  icon: string;
  connections: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  phase: LotusPhase;
  warmth: WarmthLevel;
}

type ComponentType =
  | 'entity'      // Person, Group, Place, Enterprise
  | 'person'      // Decision makers, people in the picture
  | 'capital'     // The 8 forms
  | 'interest'    // From Context/Ikigai (future)
  | 'purpose'     // Purpose statements (future)
  | 'vision'      // Vision elements (future)
  | 'behavior'    // Mapped behaviors (future)
  | 'pattern'     // RPPL patterns applied
  | 'enterprise'; // Compiled enterprises (future)

type LotusPhase =
  | 'whole' | 'who' | 'what' | 'context' | 'purpose'
  | 'vision' | 'behavior' | 'nurture' | 'validate'
  | 'design' | 'install' | 'evolve';
```

### The Lotus Navigation

The left sidebar IS the lotus framework. 12 petals, each a phase:

1. **whole** — entity type, sub-type → icon: ○ (circle, completeness)
2. **who** — governance, people → icon: ✳ (snowflake, connections)
3. **what** — capital spectrum, wealth → icon: ⚙ (gear cluster)
4. **context** — Ikigai, inspiration → icon: ❀ (flower, context)
5. **purpose** — purpose statements → icon: ◎ (target, purpose)
6. **vision** — long-term vision → icon: ❋ (radiant, vision)
7. **behavior** — purpose→pattern mapping → icon: ⚡ (action)
8. **nurture** — tending and growing → icon: 🌱 (sprout)
9. **validate** — testing against reality → icon: ✓ (check)
10. **design** — enterprise compilation → icon: ✎ (pencil)
11. **install** — implementation → icon: ↓ (download/install)
12. **evolve** — seasonal review → icon: ❊ (evolve)

(Icons are placeholders — use HUMA's organic illustration style, not emoji. Each should be a small SVG matching the wireframe icons.)

Each petal shows a progress bar. For MVP, only petals 1-3 (whole/who/what) are active. Petals 4-12 are visible but dimmed with "Coming soon" on tap. This shows the DEPTH of what's coming without blocking launch.

The nav can be non-linear — users can jump back to any completed petal to edit. Each edit may trigger a WHOLE evolution.

---

## Design System Notes

### Visual Language
- sand-50 background throughout
- Cormorant Garamond for questions and headers
- Source Sans 3 for labels, body text, UI elements
- White cards with sand-300 borders, rounded-xl
- Sage-500 for active/selected states
- HUMA illustration style for all icons (organic, hand-drawn feel, teal/sage/amber tones)

### The Spectrum Sliders
- NOT standard HTML range inputs
- Segmented bars with color gradient: red → orange → yellow → green
- Each segment tappable (8-10 segments per bar)
- Tapping fills the bar up to that point with color
- The color itself communicates: no numbers needed

### Reward Animations
- Component appears: fade in + scale 0.8→1.0 (400ms)
- Flower petals unfurl: center outward (1-1.5s)
- WHOLE evolves: smooth morph (1.5-2s)
- WHOLE phase transitions: particle dissolution + reformation (2s)
- All use HUMA easing: cubic-bezier(0.22, 1, 0.36, 1)
- prefers-reduced-motion: cross-fade instead of animated transitions

### Mobile Adaptation
- Lotus nav collapses to horizontal scrollable icons at top
- WHOLE visualization moves to a collapsible header area
- Cards go full-width
- Spectrum sliders go full-width
- Minimum tap target: 48px

---

## Verification Checklist

### Phase 1: WHOLE
- [ ] Screen 1: Name input (auto-focused) + entity type selection
- [ ] Screen 1: Person is fully functional; Group/Place/Enterprise show "Coming soon"
- [ ] Screen 1: Lotus nav visible on left with all 12 petals (only 1-3 active)
- [ ] Screen 2: Life stage selection (starting/transition/building/searching)
- [ ] Screen 3: First component — spare copy, no cheerleading ("Your first building block.")
- [ ] Screen 4: Canvas introduction — "your context will evolve"
- [ ] Screen 5: WHOLE 1.0 — animated SVG draws itself (parametric curves, 1.5-2s)

### Phase 2: WHO
- [ ] Screen 6: "Who else is in your picture?" — Just me / Add someone
- [ ] Screen 6: WHOLE 1.0 appears small in upper-right, persistent from here on
- [ ] Screen 6: Person framing (not enterprise "decision maker" language)

### Phase 3: WHAT
- [ ] Screen 7: 8 capital sliders with red→green color spectrum bars
- [ ] Screen 7: Labels: Financial, Material, Living, Social, Experiential, Intellectual, Spiritual, Cultural
- [ ] Screen 7: Spare copy: "Quick snapshot of your resources. This doesn't need to be exact."
- [ ] Screen 8: Regenerative Wealth flower — 8 petals sized by values, TIME at center
- [ ] Screen 8: Petals are organic bezier curves, not pie wedges
- [ ] Screen 8: Flower animation (petals unfurl from center, 1-1.5s)
- [ ] Screen 9: Synthesis — archetype inferred from capital pattern
- [ ] Screen 9: Shows: archetype name, stage, top 3 strengths, bottom 2 growth areas
- [ ] Screen 9: Copy: "Here's what I see, [name]." Not "Let's reflect!"
- [ ] Screen 9: "That's right" / "Adjust" buttons (sovereignty, equal weight)
- [ ] Screen 10: WHOLE evolves — SVG morphs to new form (1.5s)
- [ ] Screen 10: Copy: "Your WHOLE is changing." Not "WHAT!? Your WHOLE is evolving!!"
- [ ] Screen 11: WHOLE phase transitions — wireframe → organic (SVG + CSS filters)

### Post-Flow
- [ ] Screen 12: AI insight (2-3 sentences, fence-post voice) + pattern card
- [ ] Screen 12: Pattern card has: name, what, why you, first step
- [ ] Screen 12: "Got it" / "Show me others" buttons
- [ ] Screen 13: Optional location input + "Save my progress →"
- [ ] Screen 13: Auth via magic link, redirects to /home
- [ ] Screen 13: "Continue to Context" / "I'll be back" choice
- [ ] Pre-auth data persists in localStorage (no loss on browser close)

### Voice Bible Compliance
- [ ] No "Congratulations!" or cheerleading language anywhere
- [ ] No "Based on what you shared..." or summary preambles
- [ ] No "You might want to consider..." hedging
- [ ] No "Great job!" or "Amazing!" affirmations
- [ ] HUMA speaks in spare, direct, warm sentences
- [ ] One question per screen. Never two.
- [ ] "That's right" / "Adjust" — not "Does this resonate?"

### Design System Compliance
- [ ] sand-50 (#FAF8F3) background throughout (never pure white page bg)
- [ ] Cormorant Garamond for all questions and headers
- [ ] Source Sans 3 for labels, body, UI elements
- [ ] White cards with sand-300 borders (#D4CBBA), rounded-xl
- [ ] Selected state: sage-50 fill, sage-500 border
- [ ] Amber for CTAs only (#B5621E)
- [ ] ink-900 (#1A1714) for headlines, ink-700 for body text
- [ ] HUMA easing everywhere: cubic-bezier(0.22, 1, 0.36, 1)
- [ ] prefers-reduced-motion: cross-fade instead of animated transitions
- [ ] All tap targets minimum 48px
- [ ] Max reading width: 680px for prose content

### Mobile
- [ ] Lotus nav collapses to horizontal scrollable icons at top
- [ ] WHOLE visualization moves to collapsible header
- [ ] Entity cards: 2x2 grid (same as desktop)
- [ ] Capital sliders: full-width, all 8 visible (slight scroll OK)
- [ ] Flower: centered, sized to viewport
- [ ] Pattern card: full-width

### Technical
- [ ] localStorage persistence of onboarding state
- [ ] Supabase auth (magic link) triggered at save
- [ ] OperatorContext model saved to PostgreSQL after auth
- [ ] Claude API call for archetype computation (Screen 9)
- [ ] Claude API call for first insight + pattern (Screen 12)
- [ ] WHOLE SVG parameterized by context data
- [ ] WHOLE SVG morphs on data change
- [ ] Lotus nav progress tracking per petal
