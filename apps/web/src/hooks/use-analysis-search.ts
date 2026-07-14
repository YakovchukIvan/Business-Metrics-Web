'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAnalysis } from '@/hooks/use-analysis';
import { addRecentSearch } from '@/lib/recent-searches';

export function useAnalysisSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('url') || searchParams.get('id');

  const { mutate, data, isPending, isError, error, reset } = useAnalysis();

  const requestIdRef = useRef(0);
  const submittedQueryRef = useRef<string | null>(null);

  const [lastSubmittedInput, setLastSubmittedInput] = useState<string>('');

  const executeAnalysis = useCallback(
    (input: string) => {
      if (isPending) return;

      const requestId = ++requestIdRef.current;
      setLastSubmittedInput(input);
      reset();

      mutate(
        { input },
        {
          onSuccess: (result) => {
            if (requestIdRef.current !== requestId) return;

            submittedQueryRef.current = result.placeId;
            router.replace(`/?id=${result.placeId}`);
            addRecentSearch(result.placeId, result.businessName);
          },
          onError: (err) => {
            if (requestIdRef.current !== requestId) return;
            console.error('[useAnalysis] Error:', err);
          },
        },
      );
    },
    [isPending, mutate, reset, router],
  );

  useEffect(() => {
    if (initialQuery && initialQuery !== submittedQueryRef.current) {
      submittedQueryRef.current = initialQuery;
      executeAnalysis(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return {
    initialQuery,
    lastSubmittedInput,
    data,
    isPending,
    isError,
    error,
    handleSearchSubmit: executeAnalysis,
  };
}
