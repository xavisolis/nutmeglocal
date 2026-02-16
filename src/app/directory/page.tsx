import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SearchFilters } from '@/components/directory/search-filters';
import { DirectoryContent } from '@/components/directory/directory-content';
import { FeaturedBusinesses, TopCategories, TownGrid, TOWN_DESCRIPTIONS } from '@/components/directory/discovery-sections';
import { Button } from '@/components/ui/button';
import { GREATER_DANBURY_CITIES } from '@/lib/constants';
import type { Business, Category } from '@/types';

export const metadata: Metadata = {
  title: 'Business Directory',
  description: 'Browse local businesses in Greater Danbury, CT',
  alternates: { canonical: '/directory' },
};

const PAGE_SIZE = 24;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; city?: string; page?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const hasFilters = !!(params.q || params.category || params.city);

  // Categories with count — needed for both modes
  const { data: categories } = await supabase
    .from('categories')
    .select('*, businesses:businesses(count)')
    .order('name');

  if (!hasFilters) {
    // === DISCOVERY MODE ===

    // Town counts
    const { data: cityData } = await supabase
      .from('businesses')
      .select('city')
      .eq('active', true);

    const cityCounts = new Map<string, number>();
    for (const row of cityData || []) {
      cityCounts.set(row.city, (cityCounts.get(row.city) || 0) + 1);
    }

    const towns = GREATER_DANBURY_CITIES.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count: cityCounts.get(name) || 0,
      desc: TOWN_DESCRIPTIONS[name] || '',
    }));

    // Featured businesses (shuffled)
    const { data: featuredBiz } = await supabase
      .from('businesses')
      .select('*, category:categories(*), subcategory:subcategories(*)')
      .eq('active', true)
      .eq('featured', true)
      .limit(6);

    const shuffledFeatured = shuffleArray(featuredBiz || []);

    return (
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-2">Business Directory</h1>
          <p className="text-muted-foreground">Discover local businesses across Greater Danbury</p>
        </div>

        {/* Discovery mode: search bar only, no category/town dropdowns */}
        <Suspense>
          <SearchFilters
            categories={(categories || []).map(({ businesses, ...cat }: any) => cat)}
            currentCategory={params.category}
            currentCity={params.city}
            currentQuery={params.q}
            hideDropdowns
          />
        </Suspense>

        <div className="mt-6 sm:mt-8 space-y-8 sm:space-y-10">
          <FeaturedBusinesses businesses={shuffledFeatured as Business[]} />
          <TopCategories categories={categories || []} />
          <TownGrid towns={towns} />
        </div>
      </div>
    );
  }

  // === RESULTS MODE (with filters) ===

  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('businesses')
    .select('*, category:categories(*), subcategory:subcategories(*)', { count: 'exact' })
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

  const { data: businesses, count: totalCount } = await query.range(from, to);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  // Build URL preserving current filters
  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.category) sp.set('category', params.category);
    if (params.city) sp.set('city', params.city);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/directory${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-2">Business Directory</h1>
        <p className="text-muted-foreground">Discover local businesses across Greater Danbury</p>
      </div>

      <Suspense>
        <SearchFilters
          categories={(categories || []).map(({ businesses, ...cat }: any) => cat)}
          currentCategory={params.category}
          currentCity={params.city}
          currentQuery={params.q}
        />
      </Suspense>

      <Suspense>
        <DirectoryContent businesses={businesses || []} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageUrl(page - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`e${i}`} className="px-2 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={item}
                    variant={item === page ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[36px]"
                    asChild={item !== page}
                  >
                    {item === page ? (
                      <span>{item}</span>
                    ) : (
                      <Link href={pageUrl(item)}>{item}</Link>
                    )}
                  </Button>
                )
              )}
          </div>

          {page < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageUrl(page + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
