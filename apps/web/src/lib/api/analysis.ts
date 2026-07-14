import { fetchApi } from './client';
import type { AnalysisResult, AnalyzeRequest } from '../types/analysis';

export async function postAnalysis(data: AnalyzeRequest): Promise<AnalysisResult> {
  return fetchApi<AnalysisResult>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
