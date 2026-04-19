# Phase 01 Deferred Items

Out-of-scope discoveries made during plan execution. These are tracked for later cleanup but NOT auto-fixed by the current plan.

## From Plan 01-01 (auth-gate)

### TS error in fixtures.test.ts (line 22) — pre-existing

**File:** `app/src/__tests__/fixtures/fixtures.test.ts`

**Error:** `error TS2554: Expected 0 arguments, but got 2.` at line 22.

**Origin:** The chainable `.eq()` mock is typed as `() => chain` with 0 parameters, but the test calls `.eq("a", "b")` with 2 args. Tests still pass at runtime because `vi.fn()` accepts any args — this is purely a type mismatch.

**Why deferred:** This was introduced in commit `81682af` (Plan 01-00). Not caused by Plan 01-01 changes. The existing Vitest run passes 589/589 tests. Fix is a tiny types update on `mock-supabase.ts`'s `chainable()` builder.

**Suggested fix (for later):** Type the chain methods as `(...args: unknown[]) => ...` so they accept any call signature, matching Supabase's fluent API.

---
