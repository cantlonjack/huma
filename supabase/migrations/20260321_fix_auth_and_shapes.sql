-- Fix 1: Recreate handle_new_user trigger function
-- The SECURITY DEFINER + SET search_path ensures it bypasses RLS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix 2: Add INSERT policy for profiles (belt + suspenders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users insert own profile'
  ) THEN
    CREATE POLICY "Users insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Fix 3: Create shapes table (was never run)
CREATE TABLE IF NOT EXISTS shapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimensions JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('builder', 'pulse', 'conversation')),
  insight JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shapes_user_created ON shapes (user_id, created_at DESC);

ALTER TABLE shapes ENABLE ROW LEVEL SECURITY;

-- Drop-if-exists to make this idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shapes' AND policyname = 'Users can read their own shapes'
  ) THEN
    CREATE POLICY "Users can read their own shapes"
      ON shapes FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shapes' AND policyname = 'Users can insert their own shapes'
  ) THEN
    CREATE POLICY "Users can insert their own shapes"
      ON shapes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
