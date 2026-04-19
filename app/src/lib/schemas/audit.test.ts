import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * SEC-04 audit: enumerate user-text `z.string()` fields and assert each uses
 * `userTextField`. Blocker 1: NO silent skips — if a schema/field isn't found
 * at the expected callsite, the test fails with an explicit message pointing
 * the engineer at the exact location to fix.
 *
 * Two things must happen when a future phase adds a new user-text field:
 *   (1) The schema author replaces `z.string()` with `userTextField(...)`.
 *   (2) The author adds the new field to EXPECTED_FIELDS below.
 * Failing to do (2) is the test's job to catch.
 */

interface ExpectedField {
  /** Schema-wrapper name (object/union) the field belongs to, e.g. "messageSchema". */
  schemaName: string;
  /** Immediate parent key in the schema shape, e.g. "content", "rawText", "conversationSoFar". */
  fieldKey: string;
  /** Optional note explaining the field's location (for test failure output). */
  note?: string;
}

interface ExpectedFileAudit {
  file: string;
  /** Each entry is a user-text field that MUST use userTextField. */
  fields: ExpectedField[];
}

// File paths are relative to the Vitest cwd (`app/`) so this test runs with
// `npm test` from app/ without needing to locate the repo root. The comment
// next to each entry shows the repo-root-relative path for documentation.
const EXPECTED_FIELDS: ExpectedFileAudit[] = [
  {
    file: "src/lib/schemas/index.ts", // repo: app/src/lib/schemas/index.ts
    fields: [
      // messageSchema (used by v2ChatSchema.messages[])
      { schemaName: "messageSchema", fieldKey: "content" },
      // v2ChatSchema.aspirations[]
      { schemaName: "v2ChatSchema", fieldKey: "rawText", note: "aspirations[].rawText" },
      { schemaName: "v2ChatSchema", fieldKey: "clarifiedText", note: "aspirations[].clarifiedText" },
      // sheetCompileSchema.aspirations[]
      { schemaName: "sheetCompileSchema", fieldKey: "rawText", note: "aspirations[].rawText" },
      { schemaName: "sheetCompileSchema", fieldKey: "clarifiedText", note: "aspirations[].clarifiedText" },
      // sheetCompileSchema.aspirations[].behaviors[].text AND conversationMessages[].content
      { schemaName: "sheetCompileSchema", fieldKey: "text", note: "aspirations[].behaviors[].text" },
      { schemaName: "sheetCompileSchema", fieldKey: "content", note: "conversationMessages[].content" },
      // behaviorMetaSchema (used by insightSchema.behaviorMeta[])
      { schemaName: "behaviorMetaSchema", fieldKey: "text" },
      { schemaName: "behaviorMetaSchema", fieldKey: "aspirationText" },
      // insightSchema
      { schemaName: "insightSchema", fieldKey: "name" },
      // paletteSchema (array of user-text strings)
      { schemaName: "paletteSchema", fieldKey: "conversationSoFar" },
      { schemaName: "paletteSchema", fieldKey: "selectedConcepts" },
      // nudgeSchema
      { schemaName: "nudgeSchema", fieldKey: "name" },
      { schemaName: "nudgeSchema", fieldKey: "rawText", note: "aspirations[].rawText" },
      { schemaName: "nudgeSchema", fieldKey: "clarifiedText", note: "aspirations[].clarifiedText" },
      { schemaName: "nudgeSchema", fieldKey: "text", note: "aspirations[].behaviors[].text" },
      // wholeComputeSchema (discriminated union — both branches)
      { schemaName: "wholeComputeSchema", fieldKey: "contextData" },
      { schemaName: "wholeComputeSchema", fieldKey: "originalWhy" },
      { schemaName: "wholeComputeSchema", fieldKey: "behavioralSummary" },
    ],
  },
  {
    file: "src/app/api/weekly-review/route.ts", // repo: app/src/app/api/weekly-review/route.ts
    fields: [
      { schemaName: "aspirationSchema", fieldKey: "rawText" },
      { schemaName: "aspirationSchema", fieldKey: "clarifiedText" },
      { schemaName: "aspirationSchema", fieldKey: "text", note: "behaviors[].text" },
      { schemaName: "weeklyReviewSchema", fieldKey: "operatorName" },
    ],
  },
  {
    file: "src/app/api/reflection/route.ts", // repo: app/src/app/api/reflection/route.ts
    fields: [
      { schemaName: "reflectionSchema", fieldKey: "text" },
      { schemaName: "reflectionSchema", fieldKey: "todaysSheet" },
    ],
  },
];

/**
 * Matches the callsite `<fieldKey>: ... userTextField(` in a source string.
 * Allows intervening Zod chaining (e.g. `z.array(userTextField())`, `userTextField({...}).default("")`,
 * or a bare `userTextField()`) but requires `userTextField` appear somewhere on the same
 * or immediately-following line for the given key. We cap the lookahead at ~120 chars so
 * an unrelated `userTextField` reference later in the file can't accidentally satisfy the match.
 */
function fieldUsesUserTextField(src: string, fieldKey: string): boolean {
  // Escape the fieldKey for use in a regex (only safe chars expected, but be defensive).
  const escaped = fieldKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Key is a JS identifier; must start at a word boundary and be followed by `:` then
  // within a short window, the literal `userTextField(`.
  const re = new RegExp(`\\b${escaped}\\s*:[^,\\n}]{0,120}\\buserTextField\\s*\\(`);
  return re.test(src);
}

describe("SEC-04 audit: enumerated user-text fields use userTextField", () => {
  for (const { file, fields } of EXPECTED_FIELDS) {
    describe(`${file}`, () => {
      const absPath = resolve(process.cwd(), file);
      const src = readFileSync(absPath, "utf8");

      it("imports userTextField from the sanitize module", () => {
        expect(
          /import\s*\{[^}]*userTextField[^}]*\}\s*from\s+['"][^'"]*sanitize['"]/.test(src),
          `${file} must import { userTextField } from a sanitize module. ` +
            `Add: import { userTextField } from "@/lib/schemas/sanitize" (or "./sanitize").`,
        ).toBe(true);
      });

      for (const { schemaName, fieldKey, note } of fields) {
        const label = note
          ? `${schemaName}.${fieldKey} (${note})`
          : `${schemaName}.${fieldKey}`;
        it(`${label} uses userTextField`, () => {
          expect(
            fieldUsesUserTextField(src, fieldKey),
            `${file}: expected user-text field '${label}' to use userTextField(...). ` +
              `Blocker 1: no silent skips — fix the schema OR update audit.test.ts EXPECTED_FIELDS.`,
          ).toBe(true);
        });
      }
    });
  }

  it("documents Blocker 1 fix: NO silent fallback for missing schemas", () => {
    // Combined with coverage.test.ts (which hard-fails on missing schema by name),
    // this enumeration catches both (a) a schema rename that drops sanitization
    // silently and (b) a new user-text field added without userTextField.
    expect(EXPECTED_FIELDS.length).toBeGreaterThan(0);
    const totalFields = EXPECTED_FIELDS.reduce((sum, a) => sum + a.fields.length, 0);
    expect(totalFields).toBeGreaterThanOrEqual(20);
  });
});
