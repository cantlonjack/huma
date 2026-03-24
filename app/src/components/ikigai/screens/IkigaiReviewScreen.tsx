"use client";

import { motion } from "framer-motion";
import IkigaiVenn from "../IkigaiVenn";
import { HUMA_EASE } from "@/lib/constants";

interface Props {
  love: string[];
  good: string[];
  need: string[];
  loveCards: string[];
  goodCards: string[];
  needCards: string[];
  onRemoveEntry: (category: "love" | "good" | "need", index: number) => void;
  onEditCategory: (category: "love" | "good" | "need") => void;
  onNext: () => void;
}

// Map card IDs to labels for display
const CARD_LABELS: Record<string, string> = {
  growing: "Growing things",
  building: "Building",
  people: "People",
  learning: "Learning",
  creating: "Creating",
  "problem-solving": "Problem-solving",
  movement: "Movement",
  cooking: "Cooking",
  animals: "Animals",
  music: "Music",
  nature: "Nature",
  teaching: "Teaching",
  fixing: "Fixing things",
  organizing: "Organizing",
  listening: "Listening",
  explaining: "Explaining",
  physical: "Physical work",
  systems: "Systems",
  creative: "Creative work",
  leading: "Leading",
  healing: "Healing",
  numbers: "Numbers",
  "local-food": "Local food",
  "clean-water": "Clean water",
  community: "Community",
  youth: "Youth",
  "soil-health": "Soil health",
  economic: "Economic resilience",
  "mental-health": "Mental health",
  housing: "Housing",
  education: "Education",
  biodiversity: "Biodiversity",
  energy: "Energy",
  culture: "Culture",
};

function CategoryColumn({
  title,
  color,
  entries,
  cards,
  onRemove,
  onEdit,
}: {
  title: string;
  color: string;
  entries: string[];
  cards: string[];
  onRemove: (index: number) => void;
  onEdit: () => void;
}) {
  const allItems = [...entries, ...cards.map((id) => CARD_LABELS[id] || id)];

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--font-source-sans)",
            color,
          }}
        >
          {title}
        </h3>
        <button
          onClick={onEdit}
          className="text-xs text-earth-400 hover:text-sage-600 transition-colors"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {allItems.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-sand-100 group transition-colors"
          >
            <span
              className="text-earth-600 text-sm truncate"
              style={{ fontFamily: "var(--font-source-sans)" }}
            >
              {item}
            </span>
            {i < entries.length && (
              <button
                onClick={() => onRemove(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-earth-300 hover:text-earth-500 ml-2 shrink-0"
                aria-label={`Remove ${item}`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 3L9 9M9 3L3 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IkigaiReviewScreen({
  love,
  good,
  need,
  loveCards,
  goodCards,
  needCards,
  onRemoveEntry,
  onEditCategory,
  onNext,
}: Props) {
  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.5, ease: HUMA_EASE }}
    >
      <h2
        className="text-earth-700 text-center"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.2rem",
          fontWeight: 500,
        }}
      >
        Let&rsquo;s look at this together.
      </h2>

      <IkigaiVenn
        love={[...love, ...loveCards.map((id) => CARD_LABELS[id] || id)]}
        good={[...good, ...goodCards.map((id) => CARD_LABELS[id] || id)]}
        need={[...need, ...needCards.map((id) => CARD_LABELS[id] || id)]}
        size={260}
        animate={false}
      />

      {/* Three columns */}
      <div className="w-full flex flex-col sm:flex-row gap-6">
        <CategoryColumn
          title="Love"
          color="#C5D86D"
          entries={love}
          cards={loveCards}
          onRemove={(i) => onRemoveEntry("love", i)}
          onEdit={() => onEditCategory("love")}
        />
        <CategoryColumn
          title="Good at"
          color="#5C7A62"
          entries={good}
          cards={goodCards}
          onRemove={(i) => onRemoveEntry("good", i)}
          onEdit={() => onEditCategory("good")}
        />
        <CategoryColumn
          title="World needs"
          color="#2E6B8A"
          entries={need}
          cards={needCards}
          onRemove={(i) => onRemoveEntry("need", i)}
          onEdit={() => onEditCategory("need")}
        />
      </div>

      <button
        onClick={onNext}
        className="px-8 py-3 rounded-full bg-sage-600 text-white font-medium hover:bg-sage-700 transition-colors duration-300"
        style={{
          fontFamily: "var(--font-source-sans)",
          fontSize: "0.9rem",
          minHeight: 48,
        }}
      >
        Looks right &rarr;
      </button>
    </motion.div>
  );
}
