// ─── Sheet Service ───────────────────────────────────────────────────────────
// Extracted from sheet/route.ts — behavior scoring, history analysis,
// season derivation, and context formatting for sheet compilation.

import type { KnownContext, SheetCompileRequest } from "@/types/v2";

// ─── Season derivation ────────────────────────────────────────────────────
// Returns a human-readable season string from a YYYY-MM-DD date.
// Uses solstice/equinox-approximate boundaries and qualifies with "early/mid/late".

export function getSeason(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();

  // Approximate season boundaries (Northern Hemisphere)
  // Spring: Mar 20 – Jun 20, Summer: Jun 21 – Sep 22, Autumn: Sep 23 – Dec 20, Winter: Dec 21 – Mar 19
  type SeasonName = "spring" | "summer" | "autumn" | "winter";
  let season: SeasonName;
  let dayInSeason: number;
  let seasonLength: number;

  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day <= 20)) {
    season = "spring";
    const start = new Date(d.getFullYear(), 2, 20);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 93;
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 22)) {
    season = "summer";
    const start = new Date(d.getFullYear(), 5, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 94;
  } else if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day <= 20)) {
    season = "autumn";
    const start = new Date(d.getFullYear(), 8, 23);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  } else {
    season = "winter";
    // Winter spans year boundary — approximate
    const start = month === 11 ? new Date(d.getFullYear(), 11, 21) : new Date(d.getFullYear() - 1, 11, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  }

  const fraction = dayInSeason / seasonLength;
  const qualifier = fraction < 0.33 ? "early" : fraction < 0.66 ? "mid" : "late";
  return `${qualifier} ${season}`;
}

// ─── Structured known_context formatting ──────────────────────────────────
// Formats KnownContext into readable prose instead of raw JSON.

export function formatKnownContext(ctx: KnownContext): string {
  const lines: string[] = [];

  if (ctx.place?.name) {
    lines.push(`Location: ${ctx.place.name}${ctx.place.detail ? ` — ${ctx.place.detail}` : ""}`);
  }
  if (ctx.work?.title) {
    lines.push(`Work: ${ctx.work.title}${ctx.work.detail ? ` — ${ctx.work.detail}` : ""}`);
  }
  if (Array.isArray(ctx.people) && ctx.people.length > 0) {
    const peopleStr = ctx.people.map(p => `${p.name} (${p.role})`).join(", ");
    lines.push(`People: ${peopleStr}`);
  }
  if (ctx.stage?.label) {
    lines.push(`Life stage: ${ctx.stage.label}${ctx.stage.detail ? ` — ${ctx.stage.detail}` : ""}`);
  }
  if (ctx.health?.detail) {
    lines.push(`Health: ${ctx.health.detail}`);
  }
  if (ctx.time?.detail) {
    lines.push(`Time constraints: ${ctx.time.detail}`);
  }
  if (ctx.financial) {
    const f = ctx.financial as { situation?: string; income?: string; constraints?: string[]; rhythm?: string };
    const parts: string[] = [];
    if (f.situation) parts.push(f.situation);
    if (f.income) parts.push(`income: ${f.income}`);
    if (f.rhythm) parts.push(`pay rhythm: ${f.rhythm}`);
    if (f.constraints && f.constraints.length > 0) parts.push(`constraints: ${f.constraints.join("; ")}`);
    if (parts.length > 0) lines.push(`Financial: ${parts.join(". ")}`);
  }
  if (ctx.resources && ctx.resources.length > 0) {
    lines.push(`Resources: ${ctx.resources.join(", ")}`);
  }

  // Include any unstructured keys we don't have a formatter for
  const knownKeys = new Set(["people", "place", "work", "time", "stage", "health", "financial", "resources", "archetypes", "why_statement"]);
  for (const [key, value] of Object.entries(ctx)) {
    if (!knownKeys.has(key) && value != null) {
      lines.push(`${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : "Limited context so far.";
}

// ─── Behavior leverage scoring ───────────────────────────────────────────────
// When total behaviors exceed 5, score each by leverage so the prompt focuses
// on the highest-impact subset. Scoring factors:
//   1. Dimensional breadth — more dimensions touched = higher leverage
//   2. Check-off momentum — recently completed behaviors carry weight
//   3. Day-of-week fit — behaviors scheduled for today (specific-days) get priority
//   4. Aspiration balance — prevent one aspiration from consuming the whole sheet

export interface RecentEntry {
  date: string;
  behaviorKey: string;
  checked: boolean;
}

export interface ScoredBehavior {
  aspirationId: string;
  aspirationText: string;
  key: string;
  text: string;
  frequency: string;
  days?: string[];
  detail?: string;
  score: number;
  reason: string;
}

export function scoreBehaviors(
  aspirations: SheetCompileRequest["aspirations"],
  recentHistory: RecentEntry[],
  dayOfWeek: string,
): ScoredBehavior[] {
  // Build check-off stats per behavior
  const stats = new Map<string, { done: number; total: number }>();
  for (const entry of recentHistory) {
    if (!stats.has(entry.behaviorKey)) {
      stats.set(entry.behaviorKey, { done: 0, total: 0 });
    }
    const s = stats.get(entry.behaviorKey)!;
    s.total++;
    if (entry.checked) s.done++;
  }

  const scored: ScoredBehavior[] = [];

  for (const a of aspirations) {
    const activeBehaviors = a.behaviors.filter(b => b.enabled !== false);
    for (const b of activeBehaviors) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Dimensional breadth (inferred from behavior text is not available here,
      //    but behaviors with detail tend to be richer — simple proxy)
      // We'll use a base score of 1 for all behaviors

      score += 1;

      // 2. Check-off momentum
      const s = stats.get(b.key);
      if (s && s.total > 0) {
        const rate = s.done / s.total;
        if (rate >= 0.6) {
          score += 2; // building momentum — keep going
          reasons.push("momentum");
        } else if (rate > 0 && rate < 0.4) {
          score += 1.5; // struggling — simpler version might help
          reasons.push("needs-traction");
        }
        // rate 0.4-0.6 is neutral
      } else {
        // No history — new behavior, slight priority to get it started
        score += 1;
        reasons.push("new");
      }

      // 3. Day-of-week fit
      if (b.frequency === "daily") {
        score += 1;
        reasons.push("daily");
      } else if (b.frequency === "specific-days" && b.days) {
        const today = dayOfWeek.toLowerCase().slice(0, 3);
        const matches = b.days.some(d => d.toLowerCase().startsWith(today));
        if (matches) {
          score += 3; // strong signal — scheduled for today
          reasons.push("scheduled-today");
        } else {
          score -= 2; // not today's day
          reasons.push("not-today");
        }
      }
      // weekly/flexible behaviors get no bonus or penalty

      scored.push({
        aspirationId: a.id,
        aspirationText: a.clarifiedText || a.rawText,
        key: b.key,
        text: b.text,
        frequency: b.frequency,
        days: b.days,
        detail: b.detail,
        score,
        reason: reasons.join(", ") || "baseline",
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Aspiration balance: ensure no single aspiration takes more than 3 of the top 5
  const selected: ScoredBehavior[] = [];
  const aspirationCount = new Map<string, number>();

  for (const item of scored) {
    const count = aspirationCount.get(item.aspirationId) || 0;
    if (count >= 3 && selected.length < 7) {
      // Defer — push to end of candidates so other aspirations get slots
      continue;
    }
    selected.push(item);
    aspirationCount.set(item.aspirationId, count + 1);
  }

  // Add back any deferred items at the end
  for (const item of scored) {
    if (!selected.includes(item)) {
      selected.push(item);
    }
  }

  return selected;
}

export function analyzeHistory(recentHistory: RecentEntry[], dayOfWeek: string): string {
  if (recentHistory.length === 0) return "";

  // Group by behavior key
  const byBehavior = new Map<string, { done: number; skipped: number; dates: string[] }>();
  for (const entry of recentHistory) {
    if (!byBehavior.has(entry.behaviorKey)) {
      byBehavior.set(entry.behaviorKey, { done: 0, skipped: 0, dates: [] });
    }
    const stats = byBehavior.get(entry.behaviorKey)!;
    if (entry.checked) stats.done++;
    else stats.skipped++;
    stats.dates.push(entry.date);
  }

  // Build analysis
  const insights: string[] = [];
  for (const [key, stats] of byBehavior) {
    const total = stats.done + stats.skipped;
    const rate = stats.done / total;

    if (rate < 0.5) {
      insights.push(`"${key}" has been skipped more than done (${stats.done}/${total}). Consider a simpler version or different timing.`);
    } else if (rate >= 0.8) {
      insights.push(`"${key}" is sticking well (${stats.done}/${total}). Keep it going.`);
    }

    // Check day-of-week patterns
    const daySkips = recentHistory.filter(
      e => e.behaviorKey === key && !e.checked &&
      new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === dayOfWeek.toLowerCase()
    );
    if (daySkips.length >= 2) {
      insights.push(`"${key}" tends to get skipped on ${dayOfWeek}s. Suggest a lighter version or swap to a different behavior.`);
    }
  }

  if (insights.length === 0) return "";

  return `HISTORY ANALYSIS (use this to customize today's sheet):
${insights.join("\n")}`;
}
