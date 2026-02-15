import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse businesses by category in Greater Danbury, CT',
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*, businesses:businesses(count)')
    .order('name');

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-2">Browse by Category</h1>
        <p className="text-muted-foreground">Find businesses by type across Greater Danbury</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(categories || []).map((cat: any) => {
          const count = cat.businesses?.[0]?.count || 0;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-center justify-between rounded-xl border bg-card px-5 py-4 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
            >
              <div>
                <h2 className="font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {count} {count === 1 ? 'business' : 'businesses'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
