import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// ─── Mock browser globals ───────────────────────────────────────────────────

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
  length: 0,
  key: vi.fn((_i: number) => null),
};
vi.stubGlobal("window", { localStorage: localStorageMock, addEventListener: vi.fn(), removeEventListener: vi.fn() });
vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("crypto", { randomUUID: () => `test-${Date.now()}-${Math.random()}` });

// ─── Mock Supabase ──────────────────────────────────────────────────────────

const mockSupabaseData: Record<string, unknown[]> = {};

vi.mock("@/lib/supabase", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  })),
}));

// Mock the DB layer functions that store.ts imports
const mockGetAspirations = vi.fn().mockResolvedValue([]);
const mockSaveAspiration = vi.fn().mockResolvedValue(undefined);
const mockGetAllAspirations = vi.fn().mockResolvedValue([]);

vi.mock("./aspirations", () => ({
  getAspirations: (...args: unknown[]) => mockGetAspirations(...args),
  getAllAspirations: (...args: unknown[]) => mockGetAllAspirations(...args),
  saveAspiration: (...args: unknown[]) => mockSaveAspiration(...args),
}));

const mockGetKnownContext = vi.fn().mockResolvedValue({});
const mockUpdateKnownContext = vi.fn().mockResolvedValue(undefined);

vi.mock("./context", () => ({
  getKnownContext: (...args: unknown[]) => mockGetKnownContext(...args),
  updateKnownContext: (...args: unknown[]) => mockUpdateKnownContext(...args),
  getOrCreateContext: vi.fn().mockResolvedValue({ id: "ctx-1" }),
}));

const mockGetChatMessages = vi.fn().mockResolvedValue([]);
const mockSaveChatMessage = vi.fn().mockResolvedValue(undefined);
const mockSaveChatMessages = vi.fn().mockResolvedValue(undefined);

vi.mock("./chat", () => ({
  getChatMessages: (...args: unknown[]) => mockGetChatMessages(...args),
  saveChatMessage: (...args: unknown[]) => mockSaveChatMessage(...args),
  saveChatMessages: (...args: unknown[]) => mockSaveChatMessages(...args),
}));

const mockGetPatterns = vi.fn().mockResolvedValue([]);
const mockSavePattern = vi.fn().mockResolvedValue(undefined);
const mockUpdatePattern = vi.fn().mockResolvedValue(undefined);
const mockDeletePattern = vi.fn().mockResolvedValue(undefined);

vi.mock("./patterns", () => ({
  getPatterns: (...args: unknown[]) => mockGetPatterns(...args),
  savePattern: (...args: unknown[]) => mockSavePattern(...args),
  updatePattern: (...args: unknown[]) => mockUpdatePattern(...args),
  deletePattern: (...args: unknown[]) => mockDeletePattern(...args),
}));

const mockSaveInsight = vi.fn().mockResolvedValue(undefined);
const mockGetUndeliveredInsight = vi.fn().mockResolvedValue(null);

vi.mock("./insights", () => ({
  saveInsight: (...args: unknown[]) => mockSaveInsight(...args),
  getUndeliveredInsight: (...args: unknown[]) => mockGetUndeliveredInsight(...args),
}));

// ─── Import store after mocks are set up ────────────────────────────────────

import {
  storeSaveAspiration,
  storeLoadAspirations,
  storeUpdateLocalAspirations,
  storeSaveContext,
  storeLoadContext,
  storeReadLocalContext,
  storeSaveChatMessage,
  storeWriteLocalMessages,
  storeLoadChatMessages,
  storeSaveInsight,
  storeLoadInsight,
  storeSavePattern,
  storeUpdatePattern,
  storeDeletePattern,
  storeLoadPatterns,
  clearTodaySheetCache,
  flushWal,
  getPendingCount,
  getSyncState,
  subscribeSyncStatus,
} from "./store";

import type { Aspiration, ChatMessage, Insight, Pattern } from "@/types/v2";

// ─── Test Data ──────────────────────────────────────────────────────────────

const makeAspiration = (id = "asp-1"): Aspiration => ({
  id,
  rawText: "Get healthier",
  clarifiedText: "Build physical health",
  behaviors: [],
  dimensionsTouched: [],
  status: "active",
  stage: "active",
});

const makeMessage = (id = "msg-1"): ChatMessage => ({
  id,
  role: "user",
  content: "Hello HUMA",
  createdAt: new Date().toISOString(),
});

const makePattern = (id = "pat-1"): Pattern => ({
  id,
  aspirationId: "asp-1",
  name: "Morning routine",
  trigger: "Wake up",
  steps: [{ behaviorKey: "stretch", text: "Stretch", order: 0, isTrigger: true }],
  validationCount: 0,
  validationTarget: 30,
  status: "finding",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const makeInsight = (id = "ins-1"): Insight => ({
  id,
  text: "Your morning stretch connects body and growth",
  dimensionsInvolved: ["body", "growth"],
  behaviorsInvolved: ["stretch"],
  dataBasis: { correlation: 1, dataPoints: 5, pattern: "structural" },
  delivered: false,
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("store", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.clearAllMocks();
  });

  // ── Aspirations ──

  describe("aspirations", () => {
    it("saves to localStorage immediately (WAL)", async () => {
      const asp = makeAspiration();
      await storeSaveAspiration(null, asp);

      const saved = JSON.parse(store["huma-v2-aspirations"]);
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe("asp-1");
    });

    it("writes to Supabase when userId provided", async () => {
      const asp = makeAspiration();
      await storeSaveAspiration("user-1", asp);

      expect(mockSaveAspiration).toHaveBeenCalledOnce();
    });

    it("keeps WAL entry on Supabase failure", async () => {
      mockSaveAspiration.mockRejectedValueOnce(new Error("DB error"));
      const asp = makeAspiration();
      await storeSaveAspiration("user-1", asp);

      // WAL should have an entry
      const wal = JSON.parse(store["huma-v2-wal"]);
      expect(wal).toHaveLength(1);
      expect(wal[0].type).toBe("aspiration");
    });

    it("removes WAL entry on Supabase success", async () => {
      const asp = makeAspiration();
      await storeSaveAspiration("user-1", asp);

      const wal = JSON.parse(store["huma-v2-wal"] || "[]");
      expect(wal).toHaveLength(0);
    });

    it("loads from Supabase when authed, falls back to localStorage", async () => {
      const dbAsp = makeAspiration("db-asp");
      mockGetAspirations.mockResolvedValueOnce([dbAsp]);

      const result = await storeLoadAspirations("user-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("db-asp");
    });

    it("falls back to localStorage when Supabase returns empty", async () => {
      mockGetAspirations.mockResolvedValueOnce([]);
      store["huma-v2-aspirations"] = JSON.stringify([makeAspiration("local-asp")]);

      const result = await storeLoadAspirations("user-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("local-asp");
    });

    it("falls back to localStorage when not authed", async () => {
      store["huma-v2-aspirations"] = JSON.stringify([makeAspiration("local-asp")]);

      const result = await storeLoadAspirations(null);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("local-asp");
    });

    it("upserts by id in localStorage", async () => {
      const asp1 = makeAspiration("asp-1");
      await storeSaveAspiration(null, asp1);

      const updated = { ...asp1, clarifiedText: "Updated text" };
      await storeSaveAspiration(null, updated);

      const saved = JSON.parse(store["huma-v2-aspirations"]);
      expect(saved).toHaveLength(1);
      expect(saved[0].clarifiedText).toBe("Updated text");
    });

    it("storeUpdateLocalAspirations replaces all", () => {
      const asps = [makeAspiration("a"), makeAspiration("b")];
      storeUpdateLocalAspirations(asps);

      const saved = JSON.parse(store["huma-v2-aspirations"]);
      expect(saved).toHaveLength(2);
    });
  });

  // ── Context ──

  describe("context", () => {
    it("saves to localStorage and Supabase", async () => {
      const ctx = { name: "Sarah", place: "Oregon" };
      await storeSaveContext("user-1", ctx);

      expect(JSON.parse(store["huma-v2-known-context"])).toEqual(ctx);
      expect(mockUpdateKnownContext).toHaveBeenCalledOnce();
    });

    it("loads from Supabase when authed", async () => {
      mockGetKnownContext.mockResolvedValueOnce({ name: "DB Sarah" });

      const result = await storeLoadContext("user-1");
      expect(result).toEqual({ name: "DB Sarah" });
    });

    it("falls back to localStorage when not authed", async () => {
      store["huma-v2-known-context"] = JSON.stringify({ name: "Local Sarah" });

      const result = await storeLoadContext(null);
      expect(result).toEqual({ name: "Local Sarah" });
    });

    it("storeReadLocalContext reads synchronously", () => {
      store["huma-v2-known-context"] = JSON.stringify({ foo: "bar" });
      expect(storeReadLocalContext()).toEqual({ foo: "bar" });
    });
  });

  // ── Chat Messages ──

  describe("chat messages", () => {
    it("saves message to localStorage and Supabase", async () => {
      const msg = makeMessage();
      await storeSaveChatMessage("user-1", msg, "chat");

      const saved = JSON.parse(store["huma-v2-chat-messages"]);
      expect(saved).toHaveLength(1);
      expect(mockSaveChatMessage).toHaveBeenCalledOnce();
    });

    it("saves start messages to correct key", async () => {
      const msg = makeMessage();
      await storeSaveChatMessage(null, msg, "start");

      expect(store["huma-v2-start-messages"]).toBeDefined();
      expect(store["huma-v2-chat-messages"]).toBeUndefined();
    });

    it("storeWriteLocalMessages bulk writes", () => {
      const msgs = [makeMessage("m1"), makeMessage("m2")];
      storeWriteLocalMessages(msgs, "chat");

      const saved = JSON.parse(store["huma-v2-chat-messages"]);
      expect(saved).toHaveLength(2);
    });

    it("loads from Supabase when authed", async () => {
      const dbMsg = makeMessage("db-msg");
      mockGetChatMessages.mockResolvedValueOnce([dbMsg]);

      const result = await storeLoadChatMessages("user-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("db-msg");
    });

    it("falls back to chat then start messages in localStorage", async () => {
      store["huma-v2-start-messages"] = JSON.stringify([makeMessage("start-msg")]);

      const result = await storeLoadChatMessages(null);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("start-msg");
    });
  });

  // ── Patterns ──

  describe("patterns", () => {
    it("saves to localStorage and Supabase", async () => {
      const pat = makePattern();
      await storeSavePattern("user-1", pat);

      const saved = JSON.parse(store["huma-v2-patterns"]);
      expect(saved).toHaveLength(1);
      expect(mockSavePattern).toHaveBeenCalledOnce();
    });

    it("updates in localStorage and Supabase", async () => {
      store["huma-v2-patterns"] = JSON.stringify([makePattern()]);
      await storeUpdatePattern("user-1", "pat-1", { name: "Updated routine" });

      const saved = JSON.parse(store["huma-v2-patterns"]);
      expect(saved[0].name).toBe("Updated routine");
      expect(mockUpdatePattern).toHaveBeenCalledOnce();
    });

    it("deletes from localStorage and Supabase", async () => {
      store["huma-v2-patterns"] = JSON.stringify([makePattern()]);
      await storeDeletePattern("user-1", "pat-1");

      const saved = JSON.parse(store["huma-v2-patterns"]);
      expect(saved).toHaveLength(0);
      expect(mockDeletePattern).toHaveBeenCalledOnce();
    });

    it("loads from Supabase when authed", async () => {
      const dbPat = makePattern("db-pat");
      mockGetPatterns.mockResolvedValueOnce([dbPat]);

      const result = await storeLoadPatterns("user-1");
      expect(result[0].id).toBe("db-pat");
    });
  });

  // ── Insights ──

  describe("insights", () => {
    it("saves to localStorage and Supabase", async () => {
      const insight = makeInsight();
      await storeSaveInsight("user-1", insight);

      const saved = JSON.parse(store["huma-v2-pending-insight"]);
      expect(saved.id).toBe("ins-1");
      expect(mockSaveInsight).toHaveBeenCalledOnce();
    });

    it("loads from Supabase when authed", async () => {
      const dbInsight = makeInsight("db-ins");
      mockGetUndeliveredInsight.mockResolvedValueOnce(dbInsight);

      const result = await storeLoadInsight("user-1");
      expect(result?.id).toBe("db-ins");
    });

    it("falls back to localStorage when no Supabase data", async () => {
      mockGetUndeliveredInsight.mockResolvedValueOnce(null);
      store["huma-v2-pending-insight"] = JSON.stringify(makeInsight("local-ins"));

      const result = await storeLoadInsight("user-1");
      expect(result?.id).toBe("local-ins");
    });
  });

  // ── WAL Flush ──

  describe("WAL flush", () => {
    it("flushes all pending entries to Supabase", async () => {
      // Create pending entries by failing Supabase
      mockSaveAspiration.mockRejectedValueOnce(new Error("offline"));
      await storeSaveAspiration("user-1", makeAspiration());
      expect(getPendingCount()).toBe(1);

      // Now flush
      mockSaveAspiration.mockResolvedValueOnce(undefined);
      const result = await flushWal("user-1");

      expect(result.flushed).toBe(1);
      expect(result.failed).toBe(0);
      expect(getPendingCount()).toBe(0);
    });

    it("keeps entries that fail during flush", async () => {
      mockSaveAspiration.mockRejectedValueOnce(new Error("offline"));
      await storeSaveAspiration("user-1", makeAspiration());

      mockSaveAspiration.mockRejectedValueOnce(new Error("still offline"));
      const result = await flushWal("user-1");

      expect(result.flushed).toBe(0);
      expect(result.failed).toBe(1);
      expect(getPendingCount()).toBe(1);
    });

    it("drops entries after 3 retries", async () => {
      // Set up a WAL entry with retries already at 3 (max)
      const walEntry = {
        id: "test-wal",
        type: "aspiration" as const,
        payload: { userId: "user-1", aspiration: makeAspiration() },
        createdAt: new Date().toISOString(),
        retries: 3,
      };
      store["huma-v2-wal"] = JSON.stringify([walEntry]);

      mockSaveAspiration.mockRejectedValueOnce(new Error("fail again"));
      const result = await flushWal("user-1");

      // Entry had retries >= 3, so it gets dropped
      expect(result.failed).toBe(0);
      expect(getPendingCount()).toBe(0);
    });
  });

  // ── Sync Status ──

  describe("sync status", () => {
    it("is synced when WAL is empty", async () => {
      // Flush to clear any WAL from previous tests
      store["huma-v2-wal"] = JSON.stringify([]);
      // A successful save should leave state synced
      await storeSaveAspiration(null, makeAspiration("sync-clean"));
      // No Supabase = no WAL entry needed = synced
      expect(getSyncState().state).toBe("synced");
    });

    it("notifies subscribers on state change", async () => {
      const states: string[] = [];
      const unsub = subscribeSyncStatus((s) => { states.push(s); });

      mockSaveAspiration.mockRejectedValueOnce(new Error("offline"));
      await storeSaveAspiration("user-1", makeAspiration("sync-test"));

      unsub();
      expect(states).toContain("pending");
    });
  });

  // ── Cache Helpers ──

  describe("clearTodaySheetCache", () => {
    it("removes today's sheet cache keys", () => {
      const today = new Date().toISOString().slice(0, 10);
      store[`huma-v2-sheet-${today}`] = "cached";
      store[`huma-v2-compiled-sheet-${today}`] = "cached";

      clearTodaySheetCache();

      expect(store[`huma-v2-sheet-${today}`]).toBeUndefined();
      expect(store[`huma-v2-compiled-sheet-${today}`]).toBeUndefined();
    });
  });

  // ── Conflict Resolution ──

  describe("conflict resolution", () => {
    it("Supabase data wins over localStorage when authed", async () => {
      // localStorage has old data
      store["huma-v2-aspirations"] = JSON.stringify([makeAspiration("local-old")]);

      // Supabase has newer data
      mockGetAspirations.mockResolvedValueOnce([makeAspiration("server-new")]);

      const result = await storeLoadAspirations("user-1");
      expect(result[0].id).toBe("server-new");
    });

    it("localStorage wins when Supabase fails", async () => {
      store["huma-v2-aspirations"] = JSON.stringify([makeAspiration("local-fallback")]);
      mockGetAspirations.mockRejectedValueOnce(new Error("network error"));

      const result = await storeLoadAspirations("user-1");
      expect(result[0].id).toBe("local-fallback");
    });

    it("localStorage wins when not authenticated", async () => {
      store["huma-v2-known-context"] = JSON.stringify({ name: "Anon" });

      const result = await storeLoadContext(null);
      expect(result).toEqual({ name: "Anon" });
      expect(mockGetKnownContext).not.toHaveBeenCalled();
    });
  });
});
