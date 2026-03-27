"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PaletteConcept, ChatMessage, Behavior, Aspiration, Insight } from "@/types/v2";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/types/v2";
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
  getUndeliveredInsight,
  markInsightDelivered,
} from "@/lib/supabase-v2";

// ─── Insight Card ────────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onDismiss,
  onTellMore,
}: {
  insight: Insight;
  onDismiss: () => void;
  onTellMore: () => void;
}) {
  return (
    <div className="bg-white border-l-4 border-sage-200 rounded-xl p-5 mb-6 animate-fade-in">
      <p className="font-serif text-base text-earth-600 mb-1">Something I noticed</p>
      <p className="font-sans text-sm text-earth-700 leading-relaxed mt-3">
        {insight.text}
      </p>

      {/* Dimension badges */}
      <div className="flex gap-2 mt-4">
        {insight.dimensionsInvolved.map(dim => (
          <span
            key={dim}
            className="px-2.5 py-1 rounded-full font-sans text-xs font-medium"
            style={{
              backgroundColor: DIMENSION_COLORS[dim] + "15",
              color: DIMENSION_COLORS[dim],
            }}
          >
            {DIMENSION_LABELS[dim]}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onDismiss}
          className="px-4 py-2 rounded-lg border border-sand-300 font-sans text-sm text-earth-500 hover:border-sage-400 transition-colors duration-200 cursor-pointer"
        >
          Interesting
        </button>
        <button
          onClick={onTellMore}
          className="px-4 py-2 rounded-lg bg-sage-700 text-white font-sans text-sm font-medium hover:bg-sage-800 transition-colors duration-200 cursor-pointer"
        >
          Tell me more
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<
    (ChatMessage & { options?: string[] | null; behaviors?: Behavior[] | null; actions?: string[] | null })[]
  >([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [pendingInsight, setPendingInsight] = useState<Insight | null>(null);
  const [paletteConcepts, setPaletteConcepts] = useState<PaletteConcept[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Load state — Supabase first, localStorage fallback
  useEffect(() => {
    async function loadState() {
      let foundMessages = false;

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbMessages, dbAspirations, dbContext, dbInsight] = await Promise.all([
              getChatMessages(supabase, user.id),
              getAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
              getUndeliveredInsight(supabase, user.id),
            ]);

            if (dbMessages.length > 0) {
              setMessages(dbMessages);
              foundMessages = true;
            }
            if (dbAspirations.length > 0) setAspirations(dbAspirations);
            if (Object.keys(dbContext).length > 0) setKnownContext(dbContext);
            if (dbInsight) setPendingInsight(dbInsight);
          } catch (err) {
            console.error("Failed to load from Supabase:", err);
          }
        }
      }

      // Fallback: localStorage (always check if Supabase had no messages)
      if (!foundMessages) {
        try {
          const savedMessages = localStorage.getItem("huma-v2-chat-messages");
          const startMessages = localStorage.getItem("huma-v2-start-messages");
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          } else if (startMessages) {
            setMessages(JSON.parse(startMessages));
          }
        } catch { /* fresh */ }
      }

      // Load other state from localStorage if Supabase didn't provide them
      if (!user) {
        try {
          const ctx = localStorage.getItem("huma-v2-known-context");
          if (ctx) setKnownContext(JSON.parse(ctx));

          const asp = localStorage.getItem("huma-v2-aspirations");
          if (asp) setAspirations(JSON.parse(asp));

          const ins = localStorage.getItem("huma-v2-pending-insight");
          if (ins) setPendingInsight(JSON.parse(ins));
        } catch { /* fresh */ }
      }

      setLoaded(true);
    }

    loadState();
  }, [user]);

  // Persist to localStorage (fallback for non-authed)
  useEffect(() => {
    if (!loaded) return;
    if (messages.length > 0) {
      localStorage.setItem("huma-v2-chat-messages", JSON.stringify(messages));
      localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
    }
  }, [messages, knownContext, loaded]);

  // Fetch palette
  const fetchPalette = useCallback(async (conversationTexts: string[]) => {
    try {
      const res = await fetch("/api/palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationSoFar: conversationTexts, selectedConcepts }),
      });
      const data = await res.json();
      setPaletteConcepts(data.concepts || []);
    } catch { /* non-critical */ }
  }, [selectedConcepts]);

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
    setMessages(newMessages as typeof messages);
    setInput("");
    setStreaming(true);

    // Persist user message to Supabase
    if (user) {
      const supabase = createClient();
      if (supabase) {
        saveChatMessage(supabase, user.id, userMsg).catch(err =>
          console.error("Failed to save user message:", err)
        );
      }
    }

    const userTexts = newMessages.filter(m => m.role === "user").map(m => m.content);
    fetchPalette(userTexts);

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

      const humaMsg: typeof messages[0] = {
        id: crypto.randomUUID(),
        role: "huma",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, humaMsg] as typeof messages);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
        const { cleanText } = parseMarkers(fullResponse);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "huma") {
            updated[updated.length - 1] = { ...last, content: cleanText };
          }
          return updated;
        });
      }

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext } = parseMarkers(fullResponse);

      // Save HUMA response to Supabase
      const finalHumaMsg: ChatMessage = {
        ...humaMsg,
        content: cleanText,
        contextExtracted: parsedContext || undefined,
      };
      if (user) {
        const supabase = createClient();
        if (supabase) {
          saveChatMessage(supabase, user.id, finalHumaMsg).catch(err =>
            console.error("Failed to save HUMA message:", err)
          );
        }
      }

      if (parsedContext) {
        const newContext = { ...knownContext, ...parsedContext };
        setKnownContext(newContext);

        // Persist context to Supabase
        if (user) {
          const supabase = createClient();
          if (supabase) {
            updateKnownContext(supabase, user.id, newContext).catch(err =>
              console.error("Failed to update context:", err)
            );
          }
        }

        // Invalidate sheet cache
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
        localStorage.removeItem(`huma-v2-sheet-${today}`);
        localStorage.removeItem(`huma-v2-sheet-${tomorrow}`);
      }

      if (parsedBehaviors) {
        const newAspiration: Aspiration = {
          id: crypto.randomUUID(),
          rawText: text,
          clarifiedText: "",
          behaviors: parsedBehaviors,
          dimensionsTouched: [],
          status: "active",
        };
        const updatedAspirations = [...aspirations, newAspiration];
        setAspirations(updatedAspirations);
        localStorage.setItem("huma-v2-aspirations", JSON.stringify(updatedAspirations));

        // Persist to Supabase
        if (user) {
          const supabase = createClient();
          if (supabase) {
            saveAspiration(supabase, user.id, newAspiration).catch(err =>
              console.error("Failed to save aspiration:", err)
            );
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "huma") {
          updated[updated.length - 1] = {
            ...last,
            content: cleanText,
            options: parsedOptions,
            behaviors: parsedBehaviors,
            actions: parsedActions,
          };
        }
        return updated;
      });
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        {
          id: crypto.randomUUID(),
          role: "huma" as const,
          content: "Something went wrong. Try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, knownContext, aspirations, fetchPalette, user]);

  const handleInsightDismiss = () => {
    if (pendingInsight && user) {
      const supabase = createClient();
      if (supabase) {
        markInsightDelivered(supabase, pendingInsight.id, user.id).catch(() => {});
      }
    }
    setPendingInsight(null);
    localStorage.removeItem("huma-v2-pending-insight");
  };

  const handleInsightTellMore = () => {
    const insightText = pendingInsight?.text || "";
    handleInsightDismiss();
    sendMessage(`Tell me more about this connection: ${insightText}`);
  };

  const handlePaletteTap = (concept: PaletteConcept) => {
    setSelectedConcepts(prev => [...prev, concept.id]);
    setPaletteConcepts(prev => prev.filter(c => c.id !== concept.id));
    sendMessage(concept.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col lg:flex-row">
      {/* Conversation */}
      <div className="flex-1 flex flex-col min-h-0 lg:w-[60%]">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="font-serif text-sage-700 text-lg tracking-wide">HUMA</h1>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Pending Insight */}
          {pendingInsight && (
            <InsightCard
              insight={pendingInsight}
              onDismiss={handleInsightDismiss}
              onTellMore={handleInsightTellMore}
            />
          )}

          {messages.length === 0 && !pendingInsight && (
            <div className="flex flex-col items-center justify-center h-full -mt-16">
              <p className="font-serif text-xl text-earth-500">
                What&apos;s on your mind?
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                  msg.role === "user" ? "bg-sand-100 text-earth-800" : "bg-white text-earth-800"
                }`}
                style={{ lineHeight: "1.7" }}
              >
                <p className={`${msg.role === "user" ? "font-sans" : "font-serif text-lg"} text-base whitespace-pre-wrap`}>{msg.content}</p>

                {msg.options && msg.options.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(opt)}
                        className="text-left px-4 py-3 rounded-xl border border-sand-300 bg-sand-50 text-earth-700 font-sans text-sm hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {msg.behaviors && msg.behaviors.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {msg.behaviors.map((b, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sand-50 border border-sand-200">
                        <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-earth-300 flex-shrink-0" />
                        <div>
                          <p className="font-sans text-sm text-earth-700 font-medium">{b.text}</p>
                          {b.detail && <p className="font-sans text-xs text-earth-400 mt-0.5">{b.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-4 flex gap-3">
                    {msg.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(action)}
                        className={`px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                          i === 0 ? "bg-sage-700 text-white hover:bg-sage-800" : "border border-sand-300 text-earth-600 hover:border-sage-400"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

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
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind..."
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

          {paletteConcepts.length > 0 && (
            <button
              onClick={() => setShowPaletteMobile(!showPaletteMobile)}
              className="mt-3 font-sans text-xs text-earth-400 hover:text-sage-600 transition-colors duration-200 lg:hidden cursor-pointer"
            >
              {showPaletteMobile ? "Hide suggestions" : `${paletteConcepts.length} related topics...`}
            </button>
          )}
        </div>

        {showPaletteMobile && paletteConcepts.length > 0 && (
          <div className="lg:hidden border-t border-sand-200 bg-sand-50 p-6">
            <p className="font-sans text-xs text-earth-400 mb-4 tracking-wide">
              You might also be dealing with...
            </p>
            <div className="flex flex-wrap gap-2">
              {paletteConcepts.map(c => (
                <button
                  key={c.id}
                  onClick={() => handlePaletteTap(c)}
                  className="px-3.5 py-2 rounded-full bg-sand-100 text-earth-500 border border-sand-300 font-sans text-sm hover:bg-sage-50 hover:text-sage-600 hover:border-sage-300 transition-all duration-200 cursor-pointer"
                >
                  {c.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Palette */}
      <div className="hidden lg:block lg:w-[40%] border-l border-sand-200 overflow-y-auto p-6">
        {paletteConcepts.length > 0 && (
          <>
            <p className="font-sans text-xs text-earth-400 mb-4 tracking-wide">
              You might also be dealing with...
            </p>
            <div className="flex flex-wrap gap-2">
              {paletteConcepts.map(c => (
                <button
                  key={c.id}
                  onClick={() => handlePaletteTap(c)}
                  className="px-3.5 py-2 rounded-full bg-sand-100 text-earth-500 border border-sand-300 font-sans text-sm hover:bg-sage-50 hover:text-sage-600 hover:border-sage-300 transition-all duration-200 cursor-pointer"
                >
                  {c.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
