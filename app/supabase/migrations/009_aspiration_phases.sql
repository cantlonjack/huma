-- ─── HUMA Aspiration Phases: Schema Extensions ──────────────────────────────
-- Adds phased decomposition fields to aspirations table.
-- title/summary from decomposition, coming_up/longer_arc for future phases.
-- All changes are additive — no existing data is modified.

-- ─── 1. Decomposition Metadata ────────────────────────────────────────────

ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS summary TEXT;

-- ─── 2. Phased Future Actions ─────────────────────────────────────────────

ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS coming_up JSONB DEFAULT '[]';
ALTER TABLE aspirations ADD COLUMN IF NOT EXISTS longer_arc JSONB DEFAULT '[]';
