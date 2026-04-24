---
phase: 1
slug: security-cost-control
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 (already installed, `node` environment) |
| **Config file** | `app/vitest.config.ts` (exists; aliases `@` → `src`; 15s test timeout) |
| **Quick run command** | `cd app && npm test -- <path-or-pattern>` |
| **Full suite command** | `cd app && npm test` |
| **Estimated runtime** | ~90s full (24 existing + ~10 new test files) |

Established mocking patterns (from `sheet/route.test.ts` and `__tests__/api-routes.test.ts`):
- Mock `@anthropic-ai/sdk` via `vi.mock("@anthropic-ai/sdk", () => ({ default: MockAnthropic }))`.
- Mock `@/lib/supabase-server` and `@/lib/redis` with `vi.mock()`.
- Set `process.env.ANTHROPIC_API_KEY` in `beforeAll()`.
- Build `Request` with `new Request("http://localhost/api/...", { method, headers, body })`.
- Lazy-import the route AFTER mocks: `const { POST } = await import("./route")`.

---

## Sampling Rate

- **After every task commit:** Run `cd app && npm test -- <single test file touched>` (<30s).
- **After every plan wave:** Run `cd app && npm test` (full suite, ~90s).
- **Before `/gsd:verify-work`:** Full suite green + all curl-smoke scripts exit 0 against a staging deployment with `PHASE_1_GATE_ENABLED=true`.
- **Max feedback latency:** 90 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SEC-01 | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.auth.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | SEC-01 | unit (route) | `cd app && npm test -- src/app/api/sheet/route.auth.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | SEC-01 | integration | `cd app && bash scripts/smoke/sec-01-curl.sh` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | SEC-02 | unit | `cd app && npm test -- src/lib/quota.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | SEC-02 | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.quota.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 1 | SEC-02 | integration | `cd app && bash scripts/smoke/sec-02-quota.sh` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | SEC-03 | unit | `cd app && npm test -- src/lib/services/prompt-builder.budget.test.ts` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 1 | SEC-04 | unit (schema) | `cd app && npm test -- src/lib/schemas/sanitize.test.ts` | ❌ W0 | ⬜ pending |
| 1-04-02 | 04 | 1 | SEC-04 | unit (coverage) | `cd app && npm test -- src/lib/schemas/coverage.test.ts` | ❌ W0 | ⬜ pending |
| 1-04-03 | 04 | 1 | SEC-04 | integration | `cd app && bash scripts/smoke/sec-04-injection.sh` | ❌ W0 | ⬜ pending |
| 1-05-01 | 05 | 1 | SEC-05 | unit | `cd app && npm test -- src/lib/observability.test.ts` | ❌ W0 | ⬜ pending |
| 1-05-02 | 05 | 1 | SEC-05 | unit | `cd app && npm test -- src/lib/ulid.test.ts` | ❌ W0 | ⬜ pending |
| 1-05-03 | 05 | 1 | SEC-05 | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.log.test.ts` | ❌ W0 | ⬜ pending |
| 1-05-04 | 05 | 1 | SEC-05 | unit (route) | `cd app && npm test -- src/app/api/cron/morning-sheet/route.log.test.ts` | ❌ W0 | ⬜ pending |
| 1-05-05 | 05 | 1 | SEC-05 | unit (coverage) | `cd app && npm test -- src/__tests__/observability-coverage.test.ts` | ❌ W0 | ⬜ pending |
| 1-06-01 | 06 | 1 | SEC-06 | unit (route) | `cd app && npm test -- src/app/api/v2-chat/route.abort.test.ts` | ❌ W0 | ⬜ pending |
| 1-06-02 | 06 | 1 | SEC-06 | integration | `cd app && bash scripts/smoke/sec-06-disconnect.sh` | ❌ W0 | ⬜ pending (manual final verify) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Plan 07 (enablement) has no unit tests — its verification is the smoke triad against the staging deployment after `PHASE_1_GATE_ENABLED=true` flip and `016_user_quotas.sql` application.

---

## Wave 0 Requirements

All test surfaces are new. Wave 0 bootstrap:

- [ ] `app/src/lib/schemas/sanitize.test.ts` — SEC-04 unit cases (markers, injection prefix, NFC, zero-width)
- [ ] `app/src/lib/schemas/coverage.test.ts` — SEC-04 schema-wide application (every user-text field calls `sanitizeUserText`)
- [ ] `app/src/lib/services/prompt-builder.budget.test.ts` — SEC-03 (budget check, tail-trim, 413 overflow)
- [ ] `app/src/lib/quota.test.ts` — SEC-02 tier resolution + ledger increment + check
- [ ] `app/src/lib/observability.test.ts` — SEC-05 wrapper (`withObservability` unit)
- [ ] `app/src/lib/ulid.test.ts` — SEC-05 ULID format + monotonicity
- [ ] `app/src/app/api/v2-chat/route.auth.test.ts` — SEC-01
- [ ] `app/src/app/api/v2-chat/route.quota.test.ts` — SEC-02 (anon / free / operate)
- [ ] `app/src/app/api/v2-chat/route.log.test.ts` — SEC-05 user-source logging
- [ ] `app/src/app/api/v2-chat/route.abort.test.ts` — SEC-06 (`stream.abort()` on signal)
- [ ] `app/src/app/api/sheet/route.auth.test.ts` — SEC-01 (+ cron-bypass case)
- [ ] `app/src/app/api/cron/morning-sheet/route.log.test.ts` — SEC-05 cron-identity case
- [ ] `app/src/__tests__/observability-coverage.test.ts` — every route importing `@anthropic-ai/sdk` also imports `withObservability`
- [ ] `app/src/__tests__/fixtures/mock-supabase.ts` — anon + authed session mocks, admin mock
- [ ] `app/src/__tests__/fixtures/mock-anthropic.ts` — `countTokens` + stream abort mocks
- [ ] `app/src/__tests__/fixtures/capture-log.ts` — `console.log` spy → JSON payloads
- [ ] `app/scripts/smoke/sec-01-curl.sh` — 401 for unauth'd `/api/v2-chat` + `/api/sheet`
- [ ] `app/scripts/smoke/sec-02-quota.sh` — 6th anon request → 429
- [ ] `app/scripts/smoke/sec-04-injection.sh` — `[[` in body → 400
- [ ] `app/scripts/smoke/sec-06-disconnect.sh` — `curl -N` disconnect → abort in logs
- [ ] `app/supabase/migrations/016_user_quotas.sql` — tiers seed + ledger + `increment_quota_and_check()` RPC

*Framework install: not required — Vitest 4.1.0 already present.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SSE disconnect triggers Anthropic abort observable in Vercel logs | SEC-06 | Abort observability only surfaces reliably against a live deployment where Vercel function logs are visible; unit test mocks the `AbortController` path | Run `scripts/smoke/sec-06-disconnect.sh` against staging, then inspect Vercel runtime logs for the matching `req_id`, confirm `APIUserAbortError` or `stream aborted` entry appears |
| Feature-flag enablement sequence | SEC-01..SEC-06 | Supabase migrations are manual via dashboard SQL editor (PROJECT.md constraint); Vercel env change is manual | 1) Apply `016_user_quotas.sql` via Supabase dashboard SQL editor · 2) `SELECT count(*) FROM user_quotas_tiers` returns 3 · 3) Flip `PHASE_1_GATE_ENABLED=true` in Vercel prod env · 4) Run all three curl-smoke scripts, confirm exit 0 |
| Rate-limit-hit UX copy passes Voice Bible §02 banned-phrase review | SEC-02 | Prose style judgment; no automated voice linter | Read the three tier strings in `<QuotaCard>`; confirm no banned phrases (no "unlock", no shame framing); run against Voice Bible §02 checklist |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies listed
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
