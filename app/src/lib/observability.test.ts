import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
import { isULID } from "./ulid";

// ─── Mock createAdminSupabase before importing observability ──────────────
// Track insert call payloads and switch behavior per-test via insertImpl.
const insertCalls: unknown[] = [];
let insertImpl: () => Promise<{ error: { message: string } | null }> =
  async () => ({ error: null });

vi.mock("@/lib/supabase-admin", () => ({
  createAdminSupabase: () => ({
    from: () => ({
      insert: vi.fn(async (row: unknown) => {
        insertCalls.push(row);
        return insertImpl();
      }),
    }),
  }),
}));

// Must be imported AFTER vi.mock (vitest hoists vi.mock automatically, but
// keeping this order makes the dependency explicit).
import { withObservability, __resetObsQueueForTests } from "./observability";

describe("withObservability", () => {
  let cap: ReturnType<typeof captureConsoleLog>;

  beforeEach(() => {
    cap = captureConsoleLog();
    insertCalls.length = 0;
    insertImpl = async () => ({ error: null });
    __resetObsQueueForTests();
  });

  afterEach(() => {
    cap.restore();
  });

  it("emits log with all 7 fields + source on success (closure-based token capture — Warning 5)", async () => {
    const req = new Request("http://localhost/api/test", { method: "POST" });
    await withObservability(
      req,
      "/api/test",
      "user",
      () => "user-123",
      async (ctx) => {
        ctx.setPromptTokens(100);
        ctx.setOutputTokens(50);
        return new Response("ok", { status: 200 });
      },
    );
    expect(cap.logs).toHaveLength(1);
    const log = cap.logs[0];
    expect(isULID(log.req_id ?? "")).toBe(true);
    expect(log.user_id).toBe("user-123");
    expect(log.route).toBe("/api/test");
    expect(log.prompt_tokens).toBe(100);
    // Warning 5: closure-based capture → output_tokens > 0 in the payload.
    expect(log.output_tokens).toBe(50);
    expect(typeof log.latency_ms).toBe("number");
    expect(log.status).toBe(200);
    expect(log.source).toBe("user");
  });

  it("Warning 2 reinforcement: source='system' tag when userIdResolver returns null and source='system'", async () => {
    const req = new Request("http://localhost/api/test", { method: "POST" });
    await withObservability(
      req,
      "/api/test",
      "system",
      () => null,
      async () => new Response("ok", { status: 200 }),
    );
    const log = cap.logs[0];
    expect(log.user_id).toBeNull();
    // Must NOT be "user" — that would poison per-user dashboards.
    expect(log.source).toBe("system");
  });

  it("emits log with status=500 when handler throws a non-Response error and re-throws", async () => {
    const req = new Request("http://localhost/api/test");
    await expect(
      withObservability(req, "/api/test", "user", () => null, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(cap.logs).toHaveLength(1);
    expect(cap.logs[0].status).toBe(500);
  });

  it("honors Response-valued throws with their status (no re-throw)", async () => {
    const req = new Request("http://localhost/api/test");
    const ret = await withObservability(
      req,
      "/api/test",
      "user",
      () => null,
      async () => {
        throw new Response("nope", { status: 418 });
      },
    );
    expect(ret.status).toBe(418);
    expect(cap.logs[0].status).toBe(418);
  });

  it("setUserId from handler updates log user_id (lazy resolution)", async () => {
    const req = new Request("http://localhost/api/test");
    await withObservability(
      req,
      "/api/test",
      "user",
      () => null,
      async (ctx) => {
        ctx.setUserId("late-resolved-user");
        return new Response("ok", { status: 200 });
      },
    );
    expect(cap.logs[0].user_id).toBe("late-resolved-user");
  });

  it("Warning 4: failed cost_metrics_raw write retries on NEXT request's exit path", async () => {
    const req = new Request("http://localhost/api/test");

    // First request: insert fails → payload joins retry queue.
    insertImpl = async () => ({ error: { message: "DB hiccup" } });
    await withObservability(
      req,
      "/api/test",
      "user",
      () => "u-1",
      async (ctx) => {
        ctx.setPromptTokens(10);
        ctx.setOutputTokens(2);
        return new Response("ok", { status: 200 });
      },
    );
    // Let the fire-and-forget microtask settle.
    await new Promise((r) => setTimeout(r, 10));
    // One attempt: failed → queued.
    expect(insertCalls.length).toBe(1);

    // Second request: insert now succeeds. On exit, queue drains BEFORE
    // the new write → both payloads land.
    insertImpl = async () => ({ error: null });
    await withObservability(
      req,
      "/api/test",
      "user",
      () => "u-2",
      async (ctx) => {
        ctx.setPromptTokens(20);
        ctx.setOutputTokens(4);
        return new Response("ok", { status: 200 });
      },
    );
    await new Promise((r) => setTimeout(r, 20));
    // Expected attempts: 1 initial-fail + 1 retry (from req1's payload) + 1 new
    // write (req2's payload) = 3. Use >= to tolerate extra retries without
    // being flaky.
    expect(insertCalls.length).toBeGreaterThanOrEqual(3);
    // Both user ids should appear somewhere in the inserted rows.
    const users = insertCalls.map((c) => (c as { user_id: string }).user_id);
    expect(users).toContain("u-1");
    expect(users).toContain("u-2");
  });
});
