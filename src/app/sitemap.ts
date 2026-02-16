import type { MetadataRoute } from 'next';
import { createServiceClient } from '@/lib/supabase/server';
import { SITE_URL, GREATER_DANBURY_CITIES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServiceClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, city, updated_at')
    .eq('active', true);

  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('published', true);

  const businessEntries: MetadataRoute.Sitemap = (businesses || []).map((biz) => ({
    url: `${SITE_URL}/directory/${biz.city.toLowerCase().replace(/\s+/g, '-')}/${biz.slug}`,
    lastModified: biz.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${SITE_URL}/categories/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const cityEntries: MetadataRoute.Sitemap = GREATER_DANBURY_CITIES.map((city) => ({
    url: `${SITE_URL}/directory/${city.toLowerCase().replace(/\s+/g, '-')}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const guideEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/guides/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/directory`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/claim`, changeFrequency: 'monthly', priority: 0.5 },
    ...cityEntries,
    ...categoryEntries,
    ...businessEntries,
    ...guideEntries,
  ];
}
