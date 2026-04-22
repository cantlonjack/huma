import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import CapitalRadar from "./CapitalRadar";
import type { CapitalScore, CapitalForm } from "@/engine/canvas-types";

/**
 * REGEN-01 component tests for CapitalRadar opacity + dashed-axis shading.
 *
 * Replaces Wave 0 `.skip` stubs. Covers:
 *   - shape fillOpacity floor/ceiling scales with avg confidence
 *   - zero-contribution capitals render dashed axis + hollow vertex dot
 *   - capitals with contributions render solid axis + filled vertex dot
 *
 * Rendering strategy: `renderToStaticMarkup` from react-dom/server. It ships
 * with React 19 (react-dom is in deps) and produces plain SVG HTML we can
 * regex over — no need for @testing-library/react. Tests disable the radar's
 * entrance animation via `animated={false}` so the final score vertices are
 * rendered directly.
 */

const FORMS: CapitalForm[] = [
  "financial",
  "material",
  "living",
  "social",
  "intellectual",
  "experiential",
  "spiritual",
  "cultural",
];

type Override = { score?: number; confidence?: number; note?: string };

function makeProfile(
  overrides: Partial<Record<CapitalForm, Override>> = {},
): CapitalScore[] {
  return FORMS.map((form) => {
    const o = overrides[form];
    const confidence = o?.confidence ?? 0;
    return {
      form,
      score: o?.score ?? 1,
      note: o?.note ?? (confidence === 0 ? "No activity yet" : "ok"),
      confidence,
    };
  });
}

function render(profile: CapitalScore[]): string {
  return renderToStaticMarkup(
    React.createElement(CapitalRadar, { profile, animated: false }),
  );
}

describe("REGEN-01: CapitalRadar opacity + dashed axis", () => {
  it("shape fillOpacity = average confidence across all 8 capitals (full confidence clamps to 0.4 ceiling)", () => {
    const full = makeProfile(
      Object.fromEntries(FORMS.map((f) => [f, { score: 3, confidence: 1 }])) as Partial<
        Record<CapitalForm, Override>
      >,
    );
    const html = render(full);
    // Shape uses the ceiling opacity (0.4) at avgConfidence=1 (multiplied by the 0.4 cap)
    expect(html).toMatch(/fill-opacity="0\.4"/);
  });

  it("all-zero confidence renders shape at floor opacity (0.08) — visible anchor for brand-new operators", () => {
    const empty = makeProfile();
    const html = render(empty);
    expect(html).toMatch(/fill-opacity="0\.08"/);
  });

  it("capital with 0 contributions renders dashed axis ring + hollow vertex dot", () => {
    const mixed = makeProfile({
      living: { score: 3, confidence: 0.5, note: "developing" },
    });
    const html = render(mixed);
    // Dashed axis lines — REGEN-01 visual treatment for zero-contribution capitals
    expect(html).toMatch(/stroke-dasharray="4 4"/);
    // Hollow vertex dot — transparent fill, sage-500 stroke
    expect(html).toMatch(/fill="transparent"/);
  });

  it("capital with >=1 contribution renders solid axis (no strokeDasharray on its axis line)", () => {
    // All 8 capitals carry confidence > 0 and a non-"No activity yet" note
    const allActive = makeProfile(
      Object.fromEntries(
        FORMS.map((f) => [f, { score: 3, confidence: 0.5, note: "developing" }]),
      ) as Partial<Record<CapitalForm, Override>>,
    );
    const html = render(allActive);
    // No dashed axis lines when every capital is active
    expect(html).not.toMatch(/stroke-dasharray/);
    // No hollow (transparent-fill) vertex dots either
    expect(html).not.toMatch(/<circle[^>]+fill="transparent"/);
  });
});
