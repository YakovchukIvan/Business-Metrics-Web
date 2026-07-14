import type { RuleIssue } from './rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

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
  address: string | null;
  score: number; // 0-100
  breakdown: RuleBreakdown[];
  issues: Array<RuleIssue & { ruleId: string; potentialGain: number }>;
  rawProfile: PlaceProfile;
}
