const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataFile = path.join(__dirname, '..', 'data.json');
const outputFile = path.join(__dirname, '..', 'supabase', 'migrations', '006_seed_venues_from_data_json.sql');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Categories from our DB
const CATEGORY_MAP = {
  'historical': ['Hindu temple', 'Government office', 'Historical landmark', 'Museum', 'Maritime museum', 'City Hall', 'City courthouse', 'Courthouse', 'Lighthouse'],
  'nature': ['Garden', 'Park', 'Botanical garden', 'Wildlife and safari park', 'Zoo', 'Beach', 'Island'],
  'arena': ['Amusement park', 'Adventure sports center', 'Indoor playground', 'Theme park', 'Stadium', 'Arena', 'Sports complex', 'Bowling alley'],
  'dine': ['Turkish restaurant', 'Mediterranean restaurant', 'Fast food restaurant', 'Restaurant', 'Barbecue restaurant', 'Family restaurant', 'Arab restaurant', 'Lebanese restaurant', 'Coffee shop', 'Cafe', 'Dining'],
  'art': ['Art gallery', 'Gallery', 'Cultural center', 'Performing arts theater'],
  'shopping': ['Shopping mall', 'Market', 'Bazaar', 'Mall']
};

// Karachi center
const KARACHI_LAT = 24.8607;
const KARACHI_LNG = 67.0011;

// Default image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800';

function getCategory(venue) {
  const title = venue.title.toLowerCase();
  const cats = (venue.categories || []).map(c => c.toLowerCase());
  const catName = (venue.categoryName || '').toLowerCase();

  if (title.includes('cinema') || title.includes('theater') || cats.includes('movie theater')) {
    return 'arena'; 
  }

  for (const [slug, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => title.includes(k.toLowerCase()) || cats.some(c => c.includes(k.toLowerCase())) || catName.includes(k.toLowerCase()))) {
      return slug;
    }
  }
  return 'arena'; 
}

// Filter and sample venues
const filteredVenues = data.filter(v => v.city === 'Karachi' && v.title);
const categoriesCount = { historical: 0, nature: 0, arena: 0, dine: 0, art: 0, shopping: 0 };
const selectedVenues = [];

for (const v of filteredVenues) {
  const cat = getCategory(v);
  if (categoriesCount[cat] < 10) {
    selectedVenues.push({ ...v, category_slug: cat });
    categoriesCount[cat]++;
  }
}

let sql = `-- Seed venues from data.json
-- Generated at: ${new Date().toISOString()}

-- 1. CLEANUP: Remove old data to ensure fresh start
DELETE FROM venue_updates;
DELETE FROM venues;

-- 2. INSERT NEW DATA
INSERT INTO venues (
  id,
  category_id,
  name,
  description,
  frix_notes,
  city,
  neighbourhood,
  address_line,
  lat,
  lng,
  coordinates,
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
  v.id,
  c.id,
  v.name,
  v.description,
  v.frix_notes,
  v.city,
  v.neighbourhood,
  v.address_line,
  v.lat,
  v.lng,
  v.coordinates,
  v.base_price,
  v.currency,
  v.operating_hours,
  v.images,
  v.contact_phone,
  v.website_url,
  true,
  false
FROM (
  VALUES
`;

const venueRows = selectedVenues.map((v, index) => {
  const id = uuidv4();
  const name = v.title.replace(/'/g, "''");
  const description = `${v.categoryName || 'Venue'} in ${v.city}. High quality experience with a score of ${v.totalScore || '4.0'}.`.replace(/'/g, "''");
  const frixNotes = `The Frix team recommends visiting ${v.title} for its unique ${v.categoryName || 'atmosphere'}.`.replace(/'/g, "''");
  const city = 'Karachi';
  const neighbourhood = (v.street || 'Karachi').replace(/'/g, "''");
  const address = (v.street || v.city || 'Karachi').replace(/'/g, "''");
  
  const lat = KARACHI_LAT + (Math.random() - 0.5) * 0.1;
  const lng = KARACHI_LNG + (Math.random() - 0.5) * 0.1;
  
  const basePrice = Math.floor(Math.random() * 2000) + 500;
  const currency = 'PKR';
  const hours = JSON.stringify({
    monday: "09:00 AM - 10:00 PM",
    tuesday: "09:00 AM - 10:00 PM",
    wednesday: "09:00 AM - 10:00 PM",
    thursday: "09:00 AM - 10:00 PM",
    friday: "09:00 AM - 11:00 PM",
    saturday: "09:00 AM - 11:00 PM",
    sunday: "09:00 AM - 10:00 PM"
  });
  const images = `ARRAY['${DEFAULT_IMAGE}']`;
  const phone = v.phone || '';
  const website = v.website || '';
  const catSlug = v.category_slug;

  return `    ('${id}'::uuid, '${catSlug}', '${name}', '${description}', '${frixNotes}', '${city}', '${neighbourhood}', '${address}', ${lat}, ${lng}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${basePrice}, '${currency}', '${hours}'::jsonb, ${images}, '${phone}', '${website}')`;
}).join(',\n');

sql += venueRows;
sql += `
) AS v(id, category_slug, name, description, frix_notes, city, neighbourhood, address_line, lat, lng, coordinates, base_price, currency, operating_hours, images, contact_phone, website_url)
JOIN categories c ON c.slug = v.category_slug
ON CONFLICT (id) DO NOTHING;

-- Seed some venue updates for Tonight (Pick exactly 8 from the NEW venues)
INSERT INTO venue_updates (id, venue_id, title, body, expires_at, is_active)
SELECT 
  gen_random_uuid(),
  id,
  'Special Tonight at ' || name,
  'Enjoy a unique evening experience at ' || name || '. Limited spots available!',
  NOW() + INTERVAL '1 day',
  true
FROM venues
ORDER BY created_at DESC
LIMIT 8
ON CONFLICT (id) DO NOTHING;
`;

fs.writeFileSync(outputFile, sql);
console.log('SQL migration generated at:', outputFile);
