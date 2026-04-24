import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FallowCard from "@/components/today/FallowCard";
import { isFallow } from "@/lib/fallow";

/**
 * REGEN-05 Plan 02-04: fallow-branch tests.
 *
 * Replaces Wave 0 .skip stubs. Two layers matching Plan 02-02's dormancy
 * test pattern:
 *   1. Pure derivation helper — the same `isFallow(humaContext, date)` call
 *      `useToday` uses. Ensures defensive handling of all missing-field
 *      shapes (null humaContext, undefined fallowDays, non-array values).
 *   2. FallowCard render — renderToStaticMarkup (SSR, no jsdom, no
 *      @testing-library). Matches the component-test convention Plan 02-01
 *      established and Plan 02-02 repeated.
 *
 * NOTE: full hook-level rendering is over-engineered for the one-liner
 * derivation; if ever needed, migrate to @testing-library/react and a
 * QueryClientProvider test wrapper.
 */

describe("REGEN-05: useToday isFallow derivation (lib/fallow.isFallow)", () => {
  it("returns false when humaContext is null", () => {
    expect(isFallow(null, "2026-04-22")).toBe(false);
  });

  it("returns false when humaContext is undefined", () => {
    expect(isFallow(undefined, "2026-04-22")).toBe(false);
  });

  it("returns false when huma_context.fallowDays is undefined", () => {
    expect(isFallow({}, "2026-04-22")).toBe(false);
  });

  it("returns true when today is in fallowDays", () => {
    expect(isFallow({ fallowDays: ["2026-04-22"] }, "2026-04-22")).toBe(true);
  });

  it("returns false when today is not in fallowDays (yesterday stays fallow, today does not)", () => {
    expect(isFallow({ fallowDays: ["2026-04-21"] }, "2026-04-22")).toBe(false);
  });

  it("returns false when fallowDays is a non-array (JSONB schema drift defense)", () => {
    expect(
      isFallow(
        { fallowDays: "2026-04-22" as unknown as string[] },
        "2026-04-22",
      ),
    ).toBe(false);
  });
});

describe("REGEN-05: FallowCard renders spec-line copy verbatim", () => {
  it("renders exactly 'Fallow. Compost day.' (spec-locked)", () => {
    const html = renderToStaticMarkup(
      React.createElement(FallowCard, {
        onUnmark: async () => {
          /* noop */
        },
      }),
    );
    expect(html).toContain("Fallow. Compost day.");
  });

  it("renders the same-day unmark affordance", () => {
    const html = renderToStaticMarkup(
      React.createElement(FallowCard, {
        onUnmark: async () => {
          /* noop */
        },
      }),
    );
    expect(html).toContain("unmark for today");
  });

  it("unmark button carries an accessible aria-label", () => {
    const html = renderToStaticMarkup(
      React.createElement(FallowCard, {
        onUnmark: async () => {
          /* noop */
        },
      }),
    );
    expect(html).toContain('aria-label="Unmark fallow for today"');
  });

  it("renders exactly one button (single unmark affordance)", () => {
    const html = renderToStaticMarkup(
      React.createElement(FallowCard, {
        onUnmark: async () => {
          /* noop */
        },
      }),
    );
    const buttonMatches = html.match(/<button/g) ?? [];
    expect(buttonMatches).toHaveLength(1);
  });
});

/**
 * REGEN-01 interaction guard: the 14-day confidence clock must keep
 * advancing on fallow days. capital-computation.ts computes confidence as
 * `min(1, daysSinceFirstBehavior / 14)` — calendar days, NOT active days.
 * That formula already handles this correctly; this test pins the
 * invariant so a future refactor can't silently introduce a fallow-day
 * special case.
 *
 * The day-count itself is a calendar-day integer; this test asserts that
 * the same calendar-day number feeds the same confidence value regardless
 * of whether those days were "active" or "fallow".
 */
describe("REGEN-05 × REGEN-01: confidence clock ticks during fallow days", () => {
  it("daysSinceFirstBehavior advances on fallow days (calendar-day formula, not active-day formula)", async () => {
    const { computeCapitalScores } = await import(
      "@/lib/capital-computation"
    );
    const activity = [
      {
        dimension: "body" as const,
        completionRate: 0.5,
        totalCompletions: 7,
      },
    ];

    // 14 calendar days since first behavior — confidence hits 1.0 regardless
    // of how many of those days were "active" (fewer totalCompletions
    // = more fallow days, but calendar-day clock doesn't care).
    const active14 = computeCapitalScores(activity, 14, 28, 14);
    const mostlyFallow14 = computeCapitalScores(activity, 7, 28, 14);

    // Both hit confidence:1 — the calendar day count is what advances the
    // shader, not the activity-day count. Fallow weeks preserve confidence.
    const getLivingConfidence = (scores: ReturnType<typeof computeCapitalScores>) =>
      scores.find((s) => s.form === "living")?.confidence;
    expect(getLivingConfidence(active14)).toBe(1);
    expect(getLivingConfidence(mostlyFallow14)).toBe(1);
  });
});
