"use client";

import { useStart } from "@/hooks/useStart";
import AuthModal from "@/components/AuthModal";
import ArchetypeSelectionScreen from "@/components/onboarding/ArchetypeSelectionScreen";
import MessageBubble from "@/components/onboarding/MessageBubble";
import PalettePanel from "@/components/onboarding/PalettePanel";

export default function StartPage() {
  const {
    onboardingStep, transitioning, stepReady, messages, input, setInput,
    streaming, paletteConcepts, paletteLoading, showPaletteMobile,
    setShowPaletteMobile, showTransition, showAuthModal, setShowAuthModal,
    hasMessages, scrollRef, inputRef, sendMessage, handleOptionTap,
    handleConfirmBehaviors, handlePaletteTap, handleKeyDown,
    handleAuthenticated, handleArchetypeContinueWithTemplate,
    handleArchetypeContinueBlank, handleArchetypeSkip,
  } = useStart();

  // Wait for initialization before rendering
  if (!stepReady) {
    return <div className="min-h-dvh bg-sand-50" />;
  }

  // Transition screen
  if (showTransition) {
    return (
      <div className="min-h-dvh bg-sand-50 flex items-center justify-center animate-fade-in">
        <div className="text-center px-8">
          <p className="font-serif text-2xl text-sage-700 mb-3">
            Your day starts tomorrow.
          </p>
          <p className="font-sans text-sm text-earth-400">
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
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="font-serif text-sage-700 text-lg tracking-wide">HUMA</h1>
        </div>

        {/* Messages or Prompt */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center h-full pb-16">
              <h2 className="font-serif text-2xl text-earth-700">
                What&apos;s going on?
              </h2>
            </div>
          )}

          {messages.map((msg) =>
            msg.contextNote ? (
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
                onOptionTap={handleOptionTap}
                onConfirmBehaviors={handleConfirmBehaviors}
              />
            )
          )}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-2xl px-5 py-3.5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

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
              className="w-full py-3 pr-12 font-sans text-base text-earth-800 bg-transparent border-b border-sand-300 focus:border-sage-500 focus:outline-none placeholder:text-earth-300 disabled:opacity-50 transition-colors duration-200"
            />
            {input.trim() && (
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-sage-600 hover:text-sage-700 disabled:opacity-50 cursor-pointer transition-colors duration-200"
                aria-label="Send"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>

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

        {/* Mobile palette tray */}
        {showPaletteMobile && (
          <div className="lg:hidden border-t border-sand-200 bg-sand-50">
            <PalettePanel concepts={paletteConcepts} onTap={handlePaletteTap} loading={paletteLoading} />
          </div>
        )}
      </div>

      {/* Desktop Palette Panel */}
      <div className="hidden lg:block lg:w-[40%] border-l border-sand-200 overflow-y-auto">
        <PalettePanel concepts={paletteConcepts} onTap={handlePaletteTap} loading={paletteLoading} />
      </div>
    </div>
  );
}
