/**
 * Unified persistence store — single source of truth for all HUMA data.
 *
 * Strategy: Server-first with localStorage as write-ahead log (WAL).
 *
 * Write path:
 *   1. Write to localStorage immediately (WAL)
 *   2. Write to Supabase
 *   3. On success, mark localStorage entry as synced
 *   4. On failure, keep in localStorage as pending
 *
 * Read path:
 *   1. If authenticated, read from Supabase (source of truth)
 *   2. Check localStorage for any unsynced entries, merge them
 *   3. If not authenticated, read from localStorage only
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, ChatMessage, Insight, Pattern } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { createEmptyContext } from "@/types/context";
import { createClient } from "@/lib/supabase";
import { getAspirations, getAllAspirations, saveAspiration } from "./aspirations";
import { getKnownContext, updateKnownContext, getHumaContext, updateHumaContext } from "./context";
import { getChatMessages, saveChatMessage, saveChatMessages } from "./chat";
import { saveInsight, getUndeliveredInsight } from "./insights";
import { getPatterns, savePattern, updatePattern, deletePattern } from "./patterns";

// ─── Sync Status ────────────────────────────────────────────────────────────

export type SyncState = "synced" | "pending" | "syncing" | "error";

type SyncListener = (state: SyncState, pendingCount: number) => void;

const listeners = new Set<SyncListener>();
let currentSyncState: SyncState = "synced";
let currentPendingCount = 0;

function notifyListeners() {
  for (const fn of listeners) {
    fn(currentSyncState, currentPendingCount);
  }
}

function setSyncState(state: SyncState, pendingCount?: number) {
  currentSyncState = state;
  if (pendingCount !== undefined) currentPendingCount = pendingCount;
  notifyListeners();
}

export function subscribeSyncStatus(fn: SyncListener): () => void {
  listeners.add(fn);
  fn(currentSyncState, currentPendingCount);
  return () => { listeners.delete(fn); };
}

export function getSyncState(): { state: SyncState; pendingCount: number } {
  return { state: currentSyncState, pendingCount: currentPendingCount };
}

// ─── WAL (Write-Ahead Log) in localStorage ─────────────────────────────────

const WAL_KEY = "huma-v2-wal";

interface WalEntry {
  id: string;
  type: "aspiration" | "context" | "huma-context" | "chat-message" | "chat-messages" | "insight" | "pattern";
  payload: unknown;
  createdAt: string;
  retries: number;
}

function readWal(): WalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWal(entries: WalEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WAL_KEY, JSON.stringify(entries.slice(-100)));
  } catch { /* storage full */ }
  setSyncState(entries.length > 0 ? "pending" : "synced", entries.length);
}

function addToWal(type: WalEntry["type"], payload: unknown): string {
  const entries = readWal();
  const id = crypto.randomUUID();
  entries.push({ id, type, payload, createdAt: new Date().toISOString(), retries: 0 });
  writeWal(entries);
  return id;
}

function removeFromWal(id: string) {
  const entries = readWal().filter(e => e.id !== id);
  writeWal(entries);
}

// ─── Helper: get authenticated Supabase client ─────────────────────────────

function getSupabase(userId: string | null): SupabaseClient | null {
  if (!userId) return null;
  return createClient();
}

// ─── Aspirations ────────────────────────────────────────────────────────────

/** Save aspiration: localStorage WAL first, then Supabase. */
export async function storeSaveAspiration(
  userId: string | null,
  aspiration: Aspiration,
): Promise<void> {
  // 1. Write to localStorage (WAL)
  const existing = readLocalAspirations();
  const idx = existing.findIndex(a => a.id === aspiration.id);
  if (idx >= 0) {
    existing[idx] = aspiration;
  } else {
    existing.push(aspiration);
  }
  writeLocalAspirations(existing);

  // 2. Write to Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  const walId = addToWal("aspiration", { userId, aspiration });
  try {
    await saveAspiration(sb, userId, aspiration);
    removeFromWal(walId);
  } catch {
    // WAL entry preserved for retry
  }
}

/** Load aspirations: Supabase if authed, merge unsynced, fallback to localStorage. */
export async function storeLoadAspirations(
  userId: string | null,
  includeArchived = false,
): Promise<Aspiration[]> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const dbAsps = includeArchived
        ? await getAllAspirations(sb, userId)
        : await getAspirations(sb, userId);
      if (dbAsps.length > 0) return dbAsps;
    } catch { /* fallback */ }
  }

  return readLocalAspirations();
}

/** Update aspirations in localStorage only (optimistic UI). */
export function storeUpdateLocalAspirations(aspirations: Aspiration[]) {
  writeLocalAspirations(aspirations);
}

function readLocalAspirations(): Aspiration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("huma-v2-aspirations");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalAspirations(aspirations: Aspiration[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(aspirations));
  } catch { /* storage full */ }
}

// ─── Context ────────────────────────────────────────────────────────────────

/** Save context: localStorage first, then Supabase. */
export async function storeSaveContext(
  userId: string | null,
  context: Record<string, unknown>,
): Promise<void> {
  // 1. Write to localStorage
  writeLocalContext(context);

  // 2. Write to Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  const walId = addToWal("context", { userId, context });
  try {
    await updateKnownContext(sb, userId, context);
    removeFromWal(walId);
  } catch {
    // WAL entry preserved
  }
}

/** Load context: Supabase if authed, fallback to localStorage. */
export async function storeLoadContext(
  userId: string | null,
): Promise<Record<string, unknown>> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const ctx = await getKnownContext(sb, userId);
      if (Object.keys(ctx).length > 0) return ctx;
    } catch { /* fallback */ }
  }

  return readLocalContext();
}

export function storeReadLocalContext(): Record<string, unknown> {
  return readLocalContext();
}

function readLocalContext(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("huma-v2-known-context");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalContext(context: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("huma-v2-known-context", JSON.stringify(context));
  } catch { /* storage full */ }
}

// ─── HumaContext (rich 9-dimension model) ──────────────────────────────────

const HUMA_CONTEXT_KEY = "huma-v2-huma-context";

/** Save HumaContext: localStorage first, then Supabase. */
export async function storeSaveHumaContext(
  userId: string | null,
  humaContext: HumaContext,
): Promise<void> {
  writeLocalHumaContext(humaContext);

  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  const walId = addToWal("huma-context", { userId, humaContext });
  try {
    await updateHumaContext(sb, userId, humaContext);
    removeFromWal(walId);
  } catch {
    // WAL entry preserved
  }
}

/** Load HumaContext: Supabase if authed, fallback to localStorage. */
export async function storeLoadHumaContext(
  userId: string | null,
): Promise<HumaContext> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const ctx = await getHumaContext(sb, userId);
      if (ctx._version) return ctx;
    } catch { /* fallback */ }
  }

  return readLocalHumaContext();
}

/** Synchronous localStorage read for HumaContext. */
export function storeReadLocalHumaContext(): HumaContext {
  return readLocalHumaContext();
}

function readLocalHumaContext(): HumaContext {
  if (typeof window === "undefined") return createEmptyContext();
  try {
    const raw = localStorage.getItem(HUMA_CONTEXT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._version) return { ...createEmptyContext(), ...parsed } as HumaContext;
    }
    return createEmptyContext();
  } catch {
    return createEmptyContext();
  }
}

function writeLocalHumaContext(humaContext: HumaContext) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HUMA_CONTEXT_KEY, JSON.stringify(humaContext));
  } catch { /* storage full */ }
}

// ─── Chat Messages ──────────────────────────────────────────────────────────

/** Save a single chat message: localStorage first, then Supabase. */
export async function storeSaveChatMessage(
  userId: string | null,
  message: ChatMessage,
  source: "start" | "chat" = "chat",
): Promise<void> {
  // 1. Write to localStorage
  const key = source === "start" ? "huma-v2-start-messages" : "huma-v2-chat-messages";
  const existing = readLocalMessages(key);
  existing.push(message);
  writeLocalMessages(key, existing);

  // 2. Write to Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  const walId = addToWal("chat-message", { userId, message });
  try {
    await saveChatMessage(sb, userId, message);
    removeFromWal(walId);
  } catch {
    // WAL entry preserved
  }
}

/** Save all messages to localStorage (bulk, used during streaming). */
export function storeWriteLocalMessages(
  messages: ChatMessage[],
  source: "start" | "chat" = "chat",
) {
  const key = source === "start" ? "huma-v2-start-messages" : "huma-v2-chat-messages";
  writeLocalMessages(key, messages);
}

/** Load chat messages: Supabase if authed, fallback to localStorage. */
export async function storeLoadChatMessages(
  userId: string | null,
): Promise<ChatMessage[]> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const msgs = await getChatMessages(sb, userId);
      if (msgs.length > 0) return msgs;
    } catch { /* fallback */ }
  }

  // Try chat messages first, then start messages
  const chatMsgs = readLocalMessages("huma-v2-chat-messages");
  if (chatMsgs.length > 0) return chatMsgs;
  return readLocalMessages("huma-v2-start-messages");
}

function readLocalMessages(key: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalMessages(key: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch { /* storage full */ }
}

// ─── Insights ───────────────────────────────────────────────────────────────

/** Save insight: localStorage first, then Supabase. */
export async function storeSaveInsight(
  userId: string | null,
  insight: Insight,
): Promise<void> {
  // 1. Write to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("huma-v2-pending-insight", JSON.stringify(insight));
    } catch { /* */ }
  }

  // 2. Write to Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  const walId = addToWal("insight", { userId, insight });
  try {
    await saveInsight(sb, userId, insight);
    removeFromWal(walId);
  } catch {
    // WAL entry preserved
  }
}

/** Load undelivered insight: Supabase if authed, fallback to localStorage. */
export async function storeLoadInsight(
  userId: string | null,
): Promise<Insight | null> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const insight = await getUndeliveredInsight(sb, userId);
      if (insight) return insight;
    } catch { /* fallback */ }
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("huma-v2-pending-insight");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Patterns ───────────────────────────────────────────────────────────────

/** Save pattern: localStorage first, then Supabase. */
export async function storeSavePattern(
  userId: string | null,
  pattern: Pattern,
): Promise<void> {
  // 1. Write to localStorage
  const existing = readLocalPatterns();
  const idx = existing.findIndex(p => p.id === pattern.id);
  if (idx >= 0) {
    existing[idx] = pattern;
  } else {
    existing.push(pattern);
  }
  writeLocalPatterns(existing);

  // 2. Write to Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  const walId = addToWal("pattern", { userId, pattern });
  try {
    await savePattern(sb, userId, pattern);
    removeFromWal(walId);
  } catch {
    // WAL entry preserved
  }
}

/** Update pattern: localStorage + Supabase. */
export async function storeUpdatePattern(
  userId: string | null,
  patternId: string,
  updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow" | "validationMetric" | "validationCount" | "validationTarget" | "status">>,
): Promise<void> {
  // 1. Update in localStorage
  const existing = readLocalPatterns();
  const updated = existing.map(p =>
    p.id === patternId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
  );
  writeLocalPatterns(updated);

  // 2. Update in Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  try {
    await updatePattern(sb, patternId, userId, updates);
  } catch { /* localStorage is still correct */ }
}

/** Delete pattern: remove from localStorage + Supabase. */
export async function storeDeletePattern(
  userId: string | null,
  patternId: string,
): Promise<void> {
  // 1. Remove from localStorage
  const existing = readLocalPatterns().filter(p => p.id !== patternId);
  writeLocalPatterns(existing);

  // 2. Remove from Supabase
  const sb = getSupabase(userId);
  if (!sb || !userId) return;

  try {
    await deletePattern(sb, patternId, userId);
  } catch { /* localStorage already updated */ }
}

/** Load patterns: Supabase if authed, fallback to localStorage. */
export async function storeLoadPatterns(
  userId: string | null,
): Promise<Pattern[]> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const patterns = await getPatterns(sb, userId);
      if (patterns.length > 0) return patterns;
    } catch { /* fallback */ }
  }

  return readLocalPatterns();
}

function readLocalPatterns(): Pattern[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("huma-v2-patterns");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalPatterns(patterns: Pattern[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("huma-v2-patterns", JSON.stringify(patterns));
  } catch { /* storage full */ }
}

// ─── Cache Helpers ──────────────────────────────────────────────────────────

/** Clear the cached compiled sheet for today. */
export function clearTodaySheetCache() {
  if (typeof window === "undefined") return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.removeItem(`huma-v2-sheet-${today}`);
    localStorage.removeItem(`huma-v2-compiled-sheet-${today}`);
  } catch { /* */ }
}

// ─── WAL Flush (sync pending entries to Supabase) ───────────────────────────

/**
 * Flush all pending WAL entries to Supabase.
 * Call on auth state change, app focus, or network recovery.
 */
export async function flushWal(userId: string): Promise<{ flushed: number; failed: number }> {
  const entries = readWal();
  if (entries.length === 0) return { flushed: 0, failed: 0 };

  const sb = createClient();
  if (!sb) return { flushed: 0, failed: entries.length };

  setSyncState("syncing", entries.length);

  let flushed = 0;
  const remaining: WalEntry[] = [];

  for (const entry of entries) {
    try {
      const p = entry.payload as Record<string, unknown>;
      const entryUserId = (p.userId as string) || userId;

      switch (entry.type) {
        case "aspiration":
          await saveAspiration(sb, entryUserId, p.aspiration as Aspiration);
          break;
        case "context":
          await updateKnownContext(sb, entryUserId, p.context as Record<string, unknown>);
          break;
        case "huma-context":
          await updateHumaContext(sb, entryUserId, p.humaContext as HumaContext);
          break;
        case "chat-message":
          await saveChatMessage(sb, entryUserId, p.message as ChatMessage);
          break;
        case "chat-messages":
          await saveChatMessages(sb, entryUserId, p.messages as ChatMessage[]);
          break;
        case "insight":
          await saveInsight(sb, entryUserId, p.insight as Insight);
          break;
        case "pattern":
          await savePattern(sb, entryUserId, p.pattern as Pattern);
          break;
      }
      flushed++;
    } catch {
      if (entry.retries < 3) {
        remaining.push({ ...entry, retries: entry.retries + 1 });
      }
      // After 3 retries, drop silently
    }
  }

  writeWal(remaining);
  setSyncState(remaining.length > 0 ? "error" : "synced", remaining.length);

  return { flushed, failed: remaining.length };
}

/**
 * Get the count of pending WAL entries.
 */
export function getPendingCount(): number {
  return readWal().length;
}
