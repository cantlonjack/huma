"use client";

import { useCallback, useState } from "react";
import type { Pattern } from "@/types/v2";
import { useGrow } from "@/hooks/useGrow";
import { displayName } from "@/lib/display-name";
import TabShell from "@/components/shared/TabShell";
import EmergenceCard from "@/components/grow/EmergenceCard";
import MonthlyReview from "@/components/grow/MonthlyReview";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";
import PatternSection from "@/components/grow/PatternSection";
import CompletionStats from "@/components/grow/CompletionStats";
import BehaviorFrequency from "@/components/grow/BehaviorFrequency";
import CorrelationCards from "@/components/grow/CorrelationCards";
import { GapSection } from "@/components/grow/GapCard";
import { PrereqSignal } from "@/components/grow/PrereqSignal";
import RpplProvenanceSheet from "@/components/today/RpplProvenanceSheet";

// ── Inlined: EmptyState ──
function EmptyState({ onAddAspiration }: { onAddAspiration: () => void }) {
  return (
    <div className="py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-sage-100 mx-auto mb-4 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22V12M12 12C12 9 14 6 18 4C14 6 12 9 12 12ZM12 12C12 9 10 6 6 4C10 6 12 9 12 12Z"
            stroke="var(--color-sage-500)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-serif text-sage-700 text-xl leading-[1.3] mb-2">
        Patterns emerge from your aspirations.
      </p>
      <p className="font-sans text-sage-400 text-sm leading-normal max-w-[280px] mx-auto mb-4">
        As you check off behaviors on your production sheet, HUMA will surface the patterns that hold your days together.
      </p>
      <button
        onClick={onAddAspiration}
        className="font-sans cursor-pointer text-sm text-amber-600 bg-transparent border-none underline underline-offset-2 p-0"
      >
        Add an aspiration
      </button>
    </div>
  );
}

// ── Inlined: GrowSkeleton ──
function GrowSkeleton() {
  return (
    <div aria-hidden="true" role="presentation" style={{ padding: "0 16px" }}>
      <div style={{ padding: "0 0 16px" }}>
        <div className="skeleton" style={{ width: "120px", height: "14px", marginBottom: "8px" }} />
        <div className="skeleton" style={{ width: "200px", height: "22px" }} />
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: "white",
            border: "1px solid #DDD4C0",
            borderRadius: "16px",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px 12px",
              borderBottom: "1px solid #F0EBE3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="skeleton" style={{ width: "55%", height: "18px" }} />
            <div className="skeleton" style={{ width: "60px", height: "20px", borderRadius: "10px" }} />
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div className="skeleton" style={{ width: "80px", height: "10px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "70%", height: "14px", marginBottom: "12px" }} />
            {[0, 1].map((j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div className="skeleton-circle" style={{ width: "6px", height: "6px", flexShrink: 0 }} />
                <div className="skeleton" style={{ width: j === 0 ? "65%" : "50%", height: "13px" }} />
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #F0EBE3" }}>
            <div className="skeleton" style={{ width: "100%", height: "6px", borderRadius: "3px" }} />
            <div className="skeleton" style={{ width: "80px", height: "11px", marginTop: "6px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const STAGE_HEADLINES: Record<string, string> = {
  early: "Building the picture",
  frequency: "Patterns emerging",
  correlation: "Evidence building",
  patterns: "What the evidence shows",
};

export default function GrowPage() {
  const g = useGrow();
  const [provenancePattern, setProvenancePattern] = useState<Pattern | null>(null);

  const handleShowProvenance = useCallback((pattern: Pattern) => {
    setProvenancePattern(pattern);
  }, []);

  const provenanceAspirationId = provenancePattern?.aspirationId;
  const provenanceBehaviorKey = provenancePattern?.steps.find(s => s.isTrigger)?.behaviorKey
    ?? provenancePattern?.steps[0]?.behaviorKey;

  const handlePlanAspiration = useCallback(() => {
    // Open the chat in new-aspiration mode. The aspiration context for
    // decomposition flows through tabContext; wiring a deeper routing
    // flag can happen once a dedicated "decompose-existing" chat mode ships.
    g.setNewAspirationOpen(true);
  }, [g]);

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
      <div className="min-h-dvh bg-sand-50 pt-6 pb-[100px] lg:max-w-6xl lg:mx-auto lg:w-full lg:px-4">
        {/* Page header */}
        <div className="px-4 pb-6">
          <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-sage-400 mb-1">
            GROW
          </p>
          <h1 className="font-serif text-sage-700 text-[26px] leading-[1.2] font-normal">
            {STAGE_HEADLINES[g.stage]}
          </h1>
          {!g.loading && g.stage === "patterns" && g.patterns.length > 0 && (
            <p className="font-sans text-sage-400 text-[13px] mt-1">
              {g.patterns.length} pattern{g.patterns.length !== 1 ? "s" : ""} &middot;{" "}
              {g.validated.length} confirmed, {g.working.length} building, {g.finding.length} watching
            </p>
          )}
          {!g.loading && g.stage !== "patterns" && (
            <p className="font-sans text-sage-400 text-[13px] mt-1">
              Day {g.dayCount}
            </p>
          )}
        </div>

        {/* Gaps in pathway — surfaced whenever verification finds unconnected aspirations */}
        {!g.loading && g.unconnectedAspirations.length > 0 && (
          <GapSection
            unconnectedAspirations={g.unconnectedAspirations}
            dormantCapitalCount={g.verification?.dormantCapitals.length ?? 0}
            onPlan={handlePlanAspiration}
          />
        )}

        {/* Prereq signal — unsatisfied capacity inputs from verifyLifeGraph */}
        {!g.loading && g.verification && g.verification.unsatisfiedInputs.length > 0 && (
          <PrereqSignal unsatisfied={g.verification.unsatisfiedInputs} />
        )}

        {/* Content — progressive disclosure by stage */}
        {g.loading ? (
          <GrowSkeleton />
        ) : g.stage === "early" ? (
          /* Day 1-3: Completion stats + pattern preview */
          <CompletionStats
            checked={g.completionStats.checked}
            total={g.completionStats.total}
            dayCount={g.dayCount}
          />
        ) : g.stage === "frequency" ? (
          /* Day 4-7: Behavior frequency */
          <BehaviorFrequency
            frequencies={g.behaviorFrequencies}
            dayCount={g.dayCount}
          />
        ) : g.stage === "correlation" ? (
          /* Day 7-14: Correlations + frequency */
          <CorrelationCards
            correlations={g.behaviorCorrelations}
            frequencies={g.behaviorFrequencies}
            dayCount={g.dayCount}
            aspirations={g.aspirations}
          />
        ) : g.patterns.length === 0 && g.emergingBehaviors.length === 0 ? (
          <EmptyState onAddAspiration={() => g.setNewAspirationOpen(true)} />
        ) : (
          /* Day 14+: Full pattern system */
          <div className="px-4">
            {/* Emerging behaviors — "Something forming..." */}
            {g.emergingBehaviors.length > 0 && (
              <EmergenceCard
                behaviors={g.emergingBehaviors}
                onFormalize={g.handleFormalize}
                onDismiss={g.handleDismissEmergence}
              />
            )}

            {/* Pattern sections — evidence columns on desktop */}
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-6 lg:items-start">
            {/* Validated patterns */}
            {g.validated.length > 0 && (
              <PatternSection
                title="Confirmed — you have proof"
                subtitle="These patterns are part of your operating system."
                whySubtitle={g.whyStatement ? `These serve your WHY: \u201c${g.whyStatement}\u201d` : undefined}
                displayMode="evidence"
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
                onShowProvenance={handleShowProvenance}
                behaviorCounts={g.behaviorCounts}
              />
            )}

            {/* Working patterns */}
            {g.working.length > 0 && (
              <PatternSection
                title="Building — the signal is getting stronger"
                subtitle="Keep going. The evidence is accumulating."
                displayMode="evidence"
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
                onShowProvenance={handleShowProvenance}
                behaviorCounts={g.behaviorCounts}
              />
            )}

            {/* Finding patterns */}
            {g.finding.length > 0 && (
              <PatternSection
                title="Watching — just started tracking"
                subtitle="Still forming. The shape will clarify with use."
                displayMode="evidence"
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
                onShowProvenance={handleShowProvenance}
                behaviorCounts={g.behaviorCounts}
              />
            )}
            </div>

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

      {/* RPPL Provenance Sheet — opened from any Pattern card with provenance.rpplId */}
      <RpplProvenanceSheet
        open={!!provenancePattern}
        onClose={() => setProvenancePattern(null)}
        aspirationId={provenanceAspirationId}
        behaviorKey={provenanceBehaviorKey}
        patterns={g.patterns}
        behaviorText={provenancePattern ? displayName(provenancePattern.name) : undefined}
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
