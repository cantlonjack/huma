-- ─── HUMA Patterns: First-Class Pattern Entity ─────────────────────────────
-- Patterns emerge from aspirations when behaviors have a trigger + sequence + window.
-- A pattern is a validated sequence of behaviors (Golden Pathway) with status tracking.
-- All changes are additive — no existing data is modified.

-- ─── 1. Patterns Table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aspiration_id UUID REFERENCES aspirations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,                      -- The Decision behavior text
  steps JSONB NOT NULL DEFAULT '[]',          -- PatternStep[] — ordered golden pathway
  time_window TEXT,                           -- e.g. "5:15-5:45 AM"
  validation_metric TEXT,                     -- What counts as validated
  validation_count INTEGER NOT NULL DEFAULT 0,
  validation_target INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'finding'
    CHECK (status IN ('finding', 'working', 'validated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_aspiration_id ON patterns(aspiration_id);
CREATE INDEX IF NOT EXISTS idx_patterns_user_status ON patterns(user_id, status);

-- ─── 3. Row Level Security ──────────────────────────────────────────────────

ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns"
  ON patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns"
  ON patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns"
  ON patterns FOR DELETE
  USING (auth.uid() = user_id);
