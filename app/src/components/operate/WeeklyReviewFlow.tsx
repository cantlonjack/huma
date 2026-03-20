"use client";

import { useState } from "react";
import type { ValidationCheck, QoLNode } from "@/engine/canvas-types";
import QoLCheckForm from "./QoLCheckForm";
import ReviewInsight from "./ReviewInsight";

type Stage = "check-in" | "insight" | "complete";

interface WeeklyReviewFlowProps {
  mapId: string;
  operatorName: string;
  location: string;
  validationChecks: ValidationCheck[];
  qolNodes: (string | QoLNode)[];
}

export default function WeeklyReviewFlow({
  mapId,
  operatorName,
  location,
  validationChecks,
  qolNodes,
}: WeeklyReviewFlowProps) {
  const [stage, setStage] = useState<Stage>("check-in");
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [insightText, setInsightText] = useState("");
  const [streaming, setStreaming] = useState(false);

  // If no validation checks exist, show graceful message
  const hasChecks = validationChecks.length > 0;

  const handleSubmit = async (qolResponses: Record<number, string>) => {
    setResponses(qolResponses);
    setStage("insight");
    setStreaming(true);

    try {
      const response = await fetch("/api/operate/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapId,
          qolResponses: validationChecks.map((check, i) => ({
            qolStatement: check.qolStatement,
            question: check.question,
            target: check.target,
            answer: qolResponses[i] || "",
          })),
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
        fullText += decoder.decode(value, { stream: true });
        setInsightText(fullText);
      }

      setStreaming(false);
      setStage("complete");
    } catch (error) {
      console.error("Review failed:", error);
      setStreaming(false);
      setInsightText("Something went wrong. Your check-in data was captured but the AI insight failed to generate. Try again later.");
      setStage("complete");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-sand-200 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <a
          href="/operate"
          className="text-sm text-earth-400 hover:text-earth-600 transition-colors"
        >
          &larr; Back
        </a>
        <span className="text-sm uppercase tracking-[0.3em] text-sage-600 font-medium">
          HUMA
        </span>
        <span className="text-xs text-earth-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-10 pb-20">
        {!hasChecks ? (
          // No validation checks — map needs operational design phase
          <div className="text-center py-16">
            <p className="font-serif text-xl text-earth-700 mb-3">
              Not quite ready yet
            </p>
            <p className="text-earth-500 mb-8 max-w-sm mx-auto leading-relaxed">
              This map doesn&apos;t have validation checks yet. Complete the
              Operational Design phase in your Design Mode conversation
              to set up your QoL tracking.
            </p>
            <a
              href="/"
              className="px-6 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all"
            >
              Return to conversation
            </a>
          </div>
        ) : (
          <>
            {/* Greeting */}
            <p className="font-serif text-2xl text-earth-900 mb-1">
              Hey {operatorName}.
            </p>
            <p className="text-earth-600 mb-10">
              End of another week. Quick check-in.
            </p>

            {/* Stage 1: QoL Check-In */}
            {stage === "check-in" && (
              <QoLCheckForm
                validationChecks={validationChecks}
                onSubmit={handleSubmit}
              />
            )}

            {/* Stage 2: AI Insight (streaming) */}
            {(stage === "insight" || stage === "complete") && (
              <>
                {/* Show quick summary of their responses */}
                <div className="mb-8 pb-8 border-b border-sand-200">
                  <p className="text-xs uppercase tracking-wide text-earth-400 mb-3">Your week</p>
                  <div className="space-y-2">
                    {validationChecks.map((check, i) => (
                      <div key={i} className="flex items-baseline justify-between text-sm">
                        <span className="text-earth-600 truncate mr-4">{check.qolStatement}</span>
                        <span className="text-earth-900 font-medium shrink-0">
                          {responses[i] || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <ReviewInsight
                  text={insightText}
                  streaming={streaming}
                />

                {stage === "complete" && (
                  <div className="mt-10 text-center">
                    <a
                      href="/operate"
                      className="px-8 py-3 bg-sage-600 text-white font-medium rounded-full hover:bg-sage-700 transition-all"
                    >
                      Done
                    </a>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
