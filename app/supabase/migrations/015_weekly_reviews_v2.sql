-- ─── HUMA V2: Weekly Reviews ───────────────────────────────────────────────
-- Sunday-review ritual. One row per user per ISO week. Upserted by
-- /api/weekly-review when the operator runs a review on /whole. The legacy
-- V1 `weekly_reviews` table is untouched — this is a clean V2 structure
-- keyed by ISO week instead of map_id.

CREATE TABLE IF NOT EXISTS weekly_reviews_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_key TEXT NOT NULL,        -- e.g. 2026-W16
  week_start DATE NOT NULL,      -- Monday of the week
  wins TEXT NOT NULL,
  drifts TEXT,
  one_shift TEXT NOT NULL,
  graph_highlight JSONB,         -- { kind: "aspiration"|"dimension", id, label }
  active_dimensions JSONB DEFAULT '[]',
  dormant_dimensions JSONB DEFAULT '[]',
  active_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT weekly_reviews_v2_unique_week UNIQUE (user_id, week_key)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_v2_user_week
  ON weekly_reviews_v2(user_id, week_start DESC);

ALTER TABLE weekly_reviews_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own weekly_reviews_v2"
  ON weekly_reviews_v2 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own weekly_reviews_v2"
  ON weekly_reviews_v2 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own weekly_reviews_v2"
  ON weekly_reviews_v2 FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own weekly_reviews_v2"
  ON weekly_reviews_v2 FOR DELETE
  USING (auth.uid() = user_id);
