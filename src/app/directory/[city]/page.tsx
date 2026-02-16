import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BusinessCard } from '@/components/directory/business-card';
import { GREATER_DANBURY_CITIES, SITE_NAME, SITE_URL } from '@/lib/constants';
import type { Business } from '@/types';

interface PageProps {
  params: Promise<{ city: string }>;
}

function cityFromSlug(slug: string): string | undefined {
  return GREATER_DANBURY_CITIES.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = cityFromSlug(slug);
  if (!city) return { title: 'Not Found' };

  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  return {
    title: `Businesses in ${city}, CT`,
    description: `Discover local businesses in ${city}, Connecticut. Browse restaurants, home services, health & wellness, and more on ${SITE_NAME}.`,
    alternates: { canonical: `/directory/${citySlug}` },
    openGraph: {
      title: `Businesses in ${city}, CT | ${SITE_NAME}`,
      description: `Browse local businesses in ${city}, CT`,
    },
  };
}

export async function generateStaticParams() {
  return GREATER_DANBURY_CITIES.map((city) => ({
    city: city.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default async function CityPage({ params }: PageProps) {
  const { city: slug } = await params;
  const city = cityFromSlug(slug);
  if (!city) notFound();

  const supabase = await createClient();
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*, category:categories(*), subcategory:subcategories(*)')
    .eq('city', city)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('name');

  const count = businesses?.length || 0;

  const citySlug = city.toLowerCase().replace(/\s+/g, '-');

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Directory', item: `${SITE_URL}/directory` },
      { '@type': 'ListItem', position: 2, name: city },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Businesses in ${city}, CT`,
    numberOfItems: count,
    itemListElement: (businesses || []).slice(0, 20).map((biz: Business, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/directory/${citySlug}/${biz.slug}`,
      name: biz.name,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      {/* Structured data — business data from our DB (admin-controlled), safe to serialize */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/directory" className="hover:text-foreground transition-colors">Directory</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{city}</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            {city}, CT
          </h1>
        </div>
        <p className="text-muted-foreground">
          {count} {count === 1 ? 'business' : 'businesses'} in {city}
        </p>
      </div>

      {/* Listings */}
      {count > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(businesses || []).map((biz: Business) => (
            <BusinessCard key={biz.id} business={biz} refSource="town" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-[family-name:var(--font-display)] text-xl mb-1">No businesses in {city} yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            We&apos;re still growing our directory in this area. Know a business in {city}?
          </p>
          <Link
            href="/claim"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add a Business
          </Link>
        </div>
      )}

      {/* Other towns */}
      <div className="mt-16 pt-8 border-t border-border/50">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Other Towns</h2>
        <div className="flex flex-wrap gap-2">
          {GREATER_DANBURY_CITIES.filter((c) => c !== city).map((c) => (
            <Link
              key={c}
              href={`/directory/${c.toLowerCase().replace(/\s+/g, '-')}`}
              className="rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
