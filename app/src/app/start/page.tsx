"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useStart } from "@/hooks/useStart";
import AuthModal from "@/components/shared/AuthModal";
import ArchetypeSelectionScreen from "@/components/onboarding/ArchetypeSelectionScreen";
import MessageBubble from "@/components/onboarding/MessageBubble";
import ContextAssemblyPanel from "@/components/onboarding/ContextAssemblyPanel";
import { profileCompleteness } from "@/lib/life-profile-utils";
import { ConnectionThreads, dimensionKeysFromLabels } from "@/components/shared/ConnectionThreads";
import type { StartMessage } from "@/hooks/useStart";
import type { Behavior, PaletteConcept, DimensionKey } from "@/types/v2";

// ── Inlined: PalettePanel ──
function PalettePanel({
  concepts,
  onTap,
  loading,
}: {
  concepts: PaletteConcept[];
  onTap: (concept: PaletteConcept) => void;
  loading: boolean;
}) {
  if (concepts.length === 0 && !loading) return null;

  return (
    <div className="p-6">
      <p className="font-sans text-xs text-earth-400 mb-4 tracking-wide">
        You might also be dealing with...
      </p>
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <button
            key={concept.id}
            onClick={() => onTap(concept)}
            className="px-3.5 py-2 rounded-full bg-sand-100 text-earth-500 border border-sand-300 font-sans text-sm hover:bg-sage-50 hover:text-sage-600 hover:border-sage-300 transition-all duration-200 cursor-pointer"
          >
            {concept.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Understanding Moment ──────────────────────────────────────────────────
// Inline card that appears in the conversation when HUMA extracts context.
// Shows the ConnectionThreads ring with newly-learned dimensions lighting up.
// Persists in the thread — the user watches their profile weave itself.

function UnderstandingMoment({
  allKnown,
  justLearned,
}: {
  allKnown: string[];
  justLearned: string[];
}) {
  const allKeys = dimensionKeysFromLabels(allKnown);
  const newKeys = dimensionKeysFromLabels(justLearned);
  const newLabels = newKeys.map(k => {
    const labels: Record<string, string> = {
      body: "how you\u2019re built", people: "who\u2019s around you",
      money: "your resources", home: "where you live",
      growth: "how you\u2019re growing", joy: "what brings you joy",
      purpose: "what drives you", identity: "who you are",
    };
    return labels[k] || k;
  });

  return (
    <div className="flex justify-center my-5 animate-fade-in">
      <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-sage-50/50 border border-sage-200/60 max-w-[240px]">
        <ConnectionThreads
          activeDimensions={allKeys}
          size="compact"
        />
        <p className="font-sans text-[11px] text-sage-500 text-center leading-relaxed">
          {newKeys.length === 1
            ? `Now I see ${newLabels[0]}`
            : `Now I see ${newLabels.slice(0, -1).join(", ")} and ${newLabels[newLabels.length - 1]}`
          }
        </p>
      </div>
    </div>
  );
}

// ─── Collapsible Conversation Thread ────────────────────────────────────────
// Shows only the last 4 messages (2 exchanges) by default.
// Older messages collapse into a tappable "N earlier messages" pill.
// Keeps the conversation from feeling like an endless thread.

const VISIBLE_TAIL = 4; // last 2 exchanges (user + huma each)

function ConversationThread({
  scrollRef,
  messages,
  streaming,
  onOptionTap,
  onConfirmBehaviors,
  hasMessages,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  messages: StartMessage[];
  streaming: boolean;
  onOptionTap: (option: string) => void;
  onConfirmBehaviors: (behaviors: Behavior[]) => void;
  hasMessages: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // Filter out context notes for counting real messages
  const realMessages = messages.filter((m) => !m.contextNote);
  const hiddenCount = expanded ? 0 : Math.max(0, realMessages.length - VISIBLE_TAIL);
  const visibleMessages = expanded
    ? messages
    : hiddenCount > 0
      ? messages.filter((m) => {
          if (m.contextNote) return true; // always show context notes
          const idx = realMessages.indexOf(m);
          return idx >= realMessages.length - VISIBLE_TAIL;
        })
      : messages;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      {!hasMessages && (
        <div className="flex flex-col items-center justify-center h-full pb-16">
          <h2 className="font-serif text-2xl text-earth-700">
            What&apos;s going on?
          </h2>
        </div>
      )}

      {/* Collapsed earlier messages pill */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mx-auto mb-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sand-100 hover:bg-sand-200 transition-colors duration-200 cursor-pointer"
        >
          <span className="font-sans text-xs text-earth-400">
            {hiddenCount} earlier {hiddenCount === 1 ? "message" : "messages"}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-earth-300">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {visibleMessages.map((msg) =>
        msg.contextSnapshot ? (
          /* ── Understanding Moment ── */
          <UnderstandingMoment
            key={msg.id}
            allKnown={msg.contextSnapshot.allKnown}
            justLearned={msg.contextSnapshot.justLearned}
          />
        ) : msg.contextNote ? (
          <div
            key={msg.id}
            className="mb-3 ml-2 font-sans text-[0.82rem] text-sage-600 italic animate-fade-in"
          >
            {msg.content}
          </div>
        ) : (
          <MessageBubble
            key={msg.id}
            message={msg}
            onOptionTap={onOptionTap}
            onConfirmBehaviors={onConfirmBehaviors}
          />
        )
      )}

      {streaming && messages[messages.length - 1]?.content === "" && (
        <div className="flex justify-start mb-4 pl-1">
          <div className="flex gap-1.5 py-2">
            <span className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile Profile Mini-Bar + Drawer ──
function ProfileMiniBar({
  completeness,
  humaContext,
  knownDimensionKeys,
  open,
  onToggle,
  pulse,
  onGapPromptTap,
}: {
  completeness: { filled: number; total: number; labels: string[] };
  humaContext: import("@/types/context").HumaContext;
  knownDimensionKeys: DimensionKey[];
  open: boolean;
  onToggle: () => void;
  pulse: boolean;
  onGapPromptTap?: (question: string) => void;
}) {
  return (
    <div className="lg:hidden">
      {/* Mini-bar — 80px peek height */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-2.5 bg-sand-50 border-t border-sand-200 cursor-pointer hover:bg-sand-100 transition-colors duration-150"
        style={{ minHeight: "44px" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {knownDimensionKeys.length > 0 ? (
            <ConnectionThreads
              activeDimensions={knownDimensionKeys}
              size="micro"
              animate={false}
              className="flex-shrink-0"
            />
          ) : (
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 bg-sand-300 ${pulse ? "animate-pulse" : ""}`}
            />
          )}
          <span className="font-sans text-xs text-earth-500 truncate">
            {completeness.filled === 0
              ? "Your life \u2014 building as we talk"
              : `${completeness.filled} of ${completeness.total} sections`}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-earth-300 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable drawer */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-[50vh]" : "max-h-0"
        }`}
      >
        <div className="overflow-y-auto max-h-[50vh] border-t border-sand-200 bg-sand-50 px-5 py-4">
          <ContextAssemblyPanel
            humaContext={humaContext}
            knownDimensionKeys={knownDimensionKeys}
            onGapPromptTap={onGapPromptTap}
          />
        </div>
      </div>
    </div>
  );
}

export default function StartPage() {
  const {
    onboardingStep, transitioning, stepReady, messages, input, setInput,
    streaming, paletteConcepts, paletteLoading, showPaletteMobile,
    setShowPaletteMobile, showTransition, showAuthModal, setShowAuthModal,
    hasMessages, knownDimensionLabels, contextPercentage,
    scrollRef, inputRef, sendMessage, handleOptionTap,
    handleConfirmBehaviors, handlePaletteTap, handleKeyDown,
    handleAuthenticated, handleArchetypeContinueWithTemplate,
    handleArchetypeContinueBlank, handleArchetypeSkip,
    humaContext, exchangeCount, isFirstConversation,
  } = useStart();

  const [rightPanelTab, setRightPanelTab] = useState<"suggestions" | "profile">("suggestions");
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profilePulse, setProfilePulse] = useState(false);
  const [hasAutoPeeked, setHasAutoPeeked] = useState(false);

  const completeness = useMemo(
    () => profileCompleteness(humaContext),
    [humaContext],
  );

  // Pulse the mini-bar dot when a new section fills for the first time
  const prevFilledRef = useRef(completeness.filled);
  useEffect(() => {
    if (completeness.filled > prevFilledRef.current) {
      setProfilePulse(true);
      const timer = setTimeout(() => setProfilePulse(false), 1500);
      prevFilledRef.current = completeness.filled;

      // Auto-peek on first context extraction (mobile) — briefly open drawer
      if (!hasAutoPeeked && completeness.filled === 1) {
        setHasAutoPeeked(true);
        setProfileDrawerOpen(true);
        const peekTimer = setTimeout(() => setProfileDrawerOpen(false), 3000);
        return () => { clearTimeout(timer); clearTimeout(peekTimer); };
      }

      return () => clearTimeout(timer);
    }
    prevFilledRef.current = completeness.filled;
  }, [completeness.filled, hasAutoPeeked]);

  // Gap prompt handler — inject question into conversation input
  const handleGapPromptTap = useCallback((question: string) => {
    sendMessage(question);
    setProfileDrawerOpen(false); // Close drawer on mobile after tap
  }, [sendMessage]);

  // Auto-switch to profile tab once 2+ sections have content
  const autoSwitched = useMemo(() => completeness.filled >= 2, [completeness.filled]);
  const activeTab = autoSwitched && rightPanelTab === "suggestions" ? "profile" : rightPanelTab;

  // Convert known dimension labels to DimensionKey[] for ConnectionThreads
  const knownDimensionKeys = useMemo(
    () => dimensionKeysFromLabels(knownDimensionLabels),
    [knownDimensionLabels],
  );

  // Wait for initialization before rendering
  if (!stepReady) {
    return <div className="min-h-dvh bg-sand-50" />;
  }

  // Transition screen
  if (showTransition) {
    return (
      <div className="min-h-dvh bg-sand-50 flex items-center justify-center animate-fade-in">
        <div className="text-center px-8 max-w-sm">
          <p className="font-serif text-xl md:text-2xl text-sage-700 mb-3">
            Your day starts tomorrow.
          </p>
          <p className="font-sans text-sm text-earth-500">
            I&apos;ll have your sheet ready.
          </p>
        </div>
      </div>
    );
  }

  // Step 0: Archetype selection
  if (onboardingStep === "archetype") {
    return (
      <div className={transitioning ? "animate-crossfade-out" : ""}>
        <ArchetypeSelectionScreen
          onContinueWithTemplate={handleArchetypeContinueWithTemplate}
          onContinueBlank={handleArchetypeContinueBlank}
          onSkip={handleArchetypeSkip}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col lg:flex-row animate-fade-in">
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Conversation Panel */}
      <div className="flex-1 flex flex-col min-h-0 lg:w-[60%]">
        {/* Header with context progress */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-sage-700 text-lg tracking-wide">HUMA</h1>
            {hasMessages && completeness.filled > 0 && (
              <div className="flex items-center gap-2 animate-[fade-in_500ms_ease-out]">
                <div className="w-20 h-1 bg-sand-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(completeness.filled / completeness.total) * 100}%` }}
                  />
                </div>
                <span className="font-sans text-[10px] text-earth-400 tracking-wide">
                  {completeness.filled} of {completeness.total} sections
                  {isFirstConversation && completeness.filled >= 2 && (
                    <span className="ml-2 text-sage-500">Almost ready for your first sheet</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Ambient dimension dots in header — grows as context fills */}
          {knownDimensionKeys.length > 0 && (
            <div className="mt-1.5">
              <ConnectionThreads
                activeDimensions={knownDimensionKeys}
                size="micro"
                animate={false}
              />
            </div>
          )}
        </div>

        {/* Messages or Prompt */}
        <ConversationThread
          scrollRef={scrollRef}
          messages={messages}
          streaming={streaming}
          onOptionTap={handleOptionTap}
          onConfirmBehaviors={handleConfirmBehaviors}
          hasMessages={hasMessages}
        />

        {/* Input */}
        <div className="px-6 pb-6 pt-2 border-t border-sand-200">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or just start talking..."
              disabled={streaming}
              className="w-full py-3 pr-12 font-sans text-base text-earth-800 bg-transparent border-b border-sand-300 focus:border-sage-500 placeholder:text-earth-350 disabled:opacity-50 transition-colors duration-200"
            />
            {input.trim() && (
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sage-600 hover:text-sage-700 active:text-sage-800 disabled:opacity-50 cursor-pointer transition-colors duration-200"
                aria-label="Send"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>

          {/* Quick Start affordance — escape hatch to move to planning */}
          {isFirstConversation && exchangeCount >= 3 && completeness.filled >= 2 && (
            <button
              onClick={() => sendMessage("Let's make a plan for this week")}
              className="mt-2 font-sans text-xs text-sage-500 hover:text-sage-600 transition-colors duration-200 cursor-pointer"
            >
              Ready to build your first day? &rarr;
            </button>
          )}

          {/* Mobile palette toggle */}
          {paletteConcepts.length > 0 && (
            <button
              onClick={() => setShowPaletteMobile(!showPaletteMobile)}
              className="mt-3 font-sans text-xs text-earth-400 hover:text-sage-600 transition-colors duration-200 lg:hidden cursor-pointer"
            >
              {showPaletteMobile ? "Hide suggestions" : `${paletteConcepts.length} related topics...`}
            </button>
          )}
        </div>

        {/* Mobile profile mini-bar + drawer */}
        <ProfileMiniBar
          completeness={completeness}
          humaContext={humaContext}
          knownDimensionKeys={knownDimensionKeys}
          open={profileDrawerOpen}
          onToggle={() => setProfileDrawerOpen((o) => !o)}
          pulse={profilePulse}
          onGapPromptTap={handleGapPromptTap}
        />

        {/* Mobile palette tray */}
        {showPaletteMobile && (
          <div className="lg:hidden border-t border-sand-200 bg-sand-50">
            <PalettePanel concepts={paletteConcepts} onTap={handlePaletteTap} loading={paletteLoading} />
          </div>
        )}
      </div>

      {/* Desktop Right Panel — Tabbed: Suggestions / Your Profile */}
      <div className="hidden lg:flex lg:flex-col lg:w-[40%] border-l border-sand-200">
        {/* Tab bar */}
        <div className="flex border-b border-sand-200">
          <button
            onClick={() => setRightPanelTab("suggestions")}
            className={`flex-1 py-3 font-sans text-xs tracking-[0.06em] uppercase border-none cursor-pointer transition-colors duration-150 ${
              activeTab === "suggestions"
                ? "text-sage-600 bg-sand-50 border-b-2 border-b-sage-500"
                : "text-earth-400 bg-transparent hover:text-earth-600"
            }`}
          >
            Suggestions
          </button>
          <button
            onClick={() => setRightPanelTab("profile")}
            className={`flex-1 py-3 font-sans text-xs tracking-[0.06em] uppercase border-none cursor-pointer transition-colors duration-150 ${
              activeTab === "profile"
                ? "text-sage-600 bg-sand-50 border-b-2 border-b-sage-500"
                : "text-earth-400 bg-transparent hover:text-earth-600"
            }`}
          >
            Your Profile
            {completeness.filled > 0 && (
              <span className="ml-1.5 text-[10px] text-sage-400">
                {completeness.filled}/{completeness.total}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "suggestions" ? (
            <PalettePanel concepts={paletteConcepts} onTap={handlePaletteTap} loading={paletteLoading} />
          ) : (
            <div className="p-5">
              <ContextAssemblyPanel
                humaContext={humaContext}
                knownDimensionKeys={knownDimensionKeys}
                onGapPromptTap={handleGapPromptTap}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
