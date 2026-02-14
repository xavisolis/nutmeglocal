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
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: business.name,
        description: business.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: business.address,
          addressLocality: business.city,
          addressRegion: business.state,
          postalCode: business.zip,
        },
        telephone: business.phone,
        url: business.website,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: business.latitude,
          longitude: business.longitude,
        },
      }),
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BusinessPageTracker businessId={biz.id} businessName={biz.name} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/directory" className="hover:text-foreground">Directory</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/directory?city=${biz.city}`} className="hover:text-foreground">{biz.city}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{biz.name}</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-3xl font-bold">{biz.name}</h1>
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
        </div>
      </div>
    </div>
  );
}
