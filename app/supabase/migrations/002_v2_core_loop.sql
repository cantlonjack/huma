-- ─── HUMA V2: Core Loop Tables ─────────────────────────────────────────────
-- Adds tables for conversation → decomposition → production sheet → insight.
-- Does NOT drop existing V1 tables (profiles, maps, weekly_reviews).

-- Operator context built through conversation
CREATE TABLE IF NOT EXISTS contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_statements JSONB DEFAULT '[]',
  aspirations JSONB DEFAULT '[]',
  known_context JSONB DEFAULT '{}',
  dimensional_state JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Decomposed aspirations with behavior chains
CREATE TABLE IF NOT EXISTS aspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context_id UUID REFERENCES contexts(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  clarified_text TEXT,
  behaviors JSONB NOT NULL DEFAULT '[]',
  dimensions_touched JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'dropped')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily production sheet entries
CREATE TABLE IF NOT EXISTS sheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  aspiration_id UUID REFERENCES aspirations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  behavior_key TEXT NOT NULL,
  behavior_text TEXT NOT NULL,
  detail JSONB DEFAULT '{}',
  time_of_day TEXT DEFAULT 'morning' CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Computed insights
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  dimensions_involved JSONB NOT NULL,
  behaviors_involved JSONB NOT NULL,
  data_basis JSONB NOT NULL,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'huma')),
  content TEXT NOT NULL,
  context_extracted JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contexts_user ON contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_aspirations_user ON aspirations(user_id);
CREATE INDEX IF NOT EXISTS idx_aspirations_context ON aspirations(context_id);
CREATE INDEX IF NOT EXISTS idx_sheet_entries_user_date ON sheet_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sheet_entries_aspiration ON sheet_entries(aspiration_id);
CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);

-- ─── RLS Policies ──────────────────────────────────────────────────────────
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users read own contexts" ON contexts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own contexts" ON contexts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contexts" ON contexts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own aspirations" ON aspirations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own aspirations" ON aspirations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own aspirations" ON aspirations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own sheet_entries" ON sheet_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sheet_entries" ON sheet_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sheet_entries" ON sheet_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own insights" ON insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own insights" ON insights FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own chat_messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat_messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
