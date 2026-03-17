"use client";

interface EssenceCoreProps {
  name: string;
  land: string;
  phrase: string;
}

export default function EssenceCore({ name, land, phrase }: EssenceCoreProps) {
  return (
    <div className="text-center my-10 relative">
      {/* Breathing sage glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full opacity-50 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-sage-200) 0%, transparent 70%)",
          animation: "essence-breathe 6s ease-in-out infinite",
        }}
      />

      <h1 className="relative z-[1] font-serif text-[2.2rem] font-normal text-earth-900 leading-[1.15] -tracking-[0.01em]">
        {name}
      </h1>
      <p className="relative z-[1] font-serif text-[1.15rem] font-light italic text-sage-600 mt-1">
        & {land}
      </p>
      <p className="relative z-[1] font-serif text-[0.95rem] font-light italic text-earth-400 mt-4 max-w-[360px] mx-auto leading-[1.6]">
        &ldquo;{phrase}&rdquo;
      </p>
    </div>
  );
}
