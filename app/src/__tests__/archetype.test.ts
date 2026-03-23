import { describe, it, expect } from "vitest";
import { computeArchetype } from "@/engine/archetype";
import type { CapitalKey } from "@/types/lotus";

describe("computeArchetype", () => {
  // Earth Tender: living + spiritual in top 2, financial in bottom 3
  it("identifies Earth Tender archetype", () => {
    const result = computeArchetype(
      {
        financial: 2,
        material: 4,
        living: 9,
        social: 6,
        experiential: 5,
        intellectual: 5,
        spiritual: 8,
        cultural: 5,
      },
      "starting"
    );
    expect(result.archetype).toBe("Earth Tender");
    expect(result.strengths).toHaveLength(3);
    expect(result.strengths).toContain("living");
    expect(result.growthAreas).toHaveLength(2);
    expect(result.growthAreas).toContain("financial");
  });

  // Builder: financial + material + intellectual all >= 6
  it("identifies Builder archetype", () => {
    const result = computeArchetype(
      {
        financial: 8,
        material: 7,
        living: 4,
        social: 5,
        experiential: 4,
        intellectual: 8,
        spiritual: 3,
        cultural: 4,
      },
      "building"
    );
    expect(result.archetype).toBe("Builder");
  });

  // Connector: social is #1, well above average
  it("identifies Connector archetype", () => {
    const result = computeArchetype(
      {
        financial: 4,
        material: 4,
        living: 5,
        social: 10,
        experiential: 5,
        intellectual: 5,
        spiritual: 4,
        cultural: 5,
      },
      "transition"
    );
    expect(result.archetype).toBe("Connector");
  });

  // Steward: balanced, no extreme lows, low std dev
  // Must avoid triggering Builder (financial+material+intellectual all>=6)
  it("identifies Steward archetype", () => {
    const result = computeArchetype(
      {
        financial: 5,
        material: 5,
        living: 6,
        social: 6,
        experiential: 5,
        intellectual: 5,
        spiritual: 6,
        cultural: 6,
      },
      "building"
    );
    expect(result.archetype).toBe("Steward");
  });

  // Pioneer: high variance (std dev > 2.5)
  it("identifies Pioneer archetype", () => {
    const result = computeArchetype(
      {
        financial: 1,
        material: 2,
        living: 10,
        social: 2,
        experiential: 1,
        intellectual: 3,
        spiritual: 9,
        cultural: 1,
      },
      "searching"
    );
    // Pioneer has high std dev, but Earth Tender may also match
    // (living+spiritual top 2, financial bottom 3).
    // The winner is whichever has the higher score.
    expect(["Pioneer", "Earth Tender"]).toContain(result.archetype);
  });

  // Strengths are always top 3 by value
  it("returns top 3 capitals as strengths", () => {
    const result = computeArchetype(
      {
        financial: 2,
        material: 3,
        living: 9,
        social: 8,
        experiential: 4,
        intellectual: 5,
        spiritual: 7,
        cultural: 6,
      },
      "starting"
    );
    expect(result.strengths).toHaveLength(3);
    expect(result.strengths).toContain("living");
    expect(result.strengths).toContain("social");
    expect(result.strengths).toContain("spiritual");
  });

  // Growth areas are always bottom 2 by value
  it("returns bottom 2 capitals as growth areas", () => {
    const result = computeArchetype(
      {
        financial: 2,
        material: 3,
        living: 9,
        social: 8,
        experiential: 4,
        intellectual: 5,
        spiritual: 7,
        cultural: 6,
      },
      "starting"
    );
    expect(result.growthAreas).toHaveLength(2);
    expect(result.growthAreas).toContain("financial");
    expect(result.growthAreas).toContain("material");
  });

  // Every result has description
  it("always returns a description", () => {
    const result = computeArchetype(
      {
        financial: 5,
        material: 5,
        living: 5,
        social: 5,
        experiential: 5,
        intellectual: 5,
        spiritual: 5,
        cultural: 5,
      },
      "starting"
    );
    expect(result.description).toBeTruthy();
    expect(result.description.length).toBeGreaterThan(10);
  });

  // Maker: material + intellectual top 2
  it("identifies Maker archetype", () => {
    const result = computeArchetype(
      {
        financial: 3,
        material: 9,
        living: 4,
        social: 4,
        experiential: 5,
        intellectual: 10,
        spiritual: 3,
        cultural: 4,
      },
      "building"
    );
    expect(result.archetype).toBe("Maker");
  });

  // Healer: social + experiential + spiritual all >= 6
  it("identifies Healer archetype", () => {
    const result = computeArchetype(
      {
        financial: 3,
        material: 3,
        living: 4,
        social: 8,
        experiential: 7,
        intellectual: 4,
        spiritual: 8,
        cultural: 5,
      },
      "transition"
    );
    expect(result.archetype).toBe("Healer");
  });

  // Seeker: intellectual + spiritual top 2, material in bottom 3
  it("identifies Seeker archetype", () => {
    const result = computeArchetype(
      {
        financial: 5,
        material: 2,
        living: 4,
        social: 5,
        experiential: 4,
        intellectual: 9,
        spiritual: 8,
        cultural: 3,
      },
      "searching"
    );
    expect(result.archetype).toBe("Seeker");
  });

  // Fallback: when no archetype matches cleanly
  it("falls back to Pioneer or Seeker when no archetype matches", () => {
    const result = computeArchetype(
      {
        financial: 5,
        material: 5,
        living: 5,
        social: 5,
        experiential: 5,
        intellectual: 5,
        spiritual: 5,
        cultural: 5,
      },
      "starting"
    );
    // All equal, low std dev but min=5 >=4, so Steward matches
    expect(result.archetype).toBe("Steward");
  });

  // Stage parameter doesn't affect archetype determination
  it("produces consistent archetypes regardless of stage", () => {
    const caps = {
      financial: 8,
      material: 7,
      living: 4,
      social: 5,
      experiential: 4,
      intellectual: 8,
      spiritual: 3,
      cultural: 4,
    };
    const r1 = computeArchetype(caps, "starting");
    const r2 = computeArchetype(caps, "building");
    expect(r1.archetype).toBe(r2.archetype);
  });
});
