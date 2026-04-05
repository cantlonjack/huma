"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import type { CanvasData, CapitalScore } from "@/engine/canvas-types";

const CapitalRadar = lazy(() => import("@/components/canvas/CapitalRadar"));

interface CanvasRegenerateProps {
  onGenerated: (canvas: CanvasData) => void;
  existingCanvas: CanvasData | null;
}

type RegenerateState = "idle" | "generating" | "done" | "error";

export default function CanvasRegenerate({ onGenerated, existingCanvas }: CanvasRegenerateProps) {
  const [state, setState] = useState<RegenerateState>(existingCanvas ? "done" : "idle");
  const [canvas, setCanvas] = useState<CanvasData | null>(existingCanvas);
  const [error, setError] = useState<string | null>(null);

  const regenerate = useCallback(async () => {
    setState("generating");
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Not connected");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not signed in");

      const res = await fetch("/api/canvas-regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Generation failed");
      }

      const data = await res.json();
      setCanvas(data.canvasData);
      onGenerated(data.canvasData);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }, [onGenerated]);

  return (
    <div className="mx-6 mt-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans font-medium text-[11px] tracking-[0.18em] uppercase text-sage-300">
          LIVING CANVAS
        </span>

        {state !== "generating" && (
          <button
            onClick={regenerate}
            className="font-sans text-sage-600 hover:text-sage-700 transition-colors text-xs tracking-[0.05em]"
          >
            {canvas ? "Refresh" : "Generate from your data"}
          </button>
        )}
      </div>

      {/* Generating state */}
      {state === "generating" && (
        <div className="rounded-xl flex items-center justify-center bg-sand-100 px-6 py-8 min-h-[180px]">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full w-8 h-8 border-2 border-sage-300 border-t-sage-600 animate-spin" />
            <span className="font-serif text-sm italic text-earth-400">
              Reading your patterns...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === "error" && error && (
        <div className="rounded-xl bg-sand-100 px-5 py-4">
          <p className="font-sans text-[13px] text-earth-400">
            {error}
          </p>
        </div>
      )}

      {/* Canvas result: capital radar + essence */}
      {state === "done" && canvas && (
        <div
          className="rounded-xl bg-sand-100 px-5 py-6"
          style={{ animation: "entrance 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {/* Essence phrase */}
          {canvas.essence?.phrase && (
            <p className="font-serif text-center text-base italic text-sage-700 leading-normal mb-5">
              &ldquo;{canvas.essence.phrase}&rdquo;
            </p>
          )}

          {/* Capital Radar */}
          {canvas.capitalProfile && canvas.capitalProfile.length > 0 && (
            <div className="flex justify-center mb-4">
              <Suspense fallback={<div className="w-60 h-60" />}>
                <CapitalRadar
                  profile={canvas.capitalProfile}
                  size={240}
                  animated={true}
                  animationDelay={200}
                />
              </Suspense>
            </div>
          )}

          {/* QoL nodes */}
          {canvas.qolNodes && canvas.qolNodes.length > 0 && (
            <div className="mt-4">
              <span className="font-sans font-medium text-[10px] tracking-[0.15em] text-sage-300 uppercase">
                Quality of Life
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {canvas.qolNodes.map((node, i) => {
                  const text = typeof node === "string" ? node : node.statement;
                  return (
                    <span
                      key={i}
                      className="font-sans rounded-full text-xs px-3 py-1 bg-sage-50 border border-sage-200 text-sage-700"
                    >
                      {text}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Production nodes */}
          {canvas.productionNodes && canvas.productionNodes.length > 0 && (
            <div className="mt-3">
              <span className="font-sans font-medium text-[10px] tracking-[0.15em] text-sage-300 uppercase">
                What You&apos;re Building
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {canvas.productionNodes.map((node, i) => (
                  <span
                    key={i}
                    className="font-sans rounded-full text-xs px-3 py-1 bg-sand-100 border border-sand-300 text-earth-500"
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Closing */}
          {canvas.closing && (
            <p className="font-serif text-[13px] italic text-earth-400 leading-normal mt-4 text-center">
              {canvas.closing}
            </p>
          )}
        </div>
      )}

      {/* Idle state: prompt */}
      {state === "idle" && (
        <button
          onClick={regenerate}
          className="w-full rounded-xl text-center transition-colors hover:bg-sand-200 bg-sand-100 px-5 py-6 border border-dashed border-sage-200 cursor-pointer"
        >
          <p className="font-serif text-[15px] italic text-sage-500">
            See your Living Canvas
          </p>
          <p className="font-sans text-xs text-earth-300 mt-1">
            Generated from your actual behavioral data
          </p>
        </button>
      )}
    </div>
  );
}
