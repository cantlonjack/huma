"use client";

import type { ChatMessage, Behavior } from "@/types/v2";
import type { DecompositionData } from "@/lib/parse-markers-v2";
import DecompositionPreview from "@/components/onboarding/DecompositionPreview";

export default function MessageBubble({
  message,
  onOptionTap,
  onConfirmBehaviors,
}: {
  message: ChatMessage & {
    options?: string[] | null;
    behaviors?: Behavior[] | null;
    actions?: string[] | null;
    decomposition?: DecompositionData | null;
  };
  onOptionTap?: (option: string) => void;
  onConfirmBehaviors?: (behaviors: Behavior[]) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3.5 leading-[1.7] ${
          isUser
            ? "bg-sand-100 text-earth-800"
            : "bg-white text-earth-800"
        }`}
      >
        <p className={`${isUser ? "font-sans" : "font-serif text-lg"} text-base whitespace-pre-wrap`}>{message.content}</p>

        {/* Tappable Options */}
        {message.options && message.options.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {message.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onOptionTap?.(opt)}
                className="text-left px-4 py-3 rounded-xl border border-sand-300 bg-sand-50 text-earth-700 font-sans text-sm hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Decomposition Preview (behaviors + actions handled together) */}
        {message.behaviors && message.behaviors.length > 0 && onConfirmBehaviors ? (
          <DecompositionPreview
            behaviors={message.behaviors}
            decomposition={message.decomposition}
            onConfirm={onConfirmBehaviors}
          />
        ) : message.behaviors && message.behaviors.length > 0 ? (
          <div className="mt-4 space-y-2">
            {message.behaviors.map((b, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sand-50 border border-sand-200">
                <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-earth-300 flex-shrink-0" />
                <div>
                  <p className="font-sans text-sm text-earth-700 font-medium">{b.text}</p>
                  {b.frequency === "specific-days" && b.days && (
                    <p className="font-sans text-xs text-earth-400 mt-0.5">
                      {b.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ")}
                    </p>
                  )}
                  {b.detail && (
                    <p className="font-sans text-xs text-earth-400 mt-0.5">{b.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
