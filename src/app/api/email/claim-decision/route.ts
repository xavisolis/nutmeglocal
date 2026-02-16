import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendClaimApproved, sendClaimRejected } from '@/lib/email';

const ADMIN_EMAILS = ['jaimesolisa@gmail.com'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { claim_id, action } = await request.json();
    if (!claim_id || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch claim with business name and claimer email
    const { data: claim } = await supabase
      .from('claims')
      .select('user_email, business:businesses(name)')
      .eq('id', claim_id)
      .single();

    if (!claim?.user_email) {
      return NextResponse.json({ error: 'Claimer email not found' }, { status: 404 });
    }

    const biz = Array.isArray(claim.business) ? claim.business[0] : claim.business;
    const businessName = biz?.name || 'your business';

    if (action === 'approved') {
      await sendClaimApproved(claim.user_email, businessName);
    } else {
      await sendClaimRejected(claim.user_email, businessName);
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}
