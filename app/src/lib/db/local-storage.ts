import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, ChatMessage, Insight, Pattern, SheetEntry } from "@/types/v2";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";
import { updateKnownContext } from "./context";
import { saveChatMessages } from "./chat";
import { saveAspiration } from "./aspirations";
import { savePattern } from "./patterns";
import { saveSheetEntries } from "./sheets";
import { saveInsight } from "./insights";

// ─── localStorage CRUD Helpers ─────────────────────────────────────────────
// For pre-auth state management. Mirrors Supabase operations in localStorage.

/** Remove a single aspiration from localStorage by ID. */
export function removeLocalAspiration(aspirationId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("huma-v2-aspirations");
    if (!raw) return;
    const aspirations = JSON.parse(raw) as Aspiration[];
    const filtered = aspirations.filter(a => a.id !== aspirationId);
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(filtered));

    // Also remove related patterns
    const patRaw = localStorage.getItem("huma-v2-patterns");
    if (patRaw) {
      const patterns = JSON.parse(patRaw) as Pattern[];
      const filteredPatterns = patterns.filter(p => p.aspirationId !== aspirationId);
      localStorage.setItem("huma-v2-patterns", JSON.stringify(filteredPatterns));
    }
  } catch { /* skip */ }
}

/** Archive a local aspiration (set status to "archived"). */
export function archiveLocalAspiration(aspirationId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("huma-v2-aspirations");
    if (!raw) return;
    const aspirations = JSON.parse(raw) as Aspiration[];
    const updated = aspirations.map(a =>
      a.id === aspirationId ? { ...a, status: "archived" as const } : a
    );
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));
  } catch { /* skip */ }
}

/** Restore an archived aspiration in localStorage back to active. */
export function restoreLocalAspiration(aspirationId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("huma-v2-aspirations");
    if (!raw) return;
    const aspirations = JSON.parse(raw) as Aspiration[];
    const updated = aspirations.map(a =>
      a.id === aspirationId ? { ...a, status: "active" as const } : a
    );
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));
  } catch { /* skip */ }
}

/** Remove a key from localStorage known_context. Supports "field" and "field[index]" paths. */
export function removeLocalContextField(fieldPath: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("huma-v2-known-context");
    if (!raw) return;
    const ctx = JSON.parse(raw) as Record<string, unknown>;

    const arrayMatch = fieldPath.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, indexStr] = arrayMatch;
      const arr = ctx[key];
      if (Array.isArray(arr)) {
        const index = parseInt(indexStr, 10);
        if (index >= 0 && index < arr.length) {
          const newArr = [...arr];
          newArr.splice(index, 1);
          ctx[key] = newArr;
        }
      }
    } else {
      delete ctx[fieldPath];
    }

    localStorage.setItem("huma-v2-known-context", JSON.stringify(ctx));
  } catch { /* skip */ }
}

/** Clear all localStorage context (reset known_context to {}). */
export function clearLocalStorageContext(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("huma-v2-known-context", JSON.stringify({}));
}

/** Clear chat messages from localStorage. */
export function clearLocalChatMessages(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("huma-v2-chat-messages");
  localStorage.removeItem("huma-v2-start-messages");
}

/** Nuclear reset: clear all huma-v2-* keys from localStorage. */
export function clearAllLocalStorage(): void {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("huma-v2-") || key?.startsWith("huma-conversation")) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}

/** Remove a pattern from localStorage by ID. */
export function removeLocalPattern(patternId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("huma-v2-patterns");
    if (!raw) return;
    const patterns = JSON.parse(raw) as Pattern[];
    const filtered = patterns.filter(p => p.id !== patternId);
    localStorage.setItem("huma-v2-patterns", JSON.stringify(filtered));
  } catch { /* skip */ }
}

// ─── Migration: localStorage → Supabase ──────────────────────────────────────

export async function migrateLocalStorageToSupabase(
  supabase: SupabaseClient,
  userId: string
) {
  // Track which keys were successfully migrated so we only clear those
  const migratedKeys: string[] = [];

  // 1. Migrate known context
  try {
    const ctxStr = localStorage.getItem("huma-v2-known-context");
    if (ctxStr) {
      const knownContext = JSON.parse(ctxStr);
      await updateKnownContext(supabase, userId, knownContext);
      migratedKeys.push("huma-v2-known-context");
    }
  } catch { /* skip */ }

  // 2. Migrate chat messages (from /start and /chat)
  try {
    const startMsgs = localStorage.getItem("huma-v2-start-messages");
    const chatMsgs = localStorage.getItem("huma-v2-chat-messages");
    const messages: ChatMessage[] = [];

    if (startMsgs) {
      const parsed = JSON.parse(startMsgs) as ChatMessage[];
      messages.push(...parsed);
    }
    if (chatMsgs) {
      const parsed = JSON.parse(chatMsgs) as ChatMessage[];
      // Avoid duplicates (chat may include start messages)
      for (const msg of parsed) {
        if (!messages.some((m) => m.id === msg.id)) {
          messages.push(msg);
        }
      }
    }

    if (messages.length > 0) {
      await saveChatMessages(supabase, userId, messages);
      migratedKeys.push("huma-v2-start-messages", "huma-v2-chat-messages");
    }
  } catch { /* skip — localStorage preserved as fallback */ }

  // 3. Migrate aspirations — only clear localStorage after verified save
  try {
    const aspStr = localStorage.getItem("huma-v2-aspirations");
    if (aspStr) {
      const aspirations = JSON.parse(aspStr) as Aspiration[];
      let anySaved = false;
      for (const asp of aspirations) {
        try {
          await saveAspiration(supabase, userId, asp);
          anySaved = true;
        } catch { /* may already exist — verify below */ }
      }
      // Verify data actually exists in Supabase before clearing localStorage
      if (anySaved) {
        migratedKeys.push("huma-v2-aspirations");
      } else {
        // All inserts failed (duplicates?) — verify at least one exists in Supabase
        const { data: existing } = await supabase
          .from("aspirations")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(1);
        if (existing && existing.length > 0) {
          migratedKeys.push("huma-v2-aspirations");
        }
        // If nothing in Supabase either, do NOT clear localStorage
      }
    }
  } catch { /* skip — localStorage preserved as fallback */ }

  // 4. Migrate patterns (from localStorage or extract from aspirations)
  try {
    const patStr = localStorage.getItem("huma-v2-patterns");
    let patterns: Pattern[] = [];

    if (patStr) {
      patterns = JSON.parse(patStr) as Pattern[];
    } else {
      // No pre-extracted patterns — try extracting from aspirations
      const aspStr = localStorage.getItem("huma-v2-aspirations");
      if (aspStr) {
        const aspirations = JSON.parse(aspStr) as Aspiration[];
        patterns = extractPatternsFromAspirations(aspirations);
      }
    }

    if (patterns.length > 0) {
      for (const pattern of patterns) {
        try {
          await savePattern(supabase, userId, pattern);
        } catch { /* may already exist */ }
      }
      migratedKeys.push("huma-v2-patterns");
    }
  } catch { /* skip */ }

  // 5. Migrate ALL sheet entries
  try {
    const sheetKeys = Object.keys(localStorage).filter(k => k.startsWith("huma-v2-sheet-"));
    for (const key of sheetKeys) {
      try {
        const date = key.replace("huma-v2-sheet-", "");
        const entries = JSON.parse(localStorage.getItem(key) || "[]") as SheetEntry[];
        if (entries.length > 0) {
          await saveSheetEntries(supabase, userId, entries, date);
        }
      } catch { /* skip individual date on error, continue with rest */ }
    }
  } catch { /* skip */ }

  // 6. Migrate pending insight
  try {
    const insStr = localStorage.getItem("huma-v2-pending-insight");
    if (insStr) {
      const insight = JSON.parse(insStr) as Insight;
      await saveInsight(supabase, userId, insight);
      migratedKeys.push("huma-v2-pending-insight");
    }
  } catch { /* skip */ }

  // 7. Only clear keys that were successfully migrated to Supabase
  migratedKeys.push("huma-v2-behaviors"); // always safe to clear (derived data)
  for (const key of migratedKeys) {
    localStorage.removeItem(key);
  }
  // Clear cached sheets (non-critical, regeneratable)
  const sheetKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("huma-v2-sheet-")) {
      sheetKeys.push(key);
    }
  }
  for (const key of sheetKeys) {
    localStorage.removeItem(key);
  }
}
