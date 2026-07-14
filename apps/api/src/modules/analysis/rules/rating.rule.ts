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
      message: `Rating is too low or not enough reviews (current: ${rating} stars, ${count} reviews)`,
      recommendation:
        'Set up an automated review generation campaign. Focus on consistent, ongoing reviews and always reply to all reviews within 24-48 hours to signal active management to Google.',
    });
  } else if (rating >= 4.5 && count >= 20) {
    score = weight; // 30
  } else if (rating >= 4.0 && count >= 10) {
    score = 15;
    const recommendation =
      count < 20
        ? `Collect ${20 - count} more reviews to reach 20+ reviews with a 4.5+ average. ` +
          'Systematically request and respond to customer reviews.'
        : 'Focus on boosting your average rating to 4.5+. ' +
          'Actively encourage satisfied customers to leave 5-star reviews and respond to all feedback.';

    issues.push({
      message: `Rating and review count are average (current: ${rating} stars, ${count} reviews)`,
      recommendation,
    });
  } else {
    // Edge case: rating >= 4.0 but count < 10, or rating >= 4.5 but count < 20
    score = 10;
    const recommendation =
      count < 20
        ? `Your rating is good, but you need ${20 - count} more reviews (aim for 20+) to build strong trust. ` +
          'Ensure you respond to every review.'
        : 'Your review volume is good, but focus on maintaining a 4.5+ average to build strong trust. ' +
          'Ensure you respond to every review.';

    issues.push({
      message: `Good rating but not enough reviews (current: ${rating} stars, ${count} reviews)`,
      recommendation,
    });
  }

  return {
    ruleId: 'rating',
    weight,
    score,
    passed: score === weight,
    applicable: true,
    issues,
  };
};
