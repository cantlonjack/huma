// ─── Context ────────────────────────────────────────────────────────────────
export { getOrCreateContext } from "./context";
export { updateKnownContext } from "./context";
export { getKnownContext } from "./context";
export { removeContextField } from "./context";
export { clearAllUserData } from "./context";
export { getWhyStatement } from "./context";
export { updateWhyStatement } from "./context";

// ─── Aspirations ────────────────────────────────────────────────────────────
export { getAspirations } from "./aspirations";
export { getAllAspirations } from "./aspirations";
export { saveAspiration } from "./aspirations";
export { updateAspirationStatus } from "./aspirations";
export { archiveAspiration } from "./aspirations";
export { deleteAspiration } from "./aspirations";
export { updateAspirationBehaviors } from "./aspirations";
export { updateAspirationName } from "./aspirations";
export { updateAspirationFuture } from "./aspirations";
export { getAspirationCorrelations } from "./aspirations";
export type { AspirationCorrelation } from "./aspirations";

// ─── Chat ───────────────────────────────────────────────────────────────────
export { getChatMessages } from "./chat";
export { clearChatMessages } from "./chat";
export { saveChatMessage } from "./chat";
export { saveChatMessages } from "./chat";

// ─── Sheets ─────────────────────────────────────────────────────────────────
export { getSheetEntries } from "./sheets";
export { saveSheetEntries } from "./sheets";
export { updateSheetEntryCheck } from "./sheets";
export { getRecentSheetHistory } from "./sheets";

// ─── Insights ───────────────────────────────────────────────────────────────
export { saveInsight } from "./insights";
export { getUndeliveredInsight } from "./insights";
export { markInsightDelivered } from "./insights";
export { getRecentInsights } from "./insights";
export { computeStructuralInsight } from "./insights";

// ─── Behaviors ──────────────────────────────────────────────────────────────
export { logBehaviorCheckoff } from "./behaviors";
export { getBehaviorWeekCount } from "./behaviors";
export { getBehaviorWeekCounts } from "./behaviors";
export { getPatternSparklines } from "./behaviors";
export { detectEmergingBehaviors } from "./behaviors";
export { getBehaviorDayOfWeekCounts } from "./behaviors";
export { getRecentCompletionDays } from "./behaviors";
export { getBehavioralSummary } from "./behaviors";
export { getTodayCompletionStats } from "./behaviors";
export { getBehaviorFrequencies } from "./behaviors";
export { getBehaviorCorrelations } from "./behaviors";
export type { BehavioralSummary } from "./behaviors";

// ─── Patterns ───────────────────────────────────────────────────────────────
export { getPatterns } from "./patterns";
export { getPatternsByAspiration } from "./patterns";
export { savePattern } from "./patterns";
export { updatePattern } from "./patterns";
export { deletePattern } from "./patterns";
export { detectMergeCandidates } from "./patterns";
export { mergePatterns } from "./patterns";

// ─── Principles ─────────────────────────────────────────────────────────────
export { getPrinciples } from "./principles";
export { savePrinciple } from "./principles";
export { updatePrinciple } from "./principles";
export { deletePrinciple } from "./principles";

// ─── Monthly Review ─────────────────────────────────────────────────────────
export { getMonthlyReviewData } from "./monthly-review";

// ─── Local Storage ──────────────────────────────────────────────────────────
export { removeLocalAspiration } from "./local-storage";
export { archiveLocalAspiration } from "./local-storage";
export { restoreLocalAspiration } from "./local-storage";
export { removeLocalContextField } from "./local-storage";
export { clearLocalStorageContext } from "./local-storage";
export { clearLocalChatMessages } from "./local-storage";
export { clearAllLocalStorage } from "./local-storage";
export { removeLocalPattern } from "./local-storage";
export { migrateLocalStorageToSupabase } from "./local-storage";

// ─── Unified Store ─────────────────────────────────────────────────────────
export {
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
  subscribeSyncStatus,
  getSyncState,
  type SyncState,
} from "./store";
