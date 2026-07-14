import type { PlaceProfile } from '@/types/models';

export interface RuleIssue {
  ruleId: string;
  message: string;
  recommendation: string;
  potentialGain: number;
}

export interface RuleBreakdown {
  ruleId: string;
  weight: number;
  score: number;
  passed: boolean;
  applicable: boolean;
}

export interface AnalysisResult {
  placeId: string;
  businessName: string;
  address: string;
  score: number;
  breakdown: RuleBreakdown[];
  issues: RuleIssue[];
  rawProfile: PlaceProfile;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    processingTimeMs: number;
    cached: boolean;
  };
}

export interface ApiErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AnalyzeRequest {
  input: string;
}
