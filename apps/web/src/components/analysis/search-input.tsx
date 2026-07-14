'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { TOOLTIP_DELAY } from '@/components/ui/help-tooltip';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled: boolean;
  inputId: string;
};

export function SearchInput({ value, onChange, onClear, disabled, inputId }: Props) {
  return (
    <div className="relative flex-1 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Search className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>

      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="paste google business profile url or place id..."
        className="pl-12 pr-12 h-14 text-base md:text-base bg-white shadow-sm transition-shadow rounded-lg w-full"
      />

      {value && !disabled && (
        <HoverCard>
          <HoverCardTrigger
            delay={TOOLTIP_DELAY}
            closeDelay={TOOLTIP_DELAY}
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 focus:outline-none cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            align="center"
            className="w-auto p-2 text-sm font-medium border-gray-200 shadow-md"
          >
            Clear search
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}
