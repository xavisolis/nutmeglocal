import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { GREATER_DANBURY_CITIES } from '@/lib/constants';

export const runtime = 'edge';
export const alt = 'Local businesses on NutmegLocal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function cityFromSlug(slug: string): string | undefined {
  return GREATER_DANBURY_CITIES.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
}

export default async function OGImage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = cityFromSlug(slug) || slug;

  const supabase = await createClient();
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('city', city)
    .eq('active', true);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafaf8',
          position: 'relative',
        }}
      >
        <div style={{ height: 8, background: 'linear-gradient(to right, #3a7d44, #2d6235)', display: 'flex' }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 80px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, color: '#3a7d44', marginBottom: 16, fontFamily: 'sans-serif', fontWeight: 600 }}>
            LOCAL BUSINESSES
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: '#1a1a18', lineHeight: 1.1, marginBottom: 24, fontFamily: 'serif' }}>
            {city}, CT
          </div>
          <div style={{ fontSize: 26, color: '#71716b', fontFamily: 'sans-serif' }}>
            {count || 0} businesses on NutmegLocal
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 80px',
            borderTop: '1px solid #e5e5e0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#3a7d44',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 18,
              }}
            >
              🌿
            </div>
            <span style={{ fontSize: 22, fontWeight: 600, color: '#1a1a18', fontFamily: 'sans-serif' }}>
              NutmegLocal
            </span>
          </div>
          <span style={{ fontSize: 18, color: '#a3a39d', fontFamily: 'sans-serif' }}>
            nutmeglocal.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
