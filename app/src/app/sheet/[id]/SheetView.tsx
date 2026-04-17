import Link from "next/link";
import { DIMENSION_COLORS, DIMENSION_LABELS, type DimensionKey } from "@/types/v2";

export interface SharedEntry {
  behaviorKey: string;
  headline: string;
  detailText?: string;
  dimensions?: string[];
  timeOfDay?: string;
  connectionNote?: string;
  because?: string;
}

export interface SharedSheet {
  id: string;
  date: string;
  operatorName: string;
  opening: string;
  throughLine: string;
  stateSentence: string;
  entries: SharedEntry[];
  movedDimensions: string[];
  dayCount: number | null;
  createdAt: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function entryAccent(dims: string[] | undefined): string {
  const first = (dims && dims[0]) as DimensionKey | undefined;
  if (first && DIMENSION_COLORS[first]) return DIMENSION_COLORS[first];
  return DIMENSION_COLORS.body;
}

export default function SheetView({ sheet }: { sheet: SharedSheet }) {
  const movedSet = new Set(sheet.movedDimensions);
  const allDims = Array.from(
    new Set([
      ...sheet.entries.flatMap((e) => e.dimensions || []),
      ...sheet.movedDimensions,
    ]),
  );

  const heading = sheet.operatorName
    ? `${sheet.operatorName}\u2019s day`
    : "A day on HUMA";

  return (
    <div className="min-h-dvh bg-sand-50">
      <div className="mx-auto max-w-[620px] px-5 pt-10 pb-24">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em]">
            H U M A
          </span>
          <span className="font-sans text-earth-400 text-[11px] tracking-wide">
            {formatDate(sheet.date)}
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-ink-700 text-[28px] leading-tight mb-2">
          {heading}
        </h1>
        <p className="font-sans text-earth-400 text-[12px] tracking-wide mb-6">
          A shared daily sheet
        </p>

        {/* Dimension ring */}
        {allDims.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {allDims.map((d) => {
              const moved = movedSet.has(d);
              return (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-2.5 py-1 text-[11px] font-sans text-ink-500"
                  style={{ opacity: moved ? 1 : 0.75 }}
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{
                      background: DIMENSION_COLORS[d as DimensionKey] || "#5C7A62",
                      opacity: moved ? 1 : 0.55,
                    }}
                  />
                  {DIMENSION_LABELS[d as DimensionKey] || d}
                </span>
              );
            })}
          </div>
        )}

        {/* Opening letter */}
        {sheet.opening && (
          <p className="font-serif text-ink-700 text-[17px] leading-relaxed mb-4">
            {sheet.opening}
          </p>
        )}

        {/* State sentence as secondary */}
        {!sheet.opening && sheet.stateSentence && (
          <p className="font-serif text-ink-600 text-[17px] leading-relaxed mb-4">
            {sheet.stateSentence}
          </p>
        )}

        {/* Through-line */}
        {sheet.throughLine && (
          <div
            className="border-l-2 pl-3.5 py-0.5 mb-6"
            style={{ borderLeftColor: "#E4B862" }}
          >
            <p className="font-serif italic text-[15px] leading-snug text-ink-600">
              {sheet.throughLine}
            </p>
          </div>
        )}

        {/* Entries */}
        <div className="flex flex-col mt-6">
          {sheet.entries.map((entry, i) => {
            const accent = entryAccent(entry.dimensions);
            return (
              <div key={entry.behaviorKey + i}>
                {i > 0 && entry.connectionNote && (
                  <p className="font-serif italic text-earth-400 text-[13px] leading-relaxed pl-[32px] py-2">
                    {entry.connectionNote}
                  </p>
                )}
                <div className="flex gap-4 py-3">
                  <span
                    className="mt-1.5 block size-2.5 flex-shrink-0 rounded-full"
                    style={{ background: accent }}
                    aria-hidden
                  />
                  <div className="flex-1">
                    <p className="font-serif text-ink-700 text-[16px] leading-snug">
                      {entry.headline}
                    </p>
                    {entry.detailText && (
                      <p className="font-sans text-earth-500 text-[13px] mt-1 leading-relaxed">
                        {entry.detailText}
                      </p>
                    )}
                    {entry.because && (
                      <p className="font-serif italic text-earth-400 text-[12px] mt-1">
                        {entry.because}
                      </p>
                    )}
                  </div>
                </div>
                {i < sheet.entries.length - 1 && !sheet.entries[i + 1]?.connectionNote && (
                  <div className="h-px bg-sage-200/40 my-1 ml-[32px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — invitation back to HUMA */}
        <div className="mt-12 pt-6 border-t border-sand-200 text-center">
          <p className="font-serif italic text-earth-500 text-[14px] mb-3">
            Every day is a move in a system. HUMA shows you which.
          </p>
          <Link
            href="/"
            className="inline-block font-sans text-[13px] text-sage-600 underline decoration-sage-300 underline-offset-[3px] hover:text-sage-700"
          >
            See your own system &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
