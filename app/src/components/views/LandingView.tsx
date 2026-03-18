"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { type Phase, PHASES } from "@/engine/types";
import { type SavedConversation } from "@/lib/persistence";
import "./landing.css";

const DIMS = [
  { n: "Body", c: "#3A5A40", v1: 38 },
  { n: "People", c: "#5C7A62", v1: 42 },
  { n: "Money", c: "#B5621E", v1: 28 },
  { n: "Home", c: "#2E6B8A", v1: 62 },
  { n: "Growth", c: "#8A6D1E", v1: 55 },
  { n: "Joy", c: "#A04040", v1: 32 },
  { n: "Purpose", c: "#3A5A40", v1: 60 },
  { n: "Identity", c: "#8BAF8E", v1: 65 },
];

const BLOB_EMPTY =
  "M100,100 L100,100 L100,100 L100,100 L100,100 L100,100 L100,100 L100,100 Z";
const BLOB_FULL =
  "M100,38 L130,52 L148,80 L142,112 L124,136 L94,142 L66,128 L54,96 L58,66 L78,46 Z";

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
  const heroShapeRef = useRef<HTMLDivElement>(null);
  const demoStageRef = useRef<HTMLDivElement>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoStepRef = useRef(-1);

  // ── Scroll reveal ──
  useEffect(() => {
    const els = document.querySelectorAll(".rv");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Hero parallax ──
  useEffect(() => {
    const hs = heroShapeRef.current;
    if (!hs) return;
    let tick = false;
    const onScroll = () => {
      if (!tick) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          hs.style.opacity = String(Math.max(0, 1 - y / 600));
          hs.style.transform = `translate(-50%,calc(-52% + ${y * 0.15}px)) scale(${1 - y * 0.0002})`;
          tick = false;
        });
        tick = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Demo animation ──
  const runDemoStep = useCallback((step: number) => {
    const stage = demoStageRef.current;
    if (!stage) return;

    const msgs = [
      stage.querySelector("#dm0"),
      stage.querySelector("#dm1"),
      stage.querySelector("#dm2"),
    ] as HTMLElement[];
    const dots = stage.parentElement?.querySelectorAll(
      ".demo-pdot"
    ) as NodeListOf<HTMLElement>;
    const blob = stage.querySelector("#demoBlob") as SVGPathElement;
    const score = stage.querySelector("#demoScore") as SVGTextElement;
    const label = stage.querySelector("#demoLabel") as SVGTextElement;
    const cascade = stage.querySelector("#demoCascade") as HTMLElement;

    dots?.forEach((d) => d.classList.remove("active"));
    if (dots?.[step]) dots[step].classList.add("active");

    if (step === 0) {
      msgs.forEach((m) => m?.classList.remove("vis"));
      blob?.setAttribute("d", BLOB_EMPTY);
      score?.setAttribute("opacity", "0");
      label?.setAttribute("opacity", "0");
      DIMS.forEach((_, i) => {
        const fill = stage.querySelector(`#df${i}`) as HTMLElement;
        const val = stage.querySelector(`#dv${i}`) as HTMLElement;
        if (fill) fill.style.width = "0%";
        if (val) {
          val.textContent = "—";
          val.classList.remove("low");
        }
      });
      cascade?.classList.remove("vis");
      ["cc0", "cc1", "cc2", "ca0", "ca1"].forEach((id) => {
        stage.querySelector(`#${id}`)?.classList.remove("vis");
      });
      setTimeout(() => msgs[0]?.classList.add("vis"), 200);
    }

    if (step === 1) {
      blob?.setAttribute("d", BLOB_FULL);
      score?.setAttribute("opacity", "1");
      label?.setAttribute("opacity", "1");
      DIMS.forEach((d, i) => {
        setTimeout(() => {
          const fill = stage.querySelector(`#df${i}`) as HTMLElement;
          const val = stage.querySelector(`#dv${i}`) as HTMLElement;
          if (fill) fill.style.width = d.v1 + "%";
          if (val) {
            val.textContent = String(d.v1);
            if (d.v1 < 40) val.classList.add("low");
          }
        }, i * 80);
      });
    }

    if (step === 2) {
      msgs[1]?.classList.add("vis");
    }

    if (step === 3) {
      msgs[2]?.classList.add("vis");
      cascade?.classList.add("vis");
      setTimeout(
        () => stage.querySelector("#cc0")?.classList.add("vis"),
        200
      );
      setTimeout(
        () => stage.querySelector("#ca0")?.classList.add("vis"),
        400
      );
      setTimeout(
        () => stage.querySelector("#cc1")?.classList.add("vis"),
        600
      );
      setTimeout(
        () => stage.querySelector("#ca1")?.classList.add("vis"),
        800
      );
      setTimeout(
        () => stage.querySelector("#cc2")?.classList.add("vis"),
        1000
      );
    }
  }, []);

  useEffect(() => {
    const stage = demoStageRef.current;
    if (!stage) return;

    const advance = () => {
      demoStepRef.current = (demoStepRef.current + 1) % 4;
      runDemoStep(demoStepRef.current);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !demoIntervalRef.current) {
            demoStepRef.current = -1;
            advance();
            demoIntervalRef.current = setInterval(advance, 3500);
          }
          if (!e.isIntersecting && demoIntervalRef.current) {
            clearInterval(demoIntervalRef.current);
            demoIntervalRef.current = null;
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(stage);
    return () => {
      obs.disconnect();
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [runDemoStep]);

  return (
    <div className="landing">
      {/* Grain overlay */}
      <div className="landing-grain" />

      {/* ═══ HERO ═══ */}
      <section className="landing-hero">
        <div className="hero-shape" ref={heroShapeRef}>
          <svg viewBox="0 0 520 520" fill="none">
            <defs>
              <radialGradient id="sg" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#8BAF8E" stopOpacity=".18" />
                <stop offset="40%" stopColor="#A8C4AA" stopOpacity=".1" />
                <stop offset="100%" stopColor="#C4D9C6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="cg" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#3A5A40" stopOpacity=".08" />
                <stop offset="100%" stopColor="#3A5A40" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="260" cy="260" r="240" stroke="#C4D9C6" strokeWidth=".5" opacity=".3" />
            <circle cx="260" cy="260" r="180" stroke="#C4D9C6" strokeWidth=".5" opacity=".25" />
            <circle cx="260" cy="260" r="120" stroke="#A8C4AA" strokeWidth=".5" opacity=".3" />
            <circle cx="260" cy="260" r="60" stroke="#8BAF8E" strokeWidth=".5" opacity=".35" />
            <line x1="260" y1="20" x2="260" y2="500" stroke="#C4D9C6" strokeWidth=".5" opacity=".2" />
            <line x1="20" y1="260" x2="500" y2="260" stroke="#C4D9C6" strokeWidth=".5" opacity=".2" />
            <line x1="90" y1="90" x2="430" y2="430" stroke="#C4D9C6" strokeWidth=".5" opacity=".15" />
            <line x1="430" y1="90" x2="90" y2="430" stroke="#C4D9C6" strokeWidth=".5" opacity=".15" />
            <path
              d="M260,72 C310,88 378,128 404,186 C428,240 420,310 390,362 C356,418 298,448 244,440 C188,432 138,394 110,340 C80,282 78,218 104,162 C132,104 196,70 260,72 Z"
              fill="url(#sg)" stroke="#8BAF8E" strokeWidth="1" opacity=".7"
            >
              <animate
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                values="M260,72 C310,88 378,128 404,186 C428,240 420,310 390,362 C356,418 298,448 244,440 C188,432 138,394 110,340 C80,282 78,218 104,162 C132,104 196,70 260,72 Z;M260,68 C316,84 384,122 408,182 C434,246 424,316 394,366 C358,422 294,452 240,446 C184,438 132,398 106,344 C76,286 74,214 100,158 C128,98 200,66 260,68 Z;M260,72 C310,88 378,128 404,186 C428,240 420,310 390,362 C356,418 298,448 244,440 C188,432 138,394 110,340 C80,282 78,218 104,162 C132,104 196,70 260,72 Z"
              />
            </path>
            <circle cx="260" cy="72" r="4" fill="#3A5A40" opacity=".5" />
            <circle cx="404" cy="186" r="4" fill="#5C7A62" opacity=".5" />
            <circle cx="420" cy="310" r="4" fill="#B5621E" opacity=".5" />
            <circle cx="298" cy="448" r="4" fill="#2E6B8A" opacity=".5" />
            <circle cx="110" cy="340" r="4" fill="#8A6D1E" opacity=".5" />
            <circle cx="80" cy="218" r="4" fill="#A04040" opacity=".5" />
            <circle cx="132" cy="104" r="4" fill="#3A5A40" opacity=".5" />
            <circle cx="244" cy="440" r="4" fill="#8BAF8E" opacity=".5" />
            <circle cx="260" cy="260" r="80" fill="url(#cg)" />
          </svg>
        </div>
        <div className="hero-content">
          <div className="landing-wm">HUMA</div>
          <h1>
            Everything in your life
            <br />
            is <em>connected.</em>
            <br />
            Now you can <em>see how.</em>
          </h1>
          <p className="hero-sub">
            HUMA maps your whole situation — money, energy, relationships,
            purpose, all of it — and shows you the specific moves that change
            everything.
          </p>
          <div className="cta-wrap">
            <button onClick={onStart} className="landing-cta">
              Begin <span className="cta-arrow">→</span>
            </button>
            <a href="/map/sample" className="hero-secondary">
              See a sample map
            </a>
          </div>
        </div>
        <div className="scroll-cue">
          <span>Scroll</span>
          <div className="scroll-cue-line" />
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="landing-problem">
        <div className="problem-inner">
          <h2 className="rv">
            You already know
            <br />
            <em>something is off.</em>
          </h2>
          <p className="problem-text rv rv-d1">
            You track your sleep in one app. Your budget in another. Your goals
            in a journal. Your relationships… in your head.
          </p>
          <p className="problem-text rv rv-d2">
            You can <strong>feel</strong> they&apos;re connected. When money is
            tight, you don&apos;t sleep. When you don&apos;t sleep, you&apos;re
            distant. When you&apos;re distant, everything suffers.
          </p>
          <p className="problem-text rv rv-d3">
            But nothing shows you the pattern. So you fix one thing at a time
            and wonder why it never holds.
          </p>
          <p className="problem-kicker rv rv-d4">
            What if you could see the whole picture — and know exactly where to
            start?
          </p>
        </div>
      </section>

      {/* ═══ DEMO ═══ */}
      <section className="landing-demo">
        <div className="section-inner">
          <div className="demo-label rv">See it in action</div>
          <h2 className="rv rv-d1">
            One check-in. The whole <em>picture.</em>
          </h2>
          <p className="demo-sub rv rv-d2">
            Watch how HUMA turns what you&apos;re feeling into a map of
            what&apos;s actually happening — and what to do about it.
          </p>

          <div className="demo-stage rv rv-d3" ref={demoStageRef}>
            <div className="demo-topbar">
              <div className="demo-topbar-dot" />
              <div className="demo-topbar-dot" />
              <div className="demo-topbar-dot" />
              <div className="demo-topbar-title">HUMA</div>
            </div>
            <div className="demo-body">
              {/* Conversation */}
              <div className="demo-conv">
                <div className="demo-msg user" id="dm0">
                  I can&apos;t sleep. Money keeps me up at night. I feel like
                  I&apos;m failing at everything and I&apos;m distant from the
                  people I love.
                </div>
                <div className="demo-msg huma" id="dm1">
                  <div className="insight-tag">✦ Connection found</div>
                  Your <strong>money stress</strong> isn&apos;t separate from
                  your sleep or your relationship. They&apos;re the same system
                  under pressure. Right now, financial uncertainty is draining
                  your Body and pulling you away from People.
                </div>
                <div className="demo-msg huma" id="dm2">
                  <div className="action-tag">⚡ Try this tonight</div>
                  Write down every recurring expense. Star the ones that bring
                  genuine joy. <strong>Don&apos;t make decisions yet.</strong>{" "}
                  Just naming it will give your nervous system something
                  concrete to hold onto instead of a fog.
                </div>
              </div>
              {/* Shape + dims */}
              <div className="demo-shape-area">
                <svg viewBox="0 0 200 200" fill="none">
                  <defs>
                    <radialGradient id="dg" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#8BAF8E" stopOpacity=".25" />
                      <stop offset="100%" stopColor="#3A5A40" stopOpacity=".05" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="76" stroke="#C4D9C6" strokeWidth=".5" opacity=".3" strokeDasharray="3 4" />
                  <circle cx="100" cy="100" r="50" stroke="#C4D9C6" strokeWidth=".5" opacity=".25" strokeDasharray="3 4" />
                  <circle cx="100" cy="100" r="25" stroke="#A8C4AA" strokeWidth=".5" opacity=".3" strokeDasharray="3 4" />
                  <path
                    id="demoBlob"
                    d={BLOB_EMPTY}
                    fill="url(#dg)"
                    stroke="#5C7A62"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    style={{ transition: "d 1.4s cubic-bezier(.22,1,.36,1)" }}
                  />
                  <text
                    x="100"
                    y="97"
                    textAnchor="middle"
                    fontFamily="Cormorant Garamond,serif"
                    fontSize="18"
                    fill="#3A5A40"
                    id="demoScore"
                    opacity="0"
                    style={{ transition: "opacity .8s" }}
                  >
                    48
                  </text>
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fontFamily="Source Sans 3,sans-serif"
                    fontSize="7"
                    fill="#A89E90"
                    letterSpacing="1.5"
                    id="demoLabel"
                    opacity="0"
                    style={{ transition: "opacity .8s" }}
                  >
                    COHERENCE
                  </text>
                </svg>
                <div className="demo-dims">
                  {DIMS.map((d, i) => (
                    <div className="demo-dim" key={d.n}>
                      <div className="demo-dim-name">{d.n}</div>
                      <div className="demo-dim-track">
                        <div
                          className="demo-dim-fill"
                          id={`df${i}`}
                          style={{ width: "0%", background: d.c }}
                        />
                      </div>
                      <div className="demo-dim-val" id={`dv${i}`}>
                        —
                      </div>
                    </div>
                  ))}
                </div>
                <div className="demo-cascade" id="demoCascade">
                  <span className="casc-chip amber" id="cc0">
                    💰 Money clarity
                  </span>
                  <span className="casc-arr" id="ca0">
                    →
                  </span>
                  <span className="casc-chip sage" id="cc1">
                    😴 Better sleep
                  </span>
                  <span className="casc-arr" id="ca1">
                    →
                  </span>
                  <span className="casc-chip sky" id="cc2">
                    💞 Present again
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="demo-progress">
            <div className="demo-pdot active" />
            <div className="demo-pdot" />
            <div className="demo-pdot" />
            <div className="demo-pdot" />
          </div>
        </div>
      </section>

      {/* ═══ HOW ═══ */}
      <section className="landing-how">
        <div className="how-label rv">Three modes, one system</div>
        <div className="how-grid">
          <div className="how-card rv rv-d1">
            <div className="how-num">01</div>
            <div className="how-title">
              <em>Design</em>
            </div>
            <div className="how-pain">
              You know what you want but not how to get there.
            </div>
            <div className="how-solve">
              A conversation maps who you are, what you&apos;re reaching for,
              and what your situation affords. You receive a living canvas —
              your whole context, with real numbers and a clear starting point.
            </div>
          </div>
          <div className="how-card rv rv-d2">
            <div className="how-num">02</div>
            <div className="how-title">
              <em>Operate</em>
            </div>
            <div className="how-pain">
              Plans fall apart because life doesn&apos;t hold still.
            </div>
            <div className="how-solve">
              Daily and weekly guidance that validates your life against your
              own vision. When something drifts, HUMA diagnoses the system —
              not you. 30 seconds each morning. 10 minutes on Sunday.
            </div>
          </div>
          <div className="how-card rv rv-d3">
            <div className="how-num">03</div>
            <div className="how-title">
              <em>Evolve</em>
            </div>
            <div className="how-pain">
              Every tool resets. Nothing remembers what you&apos;ve learned.
            </div>
            <div className="how-solve">
              Seasonal reviews update your map as you grow. What you discover
              enriches the system for everyone who comes after. The more lives
              lived through it, the wiser it gets.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTRAST ═══ */}
      <section className="landing-contrast">
        <div className="contrast-label rv">The difference</div>
        <div className="contrast-grid rv rv-d1">
          <div className="contrast-col before">
            <div className="contrast-col-title">
              <span style={{ fontSize: ".9rem" }}>○</span> Without HUMA
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">—</span>
              <div className="contrast-text">
                Five apps that don&apos;t talk to each other
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">—</span>
              <div className="contrast-text">
                Generic advice for generic people
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">—</span>
              <div className="contrast-text">
                Fix one thing, another breaks
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">—</span>
              <div className="contrast-text">
                Every setback feels personal
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">—</span>
              <div className="contrast-text">
                You can feel the connections but can&apos;t see them
              </div>
            </div>
          </div>
          <div className="contrast-col after">
            <div className="contrast-col-title">
              <span style={{ fontSize: ".9rem" }}>●</span> With HUMA
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">→</span>
              <div className="contrast-text">
                <strong>One living map</strong> that sees everything
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">→</span>
              <div className="contrast-text">
                <strong>Specific moves</strong> for your exact situation
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">→</span>
              <div className="contrast-text">
                <strong>One action</strong> that ripples across everything
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">→</span>
              <div className="contrast-text">
                Setbacks are <strong>signals to read</strong>, not failures
              </div>
            </div>
            <div className="contrast-item">
              <span className="contrast-icon">→</span>
              <div className="contrast-text">
                The connections are{" "}
                <strong>visible, mapped, and actionable</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CANVAS PREVIEW ═══ */}
      <section className="canvas-sec">
        <div className="section-inner">
          <h2 className="rv">
            This is what a <em>life</em> looks like
            <br />
            when you can finally <em>see it</em>
          </h2>
          <p className="canvas-sec-sub rv rv-d1">
            A real map generated by HUMA. Every circle, every connection, every
            number — drawn from one conversation.
          </p>
          <a href="/map/sample" className="canvas-frame rv rv-d2">
            <svg viewBox="0 0 680 400" fill="none">
              <rect width="680" height="400" rx="0" fill="#FAF8F3" />
              {/* Rings */}
              <circle cx="340" cy="165" r="130" fill="none" stroke="#C4D9C6" strokeWidth=".5" opacity=".2" strokeDasharray="3 4" />
              <circle cx="340" cy="165" r="80" fill="none" stroke="#A8C4AA" strokeWidth=".5" opacity=".3" strokeDasharray="3 4" />
              <circle cx="340" cy="165" r="35" fill="none" stroke="#8BAF8E" strokeWidth=".5" opacity=".35" strokeDasharray="3 4" />
              {/* Essence */}
              <circle cx="340" cy="165" r="28" fill="#EBF3EC" stroke="#8BAF8E" strokeWidth="1" />
              <text x="340" y="162" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="10" fill="#3A5A40" fontWeight="500">Sarah Chen</text>
              <text x="340" y="174" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#8C8274">Rogue Valley, OR</text>
              {/* QoL nodes */}
              <rect x="246" y="95" width="88" height="19" rx="9" fill="#EBF3EC" stroke="#C4D9C6" strokeWidth=".75" />
              <text x="290" y="107" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#3A5A40">Evenings free by 4</text>
              <rect x="410" y="112" width="82" height="19" rx="9" fill="#EBF3EC" stroke="#C4D9C6" strokeWidth=".75" />
              <text x="451" y="124" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#3A5A40">Creative mornings</text>
              <rect x="190" y="152" width="78" height="19" rx="9" fill="#EBF3EC" stroke="#C4D9C6" strokeWidth=".75" />
              <text x="229" y="164" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#3A5A40">Debt-free by &apos;28</text>
              {/* Production nodes */}
              <rect x="285" y="58" width="72" height="18" rx="9" fill="#FFF4EC" stroke="#F0DCC8" strokeWidth=".75" />
              <text x="321" y="70" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#B5621E">Food growing</text>
              <rect x="436" y="78" width="62" height="18" rx="9" fill="#FFF4EC" stroke="#F0DCC8" strokeWidth=".75" />
              <text x="467" y="90" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#B5621E">Teaching</text>
              <rect x="170" y="112" width="60" height="18" rx="9" fill="#FFF4EC" stroke="#F0DCC8" strokeWidth=".75" />
              <text x="200" y="124" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#B5621E">Healing</text>
              {/* Connection lines */}
              <line x1="290" y1="114" x2="312" y2="145" stroke="#A8C4AA" strokeWidth=".5" opacity=".4" />
              <line x1="410" y1="121" x2="368" y2="150" stroke="#A8C4AA" strokeWidth=".5" opacity=".3" />
              <line x1="268" y1="161" x2="312" y2="162" stroke="#A8C4AA" strokeWidth=".5" opacity=".3" />
              <line x1="321" y1="76" x2="330" y2="137" stroke="#F0DCC8" strokeWidth=".5" opacity=".3" />
              {/* Capital circles */}
              <circle cx="200" cy="270" r="18" fill="#EBF3EC" stroke="#8BAF8E" strokeWidth=".75" opacity=".7" />
              <text x="200" y="273" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#5C7A62">Social</text>
              <circle cx="250" cy="262" r="22" fill="#EBF3EC" stroke="#8BAF8E" strokeWidth=".75" opacity=".7" />
              <text x="250" y="265" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="7" fill="#5C7A62">Living</text>
              <circle cx="306" cy="268" r="12" fill="#FFF4EC" stroke="#F0DCC8" strokeWidth=".75" opacity=".7" />
              <text x="306" y="271" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="5.5" fill="#B5621E">Fin.</text>
              <circle cx="350" cy="260" r="16" fill="#E8F2F7" stroke="#C8DEE8" strokeWidth=".75" opacity=".7" />
              <text x="350" y="263" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6" fill="#2E6B8A">Intell.</text>
              <circle cx="400" cy="268" r="20" fill="#EBF3EC" stroke="#A8C4AA" strokeWidth=".75" opacity=".7" />
              <text x="400" y="271" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#5C7A62">Exper.</text>
              <circle cx="454" cy="264" r="14" fill="#EBF3EC" stroke="#C4D9C6" strokeWidth=".75" opacity=".6" />
              <text x="454" y="267" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6" fill="#5C7A62">Spirit.</text>
              <circle cx="496" cy="270" r="11" fill="#FFF4EC" stroke="#F0DCC8" strokeWidth=".75" opacity=".6" />
              <text x="496" y="273" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="5.5" fill="#B5621E">Cult.</text>
              {/* Enterprise cards */}
              <rect x="40" y="310" width="145" height="62" rx="8" fill="white" stroke="#DDD4C0" strokeWidth=".75" />
              <rect x="40" y="310" width="3" height="62" rx="1.5" fill="#3A5A40" />
              <text x="52" y="326" fontFamily="Source Sans 3,sans-serif" fontSize="8" fill="#1A1714" fontWeight="500">No-Dig Market Garden</text>
              <text x="52" y="338" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#8C8274">Foundation · 0.25 acres · 18hrs/wk peak</text>
              <rect x="52" y="349" width="38" height="13" rx="6" fill="#EBF3EC" />
              <text x="71" y="358" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#3A5A40">$24-38k</text>
              <rect x="200" y="310" width="145" height="62" rx="8" fill="white" stroke="#DDD4C0" strokeWidth=".75" />
              <rect x="200" y="310" width="3" height="62" rx="1.5" fill="#B5621E" />
              <text x="212" y="326" fontFamily="Source Sans 3,sans-serif" fontSize="8" fill="#1A1714" fontWeight="500">Pastured Layers</text>
              <text x="212" y="338" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#8C8274">Partner · 200 hens · 6hrs/wk</text>
              <rect x="212" y="349" width="38" height="13" rx="6" fill="#EBF3EC" />
              <text x="231" y="358" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#3A5A40">$12-18k</text>
              <rect x="360" y="310" width="145" height="62" rx="8" fill="white" stroke="#DDD4C0" strokeWidth=".75" />
              <rect x="360" y="310" width="3" height="62" rx="1.5" fill="#2E6B8A" />
              <text x="372" y="326" fontFamily="Source Sans 3,sans-serif" fontSize="8" fill="#1A1714" fontWeight="500">On-Farm Education</text>
              <text x="372" y="338" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#8C8274">Multiplier · Workshops · 4hrs/wk</text>
              <rect x="372" y="349" width="38" height="13" rx="6" fill="#EBF3EC" />
              <text x="391" y="358" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#3A5A40">$8-15k</text>
              <rect x="520" y="310" width="125" height="62" rx="8" fill="white" stroke="#DDD4C0" strokeWidth=".75" />
              <rect x="520" y="310" width="3" height="62" rx="1.5" fill="#8A6D1E" />
              <text x="532" y="326" fontFamily="Source Sans 3,sans-serif" fontSize="8" fill="#1A1714" fontWeight="500">Silvopasture</text>
              <text x="532" y="338" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#8C8274">Long-game · 2 acres · 3hrs/wk</text>
              <rect x="532" y="349" width="38" height="13" rx="6" fill="#EBF3EC" />
              <text x="551" y="358" textAnchor="middle" fontFamily="Source Sans 3,sans-serif" fontSize="6.5" fill="#3A5A40">$4-8k</text>
            </svg>
            <div className="canvas-overlay">
              <div className="canvas-overlay-btn">
                Explore Sarah&apos;s full canvas →
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ═══ SIGNAL ═══ */}
      <section className="landing-signal">
        <div className="signal-inner rv">
          <div className="signal-tags">
            <span className="signal-tag">Holistic Management</span>
            <span className="signal-tag">Living Systems</span>
            <span className="signal-tag">8 Forms of Capital</span>
            <span className="signal-tag">Pattern Language</span>
            <span className="signal-tag">Regenerative Design</span>
            <span className="signal-tag">Knowledge Architecture</span>
          </div>
          <p className="signal-note">
            Built on 30 years of research across regenerative agriculture,
            living systems theory, developmental psychology, and knowledge
            architecture. Not another wellness app. A design tool for living
            systems.
          </p>
        </div>
      </section>

      {/* ═══ VISION ═══ */}
      <section className="landing-vision">
        <div className="vision-content rv">
          <p className="vision-text">
            Imagine if everyone just knew the best way to go about anything,
            based on their context. And by actually living that life, they in
            turn helped everyone else.
          </p>
          <button onClick={onStart} className="vision-cta">
            Start your map <span className="cta-arrow">→</span>
          </button>
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
            {phaseLabel(savedConvo.phase)} · {formatTimeAgo(savedConvo.savedAt)}
          </span>
          <button
            className="saved-bar-resume"
            onClick={() => onResume(savedConvo)}
          >
            Continue your map →
          </button>
          <button
            className="saved-bar-dismiss"
            onClick={() => setShowSaved(false)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
