"use client";

import { motion } from "framer-motion";
import TripleInput from "../TripleInput";
import type { CardOption } from "../TripleInput";
import { HUMA_EASE } from "@/lib/constants";

export const NEED_CARDS: CardOption[] = [
  { id: "local-food", label: "Local food", icon: "🥕" },
  { id: "clean-water", label: "Clean water", icon: "💧" },
  { id: "community", label: "Community", icon: "🏘️" },
  { id: "youth", label: "Youth", icon: "👶" },
  { id: "soil-health", label: "Soil health", icon: "🌍" },
  { id: "economic", label: "Economic resilience", icon: "💰" },
  { id: "mental-health", label: "Mental health", icon: "🧠" },
  { id: "housing", label: "Housing", icon: "🏠" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "biodiversity", label: "Biodiversity", icon: "🦋" },
  { id: "energy", label: "Energy", icon: "⚡" },
  { id: "culture", label: "Culture", icon: "🎭" },
];

interface Props {
  entries: string[];
  selectedCards: string[];
  onAddEntry: (text: string) => void;
  onRemoveEntry: (index: number) => void;
  onToggleCard: (id: string) => void;
  onNext: () => void;
}

export default function NeedScreen({
  entries,
  selectedCards,
  onAddEntry,
  onRemoveEntry,
  onToggleCard,
  onNext,
}: Props) {
  const hasInput = entries.length > 0 || selectedCards.length > 0;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.5, ease: HUMA_EASE }}
    >
      <TripleInput
        question="What breaks your heart about the world?"
        subQuestion="What would you fix if you could?"
        cards={NEED_CARDS}
        entries={entries}
        selectedCards={selectedCards}
        onAddEntry={onAddEntry}
        onRemoveEntry={onRemoveEntry}
        onToggleCard={onToggleCard}
      />

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!hasInput}
          className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
            hasInput
              ? "bg-sage-600 text-white hover:bg-sage-700"
              : "bg-sand-200 text-earth-300 cursor-not-allowed"
          }`}
          style={{
            fontFamily: "var(--font-source-sans)",
            fontSize: "0.9rem",
            minHeight: 48,
          }}
        >
          Continue &rarr;
        </button>
      </div>
    </motion.div>
  );
}
