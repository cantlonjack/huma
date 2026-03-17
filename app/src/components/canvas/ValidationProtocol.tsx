import type { ValidationCheck } from "@/engine/canvas-types";

interface ValidationProtocolProps {
  checks: ValidationCheck[];
}

const CARD_ACCENTS = [
  "border-l-sage-500",
  "border-l-amber-500",
  "border-l-sky",
  "border-l-rose",
  "border-l-gold",
  "border-l-lilac",
];

export default function ValidationProtocol({ checks }: ValidationProtocolProps) {
  return (
    <div className="w-full max-w-[760px] mx-auto">
      <p className="font-sans text-[0.85rem] font-light text-earth-500 leading-[1.6] italic mb-4 text-center max-w-[560px] mx-auto">
        These aren&apos;t goals to hit &mdash; they&apos;re signals to read. When a check comes back
        below target two weeks running, the question is always: what could change in the design?
      </p>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`bg-white border border-sand-200 border-l-[3px] ${CARD_ACCENTS[i % CARD_ACCENTS.length]} rounded-lg p-4 transition-all duration-300 hover:border-sage-300 hover:shadow-[0_2px_12px_rgba(58,90,64,0.06)]`}
          >
            <p className="font-serif text-[0.95rem] font-medium text-earth-900 leading-[1.3] mb-2">
              &ldquo;{check.qolStatement}&rdquo;
            </p>
            <div className="font-sans text-[0.75rem] text-earth-600 leading-[1.5] mb-1.5">
              <span className="font-semibold text-[0.65rem] tracking-[0.06em] uppercase text-sage-600 block mb-0.5">
                Weekly check
              </span>
              {check.question}
            </div>
            <div className="font-sans text-[0.75rem] text-earth-600 leading-[1.5] mb-1.5">
              <span className="font-semibold text-[0.65rem] tracking-[0.06em] uppercase text-sage-600 block mb-0.5">
                Target
              </span>
              {check.target}
            </div>
            <div className="font-sans text-[0.75rem] font-light text-earth-500 leading-[1.5] italic pt-2 border-t border-sand-200">
              {check.failureResponse}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
