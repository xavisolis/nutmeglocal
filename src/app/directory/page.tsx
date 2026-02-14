import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SearchFilters } from '@/components/directory/search-filters';
import { DirectoryContent } from '@/components/directory/directory-content';
import type { Business, Category } from '@/types';

export const metadata: Metadata = {
  title: 'Business Directory',
  description: 'Browse local businesses in Greater Danbury, CT',
};

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  let query = supabase
    .from('businesses')
    .select('*, category:categories(*)')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('name');

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }
  if (params.category) {
    const cat = (categories || []).find((c: Category) => c.slug === params.category);
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (params.city) {
    query = query.eq('city', params.city);
  }

  const { data: businesses } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Business Directory</h1>

      <Suspense>
        <SearchFilters
          categories={categories || []}
          currentCategory={params.category}
          currentCity={params.city}
          currentQuery={params.q}
        />
      </Suspense>

      <DirectoryContent businesses={businesses || []} />
    </div>
  );
}
