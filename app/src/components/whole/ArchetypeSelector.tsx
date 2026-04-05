"use client";

import { useState } from "react";
import { DOMAIN_TEMPLATES, ORIENTATION_TEMPLATES } from "@/lib/archetype-templates";

interface ArchetypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSave: (selected: string[]) => void;
  initialSelected?: string[];
}

function ArchetypeCard({
  name,
  description,
  isSelected,
  isExpanded,
  onToggle,
  onToggleExpand,
  expandedContent,
}: {
  name: string;
  description: string;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleExpand: (e: React.MouseEvent) => void;
  expandedContent: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className={`cursor-pointer text-left w-full p-3.5 px-4 rounded-[14px] transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isSelected
          ? "bg-sage-50 border-[1.5px] border-sage-400"
          : "bg-sand-50 border border-sand-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4
            className={`font-serif font-semibold text-[17px] leading-tight m-0 ${
              isSelected ? "text-sage-700" : "text-earth-600"
            }`}
          >
            {name}
          </h4>
          <p className="font-sans text-[13px] leading-snug text-earth-500 mt-[3px] mb-0">
            {description}
          </p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-sage-450 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      <span
        onClick={onToggleExpand}
        className="font-sans inline-block mt-1.5 text-[11px] text-sage-300 cursor-pointer"
      >
        {isExpanded ? "Less" : "Learn more"} →
      </span>

      {isExpanded && expandedContent}
    </button>
  );
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
        className="absolute inset-0 bg-black/30"
        style={{
          animation: "archselector-backdrop-in 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col max-h-[85vh] bg-sand-50 rounded-t-[20px]"
        style={{
          animation: "archselector-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-3">
          <div className="w-9 h-1 rounded-sm bg-sand-300" />
        </div>

        <div className="overflow-y-auto px-5 pt-3 pb-6">
          {/* Header */}
          <h3 className="font-serif font-medium text-[20px] text-sage-700 leading-tight">
            Your Archetypes
          </h3>
          <p className="font-sans text-[13px] text-sage-300 mt-1">
            Select what fits. You can hold more than one.
          </p>

          {/* Domain section */}
          <p className="font-sans font-medium text-[10px] tracking-[0.18em] uppercase text-sage-300 mt-5 mb-2.5">
            DOMAIN
          </p>
          <div className="flex flex-col gap-2">
            {DOMAIN_TEMPLATES.map((tmpl) => (
              <div key={tmpl.name}>
                <ArchetypeCard
                  name={tmpl.name}
                  description={tmpl.description}
                  isSelected={selected.has(tmpl.name)}
                  isExpanded={expanded === tmpl.name}
                  onToggle={() => toggle(tmpl.name)}
                  onToggleExpand={(e) => toggleExpand(tmpl.name, e)}
                  expandedContent={
                    tmpl.typicalConcerns.length > 0 ? (
                      <div className="mt-2 pt-2 border-t border-sand-200">
                        <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-earth-300 mb-1.5 mt-0">
                          Typical concerns
                        </p>
                        {tmpl.typicalConcerns.map((concern, i) => (
                          <p
                            key={i}
                            className={`font-sans italic text-xs leading-normal text-earth-400 pl-2 ${i === 0 ? "mt-0" : "mt-0.5"} mb-0`}
                          >
                            {concern}
                          </p>
                        ))}
                      </div>
                    ) : null
                  }
                />
              </div>
            ))}
          </div>

          {/* Orientation section */}
          <p className="font-sans font-medium text-[10px] tracking-[0.18em] uppercase text-sage-300 mt-6 mb-2.5">
            ORIENTATION
          </p>
          <div className="flex flex-col gap-2">
            {ORIENTATION_TEMPLATES.map((tmpl) => (
              <ArchetypeCard
                key={tmpl.name}
                name={tmpl.name}
                description={tmpl.description}
                isSelected={selected.has(tmpl.name)}
                isExpanded={expanded === tmpl.name}
                onToggle={() => toggle(tmpl.name)}
                onToggleExpand={(e) => toggleExpand(tmpl.name, e)}
                expandedContent={
                  <div className="mt-2 pt-2 border-t border-sand-200">
                    <p className="font-sans italic text-xs leading-normal text-earth-400 m-0">
                      {tmpl.modifier}
                    </p>
                  </div>
                }
              />
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={selected.size === 0}
            className="w-full font-sans font-medium cursor-pointer disabled:opacity-40 mt-6 py-3.5 rounded-xl text-[15px] bg-amber-600 text-white border-none"
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
