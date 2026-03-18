import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mocks (must be declared before imports) ───

vi.mock("@anthropic-ai/sdk", () => {
  const mockStream = {
    [Symbol.asyncIterator]: async function* () {
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "Hello from mock" },
      };
    },
  };
  class MockAnthropic {
    messages = {
      stream: vi.fn().mockReturnValue(mockStream),
    };
  }
  return { default: MockAnthropic };
});

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/engine/phases", () => ({
  buildFullPrompt: vi.fn().mockReturnValue("mocked system prompt"),
  buildDocumentPrompt: vi.fn().mockReturnValue("mocked document prompt"),
}));

vi.mock("@/engine/canvas-prompt", () => ({
  buildCanvasDataPrompt: vi.fn().mockReturnValue("mocked canvas prompt"),
}));

vi.mock("@/lib/redis", () => ({
  getRedis: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/supabase-server", () => ({
  createServerSupabase: vi.fn().mockRejectedValue(new Error("No Supabase")),
}));

// ─── Imports (after mocks) ───

import { POST as chatPOST } from "@/app/api/chat/route";
import { POST as mapsPOST } from "@/app/api/maps/route";
import { isRateLimited } from "@/lib/rate-limit";

// ─── Helpers ───

function makeRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest(): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not valid json {{{",
  });
}

function makeMapsRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/maps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeMapsInvalidJsonRequest(): Request {
  return new Request("http://localhost:3000/api/maps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not valid json {{{",
  });
}

// ─── /api/chat tests ───

describe("/api/chat", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: "test-key" };
    vi.mocked(isRateLimited).mockResolvedValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("environment checks", () => {
    it("returns 503 when ANTHROPIC_API_KEY is missing", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      const req = makeRequest({
        messages: [{ role: "user", content: "hello" }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.error).toBe("Service temporarily unavailable");
    });

    it("returns 503 when ANTHROPIC_API_KEY is empty string", async () => {
      process.env.ANTHROPIC_API_KEY = "";
      const req = makeRequest({
        messages: [{ role: "user", content: "hello" }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(503);
    });
  });

  describe("rate limiting", () => {
    it("returns 429 when rate limited", async () => {
      vi.mocked(isRateLimited).mockResolvedValue(true);
      const req = makeRequest({
        messages: [{ role: "user", content: "hello" }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toContain("Too many requests");
    });
  });

  describe("request validation", () => {
    it("returns 400 for invalid JSON body", async () => {
      const req = makeInvalidJsonRequest();
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON");
    });

    it("returns 400 when messages array is empty", async () => {
      const req = makeRequest({ messages: [] });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Messages array required");
    });

    it("returns 400 when messages is not an array", async () => {
      const req = makeRequest({ messages: "not an array" });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Messages array required");
    });

    it("returns 400 when messages exceed 100", async () => {
      const messages = Array.from({ length: 101 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `message ${i}`,
      }));
      const req = makeRequest({ messages });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Too many messages");
    });

    it("returns 400 for invalid message role", async () => {
      const req = makeRequest({
        messages: [{ role: "system", content: "hello" }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid message role");
    });

    it("returns 400 when message content is not a string", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: 12345 }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid message content");
    });

    it("returns 400 when message content exceeds 50KB", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "x".repeat(50_001) }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid message content");
    });

    it("accepts message content at exactly 50KB", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "x".repeat(50_000) }],
      });
      const res = await chatPOST(req);
      // Should not be a 400 validation error
      expect(res.status).not.toBe(400);
    });

    it("returns 400 for invalid phase value", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "hello" }],
        phase: "nonexistent-phase",
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid phase");
    });

    it("accepts valid phase values", async () => {
      const validPhases = [
        "ikigai",
        "holistic-context",
        "landscape",
        "enterprise-map",
        "nodal-interventions",
        "operational-design",
        "complete",
      ];
      for (const phase of validPhases) {
        const req = makeRequest({
          messages: [{ role: "user", content: "hello" }],
          phase,
        });
        const res = await chatPOST(req);
        expect(res.status).not.toBe(400);
      }
    });

    it("returns 400 for null message object", async () => {
      const req = makeRequest({
        messages: [null],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid message format");
    });
  });

  describe("successful request", () => {
    it("returns a streaming response for a valid request", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "hello" }],
        phase: "ikigai",
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe(
        "text/plain; charset=utf-8"
      );

      // Read the stream to verify content
      const text = await res.text();
      expect(text).toBe("Hello from mock");
    });

    it("accepts requests without a phase (defaults to ikigai)", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "hello" }],
      });
      const res = await chatPOST(req);
      expect(res.status).toBe(200);
    });
  });
});

// ─── /api/maps tests ───

describe("/api/maps", () => {
  const originalRandomUUID = crypto.randomUUID;

  beforeEach(() => {
    crypto.randomUUID = vi.fn().mockReturnValue(
      "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    ) as unknown as typeof crypto.randomUUID;
  });

  afterEach(() => {
    crypto.randomUUID = originalRandomUUID;
  });

  describe("request validation", () => {
    it("returns 400 for invalid JSON", async () => {
      const req = makeMapsInvalidJsonRequest();
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON");
    });

    it("returns 400 when markdown is missing", async () => {
      const req = makeMapsRequest({
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("markdown required");
    });

    it("returns 400 when markdown is empty string", async () => {
      const req = makeMapsRequest({
        markdown: "",
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("markdown required");
    });

    it("returns 400 when markdown is not a string", async () => {
      const req = makeMapsRequest({
        markdown: 12345,
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("markdown required");
    });

    it("returns 400 when map is too large (>200KB)", async () => {
      const req = makeMapsRequest({
        markdown: "x".repeat(200_001),
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Map too large");
    });

    it("returns 400 when combined markdown + canvasData exceeds 200KB", async () => {
      const req = makeMapsRequest({
        markdown: "x".repeat(100_000),
        canvasData: { data: "y".repeat(100_010) },
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Map too large");
    });
  });

  describe("successful request", () => {
    it("returns success with an ID for valid payload", async () => {
      const req = makeMapsRequest({
        markdown: "# My Map\nSome content here",
        name: "Test Map",
        location: "Portland, OR",
        enterpriseCount: 3,
        createdAt: "2026-01-01T00:00:00Z",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    });

    it("returns stored: false when neither Supabase nor Redis is available", async () => {
      const req = makeMapsRequest({
        markdown: "# My Map",
        name: "Test",
        location: "Somewhere",
        enterpriseCount: 1,
        createdAt: "2026-01-01T00:00:00Z",
      });
      const res = await mapsPOST(req);
      const json = await res.json();
      // getRedis returns null, supabase throws => stored is false
      expect(json.stored).toBe(false);
    });

    it("accepts payload at exactly 200KB", async () => {
      const req = makeMapsRequest({
        markdown: "x".repeat(200_000),
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    });

    it("handles minimal valid payload (only markdown required)", async () => {
      const req = makeMapsRequest({
        markdown: "hello",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBeDefined();
    });
  });
});
