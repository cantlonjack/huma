# HUMA

## Read This First

HUMA is infrastructure for running your life as one connected system. Not a wellness app. Not a life design tool. Not a coach. Infrastructure — like Google Maps is infrastructure for navigation. You don't use HUMA to improve yourself. You use it because your life runs better with it than without it.

The product has two layers. The **application layer** is a for-profit product built on three layers: Conversation (how HUMA learns you), Computation (how HUMA thinks — RPPL decomposition, cross-dimensional correlation, pattern matching), and Output (how HUMA serves you — the daily production sheet, insight cards, the canvas that materializes over time). The **protocol layer** is RPPL: Reality Pattern Protocol Layer — an open standard for structured, contextual, validated, connected, living knowledge. RPPL is internal/developer-facing only; users see "HUMA."

The application makes money. The protocol makes history.

**Beachhead market:** Universal. The architecture serves anyone who wants their life to run better. Entry points are pain-specific: "I want to eat better," "I'm always broke," "I never have time."

**Current state:** V2 MVP in development. V1 (Lotus Flow, workspace with petals) archived on `v1-archive` branch. Core loop: conversation → decomposition → production sheet → insight.

### Build Sequence

[SHIPPED — V1, ARCHIVED] Landing page, 6-phase conversation, Lotus Flow onboarding, workspace with petals, sample maps, Supabase auth, 351+ tests

[BUILDING — V2 MVP] Conversation interface at /start → Decomposition engine → Daily production sheet at /today → Ongoing chat at /chat → Insight engine

[NEXT] Template gallery (forkable aspiration bundles) → Pattern commons (cross-operator validated knowledge) → Canvas view (Palmer map materializes from accumulated context) → Mobile field companion

[FUTURE] Voice input, full pattern economy, multi-context management (Professional tier)

### Resolved Decisions

| Decision | Resolution |
|----------|-----------|
| Entry experience | Open conversation: "What's going on?" + dynamic palette sidebar. NOT guided onboarding flow. |
| Daily experience | Production sheet (bakery worksheet model). Glanceable, checkable, zero cognitive load. |
| Capital scores | COMPUTED from behavior data through decomposition chains. NOT self-reported. |
| Context building | Through conversation and use over time. NOT forms or onboarding screens. |
| Product model | Life operating system. Infrastructure, not self-improvement tool. |
| Form factors | Mobile-first (production sheet). Desktop for canvas/deep work. |
| RPPL components | Components → Patterns → Frameworks (protocol-level vocabulary only). |
| V1 architecture | Archived on v1-archive branch. Lotus Flow, petals, workspace may return in evolved form. |

---

## Document Architecture

There are 9 foundational documents + 1 V2 Foundation + 1 portable context reference. **The V2 Foundation supersedes previous product surface, user journey, and technical architecture where they conflict.** The 9 docs remain valid for intellectual lineage, ethics, voice, design language, and RPPL theory.

### Source of Truth

| Document | Path | Status |
|----------|------|--------|
| **V2 Foundation** | `/docs/HUMA_V2_FOUNDATION.md` | **PRIMARY.** The core loop, three layers, entry point, production sheet, insight engine, growth model, MVP spec. **Read FIRST for any product or build decision.** |

### Core Documents (read in this order for full context)

| # | Document | Path | Authoritative For | Consult When... |
|---|----------|------|-------------------|--------------------|
| 1 | **Vision & Strategy** | `/docs/HUMA_VISION_AND_STRATEGY.md` | Sovereignty principles, capture resistance, design principles (1-20), pattern economy, strategic phases, multiple mediums | What HUMA is, why it exists, strategic direction. |
| 2 | **Product Surface** | `/docs/HUMA_PRODUCT_SURFACE.md` | ⚠️ **PARTIALLY SUPERSEDED by V2 Foundation.** Warmth system spec, pricing tiers, dimension mapping, canvas data model still valid. Entry experience, daily experience, workspace model, and route structure are superseded. | Legacy reference for warmth system, canvas data structures, pricing. |
| 3 | **Technical Specification** | `/docs/HUMA_TECHNICAL_SPECIFICATION.md` | ⚠️ **PARTIALLY SUPERSEDED by V2 Foundation.** AI engine architecture, prompt assembly patterns, provider abstraction still valid. Database schema, route structure, and component tree are superseded. | AI engine patterns, prompt architecture. New schema is in V2 Foundation + build prompt. |
| 4 | **Ethical Framework** | `/docs/HUMA_ETHICAL_FRAMEWORK.md` | Dependency test, graduation metric (4 capacities), distress protocol, data principles, sovereignty | You're handling operator data, building distress responses, or any feature touching sensitive information. **Fully valid.** |
| 5 | **Pattern Library** | `/docs/HUMA_PATTERN_LIBRARY.md` | RPPL pattern schema (v0.1), seed patterns, pattern evolution mechanics | You're working on patterns or any feature that surfaces patterns. **Fully valid.** |
| 6 | **Voice Bible** | `/docs/HUMA_VOICE_BIBLE.md` | Banned phrases, vocabulary, tone arc, response lengths, dimension names (operator-facing), language mapping (internal → operator) | You're writing any AI prompt or user-facing copy. **Read before touching any system prompt. Fully valid.** |
| 7 | **Design System** | `/docs/HUMA_DESIGN_SYSTEM.md` | Color palette, typography, spacing, components, warmth visual system, animation standards, dark mode, print styles | You're writing CSS or making any visual decision. **Read before touching any styling. Fully valid.** |
| 8 | **User Journey** | `/docs/HUMA_USER_JOURNEY.md` | ⚠️ **PARTIALLY SUPERSEDED by V2 Foundation.** Emotional targets and churn point analysis still relevant. Journey stages and specific flows are superseded. | Emotional design reference. |
| 9 | **Intellectual Lineage** | `/docs/HUMA_INTELLECTUAL_LINEAGE.md` | Source traditions (9+1), convergence architecture, "what HUMA must never violate" (5 principles) | You need deep context on WHY decisions were made. **Fully valid.** |

### Quick Reference

| Document | Path | What It Is |
|----------|------|------------|
| **Complete Context** | `/docs/HUMA_COMPLETE_CONTEXT.md` | Portable onboarding summary. ⚠️ **Partially outdated — V2 Foundation is now the primary reference.** |

### Build Prompts

| Document | Path | What It Is |
|----------|------|------------|
| **V2 MVP Build Prompt** | `/docs/cc-prompt-huma-v2-mvp.md` | The CC build prompt for the V2 core loop. Conversation + decomposition + production sheet + insight engine. |

### Design References (HTML)

| Reference | Path | What It Is |
|-----------|------|------------|
| **Landing Page** | `/docs/references/huma_landing_reference.html` | The design target for `/`. Match exactly. |
| **Living Canvas** | `/docs/references/huma_living_canvas.html` | The design target for `/map/[id]` canvas view. (Future — canvas materializes from accumulated context.) |
| **Map Document** | `/docs/references/huma_map_reference.html` | The design target for `/map/[id]` document/print view. (Future.) |

---

## The Product in Brief (V2)

### The Core Loop

1. **Conversation:** Operator says what's going on. HUMA structures it, clarifies through tappable options, decomposes into behaviors.
2. **Computation:** RPPL decomposes aspirations into behavior chains with dimensional mappings. Cross-references behavior data for correlations. Invisible to operator.
3. **Production Sheet:** Daily output. 3-5 specific, actionable behaviors for today. Mobile-first. Check off as you go. This is the bakery worksheet.
4. **Insight:** After enough behavior data, HUMA reveals a cross-dimensional connection the operator didn't see. "On days you cook dinner, everything else in your evening works. Every time."

### Entry Point

**"What's going on?"** Open conversation prompt. No onboarding flow. No forms. Dynamic palette sidebar shows related pain points and aspirations based on conversation context. The palette solves the nescience problem — people don't know life design is a thing, so the palette shows what's possible.

Value delivered in under 2 minutes: first aspiration decomposed into behaviors, first production sheet populated.

### Context Model (Sovereignty-Aligned)

Context enters through conversation and use, not forms:
1. **Conversation** — operator says what's on their mind, HUMA structures and stores it
2. **Production Sheet Usage** — check-offs, skips, and patterns become behavioral data
3. **Ongoing Chat** — context deepens organically over time ("I have a half cow in the freezer")
4. **Community Wisdom** — anonymized aggregate patterns from all operators (future)

No external data harvesting. No bank connections. No calendar sync. No health app integration. Every piece of context is a gift the operator chooses to give because they got value back.

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

Dimensions are COMPUTED from behavior data through decomposition chains, NOT self-reported.

### Route Structure (V2)

```
/               Landing page (keep existing for now)
/start          Conversation entry point (new)
/today          Daily production sheet (new)
/chat           Ongoing conversation with HUMA (new)
/api/decompose  Decomposition endpoint (new)
/api/sheet      Production sheet compilation (new)
/api/insight    Insight computation (new)
```

### Pricing

**Free forever:** Conversation with HUMA. Up to 3 aspirations decomposed. Basic daily production sheet. Weekly view. One insight when data supports it. Template browsing.

**$29/month Operate:** Unlimited aspirations. Full cross-dimensional computation. Deep production sheet (specific recipes, specific financial actions, seasonal planning). Pattern commons access. Canvas view. Template publishing.

**$99/month Professional:** Multi-context management (clients, students, patients). Professional dashboard. Bulk template creation. API access.

### The Key Innovation: Decomposition → Computation → Insight

```
Aspiration ("I want to eat clean")
  → Clarification (animal-based/keto, family of two)
    → Behavior chain (meal prep Sunday, cook 4 nights, farmers market)
      → Dimensional mapping (Body + Money + Home + Joy + People)
        → Daily production sheet (specific meals, recipes, shopping list)
          → Behavior data (check-offs over days/weeks)
            → Cross-dimensional correlation (cooking correlates with sleep, 95%)
              → Insight ("Your food rhythm and your sleep are connected")
```

The operator experiences: talk → daily checklist → surprise insight. The decomposition engine, dimensional mapping, and correlation computation are invisible.

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

**Response lengths (V2):**
- Conversation clarification: tappable options + 1 sentence of context
- Decomposition output: behavior list + 1 sentence framing
- Production sheet items: specific action + brief detail. No essays.
- Insight card: 3 sentences maximum (observation, connection, implication)
- Palette suggestions: just the concept text, no explanation
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
- Display: Cormorant Garamond (headlines, HUMA messages, insight cards)
- Body: Source Sans 3 (UI, data, labels, user messages, buttons, production sheet)
- Max reading width: 680px prose, 760px canvas sections

**Animation:**
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — everything in HUMA uses this curve
- Entrance: 500-700ms. Micro-interactions: 200-300ms.
- The breathing animation: `scale(1) → scale(1.03)`, 6-8s, ease-in-out
- Nothing bouncy, snappy, or elastic. Everything grows, breathes, emerges.

**HUMA never looks like:** SaaS dashboard, wellness app, Material Design, Bootstrap defaults, generic AI chat with bubbles.

---

## Ethical Rules (Condensed)

Read `/docs/HUMA_ETHICAL_FRAMEWORK.md` for the full specification.

**The Dependency Test:** Does this feature develop the operator's capacity, or create dependency? If dependency, redesign.

**The Sovereignty Test:** Is this context entering through the operator's choice, or through surveillance? If surveillance, it doesn't belong.

**When validation fails:** Look at the system, never at the person. "What changed?" not "Try harder."

**When the operator is in distress:** Acknowledge briefly. Offer one concrete entry point. Reduce demands. Point to human resources. Don't play therapist.

**When uncertain:** Say "I don't know" and name who might. Don't fill the gap with hedged generalities.

**The graduation metric:** If an operator stops using HUMA after 2 years because they've internalized the thinking — that's success.

**System prompt condensation** (inject into every prompt):
```
You are HUMA. You help people run their lives as one connected system.
You are not a therapist, financial advisor, or life coach. You are
infrastructure that reduces cognitive load and reveals connections.
When something is hard, name it briefly and offer one concrete entry
point. Don't minimize, catastrophize, or over-probe.
When you're uncertain, say so and say what would help.
When a behavior isn't sticking, look at the system, never at the person.
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

| Skill | Path | Triggers When |
|-------|------|--------------|
| **huma-design** | `.claude/skills/huma-design/` | ANY visual element — CSS, components, colors, fonts, layout, brand, responsive |
| **huma-voice** | `.claude/skills/huma-voice/` | ANY operator-facing text — prompts, copy, CTAs, labels, notifications |
| **huma-preflight** | `.claude/skills/huma-preflight/` | Deploy, verify, test, QA, audit |
| **huma-prompts** | `.claude/skills/huma-prompts/` | System prompts, phase prompts, transition logic, conversation testing |
| **huma-git** | `.claude/skills/huma-git/` | Reviewing diffs, committing, PR reviews |
| **huma-sessions** | `.claude/skills/huma-sessions/` | Large tasks, session planning, breaking down work |
| **huma-enterprise-author** | `.claude/skills/huma-enterprise-author/` | Creating or editing enterprise templates |
| **huma-rppl-pattern** | `.claude/skills/huma-rppl-pattern/` | Authoring RPPL patterns |
| **huma-researcher** | `.claude/skills/huma-researcher/` | Self-improvement research. Invoke explicitly with /huma-researcher |
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

When you say "build the /start conversation":
1. **huma-sessions** breaks it into session-sized units
2. **huma-design** loads palette, fonts, components, anti-patterns
3. **huma-voice** loads copy constraints for any HUMA response text
4. **huma-prompts** loads conversation prompt architecture
5. **huma-preflight** runs comprehensive checks before deploy
6. **huma-git** creates architecture-aware commits

Always let skills activate. They point to the right foundational documents and prevent regressions.

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design tokens from Design System doc
- **AI:** Claude API (Sonnet for conversation + sheet compilation, Haiku for palette, Opus for insight generation). Provider-agnostic via AIProvider interface.
- **Database:** PostgreSQL via Supabase. JSONB for flexible context data. New V2 tables: contexts, aspirations, sheet_entries, insights, chat_messages.
- **Hosting:** Vercel + Supabase
- **Auth:** Email magic links (no passwords). Pre-auth state in localStorage, migrated to Supabase on auth.

---

## Key Source Files

### V1 Engine (archived, may inform V2)
```
src/engine/
├── types.ts                  # TypeScript interfaces
├── prompts.ts                # Base system prompt + phase prompts
├── operational-prompts.ts    # QoL decomposition, weekly review, morning briefing
├── enterprise-templates.ts   # 14 enterprise templates with real numbers
├── prompt-builder.ts         # Assembles full prompt per phase
└── response-parser.ts        # Extracts [[PHASE:]], [[CONTEXT:]], [[CANVAS_DATA:]] markers
```

### V2 Routes (building)
```
app/start/                    # Conversation entry point
app/today/                    # Daily production sheet
app/chat/                     # Ongoing conversation
app/api/decompose/            # Decomposition endpoint
app/api/sheet/                # Production sheet compilation
app/api/insight/              # Insight computation
```

---

## The Single Test

Before building anything, ask:

**Does this reduce cognitive load and reveal connections?**

Does this feature help the operator's life run better? Does it surface a connection they couldn't see before? Does the operator have to think less, not more? If yes, build it. If no, it doesn't belong in HUMA.

---

## What HUMA Must Never Do

- Give vague advice without operational specifics
- Fragment a whole into parts without holding the whole in view
- Impose a template for what a good life looks like
- Create dependency (every interaction develops the operator's own capacity)
- Use shame, guilt, or comparison when behaviors don't stick
- Look or feel like a generic SaaS product, wellness app, or chatbot
- Explain its own framework mid-conversation (the structure teaches, not the explanation)
- Present unvalidated patterns as proven
- Retain conversation data for purposes the operator hasn't consented to
- Prioritize growth metrics over capability metrics
- Scrape, surveil, or infer from external data sources without the operator's gift

---

## What HUMA Must Always Do

- See the operator as a whole, never a collection of symptoms
- Start from what's already present (ISRU / Bricolage principle)
- Test every recommendation against the operator's holistic context
- Show connections between dimensions, not isolated insights
- Use the operator's own language when reflecting back
- Leave space after insights (silence is a feature)
- Make the shared insight beautiful enough to screenshot and send
- Develop the operator's capacity to see and decide for themselves
- Deliver specific, actionable outputs — not plans, not advice, but "here's your tomorrow"

---

*This file is the router. The documents it points to are the architecture. Read them.*
