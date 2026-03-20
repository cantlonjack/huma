# HUMA — Three-Tab Architecture
## The Product Surface Design Specification

*This document supersedes HUMA_PRODUCT_UPGRADE.md for all UI/UX decisions.
It also supersedes any previous version of this spec.*

*The core insight: HUMA doesn't produce a life design. It produces a 
HYPOTHESIS about your life — then helps you test it, learn from it, 
and evolve it. The canvas is not a map. It's a living experiment.*

March 2026 · Foundational Architecture

---

## 01 — The Core Realization

Most tools give you a plan and wish you luck. HUMA gives you a hypothesis 
and a testing protocol.

The Holistic Management cycle — Context → Decision → Action → Monitor → 
Control → Replan — is not a methodology HUMA teaches. It's the structure 
of HUMA itself. The three tabs ARE the cycle:

**Canvas (Context):** Here is my hypothesis about what matters, what 
enables it, and which patterns make it real.

**Operate (Action + Monitor):** Here is what I'm doing today to test 
that hypothesis. Here is what I'm learning.

**Evolve (Control + Replan):** Here is what I now know. Here is how 
the hypothesis changes.

People don't know what they want until they start doing it. A freelancer 
thinks she wants "creative freedom" — three weeks of Operate mode reveals 
she actually wants "creative structure." A farmer thinks "income without 
anxiety" means $60K — testing reveals it means "predictable cash flow," 
which requires a different enterprise mix than maximizing revenue.

HUMA is designed for this. The first canvas will be wrong in some places. 
That's not a bug. That's the point. The system catches it, names it, 
and adapts.

---

## 02 — The Route Structure

```
/               → Landing page (unauthenticated)
/begin          → Name + location (threshold moment)
/conversation   → The 6-phase Design conversation
/home           → The three-tab product (authenticated)
  /home#canvas  → Tab 1: The Living Hypothesis
  /home#operate → Tab 2: The Testing Engine
  /home#evolve  → Tab 3: The Learning Record
/map/[id]       → Public shareable view (read-only)
/map/sample     → Sarah Chen sample (read-only)
```

**/home is where you live.** Open HUMA daily → Operate tab (default). 
Canvas tab when you need the whole picture. Evolve tab quarterly.

**/map/[id] is where you share.** Read-only, beautiful, spatial. 
No Operate data (private). No Evolve data (private). Just the canvas 
as an artifact — the thing someone screenshots and posts.

---

## 03 — The Validation States

Everything on the canvas — every QoL statement, every enabling action, 
every active pattern — carries a validation state. This is the visual 
language of the build-test-learn cycle.

```
○  UNTESTED     Fresh from the Design conversation. An assumption.
                Visual: hollow circle, lightest opacity.

◐  TESTING      Actively being tried in Operate mode. In the field.
                Visual: half-filled circle, medium opacity.

●  VALIDATED    Held up across 4+ weeks of practice. Real.
                Visual: filled circle, full opacity.

⟲  REVISING     Didn't work as designed. Being adjusted.
                Visual: circular arrow, amber.

✕  ABANDONED    Tried, failed, learned from. Removed with history.
                Visual: crossed circle, faded. Visible in Evolve only.
```

A fresh canvas after the Design conversation is mostly ○. After a month 
of Operate mode, elements shift to ◐ and ●. After a seasonal review, 
some hit ⟲ or ✕. The visual density of filled circles tells the operator 
at a glance: how much of my life design has been pressure-tested by reality?

**This is honest.** HUMA doesn't pretend the first version is correct. 
It says: here's your best hypothesis. Let's find out together.

---

## 04 — Tab 1: Canvas (The Living Hypothesis)

### What it is

A spatial diagram modeled on Palmer's Holistic Context layout — 
center-outward, clustered by relationship, not by category. One screen. 
No scrolling. Every element is an assumption with a visible validation state.

### The Layers

**CENTER: Essence**
The irreducible identity. Name, location, core phrase.
Subtle breathing glow (sage-400, scale 1→1.03, 6s).
Most stable element — but even this sharpens over time as the operator 
discovers what's actually core versus what they assumed was core.
Validation state: ○ after Design, ● after first seasonal review confirms it.

**RING 1: Quality of Life Statements**
What must be true for this life to be good. The non-negotiable commitments.
Arranged in a loose organic cluster around the essence — NOT in a 
perfect circle. Positioned by affinity: related QoL statements sit near 
each other.

Each QoL pill shows:
- The statement text (short: "Evenings free by 4")
- Validation state indicator (○/◐/●/⟲)
- Tap → expands to show the full decomposition:
  - Enabling conditions
  - Weekly commitments
  - Validation question + target
  - Systemic adjustment question (if below target)
  - Current validation data (from Operate tab)

These start as aspirations (○). They become validated commitments (●) 
only after the Operate cycle confirms they're achievable AND actually 
matter. Some QoL statements will be revised (⟲) when the operator 
discovers what they actually want is different from what they said.

**RING 2: Enabling Actions**
What you DO to make each QoL statement hold. The structural requirements.

**Critically: they cluster around the specific QoL statement they serve.**
This is Palmer's layout. "All revenue work done by 3pm" sits near 
"Evenings free by 4." "Harvest batched to 2 days/week" sits near 
"Physical work that builds strength." The spatial proximity IS the 
connection. No need for explicit connection lines between Ring 1 and 
Ring 2 — the clustering makes the relationship visible.

Each enabling action shows:
- Short text
- Validation state (○/◐/●/⟲)
- Which QoL statement it serves (spatial proximity)
- Tap → shows detail + link to the Operate tab schedule

Enabling actions are hypotheses. "I think batching harvest to 2 days 
will free enough time" is an assumption until tested. When the operator 
discovers that batching to 2 days works but requires a pre-staging 
system, the action gets revised (⟲) and a new enabling action appears.

**RING 3: Active Patterns (RPPL)**
The methods, processes, frameworks, and practices compiled for this 
person's field. These are NOT limited to enterprises/businesses. 
A pattern could be:

- An enterprise: Market Garden, Freelance Practice, Teaching Workshop
- An operational method: Production Batching, Time Blocking, Deep Work Protocol
- A life practice: Morning Anchoring, Financial Review Rhythm, Relationship Check-in
- A framework: QoL Decomposition itself, Debt Snowball, GTD Weekly Review
- A health protocol: Morning Movement, Sleep Architecture, Meal Prep System

Each active pattern shows:
- Name
- Type tag (enterprise / method / practice / framework / protocol)
- Role tag (anchor / foundation / multiplier / long-game)
- Validation state (○/◐/●/⟲/✕)
- Which enabling actions it supports (spatial proximity)
- Tap → expands to show:
  - The compiled pattern: specific steps adapted to this person's field
  - Capital impact (which of the 8 capitals this builds/costs)
  - Financials (if it's a revenue/cost-generating pattern)
  - Fit narrative (why this pattern for this person)
  - Source tradition + attribution
  - Failure mode most likely for their behavioral profile
  - Current validation data

Patterns are positioned near the enabling actions they support, which 
are near the QoL statements they ultimately serve. The entire canvas 
is a visible chain: what matters → what must be true → what method 
makes it true.

**PERIMETER: Future Resource Base**
What you're building toward over seasons and years. The long-term bets.
These sit at the outer edge of the canvas:
- "Soil deeper and more alive" (land operator)
- "$60K net income by year 3" (financial)
- "Deep community network" (social)
- "Skills that let me teach, not just do" (intellectual)

These are the slowest to validate — they require the Evolve tab and 
seasonal reviews. Mostly ○ or ◐ for the first year.

### What's NOT on the Canvas

- ~~Capital radar chart~~ → moves to Evolve tab as an analytical overlay. 
  Capitals are how you MEASURE the result, not how you DESIGN your life.
  Available as a toggle overlay on the canvas for those who want it.
- ~~Landscape/Situation Reading~~ → absorbed into enabling actions and 
  pattern fit narratives. The diagnosis is done; the insights live 
  in the design.
- ~~Forms of Production~~ → absorbed into active patterns.
- ~~Future Resource Base as separate section~~ → perimeter of canvas.
- ~~Weekly Rhythm~~ → lives in Operate tab (interactive, not display).
- ~~Nodal Interventions as separate section~~ → they ARE the highest-priority 
  enabling actions in Ring 2. Not a separate category.
- ~~Validation Protocol as separate section~~ → embedded in each QoL pill's 
  expanded view + the Sunday Review in Operate.

### Interactions

- **Tap QoL pill** → expand decomposition (enabling conditions, validation 
  question, current data from Operate)
- **Tap enabling action** → show detail + "See in schedule" link to Operate tab
- **Tap active pattern** → expand compiled pattern (steps, capitals, 
  financials, fit narrative, failure mode)
- **Hover/tap connections** → related elements highlight, others dim
- **Long-press any element** → shows validation history 
  (when it was added, when state changed, notes from reviews)
- **Toggle overlay: Capital Profile** → the 8-axis radar chart appears 
  as a translucent overlay behind the spatial layout. Hover axis 
  to see score + note. This is analytical, not primary.

### How the Canvas Gets More Solid

Week 1 (fresh from Design):
```
Most elements ○ (untested). The canvas is light, airy, tentative.
The operator can see it's a starting point, not a finished product.
```

Week 4 (after a month of Operate):
```
QoL statements that held → ◐ (testing)
Enabling actions that worked → ◐
Patterns that the operator actually used → ◐
Some elements already ⟲ (revising) — discovered reality differs
```

Season 1 (after first Evolve review):
```
Core QoL statements → ● (validated)
Key enabling actions → ●
Patterns that delivered → ●
Some elements ✕ (abandoned) — visible in Evolve, faded on canvas
New elements added from what was learned → ○ (starting cycle again)
```

The canvas is alive. It breathes with the operator's practice.

### Responsive

- **Desktop:** Full spatial SVG, all rings visible, comfortable tap targets
- **Tablet:** Compressed rings, pills may truncate with ellipsis
- **Mobile:** Essence + QoL ring + active patterns list below. 
  Ring 2 (enabling actions) accessible via QoL tap-to-expand. 
  Full spatial view available in landscape orientation.

---

## 05 — Tab 2: Operate (The Testing Engine)

### What it is

An interactive execution dashboard that reverse-engineers the operator's 
canvas hypothesis into daily and weekly actions, each with a WHY chain 
(traces back to QoL) and a HOW (the compiled RPPL pattern). This is 
where the hypothesis gets tested against reality.

**This tab is the core product. This is what people pay for.**

### The Daily View (default when opening /home)

```
┌─────────────────────────────────────────────────┐
│  Thursday, March 20                    76°F ☀    │
│  Hard stop: 3:30 PM → "Evenings free by 4"      │
├─────────────────────────────────────────────────┤
│                                                  │
│  5:30  ┌──────────────────────────────────┐     │
│    ◐   │ Morning walk + chores            │     │
│        │ Morning Anchoring · practice      │     │
│        └──────────────────────────────────┘     │
│                                                  │
│  7:00  ┌──────────────────────────────────┐     │
│    ◐   │ Planting + soil work             │ TAP │
│        │ Market Garden · enterprise        │     │
│        │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │     │
│        │ WHY: "Kitchen full of food I     │     │
│        │ grew" + Living & Financial       │     │
│        │ capital                          │     │
│        │                                  │     │
│        │ HOW: Production Batching —       │     │
│        │ group all brassica starts into   │     │
│        │ one session, soil is warm enough │     │
│        │ for direct sow after 7am.       │     │
│        │ Pre-stage compost at bed ends.   │     │
│        │ (rppl:operations:               │     │
│        │  production-batching:v1)         │     │
│        └──────────────────────────────────┘     │
│                                                  │
│  10:00 ┌──────────────────────────────────┐     │
│    ○   │ Propagation + potting            │     │
│        │ Herb Nursery · enterprise         │     │
│        └──────────────────────────────────┘     │
│                                                  │
│  1:00  ┌──────────────────────────────────┐     │
│        │ Buffer / infrastructure          │     │
│        │ Flexible                          │     │
│        └──────────────────────────────────┘     │
│                                                  │
│  ═══ HARD STOP 3:30 PM ════════════════════     │
│  ○ "Evenings free for my daughter"               │
│                                                  │
└─────────────────────────────────────────────────┘
```

Each time block shows:
- **Validation state** (○/◐/●) for the pattern being applied
- **WHAT**: the task
- **WHICH PATTERN**: name + type (enterprise/method/practice/framework)
- **TAP TO EXPAND** reveals:
  - **WHY**: the QoL chain — which QoL statement → which enabling action → 
    this task. Every action traces back to what matters.
  - **HOW**: the compiled RPPL pattern — specific method/process/steps 
    adapted to THIS person's field. Not generic. The pattern compiled 
    against their dimensions, energy profile, behavioral type.
  - **WHAT TO WATCH FOR**: the failure mode most likely for their profile.
    "If you're a pusher-through type, you'll skip the pre-staging step. 
    Don't — it's the difference between 2 hours and 3.5 hours."
  - **SIGNAL**: what tells you this block worked or didn't?
    "Did you finish by 10:00? If not, was it volume or staging?"

The hard stop time links to the QoL statement it protects. Always visible. 
The operator never forgets WHY they stop.

**Each day is a micro-experiment.** The schedule is the hypothesis. 
The day is the test. The signals are the data.

### The Weekly View

```
┌────┬────┬────┬────┬────┬────┬────┐
│Mon │Tue │Wed │Thu │Fri │Sat │Sun │
├────┼────┼────┼────┼────┼────┼────┤
│████│████│████│████│████│░░░░│░░░░│
│████│████│████│████│████│░░░░│░░░░│
│████│████│████│████│░░░░│    │    │
│████│████│████│░░░░│░░░░│    │    │
│    │    │    │    │    │    │    │
│STOP│STOP│STOP│STOP│STOP│STOP│    │
│3:30│2:30│4:00│3:30│3:00│1:00│    │
└────┴────┴────┴────┴────┴────┴────┘

Pattern Coverage:
████ Market Garden  ████ Herb Nursery  ████ Teaching
████ Morning Anchor ░░░░ Financial Rev  ← neglected

QoL Health:
● Evenings free    ◐ Income stable    ○ Body strength
```

- 7 columns, time blocks as colored rectangles by pattern
- Height = duration, hard stop lines per day
- **Drag to rearrange** blocks within or between days
- Consequence awareness: "Moving harvest to Thursday pushes 
  market prep — your Wednesday morning may not have produce ready"
- **Pattern coverage bar**: which patterns have time, which don't. 
  Neglected patterns flag gently, not urgently.
- **QoL health indicators**: which QoL statements are being served 
  by this week's schedule. Unserved QoL statements surface.

### Drag and Rearrange

When the operator drags a time block:
- Block lifts with subtle shadow
- Drop zones highlight
- On drop: HUMA shows consequences if any
- Changes persist to the operator's data
- The operator is DESIGNING their week — not following orders. 
  HUMA proposes. The operator disposes. The schedule is THEIR hypothesis.

### Enterprise/Pattern Neglect Detection

If a pattern has zero scheduled hours in a week:
- Muted in the coverage bar
- Gentle note: "Financial Review has no time this week. 
  Intentional, or squeezed out?"
- Systemic, not personal. A design question, not a discipline question.

### Hard Stop Management

- Each day has an editable hard stop
- Links to a QoL statement
- Editing shows the tradeoff: "Moving from 3:30 to 4:30 means 
  your 'evenings free' target drops by 1 hour. That QoL check 
  will likely come back below target this week."
- The operator can override. HUMA makes the tradeoff visible.

### The Sunday Review (Validation)

The weekly check-in. This is where the hypothesis meets reality.

**Step 1: Quick Validation (3-5 minutes)**

Tap-to-answer cards for each QoL statement:

```
┌─────────────────────────────────────────┐
│  ○ "Evenings free for my daughter"      │
│                                         │
│  How many evenings genuinely free?      │
│  [1] [2] [3] [4] [5] [6] [7]          │
│                                    5+   │
│                                         │
│  ○ "Physical work that builds strength" │
│                                         │
│  Energy at end of farm day? (1-5)       │
│  [1] [2] [3] [4] [5]                  │
│                                    3+   │
└─────────────────────────────────────────┘
```

Quick, tactile. Each answer updates the validation state on the canvas.

**Step 2: Systemic Insight (2-3 minutes)**

After all answers, HUMA responds — maximum one insight:

- If all on target: "Clean week. Your hypothesis is holding. 
  [QoL statement] moves from ○ to ◐." (Validation state advances.)
- If below target: the systemic question. NOT "try harder." 
  "Packing ran long twice. Is it the harvest volume or the 
  staging setup? [Adjust Tuesday block] [Flag for seasonal review]"
- The insight always looks at the SYSTEM, not the person. 
  Sanford's principle: develop capacity, don't enforce compliance.

**Step 3: Validation State Updates**

Based on the review:
- QoL statements that hit target 4 weeks running → advance to ◐ or ●
- QoL statements below target 2 weeks running → flag ⟲ (revising)
- Enabling actions that held → advance
- Enabling actions that broke → flag with the systemic question
- Patterns that the operator consistently used → advance
- Patterns they stopped using → flag (was it the wrong pattern, 
  or did life get in the way?)

The canvas updates in real-time as the review completes. The operator 
watches their design get more (or less) solid.

### The Morning Briefing

The Daily View IS the morning briefing. Open the Operate tab → 
see today → glance at blocks → 30 seconds. No separate briefing needed.

Weather/seasonal context as a small line at top if relevant.
Not a notification. Not a push alert. Just present when you open it.

### RPPL Pattern Compilation (the HOW)

Each task block's HOW section is not generic advice. It's the RPPL 
pattern COMPILED against this operator's field:

```
COMPILE(pattern, field) → adapted_execution

The compiler resolves:
1. DOMAIN — which adaptation of the pattern applies
2. FIELD CONSTRAINTS — how their dimensions modify the steps
   (low energy → shorter sessions; low money → cheaper methods)
3. PREREQUISITES — are the required conditions met?
4. CONFLICTS — does this clash with another active pattern?
5. NODE — where is the maximum leverage in execution?
6. SIGNAL — what should they watch for to know it's working?
```

The operator learns the method BY DOING IT, guided by the compiled 
instructions. Over time, they internalize the pattern (graduation). 
The HOW section eventually becomes unnecessary because they've 
absorbed the knowledge. That's the goal.

---

## 06 — Tab 3: Evolve (The Learning Record)

### What it is

The view that shows where you've been, where you're going, and 
what would happen if. This tab turns lived experience into wisdom.

**This tab is the moat. It's where HUMA becomes irreplaceable.**

### Shape Timeline

The primary visual. Shows the operator's capital profile across time.

```
Spring '26    Summer '26    Fall '26
   ◇              ◇             ◇
  / \            /|\           /|\
 /   \          / | \         / | \
◇     ◇       ◇  ◇  ◇      ◇  ◇  ◇
 \   /          \ | /         \ | /
  \ /            \|/           \|/
   ◇              ◇             ◇

[Your shape is growing]
```

Each shape is a radar chart of the 8 capitals at that point in time. 
Overlaid or side-by-side. The operator sees their life literally 
taking shape. This is the most shareable visual in HUMA.

The capital radar lives HERE — in the Evolve tab — not on the canvas. 
It's an analytical tool for understanding trajectory, not a design tool 
for planning action. Available as a toggle overlay on the Canvas tab 
for those who want it, but Evolve is its home.

### Validation History

A timeline view of every QoL statement's journey:

```
"Evenings free for my daughter"
○ Mar 3   First stated in Design conversation
◐ Mar 17  Started tracking — hit 5/7 first week
◐ Mar 24  Hit 4/7 — packing overflow on Tuesday
⟲ Mar 31  Revised: moved packing to Monday, added staging
◐ Apr 7   Back to 5/7 with new schedule
● Apr 28  Validated — 4 consecutive weeks at 5+/7

"Income without anxiety"
○ Mar 3   First stated
◐ Mar 17  Started tracking — cash flow tight
◐ Mar 24  Still tight — market revenue lower than projected
⟲ Apr 14  Revised: "anxiety" wasn't about amount, it was about 
          unpredictability. Changed to: "Know what's coming in 
          next month." Added financial review pattern.
◐ Apr 21  New framing being tested
```

This is where the operator sees the build-test-learn cycle made explicit. 
Their QoL statements evolved. Their understanding of what they want 
sharpened. The system captured it all.

### Seasonal Review

A conversation (reusing the Design Mode UI, shorter at 20-30 minutes) 
that walks through:

1. **The Evolution Question:** "What do you know now that you didn't 
   know when this season started?" This is the most important question 
   in HUMA. It surfaces the learning.

2. **Validation review:** Walk through each QoL statement. Which ones 
   held (●)? Which ones shifted (⟲)? Which ones turned out to be 
   wrong — you thought you wanted X but you actually want Y?

3. **Pattern review:** Which patterns worked? Which were abandoned? 
   Why? Were the compiled methods right, or did the operator adapt 
   them? (Adaptations feed back into the pattern library — this is 
   how RPPL evolves through practice.)

4. **Canvas update:** The seasonal review produces an updated canvas. 
   New version saved (feeding the Shape Timeline). Changed QoL 
   statements. New enabling actions. Different pattern mix. 
   Evolved resource base targets. Everything that was learned 
   gets encoded.

5. **Next season's hypothesis:** New nodal interventions (the 
   highest-leverage actions for the coming season). These become 
   new ○ (untested) elements on the canvas. The cycle begins again.

### Counter-Factual Engine (future build)

"What happens if I quit my job?"

HUMA takes the current field, modifies dimensions, runs the dynamics 
model forward, shows predicted trajectories with conditions.

"This path works IF you have 3 months runway AND land a client 
within 6 weeks. The leverage point is acquisition speed, not 
financial cushion."

Shows trajectories, not prescriptions. The operator decides.
Not available at launch. The Evolve tab is where it will live.

### Pattern Explorer (future build)

Browse the RPPL library. See active patterns, discover new ones. 
See what works for operators in similar fields. Explore cross-domain 
transformers. This is where the network effect becomes visible.

### Graduation Tracking

Measured passively through the Operate and Evolve cycles. Never 
displayed as a score. The four capacities:

1. **Pattern Internalization** — do they execute patterns without prompting?
2. **Self-Diagnosis** — do they name the systemic cause before HUMA does?
3. **Node Recognition** — can they find leverage points in novel situations?
4. **Whole Seeing** — do they reference multiple dimensions unprompted?

When graduation threshold (75/100) is reached, HUMA acknowledges it 
in the seasonal review: "You're seeing the connections on your own now. 
You don't need the daily structure anymore." Shift to seasonal-only.

---

## 07 — What the Conversation Produces

The 6-phase conversation produces a **Canvas** — a hypothesis 
about the operator's life, structured to be tested through practice.

### Canvas Data Structure

```typescript
interface Canvas {
  // Identity (CENTER)
  essence: {
    name: string;
    location: string;
    phrase: string;
    validationState: ValidationState;
  };
  
  // What matters (RING 1)
  qolStatements: {
    id: string;
    statement: string;
    enablingConditions: string[];
    weeklyCommitments: string[];
    dailyBehaviors: string[];
    validationQuestion: string;
    target: string;
    systemicAdjustment: string;
    validationState: ValidationState;
    validationHistory: ValidationEntry[];
  }[];
  
  // What must be true (RING 2)
  enablingActions: {
    id: string;
    action: string;
    servesQoL: string[];       // QoL IDs this action supports
    validationState: ValidationState;
    signal: string;            // how you know it's working
  }[];
  
  // How you do it (RING 3)
  activePatterns: {
    id: string;
    name: string;
    type: 'enterprise' | 'method' | 'practice' | 'framework' | 'protocol';
    role: 'anchor' | 'foundation' | 'multiplier' | 'long-game';
    rpplId?: string;           // reference to RPPL pattern library
    description: string;
    fitNarrative: string;
    compiledSteps: string[];   // the pattern compiled for this field
    failureMode: string;       // most likely for their behavioral profile
    capitalImpact: {
      builds: string[];        // which capitals
      costs: string[];         // which capitals
    };
    financials?: {             // only for revenue/cost patterns
      startup?: { low: number; high: number };
      year1?: { low: number; high: number };
      year3?: { low: number; high: number };
      margin?: string;
      weeklyHours: { inSeason: string; offSeason: string };
    };
    supportsActions: string[]; // enabling action IDs
    synergies: string[];       // other pattern IDs
    validationState: ValidationState;
    source: string;            // tradition + attribution
  }[];
  
  // What you're building toward (PERIMETER)
  futureResourceBase: {
    id: string;
    statement: string;
    timeframe: string;         // "by year 3", "ongoing"
    validationState: ValidationState;
  }[];
  
  // The schedule (feeds Operate tab)
  weeklyRhythm: {
    days: {
      day: string;
      theme: string;
      blocks: {
        id: string;
        time: string;
        task: string;
        patternId: string;     // which active pattern
        servesQoL: string[];   // QoL IDs
        duration: number;      // minutes
        signal: string;        // what tells you this worked
        compiledMethod?: {
          patternId: string;
          rpplId: string;
          method: string;
          adaptedSteps: string[];
          failureMode: string;
        };
      }[];
      hardStop: string;
      hardStopQoL: string;     // which QoL it protects
    }[];
    peakSeason: string;
    restSeason: string;
  };
  
  // Metadata
  fieldType: 'land' | 'universal' | 'hybrid';
  createdAt: Date;
  version: number;
  seasonLabel: string;
  
  // Capitals (analytical — feeds Evolve tab)
  capitalProfile: {
    [key: string]: { score: number; note: string };
  };
}

type ValidationState = 'untested' | 'testing' | 'validated' | 'revising' | 'abandoned';

interface ValidationEntry {
  date: Date;
  fromState: ValidationState;
  toState: ValidationState;
  note?: string;              // what prompted the change
}
```

### How Validation States Advance

```
UNTESTED → TESTING
  Trigger: First week of Operate mode where this element has 
  scheduled actions and the operator engages with them.

TESTING → VALIDATED
  Trigger: 4 consecutive weeks where the QoL target is met, 
  the enabling action holds, or the pattern produces expected 
  capital impact.

TESTING → REVISING
  Trigger: 2 consecutive weeks below target, OR the operator 
  reports in the Sunday review that the element doesn't feel right.

REVISING → TESTING
  Trigger: The seasonal review (or mid-season adjustment) produces 
  an updated version. The new version starts TESTING.

TESTING/REVISING → ABANDONED
  Trigger: The operator or seasonal review determines this element 
  should be removed. Archived with full history in Evolve tab.
```

---

## 08 — The Share View (/map/[id])

Separate from /home. Public, read-only.

Shows:
- The spatial canvas (Canvas tab content)
- Validation states visible (adds credibility — shows this is tested)
- Enterprise/pattern details on tap
- Document toggle for print-friendly view
- Share button + dark-mode share card
- "Start your own canvas →" CTA

Does NOT show:
- Operate tab (private schedule data)
- Evolve tab (private trajectory data)
- Editable elements
- Validation history details

The share view is the **artifact.** The /home is the **workspace.**

---

## 09 — Transition: Conversation → Home

After the 6-phase conversation:

1. HUMA says one grounding line (not a paragraph, not a celebration).
2. Screen transitions to /home with Canvas tab active.
3. Spatial canvas entrance animation: essence fades in → QoL pills 
   scale in (staggered) → enabling actions appear → patterns emerge → 
   perimeter materializes. ~4 seconds total.
4. Every element shows ○ (untested). The canvas is light, airy — 
   clearly a beginning, not a finished product.
5. Subtle prompt: "This is your hypothesis. Tap Operate to start 
   testing it."

**The message is clear from the first moment: this is a starting point. 
The real work — and the real discovery — happens in Operate.**

---

## 10 — Design System Notes

### Tab Bar
- Three labels: **Canvas** | **Operate** | **Evolve**
- Active: sage-700, 2px underline
- Inactive: earth-500, no underline
- Top-right of header bar
- Mobile: bottom bar or full-width top

### Validation State Visuals
- ○ Untested: 1px sage-300 stroke, no fill, 40% opacity text
- ◐ Testing: sage-400 half-fill, 70% opacity text
- ● Validated: sage-600 full fill, 100% opacity text
- ⟲ Revising: amber-500 circular arrow icon, amber-100 background
- ✕ Abandoned: earth-400 cross, 30% opacity, visible in Evolve only

### Canvas Tab
- Full viewport SVG
- Sand-50 background
- Organic layout (clustered, not geometric circles)
- HUMA easing on all animations
- Breathing glow on essence: scale 1→1.03, 6s

### Operate Tab
- Sand-50 background
- Time blocks: rounded-lg, pattern-colored left border (4px)
- Expanded: sand-100 bg, WHY in earth-700, HOW in sage-700
- Hard stop: full-width earth-800 line with QoL text
- Drag: block lifts, drop zones highlight sage-100
- Sunday review: full-width cards, tap-to-answer sage-filled

### Evolve Tab
- Sand-50 background
- Shape Timeline: sage fills, progressive opacity
- Validation history: timeline with state dots
- Seasonal review: reuses conversation UI

### Shared
- Header: HUMA wordmark left, tabs center/right
- No sidebar, no hamburger, no settings gear
- Mobile: header compresses

---

## 11 — Implementation Priority

### Phase 1: Three-Tab Shell + Canvas Rebuild (3-4 sessions)
- Create /home route with tab layout
- Kill scaffolding sections from canvas
- Implement Palmer-aligned spatial canvas:
  Essence → QoL cluster → Enabling Actions cluster → Active Patterns
- Add validation state indicators (visual only — ○ on everything)
- Capital radar as toggle overlay
- Operate and Evolve show "Coming soon" placeholder
- Update /map/[id] share view to match new canvas

### Phase 2: Operate Tab — Daily + Weekly (4-5 sessions)
- Daily timeline with pattern-colored blocks
- Hard stop display linked to QoL
- Tap to expand: WHY chain + HOW (compiled pattern)
- Signal per task block
- Weekly 7-column grid
- Pattern coverage bar
- QoL health indicators

### Phase 3: Operate Tab — Interactivity (3-4 sessions)
- Drag and rearrange blocks
- Hard stop editing with consequence display
- Pattern neglect detection
- Compiled RPPL methods in HOW sections

### Phase 4: Operate Tab — Sunday Review + Validation Loop (3-4 sessions)
- Tap-to-answer validation cards
- Systemic insight (one max)
- Validation state advancement logic
- Canvas updates in real-time as review completes
- Validation history tracking

### Phase 5: Evolve Tab (4-5 sessions)
- Canvas versioning
- Shape Timeline (radar overlay/filmstrip)
- Validation history timeline view
- Seasonal review conversation
- Graduation tracking (passive)

### Phase 6: Pattern Compilation Integration (2-3 sessions)
- Compiler logic in task HOW sections
- Field-aware adaptation
- Failure mode surfacing
- Pattern attribution

---

## 12 — The Test

The product passes when:

1. A new operator completes the conversation and sees a canvas full 
   of ○ (untested). They understand this is a beginning.

2. After 4 weeks of Operate mode, their canvas has ◐ and ● elements. 
   They can FEEL the difference between what's tested and what isn't.

3. When something fails, HUMA asks "what could change in the design?" 
   not "what's wrong with you?" The operator learns to think systemically.

4. The Sunday review takes 5 minutes and updates the canvas. The 
   operator watches their life hypothesis get more solid week by week.

5. The seasonal review surfaces: "I thought I wanted X. I actually 
   want Y." The canvas evolves. The shape changes. The operator grows.

6. Eventually, the operator sees wholes without HUMA. They find nodes 
   without prompting. They design their week without checking the app. 
   They graduate. HUMA celebrates this.

The canvas is not a map. It's a hypothesis.
The Operate tab is not a schedule. It's an experiment.
The Evolve tab is not a report. It's a learning record.

HUMA is a hypothesis testing engine for your life.
Build. Test. Learn. Evolve.
