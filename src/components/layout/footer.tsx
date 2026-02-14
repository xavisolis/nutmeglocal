import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">
                Nutmeg<span className="text-primary">Local</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your free directory of local businesses in the Greater Danbury, CT area. 
              Supporting local since day one.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/directory" className="hover:text-foreground transition-colors">Browse Directory</Link></li>
              <li><Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">For Business Owners</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/claim" className="hover:text-foreground transition-colors">Claim Your Business</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NutmegLocal. All rights reserved.
            {' · '}
            <a href="https://nutmegbuilds.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Powered by NutmegBuilds
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
