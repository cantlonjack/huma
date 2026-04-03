"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pattern, Aspiration, DimensionKey, FutureAction, FuturePhase, SparklineData, EmergingBehavior, MergeSuggestion, MonthlyReviewData } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";
import { getPatterns, getAspirations, getPatternSparklines, detectEmergingBehaviors, savePattern, detectMergeCandidates, mergePatterns, getMonthlyReviewData } from "@/lib/supabase-v2";
import TabShell from "@/components/TabShell";
import GrowSkeleton from "@/components/GrowSkeleton";
import Sparkline from "@/components/Sparkline";
import EmergenceCard from "@/components/EmergenceCard";
import MonthlyReview from "@/components/MonthlyReview";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusLabel(status: Pattern["status"]): string {
  if (status === "validated") return "Validated";
  if (status === "working") return "Working";
  return "Finding";
}

function statusColor(status: Pattern["status"]): { bg: string; text: string } {
  if (status === "validated") return { bg: "#E0EDE1", text: "#3A5A40" };
  if (status === "working") return { bg: "#FFF4EC", text: "#B5621E" };
  return { bg: "#F6F1E9", text: "#8BAF8E" };
}

function validationPercent(pattern: Pattern): number {
  if (pattern.validationTarget <= 0) return 0;
  return Math.min(100, Math.round((pattern.validationCount / pattern.validationTarget) * 100));
}

function progressBarColor(status: Pattern["status"]): string {
  if (status === "validated") return "#3A5A40";
  if (status === "working") return "#B5621E";
  return "#A8C4AA";
}

// ─── Pattern Card ───────────────────────────────────────────────────────────

const ARCHETYPE_DOMAINS: Record<string, DimensionKey[]> = {
  "Earth Tender": ["body", "home"],
  "Creator": ["growth", "joy"],
  "Entrepreneur": ["money", "growth"],
  "Parent": ["people", "home"],
  "Educator": ["growth", "people"],
  "Spirit": ["purpose", "identity"],
};

/** Check if a pattern's aspiration dimensions overlap with an archetype's domain */
function getArchetypeMatch(
  pattern: Pattern,
  aspirations: Aspiration[],
  primaryArchetype: string | undefined,
): string | null {
  if (!primaryArchetype) return null;
  const domains = ARCHETYPE_DOMAINS[primaryArchetype];
  if (!domains) return null;

  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;

  const aspDims = (asp.dimensionsTouched || []) as string[];
  const behaviorDims = (asp.behaviors || []).flatMap(b =>
    (b.dimensions || []).map(d => typeof d === "string" ? d : d.dimension)
  );
  const allDims = new Set([...aspDims, ...behaviorDims]);

  if (domains.some(d => allDims.has(d))) return primaryArchetype;
  return null;
}

/** Get ALL dimensions touched across all steps in a pattern, deduplicated */
function getAllStepDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return [];

  const seen = new Set<DimensionKey>();
  for (const step of pattern.steps) {
    const stepText = step.text.toLowerCase().trim();
    const behavior = asp.behaviors?.find(b => b.text.toLowerCase().trim() === stepText);
    if (behavior?.dimensions) {
      for (const d of behavior.dimensions) {
        const dim = typeof d === "string" ? d : d.dimension;
        if (dim) seen.add(dim as DimensionKey);
      }
    }
  }
  return Array.from(seen);
}

/** Get the display name of a pattern's source aspiration */
function getAspirationName(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;
  return displayName(asp.title || asp.clarifiedText || asp.rawText);
}

/** Get coming_up and longer_arc data from the source aspiration */
function getAspirationPhases(pattern: Pattern, aspirations: Aspiration[]): {
  comingUp: FutureAction[];
  longerArc: FuturePhase[];
} {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  return {
    comingUp: asp?.comingUp ?? [],
    longerArc: asp?.longerArc ?? [],
  };
}

/** Get the dimensions that a trigger behavior touches, by looking up the aspiration */
function getTriggerDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return [];

  const triggerText = pattern.trigger.toLowerCase().trim();
  const behavior = asp.behaviors?.find(b => b.text.toLowerCase().trim() === triggerText);
  if (!behavior?.dimensions) return [];

  return behavior.dimensions
    .map(d => typeof d === "string" ? d : d.dimension)
    .filter(Boolean) as DimensionKey[];
}

/** Detect if trigger behavior is shared across multiple aspirations */
function getSharedCaption(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const triggerText = pattern.trigger.toLowerCase().trim();
  const shared = aspirations.filter(a =>
    a.id !== pattern.aspirationId &&
    a.behaviors?.some(b => b.text.toLowerCase().trim() === triggerText)
  );
  if (shared.length === 0) return null;
  if (shared.length === 1) {
    const name = displayName(shared[0].clarifiedText || shared[0].rawText);
    return `Shared with ${name}`;
  }
  return `Shared across ${shared.length + 1} patterns`;
}

/** Find the approximate date where a dropping pattern started declining */
function findDropOffDate(points: SparklineData["points"]): string | null {
  if (points.length < 4) return null;
  const mid = Math.floor(points.length / 2);
  // Walk backward from midpoint to find last "good" day (ratio >= 0.5)
  for (let i = mid; i >= 0; i--) {
    if (points[i].ratio >= 0.5) {
      return points[i].date;
    }
  }
  // Fallback: use the point with highest ratio in first half
  let best = 0;
  for (let i = 1; i < mid; i++) {
    if (points[i].ratio > points[best].ratio) best = i;
  }
  return points[best].date;
}

/** Format a YYYY-MM-DD date as a readable string like "March 21" */
function formatDropDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function PatternCard({
  pattern,
  aspirations,
  expanded,
  onToggle,
  primaryArchetype,
  sparkline,
  onInvestigate,
  mergeSuggestion,
  onMerge,
  onDismissMerge,
}: {
  pattern: Pattern;
  aspirations: Aspiration[];
  expanded: boolean;
  onToggle: () => void;
  primaryArchetype?: string;
  sparkline?: SparklineData;
  /** Called when operator taps "something changed" on a dropping pattern */
  onInvestigate?: (patternId: string) => void;
  mergeSuggestion?: MergeSuggestion;
  onMerge?: (primaryId: string, secondaryId: string) => void;
  onDismissMerge?: (patternId: string, otherPatternId: string) => void;
}) {
  const colors = statusColor(pattern.status);
  const percent = validationPercent(pattern);
  const triggerStep = pattern.steps.find(s => s.isTrigger);
  const pathwaySteps = pattern.steps.filter(s => !s.isTrigger);
  const allDims = getAllStepDimensions(pattern, aspirations);
  const aspirationName = getAspirationName(pattern, aspirations);
  const { comingUp, longerArc } = getAspirationPhases(pattern, aspirations);
  const hasExpandContent = comingUp.length > 0 || longerArc.length > 0;
  const archetypeLabel = getArchetypeMatch(pattern, aspirations, primaryArchetype);

  return (
    <div
      onClick={onToggle}
      style={{
        background: "white",
        border: "1px solid #DDD4C0",
        borderRadius: "16px",
        marginBottom: "20px",
        overflow: "hidden",
        cursor: hasExpandContent ? "pointer" : "default",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid #F0EBE3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          className="font-serif text-sage-700"
          style={{
            fontSize: "18px",
            lineHeight: "1.3",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
          }}
        >
          {displayName(pattern.name)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {archetypeLabel && (
            <span
              className="font-sans"
              style={{
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-sage-300)",
              }}
            >
              {archetypeLabel}
            </span>
          )}
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              padding: "3px 10px",
              borderRadius: "10px",
              background: colors.bg,
              color: colors.text,
              textTransform: "uppercase",
            }}
          >
            {statusLabel(pattern.status)}
          </span>
        </div>
      </div>

      {/* Trigger + Pathway */}
      <div style={{ padding: "14px 16px" }}>
        {/* The Decision */}
        {triggerStep && (
          <div style={{ marginBottom: pathwaySteps.length > 0 ? "14px" : 0 }}>
            <span
              className="font-sans"
              style={{
                display: "block",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: "#B5621E",
                marginBottom: "4px",
              }}
            >
              THE DECISION
            </span>
            <span
              className="font-sans"
              style={{
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--color-sage-700)",
                lineHeight: "1.4",
              }}
            >
              {triggerStep.text}
            </span>

            {/* Dimension pills — nodal visibility */}
            {(() => {
              const dims = getTriggerDimensions(pattern, aspirations);
              const shared = getSharedCaption(pattern, aspirations);
              if (dims.length === 0 && !shared) return null;
              return (
                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {dims.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      {dims.map(dim => (
                        <div key={dim} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <div
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: DIMENSION_COLORS[dim] || "#8BAF8E",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="font-sans"
                            style={{ fontSize: "10px", color: "var(--color-sage-400)" }}
                          >
                            {DIMENSION_LABELS[dim] || dim}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {shared && (
                    <span
                      className="font-sans"
                      style={{ fontSize: "10px", fontStyle: "italic", color: "var(--color-sage-400)" }}
                    >
                      {shared}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Golden Pathway */}
        {pathwaySteps.length > 0 && (
          <div>
            <span
              className="font-sans"
              style={{
                display: "block",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: "var(--color-sage-400)",
                marginBottom: "8px",
              }}
            >
              GOLDEN PATHWAY
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {pathwaySteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--color-sage-300)",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="font-sans text-sage-600"
                    style={{ fontSize: "14px", lineHeight: "1.4" }}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aggregate dimension row — all dimensions across all steps */}
        {allDims.length > 0 && (
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <span
              className="font-sans"
              style={{ fontSize: "11px", color: "var(--color-sage-400)" }}
            >
              Touches
            </span>
            {allDims.map(dim => (
              <div key={dim} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: DIMENSION_COLORS[dim] || "#8BAF8E",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-sans"
                  style={{ fontSize: "11px", color: "var(--color-sage-400)" }}
                >
                  {DIMENSION_LABELS[dim] || dim}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Time window if present (shown in collapsed state too) */}
        {pattern.timeWindow && (
          <div
            className="font-sans text-sage-400"
            style={{ fontSize: "12px", marginTop: "12px", fontStyle: "italic" }}
          >
            {pattern.timeWindow}
          </div>
        )}
      </div>

      {/* Expanded: Coming Up + Longer Arc */}
      <div
        style={{
          maxHeight: expanded ? "600px" : "0px",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {hasExpandContent && (
          <div style={{ padding: "0 16px 14px", borderTop: "1px solid #F0EBE3" }}>
            {/* Coming Up */}
            {comingUp.length > 0 && (
              <div style={{ paddingTop: "14px" }}>
                <span
                  className="font-sans"
                  style={{
                    display: "block",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    color: "var(--color-sage-400)",
                    marginBottom: "8px",
                  }}
                >
                  COMING UP
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {comingUp.map((item, i) => (
                    <div key={i}>
                      <span
                        className="font-sans"
                        style={{ fontSize: "13px", color: "var(--color-sage-500)", lineHeight: "1.4" }}
                      >
                        {item.name}
                      </span>
                      {item.timeframe && (
                        <span
                          className="font-sans"
                          style={{ fontSize: "12px", color: "var(--color-sage-400)", marginLeft: "6px" }}
                        >
                          — {item.timeframe}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Longer Arc */}
            {longerArc.length > 0 && (
              <div style={{ paddingTop: comingUp.length > 0 ? "14px" : "14px" }}>
                <span
                  className="font-sans"
                  style={{
                    display: "block",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    color: "var(--color-sage-400)",
                    marginBottom: "8px",
                  }}
                >
                  THE LONGER ARC
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {longerArc.map((phase, i) => (
                    <div key={i}>
                      <span
                        className="font-sans"
                        style={{ fontSize: "13px", color: "var(--color-sage-500)", lineHeight: "1.4" }}
                      >
                        {phase.phase}
                      </span>
                      {phase.timeframe && (
                        <span
                          className="font-sans"
                          style={{ fontSize: "12px", color: "var(--color-sage-400)", marginLeft: "6px" }}
                        >
                          — {phase.timeframe}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation + Sparkline */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #F0EBE3" }}>
        {/* Sparkline + progress bar row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Progress bar — fills available space */}
          <div
            style={{
              flex: 1,
              height: "6px",
              borderRadius: "3px",
              background: "#F0EBE3",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                borderRadius: "3px",
                background: progressBarColor(pattern.status),
                transition: "width 400ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
          {/* Sparkline — right side, only when data exists */}
          {sparkline && sparkline.points.length >= 2 && (
            <Sparkline
              points={sparkline.points}
              trend={sparkline.trend}
              width={80}
              height={24}
            />
          )}
        </div>
        {/* Stats row */}
        <div
          className="font-sans"
          style={{
            fontSize: "11px",
            color: "var(--color-sage-400)",
            marginTop: "6px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{pattern.validationCount} of {pattern.validationTarget} days</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {sparkline && sparkline.trend === "rising" && (
              <span
                className="font-serif"
                style={{
                  fontSize: "11px",
                  color: "#3A5A40",
                  fontStyle: "italic",
                }}
              >
                momentum
              </span>
            )}
            {sparkline && sparkline.trend === "dropping" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInvestigate?.(pattern.id);
                }}
                className="font-serif cursor-pointer"
                style={{
                  fontSize: "11px",
                  color: "#B5621E",
                  fontStyle: "italic",
                  background: "none",
                  border: "none",
                  padding: "2px 0",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: "2px",
                }}
              >
                something changed
              </button>
            )}
            <span>{percent}%</span>
          </div>
        </div>
      </div>

      {/* Aspiration provenance */}
      {aspirationName && (
        <div style={{ padding: "8px 16px 12px", borderTop: "1px solid #F0EBE3" }}>
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              fontStyle: "italic",
              color: "var(--color-sage-400)",
            }}
          >
            From: {aspirationName}
          </span>
        </div>
      )}

      {/* Merge suggestion */}
      {mergeSuggestion && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #F0EBE3",
            background: "#FDFAF5",
          }}
        >
          <p
            className="font-serif"
            style={{
              fontSize: "13px",
              fontStyle: "italic",
              color: "var(--color-sage-600)",
              lineHeight: "1.4",
              marginBottom: "8px",
            }}
          >
            {mergeSuggestion.sharedBehaviors.length === 1
              ? `\u201c${mergeSuggestion.sharedBehaviors[0]}\u201d also lives in ${displayName(mergeSuggestion.otherPatternName)}.`
              : `${mergeSuggestion.sharedBehaviors.length} shared behaviors with ${displayName(mergeSuggestion.otherPatternName)}.`
            }
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => onMerge?.(pattern.id, mergeSuggestion.otherPatternId)}
              className="font-sans cursor-pointer"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#B5621E",
                background: "none",
                border: "1px solid #B5621E",
                borderRadius: "8px",
                padding: "5px 14px",
              }}
            >
              Merge
            </button>
            <button
              onClick={() => onDismissMerge?.(pattern.id, mergeSuggestion.otherPatternId)}
              className="font-sans cursor-pointer"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--color-sage-400)",
                background: "none",
                border: "none",
                padding: "5px 8px",
              }}
            >
              Keep separate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Simple seed icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#E0EDE1",
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22V12M12 12C12 9 14 6 18 4C14 6 12 9 12 12ZM12 12C12 9 10 6 6 4C10 6 12 9 12 12Z"
            stroke="#5C7A62"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p
        className="font-serif text-sage-700"
        style={{ fontSize: "20px", lineHeight: "1.3", marginBottom: "8px" }}
      >
        Patterns emerge from living
      </p>
      <p
        className="font-sans text-sage-400"
        style={{ fontSize: "14px", lineHeight: "1.5", maxWidth: "280px", margin: "0 auto" }}
      >
        As you check off behaviors on your production sheet, HUMA will surface the patterns that hold your days together.
      </p>
    </div>
  );
}

// ─── Grow Page ──────────────────────────────────────────────────────────────

export default function GrowPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [whyStatement, setWhyStatement] = useState<string | null>(null);
  const [sparklines, setSparklines] = useState<Map<string, SparklineData>>(new Map());
  const [emergingBehaviors, setEmergingBehaviors] = useState<EmergingBehavior[]>([]);
  const [investigatePatternId, setInvestigatePatternId] = useState<string | null>(null);
  const [dismissedMerges, setDismissedMerges] = useState<Set<string>>(new Set());
  const [monthlyReview, setMonthlyReview] = useState<MonthlyReviewData | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleInvestigate = useCallback((patternId: string) => {
    setInvestigatePatternId(patternId);
  }, []);

  const handleChatClose = useCallback(() => {
    setInvestigatePatternId(null);
  }, []);

  const handleFormalize = useCallback(async (behavior: EmergingBehavior, name: string) => {
    const newPattern: Pattern = {
      id: crypto.randomUUID(),
      aspirationId: behavior.aspirationId || "",
      name,
      trigger: behavior.behaviorName,
      steps: [{
        behaviorKey: behavior.behaviorKey,
        text: behavior.behaviorName,
        order: 0,
        isTrigger: true,
      }],
      validationCount: 0,
      validationTarget: 30,
      status: "finding",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase if authenticated
    if (user) {
      try {
        const sb = createClient();
        if (sb) await savePattern(sb, user.id, newPattern);
      } catch { /* fall through to localStorage */ }
    }

    // Save to localStorage as fallback
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      const all = saved ? JSON.parse(saved) : [];
      all.push(newPattern);
      localStorage.setItem("huma-v2-patterns", JSON.stringify(all));
    } catch { /* non-critical */ }

    // Update local state
    setPatterns(prev => [...prev, newPattern]);
    setEmergingBehaviors(prev => prev.filter(b => b.behaviorKey !== behavior.behaviorKey));
  }, [user]);

  const handleDismissEmergence = useCallback((behaviorKey: string) => {
    // Persist dismissal so it doesn't reappear this session
    try {
      const saved = localStorage.getItem("huma-v2-dismissed-emergences");
      const dismissed: string[] = saved ? JSON.parse(saved) : [];
      if (!dismissed.includes(behaviorKey)) {
        dismissed.push(behaviorKey);
        localStorage.setItem("huma-v2-dismissed-emergences", JSON.stringify(dismissed));
      }
    } catch { /* non-critical */ }

    setEmergingBehaviors(prev => prev.filter(b => b.behaviorKey !== behaviorKey));
  }, []);

  const handleMerge = useCallback(async (primaryId: string, secondaryId: string) => {
    if (!user) return;
    try {
      const sb = createClient();
      if (!sb) return;
      const merged = await mergePatterns(sb, user.id, primaryId, secondaryId, patterns);
      // Update local state: replace primary, remove secondary
      setPatterns(prev =>
        prev.filter(p => p.id !== secondaryId).map(p => p.id === primaryId ? merged : p)
      );
    } catch {
      // Fallback: just dismiss the suggestion
      setDismissedMerges(prev => new Set(prev).add(`${primaryId}:${secondaryId}`));
    }
  }, [user, patterns]);

  const handleDismissMerge = useCallback((patternId: string, otherPatternId: string) => {
    // Dismiss both directions
    setDismissedMerges(prev => {
      const next = new Set(prev);
      next.add(`${patternId}:${otherPatternId}`);
      next.add(`${otherPatternId}:${patternId}`);
      return next;
    });
    // Persist dismissals
    try {
      const key = "huma-v2-dismissed-merges";
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      list.push(`${patternId}:${otherPatternId}`, `${otherPatternId}:${patternId}`);
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* non-critical */ }
  }, []);

  // ─── Merge suggestions (computed from current patterns) ─────────────────
  const mergeSuggestions = (() => {
    if (patterns.length < 2) return new Map<string, MergeSuggestion>();
    const all = detectMergeCandidates(patterns);
    // Load persisted dismissals on first render
    let persisted: string[] = [];
    try {
      const saved = localStorage.getItem("huma-v2-dismissed-merges");
      if (saved) persisted = JSON.parse(saved);
    } catch { /* fresh */ }
    const dismissed = new Set([...dismissedMerges, ...persisted]);
    const map = new Map<string, MergeSuggestion>();
    for (const s of all) {
      if (!dismissed.has(`${s.patternId}:${s.otherPatternId}`)) {
        map.set(s.patternId, s);
      }
    }
    return map;
  })();

  // ─── Data Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    async function loadData() {
      setLoading(true);
      let loadedPatterns: Pattern[] = [];
      let loadedAspirations: Aspiration[] = [];

      const supabase = user ? createClient() : null;

      // Load patterns from Supabase
      if (supabase && user) {
        try {
          loadedPatterns = await getPatterns(supabase, user.id);
        } catch { /* fallback to localStorage */ }
      }

      // Fallback: localStorage patterns
      if (loadedPatterns.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-patterns");
          if (saved) loadedPatterns = JSON.parse(saved);
        } catch { /* fresh */ }
      }

      // If still no patterns, try extracting from aspirations
      if (loadedPatterns.length === 0) {
        if (supabase && user) {
          try {
            loadedAspirations = await getAspirations(supabase, user.id);
          } catch { /* fallback */ }
        }

        if (loadedAspirations.length === 0) {
          try {
            const saved = localStorage.getItem("huma-v2-aspirations");
            if (saved) loadedAspirations = JSON.parse(saved);
          } catch { /* fresh */ }
        }

        if (loadedAspirations.length > 0) {
          loadedPatterns = extractPatternsFromAspirations(loadedAspirations);
        }
      } else {
        // Still load aspirations for context
        if (supabase && user) {
          try {
            loadedAspirations = await getAspirations(supabase, user.id);
          } catch { /* non-critical */ }
        }
        if (loadedAspirations.length === 0) {
          try {
            const saved = localStorage.getItem("huma-v2-aspirations");
            if (saved) loadedAspirations = JSON.parse(saved);
          } catch { /* fresh */ }
        }
      }

      setPatterns(loadedPatterns);
      setAspirations(loadedAspirations);

      // Load archetypes + WHY for chat context and display
      let loadedArchetypes: string[] = [];
      let loadedWhy: string | null = null;
      if (supabase && user) {
        try {
          const { getKnownContext } = await import("@/lib/supabase-v2");
          const ctx = await getKnownContext(supabase, user.id);
          const savedArchs = ctx.archetypes as string[] | undefined;
          if (savedArchs?.length) loadedArchetypes = savedArchs;
          if (ctx.why_statement) loadedWhy = ctx.why_statement as string;
        } catch { /* non-critical */ }
      }
      if (loadedArchetypes.length === 0 || !loadedWhy) {
        try {
          const localCtx = localStorage.getItem("huma-v2-known-context");
          if (localCtx) {
            const parsed = JSON.parse(localCtx);
            if (parsed.archetypes?.length > 0 && loadedArchetypes.length === 0) loadedArchetypes = parsed.archetypes;
            if (parsed.why_statement && !loadedWhy) loadedWhy = parsed.why_statement;
          }
        } catch { /* fresh */ }
      }
      setArchetypes(loadedArchetypes);
      setWhyStatement(loadedWhy);

      // Load sparkline data for all patterns (requires auth + behavior_log)
      if (supabase && user && loadedPatterns.length > 0) {
        try {
          const sparklineData = await getPatternSparklines(supabase, user.id, loadedPatterns);
          const map = new Map<string, SparklineData>();
          for (const s of sparklineData) map.set(s.patternId, s);
          setSparklines(map);
        } catch { /* non-critical — sparklines are a progressive enhancement */ }
      }

      // Detect emerging behaviors (requires auth + behavior_log data)
      if (supabase && user) {
        try {
          const emerging = await detectEmergingBehaviors(
            supabase, user.id, loadedPatterns, loadedAspirations
          );
          // Filter out previously dismissed emergences
          let dismissed: string[] = [];
          try {
            const saved = localStorage.getItem("huma-v2-dismissed-emergences");
            if (saved) dismissed = JSON.parse(saved);
          } catch { /* fresh */ }
          const filtered = emerging.filter(b => !dismissed.includes(b.behaviorKey));
          setEmergingBehaviors(filtered);
        } catch { /* non-critical */ }
      }

      // Monthly review (requires auth + behavior_log history)
      if (supabase && user) {
        try {
          const review = await getMonthlyReviewData(supabase, user.id, loadedAspirations);
          setMonthlyReview(review);
        } catch { /* non-critical */ }
      }

      setLoading(false);
    }

    loadData();
  }, [user, authLoading]);

  // ─── Day count ─────────────────────────────────────────────────────────
  const dayCount = (() => {
    try {
      const start = localStorage.getItem("huma-v2-start-date");
      if (start) {
        const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
      }
    } catch { /* fresh */ }
    return 1;
  })();

  // ─── Chat context for Grow tab ──────────────────────────────────────────
  const tabContext: Record<string, unknown> = {};
  if (patterns.length > 0) {
    tabContext.patterns = patterns.map(p => ({
      name: p.name,
      trigger: p.trigger,
      status: p.status,
      validationCount: p.validationCount,
      validationTarget: p.validationTarget,
      stepCount: p.steps.length,
    }));
  }
  if (aspirations.length > 0) {
    tabContext.aspirationCount = aspirations.length;
  }
  tabContext.dayCount = dayCount;
  if (archetypes.length > 0) tabContext.archetypes = archetypes;
  if (whyStatement) tabContext.whyStatement = whyStatement;
  if (emergingBehaviors.length > 0) {
    tabContext.emergingBehaviors = emergingBehaviors.map(b => ({
      name: b.behaviorName,
      completedDays: b.completedDays,
    }));
  }
  if (sparklines.size > 0) {
    const trends: Record<string, string> = {};
    sparklines.forEach((s) => { if (s.trend !== "stable") trends[s.patternId] = s.trend; });
    if (Object.keys(trends).length > 0) tabContext.patternTrends = trends;
  }

  // ─── "What changed?" investigation ─────────────────────────────────────
  const investigatePattern = investigatePatternId
    ? patterns.find(p => p.id === investigatePatternId) ?? null
    : null;
  const investigateSparkline = investigatePatternId
    ? sparklines.get(investigatePatternId) ?? null
    : null;

  // Build the initial HUMA message for dropping pattern investigation
  let investigateMessage: string | undefined;
  if (investigatePattern && investigateSparkline?.trend === "dropping") {
    const dropDate = findDropOffDate(investigateSparkline.points);
    const dateStr = dropDate ? ` after ${formatDropDate(dropDate)}` : "";
    investigateMessage = `Your ${displayName(investigatePattern.name)} dropped off${dateStr}. What changed?`;
  }

  // Enrich tabContext with selected pattern details when investigating
  if (investigatePattern && investigateSparkline) {
    tabContext.selectedPattern = {
      id: investigatePattern.id,
      name: investigatePattern.name,
      trigger: investigatePattern.trigger,
      steps: investigatePattern.steps.map(s => s.text),
      status: investigatePattern.status,
      validationCount: investigatePattern.validationCount,
      validationTarget: investigatePattern.validationTarget,
      trend: investigateSparkline.trend,
      sparklinePoints: investigateSparkline.points,
      aspirationName: getAspirationName(investigatePattern, aspirations),
    };
  }

  // ─── Group patterns by status ──────────────────────────────────────────
  const validated = patterns.filter(p => p.status === "validated");
  const working = patterns.filter(p => p.status === "working");
  const finding = patterns.filter(p => p.status === "finding");

  return (
    <TabShell
      contextPrompt="What patterns are you noticing in your days?"
      sourceTab="grow"
      tabContext={tabContext}
      forceOpen={!!investigatePatternId}
      onChatClose={handleChatClose}
      initialMessage={investigateMessage}
    >
      <div
        className="min-h-dvh bg-sand-50"
        style={{ paddingTop: "24px", paddingBottom: "100px" }}
      >
        {/* Page header */}
        <div style={{ padding: "0 16px 24px" }}>
          <p
            className="font-sans"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-sage-400)",
              marginBottom: "4px",
            }}
          >
            GROW
          </p>
          <h1
            className="font-serif text-sage-700"
            style={{ fontSize: "26px", lineHeight: "1.2", fontWeight: 400 }}
          >
            Your patterns
          </h1>
          {!loading && patterns.length > 0 && (
            <p
              className="font-sans text-sage-400"
              style={{ fontSize: "13px", marginTop: "4px" }}
            >
              {patterns.length} pattern{patterns.length !== 1 ? "s" : ""} &middot;{" "}
              {validated.length} validated, {working.length} working, {finding.length} finding
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <GrowSkeleton />
        ) : patterns.length === 0 && emergingBehaviors.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ padding: "0 16px" }}>
            {/* Emerging behaviors — "Something forming..." */}
            {emergingBehaviors.length > 0 && (
              <EmergenceCard
                behaviors={emergingBehaviors}
                onFormalize={handleFormalize}
                onDismiss={handleDismissEmergence}
              />
            )}

            {/* Validated patterns */}
            {validated.length > 0 && (
              <PatternSection
                title="Validated"
                subtitle="These patterns are working. They're part of your operating system."
                whySubtitle={whyStatement ? `These serve your WHY: \u201c${whyStatement}\u201d` : undefined}
                patterns={validated}
                aspirations={aspirations}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                primaryArchetype={archetypes[0]}
                sparklines={sparklines}
                onInvestigate={handleInvestigate}
                mergeSuggestions={mergeSuggestions}
                onMerge={handleMerge}
                onDismissMerge={handleDismissMerge}
              />
            )}

            {/* Working patterns */}
            {working.length > 0 && (
              <PatternSection
                title="Working"
                subtitle="You're building these. Keep going."
                patterns={working}
                aspirations={aspirations}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                primaryArchetype={archetypes[0]}
                sparklines={sparklines}
                onInvestigate={handleInvestigate}
                mergeSuggestions={mergeSuggestions}
                onMerge={handleMerge}
                onDismissMerge={handleDismissMerge}
              />
            )}

            {/* Finding patterns */}
            {finding.length > 0 && (
              <PatternSection
                title="Finding"
                subtitle="Still emerging. The shape will clarify with use."
                patterns={finding}
                aspirations={aspirations}
                expandedId={expandedId}
                primaryArchetype={archetypes[0]}
                onToggleExpand={handleToggleExpand}
                sparklines={sparklines}
                onInvestigate={handleInvestigate}
                mergeSuggestions={mergeSuggestions}
                onMerge={handleMerge}
                onDismissMerge={handleDismissMerge}
              />
            )}

            {/* Monthly review — previous month's behavior grid */}
            {monthlyReview && (
              <div style={{ marginTop: "32px" }}>
                <MonthlyReview data={monthlyReview} />
              </div>
            )}
          </div>
        )}
      </div>
    </TabShell>
  );
}

// ─── Dimension Folding ─────────────────────────────────────────────────────

/** Max visible cards before folding kicks in */
const MAX_VISIBLE_CARDS = 7;

/** Get primary dimension for a pattern (first dimension touched, or "other") */
function getPrimaryDimension(pattern: Pattern, aspirations: Aspiration[]): DimensionKey | "other" {
  const dims = getAllStepDimensions(pattern, aspirations);
  return dims[0] || "other";
}

/** Group overflow patterns by their primary dimension */
function groupByDimension(
  patterns: Pattern[],
  aspirations: Aspiration[],
): Map<string, { label: string; color: string; patterns: Pattern[] }> {
  const groups = new Map<string, { label: string; color: string; patterns: Pattern[] }>();
  for (const p of patterns) {
    const dim = getPrimaryDimension(p, aspirations);
    const key = dim === "other" ? "other" : dim;
    if (!groups.has(key)) {
      groups.set(key, {
        label: dim === "other" ? "Other" : DIMENSION_LABELS[dim],
        color: dim === "other" ? "#8C8274" : DIMENSION_COLORS[dim],
        patterns: [],
      });
    }
    groups.get(key)!.patterns.push(p);
  }
  return groups;
}

function DimensionFold({
  label,
  color,
  patterns,
  aspirations,
  expandedId,
  onToggleExpand,
  primaryArchetype,
  sparklines,
  onInvestigate,
  mergeSuggestions,
  onMerge,
  onDismissMerge,
}: {
  label: string;
  color: string;
  patterns: Pattern[];
  aspirations: Aspiration[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  primaryArchetype?: string;
  sparklines?: Map<string, SparklineData>;
  onInvestigate?: (patternId: string) => void;
  mergeSuggestions?: Map<string, MergeSuggestion>;
  onMerge?: (primaryId: string, secondaryId: string) => void;
  onDismissMerge?: (patternId: string, otherPatternId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: "12px" }}>
      <button
        onClick={() => setOpen(!open)}
        className="font-sans cursor-pointer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          background: "none",
          border: "none",
          padding: "10px 0",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-ink-600)",
            flex: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "var(--color-sage-400)",
          }}
        >
          {patterns.length} pattern{patterns.length !== 1 ? "s" : ""}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            flexShrink: 0,
          }}
        >
          <path
            d="M3.5 5.25L7 8.75L10.5 5.25"
            stroke="var(--color-sage-400)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        style={{
          maxHeight: open ? `${patterns.length * 400}px` : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {patterns.map(p => (
          <PatternCard
            key={p.id}
            pattern={p}
            aspirations={aspirations}
            expanded={expandedId === p.id}
            onToggle={() => onToggleExpand(p.id)}
            primaryArchetype={primaryArchetype}
            sparkline={sparklines?.get(p.id)}
            onInvestigate={onInvestigate}
            mergeSuggestion={mergeSuggestions?.get(p.id)}
            onMerge={onMerge}
            onDismissMerge={onDismissMerge}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Pattern Section ────────────────────────────────────────────────────────

function PatternSection({
  title,
  subtitle,
  whySubtitle,
  patterns,
  aspirations,
  expandedId,
  onToggleExpand,
  primaryArchetype,
  sparklines,
  onInvestigate,
  mergeSuggestions,
  onMerge,
  onDismissMerge,
}: {
  title: string;
  subtitle: string;
  whySubtitle?: string;
  patterns: Pattern[];
  aspirations: Aspiration[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  primaryArchetype?: string;
  sparklines?: Map<string, SparklineData>;
  onInvestigate?: (patternId: string) => void;
  mergeSuggestions?: Map<string, MergeSuggestion>;
  onMerge?: (primaryId: string, secondaryId: string) => void;
  onDismissMerge?: (patternId: string, otherPatternId: string) => void;
}) {
  const needsFolding = patterns.length > MAX_VISIBLE_CARDS;
  const visible = needsFolding ? patterns.slice(0, 5) : patterns;
  const folded = needsFolding ? patterns.slice(5) : [];
  const foldedGroups = needsFolding ? groupByDimension(folded, aspirations) : new Map();

  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h2
          className="font-serif text-sage-700"
          style={{ fontSize: "18px", fontWeight: 400 }}
        >
          {title}
        </h2>
        {whySubtitle ? (
          <p
            className="font-serif"
            style={{ fontSize: "13px", lineHeight: "1.4", fontStyle: "italic", color: "var(--color-sage-500)" }}
          >
            {whySubtitle}
          </p>
        ) : (
          <p
            className="font-sans text-sage-400"
            style={{ fontSize: "13px", lineHeight: "1.4" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {visible.map(p => (
        <PatternCard
          key={p.id}
          pattern={p}
          aspirations={aspirations}
          expanded={expandedId === p.id}
          onToggle={() => onToggleExpand(p.id)}
          primaryArchetype={primaryArchetype}
          sparkline={sparklines?.get(p.id)}
          onInvestigate={onInvestigate}
          mergeSuggestion={mergeSuggestions?.get(p.id)}
          onMerge={onMerge}
          onDismissMerge={onDismissMerge}
        />
      ))}

      {/* Dimension folds for overflow */}
      {foldedGroups.size > 0 && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "16px",
            borderTop: "1px solid #EDE6D8",
          }}
        >
          <p
            className="font-serif"
            style={{
              fontSize: "13px",
              fontStyle: "italic",
              color: "var(--color-sage-400)",
              marginBottom: "8px",
            }}
          >
            {folded.length} more by dimension
          </p>
          {Array.from(foldedGroups.entries()).map(([key, group]) => (
            <DimensionFold
              key={key}
              label={group.label}
              color={group.color}
              patterns={group.patterns}
              aspirations={aspirations}
              expandedId={expandedId}
              onToggleExpand={onToggleExpand}
              primaryArchetype={primaryArchetype}
              sparklines={sparklines}
              onInvestigate={onInvestigate}
              mergeSuggestions={mergeSuggestions}
              onMerge={onMerge}
              onDismissMerge={onDismissMerge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
