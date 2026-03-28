# HUMA Codebase Audit — 2026-03-28

## Routes

| Route | File | Lines | Status | Accessible Via |
|-------|------|-------|--------|----------------|
| `/` | `src/app/page.tsx` | 182 | Live — state machine: landing → welcome → conversation → generating → map. Redirects to `/today` if V2 aspirations exist. | Direct URL (entry point) |
| `/start` | `src/app/start/page.tsx` | 571 | Live — V2 aspiration entry. "What's going on?" conversation → clarification → decomposition → save → auth → redirect to `/today`. | Nav from `/system`, `/today` ("Add aspiration" links) |
| `/today` | `src/app/today/page.tsx` | 960 | Live — Daily production sheet. Compiles behaviors, check-offs, insights. HOME for authed V2 users. | BottomNav "Today" tab; redirect from `/`, `/start` |
| `/system` | `src/app/system/page.tsx` | 1,292 | Live — Full system view. Aspirations, behaviors, stages, connections, edit controls, palette. | BottomNav "System" tab |
| `/chat` | `src/app/chat/page.tsx` | 545 | Live — Conversation history with context card, grouped messages, streaming input. | BottomNav "Talk" tab |
| `/home` | `src/app/home/page.tsx` | 273 | **V1 remnant** — Lotus workspace with petals, Ikigai flow. Requires auth + existing shape. | Redirect from `/` (if V1 shape exists), `/begin` |
| `/begin` | `src/app/begin/page.tsx` | 153 | **V1 remnant** — LotusFlow onboarding. 10-capital assessment. | Landing page "Begin" button |
| `/login` | `src/app/login/page.tsx` | 112 | Live — Magic link email auth. Redirects authed users to `/operate`. | Direct URL |
| `/operate` | `src/app/operate/page.tsx` | 39 | Live — Operate dashboard. Shows maps + weekly reviews. Requires auth. | Redirect from `/login` |
| `/operate/review/[mapId]` | `src/app/operate/review/[mapId]/page.tsx` | 44 | Live — Weekly review flow for a specific map. Requires auth. | Links from `/operate` dashboard |
| `/map/sample` | `src/app/map/sample/page.tsx` | 22 | Live — Sample canvas examples (Sarah Chen, Maya Okafor). | Link from conversation completion |
| `/map/[id]` | `src/app/map/[id]/page.tsx` | 74 | Live — Individual map display. Fetches from Supabase. | Generated map URLs |
| `/auth/callback` | `src/app/auth/callback/route.ts` | 20 | Live — Supabase magic link callback. Exchanges code → session → redirect. | OAuth provider redirect |

**Navigation:** BottomNav shows 3 tabs: Today / System / Talk. Hidden on `/` and `/start`.

---

## API Endpoints

| Endpoint | File | Method | Called By | Status |
|----------|------|--------|-----------|--------|
| `/api/v2-chat` | `src/app/api/v2-chat/route.ts` | POST | `start/page.tsx`, `chat/page.tsx`, `ConversationSheet.tsx` | Working — streams with OPTIONS/BEHAVIORS/CONTEXT/ASPIRATION_NAME markers |
| `/api/sheet` | `src/app/api/sheet/route.ts` | POST | `today/page.tsx` | Working — compiles daily sheet from aspirations |
| `/api/sheet/check` | `src/app/api/sheet/check/route.ts` | POST | `today/page.tsx` (via `updateSheetEntryCheck`) | Working — toggles check state in Supabase |
| `/api/insight` | `src/app/api/insight/route.ts` | POST | `today/page.tsx` | Working — computes behavioral correlation insights |
| `/api/palette` | `src/app/api/palette/route.ts` | POST | `start/page.tsx` | Working — suggests related concepts (uses Haiku) |
| `/api/chat` | `src/app/api/chat/route.ts` | POST | `useConversation.ts`, `useMapGeneration.ts` | Working — V1 multi-phase conversation streaming |
| `/api/maps` | `src/app/api/maps/route.ts` | POST | `useMapGeneration.ts` | Working — saves map to Supabase + Redis |
| `/api/maps/[id]` | `src/app/api/maps/[id]/route.ts` | GET | `map/[id]/MapClient.tsx` | Working — fetches map by ID |
| `/api/workspace-recommendation` | `src/app/api/workspace-recommendation/route.ts` | POST | `home/page.tsx` | Working — V1 workspace recommendation |
| `/api/shape-insight` | `src/app/api/shape-insight/route.ts` | POST | `shape/ShapeBuilder.tsx` | Working — 8-dimension shape analysis |
| `/api/ikigai-synthesis` | `src/app/api/ikigai-synthesis/route.ts` | POST | `ikigai/screens/IkigaiSynthesisScreen.tsx` | Working — Ikigai intersection synthesis |
| `/api/lotus-insight` | `src/app/api/lotus-insight/route.ts` | POST | `lotus/screens/InsightScreen.tsx` | Working — Lotus Flow insight |
| `/api/one-thing` | `src/app/api/one-thing/route.ts` | POST | **No client-side callers found** | Orphaned — endpoint exists but nothing calls it |
| `/api/operate/briefing` | `src/app/api/operate/briefing/route.ts` | POST | `operate/MorningBriefing.tsx` | Partially working — component is dead code (never imported) |
| `/api/operate/review` | `src/app/api/operate/review/route.ts` | POST | `operate/WeeklyReviewFlow.tsx` | Working — weekly review save |

---

## Data Flow Status

### Flow A: New User Entry

| Step | Status | Detail |
|------|--------|--------|
| 1. User arrives at `/start` | ✅ | Page renders with "What's going on?" prompt |
| 2. Types a message | ✅ | Input field at bottom, sends to `/api/v2-chat` |
| 3. AI responds with clarification cards | ✅ | `[[OPTIONS:[...]]]` markers parsed into tappable cards. 3-round clarification limit before auto-decomposition |
| 4. User taps a card | ✅ | `handleOptionTap` sends option text as next message |
| 5. AI decomposes into behaviors | ✅ | `[[BEHAVIORS:[...]]]` markers parsed. `DecompositionPreview` renders with checkboxes |
| 6. "Start tomorrow" button appears | ✅ | Appears in `DecompositionPreview` after behaviors are shown |
| 7. User taps "Start tomorrow" | ✅ | Calls `handleConfirmBehaviors` → `saveAndProceed` |
| 8. Auth flow triggers | ✅ | If not authed: `AuthModal` shown. If authed: skips to migration |
| 9. Aspiration saved to localStorage | ✅ | `huma-v2-aspirations`, `huma-v2-behaviors`, `huma-v2-known-context` written immediately |
| 10. Aspiration saved to Supabase | ✅ | `migrateLocalStorageToSupabase()` called after auth. Inserts into `contexts`, `aspirations`, `chat_messages` |
| 11. Sheet compiled | ✅ | On `/today` load: fetches aspirations → calls `/api/sheet` → receives entries |
| 12. Redirect to `/today` | ✅ | `router.push("/today")` after 2.2s transition animation |
| 13. Sheet entries appear | ✅ | Entries rendered with check-off toggles, time-of-day ordering |

**Flow A verdict: Works end-to-end.** One concern: the 500ms `setTimeout` wait for auth state propagation (`start/page.tsx:379`) is fragile — on slow connections, auth state may not be ready.

### Flow B: Daily Use

| Step | Status | Detail |
|------|--------|--------|
| 1. User opens `/today` | ✅ | Sheet loads. Checks localStorage cache first, then compiles if needed |
| 2. Sheet entries load | ✅ | Source priority: localStorage cache (`huma-v2-sheet-${date}`) → Supabase aspirations → `/api/sheet` compilation → fallback from aspiration behaviors |
| 3. User checks off an item | ✅ | `toggleEntry` updates local state, saves to localStorage, calls `updateSheetEntryCheck` + `logBehaviorCheckoff` |
| 4. Check state persists | ✅ | Written to: (1) React state, (2) localStorage cache, (3) Supabase `sheet_entries.checked`, (4) Supabase `behavior_log` |
| 5. Streak/week counter updates | ✅ | `getBehaviorWeekCounts` fetched after each check. Shows "checked X/Y" per behavior |
| 6. User navigates to `/system` | ✅ | BottomNav "System" tab. Loads aspirations from Supabase (or localStorage fallback) |
| 7. Aspiration appears with behaviors | ✅ | Each aspiration card shows behaviors with dimension tags, enable/disable toggles |
| 8. User taps "edit" | ✅ | `editingId` state toggles edit panel for that aspiration |
| 9. Stage selector appears | ✅ | Three buttons: Active / Planning / Someday |
| 10. User changes stage to "someday" | ⚠️ | Local state + localStorage updated immediately. **Supabase update is fire-and-forget (no await)** — may silently fail (`system/page.tsx:932-935`) |
| 11. Sheet entries for that aspiration deleted | ⚠️ | Supabase delete is also fire-and-forget (`system/page.tsx:936-941`). If either call fails, no error shown |
| 12. User navigates back to `/today` | ✅ | localStorage sheet cache cleared (`system/page.tsx:926`), forces recompile |
| 13. Sheet reflects stage change | ✅ | `compileSheet` filters to `stage === "active"` only (`today/page.tsx:589`). Orphan entries also filtered (`filterOrphanedEntries`) |

**Flow B verdict: Works, with fire-and-forget Supabase risk.** Stage changes and behavior edits don't `await` their Supabase mutations. If network fails, local state and Supabase diverge silently.

### Flow C: Aspiration Management

| Step | Status | Detail |
|------|--------|--------|
| 1. User on `/system` taps "edit" | ✅ | Edit panel opens with stage selector, behavior toggles, delete button |
| 2. Edit mode renders | ✅ | Controls: stage buttons (Active/Planning/Someday), per-behavior enable/disable, "Remove this aspiration" |
| 3. User taps "Delete this aspiration" | ✅ | `deleteAspiration` called. Confirms via browser `confirm()` dialog |
| 4. Aspiration marked as dropped | ⚠️ | Local state filtered immediately. Supabase `.update({ status: "dropped" })` is fire-and-forget (`system/page.tsx:997-1000`) |
| 5. Sheet entries cleaned up | ⚠️ | Supabase `.delete()` on today's sheet entries is fire-and-forget (`system/page.tsx:1001-1005`) |
| 6. localStorage cache cleared | ✅ | `huma-v2-aspirations` updated, `huma-v2-sheet-${today}` removed |
| 7. `/today` reflects deletion | ✅ | `filterOrphanedEntries` effect removes entries for missing aspirations on next render |
| 8. User taps "Add aspiration" | ✅ | Link to `/start` present on both `/system` and `/today` |
| 9. Navigates to `/start` | ✅ | Fresh conversation starts (or continues if existing messages) |
| 10. New aspiration flows back to `/system` | ✅ | After save + redirect to `/today`, new aspiration visible on `/system` via shared Supabase/localStorage data |

**Flow C verdict: Works, with same fire-and-forget risk.** Delete operations don't await Supabase. If network fails during delete, aspiration appears removed locally but persists in database. On next page load from Supabase, it would reappear.

---

## Database Tables Used

| Table | Columns Referenced in Code | Read By | Written By |
|-------|---------------------------|---------|------------|
| **contexts** | `id`, `user_id`, `known_context` (JSONB), `raw_statements`, `aspirations`, `created_at`, `updated_at` | `chat/page`, `system/page`, `today/page` (via `getKnownContext`) | `start/page` (via `getOrCreateContext`), `chat/page` (via `updateKnownContext`) |
| **aspirations** | `id`, `user_id`, `context_id`, `raw_text`, `clarified_text`, `behaviors` (JSONB), `dimensions_touched` (JSONB), `status`, `stage`, `created_at`, `updated_at` | `page.tsx` (root), `today/page`, `system/page`, `chat/page` | `start/page` (via `saveAspiration`), `system/page` (stage/status updates) |
| **sheet_entries** | `id`, `user_id`, `aspiration_id`, `date`, `behavior_key`, `behavior_text`, `detail` (JSONB), `time_of_day`, `checked`, `checked_at`, `dimensions` (JSONB), `created_at` | `today/page` (via `saveSheetEntries` read-back) | `today/page` (via `saveSheetEntries`), `api/sheet/check` |
| **chat_messages** | `id`, `user_id`, `role`, `content`, `context_extracted` (JSONB), `created_at` | `chat/page` (via `getChatMessages`) | `chat/page`, `start/page` (via `saveChatMessages`) |
| **insights** | `id`, `user_id`, `insight_text`, `dimensions_involved` (JSONB), `behaviors_involved` (JSONB), `data_basis` (JSONB), `delivered`, `delivered_at`, `created_at` | `today/page` (undelivered fetch) | `today/page` (after computation) |
| **behavior_log** | `id`, `user_id`, `behavior_name`, `date`, `completed`, `completed_at`, `created_at` | `today/page` (week counts via `getBehaviorWeekCounts`) | `today/page` (via `logBehaviorCheckoff`) |
| **maps** | `id`, `user_id`, `markdown`, `canvas_data`, `name`, `location`, `enterprise_count`, `created_at` | `map/[id]/page`, `operate/page`, `api/operate/*` | `api/maps` (POST) |
| **weekly_reviews** | `id`, `user_id`, `map_id`, `qol_responses`, `insight`, `created_at` | `operate/page`, `api/operate/briefing` | `api/operate/review` |
| **shapes** | `id`, `user_id`, `dimensions` (JSONB), `source`, `created_at` | `operator-context.ts` (fallback) | `shapes.ts` (from Lotus/builder) |
| **profiles** | `id`, `name`, `location`, `tier`, `created_at` | Limited use | Created via Supabase trigger on `auth.users` |

**Migrations (6 files in `supabase/migrations/`):**
1. `001_initial_schema.sql` — profiles, maps, shapes, weekly_reviews
2. `002_v2_core_loop.sql` — contexts, aspirations, sheet_entries, chat_messages, insights
3. `003_behavior_log.sql` — behavior_log table
4. `004_aspiration_stage.sql` — adds `stage` column to aspirations
5. `005_sheet_time_of_day.sql` — adds `time_of_day` to sheet_entries
6. `006_sheet_dimensions.sql` — adds `dimensions` JSONB to sheet_entries

---

## localStorage Keys

| Key | Stores | Written By | Read By | Notes |
|-----|--------|-----------|---------|-------|
| `huma-v2-aspirations` | JSON array of Aspiration objects | `start/page`, `chat/page`, `system/page` | `today/page`, `system/page`, `chat/page`, `start/page` | Primary local cache. Migrated to Supabase on auth |
| `huma-v2-behaviors` | JSON array of Behavior objects | `start/page` | `today/page` | Regeneratable from aspirations |
| `huma-v2-known-context` | JSON context object (name, facts) | `start/page`, `chat/page`, `system/page` | `today/page`, `system/page`, `chat/page`, `start/page` | Migrated to Supabase on auth |
| `huma-v2-chat-messages` | JSON array of ChatMessage | `chat/page` | `chat/page`, `today/page` | Conversation history backup |
| `huma-v2-start-messages` | JSON array of ChatMessage | `start/page` | `chat/page`, `today/page` | Onboarding conversation |
| `huma-v2-sheet-${date}` | JSON array of SheetEntry | `today/page` | `today/page` | Daily sheet cache (date-keyed). Cleared on stage change |
| `huma-v2-pending-insight` | JSON Insight object | `today/page` | `today/page` | Last undelivered insight |
| `huma-v2-start-date` | ISO date string | `start/page` | `today/page` (day counter) | When operator started |
| `huma-map-${id}` | JSON map data | `map/[id]` pages | `map/[id]` pages | Canvas document cache |
| `huma-conversation` | JSON SavedConversation | `persistence.ts` | `persistence.ts` | **V1 legacy** — unused by V2 |
| `huma-operator-context` | JSON OperatorContext | `operator-context.ts` | `operator-context.ts` | **V1 legacy** — Lotus Flow context fallback |
| `huma_onboarding` | JSON LotusState | `lotus-persistence.ts` | `lotus-persistence.ts` | **V1 legacy** — Lotus screen state |

**Mismatch note:** Migration function `migrateLocalStorageToSupabase()` only migrates today's sheet entries (`huma-v2-sheet-${today}`), not historical dates. Users lose multi-day check-off history on auth migration.

---

## Dead Code

### Dead Components (45 files — 61% of all components)

**Canvas (15 dead):** `CanvasClosing`, `CapitalConstellation`, `EnterpriseCards`, `EssenceCore`, `FieldLayers`, `NodalActions`, `ProductionRing`, `QoLRing`, `ResourceRing`, `RingLabel`, `SpatialCanvas`, `SpatialEssence`, `SpatialPill`, `SpatialRing`, `ValidationProtocol`, `WeeklyRhythm`

**Lotus screens (13 dead):** `CanvasIntroScreen`, `CapitalSpectrumScreen`, `ComponentRevealScreen`, `FlowerScreen`, `GovernanceScreen`, `InsightScreen`, `LifeStageScreen`, `NameEntityScreen`, `SaveScreen`, `SynthesisScreen`, `WholeBornScreen`, `WholeEvolvesScreen`, `WholeTransitionScreen`, `LotusNav`

**Ikigai (6 dead):** `IkigaiVenn`, `TripleInput`, `GoodScreen`, `IkigaiIntroScreen`, `IkigaiReviewScreen`, `IkigaiSynthesisScreen`, `LoveScreen`, `NeedScreen`

**Operate (3 dead):** `MorningBriefing`, `QoLCheckForm`, `ReviewInsight`

**Shape (7+ dead):** `DailyPulse`, `OneThing`, `ShapeBuilder`, all 8 dimension illustrations (`BodyIllustration`, `GrowthIllustration`, `HomeIllustration`, `IdentityIllustration`, `JoyIllustration`, `MoneyIllustration`, `PeopleIllustration`, `PurposeIllustration`)

**Root (2 dead):** `MapPreview`, `ShareCard`

### V1 Routes Still Accessible
- `/home` — V1 Lotus workspace (273 lines). Accessible if user has existing shape.
- `/begin` — V1 LotusFlow onboarding (153 lines). Linked from landing page.
- `/login` → `/operate` — Redirects to V1 operate dashboard.

### Orphaned API Endpoint
- `/api/one-thing` — No client-side code calls this endpoint.
- `/api/operate/briefing` — Called by `MorningBriefing.tsx` which is dead code (never imported).

---

## Critical Bugs Found

1. **Fire-and-forget Supabase mutations** (`system/page.tsx:932-941, 972-975, 997-1005`): Stage changes, behavior edits, and aspiration deletions call Supabase `.update()` / `.delete()` without `await`. If network fails, local state diverges from database. On next load from Supabase, changes revert silently.

2. **Non-atomic sheet save** (`supabase-v2.ts:saveSheetEntries`): Delete old entries then insert new entries in two separate calls. If insert fails after delete, the day's sheet is empty until next compile.

3. **behavior_log upsert keyed on text, not ID** (`supabase-v2.ts:logBehaviorCheckoff`): Uses `behavior_name` (display text) as the upsert key. If behavior text is edited on `/system`, old log entries are orphaned and week counts break for that behavior.

4. **localStorage migration data loss** (`supabase-v2.ts:migrateLocalStorageToSupabase`): Only migrates today's sheet cache (`huma-v2-sheet-${today}`). Users with multi-day pre-auth history lose all historical check-off data.

5. **Fragile auth propagation delay** (`start/page.tsx:379`): After auth completes, waits 500ms via `setTimeout` before calling `supabase.auth.getUser()`. On slow connections, auth state may not be ready, causing migration to fail silently (localStorage fallback still works).

6. **Timezone-dependent date comparison** (`today/page.tsx`): Sheet date uses `new Date().toISOString().split("T")[0]` which is UTC. LocalStorage cache key and Supabase queries may reference different dates near midnight depending on operator's timezone.

---

## Environment Variables

| Variable | Required | Used By | Fallback |
|----------|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for persistence) | All Supabase clients | Graceful — app works localStorage-only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for persistence) | All Supabase clients | Graceful — app works localStorage-only |
| `ANTHROPIC_API_KEY` | Yes (for AI) | All `/api/*` routes | Returns 500 errors |
| `ANTHROPIC_MODEL` | No | All AI API routes | `claude-sonnet-4-20250514` |
| `ANTHROPIC_MODEL_FAST` | No | `/api/palette` | `claude-haiku-4-5-20251001` |
| `NEXT_PUBLIC_SITE_URL` | No | `layout.tsx` metadata | `https://huma.earth` |
| `KV_REST_API_URL` | No | Redis (map caching) | Graceful fallback to Supabase-only |
| `KV_REST_API_TOKEN` | No | Redis (map caching) | Graceful fallback to Supabase-only |

---

## What Works End-to-End

- **New user entry flow:** `/start` → conversation → decomposition → auth → save → `/today` with compiled sheet
- **Daily check-offs:** `/today` loads sheet → check items → state persists to localStorage + Supabase + behavior_log
- **Conversation continuation:** `/chat` loads history → send message → streaming response with markers → save
- **Aspiration viewing:** `/system` loads all aspirations with behaviors, dimensions, week counts
- **Sheet recompilation:** Stage changes on `/system` clear cache → `/today` recompiles with only active aspirations
- **Orphan cleanup:** Deleting an aspiration on `/system` removes its entries from `/today` on next render

## What's Broken or Risky

- **Silent data divergence:** All Supabase writes from `/system` are fire-and-forget. Network failures = local/remote split
- **Non-atomic sheet save:** Delete-then-insert pattern risks empty sheet on partial failure
- **behavior_log text-keyed:** Editing behavior text orphans historical tracking data
- **Migration loses history:** Only today's sheet migrated from localStorage to Supabase
- **Auth timing fragile:** 500ms setTimeout for auth state propagation
- **V1/V2 coexistence:** `/home`, `/begin`, `/operate` routes still accessible. V1 and V2 share the same Supabase tables (shapes, profiles) but use different data models. No clear boundary or redirect gate between the two architectures.
- **61% dead code:** 45 of 74 components are imported nowhere. Code weight without value.
- **Two orphaned API endpoints:** `/api/one-thing` has no callers. `/api/operate/briefing` only called by dead component.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Page routes | 12 |
| API routes | 16 (including auth callback) |
| Components total | 74 `.tsx` files |
| Components alive | 29 (39%) |
| Components dead | 45 (61%) |
| Supabase tables | 10 |
| localStorage keys | 12 |
| Environment variables | 8 |
| Migration files | 6 |
| Critical bugs | 6 |
