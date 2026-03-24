"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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

  // ─── Compiled recommendation (fetched from API based on context depth) ────
  const [recommendation, setRecommendation] = useState<{
    text: string;
    pattern?: string;
  } | null>(null);
  const recFetchedForRef = useRef<string>("");

  useEffect(() => {
    if (!context?.name || !context?.capitals) return;

    // Build a fingerprint of context depth to avoid re-fetching
    const depth = context.ikigai?.synthesis ? "ikigai" : "lotus";
    const fingerprint = `${context.name}:${depth}:${context.version}`;
    if (recFetchedForRef.current === fingerprint) return;

    // If we have a firstInsight and no Ikigai, use it directly (skip API)
    if (!context.ikigai?.synthesis && context.firstInsight) {
      setRecommendation({
        text: context.firstInsight,
        pattern: context.firstPattern?.name || undefined,
      });
      recFetchedForRef.current = fingerprint;
      return;
    }

    // For Tier 2 (post-Ikigai), fetch from recommendation API
    if (context.ikigai?.synthesis) {
      recFetchedForRef.current = fingerprint;
      fetch("/api/workspace-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.recommendation) {
            setRecommendation({
              text: data.recommendation,
              pattern: data.pattern || undefined,
            });
          }
        })
        .catch(() => {
          // Fall back to first insight
          if (context.firstInsight) {
            setRecommendation({
              text: context.firstInsight,
              pattern: context.firstPattern?.name || undefined,
            });
          }
        });
    }
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

      {/* Content — CSS crossfade transitions, prefers-reduced-motion: instant */}
      <main className="flex-1 px-4 py-4 md:px-8 md:py-8">
        {view.mode === "whole" && (
          <div className="animate-view-enter">
            <WholeView
              context={context}
              onPetalClick={handlePetalClick}
              recommendation={recommendation}
            />
          </div>
        )}

        {view.mode === "petal" && (
          <div className="animate-view-enter">
            <PetalView
              petal={view.petal}
              context={context}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          </div>
        )}

        {view.mode === "flow" && view.petal === "context" && context && (
          <IkigaiFlow
            context={context}
            onComplete={handleIkigaiComplete}
            onClose={handleBack}
          />
        )}

        {view.mode === "flow" && view.petal !== "context" && (
          <div className="flex flex-col items-center justify-center py-20 animate-view-enter">
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
      </main>

      <style jsx global>{`
        @keyframes view-enter {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-view-enter {
          animation: view-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-view-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
