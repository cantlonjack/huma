# Phase 2 — Deferred Items

Items discovered during Phase 2 execution that are **out of scope** for their discovering plan. Logged here for triage, not fixed inline.

## Flaky tests in Phase 1 scope (pre-existing, non-deterministic)

**Discovered by:** Plan 02-01 (confidence-math) during its full-suite run.

**Symptom:** Different 1–3 tests fail on each full-suite run. Failures rotate across:
- `src/lib/capital-pulse.test.ts` — `quietDimension` assertions (passes in isolation)
- `src/app/api/sheet/route.auth.test.ts` — SEC-01 401 assertion (passes in isolation)
- `src/app/api/sheet/route.budget.test.ts` — SEC-03 `countTokens()` pass-through (passes in isolation)
- `src/app/api/v2-chat/route.test.ts` — marker rejection 400 check
- Possibly others — not comprehensively enumerated

**Root cause (best hypothesis):** Vitest's default parallel test workers on Windows can race during first-time dynamic-import graphs of Next/Anthropic/Supabase. Each affected test file lazy-imports the route under test after `vi.mock(...)` calls. Under parallelism, the dynamic-import timing can exceed the 15s test timeout, causing a spurious failure. Tests pass 100% in isolation.

**Evidence this is NOT a REGEN-01 regression:**
1. All three test files that failed during 02-01's run were authored in Phase 1 or earlier.
2. `npm test -- <single file>` passes 100% for each of the affected files.
3. The test file that IS in REGEN-01 scope (`capital-pulse.test.ts`) has a comment at line 135 already acknowledging the REGEN-02 rename from `dormant` to `quiet` — the tests were updated as part of Phase 2 prep, not by 02-01.
4. Each run reproduces different failures, confirming non-determinism.

**Recommended fix (future plan):**
- Investigate `app/vitest.config.ts` options: `pool: "forks"` + `poolOptions.forks.singleFork: true` might serialize the dynamic-import graph and eliminate the race on Windows without materially slowing the suite (current run ~200s).
- Alternative: per-route-test `setupFiles` that pre-warm the Next/Anthropic module graph before `beforeAll()` so the import cost is front-loaded rather than racing under parallelism.
- Owner: likely Phase 1.1 gap-closure OR a dedicated "test infra" spike in Phase 2 wrap-up.

**Not blocking Plan 02-01:**
- REGEN-01's own tests (`capital-computation.test.ts`, `capital-score-confidence.test.ts`, `CapitalRadar.confidence.test.tsx`) pass 100% both in isolation AND in the full suite across multiple runs.
- The three REGEN-01 files exercise pure math + a pure React component — no Next/Anthropic/Supabase dynamic imports, so they are not affected by the race.

**Logged:** 2026-04-22 by Plan 02-01 executor.

---

## CapitalScore literal sweep missed two sites (pre-existing, Phase 2-01 scope) — RESOLVED 2026-04-24 by Plan 02-03

**Discovered by:** Plan 02-02 (dormancy) during post-rename `npx tsc --noEmit`.

**Symptom:** `tsc --noEmit` reports 10 errors across two files:
- `scripts/sanity-check-encoding.ts` (lines 149–156) — 8 CapitalScore literals constructed without `confidence`
- `src/components/canvas/MapDocument.tsx` (line 202) — CapitalScore literal passed to a function expecting the full type

**Root cause:** Plan 02-01 added required `confidence: number` to `CapitalScore` and swept 4 existing literal construction sites (sample-map.ts ×2, context-encoding.test.ts, ShareCard.tsx). Two additional sites were missed — `scripts/sanity-check-encoding.ts` is a root-level scripts file (excluded from vitest/build globs, so no red surface), and `MapDocument.tsx` was evidently not touched during Plan 02-01's sweep.

**Not blocking Plan 02-02:** The rename this plan performs (`CapitalPulse.dormant → CapitalPulse.quiet`) is orthogonal to `CapitalScore.confidence`. My scope is `CapitalPulse` / `PulseData` / `huma_context.dormant`. The `tsc` errors pre-date my edits — `git stash` + `tsc` on HEAD shows the same 10 errors.

**Recommended fix:** Add `confidence: 1` to each of the 8 literals in `sanity-check-encoding.ts` (it's a sample-data script — fully-formed operator) and `confidence: 0` to the `MapDocument.tsx` construction site (likely a fallback path). One-line per site; tiny sweep. Owner: whoever writes the next `CapitalScore`-touching plan (02-03 capital receipt likely will).

**Logged:** 2026-04-22 by Plan 02-02 executor.

**RESOLVED:** 2026-04-24 by Plan 02-03 executor (REGEN-04 capital receipt).
- `scripts/sanity-check-encoding.ts` — 8 literals received `confidence: 1` (sample data = fully-formed operator)
- `src/components/canvas/MapDocument.tsx` — markdown-parsed literal at line ~202 received `confidence: 0` (inferred from markdown, not observed from behavior — renders dashed/hollow via shader)
- Post-fix `tsc --noEmit` on those files: 0 CapitalScore-related errors remain.
- Committed in Plan 02-03's literal-sweep commit.
