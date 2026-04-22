---
phase: 02-regenerative-math-honesty
plan: 04
type: execute
wave: 2
depends_on:
  - "02-00"
  - "02-02"
files_modified:
  - app/src/types/context.ts
  - app/src/lib/schemas/index.ts
  - app/src/lib/fallow.ts
  - app/src/app/api/sheet/fallow/route.ts
  - app/src/app/api/sheet/check/route.ts
  - app/src/hooks/useToday.ts
  - app/src/app/today/page.tsx
  - app/src/components/today/FallowCard.tsx
  - app/src/app/api/sheet/fallow/route.test.ts
  - app/src/hooks/useToday.fallow.test.ts
  - app/src/app/api/sheet/check/route.fallow.test.ts
autonomous: true
requirements:
  - REGEN-05
must_haves:
  truths:
    - "HumaContext.fallowDays: string[] field exists on the type (ISO YYYY-MM-DD entries); persists via existing contextSync"
    - "POST /api/sheet/fallow accepts { mark: boolean, date: YYYY-MM-DD } with parseBody + Zod + withObservability"
    - "Marking adds date to fallowDays; unmarking removes — both idempotent"
    - "Unmarking is allowed ONLY on the same calendar day (today); post-midnight attempts return 409 with code:'FALLOW_FROZEN'"
    - "Sheet header renders a Fallow button (today-only toggle); long-press alternatives are not used"
    - "Fallow /today renders exactly 'Fallow. Compost day.' (locked from spec)"
    - "Checkoff row buttons are disabled when today's date is in fallowDays (visually greyed, cursor-not-allowed)"
    - "Mid-day fallow-mark preserves existing checkoffs (they remain visible but greyed) — truth-respecting"
    - "POST /api/sheet/check rejects with 409 + code:'FALLOW_DAY' when today is a fallow day; no behavior_log row is written"
    - "Confidence 14-day clock is unaffected by Fallow — calendar-day formula in capital-computation.ts already handles this correctly"
    - "Structured audit log emitted per mark/unmark with action:'mark_fallow'|'unmark_fallow' + date"
    - "Voice Bible §02 audit passes on 'Fallow. Compost day.' (spec copy, unchanged)"
  artifacts:
    - path: "app/src/types/context.ts"
      provides: "HumaContext.fallowDays?: string[] field"
      contains: "fallowDays"
    - path: "app/src/lib/fallow.ts"
      provides: "Pure helpers — isFallow(humaContext, date), addFallow, removeFallow, frozenAfterMidnight(date, tz)"
      exports: ["isFallow", "addFallowDay", "removeFallowDay", "isFrozenAfterMidnight"]
      min_lines: 40
    - path: "app/src/app/api/sheet/fallow/route.ts"
      provides: "POST endpoint — parseBody + Zod + withObservability + 409 on post-midnight unmark"
      contains: "FALLOW_FROZEN"
      min_lines: 70
    - path: "app/src/app/api/sheet/check/route.ts"
      provides: "Fallow-day guard prepended to existing check handler"
      contains: "FALLOW_DAY"
    - path: "app/src/hooks/useToday.ts"
      provides: "isFallow derivation from huma_context.fallowDays[today]; fallowMark/fallowUnmark handlers"
      contains: "isFallow"
    - path: "app/src/components/today/FallowCard.tsx"
      provides: "Spec-line Fallow /today UI + same-day unmark link"
      contains: "Fallow. Compost day."
      min_lines: 30
    - path: "app/src/app/today/page.tsx"
      provides: "Sheet header Fallow button + conditional FallowCard render"
      contains: "FallowCard"
    - path: "app/src/app/api/sheet/fallow/route.test.ts"
      provides: "Route tests filled in (mark/unmark, same-day undo, post-midnight frozen, audit log)"
      contains: "FALLOW_FROZEN"
      min_lines: 80
    - path: "app/src/hooks/useToday.fallow.test.ts"
      provides: "Hook tests filled in (isFallow, Fallow card replaces sheet, preserved prior checkoffs)"
      contains: "isFallow"
      min_lines: 40
    - path: "app/src/app/api/sheet/check/route.fallow.test.ts"
      provides: "Check-route guard tests filled in (409 on fallow day, no behavior_log write, error code FALLOW_DAY)"
      contains: "FALLOW_DAY"
      min_lines: 30
  key_links:
    - from: "app/src/app/today/page.tsx header"
      to: "/api/sheet/fallow"
      via: "Fallow button onClick → POST {mark:true/false, date: today}"
      pattern: "sheet/fallow"
    - from: "app/src/hooks/useToday.ts"
      to: "huma_context.fallowDays"
      via: "isFallow = fallowDays.includes(getLocalDate())"
      pattern: "fallowDays\\.includes"
    - from: "app/src/app/api/sheet/check/route.ts"
      to: "lib/fallow.isFallow"
      via: "prepended guard: if (isFallow(humaContext, today)) return 409"
      pattern: "isFallow"
    - from: "app/src/app/today/page.tsx"
      to: "components/today/FallowCard"
      via: "conditional render: isFallow ? <FallowCard ...> : <sheet>"
      pattern: "FallowCard"
---

<objective>
Deliver REGEN-05: Fallow day ("do-nothing sheet"). One-tap mark from the sheet header marks today as fallow; the sheet view replaces with "Fallow. Compost day." Checkoff is disabled; no `behavior_log` row is written. Unmark is allowed on the same calendar day; after midnight the mark is frozen. Confidence unaffected — calendar-day formula already handles this correctly (Fallow week still advances the 14-day clock — see REGEN-01 / Plan 01).

Purpose: Rest is the work has a second variant: *active* rest (Dormancy — multi-day state) and *situational* rest (Fallow — one-day state). Fallow lets the operator say "today is compost — let the soil work" without the system penalizing or prompting. Complements Plan 02's Dormancy. Matches REQUIREMENTS.md REGEN-05 and the Ethical Framework §03 "no shame, no rush" principle.

Output: HumaContext.fallowDays type extension, pure helpers (`lib/fallow.ts`), new endpoint (`/api/sheet/fallow`), guard prepended to existing `/api/sheet/check`, useToday branch, FallowCard component, sheet header toggle button, three test files filled in from Wave 0 stubs, Voice Bible §02 audit on new copy.

**Wave assignment note (from checker revision):** This plan was moved from Wave 1 → Wave 2 with added `depends_on: ["02-02"]` to serialize the `app/src/types/context.ts` edit after Plan 02. Both plans extend `HumaContext` (Plan 02 adds `dormant?`; this plan adds `fallowDays?`), so parallel execution risked last-writer-wins on the same file. Plan 05 stays in Wave 1 — its additions to `useToday.ts` / `today/page.tsx` are disjoint line-ranges (different destructure fields, different render branches) that a 3-way merge handles cleanly, and Plan 05 does NOT touch `types/context.ts` per its `files_modified` frontmatter.
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
<!-- Extends huma_context (same pattern as Plan 02 Dormancy). Phase 1 conventions continued. -->

Current HumaContext (app/src/types/context.ts:202) — extending again:
```typescript
export interface HumaContext {
  // ... existing + Plan 02's dormant? field ...
  dormant?: { active: boolean; since: string };
  fallowDays?: string[];         // NEW — REGEN-05: ISO YYYY-MM-DD entries. Additive, no new table.
  _sources: ContextSource[];
  _lastUpdated: string;
  _version: number;
}
```

Phase 2 Plan 02 adds `dormant?`; this plan adds `fallowDays?` to the same interface. If Plan 02 ships first, this plan extends — if Wave 1 runs both in parallel, both fields land in the same diff (resolve by accepting both — they're independent).

Zod schema:
```typescript
// app/src/lib/schemas/index.ts
export const sheetFallowSchema = z.object({
  mark: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});
export type SheetFallowInput = z.infer<typeof sheetFallowSchema>;
```

Pure helpers (lib/fallow.ts):
```typescript
export function isFallow(hc: HumaContext | null | undefined, date: string): boolean {
  return (hc?.fallowDays ?? []).includes(date);
}

export function addFallowDay(hc: HumaContext, date: string): HumaContext {
  const existing = hc.fallowDays ?? [];
  if (existing.includes(date)) return hc;  // idempotent
  return { ...hc, fallowDays: [...existing, date] };
}

export function removeFallowDay(hc: HumaContext, date: string): HumaContext {
  const existing = hc.fallowDays ?? [];
  if (!existing.includes(date)) return hc;  // idempotent
  return { ...hc, fallowDays: existing.filter(d => d !== date) };
}

/**
 * True if `date` is not today in the user's local timezone — unmark is frozen after midnight.
 * Uses getLocalDate() from lib/date-utils (already in use).
 */
export function isFrozenAfterMidnight(date: string, today: string): boolean {
  return date !== today;
}
```

Existing `app/src/lib/date-utils.ts`:
```typescript
export function getLocalDate(): string;  // returns "YYYY-MM-DD" in user's local tz
```

Existing sheet/check route (app/src/app/api/sheet/check/route.ts — 37 lines, NOT yet wrapped in withObservability per earlier grep):
```typescript
export async function POST(request: Request) {
  const parsed = await parseBody(request, sheetCheckSchema);
  if (parsed.error) return parsed.error;
  const { entryId, checked } = parsed.data;
  // ... auth + DB update
}
```

We add a fallow-guard BEFORE the DB update. Do NOT wrap in withObservability in this plan (scope creep — Phase 1 already missed it; flag for a follow-up if it hasn't been fixed by Plan 02).

Structured log shape for audit:
```json
{ "req_id": "...", "user_id": "...", "route": "/api/sheet/fallow", "action": "mark_fallow"|"unmark_fallow", "date": "2026-04-22", "source": "user", "status": 200 }
```

Today page header (app/src/app/today/page.tsx:236 — `<TabShell>`):
```tsx
<TabShell
  /* header content — add Fallow button alongside ThemeToggleIcon if available */
  headerActions={<>
    <FallowButton disabled={isFallow} onClick={handleFallowToggle} />
    <ThemeToggleIcon />
  </>}
>
```

If TabShell doesn't have a `headerActions` slot, add a small button in the sheet-section heading area (sibling to the existing header elements).

Existing sheetCheckSchema (app/src/lib/schemas/index.ts) — do not modify; add new schema alongside.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Types + pure helpers (lib/fallow.ts) + Zod schema + /api/sheet/fallow route + fill route test</name>
  <files>
    app/src/types/context.ts,
    app/src/lib/schemas/index.ts,
    app/src/lib/fallow.ts,
    app/src/app/api/sheet/fallow/route.ts,
    app/src/app/api/sheet/fallow/route.test.ts
  </files>
  <behavior>
    - HumaContext gains optional `fallowDays?: string[]`
    - Pure helpers: isFallow, addFallowDay, removeFallowDay, isFrozenAfterMidnight
    - sheetFallowSchema: { mark: boolean, date: YYYY-MM-DD }
    - POST /api/sheet/fallow — parseBody + Zod + withObservability + requireUser
    - mark=true: add date to huma_context.fallowDays (idempotent)
    - mark=false: remove date from fallowDays (idempotent), BUT only if date === today; post-midnight unmark returns 409 with code:'FALLOW_FROZEN'
    - Emits audit log with action:'mark_fallow'|'unmark_fallow' + date
    - Never touches sheet_entries or behavior_log (preserve-checkoffs invariant)
    - Route tests: 7 cases covering mark, unmark, idempotency, post-midnight freeze, auth, audit log, no-side-effects
  </behavior>
  <action>
Step 1 — Edit `app/src/types/context.ts` to add fallowDays field to HumaContext. If Plan 02 has already shipped `dormant?:{…}`, append fallowDays after it. If Plan 02 is not yet merged, add both in the same commit (merge-safe union):

```typescript
// HumaContext (relevant section):
export interface HumaContext {
  body: BodyContext;
  // ... existing + (possibly) Plan 02's dormant? ...

  // REGEN-05 (Plan 02-04): Fallow day ("do-nothing sheet"). ISO YYYY-MM-DD entries.
  // Additive; no new table. Sheet view replaces with "Fallow. Compost day." for dates in this array.
  fallowDays?: string[];

  _sources: ContextSource[];
  _lastUpdated: string;
  _version: number;
}
```

Step 2 — Create `app/src/lib/fallow.ts` (pure helpers, no side effects):

```typescript
import type { HumaContext } from "@/types/context";

export function isFallow(hc: HumaContext | null | undefined, date: string): boolean {
  return Array.isArray(hc?.fallowDays) ? hc!.fallowDays!.includes(date) : false;
}

export function addFallowDay(hc: HumaContext, date: string): HumaContext {
  const existing = hc.fallowDays ?? [];
  if (existing.includes(date)) return hc;
  return { ...hc, fallowDays: [...existing, date] };
}

export function removeFallowDay(hc: HumaContext, date: string): HumaContext {
  const existing = hc.fallowDays ?? [];
  if (!existing.includes(date)) return hc;
  return { ...hc, fallowDays: existing.filter(d => d !== date) };
}

/**
 * Unmark-frozen check. If `date` is not the user's current local date (getLocalDate() output),
 * it is considered frozen and unmark must reject.
 */
export function isFrozenAfterMidnight(date: string, today: string): boolean {
  return date !== today;
}
```

Step 3 — Add Zod schema in `app/src/lib/schemas/index.ts`:

```typescript
export const sheetFallowSchema = z.object({
  mark: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});
export type SheetFallowInput = z.infer<typeof sheetFallowSchema>;
```

Step 4 — Create `app/src/app/api/sheet/fallow/route.ts`:

```typescript
import { parseBody } from "@/lib/schemas/parse";
import { sheetFallowSchema } from "@/lib/schemas";
import { withObservability } from "@/lib/observability";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth-guard";
import { apiError } from "@/lib/api-error";
import { addFallowDay, removeFallowDay, isFrozenAfterMidnight } from "@/lib/fallow";
import { getLocalDate } from "@/lib/date-utils";
import type { HumaContext } from "@/types/context";

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/sheet/fallow",
    "user",
    () => null,
    async (obs) => {
      const auth = await requireUser(request);
      if (auth instanceof Response) return auth;
      const { user } = auth;
      if (!user) return apiError("Not authenticated", { code: "UNAUTHORIZED", status: 401 });

      const parsed = await parseBody(request, sheetFallowSchema);
      if (parsed.error) return parsed.error;
      const { mark, date } = parsed.data;

      const today = getLocalDate();
      if (!mark && isFrozenAfterMidnight(date, today)) {
        return apiError("Fallow marks are frozen after midnight", {
          code: "FALLOW_FROZEN",
          status: 409,
        });
      }

      const supabase = await createServerSupabase();
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

      const currentHC = ((ctxRow.huma_context ?? {}) as unknown) as HumaContext;
      const nextHC = mark ? addFallowDay(currentHC, date) : removeFallowDay(currentHC, date);

      const { error: saveErr } = await supabase
        .from("contexts")
        .update({ huma_context: nextHC })
        .eq("id", ctxRow.id);

      if (saveErr) {
        return apiError("Failed to persist fallow state", { code: "INTERNAL", status: 500 });
      }

      console.log(JSON.stringify({
        req_id: obs.reqId,
        user_id: user.id,
        route: "/api/sheet/fallow",
        action: mark ? "mark_fallow" : "unmark_fallow",
        date,
        source: "user",
        status: 200,
      }));

      return Response.json({
        ok: true,
        fallowDays: nextHC.fallowDays ?? [],
      });
    },
  );
}
```

Step 5 — Fill `app/src/app/api/sheet/fallow/route.test.ts` (replace Plan 00 stubs):

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";
import { mockSupabaseAuthedSession } from "@/__tests__/fixtures/mock-supabase";

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.PHASE_1_GATE_ENABLED = "true";
});
afterEach(() => vi.resetModules());

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/sheet/fallow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function setupMocks(existingHC: { fallowDays?: string[] } = {}) {
  const updateSpy = vi.fn(async () => ({ data: null, error: null }));
  let updatePayload: unknown = null;

  const supa = mockSupabaseAuthedSession("u-1");
  supa.from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(async () => ({ data: { id: "ctx-1", huma_context: existingHC }, error: null })),
          })),
        })),
      })),
    })),
    update: vi.fn((payload) => {
      updatePayload = payload;
      return { eq: updateSpy };
    }),
  })) as unknown as typeof supa.from;

  vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
  vi.doMock("@/lib/auth-guard", () => ({
    requireUser: async () => ({ user: { id: "u-1", is_anonymous: false }, source: "user" }),
  }));

  return { supa, updateSpy, getUpdatePayload: () => updatePayload };
}

describe("REGEN-05: POST /api/sheet/fallow", () => {
  it("marking adds today to huma_context.fallowDays", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));
    const { getUpdatePayload } = setupMocks({});

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ mark: true, date: today }));
    expect(res.status).toBe(200);
    const payload = getUpdatePayload() as { huma_context: { fallowDays: string[] } };
    expect(payload.huma_context.fallowDays).toContain(today);
  });

  it("marking is idempotent (same date twice = no duplicate entry)", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));
    const { getUpdatePayload } = setupMocks({ fallowDays: [today] });

    const { POST } = await import("./route");
    await POST(buildRequest({ mark: true, date: today }));
    const payload = getUpdatePayload() as { huma_context: { fallowDays: string[] } };
    expect(payload.huma_context.fallowDays.filter(d => d === today)).toHaveLength(1);
  });

  it("unmarking removes date (same calendar day)", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));
    const { getUpdatePayload } = setupMocks({ fallowDays: [today] });

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ mark: false, date: today }));
    expect(res.status).toBe(200);
    const payload = getUpdatePayload() as { huma_context: { fallowDays: string[] } };
    expect(payload.huma_context.fallowDays).not.toContain(today);
  });

  it("unmarking after midnight (date != today) returns 409 FALLOW_FROZEN", async () => {
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => "2026-04-23" }));
    setupMocks({ fallowDays: ["2026-04-22"] });

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ mark: false, date: "2026-04-22" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe("FALLOW_FROZEN");
  });

  it("no session returns 401", async () => {
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    }));
    const { POST } = await import("./route");
    const res = await POST(buildRequest({ mark: true, date: "2026-04-22" }));
    expect(res.status).toBe(401);
  });

  it("emits audit log with action:'mark_fallow' + date", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));
    const cap = captureConsoleLog();
    setupMocks({});

    const { POST } = await import("./route");
    await POST(buildRequest({ mark: true, date: today }));
    const auditLog = cap.logs.find(l => l.action === "mark_fallow");
    expect(auditLog).toBeTruthy();
    expect(auditLog?.date).toBe(today);
    cap.restore();
  });

  it("never UPDATEs sheet_entries or behavior_log (preserve-checkoffs invariant)", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));
    const tableCalls: string[] = [];
    const supa = mockSupabaseAuthedSession("u-1");
    supa.from = vi.fn((table: string) => {
      tableCalls.push(table);
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "c1", huma_context: {} }, error: null })) })),
            })),
          })),
        })),
        update: vi.fn(() => ({ eq: vi.fn(async () => ({ data: null, error: null })) })),
      };
    }) as unknown as typeof supa.from;

    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-1" }, source: "user" }) }));

    const { POST } = await import("./route");
    await POST(buildRequest({ mark: true, date: today }));

    expect(tableCalls).not.toContain("sheet_entries");
    expect(tableCalls).not.toContain("behavior_log");
    expect(tableCalls.every(t => t === "contexts")).toBe(true);
  });
});
```

Step 6 — Run the route tests:

```bash
cd app && npm test -- src/app/api/sheet/fallow/route.test.ts
```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/sheet/fallow/route.test.ts</automated>
  </verify>
  <done>
    - HumaContext.fallowDays?: string[] field exists
    - lib/fallow.ts pure helpers landed
    - sheetFallowSchema exported
    - /api/sheet/fallow route live with parseBody + withObservability + 409 freeze
    - 7 route-test cases green
    - Never touches sheet_entries or behavior_log (preserve-checkoffs invariant)
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: sheet/check guard + useToday branch + FallowCard + sheet header button + fill remaining tests</name>
  <files>
    app/src/app/api/sheet/check/route.ts,
    app/src/hooks/useToday.ts,
    app/src/components/today/FallowCard.tsx,
    app/src/app/today/page.tsx,
    app/src/hooks/useToday.fallow.test.ts,
    app/src/app/api/sheet/check/route.fallow.test.ts
  </files>
  <behavior>
    - /api/sheet/check prepends an isFallow(humaContext, today) guard; returns 409 + code:'FALLOW_DAY' when true; no behavior_log/sheet_entries update
    - useToday exposes isFallow:boolean, fallowMarkToday/fallowUnmarkToday handlers, and a 'disabledReason' on compiled entries for disabling checkoffs
    - FallowCard renders spec line + same-day unmark affordance
    - today/page.tsx sheet header gets a Fallow button that calls fallowMarkToday; when isFallow=true the page renders <FallowCard /> instead of the sheet
    - Existing CompiledEntryRow gets an optional `disabled` prop (or the page disables via CSS pointer-events-none); prior checkoffs remain visible but greyed
    - 2 filled tests (useToday.fallow, sheet/check route.fallow) green
  </behavior>
  <action>
Step 1 — Edit `app/src/app/api/sheet/check/route.ts` to prepend a fallow-guard. Current file is 37 lines (not wrapped in withObservability — leave that scope as a known Phase 1 gap; don't expand this plan). Surgical Edit only:

```typescript
// BEFORE (current file — pre-Phase 1 wrapping is out of scope for this plan)
import { createServerSupabase } from "@/lib/supabase-server";
import { sheetCheckSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

export async function POST(request: Request) {
  const parsed = await parseBody(request, sheetCheckSchema);
  if (parsed.error) return parsed.error;
  const { entryId, checked } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { error } = await supabase.from("sheet_entries").update({ ... }).eq(...);
    ...
  }
}

// AFTER — prepend fallow guard between auth and the update
import { createServerSupabase } from "@/lib/supabase-server";
import { sheetCheckSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import { isFallow } from "@/lib/fallow";
import { getLocalDate } from "@/lib/date-utils";
import type { HumaContext } from "@/types/context";

export async function POST(request: Request) {
  const parsed = await parseBody(request, sheetCheckSchema);
  if (parsed.error) return parsed.error;
  const { entryId, checked } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    // REGEN-05: reject checkoffs on fallow days (guard before DB write, no behavior_log emitted)
    const { data: ctxRow } = await supabase
      .from("contexts")
      .select("huma_context")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    const humaContext = (ctxRow?.huma_context ?? {}) as HumaContext;
    if (isFallow(humaContext, getLocalDate())) {
      return Response.json(
        { error: "Today is marked fallow", code: "FALLOW_DAY" },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("sheet_entries")
      .update({
        checked,
        checked_at: checked ? new Date().toISOString() : null,
      })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Sheet check update error:", error);
      return Response.json({ error: "Failed to update" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Sheet check error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
```

The extra contexts fetch is a minor overhead — we could cache via a header, but the current scale doesn't warrant it. Flag for retrospective if it becomes noticeable.

Step 2 — Fill `app/src/app/api/sheet/check/route.fallow.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.PHASE_1_GATE_ENABLED = "true";
});
afterEach(() => vi.resetModules());

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/sheet/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("REGEN-05: sheet/check rejects new checkoffs on fallow days", () => {
  it("returns 409 + FALLOW_DAY when today is in huma_context.fallowDays", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    const updateSpy = vi.fn();
    const supa = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u-1" } }, error: null })) },
      from: vi.fn((table: string) => {
        if (table === "contexts") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: { huma_context: { fallowDays: [today] } }, error: null })),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === "sheet_entries") {
          return { update: vi.fn(() => ({ eq: vi.fn(() => ({ eq: updateSpy })) })) };
        }
        return { select: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ entryId: "e1", checked: true }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe("FALLOW_DAY");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("proceeds normally when today is not fallow", async () => {
    const today = "2026-04-22";
    vi.doMock("@/lib/date-utils", () => ({ getLocalDate: () => today }));

    const updateSpy = vi.fn(async () => ({ error: null }));
    const supa = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u-1" } }, error: null })) },
      from: vi.fn((table: string) => {
        if (table === "contexts") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: { huma_context: { fallowDays: [] } }, error: null })),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === "sheet_entries") {
          return {
            update: vi.fn(() => ({ eq: vi.fn(() => ({ eq: updateSpy })) })),
          };
        }
        return { select: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ entryId: "e1", checked: true }));
    expect(res.status).toBe(200);
    expect(updateSpy).toHaveBeenCalled();
  });

  it("no session returns 401 without checking fallow flag", async () => {
    const supa = {
      auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: null })) },
      from: vi.fn(),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({ entryId: "e1", checked: true }));
    expect(res.status).toBe(401);
  });
});
```

Step 3 — Edit `app/src/hooks/useToday.ts` — expose `isFallow` + handlers:

```typescript
// Near the top of useToday(), after humaContext is loaded (if Plan 02 is landed, alongside isDormant):
import { isFallow as checkFallow } from "@/lib/fallow";

// ...
const today = getLocalDate();
const isFallow = checkFallow(humaContext, today);

const fallowMarkToday = useCallback(async () => {
  await fetch("/api/sheet/fallow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mark: true, date: today }),
  });
  await queryClient.invalidateQueries({ queryKey: ["contexts"] });
}, [today, queryClient]);

const fallowUnmarkToday = useCallback(async () => {
  await fetch("/api/sheet/fallow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mark: false, date: today }),
  });
  await queryClient.invalidateQueries({ queryKey: ["contexts"] });
}, [today, queryClient]);

// Return:
return {
  // ... existing fields ...
  isFallow,
  fallowMarkToday,
  fallowUnmarkToday,
};
```

Step 4 — Create `app/src/components/today/FallowCard.tsx`:

```tsx
"use client";

interface FallowCardProps {
  onUnmark: () => Promise<void>;
}

export default function FallowCard({ onUnmark }: FallowCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50dvh] px-6 py-12 text-center">
      <p className="font-serif text-[22px] leading-snug text-earth-650">
        Fallow. Compost day.
      </p>

      <button
        onClick={onUnmark}
        className="mt-10 font-sans text-[13px] text-earth-400 underline underline-offset-4 decoration-sand-300 hover:decoration-earth-400 bg-transparent border-0 cursor-pointer"
      >
        unmark for today
      </button>
    </div>
  );
}
```

Voice Bible audit: "Fallow. Compost day." is the spec line — locked. "unmark for today" is the inline affordance — lowercase, no urgency ("quick", "easy"), no instruction-verb stacking. Run §02 grep before merge.

Step 5 — Edit `app/src/app/today/page.tsx` to conditionally render `<FallowCard />` and add a header Fallow button. Surgical edits only.

5a. Import the card + destructure the new hook outputs:

```tsx
import FallowCard from "@/components/today/FallowCard";

// Inside the component, in the existing useToday() destructure:
const { isFallow, fallowMarkToday, fallowUnmarkToday, /* existing fields */ } = useToday();
```

5b. Add the branch near the top of the render (AFTER the isDormant branch from Plan 02 — Dormancy wins over Fallow if both are somehow set):

```tsx
if (isDormant) {
  return <TabShell {...}><DormantCard onReEntry={...} /></TabShell>;
}

if (isFallow) {
  return (
    <TabShell /* same header as normal — but the Fallow button should read "Unmark fallow" */>
      <FallowCard onUnmark={fallowUnmarkToday} />
    </TabShell>
  );
}
```

5c. Add a small Fallow button in the sheet header area. Grep for the existing header layout around line 236 (`<TabShell>` + section headings). Add:

```tsx
<button
  onClick={fallowMarkToday}
  aria-label="Mark today fallow"
  className="font-sans text-[12px] text-earth-400 hover:text-earth-650 bg-transparent border-0 cursor-pointer"
>
  fallow today
</button>
```

Place it where the user would reasonably reach for it — alongside the existing header actions (ThemeToggleIcon etc.). The exact placement is Claude's Discretion per CONTEXT.md; prefer top-right of the sheet section.

Step 6 — Fill `app/src/hooks/useToday.fallow.test.ts` (pure derivation + FallowCard render):

```typescript
import { describe, it, expect } from "vitest";
import { isFallow as deriveIsFallow } from "@/lib/fallow";

describe("REGEN-05: useToday fallow branch", () => {
  it("returns false when humaContext is null", () => {
    expect(deriveIsFallow(null, "2026-04-22")).toBe(false);
  });

  it("returns false when huma_context.fallowDays is undefined", () => {
    expect(deriveIsFallow({} as never, "2026-04-22")).toBe(false);
  });

  it("returns true when today is in fallowDays", () => {
    const hc = { fallowDays: ["2026-04-22"] } as never;
    expect(deriveIsFallow(hc, "2026-04-22")).toBe(true);
  });

  it("returns false when today is not in fallowDays", () => {
    const hc = { fallowDays: ["2026-04-21"] } as never;
    expect(deriveIsFallow(hc, "2026-04-22")).toBe(false);
  });
});

describe("REGEN-05: FallowCard renders spec copy", () => {
  it("Renders 'Fallow. Compost day.' verbatim + unmark affordance", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: FallowCard } = await import("@/components/today/FallowCard");
    const html = renderToStaticMarkup(<FallowCard onUnmark={async () => {}} />);
    expect(html).toContain("Fallow. Compost day.");
    expect(html).toContain("unmark for today");
  });
});
```

Step 7 — Run the tests:

```bash
cd app && npm test -- src/app/api/sheet/check/route.fallow.test.ts src/hooks/useToday.fallow.test.ts
cd app && npm test  # full suite
```

Voice Bible §02 audit before merge:
- "Fallow. Compost day." (locked spec)
- "unmark for today" (inline affordance)
- "fallow today" (header button)
- "Mark today fallow" (aria-label, not user-visible text)
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/sheet/check/route.fallow.test.ts src/hooks/useToday.fallow.test.ts</automated>
  </verify>
  <done>
    - sheet/check guard prepended; 3 test cases green (409 on fallow, 200 when not fallow, 401 on no session)
    - useToday.isFallow + fallowMarkToday + fallowUnmarkToday exposed
    - FallowCard renders spec copy + unmark affordance
    - today/page.tsx branches on isFallow; header button calls fallowMarkToday
    - 5 hook-test cases green
    - Full suite green
    - Voice Bible §02 audit passed on new copy
  </done>
</task>

</tasks>

<verification>
**Overall Phase 02-04 checks:**

Automated (must all exit 0):
```bash
cd app && npm test -- src/app/api/sheet/fallow/route.test.ts
cd app && npm test -- src/app/api/sheet/check/route.fallow.test.ts
cd app && npm test -- src/hooks/useToday.fallow.test.ts
cd app && npm test  # full suite
```

Grep verification:
```bash
grep -n "fallowDays" app/src/types/context.ts                       # expect 1
grep -n "FALLOW_DAY"  app/src/app/api/sheet/check/route.ts         # expect 1
grep -n "FALLOW_FROZEN" app/src/app/api/sheet/fallow/route.ts     # expect 1
grep -n "Fallow. Compost day." app/src                              # expect 1 (FallowCard)
grep -n "isFallow" app/src                                          # expect >= 3 (lib/fallow, useToday, check route)
```

Manual (before close):
- Open `/today`, tap the "fallow today" button
- Confirm the sheet view replaces with "Fallow. Compost day." + unmark affordance
- Tap the unmark link — confirm sheet returns
- Verify: a checkoff attempt while fallow via DevTools fetch returns 409 with code:'FALLOW_DAY'
- After midnight (or in simulation with system clock): unmark attempt returns 409 with code:'FALLOW_FROZEN'
- Voice Bible audit on "fallow today", "unmark for today", "Fallow. Compost day."
</verification>

<success_criteria>
- HumaContext.fallowDays type field exists
- /api/sheet/fallow endpoint live with parseBody + withObservability + 409 post-midnight freeze
- /api/sheet/check guard in place (409 + FALLOW_DAY on fallow days)
- FallowCard renders spec copy exactly
- Sheet header Fallow button calls the endpoint and the page branches appropriately
- Mid-day preserve: route never touches sheet_entries/behavior_log (assertion)
- 3 test files green (10+ assertions)
- Full suite green
- Voice Bible §02 audit passed
</success_criteria>

<output>
After completion, create `.planning/phases/02-regenerative-math-honesty/02-04-fallow-day-SUMMARY.md` with:
- What shipped: fallowDays type + pure helpers + /api/sheet/fallow endpoint + sheet/check guard + useToday branch + FallowCard + sheet header button
- Specific decisions honored: today-only scope, sheet-header button (not long-press), same-day undo, post-midnight freeze, preserve mid-day checkoffs (greyed visible), audit log action pair
- Files touched: 3 created (lib/fallow.ts, fallow route, FallowCard), 8 modified
- Downstream: Phase 3 ONBOARD-05 sweeps "fallow" copy if needed; Phase 7 DEPTH-04 Hard Season reuses the same HumaContext.extend pattern
</output>
