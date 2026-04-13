import type { Aspiration, FutureAction } from "@/types/v2";
import { displayName } from "@/lib/display-name";

export interface BehaviorStep {
  text: string;
  is_trigger: boolean;
  dimension: string;
  dimensions: string[];
}

export interface ComingUpItem {
  aspirationName: string;
  action: FutureAction;
}

export function formatHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return `${weekday} ${month} ${day}`;
}

export function formatBriefingDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const day = d.getDate();
  return `${weekday}, ${month} ${day}`;
}

export function getDayCount(): number {
  try {
    const start = localStorage.getItem("huma-v2-start-date");
    if (start) {
      const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
      return diff > 0 ? diff : 1;
    }
  } catch { /* fresh */ }
  return 1;
}

/** Extract behavior steps from aspiration data */
export function getBehaviorChain(aspiration: Aspiration): BehaviorStep[] {
  if (!aspiration.behaviors || aspiration.behaviors.length === 0) return [];

  const triggerBehavior = aspiration.triggerData?.behavior?.toLowerCase().trim();

  return aspiration.behaviors.map((b, i) => {
    const behaviorAny = b as import("@/types/v2").Behavior & { is_trigger?: boolean };
    const isTrigger = behaviorAny.is_trigger === true
      || (triggerBehavior ? b.text.toLowerCase().trim() === triggerBehavior : i === 0);

    const effective = b.dimensionOverrides || b.dimensions;
    const dim = effective?.[0];
    const dimension = dim
      ? (typeof dim === "string" ? dim : dim.dimension)
      : "";

    const allDims: string[] = effective
      ? effective.map(d => typeof d === "string" ? d : d.dimension).filter(Boolean)
      : [];

    return { text: b.text, is_trigger: isTrigger, dimension, dimensions: allDims };
  });
}

/** Build a one-line trigger caption: dimensions served + shared behavior signal */
export function triggerCaption(
  triggerStep: BehaviorStep | undefined,
  allAspirations: Aspiration[],
  currentAspirationId: string,
): string | null {
  if (!triggerStep) return null;

  const parts: string[] = [];
  const LABELS: Record<string, string> = {
    body: "body", people: "people", money: "money", home: "home",
    growth: "growth", joy: "joy", purpose: "purpose", identity: "identity",
  };

  const dims = triggerStep.dimensions;
  if (dims.length > 1) {
    const names = dims.map(d => LABELS[d] || d);
    parts.push(`Serves ${names.join(", ")}`);
  }

  const triggerText = triggerStep.text.toLowerCase().trim();
  const sharedWith = allAspirations.filter(a =>
    a.id !== currentAspirationId &&
    a.behaviors?.some(b => b.text.toLowerCase().trim() === triggerText)
  );
  if (sharedWith.length > 0) {
    const name = displayName(sharedWith[0].clarifiedText || sharedWith[0].rawText);
    if (sharedWith.length === 1) {
      parts.push(`Shared with ${name}`);
    } else {
      parts.push(`Shared across ${sharedWith.length + 1} patterns`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Determines which aspirations have solid THIS WEEK behaviors (70%+ completion
 * rate over the last 7 days) and returns their COMING UP items for surfacing.
 */
export function getReadyComingUp(
  aspirations: Aspiration[],
  weekCounts: Record<string, { completed: number; total: number }>,
  dayCount: number,
): ComingUpItem[] {
  if (dayCount < 7) return [];

  const items: ComingUpItem[] = [];

  for (const asp of aspirations) {
    if (!asp.comingUp || asp.comingUp.length === 0) continue;

    let totalCompleted = 0;
    let totalLogged = 0;
    for (const b of asp.behaviors) {
      const counts = weekCounts[b.text] || weekCounts[b.key];
      if (counts) {
        totalCompleted += counts.completed;
        totalLogged += counts.total;
      }
    }

    if (totalLogged > 0 && totalCompleted / totalLogged >= 0.7) {
      items.push({
        aspirationName: asp.title || asp.clarifiedText || asp.rawText,
        action: asp.comingUp[0],
      });
    }
  }

  return items;
}
