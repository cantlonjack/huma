import { describe, it, expect } from "vitest";
import { ENTERPRISE_TEMPLATES, buildEnterpriseReferenceBlock } from "@/engine/enterprise-templates";

const CAPITALS = ["financial", "material", "living", "social", "intellectual", "experiential", "spiritual", "cultural"] as const;

describe("Enterprise Templates", () => {
  it("has 20 templates", () => {
    expect(ENTERPRISE_TEMPLATES).toHaveLength(20);
  });

  it("has unique IDs", () => {
    const ids = ENTERPRISE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const template of ENTERPRISE_TEMPLATES) {
    describe(template.name, () => {
      it("has required identity fields", () => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.description).toBeTruthy();
      });

      it("has valid financial data", () => {
        const f = template.financials;
        expect(f.startupCapital.low).toBeGreaterThan(0);
        expect(f.startupCapital.high).toBeGreaterThanOrEqual(f.startupCapital.low);
        expect(f.laborHoursPerWeek.inSeason).toBeTruthy();
        expect(f.laborHoursPerWeek.offSeason).toBeTruthy();
        expect(f.timeToFirstRevenue).toBeTruthy();
        expect(f.year1Revenue.low).toBeGreaterThanOrEqual(0);
        expect(f.year1Revenue.high).toBeGreaterThan(0);
        expect(f.year1Revenue.high).toBeGreaterThanOrEqual(f.year1Revenue.low);
        expect(f.year3Revenue.low).toBeGreaterThanOrEqual(0);
        expect(f.year3Revenue.high).toBeGreaterThan(0);
        expect(f.year3Revenue.high).toBeGreaterThanOrEqual(f.year3Revenue.low);
        expect(f.grossMargin).toBeTruthy();
        expect(f.breakeven).toBeTruthy();
      });

      it("has complete capital profile (all 8 forms, scores 1-5)", () => {
        for (const cap of CAPITALS) {
          const entry = template.capitalProfile[cap];
          expect(entry.score).toBeGreaterThanOrEqual(1);
          expect(entry.score).toBeLessThanOrEqual(5);
          expect(entry.note).toBeTruthy();
        }
      });

      it("has landscape requirements", () => {
        expect(template.landscapeRequirements.climate).toBeTruthy();
        expect(template.landscapeRequirements.water).toBeTruthy();
        expect(template.landscapeRequirements.soils).toBeTruthy();
      });

      it("has fit signals", () => {
        expect(template.fitSignals.loves.length).toBeGreaterThan(0);
        expect(template.fitSignals.skills.length).toBeGreaterThan(0);
      });

      it("has at least one source", () => {
        expect(template.sources.length).toBeGreaterThan(0);
      });

      it("has at least one synergy", () => {
        expect(template.synergies.length).toBeGreaterThan(0);
      });
    });
  }
});

describe("buildEnterpriseReferenceBlock", () => {
  it("returns a non-empty string", () => {
    const block = buildEnterpriseReferenceBlock();
    expect(block.length).toBeGreaterThan(1000);
  });

  it("includes all template names", () => {
    const block = buildEnterpriseReferenceBlock();
    for (const template of ENTERPRISE_TEMPLATES) {
      expect(block).toContain(template.name);
    }
  });
});
