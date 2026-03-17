# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Monolithic Single-Page Application with AI-driven conversation engine

The application is a conversational AI tool that guides users through a 6-phase structured conversation, accumulates context at each phase transition, then generates two output artifacts (a Living Canvas and a Document View) via parallel API calls. The "engine" (prompt architecture) is the core product; everything else is UI.

**Key Characteristics:**
- Single-page app with client-side state machine (no routing for core flow)
- AI conversation with structured phase progression and hidden marker-based context extraction
- Dual output generation: structured JSON (Canvas) + markdown (Document), generated in parallel
- Tiered storage: localStorage for speed, Upstash Redis for shareability
- No authentication, no user accounts -- anonymous, session-based

## Layers

**Prompt Engine (the product):**
- Purpose: Encode six intellectual traditions into structured AI system prompts that guide a 6-phase conversation and generate output documents
- Location: `app/src/engine/`
- Contains: System prompts, phase-specific instructions, enterprise reference data, canvas data generation prompts, type definitions
- Depends on: Nothing (pure functions that produce strings)
- Used by: API route (`app/src/app/api/chat/route.ts`)
- Key insight: `app/src/engine/phases.ts` comment says "This file IS the product. Everything else is UI."

**API Layer (server-side):**
- Purpose: Proxy between client and Claude API; store/retrieve maps from Redis
- Location: `app/src/app/api/`
- Contains: Chat endpoint (streaming), Maps CRUD endpoints
- Depends on: Engine layer (prompt building), Anthropic SDK, Upstash Redis
- Used by: Client-side page components

**UI Layer (client-side):**
- Purpose: Conversation interface, map visualization (Canvas + Document views), landing page
- Location: `app/src/app/page.tsx` (main SPA), `app/src/components/`, `app/src/components/canvas/`
- Contains: React components, state machine logic
- Depends on: Engine types, lib utilities
- Used by: End users via browser

**Utilities Layer:**
- Purpose: Cross-cutting helpers for persistence, analytics, clipboard, marker parsing
- Location: `app/src/lib/`
- Contains: Pure functions and browser API wrappers
- Depends on: Engine types
- Used by: UI layer

**Canonical Engine (source of truth):**
- Purpose: The authoritative version of prompt files, maintained outside the Next.js app
- Location: `src/engine/`
- Contains: `prompts.ts`, `operational-prompts.ts`, `enterprise-templates.ts`
- Note: These are duplicated into `app/src/engine/`. The app uses the `app/src/engine/` copies. The canonical versions at `src/engine/` may drift.

## Data Flow

**Conversation Flow (core loop):**

1. User enters name/location on welcome screen -> `startConversation()` builds opening message via `buildOpeningMessage()` in `app/src/engine/phases.ts`
2. User sends message -> `sendMessage()` POSTs to `/api/chat` with `{messages, phase, context}`
3. `/api/chat` calls `buildFullPrompt(phase, context)` to construct system prompt (base + phase-specific + accumulated context + enterprise templates if phase 4 + transition instructions)
4. Claude API streams response back as text chunks
5. Client displays streaming text, stripping `[[PHASE:...]]` and `[[CONTEXT:...]]` markers via `cleanForDisplay()` in `app/src/lib/markers.ts`
6. On stream completion, `parseMarkers()` extracts phase transitions and context syntheses
7. `accumulateContext()` stores extracted context in `contextRef` (a React ref for mutable state)
8. Conversation persisted to localStorage via `saveConversation()` in `app/src/lib/persistence.ts`
9. If `[[PHASE:complete]]` detected, triggers `generateMap()`

**Map Generation Flow:**

1. `generateMap()` assembles syntheses object from accumulated context
2. Two parallel `fetch()` calls to `/api/chat`:
   - `generateCanvas: true` -> `buildCanvasDataPrompt()` -> returns JSON matching `CanvasData` interface
   - `generateDocument: true` -> `buildDocumentPrompt()` -> returns markdown document
3. Canvas JSON parsed, markdown stored raw
4. Map data POSTed to `/api/maps` for Redis storage (90-day TTL)
5. Map also cached in localStorage for instant local access
6. URL updated to `/map/{id}` via `history.pushState()`
7. Conversation cleared from localStorage

**Map Retrieval Flow (shared links):**

1. `/map/[id]` page renders `MapClient` component
2. `MapClient` tries localStorage first, then `/api/maps/{id}` (Redis)
3. Renders `LivingCanvas` (if canvasData exists) or `MapDocument` (fallback)
4. User can toggle between Canvas and Document views

**State Management:**

- **App state machine:** `AppState` type = `"landing" | "welcome" | "conversation" | "generating" | "map"` -- managed via `useState` in `app/src/app/page.tsx`
- **Conversation context:** Mutable `useRef<Partial<ConversationContext>>` -- avoids re-renders on context accumulation, survives across message sends
- **Phase tracking:** `useState<Phase>` -- updated when `[[PHASE:...]]` markers detected
- **Persistence:** `SavedConversation` in localStorage (auto-saved after every AI response)
- **No global state management library** -- all state is local to the root page component

## Key Abstractions

**Phase System:**
- Purpose: Models the 6-phase conversation progression
- Definition: `app/src/engine/types.ts` -- `Phase` type union, `PHASES` array with `PhaseInfo` objects
- Used in: Prompt building, UI indicators, context accumulation, input placeholders
- Pattern: Phase transitions are signaled by the AI via hidden `[[PHASE:...]]` markers in response text, parsed client-side

**ConversationContext:**
- Purpose: Accumulated structured knowledge extracted from conversation
- Definition: `app/src/engine/types.ts` -- nested object with fields for each phase's synthesis
- Pattern: Context grows incrementally. Each phase transition appends a synthesis. The full context is sent to the API with every message so the AI has accumulated knowledge.

**Marker System:**
- Purpose: In-band signaling between AI and client for phase transitions and context extraction
- Definition: `app/src/lib/markers.ts` -- `parseMarkers()` and `cleanForDisplay()`
- Pattern: AI includes `[[PHASE:landscape]]` and `[[CONTEXT:holistic-synthesis]]<text>` at end of messages. Client strips these before display and uses them for state management.

**CanvasData:**
- Purpose: Structured JSON representation of the entire map output for the spatial Canvas view
- Definition: `app/src/engine/canvas-types.ts` -- deeply nested interface with essence, rings, enterprises, interventions, weekly rhythm, validation checks, seasonal arc
- Pattern: Generated by Claude as JSON from conversation syntheses, consumed by 12 canvas React components

**Enterprise Templates:**
- Purpose: Reference data with real financial numbers for 14 enterprise types
- Definition: `app/src/engine/enterprise-templates.ts` -- `EnterpriseTemplate` interface with financials, capital profiles, landscape requirements, fit signals
- Pattern: Injected into the system prompt during Phase 4 (enterprise-map) via `buildEnterpriseReferenceBlock()`

## Entry Points

**Main Application:**
- Location: `app/src/app/page.tsx`
- Triggers: Root URL (`/`)
- Responsibilities: Full SPA -- landing page, welcome screen, conversation, map generation, map display. Contains the state machine, all event handlers, and layout for each app state.

**Chat API:**
- Location: `app/src/app/api/chat/route.ts`
- Triggers: POST from client during conversation and map generation
- Responsibilities: Rate limiting, request validation, prompt construction (delegated to engine), Claude API streaming, response relay

**Maps API (Create):**
- Location: `app/src/app/api/maps/route.ts`
- Triggers: POST after map generation
- Responsibilities: Validate payload, generate ID, store in Upstash Redis with 90-day TTL

**Maps API (Read):**
- Location: `app/src/app/api/maps/[id]/route.ts`
- Triggers: GET when loading a shared map
- Responsibilities: Retrieve from Redis by ID

**Map Page (dynamic):**
- Location: `app/src/app/map/[id]/page.tsx` + `app/src/app/map/[id]/MapClient.tsx`
- Triggers: `/map/{id}` URL (shared links)
- Responsibilities: Load map from localStorage or Redis, render Canvas or Document view, generate OG metadata

**Sample Map Page:**
- Location: `app/src/app/map/sample/page.tsx` + `app/src/app/map/sample/SampleMapClient.tsx`
- Triggers: `/map/sample` URL
- Responsibilities: Display static sample map (Sarah Chen) with Canvas/Document toggle. No API calls.

## Error Handling

**Strategy:** Graceful degradation with user-facing recovery options

**Patterns:**
- **Chat API errors:** Caught in `sendMessage()`, shows error bar with "Try again" button, removes failed user message from history so retry is clean
- **Map generation errors:** `generatingError` state shows retry button or "Back to conversation" option. Conversation data preserved.
- **Redis unavailable:** Falls back to localStorage-only storage. Map creation returns `{ stored: false }` but still provides an ID.
- **Canvas JSON parse failure:** Falls back to Document view only. Warning logged, no user-facing error.
- **Rate limiting:** In-memory per-IP rate limit (10 req/min) returns 429 with message.
- **Analytics failures:** Silently swallowed via try/catch in `app/src/lib/analytics.ts`

## Cross-Cutting Concerns

**Logging:** `console.error()` for server-side API errors and stream errors. No structured logging framework.

**Validation:**
- Request validation in `app/src/app/api/chat/route.ts`: checks message format, array length (max 100), content length (max 50,000 chars), valid phase values
- Map payload validation: markdown required, total size cap at 200KB

**Authentication:** None. The application is fully anonymous. No user accounts, no sessions beyond localStorage.

**Analytics:** Vercel Analytics via `@vercel/analytics`. Custom event tracking via `trackEvent()` in `app/src/lib/analytics.ts` for conversation_resumed, phase_transition, map_generation_started/complete, share_button_clicked, sample_map_viewed.

**Streaming:** Custom ReadableStream in the chat API route. Raw text chunks from Claude SDK events (`content_block_delta` / `text_delta`) are relayed directly to the client. No SSE or WebSocket -- just chunked HTTP response.

---

*Architecture analysis: 2026-03-17*
