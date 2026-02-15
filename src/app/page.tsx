import Link from 'next/link';
import {
  MapPin, Store, Search,
  UtensilsCrossed, Wrench, HeartPulse, Car,
  ShoppingBag, Briefcase, Scissors, Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { EarlyAccessForm } from '@/components/landing/early-access-form';
import { Button } from '@/components/ui/button';

const previewCategories: { name: string; icon: LucideIcon; slug: string }[] = [
  { name: 'Restaurants', icon: UtensilsCrossed, slug: 'restaurants' },
  { name: 'Home Services', icon: Wrench, slug: 'home-services' },
  { name: 'Health & Wellness', icon: HeartPulse, slug: 'health-wellness' },
  { name: 'Auto Services', icon: Car, slug: 'auto-services' },
  { name: 'Retail & Shopping', icon: ShoppingBag, slug: 'retail-shopping' },
  { name: 'Professional Services', icon: Briefcase, slug: 'professional-services' },
  { name: 'Beauty & Spas', icon: Scissors, slug: 'beauty-spas' },
  { name: 'Fitness', icon: Dumbbell, slug: 'fitness' },
];

const popularSearches = ['Restaurants', 'Home Services', 'Hair Salons', 'Auto Repair'];

export default function HomePage() {
  return (
    <div>
      {/* Hero — search bar IS the product */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Subtle radial gradient for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 40%, oklch(0.45 0.12 145 / 0.06) 0%, transparent 70%)',
          }}
        />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">Greater Danbury Area</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5 text-balance">
            Find local businesses you can trust
          </h1>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
            Your free directory for Danbury, Bethel, Brookfield, Ridgefield, New Fairfield, and more.
          </p>

          {/* Search bar */}
          <form action="/directory" className="relative max-w-2xl mx-auto mb-8">
            <label htmlFor="hero-search" className="sr-only">Search businesses</label>
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              id="hero-search"
              name="q"
              type="text"
              placeholder="Try 'plumber in Bethel' or 'Italian restaurant'..."
              className="w-full h-14 md:h-16 pl-13 md:pl-15 pr-28 md:pr-34 rounded-full border-2 border-border bg-card text-base md:text-lg shadow-xl shadow-black/8 outline-none focus:border-primary focus:shadow-[0_0_0_4px_oklch(0.45_0.12_145_/_0.12),0_20px_40px_-12px_oklch(0_0_0_/_0.1)] transition-all duration-300 placeholder:text-muted-foreground/60"
            />
            <Button type="submit" className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full h-10 md:h-12 px-5 md:px-7 text-sm md:text-base">
              Search
            </Button>
          </form>

          {/* Popular categories as chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((term) => (
              <Link
                key={term}
                href={`/directory?q=${encodeURIComponent(term)}`}
                className="rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why NutmegLocal */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-4">Support Local. Shop Local.</h2>
          <p className="text-muted-foreground mb-14 max-w-2xl mx-auto leading-relaxed">
            Every dollar spent locally keeps our community thriving. NutmegLocal makes it easy
            to find the businesses right in your backyard.
          </p>
          <div className="grid sm:grid-cols-3 gap-10">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Easy to Find</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search by name, category, or location. Find exactly what you need.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Claim Your Business</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Business owners can claim and update their listing for free.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Map & Directions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interactive maps to help you find businesses near you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-3">Browse by Category</h2>
          <p className="text-muted-foreground mb-10">Explore businesses across Greater Danbury</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {previewCategories.map((cat) => (
              <Link
                key={cat.name}
                href={`/directory?category=${cat.slug}`}
                className="group rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-3 transition-colors duration-200">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium group-hover:text-primary transition-colors duration-200">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-md">
          <EarlyAccessForm />
        </div>
      </section>
    </div>
  );
}
