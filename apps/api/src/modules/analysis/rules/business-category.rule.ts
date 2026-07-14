import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export const businessCategoryRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  const types = profile.types || [];

  if (types.length === 0) {
    issues.push({
      message: 'Business category is completely missing',
      recommendation:
        'Select the most accurate primary category for your business. This is the #1 local ranking factor for relevancy. Also, add up to 9 relevant secondary categories.',
    });
  } else if (types.length === 1) {
    successRatio = 0.75; // Partial credit for having a primary category
    issues.push({
      message: 'Only one category is associated with the profile',
      recommendation:
        'Add at least one relevant secondary category. Secondary categories significantly expand the range of keywords your business can rank for in local search.',
    });
  } else {
    successRatio = 1;
  }

  return {
    ruleId: 'business-category',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
