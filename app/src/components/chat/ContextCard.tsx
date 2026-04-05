"use client";

import Link from "next/link";

export function ContextCard({
  aspirationCount,
  behaviorCount,
  dayNum,
  context,
}: {
  aspirationCount: number;
  behaviorCount: number;
  dayNum: number;
  context: Record<string, unknown>;
}) {
  const parts: string[] = [];
  if (aspirationCount > 0) parts.push(`${aspirationCount} aspiration${aspirationCount > 1 ? "s" : ""}`);
  if (behaviorCount > 0) parts.push(`${behaviorCount} behaviors`);
  if (dayNum > 0) parts.push(`Day ${dayNum}`);

  // Add a couple context facts
  const ctxEntries = Object.entries(context).filter(([, v]) => v !== null && v !== undefined && v !== "");
  for (const [k, v] of ctxEntries.slice(0, 2)) {
    const label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    parts.push(`${label}: ${String(v)}`);
  }

  if (parts.length === 0) return null;

  return (
    <div className="mx-6 mt-5 p-3 rounded-xl bg-sand-100">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[13px] text-ink-500 leading-relaxed">
          {parts.join(" · ")}
        </p>
        <Link href="/whole" className="font-sans text-xs font-medium text-sage-500 whitespace-nowrap ml-2">
          see all &rarr;
        </Link>
      </div>
    </div>
  );
}
