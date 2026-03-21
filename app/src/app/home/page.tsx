"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { fetchLatestShape, fetchTodaysPulse, fetchPreviousShape, type SavedShape } from "@/lib/shapes";
import ShapeRadar from "@/components/shape/ShapeRadar";
import DailyPulse from "@/components/shape/DailyPulse";
import OneThing, { hasRespondedToday } from "@/components/shape/OneThing";
import type { DimensionKey } from "@/types/shape";

type Tab = "map" | "day" | "journey";

const TAB_LABELS: Record<Tab, string> = {
  map: "Your Map",
  day: "Your Day",
  journey: "Your Journey",
};

const TAB_ORDER: Tab[] = ["map", "day", "journey"];

// Icons for mobile bottom nav
function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" />
      <circle cx="11" cy="11" r="4" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" />
      <line x1="11" y1="2" x2="11" y2="7" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" />
      <line x1="11" y1="15" x2="11" y2="20" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" />
    </svg>
  );
}

function DayIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="5" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" />
      <line x1="11" y1="2" x2="11" y2="5" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="17" x2="11" y2="20" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="5" y2="11" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="11" x2="20" y2="11" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function JourneyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 18L8 4L14 14L18 6" stroke={active ? "#3A5A40" : "#A09080"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TAB_ICONS: Record<Tab, React.ComponentType<{ active: boolean }>> = {
  map: MapIcon,
  day: DayIcon,
  journey: JourneyIcon,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [shape, setShape] = useState<SavedShape | null>(null);
  const [shapeLoading, setShapeLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("map");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Fetch latest shape
  useEffect(() => {
    if (!user) return;

    (async () => {
      const latest = await fetchLatestShape();
      if (!latest) {
        // No shape — redirect to builder
        router.replace("/begin");
        return;
      }
      setShape(latest);
      setShapeLoading(false);

      // Default to "Your Day" on return visits
      const hasVisited = localStorage.getItem("huma-home-visited");
      if (hasVisited) {
        setActiveTab("day");
      } else {
        localStorage.setItem("huma-home-visited", "1");
      }
    })();
  }, [user, router]);

  if (loading || shapeLoading || !user) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <p className="font-serif text-earth-400 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col">
      {/* Header — desktop */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-sand-200">
        {/* HUMA wordmark */}
        <p className="font-serif text-sage-600 tracking-[0.3em] text-sm font-medium uppercase">
          HUMA
        </p>

        {/* Tab bar */}
        <nav className="flex gap-8">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-sans text-sm pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-sage-700 border-sage-700"
                  : "text-earth-500 border-transparent hover:text-earth-700"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        {/* Spacer for balance */}
        <div className="w-12" />
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 md:px-12 md:py-12 pb-24 md:pb-12">
        {activeTab === "map" && shape && <MapTab shape={shape} />}
        {activeTab === "day" && shape && <DayTab shape={shape} onShapeUpdate={setShape} />}
        {activeTab === "journey" && shape && <JourneyTab shape={shape} />}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sand-50 border-t border-sand-200 flex justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {TAB_ORDER.map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-4 py-1 ${
                activeTab === tab ? "text-sage-700" : "text-earth-500"
              }`}
            >
              <Icon active={activeTab === tab} />
              <span className="text-xs font-sans">{TAB_LABELS[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// === TAB COMPONENTS ===

function MapTab({ shape }: { shape: SavedShape }) {
  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <ShapeRadar
        shape={shape.dimensions}
        size={320}
        labels
        breathing
        className="mx-auto"
      />
      <p className="mt-8 font-sans text-earth-400 text-sm text-center leading-relaxed max-w-sm">
        Your full map will appear here after we talk.
      </p>
    </div>
  );
}

type DayPhase = "loading" | "pulse" | "onething" | "resting";

interface OneThingData {
  action: string;
  connectsTo: DimensionKey[];
  leverDimension: DimensionKey;
}

function DayTab({ shape, onShapeUpdate }: { shape: SavedShape; onShapeUpdate: (s: SavedShape) => void }) {
  const [phase, setPhase] = useState<DayPhase>("loading");
  const [oneThingData, setOneThingData] = useState<OneThingData | null>(null);
  const [oneThingLoading, setOneThingLoading] = useState(false);
  const [previousShape, setPreviousShape] = useState<SavedShape | null>(null);
  const [switchToMap, setSwitchToMap] = useState(false);

  // Determine initial phase on mount
  useEffect(() => {
    (async () => {
      // Check if already pulsed today
      const todaysPulse = await fetchTodaysPulse();
      if (todaysPulse) {
        // Already pulsed — check one-thing response
        const { responded } = hasRespondedToday();
        if (responded) {
          setPhase("resting");
        } else {
          // Need to fetch or show one-thing
          setPhase("onething");
          fetchOneThing(todaysPulse.dimensions);
        }
      } else {
        // Need to pulse
        const prev = await fetchPreviousShape();
        setPreviousShape(prev);
        setPhase("pulse");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOneThing = useCallback(async (currentDims: Record<DimensionKey, number>) => {
    setOneThingLoading(true);
    try {
      const prev = previousShape ?? await fetchPreviousShape();
      const res = await fetch("/api/one-thing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentShape: currentDims,
          previousShape: prev?.dimensions ?? null,
        }),
      });

      if (res.ok) {
        const data: OneThingData = await res.json();
        setOneThingData(data);
      } else {
        // API failed — go to resting state rather than blocking
        setPhase("resting");
      }
    } catch {
      setPhase("resting");
    } finally {
      setOneThingLoading(false);
    }
  }, [previousShape]);

  const handlePulseComplete = useCallback(
    (savedPulse: SavedShape) => {
      onShapeUpdate(savedPulse);
      setPhase("onething");
      fetchOneThing(savedPulse.dimensions);
    },
    [onShapeUpdate, fetchOneThing]
  );

  const handleOneThingRespond = useCallback(() => {
    setPhase("resting");
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="font-serif text-earth-400 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (phase === "pulse") {
    return <DailyPulse latestShape={shape} onComplete={handlePulseComplete} />;
  }

  if (phase === "onething") {
    if (oneThingLoading || !oneThingData) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="font-serif text-earth-400 text-lg animate-pulse">
            Reading your shape...
          </p>
        </div>
      );
    }
    return <OneThing data={oneThingData} onRespond={handleOneThingRespond} />;
  }

  // Resting state
  return (
    <div className="flex flex-col items-center max-w-lg mx-auto py-12">
      <p className="font-serif text-earth-600 text-lg text-center mb-6">
        You're set for today. See you tomorrow.
      </p>
      <button
        onClick={() => setSwitchToMap(true)}
        className="font-sans text-sm text-sage-600 hover:text-sage-500 transition-colors"
      >
        See my shape
      </button>
      {switchToMap && (
        <div className="mt-8">
          <ShapeRadar
            shape={shape.dimensions}
            size={280}
            labels
            breathing
            className="mx-auto"
          />
        </div>
      )}
    </div>
  );
}

function JourneyTab({ shape }: { shape: SavedShape }) {
  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <p className="font-serif text-earth-700 text-lg mb-6 text-center">
        Your journey starts here.
      </p>
      <div className="flex items-center gap-4">
        <ShapeRadar
          shape={shape.dimensions}
          size={120}
          className="opacity-80"
        />
        <div>
          <p className="font-sans text-earth-600 text-sm font-medium">
            First shape
          </p>
          <p className="font-sans text-earth-400 text-xs">
            {formatDate(shape.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
