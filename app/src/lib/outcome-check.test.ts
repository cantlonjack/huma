import { describe, it } from "vitest";

describe("REGEN-03: outcome-check 90-day trigger", () => {
  it.skip("aspiration with createdAt 90 days ago and no outcome record -> isDue:true", () => {
    // Plan 02-03 fills this
  });

  it.skip("aspiration with createdAt 89 days ago -> isDue:false", () => {
    // Plan 02-03 fills this
  });

  it.skip("aspiration with existing outcome record within last 90 days -> isDue:false", () => {
    // Plan 02-03 fills this
  });

  it.skip("aspiration updates do NOT reset the 90-day clock (still from createdAt)", () => {
    // Plan 02-03 fills this
  });

  it.skip("pattern with createdAt 90 days ago and no outcome record -> isDue:true", () => {
    // Plan 02-03 fills this
  });

  it.skip("max one outcome-check card per day (returns first due; others queued for next day)", () => {
    // Plan 02-03 fills this
  });
});
