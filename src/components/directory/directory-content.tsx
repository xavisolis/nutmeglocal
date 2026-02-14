'use client';

import { useState } from 'react';
import { Map, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessCard } from '@/components/directory/business-card';
import { MapView } from '@/components/directory/map-view';
import type { Business } from '@/types';

interface DirectoryContentProps {
  businesses: Business[];
}

export function DirectoryContent({ businesses }: DirectoryContentProps) {
  const [view, setView] = useState<'grid' | 'map'>('grid');

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
              <BusinessCard key={biz.id} business={biz} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-lg">No businesses found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
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
