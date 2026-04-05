"use client";

import { useGrow } from "@/hooks/useGrow";
import { displayName } from "@/lib/display-name";
import TabShell from "@/components/TabShell";
import GrowSkeleton from "@/components/GrowSkeleton";
import EmergenceCard from "@/components/EmergenceCard";
import MonthlyReview from "@/components/MonthlyReview";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";
import PatternSection from "@/components/grow/PatternSection";
import EmptyState from "@/components/grow/EmptyState";

export default function GrowPage() {
  const g = useGrow();

  return (
    <TabShell
      contextPrompt={g.newAspirationOpen ? "What are you trying to make work?" : "What patterns are you noticing in your days?"}
      sourceTab="grow"
      tabContext={g.tabContext}
      forceOpen={!!g.investigatePatternId || g.newAspirationOpen}
      onChatClose={g.handleChatClose}
      initialMessage={g.investigateMessage}
      chatMode={g.newAspirationOpen ? "new-aspiration" : "default"}
    >
      <div className="min-h-dvh bg-sand-50 pt-6 pb-[100px]">
        {/* Page header */}
        <div className="px-4 pb-6">
          <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-sage-400 mb-1">
            GROW
          </p>
          <h1 className="font-serif text-sage-700 text-[26px] leading-[1.2] font-normal">
            Your patterns
          </h1>
          {!g.loading && g.patterns.length > 0 && (
            <p className="font-sans text-sage-400 text-[13px] mt-1">
              {g.patterns.length} pattern{g.patterns.length !== 1 ? "s" : ""} &middot;{" "}
              {g.validated.length} validated, {g.working.length} working, {g.finding.length} finding
            </p>
          )}
        </div>

        {/* Content */}
        {g.loading ? (
          <GrowSkeleton />
        ) : g.patterns.length === 0 && g.emergingBehaviors.length === 0 ? (
          <EmptyState onAddAspiration={() => g.setNewAspirationOpen(true)} />
        ) : (
          <div className="px-4">
            {/* Emerging behaviors — "Something forming..." */}
            {g.emergingBehaviors.length > 0 && (
              <EmergenceCard
                behaviors={g.emergingBehaviors}
                onFormalize={g.handleFormalize}
                onDismiss={g.handleDismissEmergence}
              />
            )}

            {/* Validated patterns */}
            {g.validated.length > 0 && (
              <PatternSection
                title="Validated"
                subtitle="These patterns are working. They're part of your operating system."
                whySubtitle={g.whyStatement ? `These serve your WHY: \u201c${g.whyStatement}\u201d` : undefined}
                patterns={g.validated}
                aspirations={g.aspirations}
                expandedId={g.expandedId}
                onToggleExpand={g.handleToggleExpand}
                primaryArchetype={g.archetypes[0]}
                sparklines={g.sparklines}
                onInvestigate={g.handleInvestigate}
                mergeSuggestions={g.mergeSuggestions}
                onMerge={g.handleMerge}
                onDismissMerge={g.handleDismissMerge}
                onUpdate={g.handlePatternUpdate}
                onArchive={g.handlePatternArchive}
                onRemove={g.handlePatternRemove}
              />
            )}

            {/* Working patterns */}
            {g.working.length > 0 && (
              <PatternSection
                title="Working"
                subtitle="You're building these. Keep going."
                patterns={g.working}
                aspirations={g.aspirations}
                expandedId={g.expandedId}
                onToggleExpand={g.handleToggleExpand}
                primaryArchetype={g.archetypes[0]}
                sparklines={g.sparklines}
                onInvestigate={g.handleInvestigate}
                mergeSuggestions={g.mergeSuggestions}
                onMerge={g.handleMerge}
                onDismissMerge={g.handleDismissMerge}
                onUpdate={g.handlePatternUpdate}
                onArchive={g.handlePatternArchive}
                onRemove={g.handlePatternRemove}
              />
            )}

            {/* Finding patterns */}
            {g.finding.length > 0 && (
              <PatternSection
                title="Finding"
                subtitle="Still emerging. The shape will clarify with use."
                patterns={g.finding}
                aspirations={g.aspirations}
                expandedId={g.expandedId}
                primaryArchetype={g.archetypes[0]}
                onToggleExpand={g.handleToggleExpand}
                sparklines={g.sparklines}
                onInvestigate={g.handleInvestigate}
                mergeSuggestions={g.mergeSuggestions}
                onMerge={g.handleMerge}
                onDismissMerge={g.handleDismissMerge}
                onUpdate={g.handlePatternUpdate}
                onArchive={g.handlePatternArchive}
                onRemove={g.handlePatternRemove}
              />
            )}

            {/* Monthly review — previous month's behavior grid */}
            {g.monthlyReview && (
              <div className="mt-8">
                <MonthlyReview data={g.monthlyReview} />
              </div>
            )}

            {/* Add aspiration — subtle affordance at bottom of list */}
            <div className="text-center pt-6 pb-2">
              <button
                onClick={() => g.setNewAspirationOpen(true)}
                className="font-sans cursor-pointer inline-flex items-center gap-1.5 text-[13px] text-sage-400 bg-transparent border border-dashed border-sage-200 rounded-[20px] px-4 py-2 min-h-9"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add aspiration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation sheet for pattern removal */}
      <ConfirmationSheet
        open={!!g.confirmRemoveId}
        title={g.confirmRemovePattern ? `Remove ${displayName(g.confirmRemovePattern.name)}?` : "Remove pattern?"}
        body="This removes the pattern and its golden pathway. You can't undo this."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onConfirm={g.confirmPatternRemove}
        onCancel={() => g.setConfirmRemoveId(null)}
      />

      {/* Archive undo toast */}
      {g.archiveToast && (
        <div
          className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-sand-100 text-ink-500 border-2 border-sage-200 rounded-2xl px-5 py-3 flex items-center gap-3 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{
            animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        >
          <span className="font-sans text-sm">
            {displayName(g.archiveToast.name)} archived
          </span>
          <button
            onClick={g.handleArchiveUndo}
            className="font-sans font-medium cursor-pointer bg-transparent border-none text-amber-600 text-sm p-0 underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      )}
    </TabShell>
  );
}
