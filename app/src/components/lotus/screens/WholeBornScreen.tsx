"use client";

import { useEffect } from "react";
import WholeVisualization from "../WholeVisualization";
import type { LotusState } from "@/types/lotus";

interface ScreenProps {
  state: LotusState;
  onNext: () => void;
}

export default function WholeBornScreen({ state, onNext }: ScreenProps) {
  // Auto-advance after 3.5s (gives draw-on animation ~2s + 1.5s to appreciate)
  useEffect(() => {
    const t = setTimeout(onNext, 3500);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <button
      onClick={onNext}
      className="flex items-center justify-center w-full min-h-[400px] cursor-pointer"
      aria-label="Continue to next screen"
    >
      <WholeVisualization
        params={state.wholeParams}
        phase={1}
        size={280}
      />
    </button>
  );
}
