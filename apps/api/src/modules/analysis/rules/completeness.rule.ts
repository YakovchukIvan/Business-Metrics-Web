import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export const completenessRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  const ratioPerField = 1 / 3;

  if (profile.internationalPhoneNumber) {
    successRatio += ratioPerField;
  } else {
    issues.push({
      message: 'Phone number is missing',
      recommendation:
        'Add a primary phone number. Ensure it perfectly matches (NAP consistency) the phone number on your website and local directories.',
    });
  }

  if (profile.websiteUri) {
    successRatio += ratioPerField;
  } else {
    issues.push({
      message: 'Website is missing',
      recommendation:
        'Add a link to your website. Link directly to your local landing page and ensure you have LocalBusiness schema markup.',
    });
  }

  if (profile.formattedAddress) {
    successRatio += ratioPerField;
  } else {
    issues.push({
      message: 'Address is missing',
      recommendation:
        'Ensure your business address is visible. Maintain 100% NAP consistency (Name, Address, Phone) across the web.',
    });
  }

  successRatio = Math.min(successRatio, 1);

  return {
    ruleId: 'completeness',
    successRatio,
    passed: Math.abs(successRatio - 1) < 0.001,
    applicable: true,
    issues,
  };
};
