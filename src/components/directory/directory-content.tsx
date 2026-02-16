'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map, Grid3X3, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessCard } from '@/components/directory/business-card';
import { MapView } from '@/components/directory/map-view';
import type { Business } from '@/types';

interface DirectoryContentProps {
  businesses: Business[];
}

export function DirectoryContent({ businesses }: DirectoryContentProps) {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const searchParams = useSearchParams();

  // Determine referrer source from current filters
  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const refSource = query ? 'search' : category ? 'category' : city ? 'town' : 'browse';

  return (
    <div className="mt-6">
      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={view === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('grid')}
        >
          <Grid3X3 className="h-4 w-4 mr-1" /> List
        </Button>
        <Button
          variant={view === 'map' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('map')}
        >
          <Map className="h-4 w-4 mr-1" /> Map
        </Button>
      </div>

      {view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.length > 0 ? (
            businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} refSource={refSource} searchTerm={query || undefined} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <SearchX className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-[family-name:var(--font-display)] text-xl mb-1">No results found</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Try a different search term, or remove some filters to see more businesses.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[calc(100vh-16rem)] min-h-[400px]">
          <MapView businesses={businesses} />
        </div>
      )}
    </div>
  );
}
