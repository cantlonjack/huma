import { describe, it, expect, afterEach, vi } from "vitest";
import {
  mockSupabaseNoSession,
  mockSupabaseAnonSession,
} from "@/__tests__/fixtures/mock-supabase";

describe("requireUser", () => {
  const origGate = process.env.PHASE_1_GATE_ENABLED;
  const origCron = process.env.CRON_SECRET;

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    process.env.PHASE_1_GATE_ENABLED = origGate;
    process.env.CRON_SECRET = origCron;
  });

  it("returns ctx with source:'system' when gate disabled and no session", async () => {
    process.env.PHASE_1_GATE_ENABLED = "false";
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    const { requireUser } = await import("./auth-guard");
    const result = await requireUser(new Request("http://localhost/api/x"));
    expect("error" in result).toBe(false);
    if ("ctx" in result && result.ctx) {
      expect(result.ctx.user).toBeNull();
      expect(result.ctx.source).toBe("system"); // NOT "user" (Warning 2)
      expect(result.ctx.isCron).toBe(false);
    }
  });

  it("returns 401 when gate enabled and no session", async () => {
    process.env.PHASE_1_GATE_ENABLED = "true";
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    const { requireUser } = await import("./auth-guard");
    const result = await requireUser(new Request("http://localhost/api/x"));
    expect("error" in result).toBe(true);
    if ("error" in result && result.error) {
      expect(result.error.status).toBe(401);
    }
  });

  it("CRON_SECRET bearer returns ctx with isCron:true source:'cron'", async () => {
    process.env.CRON_SECRET = "cron-test";
    // Even though we mock, cron-secret short-circuits before getUser is called
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()),
    }));
    const { requireUser } = await import("./auth-guard");
    const req = new Request("http://localhost/api/x", {
      headers: { Authorization: "Bearer cron-test" },
    });
    const result = await requireUser(req);
    expect("ctx" in result && result.ctx?.isCron).toBe(true);
    if ("ctx" in result && result.ctx) {
      expect(result.ctx.source).toBe("cron");
      expect(result.ctx.user).toBeNull();
    }
  });

  it("anonymous Supabase user returns ctx.user.is_anonymous=true source:'user'", async () => {
    process.env.PHASE_1_GATE_ENABLED = "true";
    vi.doMock("@/lib/supabase-server", () => ({
      createServerSupabase: () =>
        Promise.resolve(mockSupabaseAnonSession("anon-1")),
    }));
    const { requireUser } = await import("./auth-guard");
    const result = await requireUser(new Request("http://localhost/api/x"));
    expect("ctx" in result).toBe(true);
    if ("ctx" in result && result.ctx) {
      expect(result.ctx.user?.id).toBe("anon-1");
      expect(result.ctx.user?.is_anonymous).toBe(true);
      expect(result.ctx.source).toBe("user");
      expect(result.ctx.isCron).toBe(false);
    }
  });
});
