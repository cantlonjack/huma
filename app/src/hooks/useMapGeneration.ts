"use client";

import { useState, useCallback, useEffect } from "react";
import type { ConversationContext } from "@/engine/types";
import type { CanvasData } from "@/engine/canvas-types";
import { clearConversation } from "@/lib/persistence";
import { trackEvent } from "@/lib/analytics";

interface UseMapGenerationOptions {
  contextRef: React.RefObject<Partial<ConversationContext>>;
  operatorName: string;
  operatorLocation: string;
}

export function useMapGeneration({ contextRef, operatorName, operatorLocation }: UseMapGenerationOptions) {
  const [mapMarkdown, setMapMarkdown] = useState("");
  const [mapCanvasData, setMapCanvasData] = useState<CanvasData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLong, setGeneratingLong] = useState(false);
  const [generatingError, setGeneratingError] = useState(false);

  // "Still working" timer
  useEffect(() => {
    if (!isGenerating) {
      setGeneratingLong(false);
      return;
    }
    const timer = setTimeout(() => setGeneratingLong(true), 12000);
    return () => clearTimeout(timer);
  }, [isGenerating]);

  const generateMap = useCallback(async () => {
    setIsGenerating(true);
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

      const docReader = docResponse.body?.getReader();
      if (!docReader) throw new Error("No doc response body");
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await docReader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

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
            const cleaned = canvasText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
            canvasData = JSON.parse(cleaned);
          } catch {
            console.warn("Failed to parse canvasData JSON, falling back to document-only");
          }
        }
      }

      setMapMarkdown(fullText);
      if (canvasData) setMapCanvasData(canvasData as CanvasData);
      trackEvent("map_generation_complete");

      // Store to server
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
        mapId = crypto.randomUUID();
      }

      // Cache in localStorage
      localStorage.setItem(`huma-map-${mapId}`, JSON.stringify(mapPayload));
      clearConversation();

      const params = new URLSearchParams();
      if (syntheses.operatorName) params.set("name", syntheses.operatorName);
      if (syntheses.location) params.set("location", syntheses.location);
      if (ctx.enterprises?.selected?.length) params.set("enterprises", ctx.enterprises.selected.length.toString());
      const qs = params.toString();
      window.history.pushState(null, "", `/map/${mapId}${qs ? `?${qs}` : ""}`);

      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to generate map:", error);
      setGeneratingError(true);
      setIsGenerating(false);
    }
  }, [contextRef, operatorName, operatorLocation]);

  return {
    mapMarkdown,
    mapCanvasData,
    isGenerating,
    generatingLong,
    generatingError,
    generateMap,
  };
}
