import type { RuleResult, RuleIssue } from './rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export interface AnalysisResult {
  placeId: string;
  businessName: string;
  address: string | null;
  score: number;
  breakdown: Omit<RuleResult, 'issues'>[];
  issues: Array<RuleIssue & { ruleId: string; potentialGain: number }>;
  rawProfile: PlaceProfile;
}
