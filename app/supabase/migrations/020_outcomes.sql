-- ─── HUMA REGEN-03: 90-day outcome check ledger ───────────────────────────
-- Phase 2 Plan 05.
-- MANUAL APPLY: run via Supabase dashboard SQL editor (PROJECT.md constraint).
-- A code push alone does NOT apply this migration — without it, /api/outcome
-- will return 500 on every request because `outcome_checks` does not exist.
--
-- Table captures 90-day outcome checks: Yes / Some / No / Worse + one-sentence why.
-- Append-only: no UPDATE policy (outcomes are immutable records at the moment of
-- submission). If a user wants to "change their mind" they can submit another
-- outcome; downstream consumers take the latest answered_at.
--
-- Post-apply verification (paste into SQL editor):
--   SELECT count(*) FROM outcome_checks;                          -- expect 0 initially
--   SELECT policyname, cmd FROM pg_policies
--     WHERE tablename = 'outcome_checks';
--   -- expect 2 rows: outcome_checks_select (SELECT) + outcome_checks_insert (INSERT)

BEGIN;

CREATE TABLE IF NOT EXISTS outcome_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_kind   TEXT NOT NULL CHECK (target_kind IN ('aspiration','pattern')),
  target_id     UUID NOT NULL,
  answer        TEXT NOT NULL CHECK (answer IN ('yes','some','no','worse')),
  why           TEXT,
  answered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snooze_count  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes: user-scoped lookups and target-scoped lookups (for the trigger
-- helper that asks "does this target already have an outcome?").
CREATE INDEX IF NOT EXISTS outcome_checks_user_id_idx
  ON outcome_checks(user_id);
CREATE INDEX IF NOT EXISTS outcome_checks_target_idx
  ON outcome_checks(target_kind, target_id);
CREATE INDEX IF NOT EXISTS outcome_checks_user_target_idx
  ON outcome_checks(user_id, target_kind, target_id);

-- RLS — mirrors aspirations/patterns: authors can SELECT and INSERT their own
-- rows. No UPDATE/DELETE policies because outcomes are append-only.
ALTER TABLE outcome_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY outcome_checks_select ON outcome_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY outcome_checks_insert ON outcome_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deliberately NO update/delete policies — outcomes are append-only.

COMMIT;
