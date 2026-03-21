"use client";

import { useState, useEffect, useRef } from "react";
import { type Phase, PHASES } from "@/engine/types";
import { type SavedConversation } from "@/lib/persistence";
import "./landing.css";

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
  return info ? `${idx + 1}/6 — ${info.label}` : "";
}

// ═══ HERO SHAPE DATA ═══
// Order: Body, People, Money, Home, Growth, Joy, Purpose, Identity
// Asymmetric — this is a REAL person's life
const HERO_DIMS = [
  { label: "Body",     angle: -90,  score: 5 },
  { label: "People",   angle: -45,  score: 4 },
  { label: "Money",    angle: 0,    score: 2 },
  { label: "Home",     angle: 45,   score: 4 },
  { label: "Growth",   angle: 90,   score: 4 },
  { label: "Joy",      angle: 135,  score: 1 },
  { label: "Purpose",  angle: 180,  score: 5 },
  { label: "Identity", angle: 225,  score: 4 },
];

// Per-vertex breathing periods (slightly different for organic feel)
const DRIFT_PERIODS = [7.0, 7.3, 6.8, 7.1, 6.9, 7.4, 7.2, 6.7];

const HERO_CX = 200;
const HERO_CY = 200;
const HERO_MAX_R = 160;

function heroPoint(angle: number, score: number, cx = HERO_CX, cy = HERO_CY, maxR = HERO_MAX_R) {
  const r = (score / 5) * maxR;
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Label positions — pushed further out from shape
function labelPos(angle: number, cx = HERO_CX, cy = HERO_CY, r = 180) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Build organic shape path with quadratic bezier curves
function buildShapePath(dims: typeof HERO_DIMS, cx = HERO_CX, cy = HERO_CY, maxR = HERO_MAX_R) {
  const points = dims.map((d) => heroPoint(d.angle, d.score, cx, cy, maxR));
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const cpx = ((curr.x + next.x) / 2).toFixed(1);
    const cpy = ((curr.y + next.y) / 2).toFixed(1);
    path += ` Q ${cpx},${cpy} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }
  return path;
}

const HERO_SHAPE_PATH = buildShapePath(HERO_DIMS);
const HERO_POINTS = HERO_DIMS.map((d) => heroPoint(d.angle, d.score));
const HERO_LABELS = HERO_DIMS.map((d) => labelPos(d.angle));

// Vertex color based on score
function vertexColor(score: number, label: string): string {
  if (label === "Joy") return "#A04040";    // rose-500 — lowest
  if (label === "Money") return "#C87A3A";  // amber-500 — medium-low
  return "#5C7A62";                         // sage-500 — strong
}

// Vertex dot radius: 5px (score 1) → 10px (score 5)
function vertexRadius(score: number): number {
  return 5 + (score - 1) * 1.25;
}

// ═══ SECTION 2 SHAPE DATA ═══
const SEC2_DIMS = [
  { label: "Body",     angle: -90,  score: 5, lx: 175, ly: 14 },
  { label: "People",   angle: -45,  score: 4, lx: 310, ly: 52 },
  { label: "Money",    angle: 0,    score: 2, lx: 318, ly: 182 },
  { label: "Home",     angle: 45,   score: 4, lx: 310, ly: 308 },
  { label: "Growth",   angle: 90,   score: 4, lx: 175, ly: 346 },
  { label: "Joy",      angle: 135,  score: 1, lx: 36,  ly: 308 },
  { label: "Purpose",  angle: 180,  score: 5, lx: 28,  ly: 182 },
  { label: "Identity", angle: 225,  score: 4, lx: 40,  ly: 52 },
];

function sec2Point(angle: number, score: number, cx = 175, cy = 175, maxR = 140) {
  const r = (score / 5) * maxR;
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const SEC2_SHAPE_PATH = (() => {
  const points = SEC2_DIMS.map((d) => sec2Point(d.angle, d.score));
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    const curr = points[i];
    const cpx = ((curr.x + next.x) / 2).toFixed(1);
    const cpy = ((curr.y + next.y) / 2).toFixed(1);
    path += ` Q ${cpx},${cpy} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }
  return path;
})();

const SEC2_POINTS = SEC2_DIMS.map((d) => sec2Point(d.angle, d.score));

interface LandingViewProps {
  savedConvo: SavedConversation | null;
  onStart: () => void;
  onResume: (saved: SavedConversation) => void;
  onClearSaved: () => void;
}

export default function LandingView({
  savedConvo,
  onStart,
  onResume,
  onClearSaved,
}: LandingViewProps) {
  const [showSaved, setShowSaved] = useState(true);
  const shapeRef = useRef<HTMLDivElement>(null);
  const [shapeActive, setShapeActive] = useState(false);
  const [shapeBreathing, setShapeBreathing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide scroll cue on first scroll
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 1) {
        setScrolled(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll reveal for .rv elements
  useEffect(() => {
    const els = document.querySelectorAll(".rv");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Section 2 shape draw-in on scroll
  useEffect(() => {
    const el = shapeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !shapeActive) {
            setShapeActive(true);
            setTimeout(() => setShapeBreathing(true), 1400);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shapeActive]);

  return (
    <div className="landing">
      <div className="landing-grain" />

      {/* ═══ SECTION 1: THE HERO — Split Composition ═══ */}
      <section className="landing-hero">
        <div className="hero-wm">HUMA</div>

        <div className="hero-split">
          {/* Left: The Living Shape */}
          <div className="hero-shape-side" aria-hidden="true">
            <div className="hero-shape-container">
              <svg viewBox="-40 -15 480 440" fill="none" className="hero-shape-svg">
                <defs>
                  <radialGradient id="heroShapeFill" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#EBF3EC" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#E0EDE1" stopOpacity="0.35" />
                  </radialGradient>
                </defs>

                {/* Faint guide rings — almost invisible */}
                <circle cx={HERO_CX} cy={HERO_CY} r={HERO_MAX_R} stroke="#C4D9C6" strokeWidth="0.5" opacity="0.03" />
                <circle cx={HERO_CX} cy={HERO_CY} r={HERO_MAX_R * 0.75} stroke="#C4D9C6" strokeWidth="0.5" opacity="0.03" />
                <circle cx={HERO_CX} cy={HERO_CY} r={HERO_MAX_R * 0.5} stroke="#C4D9C6" strokeWidth="0.5" opacity="0.03" />
                <circle cx={HERO_CX} cy={HERO_CY} r={HERO_MAX_R * 0.25} stroke="#C4D9C6" strokeWidth="0.5" opacity="0.03" />

                {/* Axis lines — draw from center outward */}
                {HERO_DIMS.map((d, i) => {
                  const end = heroPoint(d.angle, 5);
                  return (
                    <line
                      key={`axis-${i}`}
                      x1={HERO_CX} y1={HERO_CY}
                      x2={end.x} y2={end.y}
                      stroke="#C4D9C6"
                      strokeWidth="1"
                      opacity="0.2"
                      className={`hero-axis ha-${i}`}
                    />
                  );
                })}

                {/* The shape stroke — draws between vertices */}
                <path
                  d={HERO_SHAPE_PATH}
                  className="hero-shape-stroke"
                  fill="none"
                  stroke="#8BAF8E"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* The shape fill — fades in after stroke */}
                <path
                  d={HERO_SHAPE_PATH}
                  className="hero-shape-fill-path"
                  fill="url(#heroShapeFill)"
                  stroke="none"
                />

                {/* Vertex dots — scale in staggered */}
                {HERO_POINTS.map((pt, i) => (
                  <circle
                    key={`dot-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={vertexRadius(HERO_DIMS[i].score)}
                    fill={vertexColor(HERO_DIMS[i].score, HERO_DIMS[i].label)}
                    className={`hero-vertex hv-${i}`}
                  />
                ))}

                {/* Dimension labels — whisper outside the shape */}
                {HERO_DIMS.map((d, i) => {
                  const lp = HERO_LABELS[i];
                  const isStory = d.label === "Joy" || d.label === "Money";
                  return (
                    <text
                      key={`label-${i}`}
                      x={lp.x}
                      y={lp.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={`hero-dim-label hl-${i}`}
                      style={{ fill: isStory ? "#554D42" : "#8C8274" }}
                    >
                      {d.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right: The Text */}
          <div className="hero-text-side">
            <p className="hero-whisper">You can feel it.</p>
            <p className="hero-statement">
              Your sleep, your money, your relationships{"\u200A"}&mdash;{"\u200A"}they move together.
            </p>
            <p className="hero-turn">
              What if you could see the pattern?
            </p>
            <div className="hero-cta-wrap">
              <button onClick={onStart} className="landing-cta">
                See your shape <span className="cta-arrow">&rarr;</span>
              </button>
              <p className="hero-micro">8 questions. 90 seconds. Free.</p>
            </div>
          </div>
        </div>

        <div className={`hero-scroll-cue${scrolled ? " hero-scroll-hidden" : ""}`}>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* ═══ SECTION 2: THE SHAPE (contextual — scores + insight) ═══ */}
      <section className="landing-shape">
        <div
          className={`shape-inner${shapeActive ? " shape-drawing" : ""}${shapeBreathing ? " shape-breathing" : ""}`}
          ref={shapeRef}
        >
          <div className="shape-visual">
            <div className="shape-svg-wrap">
              <svg viewBox="0 0 350 350" fill="none">
                <defs>
                  <radialGradient id="shapeFill" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#8BAF8E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3A5A40" stopOpacity="0.05" />
                  </radialGradient>
                </defs>
                {/* Guide rings */}
                <circle cx="175" cy="175" r="140" stroke="#C4D9C6" strokeWidth="0.5" opacity="0.15" strokeDasharray="3 5" />
                <circle cx="175" cy="175" r="84" stroke="#C4D9C6" strokeWidth="0.5" opacity="0.12" strokeDasharray="3 5" />
                {/* Axis lines */}
                {SEC2_DIMS.map((d, i) => {
                  const end = sec2Point(d.angle, 5);
                  return (
                    <line key={i} x1="175" y1="175" x2={end.x} y2={end.y}
                      stroke="#DDD4C0" strokeWidth="0.5" opacity="0.12" />
                  );
                })}
                {/* Shape */}
                <path d={SEC2_SHAPE_PATH} className="shape-path shape-fill"
                  fill="url(#shapeFill)" stroke="#5C7A62" strokeWidth="1.5" strokeLinejoin="round" />
                {/* Vertex dots */}
                {SEC2_POINTS.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y}
                    r={SEC2_DIMS[i].score <= 1 ? 4 : SEC2_DIMS[i].score <= 2 ? 5 : SEC2_DIMS[i].score >= 4 ? 7 : 6}
                    fill={SEC2_DIMS[i].score <= 2 ? "#A04040" : "#5C7A62"}
                    className={`shape-vertex sv-${i}`} />
                ))}
                {/* Labels */}
                {SEC2_DIMS.map((d, i) => (
                  <text key={i} x={d.lx} y={d.ly} textAnchor="middle" className="shape-label"
                    style={d.score <= 2 ? { fill: "#A04040" } : undefined}>
                    {d.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="shape-text">
            <p className="shape-insight">
              Everything&apos;s strong except joy and money{"\u200A"}&mdash;{"\u200A"}and they&apos;re
              connected. When money feels tight, joy is the first thing you
              drop. But your people and your purpose are holding steady.
              That&apos;s unusual. That&apos;s an asset.
            </p>
            <div className="shape-trythis">
              <p>
                Your one lever right now: 15 minutes with your actual numbers.
                Clarity beats anxiety every time.
              </p>
            </div>
          </div>

          <div className="shape-bottom-cta rv">
            <p className="shape-bottom-time">This took 90 seconds to build.</p>
            <button onClick={onStart} className="landing-cta">
              See yours <span className="cta-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: HOW IT WORKS ═══ */}
      <section className="landing-how">
        <div className="how-inner">
          <div className="how-step rv">
            <div className="how-num">01</div>
            <div className="how-title">Answer 8 questions</div>
            <p className="how-desc">
              How does your body feel? How does money feel? Simple. Honest.
              No wrong answers.
            </p>
          </div>
          <div className="how-step rv rv-d1">
            <div className="how-num">02</div>
            <div className="how-title">See your shape</div>
            <p className="how-desc">
              Your answers become a shape{"\u200A"}&mdash;{"\u200A"}8 dimensions of your life, visible
              at a glance.
            </p>
          </div>
          <div className="how-step rv rv-d2">
            <div className="how-num">03</div>
            <div className="how-title">Get the one insight that connects everything</div>
            <p className="how-desc">
              HUMA reads the pattern between your dimensions and finds the one
              lever that moves everything.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: THE CLOSE ═══ */}
      <section className="landing-close">
        <div className="rv">
          <p className="close-tagline">
            See the whole. Find the leverage. Practice what works.
          </p>
          <button onClick={onStart} className="landing-cta">
            Begin <span className="cta-arrow">&rarr;</span>
          </button>
          <p className="close-micro">Free forever. No account needed to start.</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="footer-mark">HUMA</div>
        <div className="footer-tag">A new medium for human knowledge</div>
      </footer>

      {/* ═══ SAVED CONVERSATION ═══ */}
      {savedConvo && showSaved && (
        <div className="saved-bar">
          <span className="saved-bar-name">
            Welcome back, {savedConvo.operatorName}.
          </span>
          <span style={{ fontSize: ".72rem", color: "var(--color-earth-400)" }}>
            {phaseLabel(savedConvo.phase)} &middot; {formatTimeAgo(savedConvo.savedAt)}
          </span>
          <button className="saved-bar-resume" onClick={() => onResume(savedConvo)}>
            Continue your map &rarr;
          </button>
          <button className="saved-bar-dismiss" onClick={() => setShowSaved(false)} aria-label="Dismiss">
            &#10005;
          </button>
        </div>
      )}
    </div>
  );
}
