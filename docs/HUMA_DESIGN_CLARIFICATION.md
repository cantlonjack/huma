# HUMA — Design Clarification
## What We Actually Figured Out

*This document is a record of the thinking from the founding design session. It supersedes any earlier descriptions where they conflict. Read this before building anything.*

---

## The Core Realization

HUMA is not a map. HUMA is not a document generator. HUMA is not a chatbot.

**HUMA is a living systems operating environment.**

It does three things that no other tool does simultaneously:

1. **DESIGN** — Help an operator see their life, land, and enterprises as a connected whole and find the highest-leverage interventions
2. **IMPLEMENT** — Translate that design into daily and weekly operational rhythms that are honest about time, energy, and money
3. **EVOLVE** — Track what actually happens, surface patterns, and adjust the design based on lived experience

The analogy that clarified everything: **MapQuest vs Google Maps.**

MapQuest gives you a route. Print it out. Good luck. That's what the Regenerative Enterprise Map was — a beautiful portrait that sits in a drawer.

Google Maps gives you turn-by-turn guidance that knows where you are RIGHT NOW, recalculates when you miss a turn, and learns from millions of other drivers to improve its recommendations over time.

HUMA is Google Maps for regenerative life design.

And Google Maps doesn't start with a 40-minute route planning session. It starts with: *where are you going?* One question. One answer. Turn-by-turn guidance begins immediately. HUMA follows the same principle — the 2-minute entry ("What's on your mind?") delivers value immediately. The full map conversation is earned through progressive engagement, not demanded upfront. See `HUMA_PRODUCT_SURFACE.md` for the complete progressive depth model.

---

## The Three Modes

> **Note (March 2026):** The three modes map to three tabs (**Your Map** / **Your Day** / **Your Journey**), but the ENTRY to the product is NOT the Design conversation. The entry is the 2-minute check-in ("What's on your mind?"). The full map conversation is earned through 1-2 weeks of daily engagement. See `HUMA_PRODUCT_SURFACE.md` for the progressive depth model.

### Mode 1: Design (the initial conversation — done once, revisited seasonally)

This is what we built first. The 6-phase conversation:

1. **Ikigai** — Who are you?
2. **Holistic Context** — What are you reaching for? (with QoL decomposition into operational reality)
3. **Landscape Reading** — What does your land afford? (Regrarians 10-layer sequence)
4. **Enterprise Map** — What could you build? (tested against QoL constraints)
5. **Nodal Interventions** — Where do you begin? (with operational chains)
6. **Operational Design** — What does your week look like? (rhythm + validation protocol)

The output is the **Living Canvas** — the spatial map showing Essence → QoL → Production → Resource Base → Landscape → Enterprises → Actions → Weekly Rhythm, all in relationship.

**This is the onboarding. The hook. The "glasses moment."** But it's not the product people pay for monthly. The product is Mode 2.

### Mode 2: Operate (daily/weekly — the core retention loop)

**Morning Briefing (30 seconds, daily):**
"Here's what matters today." 2-3 priority tasks from the weekly rhythm, adjusted for weather, season, and what's actually happening. Hard stop time reminder. This is the turn-by-turn.

**Weekly Review (10 minutes, Sunday):**
QoL validation checks. Pattern recognition across weeks. One systemic adjustment if warranted. Seasonal awareness. This is the recalculation — "you missed a turn, here's how we adjust."

**The weekly review is the core product.** It's the thing that makes HUMA a daily practice instead of a one-time map. Every Sunday, the operator spends 10 minutes with HUMA, and their operation gets a little more coherent. Over months, the compound effect is transformative.

### Mode 3: Evolve (seasonal — the deep review)

**Seasonal Review (30 minutes, quarterly):**
Capital profile shift over the quarter. QoL trends. Enterprise actuals vs projections. Landscape evolution. The Evolution Question: "What do you know now that you didn't know when this season started?"

This is where the map gets updated. New nodal interventions. Adjusted enterprise projections. Evolved landscape status. The canvas reflects the living reality of the operation, not the initial aspiration.

**This is also where the pattern library grows.** Every seasonal review generates operational wisdom that can be anonymized, structured, and contributed to the commons. "CSA operations above 25 members in Zone 7 climates need dedicated packing infrastructure or evening QoL statements consistently fail" — that's a pattern, learned from practice, validated across operators.

### The Counter-Factual Question

The most powerful feature Operate Mode can eventually offer: "What happens if...?"

When the field dynamics model is mature, HUMA can take the operator's current field, modify the dimensions they're considering changing, run the model forward, and show predicted trajectories with conditions.

"If you quit your job: Money drops to 1, Body stress follows within 2 weeks (coupling: -0.3), BUT Purpose and Joy increase. Net field energy is positive IF Money stabilizes by month 3. The leverage point is client acquisition speed, not financial cushion."

This is not prediction. It's modeling — the same kind of modeling that Google Maps does with traffic data. It requires population data (from simulation and real operators), the coupling model, and the operator's specific field. All three compound with use.

The counter-factual engine must respect the ethical framework: it shows trajectories and conditions, never prescriptions. It says "here's what the model shows" not "you should do this." The operator makes the decision.

---

## The Holistic Management Connection

What we built directly implements the Holistic Management framework (image 15 from Jack's reference):

| HM Framework | HUMA Implementation |
|---|---|
| **Whole Under Management** | Essence Layer — who is involved, what resources exist |
| **Holistic Context** | QoL statements + Production Forms + Future Resource Base |
| **Testing Questions** | Enterprise-QoL validation (does this enterprise honor the context?) |
| **Plan** | Enterprise stack + nodal interventions + weekly rhythm |
| **Monitor** | Weekly review — QoL checks, enterprise performance tracking |
| **Control** | Systemic adjustments surfaced by pattern recognition |
| **Replan** | Seasonal review — update the canvas, adjust the design |
| **Feedback Loop** | The weekly-seasonal cycle that runs continuously |

The VEG holistic context (image 16) shows how this looks when fully expressed: core purpose in the center, QoL statements radiating outward, enabling actions at the next ring, and future resource base at the edges. Every daily action traces back to the purpose. Every purpose expresses through daily action. The rings are not layers of abstraction — they're layers of concreteness.

---

## The QoL Decomposition (The Key Innovation)

This is the thing nobody else does. Other tools let you set goals. HUMA decomposes aspirations into operational reality.

Every QoL statement follows this chain:

```
QoL STATEMENT (aspiration)
  "Evenings free for my daughter"
    │
    ▼
ENABLING CONDITIONS (structural requirements)
  "All revenue work done by 3pm"
  "Packing batched to 2 days/week"
  "No customer communication after 4pm"
    │
    ▼
WEEKLY COMMITMENTS (rhythm)
  "Monday: plan harvest schedule"
  "Tuesday & Thursday: pack days, done by 2pm"
  "Friday: flexible/buffer day"
    │
    ▼
DAILY BEHAVIORS (today's reality)
  "5:30am harvest. 10am pack. 2pm deliver. 3pm done."
    │
    ▼
VALIDATION (weekly signal)
  "How many evenings free? ___/7. Target: 5+"
    │
    ▼
ADJUSTMENT (systemic, never personal)
  "Packing ran long because harvest crops are scattered
   across 8 beds. Cluster next month's succession plan."
```

The aspiration stays fixed. The operational chain adapts based on season, weather, enterprise maturity, and what the operator learns. This is the feedback loop that makes HUMA a living system, not a static plan.

**Critical design principle:** When a validation check fails, HUMA NEVER says "try harder" or "be more disciplined." It ALWAYS looks at the system. "What's breaking this? What could change in the design?" This is Sanford's anti-feedback principle applied to operations: develop capacity, don't enforce compliance.

---

## The Visual System

### The Living Canvas (primary interface)

Center-outward spatial layout. Each ring is more concrete than the last:

1. **Center: Essence** — Name, land, core phrase
2. **Ring 1: Quality of Life** — The innermost commitments (sage pills)
3. **Ring 2: Production Forms** — Kinds of work that fit essence (amber pills)
4. **Ring 3: Future Resource Base** — 10-year commitments (sky pills)
5. **Capital Profile** — 8 circles sized by strength
6. **Ring 4: Landscape** — Regrarians 10-layer strip (permanent → flexible)
7. **Ring 5: Enterprises** — Cards with financials, capital dots, fit narratives
8. **Ring 6: Nodal Interventions** — Actions with cascade chains
9. **Ring 7: Weekly Rhythm** — The operational layer (the new ring)

The canvas is interactive:
- Nodes can be tapped to expand detail
- Enterprises can be traced to the landscape features they connect to
- Cascade chains can be followed from action to outcome
- QoL statements can be tapped to see their operational decomposition
- Capital circles pulse when an enterprise that builds them is selected

### The Document Output (secondary — for print/share)

Linear rendering of the same data for paper. Beautiful typography. Printable. Shareable URL with OG preview. Toggle between canvas view and document view.

### The Operational View (daily product — Mode 2)

This is a DIFFERENT interface from the canvas. Simpler. Faster.

**Morning:** Card-style briefing. Today's date, weather note, 2-3 tasks, hard stop time. Swipe to dismiss. 30 seconds.

**Weekly:** Structured check-in. QoL validation questions (quick taps or number inputs). One insight from HUMA if a pattern is detected. One suggested adjustment if warranted. 10 minutes.

**The operational view should feel like a journal, not a dashboard.** No charts. No metrics. Just clear, warm, specific guidance and honest reflection. The same voice as the conversation — leaning on a fence post, not sitting behind a desk.

---

## The Product Architecture

```
┌─────────────────────────────────────────┐
│         DESIGN MODE (onboarding)         │
│  6-phase conversation → Living Canvas    │
│  Done once. Revisited seasonally.        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         OPERATE MODE (daily product)     │
│  Morning briefing + Weekly review        │
│  This is the retention loop.             │
│  This is what people pay for.            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         EVOLVE MODE (seasonal)           │
│  Quarterly review → Updated canvas       │
│  Pattern contribution to library         │
│  This is the moat.                       │
└─────────────────────────────────────────┘
```

### Revenue Logic

**Free tier:** Design Mode only. The conversation + canvas + document. Unlimited use. This is the growth engine — every shareable map is an ad.

**Paid tier ($29/mo):** Operate Mode. Morning briefings, weekly reviews, QoL tracking, enterprise performance monitoring. The daily GPS. This is where the value lives for working operators.

**Professional tier ($99/mo):** Evolve Mode + multi-client. Seasonal reviews, pattern contribution tools, client management for consultants and educators.

The key insight: **Design Mode is the hook. Operate Mode is the product. Evolve Mode is the moat.**

---

## What We Build Next (Priority Order)

### Already Built
- [x] 6-phase conversation with real AI (prompts.ts)
- [x] Enterprise data templates (14 enterprises, real numbers)
- [x] Document output reference (huma_map_reference.html)
- [x] Living Canvas reference (huma_living_canvas.html)
- [x] Operational decomposition prompts (operational-prompts.ts)

### Build Now (MVP Completion)
1. **QoL decomposition in Phase 2** — When operator states a QoL aspiration, HUMA immediately tests it against operational reality and converts it to a design constraint
2. **Enterprise-QoL validation in Phase 4** — Each enterprise tested against time boundaries and combined daily load
3. **Phase 6: Operational Design** — Weekly rhythm template + QoL validation protocol
4. **"What a Good Week Looks Like" section** in document and canvas output
5. **Name input + location pre-screen** before conversation

### Build Next (v1.5 — first paying users)
6. **Weekly Review** — Sunday check-in experience (new route, not part of initial conversation)
7. **QoL tracking** — Simple data persistence for validation scores over weeks
8. **Pattern recognition** — AI surfaces trends from multi-week data
9. **Morning Briefing** — Daily card with 2-3 tasks + hard stop reminder

### Build Later (v2 — the full operating environment)
10. **Seasonal Review** — Quarterly deep review with canvas update
11. **Enterprise actuals vs projections** — Performance tracking
12. **Landscape evolution tracking** — Regrarians layer status changes over time
13. **Pattern library contributions** — Anonymized insights from operator data
14. **Interactive canvas** — Clickable nodes, traceable connections, live capital updates
15. **Location data integration** — Climate zone, soil type, precipitation from coordinates

---

## What HUMA Must Always Be

A tool that **develops capacity rather than creating dependency.** Every morning briefing should make the operator slightly better at planning their own day. Every weekly review should make them slightly better at reading their own system. Every seasonal review should make them slightly better at seeing the whole.

The measure of HUMA's success is not how often operators use it. It's how much more capable they become. If an operator uses HUMA for two years and then stops because they can see the system clearly on their own — that's a success. They'll tell five other people about it. Those five will sign up. That's regenerative growth.

**The Sanford test:** Is the operator more capable of seeing wholes, finding nodes, and designing for coherence than they were before using this tool? If yes, the tool is regenerative. If no — if they can't function without it — the tool is extractive, regardless of how helpful it feels.

---

## The Name, Revisited

HUMA works on three levels and they all matter:

1. **Huma bird** (Persian mythology) — the bird that never lands, symbolizing fortune and wholeness. You can't capture it. You can only create conditions for it to visit. That's what the tool does — creates conditions for coherence to emerge.

2. **Human + Machine** — humans always first. The AI serves the operator's development. It doesn't replace their judgment or their relationship with the land.

3. **Humus** — living soil. The foundation of all terrestrial life. The thing that regenerative agriculture exists to build. Everything starts there.

---

*This document is alive. It will be updated as the product develops and as operators teach us what works.*

*March 2026*
