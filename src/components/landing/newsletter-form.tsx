'use client';

import { useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { posthog } from '@/lib/posthog';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'consumer' | 'business'>('consumer');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, business_name: type === 'business' ? businessName : null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
      posthog?.capture('newsletter_signup', { type });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-xl mb-2">You&apos;re subscribed!</h3>
        <p className="text-muted-foreground text-sm">
          We&apos;ll send you updates about new businesses and what&apos;s happening locally in Greater Danbury.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 md:p-8 space-y-4">
      <div className="text-center mb-2">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl">Stay in the Loop</h3>
        <p className="text-sm text-muted-foreground">New businesses, local updates, and what&apos;s opening nearby</p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === 'consumer' ? 'default' : 'outline'}
          className="flex-1 active:scale-[0.97]"
          onClick={() => setType('consumer')}
        >
          Local resident
        </Button>
        <Button
          type="button"
          variant={type === 'business' ? 'default' : 'outline'}
          className="flex-1 active:scale-[0.97]"
          onClick={() => setType('business')}
        >
          Business owner
        </Button>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {type === 'business' && (
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Your business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
}
