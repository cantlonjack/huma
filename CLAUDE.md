# HUMA

## Read This First

HUMA is infrastructure for running your life as one connected system. Not a wellness app. Not a life design tool. Infrastructure — like Google Maps is infrastructure for navigation. You use it because your life runs better with it than without it.

**What HUMA does that no other app can:** Show you how the different parts of your life are connected — and which specific daily behaviors are the leverage points that hold everything together.

**Current state:** V2.1 in development. The artifact-first redesign. Three screens: Today (production sheet, home), System (visible life map), Talk (conversation tool). Entry flow at `/start` works. Decomposition engine works. Sheet compilation works. Session 8 builds the structural redesign.

---

## Document Architecture

**8 active documents.** Everything else is archived.

### Source of Truth

| Document | What It Governs |
|----------|----------------|
| **V2 Foundation** (`HUMA_V2_FOUNDATION.md`) | **PRIMARY.** The three layers (Conversation → Computation → Output), product surface (three screens), entry flow, production sheet, insight engine, growth model. **Read FIRST for any product or build decision.** |

### Foundational Documents

| # | Document | Authoritative For | Consult When... |
|---|----------|-------------------|-----------------|
| 1 | **Vision & Strategy** (`HUMA_VISION_AND_STRATEGY.md`) | What HUMA is, why it exists, sovereignty principles, five capacities, pattern economy, strategic phases, multiple mediums, naming hierarchy | Strategic direction, what HUMA must never violate |
| 2 | **Design System** (`HUMA_DESIGN_SYSTEM.md`) | Colors, fonts, spacing, components, warmth system, animation, dark mode | Any visual decision, any CSS, any component styling |
| 3 | **Voice Bible** (`HUMA_VOICE_BIBLE.md`) | How HUMA speaks, banned phrases, vocabulary, tone arc, response lengths, dimension naming | Any AI prompt, any user-facing copy, any system prompt |
| 4 | **Ethical Framework** (`HUMA_ETHICAL_FRAMEWORK.md`) | Dependency test, graduation imperative, distress protocol, data principles, sovereignty | Handling operator data, distress responses, any feature touching sensitive information |
| 5 | **Pattern Library** (`HUMA_PATTERN_LIBRARY.md`) | RPPL pattern schema (v0.1), 12 seed patterns, pattern evolution mechanics | Working on patterns, insight engine, template system |
| 6 | **Intellectual Lineage** (`HUMA_INTELLECTUAL_LINEAGE.md`) | Source traditions (Adrià, Sanford, Savory, Perkins, Palmer, Alexander, Satoshi, Fuller, Socrates), convergence architecture | Deep context on WHY decisions were made |

### Archived (do not consult for current build decisions)

These documents describe V1 architecture (Lotus Flow, workspace with petals, Shape Builder, three-tab "Your Map/Your Day/Your Journey") or V2 MVP architecture (chat-first, /start → /today → /chat without System screen). They are superseded by the V2 Foundation.

- `HUMA_PRODUCT_SURFACE.md` — V1 product surface. Superseded.
- `HUMA_TECHNICAL_SPECIFICATION.md` — V1 tech spec. Superseded.
- `HUMA_USER_JOURNEY.md` — V1 journey stages. Superseded.
- `HUMA_COMPLETE_CONTEXT.md` — Outdated portable summary. Superseded.
- `cc-prompt-onboarding-v2.md` — Lotus Flow build spec. Retired.
- `cc-prompt-huma-v2-mvp.md` — V2 MVP build prompt. Superseded by Session 8.

---

## The Product in Brief

### The Core Loop

1. **Conversation:** Operator says what's going on. HUMA structures it, clarifies through tappable options, decomposes into behaviors with dimensional mappings.
2. **Computation:** RPPL decomposes aspirations into behavior chains. Maps dimensions. Finds connections between aspirations through shared behaviors. Cross-references behavior data for correlations. All invisible.
3. **System:** The visible artifact — aspirations, behaviors, connections, context — growing and editable. The thing the operator is building without having to design it.
4. **Production Sheet:** Daily output. 3-5 specific, actionable behaviors for today. Check off as you go. Checking IS the data collection.
5. **Insight:** Structural (Day 1, from decomposition) and behavioral (Week 2+, from check-off data). Cross-dimensional connections the operator didn't see.

### Three Screens

| Screen | Route | What It Is | When They Use It |
|--------|-------|-----------|-----------------|
| **Today** | `/today` | Production sheet. Home screen. | 10 seconds every morning |
| **System** | `/system` | Visible life map. Aspirations, behaviors, connections, context, palette. | 2-5 minutes when adding/exploring |
| **Talk** | `/chat` | Conversation tool. Context card + exchanges. | When they want to tell HUMA something |

Navigation: Today | System | Talk (bottom tab bar). Today is home. Tab bar hidden on `/start`.

### Entry Point

`/start` → "What's going on?" → conversation → clarification → decomposition → "Start this Sunday" → auth → redirect to `/today`.

The conversation produces structured data: aspiration record, behavior records with dimensional mappings, extracted context. This data populates the System screen immediately.

### Context Model

Context enters through conversation and use, not forms:
1. **Conversation** — operator says what's on their mind, HUMA structures and stores it
2. **Production Sheet Usage** — check-offs, skips, and patterns become behavioral data
3. **Quick Additions** — conversation sheet overlay from any screen for fast context updates
4. **Community Wisdom** — anonymized aggregate patterns from all operators (future)

No external data harvesting. Every piece of context is a voluntary gift.

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

### Route Structure

```
/               Landing page
/start          Conversation entry point (first-time flow)
/today          Daily production sheet (HOME for authed users)
/system         Life system view (aspirations, behaviors, connections, palette)
/chat           Conversation tool (context card + history)
/api/decompose  Decomposition endpoint
/api/sheet      Production sheet compilation
/api/insight    Insight computation
/api/context    Context extraction
```

### Pricing

**Free forever:** Up to 3 aspirations. Basic production sheet. One insight when data supports it. Template browsing.

**$29/month Operate:** Unlimited aspirations. Full cross-dimensional computation. Deep production sheet. Pattern commons access. Canvas view. Template publishing.

**$99/month Professional:** Multi-context management. Professional dashboard. API access.

---

## Resolved Decisions (Do Not Revisit)

| Decision | Resolution |
|----------|-----------|
| Entry experience | Open conversation: "What's going on?" NOT guided onboarding. |
| Home screen | Production sheet (`/today`). NOT a chat page. |
| Visible artifact | System screen (`/system`) with aspirations, behaviors, connections, context. |
| Conversation model | Ephemeral input → structured output. NOT a growing chat log. |
| Capital scores | COMPUTED from behavior through decomposition chains. NOT self-reported. |
| Context building | Through conversation and use over time. NOT forms. |
| Product model | Life operating system / infrastructure. NOT self-improvement tool. |
| Palette function | PrepBoard model — browse, tap to add to system. NOT chat injection. |
| Insight timing | Structural insight on Day 1 (from decomposition). Behavioral insights Week 2+. |
| V1 architecture | Archived. Lotus Flow, petals, workspace may return in evolved form. |
| V2 MVP architecture | Superseded by V2.1 artifact-first redesign. |

---

## RPPL Primitives (Reality Pattern Protocol Layer)

Internal/developer-facing only — users see "HUMA."

| Primitive | What It Is | The Capacity |
|-----------|------------|--------------|
| **Essences** | Irreducible identity | See what something IS |
| **Patterns** | Structured, validated units of practical wisdom | See recurring structures |
| **Fields** | Total context within which patterns express | See total context |
| **Nodes** | Points of maximum leverage | See leverage |
| **Transformers** | Cross-domain bridges | See across domains |

---

## Voice Rules (Condensed)

Read `HUMA_VOICE_BIBLE.md` for the full specification.

**Character:** The neighbor who leans on the fence post and says the one thing you needed to hear.

**Banned phrases:** "I hear you saying..." / "Great question!" / "Based on what you've shared..." / "You might want to consider..." / "You've got this!" / "As an AI..." / "Let's unpack that"

**Vocabulary:** USE: "what's working," "where the leverage is," "that's a design problem, not a discipline problem." NEVER: optimize, productivity, hack, goals, accountability, mindset, journey, empower, wellness, actionable, transformative.

**Response lengths:** Conversation clarification: tappable options + 1 sentence. Decomposition: behavior list + 1 sentence framing. Production sheet items: specific action + brief detail. Insight: 3 sentences max. One question per message.

---

## Design Rules (Condensed)

Read `HUMA_DESIGN_SYSTEM.md` for the full specification.

**Palette:** Backgrounds: sand-50 `#FAF8F3` (never white). Primary: sage. Action: amber-600 `#B5621E` (only for clickable). Text: ink-900 through ink-200 (never black).

**Typography:** Display: Cormorant Garamond. Body: Source Sans 3. Max reading width: 680px.

**Animation:** Easing: `cubic-bezier(0.22, 1, 0.36, 1)`. Nothing bouncy. Everything grows, breathes, emerges.

**HUMA never looks like:** SaaS dashboard, wellness app, Material Design, Bootstrap defaults, generic AI chat with bubbles.

---

## Ethical Rules (Condensed)

Read `HUMA_ETHICAL_FRAMEWORK.md` for the full specification.

**The Dependency Test:** Does this feature develop the operator's capacity, or create dependency?

**The Sovereignty Test:** Is this context entering through the operator's choice, or through surveillance?

**When behaviors don't stick:** Look at the system, never at the person. "What changed?" not "Try harder."

**The graduation metric:** If an operator stops using HUMA after 2 years because they've internalized the thinking — that's success.

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design tokens from Design System
- **AI:** Claude API via AIProvider abstraction
- **Database:** PostgreSQL via Supabase. Tables: aspirations, behaviors, behavior_log, contexts, sheet_entries, chat_messages, insights
- **Hosting:** Vercel + Supabase
- **Auth:** Email magic links. Pre-auth state in localStorage, migrated to Supabase on auth.

---

## The Single Test

Before building anything, ask:

**Does this reduce cognitive load and reveal connections?**

Does this feature help the operator's life run better? Does it surface a connection they couldn't see before? Does the operator have to think less, not more?

---

## What HUMA Must Never Do

- Give vague advice without operational specifics
- Fragment a whole into parts without holding the whole in view
- Impose a template for what a good life looks like
- Create dependency (every interaction develops the operator's own capacity)
- Use shame, guilt, or comparison when behaviors don't stick
- Look or feel like a generic SaaS product, wellness app, or chatbot
- Explain its own framework mid-conversation
- Retain data for purposes the operator hasn't consented to
- Scrape, surveil, or infer from external data sources without the operator's gift

---

## What HUMA Must Always Do

- See the operator as a whole, never a collection of symptoms
- Start from what's already present
- Show connections between dimensions, not isolated insights
- Use the operator's own language when reflecting back
- Leave space after insights (silence is a feature)
- Make the shared insight beautiful enough to screenshot and send
- Deliver specific, actionable outputs — not plans, not advice, but "here's your tomorrow"

---

*This file is the router. The documents it points to are the architecture. Read them.*
