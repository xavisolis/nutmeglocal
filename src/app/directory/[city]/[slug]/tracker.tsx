'use client';

import { useEffect } from 'react';
import { posthog } from '@/lib/posthog';

export function BusinessPageTracker({ businessId, businessName }: { businessId: string; businessName: string }) {
  useEffect(() => {
    posthog?.capture('business_profile_view', { businessId, businessName });
  }, [businessId, businessName]);

  return null;
}
