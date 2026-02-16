import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderOpen, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BusinessCard } from '@/components/directory/business-card';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/constants';
import type { Business, Subcategory } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!category) return { title: 'Not Found' };
  return {
    title: `${category.name} — Greater Danbury, CT`,
    description: `Browse ${category.name.toLowerCase()} businesses in Greater Danbury, CT`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sub: activeSub } = await searchParams;
  const supabase = await createClient();

  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!category) notFound();

  // Fetch subcategories for this category
  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', category.id)
    .order('display_order');

  let bizQuery = supabase
    .from('businesses')
    .select('*, category:categories(*), subcategory:subcategories(*)')
    .eq('category_id', category.id)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('name');

  // Filter by subcategory if selected
  const activeSubcategory = activeSub
    ? (subcategories || []).find((s: Subcategory) => s.slug === activeSub)
    : null;
  if (activeSubcategory) {
    bizQuery = bizQuery.eq('subcategory_id', activeSubcategory.id);
  }

  const { data: businesses } = await bizQuery;

  const hasSubcategories = subcategories && subcategories.length > 0;

  // Structured data — admin-controlled content from our DB
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Categories', item: `${SITE_URL}/categories` },
      { '@type': 'ListItem', position: 2, name: category.name },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} in Greater Danbury, CT`,
    numberOfItems: (businesses || []).length,
    itemListElement: (businesses || []).slice(0, 20).map((biz: Business, i: number) => {
      const citySlug = biz.city.toLowerCase().replace(/\s+/g, '-');
      return {
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/directory/${citySlug}/${biz.slug}`,
        name: biz.name,
      };
    }),
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
        <ChevronRight className="h-3 w-3" />
        {activeSubcategory ? (
          <>
            <Link href={`/categories/${slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{activeSubcategory.name}</span>
          </>
        ) : (
          <span className="text-foreground">{category.name}</span>
        )}
      </nav>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-2">
          {activeSubcategory ? `${activeSubcategory.name} — ${category.name}` : category.name}
        </h1>
        <p className="text-muted-foreground">
          {(businesses || []).length} {(businesses || []).length === 1 ? 'business' : 'businesses'} in Greater Danbury, CT
        </p>
      </div>

      {/* Subcategory filter pills */}
      {hasSubcategories && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/categories/${slug}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
              !activeSub
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
            }`}
          >
            All
          </Link>
          {(subcategories || []).map((sub: Subcategory) => (
            <Link
              key={sub.id}
              href={`/categories/${slug}?sub=${sub.slug}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                activeSub === sub.slug
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(businesses || []).map((biz: Business) => (
          <BusinessCard key={biz.id} business={biz} refSource="category" />
        ))}
      </div>
      {(!businesses || businesses.length === 0) && (
        <div className="text-center py-16">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-[family-name:var(--font-display)] text-xl mb-1">No businesses yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            {activeSubcategory
              ? `No ${activeSubcategory.name.toLowerCase()} businesses found. Try browsing all ${category.name.toLowerCase()} businesses.`
              : `We\u2019re still growing this category. Know a ${category.name.toLowerCase()} business in Greater Danbury?`}
          </p>
          {activeSubcategory ? (
            <Button asChild variant="outline">
              <Link href={`/categories/${slug}`}>View All {category.name}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/claim">Add a Business</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
