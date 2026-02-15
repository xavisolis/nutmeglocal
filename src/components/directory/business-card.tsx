import Link from 'next/link';
import { MapPin, Phone, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Business } from '@/types';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const citySlug = business.city.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/directory/${citySlug}/${business.slug}`}
      className="group block rounded-xl border bg-card shadow-[0_1px_3px_0_oklch(0_0_0/0.04)] hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08),0_2px_4px_-2px_oklch(0_0_0/0.04)] transition-all duration-200 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/20" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h3 className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors">{business.name}</h3>
          {business.featured && (
            <Badge className="shrink-0 text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-0 hover:bg-primary/10">
              <Star className="h-3 w-3 mr-0.5 fill-current" />
              Featured
            </Badge>
          )}
        </div>
        {business.category && (
          <Badge variant="outline" className="text-xs mb-3 font-normal">{business.category.name}</Badge>
        )}
        {business.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{business.description}</p>
        )}

        {/* Divider */}
        <div className="border-t border-border/50 mt-1 pt-3" />

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/50" />
            {business.address}, {business.city}
          </span>
          {business.phone && (
            <span
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `tel:${business.phone}`;
              }}
              role="link"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-primary/50" />
              {business.phone}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
