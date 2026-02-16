import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <MapPin className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">404</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-3">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/directory">Browse Directory</Link>
        </Button>
      </div>
    </div>
  );
}
