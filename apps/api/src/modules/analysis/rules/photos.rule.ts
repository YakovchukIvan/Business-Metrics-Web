import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS } from '../constants/analysis.constants';

export const photosRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['photos'];
  let score = 0;
  const issues: RuleIssue[] = [];

  if (profile.photoCount >= 3) {
    score = weight;
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
    weight,
    score,
    passed: score === weight,
    applicable: true,
    issues,
  };
};
