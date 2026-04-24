---
phase: 01-security-cost-control
plan: 01
type: execute
wave: 1
depends_on:
  - "01-00"
files_modified:
  - app/src/lib/api-error.ts
  - app/src/lib/auth-guard.ts
  - app/src/app/api/v2-chat/route.ts
  - app/src/app/api/sheet/route.ts
  - app/src/app/start/page.tsx
  - app/src/hooks/useStart.ts
  - app/src/components/shared/AuthModal.tsx
  - app/src/app/api/v2-chat/route.auth.test.ts
  - app/src/app/api/sheet/route.auth.test.ts
  - app/src/lib/auth-guard.test.ts
  - app/scripts/smoke/sec-01-curl.sh
autonomous: true
requirements:
  - SEC-01
must_haves:
  truths:
    - "Unauthenticated POST to /api/v2-chat returns 401 when PHASE_1_GATE_ENABLED=true"
    - "Unauthenticated POST to /api/sheet returns 401 when PHASE_1_GATE_ENABLED=true"
    - "Bearer $CRON_SECRET on /api/sheet bypasses auth and returns 200"
    - "Anonymous /start visitor gets a real user_id from signInAnonymously on mount"
    - "Upgrading anon to email via AuthModal preserves user_id (updateUser, not linkIdentity)"
    - "IP-based Upstash rate limit applies ONLY to anonymous or unauthenticated requests (not permanent users)"
    - "While PHASE_1_GATE_ENABLED=false, requireUser returns ctx.user=null and the request proceeds; observability logs tag this as source:'system' (see Plan 05a)"
  artifacts:
    - path: "app/src/lib/auth-guard.ts"
      provides: "requireUser(request) helper returning {user, isCron, source} or 401 Response; gate-aware"
      exports: ["requireUser", "type AuthContext", "type LogSource"]
      min_lines: 60
    - path: "app/src/lib/api-error.ts"
      provides: "extended ApiErrorBody with 'tier'/'resetAt'/'suggest' + unauthorized() helper + PAYLOAD_TOO_LARGE code"
      exports: ["apiError", "rateLimited", "unauthorized", "badRequest", "ApiErrorBody"]
    - path: "app/src/app/api/v2-chat/route.ts"
      provides: "v2-chat POST gated behind requireUser; IP fallback ONLY on anon/unauth paths; PHASE_1_GATE_ENABLED guard"
      contains: "requireUser"
    - path: "app/src/app/api/sheet/route.ts"
      provides: "sheet POST gated behind requireUser AFTER cron-secret short-circuit; IP fallback only for anon/unauth"
      contains: "requireUser"
    - path: "app/src/app/start/page.tsx"
      provides: "Client-side signInAnonymously on mount when no session exists"
      contains: "signInAnonymously"
    - path: "app/src/components/shared/AuthModal.tsx"
      provides: "Anon-aware email upgrade using supabase.auth.updateUser({ email })"
      contains: "updateUser"
    - path: "app/src/app/api/v2-chat/route.auth.test.ts"
      provides: "Vitest cases: no session → 401, valid session → 200-path, IP-limit anon-only"
      contains: "401"
    - path: "app/src/app/api/sheet/route.auth.test.ts"
      provides: "Vitest cases: no session → 401, cron bypass → proceeds, bad bearer → 401"
      contains: "CRON_SECRET"
    - path: "app/scripts/smoke/sec-01-curl.sh"
      provides: "Curl smoke: 401 on unauth, 200 on auth, 200 on cron-bearer"
      contains: "401"
  key_links:
    - from: "app/src/app/api/v2-chat/route.ts"
      to: "app/src/lib/auth-guard.ts"
      via: "requireUser(request) called before parseBody"
      pattern: "requireUser\\(request"
    - from: "app/src/app/api/sheet/route.ts"
      to: "app/src/lib/auth-guard.ts"
      via: "requireUser called AFTER isCron short-circuit"
      pattern: "isCron.*requireUser|requireUser.*isCron"
    - from: "app/src/app/start/page.tsx"
      to: "@supabase/ssr client"
      via: "useEffect calling supabase.auth.signInAnonymously() when !session"
      pattern: "signInAnonymously"
    - from: "app/src/components/shared/AuthModal.tsx"
      to: "supabase.auth.updateUser({ email })"
      via: "Anon-branch in magic-link submit path"
      pattern: "updateUser\\(\\s*\\{\\s*email"
    - from: "app/src/app/api/v2-chat/route.ts IP rate-limit"
      to: "ctx.user.is_anonymous OR !ctx.user condition"
      via: "if (!ctx.user || ctx.user.is_anonymous) { ip-limit }"
      pattern: "is_anonymous.*isRateLimited|!ctx\\.user.*isRateLimited"
---

<objective>
Gate `/api/v2-chat` and `/api/sheet` with Supabase auth. Unauthenticated requests return 401; cron bypass via `CRON_SECRET` Bearer still works. Every `/start` visitor becomes a real authenticated user via `signInAnonymously()` so quota ledger, rate-limits, and structured logs can key on `user_id` from the first keystroke. Anon → email upgrade in `AuthModal` uses `supabase.auth.updateUser({ email })` (NOT `linkIdentity`, which is OAuth-only per Supabase docs).

Purpose: Delivers SEC-01. This is the blocking foundation — every other SEC-XX plan assumes `user_id` is present. Without it: anon users have no quota key (SEC-02 breaks), no `user_id` field to log (SEC-05 degraded), and magic-link is still the only path into the product (time-to-first-aha regression).

Output: Two hardened routes (v2-chat, sheet), one auth-guard helper, anon session wire-up on /start, email-upgrade fix in AuthModal, and three verification surfaces (two Vitest route tests + one curl smoke script).

**Revision applied (Warning 1):** IP-based Upstash rate-limit now applies ONLY when the request is anonymous or unauthenticated. Permanent users are not penalized by the IP cap (their per-user Supabase ledger from Plan 02 covers them). This avoids penalizing shared-IP authenticated users (corporate networks, family WiFi).

**Revision applied (Warning 2):** While `PHASE_1_GATE_ENABLED=false` (the merge-safe pre-rollout window), `requireUser` returns `ctx.user=null` and lets the request proceed. Plan 05a's `observability.test.ts` asserts these null-user logs are tagged with `source:"system"` so they don't pollute per-user analytics. After Plan 07's flag flip, this branch is unreachable.
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
<!-- Extracted from codebase + Plan 00 fixtures so the executor does NOT re-read each file. -->

From app/src/lib/api-error.ts (CURRENT — extend, do not rewrite):
```typescript
export interface ApiErrorBody {
  error: string;
  code: "RATE_LIMITED" | "BAD_REQUEST" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR";
}
export function apiError(message: string, code: ApiErrorBody["code"], status: number): Response;
export function rateLimited(): Response;
export function badRequest(message?: string): Response;
```

From app/src/lib/supabase-server.ts:
```typescript
export async function createServerSupabase(): Promise<SupabaseClient>;
// Reads cookies() from next/headers. Used by 10 existing routes.
// supabase.auth.getUser() returns { data: { user }, error }.
```

From app/src/lib/schemas/parse.ts:
```typescript
export async function parseBody<T>(request: Request, schema: ZodSchema<T>):
  Promise<{ data: T; error?: never } | { data?: never; error: Response }>;
```

From app/src/app/api/sheet/route.ts — EXISTING cron pattern (lines 147-159, preserve shape):
```typescript
const cronSecret = process.env.CRON_SECRET;
const authHeader = request.headers.get("authorization");
const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
if (!isCron) {
  // IP rate-limit gate here
}
```

From app/src/app/api/v2-chat/route.ts — EXISTING POST entry (lines 12-23):
```typescript
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip") || "unknown";
  if (await isRateLimited(ip)) return rateLimited();
  const parsed = await parseBody(request, v2ChatSchema);
  // ...
}
```

From AuthModal.tsx (existing magic-link flow — extend, surgical):
- Currently calls `signInWithOtp({ email, options: { emailRedirectTo } })`.
- Must branch: if `session?.user?.is_anonymous === true` → `updateUser({ email })`; else keep existing `signInWithOtp` call.

Supabase docs (verified 2026-04-18):
- `auth.signInAnonymously()` returns authenticated user with JWT claim `is_anonymous: true`.
- `auth.updateUser({ email })` on an anon user triggers confirmation email and preserves user_id.
- `auth.linkIdentity({ provider })` is OAuth-only — do NOT use for email.

From Plan 00 (fixtures — already merged in Wave 0):
- `mockSupabaseNoSession()`, `mockSupabaseAnonSession(id)`, `mockSupabaseAuthedSession(id, {tier})`
- `makeMockAnthropic({...})` — for routes that import the SDK
- `captureConsoleLog()` — used by Plan 05a
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create auth-guard helper + extend api-error</name>
  <files>
    app/src/lib/api-error.ts,
    app/src/lib/auth-guard.ts,
    app/src/lib/auth-guard.test.ts
  </files>
  <behavior>
    - requireUser(request): returns { ctx: {user, isCron: false, source: "user"} } for valid Supabase session.
    - requireUser(request): returns { ctx: {user: null, isCron: true, source: "cron"} } when `Authorization: Bearer ${CRON_SECRET}` matches.
    - requireUser(request): returns { error: Response(401, UNAUTHORIZED) } when PHASE_1_GATE_ENABLED is truthy and neither auth succeeds.
    - requireUser(request): returns { ctx: {user: null, isCron: false, source: "system"} } when PHASE_1_GATE_ENABLED is falsy (pre-rollout shim — lets downstream plans merge behind the flag; source:"system" so observability logs don't masquerade as user activity).
    - unauthorized(message?): returns 401 Response with code:"UNAUTHORIZED".
    - ApiErrorBody extended with optional `tier`, `resetAt`, `suggest` (used by Plan 02 for 429) + new `PAYLOAD_TOO_LARGE` code.
  </behavior>
  <notes>
    **Pre-flag-flip behavior (Warning 2):** When `PHASE_1_GATE_ENABLED !== "true"`, `requireUser` returns `ctx.user=null, source:"system"`. Plan 05a's `observability.test.ts` asserts that these null-user log entries are tagged `source:"system"` (not `"user"`), so dashboards filtering by `source:"user"` see clean per-operator data. After Plan 07 flips the flag, this branch is unreachable in production.
  </notes>
  <action>
Step 1 — Extend `app/src/lib/api-error.ts` (surgical, do not rewrite):
  - Add optional fields to `ApiErrorBody`:
    ```typescript
    export interface ApiErrorBody {
      error: string;
      code: "RATE_LIMITED" | "BAD_REQUEST" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR" | "PAYLOAD_TOO_LARGE";
      tier?: "anonymous" | "free" | "operate";
      resetAt?: string;
      suggest?: "sign_in" | "upgrade_operate" | "wait" | "shorten_thread";
    }
    ```
  - Add `unauthorized(message = "Authentication required.")` returning `apiError(message, "UNAUTHORIZED", 401)`.
  - Keep existing `rateLimited()` signature working; Plan 02 will add a richer overload.

Step 2 — Create `app/src/lib/auth-guard.ts` (new file, ~60 lines):
  ```typescript
  import { createServerSupabase } from "@/lib/supabase-server";
  import { unauthorized } from "@/lib/api-error";

  export type LogSource = "user" | "cron" | "system";
  export interface AuthContext {
    user: { id: string; is_anonymous: boolean; email?: string | null } | null;
    isCron: boolean;
    source: LogSource;
  }

  /** Gate a route behind Supabase auth with CRON_SECRET bypass. */
  export async function requireUser(request: Request):
    Promise<{ ctx: AuthContext; error?: never } | { ctx?: never; error: Response }> {

    // 1. CRON_SECRET short-circuit (always allowed when match).
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return { ctx: { user: null, isCron: true, source: "cron" } };
    }

    // 2. Feature-flag escape hatch. While PHASE_1_GATE_ENABLED is false, we let traffic through
    //    with source:"system" so observability logs (Plan 05a) don't masquerade as user activity.
    //    This branch is unreachable in production after Plan 07 flips the flag.
    const gateEnabled = process.env.PHASE_1_GATE_ENABLED === "true";

    // 3. Supabase session check.
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      if (!gateEnabled) {
        // Pre-enablement shim: source:"system" (NOT "user") so dashboards stay clean.
        return { ctx: { user: null, isCron: false, source: "system" } };
      }
      return { error: unauthorized("Sign in required.") };
    }

    return {
      ctx: {
        user: {
          id: user.id,
          is_anonymous: Boolean((user as { is_anonymous?: boolean }).is_anonymous),
          email: user.email ?? null,
        },
        isCron: false,
        source: "user",
      },
    };
  }
  ```

Step 3 — Write `app/src/lib/auth-guard.test.ts` (TDD):
  ```typescript
  import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
  import { mockSupabaseNoSession, mockSupabaseAnonSession } from "@/__tests__/fixtures/mock-supabase";

  describe("requireUser", () => {
    const origGate = process.env.PHASE_1_GATE_ENABLED;
    const origCron = process.env.CRON_SECRET;
    afterEach(() => {
      vi.resetModules();
      process.env.PHASE_1_GATE_ENABLED = origGate;
      process.env.CRON_SECRET = origCron;
    });

    it("returns ctx with source:'system' when gate disabled and no session", async () => {
      process.env.PHASE_1_GATE_ENABLED = "false";
      vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()) }));
      const { requireUser } = await import("./auth-guard");
      const result = await requireUser(new Request("http://localhost/api/x"));
      expect("error" in result).toBe(false);
      if ("ctx" in result) {
        expect(result.ctx.user).toBeNull();
        expect(result.ctx.source).toBe("system"); // NOT "user" (Warning 2)
      }
    });

    it("returns 401 when gate enabled and no session", async () => {
      process.env.PHASE_1_GATE_ENABLED = "true";
      vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()) }));
      const { requireUser } = await import("./auth-guard");
      const result = await requireUser(new Request("http://localhost/api/x"));
      expect("error" in result).toBe(true);
      if ("error" in result) expect(result.error.status).toBe(401);
    });

    it("CRON_SECRET bearer returns ctx with isCron:true source:'cron'", async () => {
      process.env.CRON_SECRET = "cron-test";
      const { requireUser } = await import("./auth-guard");
      const req = new Request("http://localhost/api/x", { headers: { Authorization: "Bearer cron-test" } });
      const result = await requireUser(req);
      expect("ctx" in result && result.ctx.isCron).toBe(true);
      if ("ctx" in result) expect(result.ctx.source).toBe("cron");
    });

    it("anonymous Supabase user returns ctx.user.is_anonymous=true source:'user'", async () => {
      vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: () => Promise.resolve(mockSupabaseAnonSession("anon-1")) }));
      const { requireUser } = await import("./auth-guard");
      const result = await requireUser(new Request("http://localhost/api/x"));
      if (!("ctx" in result)) throw new Error("expected ctx");
      expect(result.ctx.user?.id).toBe("anon-1");
      expect(result.ctx.user?.is_anonymous).toBe(true);
      expect(result.ctx.source).toBe("user");
    });
  });
  ```

Step 4 — Run tests:
  ```bash
  cd app && npm test -- src/lib/auth-guard.test.ts
  ```
  Expected: 4 cases green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/auth-guard.test.ts</automated>
  </verify>
  <done>
    - `auth-guard.ts` exports `requireUser`, `AuthContext`, `LogSource`.
    - Pre-flag-flip path returns source:"system" (NOT "user") — dashboards stay clean.
    - `api-error.ts` exports `unauthorized()` AND `ApiErrorBody` accepts optional `tier`/`resetAt`/`suggest`/new `PAYLOAD_TOO_LARGE` code.
    - `auth-guard.test.ts` green (4 cases).
    - No existing test broken: `cd app && npm test` passes the rest of the suite.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Gate v2-chat and sheet routes; IP-limit anon-only</name>
  <files>
    app/src/app/api/v2-chat/route.ts,
    app/src/app/api/sheet/route.ts,
    app/src/app/api/v2-chat/route.auth.test.ts,
    app/src/app/api/sheet/route.auth.test.ts
  </files>
  <behavior>
    - POST /api/v2-chat without session: 401 with `{code:"UNAUTHORIZED"}` when gate enabled; passes through with source:"system" when gate disabled.
    - POST /api/v2-chat with valid permanent session: proceeds past auth WITHOUT IP-rate-limit applying (Warning 1 fix).
    - POST /api/v2-chat with anonymous OR unauthenticated session: IP-rate-limit applies as secondary defense.
    - POST /api/sheet without session and no cron bearer: 401.
    - POST /api/sheet with valid CRON bearer: BYPASSES auth AND IP-limit, still reaches parseBody (cron path unaffected).
    - POST /api/sheet with bogus Bearer (not CRON_SECRET, not Supabase): 401.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/api/v2-chat/route.ts` (preserve existing handler body):
  Immediately after the ANTHROPIC_API_KEY check, add:
  ```typescript
  import { requireUser } from "@/lib/auth-guard";

  export async function POST(request: Request) {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

    // ─── Auth gate (SEC-01) ───
    const auth = await requireUser(request);
    if (auth.error) return auth.error;
    const { ctx } = auth;
    // ctx.user may still be null while PHASE_1_GATE_ENABLED=false — don't crash later code.

    // ─── IP secondary (Warning 1: anon/unauth only — permanent users not penalized) ───
    if (!ctx.user || ctx.user.is_anonymous) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip") || "unknown";
      if (await isRateLimited(ip)) return rateLimited();
    }

    // ...existing body unchanged (parseBody, anthropic.messages.stream, ReadableStream)
  }
  ```
  Do NOT touch the Anthropic stream block (that's Plans 05c/06). Leave `ctx` referenced (downstream plans consume it).

Step 2 — Surgical edit `app/src/app/api/sheet/route.ts` (preserve cron pattern):
  Replace the literal `cronSecret`/`authHeader`/`isCron` block (lines 147-159) with:
  ```typescript
  import { requireUser } from "@/lib/auth-guard";

  export async function POST(request: Request) {
    if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

    const auth = await requireUser(request);
    if (auth.error) return auth.error;
    const { ctx } = auth;

    // IP secondary: skip cron AND skip permanent users (Warning 1).
    if (!ctx.isCron && (!ctx.user || ctx.user.is_anonymous)) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip") || "unknown";
      if (await isRateLimited(ip)) return rateLimited();
    }

    // ...existing body unchanged (parseBody, sheet compile, JSON response)
  }
  ```
  Remove the now-redundant cron block — `requireUser` owns that logic.

Step 3 — Write `app/src/app/api/v2-chat/route.auth.test.ts` (TDD):
  - `vi.mock("@/lib/supabase-server", ...)` with `mockSupabaseNoSession` + gate enabled → POST returns 401.
  - `vi.mock("@/lib/supabase-server", ...)` with `mockSupabaseAnonSession("anon-1")` + gate enabled → POST passes auth (assert status !== 401).
  - `vi.mock("@/lib/supabase-server", ...)` with `mockSupabaseAuthedSession("u-1", {tier:"free"})` + IP-limit MOCKED to fail (`isRateLimited → true`) → POST still proceeds (NOT 429) because permanent users skip IP-limit (Warning 1).
  - Pattern: lazy-import route after mocks.
  - Mock `@anthropic-ai/sdk` via `makeMockAnthropic()` and `@/lib/rate-limit`.

Step 4 — Write `app/src/app/api/sheet/route.auth.test.ts` (TDD):
  - No session + no bearer → 401.
  - Bearer = `process.env.CRON_SECRET` (set in beforeAll) → bypasses, status !== 401.
  - Bearer = `Bearer wrong-secret` → 401.
  - Valid anon session → status !== 401.
  - Permanent user + IP-limit mocked to fail → status !== 429 (Warning 1).

Step 5 — Run route tests:
  ```bash
  cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts src/app/api/sheet/route.auth.test.ts
  ```
  Both files green.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts src/app/api/sheet/route.auth.test.ts</automated>
  </verify>
  <done>
    - Both route files import and call `requireUser` before any Anthropic dispatch.
    - IP rate-limit runs ONLY for anonymous/unauthenticated requests (Warning 1).
    - Both auth tests green (≥4 cases per file including Warning 1 case).
    - `cd app && npm test` still passes existing suite — no regressions.
    - Never-rewrite constraint honored: surgical edits only.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Wire anon sign-in on /start + AuthModal anon→email upgrade + SEC-01 curl smoke</name>
  <files>
    app/src/app/start/page.tsx,
    app/src/hooks/useStart.ts,
    app/src/components/shared/AuthModal.tsx,
    app/scripts/smoke/sec-01-curl.sh
  </files>
  <behavior>
    - First mount of /start with no session: calls `supabase.auth.signInAnonymously()`; subsequent reloads see existing session and do NOT re-anon.
    - AuthModal email submit with an anonymous session: calls `supabase.auth.updateUser({ email })` (preserves user_id).
    - AuthModal email submit with no session (signed out): keeps existing `signInWithOtp` path unchanged.
    - Smoke script: curl unauth v2-chat → 401, curl unauth sheet → 401, curl sheet with Bearer CRON_SECRET → NOT 401.
  </behavior>
  <action>
Step 1 — Surgical edit `app/src/app/start/page.tsx` (or wherever /start client entry mounts).
  Locate the client-component. Find the `useEffect` on mount (or add one). Insert anon-bootstrap:
  ```typescript
  "use client";
  import { useEffect } from "react";
  import { getSupabaseBrowser } from "@/lib/supabase";

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || session) return;
      const { error } = await supabase.auth.signInAnonymously();
      if (error) console.error("[start] anon sign-in failed:", error);
    })();
    return () => { cancelled = true; };
  }, []);
  ```
  If `/start/page.tsx` is a server component that renders a `StartClient`, place the effect in the client wrapper. Grep `app/src/app/start/page.tsx` first to confirm the structure.

Step 2 — Surgical edit `app/src/components/shared/AuthModal.tsx`. Locate the existing magic-link submit handler. Branch on `is_anonymous`:
  ```typescript
  const { data: { session } } = await supabase.auth.getSession();
  const isAnon = session?.user?.is_anonymous === true;

  if (isAnon) {
    const { error } = await supabase.auth.updateUser({ email });
    submitError = error?.message ?? null;
  } else {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/today` },
    });
    submitError = error?.message ?? null;
  }
  ```
  Keep all existing UI state. Surgical replacement of the SDK call only.

Step 3 — Create `app/scripts/smoke/sec-01-curl.sh`:
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  BASE_URL="${BASE_URL:-http://localhost:3000}"
  CRON_SECRET="${CRON_SECRET:-}"

  echo "[1/3] Unauth /api/v2-chat → expect 401"
  code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v2-chat" \
    -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}')
  [ "$code" = "401" ] || { echo "FAIL: got $code"; exit 1; }

  echo "[2/3] Unauth /api/sheet → expect 401"
  code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/sheet" \
    -H "Content-Type: application/json" -d '{}')
  [ "$code" = "401" ] || { echo "FAIL: got $code"; exit 1; }

  if [ -n "$CRON_SECRET" ]; then
    echo "[3/3] Cron bearer /api/sheet → expect NOT 401"
    code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/sheet" \
      -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" -d '{}')
    [ "$code" != "401" ] || { echo "FAIL: cron bearer still 401"; exit 1; }
  else
    echo "[3/3] CRON_SECRET not set in env — skipping cron-bypass smoke."
  fi

  echo "SEC-01 smoke: PASS"
  ```

Step 4 — Run full test suite to confirm no regressions:
  ```bash
  cd app && npm test
  ```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts src/app/api/sheet/route.auth.test.ts src/lib/auth-guard.test.ts</automated>
  </verify>
  <done>
    - `/start` client bootstrap calls `signInAnonymously()` exactly once per cold session.
    - AuthModal branches on `is_anonymous` and calls `updateUser({ email })` in that branch.
    - `scripts/smoke/sec-01-curl.sh` exists.
    - Full Vitest suite green: `cd app && npm test` returns 0.
    - Surgical edits only.
  </done>
</task>

</tasks>

<verification>
**Overall Phase 01-01 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/lib/auth-guard.test.ts \
  src/app/api/v2-chat/route.auth.test.ts \
  src/app/api/sheet/route.auth.test.ts
```

Integration (staging, after Plan 07 enables flag):
```bash
BASE_URL=https://huma-two.vercel.app CRON_SECRET=$CRON_SECRET bash app/scripts/smoke/sec-01-curl.sh
```

Non-regression:
```bash
cd app && npm test
```
</verification>

<success_criteria>
- SEC-01 fully delivered: two routes gated, anon bootstrap live, AuthModal upgrade fixed.
- IP rate-limit anon/unauth-only (Warning 1).
- Pre-flag-flip path tagged source:"system" (Warning 2).
- Three verification surfaces exist: 2 Vitest route tests + 1 curl smoke script.
- `auth-guard.ts` is the single chokepoint; downstream plans (02, 05a/b/c) consume `ctx`.
- PHASE_1_GATE_ENABLED=false means changes are merge-safe.
</success_criteria>

<output>
After completion, create `.planning/phases/01-security-cost-control/01-01-auth-gate-SUMMARY.md` with:
- What was built (requireUser, anon bootstrap, AuthModal branch)
- Key decisions: PHASE_1_GATE_ENABLED escape hatch returns source:"system" (Warning 2); IP-limit anon/unauth-only (Warning 1)
- Corrections from CONTEXT.md applied: `updateUser({ email })` instead of `linkIdentity`
- Files modified (full list)
- Downstream: Plans 02 + 05a/b/c import `requireUser` and consume `ctx.user` / `ctx.source`
</output>
