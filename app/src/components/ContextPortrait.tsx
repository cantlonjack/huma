"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { KnownContext, KnownContextPerson } from "@/types/v2";

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
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size + 6}px`,
        height: `${size + 6}px`,
        background: "none",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 150ms",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-sand-200, #EDE6D8)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
    >
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <line x1="4" y1="4" x2="10" y2="10" stroke="var(--color-earth-300, #A89A86)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="4" x2="4" y2="10" stroke="var(--color-earth-300, #A89A86)" strokeWidth="1.5" strokeLinecap="round" />
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
      className="font-sans outline-none w-full"
      style={{
        ...style,
        cursor: "text",
        background: "var(--color-sand-200, #EDE6D8)",
        borderRadius: "4px",
        padding: "2px 4px",
        margin: "-2px -4px",
        border: "none",
      }}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
        placeholder={placeholders[fieldKey] || "Value"}
        className="font-sans outline-none"
        style={{
          fontSize: "14px",
          color: "var(--color-sage-600, #4A6E50)",
          background: "var(--color-sand-200, #EDE6D8)",
          borderRadius: "4px",
          padding: "4px 8px",
          border: "none",
        }}
      />
      {needsDetail && (
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
          placeholder={detailPlaceholders[fieldKey] || "Detail"}
          className="font-sans outline-none"
          style={{
            fontSize: "13px",
            color: "var(--color-sage-500, #5E8A63)",
            background: "var(--color-sand-200, #EDE6D8)",
            borderRadius: "4px",
            padding: "4px 8px",
            border: "none",
          }}
        />
      )}
      <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
        <button
          onClick={handleSubmit}
          className="font-sans"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#FAF8F3",
            background: "var(--color-amber-600, #B5621E)",
            border: "none",
            borderRadius: "6px",
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="font-sans"
          style={{
            fontSize: "12px",
            color: "var(--color-earth-500, #6B6358)",
            background: "var(--color-sand-200, #EDE6D8)",
            border: "none",
            borderRadius: "6px",
            padding: "4px 12px",
            cursor: "pointer",
          }}
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
    <span
      className="font-sans font-medium block"
      style={{
        fontSize: "9px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--color-sage-400, #8BAF8E)",
        marginBottom: "4px",
      }}
    >
      {children}
    </span>
  );
}

// ─── Summary Line ───────────────────────────────────────────────────────────

function buildSummary(ctx: KnownContext): string {
  const parts: string[] = [];
  const peopleCount = ctx.people?.filter((p) => p.name).length || 0;
  if (peopleCount > 0) parts.push(`${peopleCount} ${peopleCount === 1 ? "person" : "people"}`);
  const resourceCount = ctx.resources?.filter(Boolean).length || 0;
  if (resourceCount > 0) parts.push(`${resourceCount} ${resourceCount === 1 ? "resource" : "resources"}`);
  if (ctx.place?.name) parts.push(ctx.place.name);
  return parts.join(" · ");
}

// ─── Component ──────────────────────────────────────────────────────────────

const contentStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--color-sage-600, #4A6E50)",
  lineHeight: "1.5",
};

export default function ContextPortrait({ context, onSave, manageMode, onRemoveField }: ContextPortraitProps) {
  const [addingField, setAddingField] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Check if there's any content to show
  const hasPlace = !!context.place?.name;
  const hasWork = !!context.work?.title;
  const hasPeople = (context.people?.filter((p) => p.name).length || 0) > 0;
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

  // ── Removal helpers ──

  const handleRemoveField = (fieldPath: string) => {
    if (onRemoveField) {
      onRemoveField(fieldPath);
    }
  };

  const handleRemovePerson = (index: number) => {
    // Find the actual index in the full array (accounting for filtered empty names)
    const allPeople = context.people || [];
    const namedPeople = allPeople.filter((p) => p.name);
    const person = namedPeople[index];
    const realIndex = allPeople.indexOf(person);
    if (realIndex >= 0) {
      handleRemoveField(`people[${realIndex}]`);
    }
  };

  const handleRemoveResource = (index: number) => {
    const allResources = context.resources || [];
    const nonEmpty = allResources.filter(Boolean);
    const resource = nonEmpty[index];
    const realIndex = allResources.indexOf(resource);
    if (realIndex >= 0) {
      handleRemoveField(`resources[${realIndex}]`);
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <SectionLabel>{label}</SectionLabel>
      {manageMode && onRemoveField && (
        <RemoveButton onClick={() => handleRemoveField(fieldKey)} />
      )}
    </div>
  );

  return (
    <div
      style={{
        margin: "0 16px",
        padding: "16px",
        background: "var(--color-sand-100, #F6F1E9)",
        border: "1px solid var(--color-sand-300, #DDD4C0)",
        borderRadius: "16px",
      }}
    >
      {/* Summary line */}
      {summary && (
        <p
          className="font-sans"
          style={{ fontSize: "12px", color: "var(--color-sage-400, #8BAF8E)", marginBottom: "12px" }}
        >
          {summary}
        </p>
      )}

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <SectionLabel>People</SectionLabel>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {context.people!
                .filter((p) => p.name)
                .map((person, i) => (
                  <div key={i} className="font-sans" style={{ ...contentStyle, display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0 }}>
                      <EditableText
                        value={person.name}
                        onSave={(v) => savePerson(i, { ...person, name: v })}
                        style={contentStyle}
                      />
                      {person.role && (
                        <>
                          <span style={{ color: "var(--color-sage-400, #8BAF8E)" }}>·</span>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <SectionLabel>Resources</SectionLabel>
            </div>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {context.resources!
                .filter(Boolean)
                .map((res, i) => (
                  <li key={i} style={{ ...contentStyle, marginBottom: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
        <div style={{ marginTop: "16px", position: "relative" }}>
          <button
            onClick={() => setAddMenuOpen((prev) => !prev)}
            aria-label="Add context"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid var(--color-sage-400, #8BAF8E)",
              background: "none",
              cursor: "pointer",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-sage-50, #EDF3ED)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
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
                style={{ position: "fixed", inset: 0, zIndex: 9 }}
                onClick={() => setAddMenuOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "44px",
                  left: 0,
                  background: "var(--color-sand-50, #FAF8F3)",
                  border: "1px solid var(--color-sand-300, #DDD4C0)",
                  borderRadius: "12px",
                  padding: "4px 0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 10,
                  minWidth: "140px",
                }}
              >
                {missingFields.map((opt) => (
                  <button
                    key={opt.key + (opt.arrayItem ? "-add" : "")}
                    onClick={() => { setAddingField(opt.key); setAddMenuOpen(false); }}
                    className="font-sans"
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 16px",
                      fontSize: "13px",
                      color: "var(--color-earth-600, #5A5047)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-sand-100, #F6F1E9)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
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
        <p
          className="font-sans"
          style={{
            fontSize: "13px",
            color: "var(--color-earth-400, #8A7D6E)",
            fontStyle: "italic",
            textAlign: "center",
            margin: "8px 0",
          }}
        >
          No context yet
        </p>
      )}
    </div>
  );
}
