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
    const sharedStyle = {
      width: "100%",
      fontSize: "14px",
      lineHeight: "1.5",
      color: "#3D3B36",
      background: "#FAF8F3",
      border: "1px solid #6B8F71",
      borderRadius: "8px",
      padding: "8px 12px",
      outline: "none",
      fontFamily: serif ? "'Cormorant Garamond', serif" : "'Source Sans 3', sans-serif",
      fontStyle: serif ? "italic" : "normal" as const,
    };

    return (
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          background: "#FAF8F3",
          border: "1px solid #6B8F71",
          marginBottom: "8px",
        }}
      >
        <span className="font-sans" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#6B8F71", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
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
            style={{ ...sharedStyle, resize: "none" }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            style={sharedStyle}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value || ""); setEditing(true); }}
      className="w-full text-left cursor-pointer"
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        background: "#FAF8F3",
        border: "1px solid #E8E2D6",
        marginBottom: "8px",
      }}
    >
      <span className="font-sans" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#A8C4AA", textTransform: "uppercase" }}>
        {label}
      </span>
      <p
        className={serif && value ? "font-serif" : "font-sans"}
        style={{
          fontSize: "14px",
          fontStyle: serif && value ? "italic" : "normal",
          color: value ? "#3D3B36" : "#C8C0B0",
          marginTop: "2px",
        }}
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
      <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          className="flex-1 font-sans"
          style={{
            fontSize: "14px",
            color: "#3D3B36",
            background: "#FAF8F3",
            border: "1px solid #6B8F71",
            borderRadius: "8px",
            padding: "6px 10px",
            outline: "none",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between" style={{ marginTop: "4px" }}>
      <div>
        <span className="font-sans" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#A8C4AA", textTransform: "uppercase" }}>
          {label}
        </span>
        <p className="font-sans" style={{ fontSize: "16px", color: "#3A5A40" }}>
          {value || "—"}
        </p>
      </div>
      {onSave && (
        <button
          onClick={() => { setDraft(value || ""); setEditing(true); }}
          className="font-sans font-medium cursor-pointer"
          style={{ fontSize: "12px", color: "#B5621E", background: "none", border: "none", padding: "4px 8px" }}
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
  const style = STATUS_STYLES[status];

  return (
    <div
      className="mx-4 overflow-hidden"
      style={{
        background: "#FAF8F3",
        borderRadius: "12px",
        border: "1px solid #DDD4C0",
        padding: "16px",
        margin: "12px 16px 0",
        animation: "expand-panel-in 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className="font-serif font-medium"
            style={{ fontSize: type === "identity" ? "22px" : "20px", lineHeight: "1.3", color: "#3A5A40" }}
          >
            {label}
          </p>

          {/* Status chip for aspirations */}
          {type === "aspiration" && (
            <span
              className="inline-block font-sans font-medium mt-1"
              style={{
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "2px 10px",
                borderRadius: "12px",
                background: style.bg,
                color: style.text,
                border: style.border || "none",
              }}
            >
              {STATUS_LABELS[status]}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 cursor-pointer"
          style={{
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            fontSize: "18px",
            color: "#8C8274",
            marginTop: "-2px",
          }}
          aria-label="Close panel"
        >
          &times;
        </button>
      </div>

      {/* Description (aspirations, 2 lines max) */}
      {type === "aspiration" && description && (
        <p
          className="font-sans"
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#6B8F71",
            marginTop: "8px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      )}

      {/* Dimension dots for aspirations */}
      {type === "aspiration" && dimensions && dimensions.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {dimensions.map((dim) => (
            <div key={dim} className="flex items-center gap-1">
              <span
                className="rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  background: DIMENSION_COLORS[dim as DimensionKey] || "#A8C4AA",
                }}
              />
              <span className="font-sans" style={{ fontSize: "11px", color: "#6B8F71" }}>
                {DIMENSION_LABELS[dim as DimensionKey] || dim}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Identity-specific fields */}
      {type === "identity" && (
        <div style={{ marginTop: "12px" }}>
          {onArchetypeSave && (
            <button
              onClick={onArchetypeSave}
              className="w-full text-left cursor-pointer"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#FAF8F3",
                border: "1px solid #E8E2D6",
                marginBottom: "8px",
              }}
            >
              <span className="font-sans" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#A8C4AA", textTransform: "uppercase" }}>
                Archetype
              </span>
              <p className="font-sans" style={{ fontSize: "14px", color: archetype ? "#3D3B36" : "#C8C0B0", marginTop: "2px" }}>
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
        <div style={{ marginTop: "8px" }}>
          <FoundationValue label={label} value={value || description} onSave={onValueSave} />
        </div>
      )}

      {/* Principle */}
      {type === "principle" && (
        <p
          className="font-serif"
          style={{ fontSize: "15px", fontStyle: "italic", color: "#6B8F71", lineHeight: "1.5", marginTop: "8px" }}
        >
          {description || label}
        </p>
      )}

      {/* ─── Manage mode: danger zone ─────────────────────────────────── */}
      {manageMode && type === "aspiration" && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #E8E2D6",
          }}
        >
          <div className="flex gap-3">
            {onArchive && (
              <button
                onClick={onArchive}
                className="font-sans font-medium cursor-pointer"
                style={{
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "none",
                  border: "1px solid #6B8F71",
                  color: "#6B8F71",
                }}
              >
                Archive
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="font-sans font-medium cursor-pointer"
                style={{
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "none",
                  border: "none",
                  color: "#E57373",
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {manageMode && type === "context" && onClearContext && (
        <div style={{ marginTop: "12px" }}>
          <button
            onClick={onClearContext}
            className="font-sans cursor-pointer"
            style={{
              fontSize: "13px",
              background: "none",
              border: "none",
              color: "#6B6358",
              padding: 0,
            }}
          >
            Clear this
          </button>
        </div>
      )}

      {manageMode && type === "principle" && onDelete && (
        <div style={{ marginTop: "12px" }}>
          <button
            onClick={onDelete}
            className="font-sans cursor-pointer"
            style={{
              fontSize: "13px",
              background: "none",
              border: "none",
              color: "#E57373",
              padding: 0,
            }}
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
