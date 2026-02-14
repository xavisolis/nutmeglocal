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
import type { Business, Claim } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [editing, setEditing] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/claim');
        return;
      }
      setUser(user);

      const { data: biz } = await supabase
        .from('businesses')
        .select('*, category:categories(*)')
        .eq('claimed_by', user.id);

      const { data: clm } = await supabase
        .from('claims')
        .select('*, business:businesses(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setBusinesses((biz || []) as Business[]);
      setClaims((clm || []) as Claim[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await supabase
      .from('businesses')
      .update({
        description: editing.description,
        phone: editing.phone,
        email: editing.email,
        website: editing.website,
        hours: editing.hours,
      })
      .eq('id', editing.id);
    setBusinesses(businesses.map((b) => (b.id === editing.id ? editing : b)));
    setEditing(null);
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
      </div>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">My Businesses</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="space-y-4 mt-4">
          {businesses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No claimed businesses yet. <a href="/claim" className="text-primary underline">Claim one now.</a>
              </CardContent>
            </Card>
          ) : (
            businesses.map((biz) => (
              <Card key={biz.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {biz.name}
                    <Button variant="outline" size="sm" onClick={() => setEditing(biz)}>Edit</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {biz.address}, {biz.city} · {biz.phone || 'No phone'}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="claims" className="space-y-4 mt-4">
          {claims.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No claims submitted.
              </CardContent>
            </Card>
          ) : (
            claims.map((claim) => (
              <Card key={claim.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{claim.business?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    claim.status === 'approved' ? 'default' :
                    claim.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {claim.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit {editing.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
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
