import { describe, it, expect, vi, beforeAll } from "vitest";

// ─── Mock the Anthropic SDK before importing the route ─────────────────────────
// The route does `new Anthropic()` and then `anthropic.messages.create(...)`.
// We capture the `user` message (which contains the assembled system prompt body)
// so we can assert on the compressed encoding + verification markers.

const capturedCalls: Array<{ system: unknown; messages: Array<{ role: string; content: string }> }> = [];

vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = {
      // SEC-03 (Plan 01-03): budgetCheck calls countTokens() before the
      // create() dispatch, so every Anthropic mock used by route tests must
      // stub it. Return a count well below the Sonnet 80K ceiling so no
      // trimming or 413 happens and the test can focus on the prompt payload.
      countTokens: async () => ({ input_tokens: 5_000 }),
      create: async (args: {
        system?: unknown;
        messages: Array<{ role: string; content: string }>;
      }) => {
        capturedCalls.push({ system: args.system, messages: args.messages });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                opening: "Good morning.",
                through_line: "Move first.",
                entries: [],
              }),
            },
          ],
          // SEC-05 (Plan 01-05b): withObservability reads resp.usage after
          // create() — the real SDK always returns it, so the mock must too.
          usage: { input_tokens: 5_000, output_tokens: 50 },
        };
      },
    };
  }
  return { default: MockAnthropic };
});

// Mock Supabase server so requireUser can run outside a Next.js request scope
// (no cookies() call). With PHASE_1_GATE_ENABLED unset, requireUser returns
// ctx with source:"system" and lets the request proceed — matching the pre-
// flag-flip production behavior that Plan 07 later enables.
vi.mock("@/lib/supabase-server", async () => {
  const { mockSupabaseNoSession } = await import("@/__tests__/fixtures/mock-supabase");
  return { createServerSupabase: () => Promise.resolve(mockSupabaseNoSession()) };
});

// Ensure the API key check in the route passes and the auth gate is off so
// this pre-existing compressed-encoding test stays green without needing to
// assert on the auth surface (which route.auth.test.ts covers separately).
beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.PHASE_1_GATE_ENABLED = "false";
});

// ─── Helper to build a realistic SheetCompileRequest body ─────────────────────

function buildRequestBody() {
  return {
    name: "Sarah",
    date: "2026-04-17",
    aspirations: [
      {
        id: "a1",
        rawText: "Build daily movement",
        clarifiedText: "Build daily movement",
        behaviors: [
          {
            key: "walk",
            text: "20-min walk",
            frequency: "daily",
            enabled: true,
            dimensions: ["body"],
          },
        ],
      },
    ],
    knownContext: { place: { name: "Portland", detail: "" } },
    humaContext: {
      _version: 1,
      _lastUpdated: new Date().toISOString(),
      _sources: [],
      body: { sleep: "7h" },
      people: { household: [{ name: "Sarah", relationship: "wife" }] },
      money: { income: "$80k", debt: "$10k student loans" },
      home: { location: "Portland OR" },
      growth: {},
      joy: { sources: ["reading"] },
      purpose: { whyStatement: "Live intentionally" },
      identity: { archetypes: ["Explorer"] },
      time: {},
      temporal: {},
      decisions: [],
      capacityState: {
        awareness: "emerging",
        honesty: "emerging",
        care: "emerging",
        agency: "emerging",
        humility: "emerging",
      },
    },
    recentHistory: [
      { date: "2026-04-16", behaviorKey: "walk", checked: true },
      { date: "2026-04-15", behaviorKey: "walk", checked: false },
    ],
    conversationMessages: [
      { role: "user", content: "I want to move more consistently." },
      { role: "assistant", content: "What's getting in the way right now?" },
    ],
    dayOfWeek: "Friday",
    season: "mid spring",
    dayCount: 14,
    archetypes: ["Explorer"],
    whyStatement: "Live intentionally",
    timeOfDay: "morning",
  };
}

describe("/api/sheet route — compressed context integration", () => {
  it("routes humaContext through compressed encoding + verification into the prompt", async () => {
    // Import lazily after env var is set and mock is registered
    const { POST } = await import("./route");

    const body = buildRequestBody();
    const req = new Request("http://localhost/api/sheet", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify(body),
    });

    // Reset capture between invocations in case other tests in the file run first
    capturedCalls.length = 0;

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(capturedCalls.length).toBe(1);
    const userMessage = capturedCalls[0].messages.find(m => m.role === "user");
    expect(userMessage).toBeDefined();

    const prompt = userMessage!.content;

    // 1. Compressed encoding markers
    expect(prompt).toContain("LIFE[d"); // folded header: LIFE[dN aN pN]
    expect(prompt).toContain("CAP[");   // capacity line
    expect(prompt).toContain("ASP:");   // aspiration block(s)

    // 2. The prompt should NOT contain raw JSON dumps of the HumaContext
    //    (e.g. "_version", "_sources", nested quotes around dimension objects).
    expect(prompt).not.toContain('"_version"');
    expect(prompt).not.toContain('"_sources"');
    expect(prompt).not.toContain('"capacityState":{');

    // 3. Because joy has only one source ("reading") and no rhythms, the
    //    folded view flags joy-dormant only when sources AND rhythms are empty.
    //    We have sources set, so no joy-dormant flag. We DO have debt set,
    //    so debt-active flag should appear.
    expect(prompt).toContain("debt-active");
  });
});
