'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!currentCategory ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => updateFilters({ q: currentQuery, city: currentCity })}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={currentCategory === cat.slug ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => updateFilters({
              q: currentQuery,
              category: currentCategory === cat.slug ? undefined : cat.slug,
              city: currentCity,
            })}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!currentCity ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => updateFilters({ q: currentQuery, category: currentCategory })}
        >
          All Cities
        </Badge>
        {GREATER_DANBURY_CITIES.map((city) => (
          <Badge
            key={city}
            variant={currentCity === city ? 'secondary' : 'outline'}
            className="cursor-pointer"
            onClick={() => updateFilters({
              q: currentQuery,
              category: currentCategory,
              city: currentCity === city ? undefined : city,
            })}
          >
            {city}
          </Badge>
        ))}
      </div>
    </div>
  );
}
