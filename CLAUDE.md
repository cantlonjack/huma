# HUMA

Life infrastructure — shows how the parts of your life connect and which daily behaviors are the leverage points.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Claude API (Sonnet for conversation/sheet/insight, Haiku for palette)
- Supabase (PostgreSQL + Auth + RLS), Upstash Redis (map cache)
- Deployed on Vercel at huma-two.vercel.app

## Structure
- `/app/src` — Application code (components, hooks, lib, types, engine, data)
- `/docs` — Foundational documents (design system, voice bible, ethical framework, etc.)
- `/supabase/migrations` — Root-level migrations (push subscriptions, shapes)
- `/app/supabase/migrations` — App-level migrations (001-010: core schema)

## Pages
| Route | Purpose |
|-------|---------|
| `/start` | Entry flow — conversation, context gathering, decomposition |
| `/today` | Home screen — daily production sheet, check-offs, capital pulse |
| `/whole` | Holonic life map — force-directed graph, archetypes, WHY statement |
| `/grow` | Patterns — grouped patterns, validation progress, correlation cards |
| `/chat` | Conversation history hub |
| `/map/[id]` | Shareable Living Canvas |
| `/insight/[id]` | Individual insight detail |

## API Routes
| Route | Purpose |
|-------|---------|
| `/api/v2-chat` | Core conversation engine (streaming + marker protocol) |
| `/api/sheet` | Compiles daily production sheet (Claude generates 5 actions) |
| `/api/sheet/check` | Records behavior check-off |
| `/api/insight` | Cross-aspiration insights (requires 7+ days data) |
| `/api/whole-compute` | Suggests archetypes + WHY statement |
| `/api/palette` | Related concept suggestions (Haiku) |
| `/api/nudge` | Generates nudge messages |
| `/api/reflection` | Records evening reflection + context updates |
| `/api/maps` | Stores Living Canvas (Supabase + Redis) |
| `/api/maps/[id]` | Retrieves map by ID |
| `/api/canvas-regenerate` | Regenerates canvas from saved data |
| `/api/og` | Dynamic OG image generation |
| `/api/push/subscribe` | Web push notification subscription |
| `/api/cron/morning-sheet` | Scheduled morning briefing via push |

## Hooks (`app/src/hooks/`)
| Hook | Page | Purpose |
|------|------|---------|
| `useStart` | /start | Onboarding conversation flow |
| `useToday` | /today | Sheet compilation, check-offs, insights |
| `useWhole` | /whole | Holonic map data, archetypes |
| `useGrow` | /grow | Pattern data, validation |
| `useChat` | /chat | Conversation history |
| `useAspirationManager` | shared | Aspiration CRUD + lifecycle |
| `useContextSync` | shared | Context model synchronization |
| `useMessageStream` | shared | SSE streaming for chat |
| `useReducedMotion` | shared | Accessibility: respects prefers-reduced-motion |

## Key Lib Modules
| Module | Purpose |
|--------|---------|
| `lib/services/prompt-builder.ts` | System prompt assembly (Open/Focus/Decompose modes) |
| `lib/services/sheet-service.ts` | Behavior scoring + sheet compilation logic |
| `lib/services/nudge-service.ts` | Nudge generation |
| `lib/parse-markers-v2.ts` | Parses `[[MARKER:...]]` from streamed responses |
| `lib/context-model.ts` | 9-dimension context model + deep merge + completeness scoring |
| `lib/capital-computation.ts` | Capital scores from behavior data |
| `lib/capital-pulse.ts` | Real-time capital metrics |
| `lib/pattern-extraction.ts` | Pattern recognition from behavior logs |
| `lib/sheet-compiler.ts` | Client-side sheet compilation |
| `lib/db/store.ts` | Unified persistence (Supabase + localStorage WAL) |
| `lib/db/index.ts` | DB barrel export (aspirations, behaviors, sheets, insights, chat, patterns, contexts, principles) |

## Data Layer
- **Pre-auth:** localStorage (`huma-v2-*` keys) is source of truth
- **Post-auth:** Supabase is source of truth; localStorage is write-ahead log
- **Migration:** `migrateLocalStorageToSupabase()` runs on first auth
- **Maps:** Redis cache (90-day TTL) with Supabase fallback

## Workspace Routing
| Task | Read first |
|------|-----------|
| Build feature / fix bug | workspaces/code.md |
| Design / styling / UI | workspaces/design.md |
| Voice / prompts / conversation | workspaces/prompts.md |
| Roadmap / session planning | workspaces/planning.md |

## Naming Conventions
- Components: PascalCase — Lib files: kebab-case — API routes: kebab-case dirs
- localStorage keys: huma-v2-{purpose}

## The Single Test
Before building anything: **Does this reduce cognitive load and reveal connections?**
