export type GooglePlaceRaw = {
  id: string;
  displayName?: { text: string; languageCode?: string };
  types?: string[];
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: unknown;
  photos?: unknown[];
  businessStatus?: string;
  editorialSummary?: { text: string; languageCode?: string };
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  accessibilityOptions?: {
    wheelchairAccessibleEntrance?: boolean;
  };
};
