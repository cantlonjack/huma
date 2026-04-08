# Code Workspace

Read CLAUDE.md first for the full route/hook/lib reference. This file covers non-obvious architecture, current status, and gotchas.

## Non-Obvious Architecture

- **Pre-auth data lives in localStorage**, migrated to Supabase on sign-in via `migrateLocalStorageToSupabase()` in `lib/db/local-storage.ts`. Post-auth: Supabase is source of truth, localStorage is write-ahead log.
- **Conversation engine uses `[[MARKER:...]]` protocol** in streamed responses. Markers: `OPTIONS`, `BEHAVIORS`, `ACTIONS`, `CONTEXT`, `ASPIRATION_NAME`, `DECOMPOSITION`, `REORGANIZATION`, `DECISION`. Parsed by `lib/parse-markers-v2.ts`. (Legacy `lib/markers.ts` still exists but new prompts use v2.)
- **Production sheet compiled daily by Claude** (`/api/sheet`), cached in localStorage by date key `huma-v2-sheet-YYYY-MM-DD`. Scoring logic in `lib/services/sheet-service.ts` ranks behaviors by dimensional breadth, momentum, day-of-week fit, and aspiration balance.
- **Maps cached in Redis** (Upstash KV, 90-day TTL) with Supabase fallback.
- **Context model** (`lib/context-model.ts`) tracks 9 dimensions: Body, People, Money, Home, Growth, Joy, Purpose, Identity, Time. Deep merge preserves nested data (e.g., adding a household member doesn't erase existing ones). Completeness scoring (0-100% per dimension) guides what HUMA asks next.
- **Two migration directories:** `/supabase/migrations/` (push subscriptions, shapes) and `/app/supabase/migrations/` (001-010: core schema from initial through patterns).

## Component Map (65 components)
| Directory | Count | Purpose |
|-----------|-------|---------|
| `canvas/` | 10 | Living Canvas SVG visualization (SpatialCanvas, CapitalRadar, WeeklyRhythm, etc.) |
| `chat/` | 3 | Conversation UI (Chat, ChatBubble, ChatSheet) |
| `grow/` | 8 | Pattern analysis (PatternCard, CorrelationCards, CompletionStats, Sparkline, etc.) |
| `onboarding/` | 6 | Entry flow (ArchetypeSelectionScreen, DecompositionPreview, PalettePanel, etc.) |
| `shared/` | 9 | Infrastructure (AuthProvider, QueryProvider, BottomNav, TabShell, ErrorBoundary, etc.) |
| `today/` | 9 | Production sheet (CompiledEntryRow, CapitalPulse, NudgeCard, EveningReflection, etc.) |
| `whole/` | 18 | Holonic visualization (WholeShape, ProfileBanner, ArchetypeSelector, AspirationsList, etc.) |
| `ui/` | 1 | Primitive UI exports |
| `views/` | 1 | Layout containers |

## DB Abstraction Layer (`lib/db/`)
| File | Entities |
|------|----------|
| `store.ts` | Unified persistence (Supabase + localStorage WAL) |
| `aspirations.ts` | Aspiration CRUD + behaviors |
| `behaviors.ts` | Behavior tracking, correlation analysis |
| `sheets.ts` | Daily sheet entries + history |
| `insights.ts` | Computed insights storage |
| `chat.ts` | Conversation history |
| `context.ts` | Operator context management |
| `patterns.ts` | Pattern lifecycle |
| `principles.ts` | Core principles storage |
| `monthly-review.ts` | Monthly reflection data |
| `local-storage.ts` | Client-side pre-auth persistence + migration |
| `index.ts` | Barrel export |

## What Works
- Full conversation flow (/start): context gathering, decomposition, aspiration creation
- Daily production sheet compilation + check-offs
- Capital pulse computation from behavior data
- Holonic map visualization (force-directed graph)
- Archetype selection + WHY statement
- Push notification subscriptions + morning sheet cron
- Map sharing with OG image generation
- Evening reflection
- Pattern extraction and grow page

## What Doesn't Work Yet
- Behavioral insights (`/api/insight`) require 7+ days of data to be meaningful
- Pattern validation needs operator volume (no real validation data yet)

## Active Constraints
- Migrations: core schema in `app/supabase/migrations/` (001-010), push/shapes in `supabase/migrations/`
- Env vars: see `app/.env.example` for full list. Key vars: `ANTHROPIC_API_KEY`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, VAPID keys
- Two env vars referenced in code but missing from .env.example: `ANTHROPIC_MODEL_FAST` (palette), `CLAUDE_MODEL` (canvas-regenerate)
