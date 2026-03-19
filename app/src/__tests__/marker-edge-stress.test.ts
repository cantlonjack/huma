import { describe, it, expect } from "vitest";
import { parseMarkers } from "@/lib/markers";

describe("marker edge-case stress tests", () => {
  // 1. Extra whitespace inside brackets
  it("should NOT match markers with internal whitespace: [[ PHASE:landscape ]]", () => {
    const result = parseMarkers("Some text [[ PHASE:landscape ]] more text");
    expect(result.phase).toBeNull();
    // The marker with spaces should remain in clean text (not stripped)
    expect(result.clean).toContain("[[");
  });

  // 2. Uppercase phase values
  it("should NOT match uppercase phase values like [[PHASE:LANDSCAPE]]", () => {
    // The regex uses [\w-]+ so uppercase letters DO match \w.
    // But the Phase type only has lowercase values.
    // This test documents actual behavior.
    const result = parseMarkers("Hello [[PHASE:LANDSCAPE]]");
    // Non-canonical phase IDs are now rejected by runtime validation
    expect(result.phase).toBeNull();
  });

  // 3. Typo in phase value — should not match a canonical phase
  it("should capture typo phase values verbatim (no validation)", () => {
    const result = parseMarkers("Text [[PHASE:landscpe]] more");
    // Non-canonical phase IDs are now rejected by runtime validation
    expect(result.phase).toBeNull();
  });

  // 4. Double-nested markers — which phase wins?
  it("first PHASE marker wins when two are present", () => {
    const result = parseMarkers(
      "Start [[PHASE:landscape]] middle [[PHASE:enterprise-map]] end"
    );
    // .match() returns the first match
    expect(result.phase).toBe("landscape");
  });

  // 5. Context with multiline value containing [[ literal in prose
  it("context value stops at [[ even if it is prose, not a marker", () => {
    const input =
      '[[CONTEXT:ikigai-synthesis]]The operator said "I love [[double brackets]]" in passing.';
    const result = parseMarkers(input);
    expect(result.capturedContexts.length).toBe(1);
    // The lookahead (?=\[\[|$) will stop capture at the first [[
    expect(result.capturedContexts[0].value).toBe(
      'The operator said "I love'
    );
  });

  // 6. Markers embedded mid-sentence vs at end
  it("parses PHASE marker embedded mid-sentence", () => {
    const result = parseMarkers(
      "The operator is ready [[PHASE:landscape]] to proceed with mapping."
    );
    expect(result.phase).toBe("landscape");
    expect(result.clean).toBe(
      "The operator is ready to proceed with mapping."
    );
  });

  it("parses PHASE marker at end of text", () => {
    const result = parseMarkers("All done here. [[PHASE:complete]]");
    expect(result.phase).toBeNull();
    expect(result.isComplete).toBe(true);
    expect(result.clean).toBe("All done here.");
  });

  // 7. Empty context value — marker followed immediately by another marker
  it("captures empty string when context is immediately followed by another marker", () => {
    const input =
      "[[CONTEXT:ikigai-synthesis]][[CONTEXT:holistic-goals]]Real value here";
    const result = parseMarkers(input);
    expect(result.capturedContexts.length).toBe(2);
    expect(result.capturedContexts[0].type).toBe("ikigai-synthesis");
    expect(result.capturedContexts[0].value).toBe("");
    expect(result.capturedContexts[1].type).toBe("holistic-goals");
    expect(result.capturedContexts[1].value).toBe("Real value here");
  });

  // 8. CANVAS_DATA with malformed JSON
  it("silently skips CANVAS_DATA with malformed JSON", () => {
    const input =
      '[[CANVAS_DATA:essence]]{not valid json: [[CANVAS_DATA:qol]]{"valid": true}';
    const result = parseMarkers(input);
    // First entry has malformed JSON — should be skipped
    // Second entry has valid JSON — should be captured
    // But note: the first entry's value stops at the [[ of the second marker
    expect(result.canvasDataEntries.length).toBe(1);
    expect(result.canvasDataEntries[0].type).toBe("qol");
    expect(result.canvasDataEntries[0].json).toEqual({ valid: true });
  });

  // 9. Marker at very start of text with no preceding content
  it("parses marker at very start of text", () => {
    const result = parseMarkers("[[PHASE:ikigai]]Welcome to HUMA.");
    expect(result.phase).toBe("ikigai");
    expect(result.clean).toBe("Welcome to HUMA.");
  });

  it("parses CONTEXT at very start of text", () => {
    const result = parseMarkers(
      "[[CONTEXT:ikigai-synthesis]]The essence is about connection."
    );
    expect(result.capturedContexts.length).toBe(1);
    expect(result.capturedContexts[0].value).toBe(
      "The essence is about connection."
    );
    expect(result.clean).toBe("");
  });

  // 10. Markers with trailing newlines vs no trailing newlines
  it("handles PHASE marker followed by newlines", () => {
    const result = parseMarkers("Text\n[[PHASE:landscape]]\n\nMore text");
    expect(result.phase).toBe("landscape");
    // PHASE clean regex now uses / */ (spaces only) instead of /\s*/
    // so newlines are preserved and paragraph breaks aren't collapsed.
    expect(result.clean).toBe("Text\n\n\nMore text");
  });

  it("handles CONTEXT marker with trailing newlines in value", () => {
    const result = parseMarkers(
      "[[CONTEXT:field-reading]]Value with\nnewlines\ninside\n"
    );
    expect(result.capturedContexts.length).toBe(1);
    expect(result.capturedContexts[0].value).toBe(
      "Value with\nnewlines\ninside"
    );
  });

  it("handles CANVAS_DATA with JSON containing newlines", () => {
    const input = '[[CANVAS_DATA:essence]]\n{\n  "name": "Maya"\n}\n';
    const result = parseMarkers(input);
    expect(result.canvasDataEntries.length).toBe(1);
    expect(result.canvasDataEntries[0].json).toEqual({ name: "Maya" });
  });

  // Bonus: mixed markers in realistic AI output
  it("parses a realistic multi-marker AI response", () => {
    const input = [
      "Your landscape reveals rich potential in the valley soil.",
      "[[CONTEXT:field-reading]]Sandy loam, south-facing, zone 7b",
      '[[CANVAS_DATA:field]]{"soil":"sandy loam","zone":"7b","aspect":"south"}',
      "[[PHASE:enterprise-map]]",
    ].join("\n");
    const result = parseMarkers(input);
    expect(result.phase).toBe("enterprise-map");
    expect(result.capturedContexts[0].type).toBe("field-reading");
    expect(result.capturedContexts[0].value).toBe(
      "Sandy loam, south-facing, zone 7b"
    );
    expect(result.canvasDataEntries[0].json).toEqual({
      soil: "sandy loam",
      zone: "7b",
      aspect: "south",
    });
    expect(result.clean).toBe(
      "Your landscape reveals rich potential in the valley soil."
    );
  });
});
