"use client";

import Link from "next/link";
import { useChat, type RichMessage, type SessionType } from "@/hooks/useChat";
import { PastConversation } from "@/components/chat/PastConversation";

// ── Dimension keywords for dynamic context matching ──
const DIMENSION_KEYWORDS: Record<string, string[]> = {
  body: ["health", "sleep", "exercise", "eat", "nutrition", "energy", "tired", "workout", "weight", "sick"],
  people: ["family", "friend", "partner", "wife", "husband", "kid", "parent", "relationship", "community"],
  money: ["money", "income", "budget", "debt", "save", "invest", "expense", "salary", "cost", "financial"],
  home: ["home", "house", "apartment", "move", "garden", "kitchen", "space", "room", "land"],
  growth: ["learn", "skill", "read", "study", "course", "career", "practice", "improve"],
  joy: ["fun", "play", "hobby", "rest", "relax", "enjoy", "creative", "music", "art"],
  purpose: ["purpose", "meaning", "value", "why", "mission", "contribute", "vision"],
  identity: ["identity", "role", "who", "culture", "transition"],
  time: ["time", "schedule", "routine", "morning", "evening", "busy", "overwhelm"],
};

function detectRelevantDimensions(messages: Array<{ role: string; content: string }>): string[] {
  const recent = messages.slice(-4).filter(m => m.role === "user").map(m => m.content.toLowerCase()).join(" ");
  if (!recent) return [];
  const matched: string[] = [];
  for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    if (keywords.some(kw => recent.includes(kw))) matched.push(dim);
  }
  return matched.slice(0, 3);
}

// ── Inlined: ContextCard ──
function ContextCard({
  aspirationCount,
  behaviorCount,
  dayNum,
  context,
  relevantDimensions,
}: {
  aspirationCount: number;
  behaviorCount: number;
  dayNum: number;
  context: Record<string, unknown>;
  relevantDimensions: string[];
}) {
  const parts: string[] = [];
  if (aspirationCount > 0) parts.push(`${aspirationCount} aspiration${aspirationCount > 1 ? "s" : ""}`);
  if (behaviorCount > 0) parts.push(`${behaviorCount} behaviors`);
  if (dayNum > 0) parts.push(`Day ${dayNum}`);

  // Show relevant dimension context first (based on conversation topic), then fill with others
  const ctxEntries = Object.entries(context).filter(([, v]) => v !== null && v !== undefined && v !== "");
  const relevantEntries = ctxEntries.filter(([k]) => relevantDimensions.includes(k));
  const otherEntries = ctxEntries.filter(([k]) => !relevantDimensions.includes(k));
  const orderedEntries = [...relevantEntries, ...otherEntries].slice(0, 3);

  for (const [k, v] of orderedEntries) {
    const label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    parts.push(`${label}: ${String(v)}`);
  }

  if (parts.length === 0) return null;

  return (
    <div className="mx-6 mt-5 p-3 rounded-xl bg-sand-100">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[13px] text-ink-500 leading-relaxed">
          {parts.join(" · ")}
        </p>
        <Link href="/whole" className="font-sans text-xs font-medium text-sage-500 whitespace-nowrap ml-2">
          see all &rarr;
        </Link>
      </div>
    </div>
  );
}

// ── Session Entry Points ──
const SESSION_ENTRIES: { type: SessionType; label: string; description: string }[] = [
  { type: "decision", label: "Think through a decision", description: "Weigh options against your whole situation" },
  { type: "pattern", label: "Work on a pattern", description: "Design or refine a daily practice" },
  { type: "revisit", label: "Revisit what I want", description: "Check if your aspirations still fit" },
];

function SessionEntryPoints({ onSelect }: { onSelect: (type: SessionType, prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="font-serif text-ink-700 text-[22px] leading-tight mb-6">
        What are you designing?
      </p>
      <div className="flex flex-col gap-2 w-full max-w-sm px-6">
        {SESSION_ENTRIES.map(({ type, label, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type, label)}
            className="text-left rounded-xl border border-sand-300 bg-sand-50 hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer px-4 py-3"
          >
            <p className="font-sans font-medium text-sm text-ink-700">{label}</p>
            <p className="font-sans text-xs text-ink-400 mt-0.5">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Inline ref rendering ──
function renderWithRefs(text: string): React.ReactNode {
  // Split on ⟨aspiration:slug⟩ or ⟨pattern:slug⟩ tokens
  const parts = text.split(/(⟨(?:aspiration|pattern):[a-z0-9-]+⟩)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const refMatch = part.match(/⟨(aspiration|pattern):([a-z0-9-]+)⟩/);
    if (refMatch) {
      const [, refType, slug] = refMatch;
      const label = slug.replace(/-/g, " ");
      return (
        <span key={i} className="inline-flex items-center rounded-full bg-sage-50 px-2 py-0.5 mx-0.5 align-baseline">
          <span className="font-sans text-xs font-medium text-sage-600">
            {refType === "aspiration" ? "◆" : "↻"} {label}
          </span>
        </span>
      );
    }
    return part;
  });
}

export default function ChatPage() {
  const {
    input, setInput, streaming, knownContext, aspirations, loaded, scrollRef,
    sendMessage, handleKeyDown, latestConversation, pastConversations,
    behaviorCount, dayNum, conversations, sessionType, setSessionType,
  } = useChat();

  const relevantDimensions = detectRelevantDimensions(
    latestConversation?.messages.map(m => ({ role: m.role, content: m.content })) || []
  );

  const handleSessionEntry = (type: SessionType, prompt: string) => {
    setSessionType(type);
    sendMessage(prompt);
  };

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
        relevantDimensions={relevantDimensions}
      />

      {/* Main content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mt-4">
        {!loaded ? (
          <div className="flex items-center justify-center h-64">
            <span className="rounded-full animate-dot-pulse size-2 bg-sage-400" />
          </div>
        ) : conversations.length === 0 ? (
          <SessionEntryPoints onSelect={handleSessionEntry} />
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
                        {renderWithRefs(msg.content)}
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
            placeholder="What are you designing?"
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
