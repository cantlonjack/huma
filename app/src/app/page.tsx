"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { type Message, type Phase, type ConversationContext, PHASES } from "@/engine/types";
import { buildOpeningMessage } from "@/engine/phases";
import { copyCurrentUrl } from "@/lib/clipboard";
import { type SavedConversation, saveConversation, loadConversation, clearConversation } from "@/lib/persistence";
import Chat from "@/components/Chat";
import PhaseIndicator from "@/components/PhaseIndicator";
import MapDocument from "@/components/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import type { CanvasData } from "@/engine/canvas-types";
import MapPreview from "@/components/MapPreview";
import ShapeChart from "@/components/ShapeChart";
import { computeAggregateCapitalScores } from "@/engine/enterprise-templates";
import { trackEvent } from "@/lib/analytics";
import { cleanForDisplay as cleanMarkers, parseMarkers as extractMarkers } from "@/lib/markers";

const SAMPLE_SHAPE_SCORES = [4, 3, 5, 4, 4, 3, 4, 3];

type AppState = "landing" | "welcome" | "conversation" | "generating" | "map";

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function phaseLabel(phase: Phase): string {
  const info = PHASES.find((p) => p.id === phase);
  const idx = PHASES.findIndex((p) => p.id === phase);
  return info ? `${idx + 1}/6 \u2014 ${info.label}` : "";
}

const CONTEXT_TOAST_MESSAGES: Record<string, string> = {
  "ikigai-synthesis": "Your essence has been captured",
  "holistic-synthesis": "Your holistic context has been mapped",
  "landscape-synthesis": "Your landscape has been read",
  "enterprises": "Your enterprises have been identified",
  "nodal-interventions": "Your nodal interventions have been charted",
  "operational-design": "Your operational rhythm has been designed",
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase>("ikigai");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [mapMarkdown, setMapMarkdown] = useState("");
  const [mapCanvasData, setMapCanvasData] = useState<CanvasData | null>(null);
  const [operatorName, setOperatorName] = useState("");
  const [operatorLocation, setOperatorLocation] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [contextSnapshot, setContextSnapshot] = useState<Partial<ConversationContext>>({});
  const [savedConvo, setSavedConvo] = useState<SavedConversation | null>(null);
  const [generatingLong, setGeneratingLong] = useState(false);
  const [generatingError, setGeneratingError] = useState(false);
  const [lastError, setLastError] = useState<{ content: string; retryWith: string } | null>(null);
  const [contextToast, setContextToast] = useState<string | null>(null);
  const [confirmFresh, setConfirmFresh] = useState(false);
  const [mapView, setMapView] = useState<"canvas" | "document">("canvas");
  const contextRef = useRef<Partial<ConversationContext>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Check for saved conversation on mount
  useEffect(() => {
    const saved = loadConversation();
    if (saved) setSavedConvo(saved);
  }, []);

  // Auto-focus name input on welcome screen, textarea on conversation
  useEffect(() => {
    if (appState === "welcome") {
      nameInputRef.current?.focus();
    } else if (appState === "conversation") {
      // Small delay to let the DOM settle after state transition
      const timer = setTimeout(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
        textarea?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Generating "still working" timer
  useEffect(() => {
    if (appState !== "generating") {
      setGeneratingLong(false);
      return;
    }
    const timer = setTimeout(() => setGeneratingLong(true), 12000);
    return () => clearTimeout(timer);
  }, [appState]);

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
    setAppState("conversation");
  }, []);

  const resumeConversation = useCallback((saved: SavedConversation) => {
    setMessages(saved.messages);
    setCurrentPhase(saved.phase);
    contextRef.current = saved.context;
    setContextSnapshot(saved.context);
    setOperatorName(saved.operatorName);
    setOperatorLocation(saved.operatorLocation);
    setAppState("conversation");
    trackEvent("conversation_resumed", { phase: saved.phase });
  }, []);

  /**
   * Accumulate parsed context entries into contextRef.
   * Separated from marker parsing so parsing is a pure function (testable).
   */
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
          // Update snapshot for MapPreview even without phase change
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
          generateMap();
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        setLastError({
          content: "I seem to have lost my train of thought. Could you try again?",
          retryWith: content,
        });
        // Remove the user message that failed so they can retry cleanly
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentPhase, accumulateContext, operatorName, operatorLocation]
  );

  const handleRetry = useCallback(() => {
    if (lastError) {
      sendMessage(lastError.retryWith);
    }
  }, [lastError, sendMessage]);

  const generateMap = useCallback(async () => {
    setAppState("generating");
    setGeneratingError(false);

    trackEvent("map_generation_started");
    const ctx = contextRef.current;
    const syntheses = {
      operatorName: ctx.operatorName || operatorName,
      location: ctx.landscape?.location || operatorLocation,
      ikigaiSynthesis: ctx.ikigai?.essenceSynthesis || "",
      holisticContextSynthesis: ctx.holisticContext?.synthesis || "",
      landscapeSynthesis: ctx.landscape?.synthesis || "",
      enterpriseSelections: ctx.enterprises?.reasoning || ctx.enterprises?.selected?.join("\n") || "",
      nodalInterventions: ctx.nodalInterventions?.cascadeAnalysis || "",
      operationalDesign: ctx.operationalDesign?.synthesis || "",
    };

    try {
      // Parallel API calls: one for canvasData JSON, one for document markdown
      const [canvasResponse, docResponse] = await Promise.all([
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Generate the Living Canvas data structure." }],
            generateCanvas: true,
            syntheses,
          }),
        }),
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Generate my Regenerative Enterprise Map." }],
            generateDocument: true,
            syntheses,
          }),
        }),
      ]);

      if (!docResponse.ok) throw new Error(`Doc API error: ${docResponse.status}`);

      // Read document markdown stream
      const docReader = docResponse.body?.getReader();
      if (!docReader) throw new Error("No doc response body");
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await docReader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Read canvas JSON stream
      let canvasData = null;
      if (canvasResponse.ok) {
        const canvasReader = canvasResponse.body?.getReader();
        if (canvasReader) {
          let canvasText = "";
          while (true) {
            const { done, value } = await canvasReader.read();
            if (done) break;
            canvasText += decoder.decode(value, { stream: true });
          }
          try {
            // Strip markdown code fences if present
            const cleaned = canvasText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
            canvasData = JSON.parse(cleaned);
          } catch {
            console.warn("Failed to parse canvasData JSON, falling back to document-only");
          }
        }
      }

      setMapMarkdown(fullText);
      if (canvasData) setMapCanvasData(canvasData as CanvasData);
      setAppState("map");
      trackEvent("map_generation_complete");

      // Store to server for real cross-browser shareability
      const enterpriseCount = ctx.enterprises?.selected?.length || 0;
      const mapPayload: Record<string, unknown> = {
        markdown: fullText,
        name: syntheses.operatorName,
        location: syntheses.location,
        enterpriseCount,
        createdAt: new Date().toISOString(),
      };
      if (canvasData) {
        mapPayload.canvasData = canvasData;
      }

      let mapId: string;
      try {
        const storeResponse = await fetch("/api/maps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mapPayload),
        });
        const storeData = await storeResponse.json();
        mapId = storeData.id;
      } catch {
        // Fallback to local-only ID if API fails
        mapId = Date.now().toString(36);
      }

      // Cache in localStorage for instant load on this device
      localStorage.setItem(`huma-map-${mapId}`, JSON.stringify(mapPayload));
      clearConversation();

      const params = new URLSearchParams();
      if (syntheses.operatorName) params.set("name", syntheses.operatorName);
      if (syntheses.location) params.set("location", syntheses.location);
      if (ctx.enterprises?.selected?.length) params.set("enterprises", ctx.enterprises.selected.length.toString());
      const qs = params.toString();
      window.history.pushState(null, "", `/map/${mapId}${qs ? `?${qs}` : ""}`);
    } catch (error) {
      console.error("Failed to generate map:", error);
      setGeneratingError(true);
    }
  }, [operatorName, operatorLocation]);

  // ─── Landing ───
  if (appState === "landing") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background gradient — subtle earthy warmth */}
        <div className="absolute inset-0 bg-gradient-to-b from-sage-50/40 via-transparent to-amber-400/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center px-6 pt-16 md:pt-24 pb-16">
          {/* Brand */}
          <p className="text-sm uppercase tracking-[0.4em] text-sage-600 mb-12 md:mb-16 font-medium">
            HUMA
          </p>

          {/* Hero headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-earth-900 text-center leading-[1.15] mb-10 max-w-2xl">
            See your land and your life as a connected whole
          </h1>

          {/* The Shape — visual centerpiece */}
          <div className="my-6 md:my-10">
            <ShapeChart
              scores={SAMPLE_SHAPE_SCORES}
              className="w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80"
              animated
              breathing
            />
          </div>

          {/* Value proposition */}
          <p className="text-base md:text-lg text-earth-600 text-center max-w-lg leading-relaxed mb-10">
            A living systems design tool that reads your purpose, your
            landscape, and your enterprises &mdash; then maps where they
            meet, with real numbers.
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => setAppState("welcome")}
            className="group px-10 py-4 bg-amber-400 text-earth-900 text-lg font-medium rounded-full hover:bg-amber-500 transition-all hover:shadow-lg hover:shadow-amber-400/20"
          >
            Start Your Map
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>

          <a
            href="/map/sample"
            className="mt-5 text-sm text-sage-600 hover:text-sage-700 transition-colors"
          >
            See an example map &rarr;
          </a>

          {/* Resume saved conversation */}
          {savedConvo && (
            <div className="mt-10 text-center">
              <p className="font-serif text-sm italic text-earth-500 mb-3">
                Welcome back, {savedConvo.operatorName}.
              </p>
              <button
                onClick={() => resumeConversation(savedConvo)}
                className="px-6 py-3 text-sage-700 border border-sage-300 rounded-full hover:bg-sage-50 transition-colors text-sm"
              >
                Continue your map
                <span className="block text-xs text-earth-500 mt-0.5">
                  {phaseLabel(savedConvo.phase)} &middot; {formatTimeAgo(savedConvo.savedAt)}
                </span>
              </button>
              {confirmFresh ? (
                <span className="ml-3 text-sm">
                  <span className="text-earth-600">Delete saved conversation?</span>
                  {" "}
                  <button
                    onClick={() => {
                      clearConversation();
                      setSavedConvo(null);
                      setConfirmFresh(false);
                    }}
                    className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
                  >
                    Yes, start fresh
                  </button>
                  {" "}
                  <button
                    onClick={() => setConfirmFresh(false)}
                    className="text-earth-500 hover:text-earth-700 transition-colors"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmFresh(true)}
                  className="ml-3 text-sm text-earth-500 hover:text-earth-700 transition-colors underline underline-offset-2"
                >
                  Start fresh
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-16 h-px bg-sand-300 mt-20 mb-16" />

          {/* Six Traditions */}
          <h2 className="font-serif text-xl md:text-2xl text-earth-800 text-center mb-8">
            Six traditions of regenerative thought
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl w-full">
            {[
              { name: "Holistic Management", author: "Savory & Palmer" },
              { name: "Regrarians Platform", author: "Doherty" },
              { name: "Enterprise Economics", author: "Perkins" },
              { name: "8 Forms of Capital", author: "Roland & Landua" },
              { name: "Regenerative Principles", author: "Sanford" },
              { name: "Knowledge as Code", author: "Adri\u00e0" },
            ].map((t) => (
              <div key={t.name} className="px-4 py-3 rounded-lg bg-sand-100/60 text-center">
                <span className="font-medium text-sm text-earth-800 block">{t.name}</span>
                <span className="text-xs text-earth-500">{t.author}</span>
              </div>
            ))}
          </div>

          {/* Time + Privacy */}
          <p className="mt-14 text-sm text-earth-500 text-center">
            About 45 minutes &middot; Receive a printable Regenerative Enterprise Map
          </p>
          <p className="mt-3 text-xs text-earth-400 text-center max-w-sm">
            Your conversation stays between you and HUMA. Maps are stored
            securely and shared only when you choose.
          </p>
        </div>
      </div>
    );
  }

  // ─── Welcome (Name Screen) ───
  if (appState === "welcome") {
    const handleWelcomeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const name = operatorName.trim();
      if (!name) return;
      startConversation(name, operatorLocation.trim());
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sage-50/30 via-transparent to-transparent pointer-events-none" />

        {/* Back to landing */}
        <button
          onClick={() => setAppState("landing")}
          className="absolute top-6 left-6 z-10 text-sm text-earth-400 hover:text-earth-600 transition-colors"
          aria-label="Back to home"
        >
          &larr; Back
        </button>

        <form onSubmit={handleWelcomeSubmit} className="relative z-10 max-w-md w-full text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-sage-600 mb-14 font-medium">
            HUMA
          </p>

          <label htmlFor="operator-name" className="block font-serif text-3xl md:text-4xl text-earth-900 mb-10">
            What should I call you?
          </label>
          <input
            id="operator-name"
            ref={nameInputRef}
            type="text"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            className="w-full bg-transparent border-b-2 border-sand-300 focus:border-sage-500 text-center font-serif text-xl text-earth-800 py-3 outline-none transition-colors placeholder:text-earth-400/40"
            placeholder="Your name"
          />

          <label htmlFor="operator-location" className="block font-serif text-xl text-earth-700 mt-16 mb-6">
            Where is your land?
          </label>
          <input
            id="operator-location"
            type="text"
            value={operatorLocation}
            onChange={(e) => setOperatorLocation(e.target.value)}
            className="w-full bg-transparent border-b-2 border-sand-300 focus:border-sage-500 text-center font-serif text-lg text-earth-700 py-3 outline-none transition-colors placeholder:text-earth-400/40"
            placeholder="e.g., Southern Oregon, Vermont hilltop, or just a dream"
          />
          <p className="text-xs text-earth-400 mt-2">Optional</p>

          <button
            type="submit"
            disabled={!operatorName.trim()}
            className="mt-16 px-10 py-4 bg-amber-400 text-earth-900 text-lg font-medium rounded-full hover:bg-amber-500 transition-all hover:shadow-lg hover:shadow-amber-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Let&apos;s begin
          </button>
        </form>
      </div>
    );
  }

  // ─── Generating ───
  if (appState === "generating") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center" role="status">
          {generatingError ? (
            <>
              <p className="font-serif text-2xl text-earth-800 mb-3">
                Something went wrong
              </p>
              <p className="text-earth-600 mb-8">
                Your conversation is still safe. Let&apos;s try generating your map again.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => generateMap()}
                  className="px-6 py-3 bg-amber-400 text-earth-900 font-medium rounded-full hover:bg-amber-500 transition-all"
                >
                  Try again
                </button>
                <button
                  onClick={() => setAppState("conversation")}
                  className="px-6 py-3 text-earth-600 border border-sand-300 rounded-full hover:bg-sand-100 transition-colors"
                >
                  Back to conversation
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Animated shape building */}
              <div className="mb-8">
                <ShapeChart
                  scores={[2, 1, 3, 2, 2, 1, 2, 1]}
                  className="w-40 h-40 opacity-50"
                  animated
                  breathing
                />
              </div>
              <p className="font-serif text-2xl md:text-3xl text-earth-800">
                Building your shape
              </p>
              <p className="text-earth-600 mt-2">
                Weaving together everything we discussed...
              </p>
              <p className="text-sm text-earth-500 mt-4">
                {generatingLong
                  ? "Still working \u2014 your map has a lot of ground to cover."
                  : "This usually takes about 30 seconds."}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Map ───
  if (appState === "map" && mapMarkdown) {
    const handleShareFromMap = async () => {
      const ok = await copyCurrentUrl();
      if (ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        trackEvent("share_button_clicked");
      }
    };

    const shapeScores = contextSnapshot.enterprises?.selected?.length
      ? computeAggregateCapitalScores(contextSnapshot.enterprises.selected)
      : SAMPLE_SHAPE_SCORES;

    return (
      <div className="min-h-screen">
        <div className="no-print sticky top-0 z-10 bg-sand-50/90 backdrop-blur border-b border-sand-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <span className="text-sm uppercase tracking-[0.3em] text-sage-600 font-medium shrink-0">HUMA</span>
          <div className="flex gap-2 sm:gap-3 items-center flex-wrap justify-end">
            {/* View toggle — only show if both views available */}
            {mapCanvasData && (
              <div className="flex bg-sand-100 rounded-full p-0.5 border border-sand-200">
                <button
                  onClick={() => setMapView("canvas")}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    mapView === "canvas"
                      ? "bg-white text-sage-700 shadow-sm"
                      : "text-earth-500 hover:text-earth-700"
                  }`}
                >
                  Canvas
                </button>
                <button
                  onClick={() => setMapView("document")}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    mapView === "document"
                      ? "bg-white text-sage-700 shadow-sm"
                      : "text-earth-500 hover:text-earth-700"
                  }`}
                >
                  Document
                </button>
              </div>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 sm:px-5 py-2 text-sm bg-amber-400 text-earth-900 rounded-full hover:bg-amber-500 transition-all font-medium whitespace-nowrap hidden sm:block"
            >
              Save as PDF
            </button>
            <button
              onClick={handleShareFromMap}
              className="px-4 sm:px-5 py-2 text-sm border border-sand-300 rounded-full text-earth-700 hover:bg-sand-100 transition-colors whitespace-nowrap"
              title="Copy shareable link to clipboard"
            >
              Copy Link
            </button>
            <button
              onClick={() => setAppState("conversation")}
              className="px-4 py-2 text-sm text-earth-500 hover:text-earth-700 transition-colors whitespace-nowrap"
            >
              Back
            </button>
          </div>
        </div>
        {mapView === "canvas" && mapCanvasData ? (
          <LivingCanvas data={mapCanvasData} />
        ) : (
          <MapDocument
            markdown={mapMarkdown}
            shapeScores={shapeScores}
            operatorName={operatorName}
          />
        )}
        {showToast && (
          <div className="toast">Link copied to clipboard</div>
        )}
      </div>
    );
  }

  // ─── Conversation ───
  return (
    <div className="h-screen flex flex-col">
      <header className="no-print border-b border-sand-200 px-6 md:px-16 lg:px-24 py-3 flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.3em] text-sage-600 font-medium">HUMA</span>
        <PhaseIndicator currentPhase={currentPhase} />
      </header>
      <Chat
        messages={messages}
        currentPhase={currentPhase}
        isLoading={isLoading}
        streamingContent={streamingContent}
        onSend={sendMessage}
        errorBar={lastError}
        onRetry={handleRetry}
      />
      <MapPreview context={contextSnapshot} />

      {/* Context capture toast — positioned above mobile MapPreview button */}
      {contextToast && (
        <div className="fixed bottom-32 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 bg-sage-600 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg animate-fade-in no-print">
          {contextToast}
        </div>
      )}
    </div>
  );
}
