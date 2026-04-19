-- ─── HUMA SEC-05: Cost metrics raw trail + daily aggregates ──────────────
-- Plan 01-05c (Phase 1 Security & Cost Control).
-- MANUAL APPLY: run via Supabase dashboard SQL editor (PROJECT.md constraint).
-- Plan 07 (enablement) gates the PHASE_1_GATE_ENABLED flag flip on this
-- migration being applied.
--
-- Post-apply verification (paste into SQL editor):
--   SELECT count(*) FROM cost_metrics_raw;                -- expect 0 initially
--   SELECT count(*) FROM cost_metrics;                    -- expect 0 initially
--   -- After first traffic + first cost-rollup cron run:
--   --   raw should grow fast; cost_metrics should aggregate per (day, user, route).
--
-- Design notes:
-- • cost_metrics_raw is the fire-and-forget mirror of every request's stdout
--   log (see app/src/lib/observability.ts — Warning 4 in-memory retry queue).
--   The stdout log is authoritative; this table is a query convenience.
-- • cost_metrics is the daily rollup aggregated from _raw by the
--   /api/cron/cost-rollup cron. Raw rows older than 48h are pruned after
--   roll-up so the table stays bounded.
-- • RLS: operators can read their OWN cost_metrics rows (future /internal/cost
--   dashboard surface). cost_metrics_raw is service-role-only (ops only).

-- 1) Raw per-request mirror ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_metrics_raw (
  id              BIGSERIAL PRIMARY KEY,
  req_id          TEXT NOT NULL,                        -- ULID from observability
  user_id         UUID,                                 -- null for system / cron
  route           TEXT NOT NULL,                        -- "/api/v2-chat" etc.
  prompt_tokens   INT NOT NULL DEFAULT 0,
  output_tokens   INT NOT NULL DEFAULT 0,
  latency_ms      INT NOT NULL DEFAULT 0,
  status          INT NOT NULL DEFAULT 200,
  source          TEXT NOT NULL CHECK (source IN ('user', 'cron', 'system')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query patterns:
-- • cost-rollup scans by created_at window → WHERE created_at >= now() - 24h
-- • reconciliation GROUP BY req_id → covered by req_id index
CREATE INDEX IF NOT EXISTS cost_metrics_raw_created_at_idx
  ON cost_metrics_raw (created_at DESC);
CREATE INDEX IF NOT EXISTS cost_metrics_raw_req_id_idx
  ON cost_metrics_raw (req_id);
CREATE INDEX IF NOT EXISTS cost_metrics_raw_user_route_idx
  ON cost_metrics_raw (user_id, route) WHERE user_id IS NOT NULL;

ALTER TABLE cost_metrics_raw ENABLE ROW LEVEL SECURITY;

-- Service-role-only: no SELECT/INSERT policy for authenticated users.
-- Inserts flow through observability.ts via admin client (RLS bypass).

-- 2) Daily aggregates ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_metrics (
  day             DATE NOT NULL,
  user_id         UUID,                                 -- null for system / cron
  route           TEXT NOT NULL,
  prompt_tokens   BIGINT NOT NULL DEFAULT 0,
  output_tokens   BIGINT NOT NULL DEFAULT 0,
  request_count   INT NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(10, 6) NOT NULL DEFAULT 0,    -- computed per-day per-route
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (day, user_id, route)
);

-- Operators read-own surface (future /internal/cost dashboard).
CREATE INDEX IF NOT EXISTS cost_metrics_day_idx ON cost_metrics (day DESC);

ALTER TABLE cost_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own cost metrics"
  ON cost_metrics FOR SELECT TO authenticated
  USING (user_id = auth.uid());
