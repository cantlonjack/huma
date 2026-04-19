---
phase: 01-security-cost-control
plan: 06
type: execute
wave: 1
depends_on: []
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
    - "No Anthropic tokens continue to be billed after client disconnect — verified by post-abort token count staying flat"
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
      via: "request.signal addEventListener('abort', () => stream.abort()) OR ReadableStream.cancel() { stream.abort() }"
      pattern: "stream\\.abort\\(\\)"
---

<objective>
Deliver SEC-06: when the client disconnects mid-stream on `/api/v2-chat`, the upstream Anthropic stream is aborted so we stop paying for tokens nobody reads. Surgical edit: pass `{ signal: request.signal }` to `anthropic.messages.stream(...)`, AND listen for `request.signal.abort` inside the `ReadableStream.start()` callback to call `stream.abort()`, AND implement `ReadableStream.cancel()` to call `stream.abort()` (belt-and-suspenders — covers browser-nav-away vs explicit abort). Catch `APIUserAbortError` so it doesn't throw to the observability wrapper's error path (log cleanly).

Purpose: Prevents runaway cost from clients that start a conversation, read a few words, then navigate away / close the tab. Anthropic continues generating tokens for the full response otherwise (and bills for them), even though nothing on our side consumes them.

Output: Surgical edits to `v2-chat/route.ts` only (SEC-06 is the smallest plan), 1 unit test file covering abort wiring, 1 manual-observation smoke script.

**Scope:** Only `v2-chat` is streaming. No other routes need this change. `sheet/route.ts`, `insight/route.ts`, etc., use `anthropic.messages.create` (non-streaming) — their cost is bounded by `max_tokens` per-call, not by wall-clock stream duration.

**Interaction with Plan 05:** Plan 05 wraps v2-chat in `withObservability`. The abort path returns the Response normally (not a throw) because the ReadableStream.cancel callback returns, and the outer handler has already returned the Response. The withObservability log emits a `status=200` entry (since the Response was successfully returned to the client before disconnect). This is correct — the request succeeded from an auth-and-setup perspective; the disconnect is a client-side event. To distinguish aborted streams from complete streams in logs, the stream's finally path writes to `cost_metrics_raw` with actual usage (possibly partial) — Plan 05's secondary async write mentioned there.
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

<interfaces>
<!-- Anthropic SDK 0.78 primitives verified from source. -->

From @anthropic-ai/sdk v0.78.0 (`app/node_modules/@anthropic-ai/sdk/src/lib/MessageStream.ts`):
```typescript
class MessageStream {
  controller: AbortController;           // internal controller
  abort(): void;                         // explicit abort method
  [Symbol.asyncIterator](): AsyncIterator<MessageStreamEvent>;
  finalMessage(): Promise<Message>;      // resolves with full usage after stream completes
  on(event: "finalMessage" | "text" | "error" | ..., listener: Function): this;
}

// stream() signature accepts request options:
messages.stream(
  body: MessageStreamParams,
  options?: { signal?: AbortSignal; /* ...RequestOptions... */ }
): MessageStream;

// Error thrown when abort fires:
class APIUserAbortError extends Error { name: "APIUserAbortError" }
```

Source lines in installed SDK (for executor grep-verify):
- `app/node_modules/@anthropic-ai/sdk/src/lib/MessageStream.ts:57` → `controller: AbortController = new AbortController()`
- `app/node_modules/@anthropic-ai/sdk/src/lib/MessageStream.ts:242` → `abort()` method
- `app/node_modules/@anthropic-ai/sdk/src/lib/MessageStream.ts:196` → signal threaded from options

From Next.js 16 Request primitive:
- `request.signal: AbortSignal` is a `ReadableStream.cancel()`-fired signal tied to client disconnect.
- `request.signal.aborted: boolean`
- `request.signal.addEventListener("abort", handler)`

ReadableStream API (standard):
- `new ReadableStream({ start(controller) {}, cancel(reason) {} })`
- `cancel()` fires when consumer (the Response body pipeline) is cancelled — includes client disconnect via browser nav, tab close, or fetch abort.

Plan 02's mock-anthropic.ts fixture (already exists):
- `makeMockStream({ throwOnAbort: true })` — simulates the SDK emitting `APIUserAbortError` when `stream.abort()` is called.
- Needs extension for this plan: the mock's `abort()` should also set an internal `aborted` flag and make the async iterator terminate.
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
    - Inside `ReadableStream.start(controller)`: register `request.signal.addEventListener("abort", () => { stream.abort(); try { controller.close(); } catch {} })`.
    - Also check `if (request.signal.aborted) break;` at the top of the `for await` loop.
    - Catch `APIUserAbortError` inside the stream iteration — do NOT call `controller.error(err)` for aborts; call `controller.close()` gracefully.
    - `ReadableStream.cancel()` callback calls `stream.abort()` — covers the case where Next cancels the Response body before the addEventListener fires.
    - Preserve all existing SSE body structure, marker protocol, header setup (Plan 03's X-Huma-Truncated).
  </behavior>
  <action>
Step 1 — Locate the existing stream block in `app/src/app/api/v2-chat/route.ts`. After Plans 01/02/03/05 land, the structure is approximately:
  ```typescript
  // ...requireUser, IP limit, quota, parseBody, budgetCheck...
  const stream = anthropic.messages.stream({
    model,
    system,
    messages: messagesForDispatch,
    max_tokens: 2048,
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, { headers });
  ```

Step 2 — Apply the SEC-06 surgical edits. The full new block:
  ```typescript
  // ─── SSE streaming with disconnect-aware abort (SEC-06) ───
  const stream = anthropic.messages.stream(
    {
      model,
      system,
      messages: messagesForDispatch,
      max_tokens: 2048,
    },
    { signal: request.signal },   // ← pass client-disconnect signal through to SDK
  );

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Belt-and-suspenders: abort the upstream if the request signal fires.
      const onAbort = () => {
        try { stream.abort(); } catch { /* already aborted */ }
        try { controller.close(); } catch { /* controller may be closed */ }
      };
      // If already aborted (unlikely but defensive), abort immediately.
      if (request.signal.aborted) {
        onAbort();
        return;
      }
      request.signal.addEventListener("abort", onAbort);

      try {
        for await (const event of stream) {
          // Check on each tick — if the signal fires mid-stream, exit the loop.
          if (request.signal.aborted) break;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
          // Preserve existing marker-emission logic for other event.type branches.
        }
        controller.close();
      } catch (err) {
        // APIUserAbortError is the SDK's response to stream.abort() — expected, not an error.
        const name = (err as Error)?.name;
        if (name === "APIUserAbortError") {
          try { controller.close(); } catch { /* noop */ }
        } else {
          console.error("[v2-chat] Stream error:", err);
          try { controller.error(err); } catch { /* noop */ }
        }
      } finally {
        request.signal.removeEventListener("abort", onAbort);

        // Plan 05 secondary write: after stream completes (success OR abort), update
        // cost_metrics_raw with actual usage from stream.finalMessage() if available.
        stream.finalMessage()
          .then((msg) => {
            // If withObservability's ObsCtx is available via closure, set tokens.
            // The executor should ensure the `obs` context from Plan 05 is in scope here.
            if (typeof (globalThis as any).__obs_set === "function") {
              (globalThis as any).__obs_set(msg.usage.input_tokens, msg.usage.output_tokens);
            }
          })
          .catch((e) => {
            // APIUserAbortError expected on client disconnect; only log unexpected errors.
            const n = (e as Error)?.name;
            if (n !== "APIUserAbortError") console.error("[v2-chat] finalMessage failed:", e);
          });
      }
    },

    cancel(reason) {
      // ReadableStream consumer cancelled (e.g., Next cancelled the response body
      // because the client disconnected). Ensure Anthropic stream is aborted too.
      try { stream.abort(); } catch { /* noop */ }
    },
  });

  return new Response(readable, { headers });
  ```
  Notes on the executor's judgment:
  - If Plan 05 already registered a `stream.on('finalMessage', ...)` listener to update `obs.setPromptTokens/setOutputTokens`, the `finally` block can just await `stream.finalMessage()` — the listener fires. If not, the inline `.then()` in this plan is the secondary path.
  - The `(globalThis as any).__obs_set` is illustrative — the real implementation should close over `obs` from the `withObservability` callback scope. No need for a global.

Step 3 — **Do not add a separate test or new file here** — Task 2 covers the test. Task 1 is purely the route edit.

Step 4 — Run existing v2-chat tests to ensure nothing regresses:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/
  ```
  All pre-existing tests (auth, quota, log) still pass. The abort path is additive — non-aborted requests see unchanged behavior.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts src/app/api/v2-chat/route.quota.test.ts</automated>
  </verify>
  <done>
    - v2-chat route passes `{ signal: request.signal }` as second arg to `anthropic.messages.stream`.
    - ReadableStream.start registers abort listener + handles APIUserAbortError gracefully.
    - ReadableStream.cancel calls `stream.abort()`.
    - Existing v2-chat route tests (Plans 01/02) still pass.
    - Never-rewrite: surgical additions only.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Unit test for abort wiring</name>
  <files>
    app/src/app/api/v2-chat/route.abort.test.ts
  </files>
  <behavior>
    - Assertion 1: when request.signal fires abort, the mock stream's abort() is called.
    - Assertion 2: when ReadableStream.cancel() is invoked (simulating a closed reader), stream.abort() is called.
    - Assertion 3: APIUserAbortError thrown mid-stream is swallowed (route returns normally, no uncaught exception).
    - Assertion 4: `anthropic.messages.stream` is called with a second arg whose `signal` matches `request.signal`.
  </behavior>
  <action>
Step 1 — Extend `app/src/__tests__/fixtures/mock-anthropic.ts` if needed:
  ```typescript
  // Verify makeMockStream supports:
  // - abort(): sets internal aborted flag, iterator terminates
  // - throwOnAbort option that causes iterator to throw APIUserAbortError when aborted mid-stream
  ```
  If the current fixture (from Plan 02) lacks the `throwOnAbort` path, extend:
  ```typescript
  export function makeMockStream(opts: { text?: string; throwOnAbort?: boolean; ... } = {}) {
    let aborted = false;
    const abortFn = vi.fn(() => { aborted = true; });
    class APIUserAbortError extends Error { constructor() { super("aborted"); this.name = "APIUserAbortError"; } }
    async function* iter() {
      for (const ch of (opts.text ?? "ok").split("")) {
        if (aborted) {
          if (opts.throwOnAbort) throw new APIUserAbortError();
          return;
        }
        await new Promise((r) => setTimeout(r, 1)); // yield to allow external abort()
        yield { type: "content_block_delta", delta: { type: "text_delta", text: ch } };
      }
    }
    return {
      stream: {
        abort: abortFn,
        [Symbol.asyncIterator]: () => iter(),
        finalMessage: async () => {
          if (aborted && opts.throwOnAbort) throw new APIUserAbortError();
          return { usage: { input_tokens: opts.inputTokens ?? 10, output_tokens: opts.outputTokens ?? 1 } };
        },
        on: vi.fn(),
      },
      abortFn,
      get aborted() { return aborted; },
      APIUserAbortError,
    };
  }
  ```

Step 2 — Create `app/src/app/api/v2-chat/route.abort.test.ts`:
  ```typescript
  import { describe, it, expect, beforeAll, vi } from "vitest";
  import { mockSupabaseAnonSession } from "@/__tests__/fixtures/mock-supabase";
  import { makeMockStream } from "@/__tests__/fixtures/mock-anthropic";

  // Build a mock SDK that exposes the same stream instance so we can spy on .abort().
  const { stream, abortFn } = makeMockStream({ text: "hello world", throwOnAbort: true });
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
      from: () => ({ insert: vi.fn(async () => ({ error: null })) }),
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
      // Start consuming the body, then abort.
      const reader = (res.body as ReadableStream).getReader();
      reader.read(); // kick the stream
      ctrl.abort();
      // Allow microtasks to run.
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
      // The consumer side may see no error or a controlled close; the key invariant
      // is the route's POST returned a Response and the test did not throw APIUserAbortError.
      expect(result === null || (result as Error)?.name !== "APIUserAbortError").toBe(true);
    });
  });
  ```

Step 3 — Run:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts
  ```
  All 4 cases green.

Step 4 — Full suite confirmation:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts</automated>
  </verify>
  <done>
    - `route.abort.test.ts` exists with 4 assertions.
    - Mock stream fixture extended to support `throwOnAbort` + APIUserAbortError emission.
    - Test file green.
    - Existing v2-chat tests still pass.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Manual-observation smoke script for SEC-06</name>
  <files>
    app/scripts/smoke/sec-06-disconnect.sh
  </files>
  <behavior>
    - `curl -N` opens a streaming request; script kills it after 100ms.
    - Prints instructions for the operator to inspect Vercel logs for `APIUserAbortError` OR a matching `req_id` whose status=200 but latency is notably short (indicating early abort).
    - Exit-zero on the curl race (the automation is correct; verification is manual per VALIDATION.md Manual-Only section).
  </behavior>
  <action>
Step 1 — Create `app/scripts/smoke/sec-06-disconnect.sh`:
  ```bash
  #!/usr/bin/env bash
  # SEC-06 manual-observed smoke: SSE disconnect → Anthropic abort.
  # Usage: BASE_URL=https://huma-two.vercel.app ANON_JWT=<jwt> bash scripts/smoke/sec-06-disconnect.sh
  # Requires a running deployment (staging/prod) + an anon session (SEC-01).
  # Verification is MANUAL — inspect Vercel runtime logs after running.
  set -euo pipefail

  BASE_URL="${BASE_URL:-http://localhost:3000}"
  ANON_JWT="${ANON_JWT:-}"
  COOKIE_HDR=""
  if [ -n "$ANON_JWT" ]; then
    COOKIE_HDR="-H \"Cookie: sb-access-token=$ANON_JWT\""
  elif [ -n "${COOKIE:-}" ]; then
    COOKIE_HDR="-H \"Cookie: $COOKIE\""
  else
    echo "SKIP: ANON_JWT/COOKIE not set (requires authenticated anon session)."
    exit 0
  fi

  echo "SEC-06 disconnect smoke — starting streaming request; will kill after ~100ms."
  echo "After exit, inspect Vercel runtime logs for the matching req_id."
  echo ""

  # Start curl in background, streaming.
  eval curl -N -sS -X POST "$BASE_URL/api/v2-chat" \
    -H "'Content-Type: application/json'" $COOKIE_HDR \
    -d '"'"'{"messages":[{"role":"user","content":"give me a long response about trees"}]}'"'"' \
    > /tmp/sec06_out 2>&1 &
  CURL_PID=$!

  # Sleep briefly to let the stream start, then kill.
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
  echo "       (a) A line containing 'APIUserAbortError' (indicates abort was triggered), OR"
  echo "       (b) Status=200 with latency_ms < 500 and output_tokens=0 or a small partial count"
  echo "           (indicates stream aborted before finalMessage resolved)."
  echo "    5. Capture the req_id and note it in the Plan 07 enablement checklist."
  echo ""
  echo "    If neither condition holds: Anthropic may still be generating tokens — SEC-06 is NOT working."
  ```

Step 2 — Make it executable (if testing on Unix):
  ```bash
  chmod +x app/scripts/smoke/sec-06-disconnect.sh
  ```

Step 3 — This is a manual-observation smoke per VALIDATION.md. No automated test; the unit tests in Task 2 cover the wiring, the smoke script covers the live deployment path.

Step 4 — Full suite final pass (no new test but verifying nothing regressed):
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts</automated>
  </verify>
  <done>
    - `scripts/smoke/sec-06-disconnect.sh` exists; executable (where permissions meaningful).
    - Script runs cleanly on a staging deployment + anon session; prints explicit manual-verification steps.
    - Full Vitest suite still green.
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
Then inspect Vercel logs for `APIUserAbortError` or a stream entry with status=200 + short latency + partial output_tokens.
</verification>

<success_criteria>
- SEC-06 fully delivered: abort wired through `{ signal }` option + ReadableStream lifecycle hooks.
- `APIUserAbortError` caught cleanly — route exits normally, observability log still emitted.
- Unit tests cover the three abort paths (signal, cancel, error swallow).
- Manual smoke script ready for Plan 07's enablement verification.
- Never-rewrite: surgical additions only to `v2-chat/route.ts`.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-06-sse-abort-SUMMARY.md` with:
- What was built (signal threading, abort event listener, cancel handler, error swallow, unit tests, manual smoke)
- Files modified (3 files total — the smallest plan in Phase 1)
- Testing note: unit tests use `makeMockStream` with `throwOnAbort: true` to simulate APIUserAbortError
- Downstream: Plan 07 manual smoke against staging with Vercel log inspection is the final verification
- Interaction with Plan 05: aborted streams still emit a log with status=200 (the Response was returned before disconnect); output_tokens may be 0 or partial
</output>
