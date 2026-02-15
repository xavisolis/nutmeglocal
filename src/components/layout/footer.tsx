import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { GREATER_DANBURY_CITIES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-[oklch(0.20_0.01_145)] text-[oklch(0.85_0.01_145)]">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Nutmeg<span className="text-primary-foreground">Local</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs opacity-70">
              Your free directory of local businesses in the Greater
              Danbury, CT area. Supporting local since day one.
            </p>
            <p className="text-xs opacity-40 mt-4">Built in Connecticut, for Connecticut.</p>
          </div>

          {/* Towns We Serve */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Towns We Serve</h3>
            <ul className="space-y-1 text-sm">
              {GREATER_DANBURY_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    href={`/directory?city=${city}`}
                    className="opacity-70 hover:opacity-100 hover:text-white transition-all inline-block py-1.5"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Explore</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/directory" className="opacity-70 hover:opacity-100 hover:text-white transition-all inline-block py-1.5">Browse Directory</Link></li>
              <li><Link href="/categories" className="opacity-70 hover:opacity-100 hover:text-white transition-all inline-block py-1.5">Categories</Link></li>
            </ul>
          </div>

          {/* For Business Owners */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">For Business Owners</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/claim" className="opacity-70 hover:opacity-100 hover:text-white transition-all inline-block py-1.5">Claim Your Business</Link></li>
              <li><Link href="/dashboard" className="opacity-70 hover:opacity-100 hover:text-white transition-all inline-block py-1.5">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-50">
            <p>&copy; {new Date().getFullYear()} NutmegLocal. All rights reserved.</p>
            <a
              href="https://nutmegbuilds.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
            >
              Powered by NutmegBuilds
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
