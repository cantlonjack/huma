import { describe, it } from "vitest";

describe("REGEN-05: POST /api/sheet/fallow", () => {
  it.skip("marking adds today's YYYY-MM-DD to huma_context.fallowDays[]", () => {
    // Plan 02-05 fills this
  });

  it.skip("marking is idempotent — second mark for same day is a no-op", () => {
    // Plan 02-05 fills this
  });

  it.skip("unmarking removes the date from fallowDays[] — allowed on same calendar day", () => {
    // Plan 02-05 fills this
  });

  it.skip("unmarking after midnight returns 409 frozen", () => {
    // Plan 02-05 fills this
  });

  it.skip("requires auth — 401 on no session", () => {
    // Plan 02-05 fills this
  });

  it.skip("emits structured log with action:'mark_fallow'|'unmark_fallow' + date", () => {
    // Plan 02-05 fills this
  });

  it.skip("preserves existing sheet_entries and behavior_log for mid-day fallow (today-only)", () => {
    // Plan 02-05 fills this
  });
});
