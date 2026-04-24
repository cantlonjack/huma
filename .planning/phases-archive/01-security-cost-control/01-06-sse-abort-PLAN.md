---
phase: 01-security-cost-control
plan: 06
type: execute
wave: 1
depends_on:
  - "01-00"
files_modified:
  - app/src/app/api/v2-chat/route.ts
  - app/src/app/api/v2-chat/route.abort.test.ts
  - app/scripts/smoke/sec-06-disconnect.sh
autonomous: true
requirements:
  - SEC-06
must_haves:
  truths:
    - "anthropic.messages.stream(...) is called with { signal: request.signal } as second arg"
    - "When request.signal fires abort, stream.abort() is invoked on the MessageStream"
    - "ReadableStream.cancel() handler calls stream.abort() (belt-and-suspenders for browser nav abort)"
    - "APIUserAbortError is caught (not logged as error) and the route exits cleanly without crashing"
    - "No Anthropic tokens continue to be billed after client disconnect"
    - "Manual smoke: curl -N + kill after 100ms produces 'APIUserAbortError' or 'stream aborted' in Vercel logs for that req_id"
  artifacts:
    - path: "app/src/app/api/v2-chat/route.ts"
      provides: "anthropic.messages.stream called with {signal: request.signal}; abort wired in ReadableStream.start and .cancel"
      contains: "signal: request.signal"
    - path: "app/src/app/api/v2-chat/route.abort.test.ts"
      provides: "Unit: signal.abort triggers stream.abort; cancel triggers stream.abort; APIUserAbortError swallowed"
      contains: "APIUserAbortError"
      min_lines: 60
    - path: "app/scripts/smoke/sec-06-disconnect.sh"
      provides: "Manual-observed smoke: curl -N then kill; instructs operator to inspect Vercel logs"
      contains: "curl -N"
  key_links:
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "anthropic.messages.stream"
      via: "stream is created with second-arg RequestOptions { signal: request.signal }"
      pattern: "signal:\\s*request\\.signal"
    - from: "app/src/app/api/v2-chat/route.ts ReadableStream"
      to: "MessageStream.abort()"
      via: "request.signal addEventListener('abort', () => stream.abort()) AND ReadableStream.cancel() { stream.abort() }"
      pattern: "stream\\.abort\\(\\)"
---

<objective>
Deliver SEC-06: when the client disconnects mid-stream on `/api/v2-chat`, the upstream Anthropic stream is aborted so we stop paying for tokens nobody reads. Surgical edit: pass `{ signal: request.signal }` to `anthropic.messages.stream(...)`, AND listen for `request.signal.abort` inside `ReadableStream.start()` to call `stream.abort()`, AND implement `ReadableStream.cancel()` to call `stream.abort()`. Catch `APIUserAbortError` so it doesn't reach the observability wrapper's error path.

Purpose: Prevents runaway cost from clients that start a conversation, read a few words, then navigate away.

Output: Surgical edits to `v2-chat/route.ts`, 1 unit test file, 1 manual-observation smoke script.

**Scope:** Only `v2-chat` is streaming. Other routes use non-streaming `anthropic.messages.create` — bounded by `max_tokens`.

**Interaction with Plan 05c:** Plan 05c wraps v2-chat in `withObservability` and registers `stream.on("finalMessage", ...)`. The abort path returns a Response normally; the wrapper's finally fires when the handler returns; Plan 05c's reconciliation listener captures partial output_tokens if the stream was aborted before `finalMessage` resolved (in which case `finalMessage` throws APIUserAbortError, suppressed silently).

**Fixture extension note:** Plan 00 (Wave 0) shipped `makeMockStream` with `throwOnAbort: true` already. This plan does NOT extend the fixture — it consumes Plan 00's fixture as-is.
</objective>

<execution_context>
@C:/Users/djcan/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/djcan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-security-cost-control/01-CONTEXT.md
@.planning/phases/01-security-cost-control/01-RESEARCH.md
@.planning/phases/01-security-cost-control/01-VALIDATION.md
@.planning/phases/01-security-cost-control/01-00-fixtures-PLAN.md

<interfaces>
<!-- Anthropic SDK 0.78 (verified). -->

```typescript
class MessageStream {
  controller: AbortController;
  abort(): void;
  [Symbol.asyncIterator](): AsyncIterator<MessageStreamEvent>;
  finalMessage(): Promise<Message>;
}
messages.stream(body: MessageStreamParams, options?: { signal?: AbortSignal }): MessageStream;
class APIUserAbortError extends Error { name: "APIUserAbortError" }
```

From Next.js 16:
- `request.signal: AbortSignal` fires on client disconnect.

From ReadableStream API:
- `new ReadableStream({ start(controller) {}, cancel(reason) {} })`
- `cancel()` fires on consumer cancellation (browser nav, tab close, fetch abort).

Plan 00's mock-anthropic.ts (ALREADY HAS throwOnAbort SUPPORT):
```typescript
import { makeMockStream, APIUserAbortError } from "@/__tests__/fixtures/mock-anthropic";
const { stream, abortFn } = makeMockStream({ text: "hello", throwOnAbort: true, chunkDelayMs: 1 });
// stream.abort() sets aborted; iterator throws APIUserAbortError if throwOnAbort && aborted mid-stream.
// stream.finalMessage() throws APIUserAbortError if aborted && throwOnAbort.
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Wire {signal} option + abort handlers in v2-chat route.ts</name>
  <files>
    app/src/app/api/v2-chat/route.ts
  </files>
  <behavior>
    - `anthropic.messages.stream(body, { signal: request.signal })` — second arg present.
    - `ReadableStream.start(controller)` registers `request.signal.addEventListener("abort", () => { stream.abort(); try { controller.close(); } catch {} })`.
    - Loop checks `if (request.signal.aborted) break;` at top of `for await`.
    - `APIUserAbortError` caught — `controller.close()` (NOT `controller.error(err)`).
    - `ReadableStream.cancel()` calls `stream.abort()`.
    - Preserve all existing structure (Plan 03 X-Huma-Truncated, Plan 05c withObservability wrap + finalMessage listener).
  </behavior>
  <action>
Step 1 — Locate the existing `ReadableStream` block in `app/src/app/api/v2-chat/route.ts` (after Plans 01/02/03/05c land, this lives inside the withObservability handler callback). Apply surgical edits:

  ```typescript
  // Before (Plan 05c):
  //   const stream = anthropic.messages.stream({...});
  //   stream.on("finalMessage", ...);
  //   const readable = new ReadableStream({ async start(controller) { /* iter */ } });
  //
  // After (Plan 06):
  const stream = anthropic.messages.stream(
    { model, system, messages: messagesForDispatch, max_tokens: 2048 },
    { signal: request.signal },
  );

  stream.on("finalMessage", (msg) => {
    obs.setOutputTokens(msg.usage.output_tokens);
    // Plan 05c reconciliation log + user_quota_ledger.update preserved here.
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const onAbort = () => {
        try { stream.abort(); } catch { /* already aborted */ }
        try { controller.close(); } catch { /* already closed */ }
      };
      if (request.signal.aborted) { onAbort(); return; }
      request.signal.addEventListener("abort", onAbort);

      try {
        for await (const event of stream) {
          if (request.signal.aborted) break;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
          // ...preserve existing marker-emission branches...
        }
        controller.close();
      } catch (err) {
        const name = (err as Error)?.name;
        if (name === "APIUserAbortError") {
          try { controller.close(); } catch { /* noop */ }
        } else {
          console.error("[v2-chat] Stream error:", err);
          try { controller.error(err); } catch { /* noop */ }
        }
      } finally {
        request.signal.removeEventListener("abort", onAbort);
      }
    },
    cancel(reason) {
      try { stream.abort(); } catch { /* noop */ }
    },
  });
  ```

Step 2 — Run pre-existing v2-chat tests:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/
  ```
  All pre-existing tests still pass — abort path is additive.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts</automated>
  </verify>
  <done>
    - v2-chat passes `{ signal: request.signal }` as second arg to `anthropic.messages.stream`.
    - ReadableStream.start registers abort listener; APIUserAbortError handled gracefully.
    - ReadableStream.cancel calls `stream.abort()`.
    - Existing v2-chat tests still pass.
    - Surgical additions only.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Unit test for abort wiring (consumes Plan 00's makeMockStream as-is)</name>
  <files>
    app/src/app/api/v2-chat/route.abort.test.ts
  </files>
  <behavior>
    - Assertion 1: `anthropic.messages.stream` is called with a second arg whose `signal` matches `request.signal`.
    - Assertion 2: when request.signal fires abort, the mock stream's `abort()` is called.
    - Assertion 3: when `ReadableStream.cancel()` is invoked, `stream.abort()` is called.
    - Assertion 4: `APIUserAbortError` thrown mid-stream is swallowed; route returns normally.
  </behavior>
  <action>
Step 1 — Create `app/src/app/api/v2-chat/route.abort.test.ts`. Plan 00's `makeMockStream` already supports `throwOnAbort: true` and `chunkDelayMs` — consume directly:

  ```typescript
  import { describe, it, expect, beforeAll, vi } from "vitest";
  import { mockSupabaseAnonSession } from "@/__tests__/fixtures/mock-supabase";
  import { makeMockStream } from "@/__tests__/fixtures/mock-anthropic";

  // Build a mock SDK that exposes the same stream instance so we can spy on .abort().
  const { stream, abortFn } = makeMockStream({ text: "hello world", throwOnAbort: true, chunkDelayMs: 1 });
  const streamFn = vi.fn((_body: unknown, _opts?: { signal?: AbortSignal }) => stream);

  vi.mock("@anthropic-ai/sdk", () => ({
    default: class MockAnthropic {
      messages = {
        stream: streamFn,
        countTokens: vi.fn(async () => ({ input_tokens: 10 })),
        create: vi.fn(async () => ({ usage: { input_tokens: 10, output_tokens: 1 } })),
      };
    },
  }));

  vi.mock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("u")) }));
  vi.mock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      from: () => ({
        insert: vi.fn(async () => ({ error: null })),
        update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
      }),
      rpc: vi.fn(async () => ({ data: [{ allowed: true, tier: "anonymous", reset_at: new Date().toISOString() }], error: null })),
      auth: { admin: { getUserById: vi.fn(async () => ({ data: { user: { id: "u", is_anonymous: true } } })) } },
    }),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.PHASE_1_GATE_ENABLED = "true";
  });

  describe("v2-chat SSE abort (SEC-06)", () => {
    it("passes { signal: request.signal } to anthropic.messages.stream", async () => {
      streamFn.mockClear();
      const { POST } = await import("./route");
      const ctrl = new AbortController();
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
        signal: ctrl.signal,
      });
      await POST(req);
      expect(streamFn).toHaveBeenCalled();
      const [, opts] = streamFn.mock.calls[0];
      expect(opts?.signal).toBe(ctrl.signal);
    });

    it("calls stream.abort() when request.signal fires", async () => {
      abortFn.mockClear();
      const { POST } = await import("./route");
      const ctrl = new AbortController();
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
        signal: ctrl.signal,
      });
      const res = await POST(req);
      const reader = (res.body as ReadableStream).getReader();
      reader.read();
      ctrl.abort();
      await new Promise((r) => setTimeout(r, 10));
      expect(abortFn).toHaveBeenCalled();
    });

    it("calls stream.abort() when ReadableStream.cancel() is invoked", async () => {
      abortFn.mockClear();
      const { POST } = await import("./route");
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
      });
      const res = await POST(req);
      const reader = (res.body as ReadableStream).getReader();
      await reader.cancel("client went away");
      await new Promise((r) => setTimeout(r, 10));
      expect(abortFn).toHaveBeenCalled();
    });

    it("swallows APIUserAbortError cleanly — route does NOT throw", async () => {
      abortFn.mockClear();
      const { POST } = await import("./route");
      const ctrl = new AbortController();
      const req = new Request("http://localhost/api/v2-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
        signal: ctrl.signal,
      });
      const res = await POST(req);
      const reader = (res.body as ReadableStream).getReader();
      const p = (async () => {
        try { while (true) { const { done } = await reader.read(); if (done) break; } }
        catch (e) { return e; }
        return null;
      })();
      ctrl.abort();
      const result = await p;
      expect(result === null || (result as Error)?.name !== "APIUserAbortError").toBe(true);
    });
  });
  ```

Step 2 — Run:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts
  ```
  All 4 cases green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts</automated>
  </verify>
  <done>
    - `route.abort.test.ts` exists with 4 assertions.
    - Test consumes Plan 00's `makeMockStream` as-is — no fixture modification.
    - Test file green; existing v2-chat tests still pass.
  </done>
</task>

<task type="auto">
  <name>Task 3: Manual-observation smoke script for SEC-06</name>
  <files>
    app/scripts/smoke/sec-06-disconnect.sh
  </files>
  <action>
Step 1 — Create `app/scripts/smoke/sec-06-disconnect.sh`:
  ```bash
  #!/usr/bin/env bash
  # SEC-06 manual-observed smoke: SSE disconnect → Anthropic abort.
  # Usage: BASE_URL=https://huma-two.vercel.app ANON_JWT=<jwt> bash scripts/smoke/sec-06-disconnect.sh
  set -euo pipefail
  BASE_URL="${BASE_URL:-http://localhost:3000}"
  ANON_JWT="${ANON_JWT:-}"
  COOKIE_HDR=""
  if [ -n "$ANON_JWT" ]; then
    COOKIE_HDR="-H \"Cookie: sb-access-token=$ANON_JWT\""
  elif [ -n "${COOKIE:-}" ]; then
    COOKIE_HDR="-H \"Cookie: $COOKIE\""
  else
    echo "SKIP: ANON_JWT/COOKIE not set."
    exit 0
  fi

  echo "SEC-06 disconnect smoke — starting streaming request; will kill after ~100ms."
  eval curl -N -sS -X POST "$BASE_URL/api/v2-chat" \
    -H "'Content-Type: application/json'" $COOKIE_HDR \
    -d '"'"'{"messages":[{"role":"user","content":"give me a long response about trees"}]}'"'"' \
    > /tmp/sec06_out 2>&1 &
  CURL_PID=$!
  sleep 0.1
  kill "$CURL_PID" 2>/dev/null || true
  wait "$CURL_PID" 2>/dev/null || true

  echo ""
  echo "==> curl output (may be partial):"
  head -c 500 /tmp/sec06_out || true
  echo ""
  echo "==> MANUAL VERIFY STEPS:"
  echo "    1. Open Vercel Dashboard → Project → Logs."
  echo "    2. Filter by route = /api/v2-chat in the last 5 minutes."
  echo "    3. Find the log entry matching this curl's timestamp."
  echo "    4. Confirm either:"
  echo "       (a) A line containing 'APIUserAbortError', OR"
  echo "       (b) Status=200 with latency_ms < 500 and output_tokens=0 or small partial."
  ```

Step 2 — `chmod +x` on Unix; CI will `bash` regardless.

Step 3 — Full suite:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts</automated>
  </verify>
  <done>
    - `scripts/smoke/sec-06-disconnect.sh` exists.
    - Script provides explicit manual-verification steps.
    - Full Vitest suite green.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-06 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts
```

Non-regression:
```bash
cd app && npm test
```

**Manual verification (Plan 07 enablement gate):**
```bash
BASE_URL=https://huma-two.vercel.app ANON_JWT=$ANON_JWT bash app/scripts/smoke/sec-06-disconnect.sh
```
</verification>

<success_criteria>
- SEC-06 fully delivered: abort wired through `{ signal }` option + ReadableStream lifecycle hooks.
- `APIUserAbortError` caught cleanly — route exits normally, observability log still emitted.
- Unit tests cover the four abort paths (signal arg, signal abort, cancel, error swallow).
- Manual smoke script ready for Plan 07's enablement.
- Plan 00 fixture consumed AS-IS — no fixture edits required.
- Surgical additions only.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-06-sse-abort-SUMMARY.md` with:
- What was built (signal threading, abort event listener, cancel handler, error swallow, unit tests, manual smoke)
- Files modified (3 files — smallest plan in Phase 1)
- Plan 00 fixture consumed without modification (Warning 6 satisfied)
- Downstream: Plan 07 manual smoke against staging is the final verification
- Interaction with Plan 05c: aborted streams emit reconciliation log with partial output_tokens (or 0) — gives visibility into abort behavior in production
</output>
