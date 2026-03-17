-- HUMA Initial Schema
-- Run in Supabase Dashboard > SQL Editor

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  location TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'operate', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Maps (permanent storage, replaces Redis 90-day TTL)
CREATE TABLE maps (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  context JSONB,
  document_markdown TEXT,
  canvas_data JSONB,
  name TEXT DEFAULT '',
  location TEXT DEFAULT '',
  enterprise_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly Reviews (for Operate Mode)
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  map_id TEXT REFERENCES maps(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  qol_checks JSONB NOT NULL,
  ai_insight TEXT,
  adjustment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_maps_user_id ON maps(user_id);
CREATE INDEX idx_maps_created_at ON maps(created_at DESC);
CREATE INDEX idx_weekly_reviews_user_id ON weekly_reviews(user_id);
CREATE INDEX idx_weekly_reviews_map_id ON weekly_reviews(map_id);
CREATE INDEX idx_weekly_reviews_week_start ON weekly_reviews(week_start DESC);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Maps: public maps readable by anyone, users CRUD their own
CREATE POLICY "Public maps readable" ON maps
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users read own maps" ON maps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own maps" ON maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own maps" ON maps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own maps" ON maps
  FOR DELETE USING (auth.uid() = user_id);
-- Anonymous maps (no user_id) insertable via service role from API
CREATE POLICY "Anonymous map insert" ON maps
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Weekly reviews: users CRUD their own
CREATE POLICY "Users read own reviews" ON weekly_reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reviews" ON weekly_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
