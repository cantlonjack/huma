import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import CapitalReceiptSheet from "./CapitalReceiptSheet";
import type { DimensionKey } from "@/types/v2";

/**
 * REGEN-04 component tests — Plan 02-03 fills Wave 0 stubs.
 *
 * Rendering strategy: `renderToStaticMarkup` from react-dom/server. Matches the
 * pattern from CapitalRadar.confidence.test.tsx — SSR output is plain regex-able
 * HTML; useEffect doesn't fire, so we don't need jsdom/@testing-library. The
 * sheet's backdrop-tap dismiss lives in a useEffect so it's a runtime behavior
 * not covered here; parent integration + manual QA covers it.
 */

const activity: Array<{ dimension: DimensionKey; completionRate: number; totalCompletions: number }> = [
  { dimension: "body", completionRate: 24 / 28, totalCompletions: 24 },
  { dimension: "home", completionRate: 10 / 28, totalCompletions: 10 },
];

function render(props: Parameters<typeof CapitalReceiptSheet>[0]): string {
  return renderToStaticMarkup(React.createElement(CapitalReceiptSheet, props));
}

describe("REGEN-04: CapitalReceiptSheet renders reproducible math", () => {
  it("returns null when not open (no markup rendered)", () => {
    const html = render({
      open: false,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    expect(html).toBe("");
  });

  it("returns null when form is null (no markup rendered)", () => {
    const html = render({
      open: true,
      form: null,
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    expect(html).toBe("");
  });

  it("header shows '[Label] — [Score]/5 — [Confidence label]'", () => {
    const html = render({
      open: true,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    expect(html).toContain("Living");
    // Score is 4 for this fixture (body 24/28 primary + home 10/28 secondary → avgRate ≈ 0.691)
    expect(html).toMatch(/4\/5/);
    // Confidence at day 14 = 1.0 → "well-known"
    expect(html).toContain("well-known");
  });

  it("renders each contributing dimension with primary/secondary weight and fraction", () => {
    const html = render({
      open: true,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    // Body is primary for living (1.0×)
    expect(html).toContain("Body");
    expect(html).toContain("primary 1.0×");
    expect(html).toContain("24/28 days");
    // Home is secondary for living (0.5×)
    expect(html).toContain("Home");
    expect(html).toContain("secondary 0.5×");
    expect(html).toContain("10/28 days");
  });

  it("renders the weighted-sum expression matching internal math", () => {
    const html = render({
      open: true,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    // Weighted sum heading present
    expect(html).toContain("Weighted sum");
    // weightSum formatted to 1.5
    expect(html).toContain("(1.5)");
  });

  it("renders the threshold table with exactly one bucket highlighted (bg-sage-100)", () => {
    const html = render({
      open: true,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    const matches = (html.match(/bg-sage-100/g) || []).length;
    expect(matches).toBe(1);
  });

  it("renders confidence as 'XX% (label)' with the correct band at 50%", () => {
    const html = render({
      open: true,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 7, // 7/14 = 0.5 → "getting clearer"
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    expect(html).toMatch(/50%/);
    expect(html).toContain("getting clearer");
  });

  it("renders computed-at ISO timestamp verbatim", () => {
    const iso = "2026-04-20T10:00:00.000Z";
    const html = render({
      open: true,
      form: "living",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: iso,
      onClose: () => {},
    });
    expect(html).toContain(iso);
  });

  it("renders 'No activity yet' fallback when capital has zero contributions", () => {
    // spiritual is not primary/secondary for body or home, so zero contributions
    const html = render({
      open: true,
      form: "spiritual",
      dimensionActivity: activity,
      windowDays: 28,
      daysSinceFirstBehavior: 14,
      computedAt: "2026-04-20T10:00:00.000Z",
      onClose: () => {},
    });
    // Header shows Spiritual at score 1/5
    expect(html).toContain("Spiritual");
    expect(html).toMatch(/1\/5/);
    // No-activity copy appears
    expect(html).toContain("No activity yet");
    // Weighted-sum section hidden when there are no contributions
    expect(html).not.toContain("Weighted sum");
  });
});
