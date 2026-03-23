"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import LotusFlow from "@/components/lotus/LotusFlow";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { saveShape } from "@/lib/shapes";
import { clearLotusState } from "@/lib/lotus-persistence";
import type { OperatorContext } from "@/types/lotus";
import { CAPITAL_TO_DIMENSION as capitalMap, CAPITAL_ORDER } from "@/types/lotus";
import type { DimensionKey } from "@/types/shape";

const PENDING_CONTEXT_KEY = "huma-pending-context";

function savePendingContext(ctx: OperatorContext) {
  try {
    localStorage.setItem(PENDING_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    // silently fail
  }
}

function loadPendingContext(): OperatorContext | null {
  try {
    const raw = localStorage.getItem(PENDING_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OperatorContext;
  } catch {
    return null;
  }
}

function clearPendingContext() {
  try {
    localStorage.removeItem(PENDING_CONTEXT_KEY);
  } catch {
    // silently fail
  }
}

/**
 * Map OperatorContext capitals (1-10, internal names) to shape dimensions
 * (1-5, user-facing names) for backward compatibility with the shapes table.
 */
function contextToShapeScores(
  ctx: OperatorContext
): Partial<Record<DimensionKey, number>> {
  const scores: Partial<Record<DimensionKey, number>> = {};
  for (const key of CAPITAL_ORDER) {
    const dimKey = capitalMap[key] as DimensionKey;
    const raw = ctx.capitals?.[key] ?? 5;
    scores[dimKey] = Math.max(1, Math.min(5, Math.round(raw / 2)));
  }
  return scores;
}

export default function BeginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [pendingContext, setPendingContext] = useState<OperatorContext | null>(null);

  /**
   * Save operator context as a shape snapshot with lotus source.
   * Includes insight data if available.
   */
  const saveContextAsShape = useCallback(
    async (ctx: OperatorContext) => {
      const scores = contextToShapeScores(ctx);
      const insight = ctx.firstInsight
        ? {
            connection: ctx.firstInsight,
            pattern: ctx.firstPattern?.name || null,
          }
        : null;
      await saveShape(scores, "lotus", insight as Parameters<typeof saveShape>[2]);
    },
    []
  );

  // After magic link callback: user is now authenticated with a pending context
  useEffect(() => {
    if (loading || !user) return;

    const pending = loadPendingContext();
    if (!pending) return;

    (async () => {
      await saveContextAsShape(pending);
      clearPendingContext();
      clearLotusState();
      router.replace("/home");
    })();
  }, [user, loading, router, saveContextAsShape]);

  const handleComplete = useCallback(
    (ctx: OperatorContext) => {
      if (user) {
        // Already authenticated — save directly
        (async () => {
          await saveContextAsShape(ctx);
          clearPendingContext();
          clearLotusState();
          router.push("/home");
        })();
      } else {
        // Store context and show auth modal
        setPendingContext(ctx);
        savePendingContext(ctx);
        setShowAuth(true);
      }
    },
    [user, router, saveContextAsShape]
  );

  const handleAuthenticated = useCallback(async () => {
    setShowAuth(false);
    if (pendingContext) {
      await saveContextAsShape(pendingContext);
      clearPendingContext();
      clearLotusState();
      router.push("/home");
    }
  }, [pendingContext, router, saveContextAsShape]);

  return (
    <>
      <LotusFlow
        onClose={() => router.push("/")}
        onComplete={handleComplete}
      />
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
}
