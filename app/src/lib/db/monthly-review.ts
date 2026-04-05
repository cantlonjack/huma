import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, DimensionKey, MonthlyReviewData, MonthlyReviewRow, WeekConsistency } from "@/types/v2";

// ─── Monthly Review ────────────────────────────────────────────────────────

/**
 * Build monthly review data: 4-week grid × behavior rows.
 *
 * Looks at the most recently completed month (previous calendar month).
 * Each behavior that appeared at least once gets a row.
 * Weeks run Monday–Sunday. Partial weeks at month edges are included.
 *
 * Consistency per week:
 *   consistent:   completed 5+ of possible days (or all if < 5 days in week)
 *   intermittent: completed 1–4 days
 *   absent:       0 completions
 *
 * Enriches with dimension data from aspirations when available.
 */
export async function getMonthlyReviewData(
  supabase: SupabaseClient,
  userId: string,
  aspirations: Aspiration[],
): Promise<MonthlyReviewData | null> {
  // Determine the previous calendar month
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStart = formatDate(prevMonth);
  const lastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
  const monthEnd = formatDate(lastDay);

  const monthLabel = prevMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Partition the month into 4 weeks (Mon–Sun boundaries)
  const weeks = partitionMonthIntoWeeks(prevMonth);
  if (weeks.length === 0) return null;

  // Query all behavior_log rows for the month
  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, date, completed")
    .eq("user_id", userId)
    .gte("date", monthStart)
    .lte("date", monthEnd)
    .eq("completed", true);

  if (!rows || rows.length === 0) return null;

  // Build dimension lookup from aspirations
  const dimLookup = new Map<string, DimensionKey[]>();
  for (const asp of aspirations) {
    for (const b of asp.behaviors || []) {
      dimLookup.set(b.key, (b.dimensions || []).map(d =>
        typeof d === "string" ? d as DimensionKey : d.dimension
      ));
    }
  }

  // Group completions by behavior_key -> Set<date>
  const behaviorDates = new Map<string, { name: string; dates: Set<string> }>();
  for (const row of rows) {
    const key = (row.behavior_key || row.behavior_name) as string;
    const name = (row.behavior_name || row.behavior_key) as string;
    if (!behaviorDates.has(key)) {
      behaviorDates.set(key, { name, dates: new Set() });
    }
    behaviorDates.get(key)!.dates.add(row.date as string);
  }

  // Build rows: one per behavior, with 4 week-consistency values
  // Use up to 4 weeks (trim to 4 if month has 5 partial weeks)
  const displayWeeks = weeks.length > 4 ? weeks.slice(0, 4) : weeks;

  const reviewRows: MonthlyReviewRow[] = [];
  for (const [key, { name, dates }] of behaviorDates) {
    const weekValues: WeekConsistency[] = displayWeeks.map(week => {
      const daysInWeek = week.dates.length;
      let completed = 0;
      for (const d of week.dates) {
        if (dates.has(d)) completed++;
      }
      if (completed === 0) return "absent";
      // Consistent: completed all days or 5+ in a full week
      if (completed >= daysInWeek || completed >= 5) return "consistent";
      return "intermittent";
    });

    reviewRows.push({
      behaviorKey: key,
      behaviorName: name,
      dimensions: dimLookup.get(key) || [],
      weeks: weekValues,
    });
  }

  // Sort: most consistent behaviors first (count of non-absent weeks desc)
  reviewRows.sort((a, b) => {
    const scoreA = a.weeks.filter(w => w !== "absent").length;
    const scoreB = b.weeks.filter(w => w !== "absent").length;
    return scoreB - scoreA;
  });

  // Format week range labels
  const weekRanges = displayWeeks.map(w => {
    const start = new Date(w.dates[0] + "T12:00:00");
    const end = new Date(w.dates[w.dates.length - 1] + "T12:00:00");
    const mo = start.toLocaleDateString("en-US", { month: "short" });
    return `${mo} ${start.getDate()}–${end.getDate()}`;
  });

  return {
    month: monthLabel,
    weekRanges,
    rows: reviewRows,
  };
}

/** Format a Date to YYYY-MM-DD. */
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Partition a month into week buckets (Mon–Sun). Returns array of {dates: string[]}. */
function partitionMonthIntoWeeks(monthStart: Date): Array<{ dates: string[] }> {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const weeks: Array<{ dates: string[] }> = [];
  let currentWeek: string[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDate(d);
    const dow = d.getDay(); // 0=Sun, 1=Mon, ...

    currentWeek.push(dateStr);

    // End of week (Sunday) or end of month
    if (dow === 0 || day === lastDay) {
      weeks.push({ dates: currentWeek });
      currentWeek = [];
    }
  }

  return weeks;
}
