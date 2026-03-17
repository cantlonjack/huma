"use client";

import { useState } from "react";
import type { ValidationCheck } from "@/engine/canvas-types";

interface QoLCheckFormProps {
  validationChecks: ValidationCheck[];
  onSubmit: (responses: Record<number, string>) => void;
}

export default function QoLCheckForm({ validationChecks, onSubmit }: QoLCheckFormProps) {
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleChange = (index: number, value: string) => {
    setResponses((prev) => ({ ...prev, [index]: value }));
  };

  const allAnswered = validationChecks.every((_, i) => responses[i]?.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responses);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {validationChecks.map((check, i) => (
          <div
            key={i}
            className="border border-sand-200 border-l-[3px] border-l-sage-500 rounded-lg p-5"
          >
            <p className="font-serif text-lg text-earth-900 mb-2 leading-snug">
              &ldquo;{check.qolStatement}&rdquo;
            </p>
            <label
              htmlFor={`qol-${i}`}
              className="block text-sm text-earth-600 mb-3"
            >
              {check.question}
            </label>
            <input
              id={`qol-${i}`}
              type="text"
              value={responses[i] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full bg-sand-50 border border-sand-200 rounded-md px-4 py-2.5 text-earth-800 focus:border-sage-400 focus:ring-1 focus:ring-sage-400 outline-none transition-colors placeholder:text-earth-400"
              placeholder={check.target}
            />
            <p className="text-xs text-earth-400 mt-1.5">
              Target: {check.target}
            </p>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={!allAnswered}
        className="mt-8 w-full px-6 py-3.5 bg-amber-600 text-white text-base font-medium rounded-full hover:bg-amber-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Submit check-in
      </button>
    </form>
  );
}
