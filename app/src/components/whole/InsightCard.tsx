"use client";

import { useState, useEffect } from "react";
import type { Insight, DimensionKey } from "@/types/v2";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";

interface InsightCardProps {
  insight: Insight;
  onDismiss: () => void;
  shareworthy?: boolean;
  onShare?: () => void;
}

export default function InsightCard({ insight, onDismiss, shareworthy, onShare }: InsightCardProps) {
  const dims = (insight.dimensionsInvolved || []) as DimensionKey[];
  const [showSharePulse, setShowSharePulse] = useState(false);

  // When shareworthy becomes true, pulse the badge once
  useEffect(() => {
    if (shareworthy) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot animation trigger on prop change; state resets via the timer
      setShowSharePulse(true);
      const timer = setTimeout(() => setShowSharePulse(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [shareworthy]);

  return (
    <div className="mx-4 relative overflow-hidden rounded-2xl bg-white border border-sand-250">
      {/* Dimension constellation header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        {dims.length > 0 && (
          <div className={showSharePulse ? "animate-insight-badge-pulse" : ""}>
            <ConnectionThreads
              activeDimensions={dims}
              size="badge"
              animate={false}
            />
          </div>
        )}
        <p className="font-sans font-medium text-[10px] tracking-[0.18em] uppercase text-sage-400 m-0">
          HUMA SEES
        </p>
      </div>

      <div className="px-4 pb-3.5">
        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-transparent border-none text-sm text-sage-300 hover:text-sage-500 cursor-pointer transition-colors duration-150"
          aria-label="Dismiss insight"
        >
          &times;
        </button>

        {/* Insight text */}
        <p className="font-serif text-base italic leading-relaxed text-earth-650 pr-5">
          {insight.text}
        </p>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-3">
          <p className="font-sans font-medium text-[13px] text-sage-450 m-0 hover:text-sage-600 transition-colors duration-150 cursor-pointer">
            See full pattern &rarr;
          </p>

          {shareworthy && onShare && (
            <button
              onClick={onShare}
              className="font-sans font-medium cursor-pointer text-xs text-amber-600 bg-transparent border-none pl-2 tracking-wide animate-insight-share-fade-in"
            >
              Share this
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
