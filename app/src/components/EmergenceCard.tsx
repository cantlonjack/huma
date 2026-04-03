"use client";

import { useState } from "react";
import type { EmergingBehavior, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";

interface EmergenceCardProps {
  behaviors: EmergingBehavior[];
  onFormalize: (behavior: EmergingBehavior, name: string) => void;
  onDismiss: (behaviorKey: string) => void;
}

export default function EmergenceCard({
  behaviors,
  onFormalize,
  onDismiss,
}: EmergenceCardProps) {
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [formalizingKey, setFormalizingKey] = useState<string | null>(null);
  const [patternName, setPatternName] = useState("");

  if (behaviors.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Section header — italic Cormorant Garamond on sand-100 */}
      <div
        style={{
          background: "#F6F1E9",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
      >
        <p
          className="font-serif"
          style={{
            fontSize: "17px",
            fontStyle: "italic",
            color: "var(--color-sage-500)",
            lineHeight: "1.3",
          }}
        >
          Something forming&hellip;
        </p>
      </div>

      {behaviors.map((b) => {
        const isRevealed = revealedKey === b.behaviorKey;
        const isFormalizing = formalizingKey === b.behaviorKey;

        return (
          <div
            key={b.behaviorKey}
            style={{
              background: "#F6F1E9",
              border: "1px solid #EDE6D8",
              borderRadius: "12px",
              marginBottom: "8px",
              overflow: "hidden",
              transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Collapsed: mysterious teaser */}
            <button
              onClick={() => setRevealedKey(isRevealed ? null : b.behaviorKey)}
              className="cursor-pointer"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  className="font-serif"
                  style={{
                    fontSize: "15px",
                    fontStyle: "italic",
                    color: "var(--color-sage-700)",
                    lineHeight: "1.3",
                  }}
                >
                  {isRevealed ? b.behaviorName : "A pattern is forming"}
                </p>
                {!isRevealed && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "12px",
                      color: "var(--color-sage-400)",
                      marginTop: "2px",
                    }}
                  >
                    {b.completedDays} of {b.totalDays} days
                  </p>
                )}
              </div>
              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transform: isRevealed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                  flexShrink: 0,
                  marginLeft: "8px",
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="var(--color-sage-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Revealed: behavior details + formalize/dismiss */}
            {isRevealed && (
              <div
                style={{
                  padding: "0 16px 14px",
                  animation: "emergenceReveal 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {/* Consistency bar */}
                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      height: "4px",
                      borderRadius: "2px",
                      background: "#EDE6D8",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round((b.completedDays / b.totalDays) * 100)}%`,
                        height: "100%",
                        borderRadius: "2px",
                        background: "var(--color-sage-400)",
                        transition: "width 400ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                  </div>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "11px",
                      color: "var(--color-sage-400)",
                      marginTop: "4px",
                    }}
                  >
                    {b.completedDays} of {b.totalDays} days — consistent enough to name
                  </p>
                </div>

                {/* Dimensions touched */}
                {b.dimensions.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    {b.dimensions.map((dim: DimensionKey) => (
                      <span
                        key={dim}
                        className="font-sans"
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: DIMENSION_COLORS[dim],
                          background: `${DIMENSION_COLORS[dim]}18`,
                          borderRadius: "4px",
                          padding: "2px 6px",
                        }}
                      >
                        {DIMENSION_LABELS[dim]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Formalize input */}
                {isFormalizing ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={patternName}
                      onChange={(e) => setPatternName(e.target.value)}
                      placeholder="Name this pattern"
                      autoFocus
                      className="font-serif"
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        fontStyle: "italic",
                        padding: "8px 12px",
                        border: "1px solid #DDD4C0",
                        borderRadius: "8px",
                        background: "white",
                        color: "var(--color-sage-700)",
                        outline: "none",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && patternName.trim()) {
                          onFormalize(b, patternName.trim());
                          setFormalizingKey(null);
                          setRevealedKey(null);
                          setPatternName("");
                        }
                        if (e.key === "Escape") {
                          setFormalizingKey(null);
                          setPatternName("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (patternName.trim()) {
                          onFormalize(b, patternName.trim());
                          setFormalizingKey(null);
                          setRevealedKey(null);
                          setPatternName("");
                        }
                      }}
                      disabled={!patternName.trim()}
                      className="font-sans cursor-pointer"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: patternName.trim() ? "white" : "var(--color-sage-300)",
                        background: patternName.trim() ? "var(--color-sage-700)" : "#EDE6D8",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        transition: "all 200ms ease",
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setFormalizingKey(b.behaviorKey);
                        setPatternName("");
                      }}
                      className="font-sans cursor-pointer"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-sage-700)",
                        background: "white",
                        border: "1px solid #DDD4C0",
                        borderRadius: "8px",
                        padding: "8px 14px",
                      }}
                    >
                      Name it
                    </button>
                    <button
                      onClick={() => {
                        onDismiss(b.behaviorKey);
                        setRevealedKey(null);
                      }}
                      className="font-sans cursor-pointer"
                      style={{
                        fontSize: "13px",
                        color: "var(--color-sage-400)",
                        background: "none",
                        border: "none",
                        padding: "8px 10px",
                      }}
                    >
                      Not yet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes emergenceReveal {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
