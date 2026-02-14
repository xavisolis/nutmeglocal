/**
 * Seed script for NutmegLocal
 * Run: npx tsx scripts/seed.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  { name: 'Restaurants & Dining', slug: 'restaurants', icon: 'utensils' },
  { name: 'Home Services', slug: 'home-services', icon: 'wrench' },
  { name: 'Health & Wellness', slug: 'health-wellness', icon: 'heart-pulse' },
  { name: 'Auto Services', slug: 'auto-services', icon: 'car' },
  { name: 'Retail & Shopping', slug: 'retail', icon: 'shopping-bag' },
  { name: 'Professional Services', slug: 'professional-services', icon: 'briefcase' },
  { name: 'Beauty & Spas', slug: 'beauty-spas', icon: 'sparkles' },
  { name: 'Fitness & Recreation', slug: 'fitness', icon: 'dumbbell' },
  { name: 'Education & Tutoring', slug: 'education', icon: 'graduation-cap' },
  { name: 'Landscaping', slug: 'landscaping', icon: 'trees' },
  { name: 'Plumbing', slug: 'plumbing', icon: 'pipette' },
  { name: 'Electricians', slug: 'electricians', icon: 'zap' },
];

const businesses = [
  // Danbury
  { name: 'Sesame Seed', slug: 'sesame-seed', category: 'restaurants', address: '68 West Wooster St', city: 'Danbury', zip: '06810', lat: 41.3968, lng: -73.4540, phone: '(203) 885-1586', description: 'Mediterranean restaurant and bar in downtown Danbury.', featured: true },
  { name: 'Chuck\'s Steak House', slug: 'chucks-steak-house', category: 'restaurants', address: '20 Segar St', city: 'Danbury', zip: '06810', lat: 41.3950, lng: -73.4500, phone: '(203) 792-5555', description: 'Classic American steakhouse, family-owned since 1968.' },
  { name: 'Laskara Fitness', slug: 'laskara-fitness', category: 'fitness', address: '100 Mill Plain Rd', city: 'Danbury', zip: '06811', lat: 41.4080, lng: -73.4700, phone: '(203) 744-4544', description: 'Full-service gym and fitness center.' },
  { name: 'Danbury Auto Care', slug: 'danbury-auto-care', category: 'auto-services', address: '75 Federal Rd', city: 'Danbury', zip: '06811', lat: 41.4200, lng: -73.4800, phone: '(203) 790-6200', description: 'Complete auto repair and maintenance services.' },
  { name: 'The Barber Shop', slug: 'the-barber-shop', category: 'beauty-spas', address: '158 Main St', city: 'Danbury', zip: '06810', lat: 41.3962, lng: -73.4540, phone: '(203) 748-2383', description: 'Traditional barbershop in the heart of Danbury.' },
  { name: 'Berkshire Electric', slug: 'berkshire-electric', category: 'electricians', address: '22 Shelter Rock Rd', city: 'Danbury', zip: '06810', lat: 41.4100, lng: -73.4600, phone: '(203) 744-8200', description: 'Licensed electricians serving Greater Danbury.' },

  // Bethel
  { name: 'Greenwood\'s Landscaping', slug: 'greenwoods-landscaping', category: 'landscaping', address: '45 Grassy Plain St', city: 'Bethel', zip: '06801', lat: 41.3714, lng: -73.4140, phone: '(203) 794-1234', description: 'Full-service landscaping, lawn care, and snow removal.', featured: true },
  { name: 'Bethel Cycle & Fitness', slug: 'bethel-cycle-fitness', category: 'fitness', address: '120 Greenwood Ave', city: 'Bethel', zip: '06801', lat: 41.3710, lng: -73.4130, phone: '(203) 744-6281', description: 'Cycling shop and indoor fitness studio.' },

  // Brookfield
  { name: 'Brookfield Family Dental', slug: 'brookfield-family-dental', category: 'health-wellness', address: '275 Federal Rd', city: 'Brookfield', zip: '06804', lat: 41.4300, lng: -73.4000, phone: '(203) 775-6767', description: 'Family dentistry and cosmetic dental care.' },
  { name: 'DiGrazia Plumbing', slug: 'digrazia-plumbing', category: 'plumbing', address: '10 Commerce Rd', city: 'Brookfield', zip: '06804', lat: 41.4350, lng: -73.3900, phone: '(203) 775-3456', description: 'Residential and commercial plumbing services.' },

  // Ridgefield
  { name: 'Bernard\'s Restaurant', slug: 'bernards-restaurant', category: 'restaurants', address: '20 West Lane', city: 'Ridgefield', zip: '06877', lat: 41.2813, lng: -73.4982, phone: '(203) 438-8282', description: 'Fine dining in a historic inn setting.', featured: true },
  { name: 'Ridgefield Hardware', slug: 'ridgefield-hardware', category: 'retail', address: '104 Danbury Rd', city: 'Ridgefield', zip: '06877', lat: 41.2900, lng: -73.4950, phone: '(203) 438-3501', description: 'Your local hardware store since 1954.' },

  // New Milford
  { name: 'The Cookhouse', slug: 'the-cookhouse', category: 'restaurants', address: '31 Danbury Rd', city: 'New Milford', zip: '06776', lat: 41.5768, lng: -73.4085, phone: '(860) 355-4111', description: 'BBQ and Southern comfort food in New Milford.' },

  // Newtown
  { name: 'Newtown Yoga', slug: 'newtown-yoga', category: 'health-wellness', address: '34 Church Hill Rd', city: 'Newtown', zip: '06470', lat: 41.4142, lng: -73.3038, phone: '(203) 426-9642', description: 'Yoga classes for all levels in a welcoming studio.' },
];

async function seed() {
  console.log('Seeding categories...');
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select();

  if (catErr) { console.error('Category error:', catErr); return; }
  console.log(`✅ ${cats.length} categories seeded`);

  const catMap = Object.fromEntries(cats.map((c: any) => [c.slug, c.id]));

  const bizData = businesses.map((b) => ({
    name: b.name,
    slug: b.slug,
    description: b.description,
    category_id: catMap[b.category],
    address: b.address,
    city: b.city,
    state: 'CT',
    zip: b.zip,
    latitude: b.lat,
    longitude: b.lng,
    phone: b.phone,
    source: 'manual' as const,
    featured: b.featured || false,
    active: true,
  }));

  console.log('Seeding businesses...');
  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .upsert(bizData, { onConflict: 'city,slug' })
    .select();

  if (bizErr) { console.error('Business error:', bizErr); return; }
  console.log(`✅ ${biz.length} businesses seeded`);

  console.log('Done!');
}

seed();
