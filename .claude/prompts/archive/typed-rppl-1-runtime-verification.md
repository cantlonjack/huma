# Typed RPPL Graph — Continuation Prompt 1: Runtime Verification

## Background

A previous session implemented all 5 phases of `docs/build-plan-typed-rppl-graph.md` — typed RPPL ports, CapacityState, compressed life-graph encoding, RPPL standard interface, and graph verification. The TypeScript build is clean, but **no code path has been executed**. Compile-time correctness ≠ runtime correctness.

## Your job

Write tests that prove the new infrastructure actually works on realistic data, then fix anything that breaks.

## What was built (read these first)

- `app/src/data/rppl-seeds/types.ts` — `PortType`, `RpplPort`, ports on `RpplSeed`
- `app/src/data/rppl-seeds/{axioms,capacities,frameworks,principles}.ts` — 96 seeds with ports
- `app/src/types/context.ts` — `CapacityLevel`, `CapacityState`, `HumaContext.capacityState`
- `app/src/lib/context-model.ts` — `contextForPrompt()` now serializes `capacityState` (line ~251)
- `app/src/lib/context-encoding.ts` — NEW: `encodeLifeGraph`, `encodeFolded`, `encodeAspiration`, `encodePractice`, `compressConversationHistory`
- `app/src/lib/rppl-interface.ts` — NEW: `getRpplAction`, `getRpplHealth`, `getRpplOutputs`, `getRpplStatus`
- `app/src/lib/graph-verification.ts` — NEW: `verifyLifeGraph`, `verificationSummary`
- `app/src/lib/services/sheet-service.ts` — NEW exports: `formatCompressedContextForSheet`, `sheetVerificationSummary`, `normalizeSheetAspirations`
- `app/src/app/api/sheet/route.ts` — uses compressed encoding + verification when `humaContext` is present in the request
- `app/src/lib/services/prompt-builder.ts` — `buildDynamicPrompt` accepts `fullAspirations`, `patterns`, `capitalScores`, `behaviorCounts`, `rpplSeeds`

## Existing test patterns to follow

- `app/src/lib/context-model.test.ts` — uses Vitest, fixtures defined inline
- `app/src/lib/capital-pulse.test.ts` — same pattern
- `app/src/lib/parse-markers-v2.test.ts` — same pattern

Run tests with `cd app && npm test`.

## Concrete deliverables

### 1. Unit tests for `context-encoding.ts`

Cover:
- `encodeFolded` with empty context → produces minimal output without throwing
- `encodeFolded` with realistic context (full HumaContext, 3 active aspirations, capital scores, capacity state) → output contains LIFE header, WHY line if present, capacity line, dimension lines, aspiration lines, flag lines
- `encodeAspiration` with valid aspiration ID → produces aspiration block with behaviors, gap detection
- `encodeAspiration` with invalid aspiration ID → returns `ASP:not-found[...]` not throws
- `encodePractice` with no pattern matching the behavior → still produces output (no crash)
- `compressConversationHistory` with 12 messages, keepRecent=5 → produces "[Earlier 7 exchanges condensed]" + condensed lines + "[Recent exchanges]" + 5 full
- `compressConversationHistory` with 0 messages → returns "No conversation yet."

### 2. Unit tests for `graph-verification.ts`

Cover:
- `verifyLifeGraph` with no aspirations → integrity "valid" or "gaps" depending on dormant capitals
- `verifyLifeGraph` with active aspiration that has zero behaviors → adds aspiration to `unconnectedAspirations` with high-impact suggestion
- `verifyLifeGraph` with `capacityState.awareness = "undeveloped"` and a pattern provenance pointing to a framework that requires awareness → produces `PortViolation` with severity "blocking"
- `verifyLifeGraph` with two patterns sharing the same `timeWindow` → produces a `PortConflict`
- `verifyLifeGraph` with a pattern whose aspirationId references a "dropped" aspiration → adds to `orphanPractices`
- `verificationSummary` with `integrity: "valid"` and no suggestions → returns "GRAPH: valid, no gaps or conflicts"
- `verificationSummary` truncates to top 3 suggestions

### 3. Unit tests for `rppl-interface.ts`

Cover:
- `getRpplAction` returns null for inactive aspirations
- `getRpplAction` returns null for behavior with `frequency: "specific-days"` when today isn't in `days`
- `getRpplHealth` returns status "validated" when pattern.status is "validated"
- `getRpplHealth` returns "dormant" when no completions and no pattern
- `getRpplHealth` trend: "rising" with rate≥70 and pattern.status="working"; "dropping" with rate≤30 and prior completions
- `getTodayActions` returns one action per active behavior across all active aspirations

### 4. Unit tests for sheet-service additions

Cover:
- `normalizeSheetAspirations` produces valid `Aspiration[]` with `status: "active"`, `dimensionsTouched: []`, behaviors with `DimensionEffect[]` shape
- `normalizeSheetAspirations` handles missing `dimensions` field on behaviors (defaults to empty array)
- `formatCompressedContextForSheet` with empty aspirations → returns folded output only
- `sheetVerificationSummary` returns `{ verification, summary }` shape

### 5. Integration test for `/api/sheet` route

Construct a realistic `SheetCompileRequest` with `humaContext` populated, post to the route handler, capture the system prompt that gets sent to Anthropic (mock the SDK), assert:
- The prompt contains the compressed encoding markers (`LIFE[d`, `CAP[`, `ASP:`)
- The prompt contains a `GRAPH:` line if there are gaps
- The prompt does NOT contain raw JSON dumps of the context

To mock Anthropic, wrap the `new Anthropic()` call or use dependency injection. Look at how other tests handle Anthropic.

### 6. Sanity check the encoding output by eye

Run a script that constructs a realistic `HumaContext` + 3 aspirations + 5 patterns + capacity state and prints `encodeFolded` and `encodeLifeGraph(input, "aspiration", aspId)`. Read the output. Does it actually convey the user's life clearly in <500 tokens? Or is it gibberish?

If gibberish: simplify the encoding format. The goal is Claude readability, not maximum compression.

## Verification checklist

- [ ] `cd app && npx tsc --noEmit` — clean
- [ ] `cd app && npm test` — all tests pass
- [ ] Sample encoding output reads coherently
- [ ] Sheet route integration test asserts compressed format reaches the prompt
- [ ] No new lint errors

## What "done" looks like

Each new function has at least one happy path test and at least one edge case test. The sheet route integration test proves end-to-end wiring works. You can produce a sample compressed encoding and screenshot it for review.
