export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
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
  updated_at: string;
  category?: Category;
}

export interface Claim {
  id: string;
  business_id: string;
  user_id: string;
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
