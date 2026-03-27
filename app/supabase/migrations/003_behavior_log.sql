-- ─── HUMA V2.1: Behavior Log (check-off tracking) ──────────────────────────
-- Tracks individual behavior check-offs to power counters and activity data.

CREATE TABLE IF NOT EXISTS behavior_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  behavior_id UUID REFERENCES aspirations(id) ON DELETE SET NULL,
  behavior_name TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_behavior_log_user ON behavior_log(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_log_user_date ON behavior_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_behavior_log_user_name ON behavior_log(user_id, behavior_name);

-- RLS
ALTER TABLE behavior_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own behavior_log" ON behavior_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own behavior_log" ON behavior_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own behavior_log" ON behavior_log FOR UPDATE USING (auth.uid() = user_id);

-- Allow sheet_entries deletion (needed for recompile dedup)
CREATE POLICY "Users delete own sheet_entries" ON sheet_entries FOR DELETE USING (auth.uid() = user_id);
