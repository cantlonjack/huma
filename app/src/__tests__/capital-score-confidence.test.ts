import { describe, it } from "vitest";

/**
 * REGEN-01 type + consumer compatibility stub.
 *
 * Wave 0 placeholder — Plan 02-01 replaces each `.skip` with real
 * assertions. The confidence field is additive on the CapitalScore
 * type; this suite guards against breaking existing readers of
 * `.score` and `.note`, and checks the CanvasData round-trip so
 * shareable maps preserve the new field.
 */
describe("REGEN-01: CapitalScore.confidence type parity + consumer compat", () => {
  it.skip("CapitalScore type includes confidence: number (range 0–1)", () => {
    // Plan 02-01 fills this
  });

  it.skip("existing consumers of CapitalScore.score/note still compile", () => {
    // Plan 02-01 fills this
  });

  it.skip("CanvasData.capitalProfile round-trips confidence field", () => {
    // Plan 02-01 fills this
  });
});
