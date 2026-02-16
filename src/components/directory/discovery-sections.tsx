import Link from 'next/link';
import {
  MapPin, Star, ChevronRight, UtensilsCrossed, Car, TreePine,
  Scissors, Droplets, Bed, Scale, Dumbbell, Snowflake, Truck,
  Zap, Flower2, Shirt, CakeSlice, Baby, HandPlatter, SprayCan,
  HardHat, Pill, Warehouse, GraduationCap, Calculator, Hammer,
  Package, Paintbrush, Heart, Fan, Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BusinessCard } from '@/components/directory/business-card';
import type { Business, Category } from '@/types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'restaurant': UtensilsCrossed,
  'auto-repair': Car,
  'tree-services': TreePine,
  'hair-salon': Scissors,
  'plumbing': Droplets,
  'lodging': Bed,
  'lawyer': Scale,
  'fitness': Dumbbell,
  'snow-removal': Snowflake,
  'towing': Truck,
  'electrician': Zap,
  'landscaping': Flower2,
  'dry-cleaning': Shirt,
  'bakery': CakeSlice,
  'daycare': Baby,
  'catering': HandPlatter,
  'cleaning-services': SprayCan,
  'general-contractor': HardHat,
  'pharmacy': Pill,
  'storage': Warehouse,
  'tutoring-lessons': GraduationCap,
  'accounting': Calculator,
  'chiropractor-pt': Heart,
  'hvac': Fan,
  'florist': Flower2,
  'junk-removal': Package,
  'moving-services': Truck,
  'painting': Paintbrush,
  'handyman': Hammer,
};

// --- Featured Businesses (shown first — these are paying customers) ---

export function FeaturedBusinesses({ businesses }: { businesses: Business[] }) {
  if (businesses.length === 0) return null;

  const count = businesses.length;
  const gridCols =
    count === 1
      ? 'sm:grid-cols-1 max-w-lg'
      : count === 2
        ? 'sm:grid-cols-2 max-w-3xl'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-primary fill-primary/20" />
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Featured Businesses</h2>
      </div>
      <div className={`grid ${gridCols} gap-4`}>
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} refSource="featured" />
        ))}
      </div>
    </section>
  );
}

// --- Top Categories (compact — top 8, link to /categories for full list) ---

interface CategoryWithCount extends Category {
  businesses: { count: number }[];
}

export function TopCategories({ categories }: { categories: CategoryWithCount[] }) {
  const top = [...categories]
    .sort((a, b) => (b.businesses?.[0]?.count || 0) - (a.businesses?.[0]?.count || 0))
    .filter((c) => (c.businesses?.[0]?.count || 0) > 0)
    .slice(0, 8);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl mb-1">Popular Categories</h2>
          <p className="text-sm text-muted-foreground">Top categories in Greater Danbury</p>
        </div>
        <Link
          href="/categories"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {top.map((cat) => {
          const count = cat.businesses?.[0]?.count || 0;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-center gap-2.5 sm:gap-3 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08)] shadow-[0_1px_3px_0_oklch(0_0_0/0.04)]"
            >
              {(() => {
                const Icon = CATEGORY_ICONS[cat.slug] || Tag;
                return (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 group-hover:bg-primary flex items-center justify-center shrink-0 transition-all duration-200">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                  </div>
                );
              })()}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {count} {count === 1 ? 'business' : 'businesses'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 sm:hidden">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all categories
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// --- Town Grid ---

interface TownCount {
  name: string;
  slug: string;
  count: number;
  desc: string;
}

const TOWN_DESCRIPTIONS: Record<string, string> = {
  'Danbury': 'City center',
  'Bethel': 'Small-town charm',
  'Brookfield': 'Route 7 corridor',
  'Kent': 'Litchfield Hills charm',
  'New Fairfield': 'Lakeside community',
  'New Milford': 'Along the Housatonic',
  'Newtown': 'Historic borough',
  'Ridgefield': 'Main Street shopping',
  'Redding': 'Rural character',
  'Sherman': 'Candlewood shores',
};

export function TownGrid({ towns }: { towns: TownCount[] }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-2xl mb-1">Browse by Town</h2>
      <p className="text-sm text-muted-foreground mb-5">Every town in the Greater Danbury area</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {towns.map((town) => (
          <Link
            key={town.name}
            href={`/directory/${town.slug}`}
            className="group flex items-center gap-2.5 sm:gap-3 rounded-xl border bg-card px-3 py-3 sm:px-4 sm:py-3.5 hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08)] transition-all duration-200 shadow-[0_1px_3px_0_oklch(0_0_0/0.04)]"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 group-hover:bg-primary flex items-center justify-center shrink-0 transition-all duration-200">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{town.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">{town.desc} &middot; </span>{town.count} {town.count === 1 ? 'biz' : 'businesses'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export { TOWN_DESCRIPTIONS };
