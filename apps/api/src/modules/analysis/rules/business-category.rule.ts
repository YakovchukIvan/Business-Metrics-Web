import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS } from '../constants/analysis.constants';

export const businessCategoryRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['business-category'];
  let score = 0;
  const issues: RuleIssue[] = [];

  if (profile.types && profile.types.length > 0) {
    score = weight;
  } else {
    issues.push({
      message: 'Business category is missing',
      recommendation:
        'Select the most accurate primary category for your business. This is the #1 local ranking factor for relevancy. Also, add up to 9 relevant secondary categories.',
    });
  }

  return {
    ruleId: 'business-category',
    weight,
    score,
    passed: score === weight,
    applicable: true,
    issues,
  };
};
