import { fetchApi } from './client';
import type { AnalysisResult } from '../types/analysis';

export interface AnalyzeRequest {
  input: string;
}

export async function postAnalysis(data: AnalyzeRequest): Promise<AnalysisResult> {
  return fetchApi<AnalysisResult>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
