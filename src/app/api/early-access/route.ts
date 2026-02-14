import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendEarlyAccessConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, type, business_name } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
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
