'use client';

import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function MiniMap({ latitude, longitude, name }: MiniMapProps) {
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
        center: [longitude, latitude],
        zoom: 14,
        interactive: false,
        attributionControl: false,
      });

      new mapboxgl.default.Marker({ color: '#3a7d44' })
        .setLngLat([longitude, latitude])
        .addTo(map);

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return null;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div ref={mapContainer} className="h-[200px] w-full" />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-primary hover:underline py-2 bg-muted/30"
      >
        Get Directions →
      </a>
    </div>
  );
}
