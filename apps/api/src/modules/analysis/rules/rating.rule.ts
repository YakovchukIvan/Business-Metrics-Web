import type { AnalysisRule, RuleResult, RuleIssue } from '../interfaces/rule.interface';
import type { PlaceProfile } from '../../google-places/interfaces/place-profile.interface';
import { RULE_WEIGHTS } from '../constants/analysis.constants';

export const ratingRule: AnalysisRule = (profile: PlaceProfile): RuleResult => {
  const weight = RULE_WEIGHTS['rating'];
  const rating = profile.rating ?? 0;
  const count = profile.userRatingCount ?? 0;

  let score = 0;
  const issues: RuleIssue[] = [];

  if (count < 5 || rating < 4.0) {
    score = 0;
    issues.push({
      message: 'Rating is too low or there are not enough reviews',
      recommendation: 'Actively ask satisfied customers to leave a review on Google to boost your rating above 4.0.',
    });
  } else if (rating >= 4.5 && count >= 20) {
    score = weight; // 30
  } else if (rating >= 4.0 && count >= 10) {
    score = 15;
    issues.push({
      message: 'Rating and review count are average',
      recommendation: 'Collect more reviews to reach at least 20 reviews with a 4.5+ average rating.',
    });
  } else {
    // Edge case: rating >= 4.0 but count < 10, or rating >= 4.5 but count < 20
    score = 10;
    issues.push({
      message: 'Good rating but not enough reviews',
      recommendation: 'Your rating is good, but you need more reviews (aim for 20+) to build strong trust.',
    });
  }

  return {
    ruleId: 'rating',
    weight,
    score,
    passed: score === weight,
    issues,
  };
};
