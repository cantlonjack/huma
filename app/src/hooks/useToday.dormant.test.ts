import { describe, it } from "vitest";

/**
 * REGEN-02 hook test stub.
 *
 * Wave 0 placeholder — Plan 02-02 replaces each `.skip` with real
 * assertions. Covers the Dormant branch of useToday:
 *   - isDormant derived from huma_context.dormant.active
 *   - Dormant screen copy (exact string — voice-bible locked)
 *   - single input toggles dormancy off, next compile runs
 *   - sheet content not rendered while dormant
 */
describe("REGEN-02: useToday dormant branch", () => {
  it.skip("huma_context.dormant.active:true returns isDormant:true from the hook", () => {
    // Plan 02-02 fills this
  });

  it.skip("Dormant /today renders exactly 'Nothing today. Rest is the work.'", () => {
    // Plan 02-02 fills this
  });

  it.skip("single input field submits -> toggles dormancy off -> next compile runs", () => {
    // Plan 02-02 fills this
  });

  it.skip("sheet content is NOT rendered while dormant (no compiledEntries)", () => {
    // Plan 02-02 fills this
  });
});
