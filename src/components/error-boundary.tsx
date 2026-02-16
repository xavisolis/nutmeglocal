'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        We hit an unexpected error. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
