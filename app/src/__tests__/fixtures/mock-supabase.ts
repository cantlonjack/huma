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
export function mockSupabaseAuthedSession(
  userId: string,
  opts: { tier?: "free" | "operate"; email?: string } = {}
) {
  const user = { id: userId, is_anonymous: false, email: opts.email ?? `${userId}@example.com` };
  const tier = opts.tier ?? "free";
  const subscriptionRow = tier === "operate" ? { tier: "operate", status: "active" } : null;
  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
      getSession: vi.fn(async () => ({ data: { session: { user } }, error: null })),
      admin: { getUserById: vi.fn(async () => ({ data: { user }, error: null })) },
    },
    from: vi.fn((table: string) =>
      table === "subscriptions" ? chainable(subscriptionRow) : chainable(null)
    ),
    rpc: vi.fn(async () => ({ data: null, error: null })),
  };
}

/**
 * Convenience: install a vi.mock for `@/lib/supabase-server.createServerSupabase`
 * pointing at the provided implementation. Use INSIDE a test's vi.doMock callback.
 */
export function installSupabaseMock(
  impl: ReturnType<typeof mockSupabaseNoSession>
): { createServerSupabase: AnyFn } {
  return { createServerSupabase: () => Promise.resolve(impl) };
}
