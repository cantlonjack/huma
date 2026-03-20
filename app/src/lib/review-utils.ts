import type { CanvasData, ValidationCheck } from "@/engine/canvas-types";
import { getQoLStatement } from "@/lib/canvas-layout";

interface QoLResponse {
  qolStatement: string;
  question: string;
  target: string;
  answer: string;
}

/**
 * Build operator context from their map for the weekly review prompt.
 */
export function buildReviewContext(canvasData: CanvasData | null, operatorName: string): string {
  if (!canvasData) return `Operator: ${operatorName}`;

  const sections: string[] = [];

  sections.push(`Operator: ${canvasData.essence?.name || operatorName}`);
  if (canvasData.essence?.land) sections.push(`Location: ${canvasData.essence.land}`);
  if (canvasData.essence?.phrase) sections.push(`Essence: ${canvasData.essence.phrase}`);

  if (canvasData.qolNodes?.length) {
    sections.push(`\nQuality of Life statements:\n${canvasData.qolNodes.map((q) => `- ${getQoLStatement(q)}`).join("\n")}`);
  }

  if (canvasData.enterprises?.length) {
    sections.push(`\nEnterprise stack:\n${canvasData.enterprises.map((e) => `- ${e.name} (${e.role})`).join("\n")}`);
  }

  if (canvasData.weeklyRhythm?.days?.length) {
    sections.push(`\nWeekly rhythm:\n${canvasData.weeklyRhythm.days.map((d) => `- ${d.day}: ${d.focus} (hard stop: ${d.hardStop})`).join("\n")}`);
  }

  return sections.join("\n");
}

/**
 * Format QoL responses into a message for Claude.
 */
export function formatQolResponses(responses: QoLResponse[]): string {
  const lines = responses.map((r) => {
    return `"${r.qolStatement}" — ${r.question}\n  Answer: ${r.answer} (target: ${r.target})`;
  });

  return `Here are my check-in responses for this week:\n\n${lines.join("\n\n")}`;
}

/**
 * Get the Monday of the current week as ISO date string.
 */
export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}
