# Typed RPPL Graph — Continuation Prompt 2: Wire Compressed Encoding Through v2-chat

## Background

A previous session built compressed life-graph encoding (`app/src/lib/context-encoding.ts`) and graph verification (`app/src/lib/graph-verification.ts`), and wired them into `buildDynamicPrompt` in `app/src/lib/services/prompt-builder.ts`.

**The chat route doesn't pass the data that would activate it.** `app/src/app/api/v2-chat/route.ts` calls `buildDynamicPrompt(...)` without `fullAspirations`, `patterns`, `capitalScores`, `behaviorCounts`, or `rpplSeeds` — so `useCompressedEncoding` is always false and the legacy prose path runs.

This means Phase 2 + Phase 3 are dormant in the main conversation experience. Your job is to light them up.

## Your job

Wire the full aspiration + pattern + capital + behavior data from the client through the chat API and into the prompt, triggering compressed encoding and graph verification for chat conversations.

## Read these first

1. `docs/build-plan-typed-rppl-graph.md` — the plan (especially Phase 2 on chat mode)
2. `app/src/app/api/v2-chat/route.ts` — current route that needs updating (lines 25–53 are the key area)
3. `app/src/lib/services/prompt-builder.ts` — `BuildPromptOptions` and `buildDynamicPrompt` (the extra fields are already declared; they're just not being passed)
4. `app/src/lib/schemas/index.ts` — find `v2ChatSchema` or similar (look for the schema used by `/api/v2-chat`), this is what the chat request accepts
5. `app/src/hooks/useMessageStream.ts` and `app/src/hooks/useChat.ts` — the client side that constructs the chat request
6. `app/src/lib/db/index.ts` — how aspirations, patterns, behaviors are loaded from the local store

## Concrete deliverables

### 1. Extend the chat request schema

In `app/src/lib/schemas/index.ts`, find the schema for `/api/v2-chat` and add optional fields:

```typescript
fullAspirations: z.array(z.record(z.string(), z.unknown())).optional(),
patterns: z.array(z.record(z.string(), z.unknown())).optional(),
capitalScores: z.array(z.record(z.string(), z.unknown())).optional(),
behaviorCounts: z.record(z.string(), z.object({
  completed: z.number(),
  total: z.number(),
})).optional(),
```

Keep them optional so existing clients still work.

### 2. Update `/api/v2-chat/route.ts`

Destructure the new fields from the request. Import `allSeeds` from `@/data/rppl-seeds`. Pass them to `buildDynamicPrompt`:

```typescript
import { allSeeds } from "@/data/rppl-seeds";
// ...
const dynamicPrompt = buildDynamicPrompt({
  // ...existing fields...
  fullAspirations: parsedFullAspirations,
  patterns: parsedPatterns,
  capitalScores: parsedCapitalScores,
  behaviorCounts: parsedBehaviorCounts,
  rpplSeeds: allSeeds,
});
```

Cast the zod-parsed records to the right types (see how `humaContext` is parsed at line 31–34).

### 3. Update the client to send this data

Find where the chat request body is constructed (likely `useMessageStream.ts` or `useChat.ts`). Add the new fields from what the client already has loaded in `db/store`:

```typescript
// Pseudocode
const body = {
  // ...existing fields...
  fullAspirations: store.aspirations,
  patterns: store.patterns,
  capitalScores: store.capitalScores, // if available — compute via computeCapitalScores if needed
  behaviorCounts: computeBehaviorCounts(store.behaviorLogs, 7),
};
```

`computeBehaviorCounts` may already exist — check `app/src/lib/queries.ts` or `app/src/lib/capital-computation.ts` for similar helpers. If not, write a simple one that counts completed/total per `aspirationId:behaviorKey` over the last N days.

### 4. Decide on tab-context aspiration focus

Per the plan: "Chat mode: Level 0 (folded) + Level 1 for relevant aspiration (based on tab context)". Currently `buildDynamicPrompt` only triggers Level 0 (folded) via `encodeLifeGraph(input, "folded")`.

Enhancement: if `tabContext` indicates a specific aspiration (e.g., user tapped a pattern card on /grow, or is on /today looking at a specific aspiration), expand that aspiration to Level 1. Update the encoding call to use `encodeLifeGraph(encodingInput, "aspiration", focusedAspirationId)`.

Check `tabContext.selectedPattern` or similar fields to identify the focused aspiration.

### 5. Conversation history compression for chat

The plan says "summarize older messages, keep recent 5 in full" — currently `compressConversationHistory` exists in `context-encoding.ts` but is only called from the sheet route. Consider whether the chat API's message history should also be compressed. Currently it ships full messages via the Anthropic SDK `messages` array. If the caching strategy is important (Anthropic prompt caching on the static prompt), compression here may hurt or help — evaluate.

If you decide to compress chat history: this likely belongs in the client before sending, not the route, since the client controls what's in the `messages` array.

### 6. Verification

- `cd app && npx tsc --noEmit` clean
- Make a real chat request through the UI with the dev server running, inspect the outgoing request body — confirms the new fields ship
- Add a server-side log in `v2-chat/route.ts` temporarily that prints the first 500 chars of `dynamicPrompt` — confirm it contains `LIFE[d`, `CAP[`, `ASP:` markers when fullAspirations is provided
- Remove the log before committing

## Risks to watch

- **Token cost**: The compressed encoding is meant to REDUCE tokens, but if you accidentally ship both the compressed encoding AND the full context prose, you'll double-spend. `contextProse` should be one or the other — check `prompt-builder.ts:buildDynamicPrompt` to confirm only one path runs.
- **Cache hits**: The chat route uses Anthropic's ephemeral cache on the static prompt. The dynamic prompt (which now includes compressed encoding) should NOT be cached since it changes per user. Confirm the `cache_control` is only on `staticPrompt`.
- **Request size**: If `fullAspirations` includes long `detail` fields across many aspirations, request payloads could balloon. Consider client-side trimming.

## What "done" looks like

- A real chat request produces a system prompt that contains `LIFE[d... a... p...]` header and per-aspiration lines
- Graph verification warnings appear in the prompt when the user has unconnected aspirations
- The `/today` and `/grow` tab contexts pick up the relevant aspiration for Level 1 expansion
- TypeScript + tests remain clean
- Manual test: create a user with an unconnected aspiration, start a chat, observe Claude surfacing the gap naturally in conversation
