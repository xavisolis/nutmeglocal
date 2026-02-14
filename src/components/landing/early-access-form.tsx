'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { posthog } from '@/lib/posthog';

export function EarlyAccessForm() {
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
      posthog?.capture('early_access_signup', { type });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-semibold mb-2">You&apos;re on the list!</h3>
        <p className="text-muted-foreground">
          We&apos;ll notify you when NutmegLocal launches. Thanks for supporting local!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 md:p-8 space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-xl font-semibold">Get Early Access</h3>
        <p className="text-sm text-muted-foreground">Be the first to know when we launch</p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === 'consumer' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setType('consumer')}
        >
          I&apos;m a local
        </Button>
        <Button
          type="button"
          variant={type === 'business' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setType('business')}
        >
          I own a business
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
        {loading ? 'Signing up...' : 'Join the Waitlist'}
      </Button>
    </form>
  );
}
