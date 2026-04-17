"use client";

import { useState } from "react";
import type { SheetEntry, DimensionKey } from "@/types/v2";

interface Props {
  date: string;
  opening: string | null;
  throughLine: string | null;
  stateSentence: string | null;
  entries: SheetEntry[];
  movedDimensions: DimensionKey[];
  dayCount: number;
}

type ShareStatus = "idle" | "sharing" | "ready" | "error";

function detailToText(detail: SheetEntry["detail"]): string {
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    const text = (detail as Record<string, unknown>).text;
    if (typeof text === "string") return text;
  }
  return "";
}

export default function ShareSheetButton({
  date,
  opening,
  throughLine,
  stateSentence,
  entries,
  movedDimensions,
  dayCount,
}: Props) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (entries.length === 0) return null;

  async function handleShare() {
    setStatus("sharing");
    setMessage(null);

    let operatorName = "";
    try {
      const raw = localStorage.getItem("huma-v2-known-context");
      if (raw) {
        const parsed = JSON.parse(raw);
        operatorName = parsed.operator_name || parsed.name || "";
      }
    } catch { /* empty */ }

    const payload = {
      date,
      operatorName,
      opening: opening || "",
      throughLine: throughLine || "",
      stateSentence: stateSentence || "",
      movedDimensions,
      dayCount,
      entries: entries.map((e) => ({
        behaviorKey: e.behaviorKey,
        headline: e.headline || e.behaviorText,
        detailText: detailToText(e.detail),
        dimensions: e.dimensions || [],
        timeOfDay: e.timeOfDay,
        connectionNote: e.connectionNote,
        because: e.because,
      })),
    };

    try {
      const res = await fetch("/api/sheet/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Share failed");
      }

      const url = `${window.location.origin}/sheet/${data.id}`;
      const shareData = {
        title: "A day on HUMA",
        text: throughLine || opening || "My HUMA daily sheet",
        url,
      };

      let didNativeShare = false;
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share(shareData);
          didNativeShare = true;
        } catch {
          // user cancelled or unsupported — fall through to clipboard
        }
      }

      if (!didNativeShare) {
        try {
          await navigator.clipboard.writeText(url);
          setMessage("Link copied");
        } catch {
          setMessage(url);
        }
      } else {
        setMessage("Shared");
      }
      setStatus("ready");
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 3500);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={status === "sharing"}
        className="inline-flex items-center gap-1.5 font-sans text-[11px] tracking-wide text-sage-500 hover:text-sage-700 transition-colors disabled:opacity-60 bg-transparent border-none cursor-pointer p-0"
        aria-label="Share today's sheet"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {status === "sharing" ? "Sharing..." : "Share"}
      </button>
      {status !== "idle" && status !== "sharing" && message && (
        <span
          className={`absolute right-0 top-full mt-1 whitespace-nowrap font-sans text-[10px] ${
            status === "error" ? "text-amber-600" : "text-sage-400"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
