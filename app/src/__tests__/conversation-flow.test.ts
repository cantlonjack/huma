import { describe, it, expect } from "vitest";
import { cleanForDisplay, parseMarkers } from "@/lib/markers";
import {
  buildFullPrompt,
  buildDocumentPrompt,
  buildOpeningMessage,
  PHASE_PROMPTS,
} from "@/engine/phases";
import { buildCanvasDataPrompt } from "@/engine/canvas-prompt";
import { type Phase, type ConversationContext } from "@/engine/types";

// ─── Helpers ───

/** Simulate what useConversation.accumulateContext does, but as a pure function */
function accumulateContext(
  current: Partial<ConversationContext>,
  capturedContexts: { type: string; value: string }[]
): Partial<ConversationContext> {
  let ctx = { ...current };
  for (const { type: contextType, value: contextValue } of capturedContexts) {
    if (contextType === "ikigai-synthesis") {
      ctx = {
        ...ctx,
        ikigai: {
          loves: [],
          skills: [],
          worldNeeds: [],
          sustains: [],
          essenceSynthesis: contextValue,
        },
      };
    } else if (contextType === "holistic-synthesis") {
      ctx = {
        ...ctx,
        holisticContext: {
          qualityOfLife: "",
          productionForms: "",
          futureResourceBase: "",
          synthesis: contextValue,
        },
      };
    } else if (contextType === "landscape-synthesis") {
      ctx = {
        ...ctx,
        landscape: {
          location: "",
          climate: "",
          geography: "",
          water: "",
          access: "",
          forestry: "",
          buildings: "",
          fencing: "",
          soils: "",
          synthesis: contextValue,
        },
      };
    } else if (contextType === "enterprises") {
      ctx = {
        ...ctx,
        enterprises: {
          candidates: [],
          selected: contextValue.split("\n").filter(Boolean),
          reasoning: contextValue,
        },
      };
    } else if (contextType === "nodal-interventions") {
      ctx = {
        ...ctx,
        nodalInterventions: {
          actions: contextValue.split("\n").filter(Boolean),
          cascadeAnalysis: contextValue,
        },
      };
    } else if (contextType === "operational-design") {
      ctx = {
        ...ctx,
        operationalDesign: {
          weeklyRhythm: contextValue,
          validationProtocol: "",
          seasonalCadence: "",
          synthesis: contextValue,
        },
      };
    }
  }
  return ctx;
}

// Realistic test data simulating a full conversation
const SAMPLE_SYNTHESES = {
  operatorName: "Marcus Chen",
  location: "Willamette Valley, Oregon",
  ikigaiSynthesis:
    "Marcus is a builder and grower at heart. Twenty years in carpentry gave him an eye for structure and material. His love runs toward food — growing it, preserving it, feeding people with it. The world around him needs local food access and land stewardship. Sustainability means $4,000/month minimum, no debt.",
  holisticContextSynthesis:
    "Quality of life centered on mornings in the field, afternoons building, evenings with his partner. Won't sacrifice weekends or take on employees in year one. Production through intensive vegetables, value-added preserves, and carpentry repair. Resource base commitment: build soil organic matter from 2% to 5% over five years, maintain zero debt, preserve the creek corridor.",
  landscapeSynthesis:
    "7 acres in the Willamette Valley, zone 8b. South-facing slope with good drainage. A year-round creek bisects the lower third. Municipal water available but expensive. Two outbuildings in fair condition — one could become a wash/pack station. Clay-loam soils, currently compacted from prior cattle. Strong social capital through farmers market connections. Access is good — paved road frontage, 20 minutes to Salem.",
  enterpriseSelections:
    "Market Garden (anchor): $3,000-5,000 startup, 20hrs/wk in season, $15,000-25,000 year 1.\nPastured Laying Hens (partner): $2,000 startup, 5hrs/wk, $6,000-10,000 year 1.\nFarm-to-Table Carpentry (multiplier): $500 startup, 10hrs/wk, $8,000-12,000 year 1.",
  nodalInterventions:
    "1. Fence the creek corridor ($800, one weekend) — enables rotational grazing, protects water quality, creates visible landscape change.\n2. Build two 100ft beds on the south slope ($400, two weekends) — first revenue in 8 weeks, proves the soil, builds market relationships.\n3. Convert the east outbuilding to wash/pack ($1,200, three weekends) — enables food safety compliance, creates efficient workflow, doubles as carpentry workshop off-season.",
  operationalDesign:
    "Monday: planning and market prep. Tuesday-Thursday: field days, 6am-2pm hard stop. Friday: carpentry and maintenance. Saturday: farmers market. Sunday: rest, no exceptions. Validation: 5+ evenings free per week, zero weekend field work, $3,500+/month by month 8.",
};

// ─── Test Suites ───

describe("Phase marker extraction flow", () => {
  it("extracts [[PHASE:landscape]] from a stream response", () => {
    const streamResponse =
      "Now I want to understand the land itself. Let's walk through your place together.\n[[PHASE:landscape]]";
    const result = parseMarkers(streamResponse);
    expect(result.phase).toBe("landscape");
    expect(result.isComplete).toBe(false);
    expect(result.clean).not.toContain("[[PHASE:");
  });

  it("extracts phase from mid-text marker position", () => {
    const text = "Some bridging text [[PHASE:enterprise-map]] trailing whitespace";
    const result = parseMarkers(text);
    expect(result.phase).toBe("enterprise-map");
  });

  it("cleanForDisplay strips the phase marker cleanly", () => {
    const raw = "Visible conversation text\n[[PHASE:holistic-context]] ";
    const display = cleanForDisplay(raw);
    expect(display).toBe("Visible conversation text");
    expect(display).not.toContain("PHASE");
  });

  it("identifies [[PHASE:complete]] as completion, not phase transition", () => {
    const text = "Your map is ready.\n[[PHASE:complete]]";
    const result = parseMarkers(text);
    expect(result.isComplete).toBe(true);
    expect(result.phase).toBeNull();
  });

  it("recognizes all six navigable phase transitions", () => {
    const phases: Phase[] = [
      "holistic-context",
      "landscape",
      "enterprise-map",
      "nodal-interventions",
      "operational-design",
    ];
    for (const phase of phases) {
      const result = parseMarkers(`text [[PHASE:${phase}]]`);
      expect(result.phase).toBe(phase);
      expect(result.isComplete).toBe(false);
    }
  });
});

describe("Context accumulation flow", () => {
  it("extracts [[CONTEXT:ikigai-synthesis]] value from stream response", () => {
    const stream =
      "Bridging text [[CONTEXT:ikigai-synthesis]]She loves the forest and building with her hands. Her carpentry skills are uncommon. The community needs local food.";
    const result = parseMarkers(stream);
    expect(result.capturedContexts).toHaveLength(1);
    expect(result.capturedContexts[0].type).toBe("ikigai-synthesis");
    expect(result.capturedContexts[0].value).toContain("carpentry skills");
  });

  it("extracts multiline context values correctly", () => {
    const stream =
      "Visible text [[CONTEXT:enterprises]]Market garden — anchor enterprise\nLaying hens — partner enterprise\nCarpentry — multiplier";
    const result = parseMarkers(stream);
    expect(result.capturedContexts).toHaveLength(1);
    expect(result.capturedContexts[0].value).toContain("Market garden");
    expect(result.capturedContexts[0].value).toContain("Laying hens");
    expect(result.capturedContexts[0].value).toContain("Carpentry");
  });

  it("clean text excludes all context marker content", () => {
    const stream =
      "Here is the bridge [[CONTEXT:holistic-synthesis]]Family-centered. No debt. Soil health commitment.";
    const result = parseMarkers(stream);
    expect(result.clean).toBe("Here is the bridge");
    expect(result.clean).not.toContain("Family-centered");
  });
});

describe("Multiple markers in single response", () => {
  it("extracts both phase and context from a single response", () => {
    const stream =
      "Let's walk through your place together.\n[[PHASE:landscape]]\n[[CONTEXT:holistic-synthesis]]Quality of life centered on family presence. Won't sacrifice mornings with kids.";
    const result = parseMarkers(stream);
    expect(result.phase).toBe("landscape");
    expect(result.capturedContexts).toHaveLength(1);
    expect(result.capturedContexts[0].type).toBe("holistic-synthesis");
    expect(result.capturedContexts[0].value).toContain("family presence");
  });

  it("extracts two context markers from a single response", () => {
    const stream =
      "Closing text [[CONTEXT:enterprises]]Market garden, laying hens, carpentry[[CONTEXT:nodal-interventions]]Fence the creek, build beds, convert outbuilding";
    const result = parseMarkers(stream);
    expect(result.capturedContexts).toHaveLength(2);
    expect(result.capturedContexts[0].type).toBe("enterprises");
    expect(result.capturedContexts[1].type).toBe("nodal-interventions");
  });

  it("extracts phase + two contexts from a single response", () => {
    const stream =
      "Bridge text [[PHASE:enterprise-map]] [[CONTEXT:landscape-synthesis]]7 acres, clay-loam, south slope[[CONTEXT:holistic-synthesis]]Family first, zero debt";
    const result = parseMarkers(stream);
    expect(result.phase).toBe("enterprise-map");
    expect(result.capturedContexts).toHaveLength(2);
    const types = result.capturedContexts.map((c) => c.type);
    expect(types).toContain("landscape-synthesis");
    expect(types).toContain("holistic-synthesis");
  });

  it("clean text removes all markers, leaving only visible content", () => {
    const stream =
      "Here's what I see. [[PHASE:nodal-interventions]] [[CONTEXT:enterprises]]Three enterprises selected.";
    const result = parseMarkers(stream);
    expect(result.clean).toBe("Here's what I see.");
  });
});

describe("Complete conversation context building", () => {
  it("accumulates all six context types across simulated phase transitions", () => {
    let ctx: Partial<ConversationContext> = { operatorName: "Marcus Chen" };

    // Phase 1 -> 2: ikigai synthesis captured
    const phase1Result = parseMarkers(
      "Bridge [[PHASE:holistic-context]] [[CONTEXT:ikigai-synthesis]]Builder and grower. Carpentry for 20 years."
    );
    ctx = accumulateContext(ctx, phase1Result.capturedContexts);
    expect(ctx.ikigai?.essenceSynthesis).toContain("Builder and grower");

    // Phase 2 -> 3: holistic synthesis captured
    const phase2Result = parseMarkers(
      "Bridge [[PHASE:landscape]] [[CONTEXT:holistic-synthesis]]Family-centered, zero debt, soil health."
    );
    ctx = accumulateContext(ctx, phase2Result.capturedContexts);
    expect(ctx.holisticContext?.synthesis).toContain("Family-centered");

    // Phase 3 -> 4: landscape synthesis captured
    const phase3Result = parseMarkers(
      "Bridge [[PHASE:enterprise-map]] [[CONTEXT:landscape-synthesis]]7 acres Willamette Valley, clay-loam, year-round creek."
    );
    ctx = accumulateContext(ctx, phase3Result.capturedContexts);
    expect(ctx.landscape?.synthesis).toContain("Willamette Valley");

    // Phase 4 -> 5: enterprises captured
    const phase4Result = parseMarkers(
      "Bridge [[PHASE:nodal-interventions]] [[CONTEXT:enterprises]]Market garden\nLaying hens\nCarpentry"
    );
    ctx = accumulateContext(ctx, phase4Result.capturedContexts);
    expect(ctx.enterprises?.selected).toHaveLength(3);
    expect(ctx.enterprises?.reasoning).toContain("Market garden");

    // Phase 5 -> 6: nodal interventions captured
    const phase5Result = parseMarkers(
      "Bridge [[PHASE:operational-design]] [[CONTEXT:nodal-interventions]]Fence creek\nBuild beds\nConvert outbuilding"
    );
    ctx = accumulateContext(ctx, phase5Result.capturedContexts);
    expect(ctx.nodalInterventions?.cascadeAnalysis).toContain("Fence creek");
    expect(ctx.nodalInterventions?.actions).toHaveLength(3);

    // Phase 6 -> complete: operational design captured
    const phase6Result = parseMarkers(
      "Bridge [[PHASE:complete]] [[CONTEXT:operational-design]]Mon planning, Tue-Thu field, Fri carpentry, Sat market, Sun rest."
    );
    ctx = accumulateContext(ctx, phase6Result.capturedContexts);
    expect(ctx.operationalDesign?.synthesis).toContain("Mon planning");

    // Verify the full context is populated
    expect(ctx.operatorName).toBe("Marcus Chen");
    expect(ctx.ikigai).toBeDefined();
    expect(ctx.holisticContext).toBeDefined();
    expect(ctx.landscape).toBeDefined();
    expect(ctx.enterprises).toBeDefined();
    expect(ctx.nodalInterventions).toBeDefined();
    expect(ctx.operationalDesign).toBeDefined();
  });

  it("later context captures overwrite earlier ones for the same type", () => {
    let ctx: Partial<ConversationContext> = {};

    const first = parseMarkers("[[CONTEXT:ikigai-synthesis]]First version of essence.");
    ctx = accumulateContext(ctx, first.capturedContexts);
    expect(ctx.ikigai?.essenceSynthesis).toBe("First version of essence.");

    const second = parseMarkers("[[CONTEXT:ikigai-synthesis]]Revised and deeper essence.");
    ctx = accumulateContext(ctx, second.capturedContexts);
    expect(ctx.ikigai?.essenceSynthesis).toBe("Revised and deeper essence.");
  });

  it("enterprises.selected splits on newlines and filters empty lines", () => {
    const result = parseMarkers(
      "[[CONTEXT:enterprises]]Market garden\n\nLaying hens\n\nCarpentry\n"
    );
    const ctx = accumulateContext({}, result.capturedContexts);
    expect(ctx.enterprises?.selected).toEqual([
      "Market garden",
      "Laying hens",
      "Carpentry",
    ]);
  });
});

describe("Document generation prompt building", () => {
  it("produces a non-empty prompt with all synthesis data interpolated", () => {
    const prompt = buildDocumentPrompt(SAMPLE_SYNTHESES);
    expect(prompt.length).toBeGreaterThan(500);
    expect(prompt).toContain("Marcus Chen");
    expect(prompt).toContain("Willamette Valley, Oregon");
    expect(prompt).toContain("builder and grower");
    expect(prompt).toContain("mornings in the field");
    expect(prompt).toContain("7 acres");
    expect(prompt).toContain("Market Garden");
    expect(prompt).toContain("Fence the creek");
  });

  it("includes the document structure sections", () => {
    const prompt = buildDocumentPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("YOUR ESSENCE");
    expect(prompt).toContain("YOUR HOLISTIC CONTEXT");
    expect(prompt).toContain("YOUR LANDSCAPE");
    expect(prompt).toContain("ENTERPRISE");
    expect(prompt).toContain("CAPITAL PROFILE");
    expect(prompt).toContain("NODAL INTERVENTIONS");
    expect(prompt).toContain("CLOSING");
  });

  it("includes operational design section when provided", () => {
    const prompt = buildDocumentPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("Operational Design");
    expect(prompt).toContain("Monday: planning");
  });

  it("omits operational design section when not provided", () => {
    const { operationalDesign: _, ...withoutOps } = SAMPLE_SYNTHESES;
    const prompt = buildDocumentPrompt(withoutOps);
    expect(prompt).not.toContain("## Operational Design\n");
  });

  it("instructs the model to generate a printable, wall-worthy document", () => {
    const prompt = buildDocumentPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("print");
    expect(prompt).toContain("wall");
  });
});

describe("Canvas data prompt building", () => {
  it("produces valid prompt text with all syntheses interpolated", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    expect(prompt.length).toBeGreaterThan(500);
    expect(prompt).toContain("Marcus Chen");
    expect(prompt).toContain("Willamette Valley, Oregon");
    expect(prompt).toContain("builder and grower");
    expect(prompt).toContain("7 acres");
    expect(prompt).toContain("Market Garden");
    expect(prompt).toContain("Fence the creek");
  });

  it("instructs the model to output JSON matching CanvasData interface", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("CanvasData");
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("essence");
    expect(prompt).toContain("qolNodes");
    expect(prompt).toContain("capitalProfile");
    expect(prompt).toContain("fieldLayers");
    expect(prompt).toContain("enterprises");
    expect(prompt).toContain("nodalInterventions");
  });

  it("includes the enterprise role taxonomy", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("anchor");
    expect(prompt).toContain("foundation");
    expect(prompt).toContain("partner");
    expect(prompt).toContain("long-game");
    expect(prompt).toContain("multiplier");
  });

  it("includes all 8 capital forms in the interface definition", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    const capitals = [
      "financial",
      "material",
      "living",
      "social",
      "intellectual",
      "experiential",
      "spiritual",
      "cultural",
    ];
    for (const capital of capitals) {
      expect(prompt).toContain(capital);
    }
  });

  it("includes weeklyRhythm and validationChecks in the interface", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("weeklyRhythm");
    expect(prompt).toContain("validationChecks");
    expect(prompt).toContain("seasonalArc");
  });

  it("includes operational design when provided", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    expect(prompt).toContain("Monday: planning");
    expect(prompt).toContain("Operational Design");
  });

  it("omits operational design section when not provided", () => {
    const { operationalDesign: _, ...withoutOps } = SAMPLE_SYNTHESES;
    const prompt = buildCanvasDataPrompt(withoutOps);
    expect(prompt).not.toContain("## Operational Design\n");
  });

  it("includes today's date in the prompt", () => {
    const prompt = buildCanvasDataPrompt(SAMPLE_SYNTHESES);
    const todayISO = new Date().toISOString().split("T")[0];
    expect(prompt).toContain(todayISO);
  });
});

describe("Full prompt building with context", () => {
  it("ikigai phase includes ikigai-specific instructions", () => {
    const prompt = buildFullPrompt("ikigai", {});
    expect(prompt).toContain("Purpose Discovery");
    expect(prompt).toContain("What brought you to this moment");
  });

  it("landscape phase includes Regrarians sequence instructions", () => {
    const prompt = buildFullPrompt("landscape", {});
    expect(prompt).toContain("Regrarians");
    expect(prompt).toContain("LOCATION & CLIMATE");
    expect(prompt).toContain("WATER");
    expect(prompt).toContain("SOILS");
  });

  it("enterprise-map phase includes Perkins-style one-pager format", () => {
    const prompt = buildFullPrompt("enterprise-map", {});
    expect(prompt).toContain("PERKINS-STYLE");
    expect(prompt).toContain("Startup investment");
    expect(prompt).toContain("Revenue timeline");
  });

  it("system prompt changes based on phase", () => {
    const ikigaiPrompt = buildFullPrompt("ikigai", {});
    const landscapePrompt = buildFullPrompt("landscape", {});
    const enterprisePrompt = buildFullPrompt("enterprise-map", {});

    // Each should have different phase-specific content
    expect(ikigaiPrompt).toContain("Purpose Discovery");
    expect(ikigaiPrompt).not.toContain("Regrarians Sequence");

    expect(landscapePrompt).toContain("Landscape Reading");
    expect(landscapePrompt).not.toContain("Purpose Discovery");

    expect(enterprisePrompt).toContain("Enterprise Map");
    expect(enterprisePrompt).not.toContain("Purpose Discovery");
  });

  it("accumulated context from earlier phases is injected into later phases", () => {
    const ctx: Partial<ConversationContext> = {
      operatorName: "Marcus",
      ikigai: {
        loves: [],
        skills: [],
        worldNeeds: [],
        sustains: [],
        essenceSynthesis: "Builder and grower at heart.",
      },
      holisticContext: {
        qualityOfLife: "",
        productionForms: "",
        futureResourceBase: "",
        synthesis: "Family-centered, no debt, soil health.",
      },
    };

    const prompt = buildFullPrompt("landscape", ctx);
    expect(prompt).toContain("Marcus");
    expect(prompt).toContain("Builder and grower at heart.");
    expect(prompt).toContain("Family-centered, no debt, soil health.");
    expect(prompt).toContain("Accumulated: Ikigai Synthesis");
    expect(prompt).toContain("Accumulated: Holistic Context");
  });

  it("enterprise phase includes enterprise reference data block", () => {
    const prompt = buildFullPrompt("enterprise-map", {});
    // Enterprise reference data is injected only in enterprise-map phase
    // The reference block is substantially longer than other phases
    const landscapePrompt = buildFullPrompt("landscape", {});
    expect(prompt.length).toBeGreaterThan(landscapePrompt.length + 1000);
  });

  it("all phases include phase transition signal instructions", () => {
    const allPhases: Phase[] = [
      "ikigai",
      "holistic-context",
      "landscape",
      "enterprise-map",
      "nodal-interventions",
      "operational-design",
      "complete",
    ];
    for (const phase of allPhases) {
      const prompt = buildFullPrompt(phase, {});
      expect(prompt).toContain("Phase Transition Signals");
      expect(prompt).toContain("[[PHASE:");
    }
  });

  it("operational-design phase has distinct instructions from other phases", () => {
    const opsPrompt = buildFullPrompt("operational-design", {});
    const nodalPrompt = buildFullPrompt("nodal-interventions", {});
    // operational-design should have its own unique content
    expect(PHASE_PROMPTS["operational-design"]).not.toBe(
      PHASE_PROMPTS["nodal-interventions"]
    );
    expect(opsPrompt).not.toBe(nodalPrompt);
  });

  it("complete phase has a short, conversational prompt", () => {
    const prompt = buildFullPrompt("complete", {});
    expect(prompt).toContain("conversation is complete");
    // The complete phase prompt is much shorter than active phases
    expect(PHASE_PROMPTS["complete"].length).toBeLessThan(
      PHASE_PROMPTS["ikigai"].length
    );
  });

  it("opening message always includes operator name and is substantial", () => {
    const msg = buildOpeningMessage("Marcus", "Willamette Valley");
    expect(msg).toContain("Marcus");
    expect(msg).toContain("Willamette Valley");
    expect(msg.length).toBeGreaterThan(100);
  });

  it("opening message works without location", () => {
    const msg = buildOpeningMessage("Marcus");
    expect(msg).toContain("Marcus");
    expect(msg.length).toBeGreaterThan(100);
  });
});
