import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export const businessStatusRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  if (profile.businessStatus === 'OPERATIONAL') {
    successRatio = 1;
  } else {
    issues.push({
      message: `Business status is marked as ${profile.businessStatus || 'UNKNOWN'}`,
      recommendation:
        'Ensure your business is marked as OPERATIONAL. Closed profiles are severely demoted in search and AI Overviews.',
    });
  }

  return {
    ruleId: 'business-status',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
