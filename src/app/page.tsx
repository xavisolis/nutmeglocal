import Link from 'next/link';
import {
  Leaf, MapPin, Store, Shield, Search,
  UtensilsCrossed, Wrench, HeartPulse, Car,
  ShoppingBag, Briefcase, Scissors, Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { EarlyAccessForm } from '@/components/landing/early-access-form';
import { Button } from '@/components/ui/button';

const previewCategories: { name: string; icon: LucideIcon }[] = [
  { name: 'Restaurants', icon: UtensilsCrossed },
  { name: 'Home Services', icon: Wrench },
  { name: 'Health & Wellness', icon: HeartPulse },
  { name: 'Auto Services', icon: Car },
  { name: 'Retail & Shopping', icon: ShoppingBag },
  { name: 'Professional Services', icon: Briefcase },
  { name: 'Beauty & Spas', icon: Scissors },
  { name: 'Fitness', icon: Dumbbell },
];

const popularSearches = ['Restaurants', 'Home Services', 'Hair Salons', 'Auto Repair'];

export default function HomePage() {
  return (
    <div>
      {/* Hero — search bar IS the product */}
      <section className="py-16 md:py-28 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Find local businesses in Greater Danbury
          </h1>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Your free directory for Danbury, Bethel, Brookfield, Ridgefield, and 5 more towns.
          </p>

          {/* Search bar */}
          <form action="/directory" className="relative max-w-2xl mx-auto mb-8">
            <label htmlFor="hero-search" className="sr-only">Search businesses</label>
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              id="hero-search"
              name="q"
              type="text"
              placeholder="Try 'plumber in Bethel' or 'Italian restaurant'..."
              className="w-full h-14 pl-12 md:pl-14 pr-28 md:pr-32 rounded-full border-2 border-border bg-card text-base md:text-lg shadow-lg shadow-black/5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
            />
            <Button type="submit" className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full h-10 px-5 md:px-6">
              Search
            </Button>
          </form>

          {/* Popular categories as chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((term) => (
              <Link
                key={term}
                href={`/directory?q=${encodeURIComponent(term)}`}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why NutmegLocal */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Support Local. Shop Local.</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Every dollar spent locally keeps our community thriving. NutmegLocal makes it easy 
            to find the businesses right in your backyard.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Easy to Find</h3>
              <p className="text-sm text-muted-foreground">
                Search by name, category, or location. Find exactly what you need.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Claim Your Business</h3>
              <p className="text-sm text-muted-foreground">
                Business owners can claim and update their listing for free.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Map & Directions</h3>
              <p className="text-sm text-muted-foreground">
                Interactive maps to help you find businesses near you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {previewCategories.map((cat) => (
              <div
                key={cat.name}
                className="rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors"
              >
                <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-md">
          <EarlyAccessForm />
        </div>
      </section>
    </div>
  );
}
