# Prompt 05: AI Cost Sustainability — Cache, Batch, Downshift

## Objective
Reduce Claude API costs by 50-70% through three strategies: prompt caching, sheet result caching, and model downshifting where Haiku can handle the job. No quality degradation for the operator — just smarter use of the API.

## Why This Matters
Every sheet compilation calls Sonnet with full context (~3K-5K input tokens). Every conversation turn is a streaming Sonnet call. Every insight, every reflection — all live Sonnet calls. At 100 DAU with typical usage (1 sheet + 3 chat turns + 1 nudge), that's ~500 Sonnet calls/day. At $3/M input + $15/M output, that's $30-80/day depending on context length. At 1,000 DAU it's untenable.

Current state: 8 API routes call Anthropic. 6 use Sonnet, 2 use Haiku. Zero prompt caching. Zero response caching (except maps in Redis). Prompts rebuilt from scratch on every request.

## Strategy 1: Anthropic Prompt Caching

### What It Is
Anthropic's prompt caching lets you mark parts of the system prompt as cacheable. Cached tokens cost 90% less on subsequent requests. The cache has a 5-minute TTL and is scoped per model.

### Where to Apply

**`/api/v2-chat` (highest volume)**

The system prompt in `prompt-builder.ts` has two parts:
1. **Static base** (~1K-2K tokens): `BASE_IDENTITY`, mode-specific instructions, voice rules, marker protocol. This is identical across ALL users and ALL requests.
2. **Dynamic context** (~1K-5K tokens): operator context, aspirations, behavioral history. This varies per user but is stable within a session.

Implementation in `app/src/app/api/v2-chat/route.ts`:

```typescript
// Instead of a single system string, use the multi-block system format
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 2048,
  system: [
    {
      type: "text",
      text: staticBasePrompt,       // BASE_IDENTITY + mode rules + voice + markers
      cache_control: { type: "ephemeral" }  // Cache this block
    },
    {
      type: "text",
      text: dynamicContextPrompt,   // Operator context, aspirations, history
      // No cache_control — changes per request
    }
  ],
  messages: messages,
  stream: true,
});
```

Refactor `prompt-builder.ts` to export two separate strings:
- `buildStaticPrompt(mode: ChatMode): string` — everything that doesn't depend on the operator
- `buildDynamicPrompt(context, aspirations, dayCount, ...): string` — operator-specific content

**Estimated savings on v2-chat**: 40-60% of input token costs (the static portion is 30-50% of the total prompt, and it caches after the first call per 5-min window).

**`/api/sheet` (second highest volume)**

Same pattern. The `SHEET_PROMPT` base is static (~800 tokens). The operator context, aspirations, and history are dynamic.

```typescript
system: [
  {
    type: "text",
    text: SHEET_PROMPT_BASE,      // Template, voice rules, format spec
    cache_control: { type: "ephemeral" }
  },
  {
    type: "text",
    text: operatorContext,         // Formatted context + history
  }
],
```

**`/api/reflection`** — Same split. Reflection prompt base is static.

**Do NOT cache** for `/api/nudge` and `/api/palette` — they already use Haiku and the prompts are small (~300 tokens). Caching overhead isn't worth it.

### Changes to `prompt-builder.ts`

Current function: `buildSystemPrompt(options): string` returns a single concatenated string.

Refactor to:
```typescript
export function buildStaticPrompt(mode: ChatMode): string {
  // BASE_IDENTITY + mode-specific instructions + voice rules + marker protocol
  // Everything that is the same regardless of who the operator is
}

export function buildDynamicPrompt(options: Omit<BuildPromptOptions, 'mode'>): string {
  // Context prose, aspirations list, behavioral context, day count rules
  // Everything specific to this operator at this moment
}

// Keep the old function for backward compatibility during migration
export function buildSystemPrompt(options: BuildPromptOptions): string {
  return buildStaticPrompt(options.mode) + "\n\n" + buildDynamicPrompt(options);
}
```

## Strategy 2: Sheet Result Caching

### The Problem
The daily sheet is compiled by calling Sonnet with full context. But if nothing has changed since the last compilation (no new check-offs, no new aspirations, no new context), the result would be identical. Currently, every visit to `/today` triggers a fresh compilation.

### The Fix

**Client-side cache key** in `app/src/lib/sheet-compiler.ts`:

```typescript
function computeSheetCacheKey(options: CompileSheetOptions): string {
  const inputs = {
    date: options.date,
    aspirationIds: options.aspirations.map(a => a.id).sort(),
    behaviorCount: options.aspirations.reduce((n, a) => n + a.behaviors.length, 0),
    recentHistoryHash: simpleHash(JSON.stringify(options.recentHistory)),
    contextHash: simpleHash(JSON.stringify(options.knownContext)),
  };
  return `huma-v2-sheet-${simpleHash(JSON.stringify(inputs))}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}
```

**Cache flow:**
1. Before calling `/api/sheet`, compute the cache key
2. Check localStorage for a cached result with that key
3. If found AND the date matches today: return the cached result immediately (no API call)
4. If not found: call the API, cache the result with the key
5. Invalidate: after any check-off, context update, or aspiration change, delete the cached sheet for today (force recompilation on next visit)

**Where to implement**: In `compileSheet()` in `app/src/lib/sheet-compiler.ts`, wrap the fetch call:

```typescript
export async function compileSheet(options: CompileSheetOptions): Promise<CompiledSheet> {
  const cacheKey = computeSheetCacheKey(options);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.date === options.date) return parsed.sheet;
  }

  // Existing fetch to /api/sheet...
  const sheet = await fetchSheet(options);
  
  localStorage.setItem(cacheKey, JSON.stringify({ date: options.date, sheet }));
  return sheet;
}
```

**Cache invalidation triggers** in `useToday.ts`:
- After `handleCheck()` (behavior checked/unchecked): clear today's sheet cache
- After aspiration CRUD: clear today's sheet cache
- After context update: clear today's sheet cache

```typescript
function invalidateSheetCache() {
  const today = new Date().toISOString().slice(0, 10);
  // Remove all sheet cache keys for today
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith("huma-v2-sheet-")) {
      const cached = JSON.parse(localStorage.getItem(key) || "{}");
      if (cached.date === today) localStorage.removeItem(key);
    }
  }
}
```

**Estimated savings**: Eliminates 60-80% of sheet compilation calls (most visits to `/today` after the first are repeated views with no state change).

## Strategy 3: Model Downshifting

### Opportunities to Use Haiku Instead of Sonnet

| Route | Current | Proposed | Rationale |
|-------|---------|----------|-----------|
| `/api/nudge` | Haiku | Haiku | Already optimal |
| `/api/palette` | Haiku | Haiku | Already optimal |
| `/api/v2-chat` (first 2 messages) | Sonnet | **Haiku** | Initial context gathering is simple Q&A — Haiku handles it fine |
| `/api/reflection` | Sonnet | **Haiku** | Evening reflection is structured extraction, not creative reasoning |
| `/api/whole-compute` (archetypes) | Sonnet | **Haiku** | Archetype matching is pattern recognition from a fixed set |
| `/api/insight` | Sonnet | Sonnet | Keep — requires cross-domain reasoning |
| `/api/sheet` | Sonnet | Sonnet | Keep — requires creative, context-specific synthesis |
| `/api/v2-chat` (decomposition) | Sonnet | Sonnet | Keep — requires deep reasoning |

### Implementation for v2-chat Progressive Model Selection

In `app/src/app/api/v2-chat/route.ts`:

```typescript
// Count user messages (not system/assistant)
const userMessageCount = messages.filter(m => m.role === "user").length;

// Use Haiku for the first 2 exchanges (context gathering)
// Switch to Sonnet for decomposition and complex reasoning
const model = userMessageCount <= 2
  ? "claude-haiku-4-5-20251001"
  : (process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514");
```

This works because the first 2 exchanges are almost always simple: "What's going on?" → answer → clarifying question → answer. Haiku handles this perfectly. The complex work (decomposition, insight synthesis, creative sheet entries) comes later.

**Estimated savings on v2-chat**: 30-40% cost reduction (Haiku is ~10x cheaper than Sonnet, and first 2 messages account for ~30% of all conversation calls).

### Implementation for reflection

In `app/src/app/api/reflection/route.ts`:
- Change model from `claude-sonnet-4-20250514` to `claude-haiku-4-5-20251001`
- The reflection prompt is structured extraction (mood, context updates, gratitude) — Haiku handles this well
- Reduce max_tokens from 400 to 250 (reflection responses should be brief)

### Implementation for whole-compute archetypes

In `app/src/app/api/whole-compute/route.ts`:
- The archetype-matching call (selecting from a fixed set of archetypes) can use Haiku
- The WHY statement call should stay Sonnet (creative synthesis)
- The WHY evolution call can use Haiku (comparison/editing task)

## Strategy 4: Batch Nudge Generation (Bonus)

### The Problem
Nudges are generated per-request when a user visits `/today`. Each call uses Haiku (cheap) but adds latency.

### The Fix
Move nudge generation into the morning-sheet cron job. Generate all nudges for the day in a single Haiku call per user, alongside the sheet compilation.

In `app/src/app/api/cron/morning-sheet/route.ts`:
1. After compiling the sheet, generate 2 nudges in the same cron run
2. Store nudges in Supabase alongside the sheet (or in localStorage via the sheet response)
3. The `/api/nudge` endpoint becomes a simple lookup, not a generation call

This eliminates the real-time nudge generation latency AND reduces total API calls.

## Files to Modify

| File | Change |
|------|--------|
| `app/src/lib/services/prompt-builder.ts` | Split `buildSystemPrompt` into `buildStaticPrompt` + `buildDynamicPrompt` |
| `app/src/app/api/v2-chat/route.ts` | Use multi-block system prompt with `cache_control`; progressive model selection |
| `app/src/app/api/sheet/route.ts` | Use multi-block system prompt with `cache_control` |
| `app/src/app/api/reflection/route.ts` | Switch to Haiku model, reduce max_tokens |
| `app/src/app/api/whole-compute/route.ts` | Use Haiku for archetype matching (keep Sonnet for WHY) |
| `app/src/lib/sheet-compiler.ts` | Add cache key computation and localStorage caching |
| `app/src/hooks/useToday.ts` | Add `invalidateSheetCache()` calls on state changes |
| `app/src/app/api/cron/morning-sheet/route.ts` | Add nudge generation to cron batch |

## Estimated Total Savings

| Strategy | Savings |
|----------|---------|
| Prompt caching (v2-chat + sheet) | 40-50% of input token costs |
| Sheet result caching | 60-80% fewer sheet API calls |
| Model downshifting | 30-40% on v2-chat, 100% on reflection/archetypes |
| Batch nudges | Eliminates real-time nudge generation |
| **Combined** | **50-70% total API cost reduction** |

At 100 DAU, this brings daily cost from $30-80 down to $10-25. At 1,000 DAU, it makes the difference between viable and bankrupt.

## Verification
- **Prompt caching**: Check Anthropic dashboard for cache hit rates after deployment
- **Sheet caching**: Visit `/today` twice without changing anything — second visit should not trigger a network request to `/api/sheet` (check Network tab)
- **Model downshifting**: Send first 2 messages in `/start` — check API logs to confirm Haiku was used. Send message 3+ — confirm Sonnet is used.
- **Quality check**: Compare sheet output quality before/after. The sheet (Sonnet) and conversation (Sonnet after msg 2) should be indistinguishable from before.
