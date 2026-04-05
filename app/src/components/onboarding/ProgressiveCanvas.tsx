"use client";

import { useEffect, useState } from "react";
import { type Phase, type ProgressiveCanvasData, PHASES } from "@/engine/types";

const ROLE_COLORS: Record<string, string> = {
  foundation: "#3A5A40",
  anchor: "#B5621E",
  partner: "#5C7A62",
  multiplier: "#2E6B8A",
  "long-game": "#8A6D1E",
};

const CAPITAL_TINTS: Record<number, { fill: string; stroke: string }> = {
  0: { fill: "#EBF3EC", stroke: "#8BAF8E" },
  1: { fill: "#FFF4EC", stroke: "#F0DCC8" },
  2: { fill: "#E8F2F7", stroke: "#C8DEE8" },
  3: { fill: "#EBF3EC", stroke: "#A8C4AA" },
  4: { fill: "#FFF4EC", stroke: "#E8935A" },
  5: { fill: "#E8F2F7", stroke: "#2E6B8A" },
  6: { fill: "#EBF3EC", stroke: "#C4D9C6" },
  7: { fill: "#FFF4EC", stroke: "#8A6D1E" },
};

interface ProgressiveCanvasProps {
  completedPhases: Phase[];
  canvasData: Partial<ProgressiveCanvasData>;
  isThinking: boolean;
  isComplete: boolean;
  operatorName: string;
  operatorLocation: string;
  mapUrl?: string;
  isGeneratingMap?: boolean;
}

export default function ProgressiveCanvas({
  completedPhases,
  canvasData,
  isThinking,
  isComplete,
  operatorName,
  operatorLocation,
  mapUrl,
  isGeneratingMap,
}: ProgressiveCanvasProps) {
  const [celebrated, setCelebrated] = useState(false);

  const hasPhase = (p: Phase) => completedPhases.includes(p);
  const phaseIndex = (p: Phase) => PHASES.findIndex((ph) => ph.id === p);

  // Celebration trigger
  useEffect(() => {
    if (isComplete && !celebrated) {
      const timer = setTimeout(() => setCelebrated(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, celebrated]);

  const showEssence = hasPhase("ikigai");
  const showNodes = hasPhase("holistic-context");
  const showCapitals = hasPhase("landscape");
  const showEnterprises = hasPhase("enterprise-map");
  const showCascade = hasPhase("nodal-interventions");
  const showRhythm = hasPhase("operational-design");

  const essence = canvasData.essence;
  const isPending = (p: Phase) => hasPhase(p) && !getDataForPhase(p);

  function getDataForPhase(p: Phase): boolean {
    switch (p) {
      case "ikigai": return !!canvasData.essence;
      case "holistic-context": return !!(canvasData.qolNodes || canvasData.productionNodes);
      case "landscape": return !!canvasData.capitalProfile;
      case "enterprise-map": return !!canvasData.enterprises;
      case "nodal-interventions": return !!canvasData.interventions;
      case "operational-design": return !!canvasData.weeklyRhythm;
      default: return false;
    }
  }

  // Pill positions in arcs
  function pillArc(items: string[], cx: number, cy: number, radiusX: number, radiusY: number, startAngle: number, endAngle: number) {
    return items.map((text, i) => {
      const t = items.length === 1 ? 0.5 : i / (items.length - 1);
      const angle = startAngle + t * (endAngle - startAngle);
      const x = cx + radiusX * Math.cos(angle);
      const y = cy + radiusY * Math.sin(angle);
      return { text, x, y, delay: i * 50 };
    });
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-sand-50 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="absolute"
        style={{
          top: "25%", left: "50%", transform: "translate(-50%, -50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, var(--color-sage-100) 0%, transparent 70%)",
          opacity: 0.3, pointerEvents: "none",
        }}
      />

      <svg
        viewBox="0 0 600 700"
        className="w-full h-full max-h-full"
        style={{ maxWidth: 600 }}
      >
        {/* ═══ EMPTY STATE: HUMA wordmark ═══ */}
        {!showEssence && (
          <text
            x="300" y="350"
            textAnchor="middle"
            fontFamily="var(--font-serif)"
            fontSize="14"
            fontWeight="500"
            letterSpacing="6"
            fill="#8BAF8E"
            opacity="0.2"
          >
            HUMA
          </text>
        )}

        {/* ═══ PHASE 1: Essence Core ═══ */}
        {showEssence && (
          <g
            className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ transformOrigin: "300px 180px" }}
          >
            {/* Breathing glow */}
            <circle
              cx="300" cy="180" r="50"
              fill="none"
              stroke="#8BAF8E"
              strokeWidth="0.5"
              opacity="0.2"
              strokeDasharray="3 4"
            />
            <circle
              cx="300" cy="180" r="80"
              fill="none"
              stroke="#C4D9C6"
              strokeWidth="0.5"
              opacity="0.15"
              strokeDasharray="3 4"
            />
            <circle
              cx="300" cy="180" r="44"
              fill="url(#essenceGlow)"
              className={isThinking ? "animate-[canvas-breathe-fast_3s_ease-in-out_infinite]" : "animate-[canvas-breathe_6s_ease-in-out_infinite]"}
              style={{ transformOrigin: "300px 180px" }}
            />
            {/* Core circle */}
            <circle cx="300" cy="180" r="36" fill="#EBF3EC" stroke="#8BAF8E" strokeWidth="1.5" />
            <text x="300" y={essence?.phrase ? 174 : 178} textAnchor="middle" fontFamily="var(--font-serif)" fontSize="13" fill="#2A4A30" fontWeight="500">
              {essence?.name || operatorName}
            </text>
            <text x="300" y="192" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8" fill="#8C8274">
              {essence?.location || operatorLocation}
            </text>
            {essence?.phrase && (
              <text x="300" y="228" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="8.5" fill="#5C7A62" fontStyle="italic" opacity="0.8">
                {essence.phrase.length > 45 ? essence.phrase.slice(0, 42) + "..." : essence.phrase}
              </text>
            )}
          </g>
        )}

        {/* Gradient defs */}
        <defs>
          <radialGradient id="essenceGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#8BAF8E" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8BAF8E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ═══ PHASE 2: QoL / Production / Resource nodes ═══ */}
        {showNodes && !isPending("holistic-context") && canvasData.qolNodes && (
          <g>
            {/* QoL pills - arc above */}
            {pillArc(canvasData.qolNodes, 300, 180, 140, -90, -Math.PI * 0.8, -Math.PI * 0.2).map(({ text, x, y, delay }) => (
              <g key={`qol-${text}`} className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
                <line x1="300" y1="180" x2={x} y2={y} stroke="#C4D9C6" strokeWidth="0.5" opacity="0.25" />
                <rect x={x - 44} y={y - 10} width="88" height="20" rx="10" fill="#EBF3EC" stroke="#C4D9C6" strokeWidth="0.75" />
                <text x={x} y={y + 4} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="7" fill="#3A5A40">
                  {text.length > 18 ? text.slice(0, 16) + "..." : text}
                </text>
              </g>
            ))}
            {/* Production pills - right */}
            {canvasData.productionNodes && pillArc(canvasData.productionNodes, 300, 180, 150, 70, -Math.PI * 0.1, Math.PI * 0.35).map(({ text, x, y, delay }) => (
              <g key={`prod-${text}`} className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ animationDelay: `${delay + 200}ms`, opacity: 0 }}>
                <line x1="300" y1="180" x2={x} y2={y} stroke="#F0DCC8" strokeWidth="0.5" opacity="0.25" />
                <rect x={x - 38} y={y - 9} width="76" height="18" rx="9" fill="#FFF4EC" stroke="#F0DCC8" strokeWidth="0.75" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="7" fill="#B5621E">
                  {text.length > 14 ? text.slice(0, 12) + "..." : text}
                </text>
              </g>
            ))}
            {/* Resource pills - left */}
            {canvasData.resourceNodes && pillArc(canvasData.resourceNodes, 300, 180, 150, 70, Math.PI * 0.65, Math.PI * 1.1).map(({ text, x, y, delay }) => (
              <g key={`res-${text}`} className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ animationDelay: `${delay + 400}ms`, opacity: 0 }}>
                <line x1="300" y1="180" x2={x} y2={y} stroke="#C8DEE8" strokeWidth="0.5" opacity="0.25" />
                <rect x={x - 38} y={y - 9} width="76" height="18" rx="9" fill="#E8F2F7" stroke="#C8DEE8" strokeWidth="0.75" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="7" fill="#2E6B8A">
                  {text.length > 14 ? text.slice(0, 12) + "..." : text}
                </text>
              </g>
            ))}
          </g>
        )}
        {/* Phase 2 pending state */}
        {isPending("holistic-context") && (
          <g className="animate-[pending-pulse_2s_ease-in-out_infinite]">
            {[0, 1, 2].map((i) => {
              const angle = -Math.PI * 0.8 + i * (Math.PI * 0.3);
              const x = 300 + 140 * Math.cos(angle);
              const y = 180 - 90 * Math.sin(angle);
              return <rect key={i} x={x - 40} y={y - 10} width="80" height="20" rx="10" fill="none" stroke="#C4D9C6" strokeWidth="0.75" opacity="0.3" />;
            })}
          </g>
        )}

        {/* ═══ PHASE 3: Capital Profile ═══ */}
        {showCapitals && !isPending("landscape") && canvasData.capitalProfile && (
          <g>
            {canvasData.capitalProfile.map((cap, i) => {
              const x = 80 + (i * 440) / (canvasData.capitalProfile!.length - 1 || 1);
              const r = 10 + cap.score * 3.5;
              const tint = CAPITAL_TINTS[i % 8];
              return (
                <g key={cap.form} className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                  <circle cx={x} cy="320" r={r} fill={tint.fill} stroke={tint.stroke} strokeWidth="0.75" opacity="0.7" />
                  <text x={x} y="323" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="6" fill="#5C7A62">
                    {cap.form.slice(0, 6)}
                  </text>
                </g>
              );
            })}
          </g>
        )}
        {isPending("landscape") && (
          <g className="animate-[pending-pulse_2s_ease-in-out_infinite]">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle key={i} cx={80 + i * 63} cy="320" r="14" fill="none" stroke="#C4D9C6" strokeWidth="0.75" opacity="0.3" />
            ))}
          </g>
        )}

        {/* ═══ PHASE 4: Enterprise Cards ═══ */}
        {showEnterprises && !isPending("enterprise-map") && canvasData.enterprises && (
          <g>
            {canvasData.enterprises.map((ent, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const x = col === 0 ? 40 : 310;
              const y = 370 + row * 55;
              const color = ROLE_COLORS[ent.role] || "#5C7A62";
              return (
                <g key={ent.name} className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>
                  <rect x={x} y={y} width="250" height="45" rx="8" fill="white" stroke="#DDD4C0" strokeWidth="0.75" />
                  <rect x={x} y={y} width="3" height="45" rx="1.5" fill={color} />
                  <text x={x + 14} y={y + 16} fontFamily="var(--font-sans)" fontSize="8.5" fill="#1A1714" fontWeight="500">
                    {ent.name.length > 26 ? ent.name.slice(0, 24) + "..." : ent.name}
                  </text>
                  <text x={x + 14} y={y + 28} fontFamily="var(--font-sans)" fontSize="6.5" fill="#8C8274">
                    {ent.role} · {ent.year1Revenue}
                  </text>
                </g>
              );
            })}
          </g>
        )}
        {isPending("enterprise-map") && (
          <g className="animate-[pending-pulse_2s_ease-in-out_infinite]">
            {[0, 1].map((i) => (
              <rect key={i} x={i === 0 ? 40 : 310} y="370" width="250" height="45" rx="8" fill="none" stroke="#DDD4C0" strokeWidth="0.75" opacity="0.3" />
            ))}
          </g>
        )}

        {/* ═══ PHASE 5: Cascade Indicators ═══ */}
        {showCascade && !isPending("nodal-interventions") && canvasData.interventions && (
          <g>
            {canvasData.interventions.slice(0, 2).map((intv, idx) => {
              const baseY = 540 + idx * 28;
              return (
                <g key={intv.action} className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ animationDelay: `${idx * 200}ms`, opacity: 0 }}>
                  {intv.cascadeSteps.slice(0, 4).map((step, si) => {
                    const sx = 80 + si * 130;
                    return (
                      <g key={step}>
                        {si > 0 && (
                          <line x1={sx - 48} y1={baseY} x2={sx - 16} y2={baseY} stroke="#A8C4AA" strokeWidth="1" opacity="0.4"
                            strokeDasharray="80"
                            strokeDashoffset="80"
                            style={{ animation: `cascadeDraw 0.8s ${si * 0.15}s forwards` }}
                          />
                        )}
                        <circle cx={sx} cy={baseY} r="8" fill="#EBF3EC" stroke="#8BAF8E" strokeWidth="0.75" />
                        <text x={sx} y={baseY + 3} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="6" fill="#3A5A40" fontWeight="600">
                          {si + 1}
                        </text>
                        <text x={sx} y={baseY + 16} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="5.5" fill="#8C8274">
                          {step.length > 16 ? step.slice(0, 14) + "..." : step}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        )}

        {/* ═══ PHASE 6: Weekly Rhythm ═══ */}
        {showRhythm && !isPending("operational-design") && canvasData.weeklyRhythm && (
          <g className="animate-[canvasEnter_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]" style={{ opacity: 0 }}>
            {canvasData.weeklyRhythm.slice(0, 7).map((day, i) => {
              const dx = 70 + i * 70;
              return (
                <g key={day.day}>
                  <text x={dx} y="635" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="6" fill="#A89E90">
                    {day.day.slice(0, 3)}
                  </text>
                  {day.blocks.slice(0, 3).map((block, bi) => (
                    <rect
                      key={bi}
                      x={dx - 12}
                      y={642 + bi * 14}
                      width="24"
                      height="10"
                      rx="2"
                      fill={block.color || "#C4D9C6"}
                      opacity="0.6"
                    />
                  ))}
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* ═══ Completion overlay ═══ */}
      {isComplete && celebrated && (
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center animate-[landing-fadeUp_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]">
          <p className="text-sm text-earth-500 mb-3 font-serif italic">Your canvas is ready</p>
          {isGeneratingMap ? (
            <div className="flex items-center gap-2 text-sm text-sage-500">
              <div className="w-2 h-2 rounded-full bg-sage-400 animate-[typing-pulse_1.5s_ease-in-out_infinite]" />
              Preparing your full canvas...
            </div>
          ) : mapUrl ? (
            <a
              href={mapUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-500 transition-all hover:shadow-lg"
            >
              Explore your full canvas <span>→</span>
            </a>
          ) : (
            <p className="text-xs text-earth-400">View conversation summary</p>
          )}
        </div>
      )}

      <style>{`
        @keyframes canvasEnter {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes cascadeDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
