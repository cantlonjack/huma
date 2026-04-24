---
phase: 01-security-cost-control
plan: 02
type: execute
wave: 1
depends_on:
  - "01-00"
files_modified:
  - .planning/phases/01-security-cost-control/01-CONTEXT.md
  - app/supabase/migrations/016_user_quotas.sql
  - app/src/lib/api-error.ts
  - app/src/lib/quota.ts
  - app/src/components/shared/QuotaCard.tsx
  - app/src/hooks/useMessageStream.ts
  - app/src/lib/quota.test.ts
  - app/scripts/smoke/sec-02-quota.sh
autonomous: true
requirements:
  - SEC-02
must_haves:
  truths:
    - "CONTEXT.md Decisions section clarifies: free-tier 'ten' was illustrative; spec and implementation is 50/day"
    - "Anonymous-tier user hits 429 on 6th request of the day with {tier:'anonymous', suggest:'sign_in', resetAt}"
    - "Free-tier user hits 429 on 51st request of the day with {tier:'free', suggest:'upgrade_operate', resetAt}"
    - "Operate-tier user hits 429 on 501st request of the day with {tier:'operate', suggest:'wait', resetAt}"
    - "checkAndIncrement(userId, route, inputTokens) accepts accurate inputTokens from Plan 03's budgetCheck — NO internal estimation heuristic (Blocker 6)"
    - "Ledger increments atomically by inputTokens via increment_quota_and_check() RPC; output_tokens reconciled post-stream in Plan 05c"
    - "Tier resolution uses auth.users.is_anonymous + subscriptions.tier (falls back to 'anonymous')"
    - "Client intercepts 429 and renders <QuotaCard> with Voice-Bible-compliant per-tier copy ('fifty' for free tier — matches CONTEXT.md clarification)"
    - "CRON_SECRET path bypasses quota entirely (ctx.isCron === true short-circuits)"
  artifacts:
    - path: ".planning/phases/01-security-cost-control/01-CONTEXT.md"
      provides: "Appended clarification note resolving 'ten' vs 50/day discrepancy"
      contains: "illustrative"
    - path: "app/supabase/migrations/016_user_quotas.sql"
      provides: "user_quotas_tiers seed (3 rows, free=50) + user_quota_ledger table + increment_quota_and_check() RPC"
      contains: "increment_quota_and_check"
      min_lines: 60
    - path: "app/src/lib/quota.ts"
      provides: "resolveTier(userId), checkAndIncrement(userId, route, inputTokens) server helpers"
      exports: ["resolveTier", "checkAndIncrement", "type QuotaTier", "type QuotaCheckResult"]
      min_lines: 60
    - path: "app/src/lib/api-error.ts"
      provides: "Extended rateLimited() overload accepting {tier, resetAt, suggest}"
      exports: ["rateLimited"]
    - path: "app/src/components/shared/QuotaCard.tsx"
      provides: "Client overlay component rendered on 429; tier-aware copy ('fifty' for free)"
      contains: "fifty"
      min_lines: 50
    - path: "app/src/hooks/useMessageStream.ts"
      provides: "Fetch wrapper that parses 429 JSON body and surfaces QuotaCard state"
      contains: "RATE_LIMITED"
    - path: "app/scripts/smoke/sec-02-quota.sh"
      provides: "Anon session → 5 requests OK → 6th returns 429"
      contains: "429"
  key_links:
    - from: "Plan 03 budgetCheck()"
      to: "Plan 02 checkAndIncrement(userId, route, inputTokens)"
      via: "Plan 03 passes budget.inputTokens (accurate) to checkAndIncrement; v2-chat/sheet wire this in the route ordering"
      pattern: "checkAndIncrement\\([^,]+,\\s*[^,]+,\\s*[^)]+inputTokens"
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
Deliver SEC-02: per-user token + request budget enforced through a Supabase-backed ledger, with tiered limits (anonymous: 5 req / 10K tokens/day, **free: 50 req / 100K tokens/day**, Operate: 500 req / 2M tokens/day). Over-limit returns 429 with a structured body carrying `tier`, `resetAt`, `suggest`. The client intercepts 429 and renders a Voice-Bible-compliant `<QuotaCard>` overlay — no silent drops, no shame copy.

Purpose: Prevents surprise Anthropic bills from a single cookie-clearing anon rotation or a runaway client. Pairs with SEC-01 (which assures every request carries a `user_id`) and SEC-03 (which provides the accurate `inputTokens` this plan consumes).

**Blocker 5 resolved:** CONTEXT.md's free-tier copy example said "ten" — user has clarified this was illustrative. Actual spec is 50/day. Plan 02 Task 0 appends a one-line note to CONTEXT.md; QuotaCard copy uses "fifty" (matching the 50 spec).

**Blocker 6 resolved:** `checkAndIncrement` now accepts `inputTokens` as an argument (not computed via cheap `estChars/4` heuristic). Plan 03's `budgetCheck()` runs first in the request flow and passes the accurate `inputTokens` from `client.messages.countTokens()`. This eliminates the 3x undercount that would have made SEC-02's cost-control promise hollow. Output tokens are reconciled post-stream by a secondary `user_quota_ledger.update(req_id, +output_tokens)` write — owned by Plan 05c inside the v2-chat finally-path.

Output: One CONTEXT.md append, one migration (manual-apply flagged), one server library (`quota.ts`), one extended error helper, one client overlay component, one client intercept hook edit, one curl smoke script.

**Manual step flagged:** Supabase migrations are manual via dashboard SQL editor. Plan 07 waits on 016 being applied before flipping `PHASE_1_GATE_ENABLED=true`.

**Route wiring:** This plan does NOT edit `v2-chat/route.ts` directly. Plan 03 owns the route ordering (budgetCheck first, then checkAndIncrement with the resulting inputTokens). This keeps Plan 02 Wave 1 independent and defers the tight coupling to a single place.
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
@.planning/phases/01-security-cost-control/01-01-auth-gate-PLAN.md

<interfaces>
<!-- Extracted from Plan 01 + existing codebase. -->

From app/src/lib/auth-guard.ts (CREATED IN PLAN 01):
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
export function rateLimited(): Response;  // OLD signature — keep backward-compatible
export function unauthorized(message?: string): Response;
```

From Plan 00 fixtures (already merged in Wave 0):
- `mockSupabaseAnonSession(id)`, `mockSupabaseAuthedSession(id, {tier})`, `mockSupabaseNoSession()`
- `makeMockAnthropic({...})` — reused across plans

From app/src/lib/supabase-admin.ts (existing):
```typescript
export function createAdminSupabase(): SupabaseClient;
// Service-role client — used for cron paths and RPC calls that bypass RLS.
```

Migration numbering:
- Current latest: `app/supabase/migrations/015_weekly_reviews_v2.sql`
- Next: `016_user_quotas.sql` (this plan)

Voice Bible §02 — BANNED phrases on quota copy:
- No "unlock", "upgrade now", "limited time"
- No shame framing

**Tier copy (LOCKED per CONTEXT.md clarification):**
- anonymous: "The free ground holds five conversations a day. Drop your email and the rest opens."
- free: "You've worked through today's **fifty**. Tomorrow restarts, or Operate lifts the line."
- operate: "You've hit today's ceiling. Reach out — we'll figure it out together."

Supabase RPC pattern (existing — see `015_weekly_reviews_v2.sql`):
- `CREATE OR REPLACE FUNCTION ...(args) RETURNS {...} LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN ... END; $$;`
- Called server-side via `supabase.rpc('name', { args })`.

From Plan 03 (budgetCheck — will call into this plan's checkAndIncrement):
```typescript
// Plan 03 returns BudgetResult with .inputTokens (accurate, from countTokens()).
// Plan 03's route edit calls checkAndIncrement(userId, route, budget.inputTokens).
// This plan's checkAndIncrement signature MUST accept inputTokens (not derive internally).
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 0: Reconcile CONTEXT.md copy note (Blocker 5)</name>
  <files>
    .planning/phases/01-security-cost-control/01-CONTEXT.md
  </files>
  <behavior>
    - CONTEXT.md Decisions section (specifically "Rate-limit-hit UX — hard 429 + respectful client card") gets a one-line append clarifying the free-tier example.
    - No other edits — surgical append only.
  </behavior>
  <action>
Step 1 — Open `.planning/phases/01-security-cost-control/01-CONTEXT.md`. Locate the "Rate-limit-hit UX" decision block (around the free-tier line: "You've worked through today's ten...").

Step 2 — Append a single clarification line immediately after that block (before the next `###` heading). Exact content to add:
  ```markdown

  > **Clarification (2026-04-18):** The "ten" in the free-tier example copy above was illustrative wording drafted before the spec was locked. Actual spec is **50 requests / 100K tokens per day** for the free tier (matches SEC-02 enforcement). QuotaCard copy uses "fifty" to match.
  ```
  This is an append, not a rewrite — keep the original example intact so readers see the evolution. The clarification note is the source of truth.

Step 3 — `git diff .planning/phases/01-security-cost-control/01-CONTEXT.md` should show exactly one added block (~3 lines including blank lines). No other changes.

Step 4 — No automated test for a markdown append; verify via grep:
  ```bash
  grep -n "illustrative" .planning/phases/01-security-cost-control/01-CONTEXT.md
  ```
  Expect: one match.
  </action>
  <verify>
    <automated>grep -q "illustrative" .planning/phases/01-security-cost-control/01-CONTEXT.md && grep -q "fifty" .planning/phases/01-security-cost-control/01-CONTEXT.md</automated>
  </verify>
  <done>
    - CONTEXT.md has one appended clarification line under the "Rate-limit-hit UX" block.
    - grep for "illustrative" matches one line; grep for "fifty" matches one line.
    - No other CONTEXT.md edits.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 1: Migration 016 + quota.ts library + unit tests</name>
  <files>
    app/supabase/migrations/016_user_quotas.sql,
    app/src/lib/quota.ts,
    app/src/lib/api-error.ts,
    app/src/lib/quota.test.ts
  </files>
  <behavior>
    - Migration creates `user_quotas_tiers` with 3 seed rows: (tier TEXT PK, req_limit INT, token_limit INT). Free tier row: `('free', 50, 100000)`.
    - Migration creates `user_quota_ledger` (user_id UUID, route TEXT, req_id TEXT nullable, window_start TIMESTAMPTZ, req_count INT, token_count INT). `req_id` column is added for Plan 05c's secondary output-token write.
    - Migration creates `increment_quota_and_check(p_user_id UUID, p_route TEXT, p_input_tokens INT, p_req_id TEXT) RETURNS TABLE(allowed BOOLEAN, tier TEXT, reset_at TIMESTAMPTZ, req_count INT, token_count INT)` — atomic upsert + check against tier limit via rolling 24h window. The `p_req_id` parameter enables later reconciliation.
    - `resolveTier(userId)`: queries auth.users + subscriptions; returns 'operate' | 'free' | 'anonymous'.
    - `checkAndIncrement(userId, route, inputTokens, reqId?)`: accepts accurate `inputTokens` (from Plan 03's countTokens result); calls RPC; returns `{ allowed: true, ... }` or `{ allowed: false, tier, resetAt, suggest }`. Blocker 6: NO internal `estChars/4` heuristic.
    - `rateLimited({tier, resetAt, suggest})` (new overload): returns 429 Response with structured body.
  </behavior>
  <action>
Step 1 — Create `app/supabase/migrations/016_user_quotas.sql` (new file, ~90 lines):
  ```sql
  -- 016_user_quotas.sql
  -- Per-user tier-aware quota ledger (SEC-02).
  -- MANUAL APPLY: run via Supabase dashboard SQL editor (PROJECT.md constraint).
  -- Verify after apply:
  --   SELECT count(*) FROM user_quotas_tiers;  -- expect 3
  --   SELECT tier, req_limit, token_limit FROM user_quotas_tiers ORDER BY tier;
  --     expect: anonymous/5/10000, free/50/100000, operate/500/2000000

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

  CREATE TABLE IF NOT EXISTS user_quota_ledger (
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID NOT NULL,
    route         TEXT NOT NULL,
    req_id        TEXT,                    -- ULID; populated when caller provides it (Plan 05c reconciliation key)
    window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
    req_count     INT NOT NULL DEFAULT 0,
    token_count   INT NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS user_quota_ledger_user_window_idx
    ON user_quota_ledger (user_id, window_start DESC);
  CREATE INDEX IF NOT EXISTS user_quota_ledger_req_id_idx
    ON user_quota_ledger (req_id) WHERE req_id IS NOT NULL;

  ALTER TABLE user_quota_ledger ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users read own ledger"
    ON user_quota_ledger FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  CREATE OR REPLACE FUNCTION increment_quota_and_check(
    p_user_id      UUID,
    p_route        TEXT,
    p_input_tokens INT,
    p_req_id       TEXT DEFAULT NULL
  ) RETURNS TABLE (
    allowed     BOOLEAN,
    tier        TEXT,
    reset_at    TIMESTAMPTZ,
    req_count   INT,
    token_count INT
  ) LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    v_tier        TEXT;
    v_req_limit   INT;
    v_token_limit INT;
    v_is_anon     BOOLEAN;
    v_has_sub     BOOLEAN;
    v_window_cutoff TIMESTAMPTZ := now() - interval '24 hours';
    v_row         user_quota_ledger%ROWTYPE;
    v_reset       TIMESTAMPTZ;
  BEGIN
    SELECT COALESCE((raw_user_meta_data->>'is_anonymous')::boolean, is_anonymous, false)
      INTO v_is_anon FROM auth.users WHERE id = p_user_id;

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

    SELECT * INTO v_row FROM user_quota_ledger
      WHERE user_id = p_user_id AND route = p_route AND window_start > v_window_cutoff
      ORDER BY window_start DESC LIMIT 1 FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO user_quota_ledger (user_id, route, req_id, window_start, req_count, token_count)
        VALUES (p_user_id, p_route, p_req_id, now(), 0, 0) RETURNING * INTO v_row;
    END IF;

    v_reset := v_row.window_start + interval '24 hours';

    IF (v_row.req_count + 1) > v_req_limit
       OR (v_row.token_count + p_input_tokens) > v_token_limit THEN
      RETURN QUERY SELECT false, v_tier, v_reset, v_row.req_count, v_row.token_count;
      RETURN;
    END IF;

    UPDATE user_quota_ledger
      SET req_count = req_count + 1,
          token_count = token_count + p_input_tokens,
          req_id = COALESCE(p_req_id, req_id),
          updated_at = now()
      WHERE id = v_row.id
      RETURNING req_count, token_count INTO v_row.req_count, v_row.token_count;

    RETURN QUERY SELECT true, v_tier, v_reset, v_row.req_count, v_row.token_count;
  END;
  $$;

  GRANT EXECUTE ON FUNCTION increment_quota_and_check(UUID, TEXT, INT, TEXT) TO authenticated, service_role;
  ```

Step 2 — Extend `app/src/lib/api-error.ts` (surgical) with new `rateLimited` overload:
  ```typescript
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
  Zero-arg call `rateLimited()` must still return a 429 — keep back-compat.

Step 3 — Create `app/src/lib/quota.ts` (new file, ~80 lines):
  ```typescript
  import { createAdminSupabase } from "@/lib/supabase-admin";

  export type QuotaTier = "anonymous" | "free" | "operate";

  export interface QuotaCheckResult {
    allowed: boolean;
    tier: QuotaTier;
    resetAt: string;
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
    const { data: user } = await admin.auth.admin.getUserById(userId);
    const isAnon = Boolean((user?.user as { is_anonymous?: boolean } | undefined)?.is_anonymous);
    if (isAnon) return "anonymous";
    try {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("tier", "operate")
        .maybeSingle();
      if (sub) return "operate";
    } catch { /* subscriptions table may not exist yet — fall through */ }
    return "free";
  }

  /**
   * Atomically increments the ledger and checks against tier caps.
   *
   * **Blocker 6:** `inputTokens` is passed in by the caller (from Plan 03's
   * countTokens() result). This function does NOT perform internal estimation.
   *
   * `reqId` is optional; when provided, it's stored on the ledger row so Plan 05c
   * can reconcile output_tokens post-stream via a secondary update keyed on req_id.
   */
  export async function checkAndIncrement(
    userId: string,
    route: string,
    inputTokens: number,
    reqId?: string,
  ): Promise<QuotaCheckResult> {
    const admin = createAdminSupabase();
    const { data, error } = await admin.rpc("increment_quota_and_check", {
      p_user_id: userId,
      p_route: route,
      p_input_tokens: inputTokens,
      p_req_id: reqId ?? null,
    });

    if (error) {
      console.error("[quota] RPC failed, allowing request:", error.message);
      return {
        allowed: true,
        tier: "free",
        resetAt: new Date(Date.now() + 86_400_000).toISOString(),
        reqCount: 0, tokenCount: 0,
      };
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

Step 4 — Write `app/src/lib/quota.test.ts` (TDD — 7 cases):
  - `resolveTier` with anon user → 'anonymous'.
  - `resolveTier` with paid subscription → 'operate'.
  - `resolveTier` with no sub + not anon → 'free'.
  - `checkAndIncrement(u, r, 100)` RPC → `{allowed: true}` (assert RPC called with `p_input_tokens: 100`).
  - `checkAndIncrement(u, r, 100, "reqid-ulid")` passes `p_req_id` to RPC (Blocker 6 reconciliation support).
  - `checkAndIncrement` with allowed=false → correct `suggest` by tier (anon→'sign_in', free→'upgrade_operate', operate→'wait').
  - `checkAndIncrement` with RPC error → fails open (allowed=true).
  - Mock `createAdminSupabase` via `vi.mock("@/lib/supabase-admin", ...)` and stub `admin.rpc(...)`.

Step 5 — Run unit tests:
  ```bash
  cd app && npm test -- src/lib/quota.test.ts
  ```
  All 7 cases green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/quota.test.ts</automated>
  </verify>
  <done>
    - `016_user_quotas.sql` contains `increment_quota_and_check` with `p_input_tokens` and optional `p_req_id` params.
    - `quota.ts` exports `checkAndIncrement(userId, route, inputTokens, reqId?)` — NO internal estimation (Blocker 6).
    - `api-error.ts` `rateLimited()` accepts optional `{tier, resetAt, suggest}` AND old zero-arg call still compiles.
    - `quota.test.ts` green (7 cases including reqId passthrough).
    - No regression in existing suite.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: QuotaCard component + useMessageStream 429 intercept + SEC-02 smoke</name>
  <files>
    app/src/components/shared/QuotaCard.tsx,
    app/src/hooks/useMessageStream.ts,
    app/scripts/smoke/sec-02-quota.sh
  </files>
  <behavior>
    - `<QuotaCard>` is a client component accepting `{tier, resetAt, suggest, onDismiss}`. Renders per-tier copy — free tier uses "fifty" (matches CONTEXT.md clarification, Blocker 5). Styled like existing cards. Accessible dismiss.
    - `useMessageStream`: when fetch returns 429 with `{code:'RATE_LIMITED', tier, resetAt, suggest}`, parses JSON and sets hook state; consumer renders `<QuotaCard>` overlay.
    - Existing stream logic preserved. 429 handled BEFORE SSE body read.
    - Smoke script: anon session → 5 requests OK → 6th returns 429 with `RATE_LIMITED` body.

    **Route wiring deferred:** This plan does NOT edit `v2-chat/route.ts`. Plan 03 owns the route ordering (budgetCheck → checkAndIncrement(..., budget.inputTokens) → anthropic.messages.stream).
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
      // Blocker 5 resolution: "fifty" matches the 50/day spec (CONTEXT.md clarification 2026-04-18).
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
      <div role="dialog" aria-label="Daily limit" style={overlay}
        onClick={(e) => { if (e.target === e.currentTarget) onDismiss?.(); }}>
        <div style={card}>
          <p style={title}>{copy.title}</p>
          <p style={body}>{copy.body}</p>
          <p style={meta}>Resets {resets}.</p>
          {copy.cta && suggest && (
            <button type="button" onClick={() => {
              if (suggest === "sign_in") document.dispatchEvent(new Event("huma:open-auth-modal"));
              if (suggest === "upgrade_operate") window.location.href = "/pricing";
              onDismiss?.();
            }} style={ctaBtn}>{copy.cta}</button>
          )}
          <button type="button" onClick={onDismiss} style={dismissBtn} aria-label="Close">×</button>
        </div>
      </div>
    );
  }

  const overlay: CSSProperties = { position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.25)", zIndex: 50 };
  const card: CSSProperties = { background: "#faf8f3", border: "1px solid #e7e1d4", borderRadius: 16, padding: "28px 24px", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", position: "relative", fontFamily: "Cormorant Garamond, serif" };
  const title: CSSProperties = { fontSize: 22, lineHeight: 1.2, margin: 0, color: "#2a2a2a" };
  const body: CSSProperties = { marginTop: 12, fontSize: 16, lineHeight: 1.5, color: "#4a4a4a", fontFamily: "system-ui, sans-serif" };
  const meta: CSSProperties = { marginTop: 10, fontSize: 13, color: "#888", fontFamily: "system-ui, sans-serif" };
  const ctaBtn: CSSProperties = { marginTop: 18, background: "#2a2a2a", color: "#faf8f3", border: 0, padding: "10px 18px", borderRadius: 8, fontFamily: "system-ui, sans-serif", cursor: "pointer" };
  const dismissBtn: CSSProperties = { position: "absolute", top: 8, right: 12, background: "transparent", border: 0, fontSize: 22, cursor: "pointer", color: "#999" };
  ```
  Voice Bible compliance: no "unlock", no "upgrade now", no shame framing. Run strings through §02 banned-phrase review (manual — flagged in VALIDATION.md).

Step 2 — Surgical edit `app/src/hooks/useMessageStream.ts`. Add 429 short-circuit BEFORE SSE iteration:
  ```typescript
  import { useState } from "react";

  const [quotaLimit, setQuotaLimit] = useState<
    { tier: "anonymous" | "free" | "operate"; resetAt: string; suggest?: "sign_in" | "upgrade_operate" | "wait" } | null
  >(null);

  const response = await fetch("/api/v2-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (response.status === 429) {
    const body = await response.json().catch(() => null) as { tier?: string; resetAt?: string; suggest?: string } | null;
    if (body && (body.tier === "anonymous" || body.tier === "free" || body.tier === "operate")) {
      setQuotaLimit({
        tier: body.tier,
        resetAt: body.resetAt ?? new Date(Date.now() + 86_400_000).toISOString(),
        suggest: body.suggest as "sign_in" | "upgrade_operate" | "wait" | undefined,
      });
    }
    return;
  }
  // ...existing streaming path unchanged
  ```
  Expose `quotaLimit` + `setQuotaLimit` from the hook. Additive — don't remove existing returns.

Step 3 — Create `app/scripts/smoke/sec-02-quota.sh` (same as original plan; see file). Anon session → 5 OK → 6th returns 429 with RATE_LIMITED body.

Step 4 — Full suite confirmation:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/quota.test.ts</automated>
  </verify>
  <done>
    - `<QuotaCard>` uses "fifty" in free-tier copy (Blocker 5).
    - `useMessageStream` intercepts 429 → sets quotaLimit state.
    - Voice Bible §02 banned phrases absent (manual verify).
    - `scripts/smoke/sec-02-quota.sh` exists.
    - Full Vitest suite green.
    - Route wiring deferred to Plan 03.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-02 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/quota.test.ts
grep -q "illustrative" .planning/phases/01-security-cost-control/01-CONTEXT.md
```

Non-regression:
```bash
cd app && npm test
```

Integration (staging, after Plan 07 applies 016 + flips flag):
```bash
BASE_URL=https://huma-two.vercel.app ANON_JWT=$ANON_JWT bash app/scripts/smoke/sec-02-quota.sh
```

**Manual gate (Plan 07 owns):** Apply 016_user_quotas.sql via Supabase dashboard → verify 3 tier rows → flip PHASE_1_GATE_ENABLED.
</verification>

<success_criteria>
- SEC-02 fully delivered: tier-aware ledger + atomic RPC + client overlay.
- Blocker 5 resolved: CONTEXT.md clarification committed; QuotaCard says "fifty".
- Blocker 6 resolved: `checkAndIncrement(userId, route, inputTokens, reqId?)` accepts accurate token count — no internal estimation. Plan 03 passes the value from `budgetCheck().inputTokens`.
- Migration adds `req_id` column for Plan 05c's output-token reconciliation.
- Never-rewrite honored: surgical edits only.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-02-quota-ledger-SUMMARY.md` with:
- What was built (migration, quota lib, component, intercept, smoke, CONTEXT.md clarification)
- Manual step: 016 migration must be applied via Supabase dashboard (Plan 07 gates on this)
- Blocker 5 resolution: "fifty" in QuotaCard; CONTEXT.md clarification appended
- Blocker 6 resolution: checkAndIncrement accepts inputTokens arg; Plan 03 provides it via budgetCheck
- Files modified (full list)
- Downstream: Plan 03 owns route wiring (budgetCheck first, then checkAndIncrement). Plan 05c owns output_tokens reconciliation via req_id.
</output>
