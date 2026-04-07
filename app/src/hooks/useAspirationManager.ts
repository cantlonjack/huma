"use client";

import { useState, useCallback } from "react";
import type { Aspiration, Behavior, ReorganizationPlan } from "@/types/v2";
import { createClient } from "@/lib/supabase";
import {
  getAspirations,
  saveAspiration,
  updateAspirationStatus,
  updateAspirationBehaviors,
} from "@/lib/supabase-v2";
import { enqueuePendingSync } from "@/lib/pending-sync";
import { getLocalDate } from "@/lib/date-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

interface UseAspirationManagerOptions {
  user: User | null;
  setDbWarning: React.Dispatch<React.SetStateAction<{ type: "context" | "aspiration"; retryFn: () => void } | null>>;
}

interface AspirationManagerResult {
  aspirations: Aspiration[];
  setAspirations: React.Dispatch<React.SetStateAction<Aspiration[]>>;
  saveNewAspiration: (aspiration: Aspiration) => void;
  applyReorganization: (plan: ReorganizationPlan) => void;
  loadAspirations: (dbAspirations: Aspiration[]) => void;
  loadAspirationsFromLocalStorage: () => void;
}

export function useAspirationManager({ user, setDbWarning }: UseAspirationManagerOptions): AspirationManagerResult {
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);

  const loadAspirations = useCallback((dbAspirations: Aspiration[]) => {
    if (dbAspirations.length > 0) setAspirations(dbAspirations);
  }, []);

  const loadAspirationsFromLocalStorage = useCallback(() => {
    try {
      const asp = localStorage.getItem("huma-v2-aspirations");
      if (asp) setAspirations(JSON.parse(asp));
    } catch { /* fresh */ }
  }, []);

  const saveNewAspiration = useCallback((aspiration: Aspiration) => {
    const updatedAsps = [...aspirations, aspiration];
    setAspirations(updatedAsps);
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(updatedAsps));
    if (user) {
      const supabase = createClient();
      if (supabase) {
        const retryAspSave = () => {
          const sb = createClient();
          if (sb) saveAspiration(sb, user.id, aspiration).then(() => setDbWarning(null)).catch(() => {});
        };
        saveAspiration(supabase, user.id, aspiration).catch(() => {
          enqueuePendingSync({ type: "aspiration", userId: user.id, aspiration });
          setDbWarning({ type: "aspiration", retryFn: retryAspSave });
        });
      }
    }
  }, [aspirations, user, setDbWarning]);

  const applyReorganization = useCallback((plan: ReorganizationPlan) => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    // Release — pause these aspirations
    for (const item of plan.release) {
      updateAspirationStatus(supabase, user.id, item.aspirationId, "paused").catch(() => {});
    }

    // Revise — update behaviors for these aspirations
    for (const item of plan.revise) {
      const behaviors: Behavior[] = item.revisedBehaviors.map(b => ({
        key: b.key,
        text: b.text || b.name,
        frequency: b.frequency || "weekly",
        dimensions: (b.dimensions || []).map(d => ({
          dimension: d as Behavior["dimensions"][0]["dimension"],
          direction: "builds" as const,
          reasoning: "",
        })),
        detail: b.detail,
        enabled: true,
        is_trigger: b.is_trigger,
      })) as (Behavior & { is_trigger?: boolean })[];

      updateAspirationBehaviors(supabase, user.id, item.aspirationId, behaviors).catch(() => {});
    }

    // Update local state
    const releaseIds = new Set(plan.release.map(r => r.aspirationId));
    const reviseMap = new Map(plan.revise.map(r => [r.aspirationId, r]));

    const updated = aspirations.map(asp => {
      if (releaseIds.has(asp.id)) {
        return { ...asp, status: "paused" as const };
      }
      const revision = reviseMap.get(asp.id);
      if (revision) {
        const newBehaviors: Behavior[] = revision.revisedBehaviors.map(b => ({
          key: b.key,
          text: b.text || b.name,
          frequency: b.frequency || "weekly",
          dimensions: (b.dimensions || []).map(d => ({
            dimension: d as Behavior["dimensions"][0]["dimension"],
            direction: "builds" as const,
            reasoning: "",
          })),
          detail: b.detail,
          enabled: true,
        }));
        return { ...asp, behaviors: newBehaviors };
      }
      return asp;
    });

    setAspirations(updated);
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));

    // Clear today's cached sheet so it recompiles with new behaviors
    const today = getLocalDate();
    localStorage.removeItem(`huma-v2-sheet-${today}`);
    localStorage.removeItem(`huma-v2-compiled-sheet-${today}`);
  }, [aspirations, user]);

  return {
    aspirations,
    setAspirations,
    saveNewAspiration,
    applyReorganization,
    loadAspirations,
    loadAspirationsFromLocalStorage,
  };
}
