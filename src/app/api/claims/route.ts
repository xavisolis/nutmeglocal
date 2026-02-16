import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_PENDING_CLAIMS = 3;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id, proof } = await request.json();
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    // Check pending claims limit
    const { count } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if ((count ?? 0) >= MAX_PENDING_CLAIMS) {
      return NextResponse.json(
        { error: `You can have at most ${MAX_PENDING_CLAIMS} pending claims. Wait for existing claims to be reviewed.` },
        { status: 429 }
      );
    }

    // Check if user already has a pending/approved claim for this business
    const { data: existing } = await supabase
      .from('claims')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('business_id', business_id)
      .in('status', ['pending', 'approved'])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: existing[0].status === 'approved' ? 'You already own this business.' : 'You already have a pending claim for this business.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from('claims').insert({
      business_id,
      user_id: user.id,
      user_email: user.email,
      proof,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
