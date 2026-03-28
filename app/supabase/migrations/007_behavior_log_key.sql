-- ─── HUMA V2.1: Add behavior_key to behavior_log ────────────────────────────
-- behavior_key is a stable slug (e.g. "cook-dinner") that doesn't change when
-- the operator edits behavior display text. Using it for upsert matching
-- prevents week-count resets after text edits.

ALTER TABLE behavior_log ADD COLUMN IF NOT EXISTS behavior_key TEXT;

CREATE INDEX IF NOT EXISTS idx_behavior_log_key ON behavior_log(user_id, behavior_key, date);
