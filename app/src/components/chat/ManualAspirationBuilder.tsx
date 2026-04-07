"use client";

import { useState, useCallback } from "react";
import type { Aspiration, Behavior, DimensionKey } from "@/types/v2";

/** Keyword → dimension mapping for auto-assignment when no AI is available. */
const DIMENSION_KEYWORDS: Record<DimensionKey, string[]> = {
  body: ["exercise", "walk", "run", "sleep", "eat", "cook", "gym", "workout", "stretch", "yoga", "rest", "nutrition", "health"],
  people: ["family", "kids", "partner", "friend", "call", "visit", "community", "connect", "social", "date", "parent"],
  money: ["save", "budget", "earn", "spend", "debt", "invest", "pay", "financial", "income", "bill"],
  home: ["clean", "organize", "garden", "repair", "declutter", "cook", "plant", "laundry", "tidy"],
  growth: ["read", "learn", "study", "practice", "course", "write", "skill", "create", "build"],
  joy: ["play", "music", "draw", "paint", "hike", "nature", "relax", "fun", "hobby", "enjoy"],
  purpose: ["volunteer", "mentor", "contribute", "teach", "serve", "mission", "meaningful", "impact"],
  identity: ["journal", "reflect", "meditate", "ritual", "tradition", "culture", "values", "prayer"],
};

function inferDimensions(text: string): DimensionKey[] {
  const lower = text.toLowerCase();
  const dims: DimensionKey[] = [];
  for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      dims.push(dim as DimensionKey);
    }
  }
  return dims.slice(0, 3); // max 3
}

interface ManualAspirationBuilderProps {
  onSave: (aspiration: Aspiration) => void;
  onDismiss: () => void;
}

export default function ManualAspirationBuilder({ onSave, onDismiss }: ManualAspirationBuilderProps) {
  const [aspirationText, setAspirationText] = useState("");
  const [behaviorsText, setBehaviorsText] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "specific-days">("weekly");

  const handleSave = useCallback(() => {
    const trimmed = aspirationText.trim();
    if (!trimmed) return;

    const lines = behaviorsText
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    const behaviors: Behavior[] = lines.map((line, i) => {
      const dims = inferDimensions(line);
      return {
        key: `manual-${Date.now()}-${i}`,
        text: line,
        frequency,
        dimensions: dims.map(d => ({
          dimension: d,
          direction: "builds" as const,
          reasoning: "",
        })),
        enabled: true,
        source: "conversation" as const,
      };
    });

    const allDims = [...new Set(behaviors.flatMap(b => b.dimensions.map(d => d.dimension)))];

    const aspiration: Aspiration = {
      id: crypto.randomUUID(),
      rawText: trimmed,
      clarifiedText: trimmed,
      behaviors,
      dimensionsTouched: allDims,
      status: "active",
      stage: "active",
      source: "conversation",
    };

    onSave(aspiration);
  }, [aspirationText, behaviorsText, frequency, onSave]);

  const FREQ_OPTIONS: { value: typeof frequency; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "specific-days", label: "Specific days" },
  ];

  return (
    <div className="mx-1 mt-3 rounded-xl border border-sand-300 bg-white p-4 animate-[fade-in_300ms_ease-out]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[11px] font-semibold tracking-[0.14em] text-sage-400">
          BUILD IT YOURSELF
        </p>
        <button
          onClick={onDismiss}
          className="font-sans text-xs text-sage-300 cursor-pointer bg-transparent border-none"
          aria-label="Dismiss manual builder"
        >
          &times;
        </button>
      </div>

      {/* Aspiration input */}
      <label className="block mb-3">
        <span className="font-sans text-[13px] text-earth-500 mb-1 block">
          What are you trying to make work?
        </span>
        <input
          type="text"
          value={aspirationText}
          onChange={e => setAspirationText(e.target.value)}
          placeholder="e.g. Cook real food most nights"
          autoFocus
          className="w-full font-sans text-sm bg-sand-50 border border-sand-250 rounded-lg px-3 py-2.5 text-earth-650 placeholder:text-sage-300 focus:outline-none focus:border-sage-400"
        />
      </label>

      {/* Behaviors input */}
      <label className="block mb-3">
        <span className="font-sans text-[13px] text-earth-500 mb-1 block">
          2-3 things you&apos;d do this week (one per line)
        </span>
        <textarea
          value={behaviorsText}
          onChange={e => setBehaviorsText(e.target.value)}
          placeholder={"Prep ingredients Sunday evening\nCook dinner 4 nights\nBring lunch to work"}
          rows={3}
          className="w-full font-sans text-sm bg-sand-50 border border-sand-250 rounded-lg px-3 py-2.5 text-earth-650 placeholder:text-sage-300 focus:outline-none focus:border-sage-400 resize-none"
        />
      </label>

      {/* Frequency */}
      <div className="flex gap-2 mb-4">
        {FREQ_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFrequency(opt.value)}
            className={`font-sans text-[13px] px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
              frequency === opt.value
                ? "bg-sage-50 border-sage-400 text-sage-700"
                : "bg-transparent border-sand-250 text-sage-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!aspirationText.trim() || !behaviorsText.trim()}
        className="w-full font-sans text-sm font-medium py-2.5 rounded-xl cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-sage-700 text-white border-none"
      >
        Add aspiration
      </button>
    </div>
  );
}
