"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Aspiration, Behavior, DimensionKey } from "@/types/v2";
import { DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ConversationSheet from "@/components/ConversationSheet";
import {
  getAspirations,
  getKnownContext,
  getBehaviorWeekCounts,
} from "@/lib/supabase-v2";
import { paletteConcepts } from "@/engine/palette-concepts";
import { displayName } from "@/lib/display-name";

const ALL_DIMENSIONS: DimensionKey[] = ["body", "people", "money", "home", "growth", "joy", "purpose", "identity"];

// ─── Dimension Normalizer ────────────────────────────────────────────────────

const DIMENSION_NORMALIZE: Record<string, string> = {
  living: "Body", body: "Body",
  social: "People", people: "People",
  financial: "Money", money: "Money",
  material: "Home", home: "Home",
  intellectual: "Growth", growth: "Growth",
  experiential: "Joy", joy: "Joy",
  spiritual: "Purpose", purpose: "Purpose",
  cultural: "Identity", identity: "Identity",
};

function normalizeDimension(d: string | { dimension: string }): string {
  const key = typeof d === "string" ? d : d.dimension;
  return DIMENSION_NORMALIZE[key.toLowerCase()] || key;
}

// ─── Behavior Row ───────────────────────────────────────────────────────────

function BehaviorRow({
  behavior,
  weekCount,
  isLast,
}: {
  behavior: Behavior;
  weekCount: { completed: number; total: number } | undefined;
  isLast: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const hasDetail = !!behavior.detail;
  const hasActivity = weekCount && weekCount.completed > 0;
  const behaviorDims = (behavior.dimensions || []).map((d: string | { dimension: string }) =>
    typeof d === "string" ? d : d.dimension
  );

  return (
    <div
      onClick={() => hasDetail && setDetailOpen(!detailOpen)}
      style={{
        padding: "10px 16px",
        borderBottom: isLast ? "none" : "1px solid #F6F1E9",
        cursor: hasDetail ? "pointer" : "default",
      }}
    >
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: hasActivity ? "#4A6E50" : "#C4D9C6",
          }}
        />
        <span
          className="font-sans"
          style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#2A2520", lineHeight: 1.3 }}
        >
          {behavior.text}
        </span>
        <span
          className="font-sans"
          style={{ fontSize: 12, fontWeight: 400, color: "#A8A196", whiteSpace: "nowrap" }}
        >
          {weekCount ? `${weekCount.completed}/${weekCount.total} days` : "not yet"}
        </span>
        {hasDetail && (
          <span style={{ fontSize: 10, color: "#A8A196", marginLeft: 4 }}>
            {detailOpen ? "\u25B4" : "\u25BE"}
          </span>
        )}
      </div>

      {/* Dimension tags — smaller than card-level */}
      {behaviorDims.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4, marginLeft: 18 }}>
          {behaviorDims.map((dim: string) => (
            <span
              key={dim}
              className="font-sans"
              style={{
                fontSize: 9, fontWeight: 500, letterSpacing: "0.1em",
                color: "#4A6E50", background: "#EBF3EC",
                padding: "1px 6px", borderRadius: 100,
              }}
            >
              {normalizeDimension(dim)}
            </span>
          ))}
        </div>
      )}

      {/* Expandable detail */}
      {hasDetail && (
        <div
          style={{
            maxHeight: detailOpen ? 200 : 0,
            overflow: "hidden",
            transition: "max-height 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            marginLeft: 18,
          }}
        >
          <div
            className="font-sans"
            style={{
              fontSize: 12, fontWeight: 300, color: "#6B6358",
              lineHeight: 1.6, marginTop: 8, paddingBottom: 4,
            }}
          >
            {behavior.detail}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aspiration Card ─────────────────────────────────────────────────────────

function AspirationCard({
  aspiration,
  weekCounts,
  defaultExpanded = true,
}: {
  aspiration: Aspiration;
  weekCounts: Record<string, { completed: number; total: number }>;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const dims = aspiration.dimensionsTouched?.length
    ? aspiration.dimensionsTouched
    : [...new Set(aspiration.behaviors.flatMap(b =>
        (b.dimensions || []).map(d => typeof d === "string" ? d : d.dimension)
      ))];

  const activeCount = aspiration.behaviors.filter(b => {
    const c = weekCounts[b.text];
    return c && c.completed > 0;
  }).length;

  return (
    <div className="bg-white border border-sand-300 overflow-hidden" style={{ borderRadius: "16px" }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left cursor-pointer"
        style={{ padding: "16px", borderBottom: expanded ? "1px solid #F6F1E9" : "none" }}
      >
        <div className="flex items-start justify-between">
          <p className="font-sans font-medium text-ink-900" style={{ fontSize: "16px", lineHeight: "1.3" }}>
            {displayName(aspiration.clarifiedText || aspiration.rawText)}
          </p>
          <span style={{ color: "var(--color-ink-300)", fontSize: "12px", marginTop: "2px" }}>
            {expanded ? "\u25B4" : "\u25BE"}
          </span>
        </div>

        {/* Collapsed summary */}
        {!expanded && (
          <p className="font-sans" style={{ fontSize: 13, color: "#A8A196", marginTop: 4 }}>
            {aspiration.behaviors.length} behavior{aspiration.behaviors.length !== 1 ? "s" : ""}
            {activeCount > 0 ? ` \u00b7 ${activeCount} active` : ""}
          </p>
        )}

        {/* Dimension pills — always visible */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {dims.map((dim) => (
            <span
              key={dim}
              className="inline-flex rounded-full font-sans font-medium bg-sage-50 text-sage-600"
              style={{ padding: "2px 8px", fontSize: "10px", letterSpacing: "0.1em", lineHeight: "1" }}
            >
              {DIMENSION_LABELS[dim as DimensionKey] || normalizeDimension(dim)}
            </span>
          ))}
        </div>
      </button>

      {/* Behaviors list — animated expand/collapse */}
      <div
        style={{
          maxHeight: expanded ? 2000 : 0,
          overflow: "hidden",
          transition: "max-height 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {aspiration.behaviors.map((behavior, i) => (
          <BehaviorRow
            key={behavior.key || i}
            behavior={behavior}
            weekCount={weekCounts[behavior.text]}
            isLast={i === aspiration.behaviors.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Connection Indicator ────────────────────────────────────────────────────

function ConnectionIndicator({
  sharedBehavior,
  dimensionCount,
}: {
  sharedBehavior: string;
  dimensionCount: number;
}) {
  return (
    <div className="flex flex-col items-center py-2 mx-6">
      <div className="w-px h-3" style={{ background: "var(--color-sage-200)" }} />
      <span
        className="px-3 py-1 rounded-full font-sans text-[11px] font-medium text-sage-400 border border-sage-200 bg-sand-50"
      >
        shared: {sharedBehavior}
      </span>
      <div className="w-px h-3" style={{ background: "var(--color-sage-200)" }} />

      {dimensionCount >= 4 && (
        <div
          className="mt-1 mx-6 rounded-lg p-2.5 animate-fade-in"
          style={{ background: "var(--color-sand-100)", borderRadius: "8px", padding: "10px 14px" }}
        >
          <p className="font-serif text-sm text-ink-700" style={{ lineHeight: "1.5" }}>
            {sharedBehavior} serves both aspirations. It touches {dimensionCount} dimensions — your most connected behavior.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Category Icons (28px, sage-400 stroke) ────────────────────────────────

const categoryIcons: Record<string, () => React.JSX.Element> = {
  animal: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round">
      <ellipse cx="14" cy="15" rx="7" ry="5" />
      <circle cx="8" cy="11" r="2.5" />
      <line x1="8" y1="20" x2="8" y2="24" />
      <line x1="20" y1="20" x2="20" y2="24" />
    </svg>
  ),
  food: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="14" cy="16" r="8" />
      <ellipse cx="14" cy="16" rx="5" ry="2" />
    </svg>
  ),
  plant: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 24V14" />
      <path d="M14 14c0-4 3-7 7-7-1 4-4 7-7 7z" />
      <path d="M14 18c0-3-3-6-6-6 1 3 3 6 6 6z" />
    </svg>
  ),
  tool: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4l-2 2 6 6 2-2a4 4 0 00-6-6z" />
      <path d="M14 6L4 16l4 4L18 10" />
    </svg>
  ),
  building: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 24V12l10-8 10 8v12" />
      <rect x="11" y="17" width="6" height="7" />
    </svg>
  ),
  money: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="14" cy="14" r="9" />
      <path d="M14 8v12M11 11c0-1.5 1.3-2 3-2s3 .5 3 2-1.3 2-3 2-3 .5-3 2 1.3 2 3 2" />
    </svg>
  ),
  person: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="14" cy="9" r="4" />
      <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  ),
  default: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8BAF8E" strokeWidth="1.5">
      <circle cx="14" cy="14" r="8" />
      <circle cx="14" cy="14" r="2" fill="#8BAF8E" />
    </svg>
  ),
};

function getCategoryKey(text: string): string {
  const t = text.toLowerCase();
  if (/sheep|goat|rabbit|chicken|hen|cow|pig|livestock|flock|herd|buck|doe|poultry/.test(t)) return "animal";
  if (/cheese|food|meal|cook|bake|vegetable|fruit|egg/.test(t)) return "food";
  if (/plant|tree|crop|seed|garden|grow/.test(t)) return "plant";
  if (/fence|pen|coop|barn|equipment|tractor|netting|tool/.test(t)) return "tool";
  if (/house|home|building|garage|shed|property/.test(t)) return "building";
  if (/income|money|budget|cost|price|market|sell|revenue|farmers/.test(t)) return "money";
  if (/person|partner|family|team|hire/.test(t)) return "person";
  return "default";
}

// ─── Visual Context Parser ──────────────────────────────────────────────────

interface VisualContextData {
  people: { initials: string }[];
  who: string;
  where: string;
  land: { summary: string; breakdown: { amount: string; label: string }[] } | null;
  resources: { name: string; detail?: string; category: string }[];
  why: string[];
}

function parseContextVisually(ctx: Record<string, unknown>): VisualContextData {
  const result: VisualContextData = { people: [], who: "", where: "", land: null, resources: [], why: [] };

  for (const [key, value] of Object.entries(ctx)) {
    if (value === null || value === undefined || value === "") continue;
    const k = key.toLowerCase();
    const v = Array.isArray(value) ? value.join(", ") : String(value);

    // WHO
    if (/household|people|partner|family|who|person/.test(k)) {
      result.who = v;
      if (/two|2/.test(v.toLowerCase())) {
        result.people = [{ initials: "JC" }, { initials: "M" }];
      } else {
        const numMatch = v.match(/(\d+)/);
        const num = numMatch ? Math.min(parseInt(numMatch[1]), 4) : 1;
        for (let i = 0; i < num; i++) {
          result.people.push({ initials: String(i + 1) });
        }
      }
    }
    // WHERE — location (city/state)
    else if (/location|city|state|town/.test(k)) {
      // Abbreviate state if full name
      result.where = v
        .replace(/,?\s*Michigan\b/i, ", MI")
        .replace(/,?\s*California\b/i, ", CA")
        .replace(/,?\s*New York\b/i, ", NY")
        .replace(/,?\s*Texas\b/i, ", TX");
    }
    // WHERE — land (triggers land card)
    else if (/land|acres|property|lot/.test(k)) {
      // Find the first/total acreage number
      const firstAcreMatch = v.match(/^(\d+)\s*acres?/i);
      const totalAcres = firstAcreMatch ? parseInt(firstAcreMatch[1]) : null;
      result.land = {
        summary: totalAcres
          ? `${totalAcres} acres` + (result.where ? ` \u00b7 ${result.where}` : "")
          : v,
        breakdown: [],
      };
      // Parse "with X acres for Y" patterns for sub-allocations
      const subMatch = v.match(/with\s+(\d+)\s*acres?\s+(?:for\s+)?(\w[\w\s]*)/i);
      if (subMatch && totalAcres) {
        const subAmount = parseInt(subMatch[1]);
        const subLabel = subMatch[2].trim().toUpperCase();
        result.land.breakdown.push({ amount: String(subAmount), label: `ACRES ${subLabel}` });
        const remainder = totalAcres - subAmount;
        if (remainder > 0) {
          result.land.breakdown.push({ amount: String(remainder), label: "ACRES OTHER" });
        }
      }
    }
    // WHAT — resources, livestock, equipment, enterprises
    else if (/livestock|equipment|enterprise|animal|crop|flock|target|resource|inventory/.test(k)) {
      // Split on commas NOT inside parentheses
      const items: string[] = [];
      let current = "";
      let depth = 0;
      for (const ch of v) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) {
          if (current.trim()) items.push(current.trim());
          current = "";
          continue;
        }
        current += ch;
      }
      if (current.trim()) items.push(current.trim());

      items.forEach((item) => {
        // Try to split "Rabbits (3 does, 1 buck)" into name + detail
        const parenMatch = item.match(/^(.+?)\s*\((.+)\)$/);
        if (parenMatch) {
          result.resources.push({
            name: parenMatch[1].trim(),
            detail: parenMatch[2].trim(),
            category: getCategoryKey(item),
          });
        } else {
          result.resources.push({
            name: item.length > 20 ? item.slice(0, 20) + "..." : item,
            detail: undefined,
            category: getCategoryKey(item),
          });
        }
      });
    }
    // Sales channel
    else if (/sales|channel|market/.test(k)) {
      result.resources.push({ name: v, category: "money" });
    }
    // Schedule/routine → skip for now (shown in behaviors)
    else if (/schedule|routine|timing|daily|weekly|morning/.test(k)) {
      // Not shown in visual context — behaviors handle this
    }
    // WHY — goals
    else if (/goal|motivation|purpose|vision|income|replace|quit/.test(k)) {
      const goals = v.split(/[.;]/).map((s) => s.trim()).filter((s) => s.length > 3);
      result.why.push(...goals);
    }
    // Approach/aspiration context — add to resources
    else if (/approach|aspiration/.test(k)) {
      result.resources.push({ name: v, detail: undefined, category: getCategoryKey(v) });
    }
    // Skip generic keys like "cooking_nights", "household_size" (already handled)
  }

  // Build land summary with location if not yet included
  if (result.land && !result.land.summary.includes(result.where) && result.where) {
    result.land.summary = result.land.summary + ` \u00b7 ${result.where}`;
  }

  // Default avatar if we have a who but no people parsed
  if (result.people.length === 0 && result.who) {
    result.people = [{ initials: "?" }];
  }

  // Cap resources
  if (result.resources.length > 6) {
    result.resources = result.resources.slice(0, 6);
  }

  return result;
}

// ─── Visual Context Card ────────────────────────────────────────────────────

function IdentityBar({ people, who, where }: { people: { initials: string }[]; who: string; where: string }) {
  if (!who && !where && people.length === 0) {
    return (
      <div className="font-sans" style={{ fontSize: 13, color: "#A8A196", marginBottom: 16 }}>
        Tell HUMA who you are...
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ display: "flex" }}>
        {people.map((person, i) => (
          <div
            key={i}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#E0EDE1",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 500, color: "#3A5A40",
              border: "2px solid #FAF8F3",
              marginLeft: i > 0 ? -8 : 0,
              zIndex: people.length - i,
              position: "relative",
            }}
          >
            {person.initials}
          </div>
        ))}
      </div>
      <div>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: "#1A1714" }}>
          {who}
        </div>
        {where && (
          <div className="font-sans" style={{ fontSize: 12, color: "#A8A196" }}>
            {where}
          </div>
        )}
      </div>
    </div>
  );
}

function LandCard({ land }: { land: { summary: string; breakdown: { amount: string; label: string }[] } }) {
  return (
    <div style={{ background: "#E0EDE1", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: land.breakdown.length > 0 ? 10 : 0 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#3A5A40" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 2c-3.3 0-6 2.7-6 6 0 4.5 6 10.5 6 10.5s6-6 6-10.5c0-3.3-2.7-6-6-6z" />
          <circle cx="10" cy="8" r="2" />
        </svg>
        <span className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: "#1E3622" }}>
          {land.summary}
        </span>
      </div>
      {land.breakdown.length > 0 && (
        <div style={{ display: "flex", gap: 8 }}>
          {land.breakdown.map((area, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "#C4D9C6",
                borderRadius: 8, padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div className="font-sans" style={{ fontSize: 18, fontWeight: 500, color: "#1E3622" }}>
                {area.amount}
              </div>
              <div className="font-sans" style={{ fontSize: 10, fontWeight: 500, color: "#3A5A40", letterSpacing: "0.08em" }}>
                {area.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceGrid({ resources }: { resources: { name: string; detail?: string; category: string }[] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        className="font-sans"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#8BAF8E", marginBottom: 8 }}
      >
        WHAT YOU&apos;RE WORKING WITH
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {resources.map((resource, i) => {
          const Icon = categoryIcons[resource.category] || categoryIcons.default;
          return (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #DDD4C0",
                borderRadius: 12, padding: 10,
                textAlign: "center",
              }}
            >
              <div style={{ margin: "0 auto 4px", width: 28, height: 28 }}>
                <Icon />
              </div>
              <div className="font-sans" style={{ fontSize: 11, fontWeight: 500, color: "#2A2520" }}>
                {resource.name}
              </div>
              {resource.detail && (
                <div className="font-sans" style={{ fontSize: 10, color: "#A8A196" }}>
                  {resource.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WhyQuote({ statements }: { statements: string[] }) {
  return (
    <div style={{ padding: 16, background: "white", border: "1px solid #DDD4C0", borderRadius: 12 }}>
      <div
        className="font-serif"
        style={{ fontSize: 18, fontWeight: 400, color: "#1A1714", lineHeight: 1.4, textAlign: "center" }}
      >
        {statements.map((s, i) => (
          <span key={i}>
            {s.endsWith(".") ? s : `${s}.`}
            {i < statements.length - 1 ? <br /> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function VisualContext({ knownContext, onEdit }: { knownContext: Record<string, unknown>; onEdit: () => void }) {
  const parsed = parseContextVisually(knownContext);
  const hasAny = parsed.people.length > 0 || parsed.land !== null || parsed.resources.length > 0 || parsed.why.length > 0;

  return (
    <div style={{ margin: "20px 24px 0", background: "#F6F1E9", borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span
          className="font-sans"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: "#A8A196" }}
        >
          YOUR CONTEXT
        </span>
        {hasAny && (
          <button
            onClick={onEdit}
            className="font-sans cursor-pointer hover:opacity-70 transition-opacity"
            style={{ fontSize: 12, fontWeight: 500, color: "#8BAF8E", background: "none", border: "none", padding: 0 }}
          >
            edit
          </button>
        )}
      </div>

      {hasAny ? (
        <>
          <IdentityBar people={parsed.people} who={parsed.who} where={parsed.where} />
          {parsed.land && <LandCard land={parsed.land} />}
          {parsed.resources.length > 0 && <ResourceGrid resources={parsed.resources} />}
          {parsed.why.length > 0 && <WhyQuote statements={parsed.why} />}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div className="font-serif" style={{ fontSize: 16, color: "#3A342C" }}>
            Tell HUMA about yourself.
          </div>
          <div className="font-sans" style={{ fontSize: 12, color: "#A8A196", marginTop: 4 }}>
            Context builds through conversation.
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for other pages (chat context card, etc.)
function HumaKnowsCard({
  context,
  compact = false,
}: {
  context: Record<string, unknown>;
  compact?: boolean;
}) {
  const entries = Object.entries(context).filter(([, v]) => v !== null && v !== undefined && v !== "");

  if (entries.length === 0) return null;

  const factString = entries
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const val = Array.isArray(v) ? v.join(", ") : String(v);
      return `${label}: ${val}`;
    })
    .join(" \u00b7 ");

  if (compact) {
    return (
      <div className="mx-6 mt-5 p-3 rounded-xl" style={{ background: "var(--color-sand-100)", borderRadius: "12px" }}>
        <p className="font-sans text-[13px] text-ink-500 leading-relaxed">
          {factString}
          <Link href="/system" className="ml-2 font-sans text-xs font-medium text-sage-500">
            see all &rarr;
          </Link>
        </p>
      </div>
    );
  }

  return <VisualContext knownContext={context} onEdit={() => {}} />;
}

// ─── System Page ─────────────────────────────────────────────────────────────

export default function SystemPage() {
  const { user } = useAuth();
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [weekCounts, setWeekCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>("body");
  const [conversationSheetOpen, setConversationSheetOpen] = useState(false);
  const [conversationInitialMsg, setConversationInitialMsg] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      let asps: Aspiration[] = [];
      let ctx: Record<string, unknown> = {};

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbAsps, dbCtx, counts] = await Promise.all([
              getAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
              getBehaviorWeekCounts(supabase, user.id),
            ]);
            asps = dbAsps;
            ctx = dbCtx;
            setWeekCounts(counts);
          } catch { /* fall through */ }
        }
      }

      if (asps.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-aspirations");
          if (saved) asps = JSON.parse(saved);
          const savedCtx = localStorage.getItem("huma-v2-known-context");
          if (savedCtx) ctx = JSON.parse(savedCtx);
        } catch { /* fresh */ }
      }

      setAspirations(asps);
      setKnownContext(ctx);
      setLoaded(true);
    }
    load();
  }, [user]);

  // Find shared behaviors across aspirations
  const sharedBehaviors: Array<{ name: string; aspirations: string[]; dimensionCount: number }> = [];
  if (aspirations.length > 1) {
    const behaviorMap = new Map<string, { aspirations: Set<string>; dims: Set<string> }>();
    for (const asp of aspirations) {
      for (const b of asp.behaviors) {
        const key = b.text.toLowerCase().trim();
        if (!behaviorMap.has(key)) behaviorMap.set(key, { aspirations: new Set(), dims: new Set() });
        behaviorMap.get(key)!.aspirations.add(asp.clarifiedText || asp.rawText);
        for (const d of b.dimensions || []) {
          const dimKey = typeof d === "string" ? d : d.dimension;
          behaviorMap.get(key)!.dims.add(dimKey);
        }
      }
    }
    for (const [name, data] of behaviorMap) {
      if (data.aspirations.size > 1) {
        sharedBehaviors.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          aspirations: [...data.aspirations],
          dimensionCount: data.dims.size,
        });
      }
    }
  }

  // Filter palette by dimension
  const filteredPalette = paletteConcepts.filter(c =>
    c.primaryDimensions.includes(selectedDimension)
  );

  // Exclude concepts overlapping with existing aspirations
  const existingTexts = aspirations.map(a => (a.clarifiedText || a.rawText).toLowerCase());
  const displayPalette = filteredPalette.filter(c =>
    !existingTexts.some(t => t.includes(c.text.toLowerCase()) || c.text.toLowerCase().includes(t))
  );

  const openConversationWith = (text?: string) => {
    setConversationInitialMsg(text);
    setConversationSheetOpen(true);
  };

  return (
    <div className="min-h-dvh bg-sand-50" style={{ paddingBottom: "120px" }}>
      {/* Header */}
      <div className="px-6" style={{ paddingTop: "20px" }}>
        <span
          className="font-sans font-medium text-sage-500"
          style={{ fontSize: "11px", letterSpacing: "0.4em", lineHeight: "1" }}
        >
          HUMA
        </span>
        <p className="font-serif text-ink-900" style={{ fontSize: "22px", lineHeight: "1.2", marginTop: "12px" }}>
          Your system
        </p>
      </div>

      {/* Content */}
      {!loaded ? (
        <div className="flex items-center justify-center h-64">
          <span
            className="rounded-full animate-dot-pulse"
            style={{ width: "8px", height: "8px", background: "var(--color-sage-400)" }}
          />
        </div>
      ) : aspirations.length === 0 ? (
        <>
          {/* Empty state */}
          <div className="bg-white border border-sand-300 text-center" style={{ margin: "20px 24px 0", borderRadius: "16px", padding: "32px 24px" }}>
            <p className="font-serif text-ink-700" style={{ fontSize: "22px", lineHeight: "1.3" }}>
              Your system starts with what you want.
            </p>
            <p className="font-sans font-light text-ink-500 mx-auto" style={{ fontSize: "14px", lineHeight: "1.6", marginTop: "8px", maxWidth: "280px" }}>
              Tell HUMA what&apos;s on your mind and watch your life system take shape.
            </p>
            <Link
              href="/start"
              className="inline-block rounded-full font-sans font-medium text-white transition-colors"
              style={{ background: "var(--color-amber-600)", padding: "14px 36px", fontSize: "14px", marginTop: "24px" }}
            >
              Talk to HUMA
            </Link>
          </div>

          <PaletteSection
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            items={displayPalette}
            onItemTap={(text) => openConversationWith(text)}
          />
        </>
      ) : (
        <>
          {/* Aspiration cards with connection indicators */}
          <div style={{ marginTop: "20px" }}>
            {aspirations.map((asp, idx) => (
              <div key={asp.id} className={`animate-entrance-${Math.min(idx + 1, 5)}`}>
                {idx > 0 && (() => {
                  const shared = sharedBehaviors.find(s =>
                    s.aspirations.includes(asp.clarifiedText || asp.rawText)
                  );
                  if (shared) {
                    return (
                      <ConnectionIndicator
                        sharedBehavior={shared.name}
                        dimensionCount={shared.dimensionCount}
                      />
                    );
                  }
                  return <div style={{ height: "8px" }} />;
                })()}

                <div className="mx-6">
                  <AspirationCard aspiration={asp} weekCounts={weekCounts} defaultExpanded={idx === 0 || aspirations.length === 1} />
                </div>
              </div>
            ))}
          </div>

          {/* Visual context card */}
          <VisualContext knownContext={knownContext} onEdit={() => openConversationWith()} />

          {/* Add aspiration button */}
          <div className="text-center" style={{ marginTop: "16px" }}>
            <button
              onClick={() => openConversationWith("I also want to ")}
              className="inline-flex items-center gap-1.5 rounded-full font-sans font-medium text-sage-700 cursor-pointer hover:bg-sage-50 transition-colors"
              style={{ padding: "10px 20px", fontSize: "14px", border: "1.5px solid var(--color-sage-300)" }}
            >
              + Add aspiration
            </button>
          </div>

          {/* Palette */}
          <PaletteSection
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            items={displayPalette}
            onItemTap={(text) => openConversationWith(text)}
          />
        </>
      )}

      {/* Conversation Sheet */}
      <ConversationSheet
        open={conversationSheetOpen}
        onClose={() => {
          setConversationSheetOpen(false);
          setConversationInitialMsg(undefined);
        }}
        initialMessage={conversationInitialMsg}
        knownContext={knownContext}
        aspirations={aspirations}
        onContextUpdate={(ctx) => {
          setKnownContext(ctx);
          localStorage.setItem("huma-v2-known-context", JSON.stringify(ctx));
        }}
        onAspirationAdded={(asp) => {
          setAspirations(prev => [...prev, asp]);
          localStorage.setItem("huma-v2-aspirations", JSON.stringify([...aspirations, asp]));
        }}
      />
    </div>
  );
}

// ─── Palette Section ─────────────────────────────────────────────────────────

function PaletteSection({
  selectedDimension,
  onDimensionChange,
  items,
  onItemTap,
}: {
  selectedDimension: DimensionKey;
  onDimensionChange: (d: DimensionKey) => void;
  items: Array<{ id: string; text: string }>;
  onItemTap: (text: string) => void;
}) {
  return (
    <div className="mx-6" style={{ marginTop: "24px" }}>
      <p
        className="font-sans text-ink-300"
        style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em", lineHeight: "1" }}
      >
        BROWSE BY DIMENSION
      </p>

      {/* Dimension filter pills */}
      <div className="flex flex-wrap" style={{ gap: "6px", marginTop: "12px", marginBottom: "14px" }}>
        {ALL_DIMENSIONS.map(dim => (
          <button
            key={dim}
            onClick={() => onDimensionChange(dim)}
            className="rounded-full font-sans font-medium cursor-pointer transition-colors"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: selectedDimension === dim ? "var(--color-sage-700)" : "transparent",
              color: selectedDimension === dim ? "white" : "var(--color-ink-500)",
              border: selectedDimension === dim ? "1.5px solid var(--color-sage-700)" : "1px solid var(--color-sand-300)",
            }}
          >
            {DIMENSION_LABELS[dim]}
          </button>
        ))}
      </div>

      {/* Palette items */}
      <div className="flex flex-wrap" style={{ gap: "8px" }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onItemTap(item.text)}
            className="rounded-full font-sans font-medium cursor-pointer transition-all active:scale-95"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              background: "var(--color-sand-200)",
              border: "1px solid var(--color-sand-300)",
              color: "var(--color-ink-600)",
            }}
          >
            {item.text}
          </button>
        ))}
        {items.length === 0 && (
          <p className="font-sans text-ink-300" style={{ fontSize: "12px" }}>No suggestions for this dimension.</p>
        )}
      </div>
    </div>
  );
}

export { HumaKnowsCard };
