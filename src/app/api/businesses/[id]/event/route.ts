import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const VALID_EVENTS = ['profile_view', 'phone_click', 'website_click', 'email_click', 'directions_click', 'share_click', 'search_result_click'];

const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /facebookexternalhit/i,
  /Twitterbot/i, /LinkedInBot/i, /WhatsApp/i, /TelegramBot/i,
  /Discordbot/i, /Slackbot/i, /Googlebot/i, /Bingbot/i, /baiduspider/i,
  /YandexBot/i, /DuckDuckBot/i, /Applebot/i, /PetalBot/i,
  /curl/i, /wget/i, /python-requests/i, /axios/i, /node-fetch/i,
  /HeadlessChrome/i, /PhantomJS/i, /Lighthouse/i, /PageSpeed/i,
  /Google-InspectionTool/i, /Chrome-Lighthouse/i,
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Bot filtering
  const ua = request.headers.get('user-agent');
  if (isBot(ua)) {
    return NextResponse.json({ success: true }); // Silent discard
  }

  const { id } = await params;
  const { event_type, referrer, search_term } = await request.json();

  if (!VALID_EVENTS.includes(event_type)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  await supabase.from('business_events').insert({
    business_id: id,
    event_type,
    referrer: referrer || null,
    search_term: search_term || null,
  });

  return NextResponse.json({ success: true });
}
