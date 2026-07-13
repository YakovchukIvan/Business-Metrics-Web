import { fetchApi } from './client';
import { AnalysisResult } from '../types/analysis';

export interface AnalyzeRequest {
  url: string;
}

export async function postAnalysis(data: AnalyzeRequest): Promise<AnalysisResult> {
  return fetchApi<AnalysisResult>('/api/v1/analysis', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
