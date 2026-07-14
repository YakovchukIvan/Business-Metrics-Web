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
      recommendation:
        'Add a primary phone number. Ensure it perfectly matches (NAP consistency) the phone number on your website and local directories.',
    });
  }

  if (profile.websiteUri) {
    score += pointsPerField;
  } else {
    issues.push({
      message: 'Website is missing',
      recommendation:
        'Add a link to your website. Link directly to your local landing page and ensure you have LocalBusiness schema markup.',
    });
  }

  if (profile.formattedAddress) {
    score += pointsPerField;
  } else {
    issues.push({
      message: 'Address is missing',
      recommendation:
        'Ensure your business address is visible. Maintain 100% NAP consistency (Name, Address, Phone) across the web.',
    });
  }

  score = Math.min(Math.round(score), weight);

  return {
    ruleId: 'completeness',
    weight,
    score,
    passed: score === weight,
    applicable: true,
    issues,
  };
};
