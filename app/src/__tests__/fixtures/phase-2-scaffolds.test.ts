import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Phase 2 Wave 0 shape-parity smoke.
 *
 * Asserts that every test file referenced in
 * `.planning/phases/02-regenerative-math-honesty/02-VALIDATION.md`
 * Per-Task Verification Map exists on disk. Wave 1 plans (02-01..02-05)
 * consume these stubs by replacing `.skip` with real assertions — they
 * MUST NOT create new test files for rows already listed here. If a stub
 * is accidentally deleted, this smoke fails at Wave 0 and the plan is
 * repaired before Wave 1 executors run.
 *
 * Paths are resolved relative to `process.cwd()` which — under the
 * `cd app && npm test` convention declared in 02-VALIDATION.md — points
 * at the `app/` directory.
 */
const PHASE_2_TEST_FILES = [
  "src/lib/capital-computation.test.ts",
  "src/__tests__/capital-score-confidence.test.ts",
  "src/components/canvas/CapitalRadar.confidence.test.tsx",
  "src/app/api/operator/dormancy/route.test.ts",
  "src/app/api/cron/morning-sheet/route.dormant.test.ts",
  "src/hooks/useToday.dormant.test.ts",
  "src/app/api/outcome/route.test.ts",
  "src/lib/outcome-check.test.ts",
  "src/lib/outcome-strength.test.ts",
  "src/components/whole/CapitalReceiptSheet.test.tsx",
  "src/components/canvas/CapitalRadar.tap.test.tsx",
  "src/__tests__/capital-receipt-math.test.ts",
  "src/app/api/sheet/fallow/route.test.ts",
  "src/hooks/useToday.fallow.test.ts",
  "src/app/api/sheet/check/route.fallow.test.ts",
];

const PHASE_2_SMOKE_SCRIPTS = [
  "scripts/smoke/regen-02-dormancy.sh",
];

describe("Phase 2 Wave 0 scaffolds — every test file referenced in 02-VALIDATION.md exists", () => {
  for (const rel of PHASE_2_TEST_FILES) {
    it(`exists: ${rel}`, () => {
      const abs = resolve(process.cwd(), rel);
      expect(existsSync(abs)).toBe(true);
    });
  }
  for (const rel of PHASE_2_SMOKE_SCRIPTS) {
    it(`exists: ${rel}`, () => {
      const abs = resolve(process.cwd(), rel);
      expect(existsSync(abs)).toBe(true);
    });
  }
});
