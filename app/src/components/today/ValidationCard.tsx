"use client";

import { useState, memo } from "react";
import type { Aspiration, ValidationAnswer } from "@/types/v2";

interface ValidationCardProps {
  aspiration: Aspiration;
  onAnswer: (answer: ValidationAnswer) => void;
}

export const ValidationCard = memo(function ValidationCard({
  aspiration,
  onAnswer,
}: ValidationCardProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [belowTarget, setBelowTarget] = useState(false);

  if (!aspiration.validationQuestion || !aspiration.validationTarget) return null;

  const title = aspiration.title || aspiration.clarifiedText || aspiration.rawText;
  const isNumeric = /\d/.test(aspiration.validationTarget);

  const handleSubmit = () => {
    if (!value.trim()) return;

    // Determine if below target by parsing the target
    const targetMatch = aspiration.validationTarget!.match(/(\d+)/);
    const targetNum = targetMatch ? parseInt(targetMatch[1]) : null;
    const answerNum = parseInt(value);
    const isBelowTarget = targetNum !== null && !isNaN(answerNum) && answerNum < targetNum;

    const answer: ValidationAnswer = {
      aspirationId: aspiration.id,
      question: aspiration.validationQuestion!,
      answer: value.trim(),
      target: aspiration.validationTarget!,
      belowTarget: isBelowTarget,
      failureResponse: isBelowTarget ? aspiration.failureResponse : undefined,
      answeredAt: new Date().toISOString(),
    };

    setBelowTarget(isBelowTarget);
    setSubmitted(true);
    onAnswer(answer);
  };

  if (submitted) {
    return (
      <div className="mx-4 mb-3 p-4 bg-sand-100 border border-sand-300 rounded-xl animate-entrance-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-sage-400">
            {title}
          </span>
          <span className={`font-sans text-[11px] font-medium ${belowTarget ? "text-amber-600" : "text-sage-500"}`}>
            {belowTarget ? "Below target" : "On track"}
          </span>
        </div>

        {belowTarget && aspiration.failureResponse ? (
          <p className="font-sans text-[13px] leading-relaxed text-ink-600 mt-1.5">
            {aspiration.failureResponse}
          </p>
        ) : (
          <p className="font-sans text-[13px] text-sage-450 mt-1">
            Logged. Keep going.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 p-4 bg-sand-100 border border-sand-300 rounded-xl animate-entrance-1">
      <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-sage-400 block mb-2">
        {title}
      </span>

      <p className="font-serif text-[15px] leading-snug text-ink-700 mb-3">
        {aspiration.validationQuestion}
      </p>

      <div className="flex items-center gap-2">
        {isNumeric ? (
          <input
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="0"
            className="font-sans w-16 text-center text-lg text-sage-700 bg-white border border-sand-300 rounded-lg px-2 py-1.5 outline-none focus:border-sage-450"
          />
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setValue("yes"); }}
              className={`font-sans cursor-pointer text-[13px] px-4 py-2 rounded-lg border ${value === "yes" ? "bg-sage-50 border-sage-450 text-sage-600" : "bg-white border-sand-300 text-sage-400"}`}
            >
              Yes
            </button>
            <button
              onClick={() => { setValue("no"); }}
              className={`font-sans cursor-pointer text-[13px] px-4 py-2 rounded-lg border ${value === "no" ? "bg-amber-50 border-amber-400 text-amber-600" : "bg-white border-sand-300 text-sage-400"}`}
            >
              No
            </button>
          </div>
        )}

        <span className="font-sans text-[12px] text-earth-300 flex-1">
          Target: {aspiration.validationTarget}
        </span>

        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="font-sans cursor-pointer text-[13px] font-medium text-white bg-amber-600 border-none rounded-lg px-4 py-2 disabled:opacity-40"
        >
          Log
        </button>
      </div>
    </div>
  );
});
