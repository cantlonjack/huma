-- ─── HUMA V2.1: Aspiration Stage Model ──────────────────────────────────────
-- Adds temporal staging so future aspirations don't pollute the daily sheet.
-- active: generates daily sheet items
-- planning: generates ONE weekly research/prep task (if any)
-- someday: generates nothing on the daily sheet (stored context only)

ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'active'
  CHECK (stage IN ('active', 'planning', 'someday'));
