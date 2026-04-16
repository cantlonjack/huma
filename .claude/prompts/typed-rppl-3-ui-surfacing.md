# Typed RPPL Graph — Continuation Prompt 3: UI Surfacing

## Background

A previous session built the typed RPPL graph infrastructure — `verifyLifeGraph` (graph verification), `getRpplHealth/Outputs/Action` (RPPL standard interface), and typed `inputs`/`outputs` on all 96 seed RPPLs.

The build plan (`docs/build-plan-typed-rppl-graph.md`) specifies where this should surface in the UI. None of the UI surfacing has been done yet. Your job is to make the infrastructure visible to users.

## Read these first

1. `docs/build-plan-typed-rppl-graph.md` — sections "Where verification surfaces" (Phase 3) and "Where this surfaces" (Phase 4)
2. `app/src/lib/graph-verification.ts` — `verifyLifeGraph`, `GraphVerification` type
3. `app/src/lib/rppl-interface.ts` — `getRpplHealth`, `getRpplOutputs`, `getRpplAction`
4. `app/src/app/whole/page.tsx` and `app/src/hooks/useWhole.ts` — the holonic life map
5. `app/src/app/grow/page.tsx` and `app/src/hooks/useGrow.ts` — the patterns view
6. `app/src/lib/db/store.ts` — how to load aspirations + patterns
7. `app/src/data/rppl-seeds/index.ts` — `allSeeds` export for verification input

## Concrete deliverables

### 1. `/whole` — connected vs. unconnected edges

**Goal**: The force-directed life map shows edges as **solid** (connected — aspiration has behavioral pathway) or **dashed** (unconnected — aspiration has no behaviors or is orphaned).

Steps:
- Find the graph edge rendering in the /whole page (likely a React component or canvas/SVG code — trace from `page.tsx`)
- Call `verifyLifeGraph(aspirations, patterns, allSeeds, context, behaviorCounts)` in the hook or page component
- For each edge connecting an aspiration node to its domain/dimension nodes:
  - If the aspiration is in `verification.unconnectedAspirations`, render dashed
  - Otherwise render solid
- Add a legend somewhere subtle explaining the visual distinction

### 2. `/grow` — gap cards for unconnected aspirations

**Goal**: On the /grow page, show a card for each aspiration in `verification.unconnectedAspirations` with text like "This aspiration has no daily practice yet" and a CTA to start a chat to decompose it.

Steps:
- Update `useGrow.ts` to compute `verifyLifeGraph` and expose `unconnectedAspirations` + `dormantCapitals`
- Add a new component `<GapCard aspiration={...} />` that renders above the existing pattern list when unconnected aspirations exist
- Include a button: "Plan this" → routes to `/chat?mode=new-aspiration&aspirationId=...` or similar existing flow

### 3. `/grow` — pattern cards show health + outputs

**Goal**: Each pattern card surfaces:
- **Health**: a status badge (working / finding / struggling / validated / dormant) with completion rate
- **Outputs**: which capitals this pattern feeds, with strength indicators (weak / moderate / strong)

Steps:
- For each pattern on /grow, call `getRpplHealth(aspirationId, behaviorKey, patterns, behaviorCounts)` and `getRpplOutputs(aspirationId, behaviorKey, aspirations, behaviorCounts)`
- Add a small health badge to the pattern card (reuse existing status styles if available)
- Add an outputs row: small capital chips colored by `strength` — weak/moderate/strong

### 4. Sheet entries link to their RPPL

**Goal**: On `/today`, each sheet entry can be tapped to show its RPPL provenance (the axiom, principle, capacity, or framework it comes from).

Steps:
- Current sheet entries have an `aspirationId` and `behaviorKey`. Look up the `Pattern` and its `provenance.rpplId`.
- Add a small "?" or info affordance on the sheet entry
- On tap, show a sheet or tooltip with:
  - The RPPL name and type (axiom / principle / framework / etc.)
  - A 1-sentence description
  - The tradition / key reference if available

Existing helper: see `allSeeds` from `@/data/rppl-seeds` — find the seed by `rpplId`.

### 5. Capacity state indicator

**Goal**: Somewhere — likely `/whole` or a new settings area — show the user their current `capacityState` (awareness, honesty, care, agency, humility) with level labels (undeveloped / emerging / developing / strong).

Steps:
- Load `humaContext.capacityState` from the store
- Render as a small component with 5 rows, one per capacity, each with a label and the level as a small pill or progress indicator
- Placement suggestion: small card at the top of `/whole` labeled "Your capacity" or embedded in the archetypes/WHY area
- Consider whether to show this at all — some users may not want to see their capacities labeled

## Design principles

- The graph verification output is Claude's tool, not the user's direct interface. Translate it into plain-language UI — not "dormant capitals: [cultural, spiritual]" but "Two areas of your life aren't showing up in your daily practices yet."
- Don't dump every gap at once. Surface the highest-impact suggestion first.
- Keep the existing visual language — solid/dashed edges, pill chips for status, no new visual vocabulary unless necessary.

## Verification checklist

- [ ] Run dev server, visit `/whole` — edges render with visual distinction
- [ ] Visit `/grow` — gap cards appear when there are unconnected aspirations
- [ ] Pattern cards show health and outputs
- [ ] Tap a sheet entry on `/today` — see RPPL info
- [ ] No console errors, no broken layouts on mobile
- [ ] TypeScript clean, existing tests still pass

## What "done" looks like

A user with one unconnected aspiration and one dormant capital opens the app and, without reading any release notes, immediately sees:
- On `/grow`: a card saying "You've said you want to [aspiration] but there's no daily practice tied to it yet."
- On `/whole`: a dashed edge making that visually obvious
- On `/today`: tapping any action reveals what RPPL principle it traces back to

The graph infrastructure stops being invisible.
