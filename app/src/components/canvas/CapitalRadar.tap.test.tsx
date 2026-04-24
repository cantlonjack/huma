import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import CapitalRadar from "./CapitalRadar";
import type { CapitalScore, CapitalForm } from "@/engine/canvas-types";

/**
 * REGEN-04 component tests — Plan 02-03 fills Wave 0 stubs.
 *
 * Rendering strategy: `renderToStaticMarkup` from react-dom/server. Same pattern
 * as CapitalRadar.confidence.test.tsx. SSR output doesn't serialize React event
 * handlers (onClick does not appear in HTML), so we can't directly observe a
 * click firing without jsdom + @testing-library. Instead we verify:
 *   - The prop is accepted and the component renders without error.
 *   - The hit-area lines + text labels render with `cursor-pointer` class,
 *     confirming interactive surfaces exist.
 *   - Hover tooltip surfaces (onMouseEnter/Move/Leave wiring) remain present —
 *     hover and tap are independent interactions.
 *
 * The full click-fires-onCapitalTap path is covered by:
 *   - `src/__tests__/capital-receipt-math.test.ts` (receipt math parity)
 *   - Manual QA at `/whole` (documented in the plan's verification section)
 */

const FORMS: CapitalForm[] = [
  "financial", "material", "living", "social",
  "intellectual", "experiential", "spiritual", "cultural",
];

function makeProfile(): CapitalScore[] {
  return FORMS.map((form) => ({
    form,
    score: 3,
    note: "ok",
    confidence: 0.5,
  }));
}

describe("REGEN-04: CapitalRadar axis tap opens receipt", () => {
  it("renders without onCapitalTap (prop is optional — backwards compatible)", () => {
    const html = renderToStaticMarkup(
      React.createElement(CapitalRadar, { profile: makeProfile(), animated: false }),
    );
    // Produces an SVG. Both the <svg ...> tag and hover hit-areas are present.
    expect(html).toContain("<svg");
    expect(html).toMatch(/cursor-pointer/);
  });

  it("when onCapitalTap is provided, renders hit-area lines + labels with cursor-pointer class", () => {
    const onTap = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(CapitalRadar, {
        profile: makeProfile(),
        animated: false,
        onCapitalTap: onTap,
      }),
    );
    // 8 capitals × 2 tappable surfaces (line + label) = 16 cursor-pointer occurrences.
    // SSR won't fire onClick so we verify the interactive shapes exist.
    const matches = (html.match(/cursor-pointer/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(16);
  });

  it("preserves hover tooltip surfaces (strokeWidth=16 transparent hit-area lines) regardless of onCapitalTap", () => {
    const html = renderToStaticMarkup(
      React.createElement(CapitalRadar, {
        profile: makeProfile(),
        animated: false,
        onCapitalTap: vi.fn(),
      }),
    );
    // 8 invisible hit-area lines (one per axis) remain in the DOM — tap and
    // hover are independent surfaces; tap wiring must NOT suppress hover.
    const hitAreaLines = (html.match(/stroke="transparent"[^>]*stroke-width="16"/g) || []).length;
    expect(hitAreaLines).toBe(8);
  });

  it("renders all 8 capital labels as tappable text elements", () => {
    const html = renderToStaticMarkup(
      React.createElement(CapitalRadar, {
        profile: makeProfile(),
        animated: false,
        onCapitalTap: vi.fn(),
      }),
    );
    // All 8 capital display names appear as text labels
    const displayNames = [
      "Financial", "Material", "Living", "Social",
      "Intellectual", "Experiential", "Spiritual", "Cultural",
    ];
    for (const name of displayNames) {
      expect(html).toContain(name);
    }
  });
});
