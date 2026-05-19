-- FRIX — TICKET 003 v5 additions
-- Adds onboarding quiz profile fields and ensures venues_near RPC definition is present.

-- ============================================================================
-- 1. ADD PROFILE QUIZ COLUMNS
-- ============================================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS group_preference TEXT,
  ADD COLUMN IF NOT EXISTS time_preference TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_group_preference'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT check_group_preference
      CHECK (
        group_preference IN ('solo', 'partner', 'family', 'friends')
        OR group_preference IS NULL
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_time_preference'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT check_time_preference
      CHECK (
        time_preference IN (
          'weekday_morning',
          'weekday_afternoon',
          'weekday_evening',
          'weekend_day',
          'weekend_night',
          'flexible'
        )
        OR time_preference IS NULL
      );
  END IF;
END
$$;

-- ============================================================================
-- 2. ENSURE venues_near RPC EXISTS (Near Me feature)
-- ============================================================================
CREATE OR REPLACE FUNCTION venues_near(lat FLOAT, lng FLOAT, radius_km FLOAT DEFAULT 5)
RETURNS SETOF venues
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM venues
  WHERE is_active = true
    AND coordinates IS NOT NULL
    AND ST_DWithin(
      coordinates,
      ST_GeogFromText('SRID=4326;POINT(' || lng || ' ' || lat || ')'),
      radius_km * 1000
    )
  ORDER BY ST_Distance(
    coordinates,
    ST_GeogFromText('SRID=4326;POINT(' || lng || ' ' || lat || ')')
  );
$$;

-- ============================================================================
-- 3. MANUAL VALIDATION QUERIES (run in SQL editor after migration 003)
-- ============================================================================
-- -- DHA Karachi smoke test (should return rows):
-- SELECT id, name
-- FROM venues_near(24.8127, 67.0730, 5)
-- LIMIT 10;
--
-- -- Seed coordinate coverage target (should be >= 70):
-- WITH seeded AS (
--   SELECT *
--   FROM venues
--   WHERE id::text ~ '^[1-6]f3a4b10-'
-- )
-- SELECT
--   COUNT(*) AS seeded_total,
--   COUNT(*) FILTER (WHERE coordinates IS NOT NULL) AS seeded_with_coordinates,
--   ROUND((COUNT(*) FILTER (WHERE coordinates IS NOT NULL)::numeric / NULLIF(COUNT(*), 0)) * 100, 2) AS seeded_coordinates_pct
-- FROM seeded;
