-- ─── HUMA V2.1: Sheet Entry Time-of-Day ─────────────────────────────────────
-- Adds time_of_day column to sheet_entries for section grouping on the Today page.

ALTER TABLE sheet_entries ADD COLUMN IF NOT EXISTS time_of_day TEXT DEFAULT 'morning';
