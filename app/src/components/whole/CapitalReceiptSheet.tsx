"use client";

// ─── Capital Receipt Sheet ────────────────────────────────────────────────
// REGEN-04 Plan 02-03: bottom sheet that reveals the math behind any capital
// score. Sovereignty means a patient user with a calculator can reproduce the
// score themselves — no "trust the algorithm". Header + Contributions +
// Weighted sum + Threshold table + Confidence + Computed-at, all driven by
// buildCapitalReceipt() so the displayed numbers match the radar byte-for-byte.
//
// Interaction pattern mirrors ConfirmationSheet.tsx: backdrop tap dismiss,
// slide-up animation, prefers-reduced-motion respected via CSS media query.

import { useEffect, useRef } from "react";
import type { CapitalForm } from "@/engine/canvas-types";
import type { DimensionKey } from "@/types/v2";
import { DIMENSION_LABELS } from "@/types/v2";
import { buildCapitalReceipt, type CapitalReceiptData } from "@/lib/capital-receipt";

interface CapitalReceiptSheetProps {
  open: boolean;
  form: CapitalForm | null;
  dimensionActivity: Array<{ dimension: DimensionKey; completionRate: number; totalCompletions: number }>;
  windowDays: number;
  daysSinceFirstBehavior: number;
  computedAt: string;
  onClose: () => void;
}

export default function CapitalReceiptSheet({
  open,
  form,
  dimensionActivity,
  windowDays,
  daysSinceFirstBehavior,
  computedAt,
  onClose,
}: CapitalReceiptSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Backdrop tap dismiss — mirrors ConfirmationSheet.tsx pattern.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay listener so the click that opened the sheet doesn't immediately close it.
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  if (!open || !form) return null;

  const data: CapitalReceiptData = buildCapitalReceipt(
    form,
    dimensionActivity,
    windowDays,
    daysSinceFirstBehavior,
    computedAt,
  );
  const confidencePct = Math.round(data.confidence * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25">
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${data.label} capital receipt`}
        className="w-full max-w-[440px] bg-sand-50 rounded-t-2xl px-5 pt-6 pb-8 max-h-[85dvh] overflow-y-auto"
        style={{
          animation: "receipt-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-9 h-1 rounded-sm bg-sand-300" />
        </div>

        {/* Header: [Label] — [Score]/5 — [ConfidenceLabel] */}
        <h3 className="font-serif font-medium text-[20px] text-earth-650 leading-tight mb-2">
          {data.label}{" "}
          <span className="text-earth-400">
            — {data.score}/5 — {data.confidenceLabel}
          </span>
        </h3>

        {/* Contributions */}
        <section className="mt-4">
          <h4 className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 mb-2">
            Contributions
          </h4>
          {data.contributions.length === 0 ? (
            <p className="font-sans text-sm text-earth-400">
              No activity yet in dimensions that contribute to {data.label}.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
              {data.contributions.map((c) => (
                <li key={c.dimension} className="font-sans text-[13px] text-earth-650">
                  <span className="font-medium">{DIMENSION_LABELS[c.dimension]}</span>
                  <span className="text-earth-400">
                    {" "}
                    — {c.label} {c.weight.toFixed(1)}× —{" "}
                  </span>
                  <span>
                    {c.completionsOutOfWindow.numerator}/{c.completionsOutOfWindow.denominator} days
                    = {c.completionRate.toFixed(3)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Weighted sum */}
        {data.contributions.length > 0 && (
          <section className="mt-4">
            <h4 className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 mb-2">
              Weighted sum
            </h4>
            <p className="font-sans text-[13px] text-earth-650 m-0">
              ({data.weightedSum.toFixed(3)}) / ({data.weightSum.toFixed(1)}) ={" "}
              <span className="font-medium">{data.avgRate.toFixed(3)}</span>
            </p>
          </section>
        )}

        {/* Threshold table — user's bucket highlighted */}
        <section className="mt-4">
          <h4 className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 mb-2">
            Threshold
          </h4>
          <ul className="flex flex-col gap-1 list-none m-0 p-0">
            {data.thresholdTable.map((row) => (
              <li
                key={row.score}
                className={`font-sans text-[13px] px-3 py-1.5 rounded ${
                  row.active ? "bg-sage-100 text-earth-650 font-medium" : "text-earth-400"
                }`}
              >
                {row.min.toFixed(2)} – {row.max >= 1.0 ? "1.00" : row.max.toFixed(2)} → {row.score}
              </li>
            ))}
          </ul>
        </section>

        {/* Confidence */}
        <section className="mt-4">
          <h4 className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 mb-2">
            Confidence
          </h4>
          <p className="font-sans text-[13px] text-earth-650 m-0">
            {confidencePct}% <span className="text-earth-400">({data.confidenceLabel})</span>
          </p>
        </section>

        {/* Computed-at */}
        <section className="mt-4">
          <h4 className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 mb-2">
            Computed
          </h4>
          <p className="font-sans text-[12px] text-earth-400 m-0">{data.computedAt}</p>
        </section>
      </div>

      <style>{`
        @keyframes receipt-slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
