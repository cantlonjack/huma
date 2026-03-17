import { describe, it, expect } from "vitest";
import { buildFullPrompt, buildDocumentPrompt, BASE_SYSTEM_PROMPT, PHASE_PROMPTS, buildOpeningMessage } from "@/engine/phases";

describe("buildFullPrompt", () => {
  it("includes base system prompt", () => {
    const result = buildFullPrompt("ikigai", {});
    expect(result).toContain("You are HUMA");
  });

  it("includes phase-specific instructions for ikigai", () => {
    const result = buildFullPrompt("ikigai", {});
    expect(result).toContain(PHASE_PROMPTS["ikigai"]);
  });

  it("includes phase-specific instructions for landscape", () => {
    const result = buildFullPrompt("landscape", {});
    expect(result).toContain(PHASE_PROMPTS["landscape"]);
  });

  it("appends operator name when provided", () => {
    const result = buildFullPrompt("ikigai", { operatorName: "Sarah" });
    expect(result).toContain("Sarah");
  });

  it("appends accumulated context syntheses", () => {
    const result = buildFullPrompt("landscape", {
      ikigai: { loves: [], skills: [], worldNeeds: [], sustains: [], essenceSynthesis: "She is a builder at heart." },
      holisticContext: { qualityOfLife: "", productionForms: "", futureResourceBase: "", synthesis: "Family-centered life." },
    });
    expect(result).toContain("She is a builder at heart.");
    expect(result).toContain("Family-centered life.");
  });

  it("injects enterprise reference data only during enterprise-map phase", () => {
    const withEnterprise = buildFullPrompt("enterprise-map", {});
    const withoutEnterprise = buildFullPrompt("landscape", {});
    // Enterprise phase should have template data
    expect(withEnterprise.length).toBeGreaterThan(withoutEnterprise.length + 1000);
  });

  it("always includes phase transition instructions", () => {
    const result = buildFullPrompt("ikigai", {});
    expect(result).toContain("[[PHASE:");
  });
});

describe("buildDocumentPrompt", () => {
  const baseSyntheses = {
    operatorName: "Sarah",
    location: "Southern Oregon",
    ikigaiSynthesis: "Builder essence",
    holisticContextSynthesis: "Family first",
    landscapeSynthesis: "12 acres, south slope",
    enterpriseSelections: "Market garden, laying hens",
    nodalInterventions: "Fence the creek",
  };

  it("includes all syntheses", () => {
    const result = buildDocumentPrompt(baseSyntheses);
    expect(result).toContain("Sarah");
    expect(result).toContain("Southern Oregon");
    expect(result).toContain("Builder essence");
    expect(result).toContain("Family first");
    expect(result).toContain("12 acres, south slope");
    expect(result).toContain("Market garden, laying hens");
    expect(result).toContain("Fence the creek");
  });

  it("includes document structure instructions", () => {
    const result = buildDocumentPrompt(baseSyntheses);
    expect(result).toContain("YOUR ESSENCE");
    expect(result).toContain("ENTERPRISE");
    expect(result).toContain("NODAL INTERVENTIONS");
  });
});

describe("buildOpeningMessage", () => {
  it("includes the operator name", () => {
    const msg = buildOpeningMessage("Sarah");
    expect(msg).toContain("Sarah");
  });

  it("includes location when provided", () => {
    const msg = buildOpeningMessage("Sarah", "Southern Oregon");
    expect(msg).toContain("Southern Oregon");
  });

  it("returns a non-empty string", () => {
    expect(buildOpeningMessage("Test").length).toBeGreaterThan(50);
  });
});

describe("BASE_SYSTEM_PROMPT", () => {
  it("contains the seven non-negotiable principles", () => {
    expect(BASE_SYSTEM_PROMPT).toContain("IKIGAI");
    expect(BASE_SYSTEM_PROMPT).toContain("HOLISTIC MANAGEMENT");
    expect(BASE_SYSTEM_PROMPT).toContain("REGRARIANS");
    expect(BASE_SYSTEM_PROMPT).toContain("PERKINS");
    expect(BASE_SYSTEM_PROMPT).toContain("8 FORMS OF CAPITAL");
    expect(BASE_SYSTEM_PROMPT).toContain("SANFORD");
  });

  it("contains voice guidelines", () => {
    expect(BASE_SYSTEM_PROMPT).toContain("NOT a chatbot");
  });

  it("describes 6 phases in the conversation structure", () => {
    expect(BASE_SYSTEM_PROMPT).toContain("6. OPERATIONAL DESIGN");
  });
});

describe("Phase 6: operational-design", () => {
  it("has a phase prompt for operational-design", () => {
    expect(PHASE_PROMPTS["operational-design"]).toBeDefined();
    expect(PHASE_PROMPTS["operational-design"].length).toBeGreaterThan(100);
  });

  it("includes operational-design in phase transition markers", () => {
    const result = buildFullPrompt("operational-design", {});
    expect(result).toContain("[[PHASE:operational-design]]");
  });

  it("includes QoL decomposition in holistic-context phase", () => {
    const result = buildFullPrompt("holistic-context", {});
    expect(result).toContain("QoL Operational Decomposition");
  });

  it("includes enterprise QoL validation in enterprise-map phase", () => {
    const result = buildFullPrompt("enterprise-map", {});
    expect(result).toContain("Enterprise-QoL Validation");
  });

  it("includes operational chains in nodal-interventions phase", () => {
    const result = buildFullPrompt("nodal-interventions", {});
    expect(result).toContain("Nodal Intervention Operational Chains");
  });

  it("buildDocumentPrompt accepts operationalDesign parameter", () => {
    const result = buildDocumentPrompt({
      operatorName: "Test",
      location: "Test",
      ikigaiSynthesis: "",
      holisticContextSynthesis: "",
      landscapeSynthesis: "",
      enterpriseSelections: "",
      nodalInterventions: "",
      operationalDesign: "Weekly rhythm and validation data",
    });
    expect(result).toContain("Weekly rhythm and validation data");
    expect(result).toContain("YOUR WEEK");
    expect(result).toContain("VALIDATION PROTOCOL");
  });

  it("buildDocumentPrompt works without operationalDesign", () => {
    const result = buildDocumentPrompt({
      operatorName: "Test",
      location: "Test",
      ikigaiSynthesis: "",
      holisticContextSynthesis: "",
      landscapeSynthesis: "",
      enterpriseSelections: "",
      nodalInterventions: "",
    });
    expect(result).not.toContain("YOUR WEEK");
  });
});
