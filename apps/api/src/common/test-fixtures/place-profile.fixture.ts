import type { PlaceProfile } from '../../modules/google-places/interfaces/place-profile.interface';

export const createBaseProfile = (overrides?: Partial<PlaceProfile>): PlaceProfile => ({
  id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  displayName: 'Default Test Business',
  formattedAddress: '123 Main St, City',
  internationalPhoneNumber: '+1234567890',
  websiteUri: 'https://example.com',
  types: ['store'],
  businessStatus: 'OPERATIONAL',
  rating: 4.5,
  userRatingCount: 100,
  regularOpeningHours: {
    periods: [{ open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 17, minute: 0 } }],
  },
  editorialSummary: 'A great test business.',
  photoCount: 5,
  wheelchairAccessibleEntrance: true,
  ...overrides,
});

export const createEmptyProfile = (overrides?: Partial<PlaceProfile>): PlaceProfile =>
  createBaseProfile({
    formattedAddress: '',
    internationalPhoneNumber: undefined,
    websiteUri: undefined,
    types: [],
    businessStatus: 'UNKNOWN',
    rating: undefined,
    userRatingCount: undefined,
    regularOpeningHours: undefined,
    editorialSummary: undefined,
    photoCount: 0,
    ...overrides,
  });

export const createHoReCaProfile = (overrides?: Partial<PlaceProfile>): PlaceProfile =>
  createBaseProfile({
    types: ['restaurant', 'food'],
    delivery: true,
    dineIn: true,
    takeout: true,
    wheelchairAccessibleEntrance: true,
    ...overrides,
  });
