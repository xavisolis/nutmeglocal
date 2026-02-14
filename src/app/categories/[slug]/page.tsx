import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BusinessCard } from '@/components/directory/business-card';
import type { Business } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!category) return { title: 'Not Found' };
  return {
    title: `${category.name} — Greater Danbury, CT`,
    description: `Browse ${category.name.toLowerCase()} businesses in Greater Danbury, CT`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!category) notFound();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*, category:categories(*)')
    .eq('category_id', category.id)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('name');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      <p className="text-muted-foreground mb-8">
        {(businesses || []).length} businesses in Greater Danbury, CT
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(businesses || []).map((biz: Business) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}
      </div>
      {(!businesses || businesses.length === 0) && (
        <p className="text-center text-muted-foreground py-12">No businesses in this category yet.</p>
      )}
    </div>
  );
}
