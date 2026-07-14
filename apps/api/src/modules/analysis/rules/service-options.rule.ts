import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { CATEGORY_TO_RELEVANT_ATTRIBUTES } from '../constants/analysis.constants';

export const serviceOptionsRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  const profileTypes = profile.types || [];
  let isFoodBusiness = false;

  for (const type of profileTypes) {
    if (
      CATEGORY_TO_RELEVANT_ATTRIBUTES[type]?.includes('delivery') ||
      CATEGORY_TO_RELEVANT_ATTRIBUTES[type]?.includes('dineIn')
    ) {
      isFoodBusiness = true;
      break;
    }
  }

  if (!isFoodBusiness) {
    return {
      ruleId: 'service-options',
      successRatio: 1,
      passed: true,
      applicable: false,
      issues: [],
    };
  }

  if (profile.delivery === undefined && profile.dineIn === undefined && profile.takeout === undefined) {
    issues.push({
      message: 'Service options (Delivery, Dine-in, Takeout) are not configured',
      recommendation:
        'Specify your service options. Food businesses without explicitly defined service options miss out on critical filter-based searches (e.g., "delivery near me").',
    });
  } else {
    successRatio = 1;
  }

  return {
    ruleId: 'service-options',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
