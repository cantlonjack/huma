"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Aspiration, Insight } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";
import TabShell from "@/components/TabShell";
import {
  getAspirations,
  getKnownContext,
  getUndeliveredInsight,
  computeStructuralInsight,
  markInsightDelivered,
  logBehaviorCheckoff,
  getBehaviorWeekCounts,
} from "@/lib/supabase-v2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BehaviorStep {
  text: string;
  is_trigger: boolean;
  dimension: string;
}

interface CheckedEntry {
  aspiration_id: string;
  behavior_text: string;
}

// ─── Dimension dot colors per design system ─────────────────────────────────

const DIMENSION_DOT_COLORS: Record<string, string> = {
  body: "#3A5A40",
  people: "#5C7A62",
  money: "#B5621E",
  home: "#2E6B8A",
  growth: "#8A6D1E",
  joy: "#A04040",
  purpose: "#3A5A40",
  identity: "#8BAF8E",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return `${weekday} ${month} ${day}`;
}

function getDayCount(): number {
  try {
    const start = localStorage.getItem("huma-v2-start-date");
    if (start) {
      const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
      return diff > 0 ? diff : 1;
    }
  } catch { /* fresh */ }
  return 1;
}

/** Extract behavior steps from aspiration data */
function getBehaviorChain(aspiration: Aspiration): BehaviorStep[] {
  if (!aspiration.behaviors || aspiration.behaviors.length === 0) return [];

  const triggerBehavior = aspiration.triggerData?.behavior?.toLowerCase().trim();

  return aspiration.behaviors.map((b, i) => {
    const isTrigger = triggerBehavior
      ? b.text.toLowerCase().trim() === triggerBehavior
      : i === 0; // default: first behavior is trigger

    const dim = b.dimensions?.[0];
    const dimension = dim
      ? (typeof dim === "string" ? dim : dim.dimension)
      : "";

    return { text: b.text, is_trigger: isTrigger, dimension };
  });
}

/** Get 30-day completion count for an aspiration */
function get30DayCount(
  entries: Array<{ aspiration_id: string; date: string; completed: boolean }>,
  aspirationId: string
): number {
  return entries.filter(
    e => e.aspiration_id === aspirationId && e.completed
  ).length;
}

// ─── Aspiration Quick-Look Sheet ────────────────────────────────────────────

function AspirationQuickLook({
  aspiration,
  weekCompletions,
  onClose,
}: {
  aspiration: Aspiration;
  weekCompletions: number;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/15 animate-overlay-in" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[56] bg-sand-50 rounded-t-2xl border-t border-sand-300 animate-slide-up"
        style={{ height: "40dvh" }}
      >
        <div className="flex justify-center" style={{ paddingTop: "12px", paddingBottom: "8px" }}>
          <div
            className="bg-sand-300 cursor-pointer"
            style={{ width: "36px", height: "4px", borderRadius: "2px" }}
            onClick={onClose}
          />
        </div>
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(40dvh - 40px)" }}>
          <h3
            className="font-serif text-sage-700"
            style={{ fontSize: "20px", lineHeight: "1.3" }}
          >
            {displayName(aspiration.clarifiedText || aspiration.rawText)}
          </h3>
          {aspiration.clarifiedText && aspiration.clarifiedText !== aspiration.rawText && (
            <p className="font-sans text-ink-500 mt-1" style={{ fontSize: "14px", lineHeight: "1.4" }}>
              {aspiration.rawText}
            </p>
          )}
          <p className="font-sans text-sage-600" style={{ fontSize: "14px", marginTop: "8px" }}>
            {aspiration.behaviors.length} behaviors active
          </p>
          <p className="font-sans text-sage-400" style={{ fontSize: "14px", marginTop: "4px" }}>
            {weekCompletions}/7 days this week
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Pattern Route Card ─────────────────────────────────────────────────────

function PatternRouteCard({
  aspiration,
  steps,
  checkedSteps,
  weekCounts,
  thirtyDayCount,
  onToggleStep,
  onOpenChat,
}: {
  aspiration: Aspiration;
  steps: BehaviorStep[];
  checkedSteps: Set<string>;
  weekCounts: Record<string, { completed: number; total: number }>;
  thirtyDayCount: number;
  onToggleStep: (aspirationId: string, stepText: string, checked: boolean) => void;
  onOpenChat: (context: string) => void;
}) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [microCounters, setMicroCounters] = useState<Set<string>>(new Set());
  const [bouncingStep, setBouncingStep] = useState<string | null>(null);

  const allChecked = steps.length > 0 && steps.every(s => checkedSteps.has(s.text));
  const validationStatus = aspiration.funnel?.validationStatus || "working";

  // Show completion state when all steps checked
  useEffect(() => {
    if (allChecked && steps.length > 0) {
      const timer = setTimeout(() => setShowCompletion(true), 300);
      return () => clearTimeout(timer);
    }
    setShowCompletion(false);
  }, [allChecked, steps.length]);

  const handleToggle = (stepText: string) => {
    const wasChecked = checkedSteps.has(stepText);

    // Bounce animation
    setBouncingStep(stepText);
    setTimeout(() => setBouncingStep(null), 200);

    if (!wasChecked) {
      // Show micro-counter after 150ms
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
      <div
        style={{
          background: "white",
          border: "1px solid #DDD4C0",
          borderRadius: "16px",
          margin: "0 16px 12px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #F0EBE3" }}>
          <span className="font-serif text-sage-700" style={{ fontSize: "18px" }}>
            {displayName(aspiration.clarifiedText || aspiration.rawText)}
          </span>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ padding: "10px 14px 10px 48px", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "1.5px solid #DDD4C0",
              }}
            />
            <span className="font-sans text-sage-600" style={{ fontSize: "14px" }}>
              {displayName(aspiration.clarifiedText || aspiration.rawText)}
            </span>
          </div>
          <button
            onClick={() =>
              onOpenChat(`Let's map out ${displayName(aspiration.clarifiedText || aspiration.rawText)}. What does doing this actually look like day to day?`)
            }
            className="cursor-pointer"
            style={{ padding: "4px 14px 10px 48px" }}
          >
            <span
              className="font-serif italic text-sage-400"
              style={{ fontSize: "13px" }}
            >
              Still mapping your route.
            </span>
          </button>
        </div>
      </div>
    );
  }

  const triggerIdx = steps.findIndex(s => s.is_trigger);
  const estimatedMinutes = (aspiration as unknown as Record<string, unknown>).estimated_minutes as number | undefined;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #DDD4C0",
        borderRadius: "16px",
        margin: "0 16px 12px",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid #F0EBE3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="font-serif text-sage-700" style={{ fontSize: "18px" }}>
          {displayName(aspiration.clarifiedText || aspiration.rawText)}
        </span>
        {estimatedMinutes && (
          <span className="font-sans text-sage-400" style={{ fontSize: "12px" }}>
            ~{estimatedMinutes} min
          </span>
        )}
      </div>

      {/* Steps or completion */}
      {showCompletion ? (
        <button
          onClick={() => setShowCompletion(false)}
          className="w-full cursor-pointer"
          style={{
            padding: "20px 16px",
            background: "linear-gradient(135deg, #EBF3EC, #F6F1E9)",
            textAlign: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px" }}>
            <path d="M5 13l4 4L19 7" stroke="#5C7A62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-serif italic text-sage-600" style={{ fontSize: "16px" }}>
            Done for today.
          </span>
        </button>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Connector line */}
          {steps.length > 1 && (
            <div
              style={{
                position: "absolute",
                left: "25px",
                top: "0",
                bottom: "0",
                width: "1px",
                background: "#DDD4C0",
                zIndex: 0,
              }}
            >
              {/* Clip to only run between checkbox centers */}
              <div
                style={{
                  position: "absolute",
                  top: triggerIdx >= 0 ? "20px" : "20px",
                  bottom: "20px",
                  width: "1px",
                  background: "#DDD4C0",
                }}
              />
            </div>
          )}

          {steps.map((step, i) => {
            const isChecked = checkedSteps.has(step.text);
            const isTrigger = step.is_trigger;
            const wc = weekCounts[step.text];
            const showMicro = microCounters.has(step.text) && isChecked;

            return (
              <button
                key={`${aspiration.id}-${i}`}
                onClick={() => handleToggle(step.text)}
                className="w-full text-left cursor-pointer"
                style={{
                  position: "relative",
                  padding: isTrigger ? "10px 14px 10px 48px" : "9px 14px 9px 48px",
                  borderBottom: i < steps.length - 1 ? `1px solid ${isTrigger ? "#F0EBE3" : "#F8F5F0"}` : "none",
                  background: isTrigger ? "linear-gradient(135deg, #FFFAF4, #FFF4E6)" : "transparent",
                  display: "block",
                }}
              >
                {/* Checkbox */}
                <div
                  className={bouncingStep === step.text ? "animate-check-bounce" : ""}
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: isTrigger ? "50%" : "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: isChecked
                      ? "none"
                      : `1.5px solid ${isTrigger ? "#E8935A" : "#DDD4C0"}`,
                    background: isChecked
                      ? (isTrigger ? "#B5621E" : "#5C7A62")
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    transition: "all 200ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {isChecked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Trigger badge */}
                {isTrigger && (
                  <span
                    className="font-sans"
                    style={{
                      display: "block",
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      color: "#B5621E",
                      marginBottom: "2px",
                    }}
                  >
                    THE DECISION
                  </span>
                )}

                {/* Step text */}
                <span
                  className="font-sans"
                  style={{
                    fontSize: isTrigger ? "15px" : "14px",
                    fontWeight: isTrigger ? 500 : 400,
                    color: isChecked
                      ? "var(--color-sage-300)"
                      : (isTrigger ? "var(--color-sage-700)" : "var(--color-sage-600)"),
                    textDecoration: isChecked ? "line-through" : "none",
                    display: "block",
                    lineHeight: "1.4",
                  }}
                >
                  {step.text}
                </span>

                {/* Micro-counter */}
                {showMicro && wc && (
                  <span
                    className="font-sans animate-fade-in"
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontStyle: "italic",
                      color: "var(--color-sage-400)",
                      marginTop: "2px",
                    }}
                  >
                    {step.text} &middot; {wc.completed} of 7 days this week
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Window + validation strip */}
      {!showCompletion && (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid #F0EBE3",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left: timing */}
          <span className="font-sans text-sage-400" style={{ fontSize: "12px" }}>
            {aspiration.triggerData?.window
              ? `${aspiration.triggerData.window}${aspiration.triggerData.failureNote ? ` · ${aspiration.triggerData.failureNote}` : ""}`
              : ""}
          </span>

          {/* Right: validation */}
          <span
            className="font-sans"
            style={{
              fontSize: "12px",
              color: validationStatus === "adjusting" ? "#B5621E" : (validationStatus === "active" ? "var(--color-sage-400)" : "var(--color-sage-500)"),
            }}
          >
            {thirtyDayCount}/30 &middot; {validationStatus}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Reroute Card ───────────────────────────────────────────────────────────

function RerouteCard({
  aspiration,
  weekCompletions,
  onOpenChat,
}: {
  aspiration: Aspiration;
  weekCompletions: number;
  onOpenChat: (context: string) => void;
}) {
  const name = displayName(aspiration.clarifiedText || aspiration.rawText);
  const status = aspiration.funnel?.validationStatus;
  const reason = status === "adjusting"
    ? ((aspiration as unknown as Record<string, unknown>).stall_reason as string) || "Marked for adjustment"
    : `Completed ${weekCompletions} of 7 days this week`;

  return (
    <div
      style={{
        borderLeft: "3px solid #B5621E",
        background: "var(--color-amber-100)",
        borderRadius: "0 12px 12px 0",
        padding: "14px 16px",
        margin: "0 16px 12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span
          className="font-sans"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", color: "#B5621E" }}
        >
          REROUTE NEEDED
        </span>
        <span className="font-sans text-sage-600" style={{ fontSize: "13px" }}>{name}</span>
      </div>
      <p className="font-sans italic text-sage-500" style={{ fontSize: "13px", marginTop: "6px" }}>
        {reason}
      </p>
      <button
        onClick={() => onOpenChat(`Let's look at ${name}. It's been stalling — what's getting in the way?`)}
        className="font-sans cursor-pointer"
        style={{ fontSize: "13px", color: "#B5621E", marginTop: "8px", background: "none", border: "none", padding: 0 }}
      >
        Adjust route &rarr;
      </button>
    </div>
  );
}

// ─── Insight Card ───────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onTellMore,
  onDismiss,
}: {
  insight: Insight;
  onTellMore: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="animate-entrance-2"
      style={{
        background: "var(--color-sand-100)",
        borderLeft: "3px solid var(--color-sage-600)",
        borderRadius: "0 12px 12px 0",
        padding: "14px 16px",
        margin: "0 16px 12px",
      }}
    >
      <p className="font-serif text-ink-700" style={{ fontSize: "15px", lineHeight: "1.6" }}>
        {insight.text}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <button
          onClick={onTellMore}
          className="font-sans font-medium text-sage-500 cursor-pointer hover:text-sage-700 transition-colors"
          style={{ fontSize: "13px", background: "none", border: "none", padding: 0 }}
        >
          Tell me more &rarr;
        </button>
        <button
          onClick={onDismiss}
          className="font-sans text-sage-300 cursor-pointer hover:text-sage-500 transition-colors"
          style={{ fontSize: "16px", background: "none", border: "none", padding: "0 4px", lineHeight: 1 }}
          aria-label="Dismiss insight"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ─── Standalone Behavior Row ────────────────────────────────────────────────

function StandaloneBehaviorRow({
  entry,
  isChecked,
  onToggle,
}: {
  entry: { behavior_text: string; dimensions?: string[] };
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full cursor-pointer"
      style={{
        background: "white",
        border: "1px solid #DDD4C0",
        borderRadius: "10px",
        padding: "10px 14px",
        margin: "0 16px 6px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "calc(100% - 32px)",
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: "20px",
          height: "20px",
          minWidth: "20px",
          borderRadius: "50%",
          border: isChecked ? "none" : "1.5px solid #DDD4C0",
          background: isChecked ? "#5C7A62" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isChecked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Text */}
      <span
        className="font-sans text-sage-600 flex-1 text-left"
        style={{
          fontSize: "14px",
          textDecoration: isChecked ? "line-through" : "none",
          color: isChecked ? "var(--color-sage-300)" : undefined,
        }}
      >
        {entry.behavior_text}
      </span>

      {/* Dimension dots */}
      {entry.dimensions && entry.dimensions.length > 0 && (
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          {entry.dimensions.map(dim => (
            <div
              key={dim}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: DIMENSION_DOT_COLORS[dim] || "#8BAF8E",
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

// ─── Today Page ─────────────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [date] = useState(() => getLocalDate());
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [checkedEntries, setCheckedEntries] = useState<Set<string>>(new Set()); // "aspId:behaviorText"
  const [weekCounts, setWeekCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [thirtyDayCounts, setThirtyDayCounts] = useState<Record<string, number>>({});
  const [quickLookAspiration, setQuickLookAspiration] = useState<Aspiration | null>(null);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [standaloneEntries, setStandaloneEntries] = useState<Array<{ behavior_text: string; dimensions?: string[] }>>([]);
  const insightMarkedRef = useRef(false);

  const dayCount = getDayCount();

  // ─── Data Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve before loading data
    async function loadData() {
      setLoading(true);
      let asps: Aspiration[] = [];
      let insightData: Insight | null = null;
      const checked = new Set<string>();

      const supabase = user ? createClient() : null;

      // Load aspirations
      if (supabase && user) {
        try {
          asps = await getAspirations(supabase, user.id);
        } catch { /* fallback */ }
      }

      if (asps.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-aspirations");
          if (saved) asps = JSON.parse(saved);
        } catch { /* fresh */ }
      }

      // Filter to working/active/adjusting
      asps = asps.filter(a => {
        const status = a.funnel?.validationStatus || "working";
        return status === "working" || status === "active" || status === "adjusting";
      });

      // Sort by trigger_time ASC nulls last, then name ASC
      asps.sort((a, b) => {
        const aTime = a.triggerData?.window || "";
        const bTime = b.triggerData?.window || "";
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;
        if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);
        const aName = a.clarifiedText || a.rawText;
        const bName = b.clarifiedText || b.rawText;
        return aName.localeCompare(bName);
      });

      setAspirations(asps);

      // Load today's checked entries from sheet_entries
      if (supabase && user) {
        try {
          const { data: todayEntries } = await supabase
            .from("sheet_entries")
            .select("aspiration_id, behavior_text, checked")
            .eq("user_id", user.id)
            .eq("date", date)
            .eq("checked", true);

          if (todayEntries) {
            for (const entry of todayEntries) {
              if (entry.aspiration_id && entry.behavior_text) {
                checked.add(`${entry.aspiration_id}:${entry.behavior_text}`);
              }
            }
          }
        } catch { /* non-critical */ }

        // Load standalone behaviors (aspiration_id IS NULL)
        try {
          const { data: standalone } = await supabase
            .from("sheet_entries")
            .select("behavior_text, detail, checked")
            .eq("user_id", user.id)
            .eq("date", date)
            .is("aspiration_id", null);

          if (standalone && standalone.length > 0) {
            setStandaloneEntries(standalone.map(s => ({
              behavior_text: s.behavior_text,
              dimensions: (s.detail as Record<string, unknown>)?.dimensions as string[] || [],
            })));
            for (const s of standalone) {
              if (s.checked) {
                checked.add(`:${s.behavior_text}`);
              }
            }
          }
        } catch { /* non-critical */ }
      }

      // Also check localStorage for today's checks
      try {
        const cached = localStorage.getItem(`huma-v2-sheet-${date}`);
        if (cached) {
          const entries = JSON.parse(cached);
          for (const e of entries) {
            if (e.checked && e.behaviorText) {
              const key = `${e.aspirationId || ""}:${e.behaviorText}`;
              checked.add(key);
            }
          }
        }
      } catch { /* skip */ }

      setCheckedEntries(checked);

      // Load week counts
      if (supabase && user) {
        try {
          const counts = await getBehaviorWeekCounts(supabase, user.id);
          setWeekCounts(counts);
        } catch { /* non-critical */ }
      }

      // Load 30-day counts per aspiration
      if (supabase && user) {
        try {
          const thirtyDaysAgo = getLocalDateOffset(30);
          const { data: logData } = await supabase
            .from("behavior_log")
            .select("behavior_key, completed")
            .eq("user_id", user.id)
            .gte("date", thirtyDaysAgo)
            .eq("completed", true);

          if (logData) {
            const counts: Record<string, number> = {};
            for (const row of logData) {
              // Map behavior_key back to aspiration — approximate via aspiration behaviors
              for (const asp of asps) {
                for (const b of asp.behaviors) {
                  if (b.key === row.behavior_key || b.text === row.behavior_key) {
                    counts[asp.id] = (counts[asp.id] || 0) + 1;
                  }
                }
              }
            }
            setThirtyDayCounts(counts);
          }
        } catch { /* non-critical */ }
      }

      // Load unread insight
      if (asps.length > 0) {
        if (supabase && user) {
          try {
            const existing = await getUndeliveredInsight(supabase, user.id);
            if (existing) {
              insightData = existing;
            }
          } catch { /* fall through */ }
        }

        if (!insightData) {
          try {
            const localInsight = localStorage.getItem("huma-v2-pending-insight");
            if (localInsight) {
              insightData = JSON.parse(localInsight);
            }
          } catch { /* compute fresh */ }
        }

        if (!insightData) {
          insightData = computeStructuralInsight(asps);
          if (insightData) {
            localStorage.setItem("huma-v2-pending-insight", JSON.stringify(insightData));
          }
        }
      }

      setInsight(insightData);

      // Mark insight as shown
      if (insightData && supabase && user && !insightMarkedRef.current) {
        insightMarkedRef.current = true;
        try {
          await supabase
            .from("insights")
            .update({ shown_at: new Date().toISOString() })
            .eq("id", insightData.id)
            .eq("user_id", user.id);
        } catch { /* non-critical */ }
      }

      setLoading(false);
    }
    loadData();
  }, [user, authLoading, date]);

  // ─── Check-off handler ──────────────────────────────────────────────────
  const handleToggleStep = useCallback(
    (aspirationId: string, stepText: string, checked: boolean) => {
      const key = `${aspirationId}:${stepText}`;

      setCheckedEntries(prev => {
        const next = new Set(prev);
        if (checked) next.add(key);
        else next.delete(key);
        return next;
      });

      // Write to sheet_entries + behavior_log
      if (user) {
        const supabase = createClient();
        if (supabase) {
          if (checked) {
            // Insert sheet_entry
            supabase
              .from("sheet_entries")
              .insert({
                user_id: user.id,
                aspiration_id: aspirationId || null,
                behavior_text: stepText,
                behavior_key: stepText,
                completed: true,
                completed_at: new Date().toISOString(),
                date,
                checked: true,
                checked_at: new Date().toISOString(),
                detail: {},
                time_of_day: "morning",
              })
              .then(() => {});
          } else {
            // Delete matching row
            supabase
              .from("sheet_entries")
              .delete()
              .eq("user_id", user.id)
              .eq("aspiration_id", aspirationId)
              .eq("behavior_text", stepText)
              .eq("date", date)
              .then(() => {});
          }

          // Log behavior
          logBehaviorCheckoff(supabase, user.id, stepText, stepText, aspirationId || null, date, checked)
            .then(() => getBehaviorWeekCounts(supabase, user.id))
            .then(counts => setWeekCounts(counts))
            .catch(() => {});
        }
      }
    },
    [user, date]
  );

  // ─── Standalone toggle ──────────────────────────────────────────────────
  const handleToggleStandalone = useCallback(
    (behaviorText: string) => {
      const key = `:${behaviorText}`;
      const wasChecked = checkedEntries.has(key);

      setCheckedEntries(prev => {
        const next = new Set(prev);
        if (wasChecked) next.delete(key);
        else next.add(key);
        return next;
      });

      if (user) {
        const supabase = createClient();
        if (supabase) {
          if (!wasChecked) {
            supabase.from("sheet_entries").update({ checked: true, checked_at: new Date().toISOString() })
              .eq("user_id", user.id).eq("behavior_text", behaviorText).eq("date", date).is("aspiration_id", null)
              .then(() => {});
          } else {
            supabase.from("sheet_entries").update({ checked: false, checked_at: null })
              .eq("user_id", user.id).eq("behavior_text", behaviorText).eq("date", date).is("aspiration_id", null)
              .then(() => {});
          }
        }
      }
    },
    [user, date, checkedEntries]
  );

  // ─── Chat open handler ─────────────────────────────────────────────────
  const openChatWithContext = useCallback((context: string | null) => {
    setChatContext(context);
    setChatOpen(true);
  }, []);

  // ─── Insight dismiss ───────────────────────────────────────────────────
  const dismissInsight = useCallback(() => {
    if (!insight) return;
    setInsight(null);
    localStorage.removeItem("huma-v2-pending-insight");

    if (user) {
      const supabase = createClient();
      if (supabase) {
        markInsightDelivered(supabase, insight.id, user.id).catch(() => {});
      }
    }
  }, [insight, user]);

  // ─── Reroute detection ─────────────────────────────────────────────────
  const rerouteAspiration = (() => {
    if (dayCount < 14) return null; // 14-day threshold

    const candidates = aspirations.filter(a => {
      const status = a.funnel?.validationStatus;
      if (status === "adjusting") return true;

      // Stalling: active > 14 days AND < 3 completions in last 7
      const aspWeekCompletions = aspirations
        .flatMap(asp => asp.id === a.id ? asp.behaviors.map(b => weekCounts[b.text]?.completed || 0) : [])
        .reduce((sum, c) => sum + c, 0);

      return aspWeekCompletions < 3;
    });

    // Show most recently active (last in sorted list)
    return candidates.length > 0 ? candidates[candidates.length - 1] : null;
  })();

  // ─── Status line ──────────────────────────────────────────────────────
  const adjustingCount = aspirations.filter(a => a.funnel?.validationStatus === "adjusting").length;
  const activeCount = aspirations.length;

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <TabShell
      contextPrompt="Tell HUMA something..."
      forceOpen={chatOpen}
      onChatClose={() => { setChatOpen(false); setChatContext(null); }}
    >
      <div className="min-h-dvh bg-sand-50 flex flex-col" style={{ paddingBottom: "140px" }}>
        {/* Header bar — 44px */}
        <div
          style={{
            height: "44px",
            borderBottom: "1px solid #DDD4C0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          <span
            className="font-sans font-medium text-sage-500"
            style={{ fontSize: "11px", letterSpacing: "0.4em", lineHeight: "1" }}
          >
            H U M A
          </span>
          <span className="font-sans text-sage-400" style={{ fontSize: "11px" }}>
            {formatHeaderDate(date)} &middot; Day {dayCount}
          </span>
        </div>

        {/* Section label: TODAY */}
        <div style={{ padding: "16px 16px 8px" }}>
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              color: "var(--color-ink-300)",
            }}
          >
            TODAY
          </span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ padding: "24px 16px" }}>
            <span
              className="font-sans text-sage-400 animate-dot-pulse"
              style={{ fontSize: "13px", opacity: 0.5 }}
            >
              Loading your day...
            </span>
          </div>
        ) : aspirations.length === 0 ? (
          /* ─── Empty State ─── */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              padding: "0 24px",
            }}
          >
            {/* SVG illustration */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="var(--color-sage-200)" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="40" cy="40" r="4" fill="var(--color-sage-300)" />
            </svg>

            <p
              className="font-serif italic text-sage-600"
              style={{ fontSize: "20px", textAlign: "center", maxWidth: "240px" }}
            >
              Your day starts with a conversation.
            </p>

            <p
              className="font-sans text-sage-400"
              style={{ fontSize: "14px", textAlign: "center", maxWidth: "260px", lineHeight: "1.5" }}
            >
              Start a conversation and HUMA will build your first route.
            </p>

            <button
              onClick={() => router.push("/start?fresh=1")}
              className="font-sans cursor-pointer"
              style={{
                width: "100%",
                maxWidth: "280px",
                background: "var(--color-amber-600)",
                color: "white",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "14px",
                border: "none",
              }}
            >
              What&apos;s going on?
            </button>
          </div>
        ) : (
          <>
            {/* Status Line */}
            {activeCount > 0 && (
              <div className="animate-entrance-1" style={{ padding: "0 16px 8px" }}>
                {adjustingCount > 0 ? (
                  <span className="font-sans" style={{ fontSize: "13px", color: "#B5621E" }}>
                    &#9679; {adjustingCount} need{adjustingCount === 1 ? "s" : ""} attention
                  </span>
                ) : (
                  <span className="font-sans text-sage-500" style={{ fontSize: "13px" }}>
                    <span className="text-sage-400">&#9679;</span> On route &middot; {activeCount} pattern{activeCount !== 1 ? "s" : ""} active
                  </span>
                )}
              </div>
            )}

            {/* Aspiration Ribbon */}
            <div className="hide-scrollbar overflow-x-auto" style={{ marginBottom: "12px", WebkitOverflowScrolling: "touch" }}>
              <div className="flex gap-2 animate-entrance-1" style={{ paddingLeft: "16px", paddingRight: "16px" }}>
                {aspirations.map(asp => (
                  <button
                    key={asp.id}
                    onClick={() => setQuickLookAspiration(asp)}
                    className="flex-shrink-0 cursor-pointer"
                    style={{
                      background: "var(--color-sand-100)",
                      border: "1px solid #DDD4C0",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-sage-600)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName(asp.clarifiedText || asp.rawText)}
                  </button>
                ))}
              </div>
            </div>

            {/* Insight Card (conditional — above pattern cards) */}
            {insight && (
              <InsightCard
                insight={insight}
                onTellMore={() => openChatWithContext(insight.text)}
                onDismiss={dismissInsight}
              />
            )}

            {/* Pattern Route Cards */}
            {aspirations
              .filter(a => {
                const status = a.funnel?.validationStatus || "working";
                return status === "working" || status === "active";
              })
              .map((asp, i) => {
                const steps = getBehaviorChain(asp);
                const aspChecked = new Set<string>();
                for (const entry of checkedEntries) {
                  if (entry.startsWith(`${asp.id}:`)) {
                    aspChecked.add(entry.replace(`${asp.id}:`, ""));
                  }
                }

                return (
                  <div key={asp.id} className={i <= 2 ? `animate-entrance-${i + 2}` : ""}>
                    <PatternRouteCard
                      aspiration={asp}
                      steps={steps}
                      checkedSteps={aspChecked}
                      weekCounts={weekCounts}
                      thirtyDayCount={thirtyDayCounts[asp.id] || 0}
                      onToggleStep={handleToggleStep}
                      onOpenChat={openChatWithContext}
                    />
                  </div>
                );
              })}

            {/* Reroute Card (conditional) */}
            {rerouteAspiration && (
              <RerouteCard
                aspiration={rerouteAspiration}
                weekCompletions={
                  rerouteAspiration.behaviors
                    .map(b => weekCounts[b.text]?.completed || 0)
                    .reduce((sum, c) => sum + c, 0)
                }
                onOpenChat={openChatWithContext}
              />
            )}

            {/* Standalone Behaviors (conditional) */}
            {standaloneEntries.length > 0 && (
              <>
                <div style={{ padding: "16px 16px 8px" }}>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.22em",
                      color: "var(--color-ink-300)",
                    }}
                  >
                    TODAY&apos;S BEHAVIORS
                  </span>
                </div>
                {standaloneEntries.map(entry => (
                  <StandaloneBehaviorRow
                    key={entry.behavior_text}
                    entry={entry}
                    isChecked={checkedEntries.has(`:${entry.behavior_text}`)}
                    onToggle={() => handleToggleStandalone(entry.behavior_text)}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* Bottom Prompt Bar — persistent, above nav */}
        {!loading && aspirations.length > 0 && (
          <div
            className="fixed left-0 right-0 z-40"
            style={{
              bottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
              background: "var(--color-sand-50)",
              borderTop: "1px solid #DDD4C0",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={() => openChatWithContext(null)}
              className="flex-1 text-left cursor-pointer"
              style={{
                background: "white",
                border: "1px solid #DDD4C0",
                borderRadius: "20px",
                padding: "8px 14px",
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-sage-300)",
              }}
            >
              Tell HUMA something...
            </button>
            <button
              onClick={() => openChatWithContext(null)}
              className="cursor-pointer flex-shrink-0"
              style={{
                background: "var(--color-amber-600)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Aspiration Quick-Look */}
      {quickLookAspiration && (
        <AspirationQuickLook
          aspiration={quickLookAspiration}
          weekCompletions={
            quickLookAspiration.behaviors
              .map(b => weekCounts[b.text]?.completed || 0)
              .reduce((sum, c) => sum + c, 0)
          }
          onClose={() => setQuickLookAspiration(null)}
        />
      )}
    </TabShell>
  );
}
