"use client";

import { useState, useRef, useEffect } from "react";
import type { ConversationContext } from "@/engine/types";

interface MapPreviewProps {
  context: Partial<ConversationContext>;
}

interface Section {
  key: string;
  label: string;
  content: string | undefined;
}

export default function MapPreview({ context }: MapPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newlyCompletedKey, setNewlyCompletedKey] = useState<string | null>(null);
  const prevKeysRef = useRef<Set<string>>(new Set());

  const sections: Section[] = [
    { key: "ikigai", label: "Your Essence", content: context.ikigai?.essenceSynthesis },
    { key: "holistic", label: "Holistic Context", content: context.holisticContext?.synthesis },
    { key: "landscape", label: "Landscape", content: context.landscape?.synthesis },
    { key: "enterprises", label: "Enterprises", content: context.enterprises?.reasoning },
    { key: "nodal", label: "Nodal Interventions", content: context.nodalInterventions?.cascadeAnalysis },
    { key: "operational", label: "Operational Design", content: context.operationalDesign?.synthesis },
  ];

  const completedCount = sections.filter(s => s.content).length;

  // Detect newly completed sections for animation + auto-expand on first capture
  useEffect(() => {
    const currentKeys = new Set(sections.filter(s => s.content).map(s => s.key));
    for (const key of currentKeys) {
      if (!prevKeysRef.current.has(key)) {
        setNewlyCompletedKey(key);
        // Auto-expand on first section capture
        if (prevKeysRef.current.size === 0) {
          setIsExpanded(true);
          // Auto-collapse after 4 seconds so it doesn't block the conversation
          setTimeout(() => setIsExpanded(false), 4000);
        }
        const timer = setTimeout(() => setNewlyCompletedKey(null), 1500);
        prevKeysRef.current = currentKeys;
        return () => clearTimeout(timer);
      }
    }
    prevKeysRef.current = currentKeys;
  }, [completedCount]);

  return (
    <>
      {/* Desktop: collapsible sidebar */}
      <div className="hidden lg:block no-print">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-20 bg-sand-100/90 backdrop-blur border border-r-0 border-sand-200 rounded-l-lg px-2 py-4 text-earth-600 hover:bg-sand-200/90 transition-colors"
          title={isExpanded ? "Hide map preview" : "Show map preview"}
          aria-expanded={isExpanded}
          aria-label="Map preview"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium" style={{ writingMode: "vertical-rl" }}>
              Your Map
            </span>
            <div className="flex flex-col gap-1">
              {sections.map((s) => (
                <div
                  key={s.key}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${s.content ? "bg-sage-400" : "bg-sand-300"}`}
                />
              ))}
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="fixed right-0 top-16 bottom-0 w-80 z-10 bg-sand-50/95 backdrop-blur border-l border-sand-200 overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-sm text-earth-700 font-medium">
                  Your Map &middot; {completedCount}/6
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-earth-500 hover:text-earth-700 text-sm"
                  aria-label="Close map preview"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.key}
                    className={newlyCompletedKey === section.key ? "animate-pulse" : ""}
                  >
                    <h4 className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                      section.content ? "text-sage-600" : "text-sand-400"
                    }`}>
                      {section.label}
                    </h4>
                    {section.content ? (
                      <p className="text-sm text-earth-600 leading-relaxed font-serif line-clamp-4">
                        {section.content}
                      </p>
                    ) : (
                      <p className="text-sm text-sand-400 italic">
                        Not yet explored
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: floating indicator — positioned above the input bar */}
      <div className="lg:hidden no-print">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="fixed bottom-[4.5rem] right-4 z-20 bg-sand-100/90 backdrop-blur border border-sand-200 rounded-full px-3 py-2 text-xs text-earth-600 shadow-sm"
          aria-expanded={isExpanded}
          aria-label={`Map preview: ${completedCount} of 6 sections complete`}
        >
          <span className="flex items-center gap-1.5">
            {sections.map((s) => (
              <span
                key={s.key}
                className={`inline-block w-1.5 h-1.5 rounded-full transition-colors duration-300 ${s.content ? "bg-sage-400" : "bg-sand-300"}`}
              />
            ))}
            <span className="ml-1">Your Map</span>
          </span>
        </button>

        {isExpanded && (
          <div className="fixed inset-x-4 top-16 bottom-[7rem] z-25 bg-sand-50/95 backdrop-blur border border-sand-200 rounded-lg shadow-lg overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-sm text-earth-700 font-medium">
                  Your Map
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-earth-500 text-sm"
                  aria-label="Close map preview"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section.key} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-colors duration-300 ${
                      section.content ? "bg-sage-400" : "bg-sand-300"
                    }`} />
                    <div>
                      <span className={`text-xs font-medium ${
                        section.content ? "text-earth-700" : "text-sand-400"
                      }`}>
                        {section.label}
                      </span>
                      {section.content && (
                        <p className="text-xs text-earth-500 line-clamp-2 mt-0.5">
                          {section.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
