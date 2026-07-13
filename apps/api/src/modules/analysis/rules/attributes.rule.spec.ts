import { attributesRule } from './attributes.rule';
import { createHoReCaProfile, createBaseProfile } from '../../../common/test-fixtures/place-profile.fixture';

describe('attributesRule', () => {
  it('should pass for HoReCa profile with relevant attributes filled', () => {
    const profile = createHoReCaProfile({
      delivery: true,
      takeout: true,
      dineIn: true,
    });
    const result = attributesRule(profile);
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should fail for HoReCa profile missing some relevant attributes', () => {
    const profile = createHoReCaProfile({
      delivery: true,
      takeout: undefined, // missing
      dineIn: undefined, // missing
    });
    const result = attributesRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    const messages = result.issues.map((i) => i.message);
    expect(messages.some((m) => m.includes('takeout'))).toBe(true);
    expect(messages.some((m) => m.includes('dineIn'))).toBe(true);
  });

  it('should evaluate non-HoReCa profile against generic attributes', () => {
    const profile = createBaseProfile({
      types: ['store'],
      wheelchairAccessibleEntrance: true,
    });
    const result = attributesRule(profile);
    expect(result.passed).toBe(true);
  });

  it('should fail non-HoReCa profile if generic attributes are missing', () => {
    const profile = createBaseProfile({
      types: ['store'],
      wheelchairAccessibleEntrance: undefined,
    });
    const result = attributesRule(profile);
    expect(result.passed).toBe(false);
    expect(result.issues[0].message).toContain('wheelchairAccessibleEntrance');
  });
});
