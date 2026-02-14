'use client';

import { posthog } from '@/lib/posthog';

export function trackBusinessViewed(businessId: string, businessName: string) {
  posthog?.capture('business_viewed', { businessId, businessName });
}

export function trackClaimSubmitted(businessId: string, businessName: string) {
  posthog?.capture('claim_submitted', { businessId, businessName });
}

export function trackEarlyAccessSignup(type: string) {
  posthog?.capture('early_access_signup', { type });
}

export function trackSearchPerformed(query: string, filters?: Record<string, string>) {
  posthog?.capture('search_performed', { query, ...filters });
}
