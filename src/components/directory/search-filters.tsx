'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GREATER_DANBURY_CITIES } from '@/lib/constants';
import type { Category } from '@/types';

interface SearchFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentCity?: string;
  currentQuery?: string;
}

export function SearchFilters({ categories, currentCategory, currentCity, currentQuery }: SearchFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery || '');

  const updateFilters = useCallback((params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.category) sp.set('category', params.category);
    if (params.city) sp.set('city', params.city);
    const qs = sp.toString();
    router.push(qs ? `?${qs}` : '?');
  }, [router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ q: query || undefined, category: currentCategory, city: currentCity });
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
        <input
          placeholder="Search businesses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-24 rounded-full border-2 border-border bg-card text-base md:text-sm shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
        />
        <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-5 h-10 md:h-9 text-sm">
          Search
        </Button>
      </form>

      {/* Category filters — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
        <button
          type="button"
          onClick={() => updateFilters({ q: currentQuery, city: currentCity })}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
            !currentCategory
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => updateFilters({
              q: currentQuery,
              category: currentCategory === cat.slug ? undefined : cat.slug,
              city: currentCity,
            })}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              currentCategory === cat.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* City filters — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
        <button
          type="button"
          onClick={() => updateFilters({ q: currentQuery, category: currentCategory })}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
            !currentCity
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All Cities
        </button>
        {GREATER_DANBURY_CITIES.map((city) => (
          <button
            type="button"
            key={city}
            onClick={() => updateFilters({
              q: currentQuery,
              category: currentCategory,
              city: currentCity === city ? undefined : city,
            })}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              currentCity === city
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
