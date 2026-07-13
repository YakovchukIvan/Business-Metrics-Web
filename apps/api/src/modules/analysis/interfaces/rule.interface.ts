import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export interface RuleIssue {
  message: string;
  recommendation: string;
}

export interface RuleResult {
  ruleId: string;
  weight: number;
  passed: boolean;
  score: number;
  issues: RuleIssue[];
}

export type AnalysisRule = (profile: PlaceProfile) => RuleResult;
