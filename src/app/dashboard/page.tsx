'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Upload, X, Image as ImageIcon } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        name: editing.name,
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

  async function handlePhotoUpload(file: File) {
    if (!editing) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('business_id', editing.id);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const { photos } = await res.json();
      const updated = { ...editing, photos };
      setEditing(updated);
      setBusinesses(businesses.map((b) => (b.id === editing.id ? updated : b)));
    }
    setUploading(false);
  }

  function removePhoto(url: string) {
    if (!editing) return;
    const photos = (editing.photos || []).filter((p) => p !== url);
    const updated = { ...editing, photos };
    setEditing(updated);
    // Save immediately
    supabase.from('businesses').update({ photos }).eq('id', editing.id);
    setBusinesses(businesses.map((b) => (b.id === editing.id ? updated : b)));
  }

  function updateHours(day: string, value: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      hours: { ...(editing.hours || {}), [day]: value },
    });
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
                    <span>{biz.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {biz.view_count || 0} views
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setEditing(biz)}>Edit</Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {biz.address}, {biz.city} · {biz.phone || 'No phone'}
                  {biz.photos && biz.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {biz.photos.map((url, i) => (
                        <img key={i} src={url} alt="" className="h-16 w-16 rounded object-cover shrink-0" />
                      ))}
                    </div>
                  )}
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
                  <Label>Business Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                  />
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

                {/* Hours */}
                <div>
                  <Label>Business Hours</Label>
                  <div className="space-y-2 mt-1">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="w-12 text-sm font-medium capitalize">{day}</span>
                        <Input
                          placeholder="e.g. 9:00 AM - 5:00 PM"
                          value={editing.hours?.[day] || ''}
                          onChange={(e) => updateHours(day, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <Label>Photos</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(editing.photos || []).map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="h-20 w-20 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(url)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors"
                    >
                      {uploading ? '...' : <ImageIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                      e.target.value = '';
                    }}
                  />
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
