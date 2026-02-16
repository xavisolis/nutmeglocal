import Link from 'next/link';
import {
  MapPin, Store, Search, BookOpen, ChevronRight, Newspaper,
  UtensilsCrossed, Wrench, Car, Scissors, Dumbbell,
  TreePine, Zap, PawPrint,
  type LucideIcon,
} from 'lucide-react';
import { NewsletterForm } from '@/components/landing/newsletter-form';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import type { Post } from '@/types';

const previewCategories: { name: string; icon: LucideIcon; slug: string }[] = [
  { name: 'Restaurants', icon: UtensilsCrossed, slug: 'restaurant' },
  { name: 'Landscaping', icon: TreePine, slug: 'landscaping' },
  { name: 'Hair Salons', icon: Scissors, slug: 'hair-salon' },
  { name: 'Auto Repair', icon: Car, slug: 'auto-repair' },
  { name: 'Electricians', icon: Zap, slug: 'electrician' },
  { name: 'Plumbing', icon: Wrench, slug: 'plumbing' },
  { name: 'Pet Services', icon: PawPrint, slug: 'pet-services' },
  { name: 'Fitness', icon: Dumbbell, slug: 'fitness' },
];

const popularSearchPills: { label: string; href: string }[] = [
  { label: 'Restaurants', href: '/categories/restaurant' },
  { label: 'Landscaping', href: '/categories/landscaping' },
  { label: 'Hair Salons', href: '/categories/hair-salon' },
  { label: 'Auto Repair', href: '/categories/auto-repair' },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { count: businessCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  const { data: guidesData } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, category')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  const latestGuides = (guidesData || []) as Pick<Post, 'id' | 'title' | 'slug' | 'excerpt' | 'cover_image' | 'category'>[];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/directory?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      areaServed: { '@type': 'Place', name: 'Greater Danbury, Connecticut' },
    },
  ];

  return (
    <div>
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}

      {/* Hero — search bar IS the product */}
      <section className="relative pt-14 pb-16 md:py-32 px-4 overflow-hidden">
        {/* Layered gradient for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 30%, oklch(0.45 0.12 145 / 0.07) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 20% 80%, oklch(0.6 0.1 55 / 0.04) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 80% 70%, oklch(0.45 0.12 145 / 0.03) 0%, transparent 50%)
            `,
          }}
        />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">Greater Danbury Area</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5 text-balance">
            Find local businesses you can trust
          </h1>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
            From Main Street Danbury to the shops along Route 7 — find the businesses your neighbors trust.
          </p>

          {/* Search bar */}
          <form action="/directory" className="relative max-w-2xl mx-auto mb-8">
            <label htmlFor="hero-search" className="sr-only">Search businesses</label>
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              id="hero-search"
              name="q"
              type="text"
              placeholder="Search businesses..."
              className="w-full h-14 md:h-16 pl-13 md:pl-15 pr-28 md:pr-34 rounded-full border-2 border-border bg-card text-base md:text-lg shadow-[0_4px_20px_-4px_oklch(0_0_0/0.08)] outline-none focus:border-primary focus:shadow-[0_0_0_4px_oklch(0.45_0.12_145_/_0.12),0_20px_40px_-12px_oklch(0_0_0_/_0.1)] transition-all duration-300 placeholder:text-muted-foreground/60"
            />
            <Button type="submit" className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 rounded-full h-10 md:h-12 px-5 md:px-7 text-sm md:text-base">
              Search
            </Button>
          </form>

          {/* Popular categories as chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {popularSearchPills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="rounded-full border px-4 py-2.5 md:px-3.5 md:py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200"
              >
                {pill.label}
              </Link>
            ))}
          </div>

          {/* Trust stats */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70 mb-4">
            <span className="font-semibold text-foreground/70">{businessCount || 0}+ Businesses</span>
            <span className="text-border">·</span>
            <span>10 Towns</span>
            <span className="text-border">·</span>
            <span>Free to list</span>
          </div>

          <p className="text-xs text-muted-foreground/50">
            Serving Danbury, Bethel, Brookfield, Kent, New Fairfield, New Milford, Newtown, Redding, Ridgefield, and Sherman
          </p>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Why NutmegLocal */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-4">Support Local. Shop Local.</h2>
          <p className="text-muted-foreground mb-14 max-w-2xl mx-auto leading-relaxed">
            Greater Danbury has hundreds of locally-owned businesses. Most of them don&apos;t show up on Google. We&apos;re fixing that.
          </p>
          <div className="grid sm:grid-cols-3 gap-10">
            <div className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg">Easy to Find</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search by name, category, or location. Find exactly what you need.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg">Claim Your Business</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Business owners can claim and update their listing — no cost to get started.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg">Map & Directions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interactive maps to help you find businesses near you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Category Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-3">What are you looking for?</h2>
          <p className="text-muted-foreground mb-10">Explore businesses across Greater Danbury</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {previewCategories.map((cat) => (
              <Link
                key={cat.name}
                href={`/categories/${cat.slug}`}
                className="group rounded-xl border bg-card p-4 md:p-5 shadow-[0_1px_3px_0_oklch(0_0_0/0.04)] hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08)] transition-all duration-200"
              >
                <div className="mx-auto w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center mb-3 transition-all duration-200">
                  <cat.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                </div>
                <p className="text-sm font-medium group-hover:text-primary transition-colors duration-200">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Browse by Town */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-3">Browse by Town</h2>
            <p className="text-muted-foreground">Every town in the Greater Danbury area, all in one place</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Danbury', desc: 'City center' },
              { name: 'Bethel', desc: 'Small-town charm' },
              { name: 'Brookfield', desc: 'Route 7 corridor' },
              { name: 'Kent', desc: 'Litchfield Hills charm' },
              { name: 'New Fairfield', desc: 'Lakeside community' },
              { name: 'New Milford', desc: 'Along the Housatonic' },
              { name: 'Newtown', desc: 'Historic borough' },
              { name: 'Ridgefield', desc: 'Main Street shopping' },
              { name: 'Redding', desc: 'Rural character' },
              { name: 'Sherman', desc: 'Candlewood shores' },
            ].map((town) => (
              <Link
                key={town.name}
                href={`/directory/${town.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08)] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary flex items-center justify-center shrink-0 transition-all duration-200">
                  <MapPin className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{town.name}</p>
                  <p className="text-xs text-muted-foreground">{town.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Latest Guides */}
      {latestGuides.length > 0 && (
        <>
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-1">Latest from NutmegLocal</h2>
                  <p className="text-muted-foreground">Local guides, tips, and stories</p>
                </div>
                <Link href="/guides" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  All guides <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestGuides.map((post) => (
                  <Link
                    key={post.id}
                    href={`/guides/${post.slug}`}
                    className="group rounded-xl border bg-card overflow-hidden hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08)] transition-all duration-200"
                  >
                    {post.cover_image ? (
                      <div className="aspect-[16/9] overflow-hidden bg-muted">
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
                        <Newspaper className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 capitalize">{post.category}</span>
                      <h3 className="font-[family-name:var(--font-display)] text-lg mt-2 mb-1.5 group-hover:text-primary transition-colors">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  All guides <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </>
      )}

      {/* Business Owner CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-3">Own a business in Greater Danbury?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
            Get listed in minutes. Claim your business, update your info, and let your neighbors find you.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/claim">Claim Your Business</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/directory">Browse Directory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Newsletter */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-md">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
