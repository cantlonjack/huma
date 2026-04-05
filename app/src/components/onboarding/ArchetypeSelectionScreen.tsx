"use client";

import { useState } from "react";
import type { DimensionKey } from "@/types/v2";
import ArchetypeCard from "@/components/onboarding/ArchetypeCard";
import WholeMiniPreview from "@/components/onboarding/WholeMiniPreview";
import CapitalSketch from "@/components/onboarding/CapitalSketch";
import { DOMAIN_TEMPLATES, ORIENTATION_TEMPLATES } from "@/lib/archetype-templates";

export default function ArchetypeSelectionScreen({
  onContinueWithTemplate,
  onContinueBlank,
  onSkip,
}: {
  onContinueWithTemplate: (selected: { domains: string[]; orientations: string[] }, capitalSketch?: Record<DimensionKey, number>) => void;
  onContinueBlank: (selected: { domains: string[]; orientations: string[] }) => void;
  onSkip: () => void;
}) {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "fork">("select");
  const [capitalSketch, setCapitalSketch] = useState<Record<DimensionKey, number> | undefined>();

  // Compute preview dimensions from selected archetype templates
  const previewDimensions: DimensionKey[][] = selectedDomains.flatMap((name) => {
    const tmpl = DOMAIN_TEMPLATES.find((t) => t.name === name);
    return tmpl ? tmpl.starterAspirations.slice(0, 2).map((a) => a.dimensions) : [];
  });

  const hasSelection = selectedDomains.length > 0 || selectedOrientations.length > 0;

  const toggleDomain = (name: string) => {
    setSelectedDomains((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleOrientation = (name: string) => {
    setSelectedOrientations((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleContinue = () => {
    setStep("fork");
  };

  const selected = { domains: selectedDomains, orientations: selectedOrientations };

  // Step 2: Template vs blank fork
  if (step === "fork") {
    return (
      <div className="min-h-dvh bg-sand-50 flex flex-col items-center px-6 py-10 animate-fade-in">
        {/* Progress hint */}
        <p className="font-serif text-earth-300 mb-6 text-[10px] tracking-[0.06em]">
          2 of 2
        </p>
        <div className="w-full max-w-md">
          {/* Mini-preview in top-right corner */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h2
                className="font-serif text-earth-800 mb-2 text-[22px] leading-[1.3]"
              >
                Your starting shape
              </h2>
              <p className="font-sans text-earth-400 text-[13px]">
                I can pre-fill some starter aspirations from your archetypes, or you can start blank and build through conversation.
              </p>
            </div>
            <div className="ml-4 shrink-0">
              <WholeMiniPreview aspirationDimensions={previewDimensions} />
            </div>
          </div>

          {/* Template / Blank buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => onContinueWithTemplate(selected, capitalSketch)}
              className="flex-1 py-3.5 rounded-full font-sans text-base font-medium text-sand-50 cursor-pointer bg-amber-600 transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-amber-500"
            >
              Start with suggestions
            </button>
            <button
              onClick={() => onContinueBlank(selected)}
              className="flex-1 py-3.5 rounded-full font-sans text-base font-medium text-sage-700 cursor-pointer border-[1.5px] border-sage-300 bg-transparent transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-sage-50"
            >
              Start blank
            </button>
          </div>

          {/* Editability promise */}
          <p
            className="text-center font-sans text-sage-400 text-xs"
          >
            This shapes your starting point. You can change it anytime from Whole.
          </p>

          {/* Capital sketch (collapsible) */}
          <CapitalSketch onChange={(sketch) => setCapitalSketch(sketch)} />
        </div>
      </div>
    );
  }

  // Step 1: Archetype selection
  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col items-center px-6 py-10 animate-fade-in">
      {/* Progress hint */}
      <p className="font-serif text-earth-300 mb-4 text-[10px] tracking-[0.06em]">
        1 of 2
      </p>
      {/* Mini-preview floats top-right on desktop */}
      <div className="w-full max-w-2xl relative">
        <div className="hidden md:block absolute -top-2 -right-2 z-10">
          <WholeMiniPreview aspirationDimensions={previewDimensions} />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="font-serif text-earth-800 mb-2 text-2xl leading-[1.3]"
          >
            What kind of life are you running?
          </h1>
          <p className="font-sans text-earth-400 text-sm">
            Pick what fits. You can change this anytime.
          </p>
        </div>

        {/* Domain Grid — 1-col on tiny screens, 2-col default, 3-col desktop */}
        <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(160px, 100%), 1fr))" }}>
          {DOMAIN_TEMPLATES.map((t) => (
            <ArchetypeCard
              key={t.name}
              name={t.name}
              description={t.description}
              typicalConcerns={t.typicalConcerns}
              selected={selectedDomains.includes(t.name)}
              onToggle={() => toggleDomain(t.name)}
            />
          ))}
        </div>

        {/* Orientation Section */}
        <div className="mb-28">
          <p
            className="font-sans text-earth-300 mb-3 text-[10px] uppercase tracking-[0.08em]"
          >
            How you move
          </p>
          <div className="grid grid-cols-3 gap-3">
            {ORIENTATION_TEMPLATES.map((t) => (
              <ArchetypeCard
                key={t.name}
                name={t.name}
                description={t.description}
                selected={selectedOrientations.includes(t.name)}
                onToggle={() => toggleOrientation(t.name)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom actions — stays visible while cards scroll */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-3 z-20"
        style={{ background: "linear-gradient(transparent, var(--color-sand-50) 30%)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          {hasSelection && (
            <button
              onClick={handleContinue}
              className="w-full py-3.5 rounded-full font-sans text-base font-medium text-sand-50 cursor-pointer animate-fade-in bg-amber-600 transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-amber-500"
            >
              Continue
            </button>
          )}
          <button
            onClick={onSkip}
            className="font-sans text-earth-400 cursor-pointer text-[13px] underline"
          >
            Skip — just talk
          </button>
        </div>
      </div>
    </div>
  );
}
