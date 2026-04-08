"use client";

import type { CanvasData, FieldLayer, NodalIntervention, ValidationCheck } from "@/engine/canvas-types";
import SpatialCanvas from "./SpatialCanvas";
import EnterpriseCards from "./EnterpriseCards";
import WeeklyRhythm from "./WeeklyRhythm";

// ── Inlined: RingLabel ──
function RingLabel({ label }: { label: string }) {
  return (
    <div className="relative text-center my-9">
      <span className="relative z-[1] inline-block bg-sand-50 px-5 font-sans text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-earth-400">
        {label}
      </span>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[240px] h-px bg-sand-300" />
    </div>
  );
}

// ── Inlined: FieldLayers ──
const CATEGORY_COLORS = {
  permanent: "bg-sage-900 text-sage-100",
  development: "bg-sage-600 text-sage-50",
  management: "bg-amber-700 text-amber-100",
} as const;

const STATUS_BADGE: Record<string, string> = {
  strong: "bg-white/[0.18]",
  adequate: "bg-white/10",
  "leverage-point": "bg-[rgba(255,200,100,0.25)] text-[#FFE0B0]",
  "needs-attention": "bg-white/[0.06]",
  unexplored: "bg-white/[0.04]",
};

const STATUS_LABELS: Record<string, string> = {
  strong: "Strong",
  adequate: "Adequate",
  "leverage-point": "\u2605 Leverage",
  "needs-attention": "Needs Attn",
  unexplored: "Unexplored",
};

function FieldLayersSection({ layers }: { layers: FieldLayer[] }) {
  return (
    <div className="w-full max-w-[760px] mx-auto">
      <div className="flex gap-[3px] rounded-md overflow-hidden max-sm:flex-wrap">
        {layers.map((layer) => (
          <div
            key={layer.name}
            className={`group flex-1 min-w-0 py-3.5 px-2 text-center relative cursor-default transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 max-sm:flex-none max-sm:w-[calc(33.33%-2px)] ${CATEGORY_COLORS[layer.category]}`}
          >
            <div className="font-sans text-[0.58rem] font-semibold tracking-[0.06em] uppercase opacity-85 mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {layer.name}
            </div>
            <span
              className={`inline-block font-sans text-[0.55rem] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[layer.status] || ""}`}
            >
              {STATUS_LABELS[layer.status] || layer.status}
            </span>
            <div className="hidden group-hover:block font-sans text-[0.65rem] font-light opacity-60 leading-[1.4] mt-1.5">
              {layer.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inlined: NodalActions ──
function NodalActionsSection({ interventions }: { interventions: NodalIntervention[] }) {
  return (
    <div className="w-full max-w-[760px] mx-auto flex flex-col gap-4">
      {interventions.map((nodal, i) => (
        <div
          key={i}
          className="relative bg-gradient-to-br from-sage-50 to-sand-100 border border-sage-200 rounded-lg p-6"
        >
          <div className="absolute -top-2.5 left-5 w-[22px] h-[22px] rounded-full bg-sage-700 text-white font-sans text-[0.65rem] font-semibold flex items-center justify-center">
            {i + 1}
          </div>
          <div className="flex items-baseline gap-3 mb-2 flex-wrap">
            <span className="font-serif text-[1.15rem] font-medium text-earth-900">
              {nodal.action}
            </span>
            <span className="font-sans text-[0.72rem] font-medium text-sage-600">
              {nodal.timing}
            </span>
          </div>
          <p className="font-sans text-[0.85rem] font-light text-earth-600 leading-[1.7] mb-4">
            {nodal.why}
          </p>
          <div className="flex flex-wrap items-center gap-[5px]">
            {nodal.cascade.map((step, j) => (
              <span key={j} className="contents">
                {j > 0 && (
                  <span className="text-sage-300 text-[0.75rem]">&rarr;</span>
                )}
                <span className="inline-flex items-center gap-1 px-[11px] py-1 bg-white border border-sage-200 rounded-full font-sans text-[0.68rem] font-medium text-sage-800 whitespace-nowrap">
                  <span>{step.emoji}</span>
                  {step.label}
                </span>
              </span>
            ))}
          </div>
          <p className="font-sans text-[0.78rem] font-light text-earth-500 italic leading-[1.6] pt-3 border-t border-sage-200 mt-3.5">
            Sets up: {nodal.setupFor}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Inlined: ValidationProtocol ──
const CARD_ACCENTS = [
  "border-l-sage-500",
  "border-l-amber-500",
  "border-l-sky",
  "border-l-rose",
  "border-l-gold",
  "border-l-lilac",
];

function ValidationProtocolSection({ checks }: { checks: ValidationCheck[] }) {
  return (
    <div className="w-full max-w-[760px] mx-auto">
      <p className="font-sans text-[0.85rem] font-light text-earth-500 leading-[1.6] italic mb-4 text-center max-w-[560px] mx-auto">
        These aren&apos;t goals to hit &mdash; they&apos;re signals to read. When a check comes back
        below target two weeks running, the question is always: what could change in the design?
      </p>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`bg-white border border-sand-200 border-l-[3px] ${CARD_ACCENTS[i % CARD_ACCENTS.length]} rounded-lg p-4 transition-all duration-300 hover:border-sage-300 hover:shadow-[0_2px_12px_rgba(58,90,64,0.06)]`}
          >
            <p className="font-serif text-[0.95rem] font-medium text-earth-900 leading-[1.3] mb-2">
              &ldquo;{check.qolStatement}&rdquo;
            </p>
            <div className="font-sans text-[0.75rem] text-earth-600 leading-[1.5] mb-1.5">
              <span className="font-semibold text-[0.65rem] tracking-[0.06em] uppercase text-sage-600 block mb-0.5">
                Weekly check
              </span>
              {check.question}
            </div>
            <div className="font-sans text-[0.75rem] text-earth-600 leading-[1.5] mb-1.5">
              <span className="font-semibold text-[0.65rem] tracking-[0.06em] uppercase text-sage-600 block mb-0.5">
                Target
              </span>
              {check.target}
            </div>
            <div className="font-sans text-[0.75rem] font-light text-earth-500 leading-[1.5] italic pt-2 border-t border-sand-200">
              {check.failureResponse}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inlined: CanvasClosing ──
function CanvasClosingSection({ closing, epigraph }: { closing?: string; epigraph?: string }) {
  return (
    <div className="text-center max-w-[520px] mx-auto mt-5 mb-16 pt-10">
      {epigraph && (
        <p className="font-serif text-[1rem] font-light italic text-earth-400 leading-[1.75] mb-6">
          &ldquo;{epigraph}&rdquo;
        </p>
      )}
      {closing && (
        <p className="font-serif text-[0.9rem] font-light italic text-earth-400 leading-[1.75] mb-6">
          {closing}
        </p>
      )}
      <p className="font-serif text-[0.8rem] italic text-earth-400 leading-[1.6] mb-4">
        This map is a beginning, not a blueprint.<br />
        The land will teach you things no tool can anticipate.<br />
        Trust the conversation between you and your place.
      </p>
      <div className="font-serif text-[0.7rem] font-medium tracking-[0.3em] uppercase text-sage-500 opacity-50">
        Generated by HUMA
      </div>
    </div>
  );
}

interface LivingCanvasProps {
  data: CanvasData;
}

export default function LivingCanvas({ data }: LivingCanvasProps) {
  return (
    <div className="canvas-container">
      {/* ── Spatial Zone (SVG, center-outward) ── */}
      <SpatialCanvas data={data} />

      {/* ── Detail Zone (HTML, scrolling) ── */}
      <div className="max-w-[840px] mx-auto px-6 py-8">
        {/* Landscape Layers */}
        <RingLabel label="Landscape Reading" />
        <FieldLayersSection layers={data.fieldLayers} />

        {/* Enterprise Cards */}
        <RingLabel label="Enterprise Stack" />
        <EnterpriseCards enterprises={data.enterprises} />

        {/* Nodal Interventions */}
        <RingLabel label="Nodal Interventions" />
        <NodalActionsSection interventions={data.nodalInterventions} />

        {/* Weekly Rhythm (optional — from Phase 6) */}
        {data.weeklyRhythm && (
          <>
            <RingLabel label="Weekly Rhythm" />
            <WeeklyRhythm rhythm={data.weeklyRhythm} />
          </>
        )}

        {/* Validation Protocol (optional — from Phase 6) */}
        {data.validationChecks && data.validationChecks.length > 0 && (
          <>
            <RingLabel label="Validation Protocol" />
            <ValidationProtocolSection checks={data.validationChecks} />
          </>
        )}

        {/* Closing */}
        <CanvasClosingSection closing={data.closing} epigraph={data.epigraph} />
      </div>
    </div>
  );
}
