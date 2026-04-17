# HUMA Ship-Quality Plan

Source: April 2026 audit. Goal: move all identified gaps from "works" to "unforgettable."

Sessions are ordered by leverage. Each prompt is self-contained — paste into a fresh session.

## Session order

**P0 — Moat + signature (do first, sequentially)**
1. Close the RPPL human loop
2. Deploy ConnectionThreads to /whole and /grow
3. Shareable daily sheet
4. Sheet preview in onboarding

**P1 — Finish + retention (parallelizable after P0)**
5. Finish onboarding shortening (70% → 100%)
6. Weekly review ritual
7. Evidence synthesis for /grow
8. Dark mode

**P2 — Legibility + polish**
9. Mental-model visibility (9-dimension legibility)
10. /whole simplification (unified visual grammar)
11. Desktop layout + env.example + small fixes

---

## Session 1 — Close the RPPL human loop

**Why this is first:** RPPLs are the moat. The seed library is massive and the typed graph engine is impressive, but the right half of the adoption arrow (user-adopted → personally validated → community-contributed) is 0%. This session closes the smallest viable loop.

**Scope (in):**
- When Claude suggests a practice in conversation, emit a `[[PRACTICE:{rpplId:"..."}]]` marker so the resulting Pattern carries `provenance.rpplId`.
- Parse the marker in `lib/parse-markers-v2.ts` and pipe through the sheet/pattern creation path.
- Wire `RpplProvenanceSheet` to open from any Pattern card that has `provenance.rpplId` (both /grow and /whole).
- Persist `CapacityState` so `verifyLifeGraph()` prerequisite checks actually gate recommendations instead of silently passing.
- Surface one verification signal in /grow: unsatisfied prereqs and keystone prompts.

**Scope (out):**
- Community contribution UI (separate later session).
- Rewriting `pattern-extraction.ts` heuristic — that's Session 7.
- UI polish on RpplProvenanceSheet beyond wiring.

**Files to read first:**
- `docs/build-plan-typed-rppl-graph.md`, `docs/rppl-port-audit.md`
- `app/src/lib/parse-markers-v2.ts`, `app/src/lib/services/prompt-builder.ts`
- `app/src/lib/pattern-extraction.ts` and wherever Pattern is created from chat
- `app/src/lib/context-encoding.ts` (CapacityState type)
- `app/src/lib/verify-life-graph.ts` (or equivalent — grep for `verifyLifeGraph`)
- `app/src/components/RpplProvenanceSheet.tsx`

**Acceptance:**
- A Pattern created by Claude mentioning a seeded RPPL has non-empty `provenance.rpplId`.
- Clicking "Where this comes from" on that Pattern opens the sheet with real content.
- `capacityState` is read+written somewhere stable (Supabase via `lib/db`, with localStorage mirror pre-auth).
- At least one verification signal renders in /grow when prereqs are unmet.

**Verification:** preview_start, walk through a fresh /start → /today → /grow flow, screenshot the provenance sheet and the prereq surface.

---

## Session 2 — Deploy ConnectionThreads to /whole and /grow

**Why:** Signature visual primitive exists and is only used on /today. /whole renders connections as "color-dot + comma-separated serif text." /grow has no topology viz at all. This is the most direct win for the "no visual language for connections" critique.

**Scope (in):**
- Replace /whole's `ConnectionsList` (text-based) with a `ConnectionThreads` render grouped by aspiration.
- Replace /grow's correlation cards with threaded topology where connections are spatial.
- On /today, highlight the behaviors the through-line references (matching stroke color, subtle link).

**Scope (out):**
- /whole's 5-subsystem consolidation (Session 10).
- New algorithmic correlation strength (Session 7).

**Files to read first:**
- `app/src/components/ConnectionThreads.tsx` (the primitive)
- `app/src/app/whole/*` and `ConnectionsList`
- `app/src/app/grow/*` and correlation card components
- `app/src/app/today/*` — through-line renderer
- `docs/HUMA_DESIGN_SYSTEM.md` for stroke/color rules

**Acceptance:**
- /whole shows threads, not comma-serif lists, for connections between aspirations.
- /grow surfaces patterns as threaded topology at least on the main correlation view.
- /today through-line visually links the behaviors it references (shared color or thread).
- No regression on /today's existing ConnectionThreads usage.

**Verification:** preview_resize desktop + mobile, preview_screenshot each page, preview_inspect to confirm stroke colors match the design system.

---

## Session 3 — Shareable daily sheet (Prompt 06)

**Why:** Zero work shipped on this virality lever. Self-contained — no cross-session deps after Session 1.

**Scope (in):**
- Share button on /today's compiled sheet.
- `/api/og/sheet` — dynamic OG image in HUMA's visual grammar (reuse patterns from existing `/api/og`).
- Public `/sheet/[id]` page: read-only rendering of a past daily sheet with OG tags.
- Supabase row or existing sheet row exposed with a short slug; RLS allows public read of shared sheets only (explicit `is_public` flag).

**Scope (out):**
- Sharing insights or maps (already has `/map/[id]`).
- Social platform pre-fill beyond standard Web Share API.

**Files to read first:**
- `app/src/app/api/og/route.ts` (existing OG generator to mirror)
- `app/src/app/api/maps/route.ts` + `app/src/app/map/[id]/page.tsx` (pattern for shareable surface)
- `app/src/app/today/*` — where share button lands
- `app/supabase/migrations/` — add migration for `is_public` column on sheets table

**Acceptance:**
- Logged-in user on /today can tap Share → gets a public URL.
- URL renders the sheet for anyone unauth'd.
- OG image renders HUMA-styled preview on Twitter/iMessage/Slack cards.
- Non-public sheets 404 when accessed by URL.

**Verification:** preview_start, share a sheet, curl the public URL unauth'd, inspect OG with a card validator.

---

## Session 4 — Sheet preview in onboarding (Prompt 02)

**Why:** Largest unbuilt conversion lever. Time-to-value is still gated behind full decomposition. A preview sheet mid-onboarding gives instant "I see what this is."

**Scope (in):**
- New `SheetPreview` component — reuses /today's sheet visual, renders with partial context.
- `/start` triggers a preview after a minimum-viable context threshold (pick: after first aspiration decomposed or exchange count ≥ N — be conservative, early is better than late).
- Preview must be non-committal — clearly marked "a sample of tomorrow" not "your sheet."
- Mobile-first layout.

**Scope (out):**
- Full daily sheet functionality (check-offs, capital pulse) — preview is read-only.
- Personalization beyond what onboarding context supports.

**Files to read first:**
- `app/src/hooks/useStart.ts`
- `app/src/lib/services/sheet-service.ts` — especially the compilation path
- `app/src/app/today/*` — sheet render to mirror
- `app/src/lib/context-model.ts` — completeness scoring (threshold gate)

**Acceptance:**
- During /start, once the threshold is met, a `SheetPreview` card appears inline in the conversation.
- Preview renders 3–5 sample actions derived from current context, clearly labeled as preview.
- Refresh/regenerate button if user wants a different preview.
- Zero impact on existing /today compilation logic.

**Verification:** preview_start, run through /start fresh, screenshot the moment the preview appears.

---

## Session 5 — Finish onboarding shortening (70% → 100%)

**Why:** `QUICK_START_MODE` prompt + exchange counting are in. The "Ready to build your first day?" CTA and progress text are the last mile.

**Scope (in):**
- Progress text: users should know roughly where they are in onboarding without a progress bar. Phrase in HUMA voice.
- "Ready to build your first day?" affordance — an explicit user-facing button that closes the discovery phase and kicks decomposition.
- Tighten any remaining verbose prompt language in `QUICK_START_MODE`.

**Scope (out):**
- Preview card (Session 4 — plan for the affordance to sit alongside the preview).
- Rewriting the entire onboarding script.

**Files to read first:**
- `app/src/lib/services/prompt-builder.ts` — especially `QUICK_START_MODE`
- `app/src/hooks/useStart.ts`
- `app/src/app/start/*`
- `docs/HUMA_VOICE_BIBLE.md`

**Acceptance:**
- User sees progress cues inline (not a bar — natural phrasing).
- Explicit CTA appears at the right moment; tapping it transitions to decomposition.
- Voice matches the bible (no corporate progress-bar language).

**Verification:** preview_start, walk through /start, screenshot each milestone in the flow.

---

## Session 6 — Weekly review ritual (Prompt 03 finish)

**Why:** Retention compounds from a real weekly ritual. Commit ae8ea72 only stubbed it.

**Scope (in):**
- `WeeklyReviewCard` component on /today or /whole (pick the one where users already land on Sunday/Monday).
- `/api/weekly-review` — accepts the past 7 days' behaviors + aspirations, returns {wins, drifts, one_shift_for_next_week, graph_highlight}.
- Graph highlight: one aspiration or connection visually emphasized on /whole's ConnectionThreads render for the coming week.
- Supabase migration for `weekly_reviews` table (or reuse `insights` if the shape fits).

**Scope (out):**
- Push notification for the weekly review (Sessions combine later if helpful).
- Multi-week history view — single latest review is enough.

**Files to read first:**
- Prompt 03 source
- `app/src/app/api/insight/route.ts` (mirror pattern for Claude-backed summaries)
- `app/src/app/api/reflection/route.ts`
- Session 2's ConnectionThreads output on /whole

**Acceptance:**
- Card appears at the right weekly cadence.
- Clicking "Start weekly review" runs the API and renders wins/drifts/shift in HUMA voice.
- /whole reflects the graph highlight until the next review.

**Verification:** preview_start, seed 7 days of behavior data, trigger the review manually, screenshot the card and the highlighted /whole.

---

## Session 7 — Evidence synthesis for /grow

**Why:** Calling /grow an "evidence view" when `pattern-extraction.ts` is `is_trigger: true + count ≥ 2` is a credibility tax. Move to real correlation strength.

**Scope (in):**
- Extend `pattern-extraction.ts` with time-series correlation: for a candidate trigger/outcome pair, compute directional lift over the observation window.
- Populate Evidence objects with real `confidence` (numeric) and `contextTags`.
- /grow surfaces: the correlation strength (not just a sparkline), the sample size, and an honest "not enough data yet" state when confidence < threshold.
- Merge suggestions should cite evidence, not just similarity.

**Scope (out):**
- Fancy stats — keep it honest (delta in outcome rate when trigger present vs absent, sample size ≥ N).
- UI rewrite of /grow beyond the evidence card.

**Files to read first:**
- `app/src/lib/pattern-extraction.ts`
- `app/src/app/grow/*`
- `app/src/lib/capital-computation.ts` (borrow patterns from behavior scoring)
- `app/src/types/*` — Pattern, Evidence types

**Acceptance:**
- Patterns have real confidence scores persisted.
- /grow's card shows strength + sample size + low-data state.
- Old heuristic path removed or gated behind a feature flag.

**Verification:** seed data with known correlation, verify the number surfaces correctly; seed data with no signal, verify the low-data state renders.

---

## Session 8 — Dark mode

**Why:** Morning-use $29/mo product with no dark theme is not ship-quality. `ConnectionThreads.darkMode` prop already exists but is unused.

**Scope (in):**
- Tailwind v4 `@theme` dark variant in `globals.css`.
- Full palette for light + dark: surfaces, text, strokes, accents.
- Wire the existing `darkMode` prop on ConnectionThreads + any sibling viz primitives.
- System-preference default + user toggle in app chrome.
- All key surfaces verified in dark: /start, /today, /whole, /grow, /chat, /map.

**Scope (out):**
- Theming the landing page beyond what's trivially consistent.
- Animated transition between modes.

**Files to read first:**
- `app/src/app/globals.css`
- `docs/HUMA_DESIGN_SYSTEM.md`
- `app/src/components/ConnectionThreads.tsx`

**Acceptance:**
- `prefers-color-scheme: dark` renders correctly on every page above.
- Manual toggle persists (localStorage).
- No contrast failures (WCAG AA minimum).

**Verification:** preview_resize with `colorScheme: dark`, screenshot each page in both modes.

---

## Session 9 — Mental-model visibility (9-dimension legibility)

**Why:** Users see the Context Assembly ring light up but don't understand the instrument. "Intentionally hidden to avoid intake-form feel" is defensible but costs legibility. Make it *quietly* visible.

**Scope (in):**
- A single affordance (hover, tap, or slide-over) that reveals "what HUMA is listening for" — the 9 dimensions with human-voice descriptions, not a schema dump.
- Live state: which dimensions have signal vs are still quiet.
- Must feel like Facebook Profile (per memory: `feedback_context_template.md`), not clinical.

**Scope (out):**
- Editable dimension sliders or forms.
- Any required step — strictly optional discoverability.

**Files to read first:**
- `app/src/lib/context-model.ts` — the 9 dimensions + completeness
- Context Assembly Panel component (grep `ContextAssembly` or `context-assembly`)
- `docs/HUMA_VOICE_BIBLE.md`
- Memory: `feedback_context_template.md`

**Acceptance:**
- Dimension legend reachable in one gesture from the existing ring.
- Copy feels human, not schema.
- No new required steps in any flow.

**Verification:** preview_screenshot the affordance open; preview_snapshot to confirm accessible roles.

---

## Session 10 — /whole simplification (unified visual grammar)

**Why:** Phase 6 collapsed three intents but /whole still hosts 21 components across 5 subsystems with no unifying grammar. After Session 2 lands threads, consolidate.

**Scope (in):**
- Audit the 5 subsystems (AspirationsList, Pathway, CapacityIndicator, PatternsList, ConnectionsList) and reduce to a single spatial canvas with lenses/filters.
- One zoom level model (aspiration → pathway → behaviors) instead of sibling panels.
- Keep destructive changes minimal — re-use the existing hooks, rewire presentation.

**Scope (out):**
- New data model. Purely a presentation unification.
- Rewriting the force-directed physics.

**Files to read first:**
- `app/src/app/whole/*` (every component)
- `app/src/hooks/useWhole.ts`
- Post-Session-2 `ConnectionThreads` integration points
- `docs/HUMA_DESIGN_SYSTEM.md`

**Acceptance:**
- /whole is one canvas. Subsystems become lenses or layers.
- No data hook rewrites; presentation only.
- Both desktop + mobile read as a single instrument.

**Verification:** preview_resize desktop + mobile, preview_screenshot, ensure no broken interactions (preview_click on each lens).

---

## Session 11 — Desktop layout, env.example, small fixes

**Why:** Single-column on wide screens is unfinished. Two env vars silently missing.

**Scope (in):**
- Multi-column desktop layouts for /today, /whole, /grow, /chat where it helps (≥ 1024px).
- Add `ANTHROPIC_MODEL_FAST` and `CLAUDE_MODEL` to `.env.example` with comments pointing to where they're read.
- Any tiny nits from the audit that didn't warrant their own session.

**Scope (out):**
- Tablet-specific layouts beyond what falls out naturally.

**Files to read first:**
- All page-level files touched in earlier sessions (take this session last)
- `.env.example` and grep for `process.env.ANTHROPIC_MODEL_FAST` / `process.env.CLAUDE_MODEL`
- `app/src/app/api/palette/route.ts`, `app/src/app/api/canvas-regenerate/route.ts`

**Acceptance:**
- Wide screens use horizontal space meaningfully (not centered 640px column).
- `.env.example` lists every env var read in code.

**Verification:** preview_resize 1440×900 and 1920×1080, screenshot each page.

---

## Cross-session principles (apply every session)

- Surgical edits only. Never rewrite files with accumulated design work. (Memory: `feedback_never_rewrite.md`.)
- Preview-verify only browser-observable changes. Skip for pure refactors.
- RPPLs must be truth-based, not institution-based. (Memory: `feedback_rppl_truth_based.md`.)
- The single test before building: does this reduce cognitive load and reveal connections?
- Commit per session with a clear scope. Don't batch two sessions into one commit.
