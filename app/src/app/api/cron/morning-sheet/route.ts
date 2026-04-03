import { createAdminSupabase } from "@/lib/supabase-admin";
import { sendPushToUser } from "@/lib/push-send";
import type { KnownContext } from "@/types/v2";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes — compiles sheets for all subscribed users

// ─── Auth ────────────────────────────────────────────────────────────────────

function verifyCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

// ─── Season (same logic as sheet route) ──────────────────────────────────────

function getSeason(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth();
  const day = d.getDate();

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
    const start = month === 11 ? new Date(d.getFullYear(), 11, 21) : new Date(d.getFullYear() - 1, 11, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  }

  const fraction = dayInSeason / seasonLength;
  const qualifier = fraction < 0.33 ? "early" : fraction < 0.66 ? "mid" : "late";
  return `${qualifier} ${season}`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDateStr(): string {
  // UTC date — cron runs at a fixed UTC time, close enough for sheet compilation
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDayCountFromCreated(createdAt: string): number {
  const diff = Math.ceil((Date.now() - new Date(createdAt).getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabase();
  const date = getDateStr();
  const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  const season = getSeason(date);

  // 1. Get all users who have push subscriptions
  const { data: subs, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("user_id")
    .order("user_id");

  if (subsError || !subs?.length) {
    return Response.json({ sent: 0, reason: subsError ? "db_error" : "no_subscribers" });
  }

  // Deduplicate user IDs (a user may have multiple devices)
  const userIds = [...new Set(subs.map(s => s.user_id as string))];

  let totalSent = 0;
  let totalSkipped = 0;

  for (const userId of userIds) {
    try {
      // 2. Fetch user's aspirations
      const { data: aspirationRows } = await supabase
        .from("aspirations")
        .select("id, raw_text, clarified_text, behaviors, status, stage")
        .eq("user_id", userId)
        .eq("status", "active");

      const activeAspirations = (aspirationRows || [])
        .filter(a => a.stage === "active")
        .map(a => ({
          id: a.id as string,
          rawText: a.raw_text as string,
          clarifiedText: (a.clarified_text as string) || "",
          behaviors: ((a.behaviors || []) as Array<{
            key: string; text: string; frequency: string;
            days?: string[]; detail?: string; enabled?: boolean;
          }>).filter(b => b.enabled !== false),
        }));

      if (activeAspirations.length === 0) {
        totalSkipped++;
        continue;
      }

      // 3. Fetch context (name, archetypes, WHY)
      const { data: ctxRow } = await supabase
        .from("contexts")
        .select("known_context, why_statement, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const knownContext = (ctxRow?.known_context || {}) as KnownContext;
      const whyStatement = (ctxRow?.why_statement as string) || "";
      const archetypes = (knownContext.archetypes as string[]) || [];
      const operatorName =
        (knownContext as Record<string, unknown>).operator_name as string
        || (knownContext as Record<string, unknown>).name as string
        || "there";
      const dayCount = ctxRow?.created_at ? getDayCountFromCreated(ctxRow.created_at) : 1;

      // 4. Fetch recent check-off history (7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const { data: historyRows } = await supabase
        .from("sheet_entries")
        .select("date, behavior_key, checked")
        .eq("user_id", userId)
        .gte("date", weekAgoStr);

      const recentHistory = (historyRows || []).map(h => ({
        date: h.date as string,
        behaviorKey: h.behavior_key as string,
        checked: h.checked as boolean,
      }));

      // 5. Fetch recent conversation (last 20 messages)
      const { data: msgRows } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      const conversationMessages = (msgRows || []).reverse().map(m => ({
        role: m.role as string,
        content: m.content as string,
      }));

      // 6. Call the sheet API (internal fetch — reuses all prompt logic)
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

      const sheetRes = await fetch(`${baseUrl}/api/sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({
          name: operatorName,
          date,
          aspirations: activeAspirations,
          knownContext,
          recentHistory,
          conversationMessages,
          dayOfWeek,
          season,
          dayCount,
          archetypes,
          whyStatement,
        }),
      });

      if (!sheetRes.ok) {
        console.error(`Morning sheet: compilation failed for ${userId.slice(0, 8)}: ${sheetRes.status}`);
        totalSkipped++;
        continue;
      }

      const sheet = await sheetRes.json() as {
        entries: Array<{ headline?: string; detail?: string; time_of_day?: string }>;
        through_line?: string;
      };

      if (!sheet.entries?.length) {
        totalSkipped++;
        continue;
      }

      // 7. Pick the trigger item for the push notification
      //    Priority: first morning entry, then first entry overall
      const morningEntry = sheet.entries.find(e => e.time_of_day === "morning");
      const triggerEntry = morningEntry || sheet.entries[0];
      const headline = triggerEntry.headline || "Your sheet is ready";

      // 8. Send push — "Your day: [headline]"
      const sent = await sendPushToUser(
        userId,
        {
          title: "HUMA",
          body: `Your day: ${headline}`,
          url: "/today",
          tag: `morning-sheet-${date}`,
          renotify: false,
        },
        supabase,
      );

      totalSent += sent;
    } catch (err) {
      console.error(`Morning sheet: error for ${userId.slice(0, 8)}:`, err);
      totalSkipped++;
    }
  }

  return Response.json({
    date,
    users: userIds.length,
    sent: totalSent,
    skipped: totalSkipped,
  });
}
