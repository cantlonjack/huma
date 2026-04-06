"use client";

import { displayName } from "@/lib/display-name";
import TabShell from "@/components/shared/TabShell";
import TodaySkeleton from "@/components/today/TodaySkeleton";
import NotificationSettings from "@/components/today/NotificationSettings";
import { useToday, formatHeaderDate, getBehaviorChain } from "@/hooks/useToday";
import { PatternRouteCard } from "@/components/today/PatternRouteCard";
import { CompiledEntryRow } from "@/components/today/CompiledEntryRow";
import {
  AspirationQuickLook,
  RerouteCard,
  InsightCard,
  ComingUpSection,
  StandaloneBehaviorRow,
  TransitionCard,
} from "@/components/today/TodayCards";
import { NudgeCard } from "@/components/today/NudgeCard";
import { CapitalPulse } from "@/components/today/CapitalPulse";

export default function TodayPage() {
  const t = useToday();

  return (
    <TabShell
      contextPrompt={t.chatContext || "Tell HUMA something..."}
      forceOpen={t.chatOpen}
      onChatClose={t.closeChatSheet}
      chatMode={t.chatMode}
      hideBubble={t.aspirations.length > 0}
      sourceTab="today"
      tabContext={{
        aspirations: t.aspirations.map(a => ({
          id: a.id,
          name: a.clarifiedText || a.rawText,
          behaviors: a.behaviors?.map(b => b.text) || [],
          status: a.funnel?.validationStatus || "working",
        })),
        weekCounts: t.weekCounts,
        dayCount: t.dayCount,
        stalledAspirations: t.aspirations
          .filter(a => a.funnel?.validationStatus === "adjusting")
          .map(a => a.clarifiedText || a.rawText),
        ...(t.archetypes.length > 0 && { archetypes: t.archetypes }),
        ...(t.whyStatementForChat && { whyStatement: t.whyStatementForChat }),
        ...(t.transitionSignal && t.chatOpen && { transition: t.transitionSignal }),
      }}
    >
      <div className="min-h-dvh bg-sand-50 flex flex-col pb-[140px]">
        <h1 className="sr-only">Today</h1>
        {/* Header bar — 44px */}
        <div className="h-[44px] border-b border-sand-300 flex justify-between items-center px-4">
          <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none">
            H U M A
          </span>
          <span className="font-sans text-sage-400 text-[11px]">
            {formatHeaderDate(t.date)} &middot; Day {t.dayCount}
          </span>
        </div>

        {/* Section label: TODAY */}
        <div className="px-4 pt-4 pb-2">
          <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-ink-300">
            TODAY
          </span>
        </div>

        {/* Loading state */}
        {t.loading ? (
          <TodaySkeleton />
        ) : t.aspirations.length === 0 ? (
          /* ─── Empty State ─── */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="var(--color-sage-200)" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="40" cy="40" r="4" fill="var(--color-sage-300)" />
            </svg>

            <p className="font-serif italic text-sage-600 text-xl text-center max-w-60">
              Nothing scheduled yet.
            </p>

            <p className="font-sans text-sage-400 text-sm text-center max-w-[260px] leading-normal">
              Start a conversation and HUMA will build your first day.
            </p>

            <button
              onClick={t.navigateToStart}
              className="font-sans cursor-pointer w-full max-w-[280px] bg-amber-600 text-white text-[15px] font-semibold rounded-lg py-3.5 border-none"
            >
              What&apos;s going on?
            </button>
          </div>
        ) : (
          <>
            {/* Status Line */}
            {t.activeCount > 0 && (
              <div className="animate-entrance-1 px-4 pb-2">
                {t.adjustingCount > 0 ? (
                  <span className="font-sans text-[13px] text-amber-600">
                    &#9679; {t.adjustingCount} need{t.adjustingCount === 1 ? "s" : ""} attention
                  </span>
                ) : (
                  <span className="font-sans text-sage-500 text-[13px]">
                    <span className="text-sage-400">&#9679;</span> On route &middot; {t.activeCount} pattern{t.activeCount !== 1 ? "s" : ""} active
                  </span>
                )}
              </div>
            )}

            {/* Aspiration Ribbon */}
            <div className="hide-scrollbar overflow-x-auto mb-3" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="flex gap-2 animate-entrance-1 px-4">
                {t.aspirations.map(asp => (
                  <button
                    key={asp.id}
                    onClick={() => t.setQuickLookAspiration(asp)}
                    className="flex-shrink-0 cursor-pointer bg-sand-100 border border-sand-300 rounded-full px-3.5 py-2.5 text-[13px] font-sans text-sage-600 whitespace-nowrap min-h-[44px] flex items-center"
                  >
                    {displayName(asp.clarifiedText || asp.rawText)}
                  </button>
                ))}
                <button
                  onClick={t.openNewAspirationChat}
                  className="flex-shrink-0 cursor-pointer bg-transparent border border-dashed border-sage-200 rounded-full px-3.5 py-2.5 text-[13px] font-sans text-sage-400 whitespace-nowrap min-h-[44px] flex items-center gap-1"
                  aria-label="Add aspiration"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add
                </button>
              </div>
            </div>

            {/* Insight Card */}
            {t.insight && (
              <InsightCard
                insight={t.insight}
                onTellMore={() => t.openChatWithContext(t.insight!.text)}
                onDismiss={t.dismissInsight}
              />
            )}

            {/* Proactive Nudges (0-2, below insight) */}
            {t.nudges.length > 0 && (
              <div className="mb-2">
                {t.nudges.map(nudge => (
                  <NudgeCard
                    key={nudge.id}
                    nudge={nudge}
                    onDismiss={t.dismissNudge}
                    onEngage={t.engageNudge}
                  />
                ))}
              </div>
            )}

            {/* Through-line header */}
            {t.throughLine && t.compiledEntries.length > 0 && (
              <div className="animate-entrance-2 px-5 pb-5">
                <p className="font-serif italic text-base leading-relaxed text-ink-600 max-w-[480px] tracking-[0.01em]">
                  {t.throughLine}
                </p>
              </div>
            )}

            {/* Transition Signal */}
            {t.transitionSignal && (
              <TransitionCard
                signal={t.transitionSignal}
                onOpen={t.openTransitionChat}
                onDismiss={t.dismissTransition}
              />
            )}

            {/* Compiled Sheet Entries */}
            {t.compiledEntries.length > 0 ? (
              <div className="mx-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  {t.compiledEntries.map((entry, i) => {
                    const isChecked = t.checkedEntries.has(`${entry.aspirationId}:${entry.behaviorKey}`);
                    return (
                      <CompiledEntryRow
                        key={entry.behaviorKey}
                        entry={entry}
                        isChecked={isChecked}
                        isTrigger={i === 0}
                        onToggle={() =>
                          t.handleToggleStep(entry.aspirationId, entry.behaviorKey, !isChecked)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ) : t.sheetCompiling ? (
              <div className="px-4 pb-3">
                <p className="font-serif italic text-sage-400 animate-entrance-2 text-sm">
                  Building your day...
                </p>
              </div>
            ) : null}

            {/* Capital Pulse — shows after check-offs */}
            {t.capitalPulse && t.capitalPulse.movedDimensions.length > 0 && (
              <CapitalPulse
                movedDimensions={t.capitalPulse.movedDimensions}
                dormantDimension={t.capitalPulse.dormantDimension}
              />
            )}

            {/* Pattern Route Cards (fallback when no compiled sheet) */}
            {t.compiledEntries.length === 0 && !t.sheetCompiling && t.aspirations
              .filter(a => {
                const status = a.funnel?.validationStatus || "working";
                return status === "working" || status === "active";
              })
              .map((asp, i) => {
                const steps = getBehaviorChain(asp);
                const aspChecked = new Set<string>();
                for (const entry of t.checkedEntries) {
                  if (entry.startsWith(`${asp.id}:`)) {
                    aspChecked.add(entry.replace(`${asp.id}:`, ""));
                  }
                }

                return (
                  <div key={asp.id} className={i <= 2 ? `animate-entrance-${i + 2}` : ""}>
                    <PatternRouteCard
                      aspiration={asp}
                      steps={steps}
                      checkedSteps={aspChecked}
                      weekCounts={t.weekCounts}
                      thirtyDayCount={t.thirtyDayCounts[asp.id] || 0}
                      allAspirations={t.aspirations}
                      dayOfWeekCounts={t.rhythmData[asp.id] || {}}
                      disruption={t.disruptions[asp.id] || null}
                      dayCount={t.dayCount}
                      onToggleStep={t.handleToggleStep}
                      onOpenChat={t.openChatWithContext}
                    />
                  </div>
                );
              })}

            {/* Coming Up */}
            <ComingUpSection items={t.comingUpItems} />

            {/* Reroute Card */}
            {t.rerouteAspiration && (
              <RerouteCard
                aspiration={t.rerouteAspiration}
                weekCompletions={
                  t.rerouteAspiration.behaviors
                    .map(b => t.weekCounts[b.text]?.completed || 0)
                    .reduce((sum, c) => sum + c, 0)
                }
                onOpenChat={t.openChatWithContext}
              />
            )}

            {/* Standalone Behaviors */}
            {t.standaloneEntries.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2">
                  <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-ink-300">
                    TODAY&apos;S BEHAVIORS
                  </span>
                </div>
                {t.standaloneEntries.map(entry => (
                  <StandaloneBehaviorRow
                    key={entry.behavior_text}
                    entry={entry}
                    isChecked={t.checkedEntries.has(`:${entry.behavior_text}`)}
                    onToggle={() => t.handleToggleStandalone(entry.behavior_text)}
                  />
                ))}
              </>
            )}

            {/* Notification settings link */}
            {t.pushState === "subscribed" && (
              <div className="px-4 pt-6 text-center">
                <button
                  onClick={() => t.setNotifSettingsOpen(true)}
                  className="font-sans cursor-pointer text-xs text-earth-400 bg-transparent border-none p-0 underline decoration-sand-300 underline-offset-[3px]"
                >
                  Notification settings
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Prompt Bar */}
        {!t.loading && t.aspirations.length > 0 && (
          <div
            className="fixed left-0 right-0 z-40 bg-sand-50 border-t border-sand-300 px-4 py-2.5 flex items-center gap-2.5"
            style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              onClick={() => t.openChatWithContext(null)}
              className="flex-1 text-left cursor-pointer bg-white border border-sand-300 rounded-full px-3.5 py-2 text-sm font-sans text-sage-300"
            >
              Tell HUMA something...
            </button>
            <button
              onClick={() => t.openChatWithContext(null)}
              className="cursor-pointer flex-shrink-0 bg-amber-600 rounded-full size-8 border-none flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <NotificationSettings
        open={t.notifSettingsOpen}
        onClose={() => t.setNotifSettingsOpen(false)}
      />

      {/* Aspiration Quick-Look */}
      {t.quickLookAspiration && (
        <AspirationQuickLook
          aspiration={t.quickLookAspiration}
          weekCompletions={
            t.quickLookAspiration.behaviors
              .map(b => t.weekCounts[b.text]?.completed || 0)
              .reduce((sum, c) => sum + c, 0)
          }
          onClose={() => t.setQuickLookAspiration(null)}
        />
      )}
    </TabShell>
  );
}
