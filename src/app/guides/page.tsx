import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ChevronRight, Newspaper } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME } from '@/lib/constants';
import type { Post } from '@/types';

export const metadata: Metadata = {
  title: 'Local Guides',
  description: `Discover the best of Greater Danbury — restaurant guides, service recommendations, and local tips from ${SITE_NAME}.`,
  openGraph: {
    title: `Local Guides | ${SITE_NAME}`,
    description: 'Discover the best of Greater Danbury — restaurant guides, service recommendations, and local tips.',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function GuidesPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const guides = (posts || []) as Post[];

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            Local Guides
          </h1>
        </div>
        <p className="text-muted-foreground max-w-lg">
          Discover the best of Greater Danbury — restaurant picks, service recommendations, and local tips.
        </p>
      </div>

      {/* Posts grid */}
      {guides.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((post) => (
            <Link
              key={post.id}
              href={`/guides/${post.slug}`}
              className="group rounded-xl border bg-card overflow-hidden hover:border-primary/50 hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.08)] transition-all duration-200"
            >
              {post.cover_image ? (
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
                  <Newspaper className="h-10 w-10 text-primary/30" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 capitalize">
                    {post.category}
                  </span>
                  {post.published_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.published_at)}
                    </span>
                  )}
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-lg mb-1.5 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3 group-hover:gap-1.5 transition-all">
                  Read more <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-[family-name:var(--font-display)] text-xl mb-1">Guides coming soon</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We&apos;re working on local guides to help you discover the best of Greater Danbury. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
