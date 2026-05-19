-- FRIX — Fix Venue Location Fields
-- Adds flat lat/lng columns for easier frontend consumption

-- 1. Add columns to venues table
ALTER TABLE venues 
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- 2. Populate columns from existing geography data
UPDATE venues
SET 
  lat = ST_Y(coordinates::geometry),
  lng = ST_X(coordinates::geometry)
WHERE coordinates IS NOT NULL;

-- 3. Update the venues_near function to return these columns (it already returns * but good to ensure)
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
