"use client";

import { motion } from "framer-motion";
import TripleInput from "../TripleInput";
import type { CardOption } from "../TripleInput";
import { HUMA_EASE } from "@/lib/constants";

export const LOVE_CARDS: CardOption[] = [
  { id: "growing", label: "Growing things", icon: "🌱" },
  { id: "building", label: "Building", icon: "🔧" },
  { id: "people", label: "People", icon: "👥" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "creating", label: "Creating", icon: "🎨" },
  { id: "problem-solving", label: "Problem-solving", icon: "💡" },
  { id: "movement", label: "Movement", icon: "🏃" },
  { id: "cooking", label: "Cooking", icon: "🍳" },
  { id: "animals", label: "Animals", icon: "🐾" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "teaching", label: "Teaching", icon: "📖" },
];

interface Props {
  entries: string[];
  selectedCards: string[];
  onAddEntry: (text: string) => void;
  onRemoveEntry: (index: number) => void;
  onToggleCard: (id: string) => void;
  onNext: () => void;
}

export default function LoveScreen({
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
        question="What did you love to do as a kid?"
        subQuestion="What makes you happy in your spare time?"
        cards={LOVE_CARDS}
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
