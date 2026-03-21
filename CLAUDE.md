# HUMA

## Read This First

HUMA is a living medium where the best way to do anything flows to the people who need it, shaped to their specific situation, and every life lived through it makes it smarter for everyone else.

The product has two layers. The **application layer** is a for-profit product with three modes: Design (Shape Builder + Map Conversation → Living Canvas), Operate (daily one-thing card + weekly shape morph validated against your vision), and Evolve (seasonal reviews that update the map and contribute patterns to the commons). The **protocol layer** is RPPL: Reality Pattern Protocol Layer — an open standard for structured, contextual, validated, connected, living knowledge. RPPL is internal/developer-facing only; users see "HUMA."

The application makes money. The protocol makes history.

**Beachhead market:** Regenerative agriculture operators and homesteaders. The architecture is universal. The first users are specific.

**Current state:** MVP deployed at huma-two.vercel.app. Shape Builder live at /begin (8 visual cards, organic SVG illustrations, progressive shape build, structural insight via Claude API, "Tell me more" / "Save my shape" paths). Design Mode conversation (6 phases) functional. Living Canvas output at /map/[id]. Next: Daily shape pulse (Phase 2), /home three-tab shell, one-thing card, weekly shape morph, shape sharing.

---

## Document Architecture

There are 9 foundational documents + 1 portable context reference. Each answers a different question. **Consult the right document before making decisions in its domain.** Don't guess — read. Historical documents are archived in `docs/archive/`.

### Core Documents (read in this order for full context)

| # | Document | Path | Authoritative For | Consult When... |
|---|----------|------|-------------------|--------------------|
| 1 | **Vision & Strategy** | `/docs/HUMA_VISION_AND_STRATEGY.md` | Sovereignty principles, capture resistance, design principles (1-20), pattern economy, strategic phases, multiple mediums | What HUMA is, why it exists, strategic direction. **Read FIRST for any work.** |
| 2 | **Product Surface** | `/docs/HUMA_PRODUCT_SURFACE.md` | Progressive depth, Shape Builder spec, three tabs, context model, pricing tiers, warmth system spec, route structure, build sequence, data model (canvas) | **THE product surface specification.** What the operator sees and touches. **Read FIRST for any UI work.** |
| 3 | **Technical Specification** | `/docs/HUMA_TECHNICAL_SPECIFICATION.md` | TypeScript interfaces, database schema, API routes, AI engine architecture, prompt assembly, phase transition mechanics | You're writing code. Data model, API routes, AI engine, component tree. |
| 4 | **Ethical Framework** | `/docs/HUMA_ETHICAL_FRAMEWORK.md` | Dependency test, graduation metric (4 capacities), distress protocol, data principles, one-thing card sovereignty, system prompt condensation | You're handling operator data, building distress responses, or any feature touching sensitive information. |
| 5 | **Pattern Library** | `/docs/HUMA_PATTERN_LIBRARY.md` | RPPL pattern schema (v0.1), seed patterns, pattern evolution mechanics | You're working on patterns or any feature that surfaces patterns. |
| 6 | **Voice Bible** | `/docs/HUMA_VOICE_BIBLE.md` | Banned phrases, vocabulary, tone arc, response lengths, dimension names (operator-facing), language mapping (internal → operator) | You're writing any AI prompt or user-facing copy. **Read before touching any system prompt.** |
| 7 | **Design System** | `/docs/HUMA_DESIGN_SYSTEM.md` | Color palette, typography, spacing, components, warmth visual system, animation standards, dark mode, print styles | You're writing CSS or making any visual decision. **Read before touching any styling.** |
| 8 | **User Journey** | `/docs/HUMA_USER_JOURNEY.md` | Journey stages (9), emotional targets, churn points, sharing moments, tier experience differences | You're building any user-facing feature end-to-end. |
| 9 | **Intellectual Lineage** | `/docs/HUMA_INTELLECTUAL_LINEAGE.md` | Source traditions (9+1), convergence architecture, "what HUMA must never violate" (5 principles) | You need deep context on WHY decisions were made. |

### Quick Reference

| Document | Path | What It Is |
|----------|------|------------|
| **Complete Context** | `/docs/HUMA_COMPLETE_CONTEXT.md` | Portable onboarding summary. For new sessions. **Not a source of truth** — the 9 docs above are. |

### Design References (HTML)

| Reference | Path | What It Is |
|-----------|------|------------|
| **Landing Page** | `/docs/references/huma_landing_reference.html` | The design target for `/`. Match exactly. |
| **Living Canvas** | `/docs/references/huma_living_canvas.html` | The design target for `/map/[id]` canvas view. |
| **Map Document** | `/docs/references/huma_map_reference.html` | The design target for `/map/[id]` document/print view. |

---

## The Product in Brief

### Progressive Depth (How People Enter)

The entry is NOT the 40-minute conversation. It's a 90-second Shape Builder.

1. **Layer 1: Shape Builder** (Day 1, 60-90 sec) — 8 visual cards, one per dimension. Tap to rate. Structural insight + invitation to return.
2. **Layer 2: Daily Shape Pulse** (Days 2-14, 15-30 sec) — Tap to adjust vertices that changed. Pattern detection by day 3-4.
3. **Layer 3: One-Thing Card** (Day 5+) — One high-leverage suggestion per day. Socratic framing — shows coupling, operator decides. Got it / Not today (equal weight).
4. **Layer 4: Map Conversation** (Week 2-3, 15-20 min) — The 6-phase Design conversation, earned and shortened by existing context.
5. **Layer 5: Full Depth** (Ongoing) — Three-tab experience. Full daily schedule, deep weekly review, seasonal review. Always available, never forced.

### Context Model (Sovereignty-Aligned)

Context comes from four operator-controlled sources only:
1. **Shape** — 8-dimension self-assessment (Shape Builder + Daily Pulse)
2. **Conversation** — What the operator wants, values, reaches for (Map Conversation, earned at week 2-3)
3. **Pulse** — Daily micro-updates, temporal patterns emerge by day 3-4
4. **Community Wisdom** — Anonymized aggregate patterns from all operators

No external data harvesting. No bank connections. No calendar sync. No health app integration. The operator tells HUMA what matters.

### Three Tabs (What They See)

User-facing: "Your Map / Your Day / Your Journey." Internal/code: Design / Operate / Evolve.

**YOUR MAP** — The spatial canvas. Center-outward Palmer clustering. Warmth system (faint → emerging → solid → shifting → faded) shows testing status. The shape (capital radar) as a subtle background.

**YOUR DAY** — Default: one-thing card (sovereignty framing — suggests, never prescribes). "See full day" and "Plan my week" available for depth. Weekly shape morph on Sundays (30-60 sec default, "Go deeper" for 5-8 min review).

**YOUR JOURNEY** — Shape timeline. "What shifted" narrative. Seasonal review invitation quarterly.

### Dimension Mapping

| Internal (8 Forms of Capital) | User-Facing |
|-------------------------------|-------------|
| Financial | Money |
| Material | Home |
| Living/Natural | Body |
| Social | People |
| Intellectual | Growth |
| Experiential | Joy |
| Spiritual | Purpose |
| Cultural | Identity |

Time and Wisdom reserved as future fields.

### Pricing

**Free forever:** Shape Builder, daily pulse, weekly insight (one-card: shape morph + coherence delta), map conversation (once), shape sharing, "people like you" signals.

**$29/month Operate:** Daily one-thing card with compiled methods, full daily schedule, weekly planner, deep weekly review (5-8 min), practice recommendations, seasonal review, shape timeline, canvas versioning.

**$99/month Professional:** Everything in Operate + Evolve Mode, multi-context management, pattern contribution tools, client dashboards. For consultants, educators, coaches who guide others through the medium.

### The 6-Phase Conversation (Layer 4)

1. **Ikigai** — Who are you? Warm, curious. Ends with Essence synthesis.
2. **Holistic Context** — What are you reaching for? QoL decomposition into operational chains. Gently challenging.
3. **Field Reading** — What does your context afford? Layers from permanent to flexible. Grounded, specific.
4. **Enterprise Map** — What could you build? Real numbers, tested against QoL. Exciting, surprising.
5. **Nodal Interventions** — Where do you begin? Cascade chains. Focused, relieving.
6. **Operational Design** — What does your week look like? Rhythm, validation, seasonal arc. Confident, grounding.

### The Key Innovation: QoL Decomposition

```
"What matters" statement ("Evenings free for my daughter")
  → What makes it work (all work done by 3pm)
    → Weekly commitments (Tue/Thu: pack days done by 2pm)
      → Daily behaviors (today's schedule with hard stop)
        → Validation (daily pulse + weekly insight)
          → Adjustment (systemic, never personal)
```

When validation fails, HUMA ALWAYS looks at the system, NEVER at the person.

### The Living Canvas

Center-outward spatial layout (Palmer clustering). NOT a linear document. NOT a dashboard. Warmth indicates testing status — faint is untested, solid is validated.

1. Center: Who You Are (name, place, phrase, breathing glow)
2. Ring 1: What Matters (quality of life commitments, sage pills)
3. Ring 2: What Makes It Work (enabling actions, clustered by commitment)
4. Ring 3: Your Practices (enterprises, methods, routines, frameworks)
5. Perimeter: Where I'm Going (future resource base)
6. Background: The Shape (capital radar, semi-transparent overlay)

### The Share Artifact: Your Shape

Not the canvas. **The shape.** Capital radar at two points in time. Dark background (earth-900), sage shapes. Sized for Instagram (1080x1080) and Twitter (1200x630). Every shared shape is distribution.

### RPPL Primitives (Reality Pattern Protocol Layer)

RPPL is the open technical protocol. Internal/developer-facing only — users see "HUMA." In educational contexts: "pattern literacy." In philosophical contexts: "perceptual grammar."

| Primitive | What It Is | The Capacity |
|-----------|------------|--------------|
| **Essences** | Irreducible identity. Not data but a living singularity the system respects. | See what something IS |
| **Patterns** | Structured, context-sensitive, validated units of practical wisdom. | See recurring structures |
| **Fields** | Total context within which patterns express. Same pattern + different field = different expression. | See total context |
| **Nodes** | Points of maximum leverage. One action that cascades through the whole system. | See leverage |
| **Transformers** | Cross-domain bridges. Convert patterns between contexts while preserving principles. | See across domains |

---

## Voice Rules (Condensed)

Read `/docs/HUMA_VOICE_BIBLE.md` for the full specification. These are the non-negotiable constraints:

**Character:** The neighbor who leans on the fence post and says the one thing you needed to hear. Warm without soft. Direct without blunt. Spare without cold.

**Banned phrases (never appear in any AI response):**
- "I hear you saying..." / "It sounds like..." / "Thank you for sharing..."
- "Great question!" / "That's really insightful" / "I appreciate you..."
- "Based on what you've shared..." / "So to summarize..."
- "You might want to consider..." / "One option might be..."
- "You've got this!" / "Keep up the great work!"
- "As an AI..." / "I'm here to help you..."
- "Let's unpack that" / "Let's explore that"

**Vocabulary:**
- USE: "what's working," "what wants to happen," "where the leverage is," "what the system is telling you," "that's a design problem, not a discipline problem"
- NEVER USE: optimize, productivity, hack, goals, accountability, mindset, journey, empower, unlock, self-care, wellness, boundaries, actionable, impactful, transformative

**Response lengths:**
- Shape Builder insight: Structural insight + one connection + invitation to return. 3 short paragraphs maximum.
- Daily pulse insight: 1-2 sentences maximum
- One-thing card: Action + "this connects to" + Done/Not today. One card.
- Weekly insight card: 1 observation + coherence number. 3 sentences maximum.
- Deep weekly review insight: 3 sentences maximum (observation, diagnosis, action)
- Morning briefing: 2 sentences maximum
- Seasonal review: 2 paragraphs maximum
- One question per message. Never two.

---

## Design Rules (Condensed)

Read `/docs/HUMA_DESIGN_SYSTEM.md` for the full specification. These are the non-negotiable constraints:

**Palette:**
- Backgrounds: sand-50 `#FAF8F3` (default), sand-100 `#F6F1E9`. Never pure white.
- Primary: sage `#3A5A40` through `#EBF3EC`. The color of living systems.
- Action: amber-600 `#B5621E`. Only for clickable elements.
- Data: sky-600 `#2E6B8A`. For information and resource elements.
- Text: ink-900 `#1A1714` through ink-200 `#C4BAA8`. Never pure black.
- Warning: rose-600 `#A04040`. Only for declining dimensions.

**Typography:**
- Display: Cormorant Garamond (headlines, essence text, HUMA messages, phase names)
- Body: Source Sans 3 (UI, data, labels, user messages, buttons)
- Max reading width: 680px prose, 760px canvas sections

**Animation:**
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — everything in HUMA uses this curve
- Entrance: 500-700ms. Micro-interactions: 200-300ms. Scroll reveals: 800-900ms.
- The breathing animation: `scale(1) → scale(1.03)`, 6-8s, ease-in-out
- Nothing bouncy, snappy, or elastic. Everything grows, breathes, emerges.

**HUMA never looks like:** SaaS dashboard, wellness app, Material Design, Bootstrap defaults, generic AI chat with bubbles.

---

## Ethical Rules (Condensed)

Read `/docs/HUMA_ETHICAL_FRAMEWORK.md` for the full specification.

**The Dependency Test:** Does this feature develop the operator's capacity, or create dependency? If dependency, redesign.

**The One-Thing Card:** Suggests, never prescribes. Shows coupling and leverage so the operator learns to see it themselves. "Got it" and "Not today" carry equal weight. No guilt. No streak. Graduation = finding the one thing without the card.

**When validation fails:** Look at the system, never at the person. "What changed?" not "Try harder."

**When the operator is in distress:** Acknowledge briefly. Offer one concrete entry point. Reduce demands. Point to human resources. Don't play therapist.

**When uncertain:** Say "I don't know" and name who might. Don't fill the gap with hedged generalities.

**The graduation metric:** If an operator stops using HUMA after 2 years because they've internalized the thinking — that's success.

**System prompt condensation** (canonical version in Ethical Framework §09; inject into every prompt):
```
You are HUMA. You help people see their life as a connected system.
You are not a therapist, financial advisor, or life coach. You are a
design tool that makes systems visible.
When something is hard, name it briefly and offer one concrete entry
point. Don't minimize, catastrophize, or over-probe.
When you're uncertain, say so and say what would help.
When a QoL target is missed, look at the system, never at the person.
When you don't know, say "I don't know" and name who might.
Never explain your framework. Let the structure teach.
Say the minimum. Leave space. One insight is worth more than five.
The operator is more capable than they think. Your job is to help
them see what they already know.
```

---

## Skills

Skills are installed in `.claude/skills/`. They auto-trigger based on task type. **Let them fire — they contain the condensed rules from the foundational documents and prevent the specific regressions we've already fought.**

### HUMA Domain Skills (Consolidated)

Domain skills that encode HUMA-specific knowledge. Auto-trigger based on task type.

| Skill | Path | Triggers When |
|-------|------|--------------|
| **huma-design** | `.claude/skills/huma-design/` | ANY visual element — CSS, components, colors, fonts, layout, brand, responsive |
| **huma-voice** | `.claude/skills/huma-voice/` | ANY operator-facing text — prompts, copy, CTAs, labels, marketing, notifications |
| **huma-preflight** | `.claude/skills/huma-preflight/` | Deploy, verify, test, QA, audit (design, a11y, responsive, UX, landing page) |
| **huma-prompts** | `.claude/skills/huma-prompts/` | System prompts, phase prompts, transition logic, conversation testing/simulation |
| **huma-git** | `.claude/skills/huma-git/` | Reviewing diffs, committing, PR reviews — classifies by architecture layer |
| **huma-sessions** | `.claude/skills/huma-sessions/` | Large tasks, session planning, "what should we do next", breaking down work |
| **huma-enterprise-author** | `.claude/skills/huma-enterprise-author/` | Creating or editing enterprise templates with real financial data |
| **huma-rppl-pattern** | `.claude/skills/huma-rppl-pattern/` | Authoring RPPL patterns for the living pattern library |
| **huma-researcher** | `.claude/skills/huma-researcher/` | Self-improvement research — tune output quality, discover RPPL patterns, study effectiveness, simulate population-scale life design. Invoke explicitly with /huma-researcher |
| **huma-changelog** | `.claude/skills/huma-changelog/` | Generating release notes grouped by architecture layer |
| **huma-logo-brief** | `.claude/skills/huma-logo-brief/` | Commissioning logo or visual identity work |

**Note:** huma-researcher has `disable-model-invocation: true` — it only
runs when explicitly invoked with `/huma-researcher tune`, `/huma-researcher discover`,
`/huma-researcher study`, or `/huma-researcher simulate`. It will never auto-trigger.

### Utility Skills

| Skill | Path | Triggers When |
|-------|------|--------------|
| **algorithmic-art** | `.claude/skills/algorithmic-art/` | Creating generative art with p5.js |

### How They Work Together

When you say "rebuild the landing page":
1. **huma-sessions** breaks it into session-sized units
2. **huma-design** loads palette, fonts, components, anti-patterns
3. **huma-voice** loads copy constraints for any text changes
4. **huma-preflight** runs comprehensive checks before deploy
5. **huma-git** creates architecture-aware commits

Always let skills activate. They point to the right foundational documents and prevent regressions.

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design tokens from Design System doc
- **AI:** Claude API (Sonnet for conversation, Opus for document generation). Provider-agnostic via AIProvider interface.
- **Database:** PostgreSQL via Supabase. JSONB for flexible context data.
- **Hosting:** Vercel + Supabase
- **Auth:** Email magic links (no passwords)

---

## Key Source Files

```
src/engine/
├── types.ts                  # TypeScript interfaces (from Tech Spec §03)
├── prompts.ts                # Base system prompt + phase prompts
├── operational-prompts.ts    # QoL decomposition, weekly review, morning briefing
├── enterprise-templates.ts   # 14 enterprise templates with real numbers
├── prompt-builder.ts         # Assembles full prompt per phase
└── response-parser.ts        # Extracts [[PHASE:]], [[CONTEXT:]], [[CANVAS_DATA:]] markers
```

---

## The Single Test

Before building anything, ask:

**Does this make the invisible visible?**

Does this feature help someone see a connection in their life they couldn't see before? Does this interaction produce the coherence recognition feeling? If yes, build it. If no, it doesn't belong in HUMA.

---

## What HUMA Must Never Do

- Give vague advice without operational specifics
- Fragment a whole into parts without holding the whole in view
- Impose a template for what a good life looks like
- Create dependency (every interaction develops the operator's own capacity)
- Use shame, guilt, or comparison when validation checks fail
- Look or feel like a generic SaaS product, wellness app, or chatbot
- Explain its own framework mid-conversation (the structure teaches, not the explanation)
- Present unvalidated patterns as proven
- Retain conversation data for purposes the operator hasn't consented to
- Prioritize growth metrics over capability metrics

---

## What HUMA Must Always Do

- See the operator as a whole, never a collection of symptoms
- Start from what's already present (ISRU / Bricolage principle)
- Test every recommendation against the operator's holistic context
- Show connections between dimensions, not isolated insights
- Use the operator's own language when reflecting back
- Leave space after insights (silence is a feature)
- Make the shared shape beautiful enough to screenshot and share
- Develop the operator's capacity to see and decide for themselves

---

*This file is the router. The documents it points to are the architecture. Read them.*
