import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mocks (must be declared before imports) ───

vi.mock("@/lib/redis", () => ({
  getRedis: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/supabase-server", () => ({
  createServerSupabase: vi.fn().mockRejectedValue(new Error("No Supabase")),
}));

// ─── Imports (after mocks) ───

import { POST as mapsPOST } from "@/app/api/maps/route";

// ─── Helpers ───

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
      expect(json.error).toContain("Invalid JSON");
    });

    it("returns 400 when markdown is missing", async () => {
      const req = makeMapsRequest({
        name: "Test",
        location: "Somewhere",
      });
      const res = await mapsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("markdown");
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
      expect(json.error).toContain("markdown");
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
      expect(json.error).toContain("markdown");
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
      expect(json.error).toContain("Map too large");
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
      expect(json.error).toContain("Map too large");
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
