"use client";

import TabShell from "@/components/shared/TabShell";
import WholeShape from "@/components/whole/WholeShape";
import HolonExpandPanel from "@/components/whole/HolonExpandPanel";
import AspirationDetailPanel from "@/components/whole/AspirationDetailPanel";
import ProfileBanner from "@/components/whole/ProfileBanner";
import InsightCard from "@/components/whole/InsightCard";
import ShareworthyInsightCard from "@/components/whole/ShareworthyInsightCard";
import WhyEvolution from "@/components/whole/WhyEvolution";
import ArchetypeSelector from "@/components/whole/ArchetypeSelector";
import ContextPortrait from "@/components/whole/ContextPortrait";
import ContextBrief from "@/components/whole/ContextBrief";
import LifeProfile from "@/components/whole/LifeProfile";
import AspirationsList from "@/components/whole/AspirationsList";
import PatternsList from "@/components/whole/PatternsList";
import DimensionMiniShape from "@/components/whole/DimensionMiniShape";
import CanvasRegenerate from "@/components/whole/CanvasRegenerate";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";
import SettingsSheet from "@/components/whole/SettingsSheet";
import WholeSkeleton from "@/components/whole/WholeSkeleton";
import { useWhole } from "@/hooks/useWhole";
import { mapAspirationStatus, contextFieldForNodeId } from "@/lib/whole-utils";
import { isShareworthyInsight } from "@/components/whole/ShareworthyInsightCard";
import { displayName } from "@/lib/display-name";
import { DIMENSION_LABELS } from "@/types/v2";
import type { DimensionKey } from "@/types/v2";

export default function WholePage() {
  const w = useWhole();

  const chatPrompt = w.chatShellMode === "new-aspiration"
    ? "What are you trying to make work?"
    : w.chatShellMode === "dimension" && w.chatShellDimension
      ? `Tell me about your ${DIMENSION_LABELS[w.chatShellDimension as DimensionKey]?.toLowerCase() || w.chatShellDimension}. What should HUMA know?`
      : w.chatShellOpen
        ? "Tell me what you're building and why it matters to you."
        : w.manageMode
          ? "What would you like to change?"
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

            {/* View toggle */}
            <button
              onClick={() => w.setViewMode(w.viewMode === "brief" ? "map" : "brief")}
              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-lg transition-[background] duration-200 hover:bg-[#EDF3ED]"
              aria-label={w.viewMode === "brief" ? "Map view" : "Brief view"}
            >
              {w.viewMode === "brief" ? (
                /* Map icon */
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="3" stroke="#A8C4AA" strokeWidth="1.3" />
                  <circle cx="4" cy="5" r="1.5" stroke="#A8C4AA" strokeWidth="1" />
                  <circle cx="14" cy="6" r="1.5" stroke="#A8C4AA" strokeWidth="1" />
                  <circle cx="5" cy="14" r="1.5" stroke="#A8C4AA" strokeWidth="1" />
                  <circle cx="13" cy="13" r="1.5" stroke="#A8C4AA" strokeWidth="1" />
                  <line x1="6.5" y1="7" x2="7" y2="7.5" stroke="#A8C4AA" strokeWidth="0.8" />
                  <line x1="11.5" y1="7.5" x2="12" y2="7" stroke="#A8C4AA" strokeWidth="0.8" />
                </svg>
              ) : (
                /* Brief/document icon */
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="2" width="12" height="14" rx="2" stroke="#A8C4AA" strokeWidth="1.3" />
                  <line x1="6" y1="6" x2="12" y2="6" stroke="#A8C4AA" strokeWidth="1" strokeLinecap="round" />
                  <line x1="6" y1="9" x2="12" y2="9" stroke="#A8C4AA" strokeWidth="1" strokeLinecap="round" />
                  <line x1="6" y1="12" x2="10" y2="12" stroke="#A8C4AA" strokeWidth="1" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button
              onClick={w.handleManageToggle}
              className={`cursor-pointer w-7 h-7 flex items-center justify-center border-none rounded-lg transition-[background] duration-200 ${w.manageMode ? "bg-[#EDF3ED]" : "bg-transparent"}`}
              aria-label={w.manageMode ? "Exit manage mode" : "Manage"}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke={w.manageMode ? "#3A5A40" : "#A8C4AA"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.17 12.5a1.39 1.39 0 00.28 1.53l.05.05a1.69 1.69 0 01-1.19 2.88 1.69 1.69 0 01-1.19-.5l-.05-.04a1.39 1.39 0 00-1.53-.28 1.39 1.39 0 00-.84 1.27v.14a1.69 1.69 0 01-3.38 0v-.07a1.39 1.39 0 00-.91-1.27 1.39 1.39 0 00-1.53.28l-.05.05a1.69 1.69 0 11-2.39-2.39l.05-.05a1.39 1.39 0 00.28-1.53 1.39 1.39 0 00-1.27-.84h-.14a1.69 1.69 0 010-3.38h.07a1.39 1.39 0 001.27-.91 1.39 1.39 0 00-.28-1.53l-.05-.05a1.69 1.69 0 112.39-2.39l.05.05a1.39 1.39 0 001.53.28h.07a1.39 1.39 0 00.84-1.27v-.14a1.69 1.69 0 013.38 0v.07a1.39 1.39 0 00.84 1.27 1.39 1.39 0 001.53-.28l.05-.05a1.69 1.69 0 112.39 2.39l-.05.05a1.39 1.39 0 00-.28 1.53v.07a1.39 1.39 0 001.27.84h.14a1.69 1.69 0 010 3.38h-.07a1.39 1.39 0 00-1.27.84z" stroke={w.manageMode ? "#3A5A40" : "#A8C4AA"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => w.setSettingsOpen(true)}
              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-lg transition-[background] duration-200"
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

        {/* Section label + mini shape */}
        <div className="px-6 mt-2 flex items-center justify-between">
          <span className="font-sans font-medium text-[11px] tracking-[0.18em] uppercase text-sage-300">WHOLE</span>
          {w.loaded && w.viewMode === "brief" && !w.isEmpty && (
            <DimensionMiniShape
              context={w.context}
              aspirations={w.aspirations}
              whyStatement={w.whyStatement}
              archetypes={w.archetypes}
              size={48}
            />
          )}
        </div>

        {!w.loaded ? (
          <WholeSkeleton />
        ) : (
          <>
            {/* Profile banner */}
            <div className="mt-4">
              <ProfileBanner
                name={w.operatorName}
                archetypes={w.archetypes.length > 0 ? w.archetypes : undefined}
                whyStatement={w.viewMode === "map" ? (w.whyStatement || undefined) : undefined}
                computing={w.computing}
                onArchetypeTap={() => w.setArchetypeSelectorOpen(true)}
                onWhySave={w.handleWhySave}
                onWhyTapNoContext={w.handleWhyTapNoContext}
                hasContext={w.hasContext}
              />
            </div>

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

            {/* ─── Brief View (default) ─── */}
            {w.viewMode === "brief" && (
              <div className="mt-5 flex flex-col gap-6">
                {/* Life Profile — the living document */}
                {w.humaContext._version ? (
                  <div className="px-5">
                    <LifeProfile
                      humaContext={w.humaContext}
                      aspirations={w.aspirations}
                      mode={w.manageMode ? "edit" : "view"}
                      onTellMore={(sectionId) => w.handleTellMore(sectionId)}
                      onContextSave={w.handleHumaContextSave}
                      onFieldEdit={w.handleFieldEdit}
                    />
                  </div>
                ) : (
                  <ContextBrief
                    context={w.context}
                    aspirations={w.aspirations}
                    whyStatement={w.whyStatement}
                    archetypes={w.archetypes}
                    operatorName={w.operatorName}
                    onTellMore={w.handleTellMore}
                  />
                )}

                {/* Aspirations */}
                <AspirationsList aspirations={w.aspirations} />

                {/* Patterns — your operating system */}
                <PatternsList patterns={w.allPatterns} />

                {/* Context portrait — editable fields (manage mode) */}
                {w.manageMode && (
                  <div className="animate-entrance-3">
                    <ContextPortrait
                      context={w.context}
                      onSave={w.handleContextSave}
                      manageMode={w.manageMode}
                      onRemoveField={w.handleContextFieldRemove}
                    />
                  </div>
                )}

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
            )}

            {/* ─── Map View (force-directed graph) ─── */}
            {w.viewMode === "map" && (
              <>
                {/* Shape */}
                <div ref={w.containerRef} className="flex items-center justify-center mt-4 w-full">
                  <WholeShape
                    nodes={w.nodes}
                    links={w.holonLinks}
                    annotations={w.historicalInsights}
                    width={w.shapeWidth}
                    height={w.shapeHeight}
                    onNodeTap={w.handleNodeTap}
                    selectedNodeId={w.selectedNode?.id}
                    isEmpty={w.isEmpty}
                    manageMode={w.manageMode}
                  />
                </div>

                {/* Empty state message */}
                {w.isEmpty && (
                  <div className="text-center px-6 pt-3">
                    <p className="font-serif text-lg italic text-sage-300 mb-3">Your shape starts here.</p>
                    <button
                      onClick={() => { w.setChatShellMode("new-aspiration"); w.setChatShellOpen(true); }}
                      className="font-sans cursor-pointer text-sm text-amber-600 bg-transparent border-none underline underline-offset-2 p-0"
                    >
                      Add your first aspiration
                    </button>
                  </div>
                )}

                {/* Add aspiration -- visible when not empty */}
                {!w.isEmpty && (
                  <div className="text-center px-6 pt-4">
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
                )}

                {/* Expand panel -- aspiration detail panel for aspirations, HolonExpandPanel for others */}
                {w.selectedFullNode && w.selectedFullNode.type === "aspiration" && (() => {
                  const asp = w.aspirations.find((a) => a.id === w.selectedFullNode!.id);
                  return asp ? (
                    <AspirationDetailPanel
                      aspiration={asp}
                      patterns={w.selectedAspirationPatterns}
                      status={w.selectedFullNode!.status}
                      onClose={() => w.setSelectedNode(null)}
                      onNameSave={(name) => w.handleAspirationNameSave(asp.id, name)}
                      onStatusChange={(status) => w.handleAspirationStatusChange(asp.id, status)}
                      onBehaviorsSave={(behaviors) => w.handleAspirationBehaviorsSave(asp.id, behaviors)}
                      onFutureSave={(comingUp, longerArc) => w.handleAspirationFutureSave(asp.id, comingUp, longerArc)}
                      manageMode={w.manageMode}
                      onArchive={
                        w.manageMode
                          ? () => w.setConfirmAction({ type: "archive", id: asp.id, label: w.selectedFullNode!.label })
                          : undefined
                      }
                      onDelete={
                        w.manageMode
                          ? () => w.setConfirmAction({ type: "delete", id: asp.id, label: w.selectedFullNode!.label })
                          : undefined
                      }
                    />
                  ) : null;
                })()}
                {w.selectedFullNode && w.selectedFullNode.type !== "aspiration" && (
                  <HolonExpandPanel
                    id={w.selectedFullNode.id}
                    label={w.selectedFullNode.label}
                    description={w.selectedFullNode.description}
                    status={w.selectedFullNode.status}
                    type={w.selectedFullNode.type}
                    dimensions={w.selectedFullNode.dimensions}
                    onClose={() => w.setSelectedNode(null)}
                    archetype={w.archetypes.join(" · ") || undefined}
                    whyStatement={w.whyStatement || undefined}
                    onArchetypeSave={() => w.setArchetypeSelectorOpen(true)}
                    onWhySave={w.handleWhySave}
                    value={w.selectedFullNode.description}
                    onValueSave={w.selectedFullNode.type === "context" ? (v) => w.handleFoundationSave(w.selectedFullNode!.id, v) : undefined}
                    manageMode={w.manageMode}
                    onDelete={
                      w.manageMode && w.selectedFullNode.type === "principle"
                        ? () => w.setConfirmAction({
                            type: "delete-principle",
                            id: w.selectedFullNode!.id,
                            label: w.selectedFullNode!.label,
                          })
                        : undefined
                    }
                    onClearContext={
                      w.manageMode && w.selectedFullNode.type === "context"
                        ? () => {
                            const field = contextFieldForNodeId(w.selectedFullNode!.id);
                            if (field) w.setConfirmAction({ type: "clear-context", id: field, label: w.selectedFullNode!.label });
                          }
                        : undefined
                    }
                  />
                )}

                {/* Context portrait */}
                <div className="animate-entrance-3 mt-4">
                  <ContextPortrait
                    context={w.context}
                    onSave={w.handleContextSave}
                    manageMode={w.manageMode}
                    onRemoveField={w.handleContextFieldRemove}
                  />
                </div>

                {/* Canvas regeneration */}
                {w.user && w.aspirations.length > 0 && (
                  <CanvasRegenerate
                    onGenerated={w.setRegeneratedCanvas}
                    existingCanvas={w.regeneratedCanvas}
                  />
                )}
              </>
            )}

            {/* Insight card — shown in both views */}
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

      {/* Settings sheet for reset options */}
      <SettingsSheet
        open={w.settingsOpen}
        onClose={() => w.setSettingsOpen(false)}
        onAction={w.handleSettingsAction}
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
