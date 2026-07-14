import { openingHoursRule } from '../../rules/opening-hours.rule';
import { createBaseProfile } from '../../../../common/test-fixtures/place-profile.fixture';

describe('openingHoursRule', () => {
  it('should pass if opening hours are present', () => {
    const profile = createBaseProfile({
      regularOpeningHours: { periods: [{ open: { day: 1, hour: 9, minute: 0 } }] },
    });
    const result = openingHoursRule(profile);
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should fail if opening hours are missing', () => {
    const profile = createBaseProfile({ regularOpeningHours: undefined });
    const result = openingHoursRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]!.message).toContain('Opening hours are missing');
  });
});
