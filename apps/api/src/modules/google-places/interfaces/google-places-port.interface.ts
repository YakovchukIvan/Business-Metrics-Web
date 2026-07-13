import type { PlaceProfile } from './place-profile.interface';

export interface IGooglePlacesPort {
  /**
   * Resolves a Maps URL, shortlink, CID, or raw Place ID into a validated Place ID.
   */
  resolvePlaceId(input: string): Promise<string>;

  /**
   * Fetches the place profile by Place ID.
   */
  getPlaceProfile(placeId: string): Promise<PlaceProfile>;
}
