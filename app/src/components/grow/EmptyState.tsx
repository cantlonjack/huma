"use client";

export default function EmptyState({ onAddAspiration }: { onAddAspiration: () => void }) {
  return (
    <div className="py-12 px-6 text-center">
      {/* Simple seed icon */}
      <div className="w-14 h-14 rounded-full bg-sage-100 mx-auto mb-4 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22V12M12 12C12 9 14 6 18 4C14 6 12 9 12 12ZM12 12C12 9 10 6 6 4C10 6 12 9 12 12Z"
            stroke="var(--color-sage-500)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-serif text-sage-700 text-xl leading-[1.3] mb-2">
        Patterns emerge from your aspirations.
      </p>
      <p className="font-sans text-sage-400 text-sm leading-normal max-w-[280px] mx-auto mb-4">
        As you check off behaviors on your production sheet, HUMA will surface the patterns that hold your days together.
      </p>
      <button
        onClick={onAddAspiration}
        className="font-sans cursor-pointer text-sm text-amber-600 bg-transparent border-none underline underline-offset-2 p-0"
      >
        Add an aspiration
      </button>
    </div>
  );
}
