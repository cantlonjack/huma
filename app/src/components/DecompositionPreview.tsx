"use client";

import { useState } from "react";
import type { Behavior } from "@/types/v2";

interface DecompositionPreviewProps {
  aspirationName?: string | null;
  behaviors: Behavior[];
  onConfirm: (behaviors: Behavior[]) => void;
}

export default function DecompositionPreview({
  aspirationName,
  behaviors: initialBehaviors,
  onConfirm,
}: DecompositionPreviewProps) {
  const [editing, setEditing] = useState(false);
  const [behaviors, setBehaviors] = useState<(Behavior & { enabled: boolean })[]>(
    initialBehaviors.map(b => ({ ...b, enabled: b.enabled !== false }))
  );

  function toggleBehavior(key: string) {
    setBehaviors(prev =>
      prev.map(b => (b.key === key ? { ...b, enabled: !b.enabled } : b))
    );
  }

  function handleConfirm() {
    onConfirm(behaviors.filter(b => b.enabled));
  }

  return (
    <div className="mt-4">
      {/* Behavior list */}
      <div className="space-y-2">
        {behaviors.map(b => (
          <div
            key={b.key}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-sand-50 border border-sand-200 transition-opacity duration-200 ${
              !b.enabled && editing ? "opacity-40" : "opacity-100"
            }`}
          >
            {/* Toggle or static circle */}
            {editing ? (
              <button
                onClick={() => toggleBehavior(b.key)}
                className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                  b.enabled
                    ? "bg-sage-700 border-0"
                    : "bg-transparent border-2 border-earth-300"
                }`}
                aria-label={b.enabled ? `Remove ${b.text}` : `Keep ${b.text}`}
              >
                {b.enabled && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ) : (
              <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-earth-300 flex-shrink-0" />
            )}

            <div>
              <p
                className={`font-sans text-sm text-earth-700 font-medium ${
                  !b.enabled && editing ? "line-through decoration-earth-400" : ""
                }`}
              >
                {b.text}
              </p>
              {b.frequency === "specific-days" && b.days && (
                <p className="font-sans text-xs text-earth-400 mt-0.5">
                  {b.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ")}
                </p>
              )}
              {b.detail && (
                <p className="font-sans text-xs text-earth-400 mt-0.5">{b.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit mode hint */}
      {editing && (
        <p className="font-sans text-xs text-earth-400 mt-3 italic">
          Uncheck anything that doesn&apos;t fit. You can always add it back later.
        </p>
      )}

      {/* Buttons */}
      <div className="mt-4 flex gap-3">
        {!editing ? (
          <>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium bg-sage-700 text-white hover:bg-sage-800 transition-all duration-200 cursor-pointer"
            >
              Start tomorrow
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium border border-sand-300 text-earth-600 hover:border-sage-400 transition-all duration-200 cursor-pointer"
            >
              Adjust these first
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setEditing(false);
                handleConfirm();
              }}
              className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium bg-sage-700 text-white hover:bg-sage-800 transition-all duration-200 cursor-pointer"
            >
              Looks good — start tomorrow
            </button>
            <button
              onClick={() => {
                setBehaviors(prev => prev.map(b => ({ ...b, enabled: true })));
                setEditing(false);
              }}
              className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium border border-sand-300 text-earth-500 hover:border-sage-400 transition-all duration-200 cursor-pointer"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
