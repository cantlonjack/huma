-- ─── HUMA SEC-02: Add #variable_conflict use_column to quota RPC ───────────
-- Plan 01-08 follow-up to migration 018.
-- MANUAL APPLY: run via Supabase dashboard SQL editor.
--
-- Migration 018 fixed ONE ambiguous reference (line 121's `WHERE tier = v_tier`)
-- but additional ambiguities exist in the UPDATE statement (req_count and
-- token_count appear in both RETURNS TABLE — exposed as implicit PL/pgSQL
-- variables — and as actual columns on user_quota_ledger). PL/pgSQL's default
-- behavior when a name could mean either is to raise
-- `column reference is ambiguous`.
--
-- Fix: add `#variable_conflict use_column` pragma at the top of the function
-- body. This tells Postgres "when a name is ambiguous between a variable and
-- a column, prefer the column." Safe here because all our local DECLAREd
-- variables are `v_*`-prefixed (no collision with columns); the only
-- conflicts are with RETURNS TABLE output names (allowed, tier, reset_at,
-- req_count, token_count), and in every such site we want the column.
--
-- Post-apply verification:
--   -- Function exists and has the pragma
--   SELECT pg_get_functiondef(oid) FROM pg_proc
--     WHERE proname = 'increment_quota_and_check';
--   -- Should contain `#variable_conflict use_column` near the top of body.
--
--   -- Then re-run scripts/smoke/sec-02-quota.sh against prod.
--   -- Expect 5 × 200 + 1 × 429; ledger count > 0.

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
#variable_conflict use_column
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
    WHERE user_quotas_tiers.tier = v_tier;

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
