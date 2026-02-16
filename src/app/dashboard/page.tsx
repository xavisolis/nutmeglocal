'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, X, Image as ImageIcon, LogIn, MapPin, Phone, Mail, Globe,
  Clock, ExternalLink, TrendingUp, TrendingDown, MousePointerClick,
  Search, CheckCircle2, Circle, ArrowRight, BarChart3, Sparkles,
  Camera, FileText, PhoneCall, Compass, LayoutGrid,
} from 'lucide-react';
import { HoursEditor } from '@/components/hours-editor';
import type { Business, Claim } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AnalyticsData {
  stats: {
    views: number;
    phone_clicks: { current: number; previous: number };
    website_clicks: { current: number; previous: number };
    email_clicks: { current: number; previous: number };
    directions_clicks: { current: number; previous: number };
  };
  dailyViews: { day: string; label: string; views: number; clicks: number }[];
  topSearchTerms: { term: string; count: number }[];
  sources: { search: number; category: number; browse: number; direct: number; external: number };
  recentActivity: { type: string; date: string }[];
}

const EVENT_LABELS: Record<string, string> = {
  phone_click: 'Phone call',
  website_click: 'Website visit',
  email_click: 'Email click',
  directions_click: 'Directions',
  share_click: 'Shared listing',
};

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------
function StatCard({ label, value, previous, icon: Icon }: {
  label: string;
  value: number;
  previous?: number;
  icon: React.ElementType;
}) {
  const change = previous !== undefined && previous > 0
    ? Math.round(((value - previous) / previous) * 100)
    : null;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {change !== null && (
          <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Last 30 days</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini Bar Chart (CSS-only)
// ---------------------------------------------------------------------------
function MiniChart({ data }: { data: { label: string; views: number; clicks: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.views + d.clicks), 1);

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => {
        const viewH = (d.views / maxVal) * 100;
        const clickH = (d.clicks / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end h-20 gap-px">
              {d.clicks > 0 && (
                <div
                  className="w-full rounded-t bg-primary/60 transition-all"
                  style={{ height: `${clickH}%`, minHeight: d.clicks > 0 ? 2 : 0 }}
                />
              )}
              <div
                className="w-full rounded-t bg-primary/25 transition-all"
                style={{ height: `${viewH}%`, minHeight: d.views > 0 ? 2 : 0 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grow Checklist
// ---------------------------------------------------------------------------
function GrowChecklist({ biz }: { biz: Business }) {
  const items = [
    { done: true, label: 'Claimed your profile', desc: 'You own this listing' },
    { done: !!biz.description, label: 'Add a description', desc: 'Tell people what you do — businesses with descriptions get 2x more views' },
    { done: !!(biz.hours && Object.values(biz.hours).some((h) => h && h !== 'Closed')), label: 'Set business hours', desc: 'Let customers know when you\'re open' },
    { done: !!(biz.photos && biz.photos.length > 0), label: 'Upload photos', desc: 'Listings with photos get 3x more engagement' },
    { done: !!biz.phone, label: 'Add phone number', desc: 'Make it easy for customers to call' },
    { done: !!biz.website, label: 'Link your website', desc: 'Drive traffic to your site' },
  ];

  const completed = items.filter((i) => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Profile completeness</span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${item.done ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
            {item.done ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.label}</p>
              {!item.done && <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* NutmegBuilds bridge — subtle, helpful, not salesy */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Want more customers?</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Get a free website audit and see how your online presence stacks up against competitors in {biz.city}.
          </p>
          <a
            href="https://nutmegbuilds.com/contact"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Free website audit <ArrowRight className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Record<string, AnalyticsData>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDashboard = useCallback(async (userId: string) => {
    const { data: biz } = await supabase
      .from('businesses')
      .select('*, category:categories(*)')
      .eq('claimed_by', userId);

    const { data: clm } = await supabase
      .from('claims')
      .select('*, business:businesses(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const bizList = (biz || []) as Business[];
    setBusinesses(bizList);
    setClaims((clm || []) as Claim[]);
    if (bizList.length > 0) setSelectedBiz(bizList[0].id);
    setLoading(false);
  }, [supabase]);

  async function loadAnalytics(bizId: string) {
    if (analytics[bizId]) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${bizId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics((prev) => ({ ...prev, [bizId]: data }));
      }
    } catch { /* ignore */ }
    setAnalyticsLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError('Invalid email or password.');
      setLoginLoading(false);
      return;
    }
    setUser(data.user);
    setLoginLoading(false);
    await loadDashboard(data.user.id);
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUser(user);
      await loadDashboard(user.id);
    }
    load();
  }, [loadDashboard, supabase.auth]);

  // Load analytics when tab switches to analytics
  useEffect(() => {
    if (selectedBiz) loadAnalytics(selectedBiz);
  }, [selectedBiz]);

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
    supabase.from('businesses').update({ photos }).eq('id', editing.id);
    setBusinesses(businesses.map((b) => (b.id === editing.id ? updated : b)));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  // Not logged in — show login form
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10 md:py-14 max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage your business listing.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Don&apos;t have an account?{' '}
              <a href="/claim" className="text-primary hover:underline">Claim your business</a> first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBiz = businesses.find((b) => b.id === selectedBiz);
  const currentAnalytics = analytics[selectedBiz];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your business and track performance</p>
        </div>
        <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
      </div>

      {/* Business selector (if multiple businesses) */}
      {businesses.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {businesses.map((biz) => (
            <button
              key={biz.id}
              onClick={() => setSelectedBiz(biz.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedBiz === biz.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {biz.name}
            </button>
          ))}
        </div>
      )}

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No businesses yet</h2>
            <p className="text-muted-foreground mb-4">Claim your business to start tracking performance.</p>
            <Button asChild><a href="/claim">Claim Your Business</a></Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="grow">Grow</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>

          {/* ============ OVERVIEW TAB ============ */}
          <TabsContent value="overview" className="mt-6">
            {currentBiz && (() => {
              const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
              const todayHours = currentBiz.hours?.[todayKey];
              const isOpenToday = todayHours && todayHours.toLowerCase() !== 'closed';
              const citySlug = currentBiz.city.toLowerCase().replace(/\s+/g, '-');

              return (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{currentBiz.name}</span>
                          {currentBiz.category?.name && (
                            <Badge variant="secondary" className="font-normal text-xs">{currentBiz.category.name}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`/directory/${citySlug}/${currentBiz.slug}`} target="_blank" className="text-muted-foreground hover:text-primary transition-colors" title="View public listing">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button variant="outline" size="sm" onClick={() => setEditing(currentBiz)}>Edit</Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{currentBiz.address}, {currentBiz.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{currentBiz.phone || 'No phone'}</span>
                        </div>
                        {currentBiz.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span>{currentBiz.email}</span>
                          </div>
                        )}
                        {currentBiz.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            <a href={currentBiz.website} target="_blank" rel="noopener" className="text-primary hover:underline truncate">{currentBiz.website.replace(/^https?:\/\//, '')}</a>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {todayHours ? (
                            <span>Today: <span className={isOpenToday ? 'text-green-600 font-medium' : ''}>{todayHours}</span></span>
                          ) : (
                            <span className="italic">No hours set</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {currentBiz.view_count || 0} total views
                        </span>
                      </div>
                      {currentBiz.description && (
                        <p className="text-muted-foreground text-xs line-clamp-2">{currentBiz.description}</p>
                      )}
                      {currentBiz.photos && currentBiz.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {currentBiz.photos.map((url, i) => (
                            <img key={i} src={url} alt="" className="h-16 w-16 rounded object-cover shrink-0" />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick stats row */}
                  {currentAnalytics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatCard label="Profile Views" value={currentAnalytics.stats.views} icon={Eye} />
                      <StatCard label="Phone Clicks" value={currentAnalytics.stats.phone_clicks.current} previous={currentAnalytics.stats.phone_clicks.previous} icon={PhoneCall} />
                      <StatCard label="Website Clicks" value={currentAnalytics.stats.website_clicks.current} previous={currentAnalytics.stats.website_clicks.previous} icon={Globe} />
                      <StatCard label="Directions" value={currentAnalytics.stats.directions_clicks.current} previous={currentAnalytics.stats.directions_clicks.previous} icon={Compass} />
                    </div>
                  )}
                </div>
              );
            })()}
          </TabsContent>

          {/* ============ ANALYTICS TAB ============ */}
          <TabsContent value="analytics" className="mt-6">
            {analyticsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
            ) : !currentAnalytics ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Analytics are being collected</h2>
                  <p className="text-muted-foreground">Data will appear here as people view your listing.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Profile Views" value={currentAnalytics.stats.views} icon={Eye} />
                  <StatCard label="Phone Clicks" value={currentAnalytics.stats.phone_clicks.current} previous={currentAnalytics.stats.phone_clicks.previous} icon={PhoneCall} />
                  <StatCard label="Website Clicks" value={currentAnalytics.stats.website_clicks.current} previous={currentAnalytics.stats.website_clicks.previous} icon={Globe} />
                  <StatCard label="Directions" value={currentAnalytics.stats.directions_clicks.current} previous={currentAnalytics.stats.directions_clicks.previous} icon={Compass} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Weekly activity chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MiniChart data={currentAnalytics.dailyViews} />
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/25" /> Views</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/60" /> Clicks</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* How people find you */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">How People Find You</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const s = currentAnalytics.sources;
                        const total = s.search + s.category + (s.browse || 0) + s.direct + s.external;
                        if (total === 0) return <p className="text-sm text-muted-foreground py-4">No data yet</p>;
                        const sources = [
                          { label: 'Search', value: s.search, icon: Search },
                          { label: 'Category browse', value: s.category, icon: Compass },
                          { label: 'Directory browse', value: s.browse || 0, icon: LayoutGrid },
                          { label: 'Direct / link', value: s.direct, icon: MousePointerClick },
                          { label: 'Google / external', value: s.external, icon: Globe },
                        ].filter((x) => x.value > 0);
                        return (
                          <div className="space-y-3">
                            {sources.map((src) => (
                              <div key={src.label} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-2 text-muted-foreground">
                                    <src.icon className="h-3.5 w-3.5" />{src.label}
                                  </span>
                                  <span className="font-medium">{Math.round((src.value / total) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/40 rounded-full" style={{ width: `${(src.value / total) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Top search terms */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Search className="h-4 w-4" /> Top Search Terms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentAnalytics.topSearchTerms.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No search data yet</p>
                      ) : (
                        <div className="space-y-2">
                          {currentAnalytics.topSearchTerms.map((t, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground truncate">&ldquo;{t.term}&rdquo;</span>
                              <Badge variant="secondary" className="text-xs shrink-0">{t.count}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent activity */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4" /> Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentAnalytics.recentActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No activity yet</p>
                      ) : (
                        <div className="space-y-2">
                          {currentAnalytics.recentActivity.map((a, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{EVENT_LABELS[a.type] || a.type}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============ GROW TAB ============ */}
          <TabsContent value="grow" className="mt-6">
            {currentBiz && <GrowChecklist biz={currentBiz} />}
          </TabsContent>

          {/* ============ CLAIMS TAB ============ */}
          <TabsContent value="claims" className="space-y-4 mt-6">
            {claims.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">No claims submitted.</CardContent>
              </Card>
            ) : (
              claims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{claim.business?.name}</p>
                      <p className="text-sm text-muted-foreground">Submitted {new Date(claim.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {claim.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

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
                  <Textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <Label>Business Hours</Label>
                  <div className="mt-1">
                    <HoursEditor hours={editing.hours} onChange={(hours) => setEditing({ ...editing, hours })} />
                  </div>
                </div>
                <div>
                  <Label>Photos</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(editing.photos || []).map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="h-20 w-20 rounded object-cover" />
                        <button type="button" onClick={() => removePhoto(url)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                      {uploading ? '...' : <ImageIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(file); e.target.value = ''; }} />
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
