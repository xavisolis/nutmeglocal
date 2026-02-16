'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';
import type { Business } from '@/types';

type Step = 'search' | 'auth' | 'verify' | 'done';

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-lg"><p>Loading...</p></div>}>
      <ClaimPageInner />
    </Suspense>
  );
}

function ClaimPageInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [proof, setProof] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
      }
    });

    const preselected = searchParams.get('business');
    if (preselected) {
      supabase
        .from('businesses')
        .select('*, category:categories(*)')
        .eq('id', preselected)
        .single()
        .then(({ data }) => {
          if (data) {
            setSelected(data as Business);
            setStep('auth');
          }
        });
    }
  }, [searchParams]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('*, category:categories(*)')
      .ilike('name', `%${query}%`)
      .eq('active', true)
      .limit(10);
    setResults((data || []) as Business[]);
    setLoading(false);
  }

  function selectBusiness(biz: Business) {
    setSelected(biz);
    setStep(user ? 'verify' : 'auth');
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Try sign in first, then sign up
    let { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) {
        setError(signUpErr.message);
        setLoading(false);
        return;
      }
      data = signUpData as any;
    }

    if (data?.user) {
      setUser(data.user);
      setStep('verify');
    }
    setLoading(false);
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !user) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('claims').insert({
      business_id: selected.id,
      user_id: user.id,
      proof,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    posthog?.capture('claim_submitted', { businessId: selected.id, businessName: selected.name });
    setStep('done');
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-2">Claim Your Business</h1>
      <p className="text-muted-foreground mb-8">
        Take control of your business listing — it&apos;s free.
      </p>

      {step === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Find Your Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Business name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </form>
            {results.length > 0 && (
              <div className="space-y-2.5">
                {results.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => selectBusiness(biz)}
                    className="w-full text-left p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{biz.name}</p>
                      {biz.claimed && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Already claimed</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{biz.address}, {biz.city}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'auth' && (
        <Card>
          <CardHeader>
            <CardTitle>Sign In or Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Claiming: <strong>{selected?.name}</strong>
            </p>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle>{selected?.claimed ? 'Dispute Ownership' : 'Verify Ownership'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Claiming: <strong>{selected?.name}</strong>
            </p>
            {selected?.claimed && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">This business has already been claimed.</p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  If you&apos;re the real owner, submit your proof below and we&apos;ll review the dispute.
                </p>
              </div>
            )}
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <Label>{selected?.claimed ? 'Why are you the real owner?' : 'How can you prove ownership?'}</Label>
                <Textarea
                  placeholder={selected?.claimed
                    ? "Explain why you're the rightful owner. Include your name, role, and any verifiable details (phone on the listing, business license, etc.)"
                    : "e.g., I'm the owner John Smith, my phone number is on the listing, I can verify via email..."
                  }
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  rows={4}
                  required={!!selected?.claimed}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : selected?.claimed ? 'Submit Dispute' : 'Submit Claim'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'done' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-semibold mb-2">Claim Submitted!</h2>
            <p className="text-muted-foreground">
              We&apos;ll review your claim and get back to you soon. Check your dashboard for updates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
