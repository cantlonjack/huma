"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  loadOperatorContext,
  loadOperatorContextLocal,
  saveContextEdit,
} from "@/lib/operator-context";
import WholeView from "@/components/workspace/WholeView";
import PetalView from "@/components/workspace/PetalView";
import IkigaiFlow from "@/components/ikigai/IkigaiFlow";
import type { OperatorContext, LotusPhase } from "@/types/lotus";
import type { WorkspaceView } from "@/types/workspace";
import { AVAILABLE_FLOWS, isPetalComplete } from "@/types/workspace";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [context, setContext] = useState<OperatorContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [view, setView] = useState<WorkspaceView>({ mode: "whole" });

  const hasAuth = isSupabaseConfigured();

  // ─── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasAuth && !authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router, hasAuth]);

  // ─── Load operator context ────────────────────────────────────────────────
  useEffect(() => {
    if (hasAuth && !user) return;

    (async () => {
      // When auth is configured, try full load (localStorage + Supabase fallback)
      // When no auth (local dev), load from localStorage only
      const ctx = hasAuth
        ? await loadOperatorContext()
        : loadOperatorContextLocal();
      if (!ctx || (!ctx.name && !ctx.capitals)) {
        router.replace("/begin");
        return;
      }
      setContext(ctx);
      setContextLoading(false);
    })();
  }, [user, router, hasAuth]);

  // ─── Build recommendation from first insight/pattern ──────────────────────
  const recommendation = useMemo(() => {
    if (!context?.firstInsight) return null;
    return {
      text: context.firstInsight,
      pattern: context.firstPattern?.name || undefined,
    };
  }, [context]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handlePetalClick = useCallback(
    (petal: LotusPhase) => {
      if (!context) return;

      // Completed petal → zoom into petal view
      if (isPetalComplete(petal, context)) {
        setView({ mode: "petal", petal });
        return;
      }

      // "Next" petal with available flow → enter flow mode
      if (AVAILABLE_FLOWS.includes(petal)) {
        setView({ mode: "flow", petal });
        return;
      }

      // Future petal with no flow yet → do nothing (or show toast)
    },
    [context]
  );

  const handleBack = useCallback(() => {
    setView({ mode: "whole" });
  }, []);

  const handleEdit = useCallback(
    (field: string, value: unknown) => {
      if (!context) return;
      const updated = saveContextEdit(context, field, value);
      setContext(updated);
    },
    [context]
  );

  const handleIkigaiComplete = useCallback(
    (ikigai: OperatorContext["ikigai"]) => {
      if (!context) return;
      // Save ikigai data and mark context petal as complete
      let updated = saveContextEdit(context, "ikigai", ikigai);
      updated = saveContextEdit(updated, "lotusProgress", {
        ...updated.lotusProgress,
        context: true,
      });
      setContext(updated);
      setView({ mode: "whole" });
    },
    [context]
  );

  // ─── Loading state ────────────────────────────────────────────────────────
  if (authLoading || contextLoading || (hasAuth && !user) || !context) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <p
          className="text-earth-400 text-lg animate-pulse"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-8">
        <p
          className="text-sage-600 tracking-[0.3em] text-sm font-medium uppercase"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          HUMA
        </p>
        {view.mode !== "whole" && (
          <button
            onClick={handleBack}
            className="text-earth-500 text-sm hover:text-earth-700 transition-colors"
            style={{ fontFamily: "var(--font-source-sans)" }}
          >
            Back to workspace
          </button>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 md:px-8 md:py-8">
        <AnimatePresence mode="wait">
          {view.mode === "whole" && (
            <WholeView
              key="whole"
              context={context}
              onPetalClick={handlePetalClick}
              recommendation={recommendation}
            />
          )}

          {view.mode === "petal" && (
            <PetalView
              key={`petal-${view.petal}`}
              petal={view.petal}
              context={context}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          )}

          {view.mode === "flow" && view.petal === "context" && context && (
            <IkigaiFlow
              key="flow-context"
              context={context}
              onComplete={handleIkigaiComplete}
              onClose={handleBack}
            />
          )}

          {view.mode === "flow" && view.petal !== "context" && (
            <div
              key={`flow-${view.petal}`}
              className="flex flex-col items-center justify-center py-20"
            >
              <p
                className="text-earth-600 text-lg mb-4"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Starting {view.petal} flow...
              </p>
              <p
                className="text-earth-400 text-sm mb-8"
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                This guided experience is coming soon.
              </p>
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-full border border-earth-300 text-earth-500 text-sm hover:bg-sand-100 transition-colors"
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                Back to workspace
              </button>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
