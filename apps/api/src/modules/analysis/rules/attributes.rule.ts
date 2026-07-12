import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS, CATEGORY_TO_RELEVANT_ATTRIBUTES } from '../constants/analysis.constants';

export const attributesRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['attributes'];
  let score = 0;
  const issues: RuleIssue[] = [];

  let relevantKeys = CATEGORY_TO_RELEVANT_ATTRIBUTES['universal'] as Array<keyof PlaceProfile>;
  const profileTypes = profile.types || [];

  for (const type of profileTypes) {
    if (CATEGORY_TO_RELEVANT_ATTRIBUTES[type]) {
      relevantKeys = CATEGORY_TO_RELEVANT_ATTRIBUTES[type] as Array<keyof PlaceProfile>;
      break;
    }
  }

  const pointsPerAttr = weight / relevantKeys.length;

  for (const key of relevantKeys) {
    if (profile[key] === true) {
      score += pointsPerAttr;
    } else {
      issues.push({
        message: `Relevant attribute '${String(key)}' is missing or false`,
        recommendation: `Add the '${String(key)}' attribute to your profile to improve visibility in niche searches.`,
      });
    }
  }

  score = Math.min(Math.round(score * 100) / 100, weight);

  return {
    ruleId: 'attributes',
    weight,
    score,
    passed: score === weight,
    issues,
  };
};
