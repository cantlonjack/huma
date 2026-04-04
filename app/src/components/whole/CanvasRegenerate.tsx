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
    <div className="mx-6" style={{ marginTop: "20px" }}>
      {/* Section header */}
      <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
        <span
          className="font-sans font-medium"
          style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#A8C4AA" }}
        >
          LIVING CANVAS
        </span>

        {state !== "generating" && (
          <button
            onClick={regenerate}
            className="font-sans text-sage-600 hover:text-sage-700 transition-colors"
            style={{ fontSize: "12px", letterSpacing: "0.05em" }}
          >
            {canvas ? "Refresh" : "Generate from your data"}
          </button>
        )}
      </div>

      {/* Generating state */}
      {state === "generating" && (
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            background: "#F5F1EA",
            padding: "32px 24px",
            minHeight: "180px",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="rounded-full"
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid var(--color-sage-300)",
                borderTopColor: "var(--color-sage-600)",
                animation: "spin 1s linear infinite",
              }}
            />
            <span
              className="font-serif"
              style={{ fontSize: "14px", fontStyle: "italic", color: "#8C8274" }}
            >
              Reading your patterns...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === "error" && error && (
        <div
          className="rounded-xl"
          style={{
            background: "#F5F1EA",
            padding: "16px 20px",
          }}
        >
          <p className="font-sans" style={{ fontSize: "13px", color: "#8C8274" }}>
            {error}
          </p>
        </div>
      )}

      {/* Canvas result: capital radar + essence */}
      {state === "done" && canvas && (
        <div
          className="rounded-xl"
          style={{
            background: "#F5F1EA",
            padding: "24px 20px",
            animation: "entrance 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Essence phrase */}
          {canvas.essence?.phrase && (
            <p
              className="font-serif text-center"
              style={{
                fontSize: "16px",
                fontStyle: "italic",
                color: "#3A5A40",
                lineHeight: 1.5,
                marginBottom: "20px",
              }}
            >
              &ldquo;{canvas.essence.phrase}&rdquo;
            </p>
          )}

          {/* Capital Radar */}
          {canvas.capitalProfile && canvas.capitalProfile.length > 0 && (
            <div className="flex justify-center" style={{ marginBottom: "16px" }}>
              <Suspense fallback={<div style={{ width: 240, height: 240 }} />}>
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
            <div style={{ marginTop: "16px" }}>
              <span
                className="font-sans font-medium"
                style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#A8C4AA", textTransform: "uppercase" }}
              >
                Quality of Life
              </span>
              <div className="flex flex-wrap gap-2" style={{ marginTop: "8px" }}>
                {canvas.qolNodes.map((node, i) => {
                  const text = typeof node === "string" ? node : node.statement;
                  return (
                    <span
                      key={i}
                      className="font-sans rounded-full"
                      style={{
                        fontSize: "12px",
                        padding: "4px 12px",
                        background: "#EBF3EC",
                        border: "1px solid #C4D9C6",
                        color: "#3A5A40",
                      }}
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
            <div style={{ marginTop: "12px" }}>
              <span
                className="font-sans font-medium"
                style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#A8C4AA", textTransform: "uppercase" }}
              >
                What You&apos;re Building
              </span>
              <div className="flex flex-wrap gap-2" style={{ marginTop: "8px" }}>
                {canvas.productionNodes.map((node, i) => (
                  <span
                    key={i}
                    className="font-sans rounded-full"
                    style={{
                      fontSize: "12px",
                      padding: "4px 12px",
                      background: "#F5F1EA",
                      border: "1px solid #D9D0C4",
                      color: "#6B6358",
                    }}
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Closing */}
          {canvas.closing && (
            <p
              className="font-serif"
              style={{
                fontSize: "13px",
                fontStyle: "italic",
                color: "#8C8274",
                lineHeight: 1.5,
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              {canvas.closing}
            </p>
          )}
        </div>
      )}

      {/* Idle state: prompt */}
      {state === "idle" && (
        <button
          onClick={regenerate}
          className="w-full rounded-xl text-center transition-colors hover:bg-sand-200"
          style={{
            background: "#F5F1EA",
            padding: "24px 20px",
            border: "1px dashed #C4D9C6",
            cursor: "pointer",
          }}
        >
          <p
            className="font-serif"
            style={{ fontSize: "15px", fontStyle: "italic", color: "#5C7A62" }}
          >
            See your Living Canvas
          </p>
          <p
            className="font-sans"
            style={{ fontSize: "12px", color: "#A89E90", marginTop: "4px" }}
          >
            Generated from your actual behavioral data
          </p>
        </button>
      )}
    </div>
  );
}
