import { useMutation } from '@tanstack/react-query';
import type { AnalyzeRequest } from '@/lib/api/analysis';
import { postAnalysis } from '@/lib/api/analysis';
import type { ApiError } from '@/lib/api/errors';
import type { AnalysisResult } from '@/lib/types/analysis';

export function useAnalysis() {
  return useMutation<AnalysisResult, ApiError, AnalyzeRequest>({
    mutationFn: (data) => postAnalysis(data),
  });
}
