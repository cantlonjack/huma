"use client";

import { useMemo } from "react";
import type { HumaContext } from "@/types/context";
import type { Aspiration } from "@/types/v2";
import { profileSections, profileCompleteness } from "@/lib/life-profile-utils";
import LifeProfileSection from "./LifeProfileSection";

interface LifeProfileProps {
  humaContext: HumaContext;
  aspirations: Aspiration[];
  mode: "view" | "edit" | "filling";
  onTellMore?: (sectionId: string) => void;
  onContextSave?: (updates: Partial<HumaContext>) => void;
  onFieldEdit?: (field: string, value: string) => void;
}

export default function LifeProfile({
  humaContext,
  aspirations,
  mode,
  onTellMore,
  onFieldEdit,
}: LifeProfileProps) {
  const sections = useMemo(
    () => profileSections(humaContext, aspirations),
    [humaContext, aspirations],
  );

  const completeness = useMemo(
    () => profileCompleteness(humaContext),
    [humaContext],
  );

  const filledSections = sections.filter((s) => !s.isSparse);
  const sparseSections = sections.filter((s) => s.isSparse);

  return (
    <div className="flex flex-col gap-1">
      {/* Progress line */}
      <div className="px-1 mb-2">
        <p className="font-sans text-[11px] tracking-[0.06em] text-sage-400">
          {completeness.filled} of {completeness.total} profile sections have content
        </p>
        <div className="mt-1 h-[2px] bg-sand-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(completeness.filled / completeness.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Filled sections */}
      {filledSections.length > 0 && (
        <div className="flex flex-col gap-4">
          {filledSections.map((section) => (
            <LifeProfileSection
              key={section.id}
              section={section}
              mode={mode}
              onTellMore={onTellMore}
              onFieldEdit={onFieldEdit}
            />
          ))}
        </div>
      )}

      {/* Sparse sections */}
      {sparseSections.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {sparseSections.map((section) => (
            <LifeProfileSection
              key={section.id}
              section={section}
              mode={mode}
              onTellMore={onTellMore}
              onFieldEdit={onFieldEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
