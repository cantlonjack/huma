"use client";

import { useState, useRef, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration, ReorganizationPlan } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { saveChatMessage } from "@/lib/supabase-v2";
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

      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content })),
          knownContext,
          humaContext,
          aspirations: aspirations.map(a => ({ rawText: a.rawText, clarifiedText: a.clarifiedText, status: a.status })),
          sourceTab,
          tabContext,
          dayCount,
          ...(mode === "new-aspiration" && { chatMode: "new-aspiration" }),
        }),
      });

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

      let errorContent: string;
      const errMsg = err instanceof Error ? err.message : "";
      if (!navigator.onLine) {
        errorContent = "You\u2019re offline. Your message is saved \u2014 it\u2019ll send when you reconnect.";
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
  }, [messages, streaming, knownContext, humaContext, aspirations, user, mode, sourceTab, tabContext, onContextExtracted, onAspirationCreated, onReorganization, onDecision]);

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
    sendMessage,
  };
}
