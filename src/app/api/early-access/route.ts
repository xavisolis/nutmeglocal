import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendEarlyAccessConfirmation } from '@/lib/email';

// Simple in-memory rate limiter: max 5 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email, type, business_name } = await request.json();

    if (!email || !type || !['consumer', 'business'].includes(type)) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { error } = await supabase.from('early_access').insert({
      email,
      type,
      business_name,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This email is already signed up!' }, { status: 409 });
      }
      throw error;
    }

    // Send confirmation email (fire-and-forget)
    sendEarlyAccessConfirmation(email, type).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
