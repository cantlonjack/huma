"use client";

import { useState } from "react";

interface MorningBriefingProps {
  mapId: string;
  operatorName: string;
}

export default function MorningBriefing({ mapId, operatorName }: MorningBriefingProps) {
  const [briefingText, setBriefingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(false);

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const fetchBriefing = async () => {
    setLoading(true);
    setStreaming(true);
    setError(false);
    setBriefingText("");

    try {
      const response = await fetch("/api/operate/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapId }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setBriefingText(fullText);
      }

      setStreaming(false);
      setLoading(false);
    } catch {
      setError(true);
      setStreaming(false);
      setLoading(false);
    }
  };

  // Not yet loaded
  if (!briefingText && !loading) {
    return (
      <div className="border border-sand-200 rounded-lg p-6">
        <p className="text-xs uppercase tracking-wide text-earth-400 mb-2">
          {dayName}, {dateStr}
        </p>
        <p className="font-serif text-lg text-earth-800 mb-4">
          Morning, {operatorName}.
        </p>
        <button
          onClick={fetchBriefing}
          className="px-5 py-2.5 text-sm bg-sage-600 text-white rounded-full hover:bg-sage-700 transition-all font-medium"
        >
          Get today&apos;s briefing
        </button>
      </div>
    );
  }

  return (
    <div className="border border-sand-200 rounded-lg p-6">
      <p className="text-xs uppercase tracking-wide text-earth-400 mb-4">
        {dayName}, {dateStr}
      </p>
      {error ? (
        <div>
          <p className="text-earth-600 mb-4">Couldn&apos;t load your briefing.</p>
          <button
            onClick={fetchBriefing}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="font-serif text-[17px] text-earth-800 leading-relaxed whitespace-pre-wrap">
          {briefingText}
          {streaming && (
            <span className="inline-block w-0.5 h-5 bg-sage-500 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>
      )}
    </div>
  );
}
