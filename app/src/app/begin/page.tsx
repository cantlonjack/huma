"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShapeBuilder from "@/components/shape/ShapeBuilder";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { saveShape } from "@/lib/shapes";
import type { DimensionKey } from "@/types/shape";
import type { ShapeInsight } from "@/engine/shape-insight";

const PENDING_SHAPE_KEY = "huma-pending-shape";

interface PendingShape {
  scores: Partial<Record<DimensionKey, number>>;
  insight: ShapeInsight | null;
}

function savePendingShape(data: PendingShape) {
  localStorage.setItem(PENDING_SHAPE_KEY, JSON.stringify(data));
}

function loadPendingShape(): PendingShape | null {
  try {
    const raw = localStorage.getItem(PENDING_SHAPE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingShape;
  } catch {
    return null;
  }
}

function clearPendingShape() {
  localStorage.removeItem(PENDING_SHAPE_KEY);
}

export default function BeginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [pendingScores, setPendingScores] = useState<Partial<Record<DimensionKey, number>> | null>(null);
  const [pendingInsight, setPendingInsight] = useState<ShapeInsight | null>(null);

  // After magic link callback: user is now authenticated with a pending shape
  useEffect(() => {
    if (loading || !user) return;

    const pending = loadPendingShape();
    if (!pending) return;

    // Save the pending shape to Supabase, then redirect
    (async () => {
      await saveShape(pending.scores, "builder", pending.insight);
      clearPendingShape();
      router.replace("/home");
    })();
  }, [user, loading, router]);

  const handleSave = useCallback(
    (scores: Partial<Record<DimensionKey, number>>, insight: ShapeInsight | null) => {
      if (user) {
        // Already authenticated — save directly
        (async () => {
          await saveShape(scores, "builder", insight);
          router.push("/home");
        })();
      } else {
        // Store shape data and show auth modal
        setPendingScores(scores);
        setPendingInsight(insight);
        savePendingShape({ scores, insight });
        setShowAuth(true);
      }
    },
    [user, router]
  );

  const handleAuthenticated = useCallback(async () => {
    setShowAuth(false);
    // After inline auth (e.g., already had a session), save and redirect
    if (pendingScores) {
      await saveShape(pendingScores, "builder", pendingInsight);
      clearPendingShape();
      router.push("/home");
    }
  }, [pendingScores, pendingInsight, router]);

  return (
    <>
      <ShapeBuilder
        onClose={() => router.push("/")}
        onSave={handleSave}
      />
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
}
