# External Integrations

**Analysis Date:** 2026-03-17

## APIs & External Services

**AI / LLM:**
- Anthropic Claude API - Core conversation engine and document/canvas generation
  - SDK/Client: `@anthropic-ai/sdk` ^0.78.0
  - Auth: `ANTHROPIC_API_KEY` env var
  - Model: `claude-sonnet-4-20250514` (hardcoded in `app/src/app/api/chat/route.ts` line 140)
  - Usage: Streaming responses via `anthropic.messages.stream()`
  - Three prompt modes:
    1. **Conversation** - 6-phase Design Mode guided conversation (max 4096 tokens). System prompt built by `buildFullPrompt()` in `app/src/engine/phases.ts`
    2. **Document generation** - Markdown map output (max 8192 tokens). System prompt built by `buildDocumentPrompt()` in `app/src/engine/phases.ts`
    3. **Canvas data generation** - Structured JSON output (max 8192 tokens). System prompt built by `buildCanvasDataPrompt()` in `app/src/engine/canvas-prompt.ts`
  - Client instantiation: `new Anthropic()` (reads API key from `ANTHROPIC_API_KEY` env var automatically)

**Analytics:**
- Vercel Analytics - Usage tracking
  - SDK/Client: `@vercel/analytics` ^2.0.1
  - Auth: Automatic (Vercel deployment)
  - Component: `<Analytics />` rendered in `app/src/app/layout.tsx`
  - Custom events: `track()` wrapped in `trackEvent()` at `app/src/lib/analytics.ts`
  - Events tracked: `conversation_resumed`, `phase_transition`, `map_generation_started`, `map_generation_complete`, `share_button_clicked`

## Data Storage

**Remote Database:**
- Upstash Redis (via Vercel KV integration)
  - SDK/Client: `@upstash/redis` ^1.37.0
  - Connection: `KV_REST_API_URL` env var (REST endpoint)
  - Auth: `KV_REST_API_TOKEN` env var
  - Client factory: `getRedis()` function in `app/src/app/api/maps/route.ts` and `app/src/app/api/maps/[id]/route.ts`
  - Graceful degradation: Returns `null` if env vars not configured; app falls back to localStorage
  - Data pattern: Key-value store with `map:{id}` keys, JSON-serialized map data
  - TTL: 90 days (7,776,000 seconds) per map entry
  - Size limit: 200KB max per map payload (enforced in POST handler)

**Client-Side Storage:**
- localStorage - Two purposes:
  1. **Conversation persistence**: Save/resume in-progress conversations via `app/src/lib/persistence.ts`. Key: `huma-conversation`. Stores messages, phase, context, operator name/location, timestamp
  2. **Map caching**: Instant map load on same device. Key: `huma-map-{id}`. Stores markdown + canvasData JSON

**File Storage:**
- None (no file uploads or cloud storage)

**Caching:**
- In-memory rate limiting only (Map-based, per-deployment, resets on redeploy). See `app/src/app/api/chat/route.ts` lines 8-31
- No Redis-based caching for API responses
- No CDN caching configuration

## Authentication & Identity

**Auth Provider:**
- None. No user authentication system exists
- No login, registration, or session management
- Maps are identified by auto-generated IDs (`Date.now().toString(36) + random`), not user accounts
- Rate limiting is IP-based, not user-based (10 requests/minute/IP)

## Monitoring & Observability

**Error Tracking:**
- None. Errors are logged to `console.error` only
- No Sentry, Datadog, or similar error tracking service

**Logs:**
- `console.error` for API errors (`app/src/app/api/chat/route.ts`, `app/src/app/api/maps/route.ts`)
- `console.warn` for non-fatal issues (canvas JSON parse failure in `app/src/app/page.tsx`)
- No structured logging framework
- No log aggregation service

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `@vercel/analytics` and Upstash/Vercel KV integration pattern)
- No `vercel.json` configuration file — uses platform defaults

**CI Pipeline:**
- None detected. No GitHub Actions, no CI config files

## Environment Configuration

**Required env vars (all in `app/.env.local`):**
- `ANTHROPIC_API_KEY` - Required. Claude API key. Checked at runtime in `app/src/app/api/chat/route.ts` line 69; returns 503 if missing
- `KV_REST_API_URL` - Optional. Upstash Redis REST URL. If missing, maps fall back to localStorage-only (no cross-device sharing)
- `KV_REST_API_TOKEN` - Optional. Upstash Redis auth token. Required alongside `KV_REST_API_URL`

**Secrets location:**
- `app/.env.local` (gitignored, local development)
- Vercel environment variables (production)

## API Routes

**`POST /api/chat`** (`app/src/app/api/chat/route.ts`):
- Purpose: Proxy to Anthropic Claude API with system prompt injection
- Auth: None (rate-limited by IP)
- Rate limit: 10 requests/minute/IP (in-memory)
- Input validation: Messages array (max 100 messages, max 50KB per message), phase enum, optional context/syntheses
- Request modes (mutually exclusive):
  - Default: Conversation with phase-specific system prompt
  - `generateDocument: true`: Document markdown generation
  - `generateCanvas: true`: Canvas JSON data generation
- Response: Streaming text (`Transfer-Encoding: chunked`, `Content-Type: text/plain`)
- Error codes: 400 (validation), 429 (rate limit), 503 (no API key), 500 (Claude API error)

**`POST /api/maps`** (`app/src/app/api/maps/route.ts`):
- Purpose: Store generated map in Upstash Redis
- Input: `{ markdown, canvasData?, name, location, enterpriseCount, createdAt }`
- ID generation: `Date.now().toString(36) + Math.random().toString(36).slice(2,6)`
- Response: `{ id, stored: boolean }` (stored=false when Redis unavailable)
- Graceful fallback: Returns ID even on Redis failure for localStorage fallback

**`GET /api/maps/[id]`** (`app/src/app/api/maps/[id]/route.ts`):
- Purpose: Retrieve stored map from Upstash Redis
- Response: Map JSON data or 404/503 errors
- No caching headers set

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Font Loading

- Google Fonts via `next/font/google` (no external CDN calls at runtime; fonts are self-hosted by Next.js)
  - Cormorant Garamond: weights 300, 400, 500, 600 (normal + italic)
  - Source Sans 3: weights 300, 400, 500, 600
  - Both use `display: "swap"` for performance
  - CSS variables: `--font-cormorant` and `--font-source-sans`
  - Loaded in `app/src/app/layout.tsx`

## Third-Party Client Libraries (browser-side)

- `react-markdown` ^10.1.0 - Renders AI-generated markdown as React components. Used in `app/src/components/MapDocument.tsx`
- `remark-gfm` ^4.0.1 - GFM table/syntax support for react-markdown

## Integration Architecture Notes

- **No abstraction layer for AI**: Claude API is called directly in the single `/api/chat` route. No provider-agnostic interface despite CLAUDE.md mentioning "AIProvider abstraction"
- **No database ORM**: Redis is accessed via raw `@upstash/redis` client with manual JSON serialization
- **No middleware**: Rate limiting, validation, and error handling are inline in route handlers
- **Streaming pattern**: Claude responses stream through Next.js API route to browser via `ReadableStream`. No WebSocket or SSE — uses raw chunked transfer encoding
- **Dual storage strategy**: Maps are stored in both Redis (shareable, 90-day TTL) and localStorage (instant load, indefinite). Redis failure is non-fatal

---

*Integration audit: 2026-03-17*
