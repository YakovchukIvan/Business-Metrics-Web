import { useMemo } from 'react';
import type { AnalysisResult } from '@/lib/types/analysis';
import type { Rule, Problem, Recommendation } from '@/types/models';
import { mapProblems, mapRecommendations, mapRules } from '@/lib/utils/mappers';

export function useAnalysisViewModel(data: AnalysisResult | undefined) {
  return useMemo(() => {
    if (!data) {
      return { rules: [] as Rule[], problems: [] as Problem[], recommendations: [] as Recommendation[] };
    }
    return {
      rules: mapRules(data.breakdown),
      problems: mapProblems(data.issues, data.breakdown),
      recommendations: mapRecommendations(data.issues, data.breakdown),
    };
  }, [data]);
}
