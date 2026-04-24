"use client";

/**
 * REGEN-02 (Plan 02-02): DormantCard — renders when huma_context.dormant.active is true.
 *
 * Replaces the normal /today sheet with the spec-line copy + a single
 * re-entry input. Spec copy: "Nothing today. Rest is the work." (locked;
 * Voice Bible §02 audit applies).
 *
 * Re-entry flow: the operator types anything and submits. Submit calls
 * `onReEntry(text)` which the hook uses to POST { enable: false } to
 * /api/operator/dormancy and invalidate the contexts query. The text itself
 * is returned so a future plan can route it to /api/v2-chat as the first
 * message of the re-entry conversation; Phase 2 keeps it simple — typing
 * anything ends Dormancy.
 */

import { useState } from "react";

interface DormantCardProps {
  onReEntry: (text: string) => Promise<void>;
}

export default function DormantCard({ onReEntry }: DormantCardProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReEntry(text.trim());
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50dvh] px-6 py-12 text-center">
      <p className="font-serif text-[22px] leading-snug text-earth-650">
        Nothing today. Rest is the work.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-[360px]">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="when you're ready, say anything"
          aria-label="Re-entry message"
          className="w-full font-sans text-[14px] text-earth-650 placeholder:text-sand-350 bg-transparent border-0 border-b border-sand-300 py-2 px-1 outline-none focus:border-sage-500 transition-colors"
          disabled={submitting}
        />
      </form>
    </div>
  );
}
