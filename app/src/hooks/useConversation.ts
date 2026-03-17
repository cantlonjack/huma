"use client";

import { useState, useCallback, useRef } from "react";
import { type Message, type Phase, type ConversationContext } from "@/engine/types";
import { buildOpeningMessage } from "@/engine/phases";
import { type SavedConversation, saveConversation } from "@/lib/persistence";
import { cleanForDisplay as cleanMarkers, parseMarkers as extractMarkers } from "@/lib/markers";
import { trackEvent } from "@/lib/analytics";

const CONTEXT_TOAST_MESSAGES: Record<string, string> = {
  "ikigai-synthesis": "Your essence has been captured",
  "holistic-synthesis": "Your holistic context has been mapped",
  "landscape-synthesis": "Your landscape has been read",
  "enterprises": "Your enterprises have been identified",
  "nodal-interventions": "Your nodal interventions have been charted",
  "operational-design": "Your operational rhythm has been designed",
};

interface UseConversationOptions {
  operatorName: string;
  operatorLocation: string;
  onComplete: () => void;
}

export function useConversation({ operatorName, operatorLocation, onComplete }: UseConversationOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase>("ikigai");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [lastError, setLastError] = useState<{ content: string; retryWith: string } | null>(null);
  const [contextSnapshot, setContextSnapshot] = useState<Partial<ConversationContext>>({});
  const [contextToast, setContextToast] = useState<string | null>(null);
  const contextRef = useRef<Partial<ConversationContext>>({});

  const accumulateContext = useCallback((capturedContexts: { type: string; value: string }[]) => {
    for (const { type: contextType, value: contextValue } of capturedContexts) {
      if (contextType === "ikigai-synthesis") {
        contextRef.current = {
          ...contextRef.current,
          ikigai: {
            loves: [], skills: [], worldNeeds: [], sustains: [],
            essenceSynthesis: contextValue,
          },
        };
      } else if (contextType === "holistic-synthesis") {
        contextRef.current = {
          ...contextRef.current,
          holisticContext: {
            qualityOfLife: "", productionForms: "", futureResourceBase: "",
            synthesis: contextValue,
          },
        };
      } else if (contextType === "landscape-synthesis") {
        contextRef.current = {
          ...contextRef.current,
          landscape: {
            location: "", climate: "", geography: "", water: "",
            access: "", forestry: "", buildings: "", fencing: "", soils: "",
            synthesis: contextValue,
          },
        };
      } else if (contextType === "enterprises") {
        contextRef.current = {
          ...contextRef.current,
          enterprises: {
            candidates: [],
            selected: contextValue.split("\n").filter(Boolean),
            reasoning: contextValue,
          },
        };
      } else if (contextType === "nodal-interventions") {
        contextRef.current = {
          ...contextRef.current,
          nodalInterventions: {
            actions: contextValue.split("\n").filter(Boolean),
            cascadeAnalysis: contextValue,
          },
        };
      } else if (contextType === "operational-design") {
        contextRef.current = {
          ...contextRef.current,
          operationalDesign: {
            weeklyRhythm: contextValue,
            validationProtocol: "",
            seasonalCadence: "",
            synthesis: contextValue,
          },
        };
      }
    }
  }, []);

  const startConversation = useCallback((name: string, location: string) => {
    contextRef.current = {
      ...contextRef.current,
      operatorName: name,
      ...(location ? { landscape: { location, climate: "", geography: "", water: "", access: "", forestry: "", buildings: "", fencing: "", soils: "", synthesis: "" } } : {}),
    };

    const opening = buildOpeningMessage(name, location || undefined);
    const openingMsg: Message = {
      id: "opening",
      role: "assistant",
      content: opening,
    };
    setMessages([openingMsg]);
    setCurrentPhase("ikigai");
  }, []);

  const resumeConversation = useCallback((saved: SavedConversation) => {
    setMessages(saved.messages);
    setCurrentPhase(saved.phase);
    contextRef.current = saved.context;
    setContextSnapshot(saved.context);
    trackEvent("conversation_resumed", { phase: saved.phase });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      setLastError(null);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            phase: currentPhase,
            context: contextRef.current,
          }),
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamingContent(cleanMarkers(fullText));
        }

        const { clean, phase: detectedPhase, isComplete, capturedContexts } = extractMarkers(fullText);
        accumulateContext(capturedContexts);

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: clean,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent("");

        const newPhase = detectedPhase || currentPhase;
        if (detectedPhase) {
          setCurrentPhase(detectedPhase);
          setContextSnapshot({ ...contextRef.current });
          trackEvent("phase_transition", { phase: detectedPhase });
        }

        // Show context capture toast
        if (capturedContexts.length > 0) {
          const lastCaptured = capturedContexts[capturedContexts.length - 1];
          const toastMsg = CONTEXT_TOAST_MESSAGES[lastCaptured.type];
          if (toastMsg) {
            setContextToast(toastMsg);
            setTimeout(() => setContextToast(null), 5000);
          }
          setContextSnapshot({ ...contextRef.current });
        }

        // Persist conversation for resume
        saveConversation({
          messages: [...updatedMessages, assistantMsg],
          phase: newPhase,
          context: { ...contextRef.current },
          operatorName,
          operatorLocation,
          savedAt: new Date().toISOString(),
        });

        if (isComplete) {
          onComplete();
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        setLastError({
          content: "I seem to have lost my train of thought. Could you try again?",
          retryWith: content,
        });
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentPhase, accumulateContext, operatorName, operatorLocation, onComplete]
  );

  const handleRetry = useCallback(() => {
    if (lastError) {
      sendMessage(lastError.retryWith);
    }
  }, [lastError, sendMessage]);

  return {
    messages,
    currentPhase,
    isLoading,
    streamingContent,
    lastError,
    contextSnapshot,
    contextToast,
    contextRef,
    startConversation,
    resumeConversation,
    sendMessage,
    handleRetry,
  };
}
