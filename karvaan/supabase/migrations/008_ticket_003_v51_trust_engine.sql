-- FRIX — TICKET 003 v5.1 additions
-- Trust Engine tables, venues editorial columns, RPC, and seed data.

-- ============================================================================
-- 1. TRUST SIGNALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS venue_trust_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (
    signal_type IN (
      'team_visited',
      'hours_verified',
      'price_verified',
      'photos_current',
      'temporarily_closed',
      'permanently_closed'
    )
  ),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_by TEXT NOT NULL DEFAULT 'frix_team' CHECK (
    verified_by IN ('frix_team', 'community_report')
  ),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_signals_venue_id
  ON venue_trust_signals (venue_id);

CREATE INDEX IF NOT EXISTS idx_trust_signals_venue_type_expires
  ON venue_trust_signals (venue_id, signal_type, expires_at);

ALTER TABLE venue_trust_signals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venue_trust_signals'
      AND policyname = 'trust_signals_public_read'
  ) THEN
    CREATE POLICY "trust_signals_public_read"
      ON venue_trust_signals
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venue_trust_signals'
      AND policyname = 'trust_signals_admin_write'
  ) THEN
    CREATE POLICY "trust_signals_admin_write"
      ON venue_trust_signals
      FOR ALL
      USING (auth.jwt()->>'user_role' = 'admin')
      WITH CHECK (auth.jwt()->>'user_role' = 'admin');
  END IF;
END
$$;

-- ============================================================================
-- 2. CONTEXT TAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS venue_context_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  tag_category TEXT NOT NULL CHECK (
    tag_category IN (
      'parking',
      'vibe',
      'dress_code',
      'crowd',
      'reservation',
      'best_for',
      'price_reality',
      'kids'
    )
  ),
  tag_value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venue_id, tag_category)
);

CREATE INDEX IF NOT EXISTS idx_context_tags_venue_id
  ON venue_context_tags (venue_id);

ALTER TABLE venue_context_tags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venue_context_tags'
      AND policyname = 'context_tags_public_read'
  ) THEN
    CREATE POLICY "context_tags_public_read"
      ON venue_context_tags
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venue_context_tags'
      AND policyname = 'context_tags_admin_write'
  ) THEN
    CREATE POLICY "context_tags_admin_write"
      ON venue_context_tags
      FOR ALL
      USING (auth.jwt()->>'user_role' = 'admin')
      WITH CHECK (auth.jwt()->>'user_role' = 'admin');
  END IF;
END
$$;

-- ============================================================================
-- 3. NEW VENUE COLUMNS
-- ============================================================================
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS neighbourhood_notes TEXT,
  ADD COLUMN IF NOT EXISTS frix_verdict TEXT;

-- ============================================================================
-- 4. TRUST SUMMARY RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION get_venue_trust_summary(p_venue_id UUID)
RETURNS TABLE (
  signal_type TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  is_expired BOOLEAN,
  days_ago INTEGER
)
LANGUAGE sql
STABLE
AS $$
  WITH ranked AS (
    SELECT
      vts.signal_type,
      vts.verified_at,
      vts.verified_by,
      vts.expires_at,
      ROW_NUMBER() OVER (
        PARTITION BY vts.signal_type
        ORDER BY vts.verified_at DESC, vts.created_at DESC
      ) AS rn
    FROM venue_trust_signals vts
    WHERE vts.venue_id = p_venue_id
  )
  SELECT
    ranked.signal_type,
    ranked.verified_at,
    ranked.verified_by,
    CASE
      WHEN ranked.expires_at IS NOT NULL AND ranked.expires_at < NOW() THEN true
      ELSE false
    END AS is_expired,
    GREATEST(EXTRACT(DAY FROM NOW() - ranked.verified_at)::INTEGER, 0) AS days_ago
  FROM ranked
  WHERE ranked.rn = 1
  ORDER BY ranked.signal_type;
$$;

-- ============================================================================
-- 5. v5.1 SEED ADDITIONS
-- ============================================================================
UPDATE venues
SET
  neighbourhood_notes = seed.neighbourhood_notes,
  frix_verdict = seed.frix_verdict
FROM (
  VALUES
    (
      '79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid,
      'Enter from Fatima Jinnah Road. Parking inside the compound is free on weekdays. On weekends, use the side street parallel to the main gate.',
      'The architecture alone is worth an hour. One of the few places in Karachi that genuinely surprises you.'
    ),
    (
      'e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid,
      'The book fair stalls spill out to the left as you enter. Paid parking is available on the road; free inside for foot traffic.',
      'Go for the Friday book bazaar, not the building. The outdoor atmosphere is the real draw.'
    ),
    (
      '6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid,
      'Bar BQ Tonight is a Karachi legend. Arrive early or use valet as the Boating Basin area gets extremely crowded.',
      'The standard for BBQ in the city. The rooftop seating offers a classic Karachi vibe. Consistency is their hallmark.'
    ),
    (
      '92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid,
      'Enter from the main gate on M.A. Jinnah Road. Walking from the gate to the mausoleum takes about 10-15 minutes.',
      'A serene and powerful monument. Best visited in the late afternoon. Respectful attire is expected.'
    ),
    (
      'be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid,
      'Sea View road runs parallel to the beach. Street parking is free but congested on Friday evenings. The camel section is toward the north end.',
      'Chaotic, colourful, and completely Karachi. Best at golden hour with chaat from the right-side stalls.'
    )
) AS seed(venue_id, neighbourhood_notes, frix_verdict)
WHERE venues.id = seed.venue_id;

INSERT INTO venue_trust_signals (
  venue_id,
  signal_type,
  verified_at,
  verified_by,
  expires_at,
  notes
)
SELECT
  seed.venue_id,
  seed.signal_type,
  seed.verified_at,
  seed.verified_by,
  seed.expires_at,
  seed.notes
FROM (
  VALUES
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'team_visited',      NOW() - INTERVAL '3 days',  'frix_team',      NULL::timestamptz,                   'Full visit completed.'),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'hours_verified',    NOW() - INTERVAL '3 days',  'frix_team',      NOW() + INTERVAL '27 days',          NULL),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'team_visited',      NOW() - INTERVAL '8 days',  'frix_team',      NULL::timestamptz,                   'Friday site check done.'),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'hours_verified',    NOW() - INTERVAL '8 days',  'frix_team',      NOW() + INTERVAL '22 days',          NULL),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'team_visited',      NOW() - INTERVAL '5 days',  'frix_team',      NULL::timestamptz,                   'Saturday evening visit done.'),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'hours_verified',    NOW() - INTERVAL '5 days',  'frix_team',      NOW() + INTERVAL '25 days',          NULL),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'team_visited',      NOW() - INTERVAL '15 days', 'frix_team',      NULL::timestamptz,                   'Visited recently.'),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'hours_verified',    NOW() - INTERVAL '15 days', 'frix_team',      NOW() + INTERVAL '15 days',          NULL),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'team_visited',      NOW() - INTERVAL '2 days',  'frix_team',      NULL::timestamptz,                   'Weekday evening beach check.'),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'hours_verified',    NOW() - INTERVAL '2 days',  'frix_team',      NOW() + INTERVAL '28 days',          NULL),
    ('79f4aecc-147a-496f-a65a-4c6c563efc3d'::uuid, 'hours_verified',    NOW() - INTERVAL '75 days', 'frix_team',      NOW() - INTERVAL '45 days',          'Expired — needs re-verification.'),
    ('79f4aecc-147a-496f-a65a-4c6c563efc3d'::uuid, 'temporarily_closed',NOW() - INTERVAL '2 days',  'community_report',  NOW() + INTERVAL '5 days',           'Temporary closure reported for maintenance.')
) AS seed(venue_id, signal_type, verified_at, verified_by, expires_at, notes)
WHERE EXISTS (
  SELECT 1
  FROM venues v
  WHERE v.id = seed.venue_id
)
AND NOT EXISTS (
  SELECT 1
  FROM venue_trust_signals existing
  WHERE existing.venue_id = seed.venue_id
    AND existing.signal_type = seed.signal_type
    AND existing.verified_by = seed.verified_by
);

INSERT INTO venue_context_tags (
  venue_id,
  tag_category,
  tag_value,
  sort_order
)
SELECT
  seed.venue_id,
  seed.tag_category,
  seed.tag_value,
  seed.sort_order
FROM (
  VALUES
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'parking',       'easy',            1),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'vibe',          'quiet',           2),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'crowd',         'mixed_ages',      3),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'dress_code',    'casual',          4),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'best_for',      'family_outing',   5),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'price_reality', 'budget_friendly', 6),
    ('79fcf081-7794-4b09-a8de-c7538cc6e81b'::uuid, 'kids',          'great_for_kids',  7),

    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'parking',       'street_only',     1),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'vibe',          'casual',          2),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'crowd',         'mixed_ages',      3),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'dress_code',    'casual',          4),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'best_for',      'solo',            5),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'price_reality', 'budget_friendly', 6),
    ('e6bf479b-1a6a-4920-ac3d-a7147ca7c144'::uuid, 'kids',          'kids_ok',         7),

    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'parking',       'valet_available', 1),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'vibe',          'lively',          2),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'crowd',         'mixed_ages',      3),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'dress_code',    'smart_casual',    4),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'best_for',      'date_night',      5),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'price_reality', 'splurge_worthy',  6),
    ('6bff5b9e-d706-4321-9158-c0c94e4f00c6'::uuid, 'reservation',   'recommended',     7),

    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'parking',       'difficult',       1),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'vibe',          'loud',            2),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'crowd',         'mixed_ages',      3),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'dress_code',    'casual',          4),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'best_for',      'big_group',       5),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'price_reality', 'mid_range',       6),
    ('92cb4cfd-a6a2-44e5-8f72-872c7472231e'::uuid, 'kids',          'kids_ok',         7),

    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'parking',       'street_only',     1),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'vibe',          'lively',          2),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'crowd',         'mixed_ages',      3),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'dress_code',    'casual',          4),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'best_for',      'family_outing',   5),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'price_reality', 'budget_friendly', 6),
    ('be97320f-81fa-4a8e-bf93-6674ff3823e2'::uuid, 'kids',          'great_for_kids',  7)
) AS seed(venue_id, tag_category, tag_value, sort_order)
WHERE EXISTS (
  SELECT 1 FROM venues v WHERE v.id = seed.venue_id
)
ON CONFLICT (venue_id, tag_category) DO UPDATE
SET
  tag_value = EXCLUDED.tag_value,
  sort_order = EXCLUDED.sort_order;
