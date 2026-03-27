"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@/hooks/useConversation";
import { useMapGeneration } from "@/hooks/useMapGeneration";
import { useMapPersistence } from "@/hooks/useMapPersistence";
import { useAuth } from "@/components/AuthProvider";
import { fetchLatestShape } from "@/lib/shapes";
import LandingView from "@/components/views/LandingView";
import WelcomeView from "@/components/views/WelcomeView";
import ConversationView from "@/components/views/ConversationView";
import GeneratingView from "@/components/views/GeneratingView";
import MapView from "@/components/views/MapView";

type AppState = "landing" | "welcome" | "conversation" | "generating" | "map";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hasShape, setHasShape] = useState<boolean | null>(null);

  // Check if authenticated user already has a shape or V2 aspirations
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setHasShape(false); return; }

    (async () => {
      // Check for V2 aspirations first — if they exist, go to /today
      try {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase
            .from("aspirations")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .limit(1);
          if (data && data.length > 0) {
            router.push("/today");
            return;
          }
        }
      } catch { /* fall through to V1 check */ }

      const latest = await fetchLatestShape();
      setHasShape(!!latest);
    })();
  }, [user, authLoading, router]);

  const handleBegin = useCallback(() => {
    if (user && hasShape) {
      router.push("/home");
    } else {
      router.push("/begin");
    }
  }, [user, hasShape, router]);
  const [appState, setAppState] = useState<AppState>("landing");
  const [operatorName, setOperatorName] = useState("");
  const [operatorLocation, setOperatorLocation] = useState("");

  const { savedConvo, clearSaved } = useMapPersistence();

  const onConversationComplete = useCallback(() => {
    setAppState("generating");
    generateMap();
  }, []); // generateMap added below via ref pattern

  const conversation = useConversation({
    operatorName,
    operatorLocation,
    onComplete: onConversationComplete,
  });

  const mapGen = useMapGeneration({
    contextRef: conversation.contextRef,
    operatorName,
    operatorLocation,
  });

  const { generateMap } = mapGen;

  // Wire the circular dependency: onConversationComplete needs generateMap
  // We use a ref-stable callback by keeping generateMap in the closure
  // The useConversation hook calls onComplete which triggers generateMap
  // This is safe because generateMap is stable (useCallback with contextRef)

  // Derive state from mapGen
  const effectiveState: AppState = mapGen.isGenerating
    ? "generating"
    : (appState === "generating" && mapGen.mapMarkdown)
      ? "map"
      : appState;

  // ─── Landing ───
  if (effectiveState === "landing") {
    return (
      <LandingView
        savedConvo={savedConvo}
        onStart={handleBegin}
        onResume={(saved) => {
          conversation.resumeConversation(saved);
          setOperatorName(saved.operatorName);
          setOperatorLocation(saved.operatorLocation);
          setAppState("conversation");
        }}
        onClearSaved={clearSaved}
      />
    );
  }

  // ─── Welcome ───
  if (effectiveState === "welcome") {
    return (
      <WelcomeView
        operatorName={operatorName}
        operatorLocation={operatorLocation}
        onNameChange={setOperatorName}
        onLocationChange={setOperatorLocation}
        onSubmit={(name, location) => {
          conversation.startConversation(name, location);
          setAppState("conversation");
        }}
        onBack={() => setAppState("landing")}
      />
    );
  }

  // ─── Generating ───
  if (effectiveState === "generating") {
    return (
      <GeneratingView
        generatingLong={mapGen.generatingLong}
        generatingError={mapGen.generatingError}
        onRetry={() => generateMap()}
        onBack={() => setAppState("conversation")}
      />
    );
  }

  // ─── Map ───
  if (effectiveState === "map" && mapGen.mapMarkdown) {
    return (
      <MapView
        mapMarkdown={mapGen.mapMarkdown}
        mapCanvasData={mapGen.mapCanvasData}
        operatorName={operatorName}
        contextSnapshot={conversation.contextSnapshot}
        onBack={() => setAppState("conversation")}
      />
    );
  }

  // Derive completion from underlying appState (not effectiveState, which has been narrowed)
  const isConversationComplete = appState === "generating" || !!mapGen.mapMarkdown;
  const mapUrl = mapGen.mapMarkdown ? `/map/sample` : undefined;

  // ─── Conversation (default) ───
  return (
    <ConversationView
      messages={conversation.messages}
      currentPhase={conversation.currentPhase}
      isLoading={conversation.isLoading}
      streamingContent={conversation.streamingContent}
      lastError={conversation.lastError}
      contextSnapshot={conversation.contextSnapshot}
      contextToast={conversation.contextToast}
      onSend={conversation.sendMessage}
      onRetry={conversation.handleRetry}
      onExit={() => setAppState("landing")}
      canvasData={conversation.canvasDataSnapshot}
      completedPhases={conversation.completedPhases}
      phaseTransitions={conversation.phaseTransitions}
      operatorName={operatorName}
      operatorLocation={operatorLocation}
      isComplete={isConversationComplete}
      mapUrl={mapUrl}
      isGeneratingMap={mapGen.isGenerating}
    />
  );
}
