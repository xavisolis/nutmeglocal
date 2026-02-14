-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  icon text,
  created_at timestamptz default now()
);

-- Businesses
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  address text not null,
  city text not null,
  state text default 'CT',
  zip text not null,
  latitude float8 not null,
  longitude float8 not null,
  phone text,
  email text,
  website text,
  hours jsonb,
  photos text[],
  claimed boolean default false,
  claimed_by uuid references auth.users(id) on delete set null,
  source text not null default 'manual',
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(city, slug)
);

-- Claims
create table claims (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending',
  proof text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Early access signups
create table early_access (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  business_name text,
  type text not null check (type in ('consumer', 'business')),
  created_at timestamptz default now()
);

-- Indexes
create index idx_businesses_category on businesses(category_id);
create index idx_businesses_city on businesses(city);
create index idx_businesses_active on businesses(active);
create index idx_businesses_featured on businesses(featured);
create index idx_claims_business on claims(business_id);
create index idx_claims_user on claims(user_id);
create index idx_claims_status on claims(status);

-- RLS policies
alter table categories enable row level security;
alter table businesses enable row level security;
alter table claims enable row level security;
alter table early_access enable row level security;

-- Public read for categories and active businesses
create policy "Categories are viewable by everyone" on categories for select using (true);
create policy "Active businesses are viewable by everyone" on businesses for select using (active = true);

-- Claims: users can view their own
create policy "Users can view own claims" on claims for select using (auth.uid() = user_id);
create policy "Users can insert claims" on claims for insert with check (auth.uid() = user_id);

-- Early access: anyone can insert
create policy "Anyone can sign up for early access" on early_access for insert with check (true);

-- Business owners can update their claimed businesses
create policy "Owners can update their businesses" on businesses for update using (claimed_by = auth.uid());

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at
  before update on businesses
  for each row execute function update_updated_at();
