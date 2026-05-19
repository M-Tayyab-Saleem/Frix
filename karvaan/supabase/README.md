# FRIX — Supabase Setup Guide

## Overview
This directory contains all SQL migrations and setup scripts for the Frix Supabase backend.

## Directory Structure
```
supabase/
├── migrations/
│   ├── 001_database_setup.sql    # All tables, RLS, functions, indexes, seed data
│   ├── 002_storage_buckets.sql   # Storage buckets and their policies
│   ├── 003_seed_dummy_venues.sql # 30 QA-ready dummy venues + TONIGHT update
│   ├── 004_ticket_003_profile_quiz_and_nearby.sql # v5 profile prefs + venues_near safeguard
│   └── 008_ticket_003_v51_trust_engine.sql # v5.1 trust engine schema + seed additions
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites
1. Create a Supabase project at https://supabase.com
2. Note your project ID from Project Settings → API
3. Install Supabase CLI: `npm install -g supabase`

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/migrations/001_database_setup.sql`
3. Paste into the SQL Editor and click "Run"
4. Verify success (no error messages)

This script creates:
- ✅ 6 tables: `profiles`, `categories`, `venues`, `saved_venues`, `venue_reports`, `venue_updates`
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ RLS policies for guest, user, and admin access
- ✅ `handle_new_user()` trigger (auto-creates profile on signup)
- ✅ `venues_near()` function (location-based search)
- ✅ `search_venues()` function (full-text search)
- ✅ Performance indexes
- ✅ 6 seed categories (Historical, Dine, Arena, Art, Nature, Shopping)

### Step 2: Run Storage Buckets Migration

1. In Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/migrations/002_storage_buckets.sql`
3. Paste into the SQL Editor and click "Run"

This creates:
- ✅ `venue-images` bucket (public read, admin write)
- ✅ `avatars` bucket (private, user-specific access)

### Step 3: Run v5 Additions Migration (TICKET 003)

1. In Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/004_ticket_003_profile_quiz_and_nearby.sql`
3. Paste into the SQL Editor and click "Run"

This adds/ensures:
- ✅ `profiles.group_preference`
- ✅ `profiles.time_preference`
- ✅ `venues_near()` RPC definition

### Step 3B: Run v5.1 Trust Engine Migration (TICKET 003 additions)
Run this after Step 4 if you want the v5.1 trust/context seed rows inserted in the same pass.

1. In Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/008_ticket_003_v51_trust_engine.sql`
3. Paste into the SQL Editor and click "Run"

This adds:
- ✅ `venue_trust_signals` table + indexes + RLS (public read, admin write)
- ✅ `venue_context_tags` table + unique `(venue_id, tag_category)` + RLS
- ✅ `venues.neighbourhood_notes`
- ✅ `venues.frix_verdict`
- ✅ `get_venue_trust_summary()` RPC
- ✅ v5.1 trust signal/context tag seed data

### Step 4: Run Dummy Data Seed Migration (TICKET 003B)

1. In Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/migrations/003_seed_dummy_venues.sql`
3. Paste into the SQL Editor and click "Run"

This seeds:
- ✅ 30 active venues (5 per category across 6 categories)
- ✅ Karachi neighbourhood spread for map/list testing
- ✅ Images on every venue (with multiple-carousel cases)
- ✅ Edge-case venues (NULL coordinates, NULL operating_hours, free pricing)
- ✅ Active TONIGHT `venue_update`

### Step 5: Generate TypeScript Types

Run this command from the project root after migrations are complete:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

The generated file is already created at `src/types/database.ts` with manual types, but you should regenerate it after any schema changes.

### Step 6: Set Admin Role (Optional)

If you need admin access for venue management:

1. Create a user in Supabase Auth with email `admin@frix.pk` (or your admin email)
2. Run this SQL in the SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"user_role": "admin"}'
WHERE email = 'admin@frix.pk';
```

### Step 7: Configure Environment Variables

Create a `.env.local` file in the project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from: Supabase Dashboard → Project Settings → API

## Verification Checklist

After running all migrations, verify the following:

### Tables
- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Confirm all 8 tables exist: `profiles`, `categories`, `venues`, `saved_venues`, `venue_reports`, `venue_updates`, `venue_trust_signals`, `venue_context_tags`

### Row Level Security
- [ ] Click on each table → Policies tab
- [ ] Confirm RLS is enabled and policies are present

### Guest Access (Unauthenticated)
Test with curl (replace placeholders):

```bash
# Test categories read (should succeed)
curl -X GET 'https://YOUR_PROJECT_ID.supabase.co/rest/v1/categories' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test venues read (should succeed — returns seeded active venues)
curl -X GET 'https://YOUR_PROJECT_ID.supabase.co/rest/v1/venues?is_active=eq.true' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test profiles read (should fail — requires auth)
curl -X GET 'https://YOUR_PROJECT_ID.supabase.co/rest/v1/profiles' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Expected results:
- ✅ Categories: Returns 6 seed categories
- ✅ Venues: Returns 30+ active venues after migration 003
- ✅ Profiles: Returns 401 Unauthorized (correct — requires auth)

### Functions
- [ ] Go to Supabase Dashboard → Database → Functions
- [ ] Confirm `venues_near`, `search_venues`, and `get_venue_trust_summary` appear in the list
- [ ] Run `SELECT * FROM venues_near(24.8127, 67.0730, 5);` and confirm it returns rows

### Seed Data Quality
- [ ] Confirm seeded coordinate coverage is at least 70%
- [ ] Query:
  ```sql
  WITH seeded AS (
    SELECT *
    FROM venues
    WHERE id::text ~ '^[1-6]f3a4b10-'
  )
  SELECT
    COUNT(*) AS seeded_total,
    COUNT(*) FILTER (WHERE coordinates IS NOT NULL) AS seeded_with_coordinates,
    ROUND((COUNT(*) FILTER (WHERE coordinates IS NOT NULL)::numeric / NULLIF(COUNT(*), 0)) * 100, 2) AS seeded_coordinates_pct
  FROM seeded;
  ```

### Storage Buckets
- [ ] Go to Supabase Dashboard → Storage
- [ ] Confirm both `venue-images` and `avatars` buckets exist
- [ ] `venue-images` should show "Public" badge
- [ ] `avatars` should show "Private" badge

## Database Schema

### Tables Overview

| Table | Purpose | Guest Access | User Access | Admin Access |
|---|---|---|---|---|
| `profiles` | User profiles | ❌ | Own only | All |
| `categories` | Venue categories | ✅ Read | ❌ | Write |
| `venues` | Venue listings | ✅ Read (active only) | ❌ | Write |
| `saved_venues` | User saved venues | ❌ | Own only | All |
| `venue_reports` | Issue reports | ❌ | Own only | All |
| `venue_updates` | Live events/updates | ✅ Read (active only) | ❌ | Write |

### Key Relationships

```
auth.users (1) ──→ profiles (1)
categories (1) ──→ venues (N)
profiles (1) ──→ saved_venues (N) ←── venues (1)
profiles (1) ──→ venue_reports (N) ←── venues (1)
venues (1) ──→ venue_updates (N)
```

### Functions

#### `venues_near(lat, lng, radius_km)`
Returns active venues within a radius of a given coordinate.

```typescript
// Example usage:
const { data } = await supabase.rpc('venues_near', {
  lat: 24.8607,
  lng: 67.0011,
  radius_km: 5
});
```

#### `search_venues(search_query, category_filter)`
Full-text search across venue name, description, neighbourhood, and frix_notes.

```typescript
// Example usage:
const { data } = await supabase.rpc('search_venues', {
  search_query: 'museum',
  category_filter: 'uuid-here' // optional
});
```

## Troubleshooting

### "Permission denied" errors
- Check that RLS policies are enabled on the table
- Verify the anon key is being used for public reads
- Check that `is_active = true` for venues/categories reads

### Functions not appearing
- Ensure PostGIS extension is enabled: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Re-run the migration script in SQL Editor

### Storage bucket upload fails
- Check bucket is created: `SELECT * FROM storage.buckets;`
- Verify RLS policies exist for the bucket
- Ensure file size is within limits (5MB for venue-images, 2MB for avatars)

### TypeScript types incorrect
- Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts`
- Commit the generated file to version control

## Next Steps

After database setup is complete:
1. Proceed to TICKET 004 — Global Providers & Root Setup
2. Replace dummy venues with launch-quality editorial data (100+ target in PRD v4 §0.6)
3. Upload production venue images to the `venue-images` storage bucket

---

**Support:** For questions about the database schema or migrations, refer to `docs/backend-structure.md` in the project root.
