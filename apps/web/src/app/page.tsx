'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchForm } from '@/components/analysis/search-form';
import { ResultsPanel } from '@/components/analysis/results-panel';
import { useAnalysis } from '@/hooks/use-analysis';
import { addRecentSearch } from '@/lib/recent-searches';
import type { AnalysisResult } from '@/lib/types/analysis';
import type { Rule, Problem, Recommendation } from '@/types/models';

import { formatRuleName } from '@/lib/utils/scoring';

// ---------- Mapping helpers ----------

function mapRules(breakdown: AnalysisResult['breakdown']): Rule[] {
  return breakdown.map((rule) => {
    // Default to true for backwards-compatibility with cached data that lacks the field
    const applicable = rule.applicable !== false;
    if (!applicable) {
      return {
        id: rule.ruleId,
        name: formatRuleName(rule.ruleId),
        earned: rule.score,
        max: rule.weight,
        status: 'na' as const,
        applicable: false,
      };
    }
    const ratio = rule.weight > 0 ? rule.score / rule.weight : 0;
    const status: Rule['status'] = rule.passed ? (ratio >= 0.8 ? 'pass' : 'warn') : ratio > 0 ? 'warn' : 'fail';
    return {
      id: rule.ruleId,
      name: formatRuleName(rule.ruleId),
      earned: rule.score,
      max: rule.weight,
      status,
      applicable: true,
    };
  });
}

function mapProblems(issues: AnalysisResult['issues'], breakdown: AnalysisResult['breakdown']): Problem[] {
  return issues.map((issue, idx) => {
    const rule = breakdown.find((r) => r.ruleId === issue.ruleId);
    const earned = rule?.score ?? 0;
    const max = rule?.weight ?? issue.potentialGain;
    const ratio = max > 0 ? earned / max : 0;
    console.log(`[MAP] Issue[${idx}]:`, issue, '→ breakdown entry:', rule);
    return {
      id: `p-${issue.ruleId}-${idx}`,
      ruleId: issue.ruleId,
      ruleName: formatRuleName(issue.ruleId),
      severity: ratio < 0.5 ? 'critical' : 'warning',
      explanation: issue.message,
      earned,
      max,
    };
  });
}

function mapRecommendations(
  issues: AnalysisResult['issues'],
  breakdown: AnalysisResult['breakdown'],
): Recommendation[] {
  return issues.map((issue, idx) => {
    const rule = breakdown.find((r) => r.ruleId === issue.ruleId);
    const earned = rule?.score ?? 0;
    const max = rule?.weight ?? issue.potentialGain;
    return {
      id: `r-${issue.ruleId}-${idx}`,
      problemId: `p-${issue.ruleId}-${idx}`,
      action: issue.recommendation,
      severity: (max > 0 ? earned / max : 0) < 0.5 ? 'critical' : 'warning',
      earned,
      max,
      docsUrl: undefined,
    };
  });
}

// ---------- Page ----------

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get('url');
  const idParam = searchParams.get('id');
  const initialQuery = urlParam || idParam;

  const { mutate, data, isPending, isError, error, reset } = useAnalysis();
  const submittedQueryRef = useRef<string | null>(null);

  const executeAnalysis = (url: string) => {
    reset();
    mutate(
      { input: url },
      {
        onSuccess: (result) => {
          // Update ref BEFORE router.replace so the URL change doesn't re-trigger the effect
          submittedQueryRef.current = result.placeId;
          router.replace(`/?id=${result.placeId}`);
          addRecentSearch(result.placeId, result.businessName);
        },
        onError: (err) => {
          console.error('[useAnalysis] Error:', err);
        },
      },
    );
  };

  const handleSearchSubmit = (url: string) => {
    executeAnalysis(url);
  };

  useEffect(() => {
    if (initialQuery && initialQuery !== submittedQueryRef.current) {
      submittedQueryRef.current = initialQuery;
      executeAnalysis(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const rules: Rule[] = data ? mapRules(data.breakdown) : [];
  const problems: Problem[] = data ? mapProblems(data.issues, data.breakdown) : [];
  const recommendations: Recommendation[] = data ? mapRecommendations(data.issues, data.breakdown) : [];

  return (
    <div className="flex-1 w-5xl max-w-full mx-auto px-4 md:px-0 py-12">
      <SearchForm isLoading={isPending} onSubmit={handleSearchSubmit} currentUrl={initialQuery || ''} />

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

      {isError && (
        <div className="max-w-lg mx-auto mt-12 text-center animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-6 border border-gray-200">
            {error?.statusCode === 400 || error?.statusCode === 404 ? (
              <Search className="w-8 h-8 text-gray-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            )}
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error?.statusCode === 400 && 'Invalid input'}
            {error?.statusCode === 404 && 'Profile not found'}
            {(error?.statusCode === 429 || error?.statusCode === 502) && 'Service unavailable'}
            {!error?.statusCode && 'Something went wrong'}
          </h3>

          <p className="text-gray-500 text-base">
            {error?.statusCode === 400 &&
              "That doesn't look like a Google Business Profile link or Place ID. Check the link and try again."}
            {error?.statusCode === 404 && 'No profile found for this link.'}
            {(error?.statusCode === 429 || error?.statusCode === 502) &&
              "Google's API is temporarily unavailable. Try again in a moment."}
            {!error?.statusCode && error?.message}
          </p>
        </div>
      )}

      {!data && !isError && !isPending && (
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
