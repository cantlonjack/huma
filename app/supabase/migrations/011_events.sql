CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_created ON events(created_at);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (supports anonymous + authenticated)
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read their own events
CREATE POLICY "Users read own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);
