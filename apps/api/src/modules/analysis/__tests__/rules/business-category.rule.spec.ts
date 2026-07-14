import { businessCategoryRule } from '../../rules/business-category.rule';
import { createBaseProfile, createEmptyProfile } from '../../../../common/test-fixtures/place-profile.fixture';

describe('businessCategoryRule', () => {
  it('should pass if types array has at least two categories', () => {
    const profile = createBaseProfile({ types: ['restaurant', 'food'] });
    const result = businessCategoryRule(profile);
    expect(result.passed).toBe(true);
    expect(result.successRatio).toBe(1);
  });

  it('should fail partially if types array has exactly one category', () => {
    const profile = createBaseProfile({ types: ['restaurant'] });
    const result = businessCategoryRule(profile);
    expect(result.passed).toBe(false);
    expect(result.successRatio).toBe(0.75);
    expect(result.issues[0]!.message).toContain('Only one category');
  });

  it('should fail if types array is empty', () => {
    const profile = createEmptyProfile({ types: [] });
    const result = businessCategoryRule(profile);
    expect(result.passed).toBe(false);
    expect(result.successRatio).toBe(0);
    expect(result.issues[0]!.message).toContain('Business category is completely missing');
  });
});
