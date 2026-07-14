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
  photoCount: number;
  businessStatus?: string;
  editorialSummary?: string;
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  wheelchairAccessibleEntrance?: boolean;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  earned: number;
  max: number;
  status: 'pass' | 'warn' | 'fail' | 'na';
  applicable: boolean;
}

export interface Problem {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'warning' | 'critical';
  explanation: string;
  earned: number;
  max: number;
}

export interface Recommendation {
  id: string;
  problemId: string;
  action: string;
  severity: 'warning' | 'critical';
  earned: number;
  max: number;
  docsUrl?: string;
}

export interface RecentSearch {
  input: string;
  businessName: string;
  cachedAt: number;
}
