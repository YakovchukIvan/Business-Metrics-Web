'use client';

import { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { TOOLTIP_DELAY } from '@/components/ui/help-tooltip';
import { TrickleProgress } from '@/components/ui/trickle-progress';
import { toast } from 'sonner';

type Props = {
  isLoading: boolean;
  onSubmit: (url: string) => void;
  currentUrl?: string;
};

export function SearchForm({ isLoading, onSubmit, currentUrl = '' }: Props) {
  const [inputValue, setInputValue] = useState('');

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (val === currentUrl) {
      toast.warning('This link has already been parsed and displayed.');
      return;
    }

    setInputValue(''); // Clear input after search
    onSubmit(val);
  };

  return (
    <Card className="mb-12 p-8 text-center">
      <form onSubmit={handleAnalyze} className="relative flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            disabled={isLoading}
            placeholder="paste google business profile url or place id..."
            className="pl-12 pr-12 h-14 text-base md:text-base bg-white shadow-sm transition-shadow rounded-lg w-full"
          />
          {inputValue && !isLoading && (
            <HoverCard>
              <HoverCardTrigger
                delay={TOOLTIP_DELAY}
                closeDelay={TOOLTIP_DELAY}
                type="button"
                onClick={() => setInputValue('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 focus:outline-none cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
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
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="lg"
          className="h-14 px-8 text-base font-medium rounded-lg shadow-sm bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Analyzing...
            </>
          ) : (
            'Analyze profile'
          )}
        </Button>
      </form>

      <div className="mt-4 h-1.5 relative">
        <TrickleProgress isAnimating={isLoading} />
      </div>
    </Card>
  );
}
