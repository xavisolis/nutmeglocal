import { Leaf, MapPin, Store, Shield, Search } from 'lucide-react';
import { EarlyAccessForm } from '@/components/landing/early-access-form';
import { Badge } from '@/components/ui/badge';

const previewCategories = [
  { name: 'Restaurants', icon: '🍽️' },
  { name: 'Home Services', icon: '🔧' },
  { name: 'Health & Wellness', icon: '💆' },
  { name: 'Auto Services', icon: '🚗' },
  { name: 'Retail & Shopping', icon: '🛍️' },
  { name: 'Professional Services', icon: '💼' },
  { name: 'Beauty & Spas', icon: '💅' },
  { name: 'Fitness', icon: '🏋️' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Leaf className="h-3 w-3 mr-1" /> Coming Soon — Greater Danbury, CT
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Discover Local Businesses in{' '}
                <span className="text-primary">Greater Danbury</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                NutmegLocal is a free directory connecting you with trusted local businesses 
                in Danbury, Bethel, Brookfield, Ridgefield, and surrounding towns.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Search className="h-4 w-4" /> Search local</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Find nearby</span>
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Free forever</span>
              </div>
            </div>
            <div>
              <EarlyAccessForm />
            </div>
          </div>
        </div>
      </section>

      {/* Why NutmegLocal */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Support Local. Shop Local.</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Every dollar spent locally keeps our community thriving. NutmegLocal makes it easy 
            to find the businesses right in your backyard.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Easy to Find</h3>
              <p className="text-sm text-muted-foreground">
                Search by name, category, or location. Find exactly what you need.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Claim Your Business</h3>
              <p className="text-sm text-muted-foreground">
                Business owners can claim and update their listing for free.
              </p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Map & Directions</h3>
              <p className="text-sm text-muted-foreground">
                Interactive maps to help you find businesses near you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {previewCategories.map((cat) => (
              <div
                key={cat.name}
                className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-sm font-medium">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
