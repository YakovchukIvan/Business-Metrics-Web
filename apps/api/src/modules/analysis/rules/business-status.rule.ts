import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS } from '../constants/analysis.constants';

export const businessStatusRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['business-status'];
  let score = 0;
  const issues: RuleIssue[] = [];

  if (profile.businessStatus === 'OPERATIONAL') {
    score = weight;
  } else {
    issues.push({
      message: `Business status is marked as ${profile.businessStatus || 'UNKNOWN'}`,
      recommendation: 'Ensure your business is marked as OPERATIONAL. Closed profiles are severely demoted in search.',
    });
  }

  return {
    ruleId: 'business-status',
    weight,
    score,
    passed: score === weight,
    issues,
  };
};
