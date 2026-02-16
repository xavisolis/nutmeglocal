-- Migration: Create posts table for Guides/Content feature
-- Apply via Supabase Dashboard > SQL Editor

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text not null,
  cover_image text,
  category text not null default 'guide',
  published boolean default false,
  published_at timestamptz,
  author text not null default 'NutmegLocal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create trigger posts_updated_at
  before update on posts
  for each row
  execute function update_updated_at();

-- Indexes
create index idx_posts_slug on posts (slug);
create index idx_posts_published on posts (published);
create index idx_posts_published_at on posts (published_at desc);
create index idx_posts_category on posts (category);

-- RLS
alter table posts enable row level security;

-- Public can read published posts
create policy "Public read published posts"
  on posts for select
  using (published = true);

-- Admin can manage all posts (via service role key, bypasses RLS)
