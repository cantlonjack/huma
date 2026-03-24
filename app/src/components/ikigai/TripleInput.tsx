"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HUMA_EASE } from "@/lib/constants";

export interface CardOption {
  id: string;
  label: string;
  icon: string;
}

interface TripleInputProps {
  question: string;
  subQuestion?: string;
  cards: CardOption[];
  entries: string[];
  selectedCards: string[];
  onAddEntry: (text: string) => void;
  onRemoveEntry: (index: number) => void;
  onToggleCard: (id: string) => void;
}

export default function TripleInput({
  question,
  subQuestion,
  cards,
  entries,
  selectedCards,
  onAddEntry,
  onRemoveEntry,
  onToggleCard,
}: TripleInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    // Avoid duplicates
    if (entries.some((e) => e.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onAddEntry(trimmed);
    setDraft("");
    inputRef.current?.focus();
  }, [draft, entries, onAddEntry]);

  return (
    <div className="flex flex-col gap-6">
      {/* Question */}
      <div>
        <h2
          className="text-earth-700 mb-1"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.2rem",
            fontWeight: 500,
          }}
        >
          {question}
        </h2>
        {subQuestion && (
          <p
            className="text-earth-400"
            style={{
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.9rem",
            }}
          >
            {subQuestion}
          </p>
        )}
      </div>

      {/* Text input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Type and press enter..."
          className="w-full px-4 py-3 rounded-xl border border-earth-200 bg-white text-earth-700 text-sm outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-200 transition-colors"
          style={{ fontFamily: "var(--font-source-sans)" }}
          autoFocus
        />
      </div>

      {/* Text entry chips */}
      <AnimatePresence mode="popLayout">
        {entries.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: HUMA_EASE }}
          >
            {entries.map((entry, i) => (
              <motion.button
                key={`entry-${entry}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-50 text-sage-700 text-sm border border-sage-200 hover:bg-sage-100 transition-colors"
                style={{ fontFamily: "var(--font-source-sans)" }}
                onClick={() => onRemoveEntry(i)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: HUMA_EASE }}
                aria-label={`Remove ${entry}`}
              >
                {entry}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="opacity-50"
                >
                  <path
                    d="M3 3L9 9M9 3L3 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card grid */}
      <div>
        <p
          className="text-earth-400 text-xs mb-3 uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-source-sans)",
            fontWeight: 600,
          }}
        >
          Or pick what fits
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {cards.map((card) => {
            const selected = selectedCards.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => onToggleCard(card.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border transition-all duration-200 ${
                  selected
                    ? "bg-sage-50 border-sage-500 shadow-sm"
                    : "bg-white border-sand-300 hover:border-earth-300"
                }`}
                style={{
                  height: 72,
                  fontFamily: "var(--font-source-sans)",
                }}
              >
                <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {card.icon}
                </span>
                <span
                  className={`text-xs ${
                    selected ? "text-sage-700 font-medium" : "text-earth-500"
                  }`}
                  style={{ fontSize: "0.7rem" }}
                >
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
