-- Add huma_context JSONB column to contexts table.
-- This stores the rich 9-dimension context model alongside the legacy known_context.
ALTER TABLE contexts ADD COLUMN IF NOT EXISTS huma_context JSONB DEFAULT '{}';
