# Code Workspace

_Last updated: 2026-04-05_

## What This Workspace Is For
Building and maintaining HUMA's Next.js application. Components, API routes, data layer, auth.

## Current State
V2.1 in development. Three-tab app: Today (production sheet), Whole (holonic life map), Grow (patterns). Entry flow at /start. Chat overlay from any tab.

### What Works
- `/start` conversation flow: context gathering -> reflect-back -> phased decomposition
- `/today` production sheet: behaviors render, check-offs persist, streaks tracked
- `/whole` holonic visualization: aspirations, principles, context nodes, archetype selector, WHY statement
- `/grow` patterns view: patterns grouped by status with validation progress
- Auth: magic link sign-in, localStorage -> Supabase migration
- Chat overlay (ChatSheet) accessible from any tab via floating button
- Living Canvas map generation and sharing (`/map/[id]`)

### What Doesn't Work Yet
- Behavioral insights (`/api/insight`) require 7+ days of data
- No push notifications or morning briefing delivery

### Architectural Notes
- Pre-auth data lives in localStorage; migrated to Supabase on sign-in
- Conversation engine uses `[[MARKER:...]]` protocol in streamed responses, parsed client-side
- Production sheet compiled daily by Claude (`/api/sheet`), cached in localStorage by date

---

## Pages

| Route | File | Status | What It Does |
|-------|------|--------|-------------|
| `/` | `app/page.tsx` | Working | Landing page. Redirects authed users with aspirations to `/today`. Shows `LandingView` otherwise. |
| `/start` | `app/start/page.tsx` | Working | Conversation entry. Context gathering -> decomposition -> auth -> redirect to `/today`. Palette panel on desktop. |
| `/today` | `app/today/page.tsx` | Working | Production sheet (HOME). Daily behaviors from aspirations, check-off tracking, dimension dots, streak counts. |
| `/whole` | `app/whole/page.tsx` | Working | Holonic life map. Force-directed D3 visualization, archetype selector, WHY statement, insight card. |
| `/grow` | `app/grow/page.tsx` | Working | Patterns view. Patterns grouped by status (finding/working/validated) with trigger, golden pathway, validation progress. Empty state. |
| `/chat` | `app/chat/page.tsx` | Working | Conversation hub. Messages grouped by time into expandable cards. Context card with aspiration/behavior summary. |
| `/map/[id]` | `app/map/[id]/page.tsx` | Working | Dynamic Living Canvas renderer. Server-side OG metadata. Public/shareable. |
| `/map/sample` | `app/map/sample/page.tsx` | Working | Two example Living Canvas maps (Sarah Chen, Maya Okafor). |

### Navigation
Bottom tab bar: **Today | Whole | Grow**. Hidden on `/` and `/start`. Chat overlay (floating button + bottom sheet) available on all tab pages.

---

## API Routes

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

### UI Primitives (`components/ui/index.tsx`)
- **Button** -- 4 variants (primary/secondary/ghost/destructive), 3 sizes. Uses design tokens.
- **Card** / **CardTitle** -- 3 variants (default/elevated/warm). Consistent padding, border, radius.
- **DestructiveAction** -- Inline text button for remove/delete. Uses `text-rose`.
- **SectionHeading** -- Serif, text-2xl, sage-700.
- **Prose** -- Serif, text-lg, earth-800. For body content.

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
