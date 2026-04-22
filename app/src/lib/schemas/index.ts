/**
 * Shared Zod schemas for HUMA API routes.
 * Each schema validates the request body for its corresponding route.
 */

import { z } from "zod";
import { userTextField } from "./sanitize";

// ─── Shared primitives ──────────────────────────────────────────────────────

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: userTextField({ min: 1, max: 50_000 }),
});

// ─── /api/v2-chat ───────────────────────────────────────────────────────────

export const v2ChatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  knownContext: z.record(z.string(), z.unknown()).optional().default({}),
  aspirations: z.array(z.object({
    rawText: userTextField(),
    clarifiedText: userTextField(),
    status: z.string(),
  })).optional().default([]),
  sourceTab: z.string().optional(),
  tabContext: z.record(z.string(), z.unknown()).optional(),
  dayCount: z.number().int().positive().optional(),
  chatMode: z.string().optional(),
  sessionType: z.enum(["open", "decision", "pattern", "revisit"]).optional(),
  humaContext: z.record(z.string(), z.unknown()).optional(),
  isFirstConversation: z.boolean().optional(),
  exchangeCount: z.number().int().nonnegative().optional(),
  // Compressed encoding inputs (Phase 2 / chat integration)
  fullAspirations: z.array(z.record(z.string(), z.unknown())).optional(),
  patterns: z.array(z.record(z.string(), z.unknown())).optional(),
  capitalScores: z.array(z.record(z.string(), z.unknown())).optional(),
  behaviorCounts: z.record(z.string(), z.object({
    completed: z.number(),
    total: z.number(),
  })).optional(),
});

export type V2ChatRequest = z.infer<typeof v2ChatSchema>;

// ─── /api/maps ──────────────────────────────────────────────────────────────

export const mapSaveSchema = z.object({
  markdown: z.string().min(1),
  canvasData: z.unknown().optional(),
  name: z.string().default(""),
  location: z.string().default(""),
  enterpriseCount: z.number().int().nonnegative().default(0),
  createdAt: z.string().default(() => new Date().toISOString()),
}).refine(
  (data) => {
    const canvasSize = data.canvasData ? JSON.stringify(data.canvasData).length : 0;
    return data.markdown.length + canvasSize <= 200_000;
  },
  { message: "Map too large (200KB limit)" },
);

export type MapSaveRequest = z.infer<typeof mapSaveSchema>;

// ─── /api/insight ───────────────────────────────────────────────────────────

const behaviorEntrySchema = z.object({
  date: z.string(),
  behaviorKey: z.string(),
  aspirationId: z.string(),
  checked: z.boolean(),
});

const behaviorMetaSchema = z.object({
  key: z.string(),
  text: userTextField(),
  aspirationId: z.string(),
  aspirationText: userTextField(),
  dimensions: z.array(z.string()),
});

export const insightSchema = z.object({
  name: userTextField({ min: 0 }).optional().default("there"),
  entries: z.array(behaviorEntrySchema).default([]),
  behaviorMeta: z.array(behaviorMetaSchema).default([]),
});

export type InsightRequest = z.infer<typeof insightSchema>;

// ─── /api/sheet ─────────────────────────────────────────────────────────────

export const sheetCompileSchema = z.object({
  name: z.string().optional().default("there"),
  date: z.string().optional(),
  aspirations: z.array(z.object({
    id: z.string(),
    rawText: userTextField(),
    clarifiedText: userTextField(),
    behaviors: z.array(z.object({
      key: z.string(),
      text: userTextField(),
      frequency: z.string(),
      days: z.array(z.string()).optional(),
      detail: z.string().optional(),
      enabled: z.boolean().optional(),
      dimensions: z.array(z.string()).optional(),
    })),
  })).default([]),
  knownContext: z.record(z.string(), z.unknown()).optional().default({}),
  humaContext: z.record(z.string(), z.unknown()).optional(),
  recentHistory: z.array(z.object({
    date: z.string(),
    behaviorKey: z.string(),
    checked: z.boolean(),
  })).default([]),
  conversationMessages: z.array(z.object({
    role: z.string(),
    content: userTextField(),
  })).default([]),
  dayOfWeek: z.string().optional(),
  season: z.string().optional(),
  dayCount: z.number().int().positive().optional().default(1),
  archetypes: z.array(z.string()).optional().default([]),
  whyStatement: z.string().optional().default(""),
  timeOfDay: z.enum(["morning", "evening"]).optional().default("morning"),
});

export type SheetCompileRequest = z.infer<typeof sheetCompileSchema>;

// ─── /api/sheet/share ───────────────────────────────────────────────────────

const sharedEntrySchema = z.object({
  behaviorKey: z.string(),
  headline: z.string(),
  detailText: z.string().optional().default(""),
  dimensions: z.array(z.string()).default([]),
  timeOfDay: z.string().optional().default("morning"),
  connectionNote: z.string().optional(),
  because: z.string().optional(),
});

export const sheetShareSchema = z.object({
  date: z.string().min(1),
  operatorName: z.string().optional().default(""),
  opening: z.string().optional().default(""),
  throughLine: z.string().optional().default(""),
  stateSentence: z.string().optional().default(""),
  entries: z.array(sharedEntrySchema).min(1).max(20),
  movedDimensions: z.array(z.string()).optional().default([]),
  dayCount: z.number().int().positive().optional(),
});

export type SheetShareRequest = z.infer<typeof sheetShareSchema>;

// ─── /api/sheet/check ───────────────────────────────────────────────────────

export const sheetCheckSchema = z.object({
  entryId: z.string().min(1),
  checked: z.boolean(),
});

export type SheetCheckRequest = z.infer<typeof sheetCheckSchema>;

// ─── /api/palette ───────────────────────────────────────────────────────────

export const paletteSchema = z.object({
  conversationSoFar: z.array(userTextField()).default([]),
  selectedConcepts: z.array(userTextField()).default([]),
});

export type PaletteRequest = z.infer<typeof paletteSchema>;

// ─── /api/nudge ────────────────────────────────────────────────────────────

export const nudgeSchema = z.object({
  name: userTextField({ min: 0 }).optional().default("there"),
  date: z.string(),                                    // YYYY-MM-DD
  knownContext: z.record(z.string(), z.unknown()).optional().default({}),
  humaContext: z.record(z.string(), z.unknown()).optional(),
  aspirations: z.array(z.object({
    id: z.string(),
    rawText: userTextField(),
    clarifiedText: userTextField(),
    behaviors: z.array(z.object({
      key: z.string(),
      text: userTextField(),
      frequency: z.string(),
    })),
  })).default([]),
  recentHistory: z.array(z.object({
    date: z.string(),
    behaviorKey: z.string(),
    checked: z.boolean(),
  })).default([]),
  dayCount: z.number().int().positive().optional().default(1),
  season: z.string().optional(),
  checkedToday: z.array(z.string()).default([]),        // behavior keys checked today
  dismissedNudgeIds: z.array(z.string()).default([]),   // previously dismissed nudge IDs
});

export type NudgeRequest = z.infer<typeof nudgeSchema>;

// ─── /api/outcome ──────────────────────────────────────────────────────────
// REGEN-03 (Plan 02-05): 90-day outcome check — Yes/Some/No/Worse + one-sentence why.
// `why` uses userTextField so SEC-04 sanitization (marker rejection, zero-width
// stripping, injection-prefix peeling from Plan 01-04) applies for free.
// `snooze: true` branch in the route increments snooze_count instead of writing
// an answer row; the snooze placeholder 'some' answer is required by the Zod
// enum but ignored by the snooze branch.

export const outcomeSubmitSchema = z.object({
  target_kind: z.enum(["aspiration", "pattern"]),
  target_id: z.string().uuid(),
  answer: z.enum(["yes", "some", "no", "worse"]),
  // why is optional; when present, sanitized + marker-rejected via userTextField.
  // Max 280 (one-sentence constraint from 02-CONTEXT.md).
  why: userTextField({ min: 0, max: 280 }).optional(),
  snooze: z.boolean().optional(),
});

export type OutcomeSubmitRequest = z.infer<typeof outcomeSubmitSchema>;

// ─── /api/operator/dormancy ─────────────────────────────────────────────────
// REGEN-02 (Plan 02-02): toggle huma_context.dormant.active on/off.
// Minimal body — { enable: boolean }. The route reads current huma_context,
// sets .dormant.active = enable, preserves .since on disable, writes a new ISO
// on enable. No client-supplied timestamp: the route owns the clock.

export const operatorDormancySchema = z.object({
  enable: z.boolean(),
});

export type OperatorDormancyRequest = z.infer<typeof operatorDormancySchema>;

// ─── /api/whole-compute ─────────────────────────────────────────────────────

export const wholeComputeSchema = z.discriminatedUnion("compute", [
  z.object({
    compute: z.literal("why-evolve"),
    contextData: userTextField({ min: 1 }),
    originalWhy: userTextField({ min: 1 }),
    behavioralSummary: userTextField({ min: 1 }),
  }),
  z.object({
    compute: z.enum(["both", "archetypes", "why"]),
    contextData: userTextField({ min: 1 }),
    originalWhy: userTextField({ min: 0 }).optional(),
    behavioralSummary: userTextField({ min: 0 }).optional(),
  }),
]);

export type WholeComputeRequest = z.infer<typeof wholeComputeSchema>;
