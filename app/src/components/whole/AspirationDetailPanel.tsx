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
  active: { bg: "bg-sage-50", text: "text-sage-450" },
  working: { bg: "bg-sage-100", text: "text-sage-700" },
  finding: { bg: "bg-sand-100", text: "text-sage-300", border: "border border-dashed border-sand-300" },
  no_path: { bg: "bg-sand-50", text: "text-sage-300" },
  adjusting: { bg: "bg-amber-100", text: "text-amber-600" },
  paused: { bg: "bg-amber-100", text: "text-amber-600" },
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
  textSize = "text-sm",
  className = "",
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  serif?: boolean;
  textSize?: string;
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
        className={`w-full leading-[1.3] text-sage-700 bg-sand-50 border border-sage-450 rounded-lg px-2 py-1 outline-none ${serif ? "font-serif font-medium" : "font-sans"} ${textSize} ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-pointer text-left bg-transparent border-none p-0 leading-[1.3] ${serif ? "font-serif font-medium" : "font-sans"} ${textSize} ${value ? "text-sage-700" : "text-sand-350"} ${className}`}
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
    <div className="relative pl-5 py-1.5">
      {/* Tree connector */}
      <div className="absolute left-1.5 top-0 bottom-0 w-px bg-sage-200" />
      <div className="absolute left-1.5 top-4 w-2.5 h-px bg-sage-200" />

      {/* Behavior content */}
      <div className="flex items-start gap-2">
        {/* Trigger star */}
        <button
          onClick={onSetTrigger}
          className="flex-shrink-0 cursor-pointer w-5 h-5 flex items-center justify-center bg-transparent border-none p-0 mt-px"
          title={isTrigger ? "Trigger behavior" : "Set as trigger"}
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
          />

          {/* Dimension dots */}
          {behavior.dimensions && behavior.dimensions.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {behavior.dimensions.map((d) => (
                <span
                  key={d.dimension}
                  className="w-1.5 h-1.5 rounded-full"
                  title={DIMENSION_LABELS[d.dimension as DimensionKey] || d.dimension}
                  style={{
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
              className="font-sans cursor-pointer flex items-center gap-1 text-[11px] text-sage-450 bg-transparent border-none pt-0.5"
            >
              <span className="text-sage-300">&rarr;</span>
              Pattern: {linkedPattern.name}
            </button>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 cursor-pointer w-5 h-5 flex items-center justify-center bg-transparent border-none text-base text-earth-200 p-0 mt-px"
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
      <div className="pl-5 pt-1.5">
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
          className="font-sans w-full text-sm text-earth-700 bg-sand-50 border border-sage-450 rounded-lg px-2.5 py-1.5 outline-none"
        />
      </div>
    );
  }

  return (
    <div className="pl-5 pt-1.5">
      <button
        onClick={() => setAdding(true)}
        className="font-sans cursor-pointer flex items-center gap-1.5 text-[13px] text-sage-300 bg-transparent border-none p-0"
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
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="font-sans cursor-pointer w-full text-left flex items-center gap-2 bg-transparent border-none p-0 text-[11px] tracking-[0.1em] uppercase text-sage-300"
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
        <span className="text-earth-200">({items.length})</span>
      </button>

      {open && (
        <div className="mt-1.5 pl-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 pt-1">
              <div className="flex-1 min-w-0">
                <EditableText
                  value={String(item[nameKey])}
                  placeholder="Description"
                  onSave={(v) => onItemSave(i, v)}
                  textSize="text-[13px]"
                />
                {item.timeframe && (
                  <span className="font-sans text-[11px] text-earth-300">
                    {item.timeframe}
                  </span>
                )}
              </div>
              <button
                onClick={() => onItemRemove(i)}
                className="flex-shrink-0 cursor-pointer w-[18px] h-[18px] flex items-center justify-center bg-transparent border-none text-sm text-earth-200 p-0"
              >
                &times;
              </button>
            </div>
          ))}

          {adding ? (
            <div className="pt-1">
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
                className="font-sans w-full text-[13px] text-earth-700 bg-sand-50 border border-sage-450 rounded-lg px-2.5 py-[5px] outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="font-sans cursor-pointer flex items-center gap-1 text-xs text-sage-300 bg-transparent border-none pt-1"
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
    const updated = [...behaviors];
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
      className="mx-4 overflow-hidden bg-sand-50 rounded-xl border border-sand-300 p-4 mt-3 max-h-[65vh] overflow-y-auto animate-expand-panel-in"
    >
      {/* Header: name + close */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <EditableText
            value={aspiration.clarifiedText || aspiration.rawText}
            placeholder="Name this aspiration"
            onSave={onNameSave}
            serif
            textSize="text-xl"
          />

          {/* Status chip — tappable */}
          <button
            onClick={handleStatusTap}
            className={`inline-block font-sans font-medium mt-1 cursor-pointer text-[11px] tracking-[0.06em] uppercase px-2.5 py-0.5 rounded-xl ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border || ""}`}
          >
            {displayStatus}
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none text-lg text-earth-400 -mt-0.5"
          aria-label="Close panel"
        >
          &times;
        </button>
      </div>

      {/* Summary line */}
      {aspiration.summary && (
        <p className="font-sans text-[13px] leading-normal text-sage-450 mt-1.5">
          {aspiration.summary}
        </p>
      )}

      {/* Dimension dots */}
      {aspiration.dimensionsTouched && aspiration.dimensionsTouched.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {aspiration.dimensionsTouched.map((dim) => (
            <div key={dim} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
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

      {/* ── Decomposition chain ── */}
      <div className="mt-3.5">
        <span className="font-sans text-[11px] tracking-[0.1em] uppercase text-sage-300">
          This week
        </span>

        <div className="mt-1">
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
        <div className="mt-4 pt-3 border-t border-sand-250">
          <div className="flex gap-3">
            {onArchive && (
              <button
                onClick={onArchive}
                className="font-sans font-medium cursor-pointer text-[13px] px-4 py-2 rounded-[10px] bg-transparent border border-sage-450 text-sage-450"
              >
                Archive
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="font-sans font-medium cursor-pointer text-[13px] px-4 py-2 rounded-[10px] bg-transparent border-none text-rose"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* Saved indicator */}
      {dirty && (
        <div className="font-sans mt-3 text-[11px] text-sage-300 text-right">
          Saved
        </div>
      )}
    </div>
  );
}
