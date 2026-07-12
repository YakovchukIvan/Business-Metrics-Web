import type { PlaceProfile } from '../interfaces/place-profile.interface';
import type { GooglePlaceRaw } from '../types/google-place-raw.type';

export function mapGooglePlaceToProfile(raw: GooglePlaceRaw): PlaceProfile {
  return {
    id: raw.id,
    displayName: raw.displayName?.text ?? '',
    types: raw.types ?? [],
    formattedAddress: raw.formattedAddress ?? '',
    internationalPhoneNumber: raw.internationalPhoneNumber,
    websiteUri: raw.websiteUri,
    rating: raw.rating,
    userRatingCount: raw.userRatingCount,
    regularOpeningHours: raw.regularOpeningHours as PlaceProfile['regularOpeningHours'],
    photoCount: raw.photos ? raw.photos.length : 0,
    businessStatus: raw.businessStatus,
    editorialSummary: raw.editorialSummary?.text,
    delivery: raw.delivery,
    dineIn: raw.dineIn,
    takeout: raw.takeout,
    wheelchairAccessibleEntrance: raw.wheelchairAccessibleEntrance,
  };
}
