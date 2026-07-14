import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export const openingHoursRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  if (profile.regularOpeningHours?.periods && profile.regularOpeningHours.periods.length > 0) {
    successRatio = 1;
  } else {
    issues.push({
      message: 'Opening hours are missing',
      recommendation:
        'Add your regular opening hours. Consistent and accurate operating hours are a strong trust signal for Google. Update them for holidays to stay relevant.',
    });
  }

  return {
    ruleId: 'opening-hours',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
