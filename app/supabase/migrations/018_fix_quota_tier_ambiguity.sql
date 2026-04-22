-- ─── HUMA SEC-02: Fix ambiguous `tier` reference in increment_quota_and_check ───
-- Plan 01-08 (Phase 1 gap closure).
-- MANUAL APPLY: run via Supabase dashboard SQL editor (PROJECT.md constraint).
--
-- Bug: migration 016's increment_quota_and_check function declares an output
-- column `tier` in RETURNS TABLE, AND queries user_quotas_tiers which also has
-- a `tier` column. The line `WHERE tier = v_tier` is ambiguous — Postgres
-- can't tell whether `tier` refers to the table column or the function's
-- output variable. Result: every production call errored with
-- `column reference "tier" is ambiguous` and quota.ts fell through to its
-- fail-open branch. user_quota_ledger count stayed at 0 despite live traffic.
--
-- Fix: qualify the column reference as `user_quotas_tiers.tier`. This is the
-- only change from migration 016's definition. Function signature is
-- identical — no caller (quota.ts) changes needed.
--
-- Post-apply verification (paste into SQL editor):
--   -- Function exists
--   SELECT proname FROM pg_proc WHERE proname = 'increment_quota_and_check';
--   -- Then re-run scripts/smoke/sec-02-quota.sh against prod.
--   -- Then:
--   SELECT count(*) FROM user_quota_ledger;  -- expect >= 1 after smoke

CREATE OR REPLACE FUNCTION increment_quota_and_check(
  p_user_id      UUID,
  p_route        TEXT,
  p_input_tokens INT,
  p_req_id       TEXT DEFAULT NULL
) RETURNS TABLE (
  allowed     BOOLEAN,
  tier        TEXT,
  reset_at    TIMESTAMPTZ,
  req_count   INT,
  token_count INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tier          TEXT;
  v_req_limit     INT;
  v_token_limit   INT;
  v_is_anon       BOOLEAN;
  v_has_sub       BOOLEAN;
  v_window_cutoff TIMESTAMPTZ := now() - interval '24 hours';
  v_row           user_quota_ledger%ROWTYPE;
  v_reset         TIMESTAMPTZ;
BEGIN
  -- Tier resolution: anonymous → operate (active sub) → free
  SELECT COALESCE(is_anonymous, false)
    INTO v_is_anon
    FROM auth.users
    WHERE id = p_user_id;

  v_has_sub := false;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'subscriptions'
  ) THEN
    EXECUTE format(
      'SELECT EXISTS(SELECT 1 FROM subscriptions
                      WHERE user_id = %L
                        AND status = ''active''
                        AND tier = ''operate'')',
      p_user_id
    ) INTO v_has_sub;
  END IF;

  v_tier := CASE
    WHEN v_has_sub THEN 'operate'
    WHEN v_is_anon THEN 'anonymous'
    ELSE 'free'
  END;

  SELECT req_limit, token_limit
    INTO v_req_limit, v_token_limit
    FROM user_quotas_tiers
    WHERE user_quotas_tiers.tier = v_tier;   -- ← FIX: was `WHERE tier = v_tier` (ambiguous with RETURNS TABLE output column)

  -- Grab latest in-window row FOR UPDATE, or insert a fresh one.
  SELECT * INTO v_row
    FROM user_quota_ledger
    WHERE user_id = p_user_id
      AND route = p_route
      AND window_start > v_window_cutoff
    ORDER BY window_start DESC
    LIMIT 1
    FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO user_quota_ledger (
      user_id, route, req_id, window_start, req_count, token_count
    ) VALUES (
      p_user_id, p_route, p_req_id, now(), 0, 0
    ) RETURNING * INTO v_row;
  END IF;

  v_reset := v_row.window_start + interval '24 hours';

  -- Check limits BEFORE incrementing. Denials do not touch the ledger.
  IF (v_row.req_count + 1) > v_req_limit
     OR (v_row.token_count + p_input_tokens) > v_token_limit THEN
    RETURN QUERY SELECT false, v_tier, v_reset, v_row.req_count, v_row.token_count;
    RETURN;
  END IF;

  UPDATE user_quota_ledger
    SET req_count   = req_count + 1,
        token_count = token_count + p_input_tokens,
        req_id      = COALESCE(p_req_id, req_id),
        updated_at  = now()
    WHERE id = v_row.id
    RETURNING req_count, token_count
    INTO v_row.req_count, v_row.token_count;

  RETURN QUERY SELECT true, v_tier, v_reset, v_row.req_count, v_row.token_count;
END;
$$;

-- Grants unchanged from migration 016.
GRANT EXECUTE ON FUNCTION increment_quota_and_check(UUID, TEXT, INT, TEXT)
  TO authenticated, service_role;
