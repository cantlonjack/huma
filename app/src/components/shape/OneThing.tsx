"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DIMENSION_LABELS, type DimensionKey } from "@/types/shape";
import { HUMA_EASE } from "@/lib/constants";

interface OneThingData {
  action: string;
  connectsTo: DimensionKey[];
  leverDimension: DimensionKey;
}

interface OneThingProps {
  data: OneThingData;
  onRespond: (response: "done" | "not-today") => void;
}

/**
 * Saves one-thing response to localStorage.
 * Tech debt: move to Supabase when we need server-side pattern analysis
 * (which one-things get "done" vs "not today," dimension skip patterns).
 */
function saveOneThingResponse(
  data: OneThingData,
  response: "done" | "not-today"
) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const key = `huma-onething-${today}`;
  const record = {
    action: data.action,
    connectsTo: data.connectsTo,
    leverDimension: data.leverDimension,
    response,
    respondedAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(record));
}

/**
 * Check if the operator already responded to today's one-thing.
 */
export function hasRespondedToday(): { responded: boolean; response?: "done" | "not-today" } {
  const today = new Date().toISOString().split("T")[0];
  const key = `huma-onething-${today}`;
  const stored = localStorage.getItem(key);
  if (!stored) return { responded: false };
  try {
    const record = JSON.parse(stored);
    return { responded: true, response: record.response };
  } catch {
    return { responded: false };
  }
}

export default function OneThing({ data, onRespond }: OneThingProps) {
  const [acknowledgment, setAcknowledgment] = useState<string | null>(null);

  const handleResponse = (response: "done" | "not-today") => {
    saveOneThingResponse(data, response);
    const message =
      response === "done"
        ? "Noted. See you tomorrow."
        : "Got it. This one will come back when it\u2019s right.";
    setAcknowledgment(message);
    setTimeout(() => onRespond(response), 1500);
  };

  if (acknowledgment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: HUMA_EASE }}
        className="flex flex-col items-center justify-center py-16"
      >
        <p className="font-serif text-earth-600 text-lg">{acknowledgment}</p>
      </motion.div>
    );
  }

  // Map dimension keys to friendly names
  const connectedLabels = data.connectsTo
    .map((dim) => DIMENSION_LABELS[dim])
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: HUMA_EASE }}
      className="flex flex-col items-center max-w-lg mx-auto"
    >
      {/* Card */}
      <div className="w-full bg-sand-50 rounded-lg border-l-4 border-sage-600 px-5 py-5">
        <p className="font-sans text-sm text-earth-500 mb-2">
          The one thing today:
        </p>
        <p className="font-sans text-base text-earth-800 leading-relaxed mb-3">
          {data.action}
        </p>
        <p className="font-sans text-sm text-earth-500">
          This connects to: {connectedLabels}
        </p>
      </div>

      {/* Buttons — equal weight */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => handleResponse("done")}
          className="font-sans text-sm px-6 py-2 rounded-full bg-sage-600 text-white hover:bg-sage-500 transition-colors"
        >
          Got it
        </button>
        <button
          onClick={() => handleResponse("not-today")}
          className="font-sans text-sm px-6 py-2 rounded-full border border-earth-300 text-earth-500 hover:border-earth-400 hover:text-earth-600 transition-colors"
        >
          Not today
        </button>
      </div>
    </motion.div>
  );
}
