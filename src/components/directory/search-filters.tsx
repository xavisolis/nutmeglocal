'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GREATER_DANBURY_CITIES } from '@/lib/constants';
import type { Category } from '@/types';

interface SearchFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentCity?: string;
  currentQuery?: string;
  hideDropdowns?: boolean;
}

export function SearchFilters({ categories, currentCategory, currentCity, currentQuery, hideDropdowns }: SearchFiltersProps) {
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

  const hasFilters = currentCategory || currentCity || currentQuery;

  return (
    <div className="space-y-3">
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

      {/* Filter row */}
      {!hideDropdowns && <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={currentCategory || 'all'}
          onValueChange={(val) =>
            updateFilters({
              q: currentQuery,
              category: val === 'all' ? undefined : val,
              city: currentCity,
            })
          }
        >
          <SelectTrigger className="h-10 md:h-9 rounded-full px-4 text-xs font-medium min-w-[140px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-[min(320px,var(--radix-select-content-available-height))]">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentCity || 'all'}
          onValueChange={(val) =>
            updateFilters({
              q: currentQuery,
              category: currentCategory,
              city: val === 'all' ? undefined : val,
            })
          }
        >
          <SelectTrigger className="h-10 md:h-9 rounded-full px-4 text-xs font-medium min-w-[130px]">
            <SelectValue placeholder="All Towns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Towns</SelectItem>
            {GREATER_DANBURY_CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              updateFilters({});
            }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>}
    </div>
  );
}
