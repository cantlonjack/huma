"use client";

import { useMemo, useState, useCallback } from "react";
import TabShell from "@/components/shared/TabShell";
import InsightCard from "@/components/whole/InsightCard";
import ShareworthyInsightCard from "@/components/whole/ShareworthyInsightCard";
import WhyEvolution from "@/components/whole/WhyEvolution";
import WeeklyReviewCard, { type WeeklyReviewCardState } from "@/components/whole/WeeklyReviewCard";
import ArchetypeSelector from "@/components/whole/ArchetypeSelector";
import WholeCanvas from "@/components/whole/WholeCanvas";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";
import SettingsSheet from "@/components/whole/SettingsSheet";
import WholeSkeleton from "@/components/whole/WholeSkeleton";
import RpplProvenanceSheet from "@/components/today/RpplProvenanceSheet";
import { useWhole } from "@/hooks/useWhole";
import { mapAspirationStatus } from "@/lib/whole-utils";
import { isShareworthyInsight } from "@/components/whole/ShareworthyInsightCard";
import { displayName } from "@/lib/display-name";
import { DIMENSION_LABELS } from "@/types/v2";
import type { DimensionKey, Pattern } from "@/types/v2";

export default function WholePage() {
  const w = useWhole();
  const [provenancePattern, setProvenancePattern] = useState<Pattern | null>(null);

  // Derive a single card state from the hook's review flags.
  const weeklyReviewCard: WeeklyReviewCardState | null =
    w.weeklyReviewLoading
      ? { kind: "loading" }
      : w.weeklyReviewError
        ? { kind: "error", message: w.weeklyReviewError }
        : w.weeklyReview
          ? { kind: "ready", review: w.weeklyReview }
          : w.weeklyReviewPrompt
            ? { kind: "prompt" }
            : null;
  const handleShowProvenance = useCallback((pattern: Pattern) => {
    setProvenancePattern(pattern);
  }, []);
  const provenanceAspirationId = provenancePattern?.aspirationId;
  const provenanceBehaviorKey = provenancePattern?.steps.find(s => s.isTrigger)?.behaviorKey
    ?? provenancePattern?.steps[0]?.behaviorKey;

  // Unconnected aspirations — active aspirations with no behaviors defined.
  // Matches verifyLifeGraph's "unconnectedAspirations" definition by ID.
  const unconnectedIds = useMemo(() => {
    const set = new Set<string>();
    for (const a of w.aspirations) {
      if (a.status !== "active") continue;
      if (!a.behaviors || a.behaviors.length === 0) set.add(a.id);
    }
    return set;
  }, [w.aspirations]);

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
      <div className="min-h-dvh bg-sand-50 flex flex-col pb-20 lg:max-w-6xl lg:mx-auto lg:w-full lg:px-6">
        <h1 className="sr-only">Whole</h1>

        {/* Header */}
        <div className="px-6 flex items-center justify-between pt-5">
          <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none">HUMA</span>
          <div className="flex items-center gap-3">
            <span className="font-sans font-medium text-[11px] text-sage-300 tracking-[0.1em]">Day {w.dayNum}</span>
            <button
              onClick={() => w.setSettingsOpen(true)}
              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-lg transition-[background] duration-200 hover:bg-sage-50"
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

            {/* Weekly review ritual */}
            {weeklyReviewCard && (
              <div className="mt-4">
                <WeeklyReviewCard
                  state={weeklyReviewCard}
                  onStart={w.handleStartWeeklyReview}
                  onDismiss={w.handleDismissWeeklyReview}
                  onClear={w.handleClearWeeklyHighlight}
                />
              </div>
            )}

            {/* ─── Unified canvas — one spatial instrument, lenses, zoom ─── */}
            <div className="mt-5 mx-auto w-full max-w-[720px] lg:max-w-[860px]">
              <WholeCanvas
                aspirations={w.aspirations}
                patterns={w.allPatterns}
                unconnectedIds={unconnectedIds}
                capacityState={w.humaContext?.capacityState}
                weeklyHighlight={w.weeklyReview?.graphHighlight ?? null}
                onAddAspiration={() => {
                  w.setChatShellMode("new-aspiration");
                  w.setChatShellOpen(true);
                }}
                onShowProvenance={handleShowProvenance}
              />
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

      {/* RPPL Provenance Sheet — opened from any Pattern with provenance.rpplId */}
      <RpplProvenanceSheet
        open={!!provenancePattern}
        onClose={() => setProvenancePattern(null)}
        aspirationId={provenanceAspirationId}
        behaviorKey={provenanceBehaviorKey}
        patterns={w.allPatterns}
        behaviorText={provenancePattern ? displayName(provenancePattern.name) : undefined}
      />

      {/* Archive undo toast */}
      {w.archiveToast && (
        <div
          className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-sand-100 text-earth-500 border-2 border-sage-200 rounded-2xl px-5 py-3 flex items-center gap-3 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
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
