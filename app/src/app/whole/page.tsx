"use client";

import TabShell from "@/components/shared/TabShell";
import InsightCard from "@/components/whole/InsightCard";
import ShareworthyInsightCard from "@/components/whole/ShareworthyInsightCard";
import WhyEvolution from "@/components/whole/WhyEvolution";
import ArchetypeSelector from "@/components/whole/ArchetypeSelector";
import AspirationsList from "@/components/whole/AspirationsList";
import PatternsList from "@/components/whole/PatternsList";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";
import SettingsSheet from "@/components/whole/SettingsSheet";
import WholeSkeleton from "@/components/whole/WholeSkeleton";
import { useWhole } from "@/hooks/useWhole";
import { mapAspirationStatus } from "@/lib/whole-utils";
import { isShareworthyInsight } from "@/components/whole/ShareworthyInsightCard";
import { displayName } from "@/lib/display-name";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/types/v2";
import type { DimensionKey, Aspiration, PathwayStage } from "@/types/v2";

/* ─── Connections section: dimension-grouped aspiration overlaps ─── */

function ConnectionsList({ aspirations }: { aspirations: Aspiration[] }) {
  const visible = aspirations.filter(
    (a) => a.status !== "archived" && a.status !== "dropped"
  );

  // Group aspirations by dimension
  const dimMap = new Map<string, { id: string; name: string }[]>();
  for (const a of visible) {
    const dims = a.dimensionsTouched || [];
    const name = displayName(a.title || a.clarifiedText || a.rawText);
    for (const d of dims) {
      if (!dimMap.has(d)) dimMap.set(d, []);
      dimMap.get(d)!.push({ id: a.id, name });
    }
  }

  // Only show dimensions that connect 2+ aspirations
  const connected = Array.from(dimMap.entries())
    .filter(([, asps]) => asps.length >= 2)
    .sort((a, b) => b[1].length - a[1].length);

  if (connected.length === 0) return null;

  return (
    <div className="px-5">
      <h2 className="font-sans font-medium text-[11px] tracking-[0.14em] uppercase text-sage-400 mb-3 m-0">
        Connections
      </h2>
      <div className="flex flex-col gap-3">
        {connected.map(([dim, asps]) => {
          const label = DIMENSION_LABELS[dim as DimensionKey] || dim;
          const color = DIMENSION_COLORS[dim as DimensionKey] || "#A8C4AA";
          return (
            <div key={dim} className="flex items-start gap-2.5">
              <span
                className="mt-1.5 shrink-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <span className="font-sans text-[13px] font-medium text-earth-500">
                  {label}
                </span>
                <p className="font-serif text-[13px] text-sage-450 leading-snug mt-0.5 m-0">
                  {asps.map((a) => a.name).join(", ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WholePage() {
  const w = useWhole();

  const chatPrompt = w.chatShellMode === "new-aspiration"
    ? "What are you trying to make work?"
    : w.chatShellMode === "dimension" && w.chatShellDimension
      ? `Tell me about your ${DIMENSION_LABELS[w.chatShellDimension as DimensionKey]?.toLowerCase() || w.chatShellDimension}. What should HUMA know?`
      : w.chatShellOpen
        ? "Tell me what you're building and why it matters to you."
        : "What would you like to explore or change?";

  return (
    <TabShell
      contextPrompt={chatPrompt}
      forceOpen={w.chatShellOpen}
      onChatClose={() => { w.setChatShellOpen(false); w.setChatShellMode("default"); }}
      chatMode={w.chatShellMode === "dimension" ? "default" : w.chatShellMode}
      sourceTab="whole"
      tabContext={{
        archetypes: w.archetypes,
        whyStatement: w.whyStatement || undefined,
        aspirations: w.aspirations.map(a => ({
          id: a.id,
          name: a.clarifiedText || a.rawText,
          status: mapAspirationStatus(a),
        })),
        principles: w.principles.filter(p => p.active).map(p => p.text),
        dayCount: w.dayNum,
      }}
    >
      <div className="min-h-dvh bg-sand-50 flex flex-col pb-20">
        <h1 className="sr-only">Whole</h1>

        {/* Header */}
        <div className="px-6 flex items-center justify-between pt-5">
          <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none">HUMA</span>
          <div className="flex items-center gap-3">
            <span className="font-sans font-medium text-[11px] text-sage-300 tracking-[0.1em]">Day {w.dayNum}</span>
            <button
              onClick={() => w.setSettingsOpen(true)}
              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-lg transition-[background] duration-200 hover:bg-[#EDF3ED]"
              aria-label="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="#A8C4AA" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="6" cy="5" r="1.5" fill="#FAF8F3" stroke="#A8C4AA" strokeWidth="1.2" />
                <circle cx="12" cy="9" r="1.5" fill="#FAF8F3" stroke="#A8C4AA" strokeWidth="1.2" />
                <circle cx="8" cy="13" r="1.5" fill="#FAF8F3" stroke="#A8C4AA" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Section label */}
        <div className="px-6 mt-2">
          <span className="font-sans font-medium text-[11px] tracking-[0.18em] uppercase text-sage-300">WHOLE</span>
        </div>

        {!w.loaded ? (
          <WholeSkeleton />
        ) : (
          <>
            {/* WHY statement — centered headline */}
            {w.whyStatement && (
              <div className="text-center px-6 mt-5">
                <p className="font-serif text-lg italic text-sage-600 leading-snug max-w-[340px] mx-auto m-0">
                  {w.whyStatement}
                </p>
              </div>
            )}

            {/* WHY Evolution suggestion */}
            {w.whyEvolution && w.whyStatement && (
              <div className="mt-3.5">
                <WhyEvolution
                  originalWhy={w.whyStatement}
                  evolution={w.whyEvolution}
                  onAccept={w.handleWhyEvolutionAccept}
                  onDismiss={w.handleWhyEvolutionDismiss}
                />
              </div>
            )}

            {/* ─── Single Life Design View ─── */}
            <div className="mt-5 flex flex-col gap-6">
              {/* 1. Desires — aspirations as sentences */}
              <AspirationsList aspirations={w.aspirations} />

              {/* 2. Pathway — staged plan (forward-looking, renders when data exists) */}
              {w.pathway && (
                <div className="mx-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-300 uppercase">
                      Your pathway
                    </span>
                    <div className="flex-1 h-px bg-sand-200" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {w.pathway.stages.map((stage: PathwayStage, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 ${stage.status === "active" ? "opacity-100" : "opacity-50"}`}
                      >
                        <span className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${
                          stage.status === "completed" ? "bg-sage-500" :
                          stage.status === "active" ? "bg-amber-500" :
                          "bg-sand-300"
                        }`} />
                        <div>
                          <span className="font-sans text-[13px] font-medium text-earth-500">{stage.name}</span>
                          <p className="font-serif text-[13px] text-sage-450 leading-snug mt-0.5 m-0">{stage.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Chosen Patterns — with evidence status */}
              <PatternsList patterns={w.allPatterns} />

              {/* 3. Connections — dimension overlaps */}
              <ConnectionsList aspirations={w.aspirations} />

              {/* Add aspiration */}
              <div className="text-center px-6">
                <button
                  onClick={() => { w.setChatShellMode("new-aspiration"); w.setChatShellOpen(true); }}
                  className="font-sans cursor-pointer inline-flex items-center gap-1.5 text-[13px] text-sage-500 bg-transparent border border-dashed border-[#C8D5C9] rounded-[20px] px-4 py-2 min-h-9"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add aspiration
                </button>
              </div>
            </div>

            {/* Insight card */}
            {w.insight && (
              <div className="mt-4">
                <InsightCard
                  insight={w.insight}
                  onDismiss={w.handleDismissInsight}
                  shareworthy={isShareworthyInsight(w.insight)}
                  onShare={() => w.setShareworthyOpen(true)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Shareworthy insight full-screen card */}
      {w.shareworthyOpen && w.insight && (
        <ShareworthyInsightCard
          insight={w.insight}
          operatorName={w.operatorName}
          onDismiss={() => w.setShareworthyOpen(false)}
        />
      )}

      {/* Archetype selector bottom sheet */}
      <ArchetypeSelector
        open={w.archetypeSelectorOpen}
        onClose={() => w.setArchetypeSelectorOpen(false)}
        onSave={w.handleArchetypeSave}
        initialSelected={w.archetypes}
      />

      {/* Confirmation sheet for destructive actions */}
      <ConfirmationSheet
        open={!!w.confirmAction}
        title={
          w.confirmAction?.type === "archive"
            ? `Archive ${w.confirmAction.label}?`
            : w.confirmAction?.type === "clear-context"
              ? `Clear ${w.confirmAction.label}?`
              : `Remove ${w.confirmAction?.label ?? ""}?`
        }
        body={
          w.confirmAction?.type === "archive"
            ? "This hides the aspiration from your shape. You can restore it later."
            : w.confirmAction?.type === "clear-context"
              ? "This removes this context from what HUMA knows about you."
              : w.confirmAction?.type === "delete-principle"
                ? "This removes the principle from your shape."
                : "This removes the aspiration, its behaviors, and related patterns. You can't undo this."
        }
        confirmLabel={w.confirmAction?.type === "archive" ? "Archive" : "Remove"}
        cancelLabel="Keep it"
        onConfirm={w.handleConfirmAction}
        onCancel={() => w.setConfirmAction(null)}
      />

      {/* Settings sheet with profile + data management */}
      <SettingsSheet
        open={w.settingsOpen}
        onClose={() => w.setSettingsOpen(false)}
        onAction={w.handleSettingsAction}
        operatorName={w.operatorName}
        archetypes={w.archetypes}
        whyStatement={w.whyStatement}
        onArchetypeTap={() => { w.setSettingsOpen(false); w.setArchetypeSelectorOpen(true); }}
        onWhySave={w.handleWhySave}
      />

      {/* Archive undo toast */}
      {w.archiveToast && (
        <div
          className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-sand-100 text-earth-500 border-2 border-[#C8D5C9] rounded-2xl px-5 py-3 flex items-center gap-3 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{
            animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        >
          <span className="font-sans text-sm">
            {displayName(w.archiveToast.label)} archived
          </span>
          <button
            onClick={w.handleArchiveUndo}
            className="font-sans font-medium cursor-pointer bg-transparent border-none text-amber-600 text-sm p-0 underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      )}
    </TabShell>
  );
}
