export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  subcategory_id: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: Record<string, string> | null;
  photos: string[] | null;
  claimed: boolean;
  claimed_by: string | null;
  source: 'scraped' | 'manual' | 'claimed';
  featured: boolean;
  active: boolean;
  created_at: string;
  view_count: number;
  updated_at: string;
  category?: Category;
  subcategory?: Subcategory;
}

export interface Claim {
  id: string;
  business_id: string;
  user_id: string;
  user_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  proof: string | null;
  created_at: string;
  reviewed_at: string | null;
  business?: Business;
}

export interface EarlyAccess {
  id: string;
  email: string;
  business_name: string | null;
  type: 'consumer' | 'business';
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  category: string;
  published: boolean;
  published_at: string | null;
  author: string;
  created_at: string;
  updated_at: string;
}
