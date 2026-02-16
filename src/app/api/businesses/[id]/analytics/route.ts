import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check — only the business owner can see analytics
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: biz } = await supabase
    .from('businesses')
    .select('claimed_by')
    .eq('id', id)
    .single();

  if (!biz || biz.claimed_by !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all events for this business in the last 60 days
  const { data: events } = await supabase
    .from('business_events')
    .select('event_type, search_term, referrer, created_at')
    .eq('business_id', id)
    .gte('created_at', sixtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const allEvents = events || [];

  // Split into current and previous 30-day periods
  const current = allEvents.filter((e) => new Date(e.created_at) >= thirtyDaysAgo);
  const previous = allEvents.filter((e) => new Date(e.created_at) < thirtyDaysAgo);

  // Count by event type
  function countByType(list: typeof allEvents, type: string) {
    return list.filter((e) => e.event_type === type).length;
  }

  // Get view count from business table (current) — we use the stored view_count
  const { data: bizFull } = await supabase
    .from('businesses')
    .select('view_count')
    .eq('id', id)
    .single();

  // Daily views for the last 7 days
  const recentEvents = allEvents.filter((e) => new Date(e.created_at) >= sevenDaysAgo);
  const dailyViews: { day: string; label: string; views: number; clicks: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    const dayEvents = recentEvents.filter((e) => e.created_at.slice(0, 10) === dayStr);
    dailyViews.push({
      day: dayStr,
      label: dayNames[d.getDay()],
      views: dayEvents.filter((e) => e.event_type === 'profile_view').length,
      clicks: dayEvents.filter((e) => e.event_type !== 'profile_view').length,
    });
  }

  // Top search terms (last 30 days)
  const searchTerms: Record<string, number> = {};
  for (const e of current) {
    if (e.search_term) {
      searchTerms[e.search_term] = (searchTerms[e.search_term] || 0) + 1;
    }
  }
  const topSearchTerms = Object.entries(searchTerms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term, count]) => ({ term, count }));

  // Traffic sources — group related referrers
  const sourceBreaks = {
    search: current.filter((e) => e.referrer === 'search').length,
    category: current.filter((e) => e.referrer === 'category').length,
    browse: current.filter((e) => ['browse', 'town', 'map'].includes(e.referrer || '')).length,
    direct: current.filter((e) => e.referrer === 'direct' || !e.referrer).length,
    external: current.filter((e) => e.referrer === 'external').length,
  };

  // Recent activity (last 10 events)
  const recentActivity = allEvents
    .filter((e) => e.event_type !== 'profile_view')
    .slice(0, 10)
    .map((e) => ({
      type: e.event_type,
      date: e.created_at,
    }));

  return NextResponse.json({
    period: '30d',
    stats: {
      views: bizFull?.view_count || 0,
      phone_clicks: { current: countByType(current, 'phone_click'), previous: countByType(previous, 'phone_click') },
      website_clicks: { current: countByType(current, 'website_click'), previous: countByType(previous, 'website_click') },
      email_clicks: { current: countByType(current, 'email_click'), previous: countByType(previous, 'email_click') },
      directions_clicks: { current: countByType(current, 'directions_click'), previous: countByType(previous, 'directions_click') },
    },
    dailyViews,
    topSearchTerms,
    sources: sourceBreaks,
    recentActivity,
  });
}
