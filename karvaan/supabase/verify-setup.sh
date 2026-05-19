#!/bin/bash
# FRIX — Supabase Setup Verification Script
# Usage: Replace placeholders and run this script to verify your Supabase setup

# ============================================================
# CONFIGURATION — Replace these values
# ============================================================
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"

# ============================================================
# TEST 1: Categories (Guest Read — Should SUCCEED)
# ============================================================
echo "🧪 Test 1: Categories (Guest Read)"
CATEGORIES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$SUPABASE_URL/rest/v1/categories?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

if [ "$CATEGORIES_RESPONSE" = "200" ]; then
  echo "✅ PASS — Categories table accessible to guests (HTTP $CATEGORIES_RESPONSE)"
else
  echo "❌ FAIL — Categories table not accessible (HTTP $CATEGORIES_RESPONSE)"
fi

# ============================================================
# TEST 2: Venues (Guest Read — Should SUCCEED)
# ============================================================
echo ""
echo "🧪 Test 2: Venues (Guest Read — Active Only)"
VENUES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$SUPABASE_URL/rest/v1/venues?select=*&is_active=eq.true" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

if [ "$VENUES_RESPONSE" = "200" ]; then
  echo "✅ PASS — Venues table accessible to guests (HTTP $VENUES_RESPONSE)"
else
  echo "❌ FAIL — Venues table not accessible (HTTP $VENUES_RESPONSE)"
fi

# ============================================================
# TEST 3: Profiles (Guest Read — Should FAIL)
# ============================================================
echo ""
echo "🧪 Test 3: Profiles (Guest Read — Should be blocked)"
PROFILES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$SUPABASE_URL/rest/v1/profiles?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

if [ "$PROFILES_RESPONSE" = "401" ]; then
  echo "✅ PASS — Profiles table blocked for guests (HTTP $PROFILES_RESPONSE)"
else
  echo "⚠️  UNEXPECTED — Profiles returned HTTP $PROFILES_RESPONSE (expected 401)"
fi

# ============================================================
# TEST 4: Saved Venues (Guest Read — Should FAIL)
# ============================================================
echo ""
echo "🧪 Test 4: Saved Venues (Guest Read — Should be blocked)"
SAVED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$SUPABASE_URL/rest/v1/saved_venues?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

if [ "$SAVED_RESPONSE" = "401" ]; then
  echo "✅ PASS — Saved venues table blocked for guests (HTTP $SAVED_RESPONSE)"
else
  echo "⚠️  UNEXPECTED — Saved venues returned HTTP $SAVED_RESPONSE (expected 401)"
fi

# ============================================================
# TEST 5: Categories Data (Should return 6 rows)
# ============================================================
echo ""
echo "🧪 Test 5: Categories Seed Data (Should return 6 categories)"
CATEGORIES_DATA=$(curl -s -X GET "$SUPABASE_URL/rest/v1/categories?select=*&order=sort_order" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

CATEGORIES_COUNT=$(echo "$CATEGORIES_DATA" | grep -o '"slug"' | wc -l)

if [ "$CATEGORIES_COUNT" -eq 6 ]; then
  echo "✅ PASS — Found 6 seed categories"
  echo "$CATEGORIES_DATA" | python3 -m json.tool 2>/dev/null || echo "$CATEGORIES_DATA"
else
  echo "⚠️  WARNING — Found $CATEGORIES_COUNT categories (expected 6)"
  echo "Run the migration script if categories are missing"
fi

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "🧪 Test 6: venues_near RPC (DHA Karachi smoke test)"
NEARBY_DATA=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/venues_near" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"lat":24.8127,"lng":67.0730,"radius_km":5}')

NEARBY_COUNT=$(echo "$NEARBY_DATA" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d, list) else (1 if d else 0))" 2>/dev/null || echo "0")
if [ "$NEARBY_COUNT" -gt 0 ]; then
  echo "✅ PASS — venues_near returned $NEARBY_COUNT row(s) for DHA coordinates"
else
  echo "❌ FAIL — venues_near returned 0 rows for DHA coordinates"
fi

echo ""
echo "🧪 Test 7: Seeded venue coordinates coverage (>= 70%)"
SEEDED_DATA=$(curl -s -X GET "$SUPABASE_URL/rest/v1/venues?select=id,coordinates&id=like.*f3a4b10*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

read -r SEEDED_TOTAL SEEDED_WITH_COORDS SEEDED_PCT <<< "$(echo "$SEEDED_DATA" | python3 -c "import sys,json; d=json.load(sys.stdin); total=len(d) if isinstance(d,list) else (1 if d else 0); with_coords=sum(1 for v in d if isinstance(v,dict) and v.get('coordinates') is not None) if isinstance(d,list) else 0; pct=round((with_coords/total*100),2) if total else 0; print(total, with_coords, pct)" 2>/dev/null || echo "0 0 0")"

if python3 -c "import sys; sys.exit(0 if float('$SEEDED_PCT') >= 70 else 1)" 2>/dev/null; then
  echo "✅ PASS — Seeded coordinate coverage is $SEEDED_PCT% ($SEEDED_WITH_COORDS/$SEEDED_TOTAL)"
else
  echo "❌ FAIL — Seeded coordinate coverage is $SEEDED_PCT% ($SEEDED_WITH_COORDS/$SEEDED_TOTAL), expected >= 70%"
fi

echo ""
echo "================================================"
echo "📊 Verification Complete"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Check Supabase Dashboard → Table Editor (should show 6 tables)"
echo "2. Check Supabase Dashboard → Database → Functions (should show venues_near, search_venues)"
echo "3. Check Supabase Dashboard → Storage (should show venue-images and avatars buckets)"
echo "4. Run: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts"
echo ""
