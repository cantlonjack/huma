# Code Workspace

## Non-Obvious Architecture

- **Pre-auth data lives in localStorage**, migrated to Supabase on sign-in via `migrateLocalStorageToSupabase()`. Post-auth: Supabase is source of truth.
- **Conversation engine uses `[[MARKER:...]]` protocol** in streamed responses, parsed client-side. Markers route data to context storage, aspiration creation, decomposition rendering.
- **Production sheet compiled daily by Claude** (`/api/sheet`), cached in localStorage by date key `huma-v2-sheet-YYYY-MM-DD`.
- **Maps cached in Redis** (Upstash KV, 90-day TTL) with Supabase fallback.

## What Doesn't Work Yet
- Behavioral insights (`/api/insight`) require 7+ days of data
- No push notifications or morning briefing delivery

## Active Constraints
- Migrations required: `009_aspiration_phases.sql`, `010_patterns.sql`, `011_push_subscriptions.sql`
- Env vars for cron: `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, VAPID keys
