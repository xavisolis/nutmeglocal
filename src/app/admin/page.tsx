'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Business, Claim, EarlyAccess } from '@/types';

const ADMIN_EMAILS = ['jaimesolisa@gmail.com']; // Configure admin emails

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [signups, setSignups] = useState<EarlyAccess[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/');
        return;
      }

      const [bizRes, claimRes, signupRes] = await Promise.all([
        supabase.from('businesses').select('*, category:categories(*)').order('created_at', { ascending: false }),
        supabase.from('claims').select('*, business:businesses(*)').order('created_at', { ascending: false }),
        supabase.from('early_access').select('*').order('created_at', { ascending: false }),
      ]);

      setBusinesses((bizRes.data || []) as Business[]);
      setClaims((claimRes.data || []) as Claim[]);
      setSignups((signupRes.data || []) as EarlyAccess[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleClaimAction(claimId: string, businessId: string, userId: string, action: 'approved' | 'rejected') {
    await supabase.from('claims').update({ status: action, reviewed_at: new Date().toISOString() }).eq('id', claimId);

    if (action === 'approved') {
      await supabase.from('businesses').update({ claimed: true, claimed_by: userId }).eq('id', businessId);
    }

    setClaims(claims.map((c) =>
      c.id === claimId ? { ...c, status: action, reviewed_at: new Date().toISOString() } : c
    ));
  }

  const filteredBusinesses = businesses.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">Businesses ({businesses.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.filter(c => c.status === 'pending').length} pending)</TabsTrigger>
          <TabsTrigger value="signups">Early Access ({signups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="mt-4 space-y-4">
          <Input placeholder="Search businesses..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-2">
            {filteredBusinesses.map((biz) => (
              <Card key={biz.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{biz.name}</p>
                    <p className="text-sm text-muted-foreground">{biz.city} · {biz.category?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    {biz.claimed && <Badge>Claimed</Badge>}
                    {biz.featured && <Badge variant="secondary">Featured</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-4 space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{claim.business?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    claim.status === 'approved' ? 'default' :
                    claim.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {claim.status}
                  </Badge>
                </div>
                {claim.proof && <p className="text-sm mb-3">Proof: {claim.proof}</p>}
                {claim.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleClaimAction(claim.id, claim.business_id, claim.user_id, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleClaimAction(claim.id, claim.business_id, claim.user_id, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="signups" className="mt-4 space-y-2">
          {signups.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.email}</p>
                  {s.business_name && <p className="text-sm text-muted-foreground">{s.business_name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{s.type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
