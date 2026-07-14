import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS } from '../constants/analysis.constants';

export const openingHoursRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['opening-hours'];
  let score = 0;
  const issues: RuleIssue[] = [];

  if (profile.regularOpeningHours?.periods && profile.regularOpeningHours.periods.length > 0) {
    score = weight;
  } else {
    issues.push({
      message: 'Opening hours are missing',
      recommendation:
        'Add your regular opening hours. Consistent and accurate operating hours are a strong trust signal for Google. Update them for holidays to stay relevant.',
    });
  }

  return {
    ruleId: 'opening-hours',
    weight,
    score,
    passed: score === weight,
    applicable: true,
    issues,
  };
};
