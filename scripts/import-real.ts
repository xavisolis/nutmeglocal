/**
 * Import real business data from scraped JSON into Supabase.
 *
 * What this script does:
 * 1. Reads businesses-consolidated.json
 * 2. Cleans data (phone normalization, address validation)
 * 3. Geocodes real addresses via Mapbox (town-center + jitter for missing)
 * 4. Maps category slugs to Supabase category IDs
 * 5. Generates URL slugs (handles duplicates per city)
 * 6. Deletes ALL existing non-claimed businesses
 * 7. Inserts real data
 * 8. Exports email list for outreach
 *
 * Run: npm run import
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// ---------------------------------------------------------------------------
// Town centers for fallback geocoding
// ---------------------------------------------------------------------------
const townCenters: Record<string, { lat: number; lng: number }> = {
  Danbury:         { lat: 41.4015, lng: -73.4540 },
  Bethel:          { lat: 41.3714, lng: -73.4130 },
  Brookfield:      { lat: 41.4182, lng: -73.3970 },
  Kent:            { lat: 41.7245, lng: -73.4769 },
  'New Fairfield': { lat: 41.4666, lng: -73.4859 },
  'New Milford':   { lat: 41.5770, lng: -73.4085 },
  Newtown:         { lat: 41.4139, lng: -73.3116 },
  Redding:         { lat: 41.3050, lng: -73.3830 },
  Ridgefield:      { lat: 41.2815, lng: -73.4984 },
  Sherman:         { lat: 41.5800, lng: -73.4950 },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface RawBusiness {
  name: string;
  category: string;
  address: string | null;
  city: string;
  zip: string;
  phone: string | null;
  website: string | null;
  email?: string | null;
}

interface CleanBusiness {
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: null;
  featured: boolean;
  claimed: boolean;
  source: 'scraped';
  active: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  // Strip everything except digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone; // Return as-is if can't normalize
}

function hasRealAddress(address: string | null, city: string): boolean {
  if (!address) return false;
  const clean = address.trim().toLowerCase();
  // Address is just the city name or area description
  if (clean === city.toLowerCase()) return false;
  if (clean.includes('area') && clean.length < 30) return false;
  // Must have at least a number or "route" to be a real address
  return /\d/.test(clean) || /route/i.test(clean) || /st|rd|ave|ln|dr|pl|way|blvd|ct|hwy/i.test(clean);
}

function jitter(base: number, range = 0.006): number {
  return +(base + (Math.random() - 0.5) * range).toFixed(6);
}

// ---------------------------------------------------------------------------
// Geocoding via Mapbox
// ---------------------------------------------------------------------------
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();
let geocodeHits = 0;
let geocodeMisses = 0;

async function geocode(address: string, city: string, zip: string): Promise<{ lat: number; lng: number } | null> {
  const query = `${address}, ${city}, CT ${zip}`;
  if (geocodeCache.has(query)) return geocodeCache.get(query)!;

  try {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=US&proximity=-73.45,41.40&limit=1&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`    Geocode HTTP ${res.status} for: ${query}`);
      geocodeCache.set(query, null);
      return null;
    }
    const data = await res.json();
    const features = data.features;
    if (features && features.length > 0) {
      const [lng, lat] = features[0].geometry.coordinates;
      const result = { lat, lng };
      geocodeCache.set(query, result);
      geocodeHits++;
      return result;
    }
  } catch (err) {
    console.warn(`    Geocode error for: ${query}`, err);
  }

  geocodeCache.set(query, null);
  geocodeMisses++;
  return null;
}

// Rate-limited batch geocoding
async function geocodeBatch(items: { address: string; city: string; zip: string }[]): Promise<(({ lat: number; lng: number }) | null)[]> {
  const results: (({ lat: number; lng: number }) | null)[] = [];
  const batchSize = 10; // 10 concurrent requests

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => geocode(item.address, item.city, item.zip))
    );
    results.push(...batchResults);

    // Progress
    if ((i + batchSize) % 50 === 0 || i + batchSize >= items.length) {
      process.stdout.write(`    ${Math.min(i + batchSize, items.length)}/${items.length} geocoded\r`);
    }

    // Small delay between batches to respect rate limits
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  console.log();
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('📦 Importing real business data into NutmegLocal...\n');

  // 1) Read source data
  const rawPath = '/Users/jaimesolis/clawd/projects/nutmeglocal/data/businesses-consolidated.json';
  const raw: RawBusiness[] = JSON.parse(readFileSync(rawPath, 'utf-8'));
  console.log(`📄 Read ${raw.length} businesses from JSON\n`);

  // 2) Get categories from Supabase
  console.log('📂 Fetching categories...');
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, slug');
  if (catErr || !cats) { console.error('❌ Category error:', catErr); return; }
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log(`  ✅ ${cats.length} categories\n`);

  // 3) Clean and validate
  console.log('🧹 Cleaning data...');
  const skipped: { name: string; city: string; reason: string }[] = [];
  const withAddress: { index: number; address: string; city: string; zip: string }[] = [];

  // Generate unique slugs per city
  const slugCounts = new Map<string, number>();

  const cleaned: (Omit<CleanBusiness, 'latitude' | 'longitude'> & {
    _rawAddress: string | null;
    _hasRealAddress: boolean;
  })[] = [];

  for (const biz of raw) {
    // Validate category
    if (!catMap[biz.category]) {
      skipped.push({ name: biz.name, city: biz.city, reason: `Unknown category: ${biz.category}` });
      continue;
    }

    // Validate city
    if (!townCenters[biz.city]) {
      skipped.push({ name: biz.name, city: biz.city, reason: `Unknown city: ${biz.city}` });
      continue;
    }

    // Generate unique slug
    let baseSlug = makeSlug(biz.name);
    const slugKey = `${biz.city}:${baseSlug}`;
    const count = slugCounts.get(slugKey) || 0;
    slugCounts.set(slugKey, count + 1);
    const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

    // Determine real address
    const realAddr = hasRealAddress(biz.address, biz.city);
    const displayAddress = realAddr ? biz.address!.trim() : `${biz.city}, CT ${biz.zip}`;

    cleaned.push({
      name: biz.name,
      slug,
      description: null,
      category_id: catMap[biz.category],
      address: displayAddress,
      city: biz.city,
      state: 'CT',
      zip: biz.zip,
      phone: normalizePhone(biz.phone),
      email: biz.email || null,
      website: biz.website || null,
      hours: null,
      featured: false,
      claimed: false,
      source: 'scraped',
      active: true,
      _rawAddress: biz.address,
      _hasRealAddress: realAddr,
    });

    if (realAddr) {
      withAddress.push({ index: cleaned.length - 1, address: biz.address!.trim(), city: biz.city, zip: biz.zip });
    }
  }

  console.log(`  ✅ ${cleaned.length} valid businesses`);
  if (skipped.length > 0) {
    console.log(`  ⚠️  ${skipped.length} skipped:`);
    for (const s of skipped) {
      console.log(`     ${s.name} (${s.city}) — ${s.reason}`);
    }
  }

  // 4) Geocode addresses
  console.log(`\n🗺️  Geocoding ${withAddress.length} addresses via Mapbox...`);
  const geoResults = await geocodeBatch(withAddress);

  // Apply geocode results
  let geocoded = 0;
  let fallback = 0;

  for (let i = 0; i < withAddress.length; i++) {
    const result = geoResults[i];
    const idx = withAddress[i].index;
    if (result) {
      (cleaned[idx] as any).latitude = result.lat;
      (cleaned[idx] as any).longitude = result.lng;
      geocoded++;
    }
  }

  // Fill in missing coords with town center + jitter
  for (const biz of cleaned) {
    if (!(biz as any).latitude) {
      const center = townCenters[biz.city];
      (biz as any).latitude = jitter(center.lat);
      (biz as any).longitude = jitter(center.lng);
      fallback++;
    }
  }

  console.log(`  ✅ ${geocoded} geocoded from address`);
  console.log(`  📍 ${fallback} using town center (no real address or geocode failed)`);
  console.log(`  Mapbox hits: ${geocodeHits}, misses: ${geocodeMisses}`);

  // 5) Prepare final rows (remove internal fields)
  const rows: CleanBusiness[] = cleaned.map((biz) => {
    const { _rawAddress, _hasRealAddress, ...row } = biz;
    return row as CleanBusiness;
  });

  // 6) Delete existing non-claimed businesses
  console.log('\n🗑️  Clearing existing non-claimed businesses...');
  const { error: delErr } = await supabase
    .from('businesses')
    .delete()
    .eq('claimed', false);

  if (delErr) { console.error('❌ Delete error:', delErr); return; }
  console.log('  ✅ Cleared');

  // 7) Insert in batches
  console.log(`\n📥 Inserting ${rows.length} businesses...`);
  const batchSize = 40;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('businesses')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      // Try one-by-one to find the bad record
      for (const row of batch) {
        const { error: singleErr } = await supabase
          .from('businesses')
          .insert(row)
          .select('id');
        if (singleErr) {
          console.error(`     Failed: ${row.name} (${row.city}) — ${singleErr.message}`);
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data!.length;
    }
    process.stdout.write(`  ${inserted}/${rows.length} inserted\r`);
  }
  console.log(`\n  ✅ ${inserted} businesses inserted (${errors} errors)\n`);

  // 8) Report distribution
  console.log('📊 Distribution:');
  const perCity: Record<string, number> = {};
  const perCat: Record<string, number> = {};
  for (const r of rows) {
    perCity[r.city] = (perCity[r.city] || 0) + 1;
    const catSlug = cats.find((c) => c.id === r.category_id)?.slug || 'unknown';
    perCat[catSlug] = (perCat[catSlug] || 0) + 1;
  }

  console.log('\n  By city:');
  for (const [city, count] of Object.entries(perCity).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${city.padEnd(16)} ${count}`);
  }

  console.log('\n  By category (top 10):');
  const topCats = Object.entries(perCat).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [cat, count] of topCats) {
    console.log(`    ${cat.padEnd(20)} ${count}`);
  }

  // 9) Export email list
  const withEmail = rows.filter((r) => r.email);
  if (withEmail.length > 0) {
    const emailList = withEmail.map((r) => ({
      name: r.name,
      email: r.email,
      city: r.city,
      category: cats.find((c) => c.id === r.category_id)?.slug,
      website: r.website,
      phone: r.phone,
    }));
    const emailPath = '/Users/jaimesolis/clawd/projects/nutmeglocal/data/email-outreach-list.json';
    writeFileSync(emailPath, JSON.stringify(emailList, null, 2));
    console.log(`\n📧 Email outreach list: ${withEmail.length} businesses → ${emailPath}`);
  }

  // 10) Export full list with website (for future email harvesting)
  const withWebsite = rows.filter((r) => r.website && !r.email);
  console.log(`\n📋 Summary:`);
  console.log(`   Total inserted: ${inserted}`);
  console.log(`   With email: ${withEmail.length} (outreach ready)`);
  console.log(`   With website but no email: ${withWebsite.length} (harvest later)`);
  console.log(`   With phone: ${rows.filter((r) => r.phone).length}`);
  console.log(`   With real address: ${rows.filter((r) => !r.address.includes(', CT ')).length}`);

  console.log('\n🎉 Import complete!');
}

main().catch(console.error);
