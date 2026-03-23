import type { LotusState } from "@/types/lotus";

const LOTUS_STORAGE_KEY = "huma_onboarding";

export function saveLotusState(state: LotusState): void {
  try {
    localStorage.setItem(LOTUS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadLotusState(): LotusState | null {
  try {
    const raw = localStorage.getItem(LOTUS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as LotusState;
    // Basic validation: must have a screen number
    if (!data.screen || data.screen < 1 || data.screen > 13) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearLotusState(): void {
  try {
    localStorage.removeItem(LOTUS_STORAGE_KEY);
  } catch {
    // silently fail
  }
}
