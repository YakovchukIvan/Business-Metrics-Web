'use client';

import { SearchForm } from '@/components/analysis/search-form';
import { ResultsPanel } from '@/components/analysis/results-panel';
import { ErrorState } from '@/components/analysis/error-state';
import { useAnalysisSearch } from '@/hooks/use-analysis-search';
import { useAnalysisViewModel } from '@/hooks/use-analysis-view-model';

export function HomeClient() {
  const { initialQuery, lastSubmittedInput, data, isPending, isError, error, handleSearchSubmit } = useAnalysisSearch();
  const { rules, problems, recommendations } = useAnalysisViewModel(data);

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-0 py-12">
      <SearchForm
        isLoading={isPending}
        onSubmit={handleSearchSubmit}
        currentUrl={lastSubmittedInput || initialQuery || ''}
      />

      {data && (
        <ResultsPanel
          score={data.score}
          businessName={data.businessName}
          address={data.address}
          rules={rules}
          problems={problems}
          recommendations={recommendations}
          rawProfile={data.rawProfile}
        />
      )}

      {isError && <ErrorState error={error} />}

      {!data && !isError && !isPending && (
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-gray-400 text-sm">Enter a profile link to begin the audit.</p>
        </div>
      )}
    </div>
  );
}
