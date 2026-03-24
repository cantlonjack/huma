# HUMA Product Surface
_Single source of truth for what the operator sees, touches, and feels._

*This document supersedes all previous product surface specifications,
including HUMA_PRODUCT_UPGRADE.md and the archived HUMA_PRODUCT_SURFACE.md.
The architectural documents (Foundational Truth, Strategic Architecture,
Technical Specification, Pattern Library, Ethical Framework) describe the
ENGINE. This document describes the CAR — what the driver experiences.*

*The engine is complex. The car must feel simple.*

March 2026 · Foundational Architecture

---

## 01 — Design Rationale

Eight problems this design solves:

**1. The 40-minute wall.** Nobody commits 40 minutes to something they've
never tried. Not even if the landing page is perfect. The gap between
"this looks interesting" and "I'll give you 40 minutes of my life" is
where 95% of potential users die.

**2. "Hypothesis testing for your life" is terrifying.** Most people's
identity is built on NOT examining their assumptions. The framing must
be invisible. Strava doesn't say "let's test your hypothesis about your
running capacity." It says "nice run." The hypothesis testing happens,
but the user experiences progress and insight, not scientific method.

**3. The canvas is emotionally cold.** Rings, nodes, validation states,
capital profiles — this is a systems diagram. The moment someone decides
to change their life is EMOTIONAL, not analytical. They need to feel
SEEN, not assessed.

**4. Operate assumes planning capacity people lack.** A 7-column weekly
grid with drag-to-rearrange is a project manager's dream and a normal
person's nightmare. Most people can barely plan a day. The Operate tab
should tell them the ONE THING that matters today.

**5. No social layer.** Every product that achieved unicorn-scale behavior
change has a social dimension. The herd instinct that keeps people from
sticking their heads up is the SAME instinct that, if redirected, drives
adoption.

**6. No dopamine loop.** No reward for engagement. No progress indicator
that feels good. The Sunday review is presented as a 10-minute analytical
exercise, not a moment of recognition.

**7. Language is exclusionary.** "RPPL patterns." "Capital profile."
"Enabling actions." "Validation states." This is language for the
architect of the system, not the person living in it.

**8. The Shape Builder was too thin.** Rating dimensions 1-5 gives the AI
eight numbers. Eight numbers can't produce GPS-level guidance. The entry
experience needs to capture WHO (entity type, archetype), WHERE (stage,
governance), and WHAT (capital spectrum) — not just HOW IT FEELS. The
Lotus Flow solves this by painting context through visual selections
across the first three lotus petals in 90 seconds.

**The unicorn principle:** Make the deep work feel like play. Make system
thinking happen without the user knowing. Make the hard thing easy by
making the first step tiny and the reward immediate.

The intellectual architecture — RPPL, 8 capitals, QoL decomposition,
pattern compilation, field dynamics, validation loops, graduation
tracking — ALL of it runs under the surface. The operator never sees
the framework. They experience insight, warmth, progress, and the
feeling of being seen.

Google Maps has satellite imagery, routing algorithms, and traffic
prediction models. The driver sees a blue line and "turn left in
200 feet." That's the design goal.

---

## 02 — The Shape

The product IS the shape. Everything flows from it:

- **Paint it** (Lotus Flow, 90 sec — WHOLE + WHO + WHAT petals)
- **Deepen it** (Context Petals: Ikigai, Purpose, Vision, Behavior)
- **Understand it** (One-Thing Card, Compiled Recommendations)
- **Edit it** (Workspace — any element, any time, one tap)
- **Map it** (Map Conversation, 15-20 min, when context is deep enough)
- **Watch it change** (Weekly WHOLE Evolution)
- **Share it** (The WHOLE as artifact)

The shape is an 8-vertex radar across the dimensions. It captures the
operator's felt sense of their life across all dimensions simultaneously.
The PATTERN of scores — not any individual score — is what generates
insight.

"Your People is at 4 and Identity is at 4, but Money is at 1 and Body
is at 2. That's unusual — most people in financial stress feel isolated
and lose their sense of self. You haven't. That means you have something
most people in your situation don't: a community that still sees you."

That's specific. That's structural. That's something only HUMA can see,
because only HUMA has the full dimensional picture.

---

## 03 — Context Model

Sovereignty-aligned. HUMA knows what the operator TELLS it. Four sources
of context, all operator-controlled:

**1. Lotus Flow** — entity type, life stage, governance, 8-capital
spectrum, archetype. Rich context from Day 1 onboarding.

**2. Context Petals** — Ikigai, Purpose, Vision, Behavior. Progressive
deepening at operator's pace. Each petal advances the WHOLE.

**3. The Conversation** — What the operator wants, values, is reaching
for. Interior experience. The Map Conversation deepens context further.

**4. Workspace Edits** — Any piece of context is one tap from editing.
When reality proves an assumption wrong, the operator changes it directly.
No ceremony. No daily check-in screen. Context is always visible, always
editable. Every edit is a signal — the system learns from what changes.

**5. Community Wisdom** — Anonymized, aggregated patterns from all
operators. "When Money drops and Body holds steady, 73% recover within
8 weeks if People is above 3." Applied to THIS operator's specific
configuration.

No external data harvesting. No bank connections. No calendar sync.
No health app integration. No screen time tracking. The operator tells
HUMA what matters. HUMA doesn't surveil.

---

## 04 — Progressive Depth

How operators enter and deepen. Never forced — always invited.

### Layer 1: Lotus Flow (Day 1, 90 sec)

11 screens moving through the first 3 lotus petals (WHOLE → WHO → WHAT).
Entity type, life stage, governance, 8-capital spectrum, archetype
synthesis, WHOLE evolution. Produces first pattern recommendation.

### Layer 2: Context Deepening (Day 2+, at operator's pace)

Ikigai (Love/Good/Need), Purpose, Vision, Behavior. Each petal is
5-15 minutes. Each makes compiled recommendations sharper. Each
evolves the WHOLE. Available immediately or progressively.

### Layer 3: One-Thing Card (when context is deep enough)

Requires at least Lotus Flow + one context petal. One high-leverage
suggestion per day. Socratic framing. Got it / Not today.

### Layer 4: Behavior + Design

Pattern mapping, enterprise compilation, validation. The workspace
becomes the operator's project — the place where their life design
lives and evolves.

### Layer 5: Full Depth (Ongoing)

Masterplan, seasonal review, pattern contribution. Three-tab
experience. Always available, never the default.

---

## 05 — Entry: Lotus Flow

The primary entry point is the Lotus Flow at `/begin` — an 11-screen,
90-second context painting that moves through the first three lotus
petals (WHOLE → WHO → WHAT).

The flow captures:
- **WHOLE:** Entity type (Person for MVP) and life stage
- **WHO:** Governance — solo, partnered, family
- **WHAT:** 8-form capital spectrum with color-gradient sliders

From these inputs, HUMA infers:
- **Archetype** (Earth Tender, Maker, Healer, Builder, Seeker, etc.)
- **Development stage** (starting, transition, building, searching)
- **Strengths** (top 3 capitals)
- **Growth areas** (bottom 2 capitals)

Three reward moments punctuate the flow:
1. WHOLE 1.0 born (Screen 5) — organic animated form from first selections
2. Regenerative Wealth flower (Screen 8) — 8-petal capital visualization
3. WHOLE evolution (Screens 10-11) — the shape transforms as context deepens

The synthesis (Screen 9) is the "holy shit" moment: HUMA reflects back
the operator's archetype, stage, strengths, and growth areas — inferred
from the pattern of their inputs, not self-reported.

After the flow, HUMA delivers a compiled pattern recommendation specific
to the operator's archetype, stage, and capital shape.

The full Lotus Framework has 12 petals. Petals 4-12 (Context through
Evolve) are available as progressive depth — the operator goes deeper
at their own pace, and the WHOLE evolves with each petal completed.

See `cc-prompt-onboarding-v2.md` for the complete specification.

---

## 06 — Three Tabs: Your Map / Your Day / Your Journey

User-facing names: Your Map, Your Day, Your Journey.
Internal/code names: Design, Operate, Evolve.

### Tab 1: Your Map (internal: Design)

The spatial canvas. Center-outward Palmer clustering. NOT a linear
document. NOT a dashboard.

**Layout:**

1. **Center: Who You Are** — name, place, phrase, breathing glow
   animation (sage, scale 1 to 1.03, 6s)
2. **Ring 1: What Matters** — quality of life commitments (sage pills),
   arranged organically by affinity. Related commitments cluster near
   each other.
3. **Ring 2: What Makes It Work** — enabling actions, clustered around
   the commitment they serve. Spatial proximity IS the connection
   (Palmer's layout). "All revenue work done by 3pm" sits near
   "Evenings free by 4."
4. **Ring 3: Your Practices** — enterprises, methods, routines,
   frameworks. Positioned near the enabling actions they support.
   Types: enterprise, method, routine, framework, protocol.
   Roles: anchor, foundation, multiplier, long-game.
5. **Perimeter: Where I'm Going** — future resource base. Long-term
   bets. The slowest to warm up.
6. **Background: The Shape** — capital radar, semi-transparent overlay.
   Always visible but never dominant.

Warmth system applies to every element (see section 09).

**Interactions:**

- **Tap commitment pill** -> expand decomposition (enabling conditions,
  validation question, current data from pulse)
- **Tap enabling action** -> show detail + "See in Your Day"
- **Tap practice** -> expand compiled method (steps adapted for this
  person, capital impact, fit narrative, failure mode, source)
- **Tap/hover connections** -> related elements highlight, others dim
- **Long-press any element** -> validation history (when added, when
  state changed, notes)
- **Toggle: "Show my shape"** -> brings radar chart forward. Hover
  axis to see capital name + what drives it.

**Responsive:**

- **Desktop:** Full spatial SVG, all layers visible
- **Tablet:** Compressed, pills may truncate
- **Mobile:** Essence + What Matters + Practices as list. Full spatial
  view in landscape orientation.

### Tab 2: Your Day (internal: Operate)

**Default view: One-Thing Card**

The one-thing card is Socratic, not prescriptive. It shows what HUMA
sees in the coupling between dimensions and what others in similar
situations have found. The operator decides.

Sovereign framing:

> "Your Body has been dropping for 3 days. Others in similar situations
> found morning movement was the lever. Want to try it?"

NOT: "Your one thing today: exercise."

- Explained in coupling terms: "20 minutes of movement not to get fit —
  to get thinking back"
- **[Got it] [Not today]** — equal weight. No guilt. No streak.
- The card teaches the WHY (the coupling, the leverage point) so the
  person learns to see it themselves
- **Graduation = they find the one thing without the card**

**"Got it":** Canvas warms slightly on related elements. Coherence
score ticks up. HUMA says nothing or something brief: "Noted." No
confetti. No points.

**"Not today":** No guilt. "Got it. This one will come back when
it's right." HUMA learns — maybe Thursday isn't the right day. The
system adapts.

**Hard Stop Management:**

Each day has an editable hard stop linked to a What Matters statement.
Always visible on the one-thing card as a reminder.

Editing shows the tradeoff: "Moving from 3:30 to 4:30 means 'evenings
free' target drops by 1 hour." Override visible, not hidden.

**"See full day" (depth):**

Full daily schedule with time blocks. Each block shows:

- Warmth state
- What (task name)
- Which practice (name + type)
- Tap to expand:
  - **WHY** — the QoL chain (which commitment -> which enabler -> this task)
  - **HOW** — the compiled method for this person (the pattern adapted to
    their field, expressed as plain instructions)
  - **WHAT TO WATCH FOR** — the failure mode most likely for their profile
  - **SIGNAL** — what tells you it worked

**"Plan my week" (depth):**

Weekly view with themed days. 7-column interactive grid. Drag to
rearrange blocks. Pattern coverage bar shows which practices have
time and which don't. QoL health indicators show which commitments
are being served. Hard stop editing with consequence display.

Advanced feature. Never the default. Most users never need this.

**Weekly Shape Morph (Sunday default, 30-60 sec):**

```
Your week:

[animated shape morph: Monday -> Sunday]

Body:    2.0 -> 2.8  (up)
Money:   1.5 -> 1.5  (steady)
Joy:     1.0 -> 2.0  (up)

What I noticed:
Your Body improved every day after you did the morning
movement. Joy followed. Money held steady — which is
actually good news.

Coherence: 41 -> 48  (+7)

[Sounds right]  [Tell me more]
```

The animated shape morph is the signature HUMA moment. Watching your
shape change over a week — even slightly — is visceral.

**"Tell me more" / "Go deeper" (5-8 min depth):**

Full validation review with tap-to-answer per commitment:

```
"Evenings free for my daughter"
How many evenings genuinely free?
[1] [2] [3] [4] [5] [6] [7]
                          5+
```

After all answers, HUMA responds — maximum one insight:

- If on target: "Clean week. Your hypothesis is holding."
  (Warmth advances on related elements.)
- If below target: the systemic question. NOT "try harder."
  "Packing ran long twice. Is it the harvest volume or the staging
  setup? [Adjust Tuesday block] [Flag for seasonal review]"
- The insight always looks at the SYSTEM, not the person.

Three sentences max: observation, diagnosis, action.

### Tab 3: Your Journey (internal: Evolve)

**Shape Timeline:**

The primary visual. The operator's shape at each point in time —
overlaid or side-by-side. Animated morph between shapes.

```
  January        March          June
     *              *             *
    / \            /|\           /|\
   /   \          / | \         / | \
  *     *       *  *  *      *  *  *
   \   /          \ | /         \ | /
    \ /            \|/           \|/
     *              *             *

  Coherence: 38     51            67
```

The shape grows. The coherence rises. The operator SEES their growth.

**"What shifted" narrative:**

```
March 15 — "Evenings free" went from faint to solid
  You hit 5+/7 evenings free for 4 weeks running.
  What made it work: batching harvest to Tuesdays.

April 2 — "Income without anxiety" shifted
  You realized it wasn't about the amount — it was about
  predictability. New framing: "Know what's coming next month."
```

Human, warm, specific. Not a validation state log. A story of growth.

**Validation history per commitment:**

Timeline view of every commitment's journey through warmth states,
with dates and notes on what prompted each change.

**Seasonal review invitation (quarterly):**

"It's been a season. Want to look at what changed?"

A conversation (reusing the conversation UI, 20 minutes) that:

1. Asks the Evolution Question: "What do you know now that you didn't
   know when this season started?"
2. Reviews what held, what shifted, what surprised
3. Reviews which practices worked, which were abandoned, why
4. Updates the canvas (new version saved, feeds the shape timeline)
5. Identifies next season's priorities

**Graduation:**

Measured passively. Never displayed as a score. Four capacities:

1. Pattern Internalization — do they execute without prompting?
2. Self-Diagnosis — do they name the systemic cause before HUMA does?
3. Node Recognition — can they find leverage points in novel situations?
4. Whole Seeing — do they reference multiple dimensions unprompted?

When graduation threshold is reached: "You're seeing the connections
on your own now. You don't need the daily card anymore."

---

## 07 — The 6-Phase Map Conversation

Earned at Layer 4 (week 2-3). Shortened by existing context.

1. **Ikigai** — Who are you? Warm, curious. Ends with Essence synthesis.
   (Shortened — HUMA already knows shape.)
2. **Holistic Context** — What are you reaching for? QoL decomposition.
   Gently challenging.
3. **Field Reading** — What does your context afford? Layers from
   permanent to flexible. Grounded, specific. (Informed — 2 weeks of data.)
4. **Enterprise Map** — What could you build? Real numbers, tested
   against QoL. Exciting, surprising. (Grounded — HUMA knows what's working.)
5. **Nodal Interventions** — Where do you begin? Cascade chains.
   Focused, relieving.
6. **Operational Design** — What does your week look like? Rhythm,
   validation, seasonal arc. Confident, grounding.

### QoL Decomposition Chain

```
"What matters" statement ("Evenings free for my daughter")
  -> What makes it work (all work done by 3pm)
    -> Weekly commitments (Tue/Thu: pack days done by 2pm)
      -> Daily behaviors (today's schedule with hard stop)
        -> Validation (workspace feedback + weekly insight)
          -> Adjustment (systemic, never personal)
```

When validation fails, HUMA ALWAYS looks at the system, NEVER at
the person. "Packing ran long. Is it volume or staging?" not
"You didn't stick to the schedule."

---

## 08 — The Workspace Experience

### What the Operator Sees

Their living context, organized by the lotus. All visible. All tappable.
All editable. The WHOLE reflects the current state.

The operator opens `/home` and sees everything they've told HUMA —
archetype, capitals, Ikigai (if completed), purpose statements (if
completed), active patterns, enterprise data (if completed). Organized
by the lotus structure. The WHOLE reflects the state of everything in
real time.

### The Feedback Loop

Every piece of context is hypothesis, not fact. When the operator
reports an assumption was wrong, context updates, the WHOLE shifts,
recommendations recompile. The workspace is in constant flux. That
flux IS the product working.

The Holistic Management feedback loop is the operating principle:
Act → Observe → If on track, continue → If off track → Clarify →
Brainstorm → Decide (using testing questions) → Act

The workspace makes this loop frictionless: see your context, act on
a recommendation, observe what happens, update the assumption that was
wrong. The WHOLE shifts. Recommendations recompile.

### Compiled Recommendations

HUMA compiles patterns against current context. Deeper context =
sharper recommendations:

- After Lotus Flow: archetype-based patterns
- After Ikigai: matched to what you love + good at
- After Purpose + Vision: aligned with stated direction
- After Behavior mapping: specific daily/weekly actions
- After Design: full enterprise budgets with real numbers

### Transition Events

Each petal completion is a Transition Event. The WHOLE evolves.
Recommendations recompile. The operator sees the difference.

### Desktop vs. Mobile

Desktop: the full workspace. All petals accessible via the lotus nav
(which functions as a file system for your life). Spatial canvas.
Enterprise budgets. Deep work. You open it because your project is there.

Mobile: the field companion. Not a simplified desktop — purpose-built.
Four functions: See (compiled recommendations), Report (feedback on
actions), Edit (tap any context element), Capture (field notes,
realizations). Same data, right tool for the moment.

---

## 09 — The Warmth System

Visual states that communicate testing status. No symbols, no labels —
warmth itself communicates.

| State | Visual | Meaning |
|-------|--------|---------|
| **Faint** | ~25% opacity, 1px sage-200 border, text at earth-400 | Untested. Aspiration, not yet tried. |
| **Emerging** | ~55% opacity, 1px sage-300 border, text at earth-600 | Being tried. First weeks of engagement. |
| **Solid** | 100% opacity, sage-100 fill, sage-400 border, text at earth-800 | Validated. 4+ consecutive weeks meeting target. |
| **Shifting** | ~80% opacity, amber-100 fill, amber-400 border | Being revised. 2+ weeks below target, or operator learned something new. |
| **Faded** | ~15% opacity, dashed sage-200 border, text at earth-300 | Tried, didn't work. Archived with history. Visible in Your Journey. |

A fresh canvas after the map conversation is mostly faint — tentative,
airy, clearly a beginning. Over weeks, elements warm up. The operator
watches their map get more real. This IS the progress indicator. No
numbers. No symbols. Just warmth.

**Advancement Logic:**

```
Faint -> Emerging:
  First week of Operate engagement where this element has
  related workspace activity or the operator engages with a
  one-thing card that serves it.

Emerging -> Solid:
  4+ consecutive weeks where the commitment target is met,
  the enabler holds, or the practice produces expected impact.

Emerging -> Shifting:
  2+ consecutive weeks below target, OR the operator reports
  in the weekly review that something doesn't feel right, OR
  the seasonal review reveals the original statement was wrong.

Shifting -> Emerging:
  Seasonal review (or mid-season adjustment) produces an
  updated version. New cycle begins.

Emerging/Shifting -> Faded:
  Operator or seasonal review removes the element.
  Stays visible as ghost on canvas. Full history in Your Journey.
```

---

## 10 — The Share Artifact: Your Shape

Not the canvas. **The shape.** Capital radar at two points in time.

- Dark background (earth-900, #1A1714)
- Shape fill: sage-400 at 25% opacity (current), sage-300 at 15% (previous)
- Shape stroke: sage-400 (current), sage-300 (previous)
- Axis labels: sand-300, text-xs
- Name: sand-200, Cormorant Garamond
- "HUMA" footer: sage-500, text-xs, letter-spaced
- Sized for Instagram (1080x1080) and Twitter/X (1200x630)
- Every shared shape is distribution
- Shows growth without revealing details
- Beautiful enough to screenshot and share

The growth engine: User shares shape -> friend says "what is this" ->
friend builds their shape (90 seconds) -> friend gets structural
insight -> friend comes back -> friend shares their shape.

---

## 11 — Social Layer

### "People like you" signals

Anonymous, aggregated. The operator isn't alone.

"412 people in similar situations found that starting with finances
first made everything else easier."

"This practice (Morning Anchoring) is working for people with your
shape. Most see Body improve within 2 weeks."

Initially powered by simulation data (50 synthetic operators).
Over time, powered by real aggregated data. Always anonymous.

### Community Patterns

Attribution and contribution. Patterns that grow from real practice.

"Sarah found that batching harvest on Tuesdays freed 3 hours for her
daughter. Her method is now in the library. 47 people have tried it."

Every validated practice strengthens the system for everyone. This is
how the network effect works.

### Coherence Score

One number. 0-100. How connected life feels. Most people start 35-45.

Computed from:
- Warmth states across canvas elements
- Dimensional coupling health
- QoL achievement (from weekly reviews)
- Pattern effectiveness (done/not-today ratios)

The operator sees: "Coherence: 51." No breakdown unless they ask. The
number moves slowly. Not a grade — a vital sign.

What people share: "I was 38 in January. I'm 67 now."

---

## 12 — Dimension Mapping

| Internal (8 Forms of Capital) | User-Facing | Workspace Context |
|-------------------------------|-------------|---------------------|
| Financial | Money | Capital spectrum (1-10), editable |
| Material | Home | Capital spectrum (1-10), editable |
| Living/Natural | Body | Capital spectrum (1-10), editable |
| Social | People | Capital spectrum (1-10), editable |
| Intellectual | Growth | Capital spectrum (1-10), editable |
| Experiential | Joy | Capital spectrum (1-10), editable |
| Spiritual | Purpose | Capital spectrum (1-10), editable |
| Cultural | Identity | Capital spectrum (1-10), editable |

**Reserved future fields:** Time (the scarcest resource), Wisdom
(emergent property, not a capital).

**Coupling Matrix:** How dimensions interact FOR THIS SPECIFIC PERSON.
Built from longitudinal workspace data — context edits, behavior
reports, petal deepening over time. Only buildable from the operator's
own data. The coupling matrix is what makes insights personal rather
than generic. "YOUR Body dips when YOUR Money drops" — not a generic
correlation, but a personal dynamic discovered through sustained
observation.

---

## 13 — User-Facing Language

| Internal Term | User Sees |
|---------------|-----------|
| RPPL patterns | "moves" or "practices" |
| Validation states | visual warmth (no name) |
| Capital profile | "your shape" |
| Enabling actions | "what makes it work" |
| QoL statements | "what matters" |
| Compiled pattern | "the best way for you" |
| Nodal intervention | "the one thing" |
| Field dynamics | never mentioned |
| Counter-factual engine | "what would happen if..." |
| Active patterns | "your practices" or "what you're doing" |
| Hypothesis | never said to the user |
| Coherence score | just the number + context |
| Phase transition | never mentioned; conversation flows naturally |
| 8 Forms of Capital | shown as shape axes only when operator explores |

---

## 14 — Validation State Machine

The warmth system maps to internal validation states. The TypeScript
types and advancement logic:

```typescript
type ValidationState = 'untested' | 'testing' | 'validated' | 'revising' | 'abandoned';

interface ValidationEntry {
  date: Date;
  fromState: ValidationState;
  toState: ValidationState;
  note?: string;
}
```

**Mapping to warmth:**

| ValidationState | WarmthLevel | Visual |
|----------------|-------------|--------|
| untested | faint | ~25% opacity |
| testing | emerging | ~55% opacity |
| validated | solid | 100% opacity |
| revising | shifting | amber tint |
| abandoned | faded | ~15% opacity |

**State Transitions:**

```
UNTESTED -> TESTING
  Trigger: First week of Operate mode where this element has
  scheduled actions and the operator engages with them.

TESTING -> VALIDATED
  Trigger: 4 consecutive weeks where the QoL target is met,
  the enabling action holds, or the pattern produces expected
  capital impact.

TESTING -> REVISING
  Trigger: 2 consecutive weeks below target, OR the operator
  reports in the weekly review that the element doesn't feel right.

REVISING -> TESTING
  Trigger: The seasonal review (or mid-season adjustment)
  produces an updated version. The new version starts TESTING.

TESTING/REVISING -> ABANDONED
  Trigger: The operator or seasonal review determines this
  element should be removed. Archived with full history in
  Your Journey tab.
```

---

## 15 — Canvas TypeScript Interface

The 6-phase conversation produces a Canvas. This is the data structure
that powers all three tabs.

```typescript
interface Canvas {
  // CENTER: Who You Are
  essence: {
    name: string;
    location: string;
    phrase: string;
    warmth: WarmthLevel;
  };

  // RING 1: What Matters
  commitments: {
    id: string;
    statement: string;           // "Evenings free by 4"
    enablingConditions: string[];
    weeklyCommitments: string[];
    dailyBehaviors: string[];
    validationQuestion: string;
    target: string;
    systemicAdjustment: string;
    warmth: WarmthLevel;
    warmthHistory: WarmthEntry[];
  }[];

  // RING 2: What Makes It Work
  enablers: {
    id: string;
    action: string;
    servesCommitment: string[];  // commitment IDs
    signal: string;              // how you know it's working
    warmth: WarmthLevel;
  }[];

  // RING 3: Your Practices
  practices: {
    id: string;
    name: string;
    type: 'enterprise' | 'method' | 'routine' | 'framework' | 'protocol';
    role: 'anchor' | 'foundation' | 'multiplier' | 'long-game';
    rpplId?: string;             // reference to pattern library
    description: string;
    fitNarrative: string;
    compiledSteps: string[];     // pattern compiled for this field
    failureMode: string;         // most likely for their behavioral profile
    capitalImpact: {
      builds: string[];          // which capitals
      costs: string[];           // which capitals
    };
    financials?: {               // only for revenue/cost patterns
      startup?: { low: number; high: number };
      year1?: { low: number; high: number };
      year3?: { low: number; high: number };
      margin?: string;
      weeklyHours: { inSeason: string; offSeason: string };
    };
    supportsEnablers: string[];  // enabler IDs
    synergies: string[];         // other practice IDs
    warmth: WarmthLevel;
    source: string;              // tradition + attribution
  }[];

  // PERIMETER: Where I'm Going
  futureBase: {
    id: string;
    statement: string;
    timeframe: string;           // "by year 3", "ongoing"
    warmth: WarmthLevel;
  }[];

  // Schedule (feeds Your Day tab)
  rhythm: {
    days: {
      day: string;
      theme: string;
      blocks: {
        id: string;
        time: string;
        task: string;
        patternId: string;       // which practice
        servesCommitments: string[];
        duration: number;        // minutes
        signal: string;          // what tells you this worked
        compiledMethod?: {
          patternId: string;
          rpplId: string;
          method: string;
          adaptedSteps: string[];
          failureMode: string;
        };
      }[];
      hardStop: string;
      hardStopQoL: string;       // which commitment it protects
    }[];
    peakSeason: string;
    restSeason: string;
  };

  // Analytical (feeds Your Journey tab, shape)
  capitalProfile: {
    [key: string]: { score: number; note: string };
  };
  coherenceScore: number;

  // Pulse data (feeds insights)
  pulseHistory: DailyPulse[];
  oneThingHistory: OneThingEntry[];

  // Metadata
  fieldType: 'land' | 'universal' | 'hybrid';
  createdAt: Date;
  version: number;
  seasonLabel: string;
}

type WarmthLevel = 'faint' | 'emerging' | 'solid' | 'shifting' | 'faded';

interface WarmthEntry {
  date: Date;
  from: WarmthLevel;
  to: WarmthLevel;
  note?: string;
}

interface DailyPulse {
  date: Date;
  dimensions: { [key: string]: number };  // 1-5 ratings
}

interface OneThingEntry {
  date: Date;
  action: string;
  patternId?: string;
  servesCommitments: string[];
  result: 'done' | 'not-today' | 'skipped';
}
```

---

## 16 — Pattern Compilation

Each task block's HOW section is not generic advice. It's the pattern
COMPILED against this operator's field:

```
COMPILE(pattern, field) -> adapted_execution

The compiler resolves:
1. DOMAIN — which adaptation of the pattern applies
2. FIELD CONSTRAINTS — how their dimensions modify the steps
   (low energy -> shorter sessions; low money -> cheaper methods)
3. PREREQUISITES — are the required conditions met?
4. CONFLICTS — does this clash with another active pattern?
5. NODE — where is the maximum leverage in execution?
6. SIGNAL — what should they watch for to know it's working?
```

The operator learns the method BY DOING IT, guided by the compiled
instructions. Over time, they internalize the pattern (graduation).
The HOW section eventually becomes unnecessary because they've absorbed
the knowledge. That's the goal.

---

## 17 — Pricing

```
FREE FOREVER:
  - Lotus Flow
  - Workspace (context always visible + editable)
  - Weekly insight (one-card: shape morph + coherence delta)
  - Map conversation (once, produces the canvas + shape)
  - Shape sharing
  - "People like you" signals

$29/MONTH OPERATE:
  - Daily one-thing card with compiled methods
  - Full daily schedule view
  - Weekly planner (drag, rearrange, hard stops)
  - Deep weekly review (5-8 min depth)
  - Practice recommendations from the pattern library
  - Seasonal review conversation
  - Shape timeline (historical comparison)
  - Canvas versioning

$99/MONTH PROFESSIONAL:
  - Everything in Operate
  - Evolve Mode (seasonal reviews that update the map)
  - Multi-context management (multiple maps for different life domains)
  - Pattern contribution tools (structure and share what you've learned)
  - Client dashboards (for consultants, educators, coaches guiding others)
```

Free users get the insight and the shape. That drives growth.
Paying users get the daily action and the weekly depth. That drives
retention and revenue.

The map conversation is FREE because it produces the shareable shape.
Every free canvas is a potential share. Every share is distribution.

---

## 18 — Privacy & Sovereignty

- Operator owns all data. HUMA is custodian, not owner.
- No data sold, ever. To anyone. For any reason.
- No data used for advertising, ever.
- No external data connections. No surveillance.
- Community wisdom: anonymized, aggregated only. "73% of people with
  your shape..." never "Sarah's data shows..."
- JSON export: operator downloads complete data in standard format.
- Disconnection: data deleted within 24 hours.
- If HUMA shuts down: all data exported to operators then deleted.
  No data survives the product.
- The protocol (Reality Pattern Protocol Layer) is open. If HUMA the
  company dies, the language survives.

---

## 19 — Route Structure

```
/               Landing page (unauthenticated)
/begin          Lotus Flow entry (11 screens → pattern recommendation → auth)
/home           Three-tab experience (default: Your Day)
  #map          Tab 1: Your Map
  #today        Tab 2: Your Day
  #journey      Tab 3: Your Journey
/map/[id]       Public shareable view (read-only canvas + shape)
/map/sample     Sample maps (read-only)
```

**/home is where you live.** Open HUMA daily -> Your Day tab (default).
Your Map when you need the whole picture. Your Journey quarterly.

**/map/[id] is where you share.** Read-only, beautiful, spatial. No
Operate data (private). No Journey data (private). Just the canvas as
an artifact — the thing someone screenshots and shares.

---

## 20 — Build Sequence

In order of priority. Ship early, iterate with real users.

### Phase 1: Shape Builder [SHIPPED — DEPRECATED]
- Original 8-card dimension rating entry. Replaced by the Lotus Flow.
- Capital sliders from this design live on in the workspace.

### Phase 1.5: Lotus Flow [SHIPPED]
- 11-screen context painting (WHOLE → WHO → WHAT petals)
- Entity type, life stage, governance, 8-capital spectrum
- Archetype inference + synthesis screen
- WHOLE visualization (animated SVG → future Three.js)
- Regenerative Wealth flower (8-petal capital visualization)
- First pattern recommendation via Claude AI
- Auth trigger after pattern recommendation
- See `cc-prompt-onboarding-v2.md` for complete specification

### Phase 2: Context Petal — Ikigai [NEXT]
- Love/Good/Need (text + visual cards + AI chat)
- Populated Ikigai Venn diagram, review and edit
- WHOLE evolves on completion
- Compiled recommendations sharpen

### Phase 2.5: /home Workspace Shell [NEXT]
- Lotus nav sidebar as workspace file system
- Context dashboard (completed petals visible, all editable)
- Compiled recommendations panel
- WHOLE corner element
- Desktop layout + mobile layout

### Phase 3: One-Thing Card [FUTURE]
- Requires Lotus Flow + at least one context petal
- Sovereign framing (coupling + community wisdom, operator decides)
- Got it / Not today
- Track outcomes vs predictions

### Phase 4: Weekly Shape Morph [FUTURE]
- Animate shape from Monday to Sunday
- Show dimension deltas
- One insight
- Coherence score delta
- "Tell me more" / "Go deeper" -> deeper review

### Phase 5: Shape Sharing [FUTURE]
- Generate shape card (dark mode, SVG -> PNG)
- Two time points (then -> now)
- Coherence delta
- Share button + Web Share API
- Per-map OG image with shape

### Phase 6: Map Conversation [FUTURE]
- Triggered when context is deep enough
- Uses accumulated workspace context
- 15-20 minute version of 6-phase conversation
- Produces full canvas data

### Phase 7: Three-Tab Experience [FUTURE]
- Your Map (Palmer canvas with warmth)
- Your Day (one-thing card, full day optional, weekly planner optional)
- Your Journey (shape timeline, seasonal review)

**Phase 1.5 shipped March 2026.** USABLE PRODUCT after Phase 4 (~8 sessions from here).
Workspace + context petals + one-thing + weekly morph. Ship to real humans. Get feedback.
Then build phases 5-7.
