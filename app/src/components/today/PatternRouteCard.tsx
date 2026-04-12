"use client";

import { useState, useEffect } from "react";
import type { Aspiration } from "@/types/v2";
import type { DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";
import { displayName } from "@/lib/display-name";
import WeekRhythm from "@/components/today/WeekRhythm";
import type { BehaviorStep } from "@/hooks/useToday";
import { triggerCaption } from "@/hooks/useToday";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";

export function PatternRouteCard({
  aspiration,
  steps,
  checkedSteps,
  weekCounts,
  thirtyDayCount,
  allAspirations,
  dayOfWeekCounts,
  disruption,
  dayCount,
  onToggleStep,
  onOpenChat,
}: {
  aspiration: Aspiration;
  steps: BehaviorStep[];
  checkedSteps: Set<string>;
  weekCounts: Record<string, { completed: number; total: number }>;
  thirtyDayCount: number;
  allAspirations: Aspiration[];
  dayOfWeekCounts: Record<number, number>;
  disruption: string | null;
  dayCount: number;
  onToggleStep: (aspirationId: string, stepText: string, checked: boolean) => void;
  onOpenChat: (context: string) => void;
}) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [microCounters, setMicroCounters] = useState<Set<string>>(new Set());
  const [glowingStep, setGlowingStep] = useState<string | null>(null);

  const allChecked = steps.length > 0 && steps.every(s => checkedSteps.has(s.text));
  const validationStatus = aspiration.funnel?.validationStatus || "working";

  useEffect(() => {
    if (allChecked && steps.length > 0) {
      const timer = setTimeout(() => setShowCompletion(true), 300);
      return () => clearTimeout(timer);
    }
    setShowCompletion(false);
  }, [allChecked, steps.length]);

  const handleToggle = (stepText: string) => {
    const wasChecked = checkedSteps.has(stepText);

    if (!wasChecked) {
      setGlowingStep(stepText);
      setTimeout(() => setGlowingStep(null), 600);
      setTimeout(() => {
        setMicroCounters(prev => new Set(prev).add(stepText));
      }, 150);
    } else {
      setMicroCounters(prev => {
        const next = new Set(prev);
        next.delete(stepText);
        return next;
      });
    }

    onToggleStep(aspiration.id, stepText, !wasChecked);
  };

  // No behavior chain fallback
  if (steps.length === 0) {
    return (
      <div className="bg-white border border-sand-300 rounded-2xl mx-4 mb-3 overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 border-b border-sand-200">
          <span className="font-serif text-sage-700 text-lg block truncate">
            {displayName(aspiration.clarifiedText || aspiration.rawText)}
          </span>
        </div>
        <div className="px-4 pt-3.5 pb-4">
          <div className="px-4 py-2.5">
            <span className="font-sans text-sage-600 text-sm">
              {displayName(aspiration.clarifiedText || aspiration.rawText)}
            </span>
          </div>
          <button
            onClick={() =>
              onOpenChat(`Let's map out ${displayName(aspiration.clarifiedText || aspiration.rawText)}. What does doing this actually look like day to day?`)
            }
            className="cursor-pointer px-4 pt-1 pb-2.5"
          >
            <span className="font-serif italic text-sage-400 text-[13px]">
              Still mapping your route.
            </span>
          </button>
        </div>
      </div>
    );
  }

  const estimatedMinutes = (aspiration as unknown as Record<string, unknown>).estimated_minutes as number | undefined;

  return (
    <div className="bg-white border border-sand-300 rounded-2xl mx-4 mb-3 overflow-hidden">
      {/* Card header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-sand-200 flex justify-between items-baseline">
        <span className="font-serif text-sage-700 text-lg truncate min-w-0 flex-1">
          {displayName(aspiration.clarifiedText || aspiration.rawText)}
        </span>
        {estimatedMinutes && (
          <span className="font-sans text-sage-400 flex-shrink-0 text-xs ml-2">
            ~{estimatedMinutes} min
          </span>
        )}
      </div>

      {/* Steps or completion */}
      {showCompletion ? (
        <button
          onClick={() => setShowCompletion(false)}
          className="w-full cursor-pointer py-5 px-4 bg-gradient-to-br from-sage-50 to-sand-100 text-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2">
            <path d="M5 13l4 4L19 7" stroke="var(--color-sage-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-serif italic text-sage-600 text-base">
            Done for today.
          </span>
        </button>
      ) : (
        <div>
          {steps.map((step, i) => {
            const isChecked = checkedSteps.has(step.text);
            const isTrigger = step.is_trigger;
            const wc = weekCounts[step.text];
            const showMicro = microCounters.has(step.text) && isChecked;

            return (
              <button
                key={`${aspiration.id}-${i}`}
                onClick={() => handleToggle(step.text)}
                className={`w-full text-left cursor-pointer flex items-start gap-2 px-4 transition-[background] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "py-3" : "py-2.5"} ${isTrigger && !isChecked ? "bg-gradient-to-br from-amber-100/40 to-amber-100" : "bg-transparent"}`}
                style={{
                  borderBottom: i < steps.length - 1 ? "1px solid var(--color-sand-200)" : "none",
                }}
              >
                {/* Text content */}
                <div className="flex-1 min-w-0">
                  {isTrigger && (
                    <span
                      className={`block font-sans text-[9px] font-semibold tracking-[0.18em] mb-0.5 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "text-ink-200" : "text-amber-600"}`}
                    >
                      THE DECISION
                    </span>
                  )}

                  <span
                    className={`block font-sans leading-snug transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "text-[15px] font-medium" : "text-sm"} ${isChecked ? "text-ink-200 line-through decoration-ink-200 decoration-1" : (isTrigger ? "text-sage-700" : "text-sage-600")}`}
                  >
                    {step.text}
                  </span>

                  {isTrigger && (() => {
                    const caption = triggerCaption(step, allAspirations, aspiration.id);
                    return caption ? (
                      <span
                        className={`block font-sans text-[11px] italic mt-0.5 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "text-ink-200" : "text-sage-400"}`}
                      >
                        {caption}
                      </span>
                    ) : null;
                  })()}

                  {showMicro && wc && (
                    <span className="block font-sans text-[11px] italic text-sage-400 mt-0.5 animate-fade-in">
                      {step.text} &middot; {wc.completed} of 7 days this week
                    </span>
                  )}
                </div>

                {/* Dimension dots */}
                {step.dimensions.length > 0 && (
                  <div className={`flex gap-[3px] items-center flex-shrink-0 ${isTrigger ? "mt-2.5" : "mt-0.5"}`}>
                    {step.dimensions.map(dim => (
                      <div
                        key={dim}
                        title={dim}
                        className={`size-1.5 rounded-full transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${glowingStep === step.text ? "animate-dim-glow" : ""}`}
                        style={{
                          background: DIMENSION_COLORS[dim as keyof typeof DIMENSION_COLORS] || "var(--color-sage-400)",
                          opacity: isChecked && glowingStep !== step.text ? 0.35 : 1,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Weekly rhythm (only after 7+ days of data) */}
      {!showCompletion && dayCount >= 7 && Object.keys(dayOfWeekCounts).length > 0 && (
        <WeekRhythm
          dayCounts={dayOfWeekCounts}
          disruption={disruption}
          onDisruptionTap={disruption ? () => {
            const name = displayName(aspiration.clarifiedText || aspiration.rawText);
            onOpenChat(`Looking at ${name} — ${disruption}`);
          } : undefined}
        />
      )}

      {/* Footer: dimensions constellation + timing/validation */}
      {!showCompletion && (() => {
        const allDims = Array.from(new Set(steps.flatMap(s => s.dimensions))) as DimensionKey[];
        return (
          <>
            {allDims.length > 0 && (
              <div className="px-3.5 pt-2 border-t border-sand-200 flex items-center gap-2">
                <ConnectionThreads
                  activeDimensions={allDims}
                  size="badge"
                  animate={false}
                />
              </div>
            )}

            <div
              className={`px-3.5 flex justify-between items-center ${allDims.length > 0 ? "pt-1 pb-2.5" : "py-2.5 border-t border-sand-200"}`}
            >
              <span className="font-sans text-sage-400 text-xs">
                {aspiration.triggerData?.window
                  ? `${aspiration.triggerData.window}${aspiration.triggerData.failureNote ? ` · ${aspiration.triggerData.failureNote}` : ""}`
                  : ""}
              </span>
              <span
                className={`font-sans text-xs ${validationStatus === "adjusting" ? "text-amber-600" : (validationStatus === "active" ? "text-sage-400" : "text-sage-500")}`}
              >
                {thirtyDayCount}/30 &middot; {validationStatus}
              </span>
            </div>
          </>
        );
      })()}
    </div>
  );
}
