import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';

export const photosRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  let successRatio = 0;
  const issues: RuleIssue[] = [];

  if (profile.photoCount >= 3) {
    successRatio = 1;
  } else {
    issues.push({
      message: `Profile has insufficient photos (${profile.photoCount} detected)`,
      recommendation:
        `You only have ${profile.photoCount} photos. Add more high-quality, real-world photos. ` +
        'Avoid stock imagery; originality is a key ranking factor in 2026.',
    });
  }

  return {
    ruleId: 'photos',
    successRatio,
    passed: successRatio === 1,
    applicable: true,
    issues,
  };
};
