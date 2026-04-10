"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration } from "@/types/v2";
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
import { storeSaveHumaContext } from "@/lib/db/store";
import { getDomainTemplate, type StarterAspiration } from "@/data/archetype-templates";
import { enqueuePendingSync, flushPendingSync, pendingSyncCount } from "@/lib/pending-sync";
import { useNetworkStatus } from "@/lib/use-network-status";
import { useAuth } from "@/components/shared/AuthProvider";
import { useContextSync } from "@/hooks/useContextSync";
import { useAspirationManager } from "@/hooks/useAspirationManager";
import { useMessageStream } from "@/hooks/useMessageStream";
import ManualAspirationBuilder from "./ManualAspirationBuilder";

type RichMessage = ChatMessage & {
  options?: string[] | null;
  behaviors?: Behavior[] | null;
  actions?: string[] | null;
};

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  contextPrompt?: string;
  sourceTab?: "today" | "whole" | "grow";
  tabContext?: Record<string, unknown>;
  initialMessage?: string;
  mode?: "default" | "new-aspiration";
}

export default function ChatSheet({ open, onClose, contextPrompt, sourceTab, tabContext, initialMessage, mode = "default" }: ChatSheetProps) {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [showManualBuilder, setShowManualBuilder] = useState(false);
  const [input, setInput] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const online = useNetworkStatus();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);
  const dragStartTime = useRef(0);

  const {
    knownContext, setKnownContext, humaContext, setHumaContext,
    recentDimensions, updateContext,
    loadContext, loadContextFromLocalStorage, hydrateHumaContext,
    dbWarning, setDbWarning,
  } = useContextSync({ user, loaded });

  const {
    aspirations, setAspirations, saveNewAspiration, applyReorganization,
    loadAspirations, loadAspirationsFromLocalStorage,
  } = useAspirationManager({ user, setDbWarning });

  const {
    messages, setMessages, streaming,
    lastFailedMessage, setLastFailedMessage,
    markerRetryMessageId, setMarkerRetryMessageId,
    markerRetryAttempted, setMarkerRetryAttempted,
    sendMessage,
  } = useMessageStream({
    user,
    knownContext,
    humaContext,
    aspirations,
    sourceTab,
    tabContext,
    mode,
    onContextExtracted: updateContext,
    onAspirationCreated: saveNewAspiration,
    onReorganization: applyReorganization,
    onDecision: (parsedDecision) => {
      const today = new Date();
      const followUpDate = new Date(today);
      followUpDate.setDate(followUpDate.getDate() + 42);
      const decision = {
        id: crypto.randomUUID(),
        date: today.toISOString().split("T")[0],
        description: parsedDecision.description,
        reasoning: parsedDecision.reasoning,
        frameworksSurfaced: parsedDecision.frameworks_surfaced,
        followUpDue: followUpDate.toISOString().split("T")[0],
      };
      const updatedHuma = {
        ...humaContext,
        decisions: [...(humaContext.decisions || []), decision],
        _lastUpdated: today.toISOString(),
      };
      setHumaContext(updatedHuma);
      storeSaveHumaContext(user?.id ?? null, updatedHuma);
    },
  });

  // ─── Scroll behavior ─────────────────────────────────────────────────────
  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  useEffect(() => {
    if (scrollRef.current && isNearBottom()) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streaming, isNearBottom]);

  // ─── Virtual keyboard handling ────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
      if (offset > 0 && scrollRef.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        });
      }
    };
    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
      setKeyboardOffset(0);
    };
  }, [open]);

  // ─── Load state when sheet opens ──────────────────────────────────────────
  useEffect(() => {
    if (!open || loaded) return;
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
            if (dbMessages.length > 0) { setMessages(dbMessages as RichMessage[]); foundMessages = true; }
            loadAspirations(dbAspirations);
            loadContext(dbContext);
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
        loadContextFromLocalStorage();
        loadAspirationsFromLocalStorage();
      }
      hydrateHumaContext();

      // Flush any pending sync items
      if (user && pendingSyncCount() > 0) {
        const supabase = createClient();
        if (supabase) {
          flushPendingSync(supabase, {
            saveChatMessage: saveChatMessage as (sb: unknown, uid: string, msg: unknown) => Promise<unknown>,
            updateKnownContext: updateKnownContext as (sb: unknown, uid: string, ctx: Record<string, unknown>) => Promise<unknown>,
            saveAspiration: saveAspiration as (sb: unknown, uid: string, asp: unknown) => Promise<unknown>,
          }).catch(() => {});
        }
      }
      setLoaded(true);
    }
    loadState();
  }, [open, loaded, user, setMessages, loadAspirations, loadContext, loadContextFromLocalStorage, loadAspirationsFromLocalStorage, hydrateHumaContext]);

  // Persist messages to localStorage
  useEffect(() => {
    if (!loaded || messages.length === 0) return;
    localStorage.setItem("huma-v2-chat-messages", JSON.stringify(messages));
  }, [messages, loaded]);

  // Flush pending sync when coming back online
  useEffect(() => {
    if (!online || !user || !loaded) return;
    if (pendingSyncCount() === 0) return;
    const supabase = createClient();
    if (supabase) {
      flushPendingSync(supabase, {
        saveChatMessage: saveChatMessage as (sb: unknown, uid: string, msg: unknown) => Promise<unknown>,
        updateKnownContext: updateKnownContext as (sb: unknown, uid: string, ctx: Record<string, unknown>) => Promise<unknown>,
        saveAspiration: saveAspiration as (sb: unknown, uid: string, asp: unknown) => Promise<unknown>,
      }).then(({ flushed }) => {
        if (flushed > 0) setDbWarning(null);
      }).catch(() => {});
    }
  }, [online, user, loaded, setDbWarning]);

  // Inject initial HUMA opener
  const initialMessageInjected = useRef<string | null>(null);
  useEffect(() => {
    if (!loaded || !open || !initialMessage) return;
    if (initialMessageInjected.current === initialMessage) return;
    initialMessageInjected.current = initialMessage;
    const opener: RichMessage = {
      id: crypto.randomUUID(),
      role: "huma",
      content: initialMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, opener]);
  }, [loaded, open, initialMessage, setMessages]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
      setInput("");
    }
  };

  // ─── Drag-to-dismiss ──────────────────────────────────────────────────────
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = y;
    dragCurrentY.current = 0;
    dragStartTime.current = Date.now();
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  };
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartY.current === null) return;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const delta = Math.max(0, y - dragStartY.current);
    dragCurrentY.current = delta;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${delta}px)`;
  };
  const handleDragEnd = () => {
    if (sheetRef.current) sheetRef.current.style.transition = "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)";
    const elapsed = Date.now() - dragStartTime.current;
    const velocity = dragCurrentY.current / Math.max(elapsed, 1);
    if (dragCurrentY.current > 100 || (velocity > 0.5 && dragCurrentY.current > 30)) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "translateY(0)";
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  };

  const recentMessages = messages.slice(-50);

  // Template quick-add cards for new-aspiration mode
  const templateSuggestions: { archetype: string; aspiration: StarterAspiration }[] = [];
  if (mode === "new-aspiration" && loaded && recentMessages.length === 0) {
    const archetypes = (tabContext?.archetypes as string[]) || [];
    const existingTexts = new Set(aspirations.map(a => (a.clarifiedText || a.rawText).toLowerCase().trim()));
    for (const arch of archetypes) {
      const template = getDomainTemplate(arch);
      if (!template) continue;
      for (const starter of template.starterAspirations) {
        if (!existingTexts.has(starter.text.toLowerCase().trim())) {
          templateSuggestions.push({ archetype: arch, aspiration: starter });
        }
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 animate-[chatsheet-backdrop-in_320ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with HUMA"
        className="absolute left-0 right-0 flex flex-col bg-sand-50 rounded-t-[20px] animate-[chatsheet-slide-up_320ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{
          bottom: keyboardOffset > 0 ? `${keyboardOffset}px` : "0",
          maxHeight: keyboardOffset > 0 ? `calc(100vh - ${keyboardOffset}px)` : "85vh",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center cursor-grab pt-4 pb-1 min-h-11"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
        >
          <div className="w-9 h-1 rounded-sm bg-sand-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <span className="font-sans font-medium text-[11px] tracking-[0.4em] text-sage-450">
            HUMA
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 bg-transparent border-none text-lg text-earth-400 -mr-2 cursor-pointer"
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 overflow-y-auto px-5 pb-3"
        >
          {!loaded ? (
            <div className="flex items-center justify-center h-[120px]">
              <span className="w-2 h-2 rounded-full bg-sage-450 animate-dot-pulse" />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[120px]">
              <p className="font-serif text-ink-700 text-lg leading-[1.4]">
                {mode === "new-aspiration" ? "What are you trying to make work?" : "What\u0027s on your mind?"}
              </p>
              {mode === "new-aspiration" && (
                <p className="font-sans text-sage-400 text-[13px] mt-1.5 max-w-[280px]">
                  Describe what you want to build, change, or protect. HUMA will turn it into something operational.
                </p>
              )}
              {templateSuggestions.length > 0 && (
                <div className="mt-5 w-full text-left">
                  <p className="font-sans text-[11px] font-semibold tracking-[0.14em] text-sage-300 mb-2.5 text-center">
                    FROM YOUR ARCHETYPES
                  </p>
                  <div className="flex flex-col gap-2">
                    {templateSuggestions.slice(0, 4).map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { sendMessage(t.aspiration.text); setInput(""); }}
                        className="text-left cursor-pointer bg-sand-50 border border-sand-250 rounded-xl px-4 py-3 w-full"
                      >
                        <span className="font-serif text-[15px] leading-[1.4] text-earth-650 block">
                          {t.aspiration.text}
                        </span>
                        <span className="font-sans text-xs text-sage-300 mt-0.5 block">
                          {t.archetype} &middot; {t.aspiration.behaviors.length} behavior{t.aspiration.behaviors.length !== 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            recentMessages.map((msg, idx) => {
              const isLast = idx === recentMessages.length - 1;
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end mb-3">
                    <div className="max-w-[80%] bg-sand-200/70 rounded-xl px-4 py-3">
                      <p className="font-sans text-sm leading-relaxed text-earth-500">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }
              const rich = msg as RichMessage;
              return (
                <div key={msg.id} className="mb-3 max-w-[680px]">
                  <p className="font-serif whitespace-pre-wrap text-base leading-[1.7] text-earth-650">
                    {msg.content}
                  </p>

                  {msg.contextExtracted && Object.keys(msg.contextExtracted).length > 0 && (
                    <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 bg-sage-50">
                      <span className="font-sans font-medium text-xs text-sage-700">
                        Context added: {Object.entries(msg.contextExtracted).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </span>
                    </div>
                  )}

                  {isLast && rich.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => { sendMessage(opt); setInput(""); }}
                      className="mt-2 mr-2 text-left font-sans cursor-pointer px-4 py-3 text-sm text-earth-650 rounded-xl border border-sand-300 bg-sand-50"
                    >
                      {opt}
                    </button>
                  ))}

                  {isLast && rich.behaviors?.map((b, i) => (
                    <div key={i} className="mt-2 flex items-start gap-3 px-4 py-3 rounded-xl border border-sand-250 bg-sand-50">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-sand-300" />
                      <div>
                        <p className="font-sans font-medium text-sm text-earth-650">{b.text}</p>
                        {b.detail && <p className="font-sans text-xs text-earth-400 mt-0.5">{b.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}

          {/* Context growth indicator */}
          {recentDimensions.length > 0 && (
            <div className="flex items-center gap-1.5 py-2 animate-[fade-in_300ms_ease-out]">
              <span className="font-sans text-[11px] font-medium tracking-wide text-sage-400">
                HUMA now knows: {recentDimensions.map(d => d.toLowerCase()).join(", ")}
              </span>
            </div>
          )}

          {/* Streaming indicator */}
          {streaming && recentMessages.length > 0 &&
            recentMessages[recentMessages.length - 1]?.role === "huma" &&
            recentMessages[recentMessages.length - 1]?.content === "" && (
            <div className="pt-3" role="status" aria-label="HUMA is thinking">
              <span className="block w-2 h-2 rounded-full bg-sage-450 animate-dot-pulse" />
            </div>
          )}

          {/* Retry button after error */}
          {!streaming && lastFailedMessage && (
            <button
              onClick={() => {
                const msg = lastFailedMessage;
                setLastFailedMessage(null);
                setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === "huma")));
                sendMessage(msg);
              }}
              className="font-sans cursor-pointer inline-flex items-center gap-1.5 mt-2 px-4 py-2 text-[13px] text-amber-600 bg-amber-100 border border-amber-200 rounded-full"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Try again
            </button>
          )}

          {/* Marker retry prompt */}
          {!streaming && markerRetryMessageId && !markerRetryAttempted && !showManualBuilder && (
            <div className="mt-2 animate-[fade-in_300ms_ease-out]">
              <button
                onClick={() => {
                  setMarkerRetryAttempted(true);
                  setMarkerRetryMessageId(null);
                  sendMessage("Can you structure that into specific behaviors I can act on this week?");
                }}
                className="font-sans cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-[13px] text-sage-600 bg-sage-50 border border-sage-200 rounded-full"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                HUMA had ideas but couldn&apos;t structure them. Tap to retry.
              </button>
              <button
                onClick={() => {
                  setMarkerRetryMessageId(null);
                  setShowManualBuilder(true);
                }}
                className="font-sans cursor-pointer text-[12px] text-sage-300 mt-1.5 ml-1 bg-transparent border-none underline"
              >
                Or build it yourself
              </button>
            </div>
          )}

          {/* Marker retry failed */}
          {!streaming && markerRetryAttempted && !showManualBuilder && (
            <div className="mt-2 animate-[fade-in_300ms_ease-out]">
              <button
                onClick={() => setShowManualBuilder(true)}
                className="font-sans cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-[13px] text-sage-600 bg-sage-50 border border-sage-200 rounded-full"
              >
                Still didn&apos;t work. Build it yourself instead?
              </button>
            </div>
          )}

          {/* Manual aspiration builder */}
          {showManualBuilder && (
            <ManualAspirationBuilder
              onSave={(asp) => {
                saveNewAspiration(asp);
                const today = getLocalDate();
                localStorage.removeItem(`huma-v2-sheet-${today}`);
                localStorage.removeItem(`huma-v2-compiled-sheet-${today}`);
                setShowManualBuilder(false);
                setMarkerRetryAttempted(false);
                setMarkerRetryMessageId(null);
              }}
              onDismiss={() => {
                setShowManualBuilder(false);
                setMarkerRetryAttempted(false);
                setMarkerRetryMessageId(null);
              }}
            />
          )}

          {/* DB write warning */}
          {dbWarning && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 animate-[fade-in_300ms_ease-out]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5621E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="font-sans text-[12px] text-amber-700 flex-1">
                {dbWarning.type === "context"
                  ? "Context may not have saved."
                  : "Aspiration saved locally but couldn\u2019t sync."}
                {" "}
              </span>
              <button
                onClick={() => dbWarning.retryFn()}
                className="font-sans text-[12px] text-amber-600 font-medium cursor-pointer bg-transparent border-none underline"
              >
                Retry
              </button>
              <button
                onClick={() => setDbWarning(null)}
                className="text-amber-400 cursor-pointer bg-transparent border-none text-sm"
                aria-label="Dismiss warning"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 pt-2 border-t border-sand-250" style={{ paddingBottom: keyboardOffset > 0 ? "8px" : "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-sand-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={contextPrompt || "What's on your mind?"}
              aria-label="Message"
              disabled={streaming}
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 font-sans bg-transparent focus:outline-none disabled:opacity-50 text-base leading-[1.4] text-earth-650"
            />
            <button
              onClick={() => { sendMessage(input); setInput(""); }}
              disabled={streaming || !input.trim()}
              className="p-1 cursor-pointer disabled:opacity-30 transition-opacity"
              aria-label="Send"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#3A5A40" : "#8BAF8E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes chatsheet-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes chatsheet-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
