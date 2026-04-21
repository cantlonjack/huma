import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * quota.test.ts (SEC-02 Plan 02)
 *
 * Unit tests for resolveTier and checkAndIncrement.
 *
 * Blocker 6 resolution: checkAndIncrement MUST accept inputTokens as an
 * argument — no internal estimation. Plan 03's budgetCheck supplies the
 * accurate count from client.messages.countTokens().
 *
 * Mocks @/lib/supabase-admin to avoid real network I/O.
 */

describe("quota.ts — resolveTier + checkAndIncrement", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- resolveTier -----------------------------------------------------

  it("resolveTier returns 'anonymous' for anon user", async () => {
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: {
          admin: {
            getUserById: vi.fn(async () => ({
              data: { user: { id: "anon-1", is_anonymous: true } },
              error: null,
            })),
          },
        },
        from: vi.fn(() => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
              }),
            }),
          }),
        })),
        rpc: vi.fn(),
      }),
    }));

    const { resolveTier } = await import("./quota");
    expect(await resolveTier("anon-1")).toBe("anonymous");
  });

  it("resolveTier returns 'operate' when active operate subscription exists", async () => {
    const single = vi.fn(async () => ({
      data: { tier: "operate", status: "active" },
      error: null,
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: {
          admin: {
            getUserById: vi.fn(async () => ({
              data: { user: { id: "u-1", is_anonymous: false } },
              error: null,
            })),
          },
        },
        from: vi.fn(() => ({
          select: () => ({
            eq: () => ({
              eq: () => ({ eq: () => ({ maybeSingle: single }) }),
            }),
          }),
        })),
        rpc: vi.fn(),
      }),
    }));

    const { resolveTier } = await import("./quota");
    expect(await resolveTier("u-1")).toBe("operate");
  });

  it("resolveTier returns 'free' when no subscription and not anon", async () => {
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: {
          admin: {
            getUserById: vi.fn(async () => ({
              data: { user: { id: "u-2", is_anonymous: false } },
              error: null,
            })),
          },
        },
        from: vi.fn(() => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
              }),
            }),
          }),
        })),
        rpc: vi.fn(),
      }),
    }));

    const { resolveTier } = await import("./quota");
    expect(await resolveTier("u-2")).toBe("free");
  });

  // --- checkAndIncrement -----------------------------------------------

  it("checkAndIncrement passes accurate p_input_tokens to RPC (Blocker 6 — no heuristic)", async () => {
    // Typed param signature so `.mock.calls[0]` is a [name, args] tuple, not [].
    const rpc = vi.fn<(name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>>(
      async () => ({
        data: [
          {
            allowed: true,
            tier: "free",
            reset_at: new Date(Date.now() + 86_400_000).toISOString(),
            req_count: 1,
            token_count: 100,
          },
        ],
        error: null,
      }),
    );
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const { checkAndIncrement } = await import("./quota");
    const result = await checkAndIncrement("u-1", "/api/v2-chat", 100);

    expect(result.allowed).toBe(true);
    expect(rpc).toHaveBeenCalledOnce();
    const [name, args] = rpc.mock.calls[0];
    expect(name).toBe("increment_quota_and_check");
    expect(args).toMatchObject({
      p_user_id: "u-1",
      p_route: "/api/v2-chat",
      p_input_tokens: 100,
    });
  });

  it("checkAndIncrement forwards reqId to RPC when provided (Plan 05c reconciliation)", async () => {
    const rpc = vi.fn(async () => ({
      data: [
        {
          allowed: true,
          tier: "free",
          reset_at: new Date().toISOString(),
          req_count: 1,
          token_count: 250,
        },
      ],
      error: null,
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const { checkAndIncrement } = await import("./quota");
    await checkAndIncrement("u-1", "/api/v2-chat", 250, "01JABCXYZ");

    expect(rpc).toHaveBeenCalledWith("increment_quota_and_check", {
      p_user_id: "u-1",
      p_route: "/api/v2-chat",
      p_input_tokens: 250,
      p_req_id: "01JABCXYZ",
    });
  });

  it("checkAndIncrement returns suggest='sign_in' for anonymous denial", async () => {
    const rpc = vi.fn(async () => ({
      data: [
        {
          allowed: false,
          tier: "anonymous",
          reset_at: new Date().toISOString(),
          req_count: 5,
          token_count: 10000,
        },
      ],
      error: null,
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const { checkAndIncrement } = await import("./quota");
    const result = await checkAndIncrement("anon-1", "/api/v2-chat", 50);
    expect(result.allowed).toBe(false);
    expect(result.tier).toBe("anonymous");
    expect(result.suggest).toBe("sign_in");
  });

  it("checkAndIncrement returns suggest='upgrade_operate' for free-tier denial", async () => {
    const rpc = vi.fn(async () => ({
      data: [
        {
          allowed: false,
          tier: "free",
          reset_at: new Date().toISOString(),
          req_count: 50,
          token_count: 100000,
        },
      ],
      error: null,
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const { checkAndIncrement } = await import("./quota");
    const result = await checkAndIncrement("u-1", "/api/v2-chat", 500);
    expect(result.suggest).toBe("upgrade_operate");
  });

  it("checkAndIncrement returns suggest='wait' for operate-tier denial", async () => {
    const rpc = vi.fn(async () => ({
      data: [
        {
          allowed: false,
          tier: "operate",
          reset_at: new Date().toISOString(),
          req_count: 500,
          token_count: 2_000_000,
        },
      ],
      error: null,
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const { checkAndIncrement } = await import("./quota");
    const result = await checkAndIncrement("op-1", "/api/v2-chat", 1000);
    expect(result.suggest).toBe("wait");
  });

  it("checkAndIncrement fails open (allowed=true) when RPC errors AND emits structured WARN", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "connection refused" },
    }));
    vi.doMock("@/lib/supabase-admin", () => ({
      createAdminSupabase: () => ({
        auth: { admin: { getUserById: vi.fn() } },
        from: vi.fn(),
        rpc,
      }),
    }));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { checkAndIncrement } = await import("./quota");
      const result = await checkAndIncrement("u-1", "/api/v2-chat", 100, "01JREQABCD");

      // Availability > correctness when RPC is down: allow the request.
      expect(result.allowed).toBe(true);

      // Hardening: the fail-open path must NOT be silent. Vercel log search
      // must find the degradation via `component=quota severity=WARN`.
      expect(warnSpy).toHaveBeenCalledOnce();
      const arg = warnSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(arg) as Record<string, unknown>;
      expect(parsed).toMatchObject({
        component: "quota",
        severity: "WARN",
        event: "increment_quota_and_check_failed",
        user_id: "u-1",
        route: "/api/v2-chat",
        req_id: "01JREQABCD",
      });
      expect(typeof parsed.error_message).toBe("string");
    } finally {
      warnSpy.mockRestore();
    }
  });
});
