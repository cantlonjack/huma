-- ─── HUMA V2: Shared Daily Sheets ──────────────────────────────────────────
-- Public, read-only snapshots of a day's compiled sheet. Each share creates a
-- row with a short slug the owner can distribute. RLS allows public read only
-- when is_public = true; owner keeps full control over visibility.

CREATE TABLE IF NOT EXISTS shared_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  operator_name TEXT,
  opening TEXT,
  through_line TEXT,
  state_sentence TEXT,
  entries JSONB NOT NULL DEFAULT '[]',
  moved_dimensions JSONB DEFAULT '[]',
  day_count INTEGER,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shared_sheets_user ON shared_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_sheets_public ON shared_sheets(id) WHERE is_public = true;

ALTER TABLE shared_sheets ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read public shared sheets.
CREATE POLICY "Public read public shared_sheets"
  ON shared_sheets FOR SELECT
  USING (is_public = true);

-- Owners always see their own rows, even when not public.
CREATE POLICY "Owner read own shared_sheets"
  ON shared_sheets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner insert shared_sheets"
  ON shared_sheets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner update own shared_sheets"
  ON shared_sheets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner delete own shared_sheets"
  ON shared_sheets FOR DELETE
  USING (auth.uid() = user_id);
