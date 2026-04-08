import { describe, it, expect } from "vitest";
import { parseMarkersV2 } from "./parse-markers-v2";
import type { Behavior } from "@/types/v2";

describe("parseMarkersV2", () => {
  // ─── Basic marker extraction ───────────────────────────────────────────────

  describe("CONTEXT markers", () => {
    it("extracts a basic CONTEXT object", () => {
      const input = 'Some text [[CONTEXT:{"location":"Detroit","stage":"mid-career"}]]';
      const result = parseMarkersV2(input);
      expect(result.parsedContext).toEqual({ location: "Detroit", stage: "mid-career" });
      expect(result.cleanText).toBe("Some text");
    });

    it("extracts empty JSON payload [[CONTEXT:{}]]", () => {
      const input = "Hello [[CONTEXT:{}]]";
      const result = parseMarkersV2(input);
      expect(result.parsedContext).toEqual({});
      expect(result.cleanText).toBe("Hello");
    });

    it("handles nested objects in CONTEXT", () => {
      const input = '[[CONTEXT:{"people":{"household":[{"name":"Sarah","role":"wife"}]},"place":{"name":"Michigan"}}]]';
      const result = parseMarkersV2(input);
      expect(result.parsedContext).toEqual({
        people: { household: [{ name: "Sarah", role: "wife" }] },
        place: { name: "Michigan" },
      });
    });

    it("handles arrays inside CONTEXT", () => {
      const input = '[[CONTEXT:{"resources":["garden","chickens","workshop"]}]]';
      const result = parseMarkersV2(input);
      expect(result.parsedContext!.resources).toEqual(["garden", "chickens", "workshop"]);
    });

    it("handles escaped characters in JSON strings", () => {
      const input = '[[CONTEXT:{"note":"She said \\"hello\\" and left","path":"C:\\\\Users"}]]';
      const result = parseMarkersV2(input);
      expect(result.parsedContext!.note).toBe('She said "hello" and left');
      expect(result.parsedContext!.path).toBe("C:\\Users");
    });
  });

  // ─── OPTIONS markers ───────────────────────────────────────────────────────

  describe("OPTIONS markers", () => {
    it("extracts a basic OPTIONS array", () => {
      const input = 'Choose one: [[OPTIONS:["Build a garden","Start cooking","Walk daily"]]]';
      const result = parseMarkersV2(input);
      expect(result.parsedOptions).toEqual(["Build a garden", "Start cooking", "Walk daily"]);
      expect(result.cleanText).toBe("Choose one:");
    });

    it("extracts single-element OPTIONS", () => {
      const input = '[[OPTIONS:["Only option"]]]';
      const result = parseMarkersV2(input);
      expect(result.parsedOptions).toEqual(["Only option"]);
    });
  });

  // ─── BEHAVIORS markers ─────────────────────────────────────────────────────

  describe("BEHAVIORS markers", () => {
    it("extracts behaviors with full structure", () => {
      const input = '[[BEHAVIORS:[{"key":"walk","text":"Morning walk","frequency":"daily","dimensions":[{"dimension":"body","direction":"builds","reasoning":"cardio"}],"enabled":true}]]]';
      const result = parseMarkersV2(input);
      expect(result.parsedBehaviors).toHaveLength(1);
      expect(result.parsedBehaviors![0].key).toBe("walk");
      expect(result.parsedBehaviors![0].frequency).toBe("daily");
    });
  });

  // ─── ASPIRATION_NAME markers ───────────────────────────────────────────────

  describe("ASPIRATION_NAME markers", () => {
    it("extracts aspiration name from quoted string", () => {
      const input = 'Here is your plan [[ASPIRATION_NAME:"Build a Homestead"]]';
      const result = parseMarkersV2(input);
      expect(result.parsedAspirationName).toBe("Build a Homestead");
      expect(result.cleanText).toBe("Here is your plan");
    });
  });

  // ─── REPLACE_ASPIRATION markers ────────────────────────────────────────────

  describe("REPLACE_ASPIRATION markers", () => {
    it("extracts replace aspiration name", () => {
      const input = '[[REPLACE_ASPIRATION:"Old Aspiration"]] Updated text';
      const result = parseMarkersV2(input);
      expect(result.parsedReplaceAspiration).toBe("Old Aspiration");
      expect(result.cleanText).toBe("Updated text");
    });
  });

  // ─── DECOMPOSITION markers ─────────────────────────────────────────────────

  describe("DECOMPOSITION markers", () => {
    it("extracts full decomposition with this_week behaviors", () => {
      const decomp = {
        aspiration_title: "Homestead",
        summary: "Build self-sufficiency",
        this_week: [
          {
            key: "garden-prep",
            name: "Garden Prep",
            text: "Prepare garden beds",
            detail: "Clear and amend soil",
            is_trigger: true,
            dimensions: ["home", "body"],
            frequency: "weekly",
          },
        ],
        coming_up: [{ name: "Order seeds", detail: "Spring catalog", timeframe: "2 weeks" }],
        longer_arc: [{ phase: "Full production", detail: "Year 2 goal", timeframe: "12 months" }],
      };
      const input = `Great plan! [[DECOMPOSITION:${JSON.stringify(decomp)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedDecomposition).toBeDefined();
      expect(result.parsedDecomposition!.aspiration_title).toBe("Homestead");
      expect(result.parsedDecomposition!.this_week).toHaveLength(1);
      expect(result.cleanText).toBe("Great plan!");
    });

    it("auto-derives parsedBehaviors from decomposition this_week", () => {
      const decomp = {
        aspiration_title: "Test",
        summary: "Test",
        this_week: [
          {
            key: "walk",
            name: "Morning Walk",
            text: "Walk for 30 min",
            detail: "Around the block",
            is_trigger: false,
            dimensions: ["body"],
            frequency: "daily",
          },
        ],
        coming_up: [],
        longer_arc: [],
      };
      const input = `[[DECOMPOSITION:${JSON.stringify(decomp)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedBehaviors).toHaveLength(1);
      expect(result.parsedBehaviors![0].key).toBe("walk");
      expect(result.parsedBehaviors![0].text).toBe("Walk for 30 min");
      expect(result.parsedBehaviors![0].enabled).toBe(true);
    });

    it("does not override explicit BEHAVIORS with decomposition-derived ones", () => {
      const behaviors: Behavior[] = [{
        key: "explicit",
        text: "Explicit behavior",
        frequency: "daily",
        dimensions: [{ dimension: "body", direction: "builds", reasoning: "test" }],
        enabled: true,
      }];
      const decomp = {
        aspiration_title: "Test",
        summary: "Test",
        this_week: [{ key: "derived", name: "Derived", text: "Derived behavior", detail: "", is_trigger: false, dimensions: [], frequency: "daily" }],
        coming_up: [],
        longer_arc: [],
      };
      const input = `[[BEHAVIORS:${JSON.stringify(behaviors)}]] [[DECOMPOSITION:${JSON.stringify(decomp)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedBehaviors).toHaveLength(1);
      expect(result.parsedBehaviors![0].key).toBe("explicit");
    });
  });

  // ─── DECISION markers ──────────────────────────────────────────────────────

  describe("DECISION markers", () => {
    it("extracts a decision with frameworks", () => {
      const decision = {
        description: "Build temporary shelter",
        reasoning: "Saves $2200",
        frameworks_surfaced: ["weak_link", "marginal_reaction"],
      };
      const input = `Based on analysis: [[DECISION:${JSON.stringify(decision)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedDecision).toBeDefined();
      expect(result.parsedDecision!.description).toBe("Build temporary shelter");
      expect(result.parsedDecision!.frameworks_surfaced).toHaveLength(2);
    });
  });

  // ─── Multiple markers ──────────────────────────────────────────────────────

  describe("multiple markers in one response", () => {
    it("extracts OPTIONS and CONTEXT from same text", () => {
      const input = 'Tell me more [[OPTIONS:["A","B","C"]]] [[CONTEXT:{"stage":"new"}]]';
      const result = parseMarkersV2(input);
      expect(result.parsedOptions).toEqual(["A", "B", "C"]);
      expect(result.parsedContext).toEqual({ stage: "new" });
      expect(result.cleanText).toBe("Tell me more");
    });

    it("extracts ASPIRATION_NAME + DECOMPOSITION together", () => {
      const decomp = {
        aspiration_title: "Health",
        summary: "Get healthy",
        this_week: [{ key: "walk", name: "Walk", text: "Walk daily", detail: "30 min", is_trigger: false, dimensions: ["body"], frequency: "daily" }],
        coming_up: [],
        longer_arc: [],
      };
      const input = `Plan ready [[ASPIRATION_NAME:"Get Healthy"]] [[DECOMPOSITION:${JSON.stringify(decomp)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedAspirationName).toBe("Get Healthy");
      expect(result.parsedDecomposition).toBeDefined();
      expect(result.cleanText).toBe("Plan ready");
    });
  });

  // ─── Streaming / partial markers ───────────────────────────────────────────

  describe("partial / streaming markers", () => {
    it("strips incomplete CONTEXT marker at end of stream", () => {
      const input = "Gathering your info [[CONTEXT:{\"loc";
      const result = parseMarkersV2(input);
      expect(result.parsedContext).toBeNull();
      expect(result.cleanText).toBe("Gathering your info");
    });

    it("strips incomplete OPTIONS marker at end of stream", () => {
      const input = 'Here are options [[OPTIONS:["A","B"';
      const result = parseMarkersV2(input);
      expect(result.parsedOptions).toBeNull();
      expect(result.cleanText).toBe("Here are options");
    });

    it("bare [[ without known type is left in text (not a valid marker start)", () => {
      const input = "Starting marker [[";
      const result = parseMarkersV2(input);
      // Regex only strips [[TYPE: where TYPE is a known marker name
      expect(result.cleanText).toBe("Starting marker [[");
    });

    it("partial marker type without full name is left in text", () => {
      const input = "Text here [[DECOM";
      const result = parseMarkersV2(input);
      // Only full type names (DECOMPOSITION, CONTEXT, etc.) are stripped
      expect(result.cleanText).toBe("Text here [[DECOM");
    });

    it("strips full marker type with partial JSON at end of stream", () => {
      const input = "Text here [[DECOMPOSITION:{\"title";
      const result = parseMarkersV2(input);
      expect(result.cleanText).toBe("Text here");
    });
  });

  // ─── Malformed markers ─────────────────────────────────────────────────────

  describe("malformed markers", () => {
    it("returns null for marker with invalid JSON", () => {
      const input = "Text [[CONTEXT:{bad json}]]";
      const result = parseMarkersV2(input);
      expect(result.parsedContext).toBeNull();
    });

    it("returns null for marker missing closing brackets", () => {
      const input = 'Text [[CONTEXT:{"a":"b"}] more text';
      const result = parseMarkersV2(input);
      expect(result.parsedContext).toBeNull();
    });
  });

  // ─── Plain text passthrough ────────────────────────────────────────────────

  describe("no markers present", () => {
    it("returns original text with all parsed values null", () => {
      const input = "Just a normal response with no markers at all.";
      const result = parseMarkersV2(input);
      expect(result.cleanText).toBe("Just a normal response with no markers at all.");
      expect(result.parsedOptions).toBeNull();
      expect(result.parsedBehaviors).toBeNull();
      expect(result.parsedActions).toBeNull();
      expect(result.parsedContext).toBeNull();
      expect(result.parsedAspirationName).toBeNull();
      expect(result.parsedDecomposition).toBeNull();
      expect(result.parsedReorganization).toBeNull();
      expect(result.parsedReplaceAspiration).toBeNull();
      expect(result.parsedDecision).toBeNull();
    });

    it("handles empty string", () => {
      const result = parseMarkersV2("");
      expect(result.cleanText).toBe("");
    });
  });

  // ─── Mixed text and markers ────────────────────────────────────────────────

  describe("mixed text and markers", () => {
    it("preserves text before and after markers", () => {
      const input = 'Before [[OPTIONS:["A"]]] After';
      const result = parseMarkersV2(input);
      expect(result.cleanText).toBe("Before  After");
      expect(result.parsedOptions).toEqual(["A"]);
    });

    it("preserves multi-line text around markers", () => {
      const input = 'Line one.\n\nLine two. [[CONTEXT:{"x":1}]]\n\nLine three.';
      const result = parseMarkersV2(input);
      expect(result.cleanText).toContain("Line one.");
      expect(result.cleanText).toContain("Line two.");
      expect(result.cleanText).toContain("Line three.");
      expect(result.parsedContext).toEqual({ x: 1 });
    });
  });

  // ─── Edge cases ────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles very large JSON payload (>1KB)", () => {
      const largeArray = Array.from({ length: 50 }, (_, i) => `Item ${i}: ${"x".repeat(20)}`);
      const input = `Big data [[OPTIONS:${JSON.stringify(largeArray)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedOptions).toHaveLength(50);
      expect(result.cleanText).toBe("Big data");
    });

    it("handles ACTIONS marker", () => {
      const input = '[[ACTIONS:["Check soil pH","Order amendments"]]]';
      const result = parseMarkersV2(input);
      expect(result.parsedActions).toEqual(["Check soil pH", "Order amendments"]);
    });

    it("handles REORGANIZATION marker", () => {
      const reorg = {
        release: [{ aspirationId: "a1", name: "Old goal", reason: "No longer relevant" }],
        protect: [{ aspirationId: "a2", name: "Core goal", reason: "Essential" }],
        revise: [],
      };
      const input = `[[REORGANIZATION:${JSON.stringify(reorg)}]]`;
      const result = parseMarkersV2(input);
      expect(result.parsedReorganization).toBeDefined();
      expect(result.parsedReorganization!.release).toHaveLength(1);
      expect(result.parsedReorganization!.protect).toHaveLength(1);
    });

    it("handles brackets inside JSON string values without breaking parser", () => {
      const input = '[[CONTEXT:{"note":"array looks like [1,2,3] and object like {a:1}"}]]';
      const result = parseMarkersV2(input);
      expect(result.parsedContext!.note).toBe("array looks like [1,2,3] and object like {a:1}");
    });
  });
});
