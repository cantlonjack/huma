"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage, Behavior, Aspiration, Pattern, ReorganizationPlan } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { saveChatMessage, getBehaviorWeekCounts } from "@/lib/supabase-v2";
import { storeLoadPatterns } from "@/lib/db/store";
import { getLocalDate } from "@/lib/date-utils";
import { containsBehavioralLanguage } from "@/lib/behavioral-language";
import { enqueuePendingSync } from "@/lib/pending-sync";
import type { User } from "@supabase/supabase-js";

type RichMessage = ChatMessage & {
  options?: string[] | null;
  behaviors?: Behavior[] | null;
  actions?: string[] | null;
};

interface UseMessageStreamOptions {
  user: User | null;
  knownContext: Record<string, unknown>;
  humaContext: HumaContext;
  aspirations: Aspiration[];
  sourceTab?: "today" | "whole" | "grow";
  tabContext?: Record<string, unknown>;
  mode: "default" | "new-aspiration";
  onContextExtracted: (parsedContext: Record<string, unknown>) => void;
  onAspirationCreated: (aspiration: Aspiration) => void;
  onReorganization: (plan: ReorganizationPlan) => void;
  onDecision: (decision: { description: string; reasoning: string; frameworks_surfaced: string[] }) => void;
}

/** Structured 429 body shape — matches api-error.ts ApiErrorBody RATE_LIMITED. */
export interface QuotaLimitState {
  tier: "anonymous" | "free" | "operate";
  resetAt: string;
  suggest?: "sign_in" | "upgrade_operate" | "wait";
}

interface MessageStreamResult {
  messages: RichMessage[];
  setMessages: React.Dispatch<React.SetStateAction<RichMessage[]>>;
  streaming: boolean;
  lastFailedMessage: string | null;
  setLastFailedMessage: React.Dispatch<React.SetStateAction<string | null>>;
  markerRetryMessageId: string | null;
  setMarkerRetryMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  markerRetryAttempted: boolean;
  setMarkerRetryAttempted: React.Dispatch<React.SetStateAction<boolean>>;
  /** Plan 02 (SEC-02) — non-null when server returned 429 with RATE_LIMITED body. */
  quotaLimit: QuotaLimitState | null;
  setQuotaLimit: React.Dispatch<React.SetStateAction<QuotaLimitState | null>>;
  sendMessage: (text: string) => Promise<void>;
}

export function useMessageStream({
  user,
  knownContext,
  humaContext,
  aspirations,
  sourceTab,
  tabContext,
  mode,
  onContextExtracted,
  onAspirationCreated,
  onReorganization,
  onDecision,
}: UseMessageStreamOptions): MessageStreamResult {
  const [messages, setMessages] = useState<RichMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [markerRetryMessageId, setMarkerRetryMessageId] = useState<string | null>(null);
  const [markerRetryAttempted, setMarkerRetryAttempted] = useState(false);
  // Plan 02 (SEC-02): non-null when the API returned a structured RATE_LIMITED
  // body. Consumers render <QuotaCard tier resetAt suggest /> based on this.
  const [quotaLimit, setQuotaLimit] = useState<QuotaLimitState | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  // Load patterns (Supabase for auth'd users, localStorage otherwise) so the
  // chat prompt can include the full life graph. Reloads when user changes.
  useEffect(() => {
    let cancelled = false;
    storeLoadPatterns(user?.id ?? null).then(loaded => {
      if (!cancelled) setPatterns(loaded);
    }).catch(() => { /* ignore — patterns optional */ });
    return () => { cancelled = true; };
  }, [user]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages as RichMessage[]);
    setStreaming(true);
    setLastFailedMessage(null);

    if (user) {
      const supabase = createClient();
      if (supabase) saveChatMessage(supabase, user.id, userMsg).catch(() => {
        enqueuePendingSync({ type: "chat-message", userId: user.id, message: userMsg });
      });
    }

    try {
      // Compute dayCount from start date
      let dayCount: number | undefined;
      try {
        const start = localStorage.getItem("huma-v2-start-date");
        if (start) {
          const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
          dayCount = diff > 0 ? diff : 1;
        }
      } catch { /* fresh operator */ }

      // Drain any queued messages from previous offline failures
      let queuedContext: Array<{ role: string; content: string }> = [];
      try {
        const raw = localStorage.getItem("huma-v2-pending-messages");
        if (raw) {
          queuedContext = JSON.parse(raw);
          localStorage.removeItem("huma-v2-pending-messages");
        }
      } catch { /* ignore */ }

      const allMessages = [...queuedContext.map(q => ({ role: q.role, content: q.content })), ...newMessages.map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content }))];

      // Build behaviorCounts keyed by `${aspirationId}:${behaviorKey}` for
      // compressed encoding. Auth'd users pull from Supabase (last 7 days);
      // unauth'd users ship no counts — encoder handles absence gracefully.
      let behaviorCounts: Record<string, { completed: number; total: number }> | undefined;
      if (user) {
        try {
          const supabase = createClient();
          if (supabase) {
            const rawCounts = await getBehaviorWeekCounts(supabase, user.id);
            const mapped: Record<string, { completed: number; total: number }> = {};
            for (const [behaviorKey, counts] of Object.entries(rawCounts)) {
              for (const asp of aspirations) {
                if (asp.behaviors?.some(b => b.key === behaviorKey)) {
                  mapped[`${asp.id}:${behaviorKey}`] = counts;
                }
              }
            }
            if (Object.keys(mapped).length > 0) behaviorCounts = mapped;
          }
        } catch { /* counts are optional */ }
      }

      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          knownContext,
          humaContext,
          aspirations: aspirations.map(a => ({ rawText: a.rawText, clarifiedText: a.clarifiedText, status: a.status })),
          sourceTab,
          tabContext,
          dayCount,
          // Compressed-encoding inputs — light up Phase 2/3 in chat.
          fullAspirations: aspirations,
          patterns,
          ...(behaviorCounts && { behaviorCounts }),
          ...(mode === "new-aspiration" && { chatMode: "new-aspiration" }),
        }),
      });

      // Plan 02 (SEC-02): intercept 429 with structured RATE_LIMITED body
      // BEFORE the generic error path. Parse tier/resetAt/suggest and expose
      // via state so the consumer can render <QuotaCard>. Quota-hit is not
      // an exception — it's a first-class UX state with a respectful overlay.
      if (res.status === 429) {
        type RateLimitedBody = {
          code?: string;
          tier?: string;
          resetAt?: string;
          suggest?: string;
        };
        const body = (await res.json().catch(() => null)) as RateLimitedBody | null;
        if (
          body &&
          body.code === "RATE_LIMITED" &&
          (body.tier === "anonymous" || body.tier === "free" || body.tier === "operate")
        ) {
          const suggest =
            body.suggest === "sign_in" ||
            body.suggest === "upgrade_operate" ||
            body.suggest === "wait"
              ? body.suggest
              : undefined;
          setQuotaLimit({
            tier: body.tier,
            resetAt: body.resetAt ?? new Date(Date.now() + 86_400_000).toISOString(),
            suggest,
          });
          setStreaming(false);
          // Strip the empty placeholder HUMA message if one was queued.
          setMessages(prev => prev.filter(m => m.role !== "huma" || m.content !== ""));
          return;
        }
        // Fall through to generic 429 handling for non-structured bodies
        // (e.g. legacy IP-rate-limit response with no tier metadata).
        throw new Error(`API_${res.status}`);
      }

      if (!res.ok) throw new Error(`API_${res.status}`);

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

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedDecomposition, parsedReorganization, parsedDecision } = parseMarkers(fullResponse);

      const finalHumaMsg: ChatMessage = { ...humaMsg, content: cleanText, contextExtracted: parsedContext || undefined };
      if (user) {
        const supabase = createClient();
        if (supabase) saveChatMessage(supabase, user.id, finalHumaMsg).catch(() => {
          enqueuePendingSync({ type: "chat-message", userId: user.id, message: finalHumaMsg });
        });
      }

      if (parsedContext) {
        onContextExtracted(parsedContext);
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
        onAspirationCreated(newAspiration);
      }

      if (parsedReorganization && user) {
        onReorganization(parsedReorganization);
      }

      if (parsedDecision) {
        onDecision(parsedDecision);
      }

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "huma") {
          updated[updated.length - 1] = { ...last, content: cleanText, options: parsedOptions, behaviors: parsedBehaviors, actions: parsedActions };
        }
        return updated;
      });

      // Context extraction failure tracking (developer diagnostic)
      if (cleanText.length > 100 && !parsedContext) {
        try {
          const missKey = "huma-v2-context-extraction-misses";
          const data = JSON.parse(localStorage.getItem(missKey) || '{"misses":0,"total":0}');
          data.misses++;
          data.total++;
          localStorage.setItem(missKey, JSON.stringify(data));
          if (data.total >= 20 && data.misses / data.total > 0.3) {
            console.warn(`[HUMA] Context extraction miss rate: ${Math.round(100 * data.misses / data.total)}% over ${data.total} messages — extraction prompts may need rework`);
          }
        } catch { /* diagnostic only */ }
      } else if (parsedContext) {
        try {
          const missKey = "huma-v2-context-extraction-misses";
          const data = JSON.parse(localStorage.getItem(missKey) || '{"misses":0,"total":0}');
          data.total++;
          localStorage.setItem(missKey, JSON.stringify(data));
        } catch { /* diagnostic only */ }
      }

      // Marker retry detection
      if (
        cleanText.length > 80 &&
        !parsedBehaviors &&
        !parsedDecomposition &&
        containsBehavioralLanguage(cleanText) &&
        (mode === "new-aspiration" || newMessages.some(m => m.content.toLowerCase().match(/i want|i('m| am) trying|i need|make work/)))
      ) {
        setMarkerRetryMessageId(humaMsg.id);
        setMarkerRetryAttempted(false);
      }

    } catch (err) {
      setLastFailedMessage(text);

      // Queue the user's message for retry on next successful call
      try {
        const pending = JSON.parse(localStorage.getItem("huma-v2-pending-messages") || "[]");
        pending.push({ role: "user", content: trimmed, pending: true, queuedAt: new Date().toISOString() });
        localStorage.setItem("huma-v2-pending-messages", JSON.stringify(pending));
      } catch { /* storage full */ }

      let errorContent: string;
      const errMsg = err instanceof Error ? err.message : "";
      if (!navigator.onLine) {
        errorContent = "Saved your message. HUMA will process it when connection returns.";
      } else if (errMsg === "API_429") {
        errorContent = "HUMA needs a moment. Try again in 30 seconds.";
      } else if (errMsg.startsWith("API_5")) {
        errorContent = "Something broke on our end. Your message is saved.";
      } else if (errMsg === "No body") {
        errorContent = "That took too long. Tap to retry.";
      } else {
        errorContent = "Something went wrong. Tap to retry.";
      }

      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        {
          id: crypto.randomUUID(),
          role: "huma" as const,
          content: errorContent,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, knownContext, humaContext, aspirations, patterns, user, mode, sourceTab, tabContext, onContextExtracted, onAspirationCreated, onReorganization, onDecision]);

  return {
    messages,
    setMessages,
    streaming,
    lastFailedMessage,
    setLastFailedMessage,
    markerRetryMessageId,
    setMarkerRetryMessageId,
    markerRetryAttempted,
    setMarkerRetryAttempted,
    quotaLimit,
    setQuotaLimit,
    sendMessage,
  };
}
