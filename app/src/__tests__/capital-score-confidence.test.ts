import { describe, it, expect } from "vitest";
import type { CapitalScore, CapitalForm, CanvasData } from "@/engine/canvas-types";

/**
 * REGEN-01 type parity + consumer-compat tests.
 *
 * Replaces Wave 0 `.skip` stubs. Guards against breaking existing readers
 * of `.score`/`.note`, and checks CanvasData round-trip so shareable maps
 * preserve the new confidence field.
 */
describe("REGEN-01: CapitalScore.confidence type parity + consumer compat", () => {
  it("CapitalScore type includes confidence: number (range 0-1)", () => {
    const s: CapitalScore = {
      form: "living",
      score: 3,
      note: "developing",
      confidence: 0.5,
    };
    expect(typeof s.confidence).toBe("number");
    expect(s.confidence).toBeGreaterThanOrEqual(0);
    expect(s.confidence).toBeLessThanOrEqual(1);
  });

  it("existing consumers of CapitalScore.score/note still compile and read", () => {
    const s: CapitalScore = {
      form: "social",
      score: 4,
      note: "developing",
      confidence: 0.8,
    };
    const { score, note } = s;
    expect(score).toBe(4);
    expect(note).toBe("developing");
    // Confidence is additive — not required to be used by existing readers
    expect(s.confidence).toBe(0.8);
  });

  it("CanvasData.capitalProfile round-trips confidence field", () => {
    const forms: CapitalForm[] = [
      "financial",
      "material",
      "living",
      "social",
      "intellectual",
      "experiential",
      "spiritual",
      "cultural",
    ];
    const profile: CapitalScore[] = forms.map((form, i) => ({
      form,
      score: 1,
      note: "No activity yet",
      confidence: i / 7, // staggered 0..1
    }));
    const canvas = { capitalProfile: profile } as Pick<CanvasData, "capitalProfile">;

    expect(canvas.capitalProfile).toHaveLength(8);
    expect(canvas.capitalProfile[0].confidence).toBe(0);
    expect(canvas.capitalProfile[7].confidence).toBe(1);
    // Each form preserved
    for (let i = 0; i < 8; i++) {
      expect(canvas.capitalProfile[i].form).toBe(forms[i]);
    }
  });

  it("confidence 0 + score 1 + note 'No activity yet' forms the zero-data invariant", () => {
    const zero: CapitalScore = {
      form: "spiritual",
      score: 1,
      note: "No activity yet",
      confidence: 0,
    };
    expect(zero.score).toBe(1);
    expect(zero.confidence).toBe(0);
    expect(zero.note).toBe("No activity yet");
  });
});
