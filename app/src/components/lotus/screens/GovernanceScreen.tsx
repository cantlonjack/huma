"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LotusState, LotusAction, RelationshipType, GovernancePerson } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onNext: () => void;
}

const RELATIONSHIPS: { value: RelationshipType; label: string }[] = [
  { value: "partner", label: "Partner" },
  { value: "family", label: "Family" },
  { value: "collaborator", label: "Collaborator" },
  { value: "other", label: "Other" },
];

export default function GovernanceScreen({ state, dispatch, onNext }: ScreenProps) {
  const justMeRef = useRef<HTMLButtonElement>(null);
  const name = state.context.name || "";
  const [mode, setMode] = useState<"choice" | "adding">("choice");

  // Auto-focus "Just me" button
  useEffect(() => {
    const t = setTimeout(() => justMeRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);
  const [people, setPeople] = useState<GovernancePerson[]>(
    state.context.governance?.people || []
  );
  const [personName, setPersonName] = useState("");
  const [personRelationship, setPersonRelationship] = useState<RelationshipType>("partner");

  function handleJustMe() {
    dispatch({ type: "SET_GOVERNANCE", governance: { solo: true, people: [] } });
    onNext();
  }

  function handleAddPerson() {
    if (!personName.trim()) return;
    const newPeople = [...people, { name: personName.trim(), relationship: personRelationship }];
    setPeople(newPeople);
    setPersonName("");
    setPersonRelationship("partner");
  }

  function handleRemovePerson(index: number) {
    setPeople(people.filter((_, i) => i !== index));
  }

  function handleDone() {
    dispatch({
      type: "SET_GOVERNANCE",
      governance: { solo: false, people },
    });
    onNext();
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <h2
        className="text-2xl md:text-3xl text-center text-[#1A1714]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Who else is part of your picture, {name}?
      </h2>

      <AnimatePresence mode="wait">
        {mode === "choice" ? (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: HUMA_EASE }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              ref={justMeRef}
              onClick={handleJustMe}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-[#D4CBBA] bg-white hover:border-[#A89E90] transition-colors duration-200"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="10" r="4" stroke="#5C7A62" strokeWidth="1.3" fill="none" />
                <path d="M7 24 C7 19, 10 16, 14 16 C18 16, 21 19, 21 24" stroke="#5C7A62" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
              <span
                className="text-sm font-medium text-[#3D3830]"
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                Just me
              </span>
            </motion.button>

            <motion.button
              onClick={() => setMode("adding")}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-[#D4CBBA] bg-white hover:border-[#A89E90] transition-colors duration-200"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="3.5" stroke="#5C7A62" strokeWidth="1.2" fill="none" />
                <circle cx="18" cy="10" r="3.5" stroke="#8BAF8E" strokeWidth="1.2" fill="none" />
                <path d="M4 24 C4 20, 7 17, 10 17 C12 17, 13 18, 14 19" stroke="#5C7A62" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M24 24 C24 20, 21 17, 18 17 C16 17, 15 18, 14 19" stroke="#8BAF8E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </svg>
              <span
                className="text-sm font-medium text-[#3D3830]"
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                Add someone
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="adding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: HUMA_EASE }}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            {/* People chips */}
            {people.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {people.map((p, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF3EC] text-sm text-[#3A5A40]"
                    style={{ fontFamily: "var(--font-source-sans)" }}
                  >
                    {p.name}
                    <span className="text-xs text-[#5C7A62] opacity-70">
                      {p.relationship}
                    </span>
                    <button
                      onClick={() => handleRemovePerson(i)}
                      className="ml-1 text-[#A89E90] hover:text-[#3D3830] transition-colors"
                      aria-label={`Remove ${p.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </motion.span>
                ))}
              </div>
            )}

            {/* Add person form */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Their name"
                className="w-full text-base bg-transparent border-b-2 border-[#D4CBBA] focus:border-[#5C7A62] outline-none py-2 text-[#1A1714] placeholder:text-[#C4BAA8] transition-colors duration-300"
                style={{ fontFamily: "var(--font-source-sans)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPerson();
                }}
              />
              <div className="flex gap-2">
                {RELATIONSHIPS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPersonRelationship(value)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                      ${personRelationship === value
                        ? "bg-[#EBF3EC] text-[#3A5A40] border border-[#5C7A62]"
                        : "bg-white text-[#6B6358] border border-[#D4CBBA] hover:border-[#A89E90]"
                      }
                    `}
                    style={{ fontFamily: "var(--font-source-sans)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddPerson}
                disabled={!personName.trim()}
                className="self-start px-4 py-2 text-sm font-medium text-[#5C7A62] hover:text-[#3A5A40] disabled:text-[#C4BAA8] transition-colors duration-200"
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                + Add
              </button>
            </div>

            {/* Done button */}
            <motion.button
              onClick={people.length > 0 ? handleDone : handleJustMe}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 self-center px-9 py-4 rounded-full bg-[#B5621E] text-white font-medium shadow-[0_4px_20px_rgba(181,98,30,0.15)] hover:bg-[#C87A3A] hover:-translate-y-0.5 transition-all duration-300"
              style={{ fontFamily: "var(--font-source-sans)" }}
            >
              {people.length > 0 ? "Done" : "Just me"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
