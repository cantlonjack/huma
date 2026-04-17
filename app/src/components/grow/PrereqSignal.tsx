"use client";

import type { PortViolation } from "@/lib/graph-verification";

interface PrereqSignalProps {
  unsatisfied: PortViolation[];
}

/**
 * Surfaces unsatisfied capacity prerequisites detected by verifyLifeGraph.
 * Collapses multiple violations per RPPL into a single row per framework.
 */
export function PrereqSignal({ unsatisfied }: PrereqSignalProps) {
  if (unsatisfied.length === 0) return null;

  // Group by rpplId so each framework shows once with its missing ports listed.
  const byRppl = new Map<string, { name: string; ports: PortViolation[] }>();
  for (const v of unsatisfied) {
    const entry = byRppl.get(v.rpplId) ?? { name: v.rpplName, ports: [] };
    entry.ports.push(v);
    byRppl.set(v.rpplId, entry);
  }

  const entries = Array.from(byRppl.values());
  const blockingCount = unsatisfied.filter(v => v.severity === "blocking").length;
  const subtitle = blockingCount > 0
    ? `${blockingCount} capacity${blockingCount === 1 ? "" : " gaps"} need cultivation before these frameworks take root.`
    : "Some capacities that anchor these frameworks haven't shown up yet in how you work.";

  return (
    <div className="px-4 mb-6">
      <div className="mb-3">
        <h2 className="font-serif text-sage-700 text-lg font-normal m-0">
          Keystones not yet in place
        </h2>
        <p className="font-sans text-sage-400 text-[13px] leading-[1.4]">
          {subtitle}
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-sage-300 bg-sage-50/50 px-4 py-3.5">
        {entries.map((entry, i) => (
          <div
            key={entry.name}
            className={i > 0 ? "mt-3 pt-3 border-t border-sage-200/70" : ""}
          >
            <p className="font-serif text-[15px] text-earth-700 leading-snug m-0">
              <span className="font-medium text-ink-800">{entry.name}</span>
              {" "}leans on {entry.ports.length === 1 ? "a capacity" : "capacities"} that isn&rsquo;t showing up yet:
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-2 list-none p-0 m-0">
              {entry.ports.map(p => (
                <li
                  key={`${entry.name}:${p.port.key}`}
                  className="font-sans text-[11px] uppercase tracking-[0.12em] px-2 py-[3px] rounded-full bg-sage-100 text-sage-700"
                  title={p.reason}
                >
                  {p.port.name || p.port.key}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
