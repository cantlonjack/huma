"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ProfileSection, ProseLine } from "@/lib/life-profile-utils";

interface LifeProfileSectionProps {
  section: ProfileSection;
  mode: "view" | "edit" | "filling";
  onTellMore?: (sectionId: string) => void;
  onFieldEdit?: (field: string, value: string) => void;
}

function EditableText({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
  }, [draft, value, onSave]);

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:bg-sand-200 rounded-sm px-0.5 -mx-0.5 transition-colors duration-100"
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
      className="font-sans outline-none w-full bg-sand-200 rounded-sm px-1 py-0.5 -mx-1 -my-0.5 border-none text-[14px] text-sage-600"
    />
  );
}

export default function LifeProfileSection({
  section,
  mode,
  onTellMore,
  onFieldEdit,
}: LifeProfileSectionProps) {
  if (section.isSparse) {
    return (
      <button
        onClick={() => onTellMore?.(section.id)}
        className="cursor-pointer flex items-center gap-2.5 py-2.5 px-3.5 bg-sand-50 border border-dashed border-sand-300 rounded-xl text-left w-full transition-colors duration-150 hover:bg-sand-100"
      >
        <span className="font-sans text-[13px] text-sage-400 italic">
          HUMA doesn&rsquo;t know about {section.label.toLowerCase()} yet
        </span>
      </button>
    );
  }

  return (
    <div className={`group ${mode === "filling" ? "animate-[fade-in_500ms_ease-out]" : ""}`}>
      <h3 className="font-sans font-medium text-[11px] tracking-[0.1em] uppercase text-sage-400 mb-1.5">
        {section.label}
      </h3>

      <div className="flex flex-col gap-1">
        {section.prose.map((line, i) => (
          <p
            key={i}
            className={`font-serif text-[14px] leading-relaxed text-earth-700 m-0 ${
              i === 0 && section.id === "identity" && section.prose[0]?.text.startsWith('"')
                ? "italic text-[15px]"
                : ""
            }`}
          >
            {mode === "edit" && line.editable ? (
              <EditableText value={line.text} onSave={(v) => onFieldEdit?.(line.field, v)} />
            ) : (
              line.text
            )}
          </p>
        ))}
      </div>

      {section.aspirationNames.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {section.aspirationNames.map((name, i) => (
            <span
              key={i}
              className="font-sans text-[11px] text-sage-500 bg-sand-200 rounded-full px-2.5 py-0.5"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {onTellMore && (
        <button
          onClick={() => onTellMore(section.id)}
          className="font-sans cursor-pointer text-[12px] text-sage-400 bg-transparent border-none p-0 mt-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 underline underline-offset-2"
        >
          Tell HUMA more
        </button>
      )}
    </div>
  );
}
