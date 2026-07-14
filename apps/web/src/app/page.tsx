'use client';

import { Suspense, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { SearchForm } from '@/components/analysis/search-form';
import { ResultsPanel } from '@/components/analysis/results-panel';
import { useAnalysis } from '@/hooks/use-analysis';
import { addRecentSearch } from '@/lib/recent-searches';
import type { AnalysisResult } from '@/lib/types/analysis';
import type { Rule, Problem, Recommendation } from '@/types/models';

// ---------- Mapping helpers ----------

function mapRules(breakdown: AnalysisResult['breakdown']): Rule[] {
  return Object.entries(breakdown).map(([key, rule]) => {
    const ratio = rule.weight > 0 ? rule.score / rule.weight : 0;
    const status: Rule['status'] = rule.passed ? (ratio >= 0.8 ? 'pass' : 'warn') : ratio > 0 ? 'warn' : 'fail';
    return {
      id: rule.ruleId ?? key,
      name: formatRuleName(rule.ruleId ?? key),
      earned: rule.score,
      max: rule.weight,
      status,
    };
  });
}

function mapProblems(issues: AnalysisResult['issues'], breakdown: AnalysisResult['breakdown']): Problem[] {
  return issues.map((issue, idx) => {
    const rule = breakdown[issue.ruleId];
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
    const rule = breakdown[issue.ruleId];
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

function formatRuleName(ruleId: string): string {
  return ruleId
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- Page ----------

function HomeContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');

  const { mutate, data, isPending, isError, error, reset } = useAnalysis();

  const handleAnalyze = (url: string) => {
    reset();
    mutate(
      { input: url },
      {
        onSuccess: (result) => {
          console.log('[useAnalysis] Success — full AnalysisResult:', result);
          console.log('[useAnalysis] breakdown keys:', Object.keys(result.breakdown ?? {}));
          console.log('[useAnalysis] issues[]:', result.issues);
          addRecentSearch(url, result.businessName);
        },
        onError: (err) => {
          console.error('[useAnalysis] Error:', err);
        },
      },
    );
  };

  useEffect(() => {
    if (urlParam) {
      handleAnalyze(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParam]);

  const rules: Rule[] = data ? mapRules(data.breakdown) : [];
  const problems: Problem[] = data ? mapProblems(data.issues, data.breakdown) : [];
  const recommendations: Recommendation[] = data ? mapRecommendations(data.issues, data.breakdown) : [];

  return (
    <div className="flex-1 w-5xl max-w-full mx-auto px-4 md:px-0 py-12">
      <SearchForm isLoading={isPending} onSubmit={handleAnalyze} defaultUrl={urlParam || ''} />

      {data && (
        <ResultsPanel
          score={data.score}
          businessName={data.businessName}
          rules={rules}
          problems={problems}
          recommendations={recommendations}
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
