'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecentDropdown } from './recent-dropdown';

export function Header() {
  const pathname = usePathname();
  const isDocs = pathname === '/docs';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 z-50 flex items-center justify-between px-6 opacity-85">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-medium text-white leading-tight">ProfileLens</span>
            <span className="text-[10px] text-gray-400 leading-tight uppercase tracking-wider">
              Business Profile Audit
            </span>
          </div>
        </Link>
        <RecentDropdown />
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="/docs"
          className={cn(
            'text-sm font-medium transition-colors cursor-pointer',
            isDocs ? 'text-white' : 'text-gray-400 hover:text-white',
          )}
        >
          Documentation
        </Link>
        <div className="text-sm text-gray-400 border-l border-gray-800 pl-6">audit tool &middot; mvp</div>
      </div>
    </header>
  );
}
