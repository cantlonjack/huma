# Testing Patterns

**Analysis Date:** 2026-03-17

## Test Framework

**Runner:**
- Vitest 4.1.0+
- Config: `app/vitest.config.ts`

**Assertion Library:**
- Vitest built-in (`expect` from `vitest`)

**Run Commands:**
```bash
cd app && npm test          # Run all tests (vitest run)
cd app && npm run test:watch # Watch mode (vitest)
```

## Vitest Configuration

```typescript
// app/vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

**Key settings:**
- Environment: `node` (not jsdom -- browser APIs must be mocked manually)
- Test file pattern: `src/**/*.test.ts`
- Path alias `@/` resolves to `src/` (mirrors `tsconfig.json`)

## Test File Organization

**Location:**
- Centralized `__tests__/` directory: `app/src/__tests__/`
- NOT co-located with source files

**Naming:**
- `{module-name}.test.ts` (kebab-case, matches source file name)
- No `.spec.ts` files used

**Current test files:**
```
app/src/__tests__/
  enterprise-templates.test.ts   # Tests enterprise template data integrity
  markers.test.ts                # Tests marker parsing/cleaning utilities
  persistence.test.ts            # Tests localStorage conversation persistence
  phases.test.ts                 # Tests prompt building and phase system
```

**Source-to-test mapping:**
| Source File | Test File |
|---|---|
| `app/src/engine/enterprise-templates.ts` | `app/src/__tests__/enterprise-templates.test.ts` |
| `app/src/lib/markers.ts` | `app/src/__tests__/markers.test.ts` |
| `app/src/lib/persistence.ts` | `app/src/__tests__/persistence.test.ts` |
| `app/src/engine/phases.ts` | `app/src/__tests__/phases.test.ts` |

## Test Structure

**Suite Organization:**
- Use `describe()` blocks for logical groupings (one per function or feature)
- Use `it()` for individual assertions (not `test()`)
- Descriptive test names: `"strips complete PHASE markers"`, `"has valid financial data"`
- Nested `describe()` for parameterized tests across data sets

**Standard pattern:**
```typescript
import { describe, it, expect } from "vitest";
import { functionUnderTest } from "@/module/path";

describe("functionUnderTest", () => {
  it("does X when given Y", () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });

  it("handles edge case Z", () => {
    expect(functionUnderTest("")).toBe("");
  });
});
```

**Data-driven testing pattern (enterprise templates):**
```typescript
// Iterate over a data array and create dynamic test suites
for (const template of ENTERPRISE_TEMPLATES) {
  describe(template.name, () => {
    it("has required identity fields", () => {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
    });

    it("has complete capital profile (all 8 forms, scores 1-5)", () => {
      for (const cap of CAPITALS) {
        const entry = template.capitalProfile[cap];
        expect(entry.score).toBeGreaterThanOrEqual(1);
        expect(entry.score).toBeLessThanOrEqual(5);
      }
    });
  });
}
```

## Mocking

**Framework:** Vitest built-in (`vi.fn()`, `vi.mock()`, `vi.stubGlobal()`)

**Browser API Mocking Pattern:**
```typescript
// Mock localStorage before importing the module that uses it
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
  length: 0,
  key: vi.fn(() => null),
};
vi.stubGlobal("localStorage", localStorageMock);

// THEN import the module that depends on localStorage
import { saveConversation, loadConversation, clearConversation } from "@/lib/persistence";
```

**Key mocking rules:**
- Mock globals BEFORE importing modules that depend on them (hoisting matters)
- Use `vi.stubGlobal()` for browser APIs (localStorage, navigator, etc.)
- Use `vi.clearAllMocks()` in `beforeEach()` to reset mock state between tests
- Manually clear the backing store object in `beforeEach()`

**What to Mock:**
- Browser APIs not available in Node environment (localStorage, navigator.clipboard)
- External service clients (not yet tested -- no mocks for Anthropic SDK or Redis)

**What NOT to Mock:**
- Pure functions (test them directly with real inputs/outputs)
- Type definitions and constants
- String template builders (prompt functions)

## Fixtures and Factories

**Test Data:**
- Inline test data constructed per test (no shared fixture files)
- Use `as const` for type narrowing in inline data:
```typescript
const data = {
  messages: [{ id: "1", role: "assistant" as const, content: "Hello" }],
  phase: "ikigai" as const,
  context: {},
  operatorName: "Sarah",
  operatorLocation: "Oregon",
  savedAt: new Date().toISOString(),
};
```

**Constants for validation:**
```typescript
const CAPITALS = ["financial", "material", "living", "social",
  "intellectual", "experiential", "spiritual", "cultural"] as const;
```

**Location:**
- No shared fixtures directory
- All test data is defined inline within test files

## Coverage

**Requirements:** None enforced (no coverage thresholds configured)

**View Coverage:**
```bash
cd app && npx vitest run --coverage
```

Note: No coverage reporter is configured in `vitest.config.ts`. Would need to add `@vitest/coverage-v8` or similar.

## Test Types

**Unit Tests:**
- All 4 test files are unit tests
- Test pure functions in isolation (marker parsing, prompt building, data validation)
- Test data integrity of static constants (enterprise templates)
- Test localStorage persistence with mocked browser API

**Integration Tests:**
- Not present
- No tests for API routes (`app/src/app/api/chat/route.ts`, `app/src/app/api/maps/route.ts`)
- No tests for React components

**E2E Tests:**
- Not present
- No Playwright, Cypress, or similar framework configured

## Common Patterns

**String Content Testing:**
```typescript
// Test that generated prompts contain expected content
const result = buildFullPrompt("ikigai", {});
expect(result).toContain("You are HUMA");
expect(result).toContain(PHASE_PROMPTS["ikigai"]);
```

**Length/Size Assertions:**
```typescript
// Verify generated content has substantial length
expect(block.length).toBeGreaterThan(1000);
expect(buildOpeningMessage("Test").length).toBeGreaterThan(50);
```

**Null/Invalid Input Testing:**
```typescript
// Test graceful handling of invalid data
it("returns null for invalid stored data", () => {
  store["huma-conversation"] = "not json at all";
  expect(loadConversation()).toBeNull();
});

it("returns null for JSON without required fields", () => {
  store["huma-conversation"] = JSON.stringify({ foo: "bar" });
  expect(loadConversation()).toBeNull();
});
```

**Exhaustive Enumeration Testing:**
```typescript
// Test all valid values of an enum/union
it("detects all valid phase names", () => {
  const phases = ["ikigai", "holistic-context", "landscape",
    "enterprise-map", "nodal-interventions", "operational-design"];
  for (const phase of phases) {
    const result = parseMarkers(`text [[PHASE:${phase}]]`);
    expect(result.phase).toBe(phase);
  }
});
```

**Setup/Teardown:**
```typescript
// Reset mutable state between tests
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.clearAllMocks();
});
```

## Untested Areas

**API Routes:**
- `app/src/app/api/chat/route.ts` -- rate limiting, validation, streaming response
- `app/src/app/api/maps/route.ts` -- map storage, Redis interaction
- `app/src/app/api/maps/[id]/route.ts` -- map retrieval

**React Components:**
- No component tests exist for any of the 17 component files
- `app/src/components/Chat.tsx`, `MapDocument.tsx`, `MapPreview.tsx`, `ShapeChart.tsx`
- `app/src/components/canvas/*.tsx` (12 canvas components)

**Client-side Utilities:**
- `app/src/lib/clipboard.ts` -- `copyCurrentUrl()` function
- `app/src/lib/analytics.ts` -- `trackEvent()` wrapper
- `app/src/lib/sample-map.ts` -- static sample data

**Engine Modules:**
- `app/src/engine/canvas-prompt.ts` -- `buildCanvasDataPrompt()` function
- `app/src/engine/operational-prompts.ts` -- exported prompt constants (indirectly tested via phases.test.ts)

## Adding New Tests

**Where to place:**
- Add test files to `app/src/__tests__/{module-name}.test.ts`

**Template for a new test file:**
```typescript
import { describe, it, expect } from "vitest";
import { functionToTest } from "@/path/to/module";

describe("functionToTest", () => {
  it("describes expected behavior", () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });
});
```

**If mocking browser APIs:**
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock setup BEFORE imports
vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });

// Import AFTER mocks
import { functionToTest } from "@/lib/module";

describe("functionToTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  // ...
});
```

---

*Testing analysis: 2026-03-17*
