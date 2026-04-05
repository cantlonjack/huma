"use client";

import { useState, useRef, useEffect } from "react";
import type { HolonStatus } from "./WholeShape";
import { DIMENSION_COLORS, DIMENSION_LABELS, type DimensionKey } from "@/types/v2";

interface HolonExpandPanelProps {
  id: string;
  label: string;
  description?: string;
  status: HolonStatus;
  type: "aspiration" | "context" | "identity" | "principle";
  onClose: () => void;
  dimensions?: string[];
  // Identity-specific
  archetype?: string;
  whyStatement?: string;
  onArchetypeSave?: () => void;
  onWhySave?: (value: string) => void;
  // Foundation-specific
  value?: string;
  onValueSave?: (value: string) => void;
  // Manage mode
  manageMode?: boolean;
  onArchive?: () => void;
  onDelete?: () => void;
  onClearContext?: () => void;
}

const STATUS_LABELS: Record<HolonStatus, string> = {
  working: "Working",
  active: "Active",
  finding: "Finding route",
  no_path: "No path yet",
  adjusting: "Adjusting",
};

const STATUS_STYLES: Record<HolonStatus, { bg: string; text: string; border?: string }> = {
  working: { bg: "#EDF3ED", text: "#3A5A40" },
  active: { bg: "#F5F9F5", text: "#6B8F71" },
  finding: { bg: "#F0EDE4", text: "#A8C4AA", border: "1px dashed #DDD4C0" },
  no_path: { bg: "#F5F3EE", text: "#A8C4AA" },
  adjusting: { bg: "#FFF5ED", text: "#B5621E" },
};

// ─── Inline editable field ─────────────────────────────────────────────────

function InlineField({
  label,
  value,
  placeholder,
  onSave,
  multiline,
  serif,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  serif?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (draft.trim() !== (value || "")) onSave(draft.trim());
  };

  if (editing) {
    const sharedClasses = `w-full text-sm leading-normal text-earth-650 bg-sand-50 border border-sage-450 rounded-lg py-2 px-3 outline-none ${
      serif ? "font-serif italic" : "font-sans"
    }`;

    return (
      <div className="p-2.5 px-3.5 rounded-[10px] bg-sand-50 border border-sage-450 mb-2">
        <span className="font-sans text-[11px] tracking-[0.1em] text-sage-450 uppercase block mb-1">
          {label}
        </span>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
            rows={2}
            className={`${sharedClasses} resize-none`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            className={sharedClasses}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value || ""); setEditing(true); }}
      className="w-full text-left cursor-pointer p-2.5 px-3.5 rounded-[10px] bg-sand-50 border border-sand-250 mb-2"
    >
      <span className="font-sans text-[11px] tracking-[0.1em] text-sage-300 uppercase">
        {label}
      </span>
      <p
        className={`${serif && value ? "font-serif italic" : "font-sans"} text-sm mt-0.5 ${
          value ? "text-earth-650" : "text-sand-350"
        }`}
      >
        {value || placeholder}
      </p>
    </button>
  );
}

// ─── Foundation inline edit ─────────────────────────────────────────────────

function FoundationValue({ label, value, onSave }: { label: string; value?: string; onSave?: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (draft.trim() !== (value || "") && onSave) onSave(draft.trim());
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          className="flex-1 font-sans text-sm text-earth-650 bg-sand-50 border border-sage-450 rounded-lg py-1.5 px-2.5 outline-none"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mt-1">
      <div>
        <span className="font-sans text-[11px] tracking-[0.1em] text-sage-300 uppercase">
          {label}
        </span>
        <p className="font-sans text-base text-sage-700">
          {value || "—"}
        </p>
      </div>
      {onSave && (
        <button
          onClick={() => { setDraft(value || ""); setEditing(true); }}
          className="font-sans font-medium cursor-pointer text-xs text-amber-600 bg-transparent border-none py-1 px-2"
        >
          Edit
        </button>
      )}
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export default function HolonExpandPanel({
  label,
  description,
  status,
  type,
  onClose,
  dimensions,
  archetype,
  whyStatement,
  onArchetypeSave,
  onWhySave,
  value,
  onValueSave,
  manageMode,
  onArchive,
  onDelete,
  onClearContext,
}: HolonExpandPanelProps) {
  const statusStyle = STATUS_STYLES[status];

  return (
    <div
      className="mx-4 overflow-hidden bg-sand-50 rounded-xl border border-sand-300 p-4 mt-3"
      style={{
        margin: "12px 16px 0",
        animation: "expand-panel-in 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={`font-serif font-medium leading-tight text-sage-700 ${
              type === "identity" ? "text-[22px]" : "text-[20px]"
            }`}
          >
            {label}
          </p>

          {/* Status chip for aspirations — dynamic, keep inline */}
          {type === "aspiration" && (
            <span
              className="inline-block font-sans font-medium mt-1 text-[11px] tracking-[0.06em] uppercase py-0.5 px-2.5 rounded-xl"
              style={{
                background: statusStyle.bg,
                color: statusStyle.text,
                border: statusStyle.border || "none",
              }}
            >
              {STATUS_LABELS[status]}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none text-lg text-earth-400 -mt-0.5"
          aria-label="Close panel"
        >
          &times;
        </button>
      </div>

      {/* Description (aspirations, 2 lines max) */}
      {type === "aspiration" && description && (
        <p
          className="font-sans text-sm leading-relaxed text-sage-450 mt-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      )}

      {/* Dimension dots for aspirations — dynamic color, keep inline for bg */}
      {type === "aspiration" && dimensions && dimensions.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {dimensions.map((dim) => (
            <div key={dim} className="flex items-center gap-1">
              <span
                className="rounded-full w-2 h-2"
                style={{
                  background: DIMENSION_COLORS[dim as DimensionKey] || "#A8C4AA",
                }}
              />
              <span className="font-sans text-[11px] text-sage-450">
                {DIMENSION_LABELS[dim as DimensionKey] || dim}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Identity-specific fields */}
      {type === "identity" && (
        <div className="mt-3">
          {onArchetypeSave && (
            <button
              onClick={onArchetypeSave}
              className="w-full text-left cursor-pointer p-2.5 px-3.5 rounded-[10px] bg-sand-50 border border-sand-250 mb-2"
            >
              <span className="font-sans text-[11px] tracking-[0.1em] text-sage-300 uppercase">
                Archetype
              </span>
              <p className={`font-sans text-sm mt-0.5 ${archetype ? "text-earth-650" : "text-sand-350"}`}>
                {archetype || "Tap to choose your archetypes"}
              </p>
            </button>
          )}
          {onWhySave && (
            <InlineField
              label="Why"
              value={whyStatement}
              placeholder="What drives you?"
              onSave={onWhySave}
              multiline
              serif
            />
          )}
        </div>
      )}

      {/* Foundation: value + edit */}
      {type === "context" && (
        <div className="mt-2">
          <FoundationValue label={label} value={value || description} onSave={onValueSave} />
        </div>
      )}

      {/* Principle */}
      {type === "principle" && (
        <p className="font-serif text-[15px] italic text-sage-450 leading-normal mt-2">
          {description || label}
        </p>
      )}

      {/* ─── Manage mode: danger zone ─────────────────────────────────── */}
      {manageMode && type === "aspiration" && (
        <div className="mt-4 pt-3 border-t border-sand-250">
          <div className="flex gap-3">
            {onArchive && (
              <button
                onClick={onArchive}
                className="font-sans font-medium cursor-pointer text-[13px] py-2 px-4 rounded-[10px] bg-transparent border border-sage-450 text-sage-450"
              >
                Archive
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="font-sans font-medium cursor-pointer text-[13px] py-2 px-4 rounded-[10px] bg-transparent border-none text-rose"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {manageMode && type === "context" && onClearContext && (
        <div className="mt-3">
          <button
            onClick={onClearContext}
            className="font-sans cursor-pointer text-[13px] bg-transparent border-none text-earth-500 p-0"
          >
            Clear this
          </button>
        </div>
      )}

      {manageMode && type === "principle" && onDelete && (
        <div className="mt-3">
          <button
            onClick={onDelete}
            className="font-sans cursor-pointer text-[13px] bg-transparent border-none text-rose p-0"
          >
            Remove
          </button>
        </div>
      )}

      <style>{`
        @keyframes expand-panel-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
