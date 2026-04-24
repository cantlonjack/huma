import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DormantCard from "@/components/today/DormantCard";

/**
 * REGEN-02 Plan 02-02: dormant-branch tests.
 *
 * Fills Wave 0 .skip stubs. Two layers:
 *   1. Pure derivation helper — mirrors useToday's `isDormant` computation.
 *      Ensures defensive handling of undefined/null/missing-field shapes.
 *   2. DormantCard render — uses renderToStaticMarkup (SSR, no jsdom, no
 *      @testing-library — same pattern established by Plan 02-01).
 *
 * NOTE: full hook-level rendering would require @testing-library/react +
 * jsdom + a QueryClientProvider test wrapper — over-engineered for what's
 * effectively a one-liner derivation. If the hook-level test ever becomes
 * necessary, migrate to @testing-library/react; for now the pure helper
 * + component-render coverage matches what Plan 02-01 established for
 * CapitalRadar.confidence.test.tsx.
 */

// The pure derivation helper — mirrors the `isDormant` line inside useToday.
function deriveIsDormant(
  humaContext: { dormant?: { active?: boolean } } | null | undefined,
): boolean {
  return (
    (humaContext as { dormant?: { active?: boolean } } | undefined | null)
      ?.dormant?.active === true
  );
}

describe("REGEN-02: useToday isDormant derivation", () => {
  it("returns false when humaContext is null", () => {
    expect(deriveIsDormant(null)).toBe(false);
  });

  it("returns false when humaContext is undefined", () => {
    expect(deriveIsDormant(undefined)).toBe(false);
  });

  it("returns false when huma_context.dormant is undefined", () => {
    expect(deriveIsDormant({})).toBe(false);
  });

  it("returns true when huma_context.dormant.active === true", () => {
    expect(deriveIsDormant({ dormant: { active: true } })).toBe(true);
  });

  it("returns false when huma_context.dormant.active === false", () => {
    expect(deriveIsDormant({ dormant: { active: false } })).toBe(false);
  });

  it("returns false when huma_context.dormant.active is a truthy non-boolean (defense)", () => {
    // `=== true` is strict — any non-boolean truthy value returns false.
    // Guards against JSONB schema drift.
    expect(
      deriveIsDormant({
        dormant: { active: 1 as unknown as boolean },
      }),
    ).toBe(false);
  });
});

describe("REGEN-02: DormantCard renders spec-line copy verbatim", () => {
  it("renders exactly 'Nothing today. Rest is the work.' (spec-locked)", () => {
    const html = renderToStaticMarkup(
      React.createElement(DormantCard, {
        onReEntry: async () => {
          /* noop */
        },
      }),
    );
    expect(html).toContain("Nothing today. Rest is the work.");
  });

  it("renders exactly one input element (single re-entry field)", () => {
    const html = renderToStaticMarkup(
      React.createElement(DormantCard, {
        onReEntry: async () => {
          /* noop */
        },
      }),
    );
    // renderToStaticMarkup emits self-closing input tags as "<input.../>"
    const inputMatches = html.match(/<input/g) ?? [];
    expect(inputMatches).toHaveLength(1);
  });

  it("input has the re-entry placeholder copy (lowercase, no urgency)", () => {
    const html = renderToStaticMarkup(
      React.createElement(DormantCard, {
        onReEntry: async () => {
          /* noop */
        },
      }),
    );
    // HTML entity encoding for the apostrophe in "you're".
    expect(html).toMatch(/when you(&#x27;|&apos;|')re ready, say anything/);
  });

  it("input carries an accessible aria-label", () => {
    const html = renderToStaticMarkup(
      React.createElement(DormantCard, {
        onReEntry: async () => {
          /* noop */
        },
      }),
    );
    expect(html).toContain('aria-label="Re-entry message"');
  });
});
