import { completenessRule } from '../../rules/completeness.rule';
import { createBaseProfile, createEmptyProfile } from '../../../../common/test-fixtures/place-profile.fixture';

describe('completenessRule', () => {
  it('should pass if phone, website, and address are present', () => {
    const profile = createBaseProfile({
      internationalPhoneNumber: '+1234567890',
      websiteUri: 'https://example.com',
      formattedAddress: '123 Main St',
    });
    const result = completenessRule(profile);
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should fail and generate issues if fields are missing', () => {
    const profile = createEmptyProfile({
      internationalPhoneNumber: undefined,
      websiteUri: undefined,
      formattedAddress: '',
    });
    const result = completenessRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(3);

    const issueMessages = result.issues.map((i) => i.message);
    expect(issueMessages).toContain('Phone number is missing');
    expect(issueMessages).toContain('Website is missing');
    expect(issueMessages).toContain('Address is missing');
  });

  it('should fail with partial missing fields', () => {
    const profile = createBaseProfile({
      internationalPhoneNumber: '+1234567890',
      websiteUri: undefined,
      formattedAddress: '123 Main St',
    });
    const result = completenessRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]!.message).toBe('Website is missing');
  });
});
