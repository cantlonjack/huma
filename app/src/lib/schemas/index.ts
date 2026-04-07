/**
 * Shared Zod schemas for HUMA API routes.
 * Each schema validates the request body for its corresponding route.
 */

import { z } from "zod";

// ─── Shared primitives ──────────────────────────────────────────────────────

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(50_000),
});

// ─── /api/v2-chat ───────────────────────────────────────────────────────────

export const v2ChatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  knownContext: z.record(z.string(), z.unknown()).optional().default({}),
  aspirations: z.array(z.object({
    rawText: z.string(),
    clarifiedText: z.string(),
    status: z.string(),
  })).optional().default([]),
  sourceTab: z.string().optional(),
  tabContext: z.record(z.string(), z.unknown()).optional(),
  dayCount: z.number().int().positive().optional(),
  chatMode: z.string().optional(),
  humaContext: z.record(z.string(), z.unknown()).optional(),
});

export type V2ChatRequest = z.infer<typeof v2ChatSchema>;

// ─── /api/chat (legacy) ─────────────────────────────────────────────────────

const VALID_PHASES = [
  "ikigai", "holistic-context", "landscape",
  "enterprise-map", "nodal-interventions", "operational-design", "complete",
] as const;

export const legacyChatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  phase: z.enum(VALID_PHASES).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  generateDocument: z.boolean().optional(),
  generateCanvas: z.boolean().optional(),
  syntheses: z.record(z.string(), z.unknown()).optional(),
});

export type LegacyChatRequest = z.infer<typeof legacyChatSchema>;

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
  text: z.string(),
  aspirationId: z.string(),
  aspirationText: z.string(),
  dimensions: z.array(z.string()),
});

export const insightSchema = z.object({
  name: z.string().optional().default("there"),
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
    rawText: z.string(),
    clarifiedText: z.string(),
    behaviors: z.array(z.object({
      key: z.string(),
      text: z.string(),
      frequency: z.string(),
      days: z.array(z.string()).optional(),
      detail: z.string().optional(),
      enabled: z.boolean().optional(),
      dimensions: z.array(z.string()).optional(),
    })),
  })).default([]),
  knownContext: z.record(z.string(), z.unknown()).optional().default({}),
  recentHistory: z.array(z.object({
    date: z.string(),
    behaviorKey: z.string(),
    checked: z.boolean(),
  })).default([]),
  conversationMessages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).default([]),
  dayOfWeek: z.string().optional(),
  season: z.string().optional(),
  dayCount: z.number().int().positive().optional().default(1),
  archetypes: z.array(z.string()).optional().default([]),
  whyStatement: z.string().optional().default(""),
});

export type SheetCompileRequest = z.infer<typeof sheetCompileSchema>;

// ─── /api/sheet/check ───────────────────────────────────────────────────────

export const sheetCheckSchema = z.object({
  entryId: z.string().min(1),
  checked: z.boolean(),
});

export type SheetCheckRequest = z.infer<typeof sheetCheckSchema>;

// ─── /api/palette ───────────────────────────────────────────────────────────

export const paletteSchema = z.object({
  conversationSoFar: z.array(z.string()).default([]),
  selectedConcepts: z.array(z.string()).default([]),
});

export type PaletteRequest = z.infer<typeof paletteSchema>;

// ─── /api/nudge ────────────────────────────────────────────────────────────

export const nudgeSchema = z.object({
  name: z.string().optional().default("there"),
  date: z.string(),                                    // YYYY-MM-DD
  knownContext: z.record(z.string(), z.unknown()).optional().default({}),
  humaContext: z.record(z.string(), z.unknown()).optional(),
  aspirations: z.array(z.object({
    id: z.string(),
    rawText: z.string(),
    clarifiedText: z.string(),
    behaviors: z.array(z.object({
      key: z.string(),
      text: z.string(),
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

// ─── /api/whole-compute ─────────────────────────────────────────────────────

export const wholeComputeSchema = z.discriminatedUnion("compute", [
  z.object({
    compute: z.literal("why-evolve"),
    contextData: z.string().min(1),
    originalWhy: z.string().min(1),
    behavioralSummary: z.string().min(1),
  }),
  z.object({
    compute: z.enum(["both", "archetypes", "why"]),
    contextData: z.string().min(1),
    originalWhy: z.string().optional(),
    behavioralSummary: z.string().optional(),
  }),
]);

export type WholeComputeRequest = z.infer<typeof wholeComputeSchema>;
