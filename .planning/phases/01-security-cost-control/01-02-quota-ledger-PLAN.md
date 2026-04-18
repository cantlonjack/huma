---
phase: 01-security-cost-control
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - app/supabase/migrations/016_user_quotas.sql
  - app/src/lib/api-error.ts
  - app/src/lib/quota.ts
  - app/src/app/api/v2-chat/route.ts
  - app/src/components/shared/QuotaCard.tsx
  - app/src/hooks/useMessageStream.ts
  - app/src/lib/quota.test.ts
  - app/src/app/api/v2-chat/route.quota.test.ts
  - app/src/__tests__/fixtures/mock-anthropic.ts
  - app/scripts/smoke/sec-02-quota.sh
autonomous: true
requirements:
  - SEC-02
must_haves:
  truths:
    - "Anonymous-tier user hits 429 on 6th request of the day with {tier:'anonymous', suggest:'sign_in', resetAt}"
    - "Free-tier user hits 429 on 51st request of the day with {tier:'free', suggest:'upgrade_operate', resetAt}"
    - "Operate-tier user hits 429 on 501st request of the day with {tier:'operate', suggest:'wait', resetAt}"
    - "Ledger increments atomically by prompt_tokens + output_tokens via increment_quota_and_check() RPC"
    - "Tier resolution uses auth.users.is_anonymous + subscriptions.tier (falls back to 'anonymous')"
    - "Client intercepts 429 and renders <QuotaCard> with Voice-Bible-compliant per-tier copy"
    - "CRON_SECRET path bypasses quota entirely (ctx.isCron === true short-circuits)"
  artifacts:
    - path: "app/supabase/migrations/016_user_quotas.sql"
      provides: "user_quotas_tiers seed (3 rows) + user_quota_ledger table + increment_quota_and_check() RPC"
      contains: "increment_quota_and_check"
      min_lines: 60
    - path: "app/src/lib/quota.ts"
      provides: "resolveTier(userId), checkAndIncrement(userId, route, tokens) server helpers"
      exports: ["resolveTier", "checkAndIncrement", "type QuotaTier", "type QuotaCheckResult"]
      min_lines: 60
    - path: "app/src/lib/api-error.ts"
      provides: "Extended rateLimited() overload accepting {tier, resetAt, suggest}"
      exports: ["rateLimited"]
    - path: "app/src/app/api/v2-chat/route.ts"
      provides: "Calls checkAndIncrement after requireUser, before Anthropic dispatch; skips when ctx.isCron"
      contains: "checkAndIncrement"
    - path: "app/src/components/shared/QuotaCard.tsx"
      provides: "Client overlay component rendered on 429; tier-aware copy"
      contains: "tier"
      min_lines: 50
    - path: "app/src/hooks/useMessageStream.ts"
      provides: "Fetch wrapper that parses 429 JSON body and surfaces QuotaCard state"
      contains: "RATE_LIMITED"
    - path: "app/scripts/smoke/sec-02-quota.sh"
      provides: "Anon session → 5 requests OK → 6th returns 429"
      contains: "429"
  key_links:
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "app/src/lib/quota.ts"
      via: "checkAndIncrement(ctx.user.id, '/api/v2-chat', estTokens) before anthropic.messages.stream"
      pattern: "checkAndIncrement"
    - from: "app/src/lib/quota.ts"
      to: "increment_quota_and_check RPC"
      via: "supabase.rpc('increment_quota_and_check', {...})"
      pattern: "rpc\\(['\"]increment_quota_and_check"
    - from: "app/src/hooks/useMessageStream.ts"
      to: "app/src/components/shared/QuotaCard.tsx"
      via: "setQuotaCard(body) when response.status === 429 && body.code === 'RATE_LIMITED'"
      pattern: "RATE_LIMITED"
---

<objective>
Deliver SEC-02: per-user token + request budget enforced through a Supabase-backed ledger, with tiered limits (anonymous: 5 req / 10K tokens/day, free: 50 req / 100K tokens/day, Operate: 500 req / 2M tokens/day). Over-limit returns 429 with a structured body carrying `tier`, `resetAt`, `suggest`. The client intercepts 429 and renders a Voice-Bible-compliant `<QuotaCard>` overlay — no silent drops, no shame copy.

Purpose: Prevents surprise Anthropic bills from a single cookie-clearing anon rotation or a runaway client. Pairs with SEC-01 (which assures every request carries a `user_id`) to give uniform enforcement across anon/free/Operate tiers. Respects the "never rewrite" constraint via surgical edits to `v2-chat/route.ts` and `api-error.ts`.

Output: One migration (manual-apply flagged), one server library (`quota.ts`), one extended error helper, one route wire-up, one client overlay component, one client intercept hook edit, and three verification surfaces (2 Vitest + 1 curl smoke).

**CONTEXT.md correction applied:** Tier window is rolling 24h via `now() - interval '24 hours'` in the RPC — simpler query, gentler UX than hard UTC midnight reset.

**Manual step flagged:** Supabase migrations are manual via dashboard SQL editor (PROJECT.md). Plan 07 (enablement) waits on this being applied before flipping `PHASE_1_GATE_ENABLED=true`.
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
@.planning/phases/01-security-cost-control/01-01-auth-gate-PLAN.md

<interfaces>
<!-- Extracted from Plan 01 + existing codebase so the executor does NOT need to re-read each file. -->

From app/src/lib/auth-guard.ts (CREATED IN PLAN 01 — consume, do not modify):
```typescript
export type LogSource = "user" | "cron" | "system";
export interface AuthContext {
  user: { id: string; is_anonymous: boolean; email?: string | null } | null;
  isCron: boolean;
  source: LogSource;
}
export async function requireUser(request: Request):
  Promise<{ ctx: AuthContext; error?: never } | { ctx?: never; error: Response }>;
```

From app/src/lib/api-error.ts (EXTENDED IN PLAN 01 — further extend, surgical):
```typescript
export interface ApiErrorBody {
  error: string;
  code: "RATE_LIMITED" | "BAD_REQUEST" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR" | "PAYLOAD_TOO_LARGE";
  tier?: "anonymous" | "free" | "operate";
  resetAt?: string;
  suggest?: "sign_in" | "upgrade_operate" | "wait" | "shorten_thread";
}
export function apiError(message: string, code: ApiErrorBody["code"], status: number): Response;
export function rateLimited(): Response;  // OLD signature — keep backward-compatible
export function unauthorized(message?: string): Response;
export function badRequest(message?: string): Response;
```

From app/src/__tests__/fixtures/mock-supabase.ts (CREATED IN PLAN 01 — reuse):
- `mockSupabaseAnonSession(userId)` — is_anonymous: true
- `mockSupabaseAuthedSession(userId, { tier })` — returns subscriptions row for tier
- `mockSupabaseNoSession()`

From app/src/lib/supabase-admin.ts (existing):
```typescript
export function createAdminSupabase(): SupabaseClient;
// Service-role client — used for cron paths and RPC calls that bypass RLS.
```

From app/package.json — migration numbering:
- Current latest: `app/supabase/migrations/015_weekly_reviews_v2.sql`
- Next: `016_user_quotas.sql` (this plan)

Voice Bible §02 (from docs/voice-bible.md) — BANNED phrases on quota copy:
- No "unlock", "upgrade now", "limited time"
- No shame framing ("you've exceeded…")
- Per-tier copy locked by CONTEXT.md:
  - anonymous: "The free ground holds five conversations a day. Drop your email and the rest opens."
  - free: "You've worked through today's ten. Tomorrow restarts, or Operate lifts the line."
    (Note: CONTEXT wrote "ten" as illustrative; actual number is 50/day per SEC-02 spec. Pick the 50 number — copy becomes "You've worked through today's fifty.")
  - operate: "You've hit today's ceiling. Reach out — we'll figure it out together."

Supabase RPC pattern (existing — see `increment_user_sheet_streak` in `015_weekly_reviews_v2.sql`):
- `CREATE OR REPLACE FUNCTION ...(args) RETURNS {...} LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN ... END; $$;`
- Called server-side via `supabase.rpc('name', { args })`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Migration 016 + quota.ts library + unit tests</name>
  <files>
    app/supabase/migrations/016_user_quotas.sql,
    app/src/lib/quota.ts,
    app/src/lib/api-error.ts,
    app/src/lib/quota.test.ts,
    app/src/__tests__/fixtures/mock-anthropic.ts
  </files>
  <behavior>
    - Migration creates `user_quotas_tiers` with 3 seed rows: (tier TEXT PK, req_limit INT, token_limit INT).
    - Migration creates `user_quota_ledger` (user_id UUID, route TEXT, day_bucket DATE or window_start TIMESTAMPTZ, req_count INT, token_count INT).
    - Migration creates `increment_quota_and_check(p_user_id UUID, p_route TEXT, p_tokens INT) RETURNS TABLE(allowed BOOLEAN, tier TEXT, reset_at TIMESTAMPTZ, req_count INT, token_count INT)` — atomic upsert + check against tier limit via rolling 24h window.
    - `resolveTier(userId)`: queries auth.users + subscriptions; returns 'operate' | 'free' | 'anonymous'. Anon JWT claim `is_anonymous: true` → 'anonymous'. Paid subscription → 'operate'. Else 'free'.
    - `checkAndIncrement(userId, route, tokens)`: calls RPC; returns `{ allowed: true }` or `{ allowed: false, tier, resetAt, suggest }`.
    - `rateLimited({tier, resetAt, suggest})` (new overload): returns 429 Response with structured body.
    - Fixture `mock-anthropic.ts` exports `mockAnthropicStream` + `mockAnthropicCountTokens` for reuse across plans 03/05/06.
  </behavior>
  <action>
Step 1 — Create `app/supabase/migrations/016_user_quotas.sql` (new file, ~90 lines):
  ```sql
  -- 016_user_quotas.sql
  -- Per-user tier-aware quota ledger (SEC-02).
  -- MANUAL APPLY: run via Supabase dashboard SQL editor (PROJECT.md constraint).
  -- Verify after apply: SELECT count(*) FROM user_quotas_tiers; -- expect 3

  -- Tier definitions (immutable seed)
  CREATE TABLE IF NOT EXISTS user_quotas_tiers (
    tier TEXT PRIMARY KEY,
    req_limit INT NOT NULL,
    token_limit INT NOT NULL
  );

  INSERT INTO user_quotas_tiers (tier, req_limit, token_limit) VALUES
    ('anonymous', 5,   10000),
    ('free',      50,  100000),
    ('operate',   500, 2000000)
  ON CONFLICT (tier) DO NOTHING;

  -- Ledger (rolling-24h window, per user/route)
  CREATE TABLE IF NOT EXISTS user_quota_ledger (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL,
    route       TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    req_count   INT NOT NULL DEFAULT 0,
    token_count INT NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS user_quota_ledger_user_window_idx
    ON user_quota_ledger (user_id, window_start DESC);

  ALTER TABLE user_quota_ledger ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users read own ledger"
    ON user_quota_ledger FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  -- Atomic increment + tier check. Called from server via supabase.rpc().
  -- Returns allowed=false with current tier + reset_at when cap exceeded.
  CREATE OR REPLACE FUNCTION increment_quota_and_check(
    p_user_id UUID,
    p_route   TEXT,
    p_tokens  INT
  ) RETURNS TABLE (
    allowed     BOOLEAN,
    tier        TEXT,
    reset_at    TIMESTAMPTZ,
    req_count   INT,
    token_count INT
  ) LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    v_tier       TEXT;
    v_req_limit  INT;
    v_token_limit INT;
    v_is_anon    BOOLEAN;
    v_has_sub    BOOLEAN;
    v_window_cutoff TIMESTAMPTZ := now() - interval '24 hours';
    v_row        user_quota_ledger%ROWTYPE;
    v_reset      TIMESTAMPTZ;
  BEGIN
    -- Resolve tier inline (cheaper than round-trip; mirrors lib/quota.ts resolveTier).
    SELECT COALESCE((raw_user_meta_data->>'is_anonymous')::boolean, is_anonymous, false)
      INTO v_is_anon FROM auth.users WHERE id = p_user_id;

    -- 'subscriptions' table may not exist yet in early deployments; guard with EXISTS.
    v_has_sub := false;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM subscriptions WHERE user_id = %L AND status = ''active'' AND tier = ''operate'')', p_user_id) INTO v_has_sub;
    END IF;

    v_tier := CASE
      WHEN v_has_sub THEN 'operate'
      WHEN v_is_anon THEN 'anonymous'
      ELSE 'free'
    END;

    SELECT req_limit, token_limit INTO v_req_limit, v_token_limit
      FROM user_quotas_tiers WHERE tier = v_tier;

    -- Find current window row (or create one).
    SELECT * INTO v_row FROM user_quota_ledger
      WHERE user_id = p_user_id AND route = p_route AND window_start > v_window_cutoff
      ORDER BY window_start DESC LIMIT 1 FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO user_quota_ledger (user_id, route, window_start, req_count, token_count)
        VALUES (p_user_id, p_route, now(), 0, 0) RETURNING * INTO v_row;
    END IF;

    v_reset := v_row.window_start + interval '24 hours';

    -- Would this request exceed the cap? (+1 req and +tokens)
    IF (v_row.req_count + 1) > v_req_limit
       OR (v_row.token_count + p_tokens) > v_token_limit THEN
      RETURN QUERY SELECT false, v_tier, v_reset, v_row.req_count, v_row.token_count;
      RETURN;
    END IF;

    -- Atomically record.
    UPDATE user_quota_ledger
      SET req_count = req_count + 1,
          token_count = token_count + p_tokens,
          updated_at = now()
      WHERE id = v_row.id
      RETURNING req_count, token_count INTO v_row.req_count, v_row.token_count;

    RETURN QUERY SELECT true, v_tier, v_reset, v_row.req_count, v_row.token_count;
  END;
  $$;

  GRANT EXECUTE ON FUNCTION increment_quota_and_check(UUID, TEXT, INT) TO authenticated, service_role;
  ```

Step 2 — Extend `app/src/lib/api-error.ts` (surgical) with a new overload for `rateLimited`:
  ```typescript
  // ADD below existing rateLimited() (keep old overload exported too for back-compat):
  export function rateLimited(opts?: {
    tier?: "anonymous" | "free" | "operate";
    resetAt?: string;
    suggest?: "sign_in" | "upgrade_operate" | "wait";
    message?: string;
  }): Response {
    const body: ApiErrorBody = {
      error: opts?.message ?? "Rate limit exceeded.",
      code: "RATE_LIMITED",
      tier: opts?.tier,
      resetAt: opts?.resetAt,
      suggest: opts?.suggest,
    };
    return Response.json(body, { status: 429, headers: { "Retry-After": "60" } });
  }
  ```
  Existing `rateLimited()` with no args must still return a 429 (back-compat). TypeScript overloads may be needed if the old exported type is `() => Response` — ensure calling sites compile.

Step 3 — Create `app/src/lib/quota.ts` (new file, ~80 lines):
  ```typescript
  import { createAdminSupabase } from "@/lib/supabase-admin";

  export type QuotaTier = "anonymous" | "free" | "operate";

  export interface QuotaCheckResult {
    allowed: boolean;
    tier: QuotaTier;
    resetAt: string;          // ISO
    reqCount: number;
    tokenCount: number;
    suggest?: "sign_in" | "upgrade_operate" | "wait";
  }

  function suggestFor(tier: QuotaTier): QuotaCheckResult["suggest"] {
    if (tier === "anonymous") return "sign_in";
    if (tier === "free")      return "upgrade_operate";
    return "wait";
  }

  /** Resolve tier from Supabase auth + subscriptions. Server-only. */
  export async function resolveTier(userId: string): Promise<QuotaTier> {
    const admin = createAdminSupabase();
    // is_anonymous lives on auth.users — service-role read only.
    const { data: user } = await admin.auth.admin.getUserById(userId);
    const isAnon = Boolean((user?.user as { is_anonymous?: boolean } | undefined)?.is_anonymous);
    if (isAnon) return "anonymous";

    // Check for active operate subscription (table may not exist pre-Phase-6 — graceful fallback).
    try {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("tier", "operate")
        .maybeSingle();
      if (sub) return "operate";
    } catch {
      // Table doesn't exist yet — ok, fall through to 'free'.
    }
    return "free";
  }

  /**
   * Atomically increments the ledger and checks against tier caps.
   * If allowed=false, returns {tier, resetAt, suggest} for 429 response body.
   */
  export async function checkAndIncrement(
    userId: string,
    route: string,
    tokens: number,
  ): Promise<QuotaCheckResult> {
    const admin = createAdminSupabase();
    const { data, error } = await admin.rpc("increment_quota_and_check", {
      p_user_id: userId,
      p_route: route,
      p_tokens: tokens,
    });

    if (error) {
      // Fail-open on DB hiccup: treat as allowed, log (observability plan 05 captures).
      console.error("[quota] RPC failed, allowing request:", error.message);
      return { allowed: true, tier: "free", resetAt: new Date(Date.now() + 86_400_000).toISOString(), reqCount: 0, tokenCount: 0 };
    }

    const row = Array.isArray(data) ? data[0] : data;
    const tier = (row?.tier as QuotaTier) ?? "free";
    const resetAt = typeof row?.reset_at === "string" ? row.reset_at : new Date(row?.reset_at ?? Date.now()).toISOString();

    return {
      allowed: Boolean(row?.allowed),
      tier,
      resetAt,
      reqCount: Number(row?.req_count ?? 0),
      tokenCount: Number(row?.token_count ?? 0),
      suggest: suggestFor(tier),
    };
  }
  ```

Step 4 — Create `app/src/__tests__/fixtures/mock-anthropic.ts` (new fixture, shared by plans 03/05/06 — introduce now since plan 02 doesn't strictly need it but quota route test may depend on it not blowing up when Anthropic is imported):
  ```typescript
  import { vi } from "vitest";

  /** Minimal MessageStream shape: async iterator + .abort() + .finalMessage(). */
  export function makeMockStream(opts: {
    text?: string;
    inputTokens?: number;
    outputTokens?: number;
    throwOnAbort?: boolean;
  } = {}) {
    const text = opts.text ?? "ok";
    const abortCtrl = new AbortController();
    let aborted = false;
    const abortFn = vi.fn(() => { aborted = true; abortCtrl.abort(); });
    async function* iter() {
      for (const ch of text.split("")) {
        if (aborted) break;
        yield { type: "content_block_delta", delta: { type: "text_delta", text: ch } };
      }
    }
    const stream = {
      controller: abortCtrl,
      abort: abortFn,
      [Symbol.asyncIterator]: () => iter(),
      finalMessage: async () => ({
        usage: { input_tokens: opts.inputTokens ?? 10, output_tokens: opts.outputTokens ?? 1 },
      }),
    };
    return { stream, abortFn, get aborted() { return aborted; } };
  }

  export function mockAnthropicCountTokens(value: number | number[]) {
    const list = Array.isArray(value) ? [...value] : [value];
    return vi.fn(async () => ({ input_tokens: list.length > 1 ? list.shift()! : list[0] }));
  }

  /** Build a full MockAnthropic class for vi.mock("@anthropic-ai/sdk", ...). */
  export function makeMockAnthropic(opts: Parameters<typeof makeMockStream>[0] = {}) {
    const { stream, abortFn } = makeMockStream(opts);
    const countTokens = mockAnthropicCountTokens(opts.inputTokens ?? 10);
    return {
      MockAnthropic: class {
        messages = {
          stream: vi.fn(() => stream),
          countTokens,
          create: vi.fn(async () => ({ content: [{ type: "text", text: opts.text ?? "ok" }] })),
        };
      },
      stream,
      abortFn,
      countTokens,
    };
  }
  ```

Step 5 — Write `app/src/lib/quota.test.ts` (TDD — 6 cases):
  - `resolveTier` with anon user → 'anonymous'.
  - `resolveTier` with paid subscription row → 'operate'.
  - `resolveTier` with no sub + not anon → 'free'.
  - `checkAndIncrement` with allowed=true RPC response → `{allowed: true}`.
  - `checkAndIncrement` with allowed=false RPC response → correct `suggest` by tier: anon→'sign_in', free→'upgrade_operate', operate→'wait'.
  - `checkAndIncrement` with RPC error → fails open (returns allowed=true, logs to console.error).
  - Mock `createAdminSupabase` via `vi.mock("@/lib/supabase-admin", ...)` and stub `admin.rpc(...)`.

Step 6 — Run unit tests:
  ```bash
  cd app && npm test -- src/lib/quota.test.ts
  ```
  All 6 cases green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/quota.test.ts</automated>
  </verify>
  <done>
    - `016_user_quotas.sql` exists and contains `increment_quota_and_check` function body with tier seed (3 rows).
    - `quota.ts` exports `resolveTier`, `checkAndIncrement`, types.
    - `api-error.ts` `rateLimited()` accepts optional `{tier, resetAt, suggest}` AND old zero-arg call still compiles.
    - `mock-anthropic.ts` fixture exports `makeMockAnthropic`, `makeMockStream`, `mockAnthropicCountTokens`.
    - `quota.test.ts` green (6 cases).
    - No regression in existing suite.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wire checkAndIncrement into v2-chat route + route.quota.test.ts</name>
  <files>
    app/src/app/api/v2-chat/route.ts,
    app/src/app/api/v2-chat/route.quota.test.ts
  </files>
  <behavior>
    - Route calls `checkAndIncrement(ctx.user.id, '/api/v2-chat', estimatedTokens)` AFTER `requireUser` (from Plan 01) and BEFORE `anthropic.messages.stream()`.
    - If `ctx.isCron` (cron bypass from Plan 01), skip quota check entirely.
    - If `ctx.user === null` and `PHASE_1_GATE_ENABLED !== 'true'`, skip quota check (pre-rollout shim; matches Plan 01 behavior).
    - If `allowed === false`: return `rateLimited({ tier, resetAt, suggest })` — 429 with structured body.
    - If allowed: proceed to existing Anthropic dispatch (preserve all existing logic).
    - Estimated-tokens parameter: compute a cheap heuristic (sum of message-body character lengths / 4 as a floor) BEFORE dispatch; Plan 05 adds post-hoc reconciliation from Anthropic `usage` response. Plan 02 increments by estimate; over-estimate is safer for cost control.
    - Anon-tier user on 6th request → 429 with `{tier:'anonymous', suggest:'sign_in'}`.
    - Free-tier user on 51st request → 429 with `{tier:'free', suggest:'upgrade_operate'}`.
    - Operate-tier user on 501st request → 429 with `{tier:'operate', suggest:'wait'}`.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/v2-chat/route.ts`. Locate the block from Plan 01:
  ```typescript
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const { ctx } = auth;
  // IP secondary rate-limit...
  if (await isRateLimited(ip)) return rateLimited();
  // ...existing body
  ```
  Insert quota check immediately AFTER the IP rate-limit, BEFORE `parseBody`:
  ```typescript
  import { checkAndIncrement } from "@/lib/quota";

  // ...existing requireUser + IP check...

  // ─── Per-user quota (SEC-02) ───
  // Skip for cron paths (service-attributed) and pre-enablement.
  if (!ctx.isCron && ctx.user) {
    const parsedForEst = await request.clone().json().catch(() => ({})) as { messages?: Array<{ content?: string }> };
    const estChars = (parsedForEst.messages ?? [])
      .reduce((sum, m) => sum + (typeof m?.content === "string" ? m.content.length : 0), 0);
    const estTokens = Math.max(100, Math.ceil(estChars / 4)); // floor of 100 to avoid free-riding zero-token spam
    const quota = await checkAndIncrement(ctx.user.id, "/api/v2-chat", estTokens);
    if (!quota.allowed) {
      return rateLimited({ tier: quota.tier, resetAt: quota.resetAt, suggest: quota.suggest });
    }
  }

  // ...existing parseBody + Anthropic stream dispatch
  ```
  The `request.clone().json()` is safe because Next streams allow one body read per clone. If existing `parseBody` already reads once, the clone ensures we don't double-consume the body. (Verify by checking that `parseBody` below still succeeds after the clone-based pre-read.)

Step 2 — Write `app/src/app/api/v2-chat/route.quota.test.ts` (TDD — 4 cases):
  - Anon session + quota RPC returns `{allowed: false, tier: 'anonymous', reset_at: ...}` → response status 429 with body `{code:'RATE_LIMITED', tier:'anonymous', suggest:'sign_in'}`.
  - Free session + quota returns `{allowed: false, tier: 'free', ...}` → 429 body has `tier:'free', suggest:'upgrade_operate'`.
  - Operate session + quota returns `{allowed: false, tier: 'operate', ...}` → 429 body has `tier:'operate', suggest:'wait'`.
  - Cron bearer (Authorization: `Bearer $CRON_SECRET`) → quota.rpc mock is NOT called; route proceeds.

  Test setup:
  ```typescript
  // Top of file
  import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
  import { mockSupabaseAnonSession, mockSupabaseAuthedSession } from "@/__tests__/fixtures/mock-supabase";
  import { makeMockAnthropic } from "@/__tests__/fixtures/mock-anthropic";

  const rpcMock = vi.fn();
  vi.mock("@/lib/supabase-admin", () => ({
    createAdminSupabase: () => ({
      rpc: rpcMock,
      auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { id: "x", is_anonymous: true } } }) } },
      from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }) }),
    }),
  }));

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.PHASE_1_GATE_ENABLED = "true";
    process.env.CRON_SECRET = "test-cron";
  });
  ```
  Each case sets `rpcMock.mockResolvedValueOnce({ data: [...], error: null })` and asserts the route response.

Step 3 — Run route tests:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/route.quota.test.ts
  ```
  All 4 cases green. Also re-run Plan 01's auth test to confirm no regression:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.quota.test.ts src/app/api/v2-chat/route.auth.test.ts</automated>
  </verify>
  <done>
    - v2-chat route contains `checkAndIncrement(ctx.user.id, '/api/v2-chat', estTokens)` after `requireUser`.
    - Cron paths skip quota (asserted by test).
    - 429 response body has exactly `{code, error, tier, resetAt, suggest}` — no extra fields.
    - All 4 quota test cases green AND Plan 01 auth tests still green.
    - Never-rewrite honored — surgical insertion only.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: QuotaCard component + useMessageStream 429 intercept + SEC-02 smoke</name>
  <files>
    app/src/components/shared/QuotaCard.tsx,
    app/src/hooks/useMessageStream.ts,
    app/scripts/smoke/sec-02-quota.sh
  </files>
  <behavior>
    - `<QuotaCard>` is a client component accepting `{ tier, resetAt, suggest, onDismiss }`. Renders Voice-Bible-compliant copy per tier. Styled like existing cards in `/whole`/`/today` — off-white / soft-shadow / rounded-2xl per design system. Accessible dismiss button.
    - `useMessageStream`: when fetch returns 429 with body `{code:'RATE_LIMITED', tier, resetAt, suggest}`, parses the JSON, sets hook state `{quotaLimit: {tier, resetAt, suggest}}`. Consumer renders `<QuotaCard>` overlay when state is non-null.
    - Existing stream-handling logic preserved. 429 is handled BEFORE `response.body` read attempts (since 429 bodies are JSON, not SSE).
    - Smoke script: creates an anon session via Supabase CLI (or uses a prebaked anon JWT from env), POSTs 5 messages through successfully, 6th returns 429. Skips gracefully if the auth bootstrap isn't available in CI env.
  </behavior>
  <action>
Step 1 — Create `app/src/components/shared/QuotaCard.tsx` (new file, ~80 lines):
  ```typescript
  "use client";
  import type { CSSProperties } from "react";

  export type QuotaTier = "anonymous" | "free" | "operate";
  export type QuotaSuggestion = "sign_in" | "upgrade_operate" | "wait";

  export interface QuotaCardProps {
    tier: QuotaTier;
    resetAt: string;
    suggest?: QuotaSuggestion;
    onDismiss?: () => void;
  }

  const COPY: Record<QuotaTier, { title: string; body: string; cta?: string }> = {
    anonymous: {
      title: "The free ground holds five conversations a day.",
      body: "Drop your email and the rest opens. Everything here so far stays.",
      cta: "Add email",
    },
    free: {
      title: "You've worked through today's fifty.",
      body: "Tomorrow restarts — or Operate lifts the line.",
      cta: "See Operate",
    },
    operate: {
      title: "You've hit today's ceiling.",
      body: "Reach out — we'll figure it out together.",
    },
  };

  export function QuotaCard({ tier, resetAt, suggest, onDismiss }: QuotaCardProps) {
    const copy = COPY[tier] ?? COPY.free;
    const reset = new Date(resetAt);
    const resets = isNaN(reset.getTime())
      ? "in the next day"
      : `at ${reset.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

    return (
      <div
        role="dialog"
        aria-label="Daily limit"
        style={overlay}
        onClick={(e) => { if (e.target === e.currentTarget) onDismiss?.(); }}
      >
        <div style={card}>
          <p style={title}>{copy.title}</p>
          <p style={body}>{copy.body}</p>
          <p style={meta}>Resets {resets}.</p>
          {copy.cta && suggest && (
            <button
              type="button"
              onClick={() => {
                if (suggest === "sign_in") document.dispatchEvent(new Event("huma:open-auth-modal"));
                if (suggest === "upgrade_operate") window.location.href = "/pricing";
                onDismiss?.();
              }}
              style={ctaBtn}
            >
              {copy.cta}
            </button>
          )}
          <button type="button" onClick={onDismiss} style={dismissBtn} aria-label="Close">
            ×
          </button>
        </div>
      </div>
    );
  }

  // Styling via plain-object CSS (matches existing card conventions; swap to Tailwind if project prefers).
  const overlay: CSSProperties = { position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.25)", zIndex: 50 };
  const card: CSSProperties = { background: "#faf8f3", border: "1px solid #e7e1d4", borderRadius: 16, padding: "28px 24px", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", position: "relative", fontFamily: "Cormorant Garamond, serif" };
  const title: CSSProperties = { fontSize: 22, lineHeight: 1.2, margin: 0, color: "#2a2a2a" };
  const body: CSSProperties = { marginTop: 12, fontSize: 16, lineHeight: 1.5, color: "#4a4a4a", fontFamily: "system-ui, sans-serif" };
  const meta: CSSProperties = { marginTop: 10, fontSize: 13, color: "#888", fontFamily: "system-ui, sans-serif" };
  const ctaBtn: CSSProperties = { marginTop: 18, background: "#2a2a2a", color: "#faf8f3", border: 0, padding: "10px 18px", borderRadius: 8, fontFamily: "system-ui, sans-serif", cursor: "pointer" };
  const dismissBtn: CSSProperties = { position: "absolute", top: 8, right: 12, background: "transparent", border: 0, fontSize: 22, cursor: "pointer", color: "#999" };
  ```
  Voice Bible compliance: no "unlock", no "upgrade now", no shame framing, no "limited time". Run strings through §02 banned-phrase review (manual — flagged in VALIDATION.md).

Step 2 — Surgical edit `app/src/hooks/useMessageStream.ts` (find the existing fetch path that POSTs to `/api/v2-chat` and streams the response). Add 429 short-circuit BEFORE the SSE iteration:
  ```typescript
  import { useState } from "react";
  // ...
  const [quotaLimit, setQuotaLimit] = useState<
    { tier: "anonymous" | "free" | "operate"; resetAt: string; suggest?: "sign_in" | "upgrade_operate" | "wait" } | null
  >(null);

  // Inside the streaming fetch (exact insertion point depends on current file structure):
  const response = await fetch("/api/v2-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (response.status === 429) {
    const body = await response.json().catch(() => null) as { tier?: string; resetAt?: string; suggest?: string } | null;
    if (body && (body.tier === "anonymous" || body.tier === "free" || body.tier === "operate")) {
      setQuotaLimit({ tier: body.tier, resetAt: body.resetAt ?? new Date(Date.now() + 86_400_000).toISOString(), suggest: body.suggest as "sign_in" | "upgrade_operate" | "wait" | undefined });
    }
    return;
  }

  // ...existing streaming path unchanged
  ```
  Expose `quotaLimit` + `setQuotaLimit` (for the consumer to clear on dismiss) from the hook. Keep the existing return shape additive — don't remove existing returns.

  If the consumer of this hook (likely chat UI in `/today` or `/start`) needs updating to render `<QuotaCard>`, that's a small follow-up in the same PR — locate the primary consumer via `grep -l "useMessageStream" app/src` and wire:
  ```tsx
  const { quotaLimit, setQuotaLimit, ...rest } = useMessageStream(...);
  {quotaLimit && <QuotaCard {...quotaLimit} onDismiss={() => setQuotaLimit(null)} />}
  ```

Step 3 — Create `app/scripts/smoke/sec-02-quota.sh` (new file):
  ```bash
  #!/usr/bin/env bash
  # SEC-02 smoke: per-user quota enforcement.
  # Usage: BASE_URL=https://huma-two.vercel.app ANON_JWT=<jwt> bash scripts/smoke/sec-02-quota.sh
  # Requires: ANON_JWT (signed anon Supabase JWT) OR COOKIE (with sb-access-token).
  set -euo pipefail

  BASE_URL="${BASE_URL:-http://localhost:3000}"
  ANON_JWT="${ANON_JWT:-}"
  COOKIE_HDR=""
  AUTH_HDR=""

  if [ -n "$ANON_JWT" ]; then
    AUTH_HDR="-H 'Cookie: sb-access-token=$ANON_JWT'"
  elif [ -n "${COOKIE:-}" ]; then
    AUTH_HDR="-H 'Cookie: $COOKIE'"
  else
    echo "SKIP: ANON_JWT/COOKIE not set (requires authenticated anon session)."
    exit 0
  fi

  # Fire 5 requests — expect any non-429 (allowed under anon cap).
  for i in 1 2 3 4 5; do
    code=$(eval curl -sS -o /dev/null -w '"%{http_code}"' -X POST "$BASE_URL/api/v2-chat" \
      -H '"Content-Type: application/json"' $AUTH_HDR \
      -d '"'"'{"messages":[{"role":"user","content":"hi"}]}'"'"')
    if [ "$code" = "429" ]; then
      echo "FAIL: hit 429 on request #$i (expected >=6 before cap)"
      exit 1
    fi
    echo "[$i/5] $code"
  done

  # 6th → expect 429 with RATE_LIMITED body.
  body=$(eval curl -sS -X POST "$BASE_URL/api/v2-chat" \
    -H '"Content-Type: application/json"' $AUTH_HDR \
    -d '"'"'{"messages":[{"role":"user","content":"hi"}]}'"'"')
  if ! echo "$body" | grep -q '"RATE_LIMITED"'; then
    echo "FAIL: 6th request did not return RATE_LIMITED body. Got: $body"
    exit 1
  fi
  if ! echo "$body" | grep -q '"tier"'; then
    echo "FAIL: missing 'tier' field in 429 body"
    exit 1
  fi

  echo "SEC-02 smoke: PASS"
  ```

Step 4 — Full suite confirmation:
  ```bash
  cd app && npm test
  ```
  All green; no existing test broken by the hook edit or the new component.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.quota.test.ts src/lib/quota.test.ts</automated>
  </verify>
  <done>
    - `<QuotaCard>` component exists with per-tier copy exactly matching CONTEXT.md-locked strings.
    - `useMessageStream` intercepts 429 → sets quotaLimit state → consumer can render QuotaCard.
    - Voice Bible §02 banned phrases absent (manual verify noted in VALIDATION.md).
    - `scripts/smoke/sec-02-quota.sh` exists; exits 0 on anon → 5-then-429 path; SKIPs cleanly if JWT missing.
    - Full Vitest suite green.
    - Never-rewrite: surgical edits only to `useMessageStream.ts`.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-02 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/quota.test.ts \
  src/app/api/v2-chat/route.quota.test.ts
```

Non-regression (Plan 01 + full suite):
```bash
cd app && npm test
```

Integration (staging, after Plan 07 applies 016 migration + flips flag):
```bash
BASE_URL=https://huma-two.vercel.app ANON_JWT=$ANON_JWT bash app/scripts/smoke/sec-02-quota.sh
```

**Manual gate (Plan 07 owns):**
- Apply `app/supabase/migrations/016_user_quotas.sql` via Supabase dashboard SQL editor.
- Verify: `SELECT count(*) FROM user_quotas_tiers` returns 3.
- Then flip `PHASE_1_GATE_ENABLED=true`.
</verification>

<success_criteria>
- SEC-02 fully delivered: tier-aware quota ledger + atomic RPC + client overlay.
- Three verification surfaces exist: 2 Vitest test files + 1 curl smoke.
- `016_user_quotas.sql` exists and is flagged as manual-apply in summary + Plan 07 gates on it.
- `mock-anthropic.ts` fixture introduced once — reused by plans 03/05/06.
- Client intercept (`useMessageStream`) is surgical; `<QuotaCard>` component drops in at consumers without layout break.
- Never-rewrite honored: no file rewritten; every edit is additive/inline.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-02-quota-ledger-SUMMARY.md` with:
- What was built (migration, quota lib, route wire-up, component, intercept, smoke)
- Manual step required: 016 migration must be applied via Supabase dashboard SQL editor (Plan 07 gates on this)
- Files modified (full list)
- CONTEXT.md clarification: window is rolling 24h (simpler query, gentler UX than UTC midnight)
- Downstream: Plan 05's observability wrapper will capture the 429 status in structured logs
</output>
