"use client";

import { useState, useCallback, useRef } from "react";
import { type Message, type Phase, type ConversationContext, type ProgressiveCanvasData } from "@/engine/types";
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

  // Canvas data: ref for accumulation during streaming, state for triggering re-renders
  const canvasDataRef = useRef<Partial<ProgressiveCanvasData>>({});
  const [canvasDataSnapshot, setCanvasDataSnapshot] = useState<Partial<ProgressiveCanvasData>>({});
  const [completedPhases, setCompletedPhases] = useState<Phase[]>([]);
  // Track which messages preceded a phase transition (messageId → phase label)
  const [phaseTransitions, setPhaseTransitions] = useState<Record<string, string>>({});

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
      } else if (contextType.startsWith("field-type:")) {
        const fieldType = contextType.split(":")[1] as "land" | "universal" | "hybrid";
        contextRef.current = {
          ...contextRef.current,
          fieldType,
        };
      }
    }
  }, []);

  const accumulateCanvasData = useCallback((entries: { type: string; json: unknown }[]) => {
    for (const { type: dataType, json } of entries) {
      const data = json as Record<string, unknown>;
      if (dataType === "ikigai" && data.phrase) {
        canvasDataRef.current = {
          ...canvasDataRef.current,
          essence: {
            name: operatorName,
            location: operatorLocation,
            phrase: data.phrase as string,
          },
        };
      } else if (dataType === "holistic") {
        canvasDataRef.current = {
          ...canvasDataRef.current,
          ...(data.qolStatements ? { qolNodes: data.qolStatements as string[] } : {}),
          ...(data.productionForms ? { productionNodes: data.productionForms as string[] } : {}),
          ...(data.futureResourceBase ? { resourceNodes: data.futureResourceBase as string[] } : {}),
        };
      } else if (dataType === "landscape" && data.capitalScores) {
        const scores = data.capitalScores as Record<string, number>;
        canvasDataRef.current = {
          ...canvasDataRef.current,
          capitalProfile: Object.entries(scores).map(([form, score]) => ({ form, score })),
        };
      } else if (dataType === "enterprises" && data.enterprises) {
        canvasDataRef.current = {
          ...canvasDataRef.current,
          enterprises: data.enterprises as Array<{ name: string; role: string; year1Revenue: string }>,
        };
      } else if (dataType === "nodal" && data.interventions) {
        canvasDataRef.current = {
          ...canvasDataRef.current,
          interventions: data.interventions as Array<{ action: string; cascadeSteps: string[] }>,
        };
      } else if (dataType === "operational" && data.weeklyRhythm) {
        canvasDataRef.current = {
          ...canvasDataRef.current,
          weeklyRhythm: data.weeklyRhythm as ProgressiveCanvasData["weeklyRhythm"],
        };
      }
    }
    // Flush ref to state snapshot — triggers single re-render
    setCanvasDataSnapshot({ ...canvasDataRef.current });
  }, [operatorName, operatorLocation]);

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

        if (!response.ok) {
          const status = response.status;
          if (status === 429) {
            throw new Error("rate-limited");
          }
          throw new Error(`API error: ${status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setStreamingContent(cleanMarkers(fullText));
          }
        } catch {
          if (fullText.length > 0) {
            const { clean } = extractMarkers(fullText);
            const partialMsg: Message = {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: clean,
            };
            setMessages((prev) => [...prev, partialMsg]);
            setStreamingContent("");
          }
          throw new Error("connection-lost");
        }

        const { clean, phase: detectedPhase, isComplete, capturedContexts, canvasDataEntries } = extractMarkers(fullText);
        accumulateContext(capturedContexts);

        if (canvasDataEntries.length > 0) {
          accumulateCanvasData(canvasDataEntries);
        }

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

          // The PREVIOUS phase just completed — add to completedPhases
          setCompletedPhases((prev) => {
            if (!prev.includes(currentPhase)) {
              return [...prev, currentPhase];
            }
            return prev;
          });

          // Record which message preceded this phase transition
          setPhaseTransitions((prev) => ({
            ...prev,
            [assistantMsg.id]: detectedPhase,
          }));

          // Fallback: if no canvas data for ikigai, use operator name/location
          if (currentPhase === "ikigai" && canvasDataEntries.length === 0) {
            canvasDataRef.current = {
              ...canvasDataRef.current,
              essence: {
                name: operatorName,
                location: operatorLocation,
                phrase: "",
              },
            };
            setCanvasDataSnapshot({ ...canvasDataRef.current });
          }
        }

        if (capturedContexts.length > 0) {
          const lastCaptured = capturedContexts[capturedContexts.length - 1];
          const toastMsg = CONTEXT_TOAST_MESSAGES[lastCaptured.type];
          if (toastMsg) {
            setContextToast(toastMsg);
            setTimeout(() => setContextToast(null), 5000);
          }
          setContextSnapshot({ ...contextRef.current });
        }

        saveConversation({
          messages: [...updatedMessages, assistantMsg],
          phase: newPhase,
          context: { ...contextRef.current },
          operatorName,
          operatorLocation,
          savedAt: new Date().toISOString(),
        });

        if (isComplete) {
          setCompletedPhases((prev) => {
            if (!prev.includes("operational-design")) {
              return [...prev, "operational-design"];
            }
            return prev;
          });
          onComplete();
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        const msg = error instanceof Error ? error.message : "";
        let errorContent: string;
        if (msg === "rate-limited") {
          errorContent = "Too many requests. Give it a moment, then try again.";
        } else if (msg === "connection-lost") {
          errorContent = "Connection was interrupted. Your conversation is saved. Try sending your message again.";
        } else {
          errorContent = "I seem to have lost my train of thought. Could you try again?";
        }
        setLastError({
          content: errorContent,
          retryWith: content,
        });
        if (msg !== "connection-lost") {
          setMessages(messages);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentPhase, accumulateContext, accumulateCanvasData, operatorName, operatorLocation, onComplete]
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
    canvasDataSnapshot,
    completedPhases,
    phaseTransitions,
    startConversation,
    resumeConversation,
    sendMessage,
    handleRetry,
  };
}
