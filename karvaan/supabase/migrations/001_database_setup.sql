-- FRIX — Supabase Database Setup
-- TICKET 003: Complete database schema with all tables, RLS, functions, indexes, and seed data
-- Run this in Supabase SQL Editor in order

-- ============================================================================
-- 1. ENABLE POSTGIS EXTENSION (required for location-based queries)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 2. CREATE PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT UNIQUE,
  avatar_url TEXT,
  preferences JSONB DEFAULT '[]'::jsonb, -- Array of category slugs: ["historical", "dine"]
  group_preference TEXT CONSTRAINT check_group_preference CHECK (
    group_preference IN ('solo', 'partner', 'family', 'friends')
    OR group_preference IS NULL
  ),
  time_preference TEXT CONSTRAINT check_time_preference CHECK (
    time_preference IN (
      'weekday_morning',
      'weekday_afternoon',
      'weekday_evening',
      'weekend_day',
      'weekend_night',
      'flexible'
    )
    OR time_preference IS NULL
  ),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE VENUES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  frix_notes TEXT, -- Editorial copy written by Frix team
  city TEXT NOT NULL DEFAULT 'Karachi',
  neighbourhood TEXT, -- Locality name (e.g. "Clifton", "Saddar")
  address_line TEXT,
  coordinates GEOGRAPHY(POINT, 4326), -- PostGIS geography type
  base_price NUMERIC(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'PKR',
  operating_hours JSONB, -- Format: { "monday": "9:00 AM - 6:00 PM", ... }
  images TEXT[] DEFAULT '{}', -- Array of public URLs from Storage
  contact_phone TEXT,
  contact_email TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_bookable BOOLEAN DEFAULT FALSE, -- Phase 2
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. CREATE SAVED_VENUES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id) -- Prevent duplicate saves
);

-- ============================================================================
-- 6. CREATE VENUE_REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS venue_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('wrong_hours', 'venue_closed', 'wrong_info', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. CREATE VENUE_UPDATES TABLE (for "TONIGHT" badges and live events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS venue_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  expires_at TIMESTAMPTZ NOT NULL, -- When the update should stop showing
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_updates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. CREATE RLS POLICIES
-- ============================================================================

-- profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- categories: Public read access (everyone can browse)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- venues: Public read for active venues, admin write
CREATE POLICY "Anyone can view active venues"
  ON venues FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert venues"
  ON venues FOR INSERT
  WITH CHECK (auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Admins can update venues"
  ON venues FOR UPDATE
  USING (auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Admins can delete venues"
  ON venues FOR DELETE
  USING (auth.jwt()->>'user_role' = 'admin');

-- saved_venues: Users can only see and manage their own saved venues
CREATE POLICY "Users can view own saved venues"
  ON saved_venues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save venues"
  ON saved_venues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave venues"
  ON saved_venues FOR DELETE
  USING (auth.uid() = user_id);

-- venue_reports: Users can only see their own reports, admin can view all
CREATE POLICY "Users can view own reports"
  ON venue_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON venue_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON venue_reports FOR SELECT
  USING (auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Admins can update reports"
  ON venue_reports FOR UPDATE
  USING (auth.jwt()->>'user_role' = 'admin');

-- venue_updates: Public read for active updates
CREATE POLICY "Anyone can view active venue updates"
  ON venue_updates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert venue updates"
  ON venue_updates FOR INSERT
  WITH CHECK (auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Admins can update venue updates"
  ON venue_updates FOR UPDATE
  USING (auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Admins can delete venue updates"
  ON venue_updates FOR DELETE
  USING (auth.jwt()->>'user_role' = 'admin');

-- ============================================================================
-- 10. CREATE handle_new_user() TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger the function every time a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 11. CREATE DATABASE FUNCTIONS
-- ============================================================================

-- venues_near: Find venues within a radius (km) of a given lat/lng
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

-- search_venues: Full-text search across venue name, description, neighbourhood
CREATE OR REPLACE FUNCTION search_venues(search_query TEXT, category_filter UUID DEFAULT NULL)
RETURNS SETOF venues
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM venues
  WHERE is_active = true
    AND (
      search_query = '' OR
      name ILIKE '%' || search_query || '%' OR
      COALESCE(description, '') ILIKE '%' || search_query || '%' OR
      COALESCE(neighbourhood, '') ILIKE '%' || search_query || '%' OR
      COALESCE(frix_notes, '') ILIKE '%' || search_query || '%'
    )
    AND (category_filter IS NULL OR category_id = category_filter)
  ORDER BY
    CASE
      WHEN name ILIKE search_query || '%' THEN 1
      WHEN name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    created_at DESC;
$$;

-- ============================================================================
-- 12. CREATE PERFORMANCE INDEXES
-- ============================================================================

-- venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_category_id ON venues(category_id);
CREATE INDEX IF NOT EXISTS idx_venues_is_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_neighbourhood ON venues(neighbourhood);
CREATE INDEX IF NOT EXISTS idx_venues_created_at ON venues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_venues_coordinates ON venues USING GIST(coordinates);

-- GIN indexes for full-text search support
CREATE INDEX IF NOT EXISTS idx_venues_name_search ON venues USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_venues_description_search ON venues USING gin(to_tsvector('simple', COALESCE(description, '')));

-- saved_venues indexes
CREATE INDEX IF NOT EXISTS idx_saved_venues_user_id ON saved_venues(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_venues_venue_id ON saved_venues(venue_id);

-- venue_reports indexes
CREATE INDEX IF NOT EXISTS idx_venue_reports_venue_id ON venue_reports(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reports_user_id ON venue_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_reports_status ON venue_reports(status);

-- venue_updates indexes
CREATE INDEX IF NOT EXISTS idx_venue_updates_venue_id ON venue_updates(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_updates_is_active ON venue_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_venue_updates_expires_at ON venue_updates(expires_at);

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);

-- ============================================================================
-- 13. SEED CATEGORIES (6 Phase 1 categories)
-- ============================================================================
INSERT INTO categories (name, slug, icon_url, sort_order) VALUES
  ('Historical', 'historical', NULL, 1),
  ('Dine', 'dine', NULL, 2),
  ('Arena', 'arena', NULL, 3),
  ('Art', 'art', NULL, 4),
  ('Nature', 'nature', NULL, 5),
  ('Shopping', 'shopping', NULL, 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 14. ADMIN SETUP (run this separately for security — update email as needed)
-- ============================================================================
-- Uncomment and run after creating admin user:
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"user_role": "admin"}'
-- WHERE email = 'admin@frix.pk';
