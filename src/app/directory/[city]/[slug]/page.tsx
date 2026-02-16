import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Clock, ChevronRight, BadgeCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DAY_ORDER, DAY_LABELS, SITE_NAME, SITE_URL } from '@/lib/constants';
import { BusinessPageTracker, TrackedLink } from './tracker';
import { MiniMap } from '@/components/directory/mini-map';
import type { Business } from '@/types';

interface PageProps {
  params: Promise<{ city: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('*, category:categories(*), subcategory:subcategories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!business) return { title: 'Not Found' };

  const citySlug = business.city.toLowerCase().replace(/\s+/g, '-');
  const canonicalPath = `/directory/${citySlug}/${business.slug}`;
  const description = business.description
    || `${business.name} in ${business.city}, CT — hours, location, contact info on ${SITE_NAME}.`;

  return {
    title: `${business.name} — ${business.city}, CT`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${business.name} | ${SITE_NAME}`,
      description,
    },
    other: {
      'geo.position': `${business.latitude};${business.longitude}`,
      'geo.placename': `${business.city}, CT`,
    },
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { city, slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('*, category:categories(*), subcategory:subcategories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!business) notFound();

  const biz = business as Business;

  const citySlug = biz.city.toLowerCase().replace(/\s+/g, '-');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.address,
      addressLocality: biz.city,
      addressRegion: biz.state,
      postalCode: biz.zip,
      addressCountry: 'US',
    },
    ...(biz.phone && { telephone: biz.phone }),
    ...(biz.email && { email: biz.email }),
    ...(biz.website && { url: biz.website }),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: biz.latitude,
      longitude: biz.longitude,
    },
    ...(biz.photos && biz.photos.length > 0 && { image: biz.photos }),
    ...(biz.category && { '@additionalType': biz.category.name }),
    ...(biz.hours && {
      openingHoursSpecification: DAY_ORDER
        .filter((day) => biz.hours?.[day] && biz.hours[day] !== 'Closed')
        .map((day) => {
          const h = biz.hours![day];
          const match = h?.match(/^(\d{1,2}:\d{2}\s*[APap][Mm])\s*-\s*(\d{1,2}:\d{2}\s*[APap][Mm])$/);
          if (!match) return null;
          const toTime = (s: string) => {
            const [time, period] = s.trim().split(/\s+/);
            const [hr, min] = time.split(':').map(Number);
            const h24 = period.toLowerCase() === 'pm' && hr !== 12 ? hr + 12 : period.toLowerCase() === 'am' && hr === 12 ? 0 : hr;
            return `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          };
          const dayMap: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
          return {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: dayMap[day],
            opens: toTime(match[1]),
            closes: toTime(match[2]),
          };
        })
        .filter(Boolean),
    }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Directory', item: `${SITE_URL}/directory` },
      { '@type': 'ListItem', position: 2, name: biz.city, item: `${SITE_URL}/directory/${citySlug}` },
      { '@type': 'ListItem', position: 3, name: biz.name },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Suspense><BusinessPageTracker businessId={biz.id} businessName={biz.name} claimedBy={biz.claimed_by || null} /></Suspense>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/directory" className="hover:text-foreground">Directory</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/directory/${citySlug}`} className="hover:text-foreground">{biz.city}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{biz.name}</span>
      </nav>

      {/* Context bar */}
      <div className="flex items-center gap-3 mb-8 py-3 border-b border-border/50">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />{biz.city}, CT
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        {biz.category && (
          <>
            <Link href={`/categories/${biz.category.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {biz.category.name}
            </Link>
            {biz.subcategory && (
              <>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="text-sm text-muted-foreground">{biz.subcategory.name}</span>
              </>
            )}
            <span className="h-1 w-1 rounded-full bg-border" />
          </>
        )}
        <Link href={`/directory/${citySlug}`} className="text-sm text-primary hover:underline">
          See all in {biz.city}
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-2">
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl tracking-tight">{biz.name}</h1>
              {biz.claimed && (
                <span className="inline-flex items-center gap-1 shrink-0 mt-2 text-xs font-medium text-primary">
                  <BadgeCheck className="h-4 w-4" /> Verified
                </span>
              )}
              {biz.featured && <Badge>Featured</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {biz.category && <Badge variant="outline">{biz.category.name}</Badge>}
              {biz.subcategory && <Badge variant="secondary">{biz.subcategory.name}</Badge>}
            </div>
          </div>

          {biz.description && (
            <div>
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">{biz.description}</p>
            </div>
          )}

          {biz.hours && (
            <div>
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Hours
              </h2>
              <div className="space-y-1">
                {DAY_ORDER.map((day) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="font-medium">{DAY_LABELS[day]}</span>
                    <span className="text-muted-foreground">
                      {biz.hours?.[day] || 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!biz.claimed && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Is this your business?</p>
                  <p className="text-sm text-muted-foreground">Claim it to update your info</p>
                </div>
                <Button asChild>
                  <Link href={`/claim?business=${biz.id}`}>Claim</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-sm">{biz.address}, {biz.city}, {biz.state} {biz.zip}</span>
              </div>

              {biz.phone && (
                <>
                  <Separator />
                  <TrackedLink businessId={biz.id} businessName={biz.name} eventType="phone_click" href={`tel:${biz.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Phone className="h-4 w-4" /> {biz.phone}
                  </TrackedLink>
                </>
              )}

              {biz.email && (
                <>
                  <Separator />
                  <TrackedLink businessId={biz.id} businessName={biz.name} eventType="email_click" href={`mailto:${biz.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Mail className="h-4 w-4" /> {biz.email}
                  </TrackedLink>
                </>
              )}

              {biz.website && (
                <>
                  <Separator />
                  <TrackedLink businessId={biz.id} businessName={biz.name} eventType="website_click" href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe className="h-4 w-4" /> Website
                  </TrackedLink>
                </>
              )}
            </CardContent>
          </Card>

          <MiniMap latitude={biz.latitude} longitude={biz.longitude} name={biz.name} />
        </div>
      </div>
    </div>
  );
}
