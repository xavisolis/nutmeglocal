import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, BookOpen, Calendar, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import type { Post } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) return { title: 'Not Found' };

  return {
    title: post.title,
    description: post.excerpt || `Read "${post.title}" on ${SITE_NAME}`,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt || `Read "${post.title}" on ${SITE_NAME}`,
      type: 'article',
      publishedTime: post.published_at,
      ...(post.cover_image && { images: [{ url: post.cover_image }] }),
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Guide detail page. Body content is admin-authored HTML stored in Supabase.
 * Since only authenticated admins (via service role) can write to the posts table,
 * this is trusted content — equivalent to CMS-authored content in WordPress/Ghost.
 * If user-generated content is added later, integrate DOMPurify for sanitization.
 */
export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!data) notFound();
  const post = data as Post;

  // JSON-LD Article schema for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: post.author || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.cover_image && { image: post.cover_image }),
    mainEntityOfPage: `${SITE_URL}/guides/${post.slug}`,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 2, name: post.title },
    ],
  };

  // Admin-authored HTML body (trusted content from Supabase, not user-submitted)
  const bodyHtml = post.body;

  return (
    <div>
      <script
        type="application/ld+json"
        /* eslint-disable-next-line react/no-danger -- structured data requires raw JSON */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 capitalize">
              {post.category}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl lg:text-5xl mb-4 text-balance">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            {post.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at)}
              </span>
            )}
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-8 border">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Body — admin-authored HTML from CMS (trusted, RLS-protected writes) */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-[family-name:var(--font-display)]
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:border"
          /* eslint-disable-next-line react/no-danger -- trusted admin content */
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            All Guides
          </Link>
        </div>
      </article>
    </div>
  );
}
