"use client";

interface ReviewInsightProps {
  text: string;
  streaming: boolean;
}

export default function ReviewInsight({ text, streaming }: ReviewInsightProps) {
  if (!text && streaming) {
    return (
      <div className="flex items-center gap-2 py-8">
        <span className="inline-block w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
        <span className="inline-block w-2 h-2 rounded-full bg-sage-400 animate-pulse [animation-delay:150ms]" />
        <span className="inline-block w-2 h-2 rounded-full bg-sage-400 animate-pulse [animation-delay:300ms]" />
      </div>
    );
  }

  return (
    <div className="prose-huma">
      <div className="font-serif text-[17px] text-earth-800 leading-relaxed whitespace-pre-wrap">
        {text}
        {streaming && (
          <span className="inline-block w-0.5 h-5 bg-sage-500 ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>
    </div>
  );
}
