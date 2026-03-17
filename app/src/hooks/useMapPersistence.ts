"use client";

import { useState, useEffect } from "react";
import { type SavedConversation, loadConversation, clearConversation } from "@/lib/persistence";

export function useMapPersistence() {
  const [savedConvo, setSavedConvo] = useState<SavedConversation | null>(null);

  useEffect(() => {
    const saved = loadConversation();
    if (saved) setSavedConvo(saved);
  }, []);

  const clearSaved = () => {
    clearConversation();
    setSavedConvo(null);
  };

  return { savedConvo, clearSaved };
}
