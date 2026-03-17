import { describe, it, expect } from "vitest";
import { cleanForDisplay, parseMarkers } from "@/lib/markers";

describe("cleanForDisplay", () => {
  it("strips complete PHASE markers", () => {
    expect(cleanForDisplay("Hello world [[PHASE:landscape]] ")).toBe("Hello world");
  });

  it("strips complete CONTEXT markers with content", () => {
    expect(cleanForDisplay("Hello [[CONTEXT:ikigai-synthesis]]Some synthesis text")).toBe("Hello");
  });

  it("strips partial markers at end of stream", () => {
    expect(cleanForDisplay("Hello world [[PHA")).toBe("Hello world");
    expect(cleanForDisplay("Hello world [[CONTEXT:ik")).toBe("Hello world");
  });

  it("strips bare trailing [[", () => {
    expect(cleanForDisplay("Hello world [[")).toBe("Hello world");
  });

  it("leaves clean text unchanged", () => {
    expect(cleanForDisplay("Just normal text")).toBe("Just normal text");
  });

  it("handles multiple markers in sequence", () => {
    const input = "Text here [[CONTEXT:ikigai-synthesis]]Synth content [[PHASE:holistic-context]] ";
    expect(cleanForDisplay(input)).toBe("Text here");
  });

  it("handles empty string", () => {
    expect(cleanForDisplay("")).toBe("");
  });
});

describe("parseMarkers", () => {
  it("detects a phase transition", () => {
    const result = parseMarkers("Some text [[PHASE:landscape]]");
    expect(result.phase).toBe("landscape");
    expect(result.isComplete).toBe(false);
  });

  it("detects completion", () => {
    const result = parseMarkers("Closing text [[PHASE:complete]]");
    expect(result.isComplete).toBe(true);
    expect(result.phase).toBeNull();
  });

  it("extracts context with value", () => {
    const input = "Visible text [[CONTEXT:ikigai-synthesis]]She loves the forest and the soil.";
    const result = parseMarkers(input);
    expect(result.capturedContexts).toHaveLength(1);
    expect(result.capturedContexts[0].type).toBe("ikigai-synthesis");
    expect(result.capturedContexts[0].value).toBe("She loves the forest and the soil.");
    expect(result.clean).toBe("Visible text");
  });

  it("handles phase + context together", () => {
    const input = "Bridging text [[PHASE:landscape]] [[CONTEXT:holistic-synthesis]]Quality of life centered on family.";
    const result = parseMarkers(input);
    expect(result.phase).toBe("landscape");
    expect(result.capturedContexts).toHaveLength(1);
    expect(result.capturedContexts[0].type).toBe("holistic-synthesis");
    expect(result.capturedContexts[0].value).toBe("Quality of life centered on family.");
  });

  it("returns clean text without markers", () => {
    const result = parseMarkers("No markers here");
    expect(result.clean).toBe("No markers here");
    expect(result.phase).toBeNull();
    expect(result.isComplete).toBe(false);
    expect(result.capturedContexts).toHaveLength(0);
  });

  it("handles multiple context captures", () => {
    const input = "Text [[CONTEXT:enterprises]]Market garden\nLaying hens[[CONTEXT:nodal-interventions]]Build ponds first";
    const result = parseMarkers(input);
    expect(result.capturedContexts).toHaveLength(2);
    expect(result.capturedContexts[0].type).toBe("enterprises");
    expect(result.capturedContexts[1].type).toBe("nodal-interventions");
    expect(result.capturedContexts[1].value).toBe("Build ponds first");
  });

  it("detects all valid phase names", () => {
    const phases = ["ikigai", "holistic-context", "landscape", "enterprise-map", "nodal-interventions", "operational-design"];
    for (const phase of phases) {
      const result = parseMarkers(`text [[PHASE:${phase}]]`);
      expect(result.phase).toBe(phase);
    }
  });
});
