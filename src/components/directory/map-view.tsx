'use client';

import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Business } from '@/types';
import { DANBURY_CENTER } from '@/lib/constants';

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface MapViewProps {
  businesses: Business[];
}

export function MapView({ businesses }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
    if (mapRef.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [DANBURY_CENTER.lng, DANBURY_CENTER.lat],
        zoom: 11,
      });

      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      // Only show businesses with real street addresses on the map
      const mappable = businesses.filter((b) => !b.address.match(/^[A-Z][a-z].*,\s*CT\s+\d/));

      mappable.forEach((biz) => {
        const citySlug = biz.city.toLowerCase().replace(/\s+/g, '-');
        const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <strong>${esc(biz.name)}</strong><br/>
            <span class="text-xs text-gray-600">${esc(biz.category?.name || '')}</span><br/>
            <span class="text-xs">${esc(biz.address)}, ${esc(biz.city)}</span><br/>
            <a href="/directory/${encodeURIComponent(citySlug)}/${encodeURIComponent(biz.slug)}?ref=map" class="text-xs text-blue-600 hover:underline font-medium">View Profile →</a>
          </div>`
        );

        new mapboxgl.default.Marker({ color: '#3a7d44' })
          .setLngLat([biz.longitude, biz.latitude])
          .setPopup(popup)
          .addTo(map);
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [businesses]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="h-full min-h-[400px] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        Map requires Mapbox token
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full min-h-[400px] rounded-lg" />;
}
