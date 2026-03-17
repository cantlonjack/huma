# Codebase Concerns

**Analysis Date:** 2026-03-17

## Tech Debt

**Duplicated Engine Code (Critical):**
- Issue: The entire engine layer is duplicated between `src/engine/` (3 files, ~2,334 lines) and `app/src/engine/` (6 files, ~2,720 lines). The root `src/engine/` copies are explicitly labeled "REFERENCE COPY" with a note to "keep these in sync" (`src/engine/prompts.ts` line 9-10). The `app/src/engine/` copy is the canonical runtime version and has already diverged: `app/src/engine/enterprise-templates.ts` (1,307 lines) includes a `computeAggregateCapitalScores()` function not present in the root copy (1,282 lines). The root `src/engine/prompts.ts` inlines types that `app/src/engine/` properly separates into `types.ts`, `phases.ts`, and `canvas-prompt.ts`.
- Files: `src/engine/prompts.ts`, `src/engine/enterprise-templates.ts`, `src/engine/operational-prompts.ts` vs `app/src/engine/phases.ts`, `app/src/engine/enterprise-templates.ts`, `app/src/engine/operational-prompts.ts`, `app/src/engine/types.ts`, `app/src/engine/canvas-types.ts`, `app/src/engine/canvas-prompt.ts`
- Impact: Any change to prompts or templates must be made in two places or they silently diverge further. The root copies serve no runtime purpose. A skill instruction (`.claude/skills/huma-enterprise-author/SKILL.md` line 128) explicitly tells contributors to edit both, which is error-prone.
- Fix approach: Delete `src/engine/` entirely. If a shared-engine concept is needed outside the Next.js app, create a proper workspace package with a single source of truth.

**God Component `page.tsx` (High):**
- Issue: `app/src/app/page.tsx` is 751 lines containing all app state, all business logic, all routing logic, all UI for 4 distinct views (landing, welcome, conversation, generating, map), and streaming/parsing/persistence orchestration. It has 16 `useState` calls, 2 `useRef` calls, and 6 `useCallback` hooks.
- Files: `app/src/app/page.tsx`
- Impact: Every feature change touches this file. State management is fragile (e.g., `contextRef` as a mutable ref alongside `contextSnapshot` as state). Testing the orchestration logic requires rendering the entire app. Adding Operate Mode or Evolve Mode will make this unmanageable.
- Fix approach: Extract into (1) a state machine or reducer for app state transitions, (2) a custom hook for conversation logic (`useConversation`), (3) a custom hook for map generation (`useMapGeneration`), (4) separate page components for each `AppState` view.

**Duplicated `getRedis()` Function:**
- Issue: The `getRedis()` function is copy-pasted identically in both map API routes.
- Files: `app/src/app/api/maps/route.ts` (lines 4-9), `app/src/app/api/maps/[id]/route.ts` (lines 4-9)
- Impact: Minor. Any change to Redis configuration must be made in both files.
- Fix approach: Extract to `app/src/lib/redis.ts` and import in both routes.

**Duplicated Top-Bar UI:**
- Issue: The map view top-bar (HUMA branding, view toggle, share/print buttons) is implemented separately in `app/src/app/page.tsx` (lines 685-708), `app/src/app/map/[id]/MapClient.tsx` (lines 117-166), and `app/src/app/map/sample/SampleMapClient.tsx` (lines 22-61). Each has slightly different styling and button sets.
- Files: `app/src/app/page.tsx`, `app/src/app/map/[id]/MapClient.tsx`, `app/src/app/map/sample/SampleMapClient.tsx`
- Impact: Inconsistent UI across map views. Design changes must be applied in 3 places.
- Fix approach: Extract a shared `MapTopBar` component accepting props for which buttons to show.

**Large Static Sample Data in Bundle:**
- Issue: `app/src/lib/sample-map.ts` is 552 lines of static sample data (markdown + full CanvasData object) that ships in the client bundle for the sample map page.
- Files: `app/src/lib/sample-map.ts`
- Impact: Increases initial JavaScript bundle size. The markdown alone is ~5KB of text.
- Fix approach: Move to a static JSON file loaded server-side, or lazy-load via dynamic import only on the sample map route.

## Known Bugs

**Missing `generateMap` in `sendMessage` Dependency Array:**
- Symptoms: `sendMessage` callback (line 191) calls `generateMap()` on line 278 when `isComplete` is true, but `generateMap` is not listed in the `sendMessage` dependency array (line 292). This means `sendMessage` captures a stale `generateMap` closure.
- Files: `app/src/app/page.tsx` (lines 191-293, 301-421)
- Trigger: When the AI signals conversation completion (`[[PHASE:complete]]`), `generateMap` is called but may use stale `operatorName`/`operatorLocation` values from when `sendMessage` was last constructed.
- Workaround: In practice, `operatorName` and `operatorLocation` are set at conversation start and rarely change, so the stale closure usually has correct values. But this is a latent bug that React's exhaustive-deps lint rule would flag.

**URL State Not Synced with React State:**
- Symptoms: After map generation, `window.history.pushState` (line 416) changes the URL to `/map/{id}` without a full navigation. If the user refreshes, the Next.js `/map/[id]/page.tsx` route handler loads, which fetches the map from Redis/localStorage. But the in-memory conversation state is lost. Pressing browser "back" does nothing useful because the SPA state is gone.
- Files: `app/src/app/page.tsx` (line 416)
- Trigger: User generates a map, then presses browser back button or refreshes.
- Workaround: The conversation is persisted to localStorage, but the "back" navigation behavior is broken.

**Rate Limiter Memory Leak Potential:**
- Symptoms: The in-memory rate limit map (`rateLimitMap`) in the chat API route uses `setInterval` for cleanup every 5 minutes (line 31). In serverless environments (Vercel), this interval may not fire reliably since functions are ephemeral. In long-lived server processes, the map could grow without bound between cleanup intervals under high traffic.
- Files: `app/src/app/api/chat/route.ts` (lines 8-32)
- Trigger: High request volume on a non-serverless deployment.
- Workaround: On Vercel (the deployment target), each function invocation is stateless, so the in-memory map resets per cold start. The rate limiter is effectively a no-op on serverless. It only works within a single warm instance.

## Security Considerations

**No Authentication or Authorization:**
- Risk: All API endpoints (`/api/chat`, `/api/maps`, `/api/maps/[id]`) are completely unauthenticated. Anyone can generate maps (consuming Claude API credits), store maps (consuming Redis storage), and retrieve any map by ID.
- Files: `app/src/app/api/chat/route.ts`, `app/src/app/api/maps/route.ts`, `app/src/app/api/maps/[id]/route.ts`
- Current mitigation: The in-memory rate limiter on the chat route (10 requests/minute per IP) provides minimal protection but is ineffective on Vercel serverless. No rate limiting on map storage/retrieval.
- Recommendations: For MVP this is acceptable, but before any public launch: (1) add Vercel Edge rate limiting or use Upstash rate limiting, (2) add CSRF protection, (3) plan for authentication when Operate Mode (paid feature) is added.

**Predictable Map IDs:**
- Risk: Map IDs are generated as `Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` (line 36 of `app/src/app/api/maps/route.ts`). The timestamp component is predictable, and only 4 characters of randomness are appended (~1.7 million combinations). Map contents (including personal information like name, location, life aspirations) are retrievable by anyone who guesses the ID.
- Files: `app/src/app/api/maps/route.ts` (line 36)
- Current mitigation: None. Maps are public by ID.
- Recommendations: Use `crypto.randomUUID()` for IDs (128-bit randomness). Consider adding a viewer token or requiring the map owner to explicitly opt into sharing.

**Anthropic API Key Exposed to Server Only (Good):**
- Risk: Low. The `ANTHROPIC_API_KEY` is only used server-side in `app/src/app/api/chat/route.ts`. It is not prefixed with `NEXT_PUBLIC_` so it is not exposed to the client.
- Files: `app/src/app/api/chat/route.ts` (line 69)
- Current mitigation: Correct server-side-only access. `.env*` files are in `.gitignore`.
- Recommendations: No action needed.

**No Input Sanitization on Map Storage:**
- Risk: Map content (markdown and canvasData) is stored directly from the AI response without sanitization. If the AI hallucinates or is prompt-injected to include malicious content, it goes directly into storage and is rendered on the map view page.
- Files: `app/src/app/api/maps/route.ts` (line 37-46), `app/src/components/MapDocument.tsx` (ReactMarkdown rendering)
- Current mitigation: ReactMarkdown with `remarkGfm` does not render raw HTML by default, which provides XSS protection. The `canvasData` is used as structured data, not raw HTML.
- Recommendations: Add server-side content validation for the `canvasData` shape before storage. Consider adding a Content-Security-Policy header.

**User-Provided Name/Location in OpenGraph Metadata:**
- Risk: The map page's `generateMetadata` function directly interpolates the `name` query parameter into OpenGraph tags without sanitization: `Regenerative Enterprise Map for ${name}`.
- Files: `app/src/app/map/[id]/page.tsx` (lines 12-14)
- Current mitigation: Next.js escapes metadata values in HTML output.
- Recommendations: Low risk due to framework escaping, but consider length-limiting the name parameter.

## Performance Bottlenecks

**Full Conversation History Sent on Every Message:**
- Problem: Every message the user sends triggers a POST to `/api/chat` with the complete message history (`updatedMessages.map(...)` on line 211 of `app/src/app/page.tsx`). Over a 30-50 exchange conversation, this payload grows substantially.
- Files: `app/src/app/page.tsx` (lines 207-218), `app/src/app/api/chat/route.ts` (lines 139-147)
- Cause: The Anthropic API requires full conversation history. There is a 100-message hard limit (line 50 of route.ts) and 50KB per message limit (line 57), but a 50-exchange conversation with long AI responses could approach the API's context window limit or cause slow network transfers.
- Improvement path: Implement server-side conversation storage so only a conversation ID is sent. Alternatively, implement sliding-window context with synthesized summaries of earlier exchanges. For MVP this is acceptable.

**Dual Parallel API Calls for Map Generation:**
- Problem: Map generation fires two parallel Claude API calls (lines 320-339 of `app/src/app/page.tsx`) -- one for canvas JSON, one for document markdown. Each uses 8,192 max tokens with the full system prompt.
- Files: `app/src/app/page.tsx` (lines 320-339), `app/src/app/api/chat/route.ts` (lines 115-137)
- Cause: Two separate generation tasks are needed for the two view formats. Both use `claude-sonnet-4-20250514`.
- Improvement path: Consider generating canvas data first and deriving the document from it (or vice versa), rather than making two independent LLM calls. This would halve API costs and reduce latency.

**No Code Splitting by Route:**
- Problem: The main `page.tsx` imports `LivingCanvas`, `MapDocument`, `ShapeChart`, `MapPreview`, and all their dependencies even when showing the landing page. All canvas sub-components (`EssenceCore`, `QoLRing`, etc.) load eagerly.
- Files: `app/src/app/page.tsx` (imports on lines 9-16)
- Cause: All components are statically imported at the top of the page.
- Improvement path: Use `next/dynamic` with `{ ssr: false }` for `LivingCanvas`, `MapDocument`, and other components only needed in later app states.

## Fragile Areas

**Marker Parsing System:**
- Files: `app/src/lib/markers.ts`, `app/src/app/page.tsx` (lines 236-265)
- Why fragile: The entire phase transition and context capture system depends on the AI model outputting markers in exact formats like `[[PHASE:landscape]]` and `[[CONTEXT:ikigai-synthesis]]`. If the model changes its behavior, uses slightly different formatting, or omits markers, phase transitions silently fail and context accumulation breaks. The regex in `parseMarkers()` is strict: `\[\[PHASE:([\w-]+)\]\]`.
- Safe modification: The marker tests in `app/src/__tests__/markers.test.ts` cover basic cases. Any changes to marker format must update both the regex in `markers.ts` and the prompt instructions in `app/src/engine/phases.ts` (lines 260-286).
- Test coverage: Covered by `markers.test.ts` but only for clean inputs. No tests for partial/malformed markers arriving mid-stream.

**Context Accumulation via `accumulateContext`:**
- Files: `app/src/app/page.tsx` (lines 133-189)
- Why fragile: Context from AI responses is accumulated into `contextRef` using a chain of if/else-if blocks matching on `contextType` strings. Each branch creates a new context object with many fields set to empty strings (e.g., `loves: [], skills: [], worldNeeds: [], sustains: []` on line 139-140). This means the structured fields of `ConversationContext` are never actually populated -- only the synthesis string field is filled. Any code that later tries to read `context.ikigai.loves` will get an empty array.
- Safe modification: If you need to populate structured fields, the AI prompt would need to output structured data within the context markers, and `accumulateContext` would need to parse it. Currently the system works because only synthesis strings are used downstream.
- Test coverage: No unit tests for `accumulateContext`.

**`page.tsx` Rendering Logic for Multiple Views:**
- Files: `app/src/app/page.tsx` (lines 424-751)
- Why fragile: The component uses a chain of `if (appState === "...")` blocks that render entirely different UIs. Each block has access to all 16 state variables. A state variable change in one view can cause unintended renders in another. The `inEnterpriseSection` tracking variable in `MapDocument.tsx` (line 108) uses a mutable `let` that changes during render -- this is a React anti-pattern that can break in concurrent mode.
- Safe modification: Always verify that state changes don't affect other views. Consider extracting each view to its own component.
- Test coverage: No component tests exist for any view.

## Scaling Limits

**In-Memory Rate Limiting:**
- Current capacity: One rate limit map per server instance, resets on cold start.
- Limit: Completely ineffective on Vercel serverless (each invocation may be a fresh instance). No protection against API credit abuse.
- Scaling path: Use Upstash Redis-based rate limiting (`@upstash/ratelimit`) which is already compatible with the existing Upstash setup. Or use Vercel Edge middleware rate limiting.

**Redis Map Storage with 90-Day TTL:**
- Current capacity: Depends on Upstash plan. Each map is markdown (~5-10KB) + canvasData JSON (~5-15KB), so roughly 10-25KB per map.
- Limit: Upstash free tier has limited storage. Maps expire after 90 days with no warning to users.
- Scaling path: Add user accounts so maps persist. Consider PostgreSQL (as specified in CLAUDE.md tech stack) for permanent storage instead of Redis.

**localStorage as Primary Map Cache:**
- Current capacity: ~5-10MB per domain across all browsers.
- Limit: Users with multiple maps will fill localStorage. No eviction strategy.
- Scaling path: Add cleanup of old maps, or move to IndexedDB for larger capacity.

## Dependencies at Risk

**No Version Pinning:**
- Risk: `package.json` uses caret ranges (`^`) for all dependencies. A breaking change in any dependency could break the build.
- Impact: `next@16.1.6` and `react@19.2.3` are very recent versions. Tailwind v4 has significant API changes from v3.
- Migration plan: Consider pinning exact versions for critical dependencies (`next`, `react`, `@anthropic-ai/sdk`). The lockfile (`package-lock.json`) provides deterministic builds, but upgrading requires care.

**Claude API Model Hardcoded:**
- Risk: The model `claude-sonnet-4-20250514` is hardcoded in `app/src/app/api/chat/route.ts` (line 140). Model deprecation would require a code change.
- Impact: When Anthropic deprecates this model version, the app will break.
- Migration plan: Move the model name to an environment variable (e.g., `ANTHROPIC_MODEL`). The CLAUDE.md spec mentions using "Sonnet for conversation, Opus for document generation" but only one model is used for everything.

## Missing Critical Features

**No User Accounts:**
- Problem: There is no user authentication. Maps are anonymous, conversations are stored only in localStorage, and there is no way to return to a map after clearing browser data (except via the shareable URL within the 90-day Redis TTL).
- Blocks: Operate Mode (daily/weekly guidance), Evolve Mode (seasonal review), any subscription/payment functionality, map history.

**No Error Boundary:**
- Problem: There is no React error boundary anywhere in the component tree. An unhandled error in any component will crash the entire app and lose the user's conversation state.
- Files: All components in `app/src/components/` and `app/src/app/`
- Blocks: Production reliability. A JSON parse error in canvas data rendering or a markdown rendering error will show a white screen.

**No Operate or Evolve Mode:**
- Problem: The prompts for weekly review (`WEEKLY_REVIEW_PROMPT`), morning briefing (`MORNING_BRIEFING_PROMPT`), and seasonal review (`SEASONAL_REVIEW_PROMPT`) are fully written in `app/src/engine/operational-prompts.ts` but have no UI or API integration.
- Files: `app/src/engine/operational-prompts.ts` (lines 257-420)
- Blocks: These are the core product retention features (Operate = $29/month, Evolve = $99/month per CLAUDE.md).

## Test Coverage Gaps

**No API Route Tests:**
- What's not tested: The `/api/chat`, `/api/maps`, and `/api/maps/[id]` API routes have zero test coverage. This includes request validation, rate limiting logic, streaming response construction, and Redis interactions.
- Files: `app/src/app/api/chat/route.ts`, `app/src/app/api/maps/route.ts`, `app/src/app/api/maps/[id]/route.ts`
- Risk: Changes to the API could break the chat flow, map storage, or map retrieval without detection.
- Priority: High

**No Component Tests:**
- What's not tested: None of the React components have tests. This includes `Chat.tsx`, `MapDocument.tsx`, `MapPreview.tsx`, `ShapeChart.tsx`, `LivingCanvas.tsx`, and all canvas sub-components.
- Files: All files in `app/src/components/` and `app/src/components/canvas/`
- Risk: UI regressions go undetected. The `MapDocument.tsx` rendering logic (table detection, capital bar rendering, enterprise section tracking) is particularly complex and untested.
- Priority: Medium

**No Integration/E2E Tests:**
- What's not tested: The full user flow -- landing -> name input -> conversation -> map generation -> map viewing -- has no automated test coverage.
- Files: N/A (no test infrastructure for E2E)
- Risk: End-to-end regressions in the conversation flow, phase transitions, or map generation can only be caught by manual testing.
- Priority: Medium

**No Tests for `page.tsx` Business Logic:**
- What's not tested: The `accumulateContext` function, `sendMessage` orchestration, `generateMap` flow, and state transitions in `page.tsx` are not tested. These contain the core business logic of the application.
- Files: `app/src/app/page.tsx`
- Risk: The most critical code paths are completely untested. Refactoring the god component is risky without test coverage.
- Priority: High

**Existing Tests Are Shallow:**
- What's not tested well: The 4 existing test files (`phases.test.ts`, `enterprise-templates.test.ts`, `markers.test.ts`, `persistence.test.ts`) total ~408 lines and primarily test that strings contain expected substrings. No behavioral tests, no edge cases for marker parsing with malformed input, no tests for enterprise template financial calculations.
- Files: `app/src/__tests__/*.test.ts`
- Risk: Tests pass but don't catch real bugs.
- Priority: Low (existing tests are better than nothing)

---

*Concerns audit: 2026-03-17*
