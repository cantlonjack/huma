"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Aspiration, Behavior, Pattern, FutureAction, FuturePhase, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import type { HolonStatus } from "./WholeShape";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AspirationDetailPanelProps {
  aspiration: Aspiration;
  patterns: Pattern[];
  status: HolonStatus;
  onClose: () => void;
  onNameSave: (name: string) => void;
  onStatusChange: (status: Aspiration["status"]) => void;
  onBehaviorsSave: (behaviors: Behavior[]) => void;
  onFutureSave: (comingUp: FutureAction[], longerArc: FuturePhase[]) => void;
  // Manage mode
  manageMode?: boolean;
  onArchive?: () => void;
  onDelete?: () => void;
}

const STATUS_CYCLE: { key: Aspiration["status"]; label: string; holon: HolonStatus }[] = [
  { key: "active", label: "Active", holon: "active" },
  { key: "paused", label: "Paused", holon: "adjusting" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border?: string }> = {
  active: { bg: "#F5F9F5", text: "#6B8F71" },
  working: { bg: "#EDF3ED", text: "#3A5A40" },
  finding: { bg: "#F0EDE4", text: "#A8C4AA", border: "1px dashed #DDD4C0" },
  no_path: { bg: "#F5F3EE", text: "#A8C4AA" },
  adjusting: { bg: "#FFF5ED", text: "#B5621E" },
  paused: { bg: "#FFF5ED", text: "#B5621E" },
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  working: "Working",
  finding: "Finding route",
  no_path: "No path yet",
  adjusting: "Adjusting",
  paused: "Paused",
};

// ─── Editable text field ────────────────────────────────────────────────────

function EditableText({
  value,
  placeholder,
  onSave,
  serif,
  fontSize = "14px",
  className = "",
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  serif?: boolean;
  fontSize?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className={className}
        style={{
          width: "100%",
          fontSize,
          lineHeight: "1.3",
          color: "#3A5A40",
          background: "#FAF8F3",
          border: "1px solid #6B8F71",
          borderRadius: "8px",
          padding: "4px 8px",
          outline: "none",
          fontFamily: serif ? "'Cormorant Garamond', serif" : "'Source Sans 3', sans-serif",
          fontWeight: serif ? 500 : 400,
        }}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-pointer text-left ${className}`}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        fontSize,
        lineHeight: "1.3",
        color: value ? "#3A5A40" : "#C8C0B0",
        fontFamily: serif ? "'Cormorant Garamond', serif" : "'Source Sans 3', sans-serif",
        fontWeight: serif ? 500 : 400,
      }}
    >
      {value || placeholder}
    </button>
  );
}

// ─── Behavior row ───────────────────────────────────────────────────────────

function BehaviorRow({
  behavior,
  isTrigger,
  linkedPattern,
  onTextSave,
  onRemove,
  onSetTrigger,
  onPatternTap,
}: {
  behavior: Behavior;
  isTrigger: boolean;
  linkedPattern?: Pattern;
  onTextSave: (text: string) => void;
  onRemove: () => void;
  onSetTrigger: () => void;
  onPatternTap?: (patternId: string) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "20px",
        paddingTop: "6px",
        paddingBottom: "6px",
      }}
    >
      {/* Tree connector */}
      <div
        style={{
          position: "absolute",
          left: "6px",
          top: 0,
          bottom: 0,
          width: "1px",
          background: "#C4D9C6",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "6px",
          top: "16px",
          width: "10px",
          height: "1px",
          background: "#C4D9C6",
        }}
      />

      {/* Behavior content */}
      <div className="flex items-start gap-2">
        {/* Trigger star */}
        <button
          onClick={onSetTrigger}
          className="flex-shrink-0 cursor-pointer"
          title={isTrigger ? "Trigger behavior" : "Set as trigger"}
          style={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            padding: 0,
            marginTop: "1px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill={isTrigger ? "#B5621E" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.7 3.8 11.4l.6-3.6L1.8 5.3l3.6-.5L7 1.5z"
              stroke={isTrigger ? "#B5621E" : "#C4D9C6"}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <EditableText
            value={behavior.text}
            placeholder="Behavior description"
            onSave={onTextSave}
            fontSize="14px"
          />

          {/* Dimension dots */}
          {behavior.dimensions && behavior.dimensions.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {behavior.dimensions.map((d) => (
                <span
                  key={d.dimension}
                  className="rounded-full"
                  title={DIMENSION_LABELS[d.dimension as DimensionKey] || d.dimension}
                  style={{
                    width: "6px",
                    height: "6px",
                    background: DIMENSION_COLORS[d.dimension as DimensionKey] || "#A8C4AA",
                  }}
                />
              ))}
            </div>
          )}

          {/* Linked pattern */}
          {linkedPattern && (
            <button
              onClick={() => onPatternTap?.(linkedPattern.id)}
              className="font-sans cursor-pointer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#6B8F71",
                background: "none",
                border: "none",
                padding: "2px 0 0",
              }}
            >
              <span style={{ color: "#A8C4AA" }}>&rarr;</span>
              Pattern: {linkedPattern.name}
            </button>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 cursor-pointer"
          style={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            fontSize: "16px",
            color: "#C4BAA8",
            padding: 0,
            marginTop: "1px",
          }}
          title="Remove behavior"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ─── Add behavior row ───────────────────────────────────────────────────────

function AddBehaviorRow({ onAdd }: { onAdd: (text: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onAdd(trimmed);
      setDraft("");
      setAdding(false);
    } else {
      setAdding(false);
    }
  };

  if (adding) {
    return (
      <div style={{ paddingLeft: "20px", paddingTop: "6px" }}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          placeholder="New behavior..."
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") { setDraft(""); setAdding(false); }
          }}
          className="font-sans"
          style={{
            width: "100%",
            fontSize: "14px",
            color: "#3D3830",
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
    <div style={{ paddingLeft: "20px", paddingTop: "6px" }}>
      <button
        onClick={() => setAdding(true)}
        className="font-sans cursor-pointer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "#A8C4AA",
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add behavior
      </button>
    </div>
  );
}

// ─── Collapsible future section ─────────────────────────────────────────────

function FutureSection<T extends { timeframe: string }>({
  title,
  items,
  nameKey,
  onItemSave,
  onItemRemove,
  onItemAdd,
}: {
  title: string;
  items: T[];
  nameKey: keyof T;
  onItemSave: (index: number, text: string) => void;
  onItemRemove: (index: number) => void;
  onItemAdd: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  if (items.length === 0 && !open) return null;

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        onClick={() => setOpen(!open)}
        className="font-sans cursor-pointer w-full text-left flex items-center gap-2"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#A8C4AA",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 200ms" }}
        >
          <path d="M3 1.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
        <span style={{ color: "#C4BAA8" }}>({items.length})</span>
      </button>

      {open && (
        <div style={{ marginTop: "6px", paddingLeft: "8px" }}>
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2" style={{ paddingTop: "4px" }}>
              <div className="flex-1 min-w-0">
                <EditableText
                  value={String(item[nameKey])}
                  placeholder="Description"
                  onSave={(v) => onItemSave(i, v)}
                  fontSize="13px"
                />
                {item.timeframe && (
                  <span className="font-sans" style={{ fontSize: "11px", color: "#A89E90" }}>
                    {item.timeframe}
                  </span>
                )}
              </div>
              <button
                onClick={() => onItemRemove(i)}
                className="flex-shrink-0 cursor-pointer"
                style={{
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  fontSize: "14px",
                  color: "#C4BAA8",
                  padding: 0,
                }}
              >
                &times;
              </button>
            </div>
          ))}

          {adding ? (
            <div style={{ paddingTop: "4px" }}>
              <input
                ref={inputRef}
                type="text"
                value={draft}
                placeholder="What's next..."
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => { if (draft.trim()) onItemAdd(draft.trim()); setDraft(""); setAdding(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim()) { onItemAdd(draft.trim()); setDraft(""); setAdding(false); }
                  if (e.key === "Escape") { setDraft(""); setAdding(false); }
                }}
                className="font-sans"
                style={{
                  width: "100%",
                  fontSize: "13px",
                  color: "#3D3830",
                  background: "#FAF8F3",
                  border: "1px solid #6B8F71",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  outline: "none",
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="font-sans cursor-pointer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#A8C4AA",
                background: "none",
                border: "none",
                padding: "4px 0 0",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export default function AspirationDetailPanel({
  aspiration,
  patterns,
  status,
  onClose,
  onNameSave,
  onStatusChange,
  onBehaviorsSave,
  onFutureSave,
  manageMode,
  onArchive,
  onDelete,
}: AspirationDetailPanelProps) {
  const [behaviors, setBehaviors] = useState<Behavior[]>(aspiration.behaviors || []);
  const [comingUp, setComingUp] = useState<FutureAction[]>(aspiration.comingUp || []);
  const [longerArc, setLongerArc] = useState<FuturePhase[]>(aspiration.longerArc || []);
  const [dirty, setDirty] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync when aspiration prop changes
  useEffect(() => {
    setBehaviors(aspiration.behaviors || []);
    setComingUp(aspiration.comingUp || []);
    setLongerArc(aspiration.longerArc || []);
    setDirty(false);
  }, [aspiration.id, aspiration.behaviors, aspiration.comingUp, aspiration.longerArc]);

  // Find the trigger behavior (first one marked, or first behavior)
  const triggerKey = aspiration.triggerData?.behavior || behaviors[0]?.key || "";

  // Map behavior keys to linked patterns
  const patternByBehavior = new Map<string, Pattern>();
  for (const p of patterns) {
    for (const step of p.steps) {
      if (!patternByBehavior.has(step.behaviorKey)) {
        patternByBehavior.set(step.behaviorKey, p);
      }
    }
  }

  // ── Behavior handlers ──

  const saveBehaviors = useCallback((updated: Behavior[]) => {
    setBehaviors(updated);
    setDirty(true);
    onBehaviorsSave(updated);
  }, [onBehaviorsSave]);

  const handleBehaviorTextSave = useCallback((index: number, text: string) => {
    const updated = [...behaviors];
    updated[index] = { ...updated[index], text };
    saveBehaviors(updated);
  }, [behaviors, saveBehaviors]);

  const handleBehaviorRemove = useCallback((index: number) => {
    const updated = behaviors.filter((_, i) => i !== index);
    saveBehaviors(updated);
  }, [behaviors, saveBehaviors]);

  const handleSetTrigger = useCallback((index: number) => {
    // Trigger is stored in triggerData on the aspiration; for now we save the behavior key
    // The parent handles persisting triggerData
    const updated = [...behaviors];
    // Move the selected behavior to first position (trigger position)
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    saveBehaviors(updated);
  }, [behaviors, saveBehaviors]);

  const handleAddBehavior = useCallback((text: string) => {
    const key = `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newBehavior: Behavior = {
      key,
      text,
      frequency: "daily",
      dimensions: [],
    };
    saveBehaviors([...behaviors, newBehavior]);
  }, [behaviors, saveBehaviors]);

  // ── Future handlers ──

  const handleComingUpSave = useCallback((index: number, text: string) => {
    const updated = [...comingUp];
    updated[index] = { ...updated[index], name: text };
    setComingUp(updated);
    setDirty(true);
    onFutureSave(updated, longerArc);
  }, [comingUp, longerArc, onFutureSave]);

  const handleComingUpRemove = useCallback((index: number) => {
    const updated = comingUp.filter((_, i) => i !== index);
    setComingUp(updated);
    setDirty(true);
    onFutureSave(updated, longerArc);
  }, [comingUp, longerArc, onFutureSave]);

  const handleComingUpAdd = useCallback((text: string) => {
    const updated = [...comingUp, { name: text, detail: "", timeframe: "" }];
    setComingUp(updated);
    setDirty(true);
    onFutureSave(updated, longerArc);
  }, [comingUp, longerArc, onFutureSave]);

  const handleLongerArcSave = useCallback((index: number, text: string) => {
    const updated = [...longerArc];
    updated[index] = { ...updated[index], phase: text };
    setLongerArc(updated);
    setDirty(true);
    onFutureSave(comingUp, updated);
  }, [comingUp, longerArc, onFutureSave]);

  const handleLongerArcRemove = useCallback((index: number) => {
    const updated = longerArc.filter((_, i) => i !== index);
    setLongerArc(updated);
    setDirty(true);
    onFutureSave(comingUp, updated);
  }, [comingUp, longerArc, onFutureSave]);

  const handleLongerArcAdd = useCallback((text: string) => {
    const updated = [...longerArc, { phase: text, detail: "", timeframe: "" }];
    setLongerArc(updated);
    setDirty(true);
    onFutureSave(comingUp, updated);
  }, [comingUp, longerArc, onFutureSave]);

  // ── Status cycling ──

  const handleStatusTap = useCallback(() => {
    const currentIdx = STATUS_CYCLE.findIndex((s) => s.key === aspiration.status);
    const nextIdx = (currentIdx + 1) % STATUS_CYCLE.length;
    onStatusChange(STATUS_CYCLE[nextIdx].key);
  }, [aspiration.status, onStatusChange]);

  const displayStatus = STATUS_LABELS[status] || STATUS_LABELS["active"];
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES["active"];

  return (
    <div
      ref={panelRef}
      className="mx-4 overflow-hidden"
      style={{
        background: "#FAF8F3",
        borderRadius: "12px",
        border: "1px solid #DDD4C0",
        padding: "16px",
        margin: "12px 16px 0",
        maxHeight: "65vh",
        overflowY: "auto",
        animation: "expand-panel-in 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      {/* Header: name + close */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <EditableText
            value={aspiration.clarifiedText || aspiration.rawText}
            placeholder="Name this aspiration"
            onSave={onNameSave}
            serif
            fontSize="20px"
          />

          {/* Status chip — tappable */}
          <button
            onClick={handleStatusTap}
            className="inline-block font-sans font-medium mt-1 cursor-pointer"
            style={{
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 10px",
              borderRadius: "12px",
              background: statusStyle.bg,
              color: statusStyle.text,
              border: statusStyle.border || "none",
            }}
          >
            {displayStatus}
          </button>
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

      {/* Summary line */}
      {aspiration.summary && (
        <p
          className="font-sans"
          style={{ fontSize: "13px", lineHeight: "1.5", color: "#6B8F71", marginTop: "6px" }}
        >
          {aspiration.summary}
        </p>
      )}

      {/* Dimension dots */}
      {aspiration.dimensionsTouched && aspiration.dimensionsTouched.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {aspiration.dimensionsTouched.map((dim) => (
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

      {/* ── Decomposition chain ── */}
      <div style={{ marginTop: "14px" }}>
        <span
          className="font-sans"
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#A8C4AA",
          }}
        >
          This week
        </span>

        <div style={{ marginTop: "4px" }}>
          {behaviors.map((b, i) => (
            <BehaviorRow
              key={b.key}
              behavior={b}
              isTrigger={b.key === triggerKey || (i === 0 && !triggerKey)}
              linkedPattern={patternByBehavior.get(b.key)}
              onTextSave={(text) => handleBehaviorTextSave(i, text)}
              onRemove={() => handleBehaviorRemove(i)}
              onSetTrigger={() => handleSetTrigger(i)}
            />
          ))}
          <AddBehaviorRow onAdd={handleAddBehavior} />
        </div>
      </div>

      {/* Coming Up */}
      <FutureSection<FutureAction>
        title="Coming up"
        items={comingUp}
        nameKey="name"
        onItemSave={handleComingUpSave}
        onItemRemove={handleComingUpRemove}
        onItemAdd={handleComingUpAdd}
      />

      {/* Longer Arc */}
      <FutureSection<FuturePhase>
        title="The longer arc"
        items={longerArc}
        nameKey="phase"
        onItemSave={handleLongerArcSave}
        onItemRemove={handleLongerArcRemove}
        onItemAdd={handleLongerArcAdd}
      />

      {/* ── Manage mode: danger zone ── */}
      {manageMode && (
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

      {/* Saved indicator */}
      {dirty && (
        <div
          className="font-sans"
          style={{
            marginTop: "12px",
            fontSize: "11px",
            color: "#A8C4AA",
            textAlign: "right",
          }}
        >
          Saved
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
