-- FRIX — Storage Buckets Setup
-- Run this in Supabase SQL Editor AFTER running 001_database_setup.sql
-- Creates venue-images and avatars buckets with correct RLS policies

-- ============================================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================================

-- venue-images bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- avatars bucket (private — authenticated users only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. VENUE-IMAGES BUCKET POLICIES
-- ============================================================================

-- Public can read venue-images
CREATE POLICY "Anyone can view venue images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-images');

-- Admins can upload venue-images
CREATE POLICY "Admins can upload venue images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'venue-images' AND
    auth.jwt()->>'user_role' = 'admin'
  );

-- Admins can update venue-images
CREATE POLICY "Admins can update venue images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'venue-images' AND
    auth.jwt()->>'user_role' = 'admin'
  );

-- Admins can delete venue-images
CREATE POLICY "Admins can delete venue images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'venue-images' AND
    auth.jwt()->>'user_role' = 'admin'
  );

-- ============================================================================
-- 3. AVATARS BUCKET POLICIES
-- ============================================================================

-- Users can read their own avatar
CREATE POLICY "Users can view own avatar"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
