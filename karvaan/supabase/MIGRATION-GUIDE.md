# FRIX — Quick Start: Running Supabase Migrations

## 🚀 Quick Setup (5 Minutes)

### 1️⃣ Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose your organization
4. Set project name: `frix`
5. Set database password (save it securely)
6. Choose region closest to Pakistan (preferably `Singapore` or `Mumbai`)
7. Wait for project to initialize (~2 minutes)

### 2️⃣ Run Migration 001 — Database Schema
1. Open Supabase Dashboard → **SQL Editor**
2. Open file: `supabase/migrations/001_database_setup.sql`
3. **Select All** (Ctrl+A) and **Copy** (Ctrl+C)
4. **Paste** into SQL Editor
5. Click **"Run"** button
6. Wait for success message (no errors)

✅ This creates:
- 6 tables: `profiles`, `categories`, `venues`, `saved_venues`, `venue_reports`, `venue_updates`
- RLS policies on all tables
- `venues_near()` and `search_venues()` functions
- Performance indexes
- 6 seed categories

### 3️⃣ Run Migration 002 — Storage Buckets
1. In SQL Editor (same page)
2. Open file: `supabase/migrations/002_storage_buckets.sql`
3. **Select All** and **Copy**
4. **Paste** into SQL Editor (clear previous query first)
5. Click **"Run"**

✅ This creates:
- `venue-images` bucket (public)
- `avatars` bucket (private)

### 4️⃣ Run Migration 004 — v5 Additions (TICKET 003)
1. In SQL Editor (same page)
2. Open file: `supabase/migrations/004_ticket_003_profile_quiz_and_nearby.sql`
3. **Select All** and **Copy**
4. **Paste** into SQL Editor (clear previous query first)
5. Click **"Run"**

✅ This adds:
- `profiles.group_preference`
- `profiles.time_preference`
- `venues_near()` RPC definition

### 5B️⃣ Run Migration 008 — v5.1 Trust Engine (TICKET 003 additions, run after Step 5)
1. In SQL Editor (same page)
2. Open file: `supabase/migrations/008_ticket_003_v51_trust_engine.sql`
3. **Select All** and **Copy**
4. **Paste** into SQL Editor (clear previous query first)
5. Click **"Run"**

✅ This adds:
- `venue_trust_signals` + indexes + RLS (public read, admin write)
- `venue_context_tags` + unique `(venue_id, tag_category)` + RLS
- `venues.neighbourhood_notes`
- `venues.frix_verdict`
- `get_venue_trust_summary()` RPC
- v5.1 seed additions for trust signals/context tags

### 5️⃣ Run Migration 003 — Dummy Venues (TICKET 003B)
1. In SQL Editor (same page)
2. Open file: `supabase/migrations/003_seed_dummy_venues.sql`
3. **Select All** and **Copy**
4. **Paste** into SQL Editor (clear previous query first)
5. Click **"Run"**

✅ This seeds:
- 30 active venues (5 per category across all 6 categories)
- Karachi neighbourhood distribution for list/map QA
- At least one active TONIGHT `venue_update`
- Edge cases: NULL coordinates, NULL operating_hours, and free venues

### 7️⃣ Verify Setup

#### Option A: Manual Check
1. Go to **Table Editor** → Should see 8 tables
2. Go to **Database → Functions** → Should see `venues_near`, `search_venues`, and `get_venue_trust_summary`
3. Go to **Storage** → Should see 2 buckets

#### Option B: Run Verification Script
```powershell
# Windows PowerShell
.\supabase\verify-setup.ps1

# Or Bash (Git Bash/WSL)
bash supabase/verify-setup.sh
```

**Before running:** Edit the script and replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your actual values from:
- Supabase Dashboard → **Project Settings** → **API**

### 8️⃣ Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 9️⃣ Configure Environment Variables
Create `.env.local` in project root:
```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 🔟 Generate TypeScript Types (Optional)
The types are already manually created in `src/types/database.ts`, but after any schema changes:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## ✅ Acceptance Criteria Checklist

After completing the setup, verify:

- [ ] All 8 tables visible in Supabase Table Editor
  - `profiles`, `categories`, `venues`, `saved_venues`, `venue_reports`, `venue_updates`, `venue_trust_signals`, `venue_context_tags`

- [ ] RLS enabled on all 8 tables
  - Click each table → Policies tab → "RLS enabled" badge

- [ ] Guest (unauthenticated) can SELECT from venues and categories
  - Run verification script or use curl commands below

- [ ] `venues_near`, `search_venues`, and `get_venue_trust_summary` functions appear in Supabase → Database → Functions
- [ ] DHA RPC check returns rows:
  ```sql
  SELECT * FROM venues_near(24.8127, 67.0730, 5);
  ```

- [ ] Seeded venue `coordinates` coverage is at least 70%

- [ ] `database.ts` generated and saved with correct types
  - File exists at: `src/types/database.ts`

- [ ] Both storage buckets created
  - `venue-images` (public)
  - `avatars` (private)

---

## 🧪 Manual Curl Verification

Replace placeholders and run in terminal:

```bash
# Test 1: Categories (should return 6 rows)
curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/categories?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test 2: Venues (should return seeded active venues)
curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/venues?select=*&is_active=eq.true' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test 3: Profiles (should return 401 — requires auth)
curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/profiles?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
You've already run the migration. All `CREATE TABLE` statements use `IF NOT EXISTS`, so this is safe to ignore.

### Error: "function already exists"
Same as above — functions use `CREATE OR REPLACE`, so this is normal.

### Categories not showing up
Check the `categories` table in Table Editor. If empty, manually insert:
```sql
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Historical', 'historical', 1),
  ('Dine', 'dine', 2),
  ('Arena', 'arena', 3),
  ('Art', 'art', 4),
  ('Nature', 'nature', 5),
  ('Shopping', 'shopping', 6);
```

### RLS blocking guest access to venues/categories
Verify these policies exist:
- `categories`: "Anyone can view categories" policy
- `venues`: "Anyone can view active venues" policy

If missing, re-run migration 001.

### Storage buckets not showing
Run migration 002 again. Buckets use `ON CONFLICT DO NOTHING` so re-running is safe.

---

## 📋 What Was Created

### Tables (6)
| Table | Rows | Purpose |
|---|---|---|
| `profiles` | 0 (created on signup) | User profiles linked to auth.users |
| `categories` | 6 (seeded) | Venue category filters |
| `venues` | 30+ (seeded by migration 003) | Venue listings |
| `saved_venues` | 0 | User bookmarked venues |
| `venue_reports` | 0 | User-submitted issue reports |
| `venue_updates` | 1+ | Live event updates ("TONIGHT" badges) |

### Functions (2)
| Function | Purpose |
|---|---|
| `venues_near(lat, lng, radius_km)` | Find venues near coordinates |
| `search_venues(search_query, category_filter)` | Full-text venue search |

### Storage Buckets (2)
| Bucket | Access | Max Size |
|---|---|---|
| `venue-images` | Public read, admin write | 5MB/file |
| `avatars` | User-specific read/write | 2MB/file |

---

**Next:** Proceed to TICKET 004 — Global Providers & Root Setup
