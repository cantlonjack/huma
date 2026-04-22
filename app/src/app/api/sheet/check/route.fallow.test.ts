import { describe, it } from "vitest";

describe("REGEN-05: sheet/check rejects new checkoffs on fallow days", () => {
  it.skip("POST /api/sheet/check returns 409 when today is in huma_context.fallowDays", () => {
    // Plan 02-05 fills this
  });

  it.skip("no behavior_log row is written when day is fallow", () => {
    // Plan 02-05 fills this
  });

  it.skip("error body includes code:'FALLOW_DAY' for client handling", () => {
    // Plan 02-05 fills this
  });
});
