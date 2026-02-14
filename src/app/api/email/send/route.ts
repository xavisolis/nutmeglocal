import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendClaimNotification, sendEarlyAccessConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, to, businessName, claimerEmail, proof } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    let result;
    switch (type) {
      case 'welcome':
        if (!to || !businessName) return NextResponse.json({ error: 'to and businessName required' }, { status: 400 });
        result = await sendWelcomeEmail(to, businessName);
        break;
      case 'claim_notification':
        if (!businessName || !claimerEmail) return NextResponse.json({ error: 'businessName and claimerEmail required' }, { status: 400 });
        result = await sendClaimNotification(businessName, claimerEmail, proof || '');
        break;
      case 'early_access':
        if (!to) return NextResponse.json({ error: 'to required' }, { status: 400 });
        result = await sendEarlyAccessConfirmation(to, 'consumer');
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
