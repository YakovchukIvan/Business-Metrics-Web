import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export interface RuleIssue {
  message: string;
  recommendation: string;
}

export interface RuleResult {
  ruleId: string;
  successRatio: number;
  passed: boolean;
  applicable: boolean;
  issues: RuleIssue[];
}

export type AnalysisRule = (profile: PlaceProfile) => RuleResult;
