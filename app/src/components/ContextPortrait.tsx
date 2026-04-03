"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { KnownContext, KnownContextPerson } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContextPortraitProps {
  context: KnownContext;
  onSave: (updated: KnownContext) => void;
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

export default function ContextPortrait({ context, onSave }: ContextPortraitProps) {
  // Check if there's any content to show
  const hasPlace = !!context.place?.name;
  const hasWork = !!context.work?.title;
  const hasPeople = (context.people?.filter((p) => p.name).length || 0) > 0;
  const hasStage = !!context.stage?.label;
  const hasHealth = !!context.health?.detail;
  const hasTime = !!context.time?.detail;
  const hasResources = (context.resources?.filter(Boolean).length || 0) > 0;

  const hasAnything = hasPlace || hasWork || hasPeople || hasStage || hasHealth || hasTime || hasResources;
  if (!hasAnything) return null;

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
            <SectionLabel>Place</SectionLabel>
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
            <SectionLabel>Work</SectionLabel>
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
            <SectionLabel>People</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {context.people!
                .filter((p) => p.name)
                .map((person, i) => (
                  <div key={i} className="font-sans" style={{ ...contentStyle, display: "flex", gap: "4px" }}>
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
                ))}
            </div>
          </div>
        )}

        {hasStage && (
          <div>
            <SectionLabel>Stage</SectionLabel>
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
            <SectionLabel>Health</SectionLabel>
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
            <SectionLabel>Time</SectionLabel>
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
            <SectionLabel>Resources</SectionLabel>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {context.resources!
                .filter(Boolean)
                .map((res, i) => (
                  <li key={i} style={{ ...contentStyle, marginBottom: "2px" }}>
                    <EditableText
                      value={res}
                      onSave={(v) => saveResource(i, v)}
                      style={contentStyle}
                    />
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
