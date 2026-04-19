import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ─── SSE disconnect / abort wiring test suite (Plan 01-06 / SEC-06) ──────────
// Covers:
//  - anthropic.messages.stream receives { signal: request.signal } as second arg.
//  - When request.signal fires abort, the mock stream's abort() is called.
//  - When ReadableStream.cancel() is invoked, stream.abort() is called.
//  - APIUserAbortError thrown mid-stream is swallowed — route returns normally.
//
// Consumes Plan 00's makeMockStream fixture AS-IS (throwOnAbort + chunkDelayMs).

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.PHASE_1_GATE_ENABLED = "true";
});

afterEach(() => {
  vi.resetModules();
});

function buildRequestBody() {
  return {
    messages: [{ role: "user" as const, content: "hi" }],
    knownContext: {},
    aspirations: [],
  };
}

function buildRequest(signal?: AbortSignal): Request {
  return new Request("http://localhost/api/v2-chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(buildRequestBody()),
    signal,
  });
}

describe("/api/v2-chat SSE abort (SEC-06)", () => {
  it("passes { signal: request.signal } to anthropic.messages.stream", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-sig")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, streamFn } = makeMockAnthropic({ text: "hello" });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const ctrl = new AbortController();
    const res = await POST(buildRequest(ctrl.signal));
    // Drain to avoid leaking the streaming body between tests.
    try { await (res.body as ReadableStream | null)?.getReader().read(); } catch { /* noop */ }

    expect(streamFn).toHaveBeenCalled();
    const call = streamFn.mock.calls[0];
    expect(call.length).toBeGreaterThanOrEqual(2);
    const opts = call[1] as { signal?: AbortSignal } | undefined;
    expect(opts?.signal).toBe(ctrl.signal);
  });

  it("calls stream.abort() when request.signal fires", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-abrt")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    // chunkDelayMs keeps the stream open long enough for abort() to fire mid-iteration.
    const { MockAnthropic, abortFn } = makeMockAnthropic({
      text: "a slow response",
      throwOnAbort: true,
      chunkDelayMs: 5,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const ctrl = new AbortController();
    const res = await POST(buildRequest(ctrl.signal));
    const reader = (res.body as ReadableStream).getReader();
    // Pull at least one chunk so iteration starts, then abort.
    void reader.read();
    ctrl.abort();
    // Give the async abort listener a tick to fire.
    await new Promise((r) => setTimeout(r, 25));

    expect(abortFn).toHaveBeenCalled();
  });

  it("calls stream.abort() when ReadableStream.cancel() is invoked", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-cancel")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic, abortFn } = makeMockAnthropic({
      text: "another slow response",
      throwOnAbort: true,
      chunkDelayMs: 5,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest());
    const reader = (res.body as ReadableStream).getReader();
    await reader.cancel("client went away");
    await new Promise((r) => setTimeout(r, 25));

    expect(abortFn).toHaveBeenCalled();
  });

  it("swallows APIUserAbortError cleanly — reader does NOT surface APIUserAbortError", async () => {
    const { mockSupabaseAnonSession } = await import("@/__tests__/fixtures/mock-supabase");
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-swallow")),
    }));
    vi.doMock("@/lib/rate-limit", () => ({ isRateLimited: async () => false }));
    const { makeMockAnthropic } = await import("@/__tests__/fixtures/mock-anthropic");
    const { MockAnthropic } = makeMockAnthropic({
      text: "still yet another slow response",
      throwOnAbort: true,
      chunkDelayMs: 5,
    });
    vi.doMock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }));

    const { POST } = await import("./route");
    const ctrl = new AbortController();
    const res = await POST(buildRequest(ctrl.signal));
    const reader = (res.body as ReadableStream).getReader();

    const drainPromise = (async () => {
      try {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
        return null;
      } catch (e) {
        return e as Error;
      }
    })();

    // Let the first chunk emit, then abort mid-flight.
    await new Promise((r) => setTimeout(r, 10));
    ctrl.abort();

    const result = await drainPromise;
    // Either the reader finished cleanly (null) or threw something that is
    // NOT APIUserAbortError — that error must never surface to callers.
    if (result !== null) {
      expect((result as Error).name).not.toBe("APIUserAbortError");
    }
  });
});
