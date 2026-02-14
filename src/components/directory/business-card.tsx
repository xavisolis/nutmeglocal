import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Business } from '@/types';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const citySlug = business.city.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link href={`/directory/${citySlug}/${business.slug}`}>
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base leading-tight">{business.name}</h3>
            {business.featured && <Badge variant="secondary" className="shrink-0 text-xs">Featured</Badge>}
          </div>
          {business.category && (
            <Badge variant="outline" className="text-xs mb-2">{business.category.name}</Badge>
          )}
          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{business.description}</p>
          )}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {business.address}, {business.city}
            </span>
            {business.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {business.phone}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
