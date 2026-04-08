"use client";

import { useState, useEffect, useCallback } from "react";
import type { HumaContext } from "@/types/context";
import { createEmptyContext } from "@/types/context";
import { mergeContext, dimensionsTouched, migrateFromKnownContext } from "@/lib/context-model";
import {
  storeSaveContext,
  storeReadLocalContext,
  clearTodaySheetCache,
} from "@/lib/db/store";
import type { User } from "@supabase/supabase-js";

interface UseContextSyncOptions {
  user: User | null;
  loaded: boolean;
}

interface ContextSyncResult {
  knownContext: Record<string, unknown>;
  setKnownContext: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  humaContext: HumaContext;
  setHumaContext: React.Dispatch<React.SetStateAction<HumaContext>>;
  recentDimensions: string[];
  updateContext: (parsedContext: Record<string, unknown>) => void;
  loadContext: (dbContext: Record<string, unknown>) => void;
  loadContextFromLocalStorage: () => void;
  hydrateHumaContext: () => void;
  dbWarning: { type: "context" | "aspiration"; retryFn: () => void } | null;
  setDbWarning: React.Dispatch<React.SetStateAction<{ type: "context" | "aspiration"; retryFn: () => void } | null>>;
}

export function useContextSync({ user, loaded }: UseContextSyncOptions): ContextSyncResult {
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [humaContext, setHumaContext] = useState<HumaContext>(createEmptyContext());
  const [recentDimensions, setRecentDimensions] = useState<string[]>([]);
  const [dbWarning, setDbWarning] = useState<{ type: "context" | "aspiration"; retryFn: () => void } | null>(null);

  // Persist to localStorage when context changes
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
    localStorage.setItem("huma-v2-huma-context", JSON.stringify(humaContext));
  }, [knownContext, humaContext, loaded]);

  const loadContext = useCallback((dbContext: Record<string, unknown>) => {
    if (Object.keys(dbContext).length > 0) setKnownContext(dbContext);
  }, []);

  const loadContextFromLocalStorage = useCallback(() => {
    const ctx = storeReadLocalContext();
    if (Object.keys(ctx).length > 0) setKnownContext(ctx);
  }, []);

  const hydrateHumaContext = useCallback(() => {
    try {
      const storedHuma = localStorage.getItem("huma-v2-huma-context");
      if (storedHuma) {
        setHumaContext(JSON.parse(storedHuma));
      } else {
        const oldCtx = localStorage.getItem("huma-v2-known-context");
        if (oldCtx) {
          const parsed = JSON.parse(oldCtx);
          if (parsed._version) {
            setHumaContext(parsed as HumaContext);
          } else {
            const migrated = migrateFromKnownContext(parsed);
            setHumaContext(migrated);
            localStorage.setItem("huma-v2-huma-context", JSON.stringify(migrated));
          }
        }
      }
    } catch { /* fresh context */ }
  }, []);

  const updateContext = useCallback((parsedContext: Record<string, unknown>) => {
    // Legacy flat merge for backward compat
    const newContext = { ...knownContext, ...parsedContext };
    setKnownContext(newContext);

    // Deep merge into structured HumaContext
    const touched = dimensionsTouched(parsedContext as Partial<HumaContext>);
    const updatedHuma = mergeContext(humaContext, parsedContext as Partial<HumaContext>, "conversation");
    setHumaContext(updatedHuma);

    // Show which dimensions grew — visible for 4 seconds
    if (touched.length > 0) {
      setRecentDimensions(touched);
      setTimeout(() => setRecentDimensions([]), 4000);
    }

    // Unified store: WAL to localStorage, then Supabase
    storeSaveContext(user?.id ?? null, newContext).catch(() => {
      setDbWarning({
        type: "context",
        retryFn: () => storeSaveContext(user?.id ?? null, newContext).then(() => setDbWarning(null)).catch(() => {}),
      });
    });

    clearTodaySheetCache();
  }, [knownContext, humaContext, user]);

  return {
    knownContext,
    setKnownContext,
    humaContext,
    setHumaContext,
    recentDimensions,
    updateContext,
    loadContext,
    loadContextFromLocalStorage,
    hydrateHumaContext,
    dbWarning,
    setDbWarning,
  };
}
