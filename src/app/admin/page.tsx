'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Eye, EyeOff, Pencil } from 'lucide-react';
import type { Business, Claim, EarlyAccess } from '@/types';

const ADMIN_EMAILS = ['jaimesolisa@gmail.com'];

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [signups, setSignups] = useState<EarlyAccess[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function toggleFeatured(biz: Business) {
    const featured = !biz.featured;
    await supabase.from('businesses').update({ featured }).eq('id', biz.id);
    setBusinesses(businesses.map((b) => b.id === biz.id ? { ...b, featured } : b));
  }

  async function toggleActive(biz: Business) {
    const active = !biz.active;
    await supabase.from('businesses').update({ active }).eq('id', biz.id);
    setBusinesses(businesses.map((b) => b.id === biz.id ? { ...b, active } : b));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await supabase.from('businesses').update({
      name: editing.name,
      description: editing.description,
      phone: editing.phone,
      email: editing.email,
      website: editing.website,
    }).eq('id', editing.id);
    setBusinesses(businesses.map((b) => b.id === editing.id ? { ...b, ...editing } : b));
    setEditing(null);
    setSaving(false);
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
              <Card key={biz.id} className={!biz.active ? 'opacity-50' : ''}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{biz.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {biz.city} · {biz.category?.name} · {biz.view_count || 0} views
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {biz.claimed && <Badge>Claimed</Badge>}
                    <Button
                      variant={biz.featured ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleFeatured(biz)}
                      title={biz.featured ? 'Remove featured' : 'Make featured'}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={biz.active ? 'outline' : 'destructive'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleActive(biz)}
                      title={biz.active ? 'Deactivate' : 'Activate'}
                    >
                      {biz.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditing(biz)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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

      {/* Edit Dialog */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Edit {editing.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone</Label>
                    <Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
