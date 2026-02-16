'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog';

interface TrackerProps {
  businessId: string;
  businessName: string;
  claimedBy: string | null;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, hours: number) {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

export function BusinessPageTracker({ businessId, businessName, claimedBy }: TrackerProps) {
  const searchParams = useSearchParams();
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (tracked) return;

    async function track() {
      // 1. Owner exclusion — don't count the business owner viewing their own listing
      if (claimedBy) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === claimedBy) {
          setTracked(true);
          return; // Owner viewing own listing — skip
        }
      }

      // 2. Cookie dedup — one view per business per 24 hours per browser
      const cookieKey = `nl_v_${businessId}`;
      if (getCookie(cookieKey)) {
        setTracked(true);
        return; // Already viewed recently — skip
      }

      // 3. Determine referrer source
      const ref = searchParams.get('ref');
      const searchTerm = searchParams.get('q');
      let referrer = 'direct';
      if (ref) {
        referrer = ref;
      } else if (typeof document !== 'undefined' && document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          if (refUrl.hostname !== window.location.hostname) {
            referrer = 'external';
          }
        } catch {
          referrer = 'external';
        }
      }

      // 4. Record the view
      posthog?.capture('business_profile_view', { businessId, businessName, referrer, searchTerm });
      fetch(`/api/businesses/${businessId}/view`, { method: 'POST' }).catch(() => {});
      fetch(`/api/businesses/${businessId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'profile_view',
          referrer,
          search_term: searchTerm || null,
        }),
      }).catch(() => {});

      // 5. Set dedup cookie (24 hours)
      setCookie(cookieKey, '1', 24);
      setTracked(true);
    }

    track();
  }, [businessId, businessName, claimedBy, searchParams, tracked]);

  return null;
}

interface TrackedLinkProps {
  businessId: string;
  businessName: string;
  eventType: 'phone_click' | 'website_click' | 'email_click' | 'directions_click';
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function TrackedLink({ businessId, businessName, eventType, href, children, className, target, rel }: TrackedLinkProps) {
  function handleClick() {
    // Click events always count (no dedup) — a real phone call is a real phone call
    posthog?.capture(eventType, { businessId, businessName });
    fetch(`/api/businesses/${businessId}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType }),
    }).catch(() => {});
  }

  return (
    <a href={href} onClick={handleClick} className={className} target={target} rel={rel}>
      {children}
    </a>
  );
}
