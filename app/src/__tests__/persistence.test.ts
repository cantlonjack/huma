import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage before importing the module
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

import { saveConversation, loadConversation, clearConversation } from "@/lib/persistence";

describe("persistence", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.clearAllMocks();
  });

  it("saves and loads a conversation", () => {
    const data = {
      messages: [{ id: "1", role: "assistant" as const, content: "Hello" }],
      phase: "ikigai" as const,
      context: {},
      operatorName: "Sarah",
      operatorLocation: "Oregon",
      savedAt: new Date().toISOString(),
    };
    saveConversation(data);
    const loaded = loadConversation();
    expect(loaded).not.toBeNull();
    expect(loaded!.operatorName).toBe("Sarah");
    expect(loaded!.messages).toHaveLength(1);
  });

  it("returns null when no conversation saved", () => {
    expect(loadConversation()).toBeNull();
  });

  it("clears conversation", () => {
    const data = {
      messages: [{ id: "1", role: "assistant" as const, content: "Hi" }],
      phase: "ikigai" as const,
      context: {},
      operatorName: "Test",
      operatorLocation: "",
      savedAt: new Date().toISOString(),
    };
    saveConversation(data);
    clearConversation();
    expect(loadConversation()).toBeNull();
  });

  it("returns null for invalid stored data", () => {
    store["huma-conversation"] = "not json at all";
    expect(loadConversation()).toBeNull();
  });

  it("returns null for JSON without required fields", () => {
    store["huma-conversation"] = JSON.stringify({ foo: "bar" });
    expect(loadConversation()).toBeNull();
  });
});
