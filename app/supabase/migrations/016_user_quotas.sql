-- ─── HUMA SEC-02: Per-user tier-aware quota ledger ────────────────────────
-- Plan 01-02 (Phase 1 Security & Cost Control).
-- MANUAL APPLY: run via Supabase dashboard SQL editor (PROJECT.md constraint).
-- Plan 07 (enablement) gates the PHASE_1_GATE_ENABLED flag flip on this
-- migration being applied.
--
-- Post-apply verification (paste into SQL editor):
--   SELECT count(*) FROM user_quotas_tiers;                        -- expect 3
--   SELECT tier, req_limit, token_limit
--     FROM user_quotas_tiers ORDER BY tier;
--   -- expect:
--   --   anonymous | 5   | 10000
--   --   free      | 50  | 100000
--   --   operate   | 500 | 2000000

-- 1) Tier seed table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_quotas_tiers (
  tier        TEXT PRIMARY KEY,
  req_limit   INT NOT NULL,
  token_limit INT NOT NULL
);

INSERT INTO user_quotas_tiers (tier, req_limit, token_limit) VALUES
  ('anonymous', 5,   10000),
  ('free',      50,  100000),
  ('operate',   500, 2000000)
ON CONFLICT (tier) DO NOTHING;

-- 2) Ledger table --------------------------------------------------------
-- One row per (user_id, route, rolling 24h window). The RPC below looks up
-- the most recent row whose window_start falls within the last 24h and
-- reuses it, or inserts a fresh one. `req_id` is nullable and populated
-- when the caller supplies a ULID — enables Plan 05c's output-token
-- reconciliation write after the Anthropic stream closes.
CREATE TABLE IF NOT EXISTS user_quota_ledger (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL,
  route         TEXT NOT NULL,
  req_id        TEXT,                                  -- ULID, optional
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  req_count     INT NOT NULL DEFAULT 0,
  token_count   INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_quota_ledger_user_window_idx
  ON user_quota_ledger (user_id, window_start DESC);
CREATE INDEX IF NOT EXISTS user_quota_ledger_req_id_idx
  ON user_quota_ledger (req_id) WHERE req_id IS NOT NULL;

ALTER TABLE user_quota_ledger ENABLE ROW LEVEL SECURITY;

-- Operators can read their own ledger rows (future /internal/cost dashboard).
-- All writes go through the RPC below under SECURITY DEFINER, so no insert
-- policy is needed.
CREATE POLICY "Users read own ledger"
  ON user_quota_ledger FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3) Atomic increment-and-check RPC --------------------------------------
-- Called from app/src/lib/quota.ts :: checkAndIncrement(...)
-- Behavior:
--   • Resolves tier from auth.users.is_anonymous + subscriptions (falls
--     back to 'free' if subscriptions table doesn't exist yet).
--   • Looks up current 24h window row FOR UPDATE (row lock) or creates one.
--   • If req_count+1 > limit OR token_count+input > limit → returns
--     allowed=false WITHOUT incrementing. Caller returns 429.
--   • Else increments req_count and token_count, returns allowed=true.
--   • COALESCE on req_id: once set, stays set (Plan 05c reconciliation key).
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
    WHERE tier = v_tier;

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

GRANT EXECUTE ON FUNCTION increment_quota_and_check(UUID, TEXT, INT, TEXT)
  TO authenticated, service_role;
