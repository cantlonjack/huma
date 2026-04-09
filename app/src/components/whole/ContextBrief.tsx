"use client";

import { useMemo } from "react";
import type { KnownContext, KnownContextPerson, Aspiration, DimensionKey } from "@/types/v2";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContextBriefProps {
  context: KnownContext;
  aspirations: Aspiration[];
  whyStatement: string | null;
  archetypes: string[];
  operatorName: string;
  onTellMore: (dimension: DimensionKey) => void;
}

// ─── Dimension data extraction ──────────────────────────────────────────────

interface DimensionSection {
  key: DimensionKey;
  label: string;
  prose: string | null;
  aspirationNames: string[];
  isSparse: boolean;
}

function buildPeopleProse(people?: KnownContextPerson[] | unknown): string | null {
  if (!Array.isArray(people)) return typeof people === "string" ? people : null;
  const named = people.filter((p) => p.name) || [];
  if (named.length === 0) return null;

  if (named.length === 1) {
    const p = named[0];
    return p.role
      ? `${p.name} (${p.role}) is part of your world.`
      : `${p.name} is part of your world.`;
  }

  const parts = named.map((p) =>
    p.role ? `${p.name} (${p.role})` : p.name
  );

  if (parts.length === 2) {
    return `Your people include ${parts[0]} and ${parts[1]}.`;
  }

  const last = parts.pop();
  return `Your people include ${parts.join(", ")}, and ${last}.`;
}

function buildHomeProse(
  place?: { name: string; detail: string },
  resources?: string[],
): string | null {
  const parts: string[] = [];

  if (place?.name) {
    parts.push(
      place.detail
        ? `You're in ${place.name} — ${place.detail}`
        : `You're in ${place.name}`
    );
  }

  const namedResources = resources?.filter(Boolean) || [];
  if (namedResources.length > 0) {
    if (namedResources.length <= 3) {
      parts.push(`You have ${namedResources.join(", ")}`);
    } else {
      const shown = namedResources.slice(0, 3);
      parts.push(`You have ${shown.join(", ")}, and ${namedResources.length - 3} more`);
    }
  }

  if (parts.length === 0) return null;
  return parts.join(". ") + ".";
}

function buildBodyProse(health?: { detail: string }): string | null {
  if (!health?.detail) return null;
  return health.detail.endsWith(".") ? health.detail : `${health.detail}.`;
}

function buildMoneyProse(financial?: KnownContext["financial"]): string | null {
  if (!financial) return null;
  const parts: string[] = [];
  if (financial.situation) parts.push(financial.situation);
  if (financial.income) parts.push(financial.income);
  if (financial.rhythm) parts.push(financial.rhythm);
  if (financial.constraints && financial.constraints.length > 0) {
    parts.push(`Constraints: ${financial.constraints.join(", ")}`);
  }
  if (parts.length === 0) return null;
  const text = parts.join(". ");
  return text.endsWith(".") ? text : `${text}.`;
}

function buildIdentityProse(
  work?: { title: string; detail: string },
  stage?: { label: string; detail: string },
  archetypes?: string[],
): string | null {
  const parts: string[] = [];

  if (work?.title) {
    parts.push(
      work.detail ? `${work.title} — ${work.detail}` : work.title
    );
  }

  if (stage?.label) {
    parts.push(
      stage.detail ? `${stage.label}: ${stage.detail}` : stage.label
    );
  }

  if (archetypes && archetypes.length > 0) {
    parts.push(archetypes.join(" · "));
  }

  if (parts.length === 0) return null;
  const text = parts.join(". ");
  return text.endsWith(".") ? text : `${text}.`;
}

function buildTimeProse(time?: { detail: string }): string | null {
  if (!time?.detail) return null;
  return time.detail.endsWith(".") ? time.detail : `${time.detail}.`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ContextBrief({
  context,
  aspirations,
  whyStatement,
  archetypes,
  operatorName,
  onTellMore,
}: ContextBriefProps) {
  const sections = useMemo<DimensionSection[]>(() => {
    const activeAspirations = aspirations.filter(
      (a) => a.status === "active" || a.status === "paused"
    );

    function aspirationsForDim(dim: DimensionKey): string[] {
      return activeAspirations
        .filter((a) => a.dimensionsTouched?.includes(dim))
        .map((a) => a.title || a.clarifiedText || a.rawText);
    }

    const dims: DimensionSection[] = [
      {
        key: "body",
        label: DIMENSION_LABELS.body,
        prose: buildBodyProse(context.health),
        aspirationNames: aspirationsForDim("body"),
        isSparse: !context.health?.detail,
      },
      {
        key: "people",
        label: DIMENSION_LABELS.people,
        prose: buildPeopleProse(context.people),
        aspirationNames: aspirationsForDim("people"),
        isSparse: !Array.isArray(context.people) || !context.people.some((p) => p.name),
      },
      {
        key: "money",
        label: DIMENSION_LABELS.money,
        prose: buildMoneyProse(context.financial),
        aspirationNames: aspirationsForDim("money"),
        isSparse: !context.financial?.situation && !context.financial?.income,
      },
      {
        key: "home",
        label: DIMENSION_LABELS.home,
        prose: buildHomeProse(context.place, context.resources),
        aspirationNames: aspirationsForDim("home"),
        isSparse: !context.place?.name && (!context.resources || context.resources.filter(Boolean).length === 0),
      },
      {
        key: "growth",
        label: DIMENSION_LABELS.growth,
        prose: null, // No direct context field — driven by aspirations
        aspirationNames: aspirationsForDim("growth"),
        isSparse: true,
      },
      {
        key: "joy",
        label: DIMENSION_LABELS.joy,
        prose: null, // No direct context field
        aspirationNames: aspirationsForDim("joy"),
        isSparse: true,
      },
      {
        key: "purpose",
        label: DIMENSION_LABELS.purpose,
        prose: whyStatement ? `Your north star: "${whyStatement}"` : null,
        aspirationNames: aspirationsForDim("purpose"),
        isSparse: !whyStatement,
      },
      {
        key: "identity",
        label: DIMENSION_LABELS.identity,
        prose: buildIdentityProse(context.work, context.stage, archetypes),
        aspirationNames: aspirationsForDim("identity"),
        isSparse:
          !context.work?.title &&
          !context.stage?.label &&
          (!archetypes || archetypes.length === 0),
      },
    ];

    // If a dimension has aspirations but no direct prose, it's not fully sparse
    for (const dim of dims) {
      if (dim.aspirationNames.length > 0 && !dim.prose) {
        dim.isSparse = false;
      }
    }

    return dims;
  }, [context, aspirations, whyStatement, archetypes]);

  // Separate strong vs sparse
  const strongDimensions = sections.filter((s) => !s.isSparse);
  const sparseDimensions = sections.filter((s) => s.isSparse);

  return (
    <div className="px-5">
      {/* WHY statement hero */}
      {whyStatement && (
        <div className="mb-6">
          <p className="font-serif text-xl text-earth-700 italic leading-snug">
            &ldquo;{whyStatement}&rdquo;
          </p>
          {operatorName && (
            <p className="font-sans text-xs text-sage-400 mt-1.5 tracking-wide">
              &mdash; {operatorName}
            </p>
          )}
        </div>
      )}

      {/* Strong dimensions */}
      {strongDimensions.length > 0 && (
        <div className="flex flex-col gap-5">
          {strongDimensions.map((section) => (
            <DimensionBlock
              key={section.key}
              section={section}
              onTellMore={onTellMore}
            />
          ))}
        </div>
      )}

      {/* Sparse dimensions */}
      {sparseDimensions.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {sparseDimensions.map((section) => (
            <SparseDimensionRow
              key={section.key}
              section={section}
              onTellMore={onTellMore}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dimension Block (Strong) ───────────────────────────────────────────────

function DimensionBlock({
  section,
  onTellMore,
}: {
  section: DimensionSection;
  onTellMore: (dim: DimensionKey) => void;
}) {
  const color = DIMENSION_COLORS[section.key];

  return (
    <div className="group">
      {/* Heading with dimension color dot */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <h3 className="font-sans font-medium text-[13px] tracking-[0.06em] uppercase text-earth-600 m-0">
          {section.label}
        </h3>
      </div>

      {/* Prose */}
      {section.prose && (
        <p className="font-serif text-[15px] leading-relaxed text-earth-700 ml-4 mb-0">
          {section.prose}
        </p>
      )}

      {/* Related aspirations */}
      {section.aspirationNames.length > 0 && (
        <div className="ml-4 mt-1.5 flex flex-wrap gap-1.5">
          {section.aspirationNames.map((name, i) => (
            <span
              key={i}
              className="font-sans text-[11px] text-sage-500 bg-sand-200 rounded-full px-2.5 py-0.5"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Tell HUMA more link */}
      <button
        onClick={() => onTellMore(section.key)}
        className="font-sans cursor-pointer text-[12px] text-sage-400 bg-transparent border-none p-0 ml-4 mt-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 underline underline-offset-2"
      >
        Tell HUMA more about your {section.label.toLowerCase()}
      </button>
    </div>
  );
}

// ─── Sparse Dimension Row ───────────────────────────────────────────────────

function SparseDimensionRow({
  section,
  onTellMore,
}: {
  section: DimensionSection;
  onTellMore: (dim: DimensionKey) => void;
}) {
  const color = DIMENSION_COLORS[section.key];

  return (
    <button
      onClick={() => onTellMore(section.key)}
      className="cursor-pointer flex items-center gap-2.5 py-2 px-3 bg-sand-100 border border-dashed border-sand-300 rounded-xl text-left w-full transition-colors duration-150 hover:bg-sand-200"
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0 opacity-40"
        style={{ backgroundColor: color }}
      />
      <span className="font-sans text-[13px] text-sage-400 italic">
        HUMA doesn&rsquo;t know much about your {section.label.toLowerCase()} yet
      </span>
    </button>
  );
}
