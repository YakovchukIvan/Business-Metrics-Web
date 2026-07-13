import { ratingRule } from './rating.rule';
import { createBaseProfile } from '../../../common/test-fixtures/place-profile.fixture';

describe('ratingRule', () => {
  it('should pass if rating is >= 4.0 and reviews >= 10', () => {
    const profile = createBaseProfile({ rating: 4.5, userRatingCount: 50 });
    const result = ratingRule(profile);
    expect(result.passed).toBe(true);
  });

  it('should fail if rating is missing', () => {
    const profile = createBaseProfile({ rating: undefined, userRatingCount: undefined });
    const result = ratingRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0].message).toContain('Rating is too low or there are not enough reviews');
  });

  it('should fail if rating is below 4.0', () => {
    const profile = createBaseProfile({ rating: 3.8, userRatingCount: 50 });
    const result = ratingRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0].message).toContain('Rating is too low or there are not enough reviews');
  });

  it('should fail if rating is good but reviews count is below 10', () => {
    const profile = createBaseProfile({ rating: 4.8, userRatingCount: 5 });
    const result = ratingRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0].message).toContain('Good rating but not enough reviews');
  });
});
