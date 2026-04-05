"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ChatMessage, Behavior, Aspiration } from "@/types/v2";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import {
  getChatMessages,
  saveChatMessage,
  getAspirations,
  saveAspiration,
  getKnownContext,
  updateKnownContext,
} from "@/lib/supabase-v2";
import { getLocalDate } from "@/lib/date-utils";

type RichMessage = ChatMessage & {
  options?: string[] | null;
  behaviors?: Behavior[] | null;
  actions?: string[] | null;
};

// ─── Context Card (compact) ──────────────────────────────────────────────────

function ContextCard({
  aspirationCount,
  behaviorCount,
  dayNum,
  context,
}: {
  aspirationCount: number;
  behaviorCount: number;
  dayNum: number;
  context: Record<string, unknown>;
}) {
  const parts: string[] = [];
  if (aspirationCount > 0) parts.push(`${aspirationCount} aspiration${aspirationCount > 1 ? "s" : ""}`);
  if (behaviorCount > 0) parts.push(`${behaviorCount} behaviors`);
  if (dayNum > 0) parts.push(`Day ${dayNum}`);

  // Add a couple context facts
  const ctxEntries = Object.entries(context).filter(([, v]) => v !== null && v !== undefined && v !== "");
  for (const [k, v] of ctxEntries.slice(0, 2)) {
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

// ─── Conversation Grouping ───────────────────────────────────────────────────

interface ConversationGroup {
  id: string;
  startTime: Date;
  messages: ChatMessage[];
  summary: string;
  messageCount: number;
}

function summarizeText(text: string, maxLen: number = 60): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

function relativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupIntoConversations(messages: ChatMessage[], gapMinutes: number = 10): ConversationGroup[] {
  if (messages.length === 0) return [];

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const groups: ConversationGroup[] = [];
  let current: ChatMessage[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].createdAt).getTime();
    const curr = new Date(sorted[i].createdAt).getTime();
    if (curr - prev > gapMinutes * 60 * 1000) {
      groups.push(buildGroup(current));
      current = [sorted[i]];
    } else {
      current.push(sorted[i]);
    }
  }
  if (current.length > 0) groups.push(buildGroup(current));

  return groups;
}

function buildGroup(messages: ChatMessage[]): ConversationGroup {
  const userMessages = messages.filter(m => m.role === "user");
  const firstUserMsg = userMessages[0]?.content || "";

  return {
    id: messages[0].id || String(Date.now()),
    startTime: new Date(messages[0].createdAt),
    messages,
    summary: summarizeText(firstUserMsg),
    messageCount: messages.length,
  };
}

// ─── Past Conversation (collapsed) ──────────────────────────────────────────

function PastConversation({ group }: { group: ConversationGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-6 mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 bg-white border border-sand-300 rounded-xl cursor-pointer hover:border-sage-300 transition-colors text-left"
      >
        <span className="font-sans text-xs font-medium text-ink-300 flex-shrink-0">
          {relativeDate(group.startTime)}
        </span>
        <span className="font-sans text-[13px] text-ink-500 flex-1 truncate">
          {group.summary}
        </span>
        <span className="font-sans text-ink-300 flex-shrink-0 text-[11px]">
          ({group.messageCount})
        </span>
      </button>

      {expanded && (
        <div className="mt-2 px-1 animate-fade-in">
          {group.messages.map(msg =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end mb-3">
                <div className="ml-auto max-w-[80%] bg-sand-200 rounded-xl px-4 py-3">
                  <p className="font-sans text-ink-600 text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="mb-3 max-w-[680px]">
                <p className="font-serif text-ink-700 whitespace-pre-wrap text-base leading-[1.7]">
                  {msg.content}
                </p>
                {msg.contextExtracted && Object.keys(msg.contextExtracted).length > 0 && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-sage-50 px-3 py-1">
                    <span className="font-sans font-medium text-sage-600 text-xs">
                      Context added: {Object.entries(msg.contextExtracted).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RichMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Load state
  useEffect(() => {
    async function loadState() {
      let foundMessages = false;

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbMessages, dbAspirations, dbContext] = await Promise.all([
              getChatMessages(supabase, user.id),
              getAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
            ]);
            if (dbMessages.length > 0) { setMessages(dbMessages); foundMessages = true; }
            if (dbAspirations.length > 0) setAspirations(dbAspirations);
            if (Object.keys(dbContext).length > 0) setKnownContext(dbContext);
          } catch { /* fallback */ }
        }
      }

      if (!foundMessages) {
        try {
          const savedMessages = localStorage.getItem("huma-v2-chat-messages");
          const startMessages = localStorage.getItem("huma-v2-start-messages");
          if (savedMessages) setMessages(JSON.parse(savedMessages));
          else if (startMessages) setMessages(JSON.parse(startMessages));
        } catch { /* fresh */ }
      }

      if (!user) {
        try {
          const ctx = localStorage.getItem("huma-v2-known-context");
          if (ctx) setKnownContext(JSON.parse(ctx));
          const asp = localStorage.getItem("huma-v2-aspirations");
          if (asp) setAspirations(JSON.parse(asp));
        } catch { /* fresh */ }
      }

      setLoaded(true);
    }
    loadState();
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    if (messages.length > 0) {
      localStorage.setItem("huma-v2-chat-messages", JSON.stringify(messages));
      localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
    }
  }, [messages, knownContext, loaded]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages as RichMessage[]);
    setInput("");
    setStreaming(true);

    if (user) {
      const supabase = createClient();
      if (supabase) saveChatMessage(supabase, user.id, userMsg).catch(() => {});
    }

    try {
      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content })),
          knownContext,
          aspirations: aspirations.map(a => ({ rawText: a.rawText, clarifiedText: a.clarifiedText, status: a.status })),
        }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      const humaMsg: RichMessage = {
        id: crypto.randomUUID(),
        role: "huma",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, humaMsg] as RichMessage[]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
        const { cleanText } = parseMarkers(fullResponse);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "huma") updated[updated.length - 1] = { ...last, content: cleanText };
          return updated;
        });
      }

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext } = parseMarkers(fullResponse);

      const finalHumaMsg: ChatMessage = { ...humaMsg, content: cleanText, contextExtracted: parsedContext || undefined };
      if (user) {
        const supabase = createClient();
        if (supabase) saveChatMessage(supabase, user.id, finalHumaMsg).catch(() => {});
      }

      if (parsedContext) {
        const newContext = { ...knownContext, ...parsedContext };
        setKnownContext(newContext);
        if (user) {
          const supabase = createClient();
          if (supabase) updateKnownContext(supabase, user.id, newContext).catch(() => {});
        }
        const today = getLocalDate();
        localStorage.removeItem(`huma-v2-sheet-${today}`);
      }

      if (parsedBehaviors) {
        const newAspiration: Aspiration = {
          id: crypto.randomUUID(),
          rawText: text,
          clarifiedText: "",
          behaviors: parsedBehaviors,
          dimensionsTouched: [],
          status: "active",
          stage: "active",
        };
        const updatedAsps = [...aspirations, newAspiration];
        setAspirations(updatedAsps);
        localStorage.setItem("huma-v2-aspirations", JSON.stringify(updatedAsps));
        if (user) {
          const supabase = createClient();
          if (supabase) saveAspiration(supabase, user.id, newAspiration).catch(() => {});
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "huma") {
          updated[updated.length - 1] = { ...last, content: cleanText, options: parsedOptions, behaviors: parsedBehaviors, actions: parsedActions };
        }
        return updated;
      });
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        { id: crypto.randomUUID(), role: "huma" as const, content: "Something went wrong. Try again in a moment.", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, knownContext, aspirations, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Group messages into conversations (by 10-minute time gap)
  const conversations = groupIntoConversations(messages);
  const latestConversation = conversations.length > 0 ? conversations[conversations.length - 1] : null;
  const pastConversations = conversations.slice(0, -1).reverse(); // most recent first

  const behaviorCount = aspirations.reduce((sum, a) => sum + a.behaviors.length, 0);
  const dayNum = (() => {
    try {
      const start = localStorage.getItem("huma-v2-start-date");
      if (start) {
        const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
      }
    } catch { /* fresh */ }
    return 1;
  })();

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
