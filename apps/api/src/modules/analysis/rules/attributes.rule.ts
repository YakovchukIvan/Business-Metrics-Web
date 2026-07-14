import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { CATEGORY_TO_RELEVANT_ATTRIBUTES } from '../constants/analysis.constants';

export const attributesRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  const profileTypes = profile.types || [];

  // Find the first type that has an explicit mapping (even if empty array)
  let matchedKeys: string[] | undefined;
  for (const type of profileTypes) {
    if (Object.prototype.hasOwnProperty.call(CATEGORY_TO_RELEVANT_ATTRIBUTES, type)) {
      matchedKeys = CATEGORY_TO_RELEVANT_ATTRIBUTES[type];
      break;
    }
  }

  // Fall back to universal if no specific match found
  const relevantKeys = (matchedKeys ?? CATEGORY_TO_RELEVANT_ATTRIBUTES['universal']) as Array<keyof PlaceProfile>;

  // If the matched category explicitly has no attributes (e.g. industrial types) → N/A
  if (relevantKeys.length === 0) {
    return {
      ruleId: 'attributes',
      successRatio: 1,
      passed: true,
      applicable: false,
      issues: [],
    };
  }

  const applicableKeys = relevantKeys;

  // If Google doesn't surface any of these attributes at all -> wait, no!
  // If the category doesn't have ANY relevant keys, we already returned early above.
  if (applicableKeys.length === 0) {
    return {
      ruleId: 'attributes',
      successRatio: 1,
      passed: true,
      applicable: false,
      issues: [],
    };
  }

  const ratioPerAttr = 1 / applicableKeys.length;

  for (const key of applicableKeys) {
    if (profile[key] === true) {
      successRatio += ratioPerAttr;
    } else {
      issues.push({
        message: `Relevant attribute '${String(key)}' is missing or false`,
        recommendation:
          `Add the '${String(key)}' attribute to your profile. Fleshing out all possible ` +
          'attributes helps you rank for specific, long-tail voice searches and AI queries.',
      });
    }
  }

  successRatio = Math.min(successRatio, 1);

  return {
    ruleId: 'attributes',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
