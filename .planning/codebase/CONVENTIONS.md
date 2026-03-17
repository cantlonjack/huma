# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

**Files:**
- Components: PascalCase `.tsx` files (e.g., `Chat.tsx`, `MapDocument.tsx`, `PhaseIndicator.tsx`, `ShapeChart.tsx`)
- Canvas sub-components: PascalCase in `canvas/` subdirectory (e.g., `EssenceCore.tsx`, `QoLRing.tsx`, `EnterpriseCards.tsx`)
- Engine modules: kebab-case `.ts` files (e.g., `enterprise-templates.ts`, `canvas-types.ts`, `operational-prompts.ts`)
- Lib utilities: kebab-case `.ts` files (e.g., `persistence.ts`, `markers.ts`, `clipboard.ts`, `sample-map.ts`)
- API routes: `route.ts` inside Next.js App Router directories (e.g., `app/api/chat/route.ts`, `app/api/maps/route.ts`)
- Test files: kebab-case `.test.ts` in `src/__tests__/` directory (e.g., `markers.test.ts`, `phases.test.ts`)
- Page components: `page.tsx` (App Router convention), with client wrappers as PascalCase `*Client.tsx` (e.g., `MapClient.tsx`, `SampleMapClient.tsx`)

**Functions:**
- camelCase for all functions: `buildFullPrompt()`, `parseMarkers()`, `cleanForDisplay()`, `saveConversation()`
- Prefix `build` for prompt/data constructors: `buildFullPrompt()`, `buildDocumentPrompt()`, `buildCanvasDataPrompt()`, `buildOpeningMessage()`, `buildEnterpriseReferenceBlock()`
- Prefix `handle` for event handlers: `handleSubmit()`, `handleKeyDown()`, `handleInput()`, `handleRetry()`, `handleShare()`
- Prefix `is` for boolean checks: `isRateLimited()`, `isCapitalTable()`, `isFinancialsTable()`, `isEnterpriseHeader()`
- Prefix `compute`/`parse`/`extract` for data transformations: `computeAggregateCapitalScores()`, `parseMarkers()`, `parseCapitalRow()`, `extractText()`, `extractMarkers()`

**Variables:**
- camelCase for all variables: `currentPhase`, `streamingContent`, `mapMarkdown`, `mapCanvasData`
- UPPER_SNAKE_CASE for constants: `ENTERPRISE_TEMPLATES`, `BASE_SYSTEM_PROMPT`, `PHASE_PROMPTS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`, `SAMPLE_SHAPE_SCORES`
- Prefixed refs: `bottomRef`, `textareaRef`, `scrollContainerRef`, `contextRef`, `nameInputRef`, `prevKeysRef`

**Types:**
- PascalCase for all interfaces and type aliases: `Phase`, `PhaseInfo`, `Message`, `ConversationContext`, `CanvasData`, `EnterpriseTemplate`
- Interfaces for object shapes with named properties: `interface MapPayload`, `interface ChatProps`, `interface ShapeChartProps`
- Type aliases for unions and simple types: `type Phase = "ikigai" | ...`, `type AppState = "landing" | ...`, `type ViewMode = "canvas" | "document"`
- Props interfaces named `{Component}Props`: `ChatProps`, `PhaseIndicatorProps`, `ShapeChartProps`, `MapDocumentProps`, `MapPreviewProps`, `MapClientProps`, `LivingCanvasProps`, `EnterpriseCardsProps`, `EssenceCoreProps`

## Code Style

**Formatting:**
- No Prettier config detected; relies on default TypeScript/ESLint formatting
- 2-space indentation throughout
- Double quotes for strings (consistent across all files)
- Semicolons at end of statements
- Trailing commas in multi-line constructs (arrays, objects, function parameters)
- Max line length is not explicitly enforced but lines rarely exceed ~140 characters

**Linting:**
- ESLint 9 with flat config (`app/eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- No custom rules added beyond Next.js defaults
- Run with `npm run lint` (which invokes `eslint`)

**TypeScript:**
- Strict mode enabled (`"strict": true` in `app/tsconfig.json`)
- Target ES2017, module ESNext, bundler module resolution
- Path alias `@/*` maps to `./src/*`
- `noEmit: true` (Next.js handles compilation)
- `isolatedModules: true` for compatibility with transpilers
- `skipLibCheck: true` for faster builds

## Import Organization

**Order:**
1. External library imports (React, Next.js, third-party packages)
2. Internal type imports (from `@/engine/types`, `@/engine/canvas-types`)
3. Internal module imports (from `@/engine/`, `@/lib/`, `@/components/`)

**Path Aliases:**
- Use `@/` alias exclusively for all internal imports
- Never use relative paths like `../../` for cross-directory imports
- Within same directory, relative imports are acceptable (e.g., `./types` in `@/engine/phases.ts`)

**Pattern examples:**
```typescript
// External
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// Internal types (use `type` keyword for type-only imports)
import { type Phase, type ConversationContext } from "@/engine/types";
import type { CanvasData } from "@/engine/canvas-types";

// Internal modules
import { buildOpeningMessage } from "@/engine/phases";
import { cleanForDisplay, parseMarkers } from "@/lib/markers";
import Chat from "@/components/Chat";
```

**Type Import Style:**
- Use `import type { ... }` for type-only imports from external modules
- Use `import { type X, type Y }` inline style when mixing values and types from the same module
- Both styles are used; preference is `type` keyword for clarity

## Error Handling

**API Routes:**
- Wrap entire handler body in try/catch
- Return JSON error responses with appropriate HTTP status codes
- Use `console.error()` for server-side logging before returning error response
- User-facing error messages are friendly, not technical: `"Something went wrong. Please try again."`, `"Service temporarily unavailable"`
- Pattern:
```typescript
try {
  // ... operation
} catch (err) {
  console.error("Failed to [action]:", err);
  return new Response(
    JSON.stringify({ error: "User-friendly message" }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
```

**Client-side:**
- Silent catch blocks for non-critical operations (localStorage, analytics, clipboard)
- Comment explaining why the catch is empty: `// localStorage full or unavailable — silently fail`
- Pattern for non-critical:
```typescript
try {
  localStorage.setItem(key, value);
} catch {
  // silently fail
}
```

**Graceful Degradation:**
- Redis unavailable: falls back to localStorage-only operation (`app/src/app/api/maps/route.ts`)
- Canvas data parsing fails: falls back to document-only view (`app/src/app/page.tsx`)
- API storage fails: still returns a local ID for localStorage fallback
- Analytics failures never break the app (`app/src/lib/analytics.ts`)

**Validation:**
- Manual validation in API routes (no Zod or validation library for runtime)
- Discriminated return types for validation: `{ valid: true; data: ... } | { valid: false; error: string }`
- Input bounds checking: message count limits (100), content length limits (50,000 chars), map size limits (200,000 chars)

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- `console.error()` for failures in API routes and catch blocks
- `console.warn()` for non-fatal issues (e.g., JSON parse failure for canvas data)
- No `console.log()` for general debugging in production code
- Vercel Analytics (`@vercel/analytics`) for event tracking via `trackEvent()` wrapper in `app/src/lib/analytics.ts`
- Event names use snake_case: `"conversation_resumed"`, `"phase_transition"`, `"map_generation_started"`, `"map_generation_complete"`, `"share_button_clicked"`

## Comments

**When to Comment:**
- Section dividers use box-drawing characters for major files:
```typescript
// ═══════════════════════════════════════════════════════════════
// HUMA — [Module Name]
// [Description of what this file does]
// ═══════════════════════════════════════════════════════════════
```
- Inline section headers use em-dash separators:
```typescript
// ─── Rate Limiting (in-memory, per-deployment) ───
// ─── Validation ───
// ─── Handler ───
```
- App state sections use em-dash separators in JSX:
```typescript
// ─── Landing ───
// ─── Welcome (Name Screen) ───
// ─── Generating ───
// ─── Map ───
// ─── Conversation ───
```
- Brief inline comments explain "why" not "what": `// 90-day TTL (7,776,000 seconds)`, `// Fallback for older browsers`

**JSDoc/TSDoc:**
- Used sparingly, only for exported utility functions that need usage context
- Pattern:
```typescript
/**
 * Strip [[PHASE:...]] and [[CONTEXT:...]] markers from text for display.
 * Also strips incomplete/partial markers that arrive mid-stream.
 */
export function cleanForDisplay(text: string): string {
```

## Function Design

**Size:**
- Utility functions are small (5-20 lines): `cleanForDisplay()`, `parseMarkers()`, `isRateLimited()`
- Component functions can be large (page.tsx is 751 lines) -- acceptable for page-level orchestrators
- Helper functions extracted as private functions within the same file when reused

**Parameters:**
- Use object parameters for 3+ props (component props interfaces)
- Use positional parameters for 1-2 args utility functions: `buildOpeningMessage(name: string, location?: string)`
- Optional parameters use `?` syntax, not `| undefined`
- Default values via destructuring: `{ labels = DEFAULT_LABELS, size, className = "", animated = true, breathing = false }`

**Return Values:**
- Functions return explicit types (TypeScript strict mode enforces this)
- Nullable returns use `T | null` pattern: `loadConversation(): SavedConversation | null`
- Structured returns for complex results:
```typescript
function parseMarkers(text: string): {
  clean: string;
  phase: Phase | null;
  isComplete: boolean;
  capturedContexts: { type: string; value: string }[];
}
```

## Component Design

**Client Components:**
- All interactive components marked with `"use client"` directive at top of file
- Default exports for all components: `export default function Chat({ ... })`
- Props interfaces defined immediately before the component function
- Internal helper components as named functions at bottom of file (not exported): `function MessageBlock()`, `function CapitalBar()`, `function FinCell()`
- Hooks ordered: useState, useRef, useEffect, useCallback (following React conventions)

**Server Components:**
- Only used for page-level components with metadata generation: `app/src/app/map/[id]/page.tsx`
- Delegate to client components immediately: `return <MapClient id={id} />`

**Styling:**
- Tailwind CSS 4 utility classes inline (no CSS modules, no styled-components)
- Custom CSS in `globals.css` for complex animations and print styles only
- Color tokens via custom Tailwind theme: `sand-*`, `sage-*`, `amber-*`, `earth-*`, `sky`, `rose`, `gold`, `lilac`
- Design system fonts: `font-serif` (Cormorant Garamond) for headings/prose, `font-sans` (Source Sans 3) for UI/data
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints
- Print styles via `no-print` class and `@media print` in globals.css

## Module Design

**Exports:**
- Components: single default export per file
- Engine modules: named exports for constants, types, and functions
- Lib utilities: named exports for all functions (no default exports)

**Barrel Files:**
- Not used. Import directly from the file: `import { parseMarkers } from "@/lib/markers"`

**Module Boundaries:**
- `engine/`: Prompt construction, types, templates -- pure logic, no React
- `lib/`: Client-side utilities -- browser APIs, persistence, analytics
- `components/`: React UI components -- presentation and interaction
- `app/api/`: Server-side API route handlers
- `app/`: Next.js pages and layouts

---

*Convention analysis: 2026-03-17*
