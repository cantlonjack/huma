"use client";

import { motion } from "framer-motion";
import TripleInput from "../TripleInput";
import type { CardOption } from "../TripleInput";
import { HUMA_EASE } from "@/lib/constants";

export const GOOD_CARDS: CardOption[] = [
  { id: "fixing", label: "Fixing things", icon: "🔧" },
  { id: "organizing", label: "Organizing", icon: "📋" },
  { id: "listening", label: "Listening", icon: "👂" },
  { id: "growing", label: "Growing things", icon: "🌱" },
  { id: "explaining", label: "Explaining", icon: "💡" },
  { id: "physical", label: "Physical work", icon: "💪" },
  { id: "cooking", label: "Cooking", icon: "🍳" },
  { id: "systems", label: "Systems", icon: "⚙️" },
  { id: "creative", label: "Creative work", icon: "🎨" },
  { id: "leading", label: "Leading", icon: "🧭" },
  { id: "healing", label: "Healing", icon: "🌿" },
  { id: "numbers", label: "Numbers", icon: "📊" },
];

interface Props {
  entries: string[];
  selectedCards: string[];
  onAddEntry: (text: string) => void;
  onRemoveEntry: (index: number) => void;
  onToggleCard: (id: string) => void;
  onNext: () => void;
}

export default function GoodScreen({
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
        question="What do people ask you for help with?"
        subQuestion="What comes naturally to you?"
        cards={GOOD_CARDS}
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
