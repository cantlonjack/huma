# Typed RPPL Graph — Continuation Index

## Context

The previous session implemented all 5 phases of `docs/build-plan-typed-rppl-graph.md`:

- **Phase 1** — Typed RPPL ports on all 96 seeds (2 axioms, 5 capacities, 39 frameworks, 50 principles)
- **Phase 5** — CapacityState in `HumaContext` with 5 capacities (awareness/honesty/care/agency/humility) × 4 levels (undeveloped/emerging/developing/strong)
- **Phase 2** — Compressed life-graph encoding (`encodeLifeGraph`: folded / aspiration / practice levels, plus `compressConversationHistory`)
- **Phase 4** — RPPL standard interface (`getRpplAction` / `getRpplHealth` / `getRpplOutputs`)
- **Phase 3** — Graph verification (`verifyLifeGraph`: port satisfaction, gaps, conflicts, orphans, dormant capitals)

**Status**: TypeScript compiles clean. The sheet API is wired end-to-end (compressed encoding + verification activate when `humaContext` is in the request). The v2-chat API is NOT fully wired — compressed encoding machinery exists in `buildDynamicPrompt` but the route doesn't pass the data to activate it. No unit tests exist for the new code. UI surfacing on `/whole`, `/grow`, `/today` is untouched.

## Files created

- `app/src/lib/context-encoding.ts`
- `app/src/lib/rppl-interface.ts`
- `app/src/lib/graph-verification.ts`

## Files modified

- `app/src/types/context.ts` — CapacityState added
- `app/src/lib/context-model.ts` — capacity serialization
- `app/src/lib/services/prompt-builder.ts` — compressed encoding + verification + capacity instructions in OPEN/QUICK_START prompts
- `app/src/lib/services/sheet-service.ts` — compressed encoding + verification helpers + normalizer
- `app/src/app/api/sheet/route.ts` — uses compressed encoding + verification when `humaContext` is present
- `app/src/lib/schemas/index.ts` — `humaContext` added to sheet schema
- `app/src/data/rppl-seeds/*` — ports added to all seeds + exports

## Four continuation tracks

Pick whichever matches your priority. They're independent; any can run in parallel with any other.

1. **[typed-rppl-1-runtime-verification.md](./typed-rppl-1-runtime-verification.md)** — Write tests for the new engines, verify runtime correctness. Highest priority if you're nervous about shipping untested code. Blocks nothing, unblocks confidence.

2. **[typed-rppl-2-chat-integration.md](./typed-rppl-2-chat-integration.md)** — Wire compressed encoding + verification through v2-chat. Currently dormant in chat — users get no benefit from Phase 2/3 during conversations until this is done.

3. **[typed-rppl-3-ui-surfacing.md](./typed-rppl-3-ui-surfacing.md)** — Make the graph infrastructure visible. Solid/dashed edges on /whole, gap cards on /grow, RPPL health/outputs on pattern cards, RPPL provenance on sheet entries.

4. **[typed-rppl-4-port-audit.md](./typed-rppl-4-port-audit.md)** — Audit the agent-generated port assignments on 89 seeds (39 frameworks + 50 principles). Currently accurate in shape but unaudited for semantic correctness. Quality gate for everything that depends on these ports.

## Suggested order

If you can only do one: **#1 (verification)** — proves nothing is silently broken before you build more on top.

If you can do two: **#1 then #4** — verify the code runs, then verify the data is accurate. That gives you a trustworthy foundation.

If you can do all: **#1 → #4 → #2 → #3**. Test the engine, fix the data, light up chat, then surface everything in the UI.
