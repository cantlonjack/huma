"use client";

import { useState } from "react";
import type { ConversationGroup } from "@/hooks/useChat";
import { relativeDate } from "@/hooks/useChat";

export function PastConversation({ group }: { group: ConversationGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-6 mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 bg-white border border-sand-300 rounded-xl cursor-pointer hover:border-sage-300 transition-colors text-left"
      >
        <span className="font-sans text-xs font-medium text-ink-300 flex-shrink-0">
          {relativeDate(group.startTime)}
        </span>
        <span className="font-sans text-[13px] text-ink-500 flex-1 truncate">
          {group.summary}
        </span>
        <span className="font-sans text-ink-300 flex-shrink-0 text-[11px]">
          ({group.messageCount})
        </span>
      </button>

      {expanded && (
        <div className="mt-2 px-1 animate-fade-in">
          {group.messages.map(msg =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end mb-3">
                <div className="ml-auto max-w-[80%] bg-sand-200 rounded-xl px-4 py-3">
                  <p className="font-sans text-ink-600 text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="mb-3 max-w-[680px]">
                <p className="font-serif text-ink-700 whitespace-pre-wrap text-base leading-[1.7]">
                  {msg.content}
                </p>
                {msg.contextExtracted && Object.keys(msg.contextExtracted).length > 0 && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-sage-50 px-3 py-1">
                    <span className="font-sans font-medium text-sage-600 text-xs">
                      Context added: {Object.entries(msg.contextExtracted).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
