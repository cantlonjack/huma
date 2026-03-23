"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LotusState, LotusAction, EntityType } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onNext: () => void;
}

const ENTITY_TYPES: { type: EntityType; label: string; available: boolean }[] = [
  { type: "person", label: "Person", available: true },
  { type: "group", label: "Group", available: false },
  { type: "place", label: "Place", available: false },
  { type: "enterprise", label: "Enterprise", available: false },
];

/** Organic SVG icons for entity types — HUMA illustration style */
function EntityIcon({ type, selected }: { type: EntityType; selected: boolean }) {
  const color = selected ? "#3A5A40" : "#6B6358";
  const size = 40;

  switch (type) {
    case "person":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          {/* Organic person — head + flowing body */}
          <circle cx="20" cy="13" r="5.5" stroke={color} strokeWidth="1.4" fill="none" />
          <path
            d="M10 33 C10 25, 14 21, 20 21 C26 21, 30 25, 30 33"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "group":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          {/* Two overlapping figures */}
          <circle cx="15" cy="13" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
          <circle cx="25" cy="13" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
          <path
            d="M6 33 C6 26, 10 22, 15 22 C18 22, 20 23, 20 25"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M34 33 C34 26, 30 22, 25 22 C22 22, 20 23, 20 25"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "place":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          {/* Organic landscape — rolling hills */}
          <path
            d="M4 30 C8 22, 14 18, 20 20 C26 22, 32 16, 36 20 L36 34 L4 34 Z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="28" cy="12" r="4" stroke={color} strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "enterprise":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
          {/* Organic building blocks — stacked components */}
          <rect x="8" y="22" width="24" height="12" rx="3" stroke={color} strokeWidth="1.3" fill="none" />
          <rect x="12" y="12" width="16" height="12" rx="3" stroke={color} strokeWidth="1.3" fill="none" />
          <rect x="16" y="5" width="8" height="9" rx="2" stroke={color} strokeWidth="1.2" fill="none" />
        </svg>
      );
  }
}

export default function NameEntityScreen({ state, dispatch, onNext }: ScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const name = state.context.name || "";
  const selectedType = state.context.entityType;
  const canContinue = name.trim().length > 0 && selectedType != null;

  // Auto-focus name input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Clear toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleEntitySelect(type: EntityType, available: boolean) {
    if (!available) {
      setToast("Coming soon. Start as a Person — you can add your group later.");
      dispatch({ type: "SET_ENTITY_TYPE", entityType: "person" });
      return;
    }
    dispatch({ type: "SET_ENTITY_TYPE", entityType: type });
  }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Name input */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        <h2
          className="text-2xl md:text-3xl text-center text-[#1A1714]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          What should we call you?
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => dispatch({ type: "SET_NAME", name: e.target.value })}
          placeholder="First name is enough"
          className="w-full max-w-xs text-center text-xl bg-transparent border-b-2 border-[#D4CBBA] focus:border-[#5C7A62] outline-none py-3 text-[#1A1714] placeholder:text-[#C4BAA8] transition-colors duration-300"
          style={{ fontFamily: "var(--font-cormorant)" }}
          autoComplete="given-name"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canContinue) onNext();
          }}
        />
      </div>

      {/* Entity type selection */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <h3
          className="text-lg text-center text-[#3D3830]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Who or What are you?
        </h3>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {ENTITY_TYPES.map(({ type, label, available }) => {
            const isSelected = selectedType === type;
            return (
              <motion.button
                key={type}
                onClick={() => handleEntitySelect(type, available)}
                whileTap={{ scale: 0.97 }}
                animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2, ease: HUMA_EASE }}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                  border transition-colors duration-200 min-h-[100px]
                  ${isSelected
                    ? "bg-[#EBF3EC] border-[#5C7A62]"
                    : "bg-white border-[#D4CBBA] hover:border-[#A89E90]"
                  }
                  ${!available ? "opacity-70" : ""}
                `}
                aria-label={`${label}${!available ? " (coming soon)" : ""}${isSelected ? " (selected)" : ""}`}
              >
                <EntityIcon type={type} selected={isSelected} />
                <span
                  className="text-sm font-medium text-[#3D3830]"
                  style={{ fontFamily: "var(--font-source-sans)" }}
                >
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="text-sm text-[#6B6358] text-center max-w-sm px-4 py-2 rounded-lg bg-white border border-[#EDE6D8]"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          {toast}
        </motion.div>
      )}

      {/* Continue */}
      <motion.button
        onClick={onNext}
        disabled={!canContinue}
        initial={{ opacity: 0 }}
        animate={{ opacity: canContinue ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
        className="px-9 py-4 rounded-full bg-[#B5621E] text-white font-medium shadow-[0_4px_20px_rgba(181,98,30,0.15)] hover:bg-[#C87A3A] hover:-translate-y-0.5 transition-all duration-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-[#B5621E]"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        Continue
      </motion.button>
    </div>
  );
}
