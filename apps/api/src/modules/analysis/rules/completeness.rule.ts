import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS } from '../constants/analysis.constants';

export const completenessRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['completeness'];
  let score = 0;
  const issues: RuleIssue[] = [];

  const pointsPerField = weight / 3;

  if (profile.internationalPhoneNumber) {
    score += pointsPerField;
  } else {
    issues.push({
      message: 'Phone number is missing',
      recommendation: 'Add a primary phone number to allow customers to contact you directly.',
    });
  }

  if (profile.websiteUri) {
    score += pointsPerField;
  } else {
    issues.push({
      message: 'Website is missing',
      recommendation: 'Add a link to your website to increase credibility and conversions.',
    });
  }

  if (profile.formattedAddress) {
    score += pointsPerField;
  } else {
    issues.push({
      message: 'Address is missing',
      recommendation: 'Ensure your business address is visible so customers can find your physical location.',
    });
  }

  score = Math.min(Math.round(score * 100) / 100, weight);

  return {
    ruleId: 'completeness',
    weight,
    score,
    passed: score === weight,
    issues,
  };
};
