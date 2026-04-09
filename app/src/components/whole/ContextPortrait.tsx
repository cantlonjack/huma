"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { KnownContext, KnownContextPerson } from "@/types/v2";

// ─── Undo Toast ────────────────────────────────────────────────────────────

function UndoToast({ label, onUndo, onExpire }: { label: string; onUndo: () => void; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    expireRef.current = setTimeout(onExpire, 5000);
    timerRef.current = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => {
      if (expireRef.current) clearTimeout(expireRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onExpire]);

  return (
    <div
      className="fixed left-4 right-4 z-50 bg-ink-700 text-sand-50 rounded-xl px-4 py-3 flex items-center justify-between shadow-lg animate-entrance-1"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
    >
      <span className="font-sans text-[13px]">
        Removed {label}. <span className="text-sand-300">({remaining}s)</span>
      </span>
      <button
        onClick={() => {
          if (expireRef.current) clearTimeout(expireRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          onUndo();
        }}
        className="font-sans font-semibold cursor-pointer text-[13px] text-amber-400 bg-transparent border-none px-2 py-1"
      >
        Undo
      </button>
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContextPortraitProps {
  context: KnownContext;
  onSave: (updated: KnownContext) => void;
  manageMode?: boolean;
  onRemoveField?: (fieldPath: string) => void;
}

// ─── Available context field types for "Add context" ────────────────────────

const CONTEXT_FIELD_OPTIONS: { key: string; label: string; arrayItem?: boolean }[] = [
  { key: "place", label: "Place" },
  { key: "work", label: "Work" },
  { key: "stage", label: "Stage" },
  { key: "health", label: "Health" },
  { key: "time", label: "Time" },
  { key: "people", label: "Person", arrayItem: true },
  { key: "resources", label: "Resource", arrayItem: true },
];

// ─── Remove Button ──────────────────────────────────────────────────────────

function RemoveButton({ onClick, size = 14 }: { onClick: () => void; size?: number }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label="Remove"
      className="inline-flex items-center justify-center bg-transparent border-none rounded-full cursor-pointer p-0 shrink-0 transition-colors duration-150 hover:bg-sand-200"
      style={{ width: `${size + 6}px`, height: `${size + 6}px` }}
    >
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <line x1="4" y1="4" x2="10" y2="10" stroke="var(--color-earth-300)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="4" x2="4" y2="10" stroke="var(--color-earth-300)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// ─── Editable Field ─────────────────────────────────────────────────────────

function EditableText({
  value,
  onSave,
  className,
  style,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
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
        className={className}
        style={{ ...style, cursor: "pointer" }}
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
      onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
      aria-label="Edit value"
      className="font-sans outline-none w-full cursor-text bg-sand-200 rounded-sm px-1 py-0.5 -mx-1 -my-0.5 border-none"
      style={style}
    />
  );
}

// ─── Inline Add Field ───────────────────────────────────────────────────────

function InlineAddField({
  fieldKey,
  onAdd,
  onCancel,
}: {
  fieldKey: string;
  onAdd: (value: string, detail?: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [detail, setDetail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const needsDetail = fieldKey === "place" || fieldKey === "work" || fieldKey === "stage";
  const placeholders: Record<string, string> = {
    place: "City or region",
    work: "Title or role",
    stage: "Life stage",
    health: "Health context",
    time: "Time constraints",
    people: "Name",
    resources: "Resource",
  };
  const detailPlaceholders: Record<string, string> = {
    place: "More detail (optional)",
    work: "Detail (optional)",
    stage: "Detail (optional)",
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) { onCancel(); return; }
    onAdd(trimmed, detail.trim() || undefined);
  };

  return (
    <div className="flex flex-col gap-1 mt-1">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
        placeholder={placeholders[fieldKey] || "Value"}
        className="font-sans outline-none text-sm text-sage-600 bg-sand-200 rounded-sm px-2 py-1 border-none"
      />
      {needsDetail && (
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
          placeholder={detailPlaceholders[fieldKey] || "Detail"}
          className="font-sans outline-none text-[13px] text-sage-500 bg-sand-200 rounded-sm px-2 py-1 border-none"
        />
      )}
      <div className="flex gap-2 mt-0.5">
        <button
          onClick={handleSubmit}
          className="font-sans text-xs font-semibold text-sand-50 bg-amber-600 border-none rounded-md px-3 py-1 cursor-pointer"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="font-sans text-xs text-earth-500 bg-sand-200 border-none rounded-md px-3 py-1 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Section Label ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans font-medium block text-[9px] tracking-[0.14em] uppercase text-sage-400 mb-1">
      {children}
    </span>
  );
}

// ─── Summary Line ───────────────────────────────────────────────────────────

function buildSummary(ctx: KnownContext): string {
  const parts: string[] = [];
  const peopleCount = Array.isArray(ctx.people) ? ctx.people.filter((p) => p.name).length : 0;
  if (peopleCount > 0) parts.push(`${peopleCount} ${peopleCount === 1 ? "person" : "people"}`);
  const resourceCount = ctx.resources?.filter(Boolean).length || 0;
  if (resourceCount > 0) parts.push(`${resourceCount} ${resourceCount === 1 ? "resource" : "resources"}`);
  if (ctx.place?.name) parts.push(ctx.place.name);
  return parts.join(" · ");
}

// ─── Component ──────────────────────────────────────────────────────────────

const contentStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
};
const contentClassName = "text-sage-600";

export default function ContextPortrait({ context, onSave, manageMode, onRemoveField }: ContextPortraitProps) {
  const [addingField, setAddingField] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Undo state: pending deletion that hasn't been committed yet
  const [pendingRemoval, setPendingRemoval] = useState<{
    fieldPath: string;
    label: string;
  } | null>(null);

  // Check if there's any content to show
  const hasPlace = !!context.place?.name;
  const hasWork = !!context.work?.title;
  const hasPeople = (Array.isArray(context.people) ? context.people.filter((p) => p.name).length : 0) > 0;
  const hasStage = !!context.stage?.label;
  const hasHealth = !!context.health?.detail;
  const hasTime = !!context.time?.detail;
  const hasResources = (context.resources?.filter(Boolean).length || 0) > 0;

  const hasAnything = hasPlace || hasWork || hasPeople || hasStage || hasHealth || hasTime || hasResources;

  // Determine which fields are missing (for "Add context" menu)
  const missingFields = CONTEXT_FIELD_OPTIONS.filter((opt) => {
    if (opt.arrayItem) return true; // Can always add more people/resources
    if (opt.key === "place") return !hasPlace;
    if (opt.key === "work") return !hasWork;
    if (opt.key === "stage") return !hasStage;
    if (opt.key === "health") return !hasHealth;
    if (opt.key === "time") return !hasTime;
    return false;
  });

  if (!hasAnything && !manageMode) return null;

  const summary = buildSummary(context);

  // ── Field save helpers ──

  const saveField = (field: string, value: unknown) => {
    onSave({ ...context, [field]: value });
  };

  const savePerson = (index: number, updated: KnownContextPerson) => {
    const people = [...(context.people || [])];
    people[index] = updated;
    saveField("people", people);
  };

  const saveResource = (index: number, value: string) => {
    const resources = [...(context.resources || [])];
    resources[index] = value;
    saveField("resources", resources);
  };

  // ── Removal helpers (staged with undo) ──

  const stageRemoval = (fieldPath: string, label: string) => {
    setPendingRemoval({ fieldPath, label });
  };

  const commitRemoval = useCallback(() => {
    if (pendingRemoval && onRemoveField) {
      onRemoveField(pendingRemoval.fieldPath);
    }
    setPendingRemoval(null);
  }, [pendingRemoval, onRemoveField]);

  const undoRemoval = useCallback(() => {
    setPendingRemoval(null);
  }, []);

  const handleRemoveField = (fieldPath: string, label?: string) => {
    stageRemoval(fieldPath, label || fieldPath);
  };

  const handleRemovePerson = (index: number) => {
    const allPeople = context.people || [];
    const namedPeople = allPeople.filter((p) => p.name);
    const person = namedPeople[index];
    const realIndex = allPeople.indexOf(person);
    if (realIndex >= 0) {
      stageRemoval(`people[${realIndex}]`, person.name);
    }
  };

  const handleRemoveResource = (index: number) => {
    const allResources = context.resources || [];
    const nonEmpty = allResources.filter(Boolean);
    const resource = nonEmpty[index];
    const realIndex = allResources.indexOf(resource);
    if (realIndex >= 0) {
      stageRemoval(`resources[${realIndex}]`, resource);
    }
  };

  // ── Add field handler ──

  const handleAddField = (fieldKey: string, value: string, detail?: string) => {
    const updated = { ...context };
    switch (fieldKey) {
      case "place":
        updated.place = { name: value, detail: detail || "" };
        break;
      case "work":
        updated.work = { title: value, detail: detail || "" };
        break;
      case "stage":
        updated.stage = { label: value, detail: detail || "" };
        break;
      case "health":
        updated.health = { detail: value };
        break;
      case "time":
        updated.time = { detail: value };
        break;
      case "people":
        updated.people = [...(updated.people || []), { name: value, role: detail || "" }];
        break;
      case "resources":
        updated.resources = [...(updated.resources || []), value];
        break;
    }
    onSave(updated);
    setAddingField(null);
    setAddMenuOpen(false);
  };

  // ── Section renderer with optional remove ──

  const renderSectionHeader = (label: string, fieldKey: string) => (
    <div className="flex items-center justify-between">
      <SectionLabel>{label}</SectionLabel>
      {manageMode && onRemoveField && (
        <RemoveButton onClick={() => handleRemoveField(fieldKey, label)} />
      )}
    </div>
  );

  return (
    <div className="mx-4 p-4 bg-sand-100 border border-sand-300 rounded-2xl">
      {/* Summary line */}
      {summary && (
        <p className="font-sans text-xs text-sage-400 mb-3">
          {summary}
        </p>
      )}

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {hasPlace && (
          <div>
            {renderSectionHeader("Place", "place")}
            <EditableText
              value={[context.place!.name, context.place!.detail].filter(Boolean).join(" — ")}
              onSave={(v) => {
                const parts = v.split(" — ");
                saveField("place", { name: parts[0] || "", detail: parts.slice(1).join(" — ") || "" });
              }}
              className="font-sans"
              style={contentStyle}
            />
          </div>
        )}

        {hasWork && (
          <div>
            {renderSectionHeader("Work", "work")}
            <EditableText
              value={[context.work!.title, context.work!.detail].filter(Boolean).join(" — ")}
              onSave={(v) => {
                const parts = v.split(" — ");
                saveField("work", { title: parts[0] || "", detail: parts.slice(1).join(" — ") || "" });
              }}
              className="font-sans"
              style={contentStyle}
            />
          </div>
        )}

        {hasPeople && (
          <div>
            <div className="flex items-center justify-between">
              <SectionLabel>People</SectionLabel>
            </div>
            <div className="flex flex-col gap-1">
              {context.people!
                .filter((p) => p.name)
                .map((person, i) => (
                  <div key={i} className={`font-sans flex items-center gap-1 ${contentClassName}`} style={contentStyle}>
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <EditableText
                        value={person.name}
                        onSave={(v) => savePerson(i, { ...person, name: v })}
                        style={contentStyle}
                      />
                      {person.role && (
                        <>
                          <span className="text-sage-400">·</span>
                          <EditableText
                            value={person.role}
                            onSave={(v) => savePerson(i, { ...person, role: v })}
                            style={contentStyle}
                          />
                        </>
                      )}
                    </div>
                    {manageMode && onRemoveField && (
                      <RemoveButton onClick={() => handleRemovePerson(i)} />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {hasStage && (
          <div>
            {renderSectionHeader("Stage", "stage")}
            <EditableText
              value={[context.stage!.label, context.stage!.detail].filter(Boolean).join(" — ")}
              onSave={(v) => {
                const parts = v.split(" — ");
                saveField("stage", { label: parts[0] || "", detail: parts.slice(1).join(" — ") || "" });
              }}
              className="font-sans"
              style={contentStyle}
            />
          </div>
        )}

        {hasHealth && (
          <div>
            {renderSectionHeader("Health", "health")}
            <EditableText
              value={context.health!.detail}
              onSave={(v) => saveField("health", { detail: v })}
              className="font-sans"
              style={contentStyle}
            />
          </div>
        )}

        {hasTime && (
          <div>
            {renderSectionHeader("Time", "time")}
            <EditableText
              value={context.time!.detail}
              onSave={(v) => saveField("time", { detail: v })}
              className="font-sans"
              style={contentStyle}
            />
          </div>
        )}

        {hasResources && (
          <div>
            <div className="flex items-center justify-between">
              <SectionLabel>Resources</SectionLabel>
            </div>
            <ul className="m-0 pl-4">
              {context.resources!
                .filter(Boolean)
                .map((res, i) => (
                  <li key={i} className={`mb-0.5 ${contentClassName}`} style={contentStyle}>
                    <div className="flex items-center gap-1">
                      <EditableText
                        value={res}
                        onSave={(v) => saveResource(i, v)}
                        style={{ ...contentStyle, flex: 1, minWidth: 0 }}
                      />
                      {manageMode && onRemoveField && (
                        <RemoveButton onClick={() => handleRemoveResource(i)} />
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Inline add field */}
        {addingField && (
          <div>
            <SectionLabel>
              {CONTEXT_FIELD_OPTIONS.find((o) => o.key === addingField)?.label || addingField}
            </SectionLabel>
            <InlineAddField
              fieldKey={addingField}
              onAdd={(value, detail) => handleAddField(addingField, value, detail)}
              onCancel={() => { setAddingField(null); setAddMenuOpen(false); }}
            />
          </div>
        )}
      </div>

      {/* Add context affordance */}
      {missingFields.length > 0 && !addingField && (
        <div className="mt-4 relative">
          <button
            onClick={() => setAddMenuOpen((prev) => !prev)}
            aria-label="Add context"
            className="flex items-center justify-center w-9 h-9 rounded-full border-[1.5px] border-sage-400 bg-transparent cursor-pointer transition-colors duration-150 hover:bg-sage-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="3" x2="8" y2="13" stroke="var(--color-sage-400, #8BAF8E)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="8" x2="13" y2="8" stroke="var(--color-sage-400, #8BAF8E)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {addMenuOpen && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-[9]"
                onClick={() => setAddMenuOpen(false)}
              />
              <div className="absolute bottom-11 left-0 bg-sand-50 border border-sand-300 rounded-xl py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-10 min-w-[140px]">
                {missingFields.map((opt) => (
                  <button
                    key={opt.key + (opt.arrayItem ? "-add" : "")}
                    onClick={() => { setAddingField(opt.key); setAddMenuOpen(false); }}
                    className="font-sans block w-full text-left px-4 py-2 text-[13px] text-earth-600 bg-transparent border-none cursor-pointer transition-colors duration-100 hover:bg-sand-100"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty state when manage mode is on but no content */}
      {!hasAnything && manageMode && (
        <p className="font-sans text-[13px] text-earth-400 italic text-center my-2">
          No context yet
        </p>
      )}

      {/* Undo toast for pending deletions */}
      {pendingRemoval && (
        <UndoToast
          label={pendingRemoval.label}
          onUndo={undoRemoval}
          onExpire={commitRemoval}
        />
      )}
    </div>
  );
}
