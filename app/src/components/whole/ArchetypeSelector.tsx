"use client";

import { useState } from "react";

const OUTER_ARCHETYPES = [
  "Earth Tender", "Creator", "Entrepreneur",
  "Official", "Economic Shaper", "Spirit",
  "Media", "Educator", "Parent",
];

const INNER_ARCHETYPES = [
  "Initiator", "Manifestor", "Destabilizer",
];

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

  const toggle = (arch: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(arch)) next.delete(arch);
      else next.add(arch);
      return next;
    });
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
          maxHeight: "80vh",
          background: "#FAF8F3",
          borderRadius: "20px 20px 0 0",
          animation: "archselector-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center" style={{ padding: "12px 0 0" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#DDD4C0" }} />
        </div>

        <div className="overflow-y-auto" style={{ padding: "12px 24px 24px" }}>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {OUTER_ARCHETYPES.map((arch) => {
              const isSelected = selected.has(arch);
              return (
                <button
                  key={arch}
                  onClick={() => toggle(arch)}
                  className="font-sans cursor-pointer"
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    textAlign: "center",
                    background: isSelected ? "#EDF3ED" : "#F5F3EE",
                    color: isSelected ? "#3A5A40" : "#6B8F71",
                    border: isSelected ? "1.5px solid #6B8F71" : "1px solid #DDD4C0",
                    fontWeight: isSelected ? 600 : 400,
                    transition: "all 160ms ease",
                  }}
                >
                  {arch}
                </button>
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
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            ORIENTATION
          </p>
          <div className="flex gap-2">
            {INNER_ARCHETYPES.map((arch) => {
              const isSelected = selected.has(arch);
              return (
                <button
                  key={arch}
                  onClick={() => toggle(arch)}
                  className="font-sans cursor-pointer flex-1"
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    textAlign: "center",
                    background: isSelected ? "#EDF3ED" : "#F5F3EE",
                    color: isSelected ? "#3A5A40" : "#6B8F71",
                    border: isSelected ? "1.5px solid #6B8F71" : "1px solid #DDD4C0",
                    fontWeight: isSelected ? 600 : 400,
                    transition: "all 160ms ease",
                  }}
                >
                  {arch}
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
