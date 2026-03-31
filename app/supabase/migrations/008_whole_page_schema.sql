-- ─── HUMA Whole Page: Schema Extensions ─────────────────────────────────────
-- Adds principles table, WHY statement fields, funnel/trigger columns on
-- aspirations. All changes are additive — no existing data is modified.

-- ─── 1. Principles Table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_principles_user ON principles(user_id);

ALTER TABLE principles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own principles" ON principles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own principles" ON principles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own principles" ON principles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own principles" ON principles FOR DELETE USING (auth.uid() = user_id);

-- ─── 2. WHY Statement on Contexts ──────────────────────────────────────────

ALTER TABLE contexts ADD COLUMN IF NOT EXISTS why_statement TEXT;
ALTER TABLE contexts ADD COLUMN IF NOT EXISTS why_date TIMESTAMPTZ;

-- ─── 3. Funnel & Trigger on Aspirations ────────────────────────────────────

ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS funnel JSONB DEFAULT '{}';
ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS trigger_data JSONB DEFAULT '{}';
