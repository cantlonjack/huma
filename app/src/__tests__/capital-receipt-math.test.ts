import { describe, it } from "vitest";

/**
 * REGEN-04 reproducibility invariant stub.
 *
 * Wave 0 placeholder — Plan 02-04 replaces each `.skip` with real
 * assertions. The receipt MUST show the same numbers the radar uses;
 * this is the parity test that proves no second-source-of-truth was
 * introduced when CapitalReceiptSheet was added.
 */
describe("REGEN-04: receipt math parity (reproducibility invariant)", () => {
  it.skip("receipt contribution values equal internal capitalRaw map per form", () => {
    // Plan 02-04 fills this
  });

  it.skip("receipt avgRate equals raw/contributions from computeCapitalScores", () => {
    // Plan 02-04 fills this
  });

  it.skip("receipt threshold bucket matches computeCapitalScores score output", () => {
    // Plan 02-04 fills this
  });

  it.skip("receipt confidence equals min(1, daysSinceFirstBehavior/14) from same input", () => {
    // Plan 02-04 fills this
  });
});
