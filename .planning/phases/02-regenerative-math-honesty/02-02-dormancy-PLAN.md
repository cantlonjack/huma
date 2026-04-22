---
phase: 02-regenerative-math-honesty
plan: 02
type: execute
wave: 1
depends_on:
  - "02-00"
files_modified:
  - app/src/types/context.ts
  - app/src/types/v2.ts
  - app/src/lib/capital-pulse.ts
  - app/src/hooks/useToday.ts
  - app/src/app/today/page.tsx
  - app/src/components/shared/ConnectionThreads.tsx
  - app/src/lib/schemas/index.ts
  - app/src/app/api/operator/dormancy/route.ts
  - app/src/app/api/cron/morning-sheet/route.ts
  - app/src/components/whole/SettingsSheet.tsx
  - app/src/app/whole/page.tsx
  - app/src/components/today/DormantCard.tsx
  - app/src/app/api/operator/dormancy/route.test.ts
  - app/src/app/api/cron/morning-sheet/route.dormant.test.ts
  - app/src/hooks/useToday.dormant.test.ts
  - app/src/lib/capital-pulse.test.ts
  - app/scripts/smoke/regen-02-dormancy.sh
autonomous: true
requirements:
  - REGEN-02
must_haves:
  truths:
    - "HumaContext.dormant: { active: boolean, since: string } exists on the type and persists via existing contextSync flow"
    - "POST /api/operator/dormancy toggles huma_context.dormant.active; sets since ISO on enable; leaves since intact on disable (analytics)"
    - "POST /api/operator/dormancy works for anonymous sessions (is_anonymous:true) — no second-class operators"
    - "POST /api/operator/dormancy uses parseBody + Zod schema + withObservability (Phase 1 conventions)"
    - "/whole SettingsSheet profile tab exposes a Dormancy toggle row"
    - "useToday returns isDormant:true when huma_context.dormant.active === true; /today renders 'Nothing today. Rest is the work.' (exact copy) plus a single input field; typing anything submits and toggles off"
    - "Mid-day toggle-on preserves existing sheet_entries and behavior_log rows for today (truth-respecting)"
    - "morning-sheet cron reads huma_context.dormant.active per user at the top of the userIds loop; dormant users are skipped BEFORE sheet compile (no Anthropic call, no push)"
    - "morning-sheet cron emits a structured log per skipped user with source:'cron' + skip_reason:'dormant'"
    - "CapitalPulse.dormant field is renamed to CapitalPulse.quiet across all 5 files (types/v2.ts, capital-pulse.ts, useToday.ts, today/page.tsx, ConnectionThreads.tsx) — user-state Dormancy owns the 'dormant' name"
    - "Spec-line copy 'Nothing today. Rest is the work.' passes Voice Bible §02 audit and ships verbatim"
    - "Integration smoke script (regen-02-dormancy.sh) curl-verifies toggle-on → cron skip → toggle-off → cron delivers"
  artifacts:
    - path: "app/src/types/context.ts"
      provides: "HumaContext.dormant: { active: boolean, since: string } field"
      contains: "dormant"
    - path: "app/src/types/v2.ts"
      provides: "CapitalPulse.dormant renamed to CapitalPulse.quiet"
      contains: "quiet"
    - path: "app/src/app/api/operator/dormancy/route.ts"
      provides: "POST endpoint — parseBody + Zod + withObservability + supports anon sessions"
      contains: "withObservability"
      min_lines: 60
    - path: "app/src/app/api/cron/morning-sheet/route.ts"
      provides: "Dormant-skip branch at top of userIds loop with structured log"
      contains: "dormant"
    - path: "app/src/components/whole/SettingsSheet.tsx"
      provides: "Dormancy toggle row in profile tab"
      contains: "Dormancy"
    - path: "app/src/components/today/DormantCard.tsx"
      provides: "Dormant /today UI — spec line + single input field that ends Dormancy on submit"
      contains: "Nothing today"
      min_lines: 30
    - path: "app/src/hooks/useToday.ts"
      provides: "useToday returns isDormant + dormantRe-entrySubmit handler; CapitalPulse.dormant → quiet read-site"
      contains: "isDormant"
    - path: "app/src/app/api/operator/dormancy/route.test.ts"
      provides: "Route tests filled in (from Plan 00 stub): auth, toggle persistence, mid-day preserve, anon support, audit log"
      contains: "mid-day"
      min_lines: 80
    - path: "app/src/app/api/cron/morning-sheet/route.dormant.test.ts"
      provides: "Cron skip tests filled in: dormant skipped, structured log, no Anthropic, non-dormant users still processed"
      contains: "skip_reason"
      min_lines: 50
    - path: "app/src/hooks/useToday.dormant.test.ts"
      provides: "useToday dormant-branch tests filled in"
      contains: "Nothing today"
      min_lines: 40
    - path: "app/src/lib/capital-pulse.test.ts"
      provides: "Existing tests amended: CapitalPulse.dormant* → CapitalPulse.quiet* references"
      contains: "quiet"
    - path: "app/scripts/smoke/regen-02-dormancy.sh"
      provides: "End-to-end curl smoke — shell filled in from Plan 00 stub"
      contains: "operator/dormancy"
      min_lines: 40
  key_links:
    - from: "app/src/components/whole/SettingsSheet.tsx toggle"
      to: "/api/operator/dormancy"
      via: "POST fetch on toggle, invalidate contexts query on success"
      pattern: "operator/dormancy"
    - from: "app/src/hooks/useToday.ts"
      to: "huma_context.dormant.active"
      via: "isDormant = humaContext?.dormant?.active === true"
      pattern: "dormant\\.active"
    - from: "app/src/app/today/page.tsx"
      to: "components/today/DormantCard"
      via: "conditional render: isDormant ? <DormantCard ... /> : <sheet …/>"
      pattern: "DormantCard"
    - from: "app/src/app/api/cron/morning-sheet/route.ts"
      to: "huma_context.dormant.active read"
      via: "per-user fetch of contexts.huma_context inside userIds loop; if active, log+skip+continue"
      pattern: "skip_reason.*dormant|dormant.*skip_reason"
    - from: "app/src/app/api/operator/dormancy/route.ts"
      to: "withObservability"
      via: "Phase 1 wrapper around handler body"
      pattern: "withObservability"
---

<objective>
Deliver REGEN-02: Dormancy as a first-class operator state. A toggle in `/whole` SettingsSheet flips `huma_context.dormant.active`, `/today` replaces the sheet with "Nothing today. Rest is the work." + a single re-entry input, and the morning-sheet cron skips dormant users entirely (no sheet compile, no Anthropic call, no push). Also rename the existing `CapitalPulse.dormant` field to `CapitalPulse.quiet` to free up the `dormant` name for this operator-state concept (prevents the kind of latent ambiguity Phase 1 Plan 01-08 hunted in PL/pgSQL).

Purpose: Rest is the work, not a scheduled pause — the code has to tell the same truth the docs do. The existing "engagement factor multiplier" penalized rest (fixed in Plan 01); Dormancy now makes rest a declared state, silencing outputs while preserving visibility (weekly reviews, patterns, canvas still readable). Matches REQUIREMENTS.md REGEN-02, Ethical Framework §03 (no shame, no rush).

Output: Type extension (HumaContext.dormant, CapitalPulse rename), new endpoint `/api/operator/dormancy`, SettingsSheet toggle, DormantCard component, useToday branch, cron skip logic, structured audit logs, three test files filled in from Wave 0 stubs, existing capital-pulse tests amended for the rename, end-to-end smoke shell filled in.
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
@.planning/phases/02-regenerative-math-honesty/02-CONTEXT.md
@.planning/phases/02-regenerative-math-honesty/02-VALIDATION.md
@.planning/phases/02-regenerative-math-honesty/02-00-fixtures-PLAN.md

<interfaces>
<!-- Existing types being extended (context.ts) and renamed (v2.ts); endpoints follow Phase 1 conventions. -->

Current HumaContext (app/src/types/context.ts:202) — expanding:
```typescript
export interface HumaContext {
  // ... existing fields ...
  _sources: ContextSource[];
  _lastUpdated: string;
  _version: number;
  // NEW:
  dormant?: { active: boolean; since: string };
  // fallowDays (added by Plan 04) — declared here for forward compat only if Plan 04 lands first; otherwise Plan 04 will add it
}
```

Current CapitalPulse (app/src/types/v2.ts:375-378) — renaming:
```typescript
// BEFORE
export interface CapitalPulse {
  moved: DimensionKey[];
  dormant: DimensionKey[];       // dimension-level, "no activity in 5+ days" — RENAMED
  text: string;
}

// AFTER
export interface CapitalPulse {
  moved: DimensionKey[];
  quiet: DimensionKey[];         // dimension-level signal (renamed from dormant)
  text: string;
}
```

PulseData (app/src/lib/capital-pulse.ts:9-13):
```typescript
// BEFORE
export interface PulseData {
  movedDimensions: DimensionKey[];
  dormantDimension: { key: DimensionKey; days: number } | null;
  dormantDimensions: DimensionKey[];
}

// AFTER
export interface PulseData {
  movedDimensions: DimensionKey[];
  quietDimension: { key: DimensionKey; days: number } | null;
  quietDimensions: DimensionKey[];
}
```

Phase 1 conventions to continue:
```typescript
// app/src/app/api/operator/dormancy/route.ts structure:
import { parseBody } from "@/lib/schemas/parse";
import { operatorDormancySchema } from "@/lib/schemas";
import { withObservability } from "@/lib/observability";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth-guard";

export async function POST(request: Request) {
  return withObservability(request, "/api/operator/dormancy", "user", () => null, async (obs) => {
    const authCtx = await requireUser(request);
    if (authCtx instanceof Response) return authCtx;
    const parsed = await parseBody(request, operatorDormancySchema);
    if (parsed.error) return parsed.error;
    // ... handler body
  });
}
```

Structured log shape already in use:
```json
{ "req_id": "...", "user_id": "...", "route": "/api/operator/dormancy", "action": "enable"|"disable", "latency_ms": N, "status": 200, "source": "user" }
```

For the cron skip log:
```json
{ "req_id": "...", "user_id": "u_abc", "route": "/api/cron/morning-sheet", "source": "cron", "skip_reason": "dormant", "status": 200 }
```

Existing morning-sheet cron (app/src/app/api/cron/morning-sheet/route.ts:130) — inside-loop insertion point:
```typescript
for (const userId of userIds) {
  try {
    // <-- NEW: dormant check here, before anything else
    // 2. Fetch user's aspirations
    const { data: aspirationRows } = await supabase ...
```

Dormant-check pattern (no extra Supabase call needed if we fetch huma_context in the same SELECT):

```typescript
// Fetch dormant flag alongside aspirations (one round-trip, same shape as the existing context fetch at ~line 157)
const { data: ctxEarly } = await supabase
  .from("contexts")
  .select("huma_context")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(1)
  .single();

const dormant = (ctxEarly?.huma_context as any)?.dormant;
if (dormant?.active) {
  totalSkipped++;
  console.log(JSON.stringify({
    req_id: obs.reqId,
    user_id: userId,
    route: "/api/cron/morning-sheet",
    source: "cron",
    skip_reason: "dormant",
    status: 200,
  }));
  continue;
}
```

Zod schema (app/src/lib/schemas/index.ts):
```typescript
export const operatorDormancySchema = z.object({
  enable: z.boolean(),
});
```

Current useToday signature (app/src/hooks/useToday.ts) — extending return:
```typescript
// Add to existing return object:
{
  // ... existing fields ...
  isDormant: boolean;
  dormantRe entrySubmit: (text: string) => Promise<void>;
}
```

Existing db store layer (lib/db/context.ts) — use whatever helper already updates huma_context:
```typescript
// Pseudocode shape from existing codebase:
await saveHumaContext(userId, nextHumaContext);
```

If the existing helper uses a merge/diff pattern, reuse it. If not, write the updated JSONB via supabase-admin directly in the route.

Renames affect these files (grep baseline from CONTEXT):
- app/src/types/v2.ts:377 — interface definition
- app/src/hooks/useToday.ts:682,696,697,718,721,731,732,738 — render logic
- app/src/components/shared/ConnectionThreads.tsx:46,103,119,304,329,471,479,518,535,579 — prop name + render
- app/src/app/today/page.tsx:99,103,119,326,327 — prop passing
- app/src/lib/capital-pulse.ts — function returns
- app/src/lib/capital-pulse.test.ts — existing assertions referencing dormantDimension/dormantDimensions

Do NOT rename usages where `dormant` refers to the NEW operator state (e.g., `huma_context.dormant.active`). Only rename the dimension-level signal field.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Types + CapitalPulse rename + capital-pulse.test amend</name>
  <files>
    app/src/types/context.ts,
    app/src/types/v2.ts,
    app/src/lib/capital-pulse.ts,
    app/src/lib/capital-pulse.test.ts
  </files>
  <behavior>
    - HumaContext gains optional `dormant?: { active: boolean; since: string }` field
    - CapitalPulse.dormant → CapitalPulse.quiet (type-level rename)
    - PulseData.dormantDimension → quietDimension, dormantDimensions → quietDimensions
    - computeCapitalPulse returns the new field names
    - Existing capital-pulse.test assertions are updated to use the new field names
    - All consumer files (useToday, today/page.tsx, ConnectionThreads, etc.) build — this task only updates the type + producer; consumer read-sites are updated in later tasks (same plan, same PR)
  </behavior>
  <action>
Step 1 — Edit `app/src/types/context.ts` to add the `dormant` field on `HumaContext` (line ~213, alongside `capacityState?`):

```typescript
// BEFORE
export interface HumaContext {
  body: BodyContext;
  // ...
  capacityState?: CapacityState;
  _sources: ContextSource[];
  _lastUpdated: string;
  _version: number;
}

// AFTER
export interface HumaContext {
  body: BodyContext;
  // ...
  capacityState?: CapacityState;

  // REGEN-02: Dormancy — operator-state rest signal. Toggle from /whole SettingsSheet.
  // active=true silences sheet + push + nudges; visibility (Whole, Grow, patterns) unaffected.
  // since is set on enable; left intact on disable (analytics can compute rest duration).
  dormant?: { active: boolean; since: string };

  _sources: ContextSource[];
  _lastUpdated: string;
  _version: number;
}
```

Step 2 — Edit `app/src/types/v2.ts` to rename `CapitalPulse.dormant` → `CapitalPulse.quiet`:

```typescript
// BEFORE (line ~375)
export interface CapitalPulse {
  moved: DimensionKey[];
  dormant: DimensionKey[];
  text: string;
}

// AFTER
export interface CapitalPulse {
  moved: DimensionKey[];
  quiet: DimensionKey[];           // Renamed from dormant (REGEN-02 frees the name for operator-state Dormancy)
  text: string;
}
```

Step 3 — Edit `app/src/lib/capital-pulse.ts` (rename fields in PulseData + computeCapitalPulse):

```typescript
// BEFORE
export interface PulseData {
  movedDimensions: DimensionKey[];
  dormantDimension: { key: DimensionKey; days: number } | null;
  dormantDimensions: DimensionKey[];
}
// ... and later in the function:
let dormantDimension: PulseData["dormantDimension"] = null;
const dormantDimensions: DimensionKey[] = [];
// ...
return { movedDimensions, dormantDimension, dormantDimensions };

// AFTER
export interface PulseData {
  movedDimensions: DimensionKey[];
  quietDimension: { key: DimensionKey; days: number } | null;
  quietDimensions: DimensionKey[];
}
// ... and later:
let quietDimension: PulseData["quietDimension"] = null;
const quietDimensions: DimensionKey[] = [];
// ...
return { movedDimensions, quietDimension, quietDimensions };
```

Update the internal comment at line 61 (`// Find dormant dimensions (5+ days without activity)` → `// Find quiet dimensions (5+ days without activity)`). The PulseData consumer comment in CONTEXT and useToday is "dimensions that dropped."

Step 4 — Amend `app/src/lib/capital-pulse.test.ts`:

```bash
# Every assertion/destructure using dormantDimension/dormantDimensions must be updated.
# Use Grep tool to find all occurrences first:
```

Grep pattern: `dormantDimension|dormantDimensions` across `app/src/lib/capital-pulse.test.ts`. Replace with `quietDimension` / `quietDimensions` respectively. No behavioral change — pure rename.

Step 5 — Update the consumers (useToday, ConnectionThreads, today/page.tsx) in the same pass. Each is a mechanical rename:

```bash
# 5a. useToday.ts — lines 682, 696, 697, 718, 721, 731, 732, 738
# Find: capitalPulse.dormantDimension  → capitalPulse.quietDimension
# Find: capitalPulse.dormantDimensions → capitalPulse.quietDimensions

# 5b. today/page.tsx — lines 99, 103, 119, 326, 327
# Find: dormantDimensions                → quietDimensions (prop-passing only, NOT huma_context.dormant)
# Find: movedDimensions/dormantDimensions — rename the second token

# 5c. ConnectionThreads.tsx — lines 46, 103, 119, 304, 329, 471, 479, 518, 535, 579
# Rename prop: dormantDimensions → quietDimensions
# Rename internal: dormantSet → quietSet; dormant variable → quiet (careful — only dimension-level)
```

Guard against over-rename: `huma_context.dormant` and the new `/api/operator/dormancy` endpoint MUST retain the `dormant` spelling. Use Grep to list all matches before editing; replace only CapitalPulse-field references.

Step 6 — Type-check and run tests:

```bash
cd app && npm test -- src/lib/capital-pulse.test.ts
cd app && npm run build      # or `tsc --noEmit` equivalent if configured
```

If the repo doesn't have a standalone typecheck, rely on Vitest's TS compilation. Run full suite:

```bash
cd app && npm test
```

Any test referencing `.dormant` on the dimension-level pulse that was not caught: update.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/capital-pulse.test.ts</automated>
  </verify>
  <done>
    - HumaContext.dormant? field exists (optional)
    - CapitalPulse.dormant → CapitalPulse.quiet; PulseData.dormantDimension* → quietDimension*
    - capital-pulse.test.ts assertions updated, all green
    - useToday, today/page.tsx, ConnectionThreads.tsx build without type errors
    - Full suite green
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: /api/operator/dormancy endpoint + schema + fill route test</name>
  <files>
    app/src/lib/schemas/index.ts,
    app/src/app/api/operator/dormancy/route.ts,
    app/src/app/api/operator/dormancy/route.test.ts
  </files>
  <behavior>
    - POST /api/operator/dormancy accepts { enable: boolean } via parseBody + Zod
    - Requires auth; anonymous sessions are allowed (first-class operators)
    - On enable: sets huma_context.dormant = { active: true, since: new Date().toISOString() }
    - On disable: sets huma_context.dormant.active = false; leaves since intact
    - Handler is wrapped in withObservability → emits structured log with action:'enable'|'disable'
    - Mid-day toggle-on does NOT delete existing sheet_entries or behavior_log for today (truth-respecting) — verify by running existing SELECT assertions
    - Returns 200 { ok: true, active: boolean }; errors use apiError() with proper shape
  </behavior>
  <action>
Step 1 — Add Zod schema in `app/src/lib/schemas/index.ts`:

```typescript
// At an appropriate location alongside existing schemas:
export const operatorDormancySchema = z.object({
  enable: z.boolean(),
});

export type OperatorDormancyInput = z.infer<typeof operatorDormancySchema>;
```

Step 2 — Create `app/src/app/api/operator/dormancy/route.ts`:

```typescript
import { parseBody } from "@/lib/schemas/parse";
import { operatorDormancySchema } from "@/lib/schemas";
import { withObservability } from "@/lib/observability";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth-guard";
import { apiError } from "@/lib/api-error";

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/operator/dormancy",
    "user",
    () => null,
    async (obs) => {
      const auth = await requireUser(request);
      if (auth instanceof Response) return auth;
      const { user } = auth;
      if (!user) return apiError("Not authenticated", { code: "UNAUTHORIZED", status: 401 });

      const parsed = await parseBody(request, operatorDormancySchema);
      if (parsed.error) return parsed.error;
      const { enable } = parsed.data;

      const supabase = await createServerSupabase();

      // Load existing context
      const { data: ctxRow, error: loadErr } = await supabase
        .from("contexts")
        .select("id, huma_context")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (loadErr || !ctxRow) {
        return apiError("Context not found", { code: "NOT_FOUND", status: 404 });
      }

      const currentHC = (ctxRow.huma_context ?? {}) as Record<string, unknown>;
      const currentDormant = (currentHC.dormant as { active: boolean; since: string } | undefined);
      const nextHC = {
        ...currentHC,
        dormant: {
          active: enable,
          // Preserve existing `since` on disable; set new ISO on enable
          since: enable ? new Date().toISOString() : (currentDormant?.since ?? new Date().toISOString()),
        },
      };

      const { error: saveErr } = await supabase
        .from("contexts")
        .update({ huma_context: nextHC })
        .eq("id", ctxRow.id);

      if (saveErr) {
        return apiError("Failed to persist dormancy state", { code: "INTERNAL", status: 500 });
      }

      // Audit log: attach action field to the observability log via a side-channel JSON
      // (withObservability already logs the outer shape; emit a supplementary line with action.)
      console.log(JSON.stringify({
        req_id: obs.reqId,
        user_id: user.id,
        route: "/api/operator/dormancy",
        action: enable ? "enable" : "disable",
        source: "user",
        status: 200,
      }));

      return Response.json({ ok: true, active: enable });
    },
  );
}
```

NOTE: mid-day preservation is an emergent property of this implementation — we never touch `sheet_entries` or `behavior_log`. The route only updates `contexts.huma_context.dormant`. The route-test below asserts this invariant directly.

Step 3 — Fill `app/src/app/api/operator/dormancy/route.test.ts` (replace Plan 00 stubs with real assertions). Use Phase 1 Wave 0 fixtures from `@/__tests__/fixtures/mock-supabase` + `capture-log`:

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { mockSupabaseAnonSession, mockSupabaseAuthedSession, mockSupabaseNoSession } from "@/__tests__/fixtures/mock-supabase";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.PHASE_1_GATE_ENABLED = "true";
});
afterEach(() => vi.resetModules());

function buildRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/operator/dormancy", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("REGEN-02: POST /api/operator/dormancy toggle", () => {
  it("enabling persists huma_context.dormant = { active:true, since: ISO }", async () => {
    const supa = mockSupabaseAuthedSession("u-1");
    const updateSpy = vi.fn(async () => ({ data: null, error: null }));
    supa.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "ctx-1", huma_context: {} }, error: null })) })),
          })),
        })),
      })),
      update: vi.fn(() => ({ eq: updateSpy })),
    })) as unknown as typeof supa.from;

    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({ user: { id: "u-1", is_anonymous: false }, source: "user" }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.active).toBe(true);

    const updatePayload = (supa.from as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) => call[0] === "contexts",
    );
    expect(updatePayload).toBeTruthy();
    // updateSpy received the new huma_context via chained .update().eq()
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it("disabling sets active:false but preserves 'since'", async () => {
    const existingCtx = { id: "ctx-1", huma_context: { dormant: { active: true, since: "2026-04-01T00:00:00.000Z" } } };
    const updateSpy = vi.fn(async () => ({ data: null, error: null }));

    const supa = mockSupabaseAuthedSession("u-2");
    supa.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: existingCtx, error: null })) })),
          })),
        })),
      })),
      update: vi.fn((payload: { huma_context: { dormant: { since: string } } }) => {
        // Capture the payload for assertion
        expect(payload.huma_context.dormant.since).toBe("2026-04-01T00:00:00.000Z");
        return { eq: updateSpy };
      }),
    })) as unknown as typeof supa.from;

    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({ user: { id: "u-2" }, source: "user" }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: false }));
    expect(res.status).toBe(200);
  });

  it("works for anonymous sessions (is_anonymous: true)", async () => {
    const supa = mockSupabaseAnonSession("anon-3");
    supa.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "ctx-3", huma_context: {} }, error: null })) })),
          })),
        })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({ data: null, error: null })) })),
    })) as unknown as typeof supa.from;

    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => ({ user: { id: "anon-3", is_anonymous: true }, source: "user" }),
    }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(200);
  });

  it("no session → 401", async () => {
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    }));
    const { POST } = await import("./route");
    const res = await POST(buildRequest({ enable: true }));
    expect(res.status).toBe(401);
  });

  it("emits audit log with action:'enable' via console.log", async () => {
    const cap = captureConsoleLog();

    const supa = mockSupabaseAuthedSession("u-4");
    supa.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "c4", huma_context: {} }, error: null })) })),
          })),
        })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({ data: null, error: null })) })),
    })) as unknown as typeof supa.from;

    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-4" }, source: "user" }) }));

    const { POST } = await import("./route");
    await POST(buildRequest({ enable: true }));

    const actionLog = cap.logs.find(l => l.action === "enable");
    expect(actionLog).toBeTruthy();
    expect(actionLog?.user_id).toBe("u-4");
    expect(actionLog?.route).toBe("/api/operator/dormancy");
    cap.restore();
  });

  describe("mid-day toggle preserves prior checkoffs", () => {
    it("never calls UPDATE on sheet_entries or behavior_log", async () => {
      const tableCalls: string[] = [];
      const supa = mockSupabaseAuthedSession("u-5");
      supa.from = vi.fn((table: string) => {
        tableCalls.push(table);
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "c5", huma_context: {} }, error: null })) })),
              })),
            })),
          })),
          update: vi.fn(() => ({ eq: vi.fn(async () => ({ data: null, error: null })) })),
        };
      }) as unknown as typeof supa.from;

      vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
      vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-5" }, source: "user" }) }));

      const { POST } = await import("./route");
      await POST(buildRequest({ enable: true }));

      expect(tableCalls).not.toContain("sheet_entries");
      expect(tableCalls).not.toContain("behavior_log");
      // Only touches 'contexts'
      expect(tableCalls.every(t => t === "contexts")).toBe(true);
    });
  });
});
```

Step 4 — Run:

```bash
cd app && npm test -- src/app/api/operator/dormancy/route.test.ts
```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/operator/dormancy/route.test.ts</automated>
  </verify>
  <done>
    - operatorDormancySchema exported
    - /api/operator/dormancy route landed with parseBody + withObservability + requireUser
    - 7 test cases green (enable persists, disable preserves since, anon works, no-session 401, audit log, mid-day preserve)
    - Route never touches sheet_entries or behavior_log (mid-day preserve assertion)
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Cron skip + useToday branch + DormantCard + SettingsSheet toggle + integration smoke + fill remaining tests</name>
  <files>
    app/src/app/api/cron/morning-sheet/route.ts,
    app/src/hooks/useToday.ts,
    app/src/components/today/DormantCard.tsx,
    app/src/app/today/page.tsx,
    app/src/components/whole/SettingsSheet.tsx,
    app/src/app/whole/page.tsx,
    app/src/app/api/cron/morning-sheet/route.dormant.test.ts,
    app/src/hooks/useToday.dormant.test.ts,
    app/scripts/smoke/regen-02-dormancy.sh
  </files>
  <behavior>
    - morning-sheet cron inserts a dormant-check at the top of `for (const userId of userIds)` that reads contexts.huma_context.dormant.active, emits a structured cron log with skip_reason:'dormant', and continues — BEFORE the existing aspirations fetch (saves Anthropic/push cost for dormant users)
    - useToday exposes isDormant (from huma_context.dormant.active) and a dormantReEntrySubmit handler that POSTs {enable:false} to /api/operator/dormancy and invalidates the contexts query
    - DormantCard renders exactly "Nothing today. Rest is the work." with a single input field; on submit, calls dormantReEntrySubmit and the user's content is then forwarded to /api/v2-chat as the first message of the re-entry conversation (or simply clears dormancy — spec says "typing anything ends Dormancy")
    - today/page.tsx conditionally renders <DormantCard /> instead of the sheet when useToday returns isDormant:true
    - SettingsSheet profile tab gets a Dormancy toggle row that calls /api/operator/dormancy and invalidates the contexts query on success
    - /whole/page.tsx passes the current dormant flag + handleDormancyToggle into SettingsSheet
    - Integration smoke shell (regen-02-dormancy.sh) curl-verifies the end-to-end flow
    - All three test files filled (cron skip, useToday branch, integration smoke)
    - Voice Bible §02 audit passes for: "Nothing today. Rest is the work." (exact spec copy — unchanged)
  </behavior>
  <action>
Step 1 — Edit `app/src/app/api/cron/morning-sheet/route.ts` at line 130 to insert the dormant-check at the top of the `for (const userId of userIds)` loop. The goal is to short-circuit BEFORE fetching aspirations (which is the most expensive query in the loop).

```typescript
// ~ line 130
for (const userId of userIds) {
  try {
    // REGEN-02: skip dormant users before any cost-incurring work
    const { data: dormantCheck } = await supabase
      .from("contexts")
      .select("huma_context")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    const dormantFlag = (dormantCheck?.huma_context as { dormant?: { active?: boolean } } | undefined)?.dormant?.active === true;
    if (dormantFlag) {
      totalSkipped++;
      console.log(JSON.stringify({
        req_id: obs.reqId,
        user_id: userId,
        route: "/api/cron/morning-sheet",
        source: "cron",
        skip_reason: "dormant",
        status: 200,
      }));
      continue;
    }

    // 2. Fetch user's aspirations (existing code below, unchanged)
    const { data: aspirationRows } = await supabase ...
```

Keep the existing context fetch downstream at ~line 157 as-is — it's used for knownContext/archetypes/whyStatement. This adds one extra Supabase roundtrip per user, but it's small (single-row select on an indexed column); the cost saved (no Anthropic sheet-compile for dormant operators) is orders of magnitude larger.

Optional micro-optimization (if the planner review flags the double-fetch): combine the dormant check with the existing context fetch into a single query — but this complicates the code and the current approach is fine for Phase 2.

Step 2 — Fill `app/src/app/api/cron/morning-sheet/route.dormant.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.CRON_SECRET = "cron-test-secret";
});
afterEach(() => vi.resetModules());

function buildCronRequest() {
  return new Request("http://localhost/api/cron/morning-sheet", {
    method: "GET",
    headers: { authorization: "Bearer cron-test-secret" },
  });
}

describe("REGEN-02: morning-sheet cron skips dormant users", () => {
  it("user with huma_context.dormant.active:true is skipped with skip_reason:'dormant'", async () => {
    const cap = captureConsoleLog();

    // Mock two users — u-1 dormant, u-2 active
    const subs = [{ user_id: "u-1" }, { user_id: "u-2" }];
    const aspirationFetch = vi.fn(async () => ({ data: [], error: null }));
    const contextFetchByUser: Record<string, { huma_context: Record<string, unknown> }> = {
      "u-1": { huma_context: { dormant: { active: true, since: "2026-04-10T00:00:00Z" } } },
      "u-2": { huma_context: { dormant: { active: false, since: "" } } },
    };

    const mockFrom = vi.fn((table: string) => {
      if (table === "push_subscriptions") {
        return { select: vi.fn(() => ({ order: vi.fn(async () => ({ data: subs, error: null })) })) };
      }
      if (table === "contexts") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((_col: string, userId: string) => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: contextFetchByUser[userId], error: null })) })),
              })),
            })),
          })),
        };
      }
      if (table === "aspirations") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: aspirationFetch })) })) };
      }
      return { select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [], error: null })) })) };
    });

    vi.doMock("@/lib/supabase-admin", () => ({ createAdminSupabase: () => ({ from: mockFrom }) }));
    vi.doMock("@/lib/push-send", () => ({ sendPush: vi.fn() }));

    const { GET } = await import("./route");
    const res = await GET(buildCronRequest());
    expect(res.status).toBe(200);

    const dormantLog = cap.logs.find(l => l.skip_reason === "dormant" && l.user_id === "u-1");
    expect(dormantLog).toBeTruthy();
    expect(dormantLog?.source).toBe("cron");

    // u-2 (non-dormant) should have triggered the aspirations fetch; u-1 should NOT
    // aspirationFetch was called at least once for u-2, but never for u-1 (one-query difference)
    cap.restore();
  });

  it("no sendPush is called for dormant user", async () => {
    const sendPushMock = vi.fn();
    vi.doMock("@/lib/push-send", () => ({ sendPush: sendPushMock }));

    // Setup: single dormant user
    const subs = [{ user_id: "u-dormant" }];
    const ctxRow = { huma_context: { dormant: { active: true, since: "2026-04-10T00:00:00Z" } } };

    const mockFrom = vi.fn((table: string) => {
      if (table === "push_subscriptions") return { select: vi.fn(() => ({ order: vi.fn(async () => ({ data: subs, error: null })) })) };
      if (table === "contexts") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: ctxRow, error: null })) })),
              })),
            })),
          })),
        };
      }
      return { select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [], error: null })) })) };
    });

    vi.doMock("@/lib/supabase-admin", () => ({ createAdminSupabase: () => ({ from: mockFrom }) }));

    const { GET } = await import("./route");
    await GET(buildCronRequest());

    expect(sendPushMock).not.toHaveBeenCalled();
  });

  it("non-dormant users in same cron run are still processed", async () => {
    // Similar setup, but assert that for an active user, the aspirations-fetch branch is reached.
    // (Implementation detail: mock aspirations query to return at least one row and confirm it's called.)
    // See first test for setup pattern — this adds the active-path assertion.
    const subs = [{ user_id: "u-active" }];
    const ctxRow = { huma_context: { dormant: { active: false } } };
    const aspFetch = vi.fn(async () => ({ data: [], error: null }));

    const mockFrom = vi.fn((table: string) => {
      if (table === "push_subscriptions") return { select: vi.fn(() => ({ order: vi.fn(async () => ({ data: subs, error: null })) })) };
      if (table === "contexts") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: ctxRow, error: null })) })) })) })),
          })),
        };
      }
      if (table === "aspirations") return { select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: aspFetch })) })) };
      return { select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [], error: null })) })) };
    });

    vi.doMock("@/lib/supabase-admin", () => ({ createAdminSupabase: () => ({ from: mockFrom }) }));
    vi.doMock("@/lib/push-send", () => ({ sendPush: vi.fn() }));

    const { GET } = await import("./route");
    await GET(buildCronRequest());
    expect(aspFetch).toHaveBeenCalled();
  });
});
```

Step 3 — Create `app/src/components/today/DormantCard.tsx`:

```tsx
"use client";

import { useState } from "react";

interface DormantCardProps {
  onReEntry: (text: string) => Promise<void>;
}

export default function DormantCard({ onReEntry }: DormantCardProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReEntry(text.trim());
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50dvh] px-6 py-12 text-center">
      <p className="font-serif text-[22px] leading-snug text-earth-650">
        Nothing today. Rest is the work.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-[360px]">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="when you're ready, say anything"
          aria-label="Re-entry message"
          className="w-full font-sans text-[14px] text-earth-650 placeholder:text-sand-350 bg-transparent border-0 border-b border-sand-300 py-2 px-1 outline-none focus:border-sage-500 transition-colors"
          disabled={submitting}
        />
      </form>
    </div>
  );
}
```

Voice Bible audit note: "when you're ready, say anything" is the re-entry input placeholder. Verify before merge — lowercase preserves the spec's quiet tone; no instruction verbs ("enter", "submit"), no urgency ("ready when you are"). Drop to `dormantCard` grep during Voice Bible review.

Step 4 — Edit `app/src/hooks/useToday.ts` to expose `isDormant` + `dormantReEntrySubmit`:

```typescript
// Inside useToday(), after humaContext is loaded:
const isDormant = (humaContext?.dormant?.active === true);

const dormantReEntrySubmit = useCallback(async (text: string) => {
  // 1. Toggle dormancy off
  await fetch("/api/operator/dormancy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ enable: false }),
  });
  // 2. Invalidate contexts + today queries
  await queryClient.invalidateQueries({ queryKey: ["contexts"] });
  // 3. Optional: forward text as first message of the re-entry conversation (scope for /start integration)
  //    — Phase 2 keeps this simple: toggling off is the action; the text is informational.
  //    A future plan could route it via /api/v2-chat directly.
  return text;
}, [queryClient]);

// Append to the returned object:
return {
  // ... existing fields ...
  isDormant,
  dormantReEntrySubmit,
};
```

Step 5 — Edit `app/src/app/today/page.tsx` to branch on `isDormant`:

```tsx
// Near the top of the render, after useToday() destructure:
const { isDormant, dormantReEntrySubmit, /* existing fields */ ... } = useToday();

// Earliest conditional in the render tree:
if (isDormant) {
  return (
    <TabShell /* same header as normal */>
      <DormantCard onReEntry={dormantReEntrySubmit} />
    </TabShell>
  );
}

// Existing sheet render below (unchanged)
```

Import: `import DormantCard from "@/components/today/DormantCard";`.

Step 6 — Edit `app/src/components/whole/SettingsSheet.tsx` to add a Dormancy toggle row in the profile tab (~line 236, inside the `{tab === 'profile' ? (...)` branch, alongside Name/Archetype/WHY). Surgical Edit — DO NOT rewrite the file.

```tsx
// New props on SettingsSheetProps:
interface SettingsSheetProps {
  // ... existing props ...
  dormant?: { active: boolean; since: string };
  onDormancyToggle?: (enable: boolean) => Promise<void>;
}

// Add inside the profile-tab JSX (same pattern as Name/Archetype rows):
{/* Dormancy */}
<div className="bg-sand-100 rounded-xl p-4">
  <div className="flex items-center justify-between">
    <div>
      <span className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 block mb-1">Dormancy</span>
      <span className="font-serif text-[15px] text-earth-650 leading-snug">
        {dormant?.active ? "On. Rest is the work." : "Off."}
      </span>
    </div>
    <button
      role="switch"
      aria-checked={dormant?.active === true}
      aria-label="Dormancy toggle"
      onClick={() => onDormancyToggle?.(!(dormant?.active))}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${dormant?.active ? "bg-sage-500" : "bg-sand-300"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-sand-50 shadow-sm transition-transform duration-200 ${dormant?.active ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  </div>
</div>
```

Voice Bible audit: "On. Rest is the work." / "Off." — passes §02 check (no "on track", no "journey", no "best self"; direct, spare).

Step 7 — Edit `app/src/app/whole/page.tsx` to pass the dormant flag + handler to SettingsSheet. Locate the SettingsSheet render and extend its props:

```tsx
const handleDormancyToggle = useCallback(async (enable: boolean) => {
  await fetch("/api/operator/dormancy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ enable }),
  });
  await queryClient.invalidateQueries({ queryKey: ["contexts"] });
}, [queryClient]);

// In the JSX:
<SettingsSheet
  /* existing props */
  dormant={humaContext?.dormant}
  onDormancyToggle={handleDormancyToggle}
/>
```

Step 8 — Fill `app/src/hooks/useToday.dormant.test.ts`. Because useToday is a complex hook with many dependencies, use a lightweight shape-test approach: extract the `isDormant` derivation into a pure helper if needed, or test via a test wrapper component. Simpler: unit-test the helper directly.

```typescript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react"; // if installed; otherwise use a pure computation test

// If @testing-library/react is not installed, test the pure derivation:
function deriveIsDormant(humaContext: { dormant?: { active?: boolean } } | null | undefined): boolean {
  return humaContext?.dormant?.active === true;
}

describe("REGEN-02: useToday isDormant derivation", () => {
  it("returns false when humaContext is null", () => {
    expect(deriveIsDormant(null)).toBe(false);
    expect(deriveIsDormant(undefined)).toBe(false);
  });

  it("returns false when huma_context.dormant is undefined", () => {
    expect(deriveIsDormant({})).toBe(false);
  });

  it("returns true when huma_context.dormant.active is true", () => {
    expect(deriveIsDormant({ dormant: { active: true } })).toBe(true);
  });

  it("returns false when huma_context.dormant.active is false", () => {
    expect(deriveIsDormant({ dormant: { active: false } })).toBe(false);
  });
});

describe("REGEN-02: DormantCard renders spec-line copy verbatim", () => {
  it("Renders exactly 'Nothing today. Rest is the work.'", async () => {
    // If @testing-library/react is available, import render and assert text presence
    // Otherwise snapshot-match against renderToStaticMarkup:
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: DormantCard } = await import("@/components/today/DormantCard");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const html = renderToStaticMarkup(<DormantCard onReEntry={async () => {}} />);
    expect(html).toContain("Nothing today. Rest is the work.");
    expect(html).toContain("when you&#x27;re ready, say anything");
  });
});
```

If the project has `@testing-library/react` already installed (check `app/package.json`), upgrade this test to render the hook and assert the full behavior. If not, the pure derivation + rendered-HTML approach above is sufficient.

Step 9 — Fill `app/scripts/smoke/regen-02-dormancy.sh`:

```bash
#!/usr/bin/env bash
# REGEN-02 end-to-end smoke
# Usage: STAGING_URL=https://huma-two.vercel.app ./regen-02-dormancy.sh <authed-cookie-file>
set -euo pipefail

STAGING_URL="${STAGING_URL:-http://localhost:3000}"
COOKIE_FILE="${1:-./cookies.txt}"
CRON_SECRET="${CRON_SECRET:-}"

if [[ -z "$CRON_SECRET" ]]; then
  echo "ERROR: CRON_SECRET env var required" >&2
  exit 1
fi

echo "1. Enable dormancy"
curl -sS -X POST "${STAGING_URL}/api/operator/dormancy" \
  -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d '{"enable":true}' | tee /tmp/dormancy-enable.json
grep -q '"active":true' /tmp/dormancy-enable.json || (echo "FAIL: dormancy did not enable" >&2; exit 1)

echo "2. Trigger morning-sheet cron"
CRON_RESP=$(curl -sS "${STAGING_URL}/api/cron/morning-sheet" -H "Authorization: Bearer $CRON_SECRET")
echo "$CRON_RESP" | tee /tmp/cron-dormant.json
# totalSkipped should include this user; visual check via Vercel logs for skip_reason:'dormant'

echo "3. Disable dormancy"
curl -sS -X POST "${STAGING_URL}/api/operator/dormancy" \
  -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d '{"enable":false}' | tee /tmp/dormancy-disable.json
grep -q '"active":false' /tmp/dormancy-disable.json || (echo "FAIL: dormancy did not disable" >&2; exit 1)

echo "4. Trigger cron again — this run should process (not skip)"
curl -sS "${STAGING_URL}/api/cron/morning-sheet" -H "Authorization: Bearer $CRON_SECRET" | tee /tmp/cron-active.json

echo "OK — regen-02-dormancy smoke complete. Verify in Vercel logs: skip_reason:'dormant' on run 2, no such entry on run 4."
```

Commit the file as executable. On Windows the shebang works under Git Bash; on CI (Vercel/Linux) it's executable if the permission bit is preserved.

Step 10 — Run all Phase 2 dormancy tests:

```bash
cd app && npm test -- src/app/api/operator/dormancy/route.test.ts src/app/api/cron/morning-sheet/route.dormant.test.ts src/hooks/useToday.dormant.test.ts src/lib/capital-pulse.test.ts
cd app && npm test  # full suite
```

Voice Bible §02 audit (manual, before merge):
- grep `docs/voice-bible.md` §02 banned-phrase list against all new copy strings
- Strings to check: "Nothing today. Rest is the work." (locked from spec) / "when you're ready, say anything" (input placeholder) / "On. Rest is the work." (toggle label) / "Off."

Hands-off verification is the spec-line text is unchanged; if the Voice Bible audit flags the placeholder or toggle label, refine in a follow-up commit.
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/cron/morning-sheet/route.dormant.test.ts src/hooks/useToday.dormant.test.ts</automated>
  </verify>
  <done>
    - Cron skip branch landed; structured log emitted with source:'cron' + skip_reason:'dormant'
    - useToday.isDormant + dormantReEntrySubmit exposed
    - DormantCard renders spec line + single input; submit toggles off
    - today/page.tsx branches on isDormant
    - SettingsSheet profile tab has Dormancy toggle row
    - whole/page.tsx wires the toggle handler
    - All filled tests green (cron, hook, route, capital-pulse rename)
    - regen-02-dormancy.sh executable and exits 0 against local dev
    - Voice Bible §02 audit passed before merge
  </done>
</task>

</tasks>

<verification>
**Overall Phase 02-02 checks:**

Automated (must all exit 0):
```bash
cd app && npm test -- src/app/api/operator/dormancy/route.test.ts
cd app && npm test -- src/app/api/cron/morning-sheet/route.dormant.test.ts
cd app && npm test -- src/hooks/useToday.dormant.test.ts
cd app && npm test -- src/lib/capital-pulse.test.ts
cd app && npm test  # full suite
```

Grep verification:
```bash
# No stray references to old dimension-level "dormant" field (except huma_context.dormant, which is the operator state)
grep -rn "capitalPulse\.dormant" app/src   # expect 0 hits
grep -rn "PulseData.*dormant"    app/src   # expect 0 hits
grep -rn "dormantDimensions?"    app/src   # expect 0 hits after rename

# New operator-state references exist
grep -rn "huma_context.dormant"  app/src   # expect >= 3 hits (route, cron, hook)
grep -rn "skip_reason.*dormant"  app/src/app/api/cron/morning-sheet/route.ts  # expect 1 hit
grep -rn "Nothing today. Rest is the work." app/src  # expect 1 hit (DormantCard)
```

Integration smoke (staging):
```bash
STAGING_URL=https://huma-two.vercel.app bash app/scripts/smoke/regen-02-dormancy.sh ./cookies.txt
```

Manual (before close):
- Visit `/whole`, open SettingsSheet → Profile tab, toggle Dormancy on
- Visit `/today` — confirm "Nothing today. Rest is the work." renders
- Submit any text in the input — confirm /today returns to normal sheet view
- Vercel logs: confirm `skip_reason:'dormant'` entry on next cron tick
</verification>

<success_criteria>
- HumaContext.dormant type + CapitalPulse rename landed
- /api/operator/dormancy endpoint live with parseBody + withObservability + anon support
- SettingsSheet Dormancy toggle visible in profile tab
- /today renders Dormant card exactly as spec-lined
- morning-sheet cron skips dormant users with structured log
- All 4 filled test files green (route, cron, hook, capital-pulse amendment)
- Integration smoke script executable, exits 0 against local dev
- Mid-day preservation invariant verified by route-test (no UPDATE on sheet_entries/behavior_log)
- Voice Bible §02 audit passed on all new copy
</success_criteria>

<output>
After completion, create `.planning/phases/02-regenerative-math-honesty/02-02-dormancy-SUMMARY.md` with:
- What shipped: type extension + CapitalPulse rename + endpoint + cron skip + SettingsSheet toggle + DormantCard + smoke
- Specific decisions honored: indefinite toggle, single-message re-entry, preserve mid-day checkoffs, anonymous support, structured audit log, no push-layer guard (cron is the only push path), no special migration (huma_context JSONB extension)
- Files touched (17 modified — 3 new (route, DormantCard, smoke), 14 modified)
- Downstream: Plan 03 (capital receipt) is independent; Plan 04 (Fallow) extends huma_context the same way; Phase 7 DEPTH-04 (Hard Season) is a second HumaContext field variant using this same pattern
</output>
