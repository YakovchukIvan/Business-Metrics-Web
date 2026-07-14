import { businessStatusRule } from './business-status.rule';
import { createBaseProfile } from '../../../common/test-fixtures/place-profile.fixture';

describe('businessStatusRule', () => {
  it('should pass if status is OPERATIONAL', () => {
    const profile = createBaseProfile({ businessStatus: 'OPERATIONAL' });
    const result = businessStatusRule(profile);
    expect(result.passed).toBe(true);
  });

  it('should fail if status is CLOSED_TEMPORARILY', () => {
    const profile = createBaseProfile({ businessStatus: 'CLOSED_TEMPORARILY' });
    const result = businessStatusRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0]!.message).toContain('CLOSED_TEMPORARILY');
  });

  it('should fail if status is CLOSED_PERMANENTLY', () => {
    const profile = createBaseProfile({ businessStatus: 'CLOSED_PERMANENTLY' });
    const result = businessStatusRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0]!.message).toContain('CLOSED_PERMANENTLY');
  });

  it('should fail if status is UNKNOWN', () => {
    const profile = createBaseProfile({ businessStatus: 'UNKNOWN' });
    const result = businessStatusRule(profile);
    expect(result.passed).toBe(false);
  });
});
