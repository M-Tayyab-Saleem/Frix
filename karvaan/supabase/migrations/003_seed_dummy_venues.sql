-- FRIX — Dummy Venue Seed Data (TICKET 003B)
-- Run this in Supabase SQL Editor AFTER:
--   1) 001_database_setup.sql
--   2) 002_storage_buckets.sql
--
-- This script seeds 30 active venues (5 per category), realistic Karachi metadata,
-- image arrays, edge cases for QA, and an active TONIGHT venue_update.

-- ============================================================================
-- 1. ENSURE THE 6 PHASE-1 CATEGORIES EXIST
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
-- 2. UPSERT 30 ACTIVE VENUES (5 PER CATEGORY)
-- ============================================================================
WITH source_venues AS (
  SELECT * FROM (
    VALUES
      -- HISTORICAL (5)
      ('1f3a4b10-0001-4a11-8b11-000000000001'::uuid, 'historical', 'Mohatta Palace Museum', 'A 1920s landmark in Clifton known for sandstone architecture, curated exhibitions, and rotating cultural showcases. It remains one of Karachi''s most photogenic heritage stops.', 'The Frix team recommends visiting in the late morning when the courtyards are calmer and the galleries are easier to explore at your own pace.', 'Clifton', 'Hatim Alvi Road, Clifton, Karachi', 24.8130::double precision, 67.0252::double precision, 0::numeric, '{"monday":"10:00 AM - 06:00 PM","tuesday":"10:00 AM - 06:00 PM","wednesday":"10:00 AM - 06:00 PM","thursday":"10:00 AM - 06:00 PM","friday":"10:00 AM - 06:00 PM","saturday":"11:00 AM - 07:00 PM","sunday":"11:00 AM - 07:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/mohatta-1/1200/800','https://picsum.photos/seed/mohatta-2/1200/800','https://picsum.photos/seed/mohatta-3/1200/800']::text[], '+92 21 3583 7450', 'https://mohattapalacemuseum.com'),
      ('1f3a4b10-0002-4a11-8b11-000000000002'::uuid, 'historical', 'Frere Hall', 'This 19th-century civic hall in Saddar sits inside old gardens and hosts weekend book fairs, public art, and heritage walks. It is a familiar cultural landmark for locals.', 'The Frix team recommends arriving before sunset and walking both lawns before heading inside to catch temporary exhibitions.', 'Saddar', 'Fatima Jinnah Road, Saddar Town, Karachi', 24.8490::double precision, 67.0195::double precision, 0::numeric, '{"monday":"08:00 AM - 08:00 PM","tuesday":"08:00 AM - 08:00 PM","wednesday":"08:00 AM - 08:00 PM","thursday":"08:00 AM - 08:00 PM","friday":"08:00 AM - 08:00 PM","saturday":"08:00 AM - 09:00 PM","sunday":"08:00 AM - 09:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/frere-hall-1/1200/800','https://picsum.photos/seed/frere-hall-2/1200/800']::text[], '+92 21 9920 5655', 'https://karachiheritage.org/frere-hall'),
      ('1f3a4b10-0003-4a11-8b11-000000000003'::uuid, 'historical', 'Quaid-e-Azam House Museum', 'A preserved colonial residence that documents Muhammad Ali Jinnah''s final years in Karachi. The rooms and artefacts offer a compact but meaningful heritage visit.', 'The Frix team recommends pairing this with a nearby tea stop in Clifton to turn it into a relaxed two-hour outing.', 'Clifton', 'Fatima Jinnah Road, Clifton, Karachi', 24.8222::double precision, 67.0301::double precision, 300::numeric, '{"monday":"09:00 AM - 05:00 PM","tuesday":"09:00 AM - 05:00 PM","wednesday":"09:00 AM - 05:00 PM","thursday":"09:00 AM - 05:00 PM","friday":"09:00 AM - 05:00 PM","saturday":"10:00 AM - 06:00 PM","sunday":"10:00 AM - 06:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/quaid-house-1/1200/800']::text[], '+92 21 3568 4400', 'https://heritage.karachicity.gov.pk/quaid-house'),
      ('1f3a4b10-0004-4a11-8b11-000000000004'::uuid, 'historical', 'Wazir Mansion', 'An early 20th-century heritage home in old Karachi that attracts visitors interested in the city''s political history. The site is small but historically significant.', 'The Frix team recommends going with a short reading list beforehand so the exhibits feel more contextual once you arrive.', 'Saddar', 'New Chali, Kharadar, Karachi', 24.8509::double precision, 66.9967::double precision, 150::numeric, '{"monday":"10:00 AM - 04:00 PM","tuesday":"10:00 AM - 04:00 PM","wednesday":"10:00 AM - 04:00 PM","thursday":"10:00 AM - 04:00 PM","friday":"10:00 AM - 04:00 PM","saturday":"10:00 AM - 04:00 PM","sunday":"Closed"}'::jsonb, ARRAY['https://picsum.photos/seed/wazir-mansion-1/1200/800']::text[], '+92 21 3272 9414', 'https://karachiheritage.org/wazir-mansion'),
      ('1f3a4b10-0005-4a11-8b11-000000000005'::uuid, 'historical', 'Tooba Masjid', 'Known for its single large dome and minimalist geometry, Tooba Masjid is one of DHA''s architectural landmarks. Visitors often stop for quiet reflection and photography.', 'The Frix team recommends a late-afternoon visit when the dome interior catches softer light and the prayer halls are less crowded.', 'DHA', 'Phase 2 Extension, DHA, Karachi', 24.8259::double precision, 67.0335::double precision, 0::numeric, '{"monday":"05:30 AM - 10:00 PM","tuesday":"05:30 AM - 10:00 PM","wednesday":"05:30 AM - 10:00 PM","thursday":"05:30 AM - 10:00 PM","friday":"05:30 AM - 11:00 PM","saturday":"05:30 AM - 10:00 PM","sunday":"05:30 AM - 10:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/tooba-masjid-1/1200/800']::text[], '+92 21 3534 9100', 'https://karachitourism.pk/tooba-masjid'),

      -- DINE (5)
      ('2f3a4b10-0101-4a11-8b11-000000000101'::uuid, 'dine', 'Kolachi Do Darya', 'A waterfront Karachi classic known for grilled platters, sea breeze seating, and busy family evenings. The menu blends Pakistani barbecue with seafood staples.', 'The Frix team recommends booking ahead and requesting an outside table for sunset, especially on weekends.', 'DHA', 'Do Darya, Phase 8, DHA, Karachi', 24.8102::double precision, 67.0286::double precision, 1800::numeric, '{"monday":"12:00 PM - 12:00 AM","tuesday":"12:00 PM - 12:00 AM","wednesday":"12:00 PM - 12:00 AM","thursday":"12:00 PM - 12:00 AM","friday":"01:00 PM - 01:00 AM","saturday":"01:00 PM - 01:00 AM","sunday":"12:00 PM - 12:00 AM"}'::jsonb, ARRAY['https://picsum.photos/seed/kolachi-1/1200/800','https://picsum.photos/seed/kolachi-2/1200/800','https://picsum.photos/seed/kolachi-3/1200/800']::text[], '+92 21 3200 1305', 'https://kolachi.pk'),
      ('2f3a4b10-0102-4a11-8b11-000000000102'::uuid, 'dine', 'Burns Road Food Street', 'A dense lineup of legacy eateries serving nihari, bun kebab, and halwa puri till late. It remains one of the best places to sample old-city Karachi food culture.', 'The Frix team recommends going with friends and sharing small portions from multiple stalls instead of ordering everything at one place.', 'Saddar', 'Burns Road, Saddar, Karachi', 24.8581::double precision, 67.0122::double precision, 700::numeric, '{"monday":"05:00 PM - 01:00 AM","tuesday":"05:00 PM - 01:00 AM","wednesday":"05:00 PM - 01:00 AM","thursday":"05:00 PM - 01:00 AM","friday":"05:00 PM - 02:00 AM","saturday":"05:00 PM - 02:00 AM","sunday":"05:00 PM - 01:00 AM"}'::jsonb, ARRAY['https://picsum.photos/seed/burns-road-1/1200/800','https://picsum.photos/seed/burns-road-2/1200/800']::text[], '+92 300 110 7788', 'https://karachifoodguide.pk/burns-road'),
      ('2f3a4b10-0103-4a11-8b11-000000000103'::uuid, 'dine', 'Cafe Flo', 'A polished Clifton dining room with French-inspired mains, quiet ambience, and a steady fine-dining crowd. It works well for date nights and business dinners.', 'The Frix team recommends trying the chef specials and reserving inside seating if you prefer a quieter meal.', 'Clifton', 'Block 5, Clifton, Karachi', 24.8194::double precision, 67.0298::double precision, 2500::numeric, '{"monday":"01:00 PM - 11:30 PM","tuesday":"01:00 PM - 11:30 PM","wednesday":"01:00 PM - 11:30 PM","thursday":"01:00 PM - 11:30 PM","friday":"01:00 PM - 12:00 AM","saturday":"01:00 PM - 12:00 AM","sunday":"01:00 PM - 11:30 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/cafe-flo-1/1200/800']::text[], '+92 21 3587 0100', 'https://cafeflo.pk'),
      ('2f3a4b10-0104-4a11-8b11-000000000104'::uuid, 'dine', 'Xanders DHA', 'A modern casual spot in DHA with all-day breakfast, comfort food, and a broad coffee menu. It is consistently busy with young professionals and families.', 'The Frix team recommends weekday brunch hours if you want shorter wait times and easier parking.', 'DHA', '26th Commercial Street, Phase 5, DHA, Karachi', 24.8124::double precision, 67.0407::double precision, 1500::numeric, '{"monday":"08:00 AM - 12:00 AM","tuesday":"08:00 AM - 12:00 AM","wednesday":"08:00 AM - 12:00 AM","thursday":"08:00 AM - 12:00 AM","friday":"08:00 AM - 01:00 AM","saturday":"08:00 AM - 01:00 AM","sunday":"08:00 AM - 12:00 AM"}'::jsonb, ARRAY['https://picsum.photos/seed/xanders-1/1200/800','https://picsum.photos/seed/xanders-2/1200/800']::text[], '+92 21 3524 8880', 'https://xanders.pk'),
      ('2f3a4b10-0105-4a11-8b11-000000000105'::uuid, 'dine', 'Boat Basin Street Eats', 'An evening strip of quick bites and chai spots popular for late-night Karachi cravings. It offers an easy budget-friendly stop after Clifton and Seaview plans.', 'The Frix team recommends trying one specialty item per stall and finishing with kulfi for a full Boat Basin run.', 'Clifton', 'Boat Basin, Block 5, Clifton, Karachi', 24.8205::double precision, 67.0316::double precision, 400::numeric, '{"monday":"06:00 PM - 02:00 AM","tuesday":"06:00 PM - 02:00 AM","wednesday":"06:00 PM - 02:00 AM","thursday":"06:00 PM - 02:00 AM","friday":"06:00 PM - 03:00 AM","saturday":"06:00 PM - 03:00 AM","sunday":"06:00 PM - 02:00 AM"}'::jsonb, ARRAY['https://picsum.photos/seed/boat-basin-1/1200/800']::text[], '+92 333 221 4400', 'https://karachifoodguide.pk/boat-basin'),

      -- ARENA (5)
      ('3f3a4b10-0201-4a11-8b11-000000000201'::uuid, 'arena', 'National Stadium Karachi', 'Pakistan''s flagship cricket venue, home to international fixtures and major PSL nights. The scale, atmosphere, and crowd energy make it a top sports destination.', 'The Frix team recommends arriving early for security checks and choosing shaded stands for evening matches.', 'Gulshan', 'National Stadium Road, Gulshan-e-Iqbal, Karachi', 24.8928::double precision, 67.0681::double precision, 1200::numeric, '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"Closed","friday":"05:00 PM - 11:00 PM","saturday":"05:00 PM - 11:00 PM","sunday":"05:00 PM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/national-stadium-1/1200/800','https://picsum.photos/seed/national-stadium-2/1200/800','https://picsum.photos/seed/national-stadium-3/1200/800']::text[], '+92 21 111 227 277', 'https://pcb.com.pk'),
      ('3f3a4b10-0202-4a11-8b11-000000000202'::uuid, 'arena', 'KMC Sports Complex', 'A multipurpose sports facility with futsal courts, indoor games, and coaching events for local clubs. It is a practical option for active group outings.', 'The Frix team recommends weekday evenings for easier court bookings and less crowding in shared areas.', 'Korangi', 'Korangi Road, Korangi Industrial Area, Karachi', 24.8392::double precision, 67.1104::double precision, 500::numeric, '{"monday":"09:00 AM - 10:00 PM","tuesday":"09:00 AM - 10:00 PM","wednesday":"09:00 AM - 10:00 PM","thursday":"09:00 AM - 10:00 PM","friday":"09:00 AM - 10:00 PM","saturday":"09:00 AM - 11:00 PM","sunday":"09:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/kmc-sports-1/1200/800']::text[], '+92 21 3512 1188', 'https://kmc.gov.pk/sports'),
      ('3f3a4b10-0203-4a11-8b11-000000000203'::uuid, 'arena', 'DHA Creek Club Arena', 'A private-style sports and recreation complex offering tennis, swimming, and fitness facilities in DHA. It is popular for organised weekend sports sessions.', 'The Frix team recommends booking a time slot before arrival, especially for tennis courts in the evening.', 'DHA', 'Creek Avenue, Phase 8, DHA, Karachi', 24.8015::double precision, 67.0412::double precision, 2200::numeric, '{"monday":"07:00 AM - 11:00 PM","tuesday":"07:00 AM - 11:00 PM","wednesday":"07:00 AM - 11:00 PM","thursday":"07:00 AM - 11:00 PM","friday":"07:00 AM - 11:30 PM","saturday":"07:00 AM - 11:30 PM","sunday":"07:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/creek-club-1/1200/800','https://picsum.photos/seed/creek-club-2/1200/800']::text[], '+92 21 111 111 338', 'https://dhacreekclub.com'),
      ('3f3a4b10-0204-4a11-8b11-000000000204'::uuid, 'arena', 'PSB Coaching Centre', 'A government-supported training venue focused on youth athletics, indoor sports, and district-level competitions. It is a common training stop for student teams.', 'The Frix team recommends checking event days before visiting because some halls may be reserved for coaching camps.', 'Gulshan', 'Block 13D, Gulshan-e-Iqbal, Karachi', 24.9193::double precision, 67.0888::double precision, 300::numeric, '{"monday":"08:00 AM - 09:00 PM","tuesday":"08:00 AM - 09:00 PM","wednesday":"08:00 AM - 09:00 PM","thursday":"08:00 AM - 09:00 PM","friday":"08:00 AM - 09:00 PM","saturday":"08:00 AM - 09:00 PM","sunday":"08:00 AM - 09:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/psb-centre-1/1200/800']::text[], '+92 21 3498 6500', 'https://psb.gov.pk'),
      ('3f3a4b10-0205-4a11-8b11-000000000205'::uuid, 'arena', 'Moin Khan Cricket Academy', 'A dedicated cricket coaching campus with nets, practice pitches, and youth training programs in Korangi. It frequently hosts local club fixtures.', 'The Frix team recommends evening sessions for cooler weather and more active practice matches.', 'Korangi', 'Korangi Crossing, Karachi', 24.8469::double precision, 67.1435::double precision, 900::numeric, '{"monday":"03:00 PM - 10:00 PM","tuesday":"03:00 PM - 10:00 PM","wednesday":"03:00 PM - 10:00 PM","thursday":"03:00 PM - 10:00 PM","friday":"03:00 PM - 10:00 PM","saturday":"09:00 AM - 11:00 PM","sunday":"09:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/moin-academy-1/1200/800']::text[], '+92 300 260 0001', 'https://moinacademy.pk'),

      -- ART (5)
      ('4f3a4b10-0301-4a11-8b11-000000000301'::uuid, 'art', 'VM Art Gallery', 'A respected Clifton gallery presenting contemporary Pakistani artists, mixed media shows, and occasional panel sessions. The space is compact and easy to explore in one visit.', 'The Frix team recommends checking opening night schedules since artist talks are usually the highlight of each new show.', 'Clifton', '20-C, 2nd Zamzama Commercial Lane, DHA, Karachi', 24.8159::double precision, 67.0338::double precision, 600::numeric, '{"monday":"11:00 AM - 07:00 PM","tuesday":"11:00 AM - 07:00 PM","wednesday":"11:00 AM - 07:00 PM","thursday":"11:00 AM - 07:00 PM","friday":"11:00 AM - 07:00 PM","saturday":"11:00 AM - 08:00 PM","sunday":"12:00 PM - 06:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/vm-gallery-1/1200/800','https://picsum.photos/seed/vm-gallery-2/1200/800']::text[], '+92 21 3583 1237', 'https://vmgallery.com.pk'),
      ('4f3a4b10-0302-4a11-8b11-000000000302'::uuid, 'art', 'The Canvas Gallery', 'A contemporary gallery in PECHS featuring rotating exhibitions by emerging and mid-career Pakistani artists. Its curated shows regularly attract Karachi''s art community.', 'The Frix team recommends this as a quick weekday culture stop if you are near Tariq Road or Shahrah-e-Quaideen.', 'PECHS', 'Block 7, PECHS, Karachi', NULL::double precision, NULL::double precision, 0::numeric, NULL::jsonb, ARRAY['https://picsum.photos/seed/canvas-gallery-1/1200/800']::text[], '+92 21 3432 0014', 'https://canvasgallery.com.pk'),
      ('4f3a4b10-0303-4a11-8b11-000000000303'::uuid, 'art', 'Arts Council Karachi', 'A major city arts institution with theatre halls, gallery spaces, workshops, and festival programming year-round. It is one of the most active cultural venues in Saddar.', 'The Frix team recommends checking the evening schedule because theatre and music events often run back-to-back.', 'Saddar', 'M.R. Kiyani Road, Saddar, Karachi', 24.8538::double precision, 67.0223::double precision, 350::numeric, '{"monday":"10:00 AM - 10:00 PM","tuesday":"10:00 AM - 10:00 PM","wednesday":"10:00 AM - 10:00 PM","thursday":"10:00 AM - 10:00 PM","friday":"10:00 AM - 11:00 PM","saturday":"10:00 AM - 11:00 PM","sunday":"10:00 AM - 09:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/arts-council-1/1200/800','https://picsum.photos/seed/arts-council-2/1200/800']::text[], '+92 21 9921 5340', 'https://artscouncil.org.pk'),
      ('4f3a4b10-0304-4a11-8b11-000000000304'::uuid, 'art', 'Koel Gallery', 'A curated gallery and design space known for thoughtful exhibitions, small talks, and artisan showcases. It is a reliable pick for contemporary art enthusiasts.', 'The Frix team recommends combining this with nearby cafes in Clifton for an easy half-day cultural route.', 'Clifton', 'F-42/2, Block 4, Clifton, Karachi', 24.8136::double precision, 67.0289::double precision, 500::numeric, '{"monday":"11:00 AM - 07:00 PM","tuesday":"11:00 AM - 07:00 PM","wednesday":"11:00 AM - 07:00 PM","thursday":"11:00 AM - 07:00 PM","friday":"11:00 AM - 07:00 PM","saturday":"11:00 AM - 08:00 PM","sunday":"Closed"}'::jsonb, ARRAY['https://picsum.photos/seed/koel-gallery-1/1200/800']::text[], '+92 21 3583 1246', 'https://koelgallery.com'),
      ('4f3a4b10-0305-4a11-8b11-000000000305'::uuid, 'art', 'IVS Gallery', 'Part of a leading design institute, this gallery hosts student and faculty showcases along with invited contemporary exhibits. Expect experimental work and fresh curation.', 'The Frix team recommends following semester calendars because opening weeks usually feature the strongest exhibit mix.', 'PECHS', 'ST-33, Block 2, Scheme 5, Clifton, Karachi', 24.8019::double precision, 67.0569::double precision, 200::numeric, '{"monday":"09:00 AM - 06:00 PM","tuesday":"09:00 AM - 06:00 PM","wednesday":"09:00 AM - 06:00 PM","thursday":"09:00 AM - 06:00 PM","friday":"09:00 AM - 06:00 PM","saturday":"10:00 AM - 05:00 PM","sunday":"Closed"}'::jsonb, ARRAY['https://picsum.photos/seed/ivs-gallery-1/1200/800']::text[], '+92 21 111 487 487', 'https://ivs.edu.pk'),

      -- NATURE (5)
      ('5f3a4b10-0401-4a11-8b11-000000000401'::uuid, 'nature', 'Clifton Beach', 'Karachi''s iconic public shoreline with evening crowds, food vendors, and sea-view walks. It is one of the city''s most visited free outdoor spaces.', 'The Frix team recommends weekday sunset hours if you want the sea breeze without peak-weekend congestion.', 'Clifton', 'Sea View, Clifton, Karachi', 24.8090::double precision, 67.0253::double precision, 0::numeric, '{"monday":"06:00 AM - 11:00 PM","tuesday":"06:00 AM - 11:00 PM","wednesday":"06:00 AM - 11:00 PM","thursday":"06:00 AM - 11:00 PM","friday":"06:00 AM - 11:59 PM","saturday":"06:00 AM - 11:59 PM","sunday":"06:00 AM - 11:59 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/clifton-beach-1/1200/800','https://picsum.photos/seed/clifton-beach-2/1200/800']::text[], '+92 300 555 7788', 'https://karachitourism.pk/clifton-beach'),
      ('5f3a4b10-0402-4a11-8b11-000000000402'::uuid, 'nature', 'Bin Qasim Family Park', 'A broad green park in Korangi with jogging loops, picnic zones, and casual family footfall on weekends. It is a useful low-cost outdoor plan for groups.', 'The Frix team recommends early morning visits for cooler weather and quieter walking tracks.', 'Korangi', 'Bin Qasim Town, Korangi, Karachi', 24.7998::double precision, 67.1622::double precision, 100::numeric, '{"monday":"07:00 AM - 10:00 PM","tuesday":"07:00 AM - 10:00 PM","wednesday":"07:00 AM - 10:00 PM","thursday":"07:00 AM - 10:00 PM","friday":"07:00 AM - 11:00 PM","saturday":"07:00 AM - 11:00 PM","sunday":"07:00 AM - 10:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/bin-qasim-park-1/1200/800']::text[], '+92 21 3509 4401', 'https://kmc.gov.pk/parks/bin-qasim'),
      ('5f3a4b10-0403-4a11-8b11-000000000403'::uuid, 'nature', 'Hill Park', 'A central city park in PECHS offering jogging tracks, play areas, and broad city views from elevated points. It is popular for casual evening walks.', 'The Frix team recommends visiting near dusk and carrying water if you plan to cover the full walking loop.', 'PECHS', 'Shahrah-e-Faisal Service Road, PECHS, Karachi', 24.8726::double precision, 67.0568::double precision, 0::numeric, '{"monday":"06:00 AM - 10:00 PM","tuesday":"06:00 AM - 10:00 PM","wednesday":"06:00 AM - 10:00 PM","thursday":"06:00 AM - 10:00 PM","friday":"06:00 AM - 11:00 PM","saturday":"06:00 AM - 11:00 PM","sunday":"06:00 AM - 10:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/hill-park-1/1200/800']::text[], '+92 21 9924 1332', 'https://kmc.gov.pk/parks/hill-park'),
      ('5f3a4b10-0404-4a11-8b11-000000000404'::uuid, 'nature', 'Bagh Ibn-e-Qasim', 'A large landscaped urban park near Clifton beach with lawns, pathways, and frequent family gatherings. It is among the city''s most accessible green zones.', 'The Frix team recommends post-sunset visits when the lights come on and the park atmosphere is most lively.', 'Clifton', 'Marine Drive, Clifton, Karachi', 24.8217::double precision, 67.0348::double precision, 0::numeric, '{"monday":"08:00 AM - 11:00 PM","tuesday":"08:00 AM - 11:00 PM","wednesday":"08:00 AM - 11:00 PM","thursday":"08:00 AM - 11:00 PM","friday":"08:00 AM - 11:59 PM","saturday":"08:00 AM - 11:59 PM","sunday":"08:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/bagh-ibn-qasim-1/1200/800']::text[], '+92 21 3529 4410', 'https://karachiparks.pk/bagh-ibn-qasim'),
      ('5f3a4b10-0405-4a11-8b11-000000000405'::uuid, 'nature', 'Safari Park Karachi', 'A long-running green attraction in Gulshan with animal enclosures, boating options, and family-focused weekend traffic. It remains one of the city''s mainstream outdoor picks.', 'The Frix team recommends daytime entry if you want to cover both the park and nearby snack spots comfortably.', 'Gulshan', 'University Road, Gulshan-e-Iqbal, Karachi', 24.9202::double precision, 67.0921::double precision, 150::numeric, '{"monday":"10:00 AM - 08:00 PM","tuesday":"10:00 AM - 08:00 PM","wednesday":"10:00 AM - 08:00 PM","thursday":"10:00 AM - 08:00 PM","friday":"10:00 AM - 09:00 PM","saturday":"10:00 AM - 09:00 PM","sunday":"10:00 AM - 09:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/safari-park-1/1200/800','https://picsum.photos/seed/safari-park-2/1200/800']::text[], '+92 21 3481 5565', 'https://kmc.gov.pk/safari-park'),

      -- SHOPPING (5)
      ('6f3a4b10-0501-4a11-8b11-000000000501'::uuid, 'shopping', 'Dolmen Mall Clifton', 'A premium shopping mall with local and international retail brands, cinema options, and broad dining choices. It is a regular weekend anchor for Clifton plans.', 'The Frix team recommends weekday afternoons if you prefer smoother parking and shorter queues at major stores.', 'Clifton', 'Block 4, Clifton, Karachi', 24.8148::double precision, 67.0308::double precision, 0::numeric, '{"monday":"11:00 AM - 11:00 PM","tuesday":"11:00 AM - 11:00 PM","wednesday":"11:00 AM - 11:00 PM","thursday":"11:00 AM - 11:00 PM","friday":"02:00 PM - 12:00 AM","saturday":"11:00 AM - 12:00 AM","sunday":"11:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/dolmen-1/1200/800','https://picsum.photos/seed/dolmen-2/1200/800','https://picsum.photos/seed/dolmen-3/1200/800']::text[], '+92 21 111 000 362', 'https://dolmenmall.com'),
      ('6f3a4b10-0502-4a11-8b11-000000000502'::uuid, 'shopping', 'Lucky One Mall', 'One of Pakistan''s largest malls featuring multi-floor retail, entertainment zones, and food options under one roof. It is a strong all-weather outing in Gulshan.', 'The Frix team recommends arriving early on weekends because evening footfall gets heavy across top floors.', 'Gulshan', 'Rashid Minhas Road, Gulshan-e-Iqbal, Karachi', 24.9185::double precision, 67.0707::double precision, 0::numeric, '{"monday":"11:00 AM - 11:00 PM","tuesday":"11:00 AM - 11:00 PM","wednesday":"11:00 AM - 11:00 PM","thursday":"11:00 AM - 11:00 PM","friday":"02:00 PM - 12:00 AM","saturday":"11:00 AM - 12:00 AM","sunday":"11:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/lucky-one-1/1200/800','https://picsum.photos/seed/lucky-one-2/1200/800']::text[], '+92 21 111 582 591', 'https://luckyonemall.com'),
      ('6f3a4b10-0503-4a11-8b11-000000000503'::uuid, 'shopping', 'Zainab Market', 'A classic Saddar market for textiles, export leftovers, leather goods, and bargain finds. It is one of Karachi''s most visited street-shopping hubs.', 'The Frix team recommends carrying cash and keeping extra time for side-lane stores that are easy to miss.', 'Saddar', 'Abdullah Haroon Road, Saddar, Karachi', 24.8481::double precision, 67.0300::double precision, 0::numeric, '{"monday":"11:00 AM - 10:00 PM","tuesday":"11:00 AM - 10:00 PM","wednesday":"11:00 AM - 10:00 PM","thursday":"11:00 AM - 10:00 PM","friday":"03:00 PM - 11:00 PM","saturday":"11:00 AM - 11:00 PM","sunday":"11:00 AM - 10:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/zainab-market-1/1200/800']::text[], '+92 300 555 3400', 'https://karachimarkets.pk/zainab'),
      ('6f3a4b10-0504-4a11-8b11-000000000504'::uuid, 'shopping', 'Tariq Road Bazaar', 'A high-footfall retail strip in PECHS famous for fashion outlets, footwear, and seasonal shopping rushes. It is ideal for budget-to-midrange shopping runs.', 'The Frix team recommends late afternoon on weekdays to avoid peak weekend crowd movement and parking stress.', 'PECHS', 'Tariq Road, PECHS, Karachi', 24.8729::double precision, 67.0604::double precision, 0::numeric, '{"monday":"11:00 AM - 11:00 PM","tuesday":"11:00 AM - 11:00 PM","wednesday":"11:00 AM - 11:00 PM","thursday":"11:00 AM - 11:00 PM","friday":"02:00 PM - 12:00 AM","saturday":"11:00 AM - 12:00 AM","sunday":"11:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/tariq-road-1/1200/800']::text[], '+92 333 884 9911', 'https://karachimarkets.pk/tariq-road'),
      ('6f3a4b10-0505-4a11-8b11-000000000505'::uuid, 'shopping', 'The Forum Mall', 'A compact Clifton mall with quick retail stops, services, and casual dining. It works well for short in-and-out plans when you do not want a full mega-mall visit.', 'The Frix team recommends using this for short errands before heading to nearby Zamzama or Seaview plans.', 'Clifton', 'Khayaban-e-Jami, Block 9, Clifton, Karachi', 24.8137::double precision, 67.0332::double precision, 0::numeric, '{"monday":"11:00 AM - 11:00 PM","tuesday":"11:00 AM - 11:00 PM","wednesday":"11:00 AM - 11:00 PM","thursday":"11:00 AM - 11:00 PM","friday":"02:00 PM - 12:00 AM","saturday":"11:00 AM - 12:00 AM","sunday":"11:00 AM - 11:00 PM"}'::jsonb, ARRAY['https://picsum.photos/seed/forum-mall-1/1200/800']::text[], '+92 21 3524 7788', 'https://theforummall.pk')
  ) AS seed(
    id,
    category_slug,
    name,
    description,
    frix_notes,
    neighbourhood,
    address_line,
    lat,
    lng,
    base_price,
    operating_hours,
    images,
    contact_phone,
    website_url
  )
)
INSERT INTO venues (
  id,
  category_id,
  name,
  description,
  frix_notes,
  city,
  neighbourhood,
  address_line,
  coordinates,
  lat,
  lng,
  base_price,
  currency,
  operating_hours,
  images,
  contact_phone,
  website_url,
  is_active,
  is_bookable
)
SELECT
  sv.id,
  c.id,
  sv.name,
  sv.description,
  sv.frix_notes,
  'Karachi',
  sv.neighbourhood,
  sv.address_line,
  CASE
    WHEN sv.lat IS NULL OR sv.lng IS NULL THEN NULL
    ELSE ST_SetSRID(ST_MakePoint(sv.lng, sv.lat), 4326)::geography
  END,
  sv.lat,
  sv.lng,
  sv.base_price,
  'PKR',
  sv.operating_hours,
  sv.images,
  sv.contact_phone,
  sv.website_url,
  true,
  false
FROM source_venues sv
JOIN categories c
  ON c.slug = sv.category_slug
ON CONFLICT (id) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  frix_notes = EXCLUDED.frix_notes,
  city = EXCLUDED.city,
  neighbourhood = EXCLUDED.neighbourhood,
  address_line = EXCLUDED.address_line,
  coordinates = EXCLUDED.coordinates,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  base_price = EXCLUDED.base_price,
  currency = EXCLUDED.currency,
  operating_hours = EXCLUDED.operating_hours,
  images = EXCLUDED.images,
  contact_phone = EXCLUDED.contact_phone,
  website_url = EXCLUDED.website_url,
  is_active = EXCLUDED.is_active,
  is_bookable = EXCLUDED.is_bookable;

-- ============================================================================
-- 3. SEED ACTIVE TONIGHT UPDATE (FOR BADGE TESTING)
-- ============================================================================
INSERT INTO venue_updates (
  id,
  venue_id,
  title,
  body,
  expires_at,
  is_active
)
VALUES (
  '7f3a4b10-0901-4a11-8b11-000000000901'::uuid,
  '3f3a4b10-0201-4a11-8b11-000000000201'::uuid,
  'PSL Tonight — Karachi Kings vs Lahore Qalandars',
  'Match starts at 7 PM. Gates open at 5:30 PM. Arrive early for smoother entry and parking.',
  NOW() + INTERVAL '1 day',
  true
)
ON CONFLICT (id) DO UPDATE
SET
  venue_id = EXCLUDED.venue_id,
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  expires_at = EXCLUDED.expires_at,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- 4. TICKET 003 ACCEPTANCE CHECKS
-- ============================================================================
DO $$
DECLARE
  seeded_total INTEGER;
  seeded_with_coordinates INTEGER;
  seeded_coordinates_pct NUMERIC;
  dha_results INTEGER;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE coordinates IS NOT NULL)
  INTO seeded_total, seeded_with_coordinates
  FROM venues
  WHERE id::text ~ '^[1-6]f3a4b10-';

  seeded_coordinates_pct := CASE
    WHEN seeded_total = 0 THEN 0
    ELSE (seeded_with_coordinates::numeric / seeded_total::numeric) * 100
  END;

  IF seeded_coordinates_pct < 70 THEN
    RAISE EXCEPTION
      'Seeded venue coordinates coverage below 70%% (%.2f%%).',
      seeded_coordinates_pct;
  END IF;

  SELECT COUNT(*)
  INTO dha_results
  FROM venues_near(24.8127, 67.0730, 5);

  IF dha_results = 0 THEN
    RAISE EXCEPTION
      'venues_near(24.8127, 67.0730, 5) returned no rows.';
  END IF;
END
$$;
