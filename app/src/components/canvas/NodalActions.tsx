import type { NodalIntervention } from "@/engine/canvas-types";

interface NodalActionsProps {
  interventions: NodalIntervention[];
}

export default function NodalActions({ interventions }: NodalActionsProps) {
  return (
    <div className="w-full max-w-[760px] mx-auto flex flex-col gap-4">
      {interventions.map((nodal, i) => (
        <div
          key={i}
          className="relative bg-gradient-to-br from-sage-50 to-sand-100 border border-sage-200 rounded-lg p-6"
        >
          {/* Number badge */}
          <div className="absolute -top-2.5 left-5 w-[22px] h-[22px] rounded-full bg-sage-700 text-white font-sans text-[0.65rem] font-semibold flex items-center justify-center">
            {i + 1}
          </div>

          {/* Header */}
          <div className="flex items-baseline gap-3 mb-2 flex-wrap">
            <span className="font-serif text-[1.15rem] font-medium text-earth-900">
              {nodal.action}
            </span>
            <span className="font-sans text-[0.72rem] font-medium text-sage-600">
              {nodal.timing}
            </span>
          </div>

          {/* Why */}
          <p className="font-sans text-[0.85rem] font-light text-earth-600 leading-[1.7] mb-4">
            {nodal.why}
          </p>

          {/* Cascade chain */}
          <div className="flex flex-wrap items-center gap-[5px]">
            {nodal.cascade.map((step, j) => (
              <span key={j} className="contents">
                {j > 0 && (
                  <span className="text-sage-300 text-[0.75rem]">&rarr;</span>
                )}
                <span className="inline-flex items-center gap-1 px-[11px] py-1 bg-white border border-sage-200 rounded-full font-sans text-[0.68rem] font-medium text-sage-800 whitespace-nowrap">
                  <span>{step.emoji}</span>
                  {step.label}
                </span>
              </span>
            ))}
          </div>

          {/* Setup for */}
          <p className="font-sans text-[0.78rem] font-light text-earth-500 italic leading-[1.6] pt-3 border-t border-sage-200 mt-3.5">
            Sets up: {nodal.setupFor}
          </p>
        </div>
      ))}
    </div>
  );
}
