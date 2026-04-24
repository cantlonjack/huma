---
phase: 01-security-cost-control
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - app/src/__tests__/fixtures/mock-supabase.ts
  - app/src/__tests__/fixtures/mock-anthropic.ts
  - app/src/__tests__/fixtures/capture-log.ts
  - app/src/__tests__/fixtures/fixtures.test.ts
autonomous: true
requirements:
  - SEC-01
  - SEC-02
  - SEC-05
  - SEC-06
must_haves:
  truths:
    - "mock-supabase.ts exports mockSupabaseNoSession, mockSupabaseAnonSession, mockSupabaseAuthedSession"
    - "mock-anthropic.ts exports makeMockAnthropic, makeMockStream, mockAnthropicCountTokens"
    - "makeMockStream supports {throwOnAbort: true} causing iterator to emit APIUserAbortError"
    - "capture-log.ts exports captureConsoleLog returning {logs, restore, spy}"
    - "Wave 1 plans (01-04, 06) consume these fixtures via vi.mock without modifying them"
  artifacts:
    - path: "app/src/__tests__/fixtures/mock-supabase.ts"
      provides: "Three Supabase session mocks + admin mock + installSupabaseMock helper"
      exports: ["mockSupabaseNoSession", "mockSupabaseAnonSession", "mockSupabaseAuthedSession", "installSupabaseMock"]
      min_lines: 50
    - path: "app/src/__tests__/fixtures/mock-anthropic.ts"
      provides: "MessageStream mock with abort support + countTokens stub + full Anthropic class factory"
      exports: ["makeMockStream", "mockAnthropicCountTokens", "makeMockAnthropic"]
      min_lines: 70
    - path: "app/src/__tests__/fixtures/capture-log.ts"
      provides: "vi.spyOn(console.log) helper that parses JSON payloads emitted during a test"
      exports: ["captureConsoleLog", "type CapturedLog"]
      min_lines: 30
    - path: "app/src/__tests__/fixtures/fixtures.test.ts"
      provides: "Smoke test: every fixture is importable and shape-correct"
      contains: "mockSupabaseNoSession"
      min_lines: 30
  key_links:
    - from: "Wave 1 plans (01, 02, 03, 04, 06)"
      to: "app/src/__tests__/fixtures/*.ts"
      via: "import { mockSupabaseAnonSession } from '@/__tests__/fixtures/mock-supabase'"
      pattern: "fixtures/mock-(supabase|anthropic)|fixtures/capture-log"
    - from: "app/src/__tests__/fixtures/mock-anthropic.ts"
      to: "APIUserAbortError"
      via: "makeMockStream({throwOnAbort: true}) iterator throws when stream.abort() called"
      pattern: "APIUserAbortError"
---

<objective>
Wave 0 fixture plan. Extract the three test fixtures (mock-supabase, mock-anthropic, capture-log) that every other Phase 1 plan consumes. By landing these in their own plan ahead of Wave 1, we (a) prevent merge contention — Plans 02/03/06 had been racing to extend `mock-anthropic.ts` simultaneously — and (b) make Wave 1 plans pure consumers, simplifying their dependency graph.

Purpose: Prerequisite chokepoint for parallel Wave 1 execution. Lets `npm test` run cleanly across all later plans by guaranteeing the fixtures exist with the agreed shape before any consumer is written.

Output: Three fixture files + one shape-validating smoke test.

**No production code modified.** This plan touches only `app/src/__tests__/fixtures/*` — pure test infrastructure.
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
<!-- All fixtures are NEW. Consumers in Wave 1 import via @/__tests__/fixtures/*. -->

From Vitest 4.1.0 (already installed):
```typescript
import { vi, type MockInstance } from "vitest";
vi.fn(impl?)         // create mock
vi.spyOn(obj, "key") // spy + replace
vi.mock(path, factory) // hoisted module mock
```

From @supabase/supabase-js (installed) — shape consumers expect:
```typescript
supabase.auth.getUser() => Promise<{ data: { user: User | null }, error: null }>;
supabase.auth.admin.getUserById(id) => Promise<{ data: { user: User | null }, error: null }>;
supabase.from(table).select(...).eq(...).single() => Promise<{ data, error }>;
supabase.from(table).insert(rows) => Promise<{ data, error }>;
supabase.rpc(name, args) => Promise<{ data, error }>;
```

From @anthropic-ai/sdk v0.78.0:
```typescript
class MessageStream {
  controller: AbortController;
  abort(): void;
  [Symbol.asyncIterator](): AsyncIterator<MessageStreamEvent>;
  finalMessage(): Promise<Message>;
  on(event: string, listener: Function): this;
}
class APIUserAbortError extends Error { name: "APIUserAbortError" }
```

User shape (Supabase Auth):
```typescript
interface User {
  id: string;
  is_anonymous?: boolean;
  email?: string | null;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: mock-supabase.ts + mock-anthropic.ts + capture-log.ts + smoke test</name>
  <files>
    app/src/__tests__/fixtures/mock-supabase.ts,
    app/src/__tests__/fixtures/mock-anthropic.ts,
    app/src/__tests__/fixtures/capture-log.ts,
    app/src/__tests__/fixtures/fixtures.test.ts
  </files>
  <behavior>
    - mock-supabase.ts: three session-shape factories + an installSupabaseMock helper.
    - mock-anthropic.ts: a single canonical mock-stream factory with throwOnAbort + iterator support; a countTokens stub; a full Anthropic-class factory.
    - capture-log.ts: vi.spyOn(console, "log") + parses JSON args; returns {logs, restore, spy}.
    - fixtures.test.ts: imports each fixture, calls each factory once, asserts the returned shape includes the expected methods/exports.
  </behavior>
  <action>
Step 1 — Create `app/src/__tests__/fixtures/mock-supabase.ts`:
  ```typescript
  import { vi } from "vitest";

  type AnyFn = (...args: unknown[]) => unknown;

  /** Build a chainable .from(table).select().eq().eq().single()/.maybeSingle() stub. */
  function chainable(finalValue: unknown) {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      gte: vi.fn(() => chain),
      lt: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      insert: vi.fn(async () => ({ data: null, error: null })),
      upsert: vi.fn(async () => ({ data: null, error: null })),
      update: vi.fn(async () => ({ data: null, error: null })),
      delete: vi.fn(() => chain),
      single: vi.fn(async () => ({ data: finalValue, error: null })),
      maybeSingle: vi.fn(async () => ({ data: finalValue, error: null })),
    };
    return chain;
  }

  /** Mock Supabase server client with NO active session. */
  export function mockSupabaseNoSession() {
    return {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
        getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      },
      from: vi.fn(() => chainable(null)),
      rpc: vi.fn(async () => ({ data: null, error: null })),
    };
  }

  /** Mock Supabase server client with an authenticated anonymous user. */
  export function mockSupabaseAnonSession(userId: string) {
    const user = { id: userId, is_anonymous: true, email: null };
    return {
      auth: {
        getUser: vi.fn(async () => ({ data: { user }, error: null })),
        getSession: vi.fn(async () => ({ data: { session: { user } }, error: null })),
        admin: { getUserById: vi.fn(async () => ({ data: { user }, error: null })) },
      },
      from: vi.fn(() => chainable(null)),
      rpc: vi.fn(async () => ({ data: null, error: null })),
    };
  }

  /** Mock Supabase server client with an authenticated permanent user (free or operate). */
  export function mockSupabaseAuthedSession(userId: string, opts: { tier?: "free" | "operate"; email?: string } = {}) {
    const user = { id: userId, is_anonymous: false, email: opts.email ?? `${userId}@example.com` };
    const tier = opts.tier ?? "free";
    const subscriptionRow = tier === "operate" ? { tier: "operate", status: "active" } : null;
    return {
      auth: {
        getUser: vi.fn(async () => ({ data: { user }, error: null })),
        getSession: vi.fn(async () => ({ data: { session: { user } }, error: null })),
        admin: { getUserById: vi.fn(async () => ({ data: { user }, error: null })) },
      },
      from: vi.fn((table: string) => table === "subscriptions" ? chainable(subscriptionRow) : chainable(null)),
      rpc: vi.fn(async () => ({ data: null, error: null })),
    };
  }

  /**
   * Convenience: install a vi.mock for `@/lib/supabase-server.createServerSupabase`
   * pointing at the provided implementation. Use INSIDE a test's vi.doMock callback.
   */
  export function installSupabaseMock(impl: ReturnType<typeof mockSupabaseNoSession>): { createServerSupabase: AnyFn } {
    return { createServerSupabase: () => Promise.resolve(impl) };
  }
  ```

Step 2 — Create `app/src/__tests__/fixtures/mock-anthropic.ts`:
  ```typescript
  import { vi } from "vitest";

  /** Anthropic SDK's APIUserAbortError shape; used by mock-stream's throwOnAbort. */
  export class APIUserAbortError extends Error {
    constructor() {
      super("Stream aborted by user");
      this.name = "APIUserAbortError";
    }
  }

  export interface MockStreamOptions {
    text?: string;
    inputTokens?: number;
    outputTokens?: number;
    /** When true, calling stream.abort() during iteration throws APIUserAbortError. */
    throwOnAbort?: boolean;
    /** Delay (ms) between yielded characters; lets external abort() fire mid-stream. */
    chunkDelayMs?: number;
  }

  /** Build a mock MessageStream-shaped object. Reused by Plans 02 (quota), 03 (budget),
   *  05c (observability streaming), and 06 (abort wiring).
   */
  export function makeMockStream(opts: MockStreamOptions = {}) {
    const text = opts.text ?? "ok";
    const inputTokens = opts.inputTokens ?? 100;
    const outputTokens = opts.outputTokens ?? 1;
    const delay = opts.chunkDelayMs ?? 0;

    let aborted = false;
    const abortFn = vi.fn(() => { aborted = true; });

    async function* iter() {
      for (const ch of text.split("")) {
        if (aborted) {
          if (opts.throwOnAbort) throw new APIUserAbortError();
          return;
        }
        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        yield { type: "content_block_delta", delta: { type: "text_delta", text: ch } };
      }
    }

    const onListeners: Record<string, Array<(arg: unknown) => void>> = {};

    const stream = {
      abort: abortFn,
      [Symbol.asyncIterator]: () => iter(),
      finalMessage: async () => {
        if (aborted && opts.throwOnAbort) throw new APIUserAbortError();
        return { usage: { input_tokens: inputTokens, output_tokens: outputTokens } };
      },
      on: vi.fn((event: string, listener: (arg: unknown) => void) => {
        (onListeners[event] ??= []).push(listener);
        return stream;
      }),
      _emit: (event: string, arg: unknown) => {
        for (const l of onListeners[event] ?? []) l(arg);
      },
    };

    return { stream, abortFn, get aborted() { return aborted; }, APIUserAbortError };
  }

  /** Mock for anthropic.messages.countTokens. Pass a single number for fixed value, or an array
   *  to return successive values across multiple calls (last value sticks).
   */
  export function mockAnthropicCountTokens(value: number | number[]) {
    const list = Array.isArray(value) ? [...value] : [value];
    return vi.fn(async () => ({ input_tokens: list.length > 1 ? list.shift()! : list[0] }));
  }

  /** Build a complete Anthropic class for vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic })). */
  export function makeMockAnthropic(opts: MockStreamOptions = {}) {
    const { stream, abortFn } = makeMockStream(opts);
    const countTokens = mockAnthropicCountTokens(opts.inputTokens ?? 100);
    const create = vi.fn(async () => ({
      content: [{ type: "text", text: opts.text ?? "ok" }],
      usage: { input_tokens: opts.inputTokens ?? 100, output_tokens: opts.outputTokens ?? 1 },
    }));
    const streamFn = vi.fn((_body: unknown, _opts?: { signal?: AbortSignal }) => stream);
    return {
      MockAnthropic: class {
        messages = { stream: streamFn, countTokens, create };
      },
      stream,
      streamFn,
      abortFn,
      countTokens,
      create,
    };
  }
  ```

Step 3 — Create `app/src/__tests__/fixtures/capture-log.ts`:
  ```typescript
  import { vi, type MockInstance } from "vitest";

  export interface CapturedLog {
    req_id?: string;
    user_id?: string | null;
    route?: string;
    prompt_tokens?: number;
    output_tokens?: number;
    latency_ms?: number;
    status?: number;
    source?: "user" | "cron" | "system";
    [k: string]: unknown;
  }

  /**
   * Spy on console.log; parse each call's first arg as JSON and collect.
   * Non-JSON logs are ignored. Always pair with `restore()` in afterEach.
   */
  export function captureConsoleLog(): {
    logs: CapturedLog[];
    restore: () => void;
    spy: MockInstance;
  } {
    const logs: CapturedLog[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      for (const a of args) {
        if (typeof a === "string") {
          try { logs.push(JSON.parse(a)); } catch { /* non-JSON — skip */ }
        }
      }
    });
    return { logs, restore: () => spy.mockRestore(), spy };
  }
  ```

Step 4 — Create `app/src/__tests__/fixtures/fixtures.test.ts`:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { mockSupabaseNoSession, mockSupabaseAnonSession, mockSupabaseAuthedSession } from "./mock-supabase";
  import { makeMockStream, makeMockAnthropic, mockAnthropicCountTokens, APIUserAbortError } from "./mock-anthropic";
  import { captureConsoleLog } from "./capture-log";

  describe("Phase 1 fixtures", () => {
    it("mockSupabaseNoSession returns a client with auth.getUser → null user", async () => {
      const c = mockSupabaseNoSession();
      const { data } = await c.auth.getUser();
      expect(data.user).toBeNull();
    });

    it("mockSupabaseAnonSession returns is_anonymous: true", async () => {
      const c = mockSupabaseAnonSession("anon-1");
      const { data } = await c.auth.getUser();
      expect(data.user?.id).toBe("anon-1");
      expect(data.user?.is_anonymous).toBe(true);
    });

    it("mockSupabaseAuthedSession with tier:operate exposes a subscription row", async () => {
      const c = mockSupabaseAuthedSession("u-1", { tier: "operate" });
      const sub = await c.from("subscriptions").select().eq("a", "b").maybeSingle();
      expect(sub.data).toEqual({ tier: "operate", status: "active" });
    });

    it("makeMockStream iterator yields characters and supports abort()", async () => {
      const { stream, abortFn } = makeMockStream({ text: "ab" });
      const events: unknown[] = [];
      for await (const e of stream) events.push(e);
      expect(events).toHaveLength(2);
      stream.abort();
      expect(abortFn).toHaveBeenCalled();
    });

    it("makeMockStream({throwOnAbort:true}) throws APIUserAbortError when aborted mid-stream", async () => {
      const { stream } = makeMockStream({ text: "abcdefgh", throwOnAbort: true, chunkDelayMs: 1 });
      const consume = (async () => {
        try { for await (const _ of stream) { stream.abort(); } return null; }
        catch (e) { return e; }
      })();
      const err = await consume;
      expect((err as Error)?.name).toBe("APIUserAbortError");
    });

    it("makeMockStream.finalMessage returns usage object", async () => {
      const { stream } = makeMockStream({ inputTokens: 42, outputTokens: 7 });
      const final = await stream.finalMessage();
      expect(final.usage.input_tokens).toBe(42);
      expect(final.usage.output_tokens).toBe(7);
    });

    it("mockAnthropicCountTokens returns successive values", async () => {
      const ct = mockAnthropicCountTokens([10, 20, 30]);
      expect((await ct()).input_tokens).toBe(10);
      expect((await ct()).input_tokens).toBe(20);
      expect((await ct()).input_tokens).toBe(30);
      // Sticky on last:
      expect((await ct()).input_tokens).toBe(30);
    });

    it("makeMockAnthropic exposes class with messages.{stream, countTokens, create}", () => {
      const { MockAnthropic } = makeMockAnthropic();
      const a = new MockAnthropic();
      expect(typeof a.messages.stream).toBe("function");
      expect(typeof a.messages.countTokens).toBe("function");
      expect(typeof a.messages.create).toBe("function");
    });

    it("captureConsoleLog collects JSON.stringify(payload) calls", () => {
      const cap = captureConsoleLog();
      console.log(JSON.stringify({ req_id: "r1", route: "/x" }));
      console.log("not json — ignored");
      console.log(JSON.stringify({ status: 200 }));
      expect(cap.logs).toHaveLength(2);
      expect(cap.logs[0].req_id).toBe("r1");
      expect(cap.logs[1].status).toBe(200);
      cap.restore();
    });

    it("APIUserAbortError carries the canonical name", () => {
      expect(new APIUserAbortError().name).toBe("APIUserAbortError");
    });
  });
  ```

Step 5 — Run the smoke test:
  ```bash
  cd app && npm test -- src/__tests__/fixtures/fixtures.test.ts
  ```
  Expected: all assertions green.

Step 6 — Full suite confirmation (no regression risk — pure test fixtures):
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/__tests__/fixtures/fixtures.test.ts</automated>
  </verify>
  <done>
    - Three fixture files exist with documented exports.
    - fixtures.test.ts green (10 assertions).
    - Wave 1 plans can `import { ... } from "@/__tests__/fixtures/*"` without further setup.
    - Full Vitest suite still green.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-00 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/__tests__/fixtures/fixtures.test.ts
```

Non-regression:
```bash
cd app && npm test
```

This plan modifies no production code, so non-regression is essentially guaranteed; the explicit smoke is just due diligence.
</verification>

<success_criteria>
- Three fixture files exist and export the documented surfaces.
- 10 assertions in fixtures.test.ts green.
- Wave 1 plans (01, 02, 03, 04, 06) can import without modifying the fixtures — they are pure consumers from this point.
- No production code touched.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-00-fixtures-SUMMARY.md` with:
- What was built (three fixtures + smoke)
- Why this exists as a Wave 0 plan: prevents merge contention from Plans 02/03/06 simultaneously extending mock-anthropic.ts
- Files created (3 fixtures + 1 test)
- Downstream: every Wave 1 plan imports from these; Plan 05a extends `capture-log` if/when needed but does NOT replace it
</output>
