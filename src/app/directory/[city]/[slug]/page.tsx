import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Clock, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DAY_ORDER, DAY_LABELS, SITE_NAME } from '@/lib/constants';
import { BusinessPageTracker } from './tracker';
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
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!business) return { title: 'Not Found' };

  return {
    title: `${business.name} — ${business.city}, CT`,
    description: business.description || `${business.name} in ${business.city}, CT`,
    openGraph: {
      title: `${business.name} | ${SITE_NAME}`,
      description: business.description || `${business.name} in ${business.city}, CT`,
    },
    other: {
      'geo.position': `${business.latitude};${business.longitude}`,
    },
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { city, slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!business) notFound();

  const biz = business as Business;

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
    },
    telephone: biz.phone,
    url: biz.website,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: biz.latitude,
      longitude: biz.longitude,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BusinessPageTracker businessId={biz.id} businessName={biz.name} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/directory" className="hover:text-foreground">Directory</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/directory?city=${biz.city}`} className="hover:text-foreground">{biz.city}</Link>
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
            <Link href={`/directory?category=${biz.category.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {biz.category.name}
            </Link>
            <span className="h-1 w-1 rounded-full bg-border" />
          </>
        )}
        <Link href={`/directory?city=${biz.city}`} className="text-sm text-primary hover:underline">
          See all in {biz.city}
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-2">
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl tracking-tight">{biz.name}</h1>
              {biz.featured && <Badge>Featured</Badge>}
            </div>
            {biz.category && <Badge variant="outline">{biz.category.name}</Badge>}
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
                  <a href={`tel:${biz.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Phone className="h-4 w-4" /> {biz.phone}
                  </a>
                </>
              )}

              {biz.email && (
                <>
                  <Separator />
                  <a href={`mailto:${biz.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Mail className="h-4 w-4" /> {biz.email}
                  </a>
                </>
              )}

              {biz.website && (
                <>
                  <Separator />
                  <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe className="h-4 w-4" /> Website
                  </a>
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
