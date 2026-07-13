'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { SearchForm } from '@/components/analysis/search-form';
import { ResultsPanel } from '@/components/analysis/results-panel';
import { Rule } from '@/components/analysis/breakdown-card';
import { Problem, Recommendation } from '@/components/analysis/issues-list';
import { addRecentSearch } from '@/lib/recent-searches';

type AppState = 'idle' | 'loading' | 'success' | 'error';
type ErrorType = 400 | 404 | 429 | 502 | null;

// Mock Data
const MOCK_RULES: Rule[] = [
  { id: '1', name: 'Completeness', earned: 20, max: 20, status: 'pass' },
  { id: '2', name: 'Rating', earned: 15, max: 20, status: 'warn' },
  { id: '3', name: 'Opening hours', earned: 5, max: 15, status: 'fail' },
  { id: '4', name: 'Photos', earned: 10, max: 15, status: 'warn' },
  { id: '5', name: 'Business category', earned: 10, max: 10, status: 'pass' },
  { id: '6', name: 'Description', earned: 10, max: 10, status: 'pass' },
  { id: '7', name: 'Attributes', earned: 5, max: 5, status: 'pass' },
  { id: '8', name: 'Business status', earned: 5, max: 5, status: 'pass' },
];

const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'p1',
    ruleId: '3',
    ruleName: 'Opening hours',
    severity: 'critical',
    explanation: 'regularOpeningHours is empty on this profile',
    earned: 0,
    max: 15,
  },
  {
    id: 'p2',
    ruleId: '2',
    ruleName: 'Rating',
    severity: 'warning',
    explanation: 'averageRating is below 4.5 threshold (currently 4.1)',
    earned: 15,
    max: 20,
  },
  {
    id: 'p3',
    ruleId: '4',
    ruleName: 'Photos',
    severity: 'warning',
    explanation: 'photoCount is below recommended minimum of 10',
    earned: 10,
    max: 15,
  },
];

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r1',
    problemId: 'p1',
    action: 'Add comprehensive operating hours including holidays',
    severity: 'critical',
    earned: 0,
    max: 15,
  },
  {
    id: 'r2',
    problemId: 'p2',
    action: 'Implement a review generation strategy to improve rating',
    severity: 'warning',
    earned: 15,
    max: 20,
  },
  {
    id: 'r3',
    problemId: 'p3',
    action: 'Upload at least 5 new high-quality interior/exterior photos',
    severity: 'warning',
    earned: 10,
    max: 15,
  },
];

const SCORE = 99;

function HomeContent() {
  const [state, setState] = useState<AppState>('idle');
  const [errorType, setErrorType] = useState<ErrorType>(null);

  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');

  useEffect(() => {
    if (urlParam) {
      handleAnalyze(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParam]);

  const handleAnalyze = (url: string) => {
    setState('loading');
    setErrorType(null);

    // Simulate API call
    setTimeout(() => {
      if (url.includes('error400')) {
        setState('error');
        setErrorType(400);
      } else if (url.includes('error404')) {
        setState('error');
        setErrorType(404);
      } else if (url.includes('error502')) {
        setState('error');
        setErrorType(502);
      } else {
        setState('success');
        addRecentSearch(url, 'Acme Corp (Mocked)');
      }
    }, 2000);
  };

  return (
    <div className="flex-1 w-[1024px] max-w-full mx-auto px-4 md:px-0 py-12">
      <SearchForm isLoading={state === 'loading'} onSubmit={handleAnalyze} defaultUrl={urlParam || ''} />

      {state === 'success' && (
        <ResultsPanel
          score={SCORE}
          businessName="Acme Corp"
          rules={MOCK_RULES}
          problems={MOCK_PROBLEMS}
          recommendations={MOCK_RECOMMENDATIONS}
        />
      )}

      {state === 'error' && (
        <div className="max-w-lg mx-auto mt-12 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-6 border border-gray-200">
            {errorType === 400 || errorType === 404 ? (
              <Search className="w-8 h-8 text-gray-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            )}
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {errorType === 400 && 'Invalid input'}
            {errorType === 404 && 'Profile not found'}
            {(errorType === 429 || errorType === 502) && 'Service unavailable'}
          </h3>

          <p className="text-gray-500 text-base">
            {errorType === 400 &&
              "That doesn't look like a Google Business Profile link or Place ID. Check the link and try again."}
            {errorType === 404 && 'No profile found for this link.'}
            {(errorType === 429 || errorType === 502) &&
              "Google's API is temporarily unavailable. Try again in a moment."}
          </p>
        </div>
      )}

      {state === 'idle' && (
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-gray-400 text-sm">Enter a profile link to begin the audit.</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-gray-400 text-sm">Loading auditor...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
