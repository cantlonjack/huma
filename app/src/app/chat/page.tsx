"use client";

import { useChat, type RichMessage } from "@/hooks/useChat";
import { ContextCard } from "@/components/chat/ContextCard";
import { PastConversation } from "@/components/chat/PastConversation";

export default function ChatPage() {
  const {
    input, setInput, streaming, knownContext, aspirations, loaded, scrollRef,
    sendMessage, handleKeyDown, latestConversation, pastConversations,
    behaviorCount, dayNum, conversations,
  } = useChat();

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col pb-40">
      {/* Header */}
      <div className="px-6 pt-5">
        <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none">
          HUMA
        </span>
      </div>

      {/* Context card */}
      <ContextCard
        aspirationCount={aspirations.length}
        behaviorCount={behaviorCount}
        dayNum={dayNum}
        context={knownContext}
      />

      {/* Main content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mt-4">
        {!loaded ? (
          <div className="flex items-center justify-center h-64">
            <span className="rounded-full animate-dot-pulse size-2 bg-sage-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-serif text-ink-700 text-[22px] leading-tight">
              What&apos;s on your mind?
            </p>
          </div>
        ) : (
          <>
            {/* Latest conversation (fully expanded) */}
            {latestConversation && (
              <div className="mx-6 mb-6">
                {latestConversation.messages.map((msg, idx) => {
                  const isLast = idx === latestConversation.messages.length - 1;
                  if (msg.role === "user") {
                    return (
                      <div key={msg.id} className="flex justify-end mb-3">
                        <div className="ml-auto max-w-[80%] bg-sand-200 rounded-xl px-4 py-3">
                          <p className="font-sans text-ink-600 text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  const rich = msg as RichMessage;
                  return (
                    <div key={msg.id} className="mb-3 max-w-[680px]">
                      <p className="font-serif text-ink-700 whitespace-pre-wrap text-base leading-[1.7]">
                        {msg.content}
                      </p>

                      {msg.contextExtracted && Object.keys(msg.contextExtracted).length > 0 && (
                        <div className="mt-2 inline-flex items-center rounded-full bg-sage-50 animate-fade-in px-3 py-1">
                          <span className="font-sans font-medium text-sage-600 text-xs">
                            Context added: {Object.entries(msg.contextExtracted).map(([k, v]) => `${k}: ${v}`).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Tappable options (only on last HUMA message) */}
                      {isLast && rich.options?.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(opt)}
                          className="mt-2 mr-2 text-left rounded-xl border border-sand-300 bg-sand-50 font-sans hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer px-4 py-3 text-sm text-ink-700"
                        >
                          {opt}
                        </button>
                      ))}

                      {/* Behaviors (only on last HUMA message) */}
                      {isLast && rich.behaviors?.map((b, i) => (
                        <div key={i} className="mt-2 flex items-start gap-3 rounded-xl bg-sand-50 border border-sand-200 px-4 py-3">
                          <span className="mt-0.5 flex-shrink-0 rounded-full size-5 border-2 border-sand-300" />
                          <div>
                            <p className="font-sans font-medium text-sm text-ink-700">{b.text}</p>
                            {b.detail && <p className="font-sans text-xs text-ink-400 mt-0.5">{b.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Streaming indicator */}
                {streaming && latestConversation.messages[latestConversation.messages.length - 1]?.role === "huma" &&
                  latestConversation.messages[latestConversation.messages.length - 1]?.content === "" && (
                  <div className="pt-3">
                    <span className="block rounded-full animate-dot-pulse size-2 bg-sage-400" />
                  </div>
                )}
              </div>
            )}

            {/* Past conversations (collapsed) */}
            {pastConversations.length > 0 && (
              <div className="mt-2">
                <p className="mx-6 mb-2 font-sans text-ink-300 text-[11px] font-semibold tracking-[0.18em]">EARLIER</p>
                {pastConversations.map((group) => (
                  <PastConversation key={group.id} group={group} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input bar (fixed above nav) */}
      <div className="fixed left-4 right-4 z-40" style={{ bottom: "calc(60px + env(safe-area-inset-bottom, 0px) + 8px)" }}>
        <div className="flex items-center gap-3 bg-white border border-sand-300 rounded-2xl px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            disabled={streaming}
            className="flex-1 font-sans bg-transparent focus:outline-none placeholder:text-ink-300 disabled:opacity-50 text-sm leading-snug text-ink-800"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="p-1 cursor-pointer disabled:opacity-30 transition-opacity"
            aria-label="Send"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "var(--color-sage-700)" : "var(--color-sage-400)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
