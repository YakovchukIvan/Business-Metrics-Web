import { businessCategoryRule } from './business-category.rule';
import { createBaseProfile, createEmptyProfile } from '../../../common/test-fixtures/place-profile.fixture';

describe('businessCategoryRule', () => {
  it('should pass if types array has at least one category', () => {
    const profile = createBaseProfile({ types: ['restaurant'] });
    const result = businessCategoryRule(profile);
    expect(result.passed).toBe(true);
  });

  it('should fail if types array is empty', () => {
    const profile = createEmptyProfile({ types: [] });
    const result = businessCategoryRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0].message).toContain('Business category is missing');
  });
});
