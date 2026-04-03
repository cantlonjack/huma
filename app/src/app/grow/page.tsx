"use client";

import { useState, useEffect } from "react";
import type { Pattern, Aspiration, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";
import { getPatterns, getAspirations } from "@/lib/supabase-v2";
import TabShell from "@/components/TabShell";
import GrowSkeleton from "@/components/GrowSkeleton";

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

function PatternCard({ pattern, aspirations }: { pattern: Pattern; aspirations: Aspiration[] }) {
  const colors = statusColor(pattern.status);
  const percent = validationPercent(pattern);
  const triggerStep = pattern.steps.find(s => s.isTrigger);
  const pathwaySteps = pattern.steps.filter(s => !s.isTrigger);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #DDD4C0",
        borderRadius: "16px",
        marginBottom: "16px",
        overflow: "hidden",
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
            flexShrink: 0,
            textTransform: "uppercase",
          }}
        >
          {statusLabel(pattern.status)}
        </span>
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

        {/* Time window if present */}
        {pattern.timeWindow && (
          <div
            className="font-sans text-sage-400"
            style={{ fontSize: "12px", marginTop: "12px", fontStyle: "italic" }}
          >
            {pattern.timeWindow}
          </div>
        )}
      </div>

      {/* Validation progress */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #F0EBE3" }}>
        <div
          style={{
            width: "100%",
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
          <span>{percent}%</span>
        </div>
      </div>
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
      setLoading(false);
    }

    loadData();
  }, [user, authLoading]);

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

  // ─── Group patterns by status ──────────────────────────────────────────
  const validated = patterns.filter(p => p.status === "validated");
  const working = patterns.filter(p => p.status === "working");
  const finding = patterns.filter(p => p.status === "finding");

  return (
    <TabShell
      contextPrompt="What patterns are you noticing in your days?"
      sourceTab="grow"
      tabContext={tabContext}
    >
      <div
        className="min-h-dvh bg-sand-50"
        style={{ paddingTop: "16px", paddingBottom: "100px" }}
      >
        {/* Page header */}
        <div style={{ padding: "0 16px 16px" }}>
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
        ) : patterns.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ padding: "0 16px" }}>
            {/* Validated patterns */}
            {validated.length > 0 && (
              <PatternSection
                title="Validated"
                subtitle="These patterns are working. They're part of your operating system."
                patterns={validated}
                aspirations={aspirations}
              />
            )}

            {/* Working patterns */}
            {working.length > 0 && (
              <PatternSection
                title="Working"
                subtitle="You're building these. Keep going."
                patterns={working}
                aspirations={aspirations}
              />
            )}

            {/* Finding patterns */}
            {finding.length > 0 && (
              <PatternSection
                title="Finding"
                subtitle="Still emerging. The shape will clarify with use."
                patterns={finding}
                aspirations={aspirations}
              />
            )}
          </div>
        )}
      </div>
    </TabShell>
  );
}

// ─── Pattern Section ────────────────────────────────────────────────────────

function PatternSection({
  title,
  subtitle,
  patterns,
  aspirations,
}: {
  title: string;
  subtitle: string;
  patterns: Pattern[];
  aspirations: Aspiration[];
}) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ marginBottom: "12px" }}>
        <h2
          className="font-serif text-sage-700"
          style={{ fontSize: "18px", fontWeight: 400 }}
        >
          {title}
        </h2>
        <p
          className="font-sans text-sage-400"
          style={{ fontSize: "13px", lineHeight: "1.4" }}
        >
          {subtitle}
        </p>
      </div>
      {patterns.map(p => (
        <PatternCard key={p.id} pattern={p} aspirations={aspirations} />
      ))}
    </div>
  );
}
