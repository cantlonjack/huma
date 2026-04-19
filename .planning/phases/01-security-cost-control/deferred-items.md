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

## From Plan 01-05c (observability-streaming)

### BudgetResult discriminated-union narrowing — pre-existing

**Files:** `app/src/app/api/v2-chat/route.ts`, `app/src/app/api/sheet/route.ts`

**Error:** `TS2339: Property 'messages'/'trimmedCount'/'inputTokens' does not exist on type 'BudgetResult | BudgetTooLarge'` at three lines each.

**Origin:** Plan 01-03's `budgetCheck()` returns a discriminated union. The `"tooLarge" in budget && budget.tooLarge` guard narrows semantically but doesn't satisfy TypeScript's structural narrowing — the `.messages`/`.trimmedCount`/`.inputTokens` accesses after the guard are flagged even though they're safe at runtime.

**Why deferred:** Pre-existing baseline errors (verified via `git stash` + `tsc --noEmit`); not introduced by Plan 05c. Runtime behavior is correct — all Vitest cases green. Plan 05c explicitly stays out of Plan 03 territory per parallel-execution discipline (v2-chat/route.ts is my file but the offending block is Plan 03's output).

**Suggested fix (for later):** Rename `BudgetTooLarge.tooLarge` to a proper discriminator (e.g., add `kind: "too-large"` vs `kind: "ok"`), or widen the inline guard to a dedicated type-predicate helper `isBudgetOk(b): b is BudgetOk`.

---
