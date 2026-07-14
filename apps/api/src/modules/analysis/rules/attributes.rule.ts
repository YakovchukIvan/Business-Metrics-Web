import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS, CATEGORY_TO_RELEVANT_ATTRIBUTES } from '../constants/analysis.constants';

export const attributesRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['attributes'];
  let score = 0;
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
      weight,
      score: weight,
      passed: true,
      applicable: false,
      issues: [],
    };
  }

  // Only consider attributes Google actually surfaces for this business (not undefined)
  const applicableKeys = relevantKeys.filter((key) => profile[key] !== undefined);

  // If Google doesn't surface any of these attributes at all → N/A
  if (applicableKeys.length === 0) {
    return {
      ruleId: 'attributes',
      weight,
      score: weight,
      passed: true,
      applicable: false,
      issues: [],
    };
  }

  const pointsPerAttr = weight / applicableKeys.length;

  for (const key of applicableKeys) {
    if (profile[key] === true) {
      score += pointsPerAttr;
    } else {
      issues.push({
        message: `Relevant attribute '${String(key)}' is missing or false`,
        recommendation:
          `Add the '${String(key)}' attribute to your profile. Fleshing out all possible ` +
          'attributes helps you rank for specific, long-tail voice searches and AI queries.',
      });
    }
  }

  score = Math.min(Math.round(score), weight);

  return {
    ruleId: 'attributes',
    weight,
    score,
    passed: score === weight,
    applicable: true,
    issues,
  };
};
