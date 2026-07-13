'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { getRecentSearches, RecentSearch } from '@/lib/recent-searches';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function RecentDropdown() {
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const router = useRouter();

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  const handleSelect = (input: string) => {
    router.push(`/?url=${encodeURIComponent(input)}`);
  };

  return (
    <div className="hidden md:flex items-center gap-4 relative">
      <DropdownMenu onOpenChange={(open) => {
        if (open) setRecent(getRecentSearches());
      }}>
        <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none data-[state=open]:text-white cursor-pointer">
          Recent <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-500 font-medium flex items-center gap-1.5 py-2">
              <Clock className="w-3.5 h-3.5" /> Cached 24h
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {recent.length > 0 ? (
            recent.map((item, idx) => (
              <DropdownMenuItem 
                key={idx}
                onClick={() => handleSelect(item.input)}
                className="cursor-pointer py-2 text-sm font-medium"
              >
                {item.businessName}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No recent searches
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
