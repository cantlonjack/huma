-- ─── HUMA Pattern Provenance: RPPL tracking fields ─────────────────────────
-- Additive migration. Three JSONB columns for provenance, composition, and
-- evidence. No existing data is modified — all columns are nullable with
-- empty-object defaults.

-- 1. Add provenance column (source, rpplId, sourceTradition, originalContext, keyReference)
ALTER TABLE patterns
  ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT '{}';

-- 2. Add composition column (links[], derivedFrom)
ALTER TABLE patterns
  ADD COLUMN IF NOT EXISTS composition JSONB DEFAULT '{}';

-- 3. Add evidence column (confidence, contextTags[], validationNotes)
ALTER TABLE patterns
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '{}';

-- 4. Index for querying patterns by RPPL ID (inside provenance JSONB)
CREATE INDEX IF NOT EXISTS idx_patterns_rppl_id
  ON patterns USING btree (((provenance->>'rpplId')))
  WHERE provenance->>'rpplId' IS NOT NULL;

-- 5. Index for querying patterns by source type
CREATE INDEX IF NOT EXISTS idx_patterns_source
  ON patterns USING btree (((provenance->>'source')))
  WHERE provenance->>'source' IS NOT NULL;

-- 6. GIN index on evidence context tags for array containment queries
CREATE INDEX IF NOT EXISTS idx_patterns_context_tags
  ON patterns USING gin ((evidence->'contextTags'))
  WHERE evidence->'contextTags' IS NOT NULL;
