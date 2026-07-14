'use client';

import { useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrickleProgress } from '@/components/ui/trickle-progress';
import { SearchInput } from '@/components/analysis/search-input';
import { toast } from 'sonner';

type Props = {
  isLoading: boolean;
  onSubmit: (url: string) => void;
  currentUrl?: string;
};

export function SearchForm({ isLoading, onSubmit, currentUrl = '' }: Props) {
  const [inputValue, setInputValue] = useState('');
  const inputId = useId();

  const handleAnalyze = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (val === currentUrl) {
      toast.warning('This link has already been parsed and displayed.');
      return;
    }

    setInputValue('');
    onSubmit(val);
  };

  return (
    <Card className="mb-12 p-8 text-center">
      <form onSubmit={handleAnalyze} className="relative flex flex-col sm:flex-row gap-3 w-full">
        <label htmlFor={inputId} className="sr-only">
          Google Business Profile URL or Place ID
        </label>

        <SearchInput
          inputId={inputId}
          value={inputValue}
          onChange={setInputValue}
          onClear={() => setInputValue('')}
          disabled={isLoading}
        />

        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="lg"
          className="h-14 px-8 text-base font-medium rounded-lg shadow-sm bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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
