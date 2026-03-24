"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import RegenerativeFlower from "@/components/lotus/RegenerativeFlower";
import CapitalSlider from "@/components/lotus/CapitalSlider";
import { HUMA_EASE } from "@/lib/constants";
import {
  CAPITAL_ORDER,
  CAPITAL_LABELS,
  CAPITAL_DISPLAY_NAMES,
  CAPITAL_COLORS,
  LOTUS_PHASE_LABELS,
} from "@/types/lotus";
import type { OperatorContext, LotusPhase, CapitalKey } from "@/types/lotus";
import { computeArchetype } from "@/engine/archetype";

interface PetalViewProps {
  petal: LotusPhase;
  context: OperatorContext;
  onBack: () => void;
  onEdit: (field: string, value: unknown) => void;
}

// ─── Editable row ────────────────────────────────────────────────────────────

function EditableRow({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = useCallback(() => {
    if (draft.trim() && draft !== value) {
      onSave(draft.trim());
    }
    setEditing(false);
  }, [draft, value, onSave]);

  return (
    <div
      className="flex items-center justify-between py-3 border-b border-sand-100 group"
      role="button"
      tabIndex={0}
      onClick={() => !editing && setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !editing) setEditing(true);
      }}
    >
      <span
        className="text-earth-500 text-sm"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        {label}
      </span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="text-right text-earth-700 text-sm bg-sand-100 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-sage-300"
          style={{ fontFamily: "var(--font-source-sans)", maxWidth: "60%" }}
        />
      ) : (
        <span
          className="text-earth-700 text-sm group-hover:text-sage-600 transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
}

// ─── Entity type labels ──────────────────────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  person: "Person",
  group: "Group",
  place: "Place",
  enterprise: "Enterprise",
};

const STAGE_LABELS: Record<string, string> = {
  starting: "Starting out",
  transition: "In transition",
  building: "Building",
  searching: "Searching",
};

// ─── Petal content views ─────────────────────────────────────────────────────

function WholePetalContent({
  context,
  onEdit,
}: {
  context: OperatorContext;
  onEdit: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-1">
      <EditableRow
        label="Name"
        value={context.name}
        onSave={(v) => onEdit("name", v)}
      />
      <EditableRow
        label="Type"
        value={ENTITY_LABELS[context.entityType] || context.entityType}
        onSave={(v) => {
          const key = Object.entries(ENTITY_LABELS).find(
            ([, label]) => label.toLowerCase() === v.toLowerCase()
          )?.[0];
          if (key) onEdit("entityType", key);
        }}
      />
      <EditableRow
        label="Stage"
        value={STAGE_LABELS[context.stage] || context.stage}
        onSave={(v) => {
          const key = Object.entries(STAGE_LABELS).find(
            ([, label]) => label.toLowerCase() === v.toLowerCase()
          )?.[0];
          if (key) onEdit("stage", key);
        }}
      />
      {context.location && (
        <EditableRow
          label="Location"
          value={context.location}
          onSave={(v) => onEdit("location", v)}
        />
      )}
    </div>
  );
}

function WhoPetalContent({
  context,
  onEdit,
}: {
  context: OperatorContext;
  onEdit: (field: string, value: unknown) => void;
}) {
  const gov = context.governance;
  return (
    <div>
      <p
        className="text-earth-500 text-sm mb-4"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        {gov.solo
          ? "You make decisions on your own."
          : `You share decisions with ${gov.people.length} ${gov.people.length === 1 ? "person" : "people"}.`}
      </p>
      {!gov.solo &&
        gov.people.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-sand-100"
          >
            <span
              className="text-earth-700 text-sm"
              style={{ fontFamily: "var(--font-source-sans)" }}
            >
              {p.name}
            </span>
            <span
              className="text-earth-400 text-xs capitalize"
              style={{ fontFamily: "var(--font-source-sans)" }}
            >
              {p.relationship}
            </span>
          </div>
        ))}
      <button
        className="mt-4 text-sage-600 text-sm hover:text-sage-500 transition-colors"
        style={{ fontFamily: "var(--font-source-sans)" }}
        onClick={() => {
          const toggled = {
            ...gov,
            solo: !gov.solo,
          };
          onEdit("governance", toggled);
        }}
      >
        {gov.solo ? "Add people" : "Switch to solo"}
      </button>
    </div>
  );
}

function WhatPetalContent({
  context,
  onEdit,
}: {
  context: OperatorContext;
  onEdit: (field: string, value: unknown) => void;
}) {
  const [editingCapital, setEditingCapital] = useState<CapitalKey | null>(null);

  const handleCapitalChange = useCallback(
    (key: CapitalKey, value: number) => {
      const updated = { ...context.capitals, [key]: value };
      onEdit("capitals", updated);

      // Recompute archetype if capitals change significantly
      const result = computeArchetype(updated, context.stage);
      if (result.archetype !== context.archetype) {
        onEdit("archetype", result.archetype);
        onEdit("archetypeDescription", result.description);
        onEdit("strengths", result.strengths);
        onEdit("growthAreas", result.growthAreas);
      }
    },
    [context, onEdit]
  );

  return (
    <div>
      {/* Flower at top */}
      <div className="flex justify-center mb-6">
        <RegenerativeFlower
          capitals={context.capitals}
          size={220}
          animate={false}
        />
      </div>

      {/* Archetype badge */}
      {context.archetype && (
        <div className="text-center mb-6">
          <span
            className="inline-block px-3 py-1 rounded-full bg-sage-50 text-sage-700 text-xs"
            style={{
              fontFamily: "var(--font-source-sans)",
              fontWeight: 500,
            }}
          >
            {context.archetype}
          </span>
        </div>
      )}

      {/* Capital rows */}
      <div className="space-y-0.5">
        {CAPITAL_ORDER.map((key) => {
          const value = context.capitals[key] || 0;
          const displayName = CAPITAL_DISPLAY_NAMES[key];
          const color = CAPITAL_COLORS[key];

          if (editingCapital === key) {
            return (
              <div key={key} className="py-3">
                <CapitalSlider
                  capitalKey={key}
                  label={CAPITAL_LABELS[key]}
                  value={value}
                  onChange={(_k, v) => handleCapitalChange(key, v)}
                />
                <button
                  className="mt-2 text-xs text-earth-400 hover:text-earth-600"
                  style={{ fontFamily: "var(--font-source-sans)" }}
                  onClick={() => setEditingCapital(null)}
                >
                  Done
                </button>
              </div>
            );
          }

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 border-b border-sand-100 cursor-pointer hover:bg-sand-50 transition-colors rounded"
              role="button"
              tabIndex={0}
              onClick={() => setEditingCapital(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingCapital(key);
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="text-earth-600 text-sm"
                  style={{ fontFamily: "var(--font-source-sans)" }}
                >
                  {displayName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Mini bar */}
                <div className="w-16 h-1.5 rounded-full bg-sand-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(value / 10) * 100}%`,
                      backgroundColor: color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span
                  className="text-earth-400 text-xs w-4 text-right"
                  style={{ fontFamily: "var(--font-source-sans)" }}
                >
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Context (Ikigai) petal content ──────────────────────────────────────────

const IKIGAI_CARD_LABELS: Record<string, string> = {
  growing: "Growing things", building: "Building", people: "People",
  learning: "Learning", creating: "Creating", "problem-solving": "Problem-solving",
  movement: "Movement", cooking: "Cooking", animals: "Animals",
  music: "Music", nature: "Nature", teaching: "Teaching",
  fixing: "Fixing things", organizing: "Organizing", listening: "Listening",
  explaining: "Explaining", physical: "Physical work", systems: "Systems",
  creative: "Creative work", leading: "Leading", healing: "Healing",
  numbers: "Numbers", "local-food": "Local food", "clean-water": "Clean water",
  community: "Community", youth: "Youth", "soil-health": "Soil health",
  economic: "Economic resilience", "mental-health": "Mental health",
  housing: "Housing", education: "Education", biodiversity: "Biodiversity",
  energy: "Energy", culture: "Culture",
};

function ContextPetalContent({
  context,
}: {
  context: OperatorContext;
  onEdit: (field: string, value: unknown) => void;
}) {
  const ikigai = context.ikigai;
  if (!ikigai) {
    return (
      <p
        className="text-earth-400 text-sm text-center py-12"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        Complete the Context flow to see your Ikigai here.
      </p>
    );
  }

  const sections = [
    { title: "Love", items: ikigai.love, cards: ikigai.loveCards, color: "#C5D86D" },
    { title: "Good at", items: ikigai.good, cards: ikigai.goodCards, color: "#5C7A62" },
    { title: "World needs", items: ikigai.need, cards: ikigai.needCards, color: "#2E6B8A" },
  ];

  return (
    <div className="space-y-6">
      {/* Synthesis */}
      {ikigai.synthesis && (
        <div className="mb-6">
          <p
            className="text-earth-700 leading-relaxed"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.05rem",
            }}
          >
            {ikigai.synthesis}
          </p>
        </div>
      )}

      {/* Sections */}
      {sections.map(({ title, items, cards, color }) => {
        const allItems = [
          ...(items || []),
          ...(cards || []).map((id) => IKIGAI_CARD_LABELS[id] || id),
        ];
        if (allItems.length === 0) return null;
        return (
          <div key={title}>
            <h3
              className="text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-source-sans)", color }}
            >
              {title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {allItems.map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="px-2.5 py-1 rounded-full bg-sand-100 text-earth-600 text-xs"
                  style={{ fontFamily: "var(--font-source-sans)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main PetalView ──────────────────────────────────────────────────────────

export default function PetalView({
  petal,
  context,
  onBack,
  onEdit,
}: PetalViewProps) {
  const label = LOTUS_PHASE_LABELS[petal] || petal;

  return (
    <motion.div
      className="w-full max-w-lg mx-auto md:max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: HUMA_EASE }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sand-100 transition-colors"
          aria-label="Back to workspace"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M11 4L6 9L11 14"
              stroke="#6B6358"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2
          className="text-earth-700"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.3rem",
            fontWeight: 500,
          }}
        >
          {label}
        </h2>
      </div>

      {/* Content by petal type */}
      {petal === "whole" && (
        <WholePetalContent context={context} onEdit={onEdit} />
      )}
      {petal === "who" && (
        <WhoPetalContent context={context} onEdit={onEdit} />
      )}
      {petal === "what" && (
        <WhatPetalContent context={context} onEdit={onEdit} />
      )}

      {petal === "context" && (
        <ContextPetalContent context={context} onEdit={onEdit} />
      )}

      {/* For petals we don't have content views for yet */}
      {!["whole", "who", "what", "context"].includes(petal) && (
        <p
          className="text-earth-400 text-sm text-center py-12"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          This petal is coming soon.
        </p>
      )}
    </motion.div>
  );
}
