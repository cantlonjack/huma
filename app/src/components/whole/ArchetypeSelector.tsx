"use client";

import { useState } from "react";
import { DOMAIN_TEMPLATES, ORIENTATION_TEMPLATES } from "@/lib/archetype-templates";

interface ArchetypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSave: (selected: string[]) => void;
  initialSelected?: string[];
}

export default function ArchetypeSelector({
  open,
  onClose,
  onSave,
  initialSelected = [],
}: ArchetypeSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (arch: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(arch)) next.delete(arch);
      else next.add(arch);
      return next;
    });
  };

  const toggleExpand = (arch: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => (prev === arch ? null : arch));
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.3)",
          animation: "archselector-backdrop-in 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col"
        style={{
          maxHeight: "85vh",
          background: "#FAF8F3",
          borderRadius: "20px 20px 0 0",
          animation: "archselector-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center" style={{ padding: "12px 0 0" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#DDD4C0" }} />
        </div>

        <div className="overflow-y-auto" style={{ padding: "12px 20px 24px" }}>
          {/* Header */}
          <h3
            className="font-serif font-medium"
            style={{ fontSize: "20px", color: "#3A5A40", lineHeight: "1.3" }}
          >
            Your Archetypes
          </h3>
          <p
            className="font-sans"
            style={{ fontSize: "13px", color: "#A8C4AA", marginTop: "4px" }}
          >
            Select what fits. You can hold more than one.
          </p>

          {/* Domain section */}
          <p
            className="font-sans font-medium"
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#A8C4AA",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            DOMAIN
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {DOMAIN_TEMPLATES.map((tmpl) => {
              const isSelected = selected.has(tmpl.name);
              const isExpanded = expanded === tmpl.name;
              return (
                <div key={tmpl.name}>
                  <button
                    onClick={() => toggle(tmpl.name)}
                    className="cursor-pointer text-left w-full"
                    style={{
                      padding: "14px 16px",
                      borderRadius: "14px",
                      background: isSelected ? "#EBF3EC" : "#FAF8F3",
                      border: isSelected ? "1.5px solid #8BAF8E" : "1px solid #EDE6D8",
                      transition: "all 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          className="font-serif font-semibold"
                          style={{
                            fontSize: "17px",
                            lineHeight: "1.3",
                            color: isSelected ? "#3A5A40" : "#554D42",
                            margin: 0,
                          }}
                        >
                          {tmpl.name}
                        </h4>
                        <p
                          className="font-sans"
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.4",
                            color: "#6B6358",
                            margin: "3px 0 0",
                          }}
                        >
                          {tmpl.description}
                        </p>
                      </div>
                      {/* Checkmark indicator */}
                      {isSelected && (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "10px",
                            background: "#6B8F71",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Learn more toggle */}
                    <span
                      onClick={(e) => toggleExpand(tmpl.name, e)}
                      className="font-sans"
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontSize: "11px",
                        color: "#A8C4AA",
                        cursor: "pointer",
                      }}
                    >
                      {isExpanded ? "Less" : "Learn more"} →
                    </span>

                    {/* Expanded concerns */}
                    {isExpanded && tmpl.typicalConcerns.length > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid #EDE6D8",
                        }}
                      >
                        <p
                          className="font-sans"
                          style={{
                            fontSize: "10px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#A89E90",
                            margin: "0 0 6px",
                          }}
                        >
                          Typical concerns
                        </p>
                        {tmpl.typicalConcerns.map((concern, i) => (
                          <p
                            key={i}
                            className="font-sans italic"
                            style={{
                              fontSize: "12px",
                              lineHeight: "1.5",
                              color: "#8C8274",
                              margin: i === 0 ? 0 : "2px 0 0",
                              paddingLeft: "8px",
                            }}
                          >
                            {concern}
                          </p>
                        ))}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Orientation section */}
          <p
            className="font-sans font-medium"
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#A8C4AA",
              marginTop: "24px",
              marginBottom: "10px",
            }}
          >
            ORIENTATION
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ORIENTATION_TEMPLATES.map((tmpl) => {
              const isSelected = selected.has(tmpl.name);
              const isExpanded = expanded === tmpl.name;
              return (
                <button
                  key={tmpl.name}
                  onClick={() => toggle(tmpl.name)}
                  className="cursor-pointer text-left w-full"
                  style={{
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: isSelected ? "#EBF3EC" : "#FAF8F3",
                    border: isSelected ? "1.5px solid #8BAF8E" : "1px solid #EDE6D8",
                    transition: "all 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        className="font-serif font-semibold"
                        style={{
                          fontSize: "17px",
                          lineHeight: "1.3",
                          color: isSelected ? "#3A5A40" : "#554D42",
                          margin: 0,
                        }}
                      >
                        {tmpl.name}
                      </h4>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.4",
                          color: "#6B6358",
                          margin: "3px 0 0",
                        }}
                      >
                        {tmpl.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "10px",
                          background: "#6B8F71",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Learn more toggle */}
                  <span
                    onClick={(e) => toggleExpand(tmpl.name, e)}
                    className="font-sans"
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      fontSize: "11px",
                      color: "#A8C4AA",
                      cursor: "pointer",
                    }}
                  >
                    {isExpanded ? "Less" : "Learn more"} →
                  </span>

                  {/* Expanded modifier */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid #EDE6D8",
                      }}
                    >
                      <p
                        className="font-sans italic"
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.5",
                          color: "#8C8274",
                          margin: 0,
                        }}
                      >
                        {tmpl.modifier}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={selected.size === 0}
            className="w-full font-sans font-medium cursor-pointer disabled:opacity-40"
            style={{
              marginTop: "24px",
              padding: "14px",
              borderRadius: "12px",
              fontSize: "15px",
              background: "#B5621E",
              color: "white",
              border: "none",
            }}
          >
            Save archetypes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes archselector-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes archselector-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
