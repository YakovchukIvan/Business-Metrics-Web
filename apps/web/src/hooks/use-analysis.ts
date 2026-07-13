import { useMutation } from '@tanstack/react-query';
import { postAnalysis, AnalyzeRequest } from '@/lib/api/analysis';
import { ApiError } from '@/lib/api/errors';
import { AnalysisResult } from '@/lib/types/analysis';

export function useAnalysis() {
  return useMutation<AnalysisResult, ApiError, AnalyzeRequest>({
    mutationFn: (data) => postAnalysis(data),
  });
}
