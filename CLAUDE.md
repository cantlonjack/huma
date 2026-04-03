# HUMA

## Read This First

HUMA is infrastructure for running your life as one connected system. Not a wellness app. Not a life design tool. Infrastructure -- like Google Maps is infrastructure for navigation. You use it because your life runs better with it than without it.

**What HUMA does that no other app can:** Show you how the different parts of your life are connected -- and which specific daily behaviors are the leverage points that hold everything together.

**Current state:** V2.1 in development. Three-tab app: Today (production sheet, home), Whole (holonic life map), Grow (patterns view). Entry flow at `/start` works. Conversation engine gathers deep context before decomposing into phased behaviors. Patterns auto-extracted from decompositions with triggers, displayed on Grow tab grouped by status with validation progress. Sheet compilation works. Whole page has force-directed holon visualization with archetypes and WHY statement. Chat overlay available from any tab with tab-specific context awareness.

**Deployed:** huma-two.vercel.app

---

## Current State

_Last updated: 2026-04-02_

### What Works
- `/start` conversation flow: context gathering -> reflect-back -> phased decomposition (this_week / coming_up / longer_arc)
- `/today` production sheet: behaviors render, check-offs persist, streaks tracked
- `/whole` holonic visualization: aspirations, principles, context nodes, archetype selector, WHY statement
- Auth: magic link sign-in, localStorage -> Supabase migration
- Chat overlay (ChatSheet) accessible from any tab via floating button
- Living Canvas map generation and sharing (`/map/[id]`)

### What Doesn't Work Yet
- `/grow` is a placeholder ("coming next")
- `/system` exists but is not in the bottom nav (accessible via direct URL or "see all" from chat)
- Behavioral insights (`/api/insight`) require 7+ days of data -- untestable on fresh accounts
- No push notifications or morning briefing delivery

### Known Architectural Notes
- Pre-auth data lives in localStorage; migrated to Supabase on sign-in
- Conversation engine uses `[[MARKER:...]]` protocol in streamed responses, parsed client-side
- Production sheet compiled daily by Claude (`/api/sheet`), cached in localStorage by date

---

## Routes

### Pages

| Route | File | Status | What It Does |
|-------|------|--------|-------------|
| `/` | `app/page.tsx` | Working | Landing page. Redirects authed users with aspirations to `/today`. Shows `LandingView` otherwise. |
| `/start` | `app/start/page.tsx` | Working | Conversation entry. Context gathering -> decomposition -> auth -> redirect to `/today`. Palette panel on desktop. |
| `/today` | `app/today/page.tsx` | Working | Production sheet (HOME). Daily behaviors from aspirations, check-off tracking, dimension dots, streak counts. |
| `/whole` | `app/whole/page.tsx` | Working | Holonic life map. Force-directed D3 visualization, archetype selector, WHY statement, insight card. |
| `/grow` | `app/grow/page.tsx` | Working | Patterns view. Patterns grouped by status (finding/working/validated) with trigger, golden pathway, validation progress. Empty state. |
| `/chat` | `app/chat/page.tsx` | Working | Conversation hub. Messages grouped by time into expandable cards. Context card with aspiration/behavior summary. |
| `/system` | _(removed Session 14)_ | Removed | Function moves to Whole tab's expand panels in Phase 4. |
| `/map/[id]` | `app/map/[id]/page.tsx` | Working | Dynamic Living Canvas renderer. Server-side OG metadata. Public/shareable. |
| `/map/sample` | `app/map/sample/page.tsx` | Working | Two example Living Canvas maps (Sarah Chen, Maya Okafor). |

### Navigation

Bottom tab bar: **Today | Whole | Grow**. Hidden on `/` and `/start`. Chat overlay (floating button + bottom sheet) available on all tab pages.

### API Routes

| Route | Method | Status | What It Does | Called By |
|-------|--------|--------|-------------|----------|
| `/api/v2-chat` | POST | Working | Core conversation engine. Adaptive system prompt, streamed responses with `[[MARKER:...]]` protocol. | `/start`, `/chat`, `ChatSheet` |
| `/api/chat` | POST | Working | Legacy multi-phase conversation (ikigai -> operational design). Canvas/document generation. | Map generation flow |
| `/api/palette` | POST | Working | Suggests related concept chips for `/start` sidebar. Uses Haiku model. | `/start` |
| `/api/sheet` | POST | Working | Compiles daily production sheet. Claude generates 5 headline+detail entries from aspirations + history. | `/today` |
| `/api/sheet/check` | POST | Working | Records behavior check-off. Updates `sheet_entries` table. Requires auth. | `/today` |
| `/api/insight` | POST | Working | Generates cross-aspiration behavioral insights from 7+ days of data. | `/whole` |
| `/api/whole-compute` | POST | Working | Suggests archetypes and WHY statement from context data. | `/whole` |
| `/api/maps` | POST | Working | Stores Living Canvas document to Supabase + Redis cache. | Map generation |
| `/api/maps/[id]` | GET | Working | Retrieves map by ID. Supabase -> Redis fallback. | `/map/[id]` |
| `/api/og` | GET | Working | Dynamic OG image generation for map sharing. | `/map/[id]` metadata |
| `/auth/callback` | GET | Working | OAuth callback. Exchanges code for session, redirects to `/today`. | Supabase auth redirect |

---

## Components

### Layout & Navigation
- **BottomNav** -- Fixed bottom tab bar (Today, Whole, Grow). Hidden on `/` and `/start`.
- **TabShell** -- Wraps tab pages with ChatBubble + ChatSheet overlay.

### Conversation & Chat
- **Chat** -- Core chat interface with streaming, phase-specific placeholders, error handling.
- **ChatBubble** -- Floating action button to open ChatSheet.
- **ChatSheet** -- Draggable bottom sheet chat overlay for tab pages.
- **ConversationSheet** -- Alternative chat interface for `/system` page.
- **DecompositionPreview** -- Phased behavior preview (This Week / Coming Up / Longer Arc) with trigger highlighting and edit mode.

### Views
- **LandingView** -- Homepage hero with asymmetric life-balance shape visualization.
- **ConversationView** -- Multi-phase conversation (Chat + PhaseIndicator + ProgressiveCanvas).
- **MapView** -- Living Canvas display container with canvas/document toggle.
- **WelcomeView** -- Name/location collection form (V1 flow).
- **GeneratingView** -- Loading screen during map generation.

### Grow Tab
- **GrowSkeleton** -- Skeleton loader for pattern cards.

### Whole Tab
- **WholeShape** -- Force-directed D3 holon visualization (patterns, vision, identity, principles, foundation).
- **ProfileBanner** -- Operator name, archetypes, editable WHY statement.
- **ArchetypeSelector** -- Modal for selecting primary/secondary archetypes.
- **HolonExpandPanel** -- Expandable details panel for holon nodes.
- **InsightCard** -- Displays behavioral insight with dismiss.

### Living Canvas (SVG)
- **SpatialCanvas** -- Main SVG container. Center-outward layout: Essence -> QoL -> Production -> Resource -> CapitalRadar.
- **SpatialEssence** -- Center SVG: operator name, land affinity, breathing glow.
- **SpatialRing** / **SpatialPill** -- Ring layout with text pill elements.
- **CapitalRadar** -- 8-axis radar chart of capital scores.
- **LivingCanvas** -- Combines SpatialCanvas with scrolling HTML detail sections.
- **FieldLayers**, **EnterpriseCards**, **NodalActions**, **WeeklyRhythm**, **ValidationProtocol**, **CanvasClosing** -- Detail sections.

### Shared
- **AuthProvider** -- Supabase auth context (magic link sign-in, session management).
- **AuthModal** -- Email input modal for magic link auth.
- **ErrorBoundary** -- Catches render errors with context-specific fallback UI.
- **MapToolbar** -- Sticky toolbar for map view (toggle, print, share).
- **ShareButton** -- Map sharing dropdown (link, image, social).
- **MapDocument** -- Renders map data as styled markdown with embedded charts.
- **ShapeChart** -- SVG radar/spider chart for capital scores.

---

## Data Layer

### Supabase Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `contexts` | One per user. Structured context container. | `user_id`, `known_context` (jsonb), `aspirations` (jsonb[]), `why_statement` |
| `aspirations` | Individual aspirations with behaviors. | `user_id`, `raw_text`, `clarified_text`, `behaviors` (jsonb), `dimensions_touched`, `status`, `stage` |
| `chat_messages` | All conversation history. | `user_id`, `role`, `content`, `context_extracted` (jsonb) |
| `sheet_entries` | Daily production sheet (time-series). | `user_id`, `date`, `behavior_key`, `behavior_text`, `detail` (jsonb), `time_of_day`, `checked`, `checked_at` |
| `behavior_log` | Behavior completion tracking for analytics. | `user_id`, `behavior_key`, `date`, `completed` |
| `insights` | Generated behavioral insights. | `user_id`, `insight_text`, `dimensions_involved`, `behaviors_involved`, `data_basis` (jsonb), `delivered` |
| `principles` | User-defined guiding principles. | `user_id`, `text`, `active`, `sort_order` |
| `patterns` | First-class pattern entities (Golden Pathway). | `user_id`, `aspiration_id`, `name`, `trigger`, `steps` (jsonb), `time_window`, `validation_count`, `validation_target`, `status` |
| `maps` | Living Canvas documents. | `user_id`, `document_markdown`, `canvas_data` (jsonb), `name`, `location`, `is_public` |

### localStorage Keys (Pre-Auth)

| Key | What It Stores |
|-----|---------------|
| `huma-v2-known-context` | Structured context dict |
| `huma-v2-start-messages` | Chat messages from `/start` |
| `huma-v2-chat-messages` | Chat messages from `/chat` |
| `huma-v2-aspirations` | Aspirations with behaviors, comingUp, longerArc |
| `huma-v2-behaviors` | Derived behavior metadata (transient) |
| `huma-v2-start-date` | When operator first started |
| `huma-v2-sheet-YYYY-MM-DD` | Daily sheet entries (one key per date) |
| `huma-v2-patterns` | Extracted patterns from decomposition (migrated to Supabase on auth) |
| `huma-v2-pending-insight` | Undelivered insight |
| `huma-conversation` | V1 conversation state (legacy) |

### Data Flow

Pre-auth: all data in localStorage. On auth: `migrateLocalStorageToSupabase()` moves everything to Supabase, clears localStorage after verified save. Post-auth: Supabase is source of truth. Maps also cached in Redis (Upstash KV, 90-day TTL).

### Key Functions (`lib/supabase-v2.ts`)

- `getAspirations` / `saveAspiration` -- CRUD for aspirations
- `getSheetEntries` / `saveSheetEntries` / `updateSheetEntryCheck` -- Daily sheet management
- `logBehaviorCheckoff` / `getBehaviorWeekCounts` -- Behavior tracking
- `getUndeliveredInsight` / `markInsightDelivered` -- Insight lifecycle
- `computeStructuralInsight` -- Day 1 insight from decomposition data
- `getPatterns` / `savePattern` / `updatePattern` / `deletePattern` -- Pattern CRUD
- `extractPatternFromAspiration` / `extractPatternsFromAspirations` -- Auto-create patterns from decompositions (`lib/pattern-extraction.ts`)
- `migrateLocalStorageToSupabase` -- Auth migration (safe: preserves localStorage on failure, includes patterns)

---

## Document Architecture

**8 active documents.** Everything else is archived.

### Source of Truth

| Document | What It Governs |
|----------|----------------|
| **V2 Foundation** (`HUMA_V2_FOUNDATION.md`) | The three layers (Conversation -> Computation -> Output), product surface, entry flow, production sheet, insight engine, growth model. **Read FIRST for any product or build decision.** |

### Foundational Documents

| # | Document | Authoritative For |
|---|----------|-------------------|
| 1 | **Vision & Strategy** (`HUMA_VISION_AND_STRATEGY.md`) | What HUMA is, why it exists, sovereignty principles, pattern economy, strategic phases |
| 2 | **Design System** (`HUMA_DESIGN_SYSTEM.md`) | Colors, fonts, spacing, components, warmth system, animation |
| 3 | **Voice Bible** (`HUMA_VOICE_BIBLE.md`) | How HUMA speaks, banned phrases, vocabulary, tone arc, response lengths |
| 4 | **Ethical Framework** (`HUMA_ETHICAL_FRAMEWORK.md`) | Dependency test, graduation imperative, distress protocol, data principles |
| 5 | **Pattern Library** (`HUMA_PATTERN_LIBRARY.md`) | RPPL pattern schema, 12 seed patterns, pattern evolution mechanics |
| 6 | **Intellectual Lineage** (`HUMA_INTELLECTUAL_LINEAGE.md`) | Source traditions, convergence architecture |
| 7 | **Conversation Architecture** (`HUMA_CONVERSATION_ARCHITECTURE.md`) | How the conversation engine works: context gathering, decomposition phases, message count rules |

### Archived (do not consult for current build decisions)

- `HUMA_PRODUCT_SURFACE.md` -- V1 product surface. Superseded.
- `HUMA_TECHNICAL_SPECIFICATION.md` -- V1 tech spec. Superseded.
- `HUMA_USER_JOURNEY.md` -- V1 journey stages. Superseded.
- `HUMA_COMPLETE_CONTEXT.md` -- Outdated portable summary. Superseded.
- `cc-prompt-onboarding-v2.md` -- Lotus Flow build spec. Retired.
- `cc-prompt-huma-v2-mvp.md` -- V2 MVP build prompt. Superseded.

---

## Resolved Decisions (Do Not Revisit)

| Decision | Resolution |
|----------|-----------|
| Entry experience | Open conversation: "What's going on?" NOT guided onboarding. |
| Home screen | Production sheet (`/today`). NOT a chat page. |
| Visible artifact | Whole page (`/whole`) with holonic visualization, archetypes, WHY. |
| Conversation model | Ephemeral input -> structured output. NOT a growing chat log. |
| Capital scores | COMPUTED from behavior through decomposition chains. NOT self-reported. |
| Context building | Through conversation and use over time. NOT forms. |
| Product model | Life operating system / infrastructure. NOT self-improvement tool. |
| Palette function | PrepBoard model -- browse, tap to add context. NOT chat injection. |
| Insight timing | Structural insight on Day 1 (from decomposition). Behavioral insights Week 2+. |
| Decomposition output | Phased: this_week (max 4, one trigger) / coming_up / longer_arc. NOT flat list. |
| Navigation | Today / Whole / Grow (bottom tab bar). Chat is overlay, not a tab. |
| V1 architecture | Archived. Lotus Flow, petals, workspace may return in evolved form. |
| V2 MVP architecture | Superseded by V2.1 artifact-first redesign. |

---

## Voice Rules (Condensed)

Read `HUMA_VOICE_BIBLE.md` for the full specification.

**Character:** The neighbor who leans on the fence post and says the one thing you needed to hear.

**Banned phrases:** "I hear you saying..." / "Great question!" / "Based on what you've shared..." / "You might want to consider..." / "You've got this!" / "As an AI..." / "Let's unpack that"

**Vocabulary:** USE: "what's working," "where the leverage is," "that's a design problem, not a discipline problem." NEVER: optimize, productivity, hack, goals, accountability, mindset, journey, empower, wellness, actionable, transformative.

**Response lengths:** Conversation clarification: tappable options + 1 sentence. Decomposition: phased behavior list + 1 sentence framing. Production sheet items: specific action + brief detail. Insight: 3 sentences max. One question per message.

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

**The graduation metric:** If an operator stops using HUMA after 2 years because they've internalized the thinking -- that's success.

---

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design tokens from Design System
- **AI:** Claude API (Anthropic SDK). Sonnet for conversation/sheet/insight. Haiku for palette.
- **Database:** PostgreSQL via Supabase. Tables: contexts, aspirations, chat_messages, sheet_entries, behavior_log, insights, principles, maps
- **Cache:** Upstash Redis (KV) for map caching
- **Hosting:** Vercel + Supabase
- **Auth:** Email magic links via Supabase. Pre-auth state in localStorage, migrated on auth.

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
- Deliver specific, actionable outputs -- not plans, not advice, but "here's your tomorrow"

---

## Build Roadmap (Sessions 25–49)

Six increments organized by operator experience arc, not by theme. Source: `HUMA_ROADMAP_ANALYSIS.md`. The lineage is a constraint system, not a feature spec — the operator experiences the system, never sees the vocabulary.

### Increment 1: The Specific Sheet — "This app knows my life"

| Session | Name | What Gets Built | Status |
|---------|------|----------------|--------|
| **25** | Sheet context injection | Enriched SheetCompileRequest: full known_context, season, dayOfWeek, dayCount, archetypes, whyStatement, conversation transcript, 7-day history. `lib/sheet-compiler.ts` client helper. | **Done** |
| **26** | Sheet prompt rewrite | Action-level prompt ("Stew night — chuck in freezer" not "Cook dinner"). Identity section with archetypes + WHY. Context usage mandate. | **Done** |
| **27** | Wire compileSheet + through-line header | Wire `compileSheet()` into Today page (replace inline fetch). Add structural through-line at top of sheet: "Three of these feed the same thing: your evening rhythm is where Body, Money, and Joy converge." | |
| **28** | Sheet item UI refinement | Cormorant Garamond headlines, Source Sans 3 detail. Sand-50 bg. Generous vertical spacing (Alexander's Void). Trigger item: warm sand-100 bg + thin amber-600 left border. | |
| **29** | Check-off gesture redesign | Replace checkbox with tap → text shifts to ink-200 + thin line-through + brief dimension dot glow. No "task list" aesthetic. | |
| **30** | Sheet cap + selection logic | Enforce max 5 items hard. When more behaviors exist, sheet compilation selects highest-leverage based on check-off history and dimensional balance. | |

### Increment 2: The Return Loop — "It shows up for me"

| Session | Name | What Gets Built |
|---------|------|----------------|
| **31** | Service worker + web push setup | Register service worker, configure FCM for web push. Notification permission request flow. |
| **32** | Morning push notification | Scheduled sheet compilation (Vercel cron). Push with trigger item: "Your day: [detail]." Tap opens `/today`. |
| **33** | Evening reflection overlay | Half-sheet overlay (reuse ChatSheet pattern). Single text input + 3 tap options. Response flows into known_context. |
| **34** | Notification preferences | Settings for morning/evening time, opt-out. Stored in known_context. HUMA voice — no emoji, no exclamation marks. |
| **35** | Insight delivery via push | After 7+ days, morning push occasionally includes a behavioral connection. ~2x/week, not daily. |

### Increment 3: The Living Grow Tab — "My patterns are alive and adaptive"

| Session | Name | What Gets Built |
|---------|------|----------------|
| **36** | Sparkline computation | 14-day check-off consistency per pattern from behavior_log. Returns daily values for sparkline rendering. |
| **37** | Pattern card redesign + sparkline UI | Full-width cards, Cormorant Garamond name, thin amber-600 sparkline. Rising = momentum, flat = stability, dropping = something changed. No labels. |
| **38** | "What changed?" conversation | Tap dropping pattern → ChatSheet pre-loaded: "Your morning walk dropped off after [date]. What changed?" New decomposition for changed context. |
| **39** | Pattern emergence detection | Detect unnamed consistent behaviors (12+ days). "Something forming..." at top of Grow. Tap to see, name/formalize or dismiss. |
| **40** | Cross-aspiration merging | Shared behavior detection → merge suggestion. Operator can merge or keep separate. Inline suggestion on shared pattern card. |
| **41** | Grow tab breathing room | Max 5–7 visible cards. Fold by dimension if more. Alexander's Void enforced. Pattern emergence in italic Cormorant Garamond on sand-100. |

### Increment 4: The Whole Page as Living Mirror — "I can see my system evolving"

| Session | Name | What Gets Built |
|---------|------|----------------|
| **42** | Behavioral weight on holon connections | D3 link thickness/gravity from behavioral correlation. Correlated holons drift closer. Gradual, not reactive. |
| **43** | WHY statement evolution | After 4+ weeks, re-suggest WHY: "Your original WHY was X. What you're actually building looks more like Y." Inline suggestion, operator chooses. |
| **44** | Insight thread annotations | 3 most significant historical insights as small text near relevant holon nodes. Cormorant Garamond italic, ink-400. Museum placard aesthetic. |

### Increment 5: Temporal Intelligence — "HUMA knows my seasons"

| Session | Name | What Gets Built |
|---------|------|----------------|
| **45** | Monthly review surface | Auto-generated at month end. 4-column week grid × behavior rows. Sage = consistent, amber = intermittent, blank = absent. |
| **46** | Financial rhythm + COMING UP surfacing | Financial context via conversation → known_context. Sheet becomes financially aware. COMING UP items appear when THIS WEEK behaviors are solid. |
| **47** | Life stage transition detection | Significant context change → reorganization conversation. Revisit affected aspirations, suggest releases/protections, revised decomposition. |

### Increment 6: The Shareworthy Moment — "I want to show someone this"

| Session | Name | What Gets Built |
|---------|------|----------------|
| **48** | Shareworthy insight cards | Strong cross-dimensional insights get full-screen card: Cormorant Garamond, operator's name, dimension circles, share button. Letterpress aesthetic. |
| **49** | Living Canvas evolution + share | Canvas regenerable from behavioral data. CapitalRadar from computed scores. Share extends to insight cards via `/api/og`. |

### What Not to Build

- **Template library / pattern commons** — not until 1,000+ active operators with 3+ months data
- **Adaptive cycle labels** — operator never sees "exploitation," "conservation," "release," "reorganization"
- **Animated connection reveals on check-off** — gamifies check-offs, violates Sanford's principles
- **Voice input** — low priority, evening reflection tap options reduce friction enough
- **SEO landing pages** — growth marketing, not product development; premature without PMF

---

## Session Protocol

At the END of every CC session, before the final commit:
1. Update `docs/CURRENT_STATE.md` with current state of every route and known bugs.
2. Commit it with the session's other changes.
This file is the bridge between CC and the strategic Claude instance.
