import { describe, it } from "vitest";

describe("REGEN-03: POST /api/outcome", () => {
  it.skip("creates outcome_checks row with { target_kind, target_id, answer, why, answered_at, snooze_count:0 }", () => {
    // Plan 02-03 fills this
  });

  it.skip("requires auth — returns 401 on no session", () => {
    // Plan 02-03 fills this
  });

  it.skip("enforces answer enum: yes|some|no|worse (rejects 'maybe' with 400)", () => {
    // Plan 02-03 fills this
  });

  it.skip("sanitizes why field via parseBody Zod schema (rejects [[ and strips injection patterns)", () => {
    // Plan 02-03 fills this
  });

  it.skip("emits structured log with action:'outcome_submit'", () => {
    // Plan 02-03 fills this
  });

  describe("snooze path", () => {
    it.skip("snooze increments snooze_count, no outcome row created", () => {
      // Plan 02-03 fills this
    });

    it.skip("third snooze request rejects with 400 — required-visit enforced", () => {
      // Plan 02-03 fills this
    });
  });
});
