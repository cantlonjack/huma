/**
 * Pending sync queue — stores failed DB writes in localStorage
 * and retries them on next app open or network recovery.
 */

const STORAGE_KEY = "huma-v2-pending-sync";

export type SyncOperation =
  | { type: "chat-message"; userId: string; message: unknown }
  | { type: "context"; userId: string; context: Record<string, unknown> }
  | { type: "aspiration"; userId: string; aspiration: unknown };

interface QueueEntry {
  id: string;
  op: SyncOperation;
  createdAt: string;
  retries: number;
}

function readQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(entries: QueueEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Add a failed write to the pending queue. */
export function enqueuePendingSync(op: SyncOperation) {
  const entries = readQueue();
  entries.push({
    id: crypto.randomUUID(),
    op,
    createdAt: new Date().toISOString(),
    retries: 0,
  });
  // Cap at 50 entries to prevent localStorage bloat
  writeQueue(entries.slice(-50));
}

/** Returns the number of pending items. */
export function pendingSyncCount(): number {
  return readQueue().length;
}

/**
 * Flush all pending writes. Call on app open or network recovery.
 * Returns { flushed, failed } counts.
 */
export async function flushPendingSync(
  supabase: unknown,
  fns: {
    saveChatMessage: (sb: unknown, userId: string, msg: unknown) => Promise<unknown>;
    updateKnownContext: (sb: unknown, userId: string, ctx: Record<string, unknown>) => Promise<unknown>;
    saveAspiration: (sb: unknown, userId: string, asp: unknown) => Promise<unknown>;
  },
): Promise<{ flushed: number; failed: number }> {
  const entries = readQueue();
  if (entries.length === 0) return { flushed: 0, failed: 0 };

  let flushed = 0;
  const remaining: QueueEntry[] = [];

  for (const entry of entries) {
    try {
      const { op } = entry;
      switch (op.type) {
        case "chat-message":
          await fns.saveChatMessage(supabase, op.userId, op.message);
          break;
        case "context":
          await fns.updateKnownContext(supabase, op.userId, op.context);
          break;
        case "aspiration":
          await fns.saveAspiration(supabase, op.userId, op.aspiration);
          break;
      }
      flushed++;
    } catch {
      // Keep for next attempt, but cap retries
      if (entry.retries < 3) {
        remaining.push({ ...entry, retries: entry.retries + 1 });
      }
      // After 3 retries, silently drop
    }
  }

  writeQueue(remaining);
  return { flushed, failed: remaining.length };
}
