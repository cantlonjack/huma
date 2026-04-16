"use client";

import { memo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/shared/AuthProvider";
import { displayName } from "@/lib/display-name";
import TabShell from "@/components/shared/TabShell";
import TodaySkeleton from "@/components/today/TodaySkeleton";
import NotificationSettings from "@/components/today/NotificationSettings";
import { useToday, formatBriefingDate, getBehaviorChain } from "@/hooks/useToday";
import { PatternRouteCard } from "@/components/today/PatternRouteCard";
import { CompiledEntryRow } from "@/components/today/CompiledEntryRow";
import RpplProvenanceSheet from "@/components/today/RpplProvenanceSheet";
import { queryKeys, fetchPatterns } from "@/lib/queries";
import {
  AspirationQuickLook,
  RerouteCard,
  InsightCard,
  StructuralInsightCard,
  HypothesisCard,
  ComingUpSection,
  StandaloneBehaviorRow,
  TransitionCard,
} from "@/components/today/TodayCards";
import { ValidationCard } from "@/components/today/ValidationCard";
import WeekRhythm from "@/components/today/WeekRhythm";
import type { Nudge, DimensionKey, SheetEntry } from "@/types/v2";
import { DIMENSION_LABELS } from "@/types/v2";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";
import type { PulseState } from "@/components/shared/ConnectionThreads";

// ── Inlined: NudgeCard ──
const TYPE_LABELS: Record<string, string> = {
  temporal: "TIMING",
  pattern: "PATTERN",
  opportunity: "CONNECTION",
};

const TYPE_BORDER_COLORS: Record<string, string> = {
  temporal: "border-l-sage-500",
  pattern: "border-l-sky-600",
  opportunity: "border-l-amber-500",
};

const NudgeCard = memo(function NudgeCard({
  nudge,
  onDismiss,
  onEngage,
}: {
  nudge: Nudge;
  onDismiss: (id: string) => void;
  onEngage: (nudge: Nudge) => void;
}) {
  const borderClass = TYPE_BORDER_COLORS[nudge.type] || "border-l-sage-400";
  const label = TYPE_LABELS[nudge.type] || "NUDGE";

  return (
    <div
      className={`animate-entrance-2 bg-sand-100 border-l-[3px] ${borderClass} rounded-r-xl px-4 py-3.5 mx-4 mb-2.5`}
    >
      <span className="block font-sans text-[10px] font-semibold tracking-[0.2em] text-sage-400 mb-1">
        {label}
      </span>
      <p className="font-serif text-ink-700 text-[15px] leading-relaxed">
        {nudge.text}
      </p>
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={() => onEngage(nudge)}
          className="font-sans font-medium text-sage-500 cursor-pointer hover:text-sage-700 transition-colors text-[13px] bg-transparent border-none py-2 min-h-[44px]"
        >
          Tell me more &rarr;
        </button>
        <button
          onClick={() => onDismiss(nudge.id)}
          className="font-sans text-sage-300 cursor-pointer hover:text-sage-500 transition-colors text-base bg-transparent border-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center leading-none"
          aria-label="Dismiss nudge"
        >
          &times;
        </button>
      </div>
    </div>
  );
});

// ── Briefing Pulse (connection threads ring for header) ──
const ALL_DIMENSIONS: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

const BriefingPulse = memo(function BriefingPulse({
  compiledDimensions,
  movedDimensions,
  dormantDimensions = [],
}: {
  compiledDimensions: DimensionKey[];
  movedDimensions?: DimensionKey[];
  dormantDimensions?: DimensionKey[];
}) {
  // Show all dimensions from today's sheet as active, with pulse states
  const active = movedDimensions && movedDimensions.length > 0
    ? Array.from(new Set([...compiledDimensions, ...movedDimensions]))
    : compiledDimensions;

  const pulseStates: PulseState[] = ALL_DIMENSIONS.map(dim => ({
    dimension: dim,
    settled: movedDimensions ? movedDimensions.includes(dim) : false,
  }));

  return (
    <div className="flex justify-center">
      <ConnectionThreads
        activeDimensions={active as DimensionKey[]}
        dormantDimensions={dormantDimensions}
        size="compact"
        pulseStates={pulseStates}
      />
    </div>
  );
});

// ── Watching Footer ──
const WatchingFooter = memo(function WatchingFooter({
  text,
  dimensions,
}: {
  text: string;
  dimensions: [DimensionKey, DimensionKey];
}) {
  return (
    <div className="mx-5 animate-entrance-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-300 uppercase">
          Watching
        </span>
        <div className="flex-1 h-px bg-sand-200" />
      </div>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="font-sans text-sm text-ink-500 leading-relaxed">
            {text}
          </p>
        </div>
        {/* Mini constellation showing the two dimensions */}
        <div className="flex-shrink-0">
          <ConnectionThreads
            activeDimensions={dimensions}
            size="badge"
            animate={true}
          />
        </div>
      </div>
    </div>
  );
});

export default function TodayPage() {
  const t = useToday();
  const { user } = useAuth();
  const [provenanceEntry, setProvenanceEntry] = useState<SheetEntry | null>(null);

  // Load patterns so sheet entries can surface their RPPL provenance.
  const { data: patternData } = useQuery({
    queryKey: queryKeys.patterns(user?.id ?? null),
    queryFn: () => fetchPatterns(user?.id ?? null),
    enabled: true,
  });
  const patterns = patternData?.patterns ?? [];

  // Gather all dimensions from compiled entries for the pulse
  const compiledDimensions = Array.from(
    new Set(t.compiledEntries.flatMap(e => e.dimensions || []))
  ) as DimensionKey[];

  // Evening state sentence override
  const eveningSentence = t.isEvening && t.compiledEntries.length > 0
    ? (() => {
        const total = t.compiledEntries.length;
        const checked = t.compiledEntries.filter(e => {
          const key = `${e.aspirationId}:${e.behaviorKey}`;
          return t.checkedEntries.has(key);
        }).length;
        if (checked === 0) return null;
        const movedDims = t.capitalPulse?.movedDimensions || [];
        const dimNote = movedDims.length > 0
          ? ` ${movedDims.map(d => DIMENSION_LABELS[d]).join(", ")} moved.`
          : "";
        return `${checked} of ${total} happened today.${dimNote}`;
      })()
    : null;

  // First structural insight for Day 1 empty state
  const firstStructuralInsight = t.structuralInsights.length > 0 ? t.structuralInsights[0] : null;

  // Aggregate rhythm data for WeekRhythm in footer
  const aggregateRhythm = (() => {
    const agg: Record<number, number> = {};
    for (const aspId in t.rhythmData) {
      const days = t.rhythmData[aspId];
      for (const dow in days) {
        agg[Number(dow)] = (agg[Number(dow)] || 0) + days[Number(dow)];
      }
    }
    return agg;
  })();
  const hasRhythmData = t.dayCount >= 7 && Object.keys(aggregateRhythm).length > 0;

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

        {/* ═══ Minimal Top Bar ═══ */}
        <div className="h-[44px] border-b border-sand-300 flex justify-between items-center px-4">
          <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none">
            H U M A
          </span>
          <span className="font-sans text-sage-400 text-[11px]">
            Day {t.dayCount}
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
            {/* ═══ 1. BRIEFING HEADER — "State of Your System" ═══ */}

            {t.compiledEntries.length > 0 || t.sheetCompiling ? (
              <div className="animate-entrance-1 px-5 pt-8 pb-2">
                {/* Date + Day count — subtle top line */}
                <div className="flex items-center justify-between mb-6">
                  <p className="font-sans text-earth-400 text-[11px] tracking-wide">
                    {formatBriefingDate(t.date)}
                  </p>
                  <BriefingPulse
                    compiledDimensions={compiledDimensions}
                    movedDimensions={t.capitalPulse?.movedDimensions}
                    dormantDimensions={t.capitalPulse?.dormantDimensions}
                  />
                </div>

                {/* Opening — letter greeting, the hero element */}
                {t.opening && !t.sheetCompiling && (
                  <p className="font-serif text-ink-700 text-[17px] leading-relaxed mb-4">
                    {t.opening}
                  </p>
                )}

                {/* State sentence fallback (when no opening yet) */}
                {!t.opening && (eveningSentence || t.stateSentence) && (
                  <p className="font-serif text-ink-600 text-[17px] leading-relaxed mb-4">
                    {eveningSentence || t.stateSentence}
                  </p>
                )}

                {/* Through-line — the thread connecting today's actions */}
                {t.throughLine && !t.sheetCompiling && (
                  <div className="border-l-2 border-l-amber-400 pl-3.5 py-0.5 mb-2">
                    <p className="font-serif italic text-[15px] leading-snug text-ink-600">
                      {t.throughLine}
                    </p>
                  </div>
                )}

                {t.sheetCompiling && (
                  <p className="font-serif italic text-sage-400 text-lg">
                    Writing your letter...
                  </p>
                )}
              </div>
            ) : (
              /* No compiled sheet — Day 1 / empty state with breathing constellation */
              <div className="animate-entrance-1 px-5 pt-8 pb-4 flex flex-col items-center">
                <BriefingPulse compiledDimensions={compiledDimensions} />

                <p className="font-serif text-ink-700 text-center text-[15px] mt-4 tracking-wide">
                  {formatBriefingDate(t.date)}
                </p>

                {firstStructuralInsight && (
                  <p className="font-serif italic text-ink-500 text-center text-[15px] leading-relaxed mt-2 max-w-[380px]">
                    {firstStructuralInsight.title}
                  </p>
                )}
              </div>
            )}

            {/* ═══ 2. TODAY'S ACTIONS — Narrative Entries ═══ */}
            {t.compiledEntries.length > 0 && (
              <div className="mx-5 mt-2 mb-2 animate-entrance-2">
                {/* Entries — flowing narrative with connection transitions */}
                <div className="flex flex-col">
                  {t.compiledEntries.map((entry, i) => {
                    const key = `${entry.aspirationId}:${entry.behaviorKey}`;
                    const isChecked = t.checkedEntries.has(key);
                    const isKeystone = t.keystoneEntry?.behaviorKey === entry.behaviorKey
                      && t.keystoneEntry?.aspirationId === entry.aspirationId;

                    return (
                      <div key={entry.behaviorKey}>
                        {/* Connection transition from previous entry */}
                        {i > 0 && entry.connectionNote && (
                          <p className="font-serif italic text-earth-400 text-[13px] leading-relaxed pl-[56px] py-2">
                            {entry.connectionNote}
                          </p>
                        )}
                        <CompiledEntryRow
                          entry={entry}
                          isChecked={isChecked}
                          isKeystone={isKeystone}
                          onToggle={() =>
                            t.handleToggleStep(entry.aspirationId, entry.behaviorKey, !isChecked)
                          }
                          onShowProvenance={setProvenanceEntry}
                        />
                        {/* Thin divider between entries (when no connection note follows) */}
                        {i < t.compiledEntries.length - 1 && !t.compiledEntries[i + 1]?.connectionNote && (
                          <div className="h-px bg-sage-200/40 my-3 ml-[56px]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ 3. Inline insight — woven into the narrative after entries ═══ */}
            {t.compiledEntries.length > 0 && t.insight && (
              <div className="mx-5 mt-3 mb-1">
                <InsightCard
                  insight={t.insight}
                  onTellMore={() => t.openChatWithContext(t.insight!.text)}
                  onDismiss={t.dismissInsight}
                />
              </div>
            )}

            {/* ═══ P.S. — Nudges as letter postscripts ═══ */}
            {t.compiledEntries.length > 0 && t.nudges.length > 0 && (
              <div className="mx-5 mt-3 mb-1">
                <p className="font-serif italic text-earth-400 text-[13px] mb-2">P.S.</p>
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

            {/* ═══ Divider ═══ */}
            {t.compiledEntries.length > 0 && (
              <div className="mx-5 my-5 border-t border-sand-200" />
            )}

            {/* ═══ 4. "What to Watch" or Weekly Rhythm ═══ */}
            {t.watchingSignal ? (
              <WatchingFooter
                text={t.watchingSignal.text}
                dimensions={t.watchingSignal.dimensions}
              />
            ) : hasRhythmData ? (
              <div className="mx-5 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-300 uppercase">
                    Your Week
                  </span>
                  <div className="flex-1 h-px bg-sand-200" />
                </div>
                <WeekRhythm dayCounts={aggregateRhythm} />
              </div>
            ) : null}

            {/* ═══ BELOW THE BRIEFING — supporting material ═══ */}

            {/* Divider before supporting content */}
            {(t.watchingSignal || hasRhythmData) && (
              <div className="mx-5 my-4 border-t border-sand-200" />
            )}

            {/* Aspiration Ribbon — navigation, not story */}
            <div className="hide-scrollbar overflow-x-auto mb-3 scroll-smooth">
              <div className="flex gap-2 animate-entrance-2 px-4">
                {t.aspirations.map(asp => (
                  <button
                    key={asp.id}
                    onClick={() => t.setQuickLookAspiration(asp)}
                    className="flex-shrink-0 cursor-pointer bg-sand-100 border border-sand-300 rounded-full px-3.5 py-2.5 text-[13px] font-sans text-sage-600 whitespace-nowrap min-h-[44px] flex items-center hover:bg-sand-200 hover:border-sand-350 active:bg-sand-250 transition-colors duration-150"
                  >
                    {displayName(asp.clarifiedText || asp.rawText)}
                  </button>
                ))}
                <button
                  onClick={t.openNewAspirationChat}
                  className="flex-shrink-0 cursor-pointer bg-transparent border border-dashed border-sage-200 rounded-full px-3.5 py-2.5 text-[13px] font-sans text-sage-400 whitespace-nowrap min-h-[44px] flex items-center gap-1 hover:border-sage-400 hover:text-sage-500 active:bg-sage-50 transition-colors duration-150"
                  aria-label="Add aspiration"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add
                </button>
              </div>
            </div>

            {/* Status — subtle, after ribbon */}
            {t.activeCount > 0 && (
              <div className="px-4 pb-2">
                {t.adjustingCount > 0 ? (
                  <span className="font-sans text-[12px] text-amber-600">
                    &#9679; {t.adjustingCount} need{t.adjustingCount === 1 ? "s" : ""} attention
                  </span>
                ) : (
                  <span className="font-sans text-earth-400 text-[12px]">
                    <span className="text-sage-400">&#9679;</span> On route &middot; {t.activeCount} pattern{t.activeCount !== 1 ? "s" : ""} active
                  </span>
                )}
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

            {/* Insight Card — shown inline after entries when compiled; standalone when no entries */}
            {t.compiledEntries.length === 0 && t.insight && (
              <InsightCard
                insight={t.insight}
                onTellMore={() => t.openChatWithContext(t.insight!.text)}
                onDismiss={t.dismissInsight}
              />
            )}

            {/* Structural Insights (Day 1 value — from decomposition) */}
            {t.structuralInsights.length > 0 && t.structuralInsights.slice(0, 2).map(si => (
              <StructuralInsightCard
                key={si.id}
                insight={si}
                onTellMore={() => t.openChatWithContext(si.body)}
                onDismiss={() => t.dismissStructuralInsight(si.id)}
              />
            ))}

            {/* Proactive Nudges — shown as P.S. when compiled entries exist; standalone otherwise */}
            {t.compiledEntries.length === 0 && t.nudges.length > 0 && (
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

            {/* Weekly Validation Cards */}
            {t.validationAspirations.length > 0 && (
              <div className="mb-2">
                <div className="px-4 pb-2">
                  <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-300 uppercase">
                    How did last week go?
                  </span>
                </div>
                {t.validationAspirations.map(asp => (
                  <ValidationCard
                    key={asp.id}
                    aspiration={asp}
                    onAnswer={t.handleValidationAnswer}
                  />
                ))}
              </div>
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

            {/* Coming Up — remove card styling, flow as narrative */}
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
                  <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-300 uppercase">
                    Today&apos;s Behaviors
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
              className="flex-1 text-left cursor-pointer bg-white border border-sand-300 rounded-full px-3.5 py-2 text-sm font-sans text-sage-300 hover:border-sage-300 transition-colors duration-150"
            >
              Tell HUMA something...
            </button>
            <button
              onClick={() => t.openChatWithContext(null)}
              className="cursor-pointer flex-shrink-0 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 rounded-full size-9 border-none flex items-center justify-center transition-colors duration-150"
              aria-label="Open chat"
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

      {/* RPPL Provenance Sheet */}
      <RpplProvenanceSheet
        open={!!provenanceEntry}
        onClose={() => setProvenanceEntry(null)}
        aspirationId={provenanceEntry?.aspirationId}
        behaviorKey={provenanceEntry?.behaviorKey}
        patterns={patterns}
        behaviorText={provenanceEntry?.headline || provenanceEntry?.behaviorText}
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
