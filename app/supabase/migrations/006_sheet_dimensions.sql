-- ─── HUMA V2.1: Sheet Entry Dimensions ──────────────────────────────────────
-- Adds dimensions column to sheet_entries for storing which life dimensions each entry touches.

ALTER TABLE sheet_entries ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '[]';
