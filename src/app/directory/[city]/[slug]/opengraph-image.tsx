import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Business listing on NutmegLocal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('name, city, state, category:categories(name)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  const name = business?.name || 'Business';
  const city = business?.city || '';
  const category = (business?.category as any)?.name || '';

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
        {/* Top accent bar */}
        <div style={{ height: 8, background: 'linear-gradient(to right, #3a7d44, #2d6235)', display: 'flex' }} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 80px',
          }}
        >
          {/* Category pill */}
          {category && (
            <div
              style={{
                display: 'flex',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  color: '#3a7d44',
                  border: '2px solid #3a7d44',
                  borderRadius: 999,
                  padding: '6px 20px',
                  fontFamily: 'sans-serif',
                }}
              >
                {category}
              </span>
            </div>
          )}

          {/* Business name */}
          <div
            style={{
              fontSize: name.length > 30 ? 52 : 64,
              fontWeight: 700,
              color: '#1a1a18',
              lineHeight: 1.1,
              marginBottom: 20,
              fontFamily: 'serif',
            }}
          >
            {name}
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 28,
              color: '#71716b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'sans-serif',
            }}
          >
            📍 {city}, CT
          </div>
        </div>

        {/* Footer */}
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
