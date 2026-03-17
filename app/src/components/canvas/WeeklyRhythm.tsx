import type { WeeklyRhythm as WeeklyRhythmType } from "@/engine/canvas-types";

interface WeeklyRhythmProps {
  rhythm: WeeklyRhythmType;
}

const ENTERPRISE_COLORS: Record<string, string> = {
  "Market Garden": "bg-sage-100 border-sage-200 text-sage-800",
  "Laying Hens": "bg-amber-100 border-amber-200 text-amber-700",
  "Herb Nursery": "bg-[#F5EED4] border-[#E0D4B0] text-gold",
  Workshops: "bg-lilac-light border-[#D4CDE0] text-lilac",
};

function getBlockStyle(enterprise?: string): string {
  if (!enterprise) return "bg-sand-100 border-sand-200 text-earth-600";
  for (const [key, style] of Object.entries(ENTERPRISE_COLORS)) {
    if (enterprise.toLowerCase().includes(key.toLowerCase())) return style;
  }
  return "bg-sky-light border-[#B8D4E2] text-sky";
}

function shortDay(day: string): string {
  return day.slice(0, 3);
}

export default function WeeklyRhythm({ rhythm }: WeeklyRhythmProps) {
  return (
    <div className="w-full max-w-[860px] mx-auto">
      {/* 7-day grid — wider max-width and improved responsive breakpoints */}
      <div className="grid grid-cols-7 gap-1.5 lg:gap-2 max-md:grid-cols-4 max-sm:grid-cols-2">
        {rhythm.days.map((day) => (
          <div key={day.day} className="bg-white border border-sand-200 rounded-lg p-2.5 lg:p-3 min-w-0">
            <div className="font-serif text-[0.85rem] lg:text-[0.9rem] font-medium text-earth-900 mb-0.5">
              <span className="hidden lg:inline">{day.day}</span>
              <span className="lg:hidden">{shortDay(day.day)}</span>
            </div>
            <div className="font-sans text-[0.55rem] lg:text-[0.6rem] font-semibold tracking-[0.06em] uppercase text-sage-600 mb-2 leading-tight">
              {day.focus}
            </div>
            <div className="flex flex-col gap-1">
              {day.blocks.map((block, j) => (
                <div
                  key={j}
                  className={`rounded px-1.5 lg:px-2 py-1 lg:py-1.5 border text-[0.65rem] lg:text-[0.68rem] leading-[1.4] ${getBlockStyle(block.enterprise)}`}
                >
                  <span className="font-sans font-semibold text-[0.55rem] lg:text-[0.6rem] opacity-70 block">
                    {block.time}
                  </span>
                  <span className="font-sans font-normal">
                    {block.activity}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 lg:mt-2 font-sans text-[0.55rem] lg:text-[0.6rem] font-medium text-amber-600">
              Stop: {day.hardStop}
            </div>
          </div>
        ))}
      </div>

      {/* Season notes */}
      <div className="grid grid-cols-2 gap-4 mt-4 max-sm:grid-cols-1">
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
          <h4 className="font-sans text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-sage-600 mb-1.5">
            Peak Season
          </h4>
          <p className="font-sans text-[0.85rem] font-light text-earth-600 leading-[1.6]">
            {rhythm.peakSeason}
          </p>
        </div>
        <div className="bg-sand-100 border border-sand-200 rounded-lg p-4">
          <h4 className="font-sans text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-earth-400 mb-1.5">
            Rest Season
          </h4>
          <p className="font-sans text-[0.85rem] font-light text-earth-600 leading-[1.6]">
            {rhythm.restSeason}
          </p>
        </div>
      </div>
    </div>
  );
}
