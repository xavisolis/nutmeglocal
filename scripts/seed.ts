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

// ---------------------------------------------------------------------------
// Categories (22 total — covers all Tier 1, 2, 3 business types from the plan)
// ---------------------------------------------------------------------------
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
  { name: 'Tree Services', slug: 'tree-services', icon: '🌳' },
  { name: 'Painting', slug: 'painting', icon: '🎨' },
  { name: 'General Contractor', slug: 'general-contractor', icon: '🔨' },
  { name: 'Pest Control', slug: 'pest-control', icon: '🐛' },
];

// ---------------------------------------------------------------------------
// Town reference data — centers, zips, real street names
// ---------------------------------------------------------------------------
interface TownData {
  name: string;
  zip: string;
  lat: number;
  lng: number;
  streets: string[];
}

const towns: TownData[] = [
  {
    name: 'Danbury',
    zip: '06810',
    lat: 41.4015,
    lng: -73.4540,
    streets: [
      'Main St', 'White St', 'Elm St', 'Lake Ave', 'West St', 'Park Ave',
      'Osborne St', 'Deer Hill Ave', 'Padanaram Rd', 'Kenosia Ave',
      'Shelter Rock Rd', 'Newtown Rd', 'Mill Plain Rd', 'Backus Ave',
      'Federal Rd', 'Clapboard Ridge Rd', 'Triangle St', 'Balmforth Ave',
    ],
  },
  {
    name: 'Bethel',
    zip: '06801',
    lat: 41.3714,
    lng: -73.4130,
    streets: [
      'Greenwood Ave', 'Grassy Plain St', 'Stony Hill Rd', 'Diamond Ave',
      'P.T. Barnum Square', 'Chestnut St', 'Nashville Rd', 'Walnut Hill Rd',
      'Plumtrees Rd', 'Old Hawleyville Rd', 'Milwaukee Ave', 'School St',
    ],
  },
  {
    name: 'Brookfield',
    zip: '06804',
    lat: 41.4182,
    lng: -73.3970,
    streets: [
      'Federal Rd', 'Whisconier Rd', 'Candlewood Lake Rd', 'Station Rd',
      'Obtuse Rd', 'Junction Rd', 'Pocono Rd', 'Laurel Hill Rd',
      'Silvermine Rd', 'Long Meadow Hill Rd', 'Old New Milford Rd',
    ],
  },
  {
    name: 'Kent',
    zip: '06757',
    lat: 41.7245,
    lng: -73.4769,
    streets: [
      'Main St', 'Kent Cornwall Rd', 'Maple St', 'Studio Hill Rd',
      'South Main St', 'Bridge St', 'Railroad St', 'North Main St',
    ],
  },
  {
    name: 'New Fairfield',
    zip: '06812',
    lat: 41.4666,
    lng: -73.4859,
    streets: [
      'Route 39', 'Brush Hill Rd', 'Gillotti Rd', 'Meeting House Hill Rd',
      'Ball Pond Rd', 'Shortwoods Rd', 'Candlewood Lake Rd', 'Lakeshore Dr',
    ],
  },
  {
    name: 'New Milford',
    zip: '06776',
    lat: 41.5770,
    lng: -73.4085,
    streets: [
      'Bank St', 'Main St', 'Bridge St', 'Railroad St', 'Kent Rd',
      'Danbury Rd', 'Grove St', 'Prospect Hill Rd', 'Still River Dr',
      'Park Lane Rd', 'Old Town Park Rd', 'Housatonic Ave',
    ],
  },
  {
    name: 'Newtown',
    zip: '06470',
    lat: 41.4139,
    lng: -73.3116,
    streets: [
      'Main St', 'Church Hill Rd', 'Queen St', 'South Main St',
      'Hawleyville Rd', 'Mt Pleasant Rd', 'Berkshire Rd', 'Sugar St',
      'Dodgingtown Rd', 'Prospect Dr', 'Wasserman Way', 'Commerce Rd',
    ],
  },
  {
    name: 'Redding',
    zip: '06896',
    lat: 41.3050,
    lng: -73.3830,
    streets: [
      'Redding Rd', 'Cross Hwy', 'Lonetown Rd', 'Black Rock Turnpike',
      'Umpawaug Rd', 'Old Redding Rd', 'Meeker Hill Rd', 'Hill Rd',
    ],
  },
  {
    name: 'Ridgefield',
    zip: '06877',
    lat: 41.2815,
    lng: -73.4984,
    streets: [
      'Main St', 'Danbury Rd', 'Prospect St', 'High Ridge Ave',
      'Catoonah St', 'Bailey Ave', 'Branchville Rd', 'Copps Hill Rd',
      'North Salem Rd', 'Silver Hill Rd', 'Governor St', 'Olmstead Ln',
    ],
  },
  {
    name: 'Sherman',
    zip: '06784',
    lat: 41.5800,
    lng: -73.4950,
    streets: [
      'Route 37', 'Route 39', 'Spring Lake Rd', 'Sawmill Rd',
      'Coote Hill Rd', 'Old Greenwoods Rd', 'Church Rd', 'Taber Rd',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Small random offset to spread pins on the map */
function jitter(base: number, range = 0.008): number {
  return +(base + (Math.random() - 0.5) * range).toFixed(6);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addr(num: number, street: string): string {
  return `${num} ${street}`;
}

// Realistic hours by business type
const hoursTemplates: Record<string, Record<string, string>> = {
  restaurant: { mon: '11am-9pm', tue: '11am-9pm', wed: '11am-9pm', thu: '11am-9pm', fri: '11am-10pm', sat: '11am-10pm', sun: '11am-8pm' },
  diner: { mon: '6am-3pm', tue: '6am-3pm', wed: '6am-3pm', thu: '6am-3pm', fri: '6am-3pm', sat: '7am-3pm', sun: '7am-2pm' },
  bakery: { mon: 'Closed', tue: '7am-4pm', wed: '7am-4pm', thu: '7am-4pm', fri: '7am-5pm', sat: '7am-5pm', sun: '8am-2pm' },
  trade: { mon: '7am-5pm', tue: '7am-5pm', wed: '7am-5pm', thu: '7am-5pm', fri: '7am-4pm', sat: 'By appointment', sun: 'Closed' },
  service: { mon: '8am-5pm', tue: '8am-5pm', wed: '8am-5pm', thu: '8am-5pm', fri: '8am-5pm', sat: '9am-1pm', sun: 'Closed' },
  medical: { mon: '9am-5pm', tue: '9am-5pm', wed: '9am-7pm', thu: '9am-5pm', fri: '9am-3pm', sat: 'Closed', sun: 'Closed' },
  retail: { mon: '9am-6pm', tue: '9am-6pm', wed: '9am-6pm', thu: '9am-6pm', fri: '9am-7pm', sat: '10am-5pm', sun: '11am-4pm' },
  fitness: { mon: '5am-10pm', tue: '5am-10pm', wed: '5am-10pm', thu: '5am-10pm', fri: '5am-9pm', sat: '7am-5pm', sun: '8am-3pm' },
  salon: { mon: 'Closed', tue: '9am-7pm', wed: '9am-7pm', thu: '9am-8pm', fri: '9am-7pm', sat: '9am-5pm', sun: 'Closed' },
  emergency: { mon: '7am-6pm', tue: '7am-6pm', wed: '7am-6pm', thu: '7am-6pm', fri: '7am-6pm', sat: '8am-12pm', sun: 'Emergency only' },
};

// Fictional phone generator — (203) 555-XXXX
let phoneSeq = 1001;
function phone(): string {
  const num = phoneSeq++;
  return `(203) 555-${num}`;
}

// ---------------------------------------------------------------------------
// Business definitions — all fictional, organized by town
// ---------------------------------------------------------------------------
interface BizDef {
  name: string;
  cat: string;       // category slug
  desc: string;
  hoursType: string;  // key into hoursTemplates
  featured?: boolean;
}

// Town → businesses mapping
const businessDefs: Record<string, BizDef[]> = {
  Danbury: [
    { name: "Elmer's Diner", cat: 'restaurant', desc: 'Classic American diner serving breakfast and lunch since 1960. Famous for pancakes and homestyle cooking.', hoursType: 'diner', featured: true },
    { name: 'Hat City Landscaping', cat: 'landscaping', desc: 'Full-service landscaping for residential and commercial properties. Spring cleanups, mowing, and hardscaping.', hoursType: 'trade' },
    { name: 'Danbury Plumbing & Heating', cat: 'plumbing', desc: 'Licensed plumber offering 24/7 emergency service. Residential and commercial.', hoursType: 'emergency', featured: true },
    { name: 'Main Street Electric', cat: 'electrician', desc: 'Residential and commercial electrician. Panel upgrades, rewiring, and generator installation.', hoursType: 'trade' },
    { name: 'Kenosia Auto Body', cat: 'auto-repair', desc: 'Full collision repair, paint matching, and insurance claim assistance. Family-owned since 1995.', hoursType: 'service' },
    { name: 'Lake Avenue Dental', cat: 'dentist', desc: 'Comprehensive family dentistry. Cleanings, whitening, invisalign, and emergency care.', hoursType: 'medical' },
    { name: 'Shear Perfection', cat: 'hair-salon', desc: 'Modern hair salon offering cuts, color, highlights, and keratin treatments for men and women.', hoursType: 'salon' },
    { name: 'Berkshire Realty Group', cat: 'real-estate', desc: 'Helping families buy and sell homes in Greater Danbury. Free market analysis.', hoursType: 'service' },
    { name: 'Ironworks Fitness', cat: 'fitness', desc: 'Strength training and CrossFit-style gym with certified coaches. Drop-ins welcome.', hoursType: 'fitness' },
    { name: 'Pawsome Pet Grooming', cat: 'pet-services', desc: 'Professional dog and cat grooming. Bath, cut, nails, and teeth cleaning.', hoursType: 'service' },
    { name: 'Danbury Bread Co.', cat: 'bakery', desc: 'Handmade sourdough, croissants, and seasonal pastries baked fresh every morning.', hoursType: 'bakery' },
    { name: 'Spotless Cleaning Co.', cat: 'cleaning-services', desc: 'Residential and move-out cleaning. Eco-friendly products. Licensed and insured.', hoursType: 'service' },
    { name: 'Northeast Climate Control', cat: 'hvac', desc: 'Heating, cooling, and duct cleaning. Carrier and Lennox certified dealer.', hoursType: 'trade', featured: true },
    { name: 'Treetop Removal LLC', cat: 'tree-services', desc: 'Tree removal, stump grinding, and lot clearing. Crane service available for difficult removals.', hoursType: 'trade' },
    { name: 'Padanaram Roofing', cat: 'roofing', desc: 'Residential roofing — shingle, flat, and metal roof installation and repair. Free estimates.', hoursType: 'trade' },
    { name: 'Shield Insurance Agency', cat: 'insurance', desc: 'Auto, home, business, and life insurance. Independent agency representing 15+ carriers.', hoursType: 'service' },
    { name: 'Deer Hill Tax & Accounting', cat: 'accounting', desc: 'Tax preparation, bookkeeping, and payroll services for individuals and small businesses.', hoursType: 'service' },
    { name: 'Color Theory Painting', cat: 'painting', desc: 'Interior and exterior painting. Cabinet refinishing and wallpaper removal. 10-year warranty.', hoursType: 'trade' },
    { name: 'Housatonic Builders', cat: 'general-contractor', desc: 'Residential remodeling — kitchens, bathrooms, additions, and finished basements. CT licensed.', hoursType: 'trade' },
    { name: 'Guardian Pest Solutions', cat: 'pest-control', desc: 'Termite, ant, rodent, and wildlife control. One-time and seasonal treatment plans.', hoursType: 'service' },
    { name: 'Hat City Pizza & Grill', cat: 'restaurant', desc: 'Brick-oven pizza, fresh pastas, and grilled entrees. Family dining with a full bar.', hoursType: 'restaurant' },
    { name: 'Mill Plain Pharmacy', cat: 'pharmacy', desc: 'Independent pharmacy with fast prescription fills, compounding, and free delivery.', hoursType: 'retail' },
    { name: 'Elm Street Photography', cat: 'photography', desc: 'Portraits, weddings, and events. Natural light studio downtown.', hoursType: 'service' },
    { name: 'Nutmeg Nails & Spa', cat: 'hair-salon', desc: 'Manicures, pedicures, waxing, and facials. Walk-ins welcome.', hoursType: 'salon' },
  ],
  Bethel: [
    { name: 'Greenworks Landscaping', cat: 'landscaping', desc: 'Full-service landscaping company — lawn care, hardscaping, seasonal cleanups. Serving Greater Danbury for 15 years.', hoursType: 'trade' },
    { name: 'The Sugar Mill Bakery', cat: 'bakery', desc: 'Artisan bakery offering fresh bread, pastries, and custom cakes. Locally sourced ingredients.', hoursType: 'bakery' },
    { name: 'Bethel Fitness Club', cat: 'fitness', desc: 'Modern gym with group classes, personal training, and childcare. No contracts.', hoursType: 'fitness' },
    { name: 'Grassy Plain Pizza', cat: 'restaurant', desc: 'New Haven-style thin crust pizza. Voted best pizza in Bethel three years running.', hoursType: 'restaurant' },
    { name: 'Bethel Family Dental', cat: 'dentist', desc: 'Pediatric and adult dentistry. Same-day crowns with CEREC technology.', hoursType: 'medical' },
    { name: 'Roots Hair Studio', cat: 'hair-salon', desc: 'Color specialists and precision cuts in a relaxed, modern space. Davines products.', hoursType: 'salon' },
    { name: 'Nashville Road Electric', cat: 'electrician', desc: 'EV charger installation, smart home wiring, and whole-house generators.', hoursType: 'trade' },
    { name: 'Diamond Plumbing', cat: 'plumbing', desc: 'Drain cleaning, water heater replacement, and bathroom remodels. Same-day service available.', hoursType: 'emergency' },
    { name: 'Stony Hill Roofing', cat: 'roofing', desc: 'GAF-certified roofing contractor. Shingles, gutters, and ice dam prevention.', hoursType: 'trade' },
    { name: 'Chestnut Cleaning Services', cat: 'cleaning-services', desc: 'Weekly, biweekly, and deep cleaning for homes and offices. Background-checked staff.', hoursType: 'service' },
    { name: 'Barnum Square Realty', cat: 'real-estate', desc: 'Bethel real estate experts. Residential sales and rental management.', hoursType: 'service' },
    { name: 'Walnut Hill Auto', cat: 'auto-repair', desc: 'European and Japanese car specialist. Oil changes to engine rebuilds.', hoursType: 'service' },
    { name: 'Bethel Tax Pros', cat: 'accounting', desc: 'Individual and business tax returns. QuickBooks setup and training.', hoursType: 'service' },
    { name: 'Paws & Claws Bethel', cat: 'pet-services', desc: 'Doggy daycare, boarding, and grooming. Outdoor play areas and webcams for owners.', hoursType: 'service' },
    { name: 'Whiting Painters', cat: 'painting', desc: 'Interior and exterior house painting. Lead-safe certified for older homes.', hoursType: 'trade' },
    { name: 'Bethel General Contracting', cat: 'general-contractor', desc: 'Decks, patios, siding, and home additions. Licensed and insured in CT.', hoursType: 'trade' },
  ],
  Brookfield: [
    { name: 'Brookfield Auto Care', cat: 'auto-repair', desc: 'Trusted auto repair shop specializing in foreign and domestic vehicles. ASE certified technicians.', hoursType: 'service', featured: true },
    { name: 'Brookfield Electric', cat: 'electrician', desc: 'Residential and commercial electrical contractor. Licensed, bonded, and insured.', hoursType: 'trade' },
    { name: 'Federal Road Diner', cat: 'restaurant', desc: 'All-day breakfast and comfort food on Route 7. Generous portions and friendly service.', hoursType: 'diner', featured: true },
    { name: 'Candlewood Dental Group', cat: 'dentist', desc: 'Multi-doctor practice offering general, cosmetic, and implant dentistry.', hoursType: 'medical' },
    { name: 'Route 7 Landscaping', cat: 'landscaping', desc: 'Design, installation, and maintenance. Patios, retaining walls, and irrigation systems.', hoursType: 'trade' },
    { name: 'Brookfield Pharmacy', cat: 'pharmacy', desc: 'Locally owned pharmacy with compounding, immunizations, and medication therapy management.', hoursType: 'retail' },
    { name: 'Station Road Hair', cat: 'hair-salon', desc: 'Boutique salon for women and men. Balayage, extensions, and blowout bar.', hoursType: 'salon' },
    { name: 'Pocono Plumbing & Drain', cat: 'plumbing', desc: 'Sewer line repair, hydro jetting, and new construction plumbing. Flat-rate pricing.', hoursType: 'emergency' },
    { name: 'FitZone Brookfield', cat: 'fitness', desc: 'Boutique gym with personal training, yoga, and spin classes. First class free.', hoursType: 'fitness' },
    { name: 'Laurel Hill Tree Service', cat: 'tree-services', desc: 'Pruning, removal, and storm damage cleanup. Bucket truck and chipper on every job.', hoursType: 'trade' },
    { name: 'Brookfield Home Builders', cat: 'general-contractor', desc: 'Custom homes and whole-house renovations. Design-build process from plans to move-in.', hoursType: 'trade' },
    { name: 'Valley HVAC Services', cat: 'hvac', desc: 'AC installation, furnace repair, and ductless mini-split systems. 24/7 emergency service.', hoursType: 'trade' },
    { name: 'Whispering Pines Pet Care', cat: 'pet-services', desc: 'In-home pet sitting, dog walking, and overnight boarding. Serving Brookfield and surrounding towns.', hoursType: 'service' },
    { name: 'Brookfield Insurance Center', cat: 'insurance', desc: 'Personal and commercial insurance. Flood, umbrella, and high-value home coverage.', hoursType: 'service' },
    { name: 'Candlewood Photography', cat: 'photography', desc: 'Family portraits, senior photos, and real estate photography. On-location and studio sessions.', hoursType: 'service' },
    { name: 'Federal Road Cleaning', cat: 'cleaning-services', desc: 'Commercial office cleaning and janitorial services. Daily, weekly, or monthly plans.', hoursType: 'service' },
    { name: 'Brookfield Thai Kitchen', cat: 'restaurant', desc: 'Authentic Thai cuisine with fresh ingredients. Dine-in, takeout, and catering available.', hoursType: 'restaurant' },
  ],
  Kent: [
    { name: 'Kent Coffee & Bakery', cat: 'bakery', desc: 'Artisan coffee roasted on-site with fresh-baked scones, muffins, and seasonal pies.', hoursType: 'bakery' },
    { name: 'The Iron Forge', cat: 'restaurant', desc: 'Farm-to-table dining in a restored 1820s forge. Local wines and craft cocktails.', hoursType: 'restaurant', featured: true },
    { name: 'Kent Realty Associates', cat: 'real-estate', desc: 'Litchfield County specialists. Country homes, estates, and land parcels.', hoursType: 'service' },
    { name: 'Studio Hill Photography', cat: 'photography', desc: 'Fine art and landscape photography. Gallery on Main St with prints for sale.', hoursType: 'service' },
    { name: 'Cornwall Bridge Plumbing', cat: 'plumbing', desc: 'Reliable plumber for Kent and surrounding hill towns. Well pump service available.', hoursType: 'trade' },
    { name: 'Housatonic Tree Experts', cat: 'tree-services', desc: 'Arborist-guided tree care in the Litchfield Hills. Preservation and hazard removal.', hoursType: 'trade' },
    { name: 'Kent Landscape Design', cat: 'landscaping', desc: 'Native plantings, stone walls, and garden design for country properties.', hoursType: 'trade' },
    { name: 'Maple Street Electric', cat: 'electrician', desc: 'Small-town electrician for residential work. Generator hookups and panel upgrades.', hoursType: 'trade' },
    { name: 'Kent General Store & Pharmacy', cat: 'pharmacy', desc: 'Traditional general store with a full-service pharmacy counter.', hoursType: 'retail' },
    { name: 'River House Painting', cat: 'painting', desc: 'Historic home painting specialists. Lead-safe and period-appropriate color consulting.', hoursType: 'trade' },
  ],
  'New Fairfield': [
    { name: 'Lakeside Landscaping', cat: 'landscaping', desc: 'Lakefront property specialists. Erosion control, retaining walls, and seasonal cleanups.', hoursType: 'trade' },
    { name: 'Candlewood Cove Restaurant', cat: 'restaurant', desc: 'Waterfront dining with lake views. Seafood, steaks, and a seasonal patio.', hoursType: 'restaurant', featured: true },
    { name: 'Ball Pond Electric', cat: 'electrician', desc: 'Residential electrician. Dock wiring, outdoor lighting, and whole-house generators.', hoursType: 'trade' },
    { name: 'New Fairfield Plumbing', cat: 'plumbing', desc: 'Well pump service, water treatment, and residential plumbing repair.', hoursType: 'emergency' },
    { name: 'Lakeshore Roofing & Siding', cat: 'roofing', desc: 'Roofing, siding, and gutter installation. Storm damage specialists.', hoursType: 'trade' },
    { name: 'Shoreline Pest Control', cat: 'pest-control', desc: 'Tick, mosquito, and ant treatment for lakefront properties. Organic options available.', hoursType: 'service' },
    { name: 'Shortwoods HVAC', cat: 'hvac', desc: 'Heating and cooling service. Ductless mini-splits and whole-house systems.', hoursType: 'trade' },
    { name: 'Meeting House Cleaning', cat: 'cleaning-services', desc: 'Residential cleaning for New Fairfield and Sherman. Move-in/move-out specialists.', hoursType: 'service' },
    { name: 'Candlewood Pet Vet', cat: 'pet-services', desc: 'Veterinary clinic and pet boarding. Wellness exams, dental cleaning, and surgery.', hoursType: 'medical' },
    { name: 'New Fairfield Builders', cat: 'general-contractor', desc: 'Lakehouse renovations, docks, and outdoor living spaces. CT licensed builder.', hoursType: 'trade' },
    { name: 'Lakeside Tax Services', cat: 'accounting', desc: 'Tax prep for individuals and small businesses. Year-round bookkeeping support.', hoursType: 'service' },
    { name: 'NF Family Dentistry', cat: 'dentist', desc: 'Gentle family dentistry. Sedation options for anxious patients.', hoursType: 'medical' },
    { name: 'Candlewood Fitness', cat: 'fitness', desc: 'Community gym with free weights, cardio, and group classes. Month-to-month membership.', hoursType: 'fitness' },
  ],
  'New Milford': [
    { name: 'Bank Street Bistro', cat: 'restaurant', desc: 'Contemporary American bistro on the green. Seasonal menu with local farm ingredients.', hoursType: 'restaurant', featured: true },
    { name: 'Heritage Landscaping', cat: 'landscaping', desc: 'Lawn care, landscape design, and snow plowing. Serving New Milford for 20 years.', hoursType: 'trade' },
    { name: 'Housatonic Valley Electric', cat: 'electrician', desc: 'Commercial and residential electrical work. Solar panel installation certified.', hoursType: 'trade' },
    { name: 'New Milford Dental Arts', cat: 'dentist', desc: 'Cosmetic and restorative dentistry. Veneers, implants, and smile makeovers.', hoursType: 'medical' },
    { name: 'Bridge Street Plumbing', cat: 'plumbing', desc: 'Full-service plumbing. Water heater installation, bathroom renovations, and backflow testing.', hoursType: 'emergency' },
    { name: 'Green on the Green', cat: 'bakery', desc: 'Organic bakery and cafe on the New Milford Green. Fresh juices and vegan options.', hoursType: 'bakery' },
    { name: 'Valley Fitness & Wellness', cat: 'fitness', desc: 'Full gym, pool, and wellness center. Personal training and physical therapy on site.', hoursType: 'fitness' },
    { name: 'Towne Roofing Co.', cat: 'roofing', desc: 'Family-owned roofing company. Slate, copper, and architectural shingle specialist.', hoursType: 'trade' },
    { name: 'New Milford Hair Design', cat: 'hair-salon', desc: 'Full-service salon for the whole family. Color correction specialists.', hoursType: 'salon' },
    { name: 'Prospect Hill Realty', cat: 'real-estate', desc: 'New Milford homes and land. First-time buyer specialists with local expertise.', hoursType: 'service' },
    { name: 'Danbury Road Auto', cat: 'auto-repair', desc: 'State inspection, oil changes, and major repair. Loaner cars available.', hoursType: 'service' },
    { name: 'Still River Cleaning', cat: 'cleaning-services', desc: 'House cleaning, post-construction cleanup, and pressure washing.', hoursType: 'service' },
    { name: 'New Milford Insurance', cat: 'insurance', desc: 'Independent insurance agency. Home, auto, and business policies from top carriers.', hoursType: 'service' },
    { name: 'Park Lane Pharmacy', cat: 'pharmacy', desc: 'Full-service pharmacy with home delivery. Compounding and immunizations.', hoursType: 'retail' },
    { name: 'Housatonic Painting Co.', cat: 'painting', desc: 'Interior and exterior painting. Power washing and deck staining.', hoursType: 'trade' },
    { name: 'Valley Tree & Stump', cat: 'tree-services', desc: 'Tree removal, lot clearing, and stump grinding. Firewood available.', hoursType: 'trade' },
    { name: 'Kent Road Builders', cat: 'general-contractor', desc: 'New construction and major renovations. Energy-efficient building specialists.', hoursType: 'trade' },
    { name: 'Riverview Pet Spa', cat: 'pet-services', desc: 'Dog grooming, cat grooming, and self-wash stations. Natural shampoos.', hoursType: 'service' },
    { name: 'New Milford Pest Defense', cat: 'pest-control', desc: 'Carpenter ant, termite, and rodent control. Free inspections for new customers.', hoursType: 'service' },
    { name: 'Grove Street Accounting', cat: 'accounting', desc: 'CPA firm for small businesses. Payroll, tax, and financial planning.', hoursType: 'service' },
  ],
  Newtown: [
    { name: 'Queen Street Diner', cat: 'restaurant', desc: 'Neighborhood diner with oversized portions and homemade pies. Cash only.', hoursType: 'diner' },
    { name: 'The Roasted Bean', cat: 'bakery', desc: 'Specialty coffee roaster and bakery. Fresh muffins, quiche, and artisan bread.', hoursType: 'bakery', featured: true },
    { name: 'Newtown Dental Group', cat: 'dentist', desc: 'Multi-specialty dental practice. Orthodontics, oral surgery, and periodontics under one roof.', hoursType: 'medical' },
    { name: 'Hawleyville Electric', cat: 'electrician', desc: 'Master electrician for residential and light commercial. Code-compliant work guaranteed.', hoursType: 'trade' },
    { name: 'Mt Pleasant Plumbing', cat: 'plumbing', desc: 'Residential plumber. Sump pumps, water softeners, and gas line installation.', hoursType: 'emergency' },
    { name: 'Church Hill Landscaping', cat: 'landscaping', desc: 'Landscape architecture and installation. Japanese gardens and perennial borders.', hoursType: 'trade' },
    { name: 'Sugar Street Salon', cat: 'hair-salon', desc: 'Boutique salon specializing in organic color and curly hair care.', hoursType: 'salon' },
    { name: 'Newtown Auto Works', cat: 'auto-repair', desc: 'Hybrid and electric vehicle specialist. Also servicing all makes and models.', hoursType: 'service' },
    { name: 'Berkshire HVAC', cat: 'hvac', desc: 'Geothermal, heat pump, and traditional HVAC installation. Energy audits available.', hoursType: 'trade' },
    { name: 'Dodgingtown Tree Care', cat: 'tree-services', desc: 'ISA-certified arborist. Tree health assessments, pruning, and emergency storm work.', hoursType: 'trade' },
    { name: 'Sandy Hook Realty', cat: 'real-estate', desc: 'Homes in Newtown, Monroe, and Southbury. Open house listings updated weekly.', hoursType: 'service' },
    { name: 'Commerce Road Builders', cat: 'general-contractor', desc: 'Commercial build-outs and residential additions. Project management from permit to punch list.', hoursType: 'trade' },
    { name: 'Newtown Pet Hospital', cat: 'pet-services', desc: 'Full-service veterinary care. Emergency hours, dental, and orthopedic surgery.', hoursType: 'medical' },
    { name: 'Prospect Fitness', cat: 'fitness', desc: 'Personal training studio with small group classes. Strength, HIIT, and mobility.', hoursType: 'fitness' },
    { name: 'Newtown Professional Cleaning', cat: 'cleaning-services', desc: 'Eco-friendly residential and commercial cleaning. Satisfaction guaranteed.', hoursType: 'service' },
    { name: 'Nutmeg Roofing & Gutters', cat: 'roofing', desc: 'Roof replacement, repair, and seamless gutter installation. GAF Master Elite certified.', hoursType: 'trade' },
    { name: 'Newtown Photography Co.', cat: 'photography', desc: 'Family, newborn, and high school senior portraits. Outdoor and in-studio sessions.', hoursType: 'service' },
  ],
  Redding: [
    { name: 'Black Rock Landscaping', cat: 'landscaping', desc: 'Thoughtful landscape design for rural properties. Native plantings and meadow restoration.', hoursType: 'trade' },
    { name: 'Cross Highway Electric', cat: 'electrician', desc: 'Residential electrician serving Redding, Weston, and Easton. Generator specialist.', hoursType: 'trade' },
    { name: 'Lonetown Builders', cat: 'general-contractor', desc: 'Historic home renovation and barn conversions. Preservation-sensitive approach.', hoursType: 'trade' },
    { name: 'Redding Tree & Land', cat: 'tree-services', desc: 'Land clearing, tree removal, and brush chipping. Horse farm fencing also available.', hoursType: 'trade' },
    { name: 'The Redding Roadhouse', cat: 'restaurant', desc: 'Casual gastropub in the center of town. Burgers, craft beer, and live music on weekends.', hoursType: 'restaurant' },
    { name: 'Umpawaug Plumbing', cat: 'plumbing', desc: 'Well pump service, septic connections, and residential plumbing. Serving Redding since 2005.', hoursType: 'trade' },
    { name: 'Meeker Hill Painting', cat: 'painting', desc: 'Exterior painting for large homes and estates. Barn and outbuilding painting.', hoursType: 'trade' },
    { name: 'Redding Realty Group', cat: 'real-estate', desc: 'Country homes and equestrian properties. Expert knowledge of Redding zoning.', hoursType: 'service' },
    { name: 'Old Redding Pest Control', cat: 'pest-control', desc: 'Tick and deer management for rural properties. Pet-safe treatments.', hoursType: 'service' },
    { name: 'Redding Ridge Roofing', cat: 'roofing', desc: 'Cedar shake, slate, and standing seam metal roofing. Historic home specialists.', hoursType: 'trade' },
  ],
  Ridgefield: [
    { name: 'Ridgefield Smiles Dental', cat: 'dentist', desc: 'Family and cosmetic dentistry in downtown Ridgefield. Accepting new patients.', hoursType: 'medical' },
    { name: 'The Elms Restaurant', cat: 'restaurant', desc: 'Fine dining with New England flair. Farm partnerships with local growers. Prix fixe Sunday supper.', hoursType: 'restaurant', featured: true },
    { name: 'Main Street Cleaners & Tailors', cat: 'cleaning-services', desc: 'Dry cleaning, alterations, and garment repair. Same-day service available.', hoursType: 'retail' },
    { name: 'Ridgefield Fitness Studio', cat: 'fitness', desc: 'Pilates, barre, and yoga studio. Private reformer sessions and group mat classes.', hoursType: 'fitness' },
    { name: 'Catoonah Street Salon', cat: 'hair-salon', desc: 'Upscale salon with master stylists. Bridal packages and event styling.', hoursType: 'salon' },
    { name: 'Silver Hill Landscaping', cat: 'landscaping', desc: 'Estate landscape maintenance and design. Formal gardens, hedging, and seasonal color.', hoursType: 'trade' },
    { name: 'Branchville Plumbing', cat: 'plumbing', desc: 'Reliable plumber for Ridgefield and Redding. Bathroom renovations and water line replacement.', hoursType: 'trade' },
    { name: 'Governor Street Electric', cat: 'electrician', desc: 'Landscape lighting, home automation, and electrical panel upgrades.', hoursType: 'trade' },
    { name: 'Copps Hill Builders', cat: 'general-contractor', desc: 'High-end kitchen and bath renovations. Architect-builder collaboration.', hoursType: 'trade' },
    { name: 'Olmstead Insurance Group', cat: 'insurance', desc: 'Personal lines and commercial insurance. Specializing in high-value homes and fine art.', hoursType: 'service' },
    { name: 'Ridgefield Veterinary Hospital', cat: 'pet-services', desc: 'Compassionate veterinary care. Boarding, grooming, and acupuncture for pets.', hoursType: 'medical' },
    { name: 'Prospect Street Photography', cat: 'photography', desc: 'Documentary-style family and wedding photography. Published in CT Magazine.', hoursType: 'service' },
    { name: 'Bailey Avenue Pharmacy', cat: 'pharmacy', desc: 'Neighborhood pharmacy with vitamins, supplements, and wellness consultations.', hoursType: 'retail' },
    { name: 'Danbury Road Auto Service', cat: 'auto-repair', desc: 'Full-service auto repair and state inspection. European car specialists.', hoursType: 'service' },
    { name: 'High Ridge Roofing', cat: 'roofing', desc: 'Premium roofing contractor. Cedar, slate, and composite. Drone inspections.', hoursType: 'trade' },
    { name: 'Ridgefield Accounting Partners', cat: 'accounting', desc: 'Tax planning, estate planning, and audit preparation for affluent families and businesses.', hoursType: 'service' },
    { name: 'North Salem Tree Experts', cat: 'tree-services', desc: 'Expert pruning, view clearing, and removals for large estate trees.', hoursType: 'trade' },
    { name: 'The Ridgefield Bakehouse', cat: 'bakery', desc: 'French-inspired pastries, breads, and custom celebration cakes. Open Wednesday through Sunday.', hoursType: 'bakery', featured: true },
    { name: 'Silver Hill HVAC', cat: 'hvac', desc: 'High-efficiency heating and cooling. Smart thermostat installation and maintenance plans.', hoursType: 'trade' },
  ],
  Sherman: [
    { name: 'Sherman General Store', cat: 'restaurant', desc: 'Community gathering spot with breakfast sandwiches, soups, and local goods. Open daily.', hoursType: 'diner' },
    { name: 'Candlewood Shores Landscaping', cat: 'landscaping', desc: 'Lakefront lawn care, stone walls, and seasonal cleanups. Dock-side plantings.', hoursType: 'trade' },
    { name: 'Sawmill Electric', cat: 'electrician', desc: 'Licensed electrician for Sherman and New Fairfield. Emergency service available.', hoursType: 'trade' },
    { name: 'Sherman Plumbing & Well', cat: 'plumbing', desc: 'Well pump repair, water testing, and residential plumbing. Honest pricing.', hoursType: 'trade' },
    { name: 'Coote Hill Builders', cat: 'general-contractor', desc: 'Lake house construction, decks, and screen porches. Permit-to-finish service.', hoursType: 'trade' },
    { name: 'Old Greenwoods Tree Service', cat: 'tree-services', desc: 'Storm cleanup, hazardous tree removal, and firewood delivery. Insured.', hoursType: 'trade' },
    { name: 'Sherman Realty', cat: 'real-estate', desc: 'Candlewood Lake properties and Sherman country homes. Small-town expertise.', hoursType: 'service' },
    { name: 'Church Road Painting', cat: 'painting', desc: 'Exterior house painting and staining for Sherman and northern Fairfield County.', hoursType: 'trade' },
    { name: 'Taber Road Pest Solutions', cat: 'pest-control', desc: 'Tick spraying, wasp removal, and seasonal pest management for rural properties.', hoursType: 'service' },
    { name: 'Lake Sherman Roofing', cat: 'roofing', desc: 'Roof repair and replacement. Emergency tarping for storm damage.', hoursType: 'trade' },
  ],
};

// ---------------------------------------------------------------------------
// Build the full business array
// ---------------------------------------------------------------------------
interface BizRow {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  hours: Record<string, string>;
  featured: boolean;
  source: 'manual';
}

function buildBusinesses(catMap: Record<string, string>): BizRow[] {
  const rows: BizRow[] = [];
  const townMap = Object.fromEntries(towns.map((t) => [t.name, t]));

  for (const [townName, defs] of Object.entries(businessDefs)) {
    const town = townMap[townName];
    if (!town) { console.warn(`Unknown town: ${townName}`); continue; }

    for (const def of defs) {
      const catId = catMap[def.cat];
      if (!catId) { console.warn(`Unknown category: ${def.cat}`); continue; }

      const street = pickRandom(town.streets);
      const streetNum = 10 + Math.floor(Math.random() * 490);

      rows.push({
        name: def.name,
        slug: slug(def.name),
        description: def.desc,
        category_id: catId,
        address: addr(streetNum, street),
        city: town.name,
        state: 'CT',
        zip: town.zip,
        latitude: jitter(town.lat),
        longitude: jitter(town.lng),
        phone: phone(),
        hours: { ...hoursTemplates[def.hoursType] },
        featured: def.featured ?? false,
        source: 'manual' as const,
      });
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seed() {
  console.log('🌱 Seeding NutmegLocal development data...\n');

  // 1) Categories
  console.log('📂 Upserting categories...');
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select();

  if (catErr) { console.error('  ❌ Category error:', catErr); return; }
  console.log(`  ✅ ${cats!.length} categories`);

  const catMap = Object.fromEntries(cats!.map((c: any) => [c.slug, c.id]));

  // 2) Build business data
  const businesses = buildBusinesses(catMap);
  console.log(`\n🏢 Seeding ${businesses.length} businesses across ${towns.length} towns...`);

  // Count per town for reporting
  const perTown: Record<string, number> = {};
  for (const b of businesses) {
    perTown[b.city] = (perTown[b.city] || 0) + 1;
  }

  // 3) Clear existing seed data and insert
  // Delete all manual-source businesses (seed data) — leaves any user-claimed ones untouched
  const { error: delErr } = await supabase
    .from('businesses')
    .delete()
    .eq('source', 'manual')
    .eq('claimed', false);

  if (delErr) { console.error('  ❌ Delete error:', delErr); return; }

  // Insert in batches of 50 to avoid payload limits
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('businesses')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  ❌ Insert error (batch ${i / batchSize + 1}):`, error);
      return;
    }
    inserted += data!.length;
  }

  console.log(`  ✅ ${inserted} businesses inserted\n`);

  // 4) Report
  console.log('📊 Distribution:');
  const sortedTowns = Object.entries(perTown).sort((a, b) => b[1] - a[1]);
  for (const [town, count] of sortedTowns) {
    console.log(`   ${town.padEnd(16)} ${count}`);
  }

  const featured = businesses.filter((b) => b.featured).length;
  const catCounts: Record<string, number> = {};
  for (const b of businesses) {
    const catName = categories.find((c) => catMap[c.slug] === b.category_id)?.name || 'unknown';
    catCounts[catName] = (catCounts[catName] || 0) + 1;
  }

  console.log(`\n   Featured: ${featured}`);
  console.log(`   Categories used: ${Object.keys(catCounts).length}/${categories.length}`);
  console.log('\n🎉 Seed complete!');
}

seed().catch(console.error);
