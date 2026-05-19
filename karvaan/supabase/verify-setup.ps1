# FRIX — Supabase Setup Verification Script (PowerShell)
# Usage: Replace placeholders and run this script to verify your Supabase setup
# Run in PowerShell: .\supabase\verify-setup.ps1

# ============================================================
# CONFIGURATION — Replace these values
# ============================================================
$SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"
$SUPABASE_ANON_KEY = "your-anon-key-here"

$headers = @{
  "apikey" = $SUPABASE_ANON_KEY
  "Authorization" = "Bearer $SUPABASE_ANON_KEY"
  "Content-Type" = "application/json"
  "Prefer" = "return=representation"
}

# ============================================================
# TEST 1: Categories (Guest Read — Should SUCCEED)
# ============================================================
Write-Host "`n?? Test 1: Categories (Guest Read)" -ForegroundColor Cyan
try {
  $categoriesResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/categories?select=*&order=sort_order" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
  if ($categoriesResponse.StatusCode -eq 200) {
    Write-Host "? PASS — Categories table accessible to guests (HTTP 200)" -ForegroundColor Green
    $categories = $categoriesResponse.Content | ConvertFrom-Json
    Write-Host "   Found $($categories.Count) categories" -ForegroundColor Gray
  } else {
    Write-Host "? FAIL — Categories returned HTTP $($categoriesResponse.StatusCode)" -ForegroundColor Red
  }
} catch {
  Write-Host "? FAIL — Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================
# TEST 2: Venues (Guest Read — Should SUCCEED)
# ============================================================
Write-Host "`n?? Test 2: Venues (Guest Read — Active Only)" -ForegroundColor Cyan
try {
  $venuesResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/venues?select=*&is_active=eq.true" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
  if ($venuesResponse.StatusCode -eq 200) {
    Write-Host "? PASS — Venues table accessible to guests (HTTP 200)" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — Venues returned HTTP $($venuesResponse.StatusCode)" -ForegroundColor Red
  }
} catch {
  Write-Host "? FAIL — Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================
# TEST 3: Profiles (Guest Read — Should FAIL)
# ============================================================
Write-Host "`n?? Test 3: Profiles (Guest Read — Should be blocked)" -ForegroundColor Cyan
try {
  $profilesResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/profiles?select=*" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "??  UNEXPECTED — Profiles returned HTTP $($profilesResponse.StatusCode) (expected 401)" -ForegroundColor Yellow
} catch {
  if ($_.Exception.Response.StatusCode -eq 401) {
    Write-Host "? PASS — Profiles table blocked for guests (HTTP 401)" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
  }
}

# ============================================================
# TEST 4: Saved Venues (Guest Read — Should FAIL)
# ============================================================
Write-Host "`n?? Test 4: Saved Venues (Guest Read — Should be blocked)" -ForegroundColor Cyan
try {
  $savedResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/saved_venues?select=*" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "??  UNEXPECTED — Saved venues returned HTTP $($savedResponse.StatusCode) (expected 401)" -ForegroundColor Yellow
} catch {
  if ($_.Exception.Response.StatusCode -eq 401) {
    Write-Host "? PASS — Saved venues table blocked for guests (HTTP 401)" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
  }
}

# ============================================================
# TEST 5: Venue Reports (Guest Read — Should FAIL)
# ============================================================
Write-Host "`n?? Test 5: Venue Reports (Guest Read — Should be blocked)" -ForegroundColor Cyan
try {
  $reportsResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/venue_reports?select=*" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "??  UNEXPECTED — Venue reports returned HTTP $($reportsResponse.StatusCode) (expected 401)" -ForegroundColor Yellow
} catch {
  if ($_.Exception.Response.StatusCode -eq 401) {
    Write-Host "? PASS — Venue reports table blocked for guests (HTTP 401)" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
  }
}

# ============================================================
# TEST 6: Venue Updates (Guest Read — Should SUCCEED)
# ============================================================
Write-Host "`n?? Test 6: Venue Updates (Guest Read — Active Only)" -ForegroundColor Cyan
try {
  $updatesResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/venue_updates?select=*&is_active=eq.true" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
  if ($updatesResponse.StatusCode -eq 200) {
    Write-Host "? PASS — Venue updates table accessible to guests (HTTP 200)" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — Venue updates returned HTTP $($updatesResponse.StatusCode)" -ForegroundColor Red
  }
} catch {
  Write-Host "? FAIL — Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================
# SUMMARY
# ============================================================
Write-Host "`n?? Test 7: venues_near RPC (DHA Karachi smoke test)" -ForegroundColor Cyan
try {
  $rpcBody = @{
    lat = 24.8127
    lng = 67.0730
    radius_km = 5
  } | ConvertTo-Json

  $nearbyResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/venues_near" -Method POST -Headers $headers -Body $rpcBody -ErrorAction Stop
  $nearbyCount = if ($nearbyResponse -is [System.Array]) { $nearbyResponse.Count } else { 1 }

  if ($nearbyCount -gt 0) {
    Write-Host "? PASS — venues_near returned $nearbyCount row(s) for DHA coordinates" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — venues_near returned 0 rows for DHA coordinates" -ForegroundColor Red
  }
} catch {
  Write-Host "? FAIL — venues_near RPC request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n?? Test 8: Seeded venue coordinates coverage (>= 70%)" -ForegroundColor Cyan
try {
  $seededVenues = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/venues?select=id,coordinates&id=like.*f3a4b10*" -Method GET -Headers $headers -ErrorAction Stop
  $seededTotal = if ($seededVenues -is [System.Array]) { $seededVenues.Count } elseif ($null -eq $seededVenues) { 0 } else { 1 }
  $seededWithCoordinates = 0

  if ($seededVenues -is [System.Array]) {
    foreach ($venue in $seededVenues) {
      if ($null -ne $venue.coordinates) { $seededWithCoordinates++ }
    }
  } elseif ($null -ne $seededVenues -and $null -ne $seededVenues.coordinates) {
    $seededWithCoordinates = 1
  }

  $coveragePct = if ($seededTotal -eq 0) { 0 } else { [math]::Round(($seededWithCoordinates / $seededTotal) * 100, 2) }

  if ($coveragePct -ge 70) {
    Write-Host "? PASS — Seeded coordinate coverage is $coveragePct% ($seededWithCoordinates/$seededTotal)" -ForegroundColor Green
  } else {
    Write-Host "? FAIL — Seeded coordinate coverage is $coveragePct% ($seededWithCoordinates/$seededTotal), expected >= 70%" -ForegroundColor Red
  }
} catch {
  Write-Host "? FAIL — Seeded coverage check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "?? Verification Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Check Supabase Dashboard ? Table Editor (should show 6 tables)" -ForegroundColor White
Write-Host "2. Check Supabase Dashboard ? Database ? Functions (should show venues_near, search_venues)" -ForegroundColor White
Write-Host "3. Check Supabase Dashboard ? Storage (should show venue-images and avatars buckets)" -ForegroundColor White
Write-Host "4. Run: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts" -ForegroundColor White
Write-Host "`n" -ForegroundColor White
