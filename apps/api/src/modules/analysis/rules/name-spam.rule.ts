import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export const nameSpamRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  const name = profile.displayName || '';

  if (name.length > 50) {
    issues.push({
      message: `Business name is unusually long (${name.length} characters)`,
      recommendation:
        'Remove unnecessary keywords from your business name. Google penalizes profiles that stuff keywords into their name instead of using their real-world business name.',
    });
  } else {
    successRatio = 1;
  }

  return {
    ruleId: 'name-spam',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
