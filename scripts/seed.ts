import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  { name: 'Landscaping', slug: 'landscaping', icon: '🌿' },
  { name: 'Plumbing', slug: 'plumbing', icon: '🔧' },
  { name: 'Electrician', slug: 'electrician', icon: '⚡' },
  { name: 'Restaurant', slug: 'restaurant', icon: '🍽️' },
  { name: 'Auto Repair', slug: 'auto-repair', icon: '🚗' },
  { name: 'Dentist', slug: 'dentist', icon: '🦷' },
  { name: 'Hair Salon', slug: 'hair-salon', icon: '💇' },
  { name: 'Real Estate', slug: 'real-estate', icon: '🏠' },
  { name: 'Fitness', slug: 'fitness', icon: '🏋️' },
  { name: 'Pet Services', slug: 'pet-services', icon: '🐾' },
  { name: 'Bakery', slug: 'bakery', icon: '🍞' },
  { name: 'Cleaning Services', slug: 'cleaning-services', icon: '🧹' },
  { name: 'HVAC', slug: 'hvac', icon: '❄️' },
  { name: 'Accounting', slug: 'accounting', icon: '📊' },
  { name: 'Roofing', slug: 'roofing', icon: '🏗️' },
  { name: 'Pharmacy', slug: 'pharmacy', icon: '💊' },
  { name: 'Insurance', slug: 'insurance', icon: '🛡️' },
  { name: 'Photography', slug: 'photography', icon: '📷' },
];

async function seed() {
  console.log('🌱 Seeding categories...');
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select();

  if (catErr) { console.error('Category error:', catErr); return; }
  console.log(`  ✅ ${cats!.length} categories`);

  const catMap = Object.fromEntries(cats!.map((c: any) => [c.slug, c.id]));

  const businesses = [
    {
      name: 'Elmer\'s Diner',
      slug: 'elmers-diner',
      description: 'Classic American diner serving breakfast and lunch since 1960. Famous for pancakes and homestyle cooking.',
      category_id: catMap['restaurant'],
      address: '1 Danbury Rd',
      city: 'Danbury',
      state: 'CT',
      zip: '06810',
      latitude: 41.4018,
      longitude: -73.4541,
      phone: '(203) 792-4044',
      website: 'https://elmersdiner.com',
      hours: { mon: '6am-3pm', tue: '6am-3pm', wed: '6am-3pm', thu: '6am-3pm', fri: '6am-3pm', sat: '7am-3pm', sun: '7am-2pm' },
      featured: true,
      source: 'manual' as const,
    },
    {
      name: 'Greenworks Landscaping',
      slug: 'greenworks-landscaping',
      description: 'Full-service landscaping company — lawn care, hardscaping, seasonal cleanups. Serving Greater Danbury for 15 years.',
      category_id: catMap['landscaping'],
      address: '45 Stony Hill Rd',
      city: 'Bethel',
      state: 'CT',
      zip: '06801',
      latitude: 41.3712,
      longitude: -73.4140,
      phone: '(203) 555-0102',
      hours: { mon: '7am-5pm', tue: '7am-5pm', wed: '7am-5pm', thu: '7am-5pm', fri: '7am-5pm', sat: '8am-2pm', sun: 'Closed' },
      source: 'manual' as const,
    },
    {
      name: 'Brookfield Auto Care',
      slug: 'brookfield-auto-care',
      description: 'Trusted auto repair shop specializing in foreign and domestic vehicles. ASE certified technicians.',
      category_id: catMap['auto-repair'],
      address: '789 Federal Rd',
      city: 'Brookfield',
      state: 'CT',
      zip: '06804',
      latitude: 41.4182,
      longitude: -73.3970,
      phone: '(203) 555-0203',
      website: 'https://brookfieldautocare.com',
      hours: { mon: '8am-5:30pm', tue: '8am-5:30pm', wed: '8am-5:30pm', thu: '8am-5:30pm', fri: '8am-5:30pm', sat: '8am-1pm', sun: 'Closed' },
      featured: true,
      source: 'manual' as const,
    },
    {
      name: 'Ridgefield Smiles Dental',
      slug: 'ridgefield-smiles-dental',
      description: 'Family and cosmetic dentistry in downtown Ridgefield. Accepting new patients.',
      category_id: catMap['dentist'],
      address: '100 Main St',
      city: 'Ridgefield',
      state: 'CT',
      zip: '06877',
      latitude: 41.2815,
      longitude: -73.4984,
      phone: '(203) 555-0304',
      email: 'info@ridgefieldsmiles.com',
      hours: { mon: '9am-5pm', tue: '9am-5pm', wed: '9am-7pm', thu: '9am-5pm', fri: '9am-3pm', sat: 'Closed', sun: 'Closed' },
      source: 'manual' as const,
    },
    {
      name: 'Bethel Fitness Club',
      slug: 'bethel-fitness-club',
      description: 'Modern gym with group classes, personal training, and childcare. No contracts.',
      category_id: catMap['fitness'],
      address: '20 Diamond Ave',
      city: 'Bethel',
      state: 'CT',
      zip: '06801',
      latitude: 41.3714,
      longitude: -73.4130,
      phone: '(203) 555-0405',
      website: 'https://bethelfitness.com',
      hours: { mon: '5am-10pm', tue: '5am-10pm', wed: '5am-10pm', thu: '5am-10pm', fri: '5am-9pm', sat: '7am-5pm', sun: '8am-3pm' },
      source: 'manual' as const,
    },
    {
      name: 'Danbury Plumbing & Heating',
      slug: 'danbury-plumbing-heating',
      description: 'Licensed plumber offering 24/7 emergency service. Residential and commercial.',
      category_id: catMap['plumbing'],
      address: '55 White St',
      city: 'Danbury',
      state: 'CT',
      zip: '06810',
      latitude: 41.3967,
      longitude: -73.4540,
      phone: '(203) 555-0506',
      hours: { mon: '7am-6pm', tue: '7am-6pm', wed: '7am-6pm', thu: '7am-6pm', fri: '7am-6pm', sat: '8am-12pm', sun: 'Emergency only' },
      featured: true,
      source: 'manual' as const,
    },
    {
      name: 'The Sugar Mill Bakery',
      slug: 'sugar-mill-bakery',
      description: 'Artisan bakery offering fresh bread, pastries, and custom cakes. Locally sourced ingredients.',
      category_id: catMap['bakery'],
      address: '12 P.T. Barnum Square',
      city: 'Bethel',
      state: 'CT',
      zip: '06801',
      latitude: 41.3711,
      longitude: -73.4111,
      phone: '(203) 555-0607',
      hours: { mon: 'Closed', tue: '7am-4pm', wed: '7am-4pm', thu: '7am-4pm', fri: '7am-5pm', sat: '7am-5pm', sun: '8am-2pm' },
      source: 'manual' as const,
    },
    {
      name: 'Brookfield Electric',
      slug: 'brookfield-electric',
      description: 'Residential and commercial electrical contractor. Licensed, bonded, and insured.',
      category_id: catMap['electrician'],
      address: '200 Whisconier Rd',
      city: 'Brookfield',
      state: 'CT',
      zip: '06804',
      latitude: 41.4218,
      longitude: -73.3916,
      phone: '(203) 555-0708',
      hours: { mon: '7am-5pm', tue: '7am-5pm', wed: '7am-5pm', thu: '7am-5pm', fri: '7am-4pm', sat: 'By appointment', sun: 'Closed' },
      source: 'manual' as const,
    },
  ];

  console.log('🏢 Seeding businesses...');
  // Delete existing seed businesses first (by slug)
  const slugs = businesses.map(b => b.slug);
  await supabase.from('businesses').delete().in('slug', slugs);

  const { data: bizData, error: bizErr } = await supabase
    .from('businesses')
    .insert(businesses)
    .select();

  if (bizErr) { console.error('Business error:', bizErr); return; }
  console.log(`  ✅ ${bizData!.length} businesses`);

  console.log('\n🎉 Seed complete!');
}

seed().catch(console.error);
