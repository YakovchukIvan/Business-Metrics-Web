import { useMutation } from '@tanstack/react-query';
import { postAnalysis } from '@/lib/api/analysis';
import type { ApiError } from '@/lib/api/errors';
import type { AnalysisResult, AnalyzeRequest } from '@/lib/types/analysis';

export function useAnalysis() {
  return useMutation<AnalysisResult, ApiError, AnalyzeRequest>({
    mutationFn: (data) => postAnalysis(data),
  });
}
