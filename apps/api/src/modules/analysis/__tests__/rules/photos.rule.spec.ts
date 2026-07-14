import { photosRule } from '../../rules/photos.rule';
import { createBaseProfile } from '../../../../common/test-fixtures/place-profile.fixture';

describe('photosRule', () => {
  it('should pass if photoCount is >= 3', () => {
    const profile = createBaseProfile({ photoCount: 3 });
    const result = photosRule(profile);
    expect(result.passed).toBe(true);
  });

  it('should fail if photoCount is < 3', () => {
    const profile = createBaseProfile({ photoCount: 2 });
    const result = photosRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0]!.message).toContain('insufficient photos (2 detected)');
  });

  it('should fail if photoCount is 0', () => {
    const profile = createBaseProfile({ photoCount: 0 });
    const result = photosRule(profile);
    expect(result.passed).toBe(false);
  });
});
