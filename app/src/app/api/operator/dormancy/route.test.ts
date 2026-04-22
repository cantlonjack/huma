import { describe, it } from "vitest";

describe("REGEN-02: POST /api/operator/dormancy toggle", () => {
  it.skip("enabling persists huma_context.dormant = { active: true, since: ISO }", () => {
    // Plan 02-02 fills this
  });

  it.skip("disabling sets active:false but leaves 'since' intact (analytics)", () => {
    // Plan 02-02 fills this
  });

  it.skip("requires auth — anon session allowed (anon users are first-class); no session -> 401", () => {
    // Plan 02-02 fills this
  });

  it.skip("emits structured log via withObservability with action:'enable'|'disable'", () => {
    // Plan 02-02 fills this
  });

  describe("mid-day toggle preserves prior checkoffs", () => {
    it.skip("toggle-on at 4pm does NOT delete existing sheet_entries for today", () => {
      // Plan 02-02 fills this
    });

    it.skip("toggle-on at 4pm does NOT delete existing behavior_log rows for today", () => {
      // Plan 02-02 fills this
    });
  });

  it.skip("works for anonymous sessions (is_anonymous:true)", () => {
    // Plan 02-02 fills this
  });
});
