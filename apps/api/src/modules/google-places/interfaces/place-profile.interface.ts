export interface PlaceProfile {
  id: string;
  displayName: string;
  types: string[];
  formattedAddress: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
  /**
   * NOTE: photoCount is the number of photo references returned by the API in one response.
   * It is capped by pagination limit and is NOT the real number of photos on the profile.
   * Treat this as a boolean threshold (e.g., sufficient/insufficient), not an exact count.
   */
  photoCount: number;
  businessStatus?: string;
  editorialSummary?: string;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  wheelchairAccessibleEntrance?: boolean;
}
