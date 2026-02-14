import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse by Category</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(categories || []).map((cat: any) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-6 text-center">
                <h2 className="font-semibold mb-1">{cat.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {cat.businesses?.[0]?.count || 0} businesses
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
